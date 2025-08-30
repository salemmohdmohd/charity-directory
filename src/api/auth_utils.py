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
        """Send password reset email"""
        from flask import current_app
        mail = current_app.extensions['mail']

        reset_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={token}"

        msg = Message(
            subject='Password Reset - Charity Directory',
            recipients=[email],
            html=f"""
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password. Click the button below to continue:</p>
            <a href="{reset_url}" style="display: inline-block; background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
            """
        )

        try:
            mail.send(msg)
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

    @staticmethod
    def send_verification_email(email, token):
        """Send email verification"""
        from flask import current_app
        mail = current_app.extensions['mail']

        verify_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token={token}"

        msg = Message(
            subject='Verify Your Email - Charity Directory',
            recipients=[email],
            html=f"""
            <h2>Welcome to Charity Directory!</h2>
            <p>Thank you for joining our platform. Please verify your email address by clicking the button below:</p>
            <a href="{verify_url}" style="display: inline-block; background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            """
        )

        try:
            mail.send(msg)
            return True
        except Exception as e:
            print(f"Failed to send verification email: {e}")
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
    return email_regex.match(email) is not None
