from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from sqlalchemy import String, Boolean
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True)  # Temporarily nullable for migration
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for OAuth users
    role = db.Column(db.String(20), default='visitor')  # visitor / org_admin / platform_admin
    is_verified = db.Column(db.Boolean, default=True)
    google_id = db.Column(db.String(50), nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

    # Relationships
    bookmarks = db.relationship('UserBookmark', back_populates='user', cascade='all, delete-orphan')
    search_history = db.relationship('SearchHistory', back_populates='user', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', back_populates='user', cascade='all, delete-orphan')
    notification_preferences = db.relationship('NotificationPreference', back_populates='user', cascade='all, delete-orphan', uselist=False)
    audit_logs = db.relationship('AuditLog', back_populates='user', cascade='all, delete-orphan')
    administered_orgs = db.relationship('Organization', foreign_keys='Organization.admin_user_id', back_populates='admin_user')
    approved_orgs = db.relationship('Organization', foreign_keys='Organization.approved_by', back_populates='approver')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # Flask-Login required methods
    def get_id(self):
        """Return the user ID as a string (required by Flask-Login)"""
        return str(self.id)

    @property
    def is_authenticated(self):
        """Return True if the user is authenticated"""
        return True

    @property
    def is_active(self):
        """Return True if the user is active (not banned/suspended)"""
        return True  # You can add a is_active column later if needed

    @property
    def is_anonymous(self):
        """Return False since this is not an anonymous user"""
        return False

    def is_admin(self):
        """Check if user is platform admin"""
        return self.role == 'platform_admin'

    def is_org_admin(self):
        """Check if user is organization admin"""
        return self.role == 'org_admin'


class Organization(db.Model):
    __tablename__ = 'organizations'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    mission = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=True)
    address = db.Column(db.Text, nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(150), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    donation_link = db.Column(db.String(255), nullable=True)
    logo_url = db.Column(db.String(255), nullable=True)
    operating_hours = db.Column(db.Text, nullable=True)
    established_year = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending / approved / rejected / flagged
    verification_level = db.Column(db.String(20), default='basic')  # basic / verified / premium
    view_count = db.Column(db.Integer, default=0)
    bookmark_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign Keys
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=True)
    admin_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    approval_date = db.Column(db.DateTime, nullable=True)
    rejection_reason = db.Column(db.Text, nullable=True)
    is_verified = db.Column(db.Boolean, default=False)

    # Relationships
    bookmarks = db.relationship('UserBookmark', back_populates='organization', cascade='all, delete-orphan')
    photos = db.relationship('OrganizationPhoto', back_populates='organization', cascade='all, delete-orphan')
    social_links = db.relationship('OrganizationSocialLink', back_populates='organization', cascade='all, delete-orphan')
    contact_messages = db.relationship('ContactMessage', back_populates='organization', cascade='all, delete-orphan')
    admin_user = db.relationship('User', foreign_keys=[admin_user_id], back_populates='administered_orgs')
    approver = db.relationship('User', foreign_keys=[approved_by], back_populates='approved_orgs')



class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    icon_url = db.Column(db.String(255), nullable=True)
    color_code = db.Column(db.String(7), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organizations = db.relationship('Organization', backref='category', lazy=True)

class Location(db.Model):
    __tablename__ = 'locations'
    id = db.Column(db.Integer, primary_key=True)
    country = db.Column(db.String(100), nullable=False)
    state_province = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20), nullable=True)
    latitude = db.Column(db.Numeric(10, 8), nullable=True)
    longitude = db.Column(db.Numeric(11, 8), nullable=True)
    timezone = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organizations = db.relationship('Organization', backref='location', lazy=True)



class UserBookmark(db.Model):
    __tablename__ = 'user_bookmarks'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='bookmarks')
    organization = db.relationship('Organization', back_populates='bookmarks')

    # Unique constraint to prevent duplicate bookmarks
    __table_args__ = (db.UniqueConstraint('user_id', 'organization_id', name='unique_user_organization_bookmark'),)


class SearchHistory(db.Model):
    __tablename__ = 'search_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    search_query = db.Column(db.String(255), nullable=False)
    filters_applied = db.Column(db.JSON, nullable=True)
    results_count = db.Column(db.Integer, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    searched_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='search_history')


# New models from UML that were missing
class OrganizationPhoto(db.Model):
    __tablename__ = 'organization_photos'
    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    alt_text = db.Column(db.String(255), nullable=True)
    is_primary = db.Column(db.Boolean, default=False)
    sort_order = db.Column(db.Integer, default=0)
    file_size = db.Column(db.Integer, nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    organization = db.relationship('Organization', back_populates='photos')


class OrganizationSocialLink(db.Model):
    __tablename__ = 'organization_social_links'
    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    platform = db.Column(db.String(50), nullable=False)  # facebook / instagram / twitter / linkedin / youtube
    url = db.Column(db.String(500), nullable=False)
    # Relationships
    organization = db.relationship('Organization', back_populates='social_links')


class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'
    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    sender_email = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    organization = db.relationship('Organization', back_populates='contact_messages')


class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=True)  # Notification title
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), default='general')  # Type of notification
    priority = db.Column(db.String(20), default='normal')  # Priority level
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime, nullable=True)  # When it was read
    email_sent = db.Column(db.Boolean, default=False)  # Whether email was sent
    email_sent_at = db.Column(db.DateTime, nullable=True)  # When email was sent
    data = db.Column(db.Text, nullable=True)  # JSON data for additional context
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='notifications')

    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.read_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()


class NotificationPreference(db.Model):
    __tablename__ = 'notification_preferences'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)

    # Email notification preferences
    email_welcome = db.Column(db.Boolean, default=True)
    email_organization_updates = db.Column(db.Boolean, default=True)
    email_contact_messages = db.Column(db.Boolean, default=True)
    email_system_announcements = db.Column(db.Boolean, default=True)
    email_security_alerts = db.Column(db.Boolean, default=True)
    email_bookmark_digest = db.Column(db.Boolean, default=False)  # Weekly digest
    email_reminders = db.Column(db.Boolean, default=True)

    # In-app notification preferences
    inapp_welcome = db.Column(db.Boolean, default=True)
    inapp_organization_updates = db.Column(db.Boolean, default=True)
    inapp_contact_messages = db.Column(db.Boolean, default=True)
    inapp_system_announcements = db.Column(db.Boolean, default=True)
    inapp_security_alerts = db.Column(db.Boolean, default=True)
    inapp_bookmark_digest = db.Column(db.Boolean, default=True)
    inapp_reminders = db.Column(db.Boolean, default=True)

    # General preferences
    frequency_digest = db.Column(db.String(20), default='weekly')  # daily, weekly, monthly
    timezone = db.Column(db.String(50), default='UTC')
    language = db.Column(db.String(10), default='en')

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='notification_preferences', uselist=False)


class AuditLog(db.Model):
    __tablename__ = 'audit_log'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)  # create / update / delete / approve / reject
    target_type = db.Column(db.String(50), nullable=False)  # organization / user / category
    target_id = db.Column(db.Integer, nullable=False)
    old_values = db.Column(db.JSON, nullable=True)
    new_values = db.Column(db.JSON, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='audit_logs')


class ActivityLog(db.Model):
    __tablename__ = 'activity_log'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)
    details = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('activity_logs', cascade='all, delete-orphan'))

class Bookmark(db.Model):
    __tablename__ = 'bookmarks'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('user_bookmarks', cascade='all, delete-orphan'))
    organization = db.relationship('Organization', backref=db.backref('organization_bookmarks', cascade='all, delete-orphan'))


class Advertisement(db.Model):
    __tablename__ = 'advertisements'
    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    target_url = db.Column(db.String(500), nullable=True)
    ad_type = db.Column(db.String(50), nullable=False, default='sponsored')
    placement = db.Column(db.String(50), nullable=False, default='home')
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    budget = db.Column(db.Numeric(10, 2), nullable=True)
    clicks_count = db.Column(db.Integer, default=0)
    impressions_count = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    organization = db.relationship('Organization', backref=db.backref('advertisements', cascade='all, delete-orphan'))

    # Helper methods
    def activate(self):
        self.is_active = True

    def deactivate(self):
        self.is_active = False

    def track_click(self):
        try:
            self.clicks_count = (self.clicks_count or 0) + 1
        except Exception:
            self.clicks_count = 1

    def track_impression(self):
        try:
            self.impressions_count = (self.impressions_count or 0) + 1
        except Exception:
            self.impressions_count = 1

    def get_performance(self):
        ctr = 0.0
        try:
            if self.impressions_count and self.impressions_count > 0:
                ctr = (self.clicks_count / float(self.impressions_count)) * 100.0
        except Exception:
            ctr = 0.0
        return {
            'clicks': self.clicks_count,
            'impressions': self.impressions_count,
            'ctr_percent': round(ctr, 2)
        }

class Donation(db.Model):
    __tablename__ = 'donations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), nullable=False, default='USD')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('donations', cascade='all, delete-orphan'))
    organization = db.relationship('Organization', backref=db.backref('donations', cascade='all, delete-orphan'))

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('reviews', cascade='all, delete-orphan'))
    organization = db.relationship('Organization', backref=db.backref('reviews', cascade='all, delete-orphan'))

class UserSettings(db.Model):
    __tablename__ = 'user_settings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    email_notifications = db.Column(db.Boolean, default=True)
    push_notifications = db.Column(db.Boolean, default=True)
    theme = db.Column(db.String(20), default='light')
    user = db.relationship('User', backref=db.backref('settings', uselist=False, cascade='all, delete-orphan'))

# Authentication-related models
class PasswordReset(db.Model):
    __tablename__ = 'password_resets'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(100), nullable=False, unique=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('password_resets', cascade='all, delete-orphan'))

class EmailVerification(db.Model):
    __tablename__ = 'email_verifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(100), nullable=False, unique=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref=db.backref('email_verifications', cascade='all, delete-orphan'))