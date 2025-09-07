from flask import request
from flask_restx import Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import func

from .models import db, User
from .notification_service import notification_service, NotificationType, NotificationPriority
from .routes import api, notification_ns
from .utils import check_admin_role


# Bulk notification models
bulk_notification_model = api.model('BulkNotification', {
    'notification_type': fields.String(required=True, description='Type of notification',
                                     enum=[t.value for t in NotificationType]),
    'priority': fields.String(description='Notification priority',
                            enum=[p.value for p in NotificationPriority], default='normal'),
    'subject': fields.String(required=True, description='Notification subject'),
    'message': fields.String(required=True, description='Notification message'),
    'email_content': fields.String(description='HTML content for email (if different from message)'),
    'send_email': fields.Boolean(description='Send email notifications', default=True),
    'send_in_app': fields.Boolean(description='Send in-app notifications', default=True),

    # Filtering options
    'user_role': fields.String(description='Filter by user role', enum=['visitor', 'org_admin', 'platform_admin']),
    'is_verified': fields.Boolean(description='Filter by verification status'),
    'created_after': fields.DateTime(description='Filter users created after this date'),
    'created_before': fields.DateTime(description='Filter users created before this date'),
    'last_login_after': fields.DateTime(description='Filter users who logged in after this date'),
    'organization_status': fields.String(description='Filter org admins by organization status',
                                       enum=['pending', 'approved', 'rejected', 'flagged']),
    'active_users_only': fields.Boolean(description='Only send to users active in last 30 days', default=False)
})

bulk_notification_parser = api.parser()
bulk_notification_parser.add_argument('notification_type', type=str, required=True, location='json',
                                     choices=[t.value for t in NotificationType])
bulk_notification_parser.add_argument('priority', type=str, location='json', default='normal',
                                     choices=[p.value for p in NotificationPriority])
bulk_notification_parser.add_argument('subject', type=str, required=True, location='json')
bulk_notification_parser.add_argument('message', type=str, required=True, location='json')
bulk_notification_parser.add_argument('email_content', type=str, location='json')
bulk_notification_parser.add_argument('send_email', type=bool, location='json', default=True)
bulk_notification_parser.add_argument('send_in_app', type=bool, location='json', default=True)

# Filtering arguments
bulk_notification_parser.add_argument('user_role', type=str, location='json',
                                     choices=['visitor', 'org_admin', 'platform_admin'])
bulk_notification_parser.add_argument('is_verified', type=bool, location='json')
bulk_notification_parser.add_argument('created_after', type=str, location='json')
bulk_notification_parser.add_argument('created_before', type=str, location='json')
bulk_notification_parser.add_argument('last_login_after', type=str, location='json')
bulk_notification_parser.add_argument('organization_status', type=str, location='json',
                                     choices=['pending', 'approved', 'rejected', 'flagged'])
bulk_notification_parser.add_argument('active_users_only', type=bool, location='json', default=False)

bulk_notification_response_model = api.model('BulkNotificationResponse', {
    'message': fields.String(description='Response message'),
    'total_users': fields.Integer(description='Total users targeted'),
    'email_sent': fields.Integer(description='Number of emails sent successfully'),
    'inapp_sent': fields.Integer(description='Number of in-app notifications sent successfully'),
    'failed': fields.Integer(description='Number of failed notifications'),
    'execution_time': fields.Float(description='Execution time in seconds')
})


@notification_ns.route('/bulk')
class BulkNotificationBroadcast(Resource):
    @jwt_required()
    @notification_ns.expect(bulk_notification_parser)
    @notification_ns.marshal_with(bulk_notification_response_model)
    @notification_ns.doc(responses={
        200: 'Bulk notification sent successfully',
        400: 'Invalid notification data',
        403: 'Admin access required',
        500: 'Failed to send bulk notification'
    })
    def post(self):
        """Send bulk notification to filtered users (Admin only)"""
        try:
            # Check if user is admin
            check_admin_role(get_jwt_identity())

            start_time = datetime.utcnow()
            args = bulk_notification_parser.parse_args()

            # Build user filter
            user_filter = {}

            if args.get('user_role'):
                user_filter['role'] = args['user_role']

            if args.get('is_verified') is not None:
                user_filter['is_verified'] = args['is_verified']

            if args.get('created_after'):
                try:
                    user_filter['created_after'] = datetime.fromisoformat(args['created_after'].replace('Z', '+00:00'))
                except ValueError:
                    api.abort(400, 'Invalid created_after date format')

            if args.get('created_before'):
                try:
                    user_filter['created_before'] = datetime.fromisoformat(args['created_before'].replace('Z', '+00:00'))
                except ValueError:
                    api.abort(400, 'Invalid created_before date format')

            if args.get('last_login_after'):
                try:
                    user_filter['last_login_after'] = datetime.fromisoformat(args['last_login_after'].replace('Z', '+00:00'))
                except ValueError:
                    api.abort(400, 'Invalid last_login_after date format')

            if args.get('active_users_only'):
                user_filter['last_login_after'] = datetime.utcnow() - timedelta(days=30)

            # Send bulk notification
            notification_type = NotificationType(args['notification_type'])
            priority = NotificationPriority(args.get('priority', 'normal'))

            results = notification_service.send_bulk_notification(
                notification_type=notification_type,
                subject=args['subject'],
                message=args['message'],
                email_content=args.get('email_content'),
                user_filter=user_filter,
                send_email=args.get('send_email', True),
                send_in_app=args.get('send_in_app', True),
                priority=priority
            )

            end_time = datetime.utcnow()
            execution_time = (end_time - start_time).total_seconds()

            total_sent = results['email_count'] + results['in_app_count']

            return {
                'message': f'Bulk notification sent successfully to {total_sent} users',
                'total_users': total_sent + results['failed_count'],
                'email_sent': results['email_count'],
                'inapp_sent': results['in_app_count'],
                'failed': results['failed_count'],
                'execution_time': execution_time
            }

        except ValueError as e:
            api.abort(400, f'Invalid notification type or priority: {str(e)}')
        except Exception as e:
            api.abort(500, f'Failed to send bulk notification: {str(e)}')


# Preview bulk notification (see how many users would be targeted)
preview_parser = api.parser()
preview_parser.add_argument('user_role', type=str, location='json',
                          choices=['visitor', 'org_admin', 'platform_admin'])
preview_parser.add_argument('is_verified', type=bool, location='json')
preview_parser.add_argument('created_after', type=str, location='json')
preview_parser.add_argument('created_before', type=str, location='json')
preview_parser.add_argument('last_login_after', type=str, location='json')
preview_parser.add_argument('active_users_only', type=bool, location='json', default=False)

preview_response_model = api.model('BulkNotificationPreview', {
    'total_users': fields.Integer(description='Total users that would be targeted'),
    'breakdown': fields.Raw(description='Breakdown by user role'),
    'verified_users': fields.Integer(description='Number of verified users'),
    'unverified_users': fields.Integer(description='Number of unverified users'),
    'active_users': fields.Integer(description='Active users in last 30 days')
})

@notification_ns.route('/bulk/preview')
class BulkNotificationPreview(Resource):
    @jwt_required()
    @notification_ns.expect(preview_parser)
    @notification_ns.marshal_with(preview_response_model)
    @notification_ns.doc(responses={
        200: 'Preview generated successfully',
        400: 'Invalid filter parameters',
        403: 'Admin access required',
        500: 'Failed to generate preview'
    })
    def post(self):
        """Preview bulk notification targeting (Admin only)"""
        try:
            # Check if user is admin
            check_admin_role(get_jwt_identity())

            args = preview_parser.parse_args()

            # Build query
            query = User.query

            if args.get('user_role'):
                query = query.filter(User.role == args['user_role'])

            if args.get('is_verified') is not None:
                query = query.filter(User.is_verified == args['is_verified'])

            if args.get('created_after'):
                try:
                    created_after = datetime.fromisoformat(args['created_after'].replace('Z', '+00:00'))
                    query = query.filter(User.created_at >= created_after)
                except ValueError:
                    api.abort(400, 'Invalid created_after date format')

            if args.get('created_before'):
                try:
                    created_before = datetime.fromisoformat(args['created_before'].replace('Z', '+00:00'))
                    query = query.filter(User.created_at <= created_before)
                except ValueError:
                    api.abort(400, 'Invalid created_before date format')

            if args.get('last_login_after'):
                try:
                    last_login_after = datetime.fromisoformat(args['last_login_after'].replace('Z', '+00:00'))
                    query = query.filter(User.last_login >= last_login_after)
                except ValueError:
                    api.abort(400, 'Invalid last_login_after date format')

            if args.get('active_users_only'):
                thirty_days_ago = datetime.utcnow() - timedelta(days=30)
                query = query.filter(User.last_login >= thirty_days_ago)

            # Get counts
            users = query.all()
            total_users = len(users)

            # Generate breakdown
            breakdown = {}
            for user in users:
                role = user.role
                if role not in breakdown:
                    breakdown[role] = 0
                breakdown[role] += 1

            verified_users = sum(1 for user in users if user.is_verified)
            unverified_users = total_users - verified_users

            # Count active users (last 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            active_users = sum(1 for user in users if user.last_login and user.last_login >= thirty_days_ago)

            return {
                'total_users': total_users,
                'breakdown': breakdown,
                'verified_users': verified_users,
                'unverified_users': unverified_users,
                'active_users': active_users
            }

        except Exception as e:
            api.abort(500, f'Failed to generate preview: {str(e)}')


# Scheduled bulk notifications (future feature)
scheduled_notification_model = api.model('ScheduledNotification', {
    'id': fields.Integer(description='Scheduled notification ID'),
    'notification_type': fields.String(description='Type of notification'),
    'subject': fields.String(description='Notification subject'),
    'message': fields.String(description='Notification message'),
    'scheduled_for': fields.DateTime(description='When to send the notification'),
    'status': fields.String(description='Status', enum=['pending', 'sent', 'failed', 'cancelled']),
    'target_count': fields.Integer(description='Number of users targeted'),
    'created_by': fields.Integer(description='Admin user ID who created this'),
    'created_at': fields.DateTime(description='Created timestamp')
})

@notification_ns.route('/bulk/scheduled')
class ScheduledBulkNotifications(Resource):
    @jwt_required()
    @notification_ns.marshal_list_with(scheduled_notification_model)
    @notification_ns.doc(responses={
        200: 'Scheduled notifications retrieved successfully',
        403: 'Admin access required',
        500: 'Failed to retrieve scheduled notifications'
    })
    def get(self):
        """Get list of scheduled bulk notifications (Admin only)"""
        try:
            # Check if user is admin
            check_admin_role(get_jwt_identity())

            # For now, return empty list as this is a future feature
            # In the future, this would query a ScheduledNotification model
            return []

        except Exception as e:
            api.abort(500, f'Failed to retrieve scheduled notifications: {str(e)}')


# Notification statistics for admins
notification_stats_model = api.model('NotificationStats', {
    'total_notifications_sent': fields.Integer(description='Total notifications sent'),
    'emails_sent_today': fields.Integer(description='Emails sent today'),
    'inapp_sent_today': fields.Integer(description='In-app notifications sent today'),
    'notifications_by_type': fields.Raw(description='Breakdown by notification type'),
    'notifications_by_priority': fields.Raw(description='Breakdown by priority'),
    'failed_notifications': fields.Integer(description='Failed notifications count'),
    'average_response_rate': fields.Float(description='Average notification response rate')
})

@notification_ns.route('/stats')
class NotificationStatistics(Resource):
    @jwt_required()
    @notification_ns.marshal_with(notification_stats_model)
    @notification_ns.doc(responses={
        200: 'Statistics retrieved successfully',
        403: 'Admin access required',
        500: 'Failed to retrieve statistics'
    })
    def get(self):
        """Get notification statistics (Admin only)"""
        try:
            # Check if user is admin
            check_admin_role(get_jwt_identity())

            # Get statistics from the notification service
            stats = notification_service.get_notification_stats(30)  # Last 30 days

            # Add today's stats
            today = datetime.utcnow().date()
            today_start = datetime.combine(today, datetime.min.time())

            # This would require tracking email sends in the database
            # For now, return basic stats
            return {
                'total_notifications_sent': stats['total_notifications'],
                'emails_sent_today': 0,  # Would need tracking
                'inapp_sent_today': 0,   # Would need tracking
                'notifications_by_type': stats['notifications_by_type'],
                'notifications_by_priority': stats['notifications_by_priority'],
                'failed_notifications': 0,  # Would need tracking
                'average_response_rate': 0.0  # Would need tracking
            }

        except Exception as e:
            api.abort(500, f'Failed to retrieve statistics: {str(e)}')
