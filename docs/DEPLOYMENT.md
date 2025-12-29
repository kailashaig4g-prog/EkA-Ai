# Deployment Guide

This guide covers deploying EkA-Ai to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Cloud Platforms](#cloud-platforms)
- [Monitoring](#monitoring)
- [Security Checklist](#security-checklist)

## Prerequisites

Before deploying, ensure you have:

- [ ] OpenAI API key
- [ ] MongoDB instance (local or cloud)
- [ ] Redis instance (optional, for caching)
- [ ] Domain name (for production)
- [ ] SSL certificate (for production)

## Environment Variables

### Required Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-mongodb-uri
OPENAI_API_KEY=sk-your-openai-key
JWT_SECRET=your-secure-jwt-secret
```

### Optional but Recommended

```env
REDIS_HOST=your-redis-host
REDIS_PORT=6379
SENTRY_DSN=your-sentry-dsn
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/kailashaig4g-prog/EkA-Ai.git
   cd EkA-Ai
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **Verify deployment**
   ```bash
   curl http://localhost:5000/health
   ```

### Using Docker Only

1. **Build image**
   ```bash
   docker build -t eka-ai:latest .
   ```

2. **Run container**
   ```bash
   docker run -d \
     --name eka-ai \
     -p 5000:5000 \
     --env-file .env \
     eka-ai:latest
   ```

## Cloud Platforms

### AWS Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB application**
   ```bash
   eb init -p node.js-18 eka-ai
   ```

3. **Create environment**
   ```bash
   eb create eka-ai-prod
   ```

4. **Set environment variables**
   ```bash
   eb setenv MONGODB_URI=mongodb://... OPENAI_API_KEY=sk-...
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

### Heroku

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku  # macOS
   # or download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and create app**
   ```bash
   heroku login
   heroku create eka-ai-prod
   ```

3. **Add MongoDB addon**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

4. **Set environment variables**
   ```bash
   heroku config:set OPENAI_API_KEY=sk-your-key
   heroku config:set JWT_SECRET=your-secret
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set environment variables**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all required variables

### Railway

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and initialize**
   ```bash
   railway login
   railway init
   ```

3. **Add MongoDB plugin**
   ```bash
   railway add mongodb
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### DigitalOcean App Platform

1. **Create app via dashboard**
   - Go to DigitalOcean → App Platform
   - Connect GitHub repository
   - Select branch (main)

2. **Configure build**
   - Build Command: `npm install`
   - Run Command: `npm start`

3. **Add environment variables**
   - In app settings, add all required variables

4. **Deploy**
   - Click "Deploy"

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.19+)
- kubectl configured
- Docker registry access

### Deploy to Kubernetes

1. **Create namespace**
   ```bash
   kubectl create namespace eka-ai
   ```

2. **Create secrets**
   ```bash
   kubectl create secret generic eka-ai-secrets \
     --from-literal=OPENAI_API_KEY=sk-your-key \
     --from-literal=JWT_SECRET=your-secret \
     --from-literal=MONGODB_URI=mongodb://... \
     -n eka-ai
   ```

3. **Apply manifests**
   ```bash
   kubectl apply -f kubernetes/ -n eka-ai
   ```

4. **Verify deployment**
   ```bash
   kubectl get pods -n eka-ai
   kubectl get svc -n eka-ai
   ```

5. **Access application**
   ```bash
   kubectl port-forward svc/eka-ai 5000:5000 -n eka-ai
   ```

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster

2. **Configure network access**
   - Add IP addresses (0.0.0.0/0 for development)
   - Configure more restrictive rules for production

3. **Create database user**
   - Create user with read/write permissions

4. **Get connection string**
   - Copy connection string
   - Replace `<password>` with actual password
   - Use in `MONGODB_URI`

### Self-hosted MongoDB

```bash
# Using Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:6.0
```

## Monitoring

### Sentry Error Tracking

1. **Create Sentry project**
   - Go to [Sentry](https://sentry.io)
   - Create new project

2. **Add DSN to environment**
   ```env
   SENTRY_DSN=https://...@sentry.io/...
   ```

### Health Checks

Setup health check monitoring:

```bash
# Using curl
curl https://your-domain.com/health

# Using monitoring service (UptimeRobot, Pingdom, etc.)
# Configure to check /health endpoint every 5 minutes
```

### Log Management

For production logging:

1. **CloudWatch (AWS)**
   ```bash
   aws logs tail /aws/elasticbeanstalk/eka-ai/var/log/nodejs/nodejs.log
   ```

2. **Papertrail**
   - Add Papertrail destination
   - Configure log streaming

## Performance Optimization

### Enable Caching

```env
ENABLE_CACHING=true
REDIS_HOST=your-redis-host
```

### CDN Setup

1. Configure CDN (CloudFlare, Fastly)
2. Point to your domain
3. Cache static assets

### Database Indexing

Ensure all indexes are created:

```bash
# Connect to MongoDB
mongo your-mongodb-uri

# Verify indexes
use eka-ai
db.users.getIndexes()
db.vehicles.getIndexes()
```

## Security Checklist

Before deploying to production:

- [ ] Change all default secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS whitelist
- [ ] Set up rate limiting
- [ ] Enable security headers (Helmet)
- [ ] Regular security updates
- [ ] Configure firewall rules
- [ ] Enable audit logging
- [ ] Set up backup strategy
- [ ] Configure secret rotation

## Backup Strategy

### Automated MongoDB Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backups/mongodb_$DATE"
```

### Backup to S3

```bash
# Upload to S3
aws s3 sync /backups s3://your-backup-bucket/eka-ai/
```

## Scaling

### Horizontal Scaling

```bash
# Kubernetes
kubectl scale deployment eka-ai --replicas=3 -n eka-ai

# Heroku
heroku ps:scale web=3
```

### Load Balancing

Configure load balancer (NGINX, HAProxy, AWS ALB) to distribute traffic across instances.

## Troubleshooting

### Application Won't Start

1. Check logs
2. Verify environment variables
3. Test database connection
4. Check port availability

### Database Connection Issues

1. Verify MONGODB_URI
2. Check network access
3. Verify credentials
4. Test connection with mongo shell

### High Memory Usage

1. Check for memory leaks
2. Optimize database queries
3. Implement caching
4. Scale horizontally

## Support

For deployment assistance:
- 📧 Email: devops@eka-ai.com
- 💬 Discord: [DevOps Channel](https://discord.gg/eka-ai)
- 📖 Docs: [https://docs.eka-ai.com](https://docs.eka-ai.com)

---

Happy deploying! 🚀
