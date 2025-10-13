# Quick Deployment Guide

The fastest way to deploy your KOL Platform to Digital Ocean.

## 🎯 Prerequisites

- Digital Ocean account
- Credit card for billing
- 10 minutes of your time

## 🚀 Fast Track Deployment

### Step 1: Create Droplet (2 minutes)

1. Go to [Digital Ocean](https://cloud.digitalocean.com/droplets/new)
2. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Basic, $18/month (2GB RAM)
   - **Datacenter**: Closest to you
   - **Authentication**: SSH Key or Password
3. Click **Create Droplet**
4. Wait for IP address

### Step 2: Connect to Your Droplet (1 minute)

```bash
ssh root@YOUR_DROPLET_IP
```

### Step 3: Install Docker (2 minutes)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# Install Docker Compose
apt install docker-compose git -y
```

### Step 4: Upload Your Code (2 minutes)

**Option A: From your computer**
```bash
# On your local machine
cd /Users/fugabriel/project
scp -r . root@YOUR_DROPLET_IP:/opt/kol-platform
```

**Option B: From Git**
```bash
# On the droplet
cd /opt
git clone YOUR_REPO_URL kol-platform
```

### Step 5: Configure Environment (2 minutes)

```bash
cd /opt/kol-platform

# Create .env file
cat > .env << EOF
POSTGRES_USER=koluser
POSTGRES_PASSWORD=$(openssl rand -base64 32)
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
API_URL=http://YOUR_DROPLET_IP/api
EOF

# View the generated values
cat .env
```

### Step 6: Deploy! (3 minutes)

```bash
# Build and start everything
docker-compose up -d --build

# Wait for services to start
sleep 30

# Seed the database
docker-compose exec backend python seed_data.py

# Check if everything is running
docker-compose ps
```

### Step 7: Configure Firewall (1 minute)

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw --force enable
```

## ✅ Done!

Visit: `http://YOUR_DROPLET_IP`

**Login credentials:**
- Email: `demo@kolplatform.com`
- Password: `demo123`

Or admin:
- Email: `admin@kolplatform.com`
- Password: `admin123`

---

## 🔧 Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Update app
cd /opt/kol-platform
git pull
docker-compose up -d --build

# Backup database
docker-compose exec postgres pg_dump -U koluser kol_platform > backup.sql
```

---

## 🌐 Add Your Domain (Optional)

If you have a domain name:

1. **Add A Record** in your domain DNS:
   - Type: A
   - Name: @
   - Value: YOUR_DROPLET_IP

2. **Update .env**:
   ```bash
   nano /opt/kol-platform/.env
   # Change API_URL to your domain
   API_URL=http://yourdomain.com/api
   ```

3. **Rebuild frontend**:
   ```bash
   docker-compose up -d --build frontend
   ```

4. **Add SSL** (free):
   ```bash
   # Stop containers
   docker-compose down
   
   # Install certbot
   apt install certbot -y
   
   # Get certificate
   certbot certonly --standalone -d yourdomain.com
   
   # Start containers
   docker-compose up -d
   ```

---

## 💰 Cost

**Monthly**: ~$18 (Droplet only)

**What you get:**
- Full application hosting
- PostgreSQL database
- Unlimited requests
- No per-request fees

---

## 🆘 Troubleshooting

**Services won't start?**
```bash
docker-compose logs backend
docker-compose logs frontend
```

**Can't access website?**
```bash
# Check firewall
ufw status

# Check containers
docker-compose ps

# Check port 80
curl http://localhost
```

**Database issues?**
```bash
docker-compose exec postgres psql -U koluser -d kol_platform -c "\dt"
```

---

## 📞 Need Help?

Check the full guide: `DEPLOYMENT.md`

---

**That's it! You're deployed! 🎉**

