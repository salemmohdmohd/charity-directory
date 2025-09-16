
import logging
from logging.config import fileConfig
from alembic import context
import os

# Alembic Config object
config = context.config

# Set up Python logging
fileConfig(config.config_file_name)
logger = logging.getLogger('alembic.env')

# Get database URL from environment or config
def get_url():
    return os.environ.get('DATABASE_URL') or config.get_main_option('sqlalchemy.url')

# Import your models' MetaData object here for autogenerate support
# from src.api.models import db
# target_metadata = db.metadata
from src.api.models import db
target_metadata = db.metadata

# Offline migration
def run_migrations_offline():
    url = get_url()
    context.configure(
        url=url, target_metadata=target_metadata, literal_binds=True
    )
    with context.begin_transaction():
        context.run_migrations()

# Online migration
def run_migrations_online():
    from sqlalchemy import create_engine
    url = get_url()
    connectable = create_engine(url)
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

