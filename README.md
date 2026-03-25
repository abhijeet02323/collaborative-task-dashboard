# Full-Stack Application

A complete full-stack task management application with Node.js/Express backend, React frontend, PostgreSQL database, JWT authentication, and role-based access control.

## 📋 Project Overview

This project implements a production-ready full-stack application with:

- **Backend**: REST API with authentication, CRUD operations, and comprehensive documentation
- **Frontend**: React UI with protected routes and task management dashboard
- **Database**: PostgreSQL with proper schema and indexing
- **Security**: JWT-based authentication, password hashing, input validation
- **Documentation**: Swagger API docs and comprehensive READMEs

## 🎯 Key Features

### Backend
- ✅ User registration & login with JWT authentication
- ✅ Role-based access control (User vs Admin)
- ✅ Task CRUD operations with user isolation
- ✅ Input validation & sanitization
- ✅ Swagger/OpenAPI documentation
- ✅ Error handling middleware
- ✅ PostgreSQL database with migrations
- ✅ API versioning (v1)

### Frontend
- ✅ User authentication (Login/Register)
- ✅ Protected dashboard with JWT verification
- ✅ Task management (Create, Read, Update, Delete)
- ✅ Responsive design for mobile/tablet/desktop
- ✅ Error/success message notifications
- ✅ Context API for state management

## 📁 Project Structure

```
bakcend-projects/
├── backend/                    # Express.js backend
│   ├── src/
│   │   ├── config/            # Database & Swagger config
│   │   ├── controllers/       # Request handlers
│   │   ├── middlewares/       # Auth & error handling
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Utilities (JWT, password, etc)
│   │   ├── validators/        # Input validation rules
│   │   ├── migrations/        # Database schema
│   │   └── index.js           # Express app
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/                   # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # Shared components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   ├── context/          # Auth context
│   │   ├── styles/           # CSS modules
│   │   ├── App.js            # Main app component
│   │   └── index.js          # React entry
│   ├── package.json
│   └── README.md
│
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ and npm/yarn
- PostgreSQL v12+
- Git

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Update .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=fullstack_db
# DB_USER=postgres
# DB_PASSWORD=postgres

# Create PostgreSQL database
createdb fullstack_db

# Run migrations to create tables
npm run migrate

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will open at `http://localhost:3000`

## 📚 API Documentation

Once the backend is running, view the interactive Swagger documentation:

```
http://localhost:5000/api-docs
```

### API Endpoints Summary

**Authentication** (No token required)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile (Protected)
- `PUT /api/v1/auth/profile` - Update profile (Protected)

**Tasks** (Token required)
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks` - Get user's tasks
- `GET /api/v1/tasks/:id` - Get specific task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task
- `GET /api/v1/tasks/all` - Get all tasks (Admin only)

## 🔐 Authentication

### User Registration
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### User Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

Response includes JWT token:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### Protected Requests
Use the token in the Authorization header:
```bash
curl -X GET http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'pending',
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 Security Features

1. **Password Security**
   - Hashed with bcryptjs (10 salt rounds)
   - Minimum 8 characters required
   - Must contain uppercase, lowercase, and numbers

2. **JWT Authentication**
   - Secure token generation and verification
   - Configurable expiration (default: 7 days)
   - Stored securely in localStorage on frontend

3. **Input Validation**
   - Server-side validation with express-validator
   - Email format validation
   - SQL injection prevention via parameterized queries

4. **Authorization**
   - Role-based access control (RBAC)
   - User isolation for tasks (users can only see their own tasks)
   - Admin-only endpoints

5. **API Security**
   - CORS enabled for frontend integration
   - Environment variables for sensitive data
   - Proper error messages without data leakage

## 📊 Scalability Considerations

### For Production Deployment

1. **Caching Layer**
   - Implement Redis for frequently accessed data
   - Cache user profiles and task lists
   - Session-based caching for better performance

2. **Database Optimization**
   - Add more indexes on foreign keys
   - Implement pagination for large datasets
   - Use connection pooling (already configured)
   - Consider database replication

3. **Load Balancing**
   - Deploy multiple backend instances
   - Use nginx or HAProxy as load balancer
   - Implement sticky sessions for JWT

4. **Microservices Architecture**
   - Separate authentication service
   - Independent task service
   - Use API Gateway for routing
   - Message queues (RabbitMQ, Kafka) for async operations

5. **Monitoring & Logging**
   - Implement Winston for logging
   - Use Morgan for HTTP request logging
   - APM tools: New Relic, DataDog
   - Error tracking: Sentry

6. **Docker & Kubernetes**
   - Containerize both frontend and backend
   - Deploy with Kubernetes for auto-scaling
   - Use health checks for pod management

7. **API Rate Limiting**
   - Implement express-rate-limit
   - Prevent abuse and DoS attacks
   - User-based rate limiting

8. **Advanced Security**
   - HTTPS/TLS everywhere
   - API key authentication for service-to-service
   - Regular security audits
   - Dependency scanning (npm audit)

### Example: Redis Caching
```javascript
// Add to backend
const redis = require('redis');
const client = redis.createClient();

// Cache tasks
const getTasks = async (userId) => {
  const cacheKey = `tasks:${userId}`;
  const cached = await client.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const tasks = await Task.findByUserId(userId);
  await client.setex(cacheKey, 3600, JSON.stringify(tasks));
  return tasks;
};
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fullstack_db
DB_USER=postgres
DB_PASSWORD=postgres

API_VERSION=v1
API_BASE_URL=http://localhost:5000/api
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api/v1
```

## 🐛 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check credentials in `.env`
- Verify database exists: `psql -l`

### Backend Won't Start
- Check port 5000 is not in use
- Run migrations: `npm run migrate`
- Check database connection

### Frontend API Errors
- Ensure backend is running on port 5000
- Check CORS settings
- Verify token is valid in localStorage

### Token Issues
- Clear localStorage and re-login
- Check JWT_SECRET matches in backend
- Verify token expiration

## 📦 Postman Collection

A Postman collection is included for testing the API. Import `postman-collection.json` to test all endpoints.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 📞 Support

For issues, questions, or suggestions:
1. Check existing issues in the repository
2. Create a detailed issue with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details

## 🎓 Learning Resources

### Authentication & JWT
- [JWT.io](https://jwt.io/)
- [Express JWT Auth Guide](https://expressjs.com/en/advanced/best-practice-security.html)

### React & Frontend
- [React Documentation](https://react.dev/)
- [React Router Guide](https://reactrouter.com/)

### Backend & Express
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Security
- [OWASP Security Guidelines](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## 🚀 Next Steps

1. **Deploy Backend**
   - Heroku, Railway, or Render for free hosting
   - Set up environment variables
   - Configure database backups

2. **Deploy Frontend**
   - Vercel, Netlify for React hosting
   - Set API URL to production backend

3. **Add Features**
   - Task categories/tags
   - Task sharing and collaboration
   - File attachments
   - Email notifications
   - Advanced analytics

4. **Improve Performance**
   - Add caching layer (Redis)
   - Implement pagination
   - Optimize database queries
   - Add CDN for static files

---

**Created**: March 25, 2026
**Status**: Production-Ready
**Version**: 1.0.0
