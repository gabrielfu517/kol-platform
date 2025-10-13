#!/bin/bash

# Deployment script for KOL Platform
# This script helps you deploy to Digital Ocean

set -e

echo "🚀 KOL Platform Deployment Helper"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating from template..."
    cp .env.production.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your production values!"
    echo "Run: nano .env"
    echo ""
    read -p "Press enter when you've updated .env..."
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Ask for deployment action
echo "What would you like to do?"
echo "1) Build and start services"
echo "2) Stop services"
echo "3) View logs"
echo "4) Restart services"
echo "5) Seed database with sample data"
echo "6) Backup database"
echo "7) Update and rebuild"
echo ""
read -p "Enter choice [1-7]: " choice

case $choice in
    1)
        echo "🔨 Building and starting services..."
        docker-compose up -d --build
        echo ""
        echo "✅ Services started!"
        echo "Wait a moment for initialization..."
        sleep 5
        echo ""
        echo "📊 Container status:"
        docker-compose ps
        echo ""
        echo "🌐 Access your app at: http://localhost"
        echo "   API: http://localhost:5001/api"
        ;;
    2)
        echo "⏹️  Stopping services..."
        docker-compose down
        echo "✅ Services stopped"
        ;;
    3)
        echo "📜 Viewing logs (Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
    4)
        echo "🔄 Restarting services..."
        docker-compose restart
        echo "✅ Services restarted"
        ;;
    5)
        echo "🌱 Seeding database..."
        docker-compose exec backend python seed_data.py
        echo "✅ Database seeded"
        ;;
    6)
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        echo "💾 Creating database backup: $BACKUP_FILE"
        docker-compose exec postgres pg_dump -U koluser kol_platform > $BACKUP_FILE
        echo "✅ Backup created: $BACKUP_FILE"
        ;;
    7)
        echo "🔄 Updating and rebuilding..."
        git pull
        docker-compose up -d --build
        echo "✅ Update complete"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Done! 🎉"

