from flask import request, current_app
from flask_restx import Resource, marshal
from flask_jwt_extended import create_access_token, create_refresh_token
from werkzeug.utils import secure_filename
import os
import uuid
from ..models import db, User, Category, Organization, OrganizationPhoto
from ..core import api
from ..schemas import org_signup_parser, user_model, organization_model
from ..auth_utils import validate_email_format, validate_password
from ..utils import log_action

# Create a new namespace for this specific endpoint to keep it organized
org_signup_ns = api.namespace('org-signup', description='Operations for organization signup')

@org_signup_ns.route('/categories')
class SimpleCategoryList(Resource):
    @org_signup_ns.doc(responses={200: 'Simple list of categories retrieved successfully'})
    def get(self):
        """
        Get a simplified list of all categories for the organization signup form.
        """
        try:
            # Query only the id and name fields for efficiency
            categories = Category.query.with_entities(Category.id, Category.name).order_by(Category.name).all()

            # Format the data into a simple list of objects
            result = [{'id': c.id, 'name': c.name} for c in categories]

            return {'categories': result}, 200
        except Exception as e:
            # Log the error for debugging
            api.logger.error(f"Failed to fetch simple category list: {e}")
            # Return a standard error response
            return {'message': 'Could not retrieve category list.'}, 500

@org_signup_ns.route('/')
class OrganizationSignup(Resource):
    @org_signup_ns.expect(org_signup_parser)
    @org_signup_ns.doc(responses={
        201: 'Organization and admin account created successfully',
        400: 'Validation error',
        409: 'Email already registered',
        500: 'Registration failed'
    })
    def post(self):
        try:
            args = org_signup_parser.parse_args()
            email = args.admin_email.strip().lower()

            if not (valid := validate_email_format(email))[0]:
                org_signup_ns.abort(400, valid[1])

            if not (valid := validate_password(args.password))[0]:
                org_signup_ns.abort(400, valid[1])

            if User.query.filter_by(email=email).first():
                org_signup_ns.abort(409, 'Email already registered')

            if not Category.query.get(args.category_id):
                org_signup_ns.abort(400, 'Invalid category')

            user = User(
                name=args.admin_name.strip(),
                email=email,
                role='org_admin',
                is_verified=True
            )
            user.set_password(args.password)
            db.session.add(user)
            db.session.flush()

            # Handle file uploads
            logo_filename = None
            if 'logo' in request.files:
                logo_file = request.files['logo']
                if logo_file:
                    logo_filename = secure_filename(f"{uuid.uuid4()}_{logo_file.filename}")
                    logo_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], logo_filename))

            org = Organization(
                name=args.organization_name.strip(),
                mission=args.mission.strip(),
                description=args.get('description', '').strip(),
                category_id=args.category_id,
                email=args.get('email', '').strip() or email,
                phone=(args.phone or '').strip(),
                website=(args.website or '').strip(),
                address=(args.address or '').strip(),
                donation_link=args.get('donation_link', '').strip(),
                established_year=args.get('established_year'),
                operating_hours=args.get('operating_hours', '').strip(),
                admin_user_id=user.id,
                status='pending',
                logo_url=logo_filename
            )
            db.session.add(org)
            db.session.flush() # Flush to get org.id for photos

            if 'gallery' in request.files:
                gallery_files = request.files.getlist('gallery')
                for gallery_file in gallery_files:
                    if gallery_file:
                        gallery_filename = secure_filename(f"{uuid.uuid4()}_{gallery_file.filename}")
                        gallery_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], gallery_filename))
                        photo = OrganizationPhoto(
                            organization_id=org.id,
                            file_name=gallery_filename,
                            file_path=gallery_filename,
                            alt_text=f"Gallery image for {org.name}"
                        )
                        db.session.add(photo)

            db.session.commit()

            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={
                    'role': user.role,
                    'email': user.email,
                    'is_verified': user.is_verified
                }
            )
            refresh_token = create_refresh_token(identity=str(user.id))

            log_action(user.id, 'create', 'user', user.id, None, {'email': email, 'name': user.name, 'role': 'org_admin'})
            log_action(user.id, 'create', 'organization', org.id, None, {'name': org.name, 'status': 'pending'})

            try:
                from ..notification_service import NotificationService
                notification_service = NotificationService()
                notification_service.send_notification(
                    user_id=user.id,
                    notification_type="welcome",
                    subject=f"Welcome to Charity Directory, {user.name}!",
                    message=f"Welcome to Charity Directory! Your organization '{org.name}' has been submitted for review. You'll receive a notification once it's approved.",
                    priority="high"
                )
                notification_service.send_notification(
                    user_id=user.id,
                    notification_type="organization_update",
                    subject="Organization submitted for review",
                    message=f"Your organization '{org.name}' has been successfully submitted and is now under review. We'll notify you once the review is complete.",
                    priority="normal"
                )
            except Exception as e:
                print(f"Notification sending failed: {str(e)}")
                pass

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
            from werkzeug.exceptions import HTTPException
            if isinstance(e, HTTPException):
                raise e
            print(f"Organization signup error: {str(e)}")
            org_signup_ns.abort(500, f'Registration failed: {str(e)}')
