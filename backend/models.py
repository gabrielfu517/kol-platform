from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import secrets

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='client')  # client, admin, kol
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }


class KOL(db.Model):
    __tablename__ = 'kols'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # tech, fashion, fitness, beauty, etc.
    platform = db.Column(db.String(50), nullable=False)  # instagram, youtube, tiktok, twitter
    followers = db.Column(db.Integer, default=0)
    engagement_rate = db.Column(db.Float, default=0.0)
    bio = db.Column(db.Text)
    profile_image = db.Column(db.String(255))
    price_per_post = db.Column(db.Float, default=0.0)
    verified = db.Column(db.Boolean, default=False)
    
    # Instagram Integration Fields
    instagram_id = db.Column(db.String(100), unique=True, nullable=True)
    instagram_username = db.Column(db.String(100), nullable=True)
    instagram_access_token = db.Column(db.String(500), nullable=True)
    instagram_token_expires_at = db.Column(db.DateTime, nullable=True)
    
    # Consent and Registration
    consent_given = db.Column(db.Boolean, default=False)
    consent_given_at = db.Column(db.DateTime, nullable=True)
    registration_completed = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    campaigns = db.relationship('Campaign', backref='kol', lazy=True)
    job_assignments = db.relationship('JobAssignment', backref='kol', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'category': self.category,
            'platform': self.platform,
            'followers': self.followers,
            'engagement_rate': self.engagement_rate,
            'bio': self.bio,
            'profile_image': self.profile_image,
            'price_per_post': self.price_per_post,
            'verified': self.verified,
            'instagram_id': self.instagram_id,
            'instagram_username': self.instagram_username,
            'consent_given': self.consent_given,
            'registration_completed': self.registration_completed,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Campaign(db.Model):
    __tablename__ = 'campaigns'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    budget = db.Column(db.Float, default=0.0)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='draft')  # draft, active, completed, cancelled
    kol_id = db.Column(db.Integer, db.ForeignKey('kols.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship('User', backref='campaigns')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'budget': self.budget,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'kol_id': self.kol_id,
            'kol': self.kol.to_dict() if self.kol else None,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class InfluencerInvite(db.Model):
    __tablename__ = 'influencer_invites'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    token = db.Column(db.String(100), unique=True, nullable=False, index=True)
    invited_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, completed, expired
    expires_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime, nullable=True)
    kol_id = db.Column(db.Integer, db.ForeignKey('kols.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    inviter = db.relationship('User', backref='sent_invites')
    kol = db.relationship('KOL', backref='invites')
    
    @staticmethod
    def generate_token():
        return secrets.token_urlsafe(32)
    
    def is_expired(self):
        return datetime.utcnow() > self.expires_at
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'status': self.status,
            'invited_by': self.invited_by,
            'expires_at': self.expires_at.isoformat(),
            'used_at': self.used_at.isoformat() if self.used_at else None,
            'created_at': self.created_at.isoformat()
        }


class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True)
    owner_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    budget = db.Column(db.Float, default=0.0)
    restaurant_name = db.Column(db.String(200))
    address = db.Column(db.String(255))
    will_pay = db.Column(db.Boolean, default=False)
    suggested_turnaround_days = db.Column(db.Integer)  # 1-60

    # restrictions and content types stored as CSV for simplicity
    restrictions = db.Column(db.String(200))  # e.g. "time,date,budget,alcohol,plus_one,not_free"
    content_types = db.Column(db.String(200))  # e.g. "ig_reel,post"

    status = db.Column(db.String(20), default='draft')  # draft, published, closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = db.relationship('User', backref='jobs')
    assignments = db.relationship('JobAssignment', backref='job', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'owner_user_id': self.owner_user_id,
            'title': self.title,
            'description': self.description,
            'budget': self.budget,
            'restaurant_name': self.restaurant_name,
            'address': self.address,
            'will_pay': self.will_pay,
            'suggested_turnaround_days': self.suggested_turnaround_days,
            'restrictions': (self.restrictions.split(',') if self.restrictions else []),
            'content_types': (self.content_types.split(',') if self.content_types else []),
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class JobAssignment(db.Model):
    __tablename__ = 'job_assignments'

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False, index=True)
    kol_id = db.Column(db.Integer, db.ForeignKey('kols.id'), nullable=False, index=True)
    invite_status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected, withdrawn
    invited_at = db.Column(db.DateTime, default=datetime.utcnow)
    responded_at = db.Column(db.DateTime, nullable=True)
    note = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'kol_id': self.kol_id,
            'invite_status': self.invite_status,
            'invited_at': self.invited_at.isoformat() if self.invited_at else None,
            'responded_at': self.responded_at.isoformat() if self.responded_at else None,
            'note': self.note,
            'kol': self.kol.to_dict() if getattr(self, 'kol', None) else None
        }

