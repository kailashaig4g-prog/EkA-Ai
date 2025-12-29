# Quick Start Guide

Get EkA-Ai up and running in 5 minutes!

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- MongoDB 6+ running
- An OpenAI API key

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/kailashaig4g-prog/EkA-Ai.git
cd EkA-Ai

# Install dependencies
npm install
```

## Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and set required variables:
# - OPENAI_API_KEY (required)
# - MONGODB_URI (if not using default)
# - JWT_SECRET (use a strong random string)
```

Minimum required configuration:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
JWT_SECRET=your-super-secret-key-minimum-32-characters
MONGODB_URI=mongodb://localhost:27017/eka-ai
```

## Step 3: Start Services

### Option A: Using Docker Compose (Recommended)

```bash
# Start all services (MongoDB, Redis, App)
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Option B: Manual Setup

```bash
# Ensure MongoDB is running
mongod

# Start Redis (optional, for caching)
redis-server

# Start the application in development mode
npm run dev
```

## Step 4: Verify Installation

Check if the server is running:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 5.123
}
```

## Step 5: Create Your First User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

Save the `token` from the response for the next step.

## Step 6: Test the AI Chat

```bash
curl -X POST http://localhost:5000/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "message": "What should I check before a long road trip?"
  }'
```

## Next Steps

### Add a Vehicle

```bash
curl -X POST http://localhost:5000/api/v1/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "mileage": 15000,
    "fuelType": "gasoline"
  }'
```

### Explore the API

- View full API documentation: [docs/API.md](API.md)
- Test endpoints using the included Postman collection
- Check out example requests in `examples/` directory

## Common Issues

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running. Use `docker-compose up -d mongodb` or start MongoDB manually.

### OpenAI API Error
```
Error: OpenAI API key not configured
```
**Solution**: Add your OpenAI API key to `.env` file.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Either stop the process using port 5000 or change `PORT` in `.env` file.

## Development Tips

### Watch Mode
```bash
npm run dev
```
Server automatically restarts on file changes.

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

## Production Deployment

For production deployment instructions, see:
- [Deployment Guide](DEPLOYMENT.md)
- [Docker Guide](DOCKER.md)
- [Kubernetes Guide](KUBERNETES.md)

## Getting Help

- 📖 Documentation: [docs/](.)
- 🐛 Report Issues: [GitHub Issues](https://github.com/kailashaig4g-prog/EkA-Ai/issues)
- 💬 Community: [Discord](https://discord.gg/eka-ai)
- 📧 Email: support@eka-ai.com

## What's Next?

1. Explore all available features in [FEATURES.md](FEATURES.md)
2. Read the full [API Documentation](API.md)
3. Learn about the [Architecture](ARCHITECTURE.md)
4. Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

Happy coding! 🚗💨
