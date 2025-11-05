# VibeCoin Deployment Guide

Guide for deploying VibeCoin to production.

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL/TLS certificates ready
- [ ] Domain name configured (api.vibecoin.sh and tasks.vibecoin.sh)
- [ ] Monitoring set up
- [ ] Error tracking enabled

## Architecture Overview

VibeCoin now consists of two services:

1. **API Server** (`api.vibecoin.sh`): Backend API for authentication, tasks, and earnings
2. **Task Viewer** (`tasks.vibecoin.sh`): Web interface for viewing image/video tasks

The backend serves both API endpoints and web pages from the same application.

## Deployment Options

### Option 1: Railway (Recommended for MVP)

Railway provides easy deployment with built-in PostgreSQL.

#### Backend Deployment

1. **Create Railway Account**
   - Visit [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Initialize project
   cd packages/backend
   railway init
   ```

3. **Add PostgreSQL**
   - In Railway dashboard, click "New"
   - Select "Database" → "PostgreSQL"
   - Note the `DATABASE_URL`

4. **Configure Environment Variables**

   In Railway dashboard, set:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<from Railway>
   JWT_SECRET=<strong-random-secret>
   VIBECOIN_TO_USD=0.25
   MINIMUM_PAYOUT_USD=10
   CORS_ORIGIN=*
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Run Migrations**
   ```bash
   railway run npm run migrate
   railway run npm run seed
   ```

7. **Get URL**
   ```bash
   railway domain
   ```

8. **Configure Custom Domains**

   You can use the same backend deployment for both domains:

   - In Railway dashboard, add custom domains:
     - `api.vibecoin.sh` (for API)
     - `tasks.vibecoin.sh` (for task viewing)

   - Both domains point to the same backend service
   - The backend automatically serves web pages at `/t/{task_id}` routes

   DNS Configuration:
   ```
   api.vibecoin.sh    → CNAME → your-app.railway.app
   tasks.vibecoin.sh  → CNAME → your-app.railway.app
   ```

### Option 2: Render

#### Backend Deployment

1. **Create Render Account**
   - Visit [render.com](https://render.com)

2. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Note the internal/external URLs

3. **Create Web Service**
   - New → Web Service
   - Connect GitHub repository
   - Settings:
     - Build Command: `cd packages/backend && npm install`
     - Start Command: `cd packages/backend && npm start`
     - Environment: Node

4. **Environment Variables**

   Add in Render dashboard:
   ```
   NODE_ENV=production
   DATABASE_URL=<from Render>
   JWT_SECRET=<strong-random-secret>
   PORT=3000
   ```

5. **Deploy**
   - Render auto-deploys on git push

### Option 3: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch app
cd packages/backend
flyctl launch

# Set secrets
flyctl secrets set JWT_SECRET=<your-secret>
flyctl secrets set DATABASE_URL=<your-db-url>

# Deploy
flyctl deploy
```

## CLI Publication (npm)

### Preparing for Publication

1. **Update package.json**
   ```json
   {
     "name": "vibecoin",
     "version": "1.0.0",
     "description": "Earn money while you code",
     "main": "src/index.js",
     "bin": {
       "vibecoin": "./bin/vibecoin.js"
     }
   }
   ```

2. **Test locally**
   ```bash
   cd packages/cli
   npm link
   vibecoin --version
   ```

3. **Update API URL**

   Edit `packages/cli/src/utils/config.js`:
   ```javascript
   defaults: {
     apiUrl: 'https://api.vibecoin.sh',
     // ...
   }
   ```

   The CLI automatically converts `api.vibecoin.sh` to `tasks.vibecoin.sh` for task viewing.

4. **Environment Variables**

   CLI supports these environment variables for development:
   ```bash
   VIBECOIN_API_URL=https://api.vibecoin.sh
   VIBECOIN_WEB_URL=https://tasks.vibecoin.sh  # Optional override
   ```

### Publishing to npm

```bash
cd packages/cli

# Login to npm
npm login

# Publish
npm publish

# Or if scoped package
npm publish --access public
```

### Installation

Users can now install:
```bash
npm install -g vibecoin
```

## Database Setup

### Production Database

1. **Create Database**
   - Use managed PostgreSQL (Railway, Render, AWS RDS)

2. **Run Migrations**
   ```bash
   # Via Railway
   railway run npm run migrate

   # Via Render Shell
   npm run migrate

   # Direct connection
   psql $DATABASE_URL -f src/db/schema.sql
   ```

3. **Backup Strategy**
   - Enable automatic backups
   - Railway: Automatic daily backups
   - Render: Manual backups via dashboard

### Database Scaling

For production scale:
- Enable connection pooling
- Add read replicas
- Use PgBouncer for connection management

## Security Configuration

### Environment Variables

**Required Production Variables:**

```env
# Server
NODE_ENV=production
PORT=3000
API_URL=https://api.vibecoin.sh

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT - Use strong random string
JWT_SECRET=<64+ character random string>
JWT_EXPIRES_IN=30d

# CORS - Restrict to your domains
CORS_ORIGIN=https://vibecoin.sh,https://www.vibecoin.sh

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generating Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### SSL/TLS

- Railway/Render provide automatic HTTPS
- For custom domains, add SSL certificate

### CORS

In production, restrict CORS to your domains:

```javascript
app.use(cors({
  origin: ['https://vibecoin.sh', 'https://www.vibecoin.sh'],
  credentials: true
}));
```

## Monitoring & Logging

### Error Tracking

**Sentry Integration:**

```bash
npm install @sentry/node
```

```javascript
// src/server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Logging

**Winston for structured logging:**

```bash
npm install winston
```

### Uptime Monitoring

- Use UptimeRobot or Pingdom
- Monitor `/health` endpoint
- Alert on downtime

## Performance Optimization

### Database

1. **Indexes**
   - Already added in schema.sql
   - Monitor slow queries

2. **Connection Pooling**
   - Configured in db.js
   - Adjust pool size based on load

3. **Query Optimization**
   - Use `EXPLAIN ANALYZE` for slow queries
   - Add indexes as needed

### API

1. **Caching**
   - Add Redis for session storage
   - Cache frequently accessed data

2. **Rate Limiting**
   - Already configured
   - Adjust based on usage

### CDN

For image hosting:
- Use Cloudflare R2
- Or AWS S3 + CloudFront

## Backup & Recovery

### Database Backups

**Automated Backups:**
- Railway: Daily automatic backups
- Render: Manual backups
- AWS RDS: Automated backups

**Manual Backup:**
```bash
pg_dump $DATABASE_URL > backup.sql
```

**Restore:**
```bash
psql $DATABASE_URL < backup.sql
```

### Code Backups

- Git repository is the source of truth
- Tag releases: `git tag v1.0.0`

## Scaling Considerations

### Horizontal Scaling

- Railway/Render support multiple instances
- Add load balancer
- Use session store (Redis)

### Database Scaling

- Read replicas for heavy read operations
- Connection pooling with PgBouncer
- Consider managed database services

### Caching

Add Redis for:
- Session storage
- API response caching
- Rate limiting

## Post-Deployment

### Health Checks

```bash
# Check API health
curl https://api.vibecoin.sh/health

# Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### Monitoring Checklist

- [ ] API endpoints responding
- [ ] Database connected
- [ ] Error rates normal
- [ ] Response times acceptable
- [ ] No memory leaks

### Update Process

1. Test changes locally
2. Deploy to staging (if available)
3. Run migrations if needed
4. Deploy to production
5. Monitor for errors

## Rollback Plan

If deployment fails:

```bash
# Railway
railway rollback

# Git-based (Render, Fly.io)
git revert HEAD
git push
```

## Cost Estimation

### Railway (Recommended for MVP)

- Hobby Plan: $5/month
- PostgreSQL: Included
- Bandwidth: 100GB/month included

### Render

- Web Service: $7/month
- PostgreSQL: $7/month
- Total: ~$14/month

### Production Scale

- Expect ~$50-100/month for 1000+ active users
- Scale as needed based on usage

## Support & Maintenance

### Regular Tasks

- [ ] Weekly: Check error logs
- [ ] Weekly: Review performance metrics
- [ ] Monthly: Database backups verification
- [ ] Monthly: Security updates (npm audit)

### Emergency Contacts

- Keep list of service credentials
- Document rollback procedures
- Have backup admin access

## Troubleshooting

### Common Issues

**1. Database Connection Timeout**
- Check DATABASE_URL
- Verify database is running
- Check connection pool settings

**2. JWT Errors**
- Verify JWT_SECRET is set
- Check token expiration

**3. High Memory Usage**
- Check for memory leaks
- Review connection pool size
- Monitor database queries

## Next Steps

After successful deployment:

1. Set up monitoring and alerts
2. Configure automated backups
3. Add custom domain
4. Set up CI/CD pipeline
5. Launch! 🚀

## Resources

- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [PostgreSQL Production Checklist](https://www.postgresql.org/docs/current/production.html)
