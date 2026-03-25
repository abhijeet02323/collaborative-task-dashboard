# Deployment Guide

This document provides comprehensive instructions for deploying the Full-Stack Application to various platforms.

## Table of Contents
1. [Docker Local Deployment](#docker-local-deployment)
2. [Docker Compose](#docker-compose)
3. [Heroku Deployment](#heroku-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [AWS Deployment](#aws-deployment)
6. [Production Checklist](#production-checklist)

## Docker Local Deployment

### Backend Docker Build

```bash
cd backend

# Build image
docker build -t fullstack-backend:latest .

# Run container
docker run -d \
  --name fullstack-backend \
  -p 5000:5000 \
  -e NODE_ENV=development \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_NAME=fullstack_db \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e JWT_SECRET=your_secret_key \
  fullstack-backend:latest
```

### Frontend Docker Build

```bash
cd frontend

# Build image
docker build -t fullstack-frontend:latest .

# Run container
docker run -d \
  --name fullstack-frontend \
  -p 3000:3000 \
  -e REACT_APP_API_URL=http://localhost:5000/api/v1 \
  fullstack-frontend:latest
```

## Docker Compose

The easiest way to run the entire application locally:

```bash
# Create .env file from example
cp backend/.env.example backend/.env

# Update environment variables in backend/.env

# Start all services
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Remove volumes (careful!)
docker-compose down -v
```

Services running:
- PostgreSQL: `localhost:5432`
- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## Heroku Deployment

### Prerequisites
- Heroku CLI installed
- Heroku account

### Backend Deployment

```bash
cd backend

# Login to Heroku
heroku login

# Create Heroku app
heroku create fullstack-backend-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev --app fullstack-backend-app

# Set environment variables
heroku config:set NODE_ENV=production --app fullstack-backend-app
heroku config:set JWT_SECRET=your_production_secret_key --app fullstack-backend-app

# Deploy
git push heroku main

# Run migrations
heroku run "npm run migrate" --app fullstack-backend-app

# View logs
heroku logs --tail --app fullstack-backend-app
```

### Frontend Deployment (Vercel/Netlify)

#### With Vercel
```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# REACT_APP_API_URL=https://your-backend-heroku-app.herokuapp.com/api/v1
```

#### With Netlify
```bash
cd frontend

# Build
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

## Kubernetes Deployment

### Prerequisites
- kubectl installed
- Kubernetes cluster (Minikube, EKS, GKE, etc.)

### Setup

```bash
# Create secrets
kubectl create secret generic postgres-secret \
  --from-literal=password=your-postgres-password \
  -n fullstack-app

kubectl create secret generic jwt-secret \
  --from-literal=secret=your-jwt-secret \
  -n fullstack-app

# Deploy
kubectl apply -f kubernetes.yaml

# Check deployments
kubectl get deployments -n fullstack-app

# Check services
kubectl get services -n fullstack-app

# Port forward (for local access)
kubectl port-forward svc/backend 5000:5000 -n fullstack-app
kubectl port-forward svc/frontend 3000:3000 -n fullstack-app

# View logs
kubectl logs -f deployment/backend -n fullstack-app
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment backend --replicas=3 -n fullstack-app

# Check HPA status
kubectl get hpa -n fullstack-app
```

## AWS Deployment

### Using ECS (Elastic Container Service)

1. **Build and push Docker images to ECR**

```bash
# Create ECR repositories
aws ecr create-repository --repository-name fullstack-backend --region us-east-1
aws ecr create-repository --repository-name fullstack-frontend --region us-east-1

# Push images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag fullstack-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/fullstack-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/fullstack-backend:latest

docker tag fullstack-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/fullstack-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/fullstack-frontend:latest
```

2. **Create RDS PostgreSQL Database**

```bash
aws rds create-db-instance \
  --db-instance-identifier fullstack-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <your-password> \
  --allocated-storage 20
```

3. **Create ECS Cluster and Services**

```bash
# Create cluster
aws ecs create-cluster --cluster-name fullstack-cluster

# Create task definitions and services (via AWS Console or CloudFormation)
```

### Using Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p "Node.js 18 running on 64bit Amazon Linux 2" fullstack-app

# Create environment
eb create fullstack-app-env

# Deploy
eb deploy

# View logs
eb logs
```

## Production Checklist

- [ ] Environment variables properly set
- [ ] JWT_SECRET is strong and unique
- [ ] Database backups configured
- [ ] SSL/TLS certificates installed
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring and alerting set up
- [ ] Error tracking (Sentry) configured
- [ ] Database migrations run successfully
- [ ] API documentation accessible
- [ ] Health checks working
- [ ] Secrets managed securely
- [ ] Database indexed properly
- [ ] Caching layer (Redis) optional but recommended

## Environment Variables for Production

### Backend
```
NODE_ENV=production
PORT=5000
JWT_SECRET=<strong-random-string>
JWT_EXPIRE=7d

DB_HOST=<production-db-host>
DB_PORT=5432
DB_NAME=fullstack_db
DB_USER=<secure-username>
DB_PASSWORD=<secure-password>

API_VERSION=v1
API_BASE_URL=https://api.yourdomain.com
```

### Frontend
```
REACT_APP_API_URL=https://api.yourdomain.com/api/v1
```

## Monitoring & Logging

### Add Monitoring Tools

```bash
# Install monitoring packages
npm install winston morgan sentry

# Configure in backend/src/index.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });

const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Database Backups

### PostgreSQL Backup

```bash
# Create backup
pg_dump -U postgres fullstack_db > backup.sql

# Restore backup
psql -U postgres fullstack_db < backup.sql

# Automated backup (using cron)
0 2 * * * pg_dump -U postgres fullstack_db > /backups/fullstack_db_$(date +\%Y\%m\%d).sql
```

## Performance Optimization

### Redis Caching

```bash
# Run Redis container
docker run -d -p 6379:6379 redis:alpine

# Connect in backend
const redis = require('redis');
const client = redis.createClient({ host: 'redis', port: 6379 });
```

### CDN Configuration

Configure CloudFront or similar for frontend assets.

## Rollback Procedure

### Docker Compose
```bash
docker-compose down
# Update code
docker-compose up -d --build
```

### Kubernetes
```bash
kubectl rollout undo deployment/backend -n fullstack-app
kubectl rollout undo deployment/frontend -n fullstack-app
```

### Heroku
```bash
heroku releases --app fullstack-backend-app
heroku rollback v<number> --app fullstack-backend-app
```

## Troubleshooting

### Database Connection Issues
- Verify credentials
- Check network security groups
- Ensure database is running
- Check connection pool limits

### High CPU Usage
- Check slow queries
- Verify indexes
- Implement caching
- Scale horizontally

### Memory Leaks
- Check for unresolved promises
- Review middleware
- Monitor process memory
- Use profiling tools

For more help, check the main README.md and individual service READMEs.
