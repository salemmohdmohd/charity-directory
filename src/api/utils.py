from flask import jsonify, url_for, request
from flask_restx import Api
from flask_jwt_extended import get_jwt_identity
import json
from .models import db, AuditLog


def log_action(user_id, action_type, target_type=None, target_id=None, old_value=None, new_value=None):
    """Helper function to log an audit trail entry."""
    try:
        log = AuditLog(
            user_id=user_id,
            action_type=action_type,
            target_type=target_type,
            target_id=target_id,
            old_value=json.dumps(old_value) if old_value else None,
            new_value=json.dumps(new_value) if new_value else None,
            ip_address=request.remote_addr
        )
        db.session.add(log)
        # The commit will be handled by the calling function's final commit.
        # db.session.commit()
    except Exception as e:
        # Log the error but don't disrupt the main operation
        print(f"Error logging action: {e}")


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


def check_admin_role(user_id):
    """Check if user is platform admin"""
    from .models import User
    user = User.query.get(user_id)
    if not user or user.role != 'platform_admin':
        from flask_restx import abort
        abort(403, 'Admin access required')
    return user

def serialize_user(user):
    if not user: return None

    # Check if user administers any organizations and get the first one's ID
    organization_id = None
    if hasattr(user, 'administered_orgs') and user.administered_orgs:
        organization_id = user.administered_orgs[0].id if user.administered_orgs else None

    return {
        'id': user.id,
        'email': user.email,
        'role': user.role,
        'name': user.name,
        'profile_picture': user.profile_picture,
        'is_verified': user.is_verified,
        'created_at': user.created_at.isoformat(),
        'updated_at': user.updated_at.isoformat() if user.updated_at else None,
        'last_login': user.last_login.isoformat() if user.last_login else None,
        'organization_id': organization_id  # Add organization_id for frontend
    }

def serialize_activity(activity):
    if not activity: return None
    return {
        'id': activity.id,
        'timestamp': activity.timestamp.isoformat(),
        'activity_type': activity.activity_type,
        'details': activity.details
    }

def serialize_bookmark(bookmark):
    if not bookmark: return None
    return {
        'id': bookmark.id,
        'organization_id': bookmark.organization_id,
        'created_at': bookmark.created_at.isoformat()
    }

def serialize_donation(donation):
    if not donation: return None
    return {
        'id': donation.id,
        'organization_id': donation.organization_id,
        'amount': donation.amount,
        'currency': donation.currency,
        'created_at': donation.created_at.isoformat()
    }

def serialize_review(review):
    if not review: return None
    return {
        'id': review.id,
        'organization_id': review.organization_id,
        'rating': review.rating,
        'comment': review.comment,
        'created_at': review.created_at.isoformat()
    }

def serialize_notification(notification):
    if not notification: return None
    return {
        'id': notification.id,
        'message': notification.message,
        'is_read': notification.is_read,
        'created_at': notification.created_at.isoformat()
    }

def serialize_user_settings(settings):
    if not settings: return None
    return {
        'id': settings.id,
        'email_notifications': settings.email_notifications,
        'push_notifications': settings.push_notifications,
        'theme': settings.theme
    }

def serialize_location(location):
    """Helper function to serialize a location object."""
    if not location:
        return None
    return {
        'id': location.id,
        'city': location.city,
        'state_province': location.state_province,
        'country': location.country,
        'postal_code': location.postal_code
    }

def serialize_organization(org, include_details=False):
    """
    Helper function to serialize an organization object.

    :param org: The Organization object to serialize.
    :param include_details: If True, includes more detailed fields like photos and social links.
    """
    if not org:
        return None

    # Find the primary photo URL
    primary_photo_url = None
    if org.photos:
        primary_photo = next((p for p in org.photos if p.is_primary), None)
        if primary_photo:
            if primary_photo.file_path:
                primary_photo_url = primary_photo.file_path
            else:
                try:
                    primary_photo_url = url_for('uploaded_file', filename=primary_photo.file_name, _external=False)
                except:
                    primary_photo_url = f"/uploads/{primary_photo.file_name}"
        elif org.photos:
            # Fallback to the first photo if no primary is set
            first_photo = org.photos[0]
            if first_photo.file_path:
                primary_photo_url = first_photo.file_path
            else:
                try:
                    primary_photo_url = url_for('uploaded_file', filename=first_photo.file_name, _external=False)
                except:
                    primary_photo_url = f"/uploads/{first_photo.file_name}"

    logo_full_url = None
    if org.logo_url:
        # Check if it's already a full URL
        if org.logo_url.startswith('http://') or org.logo_url.startswith('https://'):
            logo_full_url = org.logo_url
        else:
            # Just return the filename - frontend will handle the path
            logo_full_url = org.logo_url

    data = {
        'id': org.id,
        'name': org.name,
        'mission': org.mission,
        'description': org.description,
        'category_name': org.category.name if org.category else None,
        'category_id': org.category.id if org.category else None,
        'location': serialize_location(org.location),
        'logo_url': logo_full_url,
        'primary_photo_url': primary_photo_url,
        'email': org.email,
        'phone': org.phone,
        'address': org.address,
        'website': org.website,
        'donation_link': org.donation_link,
        'status': org.status,
        'is_verified': org.is_verified,
        'verification_level': org.verification_level,
        'established_year': org.established_year,
        'view_count': org.view_count,
        'bookmark_count': org.bookmark_count,
        'created_at': org.created_at.isoformat(),
        'updated_at': org.updated_at.isoformat() if org.updated_at else None,
        'admin_user_id': org.admin_user_id
    }

    # Add bookmark status if a user is logged in
    try:
        from flask_jwt_extended import get_jwt_identity
        from .models import UserBookmark
        current_user_id = get_jwt_identity()
        if current_user_id:
            bookmark = UserBookmark.query.filter_by(user_id=current_user_id, organization_id=org.id).first()
            data['is_bookmarked'] = bookmark is not None
            data['bookmark_id'] = bookmark.id if bookmark else None
        else:
            data['is_bookmarked'] = False
            data['bookmark_id'] = None
    except RuntimeError:
        # This will happen if there is no JWT in the request, which is fine for public endpoints
        data['is_bookmarked'] = False
        data['bookmark_id'] = None

    if include_details:
        photos = []
        for p in org.photos:
            url = p.file_path
            if not url:
                try:
                    url = url_for('uploaded_file', filename=p.file_name, _external=False)
                except:
                    url = f"/uploads/{p.file_name}"
            photos.append({'id': p.id, 'url': url, 'alt_text': p.alt_text})

        data['photos'] = photos
        data['social_links'] = [{'platform': s.platform, 'url': s.url} for s in org.social_links]
        data['operating_hours'] = org.operating_hours

    return data

def paginate(query, page, per_page):
    """Helper function for pagination."""
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    items = pagination.items
    pag_details = {
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page,
        'next_page': pagination.next_num,
        'prev_page': pagination.prev_num
    }
    return items, pag_details

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
