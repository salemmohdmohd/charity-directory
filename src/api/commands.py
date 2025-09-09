
from api.models import db, User
import click
from .seed import seed_all

"""
Usage:
    cd src
    pipenv run python -c "from app import app; from api.commands import run_insert_test_users; with app.app_context(): run_insert_test_users(5)"
"""

def setup_commands(app):
    @app.cli.command("seed")
    def seed_command():
        """Seeds the database with initial data."""
        seed_all()
        print("Database seeded.")

def run_insert_test_users(count):
    """
    Create test users in the database.

    Args:
        count (int): Number of test users to create

    Usage:
        from app import app
        from api.commands import run_insert_test_users

        with app.app_context():
            run_insert_test_users(5)
    """
    print(f"Creating {count} test users...")
    created_count = 0

    for x in range(1, int(count) + 1):
        email = f"test_user{x}@test.com"

        # Check if user already exists
        if User.query.filter_by(email=email).first():
            print(f"User {email} already exists, skipping...")
            continue

        user = User()
        user.name = f"Test User {x}"
        user.email = email
        user.set_password("123456")
        user.role = 'visitor'
        user.is_verified = True
        db.session.add(user)
        db.session.commit()
        print(f" User: {user.email} created.")
        created_count += 1

    print(f" Created {created_count} new test users (out of {count} requested).")