# Quick Start Guide - KOL Platform

Get up and running in 5 minutes!

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed  
- PostgreSQL installed and running

## Step 1: Setup PostgreSQL Database

```bash
# Create the database
createdb kol_platform
```

If you don't have PostgreSQL installed:

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

## Step 2: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env if needed (default settings work for local development)

# Start the backend server
python app.py
```

Backend will run on `http://localhost:5000`

## Step 3: Setup Frontend

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

Frontend will open automatically at `http://localhost:3000`

## Step 4: Create an Account

1. Open `http://localhost:3000` in your browser
2. Click "Sign Up" 
3. Fill in your details:
   - Full Name
   - Email
   - Password (minimum 6 characters)
4. Click "Sign Up"

You'll be automatically logged in!

## Step 5: Add Your First KOL

1. Click "KOLs" in the navigation
2. Click "+ Add New KOL"
3. Fill in the KOL details:
   - Name (e.g., "Jane Smith")
   - Email
   - Category (Tech, Fashion, Fitness, etc.)
   - Platform (Instagram, YouTube, TikTok, Twitter)
   - Followers (e.g., 100000)
   - Engagement Rate (e.g., 3.5%)
   - Price per Post (e.g., 500)
   - Bio (optional)
   - Verified checkbox (optional)
4. Click "Create KOL"

## Step 6: Create Your First Campaign

1. Click "Campaigns" in the navigation
2. Click "+ Create Campaign"
3. Fill in campaign details:
   - Campaign Title (e.g., "Summer Product Launch")
   - Description (optional)
   - Budget (e.g., 5000)
   - Status (Draft, Active, etc.)
   - Dates (optional)
   - Assign KOL (optional - select from dropdown)
4. Click "Create Campaign"

## You're All Set! 🎉

You now have a fully functional KOL platform. Explore the features:

- **Dashboard**: View statistics and overview
- **KOLs**: Browse, filter, add, edit, and delete KOLs
- **Campaigns**: Manage your marketing campaigns

## Default Database Configuration

The default `.env` configuration uses:
- Host: `localhost`
- Port: `5432` (PostgreSQL default)
- Database: `kol_platform`
- User: Your system user (PostgreSQL default)

If you need different credentials, edit `backend/.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/kol_platform
```

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Check database exists: `psql -l | grep kol_platform`
- Verify virtual environment is activated: `which python`

### Frontend won't start
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check port 3000 is free: `lsof -ti:3000`

### Can't connect to backend from frontend
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure both servers are running

### Database connection error
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Try connecting manually: `psql kol_platform`

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [backend/README.md](backend/README.md) for API documentation
- Check [frontend/README.md](frontend/README.md) for frontend details
- Customize the platform for your needs
- Deploy to production!

## Need Help?

- Check the documentation in the README files
- Review the code comments
- Open an issue on GitHub

Happy KOL management! 🚀

