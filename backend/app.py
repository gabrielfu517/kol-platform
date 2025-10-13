from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_migrate import Migrate
from config import Config
from models import db, User, KOL, Campaign
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Create tables
with app.app_context():
    db.create_all()


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
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user or not user.check_password(data.get('password')):
        return jsonify({'error': 'Invalid credentials'}), 401
    
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


if __name__ == '__main__':
    app.run(debug=True, port=5001)

