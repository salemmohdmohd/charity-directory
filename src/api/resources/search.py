from flask import request
from flask_restx import Resource
from flask_jwt_extended import get_jwt_identity
from ..core import api
from ..schemas import search_parser, advanced_search_parser, search_suggestions_parser
from ..models import db, Organization, Category, Location, SearchHistory
from sqlalchemy import or_, desc, func
from sqlalchemy.orm import joinedload
from ..utils import paginate, serialize_organization
import json

search_ns = api.namespace('search', description='Search operations')

@search_ns.route('/organizations')
class OrganizationSearch(Resource):
    @search_ns.expect(search_parser)
    def get(self):
        try:
            args = search_parser.parse_args()
            query = Organization.query.options(
                joinedload(Organization.photos),
                joinedload(Organization.social_links),
                joinedload(Organization.category),
                joinedload(Organization.location)
            ).filter(Organization.status == 'approved')
            if args.q:
                search_term = f"%{args.q}%"
                query = query.join(Organization.category).join(Organization.location).filter(
                    or_(
                        Organization.name.ilike(search_term),
                        Organization.mission.ilike(search_term),
                        Organization.description.ilike(search_term),
                        Category.name.ilike(search_term),
                        Location.city.ilike(search_term),
                        Location.state_province.ilike(search_term)
                    )
                )
            if args.category_id: query = query.filter(Organization.category_id == args.category_id)
            if args.location_id: query = query.filter(Organization.location_id == args.location_id)
            if args.verification_level: query = query.filter(Organization.verification_level == args.verification_level)

            items, pag = paginate(query.order_by(desc(Organization.bookmark_count), desc(Organization.view_count), desc(Organization.created_at)), args.page, args.per_page)

            try:
                uid = get_jwt_identity()
                if uid and args.q:
                    db.session.add(SearchHistory(user_id=uid, search_query=args.q, filters_applied=json.dumps({'category_id': args.category_id, 'location_id': args.location_id, 'verification_level': args.verification_level}), results_count=pag['total'], ip_address=request.remote_addr))
                    db.session.commit()
            except Exception:
                pass

            return {'results': [serialize_organization(o) for o in items], 'pagination': pag, 'search_meta': {'query': args.q, 'filters': {'category_id': args.category_id, 'location_id': args.location_id, 'verification_level': args.verification_level}}}
        except Exception: search_ns.abort(500, 'Search failed')

@search_ns.route('/organizations/advanced')
class AdvancedOrganizationSearch(Resource):
    @search_ns.expect(advanced_search_parser)
    @search_ns.doc(responses={
        200: 'Advanced search results retrieved successfully',
        500: 'Advanced search failed'
    })
    def get(self):
        try:
            args = advanced_search_parser.parse_args()
            query_param = args.get('query')
            category_name = args.get('category')
            location_query = args.get('location')
            page = args.get('page')
            per_page = args.get('per_page')

            base_query = Organization.query.options(
                db.joinedload(Organization.category),
                db.joinedload(Organization.location),
                db.joinedload(Organization.photos),
                db.joinedload(Organization.social_links)
            ).filter(Organization.status == 'approved')

            if query_param:
                search_term = f"%{query_param}%"
                base_query = base_query.filter(
                    or_(
                        Organization.name.ilike(search_term),
                        Organization.mission.ilike(search_term),
                        Organization.description.ilike(search_term)
                    )
                )

            if category_name and category_name.lower() != 'all':
                base_query = base_query.join(Category).filter(func.lower(Category.name) == func.lower(category_name))

            if location_query:
                location_term = f"%{location_query}%"
                base_query = base_query.join(Location).filter(
                    or_(
                        Location.city.ilike(location_term),
                        Location.state_province.ilike(location_term),
                        Location.country.ilike(location_term)
                    )
                )

            paginated_query = base_query.order_by(
                desc(Organization.view_count),
                desc(Organization.created_at)
            )

            items, pag = paginate(paginated_query, page, per_page)

            results = [serialize_organization(org) for org in items]

            return {
                'results': results,
                'pagination': pag,
                'search_meta': {
                    'query': query_param,
                    'filters': {
                        'category': category_name,
                        'location': location_query
                    }
                }
            }, 200
        except Exception as e:
            # current_app.logger.error(f"Advanced search failed: {e}")
            search_ns.abort(500, 'Advanced search failed')

@search_ns.route('/suggestions')
class SearchSuggestions(Resource):
    @search_ns.expect(search_suggestions_parser)
    def get(self):
        args = search_suggestions_parser.parse_args()
        q = args.q.strip()
        if len(q) < 2:
            return {'organizations': [], 'categories': [], 'locations': []}

        term = f"%{q}%"

        orgs = Organization.query.filter(
            Organization.status == 'approved',
            Organization.name.ilike(term)
        ).order_by(desc(Organization.view_count)).limit(5).all()

        cats = Category.query.filter(
            Category.is_active == True,
            Category.name.ilike(term)
        ).limit(3).all()

        locs = Location.query.filter(
            Location.is_active == True,
            or_(Location.city.ilike(term), Location.state_province.ilike(term))
        ).limit(3).all()

        return {
            'organizations': [{'id': o.id, 'name': o.name} for o in orgs],
            'categories': [{'id': c.id, 'name': c.name} for c in cats],
            'locations': [{'id': l.id, 'display_name': f"{l.city}, {l.state_province}"} for l in locs]
        }
class SearchSuggestions(Resource):
    @search_ns.expect(search_suggestions_parser)
    def get(self):
        try:
            args = search_suggestions_parser.parse_args()
            q = args.q.strip()
            if len(q) < 2: return {'suggestions': []}

            orgs = [o.name for o in db.session.query(Organization.name).filter(
                Organization.status == 'approved',
                Organization.name.ilike(f"%{q}%")
            ).limit(5)]

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
