from flask import jsonify, url_for
from flask_restx import Api

class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)

def generate_sitemap(app):
    """Generate API sitemap - redirects to Swagger with quick links"""
    links = []
    for rule in app.url_map.iter_rules():
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/docs/" not in url and "/admin/" not in url:
                links.append(url)

    links_html = "".join(["<li><a href='" + y + "'>" + y + "</a></li>" for y in links])
    return f"""
        <div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
        <h1>Charity Directory API</h1>

        <div style="margin: 30px 0;">
            <h2>🚀 Quick Access</h2>
            <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 20px 0;">
                <a href="/api/docs/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    📖 API Documentation (Swagger)
                </a>
                <a href="/admin/" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    ⚙️ Admin Panel
                </a>
                <a href="/" style="background: #17a2b8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    🌐 Frontend App
                </a>
            </div>
        </div>



        <details style="margin-top: 30px;">
            <summary style="cursor: pointer; font-weight: bold;">📋 All Available Endpoints</summary>
            <ul style="text-align: left; margin: 20px 0;">{links_html}</ul>
        </details>

        <p style="margin-top: 30px; color: #666; font-size: 12px;">
            API HOST: <script>document.write('<input style="padding: 5px; width: 300px; text-align: center;" type="text" value="'+window.location.href+'" readonly />');</script>
        </p>
        </div>"""
