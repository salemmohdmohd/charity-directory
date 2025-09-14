from flask import request
from flask_restx import Resource
from flask_jwt_extended import jwt_required
from ..core import api
from ..models import db, Advertisement
from ..utils import serialize_advertisement

ad_ns = api.namespace('advertisements', description='Advertisement operations')


@ad_ns.route('')
class AdvertisementList(Resource):
    def get(self):
        """List advertisements, optionally filtered by placement and only active ones by default."""
        placement = request.args.get('placement')
        only_active = request.args.get('only_active', 'true').lower() in ['1', 'true', 'yes']

        query = Advertisement.query
        if placement:
            query = query.filter_by(placement=placement)
        if only_active:
            query = query.filter_by(is_active=True)

        ads = query.order_by(Advertisement.created_at.desc()).all()
        return { 'advertisements': [serialize_advertisement(a) for a in ads] }


@ad_ns.route('/<int:ad_id>/click')
class AdvertisementClick(Resource):
    def post(self, ad_id):
        ad = Advertisement.query.get(ad_id)
        if not ad:
            return { 'message': 'Advertisement not found' }, 404
        try:
            ad.track_click()
            db.session.commit()
            return { 'message': 'Click tracked', 'performance': ad.get_performance() }
        except Exception as e:
            db.session.rollback()
            return { 'message': f'Failed to track click: {e}' }, 500


@ad_ns.route('/<int:ad_id>/impression')
class AdvertisementImpression(Resource):
    def post(self, ad_id):
        ad = Advertisement.query.get(ad_id)
        if not ad:
            return { 'message': 'Advertisement not found' }, 404
        try:
            ad.track_impression()
            db.session.commit()
            return { 'message': 'Impression tracked', 'performance': ad.get_performance() }
        except Exception as e:
            db.session.rollback()
            return { 'message': f'Failed to track impression: {e}' }, 500
from flask import current_app
from flask_restx import Resource, fields
from ..models import db, Advertisement
from datetime import datetime
from sqlalchemy import desc
from ..core import api
from ..schemas import ad_parser, advertising_inquiry_parser
from ..auth_utils import validate_email_format
import os

ad_ns = api.namespace('advertisements', description='Advertisement operations')

@ad_ns.route('')
class AdvertisementList(Resource):
    @ad_ns.expect(ad_parser)
    @ad_ns.doc(responses={
        200: 'Active advertisements retrieved successfully',
        500: 'Failed to retrieve advertisements'
    })
    def get(self):
        try:
            args = ad_parser.parse_args()
            query = Advertisement.query.filter(
                Advertisement.is_active == True,
                Advertisement.start_date <= datetime.utcnow().date(),
                Advertisement.end_date >= datetime.utcnow().date()
            )

            if args.get('placement'):
                query = query.filter(Advertisement.placement == args.get('placement'))
            if args.get('ad_type'):
                query = query.filter(Advertisement.ad_type == args.get('ad_type'))

            limit = min(args.get('limit', 5), 20)
            ads = query.order_by(desc(Advertisement.created_at)).limit(limit).all()

            return {
                'advertisements': [{
                    'id': a.id,
                    'title': a.title,
                    'description': a.description,
                    'image_url': a.image_url,
                    'link_url': a.link_url,
                    'ad_type': a.ad_type,
                    'placement': a.placement,
                    'organization': {
                        'id': a.organization.id,
                        'name': a.organization.name
                    } if a.organization_id else None
                } for a in ads]
            }
        except Exception as e:
            current_app.logger.error(f"Failed to retrieve advertisements: {e}")
            api.abort(500, 'Failed to retrieve advertisements')

@ad_ns.route('/<int:ad_id>/click')
class AdvertisementClick(Resource):
    @ad_ns.marshal_with(api.model('ClickResponse', {
        'message': fields.String(description='Success message'),
        'target_url': fields.String(description='Advertisement target URL'),
        'clicks_count': fields.Integer(description='Total click count')
    }))
    @ad_ns.doc(responses={
        200: 'Click tracked successfully',
        400: 'Advertisement not currently active',
        404: 'Advertisement not found or inactive',
        500: 'Failed to track click'
    })
    def post(self, ad_id):
        try:
            ad = Advertisement.query.get(ad_id)
            if not ad or not ad.is_active:
                api.abort(404, 'Ad not found or inactive')
            if not (ad.start_date <= datetime.utcnow().date() <= ad.end_date):
                api.abort(400, 'Ad not currently active')
            ad.clicks_count = (ad.clicks_count or 0) + 1
            db.session.commit()
            return {'message': 'Click tracked', 'target_url': ad.link_url, 'clicks_count': ad.clicks_count}
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Failed to track click for ad {ad_id}: {e}")
            api.abort(500, 'Failed to track click')

@ad_ns.route('/<int:ad_id>/impression')
class AdvertisementImpression(Resource):
    def post(self, ad_id):
        try:
            ad = Advertisement.query.get(ad_id)
            if not ad or not ad.is_active:
                return {'message': 'Ad not found or inactive'}, 404
            if not (ad.start_date <= datetime.utcnow().date() <= ad.end_date):
                return {'message': 'Ad not currently active'}, 400
            ad.impressions_count = (ad.impressions_count or 0) + 1
            db.session.commit()
            return {'message': 'Impression tracked', 'impressions_count': ad.impressions_count}
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Failed to track impression for ad {ad_id}: {e}")
            api.abort(500, 'Failed to track impression')

@ad_ns.route('/inquiry')
class AdvertisingInquiry(Resource):
    @ad_ns.expect(advertising_inquiry_parser)
    @ad_ns.doc(responses={
        201: 'Inquiry submitted successfully',
        400: 'Invalid input data',
        500: 'Server error'
    })
    def post(self):
        """Submit an advertising inquiry"""
        try:
            args = advertising_inquiry_parser.parse_args()

            email = args.email.strip().lower()
            if not validate_email_format(email)[0]:
                api.abort(400, 'Invalid email format')

            inquiry_data = {
                'organization_name': args.organizationName.strip(),
                'contact_name': args.contactName.strip(),
                'email': email,
                'phone': args.phone.strip() if args.phone else None,
                'organization_type': args.organizationType,
                'website': args.website.strip() if args.website else None,
                'ad_package': args.adPackage,
                'budget': args.budget,
                'campaign_goals': args.campaignGoals.strip() if args.campaignGoals else None,
                'target_audience': args.targetAudience.strip() if args.targetAudience else None,
                'message': args.message.strip() if args.message else None,
                'submitted_at': datetime.utcnow()
            }

            from ..notification_service import NotificationService
            notification_service = NotificationService()

            try:
                partnerships_email = os.getenv('PARTNERSHIPS_EMAIL', 'partnerships@Causebook.com')
                notification_service.send_advertising_inquiry_notification(
                    partnerships_email,
                    inquiry_data
                )
            except Exception as e:
                current_app.logger.error(f"Failed to send advertising inquiry email: {str(e)}")

            try:
                notification_service.send_advertising_inquiry_confirmation(
                    email,
                    args.contactName.strip(),
                    inquiry_data
                )
            except Exception as e:
                current_app.logger.error(f"Failed to send inquiry confirmation email: {str(e)}")

            current_app.logger.info(f"Advertising inquiry submitted by {email} for {args.organizationName}")

            return {
                'message': 'Advertising inquiry submitted successfully',
                'inquiry_id': f"ADV-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
                'status': 'submitted'
            }, 201

        except Exception as e:
            current_app.logger.error(f"Error submitting advertising inquiry: {str(e)}")
            api.abort(500, 'Failed to submit inquiry')
