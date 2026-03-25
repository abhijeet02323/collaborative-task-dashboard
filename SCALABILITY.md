# Scalability & Architecture Guide

This document outlines strategies for scaling the Full-Stack Application for production use.

## Table of Contents
1. [Current Architecture](#current-architecture)
2. [Scalability Challenges](#scalability-challenges)
3. [Horizontal Scaling](#horizontal-scaling)
4. [Vertical Scaling](#vertical-scaling)
5. [Microservices Architecture](#microservices-architecture)
6. [Caching Strategy](#caching-strategy)
7. [Database Optimization](#database-optimization)
8. [Load Balancing](#load-balancing)
9. [Performance Monitoring](#performance-monitoring)
10. [Security at Scale](#security-at-scale)

## Current Architecture

### Monolithic Structure
```
┌─────────────────────────────────────────┐
│           React Frontend                │
│     (Single Page Application)          │
└────────────────┬────────────────────────┘
                 │ HTTP/REST
┌────────────────▼────────────────────────┐
│      Express.js Backend API             │
│  ┌───────────────────────────────────┐  │
│  │   Authentication Routes           │  │
│  │   Task Management Routes          │  │
│  │   Middleware (Auth, Validation)   │  │
│  └───────────────────────────────────┘  │
└────────────────┬────────────────────────┘
                 │ TCP
┌────────────────▼────────────────────────┐
│       PostgreSQL Database               │
│  ┌───────────────────────────────────┐  │
│  │ Users Table                       │  │
│  │ Tasks Table                       │  │
│  │ Indexes                           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Current Limitations
- Single backend instance (bottleneck)
- Single database connection pool
- No caching layer
- Synchronous processing
- No request queuing

## Scalability Challenges

### 1. Database Bottlenecks
- Connection pool exhaustion
- Slow queries on large datasets
- Lock contention
- Memory usage

### 2. Backend Performance
- CPU-bound operations
- Memory leaks
- Inefficient algorithms
- Blocking operations

### 3. Frontend Performance
- Large bundle size
- Inefficient re-renders
- Slow API response times
- Network latency

### 4. Infrastructure Limits
- Single server capacity
- Storage limits
- Bandwidth limits
- Network I/O

## Horizontal Scaling

### Load Balancer Setup

```
┌──────────────────────────────────────────┐
│      Nginx/HAProxy Load Balancer        │
│    (Distributes requests across nodes)   │
└──────────────┬────────────────────┬──────┘
               │                    │
       ┌───────▼─────┐      ┌──────▼─────┐
       │  Backend 1  │      │  Backend 2  │
       │  :5000      │      │  :5001      │
       └────┬────────┘      └──────┬──────┘
            │                      │
       ┌────▼──────────────────────▼────┐
       │    PostgreSQL (Shared DB)      │
       └────────────────────────────────┘
```

### Nginx Configuration

```nginx
upstream backend {
    server backend1:5000 weight=5;
    server backend2:5000 weight=5;
    server backend3:5000 weight=5;
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Load balancing method
        # least_conn, ip_hash, etc.
    }
}
```

### Implementation

```bash
# Docker Compose with load balancer
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

  backend1:
    build: ./backend
    environment:
      - INSTANCE_ID=1

  backend2:
    build: ./backend
    environment:
      - INSTANCE_ID=2

  backend3:
    build: ./backend
    environment:
      - INSTANCE_ID=3
```

## Vertical Scaling

### Increase Server Resources

```javascript
// Backend - Resource-aware configuration
const os = require('os');
const cpuCount = os.cpus().length;

// Adjust thread pool
process.env.UV_THREADPOOL_SIZE = cpuCount * 2;

// Memory-efficient configurations
const pool = new Pool({
  max: cpuCount * 2, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Database Resource Allocation

```sql
-- PostgreSQL configuration
-- postgresql.conf

shared_buffers = 256MB        -- 25% of system RAM
effective_cache_size = 1GB    -- 50-75% of system RAM
work_mem = 4MB                -- RAM / (max_connections * 2)
maintenance_work_mem = 64MB   -- 5-10% of system RAM
```

## Microservices Architecture

### Decomposed Services

```
┌────────────────────────────────────────────────────┐
│           API Gateway (Load Balancer)              │
└──────┬─────────────┬─────────────┬─────────────────┘
       │             │             │
   ┌───▼──────┐  ┌──▼──────┐  ┌───▼──────┐
   │ Auth     │  │ Task     │  │ User     │
   │ Service  │  │ Service  │  │ Service  │
   │ :5001    │  │ :5002    │  │ :5003    │
   └───┬──────┘  └──┬──────┘  └───┬──────┘
       │            │            │
   ┌───▼──────┐  ┌──▼──────┐  ┌───▼──────┐
   │ Auth DB  │  │ Task DB  │  │ User DB  │
   │ Postgres │  │ Postgres │  │ Postgres │
   └──────────┘  └──────────┘  └──────────┘

       ┌──────────────────────────┐
       │  Message Queue (RabbitMQ)│
       │  (Async Communication)   │
       └──────────────────────────┘
```

### Auth Service Example

```javascript
// services/auth-service/src/index.js
const express = require('express');
const pool = require('./database');
const amqp = require('amqplib');

const app = express();

// Initialize message queue connection
async function initMessageQueue() {
  const connection = await amqp.connect('amqp://rabbitmq:5672');
  const channel = await connection.createChannel();
  return channel;
}

app.post('/register', async (req, res) => {
  // Register user
  const user = await createUser(req.body);
  
  // Emit event to message queue
  const channel = await initMessageQueue();
  channel.assertExchange('user.events', 'topic', { durable: true });
  channel.publish('user.events', 'user.registered', Buffer.from(JSON.stringify(user)));
  
  res.json(user);
});

app.listen(5001);
```

### Task Service (Listening to Events)

```javascript
// services/task-service/src/index.js
const amqp = require('amqplib');

async function consumeUserEvents() {
  const connection = await amqp.connect('amqp://rabbitmq:5672');
  const channel = await connection.createChannel();
  
  channel.assertExchange('user.events', 'topic', { durable: true });
  const queue = await channel.assertQueue('task-service-queue');
  
  channel.bindQueue(queue.queue, 'user.events', 'user.#');
  
  channel.consume(queue.queue, (msg) => {
    const event = JSON.parse(msg.content);
    
    if (event.type === 'user.registered') {
      // Initialize task tracking for new user
      initializeUserTasks(event.userId);
    }
  });
}

consumeUserEvents();
```

## Caching Strategy

### Redis Caching Layer

```
┌─────────────────┐
│  Request        │
└────────┬────────┘
         │
    ┌────▼─────────────┐
    │  Check Redis Cache
    └────┬─────────────┘
         │
         ├─── Cache Hit ──────┐
         │                    │
         └─── Cache Miss      │
             │                │
    ┌────────▼────────┐       │
    │ Query Database  │       │
    └────────┬────────┘       │
             │                │
    ┌────────▼────────┐       │
    │ Save to Redis   │       │
    └────────┬────────┘       │
             │                │
             └────────┬───────┘
                      │
                ┌─────▼─────┐
                │  Response  │
                └────────────┘
```

### Implementation

```javascript
// backend/src/utils/cache.js
const redis = require('redis');
const client = redis.createClient({ host: 'redis', port: 6379 });

const cache = {
  get: async (key) => {
    return await client.get(key);
  },
  
  set: async (key, value, ttl = 3600) => {
    return await client.setex(key, ttl, JSON.stringify(value));
  },
  
  invalidate: async (pattern) => {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  }
};

module.exports = cache;
```

### Caching Tasks Example

```javascript
// backend/src/models/Task.js
const cache = require('../utils/cache');

class Task {
  static async findByUserId(userId, limit, offset) {
    const cacheKey = `tasks:${userId}:${limit}:${offset}`;
    
    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Query database
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    
    // Cache result (1 hour TTL)
    await cache.set(cacheKey, result.rows, 3600);
    
    return result.rows;
  }
  
  static async createTask(...args) {
    const task = await this._create(...args);
    
    // Invalidate user's task cache
    await cache.invalidate(`tasks:${task.user_id}:*`);
    
    return task;
  }
}
```

## Database Optimization

### Indexing Strategy

```sql
-- Index frequently searched columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Composite index for common queries
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);

-- ANALYZE to update statistics
ANALYZE users;
ANALYZE tasks;
```

### Query Optimization

```javascript
// Instead of N+1 queries
// ❌ Bad - Multiple queries
const users = await User.findAll();
users.forEach(async (user) => {
  const tasks = await Task.findByUserId(user.id);
});

// ✅ Good - Single query with JOIN
const result = await pool.query(`
  SELECT 
    u.id, u.email, COUNT(t.id) as task_count
  FROM users u
  LEFT JOIN tasks t ON u.id = t.user_id
  GROUP BY u.id
`);
```

### Connection Pooling

```javascript
// Already configured, but optimize for scale
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Tuning for scale
  max: 20,                    // Increase for more connections
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000,
  query_timeout: 30000,       // Query timeout
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});
```

### Read Replicas

```javascript
// Use replicas for read-only queries
const mainPool = new Pool({ /* primary db */ });
const replicaPool = new Pool({ /* replica db */ });

async function getTask(id) {
  // Read from replica
  return await replicaPool.query('SELECT * FROM tasks WHERE id = $1', [id]);
}

async function updateTask(id, data) {
  // Write to primary
  return await mainPool.query('UPDATE tasks SET ... WHERE id = $1', [id, data]);
}
```

## Load Balancing

### Kubernetes Load Balancing

Already configured in `kubernetes.yaml`:
- Service discovery
- Health checks
- Auto-scaling (HPA)
- Rolling updates

### CDN for Frontend

```javascript
// CloudFront/Cloudflare configuration
// Cache static assets
// Compress responses
// DDoS protection

// In frontend code
const API_URL = process.env.REACT_APP_API_URL;
const STATIC_CDN = 'https://cdn.example.com';

// Reference assets through CDN
<img src={`${STATIC_CDN}/images/logo.png`} />
```

## Performance Monitoring

### Application Performance Monitoring (APM)

```bash
# Install APM tools
npm install newrelic
npm install datadog-browser-rum
npm install sentry
```

### Logging

```javascript
// backend/src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.info('User registered', { userId: 123, email: 'user@example.com' });
logger.error('Database error', { error: err });
```

### Metrics Collection

```javascript
// backend/src/utils/metrics.js
const prometheus = require('prom-client');

const requestCounter = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const requestDuration = new prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration',
  labelNames: ['method', 'route']
});

// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    requestCounter.inc({
      method: req.method,
      route: req.route?.path || 'unknown',
      status: res.statusCode
    });
    requestDuration.observe({
      method: req.method,
      route: req.route?.path || 'unknown'
    }, duration);
  });
  next();
});

// Expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
```

## Security at Scale

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:' // rate limit prefix
  })
});

app.use('/api/', limiter);
```

### Request Validation at Scale

```javascript
// Validate early, fail fast
const validateRequest = (req, res, next) => {
  // Check size
  if (req.get('content-length') > 1000000) {
    return res.status(413).json({ error: 'Payload too large' });
  }
  
  // Check rate
  const clientId = req.ip;
  if (isRateLimited(clientId)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  next();
};
```

### Secrets Management

```bash
# Use environment variables with secrets manager
# AWS Secrets Manager
# HashiCorp Vault
# Kubernetes Secrets

# Example with AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id prod/database/password
```

## Scaling Roadmap

### Phase 1: Foundation (Current)
- ✅ Single backend instance
- ✅ Monolithic architecture
- ✅ PostgreSQL database
- ⏳ Basic monitoring

### Phase 2: High Availability (1-10k users)
- Implement load balancer
- Add Redis caching
- Database backups
- APM/monitoring
- Estimated timeline: 1-2 months

### Phase 3: Microservices (10k-100k users)
- Split services (Auth, Task, User)
- Message queue (RabbitMQ/Kafka)
- Database per service (if needed)
- Advanced monitoring
- Estimated timeline: 2-3 months

### Phase 4: Enterprise Scale (100k+ users)
- Service mesh (Istio/Linkerd)
- Event sourcing
- CQRS pattern
- Advanced caching strategies
- Multi-region deployment
- Estimated timeline: Ongoing

## Cost Optimization

### Cloud Provider Comparison

| Provider | Instance | Cost/Month | Notes |
|----------|----------|-----------|-------|
| Heroku | 2x Dyno | $100 | Easy, managed |
| AWS | t3.medium | $35 | Flexible, learning curve |
| GCP | n1-standard-1 | $40 | Good performance |
| DigitalOcean | App Droplet | $12 | Budget-friendly |

### Optimization Tips

1. Use spot instances for non-critical workloads
2. Right-size instances based on metrics
3. Enable auto-scaling to avoid over-provisioning
4. Use CDN to reduce bandwidth costs
5. Implement caching to reduce database queries
6. Use serverless for sporadic tasks

## Conclusion

This scalability guide provides a roadmap from monolithic to enterprise-scale architecture. Choose scaling strategies based on:

- **Current user load**
- **Growth projections**
- **Budget constraints**
- **Team expertise**
- **Operational complexity**

Start with Phase 1 fundamentals, then scale as needed. Regular monitoring and profiling will guide your scaling decisions.

---

For more information, see:
- DEPLOYMENT.md - Deployment strategies
- README.md - Project overview
- backend/README.md - Backend documentation
- frontend/README.md - Frontend documentation
