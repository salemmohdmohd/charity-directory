from flask_mail import Message
from flask import current_app, url_for
from werkzeug.security import generate_password_hash
import secrets
import string
from datetime import datetime, timedelta


class AuthService:
    @staticmethod
    def generate_reset_token():
        """Generate a secure random token for password reset"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(32))

    @staticmethod
    def send_reset_email(email, token):
        """Send password reset email using new notification service"""
        try:
            from .models import User
            from .notification_service import notification_service

            user = User.query.filter_by(email=email).first()
            if user:
                return notification_service.send_password_reset_notification(user.id, token)
            return False
        except Exception as e:
            print(f"Failed to send reset email: {e}")
            return False

    @staticmethod
    def send_verification_email(email, token):
        """Send email verification using new notification service"""
        try:
            from .models import User
            from .notification_service import notification_service

            user = User.query.filter_by(email=email).first()
            if user:
                return notification_service.send_email_verification(user.id, token)
            return False
        except Exception as e:
            print(f"Failed to send verification email: {e}")
            return False

    @staticmethod
    def send_welcome_email(user_id, verification_token=None):
        """Send welcome email using new notification service"""
        try:
            from .notification_service import notification_service
            return notification_service.send_welcome_email(user_id, verification_token)
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
            return False

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        return False, "Password must contain at least one special character"
    return True, "Password is valid"

def validate_email_format(email):
    """Validate email format using regex"""
    import re
    email_regex = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    if email_regex.match(email) is not None:
        return True, "Email format is valid"
    return False, "Invalid email format"
