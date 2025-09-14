from flask import current_app, render_template_string
from flask_mail import Message
from sqlalchemy import func
from datetime import datetime, timedelta
from enum import Enum
import json
import os
from typing import List, Dict, Optional, Union

from .models import db, User, Notification, Organization, NotificationPreference


class NotificationType(Enum):
    """Enumeration for different types of notifications"""
    WELCOME = "welcome"
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"
    ORGANIZATION_APPROVED = "organization_approved"
    ORGANIZATION_REJECTED = "organization_rejected"
    CONTACT_MESSAGE = "contact_message"
    BOOKMARK_DIGEST = "bookmark_digest"
    SYSTEM_ANNOUNCEMENT = "system_announcement"
    SECURITY_ALERT = "security_alert"
    REMINDER = "reminder"
    GENERAL = "general"


class NotificationPriority(Enum):
    """Enumeration for notification priorities"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class NotificationService:
    """Comprehensive notification service for email and in-app notifications"""

    def __init__(self):
        self.templates_dir = os.path.join(os.path.dirname(__file__), 'templates')
        self._ensure_templates_exist()

    def _ensure_templates_exist(self):
        """Ensure templates directory exists"""
        if not os.path.exists(self.templates_dir):
            os.makedirs(self.templates_dir, exist_ok=True)

    def _get_mail_instance(self):
        """Get Flask-Mail instance"""
        try:
            return current_app.extensions['mail']
        except KeyError:
            current_app.logger.error("Flask-Mail not configured properly")
            return None

    def _load_template(self, template_name: str) -> str:
        """Load email template from file"""
        template_path = os.path.join(self.templates_dir, f"{template_name}.html")

        if os.path.exists(template_path):
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()

        # Return default template if specific template doesn't exist
        return self._get_default_template()

    def _get_default_template(self) -> str:
        """Get default email template"""
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{{ subject }}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
                .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #e0e0e0; }
                .logo { font-size: 24px; font-weight: bold; color: #2196F3; }
                .content { padding: 30px 0; }
                .button { display: inline-block; background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">Charity Directory</div>
                </div>
                <div class="content">
                    {{ content }}
                </div>
                <div class="footer">
                    <p>© {{ year }} Charity Directory. All rights reserved.</p>
                    <p>If you no longer wish to receive these emails, you can <a href="{{ unsubscribe_url }}">unsubscribe here</a>.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def send_notification(
        self,
        user_id: int,
        notification_type: NotificationType,
        subject: str,
        message: str,
        email_content: Optional[str] = None,
        email_template_vars: Optional[Dict] = None,
        send_email: bool = True,
        send_in_app: bool = True,
        priority: NotificationPriority = NotificationPriority.NORMAL
    ) -> Dict[str, bool]:
        """
        Send a notification via email and/or in-app

        Args:
            user_id: ID of the user to notify
            notification_type: Type of notification
            subject: Email subject and in-app notification title
            message: In-app notification message
            email_content: HTML content for email (if different from message)
            email_template_vars: Variables for email template
            send_email: Whether to send email notification
            send_in_app: Whether to send in-app notification
            priority: Notification priority

        Returns:
            Dict with success status for email and in-app notifications
        """
        results = {'email': False, 'in_app': False}

        # Get user
        user = User.query.get(user_id)
        if not user:
            current_app.logger.error(f"User {user_id} not found")
            return results

        # Check user notification preferences
        email_allowed, inapp_allowed = send_email, send_in_app
        if user.notification_preferences:
            email_allowed, inapp_allowed = self._should_send_notification(
                user.notification_preferences, notification_type, send_email, send_in_app
            )

        # Send in-app notification
        if inapp_allowed:
            results['in_app'] = self._send_in_app_notification(
                user_id, notification_type, subject, message, priority
            )

        # Send email notification
        if email_allowed and user.email:
            results['email'] = self._send_email_notification(
                user.email, notification_type, subject,
                email_content or message, email_template_vars or {}
            )

        return results

    def _should_send_notification(self, preferences: NotificationPreference, notification_type: NotificationType,
                                send_email: bool, send_in_app: bool) -> tuple[bool, bool]:
        """Check if notification should be sent based on user preferences"""
        if not preferences:
            return send_email, send_in_app

        email_allowed = send_email
        inapp_allowed = send_in_app

        # Map notification types to preference fields
        type_mapping = {
            NotificationType.WELCOME: ('email_welcome', 'inapp_welcome'),
            NotificationType.EMAIL_VERIFICATION: ('email_welcome', 'inapp_welcome'),
            NotificationType.PASSWORD_RESET: ('email_security_alerts', 'inapp_security_alerts'),
            NotificationType.ORGANIZATION_APPROVED: ('email_organization_updates', 'inapp_organization_updates'),
            NotificationType.ORGANIZATION_REJECTED: ('email_organization_updates', 'inapp_organization_updates'),
            NotificationType.CONTACT_MESSAGE: ('email_contact_messages', 'inapp_contact_messages'),
            NotificationType.BOOKMARK_DIGEST: ('email_bookmark_digest', 'inapp_bookmark_digest'),
            NotificationType.SYSTEM_ANNOUNCEMENT: ('email_system_announcements', 'inapp_system_announcements'),
            NotificationType.SECURITY_ALERT: ('email_security_alerts', 'inapp_security_alerts'),
            NotificationType.REMINDER: ('email_reminders', 'inapp_reminders'),
            NotificationType.GENERAL: ('email_system_announcements', 'inapp_system_announcements'),
        }

        if notification_type in type_mapping:
            email_field, inapp_field = type_mapping[notification_type]
            if hasattr(preferences, email_field):
                email_allowed = email_allowed and getattr(preferences, email_field, True)
            if hasattr(preferences, inapp_field):
                inapp_allowed = inapp_allowed and getattr(preferences, inapp_field, True)

        return email_allowed, inapp_allowed

    def _send_in_app_notification(
        self,
        user_id: int,
        notification_type: NotificationType,
        title: str,
        message: str,
        priority: NotificationPriority
    ) -> bool:
        """Send in-app notification"""
        try:
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type.value,
                priority=priority.value
            )
            db.session.add(notification)
            db.session.commit()
            return True
        except Exception as e:
            current_app.logger.error(f"Failed to send in-app notification: {e}")
            db.session.rollback()
            return False

    def _send_email_notification(
        self,
        email: str,
        notification_type: NotificationType,
        subject: str,
        content: str,
        template_vars: Dict
    ) -> bool:
        """Send email notification"""
        mail = self._get_mail_instance()
        if not mail:
            return False

        frontend_url = current_app.config.get('FRONTEND_URL')
        if not frontend_url:
            current_app.logger.error("FRONTEND_URL is not configured. Cannot send email with links.")
            return False

        try:
            # Load template
            template = self._load_template(notification_type.value)

            # Prepare template variables
            template_vars.update({
                'subject': subject,
                'content': content,
                'year': datetime.now().year,
                'frontend_url': frontend_url,
                'unsubscribe_url': f"{frontend_url}/unsubscribe"
            })

            # Render template
            html_content = render_template_string(template, **template_vars)

            # Create and send message
            msg = Message(
                subject=subject,
                recipients=[email],
                html=html_content
            )

            mail.send(msg)
            return True

        except Exception as e:
            current_app.logger.error(f"Failed to send email to {email}: {e}")
            return False

    def send_bulk_notification(
        self,
        notification_type: NotificationType,
        subject: str,
        message: str,
        email_content: Optional[str] = None,
        user_filter: Optional[Dict] = None,
        send_email: bool = True,
        send_in_app: bool = True,
        priority: NotificationPriority = NotificationPriority.NORMAL
    ) -> Dict[str, int]:
        """
        Send bulk notifications to multiple users

        Args:
            notification_type: Type of notification
            subject: Notification subject
            message: Notification message
            email_content: HTML content for email
            user_filter: Filter criteria for users (role, verified, etc.)
            send_email: Whether to send email notifications
            send_in_app: Whether to send in-app notifications
            priority: Notification priority

        Returns:
            Dict with counts of successful email and in-app notifications
        """
        results = {'email_count': 0, 'in_app_count': 0, 'failed_count': 0}

        # Build user query
        query = User.query

        if user_filter:
            if 'role' in user_filter:
                query = query.filter(User.role == user_filter['role'])
            if 'is_verified' in user_filter:
                query = query.filter(User.is_verified == user_filter['is_verified'])
            if 'created_after' in user_filter:
                query = query.filter(User.created_at >= user_filter['created_after'])

        users = query.all()

        for user in users:
            try:
                result = self.send_notification(
                    user.id, notification_type, subject, message,
                    email_content, {}, send_email, send_in_app, priority
                )

                if result['email']:
                    results['email_count'] += 1
                if result['in_app']:
                    results['in_app_count'] += 1

            except Exception as e:
                current_app.logger.error(f"Failed to send bulk notification to user {user.id}: {e}")
                results['failed_count'] += 1

        return results

    def send_welcome_email(self, user_id: int, verification_token: Optional[str] = None):
        """Send welcome email to new user"""
        user = User.query.get(user_id)
        if not user:
            return False

        frontend_url = current_app.config.get('FRONTEND_URL')
        if not frontend_url:
            current_app.logger.error("FRONTEND_URL is not configured. Cannot send welcome email.")
            return False

        template_vars = {
            'user_name': user.name,
            'verification_url': f"{frontend_url}/verify-email?token={verification_token}" if verification_token else None
        }

        return self.send_notification(
            user_id=user_id,
            notification_type=NotificationType.WELCOME,
            subject="Welcome to Charity Directory!",
            message=f"Welcome {user.name}! Your account has been created successfully.",
            email_template_vars=template_vars,
            priority=NotificationPriority.HIGH
        )

    def send_organization_approval_notification(self, org_id: int, approved: bool):
        """Send organization approval/rejection notification"""
        org = Organization.query.get(org_id)
        if not org or not org.admin_user_id:
            return False

        if approved:
            subject = f"Congratulations! {org.name} has been approved"
            message = f"Your organization {org.name} has been approved and is now live on Charity Directory!"
            notification_type = NotificationType.ORGANIZATION_APPROVED
        else:
            subject = f"Update on {org.name} application"
            message = f"We regret to inform you that {org.name} application needs revision. Please check your dashboard for details."
            notification_type = NotificationType.ORGANIZATION_REJECTED

        frontend_url = current_app.config.get('FRONTEND_URL')
        if not frontend_url:
            current_app.logger.error("FRONTEND_URL is not configured. Cannot send organization approval notification.")
            return False

        template_vars = {
            'organization_name': org.name,
            'dashboard_url': f"{frontend_url}/organization-dashboard"
        }

        return self.send_notification(
            user_id=org.admin_user_id,
            notification_type=notification_type,
            subject=subject,
            message=message,
            email_template_vars=template_vars,
            priority=NotificationPriority.HIGH
        )

    def send_contact_message_notification(self, org_id: int, sender_name: str, subject: str):
        """Send notification about new contact message"""
        org = Organization.query.get(org_id)
        if not org or not org.admin_user_id:
            return False

        message = f"New contact message from {sender_name} for {org.name}: {subject}"

        frontend_url = current_app.config.get('FRONTEND_URL')
        if not frontend_url:
            current_app.logger.error("FRONTEND_URL is not configured. Cannot send contact message notification.")
            return False

        template_vars = {
            'organization_name': org.name,
            'sender_name': sender_name,
            'message_subject': subject,
            'dashboard_url': f"{frontend_url}/org-dashboard"
        }

        return self.send_notification(
            user_id=org.admin_user_id,
            notification_type=NotificationType.CONTACT_MESSAGE,
            subject=f"New message for {org.name}",
            message=message,
            email_template_vars=template_vars,
            priority=NotificationPriority.NORMAL
        )

    def send_password_reset_notification(self, user_id: int, reset_token: str):
        """Send password reset notification"""
        user = User.query.get(user_id)
        if not user:
            return False

        frontend_url = current_app.config.get('FRONTEND_URL')
        if not frontend_url:
            current_app.logger.error("FRONTEND_URL is not configured. Cannot send password reset notification.")
            return False

        reset_url = f"{frontend_url}/reset-password?token={reset_token}"

        template_vars = {
            'user_name': user.name,
            'reset_url': reset_url
        }

        return self.send_notification(
            user_id=user_id,
            notification_type=NotificationType.PASSWORD_RESET,
            subject="Password Reset Request - Charity Directory",
            message="You have requested to reset your password. Click the link in your email to continue.",
            email_template_vars=template_vars,
            send_in_app=False,  # Only send email for password reset
            priority=NotificationPriority.HIGH
        )

    def send_email_verification(self, user_id: int, verification_token: str):
        """Send email verification notification"""
        user = User.query.get(user_id)
        if not user:
            return False

        frontend_url = current_app.config.get('FRONTEND_URL')
        if not frontend_url:
            current_app.logger.error("FRONTEND_URL is not configured. Cannot send email verification.")
            return False

        verify_url = f"{frontend_url}/verify-email?token={verification_token}"

        template_vars = {
            'user_name': user.name,
            'verify_url': verify_url
        }

        return self.send_notification(
            user_id=user_id,
            notification_type=NotificationType.EMAIL_VERIFICATION,
            subject="Verify Your Email - Charity Directory",
            message="Please verify your email address to complete your registration.",
            email_template_vars=template_vars,
            send_in_app=False,  # Only send email for verification
            priority=NotificationPriority.HIGH
        )

    def send_advertising_inquiry_notification(self, partnerships_email: str, inquiry_data: dict):
        """Send advertising inquiry notification to partnerships team"""
        try:
            mail = self._get_mail_instance()
            if not mail:
                return False

            # Create email content
            content = f"""
            <h2>New Advertising Inquiry Received</h2>
            <p>A new advertising inquiry has been submitted through the website.</p>

            <h3>Organization Details:</h3>
            <ul>
                <li><strong>Organization Name:</strong> {inquiry_data['organization_name']}</li>
                <li><strong>Contact Person:</strong> {inquiry_data['contact_name']}</li>
                <li><strong>Email:</strong> {inquiry_data['email']}</li>
                <li><strong>Phone:</strong> {inquiry_data.get('phone', 'Not provided')}</li>
                <li><strong>Organization Type:</strong> {inquiry_data['organization_type']}</li>
                <li><strong>Website:</strong> {inquiry_data.get('website', 'Not provided')}</li>
            </ul>

            <h3>Advertising Details:</h3>
            <ul>
                <li><strong>Package Interest:</strong> {inquiry_data['ad_package']}</li>
                <li><strong>Budget Range:</strong> {inquiry_data.get('budget', 'Not specified')}</li>
                <li><strong>Campaign Goals:</strong> {inquiry_data.get('campaign_goals', 'Not provided')}</li>
                <li><strong>Target Audience:</strong> {inquiry_data.get('target_audience', 'Not provided')}</li>
            </ul>

            {f"<h3>Additional Message:</h3><p>{inquiry_data['message']}</p>" if inquiry_data.get('message') else ''}

            <p><strong>Submitted on:</strong> {inquiry_data['submitted_at'].strftime('%Y-%m-%d %H:%M:%S')} UTC</p>

            <p>Please respond to this inquiry within 2-3 business days.</p>
            """

            # Load template and render
            template = self._load_template('general')

            frontend_url = current_app.config.get('FRONTEND_URL')
            if not frontend_url:
                current_app.logger.error("FRONTEND_URL is not configured. Cannot send advertising inquiry notification.")
                return False

            template_vars = {
                'subject': f"New Advertising Inquiry from {inquiry_data['organization_name']}",
                'content': content,
                'year': datetime.now().year,
                'frontend_url': frontend_url,
                'unsubscribe_url': f"{frontend_url}/unsubscribe"
            }

            html_content = render_template_string(template, **template_vars)

            # Create message
            msg = Message(
                subject=f"New Advertising Inquiry from {inquiry_data['organization_name']}",
                recipients=[partnerships_email],
                html=html_content
            )

            # Send email
            mail.send(msg)
            current_app.logger.info(f"Advertising inquiry notification sent to {partnerships_email}")
            return True

        except Exception as e:
            current_app.logger.error(f"Failed to send advertising inquiry notification: {str(e)}")
            return False

    def send_advertising_inquiry_confirmation(self, email: str, contact_name: str, inquiry_data: dict):
        """Send confirmation email to the person who submitted the advertising inquiry"""
        try:
            mail = self._get_mail_instance()
            if not mail:
                return False

            # Create confirmation content
            content = f"""
            <h2>Thank You for Your Advertising Inquiry!</h2>
            <p>Dear {contact_name},</p>

            <p>Thank you for your interest in advertising with Cause Book. We have received your inquiry and our partnerships team will review it carefully.</p>

            <h3>Your Inquiry Summary:</h3>
            <ul>
                <li><strong>Organization:</strong> {inquiry_data['organization_name']}</li>
                <li><strong>Package Interest:</strong> {inquiry_data['ad_package']}</li>
                <li><strong>Budget Range:</strong> {inquiry_data.get('budget', 'Not specified')}</li>
                <li><strong>Inquiry ID:</strong> ADV-{inquiry_data['submitted_at'].strftime('%Y%m%d%H%M%S')}</li>
            </ul>

            <h3>What Happens Next?</h3>
            <ul>
                <li>Our partnerships team will review your inquiry within 2-3 business days</li>
                <li>We'll contact you via email to discuss your advertising needs in detail</li>
                <li>We'll provide you with a customized proposal and pricing information</li>
                <li>We'll schedule a consultation call if needed</li>
            </ul>

            <p>In the meantime, feel free to explore our platform to better understand our audience and charity network.</p>

            <p>If you have any immediate questions, you can reach our partnerships team at:</p>
            <ul>
                <li>Email: partnerships@Causebook.com</li>
                <li>Phone: (555) 012-3456</li>
            </ul>

            <p>Thank you for considering Cause Book as your advertising partner. We look forward to working with you!</p>

            <p>Best regards,<br>
            The Cause Book Partnerships Team</p>
            """

            # Load template and render
            template = self._load_template('general')

            frontend_url = current_app.config.get('FRONTEND_URL')
            if not frontend_url:
                current_app.logger.error("FRONTEND_URL is not configured. Cannot send advertising inquiry confirmation.")
                return False

            template_vars = {
                'subject': "Your Advertising Inquiry - Confirmation Received",
                'content': content,
                'year': datetime.now().year,
                'frontend_url': frontend_url,
                'unsubscribe_url': f"{frontend_url}/unsubscribe"
            }

            html_content = render_template_string(template, **template_vars)

            # Create message
            msg = Message(
                subject="Your Advertising Inquiry - Confirmation Received",
                recipients=[email],
                html=html_content
            )

            # Send email
            mail.send(msg)
            current_app.logger.info(f"Advertising inquiry confirmation sent to {email}")
            return True

        except Exception as e:
            current_app.logger.error(f"Failed to send advertising inquiry confirmation: {str(e)}")
            return False

    def get_notification_stats(self, days: int = 30) -> Dict:
        """Get notification statistics for the last N days"""
        since_date = datetime.utcnow() - timedelta(days=days)

        stats = {
            'total_notifications': Notification.query.filter(
                Notification.created_at >= since_date
            ).count(),
            'unread_notifications': Notification.query.filter(
                Notification.created_at >= since_date,
                Notification.is_read == False
            ).count(),
            'notifications_by_type': {},
            'notifications_by_priority': {}
        }

        # Get counts by type
        type_counts = db.session.query(
            Notification.notification_type,
            func.count(Notification.id)
        ).filter(
            Notification.created_at >= since_date
        ).group_by(Notification.notification_type).all()

        for notif_type, count in type_counts:
            stats['notifications_by_type'][notif_type] = count

        # Get counts by priority
        priority_counts = db.session.query(
            Notification.priority,
            func.count(Notification.id)
        ).filter(
            Notification.created_at >= since_date
        ).group_by(Notification.priority).all()

        for priority, count in priority_counts:
            stats['notifications_by_priority'][priority] = count

        return stats


# Create global instance
notification_service = NotificationService()
