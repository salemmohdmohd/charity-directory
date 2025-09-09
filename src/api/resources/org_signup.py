from flask_restx import Resource
from ..models import Category
from ..core import api

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
