from flask import request
from flask_restx import Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError

from ..models import db, NotificationPreference, User
from ..core import api

prefs_ns = api.namespace('notifications/preferences', description='User Notification Preferences')


# Notification Preferences Models
notification_preference_model = api.model('NotificationPreference', {
    'id': fields.Integer(description='Preference ID'),
    'user_id': fields.Integer(description='User ID'),

    # Email preferences
    'email_welcome': fields.Boolean(description='Receive welcome emails'),
    'email_organization_updates': fields.Boolean(description='Receive organization update emails'),
    'email_contact_messages': fields.Boolean(description='Receive contact message emails'),
    'email_system_announcements': fields.Boolean(description='Receive system announcement emails'),
    'email_security_alerts': fields.Boolean(description='Receive security alert emails'),
    'email_bookmark_digest': fields.Boolean(description='Receive bookmark digest emails'),
    'email_reminders': fields.Boolean(description='Receive reminder emails'),

    # In-app preferences
    'inapp_welcome': fields.Boolean(description='Receive welcome in-app notifications'),
    'inapp_organization_updates': fields.Boolean(description='Receive organization update in-app notifications'),
    'inapp_contact_messages': fields.Boolean(description='Receive contact message in-app notifications'),
    'inapp_system_announcements': fields.Boolean(description='Receive system announcement in-app notifications'),
    'inapp_security_alerts': fields.Boolean(description='Receive security alert in-app notifications'),
    'inapp_bookmark_digest': fields.Boolean(description='Receive bookmark digest in-app notifications'),
    'inapp_reminders': fields.Boolean(description='Receive reminder in-app notifications'),

    # General preferences
    'frequency_digest': fields.String(description='Digest frequency', enum=['daily', 'weekly', 'monthly']),
    'timezone': fields.String(description='User timezone'),
    'language': fields.String(description='Preferred language'),

    'created_at': fields.DateTime(description='Created timestamp'),
    'updated_at': fields.DateTime(description='Last updated timestamp')
})

notification_preference_update_model = api.model('NotificationPreferenceUpdate', {
    # Email preferences
    'email_welcome': fields.Boolean(description='Receive welcome emails'),
    'email_organization_updates': fields.Boolean(description='Receive organization update emails'),
    'email_contact_messages': fields.Boolean(description='Receive contact message emails'),
    'email_system_announcements': fields.Boolean(description='Receive system announcement emails'),
    'email_security_alerts': fields.Boolean(description='Receive security alert emails'),
    'email_bookmark_digest': fields.Boolean(description='Receive bookmark digest emails'),
    'email_reminders': fields.Boolean(description='Receive reminder emails'),

    # In-app preferences
    'inapp_welcome': fields.Boolean(description='Receive welcome in-app notifications'),
    'inapp_organization_updates': fields.Boolean(description='Receive organization update in-app notifications'),
    'inapp_contact_messages': fields.Boolean(description='Receive contact message in-app notifications'),
    'inapp_system_announcements': fields.Boolean(description='Receive system announcement in-app notifications'),
    'inapp_security_alerts': fields.Boolean(description='Receive security alert in-app notifications'),
    'inapp_bookmark_digest': fields.Boolean(description='Receive bookmark digest in-app notifications'),
    'inapp_reminders': fields.Boolean(description='Receive reminder in-app notifications'),

    # General preferences
    'frequency_digest': fields.String(description='Digest frequency', enum=['daily', 'weekly', 'monthly']),
    'timezone': fields.String(description='User timezone'),
    'language': fields.String(description='Preferred language')
})

notification_preference_parser = api.parser()
for field_name, field_obj in notification_preference_update_model.items():
    if isinstance(field_obj, fields.Boolean):
        notification_preference_parser.add_argument(field_name, type=bool, location='json')
    elif isinstance(field_obj, fields.String):
        notification_preference_parser.add_argument(field_name, type=str, location='json')


@prefs_ns.route('/')
class NotificationPreferences(Resource):
    @jwt_required()
    @prefs_ns.marshal_with(notification_preference_model)
    @prefs_ns.doc(responses={
        200: 'Notification preferences retrieved successfully',
        404: 'Preferences not found (will create defaults)',
        500: 'Failed to retrieve preferences'
    })
    def get(self):
        """Get user's notification preferences"""
        try:
            user_id = get_jwt_identity()
            preferences = NotificationPreference.query.filter_by(user_id=user_id).first()

            if not preferences:
                # Create default preferences
                preferences = NotificationPreference(user_id=user_id)
                db.session.add(preferences)
                db.session.commit()

            return preferences

        except Exception as e:
            api.abort(500, f'Failed to retrieve preferences: {str(e)}')

    @jwt_required()
    @prefs_ns.expect(notification_preference_parser)
    @prefs_ns.marshal_with(notification_preference_model)
    @prefs_ns.doc(responses={
        200: 'Preferences updated successfully',
        400: 'Invalid preference values',
        500: 'Failed to update preferences'
    })
    def put(self):
        """Update user's notification preferences"""
        try:
            user_id = get_jwt_identity()
            args = notification_preference_parser.parse_args()

            # Get or create preferences
            preferences = NotificationPreference.query.filter_by(user_id=user_id).first()
            if not preferences:
                preferences = NotificationPreference(user_id=user_id)
                db.session.add(preferences)

            # Update preferences with provided values
            for key, value in args.items():
                if value is not None and hasattr(preferences, key):
                    setattr(preferences, key, value)

            db.session.commit()
            return preferences

        except SQLAlchemyError as e:
            db.session.rollback()
            api.abort(500, f'Database error: {str(e)}')
        except Exception as e:
            api.abort(400, f'Invalid request: {str(e)}')


# Bulk notification settings
bulk_notification_parser = api.parser()
bulk_notification_parser.add_argument('enable_all_emails', type=bool, location='json',
                                     help='Enable all email notifications')
bulk_notification_parser.add_argument('disable_all_emails', type=bool, location='json',
                                     help='Disable all email notifications')
bulk_notification_parser.add_argument('enable_all_inapp', type=bool, location='json',
                                     help='Enable all in-app notifications')
bulk_notification_parser.add_argument('disable_all_inapp', type=bool, location='json',
                                     help='Disable all in-app notifications')

@prefs_ns.route('/bulk')
class BulkNotificationPreferences(Resource):
    @jwt_required()
    @prefs_ns.expect(bulk_notification_parser)
    @prefs_ns.marshal_with(notification_preference_model)
    @prefs_ns.doc(responses={
        200: 'Bulk preferences updated successfully',
        400: 'Invalid bulk operation',
        500: 'Failed to update preferences'
    })
    def put(self):
        """Bulk update notification preferences"""
        try:
            user_id = get_jwt_identity()
            args = bulk_notification_parser.parse_args()

            # Get or create preferences
            preferences = NotificationPreference.query.filter_by(user_id=user_id).first()
            if not preferences:
                preferences = NotificationPreference(user_id=user_id)
                db.session.add(preferences)

            # Handle bulk operations
            if args.get('enable_all_emails'):
                for attr in dir(preferences):
                    if attr.startswith('email_'):
                        setattr(preferences, attr, True)

            if args.get('disable_all_emails'):
                for attr in dir(preferences):
                    if attr.startswith('email_'):
                        setattr(preferences, attr, False)

            if args.get('enable_all_inapp'):
                for attr in dir(preferences):
                    if attr.startswith('inapp_'):
                        setattr(preferences, attr, True)

            if args.get('disable_all_inapp'):
                for attr in dir(preferences):
                    if attr.startswith('inapp_'):
                        setattr(preferences, attr, False)

            db.session.commit()
            return preferences

        except Exception as e:
            db.session.rollback()
            api.abort(500, f'Failed to update preferences: {str(e)}')


# Notification preferences summary
@prefs_ns.route('/summary')
class NotificationPreferencesSummary(Resource):
    @jwt_required()
    @prefs_ns.marshal_with(api.model('PreferencesSummary', {
        'total_enabled': fields.Integer(description='Total enabled notifications'),
        'email_enabled': fields.Integer(description='Email notifications enabled'),
        'inapp_enabled': fields.Integer(description='In-app notifications enabled'),
        'email_disabled': fields.Integer(description='Email notifications disabled'),
        'inapp_disabled': fields.Integer(description='In-app notifications disabled'),
        'frequency_digest': fields.String(description='Digest frequency'),
        'timezone': fields.String(description='User timezone'),
        'language': fields.String(description='Preferred language')
    }))
    @prefs_ns.doc(responses={
        200: 'Preferences summary retrieved successfully',
        500: 'Failed to get summary'
    })
    def get(self):
        """Get notification preferences summary"""
        try:
            user_id = get_jwt_identity()
            preferences = NotificationPreference.query.filter_by(user_id=user_id).first()

            if not preferences:
                # Return default summary
                return {
                    'total_enabled': 14,  # Default enabled count
                    'email_enabled': 7,
                    'inapp_enabled': 7,
                    'email_disabled': 0,
                    'inapp_disabled': 0,
                    'frequency_digest': 'weekly',
                    'timezone': 'UTC',
                    'language': 'en'
                }

            # Count enabled/disabled preferences
            email_enabled = sum(1 for attr in dir(preferences)
                              if attr.startswith('email_') and getattr(preferences, attr, False))
            inapp_enabled = sum(1 for attr in dir(preferences)
                              if attr.startswith('inapp_') and getattr(preferences, attr, False))

            email_total = sum(1 for attr in dir(preferences) if attr.startswith('email_'))
            inapp_total = sum(1 for attr in dir(preferences) if attr.startswith('inapp_'))

            return {
                'total_enabled': email_enabled + inapp_enabled,
                'email_enabled': email_enabled,
                'inapp_enabled': inapp_enabled,
                'email_disabled': email_total - email_enabled,
                'inapp_disabled': inapp_total - inapp_enabled,
                'frequency_digest': preferences.frequency_digest,
                'timezone': preferences.timezone,
                'language': preferences.language
            }

        except Exception as e:
            api.abort(500, f'Failed to get summary: {str(e)}')


# Reset preferences to defaults
@prefs_ns.route('/reset')
class ResetNotificationPreferences(Resource):
    @jwt_required()
    @prefs_ns.marshal_with(notification_preference_model)
    @prefs_ns.doc(responses={
        200: 'Preferences reset to defaults successfully',
        500: 'Failed to reset preferences'
    })
    def post(self):
        """Reset notification preferences to defaults"""
        try:
            user_id = get_jwt_identity()

            # Delete existing preferences
            NotificationPreference.query.filter_by(user_id=user_id).delete()

            # Create new default preferences
            preferences = NotificationPreference(user_id=user_id)
            db.session.add(preferences)
            db.session.commit()

            return preferences

        except Exception as e:
            db.session.rollback()
            api.abort(500, f'Failed to reset preferences: {str(e)}')
