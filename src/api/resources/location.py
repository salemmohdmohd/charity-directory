from flask_restx import Resource
from ..core import api
from ..schemas import location_search_parser, location_model
from ..models import db, Location, Organization
from sqlalchemy import or_

location_ns = api.namespace('locations', description='Location operations')

@location_ns.route('')
class LocationList(Resource):
    @location_ns.doc(responses={200: 'List of locations retrieved successfully'})
    def get(self):
        locations = Location.query.filter_by(is_active=True).all()
        result = []
        for loc in locations:
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
        if len(q) < 2: location_ns.abort(400, 'Query must be at least 2 characters')
        locs = Location.query.filter(Location.is_active == True, or_(Location.city.ilike(f"%{q}%"), Location.state_province.ilike(f"%{q}%"), Location.country.ilike(f"%{q}%"))).limit(20).all()
        return {'locations': [{'id': l.id, 'city': l.city, 'state_province': l.state_province, 'country': l.country, 'display_name': f"{l.city}, {l.state_province}, {l.country}"} for l in locs]}
