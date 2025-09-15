import json
import random
from datetime import datetime, timedelta
from .models import (
    db,
    Category,
    Organization,
    User,
    Location,
    OrganizationPhoto,
    OrganizationSocialLink,
    Review,
    Donation,
    UserBookmark,
    Advertisement,
    Bookmark,
)

def seed_categories():
    """Seeds the database with initial categories."""
    if Category.query.count() > 0:
        print("Categories table already seeded.")
        return

    print("Seeding categories...")
    categories_data = [
        {"name": "Animal Welfare", "description": "Charities focused on protecting and caring for animals.", "icon_url": "fas fa-paw", "color_code": "#ffb3ba"},
        {"name": "Environmental", "description": "Charities dedicated to environmental conservation and sustainability.", "icon_url": "fas fa-leaf", "color_code": "#baffc9"},
        {"name": "Education", "description": "Charities supporting educational programs and institutions.", "icon_url": "fas fa-book", "color_code": "#bae1ff"},
        {"name": "Health Services", "description": "Charities providing healthcare services and medical research.", "icon_url": "fas fa-heartbeat", "color_code": "#ffffba"},
        {"name": "Arts & Culture", "description": "Charities promoting arts, culture, and humanities.", "icon_url": "fas fa-palette", "color_code": "#ffdfba"},
        {"name": "Human Rights", "description": "Charities advocating for human rights and social justice.", "icon_url": "fas fa-gavel", "color_code": "#f0baff"},
        {"name": "Community Development", "description": "Charities working on local community improvement projects.", "icon_url": "fas fa-users", "color_code": "#bafff0"},
        {"name": "Disaster Relief", "description": "Charities providing aid in response to natural or man-made disasters.", "icon_url": "fas fa-house-damage", "color_code": "#ffb3b3"},
    ]

    for cat_data in categories_data:
        category = Category(**cat_data)
        db.session.add(category)

    db.session.commit()
    print("Categories seeded successfully.")


def seed_locations():
    """Seeds the database with initial locations."""
    if Location.query.count() > 0:
        print("Locations table already seeded.")
        return

    print("Seeding locations...")
    locations_data = [
        {"city": "New York", "state_province": "NY", "country": "USA", "postal_code": "10001"},
        {"city": "Los Angeles", "state_province": "CA", "country": "USA", "postal_code": "90001"},
        {"city": "London", "state_province": "", "country": "UK", "postal_code": "SW1A 0AA"},
        {"city": "Tokyo", "state_province": "", "country": "Japan", "postal_code": "100-0001"},
    ]
    for loc_data in locations_data:
        location = Location(**loc_data)
        db.session.add(location)
    db.session.commit()
    print("Locations seeded successfully.")


def seed_organizations_and_photos():
    """
    Clears and seeds the database with comprehensive dummy organizations,
    including social links and a full photo gallery based on the UML design.
    """
    print("Clearing existing organization data...")
    # Clear data in the correct order to respect foreign key constraints
    # Delete dependent records first to avoid foreign key constraint errors
    try:
        db.session.query(Advertisement).delete()
    except Exception:
        pass
    try:
        db.session.query(Review).delete()
    except Exception:
        pass
    try:
        db.session.query(Donation).delete()
    except Exception:
        pass
    try:
        db.session.query(UserBookmark).delete()
    except Exception:
        pass
    # Then photos, social links, and organizations
    db.session.query(OrganizationPhoto).delete()
    db.session.query(OrganizationSocialLink).delete()
    db.session.query(Organization).delete()
    db.session.commit()

    print("Seeding new robust organizations...")
    categories = Category.query.all()
    locations = Location.query.all()
    # Prefer an organization admin if available, otherwise a platform admin
    platform_admin = User.query.filter_by(role='platform_admin').first()
    org_admins = User.query.filter_by(role='org_admin').all()
    admin_user = org_admins[0] if org_admins else platform_admin

    if not categories or not locations:
        print("Please ensure categories and locations are seeded first.")
        return

    orgs_data = [
        {
            "name": "Global Health Initiative",
            "mission": "To provide essential healthcare services to underserved communities worldwide.",
            "description": "A non-profit organization dedicated to improving global health through mobile clinics, telemedicine, and health education.",
            "logo_url": "067ecde9-b39e-481b-bf34-b3c97172e899_Logo.png",
            "banner": "138b04e5-6d6c-4e40-a0d6-a457cef279d9_Hero.png",
            "established_year": 2005,
            "operating_hours": "Mon-Fri, 9 AM - 5 PM",
            "donation_link": "https://www.globalhealth.org/donate",
            "socials": {"twitter": "https://twitter.com/globalhealth", "facebook": "https://facebook.com/globalhealth"},
            "gallery": ["5900ac91-0335-4391-879d-6340e5839b1b_Hero.png", "4b11dfb9-9f07-402f-8246-f72e35dacec3_Logo.png"]
        },
        {
            "name": "Future Leaders Academy",
            "mission": "Empowering the next generation through quality education and mentorship.",
            "description": "Provides scholarships, after-school programs, and leadership training to students from low-income backgrounds.",
            "logo_url": "badcabda-563c-4579-96d1-bb98918786e3_Logo.png",
            "banner": "68a5bc33-038d-4eb5-b880-32976a43ea5e_Hero.png",
            "established_year": 2010,
            "operating_hours": "Mon-Sat, 10 AM - 6 PM",
            "donation_link": "https://www.futureleaders.org/donate",
            "socials": {"linkedin": "https://linkedin.com/company/futureleaders", "instagram": "https://instagram.com/futureleaders"},
            "gallery": ["b065d60a-adc4-4396-8c98-b508acf27f94_Hero.png", "fa13015c-f464-4aaa-b069-2e0071f38e59_Logo.png"]
        },
        {
            "name": "Planet Protectors",
            "mission": "To conserve and restore natural ecosystems for a sustainable future.",
            "description": "Focuses on reforestation, ocean cleanup, and advocating for environmental protection policies.",
            "logo_url": "067ecde9-b39e-481b-bf34-b3c97172e899_Logo.png",
            "banner": "138b04e5-6d6c-4e40-a0d6-a457cef279d9_Hero.png",
            "established_year": 1998,
            "operating_hours": "Mon-Fri, 8 AM - 4 PM",
            "donation_link": "https://www.planetprotectors.org/donate",
            "socials": {"twitter": "https://twitter.com/planetprotect", "youtube": "https://youtube.com/planetprotect"},
            "gallery": ["5900ac91-0335-4391-879d-6340e5839b1b_Hero.png", "b065d60a-adc4-4396-8c98-b508acf27f94_Hero.png"]
        },
        {
            "name": "Paws & Claws Sanctuary",
            "mission": "To rescue, rehabilitate, and rehome animals in need.",
            "description": "A no-kill shelter providing a safe haven for abandoned and abused animals, with a focus on adoption and community education.",
            "logo_url": "fa13015c-f464-4aaa-b069-2e0071f38e59_Logo.png",
            "banner": "4b11dfb9-9f07-402f-8246-f72e35dacec3_Logo.png",
            "established_year": 2015,
            "operating_hours": "Tue-Sun, 11 AM - 4 PM",
            "donation_link": "https://www.pawsandclaws.org/donate",
            "socials": {"instagram": "https://instagram.com/pawsandclaws", "facebook": "https://facebook.com/pawsandclaws"},
            "gallery": ["68a5bc33-038d-4eb5-b880-32976a43ea5e_Hero.png", "4b11dfb9-9f07-402f-8246-f72e35dacec3_Logo.png"]
        }
    ]

    created_orgs = []
    for org_data in orgs_data:
        # idempotent: skip if organization already exists
        existing = Organization.query.filter_by(name=org_data["name"]).first()
        if existing:
            print(f"Skipping existing organization: {org_data['name']} (id={existing.id})")
            created_orgs.append(existing)
            continue
        org = Organization(
            name=org_data["name"],
            mission=org_data["mission"],
            description=org_data["description"],
            logo_url=org_data["logo_url"],
            category=random.choice(categories),
            location=random.choice(locations),
            address=f"{random.randint(100, 999)} {random.choice(['Main St','Broadway','Oak Ave','Market St'])}",
            phone=f"+1-555-{random.randint(200,999)}-{random.randint(1000,9999)}",
            email=f"contact@{org_data['name'].lower().replace(' ', '')}.org",
            website=f"https://www.{org_data['name'].lower().replace(' ', '')}.org",
            donation_link=org_data["donation_link"],
            operating_hours=org_data["operating_hours"],
            established_year=org_data["established_year"],
            status='approved',
            is_verified=True,
            verification_level='verified',
            approved_by=admin_user.id if admin_user else None,
            admin_user_id=admin_user.id if admin_user else None,
            # phone_contact_name field was removed from the Organization model; omit it
            # If a contact name is required in future, map to an existing column or add a new column.
        )
        db.session.add(org)
        db.session.flush()  # Flush to get the org ID for linking
        created_orgs.append(org)

        # Add primary photo (banner)
        banner_photo = OrganizationPhoto(
            organization_id=org.id,
            file_name=org_data["banner"],
            file_path=f"/uploads/{org_data['banner']}",
            alt_text=f"Banner for {org.name}",
            is_primary=True
        )
        db.session.add(banner_photo)

        # Add gallery photos
        for gallery_img in org_data["gallery"]:
            gallery_photo = OrganizationPhoto(
                organization_id=org.id,
                file_name=gallery_img,
                file_path=f"/uploads/{gallery_img}",
                alt_text=f"Gallery image for {org.name}",
                is_primary=False
            )
            db.session.add(gallery_photo)

        # Add social links
        for platform, url in org_data["socials"].items():
            social_link = OrganizationSocialLink(
                organization_id=org.id,
                platform=platform,
                url=url
            )
            db.session.add(social_link)
    db.session.commit()

    # Seed some related data: reviews, bookmarks, donations, and an advertisement
    print('Seeding reviews, bookmarks, donations, and advertisements...')
    # choose a regular user and a platform admin if present
    regular_user = User.query.filter_by(role='visitor').first() or User.query.first()
    platform_admin = User.query.filter_by(role='platform_admin').first()

    for i, org in enumerate(created_orgs[:3]):
        # add a sample review
        try:
            r = Review(user_id=regular_user.id, organization_id=org.id, rating=random.randint(3,5), comment=f"Great work by {org.name}.")
            db.session.add(r)
        except Exception:
            pass

        # add a bookmark (if Bookmark model exists use it)
        try:
            b = UserBookmark(user_id=regular_user.id, organization_id=org.id)
            db.session.add(b)
        except Exception:
            pass

        # add a donation
        try:
            d = Donation(user_id=regular_user.id, organization_id=org.id, amount=round(random.uniform(10, 200), 2), currency='USD')
            db.session.add(d)
        except Exception:
            pass

        # add an advertisement for the first org
        if i == 0:
            try:
                # Ensure required advertisement date fields are populated to satisfy DB constraints
                ad = Advertisement(
                    organization_id=org.id,
                    title=f"Support {org.name}",
                    description=f"Promoted listing for {org.name}",
                    image_url=(org.photos[0].file_path if getattr(org, 'photos', None) else None),
                    target_url=org.website,
                    ad_type='sponsored',
                    placement='home',
                    start_date=datetime.utcnow(),
                    end_date=datetime.utcnow() + timedelta(days=30),
                    budget=round(random.uniform(50, 500), 2),
                )
                db.session.add(ad)
            except Exception:
                pass

    db.session.commit()
    print("Robust organizations, photos, social links and related sample data seeded successfully.")


def seed_users():
    """Create a platform admin, a regular user, and an organization admin for testing."""
    if User.query.filter_by(email='admin@charitydirectory.org').first():
        print('Test users already exist.')
        return

    print('Seeding test users...')
    # Assumed passwords (change after seeding in production)
    platform = User(name='Platform Admin', email='admin@charitydirectory.org', role='platform_admin', is_verified=True)
    platform.set_password('adminpass')

    regular = User(name='Regular User', email='user@charitydirectory.org', role='visitor', is_verified=True)
    regular.set_password('userpass')

    org_admin = User(name='Org Admin', email='orgadmin@charitydirectory.org', role='org_admin', is_verified=True)
    org_admin.set_password('orgpass')

    db.session.add_all([platform, regular, org_admin])
    db.session.commit()
    print('Test users created: admin@charitydirectory.org, user@charitydirectory.org, orgadmin@charitydirectory.org')


def seed_all():
    """Runs all seeding functions."""
    # Create users first so organizations can reference admins
    seed_users()
    seed_categories()
    seed_locations()
    seed_organizations_and_photos()
