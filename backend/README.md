# KOL Platform Backend

Flask-based REST API for KOL management platform.

## Setup

### Quick Start

```bash
# Run the setup script
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure database:
```bash
# Create PostgreSQL database
createdb kol_platform

# Copy and edit .env
cp .env.example .env
# Edit DATABASE_URL in .env
```

4. Run the application:
```bash
python app.py
```

## Database Setup

### PostgreSQL Installation

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### Create Database

```bash
# Create database
createdb kol_platform

# Or using psql
psql -U postgres
CREATE DATABASE kol_platform;
\q
```

## Configuration

Edit `.env` file with your settings:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/kol_platform
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
FLASK_ENV=development
```

## API Documentation

### Authentication

All authenticated endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Sample API Calls

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Create KOL:**
```bash
curl -X POST http://localhost:5000/api/kols \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "category": "fashion",
    "platform": "instagram",
    "followers": 100000,
    "engagement_rate": 3.5,
    "price_per_post": 500
  }'
```

## Database Migrations

The app uses Flask-Migrate for database migrations.

```bash
# Initialize migrations (first time only)
flask db init

# Create migration
flask db migrate -m "Description of changes"

# Apply migration
flask db upgrade

# Rollback migration
flask db downgrade
```

## Development

### Running in Debug Mode

```bash
export FLASK_ENV=development
python app.py
```

### Database Reset

```bash
# Drop and recreate database
dropdb kol_platform
createdb kol_platform
python app.py  # Tables will be created automatically
```

## Production Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Docker

```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Environment Variables for Production

- Set `FLASK_ENV=production`
- Use strong `SECRET_KEY` and `JWT_SECRET_KEY`
- Configure production database URL
- Enable HTTPS
- Set up proper CORS origins

## Troubleshooting

### Database Connection Error

```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solution:** Ensure PostgreSQL is running and DATABASE_URL is correct.

### Import Errors

```
ModuleNotFoundError: No module named 'flask'
```

**Solution:** Activate virtual environment and install dependencies:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Port Already in Use

```
OSError: [Errno 48] Address already in use
```

**Solution:** Kill the process using port 5000 or change the port:
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9

# Or change port in app.py
app.run(debug=True, port=5001)
```

