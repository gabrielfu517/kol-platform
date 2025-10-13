# Deployment Guide - Digital Ocean

Complete guide to deploy the KOL Platform to Digital Ocean.

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)
Deploy everything with Docker on a single Droplet.

### Option 2: App Platform
Use Digital Ocean's managed App Platform (easiest, but more expensive).

---

## Option 1: Docker Compose Deployment

### Prerequisites

1. **Digital Ocean Account** - [Sign up here](https://www.digitalocean.com/)
2. **Domain Name** (optional but recommended)
3. **SSH Key** for secure access

### Step 1: Create a Droplet

1. **Log in to Digital Ocean**
2. **Create > Droplets**
3. Choose configuration:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic (Regular)
   - **CPU**: 2 vCPUs, 2GB RAM, 60GB SSD ($18/month) - Minimum recommended
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: `kol-platform`

4. **Click "Create Droplet"**

### Step 2: Configure Your Droplet

SSH into your droplet:
```bash
ssh root@your_droplet_ip
```

Update system:
```bash
apt update && apt upgrade -y
```

Install Docker:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Start Docker
systemctl start docker
systemctl enable docker
```

Install Git:
```bash
apt install git -y
```

### Step 3: Deploy the Application

Clone your repository:
```bash
cd /opt
git clone https://github.com/yourusername/kol-platform.git
# OR upload your files via SCP
```

If uploading manually:
```bash
# From your local machine
scp -r /Users/fugabriel/project root@your_droplet_ip:/opt/kol-platform
```

Navigate to project:
```bash
cd /opt/kol-platform
```

Create environment file:
```bash
cp .env.example .env
nano .env
```

Update `.env` with production values:
```env
POSTGRES_USER=koluser
POSTGRES_PASSWORD=SuperSecurePassword123!

SECRET_KEY=generate-a-very-long-random-string-here-use-at-least-50-characters
JWT_SECRET_KEY=another-very-long-random-string-different-from-above

API_URL=http://your-droplet-ip/api
# Or if you have a domain: API_URL=https://yourdomain.com/api
```

Generate secure keys:
```bash
# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(50))"

# Generate JWT_SECRET_KEY  
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

### Step 4: Start the Application

Build and start containers:
```bash
docker-compose up -d --build
```

Check container status:
```bash
docker-compose ps
```

View logs:
```bash
# All containers
docker-compose logs -f

# Specific container
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Step 5: Initialize Database

Seed the database with sample data:
```bash
docker-compose exec backend python seed_data.py
```

### Step 6: Configure Firewall

```bash
# Allow SSH
ufw allow OpenSSH

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS (if using SSL)
ufw allow 443/tcp

# Enable firewall
ufw enable
```

### Step 7: Access Your Application

Open browser and visit:
```
http://your_droplet_ip
```

Login with:
- **Email**: `demo@kolplatform.com`
- **Password**: `demo123`

Or:
- **Email**: `admin@kolplatform.com`
- **Password**: `admin123`

---

## 🔒 Add SSL Certificate (Recommended)

### Using Certbot with Let's Encrypt

**Prerequisites**: You need a domain pointing to your droplet IP.

Install Certbot:
```bash
apt install certbot python3-certbot-nginx -y
```

Update nginx configuration:
```bash
nano /opt/kol-platform/frontend/nginx.conf
```

Add your domain:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

Rebuild frontend:
```bash
docker-compose up -d --build frontend
```

Get SSL certificate:
```bash
# Stop containers temporarily
docker-compose down

# Run certbot
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Start containers
docker-compose up -d
```

Update nginx for HTTPS:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # ... rest of configuration
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Option 2: Digital Ocean App Platform

### Step 1: Prepare Your Code

Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/kol-platform.git
git push -u origin main
```

### Step 2: Create App

1. Go to **App Platform** in Digital Ocean
2. **Create App**
3. Choose **GitHub** as source
4. Select your repository
5. Configure components:

**Database:**
- Type: PostgreSQL
- Name: `kol-db`
- Plan: Basic ($15/month)

**Backend Service:**
- Type: Web Service
- Source: `/backend`
- Build Command: `pip install -r requirements.txt`
- Run Command: `gunicorn --bind 0.0.0.0:8080 --workers 4 app:app`
- HTTP Port: 8080
- Environment Variables:
  - `DATABASE_URL`: ${db.DATABASE_URL}
  - `SECRET_KEY`: (generate random)
  - `JWT_SECRET_KEY`: (generate random)
  - `FLASK_ENV`: production

**Frontend Service:**
- Type: Static Site
- Source: `/frontend`
- Build Command: `npm install && npm run build`
- Output Directory: `build`
- Environment Variables:
  - `REACT_APP_API_URL`: ${backend.PUBLIC_URL}/api

### Step 3: Deploy

Click **Create Resources** and wait for deployment (5-10 minutes).

---

## 📊 Monitoring & Maintenance

### Check Application Health

```bash
# Check all containers
docker-compose ps

# Check logs
docker-compose logs -f

# Check resource usage
docker stats
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U koluser kol_platform > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T postgres psql -U koluser kol_platform < backup_20241013.sql
```

### Update Application

```bash
cd /opt/kol-platform

# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Or without downtime
docker-compose up -d --build --no-deps backend
docker-compose up -d --build --no-deps frontend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

---

## 🔧 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Check database connection
docker-compose exec backend python -c "from app import db; print(db)"
```

### Database connection issues

```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Verify connection
docker-compose exec postgres psql -U koluser -d kol_platform -c "\dt"
```

### Frontend shows API errors

1. Check `API_URL` in `.env`
2. Verify backend is accessible:
   ```bash
   curl http://localhost:5001/api/kols
   ```
3. Check CORS settings in backend

### Performance Issues

```bash
# Check resource usage
docker stats

# Scale backend workers
# Edit docker-compose.yml, change --workers value
docker-compose up -d --build backend
```

---

## 💰 Cost Estimate

### Docker Compose Option
- **Droplet**: $18-24/month (2GB-4GB RAM)
- **Domain**: $12/year (optional)
- **Total**: ~$18-24/month

### App Platform Option
- **Database**: $15/month
- **Backend**: $12/month
- **Frontend**: $5/month
- **Total**: ~$32/month

---

## 🔐 Security Checklist

- ✅ Change all default passwords
- ✅ Use strong SECRET_KEY and JWT_SECRET_KEY
- ✅ Enable firewall (UFW)
- ✅ Use SSH keys instead of passwords
- ✅ Install SSL certificate (HTTPS)
- ✅ Regular backups
- ✅ Keep system updated
- ✅ Monitor logs
- ✅ Use environment variables (never commit secrets)
- ✅ Disable root login (optional)

---

## 📚 Additional Resources

- [Digital Ocean Documentation](https://docs.digitalocean.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Let's Encrypt](https://letsencrypt.org/)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)

---

## 🎯 Quick Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Check status
docker-compose ps

# Database backup
docker-compose exec postgres pg_dump -U koluser kol_platform > backup.sql

# Restart
docker-compose restart

# Update app
git pull && docker-compose up -d --build
```

---

**Your KOL Platform is now deployed! 🚀**

