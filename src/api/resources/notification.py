from flask_restx import Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..core import api
from ..schemas import pagination_parser, notification_model, message_response_model
from ..models import db, Notification
from ..utils import paginate
from sqlalchemy import desc

notification_ns = api.namespace('notifications', description='Notification operations')

@notification_ns.route('')
class NotificationList(Resource):
    @jwt_required()
    @notification_ns.expect(pagination_parser)
    @notification_ns.doc(responses={200: 'Notifications retrieved successfully'})
    def get(self):
        user_id = get_jwt_identity()
        args = pagination_parser.parse_args()
        query = Notification.query.filter_by(user_id=user_id).order_by(desc(Notification.created_at))

        items, pag = paginate(query, args.page, args.per_page)

        notifications_data = [
            {
                'id': n.id,
                'title': n.title,
                'message': n.message,
                'notification_type': n.notification_type,
                'priority': n.priority,
                'is_read': n.is_read,
                'read_at': n.read_at.isoformat() if n.read_at else None,
                'email_sent': n.email_sent,
                'email_sent_at': n.email_sent_at.isoformat() if n.email_sent_at else None,
                'created_at': n.created_at.isoformat(),
                'updated_at': n.updated_at.isoformat() if n.updated_at else None
            } for n in items
        ]

        return {'notifications': notifications_data, 'pagination': pag}

@notification_ns.route('/<int:notification_id>/read')
class NotificationRead(Resource):
    @jwt_required()
    @notification_ns.marshal_with(message_response_model)
    @notification_ns.doc(responses={
        200: 'Notification marked as read',
        404: 'Notification not found',
        500: 'Failed to mark notification as read'
    })
    def put(self, notification_id):
        try:
            user_id = get_jwt_identity()
            notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
            if not notif:
                api.abort(404, 'Notification not found')

            notif.mark_as_read()
            db.session.commit()
            return {'message': 'Marked as read'}
        except Exception as e:
            db.session.rollback()
            api.abort(500, f'Failed to mark as read: {str(e)}')

@notification_ns.route('/unread-count')
class UnreadCount(Resource):
    @jwt_required()
    @notification_ns.marshal_with(api.model('UnreadCountResponse', {
        'unread_count': fields.Integer(description='Number of unread notifications')
    }))
    @notification_ns.doc(responses={200: 'Unread notification count retrieved successfully'})
    def get(self):
        user_id = get_jwt_identity()
        count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
        return {'unread_count': count}
