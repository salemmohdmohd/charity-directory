from flask import request, Blueprint, redirect, session, url_for, current_app
from flask_restx import Api, Resource, Namespace, fields, marshal
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from api.models import db, User, PasswordReset, EmailVerification, AuditLog, Organization, UserBookmark, SearchHistory, Advertisement, Category, Notification, Location, ContactMessage, OrganizationPhoto, OrganizationSocialLink
from api.auth_utils import AuthService, validate_password, validate_email_format
from api.oauth_utils import oauth_service, GoogleAuthError
from datetime import datetime, timedelta
from sqlalchemy import func, desc, text, or_, and_
from sqlalchemy.exc import SQLAlchemyError
from functools import wraps
import json
import os

# Create Blueprint for Flask-RESTX
api_bp = Blueprint('api', __name__)

# Initialize API with Swagger documentation on the blueprint
api = Api(
    api_bp,
    version='1.0',
    title='Charity Directory API',
    description='A comprehensive API for managing charity organizations',
    doc='/docs/',
    validate=True
)

# Namespaces
auth_ns = Namespace('auth', description='Authentication operations')
org_ns = Namespace('organizations', description='Organization operations')
category_ns = Namespace('categories', description='Category operations')
location_ns = Namespace('locations', description='Location operations')
search_ns = Namespace('search', description='Search operations')
user_ns = Namespace('users', description='User operations')
notification_ns = Namespace('notifications', description='Notification operations')
ad_ns = Namespace('advertisements', description='Advertisement operations')

api.add_namespace(auth_ns, path='/auth')
api.add_namespace(org_ns, path='/organizations')
api.add_namespace(category_ns, path='/categories')
api.add_namespace(location_ns, path='/locations')
api.add_namespace(search_ns, path='/search')
api.add_namespace(user_ns, path='/users')
api.add_namespace(notification_ns, path='/notifications')
api.add_namespace(ad_ns, path='/advertisements')

# Models
user_model = api.model('User', {
    'id': fields.Integer, 'name': fields.String, 'email': fields.String, 'role': fields.String,
    'is_verified': fields.Boolean, 'profile_picture': fields.String, 'created_at': fields.String, 'last_login': fields.String
})

registration_response_model = api.model('RegistrationResponse', {
    'message': fields.String(required=True, description='Registration status message'),
    'user': fields.Nested(user_model, required=True, description='User information')
})

organization_model = api.model('Organization', {
    'id': fields.Integer, 'name': fields.String, 'mission': fields.String, 'description': fields.String,
    'category_id': fields.Integer, 'category_name': fields.String, 'location_id': fields.Integer, 'location': fields.String,
    'phone': fields.String, 'email': fields.String, 'website': fields.String, 'donation_link': fields.String,
    'logo_url': fields.String, 'status': fields.String, 'verification_level': fields.String,
    'view_count': fields.Integer, 'bookmark_count': fields.Integer, 'created_at': fields.String
})

pagination_model = api.model('Pagination', {
    'page': fields.Integer, 'pages': fields.Integer, 'per_page': fields.Integer,
    'total': fields.Integer, 'has_next': fields.Boolean, 'has_prev': fields.Boolean
})

# Response Models
auth_response_model = api.model('AuthResponse', {
    'message': fields.String(description='Response message'),
    'access_token': fields.String(description='JWT access token'),
    'user': fields.Nested(user_model, description='User information')
})

message_response_model = api.model('MessageResponse', {
    'message': fields.String(description='Response message')
})

org_list_response_model = api.model('OrganizationListResponse', {
    'organizations': fields.List(fields.Nested(organization_model), description='List of organizations'),
    'pagination': fields.Nested(pagination_model, description='Pagination information')
})

category_model = api.model('Category', {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'icon_url': fields.String,
    'color_code': fields.String,
    'organization_count': fields.Integer
})

location_model = api.model('Location', {
    'id': fields.Integer,
    'country': fields.String,
    'state_province': fields.String,
    'city': fields.String,
    'postal_code': fields.String,
    'organization_count': fields.Integer
})

bookmark_model = api.model('Bookmark', {
    'id': fields.Integer,
    'organization_id': fields.Integer,
    'notes': fields.String,
    'created_at': fields.String,
    'organization': fields.Nested(organization_model)
})

notification_model = api.model('Notification', {
    'id': fields.Integer,
    'message': fields.String,
    'is_read': fields.Boolean,
    'created_at': fields.String
})

advertisement_model = api.model('Advertisement', {
    'id': fields.Integer(description='Advertisement ID'),
    'title': fields.String(description='Advertisement title'),
    'description': fields.String(description='Advertisement description'),
    'image_url': fields.String(description='Advertisement image URL'),
    'link_url': fields.String(description='Advertisement link URL'),
    'placement': fields.String(description='Advertisement placement'),
    'ad_type': fields.String(description='Advertisement type'),
    'priority': fields.Integer(description='Advertisement priority'),
    'is_active': fields.Boolean(description='Advertisement active status'),
    'start_date': fields.String(description='Advertisement start date'),
    'end_date': fields.String(description='Advertisement end date'),
    'created_at': fields.String(description='Creation timestamp'),
    'updated_at': fields.String(description='Last update timestamp')
})

contact_message_model = api.model('ContactMessage', {
    'id': fields.Integer(description='Message ID'),
    'sender_name': fields.String(description='Sender name'),
    'sender_email': fields.String(description='Sender email'),
    'subject': fields.String(description='Message subject'),
    'message': fields.String(description='Message content'),
    'is_read': fields.Boolean(description='Read status'),
    'created_at': fields.String(description='Creation timestamp'),
    'read_at': fields.String(description='Read timestamp')
})

photo_model = api.model('OrganizationPhoto', {
    'id': fields.Integer(description='Photo ID'),
    'file_name': fields.String(description='File name'),
    'file_path': fields.String(description='File path'),
    'alt_text': fields.String(description='Alternative text'),
    'is_primary': fields.Boolean(description='Primary photo status'),
    'created_at': fields.String(description='Creation timestamp')
})

# REQUEST PARSERS - Replace manual request.json parsing
pagination_parser = api.parser()
pagination_parser.add_argument('page', type=int, default=1, help='Page number')
pagination_parser.add_argument('per_page', type=int, default=20, help='Items per page')

org_parser = pagination_parser.copy()
org_parser.add_argument('status', type=str, help='Organization status filter')
org_parser.add_argument('category_id', type=int, help='Category ID filter')
org_parser.add_argument('location_id', type=int, help='Location ID filter')
org_parser.add_argument('search', type=str, help='Search query')

search_parser = pagination_parser.copy()
search_parser.add_argument('q', type=str, help='Search query')
search_parser.add_argument('category_id', type=int, help='Category filter')
search_parser.add_argument('location_id', type=int, help='Location filter')
search_parser.add_argument('verification_level', type=str, help='Verification level filter')

# AUTH PARSERS
register_parser = api.parser()
register_parser.add_argument('name', type=str, required=True, help='Full name', location='json')
register_parser.add_argument('email', type=str, required=True, help='Email address', location='json')
register_parser.add_argument('password', type=str, required=True, help='Password', location='json')

login_parser = api.parser()
login_parser.add_argument('email', type=str, required=True, help='Email address', location='json')
login_parser.add_argument('password', type=str, required=True, help='Password', location='json')

email_parser = api.parser()
email_parser.add_argument('email', type=str, required=True, help='Email address', location='json')

reset_password_parser = api.parser()
reset_password_parser.add_argument('token', type=str, required=True, help='Reset token', location='json')
reset_password_parser.add_argument('new_password', type=str, required=True, help='New password', location='json')

token_parser = api.parser()
token_parser.add_argument('token', type=str, required=True, help='Verification token', location='json')

change_password_parser = api.parser()
change_password_parser.add_argument('current_password', type=str, required=True, help='Current password', location='json')
change_password_parser.add_argument('new_password', type=str, required=True, help='New password', location='json')

# ORGANIZATION PARSERS
# ORG PARSERS
org_signup_parser = api.parser()
org_signup_parser.add_argument('admin_name', type=str, required=True, help='Admin full name', location='json')
org_signup_parser.add_argument('admin_email', type=str, required=True, help='Admin email address', location='json')
org_signup_parser.add_argument('password', type=str, required=True, help='Admin password', location='json')
org_signup_parser.add_argument('organization_name', type=str, required=True, help='Organization name', location='json')
org_signup_parser.add_argument('mission', type=str, required=True, help='Mission statement', location='json')
org_signup_parser.add_argument('category_id', type=int, required=True, help='Category ID', location='json')
org_signup_parser.add_argument('phone', type=str, help='Phone number', location='json')
org_signup_parser.add_argument('website', type=str, help='Website URL', location='json')
org_signup_parser.add_argument('address', type=str, help='Address', location='json')
org_signup_parser.add_argument('city', type=str, help='City', location='json')
org_signup_parser.add_argument('state', type=str, help='State/Province', location='json')
org_signup_parser.add_argument('country', type=str, help='Country', location='json')

org_create_parser = api.parser()
org_create_parser.add_argument('name', type=str, required=True, help='Organization name', location='json')
org_create_parser.add_argument('mission', type=str, required=True, help='Mission statement', location='json')
org_create_parser.add_argument('category_id', type=int, required=True, help='Category ID', location='json')
org_create_parser.add_argument('email', type=str, required=True, help='Contact email', location='json')
org_create_parser.add_argument('description', type=str, help='Description', location='json')
org_create_parser.add_argument('address', type=str, help='Address', location='json')
org_create_parser.add_argument('phone', type=str, help='Phone number', location='json')
org_create_parser.add_argument('website', type=str, help='Website URL', location='json')
org_create_parser.add_argument('donation_link', type=str, help='Donation link', location='json')
org_create_parser.add_argument('operating_hours', type=str, help='Operating hours', location='json')
org_create_parser.add_argument('established_year', type=int, help='Year established', location='json')

# USER PARSERS
profile_update_parser = api.parser()
profile_update_parser.add_argument('name', type=str, help='Full name', location='json')
profile_update_parser.add_argument('profile_picture', type=str, help='Profile picture URL', location='json')

bookmark_create_parser = api.parser()
bookmark_create_parser.add_argument('organization_id', type=int, required=True, help='Organization ID', location='json')
bookmark_create_parser.add_argument('notes', type=str, help='Personal notes', location='json')

# CONTACT MESSAGE PARSERS
contact_message_parser = api.parser()
contact_message_parser.add_argument('sender_name', type=str, required=True, help='Sender name', location='json')
contact_message_parser.add_argument('sender_email', type=str, required=True, help='Sender email', location='json')
contact_message_parser.add_argument('subject', type=str, required=True, help='Message subject', location='json')
contact_message_parser.add_argument('message', type=str, required=True, help='Message content', location='json')

# PHOTO PARSERS
photo_create_parser = api.parser()
photo_create_parser.add_argument('file_name', type=str, required=True, help='File name', location='json')
photo_create_parser.add_argument('file_path', type=str, required=True, help='File path', location='json')
photo_create_parser.add_argument('alt_text', type=str, help='Alt text', location='json')
photo_create_parser.add_argument('is_primary', type=bool, help='Is primary photo', location='json')

# SOCIAL LINK PARSERS
social_link_parser = api.parser()
social_link_parser.add_argument('platform', type=str, required=True, help='Social platform', location='json')
social_link_parser.add_argument('url', type=str, required=True, help='Social media URL', location='json')

# QUERY PARSERS
location_search_parser = api.parser()
location_search_parser.add_argument('q', type=str, required=True, help='Search query')

search_suggestions_parser = api.parser()
search_suggestions_parser.add_argument('q', type=str, required=True, help='Search query')

ad_parser = api.parser()
ad_parser.add_argument('placement', type=str, help='Ad placement')
ad_parser.add_argument('ad_type', type=str, help='Ad type')
ad_parser.add_argument('limit', type=int, default=5, help='Number of ads to return')

contact_messages_parser = pagination_parser.copy()
contact_messages_parser.add_argument('status', type=str, help='Message status filter')

# Utilities
def log_action(uid, act, typ='user', tid=None, old=None, new=None):
    db.session.add(AuditLog(user_id=uid, action_type=act, target_type=typ, target_id=tid or uid,
                           old_values=json.dumps(old) if old else None, new_values=json.dumps(new) if new else None,
                           ip_address=request.remote_addr, user_agent=request.headers.get('User-Agent', '')))

def paginate(query, page, per_page):
    result = query.paginate(page=page, per_page=min(per_page, 100), error_out=False)
    return result.items, {'page': result.page, 'pages': result.pages, 'per_page': result.per_page,
                         'total': result.total, 'has_next': result.has_next, 'has_prev': result.has_prev}

def check_org_admin(org_id, user_id):
    org = Organization.query.get(org_id) or api.abort(404, 'Organization not found')
    user = User.query.get(user_id) or api.abort(404, 'User not found')
    if org.admin_user_id != user_id and user.role != 'platform_admin': api.abort(403, 'Access denied')
    return org

# AUTH ENDPOINTS
@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.expect(register_parser)
    @auth_ns.marshal_with(registration_response_model, code=201)
    @auth_ns.doc(responses={
        201: 'Registration successful',
        400: 'Validation error',
        409: 'Email already registered',
        500: 'Registration failed'
    })
    def post(self):
        try:
            args = register_parser.parse_args()
            email = args.email.strip().lower()

            # Validate email format
            if not (valid := validate_email_format(email))[0]:
                api.abort(400, valid[1])

            # Validate password strength
            if not (valid := validate_password(args.password))[0]:
                api.abort(400, valid[1])

            # Check if email already exists
            if User.query.filter_by(email=email).first():
                api.abort(409, 'Email already registered')

            user = User(name=args.name.strip(), email=email, role='visitor', is_verified=True)
            user.set_password(args.password)
            db.session.add(user)
            db.session.commit()

            token = AuthService.generate_reset_token()
            db.session.add(EmailVerification(user_id=user.id, token=token, expires_at=datetime.utcnow() + timedelta(days=1)))
            db.session.commit()

            try:
                AuthService.send_verification_email(email, token)
            except Exception as e:
                print(f"Email verification failed: {str(e)}")
                pass

            log_action(user.id, 'create', 'user', user.id, None, {'email': email, 'name': user.name})
            db.session.commit()

            # Since users are now active by default, generate access tokens immediately
            access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role, 'email': user.email, 'is_verified': user.is_verified})
            refresh_token = create_refresh_token(identity=str(user.id))

            return {
                'message': 'Registration successful! Your account is now active.',
                'user': marshal(user, user_model),
                'access_token': access_token,
                'refresh_token': refresh_token
            }, 201
        except Exception as e:
            db.session.rollback()

            # Re-raise HTTP exceptions properly
            from werkzeug.exceptions import HTTPException
            if isinstance(e, HTTPException):
                raise e

            # Log and handle unexpected errors
            print(f"Registration error: {str(e)}")
            api.abort(500, f'Registration failed: {str(e)}')

@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_parser)
    @auth_ns.doc(responses={
        200: 'Login successful',
        401: 'Invalid credentials',
        500: 'Login failed'
    })
    def post(self):
        try:
            args = login_parser.parse_args()
            user = User.query.filter_by(email=args.email.strip().lower()).first()
            if not user or not user.check_password(args.password):
                api.abort(401, 'Invalid credentials')

            user.last_login = datetime.utcnow()
            db.session.commit()

            access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role, 'email': user.email, 'is_verified': user.is_verified})
            refresh_token = create_refresh_token(identity=str(user.id))

            log_action(user.id, 'login')
            db.session.commit()

            return {
                'message': 'Login successful',
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': marshal(user, user_model)
            }
        except Exception as e:
            # Re-raise HTTP exceptions (401, etc.) - don't convert to 500
            if hasattr(e, 'code') and e.code == 401:
                raise e

            # Log and handle unexpected errors
            print(f"Login error: {str(e)}")
            api.abort(500, 'Login failed')

@auth_ns.route('/forgot-password')
class ForgotPassword(Resource):
    @auth_ns.expect(email_parser)
    @auth_ns.doc(responses={
        200: 'Reset link sent if account exists',
        500: 'Password reset failed'
    })
    def post(self):
        try:
            args = email_parser.parse_args()
            email = args.email.strip().lower()
            if user := User.query.filter_by(email=email).first():
                PasswordReset.query.filter_by(user_id=user.id, is_used=False).update({'is_used': True})
                token = AuthService.generate_reset_token()
                db.session.add(PasswordReset(user_id=user.id, token=token, expires_at=datetime.utcnow() + timedelta(hours=1)))
                db.session.commit()
                try: AuthService.send_reset_email(user.email, token)
                except: pass
                log_action(user.id, 'password_reset_request')
                db.session.commit()
            return {'message': 'If account exists, reset link sent'}
        except Exception:
            db.session.rollback()
            api.abort(500, 'Password reset failed')

@auth_ns.route('/reset-password')
class ResetPassword(Resource):
    @auth_ns.expect(reset_password_parser)
    @auth_ns.doc(responses={
        200: 'Password reset successful',
        400: 'Invalid token or password',
        500: 'Password reset failed'
    })
    def post(self):
        try:
            args = reset_password_parser.parse_args()
            if not (valid := validate_password(args.new_password))[0]: api.abort(400, valid[1])
            reset = PasswordReset.query.filter_by(token=args.token, is_used=False).first()
            if not reset or reset.expires_at < datetime.utcnow(): api.abort(400, 'Invalid or expired token')
            reset.user.set_password(args.new_password)
            reset.is_used = True
            db.session.commit()
            log_action(reset.user.id, 'password_reset')
            db.session.commit()
            return {'message': 'Password reset successful'}
        except Exception:
            db.session.rollback()
            api.abort(500, 'Password reset failed')

@auth_ns.route('/verify-email')
class VerifyEmail(Resource):
    @auth_ns.expect(token_parser)
    @auth_ns.doc(responses={
        200: 'Email verified successfully',
        400: 'Invalid or expired token',
        500: 'Verification failed'
    })
    def post(self):
        try:
            args = token_parser.parse_args()
            verification = EmailVerification.query.filter_by(token=args.token, is_used=False).first()
            if not verification or verification.expires_at < datetime.utcnow(): api.abort(400, 'Invalid or expired token')
            verification.user.is_verified = True
            verification.is_used = True
            db.session.commit()
            log_action(verification.user.id, 'email_verified')
            db.session.commit()
            return {'message': 'Email verified successfully'}
        except Exception:
            db.session.rollback()
            api.abort(500, 'Verification failed')

@auth_ns.route('/me')
class CurrentUser(Resource):
    @jwt_required()
    @auth_ns.marshal_with(user_model)
    @auth_ns.doc(responses={
        200: 'Current user information',
        404: 'User not found'
    })
    def get(self):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id) or api.abort(404, 'User not found')
        return user


@auth_ns.route('/logout')
class Logout(Resource):
    @jwt_required()
    @auth_ns.doc(responses={
        200: 'Successfully logged out',
        401: 'Invalid token'
    })
    def post(self):
        """Logout user by blacklisting current token"""
        # Get the JWT ID to blacklist the token
        jwt_data = get_jwt()
        jti = jwt_data['jti']

        # Blacklist the token
        current_app.blacklist_token(jti)

        return {'message': 'Successfully logged out'}, 200


@auth_ns.route('/refresh')
class RefreshToken(Resource):
    @jwt_required(refresh=True)
    @auth_ns.doc(responses={
        200: 'New access token generated',
        401: 'Invalid refresh token'
    })
    def post(self):
        """Generate new access token using refresh token"""
        current_user_id = get_jwt_identity()

        # Create new access token
        new_token = create_access_token(identity=str(current_user_id))

        return {'access_token': new_token}, 200


@auth_ns.route('/organization-signup')
class OrganizationSignup(Resource):
    @auth_ns.expect(org_signup_parser)
    @auth_ns.doc(responses={
        201: 'Organization and admin account created successfully',
        400: 'Validation error',
        409: 'Email already registered',
        500: 'Registration failed'
    })
    def post(self):
        try:
            args = org_signup_parser.parse_args()
            email = args.admin_email.strip().lower()

            # Validate email format
            if not (valid := validate_email_format(email))[0]:
                api.abort(400, valid[1])

            # Validate password strength
            if not (valid := validate_password(args.password))[0]:
                api.abort(400, valid[1])

            # Check if email already exists
            if User.query.filter_by(email=email).first():
                api.abort(409, 'Email already registered')

            # Validate category
            if not Category.query.get(args.category_id):
                api.abort(400, 'Invalid category')

            # Create org admin user
            user = User(
                name=args.admin_name.strip(),
                email=email,
                role='org_admin',  # Set role as org_admin
                is_verified=True
            )
            user.set_password(args.password)
            db.session.add(user)
            db.session.flush()  # Get user ID without committing

            # Create organization
            org = Organization(
                name=args.organization_name.strip(),
                mission=args.mission.strip(),
                category_id=args.category_id,
                email=email,
                phone=(args.phone or '').strip(),
                website=(args.website or '').strip(),
                address=(args.address or '').strip(),
                admin_user_id=user.id,
                status='pending'  # Organizations need approval
            )
            db.session.add(org)
            db.session.commit()

            # Generate access tokens for immediate login
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={
                    'role': user.role,
                    'email': user.email,
                    'is_verified': user.is_verified
                }
            )
            refresh_token = create_refresh_token(identity=str(user.id))

            # Log actions
            log_action(user.id, 'create', 'user', user.id, None, {'email': email, 'name': user.name, 'role': 'org_admin'})
            log_action(user.id, 'create', 'organization', org.id, None, {'name': org.name, 'status': 'pending'})
            db.session.commit()

            return {
                'message': 'Organization registration successful! Your organization is pending approval.',
                'user': marshal(user, user_model),
                'organization': marshal(org, organization_model),
                'access_token': access_token,
                'refresh_token': refresh_token
            }, 201

        except Exception as e:
            db.session.rollback()
            # Re-raise HTTP exceptions properly
            from werkzeug.exceptions import HTTPException
            if isinstance(e, HTTPException):
                raise e
            print(f"Organization signup error: {str(e)}")
            api.abort(500, f'Registration failed: {str(e)}')


@auth_ns.route('/change-password')
class ChangePassword(Resource):
    @jwt_required()
    @auth_ns.expect(change_password_parser)
    @auth_ns.doc(responses={
        200: 'Password changed successfully',
        400: 'Invalid new password format',
        401: 'Current password incorrect',
        404: 'User not found',
        500: 'Password change failed'
    })
    def post(self):
        try:
            args = change_password_parser.parse_args()
            user = User.query.get(get_jwt_identity())
            if not user:
                api.abort(404, 'User not found')
            if not user.check_password(args.current_password):
                api.abort(401, 'Current password is incorrect')
            if not (valid := validate_password(args.new_password))[0]:
                api.abort(400, valid[1])
            user.set_password(args.new_password)
            db.session.commit()
            log_action(user.id, 'password_change')
            db.session.commit()
            return {'message': 'Password changed successfully'}
        except Exception as e:
            db.session.rollback()
            # Re-raise HTTP exceptions properly
            from werkzeug.exceptions import HTTPException
            if isinstance(e, HTTPException):
                raise e
            api.abort(500, 'Password change failed')

# GOOGLE OAUTH ENDPOINTS
@auth_ns.route('/google')
class GoogleOAuth(Resource):
    @auth_ns.doc(responses={
        302: 'Redirect to Google OAuth authorization page',
        500: 'OAuth initialization failed'
    })
    def get(self):
        """Initiate Google OAuth flow"""
        try:
            # Generate state parameter for security
            state = oauth_service.generate_state()

            # Store state in a more reliable way - encode it in the state itself
            # We'll validate it on callback by checking the format
            session['oauth_state'] = state

            # Also store it in a way that survives CORS issues
            # For production, you might want to use Redis or database
            # For now, we'll use a simple approach with encoded state

            # Get Google authorization URL
            authorization_url, _ = oauth_service.get_authorization_url(state)

            print(f"OAuth initiated - State generated: {state}")
            print(f"Session state stored: {session.get('oauth_state')}")

            return redirect(authorization_url)
        except GoogleAuthError as e:
            api.abort(500, f'OAuth initialization failed: {str(e)}')
        except Exception as e:
            api.abort(500, f'Unexpected error: {str(e)}')

@auth_ns.route('/google/callback')
class GoogleOAuthCallback(Resource):
    @auth_ns.doc(responses={
        200: 'OAuth callback processed successfully',
        400: 'Invalid OAuth callback parameters',
        401: 'OAuth authentication failed',
        500: 'OAuth callback processing failed'
    })
    def get(self):
        """Handle Google OAuth callback"""
        try:
            # Get authorization code and state from callback
            authorization_code = request.args.get('code')
            state = request.args.get('state')
            error = request.args.get('error')
            error_description = request.args.get('error_description')

            # Debug logging
            print(f"OAuth callback received - Code: {bool(authorization_code)}, State: {state}, Error: {error}")
            print(f"Session state: {session.get('oauth_state')}")
            print(f"All request args: {dict(request.args)}")

            # Check for OAuth errors
            if error:
                error_msg = f'OAuth error: {error}'
                if error_description:
                    error_msg += f' - {error_description}'
                # Redirect to frontend with error
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
                return redirect(f'{frontend_url}/login?error={error}')

            if not authorization_code:
                print("No authorization code provided")
                # Redirect to frontend with error
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
                return redirect(f'{frontend_url}/login?error=no_code')

            # Verify state parameter (disabled in development for CORS issues)
            session_state = session.get('oauth_state')

            # Skip state validation in development mode to avoid CORS session issues
            if os.getenv('FLASK_DEBUG') != '1':
                if session_state and state != session_state:
                    print(f"State mismatch - Session: {session_state}, Received: {state}")
                    # Clear session and redirect
                    session.pop('oauth_state', None)
                    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
                    return redirect(f'{frontend_url}/login?error=invalid_state')
            else:
                print(f"Development mode: Skipping state validation. Session: {session_state}, Received: {state}")

            # Exchange code for credentials
            credentials = oauth_service.exchange_code_for_token(authorization_code, state)

            # Get user info from Google
            user_info = oauth_service.get_user_info_from_credentials(credentials)
            print(f"Google user info received: {user_info}")

            # Find or create user
            user = self._find_or_create_user(user_info)

            # Create JWT tokens with string identity (Flask-JWT-Extended requirement)
            access_token = create_access_token(identity=str(user.id))
            refresh_token = create_refresh_token(identity=str(user.id))

            # Update last login
            user.last_login = datetime.utcnow()
            db.session.commit()

            # Log the action
            log_action(user.id, 'oauth_login', 'auth', user.id, None, {'provider': 'google'})
            db.session.commit()

            # Clear OAuth state from session
            session.pop('oauth_state', None)

            # Check if this is an account linking request
            linking_user_id = session.pop('linking_user_id', None)

            if linking_user_id:
                # This is an account linking request
                existing_user = User.query.get(linking_user_id)
                if existing_user:
                    existing_user.google_id = user_info['google_id']
                    if not existing_user.profile_picture and user_info.get('profile_picture'):
                        existing_user.profile_picture = user_info['profile_picture']
                    if not existing_user.is_verified and user_info.get('email_verified'):
                        existing_user.is_verified = True
                    existing_user.updated_at = datetime.utcnow()
                    db.session.commit()

                    log_action(existing_user.id, 'oauth_link', 'auth', existing_user.id, None, {'provider': 'google'})
                    db.session.commit()

                    # Redirect to frontend with success message
                    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
                    return redirect(f'{frontend_url}/profile?linked=google')

            # Regular OAuth login/signup - redirect to frontend with tokens
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            redirect_url = f'{frontend_url}/auth/callback?token={access_token}&refresh_token={refresh_token}&user_id={user.id}'
            return redirect(redirect_url)

        except GoogleAuthError as e:
            print(f"GoogleAuthError: {str(e)}")
            print(f"Error details: {repr(e)}")
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            return redirect(f'{frontend_url}/login?error=oauth_error&message={str(e)}')
        except Exception as e:
            print(f"Unexpected error in OAuth callback: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            db.session.rollback()
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
            return redirect(f'{frontend_url}/login?error=server_error&message={str(e)}')

    def _find_or_create_user(self, user_info):
        """Find existing user or create new one from OAuth data"""
        # First, try to find user by Google ID
        user = User.query.filter_by(google_id=user_info['google_id']).first()

        if user:
            # Update user info if needed
            self._update_user_from_oauth(user, user_info)
            return user

        # Then try to find by email
        user = User.query.filter_by(email=user_info['email']).first()

        if user:
            # Link Google account to existing user
            try:
                print(f"Linking Google account to existing user: {user.email}")
                user.google_id = user_info['google_id']
                if not user.profile_picture and user_info.get('profile_picture'):
                    user.profile_picture = user_info['profile_picture']
                if not user.is_verified and user_info.get('email_verified'):
                    user.is_verified = True
                user.updated_at = datetime.utcnow()
                db.session.commit()
                print(f"Successfully linked Google account for user: {user.email}")
                return user
            except Exception as e:
                print(f"Error linking Google account: {str(e)}")
                db.session.rollback()
                raise e

        # Create new user
        return self._create_user_from_oauth(user_info)

    def _update_user_from_oauth(self, user, user_info):
        """Update existing user with OAuth data"""
        updated = False

        if not user.profile_picture and user_info.get('profile_picture'):
            user.profile_picture = user_info['profile_picture']
            updated = True

        if not user.is_verified and user_info.get('email_verified'):
            user.is_verified = True
            updated = True

        if not user.name and user_info.get('name'):
            user.name = user_info['name']
            updated = True

        if updated:
            user.updated_at = datetime.utcnow()
            db.session.commit()

    def _create_user_from_oauth(self, user_info):
        """Create new user from OAuth data"""
        user = User(
            name=user_info.get('name', ''),
            email=user_info['email'],
            google_id=user_info['google_id'],
            profile_picture=user_info.get('profile_picture', ''),
            is_verified=True,  # Make all OAuth users verified by default
            role='visitor',  # Default role
            password_hash=None  # OAuth users don't have passwords
        )

        db.session.add(user)
        db.session.commit()

        # Log user creation
        log_action(user.id, 'user_created', 'user', user.id, None, {'method': 'oauth_google'})
        db.session.commit()

        return user

@auth_ns.route('/google/link')
class GoogleOAuthLink(Resource):
    @jwt_required()
    @auth_ns.doc(responses={
        302: 'Redirect to Google OAuth for account linking',
        401: 'Authentication required',
        500: 'Account linking initialization failed'
    })
    def get(self):
        """Link Google account to existing user"""
        try:
            user_id = get_jwt_identity()

            # Generate state parameter with user ID for linking
            state = oauth_service.generate_state()
            session['oauth_state'] = state
            session['linking_user_id'] = user_id

            # Get Google authorization URL
            authorization_url, _ = oauth_service.get_authorization_url(state)

            return redirect(authorization_url)
        except GoogleAuthError as e:
            api.abort(500, f'Account linking initialization failed: {str(e)}')
        except Exception as e:
            api.abort(500, f'Unexpected error: {str(e)}')

@auth_ns.route('/google/unlink')
class GoogleOAuthUnlink(Resource):
    @jwt_required()
    @auth_ns.doc(responses={
        200: 'Google account unlinked successfully',
        400: 'No Google account linked or cannot unlink',
        401: 'Authentication required',
        500: 'Account unlinking failed'
    })
    def post(self):
        """Unlink Google account from user"""
        try:
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                api.abort(404, 'User not found')

            if not user.google_id:
                api.abort(400, 'No Google account linked to this user')

            # Check if user has a password (can't unlink if it's the only auth method)
            if not user.password_hash:
                api.abort(400, 'Cannot unlink Google account: set a password first')

            # Unlink Google account
            user.google_id = None
            user.updated_at = datetime.utcnow()
            db.session.commit()

            # Log the action
            log_action(user.id, 'oauth_unlink', 'auth', user.id, None, {'provider': 'google'})
            db.session.commit()

            return {'message': 'Google account unlinked successfully'}

        except SQLAlchemyError as e:
            db.session.rollback()
            api.abort(500, f'Database error during account unlinking: {str(e)}')
        except Exception as e:
            # Don't catch abort exceptions - let them through
            if hasattr(e, 'code') and hasattr(e, 'description'):
                raise
            db.session.rollback()
            api.abort(500, f'Account unlinking failed: {str(e)}')

# ORGANIZATION ENDPOINTS
@org_ns.route('')
class OrganizationList(Resource):
    @org_ns.expect(org_parser)
    @org_ns.doc(responses={
        200: 'List of organizations retrieved successfully',
        500: 'Failed to fetch organizations'
    })
    def get(self):
        try:
            args = org_parser.parse_args()
            query = Organization.query
            if args.status: query = query.filter(Organization.status == args.status)
            else: query = query.filter(Organization.status == 'approved')
            if args.category_id: query = query.filter(Organization.category_id == args.category_id)
            if args.location_id: query = query.filter(Organization.location_id == args.location_id)
            if args.search:
                s = f"%{args.search}%"
                query = query.filter(or_(Organization.name.ilike(s), Organization.description.ilike(s), Organization.mission.ilike(s)))

            items, pag = paginate(query.order_by(desc(Organization.created_at)), args.page, args.per_page)
            return {'organizations': [marshal(o, organization_model) for o in items], 'pagination': pag}
        except Exception: api.abort(500, 'Failed to fetch organizations')

    @jwt_required()
    @org_ns.expect(org_create_parser)
    @org_ns.marshal_with(organization_model, code=201)
    @org_ns.doc(responses={
        201: 'Organization created successfully',
        400: 'Invalid category or validation error',
        409: 'You already have an organization',
        500: 'Failed to create organization'
    })
    def post(self):
        try:
            uid = get_jwt_identity()
            args = org_create_parser.parse_args()
            if Organization.query.filter_by(admin_user_id=uid).first(): api.abort(409, 'You already have an organization')
            if not Category.query.get(args.category_id): api.abort(400, 'Invalid category')

            org = Organization(name=args.name.strip(), mission=args.mission.strip(), description=(args.description or '').strip(),
                             category_id=args.category_id, address=(args.address or '').strip(), phone=(args.phone or '').strip(),
                             email=args.email.strip(), website=(args.website or '').strip(), donation_link=(args.donation_link or '').strip(),
                             operating_hours=(args.operating_hours or '').strip(), established_year=args.established_year,
                             admin_user_id=uid, status='pending')
            db.session.add(org)
            db.session.commit()
            log_action(uid, 'create', 'organization', org.id, None, {'name': org.name, 'status': 'pending'})
            db.session.commit()
            return {'message': 'Organization submitted for review', 'organization': marshal(org, organization_model)}, 201
        except Exception:
            db.session.rollback()
            api.abort(500, 'Failed to create organization')

@org_ns.route('/<int:org_id>')
class OrganizationDetail(Resource):
    @org_ns.marshal_with(organization_model)
    @org_ns.doc(responses={
        200: 'Organization details retrieved successfully',
        404: 'Organization not found',
        500: 'Failed to fetch organization'
    })
    def get(self, org_id):
        try:
            org = Organization.query.get(org_id) or api.abort(404, 'Organization not found')

            is_admin = False
            try:
                if uid := get_jwt_identity():
                    if user := User.query.get(uid): is_admin = user.role in ['platform_admin', 'org_admin']
            except: pass

            if org.status != 'approved' and not is_admin: api.abort(404, 'Organization not found')

            org.view_count = (org.view_count or 0) + 1
            db.session.commit()

            org_data = marshal(org, organization_model)
            org_data.update({
                'location': {'city': org.location.city, 'state_province': org.location.state_province, 'country': org.location.country, 'postal_code': org.location.postal_code} if org.location else None,
                'address': org.address, 'operating_hours': org.operating_hours, 'established_year': org.established_year,
                'social_links': [{'platform': l.platform, 'url': l.url, 'is_verified': l.is_verified} for l in org.social_links],
                'photos': [{'id': p.id, 'file_name': p.file_name, 'file_path': p.file_path, 'alt_text': p.alt_text, 'is_primary': p.is_primary} for p in org.photos],
                'updated_at': org.updated_at.isoformat() if org.updated_at else None
            })
            return {'organization': org_data}
        except Exception: api.abort(500, 'Failed to fetch organization')

@org_ns.route('/<int:org_id>/contact')
class OrganizationContact(Resource):
    def get(self, org_id):
        org = Organization.query.filter_by(id=org_id, status='approved').first() or api.abort(404, 'Organization not found')
        return {'contact': {'name': org.name, 'email': org.email, 'phone': org.phone, 'address': org.address, 'website': org.website}}

# CATEGORY ENDPOINTS
@category_ns.route('')
class CategoryList(Resource):
    @category_ns.doc(responses={200: 'List of categories retrieved successfully'})
    def get(self):
        cats = Category.query.filter_by(is_active=True).order_by(Category.sort_order, Category.name).all()
        return {'categories': [{'id': c.id, 'name': c.name, 'description': c.description, 'icon_url': c.icon_url, 'color_code': c.color_code, 'organization_count': len([o for o in c.organizations if o.status == 'approved'])} for c in cats]}

@category_ns.route('/<int:category_id>/organizations')
class CategoryOrganizations(Resource):
    @category_ns.expect(pagination_parser)
    @category_ns.doc(responses={
        200: 'Organizations in category retrieved successfully',
        404: 'Category not found'
    })
    def get(self, category_id):
        cat = Category.query.get(category_id) or api.abort(404, 'Category not found')
        args = pagination_parser.parse_args()
        items, pag = paginate(Organization.query.filter_by(category_id=category_id, status='approved').order_by(desc(Organization.created_at)), args.page, args.per_page)
        return {'category': {'id': cat.id, 'name': cat.name, 'description': cat.description}, 'organizations': [marshal(o, organization_model) for o in items], 'pagination': pag}

# LOCATION ENDPOINTS
@location_ns.route('')
class LocationList(Resource):
    @location_ns.doc(responses={200: 'List of locations retrieved successfully'})
    def get(self):
        """Get all unique locations with organization counts"""
        # Get all unique locations
        locations = Location.query.filter_by(is_active=True).all()
        result = []

        for loc in locations:
            # Count organizations in this location
            org_count = Organization.query.filter_by(
                location_id=loc.id,
                status='approved'
            ).count()

            result.append({
                'id': loc.id,
                'country': loc.country,
                'state_province': loc.state_province,
                'city': loc.city,
                'postal_code': loc.postal_code,
                'organization_count': org_count
            })

        return {'locations': result}

@location_ns.route('/search')
class LocationSearch(Resource):
    @location_ns.expect(location_search_parser)
    @location_ns.marshal_list_with(location_model)
    @location_ns.doc(responses={
        200: 'Location search results',
        400: 'Query too short'
    })
    def get(self):
        args = location_search_parser.parse_args()
        q = args.q.strip()
        if len(q) < 2: api.abort(400, 'Query must be at least 2 characters')
        locs = Location.query.filter(Location.is_active == True, or_(Location.city.ilike(f"%{q}%"), Location.state_province.ilike(f"%{q}%"), Location.country.ilike(f"%{q}%"))).limit(20).all()
        return {'locations': [{'id': l.id, 'city': l.city, 'state_province': l.state_province, 'country': l.country, 'display_name': f"{l.city}, {l.state_province}, {l.country}"} for l in locs]}

# SEARCH ENDPOINTS
@search_ns.route('/organizations')
class OrganizationSearch(Resource):
    @search_ns.expect(search_parser)
    def get(self):
        try:
            args = search_parser.parse_args()
            query = Organization.query.filter(Organization.status == 'approved')
            if args.q: query = query.filter(or_(Organization.name.ilike(f"%{args.q}%"), Organization.description.ilike(f"%{args.q}%"), Organization.mission.ilike(f"%{args.q}%")))
            if args.category_id: query = query.filter(Organization.category_id == args.category_id)
            if args.location_id: query = query.filter(Organization.location_id == args.location_id)
            if args.verification_level: query = query.filter(Organization.verification_level == args.verification_level)

            items, pag = paginate(query.order_by(desc(Organization.bookmark_count), desc(Organization.view_count), desc(Organization.created_at)), args.page, args.per_page)

            try:
                if (uid := get_jwt_identity()) and args.q:
                    db.session.add(SearchHistory(user_id=uid, search_query=args.q, filters_applied=json.dumps({'category_id': args.category_id, 'location_id': args.location_id, 'verification_level': args.verification_level}), results_count=pag['total'], ip_address=request.remote_addr))
                    db.session.commit()
            except: pass

            return {'results': [marshal(o, organization_model) for o in items], 'pagination': pag, 'search_meta': {'query': args.q, 'filters': {'category_id': args.category_id, 'location_id': args.location_id, 'verification_level': args.verification_level}}}
        except Exception: api.abort(500, 'Search failed')

@search_ns.route('/suggestions')
class SearchSuggestions(Resource):
    @search_ns.expect(search_suggestions_parser)
    def get(self):
        try:
            args = search_suggestions_parser.parse_args()
            q = args.q.strip()
            if len(q) < 2: return {'suggestions': []}

            # Get organization suggestions
            orgs = [o.name for o in db.session.query(Organization.name).filter(
                Organization.status == 'approved',
                Organization.name.ilike(f"%{q}%")
            ).limit(5)]

            # Get category suggestions
            cats = [c.name for c in db.session.query(Category.name).filter(
                Category.is_active == True,
                Category.name.ilike(f"%{q}%")
            ).limit(3)]

            return {'suggestions': (orgs + cats)[:10]}
        except Exception:
            return {'suggestions': []}

@search_ns.route('/popular')
class PopularSearches(Resource):
    def get(self):
        searches = db.session.query(SearchHistory.search_query, func.count(SearchHistory.id).label('count')).group_by(SearchHistory.search_query).order_by(desc('count')).limit(10).all()
        return {'popular_searches': [{'query': s.search_query, 'count': s.count} for s in searches]}


# USER PROFILE & BOOKMARKS
@user_ns.route('/profile')
class UserProfile(Resource):
    @jwt_required()
    @user_ns.marshal_with(user_model)
    @user_ns.doc(responses={
        200: 'User profile retrieved successfully',
        404: 'User not found'
    })
    def get(self):
        user = User.query.get(get_jwt_identity()) or api.abort(404, 'User not found')
        org = Organization.query.filter_by(admin_user_id=user.id).first()
        profile = marshal(user, user_model)
        profile['organization'] = {'id': org.id, 'name': org.name, 'status': org.status} if org else None
        return {'profile': profile}

    @jwt_required()
    @user_ns.expect(profile_update_parser)
    @user_ns.marshal_with(user_model)
    @user_ns.doc(responses={
        200: 'Profile updated successfully',
        404: 'User not found',
        500: 'Failed to update profile'
    })
    def put(self):
        try:
            user = User.query.get(get_jwt_identity()) or api.abort(404, 'User not found')
            args = profile_update_parser.parse_args()
            old = {'name': user.name, 'profile_picture': user.profile_picture}
            if args.name and args.name.strip(): user.name = args.name.strip()
            if args.profile_picture is not None: user.profile_picture = args.profile_picture
            user.updated_at = datetime.utcnow()
            db.session.commit()
            log_action(user.id, 'update', 'user', user.id, old, {'name': user.name, 'profile_picture': user.profile_picture})
            db.session.commit()
            return {'message': 'Profile updated', 'profile': marshal(user, user_model)}
        except Exception:
            db.session.rollback()
            api.abort(500, 'Failed to update profile')

@user_ns.route('/bookmarks')
class UserBookmarks(Resource):
    @jwt_required()
    @user_ns.expect(pagination_parser)
    @user_ns.marshal_list_with(bookmark_model)
    @user_ns.doc(responses={200: 'User bookmarks retrieved successfully'})
    def get(self):
        args = pagination_parser.parse_args()
        items, pag = paginate(db.session.query(UserBookmark).join(Organization).filter(UserBookmark.user_id == get_jwt_identity(), Organization.status == 'approved').order_by(desc(UserBookmark.created_at)), args.page, args.per_page)
        return {'bookmarks': [{'id': b.id, 'created_at': b.created_at.isoformat(), 'notes': b.notes, 'organization': marshal(b.organization, organization_model)} for b in items], 'pagination': pag}

    @jwt_required()
    @user_ns.expect(bookmark_create_parser)
    @user_ns.marshal_with(bookmark_model, code=201)
    @user_ns.doc(responses={
        201: 'Bookmark created successfully',
        404: 'Organization not found',
        409: 'Already bookmarked',
        500: 'Failed to add bookmark'
    })
    def post(self):
        try:
            uid = get_jwt_identity()
            args = bookmark_create_parser.parse_args()
            org = Organization.query.filter_by(id=args.organization_id, status='approved').first() or api.abort(404, 'Organization not found')
            if UserBookmark.query.filter_by(user_id=uid, organization_id=args.organization_id).first(): api.abort(409, 'Already bookmarked')

            bookmark = UserBookmark(user_id=uid, organization_id=args.organization_id, notes=(args.notes or '').strip())
            db.session.add(bookmark)
            org.bookmark_count = (org.bookmark_count or 0) + 1
            db.session.commit()
            log_action(uid, 'create', 'bookmark', bookmark.id, None, {'organization_id': args.organization_id, 'organization_name': org.name})
            db.session.commit()
            return {'message': 'Bookmarked successfully', 'bookmark': {'id': bookmark.id, 'organization_id': args.organization_id, 'notes': bookmark.notes, 'created_at': bookmark.created_at.isoformat()}}, 201
        except Exception:
            db.session.rollback()
            api.abort(500, 'Failed to add bookmark')

@user_ns.route('/bookmarks/<int:bookmark_id>')
class UserBookmarkDetail(Resource):
    @jwt_required()
    @user_ns.marshal_with(message_response_model)
    @user_ns.doc(responses={
        200: 'Bookmark removed successfully',
        404: 'Bookmark not found',
        500: 'Failed to remove bookmark'
    })
    def delete(self, bookmark_id):
        try:
            bookmark = UserBookmark.query.filter_by(id=bookmark_id, user_id=get_jwt_identity()).first() or api.abort(404, 'Bookmark not found')
            org = bookmark.organization
            if org.bookmark_count and org.bookmark_count > 0: org.bookmark_count -= 1
            db.session.delete(bookmark)
            db.session.commit()
            log_action(get_jwt_identity(), 'delete', 'bookmark', bookmark_id, {'organization_name': org.name}, None)
            db.session.commit()
            return {'message': 'Bookmark removed'}
        except Exception:
            db.session.rollback()
            api.abort(500, 'Failed to remove bookmark')

# NOTIFICATIONS
@notification_ns.route('')
class NotificationList(Resource):
    @jwt_required()
    @notification_ns.expect(pagination_parser)
    @notification_ns.marshal_list_with(notification_model)
    @notification_ns.doc(responses={200: 'Notifications retrieved successfully'})
    def get(self):
        args = pagination_parser.parse_args()
        items, pag = paginate(Notification.query.filter_by(user_id=get_jwt_identity()).order_by(desc(Notification.created_at)), args.page, args.per_page)
        return {'notifications': [{'id': n.id, 'message': n.message, 'is_read': n.is_read, 'created_at': n.created_at.isoformat()} for n in items], 'pagination': pag}

@notification_ns.route('/<int:notification_id>/read')
class NotificationRead(Resource):
    @jwt_required()
    @notification_ns.marshal_with(message_response_model)
    @notification_ns.doc(responses={
        200: 'Notification marked as read',
        404: 'Notification not found',
        500: 'Failed to mark notification as read'
    })
    def put(self, notification_id):
        try:
            notif = Notification.query.filter_by(id=notification_id, user_id=get_jwt_identity()).first() or api.abort(404, 'Notification not found')
            notif.is_read = True
            db.session.commit()
            return {'message': 'Marked as read'}
        except Exception:
            db.session.rollback()
            api.abort(500, 'Failed to mark as read')

@notification_ns.route('/unread-count')
class UnreadCount(Resource):
    @jwt_required()
    @notification_ns.marshal_with(api.model('UnreadCountResponse', {
        'unread_count': fields.Integer(description='Number of unread notifications')
    }))
    @notification_ns.doc(responses={200: 'Unread notification count retrieved successfully'})
    def get(self):
        return {'unread_count': Notification.query.filter_by(user_id=get_jwt_identity(), is_read=False).count()}

# ADVERTISEMENTS
@ad_ns.route('')
class AdvertisementList(Resource):
    @ad_ns.expect(ad_parser)
    @ad_ns.doc(responses={
        200: 'Active advertisements retrieved successfully',
        500: 'Failed to retrieve advertisements'
    })
    def get(self):
        try:
            args = ad_parser.parse_args()
            query = Advertisement.query.filter(
                Advertisement.is_active == True,
                Advertisement.start_date <= datetime.utcnow().date(),
                Advertisement.end_date >= datetime.utcnow().date()
            )

            if args.placement:
                query = query.filter(Advertisement.placement == args.placement)
            if args.ad_type:
                query = query.filter(Advertisement.ad_type == args.ad_type)

            limit = min(args.limit, 20)
            ads = query.order_by(desc(Advertisement.created_at)).limit(limit).all()

            return {
                'advertisements': [{
                    'id': a.id,
                    'title': a.title,
                    'description': a.description,
                    'image_url': a.image_url,
                    'target_url': a.target_url,
                    'ad_type': a.ad_type,
                    'placement': a.placement,
                    'organization': {
                        'id': a.organization.id,
                        'name': a.organization.name
                    } if a.organization_id else None
                } for a in ads]
            }
        except Exception:
            api.abort(500, 'Failed to retrieve advertisements')

@ad_ns.route('/<int:ad_id>/click')
class AdvertisementClick(Resource):
    @ad_ns.marshal_with(api.model('ClickResponse', {
        'message': fields.String(description='Success message'),
        'target_url': fields.String(description='Advertisement target URL'),
        'clicks_count': fields.Integer(description='Total click count')
    }))
    @ad_ns.doc(responses={
        200: 'Click tracked successfully',
        400: 'Advertisement not currently active',
        404: 'Advertisement not found or inactive',
        500: 'Failed to track click'
    })
    def post(self, ad_id):
        try:
            ad = Advertisement.query.get(ad_id)
            if not ad or not ad.is_active: api.abort(404, 'Ad not found or inactive')
            if not (ad.start_date <= datetime.utcnow().date() <= ad.end_date): api.abort(400, 'Ad not currently active')
            ad.clicks_count = (ad.clicks_count or 0) + 1
            db.session.commit()
            return {'message': 'Click tracked', 'target_url': ad.target_url, 'clicks_count': ad.clicks_count}
        except Exception:
            db.session.rollback()
            api.abort(500, 'Failed to track click')

@ad_ns.route('/<int:ad_id>/impression')
class AdvertisementImpression(Resource):
    def post(self, ad_id):
        try:
            ad = Advertisement.query.get(ad_id)
            if not ad or not ad.is_active: api.abort(404, 'Ad not found or inactive')
            if not (ad.start_date <= datetime.utcnow().date() <= ad.end_date): api.abort(400, 'Ad not currently active')
            ad.impressions_count = (ad.impressions_count or 0) + 1
            db.session.commit()
            return {'message': 'Impression tracked', 'impressions_count': ad.impressions_count}
        except Exception:
            db.session.rollback()
            api.abort(500, 'Failed to track impression')

# ORGANIZATION ADMIN ROUTES
@org_ns.route('/<int:org_id>/contact-messages')
class OrganizationContactMessages(Resource):
    @jwt_required()
    @org_ns.expect(contact_messages_parser)
    @org_ns.marshal_list_with(contact_message_model)
    @org_ns.doc(responses={200: 'Contact messages retrieved successfully'})
    def get(self, org_id):
        org = check_org_admin(org_id, get_jwt_identity())
        args = contact_messages_parser.parse_args()
        query = ContactMessage.query.filter_by(organization_id=org_id)
        if args.status: query = query.filter(ContactMessage.is_read == (args.status == 'read'))
        items, pag = paginate(query.order_by(desc(ContactMessage.created_at)), args.page, args.per_page)
        return {'messages': [{'id': m.id, 'sender_name': m.sender_name, 'sender_email': m.sender_email, 'subject': m.subject, 'message': m.message, 'is_read': m.is_read, 'created_at': m.created_at.isoformat() if m.created_at else None, 'read_at': m.read_at.isoformat() if m.read_at else None} for m in items], 'pagination': pag, 'organization': {'id': org.id, 'name': org.name}}

    @org_ns.expect(contact_message_parser)
    @org_ns.marshal_with(contact_message_model, code=201)
    @org_ns.doc(responses={
        201: 'Message sent successfully',
        400: 'Invalid email format',
        404: 'Organization not found',
        500: 'Failed to send message'
    })
    def post(self, org_id):
        try:
            org = Organization.query.filter_by(id=org_id, status='approved').first() or api.abort(404, 'Organization not found')
            args = contact_message_parser.parse_args()
            email = args.sender_email.strip().lower()
            if not (valid := validate_email_format(email))[0]: api.abort(400, valid[1])

            msg = ContactMessage(organization_id=org_id, sender_name=args.sender_name.strip(), sender_email=email, subject=args.subject.strip(), message=args.message.strip())
            db.session.add(msg)
            db.session.commit()

            if org.admin_user_id:
                db.session.add(Notification(user_id=org.admin_user_id, message=f"New contact message from {args.sender_name} for {org.name}"))
                db.session.commit()

            return {'message': 'Message sent successfully', 'contact_message': {'id': msg.id, 'sender_name': msg.sender_name, 'subject': msg.subject, 'created_at': msg.created_at.isoformat()}}, 201
        except Exception:
            db.session.rollback()
            api.abort(500, 'Failed to send message')

@org_ns.route('/<int:org_id>/contact-messages/<int:message_id>')
class OrganizationContactMessageDetail(Resource):
    @jwt_required()
    @org_ns.marshal_with(message_response_model)
    @org_ns.doc(responses={
        200: 'Message marked as read',
        404: 'Message not found',
        500: 'Failed to mark as read'
    })
    def put(self, org_id, message_id):
        try:
            check_org_admin(org_id, get_jwt_identity())
            msg = ContactMessage.query.filter_by(id=message_id, organization_id=org_id).first() or api.abort(404, 'Message not found')
            msg.is_read, msg.read_at = True, datetime.utcnow()
            db.session.commit()
            log_action(get_jwt_identity(), 'update', 'contact_message', message_id, {'is_read': False}, {'is_read': True})
            db.session.commit()
            return {'message': 'Marked as read'}
        except Exception:
            db.session.rollback()
            api.abort(500, 'Failed to mark as read')

    @jwt_required()
    @org_ns.marshal_with(message_response_model)
    @org_ns.doc(responses={
        200: 'Message deleted successfully',
        404: 'Message not found',
        500: 'Failed to delete message'
    })
    def delete(self, org_id, message_id):
        try:
            check_org_admin(org_id, get_jwt_identity())
            msg = ContactMessage.query.filter_by(id=message_id, organization_id=org_id).first() or api.abort(404, 'Message not found')
            subject = msg.subject
            db.session.delete(msg)
            db.session.commit()
            log_action(get_jwt_identity(), 'delete', 'contact_message', message_id, {'subject': subject}, None)
            db.session.commit()
            return {'message': 'Message deleted'}
        except Exception:
            db.session.rollback()
            api.abort(500, 'Failed to delete message')

@org_ns.route('/<int:org_id>/photos')
class OrganizationPhotos(Resource):
    @org_ns.marshal_list_with(photo_model)
    @org_ns.doc(responses={
        200: 'Organization photos retrieved successfully',
        404: 'Organization not found'
    })
    def get(self, org_id):
        org = Organization.query.get(org_id) or api.abort(404, 'Organization not found')
        is_admin = False
        try:
            if uid := get_jwt_identity():
                if user := User.query.get(uid): is_admin = user.role in ['platform_admin', 'org_admin']
        except: pass
        if org.status != 'approved' and not is_admin: api.abort(404, 'Organization not found')
        photos = OrganizationPhoto.query.filter_by(organization_id=org_id).order_by(desc(OrganizationPhoto.is_primary), OrganizationPhoto.created_at).all()
        return {'photos': [{'id': p.id, 'file_name': p.file_name, 'file_path': p.file_path, 'alt_text': p.alt_text, 'is_primary': p.is_primary, 'created_at': p.created_at.isoformat() if p.created_at else None} for p in photos], 'organization': {'id': org.id, 'name': org.name}}

    @jwt_required()
    @org_ns.expect(photo_create_parser)
    @org_ns.marshal_with(photo_model, code=201)
    @org_ns.doc(responses={
        201: 'Photo added successfully',
        404: 'Organization not found',
        500: 'Failed to add photo'
    })
    def post(self, org_id):
        try:
            check_org_admin(org_id, get_jwt_identity())
            args = photo_create_parser.parse_args()
            if args.is_primary: OrganizationPhoto.query.filter_by(organization_id=org_id, is_primary=True).update({'is_primary': False})
            photo = OrganizationPhoto(organization_id=org_id, file_name=args.file_name.strip(), file_path=args.file_path.strip(), alt_text=(args.alt_text or '').strip(), is_primary=args.is_primary or False)
            db.session.add(photo)
            db.session.commit()
            log_action(get_jwt_identity(), 'create', 'organization_photo', photo.id, None, {'file_name': photo.file_name, 'organization_id': org_id})
            db.session.commit()
            return {'message': 'Photo added', 'photo': {'id': photo.id, 'file_name': photo.file_name, 'file_path': photo.file_path, 'alt_text': photo.alt_text, 'is_primary': photo.is_primary, 'created_at': photo.created_at.isoformat()}}, 201
        except Exception:
            db.session.rollback()
            api.abort(500, 'Failed to add photo')

@org_ns.route('/<int:org_id>/social-links')
class OrganizationSocialLinks(Resource):
    def get(self, org_id):
        org = Organization.query.get(org_id) or api.abort(404, 'Organization not found')
        is_admin = False
        try:
            if uid := get_jwt_identity():
                if user := User.query.get(uid): is_admin = user.role in ['platform_admin', 'org_admin']
        except: pass
        if org.status != 'approved' and not is_admin: api.abort(404, 'Organization not found')
        links = OrganizationSocialLink.query.filter_by(organization_id=org_id).order_by(OrganizationSocialLink.platform).all()
        return {'social_links': [{'id': l.id, 'platform': l.platform, 'url': l.url, 'is_verified': l.is_verified, 'created_at': l.created_at.isoformat() if l.created_at else None} for l in links], 'organization': {'id': org.id, 'name': org.name}}

    @jwt_required()
    @org_ns.expect(social_link_parser)
    def post(self, org_id):
        try:
            check_org_admin(org_id, get_jwt_identity())
            args = social_link_parser.parse_args()
            platform, url = args.platform.strip().lower(), args.url.strip()
            if platform not in ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'website']: api.abort(400, 'Invalid platform')
            if OrganizationSocialLink.query.filter_by(organization_id=org_id, platform=platform).first(): api.abort(409, f'Social link for {platform} exists')
            if not url.startswith(('http://', 'https://')): url = 'https://' + url
            link = OrganizationSocialLink(organization_id=org_id, platform=platform, url=url, is_verified=False)
            db.session.add(link)
            db.session.commit()
            log_action(get_jwt_identity(), 'create', 'organization_social_link', link.id, None, {'platform': platform, 'url': url, 'organization_id': org_id})
            db.session.commit()
            return {'message': 'Social link added', 'social_link': {'id': link.id, 'platform': link.platform, 'url': link.url, 'is_verified': link.is_verified, 'created_at': link.created_at.isoformat()}}, 201
        except Exception:
            db.session.rollback()
            api.abort(500, 'Failed to add social link')

# HEALTH CHECK
@api.route('/health')
class HealthCheck(Resource):
    @api.marshal_with(api.model('HealthResponse', {
        'status': fields.String(description='Health status'),
        'timestamp': fields.String(description='Response timestamp'),
        'database': fields.String(description='Database connection status'),
        'error': fields.String(description='Error message if unhealthy')
    }))
    @api.doc(responses={
        200: 'Service is healthy',
        503: 'Service is unhealthy'
    })
    def get(self):
        try:
            db.session.execute(text('SELECT 1'))
            return {'status': 'healthy', 'timestamp': datetime.utcnow().isoformat(), 'database': 'connected'}
        except Exception as e:
            return {'status': 'unhealthy', 'timestamp': datetime.utcnow().isoformat(), 'database': 'disconnected', 'error': str(e)}, 503

# Export the blueprint for use in app.py
__all__ = ['api_bp']
