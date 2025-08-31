"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from api.models import db, User, PasswordReset, EmailVerification, AuditLog, Organization, UserBookmark, SearchHistory, Advertisement, Category, Notification
from api.utils import generate_sitemap, APIException
from api.auth_utils import AuthService, validate_password, validate_email_format
from flask_cors import CORS
from datetime import datetime, timedelta
from sqlalchemy import func, desc
from functools import wraps
import json

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


# Admin Authorization Decorators
def admin_required(roles=['platform_admin']):
    """Decorator to require admin authentication"""
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)

            if not user or user.role not in roles:
                return jsonify({'error': 'Admin access required'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator

def platform_admin_required(f):
    """Decorator to require platform admin access"""
    return admin_required(['platform_admin'])(f)

def any_admin_required(f):
    """Decorator to require any admin access"""
    return admin_required(['platform_admin', 'org_admin'])(f)


# Use validate_email_format from auth_utils for email validation

def log_user_action(user_id, action_type, target_type=None, target_id=None, old_values=None, new_values=None):
    """Helper function to log user actions"""
    audit_log = AuditLog(
        user_id=user_id,
        action_type=action_type,
        target_type=target_type or 'user',
        target_id=target_id or user_id,
        old_values=json.dumps(old_values) if old_values else None,
        new_values=json.dumps(new_values) if new_values else None,
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent', '')
    )
    db.session.add(audit_log)

@api.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field.capitalize()} is required'}), 400

        name = data['name'].strip()
        email = data['email'].strip().lower()
        password = data['password']

        # Validate email format
        # Validate email format using validate_email_format from auth_utils
        is_valid_email, email_message = validate_email_format(email)
        if not is_valid_email:
            return jsonify({'error': email_message}), 400
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400

        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 409

        # Create new user
        user = User(
            name=name,
            email=email,
            role='visitor',
            is_verified=False
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        # Create email verification token
        verification_token = AuthService.generate_reset_token()
        email_verification = EmailVerification(
            user_id=user.id,
            token=verification_token,
            expires_at=datetime.utcnow() + timedelta(days=1)
        )
        db.session.add(email_verification)
        db.session.commit()

        # Send verification email
        try:
            AuthService.send_verification_email(email, verification_token)
        except Exception as e:
            print(f"Failed to send verification email: {e}")

        # Log registration
        log_user_action(user.id, 'create', 'user', user.id, None, {'email': email, 'name': name})
        db.session.commit()

        return jsonify({
            'message': 'Registration successful! Please check your email to verify your account.',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'is_verified': user.is_verified
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed. Please try again.'}), 500

@api.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400

        email = data['email'].strip().lower()
        password = data['password']

        # Find user
        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401

        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()

        # Create access token
        access_token = create_access_token(
            identity=user.id,
            additional_claims={
                'role': user.role,
                'email': user.email,
                'is_verified': user.is_verified
            }
        )

        # Log login
        log_user_action(user.id, 'login')
        db.session.commit()

        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'is_verified': user.is_verified,
                'profile_picture': user.profile_picture
            }
        }), 200

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Login failed. Please try again.'}), 500

@api.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()

        if not data.get('email'):
            return jsonify({'error': 'Email is required'}), 400

        email = data['email'].strip().lower()

        # Find user
        user = User.query.filter_by(email=email).first()

        if not user:
            # Don't reveal if email exists or not for security
            return jsonify({'message': 'If an account with this email exists, a password reset link has been sent.'}), 200

        # Invalidate any existing reset tokens
        PasswordReset.query.filter_by(user_id=user.id, is_used=False).update({'is_used': True})

        # Create new reset token
        reset_token = AuthService.generate_reset_token()
        password_reset = PasswordReset(
            user_id=user.id,
            token=reset_token,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )

        db.session.add(password_reset)
        db.session.commit()

        # Send reset email
        try:
            AuthService.send_reset_email(email, reset_token)
        except Exception as e:
            print(f"Failed to send reset email: {e}")

        # Log password reset request
        log_user_action(user.id, 'password_reset_request')
        db.session.commit()

        return jsonify({'message': 'If an account with this email exists, a password reset link has been sent.'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Forgot password error: {e}")
        return jsonify({'error': 'Password reset request failed. Please try again.'}), 500

@api.route('/auth/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['token', 'new_password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field.replace("_", " ").title()} is required'}), 400

        token = data['token']
        new_password = data['new_password']

        # Validate password
        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': message}), 400

        # Find valid reset token
        reset_record = PasswordReset.query.filter_by(
            token=token,
            is_used=False
        ).first()

        if not reset_record or reset_record.expires_at < datetime.utcnow():
            return jsonify({'error': 'Invalid or expired reset token'}), 400

        # Get user and update password
        user = reset_record.user
        user.set_password(new_password)

        # Mark token as used
        reset_record.is_used = True

        db.session.commit()

        # Log password reset
        log_user_action(user.id, 'password_reset', 'user', user.id,
                       {'password_changed': True}, {'password_changed': True})
        db.session.commit()

        return jsonify({'message': 'Password reset successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Reset password error: {e}")
        return jsonify({'error': 'Password reset failed. Please try again.'}), 500

@api.route('/auth/verify-email', methods=['POST'])
def verify_email():
    try:
        data = request.get_json()

        if not data.get('token'):
            return jsonify({'error': 'Verification token is required'}), 400

        token = data['token']

        # Find valid verification token
        verification = EmailVerification.query.filter_by(
            token=token,
            is_used=False
        ).first()

        if not verification or verification.expires_at < datetime.utcnow():
            return jsonify({'error': 'Invalid or expired verification token'}), 400

        # Update user verification status
        user = verification.user
        user.is_verified = True
        verification.is_used = True

        db.session.commit()

        # Log email verification
        log_user_action(user.id, 'email_verified')
        db.session.commit()

        return jsonify({'message': 'Email verified successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Email verification error: {e}")
        return jsonify({'error': 'Email verification failed. Please try again.'}), 500

@api.route('/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'is_verified': user.is_verified,
                'profile_picture': user.profile_picture,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'last_login': user.last_login.isoformat() if user.last_login else None
            }
        }), 200

    except Exception as e:
        print(f"Get current user error: {e}")
        return jsonify({'error': 'Failed to fetch user data'}), 500

@api.route('/auth/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        # Validate required fields
        required_fields = ['current_password', 'new_password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field.replace("_", " ").title()} is required'}), 400

        current_password = data['current_password']
        new_password = data['new_password']

        # Get user
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Verify current password
        if not user.check_password(current_password):
            return jsonify({'error': 'Current password is incorrect'}), 400

        # Validate new password
        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': message}), 400

        # Update password
        user.set_password(new_password)
        db.session.commit()

        # Log password change
        log_user_action(user_id, 'password_change')
        db.session.commit()

        return jsonify({'message': 'Password changed successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Change password error: {e}")
        return jsonify({'error': 'Password change failed. Please try again.'}), 500


# Admin Dashboard Endpoints
@api.route('/admin/dashboard', methods=['GET'])
@any_admin_required
def get_admin_dashboard():
    """Get admin dashboard with quick analytics and stats"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        # Calculate date ranges
        today = datetime.utcnow().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        # Quick Stats
        total_users = User.query.count()
        total_organizations = Organization.query.count()
        verified_organizations = Organization.query.filter_by(status='approved').count()
        pending_organizations = Organization.query.filter_by(status='pending').count()

        # Recent Activity (last 7 days)
        new_users_week = User.query.filter(User.created_at >= week_ago).count()
        new_orgs_week = Organization.query.filter(Organization.created_at >= week_ago).count()

        # Top Categories - need to handle if category relationship exists
        try:
            top_categories = db.session.query(
                Organization.category_id,
                func.count(Organization.id).label('count')
            ).group_by(Organization.category_id).order_by(desc('count')).limit(5).all()
        except:
            top_categories = []

        # Recent Users
        recent_users = User.query.order_by(desc(User.created_at)).limit(5).all()

        # Pending Organizations for Review
        pending_orgs = Organization.query.filter_by(status='pending').order_by(desc(Organization.created_at)).limit(5).all()

        # Recent Search Activity
        recent_searches = SearchHistory.query.order_by(desc(SearchHistory.searched_at)).limit(10).all()

        dashboard_data = {
            'quickStats': {
                'totalUsers': total_users,
                'totalOrganizations': total_organizations,
                'verifiedOrganizations': verified_organizations,
                'pendingOrganizations': pending_organizations,
                'newUsersThisWeek': new_users_week,
                'newOrgsThisWeek': new_orgs_week
            },
            'topCategories': [
                {'categoryId': cat[0], 'count': cat[1]} for cat in top_categories
            ],
            'recentUsers': [
                {
                    'id': u.id,
                    'name': u.name,
                    'email': u.email,
                    'role': u.role,
                    'createdAt': u.created_at.isoformat() if u.created_at else None
                } for u in recent_users
            ],
            'pendingReviews': [
                {
                    'id': org.id,
                    'name': org.name,
                    'categoryId': org.category_id,
                    'locationId': org.location_id,
                    'submittedAt': org.created_at.isoformat() if org.created_at else None
                } for org in pending_orgs
            ],
            'recentSearches': [
                {
                    'query': search.search_query,
                    'filters': search.filters_applied,
                    'resultsCount': search.results_count,
                    'searchedAt': search.searched_at.isoformat() if search.searched_at else None,
                    'userId': search.user_id
                } for search in recent_searches
            ]
        }

        return jsonify(dashboard_data), 200

    except Exception as e:
        print(f"Admin dashboard error: {e}")
        return jsonify({'error': 'Failed to fetch dashboard data'}), 500

@api.route('/admin/quick-actions', methods=['GET'])
@any_admin_required
def get_admin_quick_actions():
    """Get available quick actions for admin"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        actions = [
            {
                'id': 'approve_organizations',
                'title': 'Review Pending Organizations',
                'description': 'Approve or reject organization applications',
                'icon': 'building',
                'count': Organization.query.filter_by(status='pending').count(),
                'action': '/admin/organizations/pending'
            },
            {
                'id': 'manage_users',
                'title': 'Manage Users',
                'description': 'View and manage user accounts',
                'icon': 'users',
                'count': User.query.count(),
                'action': '/admin/users'
            },
            {
                'id': 'view_analytics',
                'title': 'View Analytics',
                'description': 'Detailed platform analytics and metrics',
                'icon': 'chart-bar',
                'count': None,
                'action': '/admin/analytics'
            },
            {
                'id': 'audit_logs',
                'title': 'Audit Logs',
                'description': 'View system activity and changes',
                'icon': 'clipboard-list',
                'count': AuditLog.query.count(),
                'action': '/admin/audit-logs'
            }
        ]

        # Add platform admin only actions
        if user.role == 'platform_admin':
            actions.extend([
                {
                    'id': 'system_config',
                    'title': 'System Configuration',
                    'description': 'Manage platform settings',
                    'icon': 'cog',
                    'count': None,
                    'action': '/admin/settings'
                },
                {
                    'id': 'advertisements',
                    'title': 'Manage Advertisements',
                    'description': 'Create and manage ads',
                    'icon': 'megaphone',
                    'count': Advertisement.query.filter_by(is_active=True).count(),
                    'action': '/admin/advertisements'
                }
            ])

        return jsonify({'actions': actions}), 200

    except Exception as e:
        print(f"Admin quick actions error: {e}")
        return jsonify({'error': 'Failed to fetch quick actions'}), 500

@api.route('/admin/analytics/summary', methods=['GET'])
@any_admin_required
def get_admin_analytics_summary():
    """Get summarized analytics for dashboard"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        # Date ranges
        today = datetime.utcnow().date()
        yesterday = today - timedelta(days=1)
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        # User growth data (last 30 days)
        user_growth = []
        for i in range(30):
            date = today - timedelta(days=i)
            count = User.query.filter(func.date(User.created_at) == date).count()
            user_growth.append({
                'date': date.isoformat(),
                'count': count
            })

        # Organization growth data (last 30 days)
        org_growth = []
        for i in range(30):
            date = today - timedelta(days=i)
            count = Organization.query.filter(func.date(Organization.created_at) == date).count()
            org_growth.append({
                'date': date.isoformat(),
                'count': count
            })

        # Search trends (last 7 days)
        search_trends = []
        for i in range(7):
            date = today - timedelta(days=i)
            count = SearchHistory.query.filter(func.date(SearchHistory.searched_at) == date).count()
            search_trends.append({
                'date': date.isoformat(),
                'searches': count
            })

        analytics_data = {
            'userGrowth': list(reversed(user_growth)),
            'organizationGrowth': list(reversed(org_growth)),
            'searchTrends': list(reversed(search_trends)),
            'summary': {
                'totalPageViews': sum([org.view_count for org in Organization.query.all()]),
                'totalBookmarks': UserBookmark.query.count(),
                'totalSearches': SearchHistory.query.count(),
                'averageSessionTime': '4:32',  # This would come from actual session tracking
                'bounceRate': '23%'  # This would come from actual analytics
            }
        }

        return jsonify(analytics_data), 200

    except Exception as e:
        print(f"Admin analytics summary error: {e}")
        return jsonify({'error': 'Failed to fetch analytics summary'}), 500


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200
