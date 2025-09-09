import json
import random
from .models import db, Category, Organization, User, Location, OrganizationPhoto, OrganizationSocialLink

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
    db.session.query(OrganizationPhoto).delete()
    db.session.query(OrganizationSocialLink).delete()
    db.session.query(Organization).delete()
    db.session.commit()

    print("Seeding new robust organizations...")
    categories = Category.query.all()
    locations = Location.query.all()
    admin_user = User.query.filter_by(role='platform_admin').first()

    if not categories or not locations:
        print("Please ensure categories and locations are seeded first.")
        return

    orgs_data = [
        {
            "name": "Global Health Initiative",
            "mission": "To provide essential healthcare services to underserved communities worldwide.",
            "description": "A non-profit organization dedicated to improving global health through medical missions, clinics, and health education.",
            "logo_url": "placeholder_logo_1.png",
            "banner": "placeholder_banner_1.png",
            "established_year": 2005,
            "operating_hours": "Mon-Fri, 9 AM - 5 PM",
            "donation_link": "https://www.globalhealth.org/donate",
            "socials": {"twitter": "https://twitter.com/globalhealth", "facebook": "https://facebook.com/globalhealth"},
            "gallery": ["placeholder_gallery_1.png", "placeholder_gallery_2.png"]
        },
        {
            "name": "Future Leaders Academy",
            "mission": "Empowering the next generation through quality education and mentorship.",
            "description": "Provides scholarships, after-school programs, and leadership training to students from low-income backgrounds.",
            "logo_url": "placeholder_logo_2.png",
            "banner": "placeholder_banner_2.png",
            "established_year": 2010,
            "operating_hours": "Mon-Sat, 10 AM - 6 PM",
            "donation_link": "https://www.futureleaders.org/donate",
            "socials": {"linkedin": "https://linkedin.com/company/futureleaders", "instagram": "https://instagram.com/futureleaders"},
            "gallery": ["placeholder_gallery_3.png", "placeholder_gallery_4.png"]
        },
        {
            "name": "Planet Protectors",
            "mission": "To conserve and restore natural ecosystems for a sustainable future.",
            "description": "Focuses on reforestation, ocean cleanup, and advocating for environmental protection policies.",
            "logo_url": "placeholder_logo_1.png",
            "banner": "placeholder_banner_1.png",
            "established_year": 1998,
            "operating_hours": "Mon-Fri, 8 AM - 4 PM",
            "donation_link": "https://www.planetprotectors.org/donate",
            "socials": {"twitter": "https://twitter.com/planetprotect", "youtube": "https://youtube.com/planetprotect"},
            "gallery": ["placeholder_gallery_1.png", "placeholder_gallery_3.png"]
        },
        {
            "name": "Paws & Claws Sanctuary",
            "mission": "To rescue, rehabilitate, and rehome animals in need.",
            "description": "A no-kill shelter providing a safe haven for abandoned and abused animals, with a focus on adoption.",
            "logo_url": "placeholder_logo_2.png",
            "banner": "placeholder_banner_2.png",
            "established_year": 2015,
            "operating_hours": "Tue-Sun, 11 AM - 4 PM",
            "donation_link": "https://www.pawsandclaws.org/donate",
            "socials": {"instagram": "https://instagram.com/pawsandclaws", "facebook": "https://facebook.com/pawsandclaws"},
            "gallery": ["placeholder_gallery_2.png", "placeholder_gallery_4.png"]
        }
    ]

    for org_data in orgs_data:
        org = Organization(
            name=org_data["name"],
            mission=org_data["mission"],
            description=org_data["description"],
            logo_url=org_data["logo_url"],
            category=random.choice(categories),
            location=random.choice(locations),
            address=f"{random.randint(100, 999)} Main St",
            phone=f"555-01{random.randint(10,99)}",
            email=f"contact@{org_data['name'].lower().replace(' ', '')}.org",
            website=f"https://www.{org_data['name'].lower().replace(' ', '')}.org",
            donation_link=org_data["donation_link"],
            operating_hours=org_data["operating_hours"],
            established_year=org_data["established_year"],
            status='approved',
            is_verified=True,
            verification_level='verified',
            approved_by=admin_user.id if admin_user else None,
            admin_user_id=admin_user.id if admin_user else None
        )
        db.session.add(org)
        db.session.flush()  # Flush to get the org ID for linking

        # Add primary photo (banner)
        banner_photo = OrganizationPhoto(
            organization_id=org.id,
            file_name=org_data["banner"],
            file_path='',
            alt_text=f"Banner for {org.name}",
            is_primary=True
        )
        db.session.add(banner_photo)

        # Add gallery photos
        for gallery_img in org_data["gallery"]:
            gallery_photo = OrganizationPhoto(
                organization_id=org.id,
                file_name=gallery_img,
                file_path='',
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
    print("Robust organizations, photos, and social links seeded successfully.")


def seed_all():
    """Runs all seeding functions."""
    seed_categories()
    seed_locations()
    seed_organizations_and_photos()
