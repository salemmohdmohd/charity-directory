from flask import request, redirect, session, url_for, current_app
from flask_restx import Resource, marshal
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from flask_login import login_user, logout_user, current_user
from ..models import db, User, PasswordReset, EmailVerification, Category, Organization
from ..auth_utils import AuthService, validate_password, validate_email_format
from ..oauth_utils import oauth_service, GoogleAuthError
from ..utils import log_action
from datetime import datetime, timedelta
import os
from ..core import api
from ..schemas import (
    register_parser, registration_response_model, login_parser, user_model,
    email_parser, reset_password_parser, token_parser, change_password_parser,
    org_signup_parser, organization_model
)
from werkzeug.utils import secure_filename
import uuid

auth_ns = api.namespace('auth', description='Authentication operations')

@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.expect(register_parser)
    @auth_ns.marshal_with(registration_response_model, code=201)
    @auth_ns.doc(responses={
        201: 'Registration successful',
        400: 'Validation error',
        409: 'Email already registered',
        500: 'Registration failed'
    })
    def post(self):
        try:
            # Ensure client sent JSON (parsers expect JSON for registration)
            if not request.is_json:
                auth_ns.abort(400, 'Request body must be JSON with Content-Type: application/json')

            try:
                args = register_parser.parse_args()
            except Exception as e:
                from werkzeug.exceptions import BadRequest
                if isinstance(e, BadRequest):
                    auth_ns.abort(400, 'Input payload validation failed: malformed JSON or missing fields')
                raise
            email = args.email.strip().lower()

            if not (valid := validate_email_format(email))[0]:
                auth_ns.abort(400, valid[1])

            if not (valid := validate_password(args.password))[0]:
                auth_ns.abort(400, valid[1])

            if User.query.filter_by(email=email).first():
                auth_ns.abort(409, 'Email already registered')

            user = User(name=args.name.strip(), email=email, role='visitor', is_verified=True)
            user.set_password(args.password)
            db.session.add(user)
            db.session.commit()

            token = AuthService.generate_reset_token()
            db.session.add(EmailVerification(user_id=user.id, token=token, expires_at=datetime.utcnow() + timedelta(days=1)))
            db.session.commit()

            try:
                AuthService.send_verification_email(email, token)
            except Exception as e:
                print(f"Email verification failed: {str(e)}")
                pass

            try:
                from ..notification_service import NotificationService
                notification_service = NotificationService()
                notification_service.send_welcome_email(user.id, token)
                notification_service.send_notification(
                    user_id=user.id,
                    notification_type="email_verification",
                    subject="Please verify your email to get a verified badge",
                    message="Check your email and click the verification link to get your verified badge and unlock all features!",
                    priority="high"
                )
            except Exception as e:
                print(f"Notification sending failed: {str(e)}")
                pass

            log_action(user.id, 'create', 'user', user.id, None, {'email': email, 'name': user.name})
            db.session.commit()

            access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role, 'email': user.email, 'is_verified': user.is_verified})
            refresh_token = create_refresh_token(identity=str(user.id))

            return {
                'message': 'Registration successful! Your account is now active.',
                'user': marshal(user, user_model),
                'access_token': access_token,
                'refresh_token': refresh_token
            }, 201
        except Exception as e:
            db.session.rollback()
            from werkzeug.exceptions import HTTPException
            if isinstance(e, HTTPException):
                raise e
            print(f"Registration error: {str(e)}")
            auth_ns.abort(500, f'Registration failed: {str(e)}')

@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_parser)
    @auth_ns.doc(responses={
        200: 'Login successful',
        401: 'Invalid credentials',
        500: 'Login failed'
    })
    def post(self):
        try:
            # Ensure content-type is JSON for the API login endpoint (parsers expect JSON)
            if not request.is_json:
                auth_ns.abort(400, 'Request body must be JSON with Content-Type: application/json')

            try:
                args = login_parser.parse_args()
            except Exception as e:
                # Provide a concise validation error instead of a generic failure
                from werkzeug.exceptions import BadRequest
                if isinstance(e, BadRequest):
                    auth_ns.abort(400, 'Input payload validation failed: malformed JSON or missing fields')
                raise
            user = User.query.filter_by(email=args.email.strip().lower()).first()
            if not user or not user.check_password(args.password):
                auth_ns.abort(401, 'Invalid credentials')

            user.last_login = datetime.utcnow()
            db.session.commit()

            # Create Flask-Login session
            login_user(user, remember=True)

            access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role, 'email': user.email, 'is_verified': user.is_verified})
            refresh_token = create_refresh_token(identity=str(user.id))

            log_action(user.id, 'login')
            db.session.commit()

            return {
                'message': 'Login successful',
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': marshal(user, user_model)
            }
        except Exception as e:
            if hasattr(e, 'code') and e.code == 401:
                raise e
            print(f"Login error: {str(e)}")
            auth_ns.abort(500, 'Login failed')

@auth_ns.route('/forgot-password')
class ForgotPassword(Resource):
    @auth_ns.expect(email_parser)
    @auth_ns.doc(responses={
        200: 'Reset link sent if account exists',
        500: 'Password reset failed'
    })
    def post(self):
        try:
            args = email_parser.parse_args()
            email = args.email.strip().lower()
            if user := User.query.filter_by(email=email).first():
                PasswordReset.query.filter_by(user_id=user.id, is_used=False).update({'is_used': True})
                token = AuthService.generate_reset_token()
                db.session.add(PasswordReset(user_id=user.id, token=token, expires_at=datetime.utcnow() + timedelta(hours=1)))
                db.session.commit()
                try: AuthService.send_reset_email(user.email, token)
                except: pass
                log_action(user.id, 'password_reset_request')
                db.session.commit()
            return {'message': 'If account exists, reset link sent'}
        except Exception:
            db.session.rollback()
            auth_ns.abort(500, 'Password reset failed')

@auth_ns.route('/reset-password')
class ResetPassword(Resource):
    @auth_ns.expect(reset_password_parser)
    @auth_ns.doc(responses={
        200: 'Password reset successful',
        400: 'Invalid token or password',
        500: 'Password reset failed'
    })
    def post(self):
        try:
            args = reset_password_parser.parse_args()
            if not (valid := validate_password(args.new_password))[0]: auth_ns.abort(400, valid[1])
            reset = PasswordReset.query.filter_by(token=args.token, is_used=False).first()
            if not reset or reset.expires_at < datetime.utcnow(): auth_ns.abort(400, 'Invalid or expired token')
            reset.user.set_password(args.new_password)
            reset.is_used = True
            db.session.commit()
            log_action(reset.user.id, 'password_reset')
            db.session.commit()
            return {'message': 'Password reset successful'}
        except Exception:
            db.session.rollback()
            auth_ns.abort(500, 'Password reset failed')

@auth_ns.route('/verify-email')
class VerifyEmail(Resource):
    @auth_ns.expect(token_parser)
    @auth_ns.doc(responses={
        200: 'Email verified successfully',
        400: 'Invalid or expired token',
        500: 'Verification failed'
    })
    def post(self):
        try:
            args = token_parser.parse_args()
            verification = EmailVerification.query.filter_by(token=args.token, is_used=False).first()
            if not verification or verification.expires_at < datetime.utcnow(): auth_ns.abort(400, 'Invalid or expired token')
            verification.user.is_verified = True
            verification.is_used = True

            try:
                from ..notification_service import NotificationService
                notification_service = NotificationService()
                notification_service.send_notification(
                    user_id=verification.user.id,
                    notification_type="security_alert",
                    subject=" Email verified successfully!",
                    message="Congratulations! Your email has been verified and you now have a verified badge. You can now access all features on Charity Directory.",
                    priority="high"
                )
            except Exception as e:
                print(f"Verification notification failed: {str(e)}")
                pass

            db.session.commit()
            log_action(verification.user.id, 'email_verified')
            db.session.commit()
            return {'message': 'Email verified successfully'}
        except Exception:
            db.session.rollback()
            auth_ns.abort(500, 'Verification failed')

@auth_ns.route('/me')
class CurrentUser(Resource):
    @jwt_required()
    @auth_ns.marshal_with(user_model)
    @auth_ns.doc(responses={
        200: 'Current user information',
        404: 'User not found'
    })
    def get(self):
        from sqlalchemy.orm import joinedload
        user_id = int(get_jwt_identity())
        # Eager load administered_orgs relationship to make it available for serialization
        user = User.query.options(joinedload(User.administered_orgs)).get(user_id) or auth_ns.abort(404, 'User not found')
        return user

@auth_ns.route('/logout')
class Logout(Resource):
    @jwt_required()
    @auth_ns.doc(responses={
        200: 'Successfully logged out',
        401: 'Invalid token'
    })
    def post(self):
        jwt_data = get_jwt()
        jti = jwt_data['jti']
        current_app.blacklist_token(jti)

        # Also logout from Flask-Login session
        logout_user()

        return {'message': 'Successfully logged out'}, 200

@auth_ns.route('/refresh')
class RefreshToken(Resource):
    @jwt_required(refresh=True)
    @auth_ns.doc(responses={
        200: 'New access token generated',
        401: 'Invalid refresh token'
    })
    def post(self):
        current_user_id = get_jwt_identity()
        new_token = create_access_token(identity=str(current_user_id))
        return {'access_token': new_token}, 200


@auth_ns.route('/change-password')
class ChangePassword(Resource):
    @jwt_required()
    @auth_ns.expect(change_password_parser)
    @auth_ns.doc(responses={
        200: 'Password changed successfully',
        400: 'Invalid new password format',
        401: 'Current password incorrect',
        404: 'User not found',
        500: 'Password change failed'
    })
    def post(self):
        try:
            args = change_password_parser.parse_args()
            user = User.query.get(get_jwt_identity())
            if not user:
                auth_ns.abort(404, 'User not found')
            if not user.check_password(args.current_password):
                auth_ns.abort(401, 'Current password is incorrect')
            if not (valid := validate_password(args.new_password))[0]:
                auth_ns.abort(400, valid[1])
            user.set_password(args.new_password)
            db.session.commit()
            log_action(user.id, 'password_change')
            db.session.commit()
            return {'message': 'Password changed successfully'}
        except Exception as e:
            db.session.rollback()
            from werkzeug.exceptions import HTTPException
            if isinstance(e, HTTPException):
                raise e
            auth_ns.abort(500, 'Password change failed')

@auth_ns.route('/google')
class GoogleOAuth(Resource):
    @auth_ns.doc(responses={
        302: 'Redirect to Google OAuth authorization page',
        500: 'OAuth initialization failed'
    })
    def get(self):
        try:
            state = oauth_service.generate_state()
            session['oauth_state'] = state
            authorization_url, _ = oauth_service.get_authorization_url(state)
            return redirect(authorization_url)
        except GoogleAuthError as e:
            auth_ns.abort(500, f'OAuth initialization failed: {str(e)}')
        except Exception as e:
            auth_ns.abort(500, f'Unexpected error: {str(e)}')

@auth_ns.route('/google/callback')
class GoogleOAuthCallback(Resource):
    @auth_ns.doc(responses={
        200: 'OAuth callback processed successfully',
        400: 'Invalid OAuth callback parameters',
        401: 'OAuth authentication failed',
        500: 'OAuth callback processing failed'
    })
    def get(self):
        try:
            authorization_code = request.args.get('code')
            state = request.args.get('state')
            error = request.args.get('error')

            frontend_url = os.getenv('FRONTEND_URL')
            if not frontend_url:
                auth_ns.abort(500, 'FRONTEND_URL environment variable is not set.')

            if error:
                return redirect(f'{frontend_url}/login?error={error}')

            if not authorization_code:
                return redirect(f'{frontend_url}/login?error=no_code')

            if os.getenv('FLASK_DEBUG') != '1':
                if session.get('oauth_state') != state:
                    session.pop('oauth_state', None)
                    return redirect(f'{frontend_url}/login?error=invalid_state')

            credentials = oauth_service.exchange_code_for_token(authorization_code, state)
            user_info = oauth_service.get_user_info_from_credentials(credentials)
            user = self._find_or_create_user(user_info)

            access_token = create_access_token(identity=str(user.id))
            refresh_token = create_refresh_token(identity=str(user.id))

            user.last_login = datetime.utcnow()
            db.session.commit()
            log_action(user.id, 'oauth_login', 'auth', user.id, None, {'provider': 'google'})
            db.session.commit()

            session.pop('oauth_state', None)

            redirect_url = f'{frontend_url}/auth/callback?token={access_token}&refresh_token={refresh_token}&user_id={user.id}'
            return redirect(redirect_url)

        except GoogleAuthError as e:
            return redirect(f'{os.getenv("FRONTEND_URL")}/login?error=oauth_error&message={str(e)}')
        except Exception as e:
            db.session.rollback()
            return redirect(f'{os.getenv("FRONTEND_URL")}/login?error=server_error&message={str(e)}')

    def _find_or_create_user(self, user_info):
        user = User.query.filter_by(google_id=user_info['google_id']).first()
        if user:
            return user

        user = User.query.filter_by(email=user_info['email']).first()
        if user:
            user.google_id = user_info['google_id']
            db.session.commit()
            return user

        user = User(
            name=user_info.get('name', ''),
            email=user_info['email'],
            google_id=user_info['google_id'],
            profile_picture=user_info.get('profile_picture', ''),
            is_verified=True,
            role='visitor'
        )
        db.session.add(user)
        db.session.commit()
        log_action(user.id, 'user_created', 'user', user.id, None, {'method': 'oauth_google'})
        db.session.commit()
        return user
