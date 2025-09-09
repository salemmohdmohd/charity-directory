from flask import request
from flask_restx import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..core import api
from ..schemas import (
    user_profile_model, user_activity_model, user_bookmarks_model,
    user_donations_model, user_reviews_model, user_notifications_model,
    user_settings_model
)
from ..models import db, User, ActivityLog, Bookmark, Donation, Review, Notification, UserSettings
from ..utils import (
    serialize_user, serialize_activity, serialize_bookmark,
    serialize_donation, serialize_review, serialize_notification,
    serialize_user_settings
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
