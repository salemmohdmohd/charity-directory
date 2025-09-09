"""
Google OAuth 2.0 Configuration and Utilities
Handles Google OAuth client setup, token verification, and user info retrieval
"""

import os
import json
from google.auth.transport import requests
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from google.auth.exceptions import GoogleAuthError
import secrets
import string

class GoogleOAuthService:
    """Service class for handling Google OAuth 2.0 operations"""

    def __init__(self):
        # OAuth configuration from environment variables
        self.client_id = os.getenv('GOOGLE_OAUTH_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_OAUTH_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GOOGLE_OAUTH_REDIRECT_URI')

        # OAuth scopes - use simple names
        self.scopes = [
            'openid',
            'email',
            'profile'
        ]

        # Validate required environment variables
        self.oauth_enabled = bool(self.client_id and self.client_secret and self.redirect_uri)
        if not self.oauth_enabled:
            print("Warning: Google OAuth credentials not found or are incomplete. OAuth features will be disabled.")

    def get_client_config(self):
        """Get Google OAuth client configuration"""
        return {
            "web": {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [self.redirect_uri]
            }
        }

    def create_flow(self, state=None):
        """Create OAuth flow for authentication"""
        if not self.oauth_enabled:
            raise GoogleAuthError("Google OAuth is not configured")

        try:
            flow = Flow.from_client_config(
                self.get_client_config(),
                scopes=self.scopes
            )
            flow.redirect_uri = self.redirect_uri

            if state:
                flow.state = state

            return flow
        except Exception as e:
            raise GoogleAuthError(f"Failed to create OAuth flow: {str(e)}")

    def get_authorization_url(self, state=None):
        """Get Google OAuth authorization URL"""
        try:
            flow = self.create_flow(state)
            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                prompt='consent'
            )
            return authorization_url, state
        except Exception as e:
            raise GoogleAuthError(f"Failed to get authorization URL: {str(e)}")

    def exchange_code_for_token(self, authorization_code, state=None):
        """Exchange authorization code for access token using direct HTTP request"""
        try:
            import requests

            # Direct token exchange with Google without scope validation
            token_url = "https://oauth2.googleapis.com/token"
            data = {
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'code': authorization_code,
                'grant_type': 'authorization_code',
                'redirect_uri': self.redirect_uri
            }

            response = requests.post(token_url, data=data)
            response.raise_for_status()

            token_data = response.json()

            # Create a simple credentials object with the token data
            class SimpleCredentials:
                def __init__(self, token_data):
                    self.token = token_data.get('access_token')
                    self.id_token = token_data.get('id_token')
                    self.refresh_token = token_data.get('refresh_token')

            return SimpleCredentials(token_data)

        except Exception as e:
            raise GoogleAuthError(f"Failed to exchange code for token: {str(e)}")

    def get_user_info_from_credentials(self, credentials):
        """Get user info from OAuth credentials"""
        try:
            # Use the access token to get user info from Google's API
            # This avoids time-sensitive ID token validation issues
            import requests
            user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {'Authorization': f'Bearer {credentials.token}'}

            response = requests.get(user_info_url, headers=headers)
            response.raise_for_status()

            user_data = response.json()

            return {
                'google_id': user_data.get('id'),
                'email': user_data.get('email'),
                'name': user_data.get('name', ''),
                'profile_picture': user_data.get('picture', ''),
                'email_verified': user_data.get('verified_email', False)
            }

        except Exception as e:
            raise GoogleAuthError(f"Failed to get user info: {str(e)}")

    def verify_token(self, token):
        """Verify Google ID token and return user info"""
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                self.client_id
            )

            # Check issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Invalid token issuer')

            return {
                'google_id': idinfo['sub'],
                'email': idinfo['email'],
                'name': idinfo.get('name', ''),
                'profile_picture': idinfo.get('picture', ''),
                'email_verified': idinfo.get('email_verified', False)
            }
        except ValueError as e:
            raise GoogleAuthError(f"Invalid token: {str(e)}")
        except Exception as e:
            raise GoogleAuthError(f"Token verification failed: {str(e)}")

    def get_user_info_from_credentials(self, credentials):
        """Get user info from OAuth credentials using access token API call"""
        try:
            # Use the access token to get user info from Google's API
            # This avoids time-sensitive ID token validation issues
            import requests
            user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {'Authorization': f'Bearer {credentials.token}'}

            print(f"Making API call to Google userinfo with access token")
            response = requests.get(user_info_url, headers=headers)
            response.raise_for_status()

            user_data = response.json()
            print(f"Successfully retrieved user data from Google API: {user_data}")

            return {
                'google_id': user_data.get('id'),
                'email': user_data.get('email'),
                'name': user_data.get('name', ''),
                'profile_picture': user_data.get('picture', ''),
                'email_verified': user_data.get('verified_email', False)
            }

        except Exception as e:
            print(f"Error getting user info via API call: {str(e)}")
            raise GoogleAuthError(f"Failed to get user info: {str(e)}")

    @staticmethod
    def generate_state():
        """Generate a secure random state parameter for OAuth"""
        return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

# Global instance
oauth_service = GoogleOAuthService()
