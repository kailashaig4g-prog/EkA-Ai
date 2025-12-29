#!/bin/bash

# EkA-Ai Startup Script for Unix/Linux/Mac
# This script sets up and starts the EkA-Ai application

echo "🚗 Starting EkA-Ai - Automotive AI Assistant"
echo "==========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration"
    echo "   Minimum required: OPENAI_API_KEY, JWT_SECRET"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if MongoDB is running
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    echo "✅ MongoDB client detected"
else
    echo "⚠️  MongoDB client not found. Make sure MongoDB is running."
fi

# Create necessary directories
mkdir -p logs uploads

echo ""
echo "🚀 Starting application..."
echo ""

# Start the application
if [ "$1" == "dev" ]; then
    echo "📍 Development mode"
    npm run dev
else
    echo "📍 Production mode"
    npm start
fi
