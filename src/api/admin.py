
import os
from datetime import datetime, timedelta
from flask import redirect, url_for, request, flash, Response
from markupsafe import Markup
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from flask_admin.form import Select2Widget
from flask_jwt_extended import jwt_required, get_jwt_identity
from wtforms import SelectField
from .models import (db, User, Organization, Category, Location, UserBookmark, SearchHistory, OrganizationPhoto, OrganizationSocialLink, ContactMessage, Notification, AuditLog, Advertisement)


class SecureModelView(ModelView):
    """Base class for secure admin views"""

    def is_accessible(self):
        # For now, we'll assume admin access
        return True

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('auth.login'))


class UserAdminView(SecureModelView):
    """Admin view for User model"""
    column_list = ['id', 'name', 'email', 'role', 'is_verified', 'created_at', 'last_login']
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

    # Hide sensitive fields
    form_excluded_columns = ['password_hash', 'google_id']
    column_exclude_list = ['password_hash']


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
        org.status = 'approved'
        db.session.commit()
        flash(f'Organization "{org.name}" has been approved.', 'success')
        return redirect(url_for('.index_view'))

    @expose('/reject/<int:id>')
    def reject_organization(self, id):
        org = Organization.query.get_or_404(id)
        org.status = 'rejected'
        db.session.commit()
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
    """Custom admin index view with embedded HTML dashboard"""

    @expose('/')
    def index(self):
        # Get current date and time ranges for analytics
        now = datetime.utcnow()
        today = now.date()
        yesterday = today - timedelta(days=1)
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        # Core statistics
        total_users = User.query.count()
        total_organizations = Organization.query.count()
        pending_organizations = Organization.query.filter_by(status='pending').count()
        approved_organizations = Organization.query.filter_by(status='approved').count()
        rejected_organizations = Organization.query.filter_by(status='rejected').count()
        total_bookmarks = UserBookmark.query.count()
        total_searches = SearchHistory.query.count()

        # Growth analytics
        new_users_today = User.query.filter(User.created_at >= today).count()
        new_users_week = User.query.filter(User.created_at >= week_ago).count()
        new_orgs_today = Organization.query.filter(Organization.created_at >= today).count()
        new_orgs_week = Organization.query.filter(Organization.created_at >= week_ago).count()

        # System health indicators
        unread_messages = ContactMessage.query.filter_by(is_read=False).count()
        active_ads = Advertisement.query.filter_by(is_active=True).count()
        total_pageviews = db.session.query(db.func.sum(Organization.view_count)).scalar() or 0
        recent_audit_logs = AuditLog.query.filter(AuditLog.timestamp >= week_ago).count()

        # Smart insights and alerts
        approval_rate = (approved_organizations / total_organizations * 100) if total_organizations > 0 else 0
        avg_bookmarks_per_org = (total_bookmarks / approved_organizations) if approved_organizations > 0 else 0

        # Build embedded dashboard HTML with clickable panels
        dashboard_html = f"""
         <style>
        .alert .close {{ display: none !important; }}
        .alert {{ margin-bottom: 0; }}
        .clickable-panel {{ cursor: pointer; transition: all 0.3s; }}
        .clickable-panel:hover {{ transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }}
        </style>
        <div class="row" style="margin: 20px 0;">
            <div class="col-md-12">
                <div class="panel panel-primary">
                    <div class="panel-heading">
                        <h3 class="panel-title">🚀 Charity Directory Dashboard - Real-time Analytics</h3>
                    </div>
                    <div class="panel-body">

                        <!-- Core Metrics Row -->
                        <div class="row">
                            <div class="col-md-3">
                               <div class="panel panel-info clickable-panel" style="height: 140px;" onclick="window.location.href='/admin/user/'">
                                    <div class="panel-body text-center">
                                        <h2 class="text-primary">{total_users}</h2>
                                        <p><strong>Total Users</strong></p>
                                        {'<span class="label label-success">+' + str(new_users_today) + ' today</span>' if new_users_today > 0 else ''}
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="panel panel-info clickable-panel" style="height: 140px;" onclick="window.location.href='/admin/organization/'">
                                    <div class="panel-body text-center">
                                        <h2 class="text-info">{total_organizations}</h2>
                                        <p><strong>Organizations</strong></p>
                                        {'<span class="label label-success">+' + str(new_orgs_today) + ' today</span>' if new_orgs_today > 0 else ''}
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="panel panel-info clickable-panel" style="height: 140px;" onclick="window.location.href='/admin/searchhistory/'">
                                    <div class="panel-body text-center">
                                        <h2 class="text-success">{total_pageviews:,}</h2>
                                        <p><strong>Total Views</strong></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                               <div class="panel panel-info clickable-panel" style="height: 140px;" onclick="window.location.href='/admin/organization/?flt1_0=pending'">
                                    <div class="panel-body text-center">
                                        <h2 class="text-warning">{approval_rate:.1f}%</h2>
                                        <p><strong>Approval Rate</strong></p>
                                        <span class="label label-{'success' if approval_rate >= 80 else 'warning' if approval_rate >= 60 else 'danger'}">{pending_organizations} pending</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Growth Trends -->
                         <div class="row">
                            <div class="col-md-6">
                                <div class="panel panel-success">
                                    <div class="panel-heading"><strong>📈 Growth This Week</strong></div>
                                    <div class="panel-body">
                                        <p><strong>Users:</strong> <a href="/admin/user/" style="text-decoration: none;">+{new_users_week} new registrations</a></p>
                                        <p><strong>Organizations:</strong> <a href="/admin/organization/" style="text-decoration: none;">+{new_orgs_week} new submissions</a></p>
                                        <p><strong>Searches:</strong> <a href="/admin/searchhistory/" style="text-decoration: none;">{total_searches:,} total searches</a></p>
                                        <p><strong>Bookmarks:</strong> <a href="/admin/userbookmark/" style="text-decoration: none;">{total_bookmarks} saved organizations</a></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="panel panel-info">
                                    <div class="panel-heading"><strong>⚙️ System Status</strong></div>
                                    <div class="panel-body">
                                        <p><strong>Active Ads:</strong> <a href="/admin/advertisement/" style="text-decoration: none;">{active_ads} running campaigns</a></p>
                                        <p><strong>Security Events:</strong> <a href="/admin/auditlog/" style="text-decoration: none;">{recent_audit_logs} logged this week</a></p>
                                        <p><strong>Premium Orgs:</strong> <a href="/admin/organization/?flt1_2=premium" style="text-decoration: none;">{Organization.query.filter_by(verification_level='premium').count()} verified premium</a></p>
                                        <p><strong>Verified Orgs:</strong> <a href="/admin/organization/?flt1_2=verified" style="text-decoration: none;">{Organization.query.filter_by(verification_level='verified').count()} verified basic</a></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        """
        # Display the dashboard HTML using flash
        flash(Markup(dashboard_html), 'info')
        return super().index()

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'

    # Initialize admin with custom index view
    admin = Admin(app,
                  name='Charity Directory Admin',
                  template_mode='bootstrap3',
                  index_view=CustomAdminIndexView())

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

    # TO ADD AN ORGNISIATION REWARD SYSTEM LATER and other models for support and marketing and other departments

    return admin