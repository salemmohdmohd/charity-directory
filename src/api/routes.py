from flask import request, Blueprint
from flask_restx import Api, Resource, Namespace, fields, marshal
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from api.models import db, User, PasswordReset, EmailVerification, AuditLog, Organization, UserBookmark, SearchHistory, Advertisement, Category, Notification, Location, ContactMessage, OrganizationPhoto, OrganizationSocialLink
from api.auth_utils import AuthService, validate_password, validate_email_format
from datetime import datetime, timedelta
from sqlalchemy import func, desc, text, or_
from functools import wraps
import json

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
    def post(self):
        try:
            args = register_parser.parse_args()
            email = args.email.strip().lower()
            if not (valid := validate_email_format(email))[0]: api.abort(400, valid[1])
            if not (valid := validate_password(args.password))[0]: api.abort(400, valid[1])
            if User.query.filter_by(email=email).first(): api.abort(409, 'Email already registered')

            user = User(name=args.name.strip(), email=email, role='visitor', is_verified=False)
            user.set_password(args.password)
            db.session.add(user)
            db.session.commit()

            token = AuthService.generate_reset_token()
            db.session.add(EmailVerification(user_id=user.id, token=token, expires_at=datetime.utcnow() + timedelta(days=1)))
            db.session.commit()

            try: AuthService.send_verification_email(email, token)
            except: pass

            log_action(user.id, 'create', 'user', user.id, None, {'email': email, 'name': user.name})
            db.session.commit()
            return {'message': 'Registration successful! Please verify your email.', 'user': marshal(user, user_model)}, 201
        except Exception:
            db.session.rollback()
            api.abort(500, 'Registration failed')

@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_parser)
    def post(self):
        try:
            args = login_parser.parse_args()
            user = User.query.filter_by(email=args.email.strip().lower()).first()
            if not user or not user.check_password(args.password): api.abort(401, 'Invalid credentials')

            user.last_login = datetime.utcnow()
            db.session.commit()

            token = create_access_token(identity=user.id, additional_claims={'role': user.role, 'email': user.email, 'is_verified': user.is_verified})
            log_action(user.id, 'login')
            db.session.commit()
            return {'message': 'Login successful', 'access_token': token, 'user': marshal(user, user_model)}
        except Exception: api.abort(500, 'Login failed')

@auth_ns.route('/forgot-password')
class ForgotPassword(Resource):
    @auth_ns.expect(email_parser)
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
    def get(self):
        user = User.query.get(get_jwt_identity()) or api.abort(404, 'User not found')
        return {'user': marshal(user, user_model)}

@auth_ns.route('/change-password')
class ChangePassword(Resource):
    @jwt_required()
    @auth_ns.expect(change_password_parser)
    def post(self):
        try:
            args = change_password_parser.parse_args()
            user = User.query.get(get_jwt_identity())
            if not user or not user.check_password(args.current_password): api.abort(400, 'Current password incorrect')
            if not (valid := validate_password(args.new_password))[0]: api.abort(400, valid[1])
            user.set_password(args.new_password)
            db.session.commit()
            log_action(user.id, 'password_change')
            db.session.commit()
            return {'message': 'Password changed successfully'}
        except Exception:
            db.session.rollback()
            api.abort(500, 'Password change failed')

# ORGANIZATION ENDPOINTS
@org_ns.route('')
class OrganizationList(Resource):
    @org_ns.expect(org_parser)
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
    def get(self):
        cats = Category.query.filter_by(is_active=True).order_by(Category.sort_order, Category.name).all()
        return {'categories': [{'id': c.id, 'name': c.name, 'description': c.description, 'icon_url': c.icon_url, 'color_code': c.color_code, 'organization_count': len([o for o in c.organizations if o.status == 'approved'])} for c in cats]}

@category_ns.route('/<int:category_id>/organizations')
class CategoryOrganizations(Resource):
    @category_ns.expect(pagination_parser)
    def get(self, category_id):
        cat = Category.query.get(category_id) or api.abort(404, 'Category not found')
        args = pagination_parser.parse_args()
        items, pag = paginate(Organization.query.filter_by(category_id=category_id, status='approved').order_by(desc(Organization.created_at)), args.page, args.per_page)
        return {'category': {'id': cat.id, 'name': cat.name, 'description': cat.description}, 'organizations': [marshal(o, organization_model) for o in items], 'pagination': pag}

# LOCATION ENDPOINTS
@location_ns.route('')
class LocationList(Resource):
    def get(self):
        locs = db.session.query(Location, func.count(Organization.id).label('org_count')).outerjoin(Organization).filter(Location.is_active == True, or_(Organization.status == 'approved', Organization.id == None)).group_by(Location.id).order_by(Location.country, Location.state_province, Location.city).all()
        return {'locations': [{'id': l.Location.id, 'country': l.Location.country, 'state_province': l.Location.state_province, 'city': l.Location.city, 'postal_code': l.Location.postal_code, 'organization_count': l.org_count} for l in locs]}

@location_ns.route('/search')
class LocationSearch(Resource):
    @location_ns.expect(location_search_parser)
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
    def get(self):
        user = User.query.get(get_jwt_identity()) or api.abort(404, 'User not found')
        org = Organization.query.filter_by(admin_user_id=user.id).first()
        profile = marshal(user, user_model)
        profile['organization'] = {'id': org.id, 'name': org.name, 'status': org.status} if org else None
        return {'profile': profile}

    @jwt_required()
    @user_ns.expect(profile_update_parser)
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
    def get(self):
        args = pagination_parser.parse_args()
        items, pag = paginate(db.session.query(UserBookmark).join(Organization).filter(UserBookmark.user_id == get_jwt_identity(), Organization.status == 'approved').order_by(desc(UserBookmark.created_at)), args.page, args.per_page)
        return {'bookmarks': [{'id': b.id, 'created_at': b.created_at.isoformat(), 'notes': b.notes, 'organization': marshal(b.organization, organization_model)} for b in items], 'pagination': pag}

    @jwt_required()
    @user_ns.expect(bookmark_create_parser)
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
    def get(self):
        args = pagination_parser.parse_args()
        items, pag = paginate(Notification.query.filter_by(user_id=get_jwt_identity()).order_by(desc(Notification.created_at)), args.page, args.per_page)
        return {'notifications': [{'id': n.id, 'message': n.message, 'is_read': n.is_read, 'created_at': n.created_at.isoformat()} for n in items], 'pagination': pag}

@notification_ns.route('/<int:notification_id>/read')
class NotificationRead(Resource):
    @jwt_required()
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
    def get(self):
        return {'unread_count': Notification.query.filter_by(user_id=get_jwt_identity(), is_read=False).count()}

# ADVERTISEMENTS
@ad_ns.route('')
class AdvertisementList(Resource):
    @ad_ns.expect(ad_parser)
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
    def get(self, org_id):
        org = check_org_admin(org_id, get_jwt_identity())
        args = contact_messages_parser.parse_args()
        query = ContactMessage.query.filter_by(organization_id=org_id)
        if args.status: query = query.filter(ContactMessage.is_read == (args.status == 'read'))
        items, pag = paginate(query.order_by(desc(ContactMessage.created_at)), args.page, args.per_page)
        return {'messages': [{'id': m.id, 'sender_name': m.sender_name, 'sender_email': m.sender_email, 'subject': m.subject, 'message': m.message, 'is_read': m.is_read, 'created_at': m.created_at.isoformat() if m.created_at else None, 'read_at': m.read_at.isoformat() if m.read_at else None} for m in items], 'pagination': pag, 'organization': {'id': org.id, 'name': org.name}}

    @org_ns.expect(contact_message_parser)
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
    def get(self):
        try:
            db.session.execute(text('SELECT 1'))
            return {'status': 'healthy', 'timestamp': datetime.utcnow().isoformat(), 'database': 'connected'}
        except Exception as e:
            return {'status': 'unhealthy', 'timestamp': datetime.utcnow().isoformat(), 'database': 'disconnected', 'error': str(e)}, 503

# Export the blueprint for use in app.py
__all__ = ['api_bp']
