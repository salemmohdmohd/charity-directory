"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory, render_template
from markupsafe import escape
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_login import LoginManager
from flask_mail import Mail
from datetime import timedelta
from api.utils import APIException, generate_sitemap
from api.decorators import login_required_hybrid
from api.models import db
from api.routes import api_bp
from api.admin import setup_admin
from api.commands import setup_commands
# seed_all removed from direct imports; seeding should be run via CLI when needed
from dotenv import load_dotenv


# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
template_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'templates')
app = Flask(__name__, template_folder=template_dir)
app.url_map.strict_slashes = False

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv('FRONTEND_URL'),
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True  # Enable credentials for sessions
    }
})

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2)  # Shorter expiry for security
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)  # Refresh tokens expire in 30 days

# Environment-based security configuration
if ENV == "production":
    # Enable CSRF protection in production
    app.config['JWT_CSRF_IN_COOKIES'] = True
    app.config['JWT_CSRF_CHECK_FORM'] = True
    app.config['JWT_COOKIE_SECURE'] = True  # HTTPS only in production
    app.config['JWT_COOKIE_CSRF_PROTECT'] = True
else:
    # Disable CSRF for development simplicity
    app.config['JWT_CSRF_IN_COOKIES'] = False
    app.config['JWT_CSRF_CHECK_FORM'] = False
    app.config['JWT_COOKIE_SECURE'] = False

# Token location and security
app.config['JWT_TOKEN_LOCATION'] = ['headers']  # Accept tokens in Authorization header
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Blacklist support for logout functionality
app.config['JWT_BLACKLIST_ENABLED'] = True
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']

jwt = JWTManager(app)

# Token blacklist implementation
# NOTE: In production, replace this with Redis for better performance and persistence
# Example: redis_client = redis.Redis(host='localhost', port=6379, db=0)
blacklisted_tokens = set()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    """Check if token is in blacklist"""
    jti = jwt_payload['jti']  # JWT ID
    return jti in blacklisted_tokens

def blacklist_token(jti):
    """Add token to blacklist"""
    blacklisted_tokens.add(jti)

# Make blacklist function available to other modules
app.blacklist_token = blacklist_token

# JWT Error Handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return {'message': 'Token has expired', 'error': 'token_expired'}, 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return {'message': 'Invalid token', 'error': 'invalid_token'}, 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    return {'message': 'Authorization token is required', 'error': 'token_required'}, 401

@jwt.needs_fresh_token_loader
def token_not_fresh_callback(jwt_header, jwt_payload):
    return {'message': 'Fresh token required', 'error': 'fresh_token_required'}, 401

@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return {'message': 'Token has been revoked', 'error': 'token_revoked'}, 401

@jwt.user_identity_loader
def user_identity_lookup(user):
    return user

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return identity

# Configure Flask Session for OAuth
app.config['SECRET_KEY'] = os.getenv('FLASK_APP_KEY', 'your-secret-key-for-sessions')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to False for localhost development
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Keep secure
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Allow cross-site requests

# Initialize Flask-Session
try:
    from flask_session import Session
    Session(app)
except ImportError:
    print("Warning: Flask-Session not installed. Using default Flask session handling.")
    # Default Flask sessions will still work for OAuth

# Configure Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'  # Redirect to login page when login required
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    """Load user for Flask-Login sessions"""
    from api.models import User
    return User.query.get(int(user_id))

# Configure Flask-Mail/ still need configuration... see .env
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL')
mail = Mail(app)

load_dotenv()

# database condiguration
db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise ValueError("DATABASE_URL environment variable is required")
app.config['SQLALCHEMY_DATABASE_URI'] = db_url

# Define the upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True) # Ensure the folder exists

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# add the admin
setup_admin(app)

# Setup custom commands
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api_bp, url_prefix='/api')

# Protect API documentation
@app.before_request
def protect_api_docs():
    """Protect API documentation behind authentication"""
    from flask_login import current_user
    if request.path.startswith('/api/docs/') or request.path == '/api/docs':
        if not current_user.is_authenticated:
            from flask import redirect, url_for
            return redirect(url_for('login'))

# Health check endpoint
@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'message': 'API is running'}), 200

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Also handle /api/uploads/ for frontend compatibility
@app.route('/api/uploads/<path:filename>')
def api_uploaded_file(filename):
    # If the path already has /uploads/ in it, we need to extract just the filename
    if filename.startswith('uploads/'):
        filename = filename.replace('uploads/', '')
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Handle/serialize errors like a JSON object
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints

@app.route('/login')
def login():
    """Login page for web authentication"""
    from flask import render_template
    return render_template('login.html')

@app.route('/logout')
def logout():
    """Logout route"""
    from flask_login import logout_user
    from flask import redirect, url_for, flash
    logout_user()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('login'))

@app.route('/sitemap')
@login_required_hybrid
def sitemap():
    """Protected sitemap endpoint - now requires authentication"""
    return generate_sitemap(app)


@app.route('/sitemap.xml')
def public_sitemap_xml():
    """Public sitemap XML including organization pages."""
    # Attempt to generate a basic sitemap using app.url_map and organization IDs
    try:
        from api.models import Organization
        from xml.etree.ElementTree import Element, SubElement, tostring
        root = Element('urlset', xmlns='http://www.sitemaps.org/schemas/sitemap/0.9')
        # Add homepage
        url = SubElement(root, 'url')
        loc = SubElement(url, 'loc')
        loc.text = request.url_root.rstrip('/')

        # add each approved organization
        orgs = Organization.query.filter_by(status='approved').all()
        for o in orgs:
            u = SubElement(root, 'url')
            loc = SubElement(u, 'loc')
            slug = (o.name or '').lower().replace(' ', '-')
            path = f"/organizations/{o.id}-{slug}"
            loc.text = f"{request.url_root.rstrip('/')}{path}"

            # lastmod (use updated_at or created_at)
            last = getattr(o, 'updated_at', None) or getattr(o, 'created_at', None)
            if last:
                lastmod = SubElement(u, 'lastmod')
                lastmod.text = last.strftime('%Y-%m-%d')

            # changefreq heuristic: frequent for verified orgs, monthly otherwise
            cf = SubElement(u, 'changefreq')
            cf.text = 'weekly' if getattr(o, 'is_verified', False) else 'monthly'

            # priority heuristic: higher for verified organizations
            pr = SubElement(u, 'priority')
            pr.text = '0.8' if getattr(o, 'is_verified', False) else '0.5'

        xml_str = tostring(root, encoding='utf-8', method='xml')
        return app.response_class(xml_str, mimetype='application/xml')
    except Exception as e:
        return generate_sitemap(app)


@app.route('/robots.txt')
def robots_txt():
    """Provide robots.txt optimized for AI crawlers while protecting sensitive paths."""
    lines = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin/',
        'Disallow: /api/docs/',
        'Disallow: /api/notifications',
        '',
        'User-agent: Googlebot',
        'Allow: /',
        '',
        'User-agent: *-ai',
        'Allow: /'
    ]
    return app.response_class('\n'.join(lines), mimetype='text/plain')


@app.route('/api/docs/ai')
def api_docs_ai():
    """Human-readable AI integration notes and example usage for LLMs."""
    docs = {
        'ai_search': {
            'endpoint': '/api/organizations/ai-search?q=<query>&limit=10',
            'description': 'Returns concise organization summaries optimized for LLM consumption (JSON array of {id,name,summary,category,location,website,url}).'
        },
        'org_summary': {
            'endpoint': '/api/organizations/<id>/summary',
            'description': 'Returns plain_text_summary and structured JSON about a single organization for knowledge ingestion.'
        },
        'notes': 'Prefer GET requests without authentication for public organizations. Rate limit as needed.'
    }
    return jsonify(docs)


@app.route('/prerender/organizations/<int:org_id>')
def prerender_organization(org_id):
    """Return a small server-rendered HTML snippet with meta tags and JSON-LD for bots.

    This keeps the payload minimal and is intended for crawlers and LLM scrapers that
    do not execute client-side JavaScript. It mirrors key fields from the Organization
    model and normalizes image URLs to the /api/uploads/ route when necessary.
    """
    try:
        from api.models import Organization
        o = Organization.query.get(org_id)
        if not o or getattr(o, 'status', '') != 'approved':
            return app.response_class('Not Found', status=404)

        # Build basic fields with safe fallbacks
        name = o.name or ''
        description = (getattr(o, 'description', None) or getattr(o, 'mission', '') or '')
        description = description.strip()[:300]  # keep it short
        website = getattr(o, 'website', '') or ''

        # Select image: prefer logo_url, otherwise first OrganizationPhoto.file_path or file_name
        image = ''
        if getattr(o, 'logo_url', None):
            image = o.logo_url
        else:
            photos = getattr(o, 'photos', None) or []
            if isinstance(photos, (list, tuple)) and photos:
                first = photos[0]
                # OrganizationPhoto has file_path and file_name
                if hasattr(first, 'file_path') and first.file_path:
                    image = first.file_path
                elif hasattr(first, 'file_name') and first.file_name:
                    image = first.file_name

        # Normalize image path: if DB stored "/ads/..." or "uploads/...", map to /api/uploads/<filename>
        def normalize_image_url(img):
            if not img:
                return ''
            # If it already looks like an absolute URL, return as-is
            if isinstance(img, str) and (img.startswith('http://') or img.startswith('https://')):
                return img
            # Strip leading slash if present
            candidate = img.lstrip('/') if isinstance(img, str) else ''
            # If candidate now looks like an absolute URL, return original img
            if candidate.startswith('http://') or candidate.startswith('https://'):
                return img
            # Otherwise treat last path segment as filename and serve via api_uploaded_file
            filename = candidate.split('/')[-1] if candidate else ''
            if not filename:
                return ''
            return url_for('api_uploaded_file', filename=filename, _external=True)

        image_url = normalize_image_url(image)

        # JSON-LD
        jsonld = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": name,
            "description": description,
        }
        if website:
            jsonld["url"] = website
        if image_url:
            jsonld["logo"] = image_url

        # Minimal HTML payload with meta tags and JSON-LD script
        html_parts = [
            '<!doctype html>',
            '<html lang="en">',
            '<head>',
            f'  <meta charset="utf-8">',
            f'  <title>{escape(name) if name else "Organization"}</title>',
            f'  <meta name="description" content="{escape(description)}">',
        ]

        if image_url:
            html_parts.append(f'  <meta property="og:image" content="{image_url}">')
            html_parts.append(f'  <meta name="twitter:image" content="{image_url}">')

        if website:
            html_parts.append(f'  <link rel="canonical" href="{website}">')

        html_parts.append(f'  <script type="application/ld+json">')
        import json
        html_parts.append(json.dumps(jsonld))
        html_parts.append('  </script>')
        html_parts.append('</head>')
        html_parts.append('<body>')
        html_parts.append(f'<h1>{escape(name)}</h1>')
        if description:
            html_parts.append(f'<p>{escape(description)}</p>')
        html_parts.append('</body>')
        html_parts.append('</html>')

        content = '\n'.join(html_parts)
        return app.response_class(content, mimetype='text/html')
    except Exception:
        # In production, avoid leaking internals; return a generic 500.
        return app.response_class('Server Error', status=500)

@app.route('/')
def index():
    """Root route - redirect to admin dashboard or login"""
    from flask_login import current_user
    from flask import redirect, url_for

    # Serve the React frontend at the site root for unauthenticated users
    # and keep the admin/login experience under /backend
    if current_user.is_authenticated:
        # Authenticated users continue to the admin dashboard
        return redirect(url_for('admin.index'))
    else:
        # Serve the frontend index.html (SPA) at /
        try:
            return send_from_directory(static_file_dir, 'index.html')
        except Exception:
            # If the built frontend is missing, fallback to login page so site remains usable
            return redirect(url_for('login'))


@app.route('/backend')
@app.route('/backend/')
def backend_root():
    """Expose backend UI under /backend — redirect to admin or login as appropriate"""
    from flask_login import current_user
    from flask import redirect, url_for

    if current_user.is_authenticated:
        return redirect(url_for('admin.index'))
    return redirect(url_for('login'))

@app.route('/app')
@app.route('/frontend')
def frontend():
    """Serve the React frontend application"""
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 5000))
    # Enable debug only when explicitly requested via FLASK_DEBUG=1
    run_debug = True if os.getenv('FLASK_DEBUG') == '1' else False
    app.run(host='0.0.0.0', port=PORT, debug=run_debug)
