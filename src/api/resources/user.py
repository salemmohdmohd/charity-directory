from flask import request
from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..core import api
from sqlalchemy.orm import joinedload
from ..schemas import (
    user_profile_model, user_activity_model, user_bookmarks_model,
    user_donations_model, user_reviews_model, user_notifications_model,
    user_settings_model, organization_model
)
from ..models import db, User, ActivityLog, Bookmark, Donation, Review, Notification, UserSettings, Organization
from ..utils import (
    serialize_user, serialize_activity, serialize_bookmark,
    serialize_donation, serialize_review, serialize_notification,
    serialize_user_settings, serialize_organization
)

users_ns = api.namespace('users', description='User operations')

@users_ns.route('/profile')
class UserProfile(Resource):
    @jwt_required()
    @users_ns.marshal_with(user_profile_model)
    def get(self):
        user = User.query.get(get_jwt_identity())
        if not user: users_ns.abort(404, 'User not found')
        return serialize_user(user)

    @jwt_required()
    @users_ns.expect(user_profile_model)
    @users_ns.marshal_with(user_profile_model)
    def put(self):
        user = User.query.get(get_jwt_identity())
        if not user: users_ns.abort(404, 'User not found')
        data = request.get_json()
        user.full_name = data.get('full_name', user.full_name)
        user.profile_picture = data.get('profile_picture', user.profile_picture)
        user.bio = data.get('bio', user.bio)
        db.session.commit()
        return serialize_user(user)

@users_ns.route('/activity')
class UserActivity(Resource):
    @jwt_required()
    @users_ns.marshal_list_with(user_activity_model)
    def get(self):
        return [serialize_activity(a) for a in ActivityLog.query.filter_by(user_id=get_jwt_identity()).all()]

@users_ns.route('/bookmarks')
class UserBookmarks(Resource):
    @jwt_required()
    @users_ns.marshal_list_with(user_bookmarks_model)
    def get(self):
        return [serialize_bookmark(b) for b in Bookmark.query.filter_by(user_id=get_jwt_identity()).all()]

@users_ns.route('/donations')
class UserDonations(Resource):
    @jwt_required()
    @users_ns.marshal_list_with(user_donations_model)
    def get(self):
        return [serialize_donation(d) for d in Donation.query.filter_by(user_id=get_jwt_identity()).all()]

@users_ns.route('/reviews')
class UserReviews(Resource):
    @jwt_required()
    @users_ns.marshal_list_with(user_reviews_model)
    def get(self):
        return [serialize_review(r) for r in Review.query.filter_by(user_id=get_jwt_identity()).all()]

@users_ns.route('/notifications')
class UserNotifications(Resource):
    @jwt_required()
    @users_ns.marshal_list_with(user_notifications_model)
    def get(self):
        return [serialize_notification(n) for n in Notification.query.filter_by(user_id=get_jwt_identity()).all()]

@users_ns.route('/settings')
class UserSettingsResource(Resource):
    @jwt_required()
    @users_ns.marshal_with(user_settings_model)
    def get(self):
        settings = UserSettings.query.filter_by(user_id=get_jwt_identity()).first()
        if not settings:
            settings = UserSettings(user_id=get_jwt_identity())
            db.session.add(settings)
            db.session.commit()
        return serialize_user_settings(settings)

    @jwt_required()
    @users_ns.expect(user_settings_model)
    @users_ns.marshal_with(user_settings_model)
    def put(self):
        settings = UserSettings.query.filter_by(user_id=get_jwt_identity()).first()
        if not settings: users_ns.abort(404, 'Settings not found')
        data = request.get_json()
        for key, value in data.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        db.session.commit()
        return serialize_user_settings(settings)

@users_ns.route('/organization')
class UserOrganization(Resource):
    @jwt_required()
    @users_ns.doc(responses={
        200: 'Organization details retrieved successfully',
        404: 'No organization found for the current user',
        500: 'Failed to fetch organization'
    })
    def get(self):
        """Get the organization associated with the current user."""
        try:
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                users_ns.abort(404, 'User not found')

            # Check if the user is an organization admin
            if user.role != 'org_admin' and user.role != 'platform_admin':
                users_ns.abort(403, 'User is not an organization administrator')

            # Get the organization administered by this user
            organization = Organization.query.options(
                joinedload(Organization.photos),
                joinedload(Organization.social_links),
                joinedload(Organization.category),
                joinedload(Organization.location)
            ).filter_by(admin_user_id=user_id).first()

            if not organization:
                users_ns.abort(404, 'No organization found for this user')

            return serialize_organization(organization)
        except Exception as e:
            users_ns.abort(500, f'Failed to fetch organization: {str(e)}')

@users_ns.route('/me/organizations')
class UserOrganizations(Resource):
    @jwt_required()
    @users_ns.doc(responses={
        200: 'Organizations retrieved successfully',
        404: 'No organizations found for the current user',
        500: 'Failed to fetch organizations'
    })
    def get(self):
        """Get organizations associated with the current user (for frontend compatibility)."""
        try:
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                users_ns.abort(404, 'User not found')

            # Check if the user is an organization admin
            if user.role != 'org_admin' and user.role != 'platform_admin':
                # Return empty list for non-admin users instead of error
                return []

            # Get the organizations administered by this user
            organizations = Organization.query.options(
                joinedload(Organization.photos),
                joinedload(Organization.social_links),
                joinedload(Organization.category),
                joinedload(Organization.location)
            ).filter_by(admin_user_id=user_id).all()

            # Return as an object with organizations array to match frontend expectations
            return {
                "organizations": [serialize_organization(org) for org in organizations]
            }
        except Exception as e:
            users_ns.abort(500, f'Failed to fetch organizations: {str(e)}')
