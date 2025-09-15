#!/usr/bin/env python3
"""One-line runner to invoke api.seed.seed_all() inside the Flask app context.

Usage: PYTHONPATH=src FLASK_APP=src/app.py python scripts/seed_meaningful.py
"""
from app import app

def main():
    with app.app_context():
        try:
            from api.seed import seed_all
        except Exception as e:
            print('Failed importing seed_all:', e)
            raise

        print('Running seed_all()...')
        seed_all()
        print('Seeding complete.')

if __name__ == '__main__':
    main()
