# KOL Platform

A comprehensive Key Opinion Leader (KOL) management platform built with Flask backend and React frontend.

## Features

- 🔐 **User Authentication** - Secure login and registration system
- 👥 **KOL Management** - Create, read, update, and delete KOL profiles
- 📊 **Advanced Filtering** - Filter KOLs by category, platform, followers, and price
- 🚀 **Campaign Management** - Create and manage marketing campaigns
- 📈 **Analytics Dashboard** - View statistics and insights
- 💼 **Professional UI** - Modern, responsive design with excellent UX

## Tech Stack

### Backend
- **Flask** - Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **Flask-JWT-Extended** - JWT authentication
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library with TypeScript
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Modern CSS** - Custom styling with CSS variables

## Project Structure

```
project/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── models.py           # Database models
│   ├── config.py           # Configuration settings
│   ├── requirements.txt    # Python dependencies
│   ├── setup.sh           # Setup script
│   └── .env.example       # Environment variables template
│
└── frontend/
    ├── src/
    │   ├── components/    # React components
    │   ├── contexts/      # React contexts (Auth)
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   └── App.tsx        # Main App component
    └── package.json       # Node dependencies
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up PostgreSQL database:
```bash
# Create database
createdb kol_platform

# Or using psql
psql -U postgres
CREATE DATABASE kol_platform;
```

5. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

6. Run the application:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://username:password@localhost:5432/kol_platform
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
FLASK_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### KOLs
- `GET /api/kols` - Get all KOLs (supports filtering)
- `GET /api/kols/:id` - Get single KOL
- `POST /api/kols` - Create new KOL (requires auth)
- `PUT /api/kols/:id` - Update KOL (requires auth)
- `DELETE /api/kols/:id` - Delete KOL (requires auth)

### Campaigns
- `GET /api/campaigns` - Get user's campaigns (requires auth)
- `GET /api/campaigns/:id` - Get single campaign (requires auth)
- `POST /api/campaigns` - Create new campaign (requires auth)
- `PUT /api/campaigns/:id` - Update campaign (requires auth)
- `DELETE /api/campaigns/:id` - Delete campaign (requires auth)

### Statistics
- `GET /api/stats` - Get dashboard statistics (requires auth)

## Database Models

### User
- id, email, password_hash, full_name, role, created_at

### KOL
- id, name, email, category, platform, followers, engagement_rate, bio, profile_image, price_per_post, verified, created_at, updated_at

### Campaign
- id, title, description, budget, start_date, end_date, status, kol_id, user_id, created_at, updated_at

## Features in Detail

### KOL Management
- Browse KOLs with beautiful card-based layout
- Filter by category (Tech, Fashion, Fitness, Beauty, Food, Travel)
- Filter by platform (Instagram, YouTube, TikTok, Twitter)
- Filter by minimum followers and maximum price
- View detailed KOL profiles with metrics
- Add, edit, and delete KOLs

### Campaign Management
- Create marketing campaigns with budgets and timelines
- Assign KOLs to campaigns
- Track campaign status (Draft, Active, Completed, Cancelled)
- View all campaigns in grid layout
- Edit and delete campaigns

### Dashboard
- View total KOLs count
- View total campaigns count
- View active campaigns count
- Quick access to main features

## Development

### Running Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Building for Production

#### Backend
```bash
# Use a production WSGI server like gunicorn
pip install gunicorn
gunicorn app:app
```

#### Frontend
```bash
npm run build
# Serve the build folder with a static server
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@kolplatform.com or open an issue in the repository.

## Roadmap

- [ ] Advanced analytics and reporting
- [ ] Email notifications
- [ ] File upload for KOL profile images
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Integration with social media platforms
- [ ] Advanced search with AI-powered recommendations

