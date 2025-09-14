
import os
from datetime import datetime, timedelta
from flask import redirect, url_for, request, flash, Response
from flask_login import current_user
from markupsafe import Markup
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from flask_admin.form import Select2Widget
from flask_jwt_extended import jwt_required, get_jwt_identity
from wtforms import SelectField, PasswordField, StringField
from wtforms.validators import Optional
from .models import (db, User, Organization, Category, Location, UserBookmark, SearchHistory, OrganizationPhoto, OrganizationSocialLink, ContactMessage, Notification, AuditLog, Advertisement)


class SecureModelView(ModelView):
    """Base class for secure admin views"""

    def is_accessible(self):
        # Check if user is authenticated and has admin role
        return current_user.is_authenticated and current_user.is_admin()

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login'))


class UserAdminView(SecureModelView):
    """Admin view for User model"""
    column_list = ['id', 'name', 'email', 'role', 'is_verified', 'password_hash', 'created_at', 'last_login']
    column_searchable_list = ['name', 'email']
    column_filters = ['role', 'is_verified', 'created_at']
    column_editable_list = ['role', 'is_verified']

    form_choices = {
        'role': [
            ('visitor', 'Visitor'),
            ('org_admin', 'Organization Admin'),
            ('platform_admin', 'Platform Admin')
        ]
    }

    # Custom column formatters
    column_formatters = {
        'password_hash': lambda v, c, m, p: '***HASHED***' if m.password_hash else 'No Password (OAuth)'
    }

    # Hide sensitive fields from form editing (but show in list)
    form_excluded_columns = ['google_id', 'password_hash']

    # Add custom form fields
    form_extra_fields = {
        'password': PasswordField('Password', [Optional()],
                                description='Leave empty to keep current password (for existing users) or to create OAuth-only user')
    }

    def on_model_change(self, form, model, is_created):
        """Handle password hashing when creating or updating users"""
        # If a password was provided, hash it
        if form.password.data:
            model.set_password(form.password.data)
        elif is_created and not form.password.data:
            # If creating a new user without password, set password_hash to None (OAuth user)
            model.password_hash = None

        # Call parent method
        super(UserAdminView, self).on_model_change(form, model, is_created)


class OrganizationAdminView(SecureModelView):
    """Admin view for Organization model"""
    column_list = ['id', 'name', 'status', 'verification_level', 'category_id', 'location_id', 'created_at', 'view_count']
    column_searchable_list = ['name', 'description', 'email']
    column_filters = ['status', 'verification_level', 'category_id', 'location_id', 'created_at']
    column_editable_list = ['status', 'verification_level']

    form_choices = {
        'status': [
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('flagged', 'Flagged')
        ],
        'verification_level': [
            ('basic', 'Basic'),
            ('verified', 'Verified'),
            ('premium', 'Premium')
        ]
    }

    # Custom actions
    @expose('/approve/<int:id>')
    def approve_organization(self, id):
        org = Organization.query.get_or_404(id)
        old_status = org.status
        org.status = 'approved'
        db.session.commit()

        # Send approval notification
        if old_status != 'approved':
            try:
                from .notification_service import notification_service
                notification_service.send_organization_approval_notification(id, True)
            except Exception as e:
                print(f"Failed to send approval notification: {e}")

        flash(f'Organization "{org.name}" has been approved.', 'success')
        return redirect(url_for('.index_view'))

    @expose('/reject/<int:id>')
    def reject_organization(self, id):
        org = Organization.query.get_or_404(id)
        old_status = org.status
        org.status = 'rejected'
        db.session.commit()

        # Send rejection notification
        if old_status != 'rejected':
            try:
                from .notification_service import notification_service
                notification_service.send_organization_approval_notification(id, False)
            except Exception as e:
                print(f"Failed to send rejection notification: {e}")

        flash(f'Organization "{org.name}" has been rejected.', 'warning')
        return redirect(url_for('.index_view'))


class CategoryAdminView(SecureModelView):
    """Admin view for Category model"""
    column_list = ['id', 'name', 'description', 'is_active', 'sort_order', 'created_at']
    column_searchable_list = ['name', 'description']
    column_filters = ['is_active', 'created_at']
    column_editable_list = ['name', 'is_active', 'sort_order']

    form_columns = ['name', 'description', 'icon_url', 'color_code', 'is_active', 'sort_order']


class AuditLogAdminView(SecureModelView):
    """Admin view for Audit Log"""
    can_create = False
    can_edit = False
    can_delete = False

    column_list = ['id', 'user_id', 'action_type', 'target_type', 'target_id', 'timestamp']
    column_searchable_list = ['action_type', 'target_type']
    column_filters = ['action_type', 'target_type', 'timestamp', 'user_id']
    column_default_sort = ('timestamp', True)


class AdvertisementAdminView(SecureModelView):
    """Admin view for Advertisement model"""
    column_list = ['id', 'title', 'ad_type', 'placement', 'is_active', 'start_date', 'end_date', 'clicks_count', 'impressions_count']
    column_searchable_list = ['title', 'description']
    column_filters = ['ad_type', 'placement', 'is_active', 'start_date', 'end_date']
    column_editable_list = ['is_active']

    form_choices = {
        'ad_type': [
            ('sponsored', 'Sponsored'),
            ('banner', 'Banner'),
            ('featured', 'Featured')
        ],
        'placement': [
            ('home', 'Home Page'),
            ('search', 'Search Results'),
            ('profile', 'Organization Profile')
        ]
    }


class CustomAdminIndexView(AdminIndexView):
    """Custom admin index view with enhanced dashboard and real-time analytics"""

    def is_accessible(self):
        # Check if user is authenticated and has admin role
        return current_user.is_authenticated and current_user.is_admin()

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login'))

    @expose('/')
    def index(self):
        # Get current date and time ranges for analytics
        now = datetime.utcnow()
        today = now.date()
        yesterday = today - timedelta(days=1)
        week_ago = now - timedelta(days=7)

        # Core statistics for template context
        context = {
            # User statistics
            'total_users': User.query.count(),
            'visitor_count': User.query.filter_by(role='visitor').count(),
            'org_admin_count': User.query.filter_by(role='org_admin').count(),
            'new_users_today': User.query.filter(User.created_at >= today).count(),
            'new_users': User.query.filter(User.created_at >= today).count(),  # For notification

            # Organization statistics
            'total_orgs': Organization.query.count(),
            'pending_orgs': Organization.query.filter_by(status='pending').count(),
            'approved_orgs': Organization.query.filter_by(status='approved').count(),
            'rejected_orgs': Organization.query.filter_by(status='rejected').count(),

            # Content statistics
            'total_categories': Category.query.count(),
            'total_locations': Location.query.count(),
            'total_notifications': Notification.query.count(),

            # System statistics
            'recent_logs': AuditLog.query.filter(AuditLog.timestamp >= week_ago).count(),
            'total_ads': Advertisement.query.count(),
            'active_ads': Advertisement.query.filter_by(is_active=True).count(),

            # Metrics for dashboard
            'unread_messages': ContactMessage.query.filter_by(is_read=False).count(),
            'flagged_content': 0,  # Can implement later
            'system_health': 95,   # Can implement real health check
            'ad_revenue': 0,       # Can implement revenue tracking

            # Notification count for navbar
            'notification_count': (
                Organization.query.filter_by(status='pending').count() +
                ContactMessage.query.filter_by(is_read=False).count() +
                User.query.filter(User.created_at >= today).count()
            ),

            # Recent activities (sample implementation)
            'recent_activities': [
                {
                    'icon': 'user-plus',
                    'message': f'{User.query.filter(User.created_at >= today).count()} new users registered today',
                    'time_ago': 'Today'
                },
                {
                    'icon': 'building',
                    'message': f'{Organization.query.filter_by(status="pending").count()} organizations pending approval',
                    'time_ago': 'Now'
                },
                {
                    'icon': 'envelope',
                    'message': f'{ContactMessage.query.filter_by(is_read=False).count()} unread messages',
                    'time_ago': 'Recent'
                }
            ]
        }

        # Build embedded dashboard HTML with enhanced metrics
        total_pageviews = db.session.query(db.func.sum(Organization.view_count)).scalar() or 0
        approval_rate = (context['approved_orgs'] / context['total_orgs'] * 100) if context['total_orgs'] > 0 else 0

        # Derived metrics
        total_pageviews = db.session.query(db.func.sum(Organization.view_count)).scalar() or 0
        approval_rate = (context['approved_orgs'] / context['total_orgs'] * 100) if context['total_orgs'] > 0 else 0
        context['total_pageviews'] = total_pageviews
        context['approval_rate'] = round(approval_rate, 1)

        dashboard_html = f"""
        <style>
        .alert .close {{ display: none !important; }}
        .alert {{ margin-bottom: 0; }}
        .clickable-panel {{ cursor: pointer; transition: all 0.3s; }}
        .clickable-panel:hover {{ transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }}
        .notification-dot {{
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: #dc3545;
            border-radius: 50%;
            margin-left: 5px;
            animation: pulse 2s infinite;
        }}
        @keyframes pulse {{ 0% {{ opacity: 1; }} 50% {{ opacity: 0.5; }} 100% {{ opacity: 1; }} }}
        </style>
        <div class="row" style="margin: 20px 0;">
            <div class="col-md-12">
                <div class="panel panel-primary">
                    <div class="panel-heading">
                        <h3 class="panel-title">🏥 Charity Directory Smart Dashboard - Real-time Analytics</h3>
                    </div>
                    <div class="panel-body">
                        <!-- Alerts for immediate action -->
                        {f'<div class="alert alert-warning"><strong><span class="notification-dot"></span> {context["pending_orgs"]} organizations need review!</strong> <a href="/admin/organization/?flt1_0=pending" class="btn btn-sm btn-warning">Review Now</a></div>' if context["pending_orgs"] > 0 else ''}
                        {f'<div class="alert alert-info"><strong>{context["unread_messages"]} unread messages</strong> <a href="/admin/contactmessage/" class="btn btn-sm btn-info">View Messages</a></div>' if context["unread_messages"] > 0 else ''}

                        <!-- Core Metrics Row -->
                        <div class="row">
                            <div class="col-md-3">
                               <div class="panel panel-info clickable-panel" style="height: 140px;" onclick="window.location.href='/admin/user/'">
                                    <div class="panel-body text-center">
                                        <h2 class="text-primary">{context['total_users']}</h2>
                                        <p><strong>👥 Total Users</strong></p>
                                        {'<span class="label label-success">+' + str(context['new_users_today']) + ' today</span>' if context['new_users_today'] > 0 else '<span class="label label-default">No new users today</span>'}
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="panel panel-info clickable-panel" style="height: 140px;" onclick="window.location.href='/admin/organization/'">
                                    <div class="panel-body text-center">
                                        <h2 class="text-info">{context['total_orgs']}</h2>
                                        <p><strong>🏢 Organizations</strong></p>
                                        <span class="label label-{'warning' if context['pending_orgs'] > 0 else 'success'}">{context['pending_orgs']} pending</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="panel panel-info clickable-panel" style="height: 140px;" onclick="window.location.href='/admin/searchhistory/'">
                                    <div class="panel-body text-center">
                                        <h2 class="text-success">{total_pageviews:,}</h2>
                                        <p><strong>👁️ Total Views</strong></p>
                                        <span class="label label-info">Platform engagement</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                               <div class="panel panel-info clickable-panel" style="height: 140px;" onclick="window.location.href='/admin/organization/?flt1_0=approved'">
                                    <div class="panel-body text-center">
                                        <h2 class="text-warning">{approval_rate:.1f}%</h2>
                                        <p><strong>✅ Approval Rate</strong></p>
                                        <span class="label label-{'success' if approval_rate >= 80 else 'warning' if approval_rate >= 60 else 'danger'}">Quality metric</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Smart Navigation Row -->
                        <div class="row">
                            <div class="col-md-4">
                                <div class="panel panel-success">
                                    <div class="panel-heading"><strong>� Quick Navigation</strong></div>
                                    <div class="panel-body">
                                        <p><a href="/admin/organization/?flt1_0=pending" class="btn btn-warning btn-xs">⏳ Pending Orgs ({context['pending_orgs']})</a></p>
                                        <p><a href="/admin/user/?flt1_1=visitor" class="btn btn-info btn-xs">👤 Visitors ({context['visitor_count']})</a></p>
                                        <p><a href="/admin/contactmessage/" class="btn btn-primary btn-xs">📧 Messages ({context['unread_messages']})</a></p>
                                        <p><a href="/admin/auditlog/" class="btn btn-default btn-xs">📋 Recent Logs ({context['recent_logs']})</a></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="panel panel-info">
                                    <div class="panel-heading"><strong>🎯 Content Management</strong></div>
                                    <div class="panel-body">
                                        <p><a href="/admin/category/" class="btn btn-success btn-xs">🏷️ Categories ({context['total_categories']})</a></p>
                                        <p><a href="/admin/location/" class="btn btn-info btn-xs">📍 Locations ({context['total_locations']})</a></p>
                                        <p><a href="/admin/organizationphoto/" class="btn btn-primary btn-xs">📸 Photos</a></p>
                                        <p><a href="/admin/organizationsociallink/" class="btn btn-warning btn-xs">🔗 Social Links</a></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="panel panel-warning">
                                    <div class="panel-heading"><strong>💰 Business Intelligence</strong></div>
                                    <div class="panel-body">
                                        <p><a href="/admin/advertisement/" class="btn btn-success btn-xs">📺 Ads ({context['active_ads']} active)</a></p>
                                        <p><a href="/api/docs" target="_blank" class="btn btn-info btn-xs">📖 API Documentation</a></p>
                                        <p><a href="/sitemap" target="_blank" class="btn btn-default btn-xs">🗺️ System Sitemap</a></p>
                                        <p><a href="/" target="_blank" class="btn btn-primary btn-xs">🌐 View Frontend</a></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        """

        # Use the custom template instead of embedded HTML
        return self.render('admin/custom_index.html', **context)

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'

    # Initialize admin with custom index view and templates
    admin = Admin(app,
                  name='Charity Directory Admin',
                  template_mode='bootstrap3',
                  index_view=CustomAdminIndexView(),
                  base_template='admin/my_master.html')

    # Core models with custom views
    admin.add_view(UserAdminView(User, db.session, name='Users', category='User Management'))
    admin.add_view(OrganizationAdminView(Organization, db.session, name='Organizations', category='Content Management'))
    admin.add_view(CategoryAdminView(Category, db.session, name='Categories', category='Content Management'))
    admin.add_view(SecureModelView(Location, db.session, name='Locations', category='Content Management'))

    # User interaction models
    admin.add_view(SecureModelView(UserBookmark, db.session, name='Bookmarks', category='User Management'))
    admin.add_view(SecureModelView(SearchHistory, db.session, name='Search History', category='Analytics'))

    # Organization related models
    admin.add_view(SecureModelView(OrganizationPhoto, db.session, name='Organization Photos', category='Content Management'))
    admin.add_view(SecureModelView(OrganizationSocialLink, db.session, name='Social Links', category='Content Management'))
    admin.add_view(SecureModelView(ContactMessage, db.session, name='Contact Messages', category='Communication'))

    # System models
    admin.add_view(SecureModelView(Notification, db.session, name='Notifications', category='Communication'))
    admin.add_view(AuditLogAdminView(AuditLog, db.session, name='Audit Logs', category='System'))
    admin.add_view(AdvertisementAdminView(Advertisement, db.session, name='Advertisements', category='Monetization'))

    # Add notification count endpoint for real-time updates
    @app.route('/admin/notifications/count')
    def admin_notification_count():
        if not current_user.is_authenticated or not current_user.is_admin():
            return {'count': 0}

        pending_orgs = Organization.query.filter_by(status='pending').count()
        unread_messages = ContactMessage.query.filter_by(is_read=False).count()
        today = datetime.utcnow().date()
        new_users = User.query.filter(User.created_at >= today).count()

        total_notifications = pending_orgs + unread_messages + new_users
        return {'count': total_notifications}

    return admin