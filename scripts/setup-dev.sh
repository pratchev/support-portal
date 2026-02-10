#!/bin/bash

# Support Portal Development Environment Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up Support Portal Development Environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 22 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "❌ Node.js version 22 or higher is required. Current version: $(node -v)"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    exit 1
fi

echo "✅ Prerequisites met!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual configuration values"
fi

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL, Redis)..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Run database migrations
echo "🗄️  Running database migrations..."
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
cd ../..

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

# Build shared package
echo "🔨 Building shared package..."
cd packages/shared
npm run build
cd ../..

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "🎉 You can now start the development servers:"
echo "   npm run dev           - Start all services"
echo "   npm run dev:web       - Start Next.js frontend only"
echo "   npm run dev:api       - Start Express API only"
echo ""
echo "📚 Useful commands:"
echo "   npm run db:studio     - Open Prisma Studio"
echo "   npm run lint          - Run linters"
echo "   npm run test          - Run tests"
echo "   docker compose down   - Stop Docker services"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   API:      http://localhost:4000"
echo "   DB Admin: npm run db:studio"
echo ""
