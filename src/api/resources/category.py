from flask_restx import Resource, reqparse
from flask import current_app
from ..models import db, Category, Organization
from ..core import api
from ..schemas import pagination_parser
from ..utils import paginate, serialize_organization
from sqlalchemy import desc, func, or_

category_ns = api.namespace('categories', description='Category operations')

# Parser for the include_organizations parameter
category_list_parser = reqparse.RequestParser()
category_list_parser.add_argument('include_organizations', type=bool, default=False, help='Include organizations for each category')
category_list_parser.add_argument('per_page', type=int, default=3, help='Number of organizations per category to return')


@category_ns.route('')
class CategoryList(Resource):
    @category_ns.expect(category_list_parser)
    @category_ns.doc(responses={200: 'List of categories retrieved successfully'})
    def get(self):
        """
        Get a list of all categories.
        Can optionally include a preview of organizations for each category.
        """
        try:
            args = category_list_parser.parse_args()
            include_orgs = args['include_organizations']
            per_page = args['per_page']

            query = Category.query.order_by(Category.sort_order, Category.name)

            if include_orgs:
                # Using joinedload to efficiently fetch organizations
                from sqlalchemy.orm import joinedload
                query = query.options(joinedload(Category.organizations))

            categories = query.all()

            result = []
            for c in categories:
                category_data = {
                    'id': c.id,
                    'name': c.name,
                    'description': c.description,
                    'icon_url': c.icon_url,
                    'color_code': c.color_code,
                    'organization_count': len([o for o in c.organizations if o.status == 'approved'])
                }

                if include_orgs:
                    # Filter for approved organizations and limit the number
                    approved_orgs = [o for o in c.organizations if o.status == 'approved']
                    # Sort by creation date to get the latest ones
                    sorted_orgs = sorted(approved_orgs, key=lambda o: o.created_at, reverse=True)
                    category_data['organizations'] = [serialize_organization(o) for o in sorted_orgs[:per_page]]

                result.append(category_data)

            return result
        except Exception as e:
            # Log full traceback to server logs for triage (Render captures stdout/stderr)
            current_app.logger.exception('Failed to retrieve categories')
            api.abort(500, 'Failed to retrieve categories')

@category_ns.route('/<int:category_id>/organizations')
class CategoryOrganizations(Resource):
    @category_ns.expect(pagination_parser)
    @category_ns.doc(responses={
        200: 'Organizations in category retrieved successfully',
        404: 'Category not found'
    })
    def get(self, category_id):
        from sqlalchemy.orm import joinedload
        cat = Category.query.get(category_id) or category_ns.abort(404, 'Category not found')
        args = pagination_parser.parse_args()
        query = Organization.query.options(
            joinedload(Organization.photos),
            joinedload(Organization.social_links),
            joinedload(Organization.category),
            joinedload(Organization.location)
        ).filter_by(category_id=category_id, status='approved')
        items, pag = paginate(query.order_by(desc(Organization.created_at)), args.page, args.per_page)
        return {'category': {'id': cat.id, 'name': cat.name, 'description': cat.description}, 'organizations': [serialize_organization(o) for o in items], 'pagination': pag}

@category_ns.route('/slug/<string:slug>')
class CategoryBySlug(Resource):
    @category_ns.expect(pagination_parser)
    @category_ns.doc(responses={
        200: 'Category and organizations retrieved successfully',
        404: 'Category not found'
    })
    def get(self, slug):
        """
        Get a single category and its organizations by slug.
        This endpoint is designed to be flexible and find a category
        based on a URL-friendly slug.
        """
        # First, try a direct match on the slugified name
        # This is the most common case, e.g., 'health-care' for 'Health Care'
        search_term = slug.replace('-', ' ')
        cat = Category.query.filter(func.lower(Category.name) == search_term).first()

        # If not found, try matching without spaces (e.g., 'healthcare')
        if not cat:
            cat = Category.query.filter(func.lower(Category.name) == slug).first()

        # If still not found, abort
        if not cat:
            category_ns.abort(404, f"Category with slug '{slug}' not found")

        args = pagination_parser.parse_args()

        from sqlalchemy.orm import joinedload
        query = Organization.query.options(
            joinedload(Organization.photos),
            joinedload(Organization.social_links),
            joinedload(Organization.category),
            joinedload(Organization.location)
        ).filter_by(category_id=cat.id, status='approved')

        items, pag = paginate(query.order_by(desc(Organization.created_at)), args.page, args.per_page)

        return {
            'category': {
                'id': cat.id,
                'name': cat.name,
                'description': cat.description,
                'icon_url': cat.icon_url,
                'color_code': cat.color_code,
            },
            'organizations': [serialize_organization(o) for o in items],
            'pagination': pag
        }
