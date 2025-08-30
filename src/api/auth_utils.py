from flask_mail import Message
from src.app import mail
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
    def send_reset_email(email, token, mail):
        """Send password reset email"""
        reset_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={token}"

        msg = Message(
            subject='Reset Your Password - Charity Directory',
            recipients=[email],
            html=f"""
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>You requested a password reset for your Charity Directory account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="{reset_url}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this reset, please ignore this email.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #666; font-size: 12px; word-break: break-all;">{reset_url}</p>
            </div>
            """
        )
        mail.send(msg)

    @staticmethod
    def send_verification_email(email, token, mail):
        """Send email verification"""
        verify_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token={token}"

        msg = Message(
            subject='Verify Your Email - Charity Directory',
            recipients=[email],
            html=f"""
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <h2 style="color: #333;">Welcome to Charity Directory!</h2>
                <p>Thank you for joining our platform. Please verify your email address by clicking the button below:</p>
                <a href="{verify_url}" style="display: inline-block; background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>Once verified, you'll be able to:</p>
                <ul>
                    <li>Bookmark your favorite charities</li>
                    <li>Submit new organizations for review</li>
                    <li>Access personalized recommendations</li>
                </ul>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #666; font-size: 12px; word-break: break-all;">{verify_url}</p>
            </div>
            """
        )
        mail.send(msg)

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
