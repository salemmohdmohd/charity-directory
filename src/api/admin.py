
import os
from flask_admin import Admin
from .models import (db, User, Organization, Category, Location, UserBookmark, SearchHistory, OrganizationPhoto, OrganizationSocialLink, ContactMessage, Notification, AuditLog, Advertisement)
from flask_admin.contrib.sqla import ModelView

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='Charity Directory Admin', template_mode='bootstrap3')

    # Core models
    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(Organization, db.session))
    admin.add_view(ModelView(Category, db.session))
    admin.add_view(ModelView(Location, db.session))

    # Relationship models
    admin.add_view(ModelView(UserBookmark, db.session))
    admin.add_view(ModelView(SearchHistory, db.session))

    # Organization related models
    admin.add_view(ModelView(OrganizationPhoto, db.session))
    admin.add_view(ModelView(OrganizationSocialLink, db.session))
    admin.add_view(ModelView(ContactMessage, db.session))

    # System models
    admin.add_view(ModelView(Notification, db.session))
    admin.add_view(ModelView(AuditLog, db.session))
    admin.add_view(ModelView(Advertisement, db.session))