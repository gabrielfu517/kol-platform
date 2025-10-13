# 🎯 KOL Platform

A full-stack Key Opinion Leader (KOL) management platform for connecting brands with influencers. Built with modern web technologies and production-ready deployment.

![KOL Platform](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based auth with role-based permissions
- 👥 **KOL Management** - Browse, filter, and manage influencer profiles
- 🎯 **Advanced Filtering** - Search by category, platform, followers, and price
- 📊 **Campaign Management** - Create and track marketing campaigns
- 📈 **Analytics Dashboard** - Real-time statistics and insights
- 🎨 **Modern UI** - Beautiful Tailwind CSS design with animations
- 🔒 **Role-Based Access** - Admin and client roles with different permissions
- 📱 **Responsive Design** - Works perfectly on all devices
- 📧 **Influencer Invitations** - Email-based invitation system for onboarding influencers
- 📸 **Instagram Integration** - OAuth-based Instagram account connection with auto-import
- ✅ **Consent Management** - GDPR-compliant consent flow for data usage
- 🔗 **Token-Based Registration** - Secure, time-limited registration links

## 🚀 Tech Stack

### Backend
- **Flask 3.0** - Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM
- **JWT** - Authentication
- **Flask-Mail** - Email sending
- **Flask-Migrate** - Database migrations
- **Gunicorn** - Production server

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 3** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Web server
- **Digital Ocean** - Cloud hosting

## 📸 Screenshots

### Dashboard
Beautiful stats cards with real-time data and smooth animations.

### KOL Browser
Filter and browse influencers with advanced search capabilities.

### Campaign Manager
Create and manage marketing campaigns with KOL assignments.

## 🎯 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kol-platform.git
   cd kol-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Create database
   createdb kol_platform
   
   # Configure environment
   cp .env.example .env
   # Edit .env with your settings
   
   # Run server
   python app.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Seed Database** (Optional)
   ```bash
   cd backend
   source venv/bin/activate
   python seed_data.py
   ```

5. **Access the App**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001/api

### Demo Credentials
- **Client**: demo@kolplatform.com / demo123
- **Admin**: admin@kolplatform.com / admin123

## 📧 Influencer Registration Feature

The platform now includes a complete influencer onboarding system:

### How it Works
1. **Admin sends invitation** - Email with unique registration link
2. **Influencer accepts terms** - Consent form with data usage policy
3. **Instagram connection** - OAuth integration for automatic profile import
4. **Profile creation** - KOL profile automatically created with Instagram data

### Quick Setup

```bash
# Backend: Configure email and Instagram API
cd backend
cp .env.example .env
# Edit .env with your credentials

# Run database migration
flask db upgrade

# Test the feature
# 1. Login as admin
# 2. Go to 📧 Invites page
# 3. Send an invitation
# 4. Use the registration link
```

### Documentation
- **Full Guide**: See [INFLUENCER_REGISTRATION.md](INFLUENCER_REGISTRATION.md)
- **Quick Start**: See [QUICK_START_INFLUENCER.md](QUICK_START_INFLUENCER.md)

### Key Features
- ✅ Email invitations with secure tokens (7-day expiration)
- ✅ GDPR-compliant consent management
- ✅ Instagram OAuth integration
- ✅ Automatic profile data import
- ✅ Admin dashboard for invite tracking
- ✅ Works without email/Instagram for testing

## 🐳 Docker Deployment

### Quick Deploy with Docker Compose

```bash
# Create environment file
cp .env.production.example .env
# Edit .env with your values

# Start all services
docker-compose up -d --build

# Seed database
docker-compose exec backend python seed_data.py

# View logs
docker-compose logs -f
```

Visit: http://localhost

## 🌐 Production Deployment

### Digital Ocean (Recommended)

Full deployment guide available in [DEPLOYMENT.md](DEPLOYMENT.md)

**Quick Deploy** (10 minutes):
1. Create Ubuntu droplet ($18/month)
2. Install Docker
3. Upload code
4. Run `./deploy.sh`
5. Done!

See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for step-by-step instructions.

## 📚 Documentation

- [README.md](README.md) - This file
- [QUICK_START.md](QUICK_START.md) - 5-minute local setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - Fast deployment to Digital Ocean
- [STYLE_GUIDE.md](STYLE_GUIDE.md) - Tailwind CSS styling guide
- [PERMISSIONS.md](PERMISSIONS.md) - Role-based access control
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Detailed project overview

## 🏗️ Project Structure

```
kol-platform/
├── backend/                  # Flask backend
│   ├── app.py               # Main application
│   ├── models.py            # Database models
│   ├── config.py            # Configuration
│   ├── requirements.txt     # Python dependencies
│   ├── seed_data.py         # Sample data
│   └── Dockerfile           # Backend container
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── contexts/        # React contexts
│   ├── public/              # Static assets
│   ├── tailwind.config.js   # Tailwind config
│   └── Dockerfile           # Frontend container
├── docker-compose.yml       # Docker orchestration
├── deploy.sh                # Deployment helper
└── README.md                # This file
```

## 🎨 Key Features Detail

### KOL Management
- **Browse KOLs** - View all influencers in a beautiful card layout
- **Advanced Filters** - Filter by category, platform, followers, price
- **Detailed Profiles** - See engagement rates, follower counts, pricing
- **Admin Controls** - Create, edit, delete KOL profiles (admin only)

### Campaign Management
- **Create Campaigns** - Set budgets, dates, and objectives
- **Assign KOLs** - Link influencers to campaigns
- **Track Status** - Monitor draft, active, completed campaigns
- **Budget Management** - Control campaign spending

### User Roles
- **Client** - Browse KOLs, create campaigns
- **Admin** - Full platform management, KOL CRUD operations

### Security
- JWT authentication
- Password hashing
- Role-based access control
- SQL injection protection
- XSS protection
- CORS configuration

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### KOLs
- `GET /api/kols` - List KOLs (with filters)
- `GET /api/kols/:id` - Get KOL details
- `POST /api/kols` - Create KOL (admin)
- `PUT /api/kols/:id` - Update KOL (admin)
- `DELETE /api/kols/:id` - Delete KOL (admin)

### Campaigns
- `GET /api/campaigns` - List user campaigns
- `GET /api/campaigns/:id` - Get campaign
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Statistics
- `GET /api/stats` - Dashboard statistics

## 🔧 Development

### Backend Development
```bash
cd backend
source venv/bin/activate
python app.py
```

### Frontend Development
```bash
cd frontend
npm start
```

### Database Migrations
```bash
cd backend
flask db init
flask db migrate -m "Description"
flask db upgrade
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
docker build -t kol-backend ./backend
```

### Frontend
```bash
cd frontend
npm run build
docker build -t kol-frontend ./frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Built with Flask, React, and Tailwind CSS
- Deployed on Digital Ocean
- Inspired by modern influencer marketing platforms

## 📞 Support

For support, email support@kolplatform.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Advanced analytics and reporting
- [ ] Email notifications
- [ ] File upload for profile images
- [ ] Social media API integrations
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] AI-powered KOL recommendations
- [ ] Real-time chat between brands and KOLs

## ⚡ Performance

- Optimized database queries
- Efficient React rendering
- CDN-ready static assets
- Lazy loading
- Response caching

## 🔒 Security

- JWT token authentication
- Password hashing (bcrypt)
- SQL injection protection
- XSS protection
- CSRF protection
- Rate limiting (recommended for production)

---

**Built with ❤️ for efficient influencer marketing**

⭐ Star this repo if you find it helpful!
