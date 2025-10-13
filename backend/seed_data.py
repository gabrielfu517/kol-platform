"""
Seed script to populate the database with sample data.
Run this after setting up the database to add some test KOLs and data.

Usage:
    python seed_data.py
"""

from app import app
from models import db, User, KOL, Campaign
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

def seed_database():
    with app.app_context():
        print("🌱 Seeding database...")
        
        # Clear existing data (optional - comment out if you want to keep existing data)
        print("Clearing existing data...")
        Campaign.query.delete()
        KOL.query.delete()
        User.query.delete()
        db.session.commit()
        
        # Create sample users
        print("Creating sample users...")
        user1 = User(
            email='admin@kolplatform.com',
            full_name='Admin User',
            role='admin'
        )
        user1.set_password('admin123')
        
        user2 = User(
            email='demo@kolplatform.com',
            full_name='Demo User',
            role='client'
        )
        user2.set_password('demo123')
        
        db.session.add_all([user1, user2])
        db.session.commit()
        
        # Create sample KOLs
        print("Creating sample KOLs...")
        kols = [
            KOL(
                name='Sarah Johnson',
                email='sarah.johnson@example.com',
                category='fashion',
                platform='instagram',
                followers=250000,
                engagement_rate=4.2,
                bio='Fashion influencer & style consultant. Helping women dress confidently. NYC based.',
                price_per_post=1500.00,
                verified=True
            ),
            KOL(
                name='Mike Chen',
                email='mike.chen@example.com',
                category='tech',
                platform='youtube',
                followers=500000,
                engagement_rate=6.8,
                bio='Tech reviewer & software engineer. Unboxing the latest gadgets and explaining tech trends.',
                price_per_post=3000.00,
                verified=True
            ),
            KOL(
                name='Emily Rodriguez',
                email='emily.rodriguez@example.com',
                category='fitness',
                platform='tiktok',
                followers=180000,
                engagement_rate=8.5,
                bio='Personal trainer & nutrition coach. Sharing workout routines and healthy recipes.',
                price_per_post=800.00,
                verified=True
            ),
            KOL(
                name='David Kim',
                email='david.kim@example.com',
                category='food',
                platform='instagram',
                followers=350000,
                engagement_rate=5.3,
                bio='Food blogger & restaurant critic. Exploring the best eats around the world.',
                price_per_post=2000.00,
                verified=True
            ),
            KOL(
                name='Jessica Brown',
                email='jessica.brown@example.com',
                category='beauty',
                platform='youtube',
                followers=420000,
                engagement_rate=7.1,
                bio='Makeup artist & beauty guru. Tutorials, reviews, and beauty tips.',
                price_per_post=2500.00,
                verified=True
            ),
            KOL(
                name='Alex Turner',
                email='alex.turner@example.com',
                category='travel',
                platform='instagram',
                followers=290000,
                engagement_rate=4.9,
                bio='Travel photographer & digital nomad. Capturing the world one destination at a time.',
                price_per_post=1800.00,
                verified=True
            ),
            KOL(
                name='Olivia Martinez',
                email='olivia.martinez@example.com',
                category='fitness',
                platform='instagram',
                followers=150000,
                engagement_rate=6.2,
                bio='Yoga instructor & wellness advocate. Finding balance through movement and mindfulness.',
                price_per_post=900.00,
                verified=False
            ),
            KOL(
                name='Ryan Thompson',
                email='ryan.thompson@example.com',
                category='tech',
                platform='twitter',
                followers=95000,
                engagement_rate=3.8,
                bio='Developer advocate & tech speaker. Sharing insights on web development and AI.',
                price_per_post=600.00,
                verified=True
            ),
            KOL(
                name='Sophie Anderson',
                email='sophie.anderson@example.com',
                category='fashion',
                platform='tiktok',
                followers=380000,
                engagement_rate=9.2,
                bio='Sustainable fashion advocate. Showing how to style eco-friendly and vintage pieces.',
                price_per_post=2200.00,
                verified=True
            ),
            KOL(
                name='James Wilson',
                email='james.wilson@example.com',
                category='food',
                platform='youtube',
                followers=210000,
                engagement_rate=5.7,
                bio='Chef & cooking instructor. Quick and easy recipes for busy people.',
                price_per_post=1200.00,
                verified=False
            )
        ]
        
        db.session.add_all(kols)
        db.session.commit()
        
        # Create sample campaigns
        print("Creating sample campaigns...")
        campaigns = [
            Campaign(
                title='Summer Fashion Collection Launch',
                description='Promote our new summer collection with focus on sustainable materials.',
                budget=5000.00,
                start_date=datetime.now(),
                end_date=datetime.now() + timedelta(days=30),
                status='active',
                kol_id=kols[0].id,
                user_id=user2.id
            ),
            Campaign(
                title='Tech Product Review Series',
                description='Create comprehensive reviews of our latest smartphone lineup.',
                budget=8000.00,
                start_date=datetime.now() + timedelta(days=7),
                end_date=datetime.now() + timedelta(days=45),
                status='draft',
                kol_id=kols[1].id,
                user_id=user2.id
            ),
            Campaign(
                title='Fitness Challenge - 30 Days',
                description='30-day fitness challenge to promote our new workout app.',
                budget=3000.00,
                start_date=datetime.now() - timedelta(days=10),
                end_date=datetime.now() + timedelta(days=20),
                status='active',
                kol_id=kols[2].id,
                user_id=user2.id
            ),
            Campaign(
                title='Restaurant Partnership Campaign',
                description='Feature our restaurant in food blogger content.',
                budget=4500.00,
                start_date=datetime.now(),
                end_date=datetime.now() + timedelta(days=60),
                status='active',
                kol_id=kols[3].id,
                user_id=user1.id
            ),
            Campaign(
                title='Beauty Product Launch',
                description='Launch campaign for our new skincare line.',
                budget=10000.00,
                start_date=datetime.now() + timedelta(days=14),
                end_date=datetime.now() + timedelta(days=90),
                status='draft',
                user_id=user1.id
            )
        ]
        
        db.session.add_all(campaigns)
        db.session.commit()
        
        print("✅ Database seeded successfully!")
        print(f"\n📊 Summary:")
        print(f"  - Users: {User.query.count()}")
        print(f"  - KOLs: {KOL.query.count()}")
        print(f"  - Campaigns: {Campaign.query.count()}")
        print(f"\n🔐 Sample login credentials:")
        print(f"  Admin: admin@kolplatform.com / admin123")
        print(f"  Demo:  demo@kolplatform.com / demo123")

if __name__ == '__main__':
    seed_database()

