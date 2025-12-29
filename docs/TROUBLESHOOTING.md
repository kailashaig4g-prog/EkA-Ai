# Troubleshooting Guide

Common issues and solutions for EkA-Ai.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Database Connection](#database-connection)
- [API Errors](#api-errors)
- [Authentication Problems](#authentication-problems)
- [OpenAI Integration](#openai-integration)
- [Performance Issues](#performance-issues)
- [Docker Issues](#docker-issues)

## Installation Issues

### npm install fails

**Problem:** Package installation errors

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try specific Node version
nvm use 18
npm install
```

### Permission errors on Linux/Mac

**Problem:** `EACCES` permission errors

**Solution:**
```bash
# Don't use sudo! Fix npm permissions instead
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## Database Connection

### MongoDB connection refused

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

1. **Check if MongoDB is running:**
```bash
# Linux/Mac
sudo systemctl status mongod

# Or check process
ps aux | grep mongod
```

2. **Start MongoDB:**
```bash
# Linux
sudo systemctl start mongod

# Mac
brew services start mongodb-community

# Docker
docker-compose up -d mongodb
```

3. **Verify connection string:**
```env
# Correct format
MONGODB_URI=mongodb://localhost:27017/eka-ai

# With auth
MONGODB_URI=mongodb://username:password@localhost:27017/eka-ai
```

### MongoDB authentication failed

**Error:**
```
MongoServerError: Authentication failed
```

**Solutions:**

1. Check credentials in `.env`
2. Create database user:
```javascript
use admin
db.createUser({
  user: "ekaai",
  pwd: "password",
  roles: [{ role: "readWrite", db: "eka-ai" }]
})
```

### Connection timeout

**Error:**
```
MongooseError: Operation timed out
```

**Solutions:**

1. Increase timeout in config:
```javascript
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000 // 10 seconds
});
```

2. Check network/firewall
3. Verify MongoDB is accessible from your host

## API Errors

### 404 Not Found

**Problem:** API endpoints return 404

**Solutions:**

1. Verify server is running:
```bash
curl http://localhost:5000/health
```

2. Check correct URL format:
```
✓ http://localhost:5000/api/v1/auth/login
✗ http://localhost:5000/auth/login (missing /api/v1)
```

3. Check routes are loaded:
```javascript
// In src/app.js
console.log(app._router.stack); // Debug routes
```

### 500 Internal Server Error

**Problem:** Unexpected server errors

**Solutions:**

1. Check server logs:
```bash
# View logs
tail -f logs/all.log

# Or with Docker
docker-compose logs -f app
```

2. Enable detailed errors (development only):
```env
NODE_ENV=development
```

3. Check stack trace in response (dev mode)

### Rate limit exceeded

**Error:**
```json
{
  "success": false,
  "message": "Too many requests from this IP"
}
```

**Solutions:**

1. Wait for rate limit window to expire
2. For development, increase limits in `.env`:
```env
RATE_LIMIT_MAX_REQUESTS=1000
```

3. Use different IP or API key

## Authentication Problems

### Invalid token

**Error:**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**Solutions:**

1. Check token format:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

2. Verify token hasn't expired
3. Check JWT_SECRET matches between creation and verification
4. Get new token via login

### Token expired

**Solutions:**

1. Login again to get fresh token
2. Use refresh token if implemented
3. Increase token expiry (not recommended):
```env
JWT_EXPIRE=30d
```

### Account locked

**Error:**
```json
{
  "success": false,
  "message": "Account locked. Try again in X minutes"
}
```

**Solutions:**

1. Wait for lock period (default: 30 minutes)
2. Reset failed attempts in database:
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { 
    $set: { 
      accountLocked: false,
      failedLoginAttempts: 0,
      accountLockedUntil: null
    }
  }
)
```

## OpenAI Integration

### API key not configured

**Error:**
```
Error: OpenAI client not initialized
```

**Solution:**

Add API key to `.env`:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Rate limit exceeded (OpenAI)

**Error:**
```
Error: Rate limit exceeded
```

**Solutions:**

1. Wait before retrying
2. Implement exponential backoff
3. Upgrade OpenAI plan
4. Cache responses to reduce API calls

### Invalid API key

**Error:**
```
Error: Incorrect API key provided
```

**Solutions:**

1. Verify API key in `.env`
2. Check for extra spaces or newlines
3. Generate new API key from OpenAI dashboard
4. Ensure key has required permissions

## Performance Issues

### Slow API responses

**Causes & Solutions:**

1. **Database queries:**
```javascript
// Add indexes
userSchema.index({ email: 1 });
vehicleSchema.index({ owner: 1 });
```

2. **Enable caching:**
```env
ENABLE_CACHING=true
REDIS_HOST=localhost
```

3. **Optimize queries:**
```javascript
// Only select needed fields
User.findById(id).select('name email');

// Use lean for read-only
User.find().lean();
```

### High memory usage

**Solutions:**

1. Enable garbage collection:
```bash
node --expose-gc src/server.js
```

2. Limit payload size:
```javascript
app.use(express.json({ limit: '10mb' }));
```

3. Use streaming for large data:
```javascript
res.write(chunk);
res.end();
```

### Database slow queries

**Solutions:**

1. Enable MongoDB profiler:
```javascript
db.setProfilingLevel(1, { slowms: 100 });
```

2. Analyze queries:
```javascript
db.users.find({ email: "test" }).explain("executionStats");
```

3. Add missing indexes

## Docker Issues

### Container won't start

**Solutions:**

1. Check logs:
```bash
docker-compose logs app
```

2. Verify environment variables:
```bash
docker-compose config
```

3. Rebuild image:
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Port already in use

**Error:**
```
Error: bind: address already in use
```

**Solutions:**

1. Find and kill process:
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

2. Change port in `.env`:
```env
PORT=5001
```

### Volume permission issues

**Error:**
```
Error: EACCES: permission denied
```

**Solutions:**

1. Fix ownership:
```bash
sudo chown -R $USER:$USER ./logs ./uploads
```

2. Run with user flag:
```yaml
# docker-compose.yml
user: "${UID}:${GID}"
```

## Common Development Issues

### Hot reload not working

**Solution:**

```bash
# Use nodemon
npm install -g nodemon
nodemon src/server.js

# Or use npm script
npm run dev
```

### ESLint errors

**Solution:**

```bash
# Auto-fix
npm run lint:fix

# Disable specific rule
/* eslint-disable no-console */
```

### Tests failing

**Solutions:**

1. Clear test database:
```bash
mongo eka-ai-test --eval "db.dropDatabase()"
```

2. Check test environment:
```bash
NODE_ENV=test npm test
```

3. Run tests in isolation:
```bash
npm test -- --runInBand
```

## Getting Help

If you can't resolve your issue:

1. **Check existing issues:** [GitHub Issues](https://github.com/kailashaig4g-prog/EkA-Ai/issues)
2. **Search documentation:** [docs/](.)
3. **Ask on Discord:** [Community](https://discord.gg/eka-ai)
4. **Email support:** support@eka-ai.com

### When Reporting Issues

Include:

- Error message (full stack trace)
- Steps to reproduce
- Environment details:
  - OS and version
  - Node.js version
  - Package versions
- Configuration (sanitized `.env`)
- Logs

---

Still stuck? Don't hesitate to ask for help! 🙋‍♂️
