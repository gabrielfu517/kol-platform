from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_migrate import Migrate
from flask_mail import Mail, Message
from config import Config
from models import db, User, KOL, Campaign, InfluencerInvite, Job, JobAssignment
from datetime import datetime, timedelta
import requests
import os

app = Flask(__name__)
app.config.from_object(Config)

# Mail configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@kolplatform.com')

# Instagram API configuration
app.config['INSTAGRAM_APP_ID'] = os.getenv('INSTAGRAM_APP_ID')
app.config['INSTAGRAM_APP_SECRET'] = os.getenv('INSTAGRAM_APP_SECRET')
app.config['INSTAGRAM_REDIRECT_URI'] = os.getenv('INSTAGRAM_REDIRECT_URI', 'http://localhost:3000/influencer/instagram-callback')

CORS(app)
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
mail = Mail(app)

# Create tables
with app.app_context():
    db.create_all()


# --- Helper permission checks ---
def require_owner_or_admin(user: User, resource_owner_user_id: int):
    if user.role == 'admin':
        return True
    return user.id == resource_owner_user_id


# --- Jobs (owner) ---
@app.route('/api/jobs', methods=['GET'])
@jwt_required()
def list_jobs():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    query = Job.query
    if user.role != 'admin':
        query = query.filter_by(owner_user_id=user_id)
    jobs = query.order_by(Job.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs]), 200


@app.route('/api/jobs/<int:job_id>', methods=['GET'])
@jwt_required()
def get_job(job_id: int):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    job = Job.query.get_or_404(job_id)
    if user.role != 'admin' and job.owner_user_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    data = job.to_dict()
    data['assignments'] = [a.to_dict() for a in job.assignments]
    return jsonify(data), 200


@app.route('/api/jobs', methods=['POST'])
@jwt_required()
def create_job():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role not in ('admin', 'client'):
        return jsonify({'error': 'Only admins or clients can create jobs'}), 403
    data = request.get_json() or {}

    will_pay = bool(data.get('will_pay', False))
    budget = float(data.get('budget') or 0.0)
    if will_pay and budget <= 0:
        return jsonify({'error': 'Budget must be > 0 when will_pay is true'}), 400

    turnaround = data.get('suggested_turnaround_days')
    if turnaround is not None:
        try:
            turnaround = int(turnaround)
        except Exception:
            return jsonify({'error': 'suggested_turnaround_days must be integer'}), 400
        if turnaround < 1 or turnaround > 60:
            return jsonify({'error': 'suggested_turnaround_days must be between 1 and 60'}), 400

    content_types = data.get('content_types') or []
    if not isinstance(content_types, list):
        return jsonify({'error': 'content_types must be a list'}), 400
    if len(content_types) == 0:
        return jsonify({'error': 'At least one content type is required'}), 400

    restrictions = data.get('restrictions') or []
    if not isinstance(restrictions, list):
        return jsonify({'error': 'restrictions must be a list'}), 400

    job = Job(
        owner_user_id=user_id,
        title=data.get('title') or '',
        description=data.get('description'),
        budget=budget,
        restaurant_name=data.get('restaurant_name'),
        address=data.get('address'),
        will_pay=will_pay,
        suggested_turnaround_days=turnaround,
        restrictions=','.join(restrictions) if restrictions else None,
        content_types=','.join(content_types) if content_types else None,
        status=data.get('status', 'draft')
    )
    db.session.add(job)
    db.session.commit()
    return jsonify(job.to_dict()), 201


@app.route('/api/jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id: int):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    job = Job.query.get_or_404(job_id)
    if not require_owner_or_admin(user, job.owner_user_id):
        return jsonify({'error': 'Forbidden'}), 403
    data = request.get_json() or {}

    if 'title' in data:
        job.title = data['title']
    if 'description' in data:
        job.description = data['description']
    if 'restaurant_name' in data:
        job.restaurant_name = data['restaurant_name']
    if 'address' in data:
        job.address = data['address']
    if 'will_pay' in data:
        job.will_pay = bool(data['will_pay'])
    if 'budget' in data:
        try:
            job.budget = float(data['budget'] or 0.0)
        except Exception:
            return jsonify({'error': 'budget must be a number'}), 400
        if job.will_pay and job.budget <= 0:
            return jsonify({'error': 'Budget must be > 0 when will_pay is true'}), 400
    if 'suggested_turnaround_days' in data:
        try:
            td = int(data['suggested_turnaround_days'])
        except Exception:
            return jsonify({'error': 'suggested_turnaround_days must be integer'}), 400
        if td < 1 or td > 60:
            return jsonify({'error': 'suggested_turnaround_days must be between 1 and 60'}), 400
        job.suggested_turnaround_days = td
    if 'restrictions' in data:
        if not isinstance(data['restrictions'], list):
            return jsonify({'error': 'restrictions must be a list'}), 400
        job.restrictions = ','.join(data['restrictions']) if data['restrictions'] else None
    if 'content_types' in data:
        if not isinstance(data['content_types'], list):
            return jsonify({'error': 'content_types must be a list'}), 400
        if len(data['content_types']) == 0:
            return jsonify({'error': 'At least one content type is required'}), 400
        job.content_types = ','.join(data['content_types'])
    if 'status' in data:
        if data['status'] not in ('draft', 'published', 'closed'):
            return jsonify({'error': 'Invalid status'}), 400
        job.status = data['status']

    db.session.commit()
    return jsonify(job.to_dict()), 200


@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id: int):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    job = Job.query.get_or_404(job_id)
    if not require_owner_or_admin(user, job.owner_user_id):
        return jsonify({'error': 'Forbidden'}), 403
    db.session.delete(job)
    db.session.commit()
    return jsonify({'message': 'Job deleted'}), 200


@app.route('/api/jobs/<int:job_id>/publish', methods=['POST'])
@jwt_required()
def publish_job(job_id: int):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    job = Job.query.get_or_404(job_id)
    if not require_owner_or_admin(user, job.owner_user_id):
        return jsonify({'error': 'Forbidden'}), 403
    job.status = 'published'
    db.session.commit()
    return jsonify(job.to_dict()), 200


@app.route('/api/jobs/<int:job_id>/close', methods=['POST'])
@jwt_required()
def close_job(job_id: int):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    job = Job.query.get_or_404(job_id)
    if not require_owner_or_admin(user, job.owner_user_id):
        return jsonify({'error': 'Forbidden'}), 403
    job.status = 'closed'
    db.session.commit()
    return jsonify(job.to_dict()), 200


@app.route('/api/jobs/<int:job_id>/invites', methods=['POST'])
@jwt_required()
def invite_kols_to_job(job_id: int):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    job = Job.query.get_or_404(job_id)
    if not require_owner_or_admin(user, job.owner_user_id):
        return jsonify({'error': 'Forbidden'}), 403
    if job.status != 'published':
        return jsonify({'error': 'Job must be published before inviting KOLs'}), 400
    data = request.get_json() or {}
    kol_ids = data.get('kol_ids') or []
    if not isinstance(kol_ids, list) or not all(isinstance(k, int) for k in kol_ids):
        return jsonify({'error': 'kol_ids must be an array of integers'}), 400
    created = 0
    for kol_id in kol_ids:
        if not KOL.query.get(kol_id):
            continue
        existing = JobAssignment.query.filter_by(job_id=job.id, kol_id=kol_id).first()
        if existing:
            continue
        db.session.add(JobAssignment(job_id=job.id, kol_id=kol_id, invite_status='pending'))
        created += 1
    db.session.commit()
    return jsonify({'message': 'Invites processed', 'created': created}), 201


@app.route('/api/jobs/<int:job_id>/invites/<int:kol_id>/withdraw', methods=['POST'])
@jwt_required()
def withdraw_invite(job_id: int, kol_id: int):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    job = Job.query.get_or_404(job_id)
    if not require_owner_or_admin(user, job.owner_user_id):
        return jsonify({'error': 'Forbidden'}), 403
    a = JobAssignment.query.filter_by(job_id=job.id, kol_id=kol_id).first()
    if not a:
        return jsonify({'error': 'Assignment not found'}), 404
    a.invite_status = 'withdrawn'
    a.responded_at = datetime.utcnow()
    db.session.commit()
    return jsonify(a.to_dict()), 200


# --- KOL-facing job endpoints ---
@app.route('/api/my-jobs', methods=['GET'])
@jwt_required()
def kol_list_my_jobs():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != 'kol' and user.role != 'admin':
        # allow admin to view all for debugging
        return jsonify({'error': 'Forbidden'}), 403
    status = request.args.get('status')
    q = JobAssignment.query
    if user.role == 'kol':
        # link user to KOL by email
        kol = KOL.query.filter_by(email=user.email).first()
        if not kol:
            return jsonify([]), 200
        q = q.filter_by(kol_id=kol.id)
    if status in ('pending', 'accepted', 'rejected', 'withdrawn'):
        q = q.filter_by(invite_status=status)
    assignments = q.order_by(JobAssignment.invited_at.desc()).all()
    results = []
    for a in assignments:
        d = a.to_dict()
        d['job'] = a.job.to_dict()
        results.append(d)
    return jsonify(results), 200


def _kol_accept_reject(assignment_id: int, action: str):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role != 'kol':
        return jsonify({'error': 'Forbidden'}), 403
    kol = KOL.query.filter_by(email=user.email).first()
    if not kol:
        return jsonify({'error': 'No KOL profile linked to this account'}), 400
    a = JobAssignment.query.get_or_404(assignment_id)
    if a.kol_id != kol.id:
        return jsonify({'error': 'Forbidden'}), 403
    if a.invite_status not in ('pending',):
        return jsonify({'error': 'Invite already responded'}), 400
    a.invite_status = 'accepted' if action == 'accept' else 'rejected'
    a.responded_at = datetime.utcnow()
    db.session.commit()
    return jsonify(a.to_dict()), 200


@app.route('/api/my-jobs/<int:assignment_id>/accept', methods=['POST'])
@jwt_required()
def kol_accept_job(assignment_id: int):
    return _kol_accept_reject(assignment_id, 'accept')


@app.route('/api/my-jobs/<int:assignment_id>/reject', methods=['POST'])
@jwt_required()
def kol_reject_job(assignment_id: int):
    return _kol_accept_reject(assignment_id, 'reject')
# Auth endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        email=data.get('email'),
        full_name=data.get('full_name'),
        role=data.get('role', 'client')
    )
    user.set_password(data.get('password'))
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': user.to_dict()
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Debug logging
    print(f"Login attempt for email: {email}")
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        print(f"User not found: {email}")
        return jsonify({'error': 'Invalid credentials'}), 401
    
    print(f"User found: {user.full_name} (ID: {user.id})")
    
    if not user.check_password(password):
        print(f"Password check failed for user: {email}")
        return jsonify({'error': 'Invalid credentials'}), 401
    
    print(f"Login successful for: {email}")
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200


# KOL endpoints
@app.route('/api/kols', methods=['GET'])
def get_kols():
    # Query parameters for filtering
    category = request.args.get('category')
    platform = request.args.get('platform')
    min_followers = request.args.get('min_followers', type=int)
    max_price = request.args.get('max_price', type=float)
    
    query = KOL.query
    
    if category:
        query = query.filter_by(category=category)
    if platform:
        query = query.filter_by(platform=platform)
    if min_followers:
        query = query.filter(KOL.followers >= min_followers)
    if max_price:
        query = query.filter(KOL.price_per_post <= max_price)
    
    kols = query.all()
    return jsonify([kol.to_dict() for kol in kols]), 200


@app.route('/api/kols/<int:kol_id>', methods=['GET'])
def get_kol(kol_id):
    kol = KOL.query.get_or_404(kol_id)
    return jsonify(kol.to_dict()), 200


@app.route('/api/kols', methods=['POST'])
@jwt_required()
def create_kol():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    # Only admins can create KOLs
    if user.role != 'admin':
        return jsonify({'error': 'Only admins can create KOLs'}), 403
    
    data = request.get_json()
    
    kol = KOL(
        name=data.get('name'),
        email=data.get('email'),
        category=data.get('category'),
        platform=data.get('platform'),
        followers=data.get('followers', 0),
        engagement_rate=data.get('engagement_rate', 0.0),
        bio=data.get('bio'),
        profile_image=data.get('profile_image'),
        price_per_post=data.get('price_per_post', 0.0),
        verified=data.get('verified', False)
    )
    
    db.session.add(kol)
    db.session.commit()
    
    return jsonify(kol.to_dict()), 201


@app.route('/api/kols/<int:kol_id>', methods=['PUT'])
@jwt_required()
def update_kol(kol_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    # Only admins can update KOLs
    if user.role != 'admin':
        return jsonify({'error': 'Only admins can update KOLs'}), 403
    
    kol = KOL.query.get_or_404(kol_id)
    data = request.get_json()
    
    kol.name = data.get('name', kol.name)
    kol.email = data.get('email', kol.email)
    kol.category = data.get('category', kol.category)
    kol.platform = data.get('platform', kol.platform)
    kol.followers = data.get('followers', kol.followers)
    kol.engagement_rate = data.get('engagement_rate', kol.engagement_rate)
    kol.bio = data.get('bio', kol.bio)
    kol.profile_image = data.get('profile_image', kol.profile_image)
    kol.price_per_post = data.get('price_per_post', kol.price_per_post)
    kol.verified = data.get('verified', kol.verified)
    
    db.session.commit()
    
    return jsonify(kol.to_dict()), 200


@app.route('/api/kols/<int:kol_id>', methods=['DELETE'])
@jwt_required()
def delete_kol(kol_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    # Only admins can delete KOLs
    if user.role != 'admin':
        return jsonify({'error': 'Only admins can delete KOLs'}), 403
    
    kol = KOL.query.get_or_404(kol_id)
    db.session.delete(kol)
    db.session.commit()
    
    return jsonify({'message': 'KOL deleted successfully'}), 200


# Campaign endpoints
@app.route('/api/campaigns', methods=['GET'])
@jwt_required()
def get_campaigns():
    user_id = int(get_jwt_identity())
    campaigns = Campaign.query.filter_by(user_id=user_id).all()
    return jsonify([campaign.to_dict() for campaign in campaigns]), 200


@app.route('/api/campaigns/<int:campaign_id>', methods=['GET'])
@jwt_required()
def get_campaign(campaign_id):
    campaign = Campaign.query.get_or_404(campaign_id)
    return jsonify(campaign.to_dict()), 200


@app.route('/api/campaigns', methods=['POST'])
@jwt_required()
def create_campaign():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    campaign = Campaign(
        title=data.get('title'),
        description=data.get('description'),
        budget=data.get('budget', 0.0),
        start_date=datetime.fromisoformat(data.get('start_date')) if data.get('start_date') else None,
        end_date=datetime.fromisoformat(data.get('end_date')) if data.get('end_date') else None,
        status=data.get('status', 'draft'),
        kol_id=data.get('kol_id'),
        user_id=user_id
    )
    
    db.session.add(campaign)
    db.session.commit()
    
    return jsonify(campaign.to_dict()), 201


@app.route('/api/campaigns/<int:campaign_id>', methods=['PUT'])
@jwt_required()
def update_campaign(campaign_id):
    campaign = Campaign.query.get_or_404(campaign_id)
    data = request.get_json()
    
    campaign.title = data.get('title', campaign.title)
    campaign.description = data.get('description', campaign.description)
    campaign.budget = data.get('budget', campaign.budget)
    
    if data.get('start_date'):
        campaign.start_date = datetime.fromisoformat(data.get('start_date'))
    if data.get('end_date'):
        campaign.end_date = datetime.fromisoformat(data.get('end_date'))
    
    campaign.status = data.get('status', campaign.status)
    campaign.kol_id = data.get('kol_id', campaign.kol_id)
    
    db.session.commit()
    
    return jsonify(campaign.to_dict()), 200


@app.route('/api/campaigns/<int:campaign_id>', methods=['DELETE'])
@jwt_required()
def delete_campaign(campaign_id):
    campaign = Campaign.query.get_or_404(campaign_id)
    db.session.delete(campaign)
    db.session.commit()
    
    return jsonify({'message': 'Campaign deleted successfully'}), 200


# Statistics endpoint
@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = int(get_jwt_identity())
    
    total_kols = KOL.query.count()
    total_campaigns = Campaign.query.filter_by(user_id=user_id).count()
    active_campaigns = Campaign.query.filter_by(user_id=user_id, status='active').count()
    
    return jsonify({
        'total_kols': total_kols,
        'total_campaigns': total_campaigns,
        'active_campaigns': active_campaigns
    }), 200


# Helper function to send email
def send_invite_email(email, token):
    """Send invitation email to influencer"""
    try:
        registration_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/influencer/register?token={token}"
        
        msg = Message(
            subject="You're invited to join our KOL Platform",
            recipients=[email],
            html=f"""
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #667eea;">Welcome to KOL Platform!</h2>
                    <p>You've been invited to join our platform as an influencer.</p>
                    <p>Click the link below to complete your registration and connect your Instagram account:</p>
                    <p style="margin: 30px 0;">
                        <a href="{registration_link}" 
                           style="background-color: #667eea; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Complete Registration
                        </a>
                    </p>
                    <p style="color: #666; font-size: 12px;">
                        This link will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                    <p style="color: #666; font-size: 12px;">
                        Link: {registration_link}
                    </p>
                </body>
            </html>
            """
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False


# Influencer Invite endpoints
@app.route('/api/invites', methods=['POST'])
@jwt_required()
def send_influencer_invite():
    """Admin sends invitation to influencer"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    # Only admins can send invites
    if user.role != 'admin':
        return jsonify({'error': 'Only admins can send invites'}), 403
    
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    # Check if invite already exists and is still valid
    existing_invite = InfluencerInvite.query.filter_by(
        email=email, 
        status='pending'
    ).first()
    
    if existing_invite and not existing_invite.is_expired():
        return jsonify({'error': 'An active invite already exists for this email'}), 400
    
    # Create new invite
    token = InfluencerInvite.generate_token()
    expires_at = datetime.utcnow() + timedelta(days=7)
    
    invite = InfluencerInvite(
        email=email,
        token=token,
        invited_by=user_id,
        expires_at=expires_at
    )
    
    db.session.add(invite)
    db.session.commit()
    
    # Send email
    email_sent = send_invite_email(email, token)
    
    return jsonify({
        'message': 'Invitation sent successfully' if email_sent else 'Invitation created (email failed)',
        'invite': invite.to_dict(),
        'email_sent': email_sent
    }), 201


@app.route('/api/invites/verify/<token>', methods=['GET'])
def verify_invite_token():
    """Verify if invite token is valid"""
    invite = InfluencerInvite.query.filter_by(token=token).first()
    
    if not invite:
        return jsonify({'error': 'Invalid token', 'valid': False}), 404
    
    if invite.is_expired():
        invite.status = 'expired'
        db.session.commit()
        return jsonify({'error': 'Token has expired', 'valid': False}), 400
    
    if invite.status != 'pending':
        return jsonify({'error': 'Token has already been used', 'valid': False}), 400
    
    return jsonify({
        'valid': True,
        'email': invite.email
    }), 200


@app.route('/api/invites/complete', methods=['POST'])
def complete_influencer_registration():
    """Complete influencer registration with consent and Instagram data"""
    data = request.get_json()
    token = data.get('token')
    consent_given = data.get('consent_given')
    instagram_data = data.get('instagram_data')
    
    if not token:
        return jsonify({'error': 'Token is required'}), 400
    
    if not consent_given:
        return jsonify({'error': 'Consent is required to proceed'}), 400
    
    # Verify token
    invite = InfluencerInvite.query.filter_by(token=token).first()
    
    if not invite or invite.is_expired() or invite.status != 'pending':
        return jsonify({'error': 'Invalid or expired token'}), 400
    
    # Check if KOL with this email already exists
    existing_kol = KOL.query.filter_by(email=invite.email).first()
    
    if existing_kol:
        # Update existing KOL with Instagram data
        kol = existing_kol
    else:
        # Create new KOL
        kol = KOL(
            name=instagram_data.get('username', 'New Influencer'),
            email=invite.email,
            category='general',
            platform='instagram'
        )
        db.session.add(kol)
    
    # Update KOL with Instagram data and consent
    if instagram_data:
        kol.instagram_id = instagram_data.get('id')
        kol.instagram_username = instagram_data.get('username')
        kol.instagram_access_token = instagram_data.get('access_token')
        kol.followers = instagram_data.get('followers_count', 0)
        kol.profile_image = instagram_data.get('profile_picture_url')
        kol.bio = instagram_data.get('biography')
        
        # Set token expiration (Instagram tokens typically last 60 days)
        if instagram_data.get('access_token'):
            kol.instagram_token_expires_at = datetime.utcnow() + timedelta(days=60)
    
    kol.consent_given = True
    kol.consent_given_at = datetime.utcnow()
    kol.registration_completed = True
    
    # Update invite status
    invite.status = 'completed'
    invite.used_at = datetime.utcnow()
    invite.kol_id = kol.id
    
    db.session.commit()
    
    return jsonify({
        'message': 'Registration completed successfully',
        'kol': kol.to_dict()
    }), 200


# Instagram API endpoints
@app.route('/api/instagram/auth-url', methods=['GET'])
def get_instagram_auth_url():
    """Generate Instagram OAuth URL"""
    app_id = app.config.get('INSTAGRAM_APP_ID')
    redirect_uri = app.config.get('INSTAGRAM_REDIRECT_URI')
    
    if not app_id:
        return jsonify({'error': 'Instagram App ID not configured'}), 500
    
    auth_url = (
        f"https://api.instagram.com/oauth/authorize"
        f"?client_id={app_id}"
        f"&redirect_uri={redirect_uri}"
        f"&scope=user_profile,user_media"
        f"&response_type=code"
    )
    
    return jsonify({'auth_url': auth_url}), 200


@app.route('/api/instagram/exchange-token', methods=['POST'])
def exchange_instagram_token():
    """Exchange Instagram authorization code for access token"""
    data = request.get_json()
    code = data.get('code')
    
    if not code:
        return jsonify({'error': 'Authorization code is required'}), 400
    
    app_id = app.config.get('INSTAGRAM_APP_ID')
    app_secret = app.config.get('INSTAGRAM_APP_SECRET')
    redirect_uri = app.config.get('INSTAGRAM_REDIRECT_URI')
    
    if not app_id or not app_secret:
        return jsonify({'error': 'Instagram credentials not configured'}), 500
    
    try:
        # Exchange code for access token
        token_url = 'https://api.instagram.com/oauth/access_token'
        response = requests.post(token_url, data={
            'client_id': app_id,
            'client_secret': app_secret,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri,
            'code': code
        })
        
        if response.status_code != 200:
            return jsonify({'error': 'Failed to exchange token', 'details': response.text}), 400
        
        token_data = response.json()
        access_token = token_data.get('access_token')
        user_id = token_data.get('user_id')
        
        # Get user profile data
        graph_url = f"https://graph.instagram.com/{user_id}"
        profile_response = requests.get(graph_url, params={
            'fields': 'id,username,account_type,media_count',
            'access_token': access_token
        })
        
        if profile_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch profile', 'details': profile_response.text}), 400
        
        profile_data = profile_response.json()
        
        # Get detailed user info (requires Instagram Basic Display API)
        user_info_url = f"https://graph.instagram.com/me"
        user_info_response = requests.get(user_info_url, params={
            'fields': 'id,username,media_count',
            'access_token': access_token
        })
        
        user_info = user_info_response.json() if user_info_response.status_code == 200 else {}
        
        return jsonify({
            'access_token': access_token,
            'user_data': {
                'id': user_id,
                'username': profile_data.get('username'),
                'account_type': profile_data.get('account_type'),
                'media_count': profile_data.get('media_count', 0),
                'followers_count': user_info.get('followers_count', 0)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to connect Instagram', 'details': str(e)}), 500


@app.route('/api/invites', methods=['GET'])
@jwt_required()
def get_invites():
    """Get all invites (admin only)"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Only admins can view invites'}), 403
    
    invites = InfluencerInvite.query.order_by(InfluencerInvite.created_at.desc()).all()
    return jsonify([invite.to_dict() for invite in invites]), 200


if __name__ == '__main__':
    app.run(debug=True, port=5001)

