from flask_restx import fields, reqparse, inputs
from werkzeug.datastructures import FileStorage
from .core import api

# =====================================================================================
# --------------------------------- RESPONSE MODELS ---------------------------------
# =====================================================================================

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
    'id': fields.Integer(description='Notification ID'),
    'title': fields.String(description='Notification title'),
    'message': fields.String(description='Notification message'),
    'notification_type': fields.String(description='Type of notification'),
    'priority': fields.String(description='Notification priority'),
    'is_read': fields.Boolean(description='Whether notification is read'),
    'read_at': fields.DateTime(description='When notification was read'),
    'email_sent': fields.Boolean(description='Whether email was sent'),
    'email_sent_at': fields.DateTime(description='When email was sent'),
    'created_at': fields.DateTime(description='When notification was created'),
    'updated_at': fields.DateTime(description='When notification was last updated')
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


# =====================================================================================
# --------------------------------- REQUEST PARSERS ---------------------------------
# =====================================================================================

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
org_signup_parser = api.parser()
org_signup_parser.add_argument('admin_name', type=str, required=True, help='Admin full name', location='form')
org_signup_parser.add_argument('admin_email', type=str, required=True, help='Admin email address', location='form')
org_signup_parser.add_argument('password', type=str, required=True, help='Admin password', location='form')
org_signup_parser.add_argument('organization_name', type=str, required=True, help='Organization name', location='form')
org_signup_parser.add_argument('mission', type=str, required=True, help='Mission statement', location='form')
org_signup_parser.add_argument('category_id', type=int, required=True, help='Category ID', location='form')
org_signup_parser.add_argument('phone', type=str, help='Phone number', location='form')
org_signup_parser.add_argument('website', type=str, help='Website URL', location='form')
org_signup_parser.add_argument('address', type=str, help='Address', location='form')
org_signup_parser.add_argument('city', type=str, help='City', location='form')
org_signup_parser.add_argument('state', type=str, help='State/Province', location='form')
org_signup_parser.add_argument('country', type=str, help='Country', location='form')
# Enhanced fields
org_signup_parser.add_argument('description', type=str, help='Organization description', location='form')
org_signup_parser.add_argument('email', type=str, help='Organization email', location='form')
org_signup_parser.add_argument('donation_link', type=str, help='Donation link', location='form')
org_signup_parser.add_argument('established_year', type=int, help='Year established', location='form')
org_signup_parser.add_argument('operating_hours', type=str, help='Operating hours', location='form')
# File uploads
org_signup_parser.add_argument('logo', location='files', type=FileStorage, help='Organization logo')
org_signup_parser.add_argument('gallery', location='files', action='append', type=FileStorage, help='Gallery images')
# Agreements
org_signup_parser.add_argument('agreeToTerms', type=inputs.boolean, required=True, help='You must agree to the terms and conditions', location='form')
org_signup_parser.add_argument('verifyInformation', type=inputs.boolean, required=True, help='You must verify that the information is accurate', location='form')


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

user_profile_model = api.model('UserProfile', {
    'id': fields.Integer(readonly=True, description='The user unique identifier'),
    'email': fields.String(required=True, description='The user email address'),
    'role': fields.String(readonly=True, description='The user role'),
    'full_name': fields.String(description='The user full name'),
    'profile_picture': fields.String(description='URL to the user profile picture'),
    'bio': fields.String(description='A short bio of the user'),
    'is_verified': fields.Boolean(readonly=True, description='Is the user email verified'),
    'created_at': fields.DateTime(readonly=True, description='User creation timestamp'),
    'updated_at': fields.DateTime(readonly=True, description='User last update timestamp'),
    'last_login': fields.DateTime(readonly=True, description='User last login timestamp')
})

user_activity_model = api.model('UserActivity', {
    'id': fields.Integer(readonly=True),
    'timestamp': fields.DateTime(readonly=True),
    'activity_type': fields.String(required=True),
    'details': fields.String()
})

user_bookmarks_model = api.model('UserBookmarks', {
    'id': fields.Integer(readonly=True),
    'organization_id': fields.Integer(required=True),
    'created_at': fields.DateTime(readonly=True)
})

user_donations_model = api.model('UserDonations', {
    'id': fields.Integer(readonly=True),
    'organization_id': fields.Integer(required=True),
    'amount': fields.Float(required=True),
    'currency': fields.String(required=True, default='USD'),
    'created_at': fields.DateTime(readonly=True)
})

user_reviews_model = api.model('UserReviews', {
    'id': fields.Integer(readonly=True),
    'organization_id': fields.Integer(required=True),
    'rating': fields.Integer(required=True),
    'comment': fields.String(),
    'created_at': fields.DateTime(readonly=True)
})

user_notifications_model = api.model('UserNotifications', {
    'id': fields.Integer(readonly=True),
    'message': fields.String(required=True),
    'is_read': fields.Boolean(default=False),
    'created_at': fields.DateTime(readonly=True)
})

user_settings_model = api.model('UserSettings', {
    'id': fields.Integer(readonly=True),
    'email_notifications': fields.Boolean(default=True),
    'push_notifications': fields.Boolean(default=True),
    'theme': fields.String(default='light')
})

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

advanced_search_parser = api.parser()
advanced_search_parser.add_argument('query', type=str, help='Search query for name or mission')
advanced_search_parser.add_argument('category', type=str, help='Category name')
advanced_search_parser.add_argument('location', type=str, help='Location string (city, state, or country)')
advanced_search_parser.add_argument('page', type=int, default=1, help='Page number')
advanced_search_parser.add_argument('per_page', type=int, default=10, help='Items per page')

search_suggestions_parser = api.parser()
search_suggestions_parser.add_argument('q', type=str, required=True, help='Search query')

ad_parser = api.parser()
ad_parser.add_argument('placement', type=str, help='Advertisement placement filter')
ad_parser.add_argument('ad_type', type=str, help='Advertisement type filter')
ad_parser.add_argument('limit', type=int, default=5, help='Max number of ads to return')

advertising_inquiry_parser = api.parser()
advertising_inquiry_parser.add_argument('organizationName', type=str, required=True, help='Organization name')
advertising_inquiry_parser.add_argument('contactName', type=str, required=True, help='Contact person name')
advertising_inquiry_parser.add_argument('email', type=str, required=True, help='Email address')
advertising_inquiry_parser.add_argument('phone', type=str, required=False, help='Phone number')
advertising_inquiry_parser.add_argument('organizationType', type=str, required=True, help='Organization type')
advertising_inquiry_parser.add_argument('website', type=str, required=False, help='Website URL')
advertising_inquiry_parser.add_argument('adPackage', type=str, required=True, help='Interested package')
advertising_inquiry_parser.add_argument('budget', type=str, required=False, help='Budget range')
advertising_inquiry_parser.add_argument('campaignGoals', type=str, required=False, help='Campaign goals')
advertising_inquiry_parser.add_argument('targetAudience', type=str, required=False, help='Target audience')
advertising_inquiry_parser.add_argument('message', type=str, required=False, help='Additional message')

contact_messages_parser = pagination_parser.copy()
contact_messages_parser.add_argument('status', type=str, help='Filter by read/unread status')
