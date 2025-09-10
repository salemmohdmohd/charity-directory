from flask import Blueprint
from .core import api

# Import namespaces from resource files
from .resources.auth import auth_ns
from .resources.organization import org_ns
from .resources.category import category_ns
from .resources.location import location_ns
from .resources.search import search_ns
from .resources.user import users_ns
from .resources.advertisement import ad_ns
from .resources.notification import notification_ns
from .resources.bulk_notification_routes import bulk_ns
from .resources.notification_preferences_routes import prefs_ns
from .resources.org_signup import org_signup_ns
from .resources.uploads import uploads_ns

# Create the API blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Initialize the API with the blueprint
api.init_app(api_bp)

# Add all the namespaces to the API
api.add_namespace(auth_ns)
api.add_namespace(org_ns)
api.add_namespace(category_ns)
api.add_namespace(location_ns)
api.add_namespace(search_ns)
api.add_namespace(users_ns)
api.add_namespace(ad_ns)
api.add_namespace(notification_ns, path='/notifications')
api.add_namespace(bulk_ns, path='/notifications/bulk')
api.add_namespace(prefs_ns, path='/notifications/preferences')
api.add_namespace(org_signup_ns)
api.add_namespace(uploads_ns)
