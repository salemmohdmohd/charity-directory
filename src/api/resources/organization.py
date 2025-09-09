from flask_restx import Resource, marshal
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..core import api
from ..schemas import org_parser, org_create_parser, organization_model
from ..models import db, Organization, Category, User
from sqlalchemy import or_, desc
from sqlalchemy.orm import joinedload
from ..utils import paginate, serialize_organization, log_action

org_ns = api.namespace('organizations', description='Organization operations')

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
            query = Organization.query.options(
                joinedload(Organization.photos),
                joinedload(Organization.social_links),
                joinedload(Organization.category),
                joinedload(Organization.location)
            )
            if args.status: query = query.filter(Organization.status == args.status)
            else: query = query.filter(Organization.status == 'approved')
            if args.category_id: query = query.filter(Organization.category_id == args.category_id)
            if args.location_id: query = query.filter(Organization.location_id == args.location_id)
            if args.search:
                s = f"%{args.search}%"
                query = query.filter(or_(Organization.name.ilike(s), Organization.description.ilike(s), Organization.mission.ilike(s)))

            items, pag = paginate(query.order_by(desc(Organization.created_at)), args.page, args.per_page)
            return {'organizations': [serialize_organization(o) for o in items], 'pagination': pag}
        except Exception: org_ns.abort(500, 'Failed to fetch organizations')

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
            if Organization.query.filter_by(admin_user_id=uid).first(): org_ns.abort(409, 'You already have an organization')
            if not Category.query.get(args.category_id): org_ns.abort(400, 'Invalid category')

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
            org_ns.abort(500, 'Failed to create organization')

@org_ns.route('/<int:org_id>')
class OrganizationDetail(Resource):
    @org_ns.doc(responses={
        200: 'Organization details retrieved successfully',
        404: 'Organization not found',
        500: 'Failed to fetch organization'
    })
    def get(self, org_id):
        try:
            org = Organization.query.options(
                joinedload(Organization.photos),
                joinedload(Organization.social_links),
                joinedload(Organization.category),
                joinedload(Organization.location)
            ).get(org_id) or org_ns.abort(404, 'Organization not found')

            is_admin = False
            try:
                uid = get_jwt_identity()
                if uid:
                    user = User.query.get(uid)
                    if user: is_admin = user.role in ['platform_admin', 'org_admin']
            except Exception: pass

            if org.status != 'approved' and not is_admin: org_ns.abort(404, 'Organization not found')

            org.view_count = (org.view_count or 0) + 1
            db.session.commit()

            return serialize_organization(org)
        except Exception as e:
            print(f"Error in organization detail: {e}")
            org_ns.abort(500, f'Failed to fetch organization: {str(e)}')

@org_ns.route('/<int:org_id>/contact')
class OrganizationContact(Resource):
    def get(self, org_id):
        org = Organization.query.filter_by(id=org_id, status='approved').first() or org_ns.abort(404, 'Organization not found')
        return {'contact': {'name': org.name, 'email': org.email, 'phone': org.phone, 'address': org.address, 'website': org.website}}

from flask import url_for
from flask_restx import Resource, marshal
from flask_jwt_extended import jwt_required, get_jwt_identity
# ... existing code ...
@org_ns.route('/<int:org_id>/photos')
class OrganizationPhotos(Resource):
    @org_ns.doc(responses={
# ... existing code ...
    })
    def get(self, org_id):
        try:
            org = Organization.query.get(org_id) or org_ns.abort(404, 'Organization not found')

            serialized_photos = []
            for p in org.photos:
                # Prioritize external file_path, fall back to local file_name
                photo_url = p.file_path if p.file_path else url_for('uploaded_file', filename=p.file_name, _external=True)
                serialized_photos.append({
                    'id': p.id,
                    'url': photo_url,
                    'alt_text': p.alt_text
                })
            return serialized_photos
        except Exception:
            org_ns.abort(500, 'Failed to fetch photos')
