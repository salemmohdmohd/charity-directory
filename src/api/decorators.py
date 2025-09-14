









"""
Authentication decorators that combine Flask-Login and JWT for comprehensive protection
"""
from functools import wraps
from flask import request, jsonify, redirect, url_for, render_template_string
from flask_login import current_user, login_required as flask_login_required
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from .models import User

def admin_required(f):
    """Decorator that requires platform admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if this is an API request (has JWT token)
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            try:
                # JWT-based authentication for API requests
                verify_jwt_in_request()
                user_id = get_jwt_identity()
                user = User.query.get(user_id)
                if not user or user.role != 'platform_admin':
                    return jsonify({'message': 'Admin access required'}), 403
            except Exception:
                return jsonify({'message': 'Invalid token'}), 401
        else:
            # Session-based authentication for web requests
            if not current_user.is_authenticated:
                return redirect(url_for('login'))
            if not current_user.is_admin():
                return jsonify({'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def login_required_hybrid(f):
    """Decorator that accepts both JWT tokens and Flask-Login sessions"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if this is an API request (has JWT token)
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            try:
                # JWT-based authentication for API requests
                verify_jwt_in_request()
                return f(*args, **kwargs)
            except Exception:
                return jsonify({'message': 'Invalid token'}), 401
        else:
            # Session-based authentication for web requests
            if not current_user.is_authenticated:
                return redirect(url_for('login'))
            return f(*args, **kwargs)
    return decorated_function

def web_login_required(f):
    """Decorator for web pages that redirects to login page"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def api_login_required(f):
    """Decorator for API endpoints that requires JWT token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception:
            return jsonify({'message': 'Authorization token required'}), 401
    return decorated_function
