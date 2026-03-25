# Full-Stack Application - Backend

A production-ready backend API built with Node.js, Express, and PostgreSQL. Features JWT authentication, role-based access control, and comprehensive CRUD operations for task management.

## Features

- ✅ **User Authentication**: JWT-based authentication with secure password hashing
- ✅ **Role-Based Access Control**: User and Admin roles with authorization middleware
- ✅ **CRUD Operations**: Complete CRUD for tasks with user isolation
- ✅ **Input Validation**: Comprehensive validation using express-validator
- ✅ **API Documentation**: Swagger/OpenAPI documentation
- ✅ **Error Handling**: Centralized error handling middleware
- ✅ **Database**: PostgreSQL with connection pooling
- ✅ **API Versioning**: Organized API versioning structure

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Development**: nodemon

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=7d
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=fullstack_db
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

4. **Create PostgreSQL database**
   ```bash
   createdb fullstack_db
   ```

5. **Run migrations**
   ```bash
   npm run migrate
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

Once the server is running, access the Swagger documentation at:
```
http://localhost:5000/api-docs
```

## API Endpoints

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile (Protected)
- `PUT /api/v1/auth/profile` - Update user profile (Protected)

### Task Endpoints
- `POST /api/v1/tasks` - Create a new task (Protected)
- `GET /api/v1/tasks` - Get user tasks (Protected)
- `GET /api/v1/tasks/:id` - Get a specific task (Protected)
- `PUT /api/v1/tasks/:id` - Update a task (Protected)
- `DELETE /api/v1/tasks/:id` - Delete a task (Protected)
- `GET /api/v1/tasks/all` - Get all tasks (Admin only)

## API Usage Examples

### 1. Register User
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

### 2. Login User
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
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

### 3. Create Task (Protected)
```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project",
    "description": "Finish implementing the backend API",
    "priority": "high",
    "dueDate": "2026-04-01T00:00:00Z"
  }'
```

### 4. Get User Tasks
```bash
curl -X GET "http://localhost:5000/api/v1/tasks?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Update Task
```bash
curl -X PUT http://localhost:5000/api/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "completed",
    "title": "Complete project - Updated"
  }'
```

### 6. Delete Task
```bash
curl -X DELETE http://localhost:5000/api/v1/tasks/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # PostgreSQL connection config
│   │   └── swagger.js       # Swagger/OpenAPI setup
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middlewares/
│   │   └── auth.js          # JWT and role-based auth
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── password.js
│   │   └── apiResponse.js
│   ├── validators/
│   │   └── index.js         # Input validation rules
│   ├── migrations/
│   │   └── runMigrations.js # Database schema
│   └── index.js             # Express app entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Register or login to get a token
2. Include the token in the `Authorization` header: `Bearer YOUR_TOKEN`
3. Tokens expire after 7 days (configurable via `JWT_EXPIRE`)

## Password Requirements

- Minimum 8 characters
- Must contain uppercase letters
- Must contain lowercase letters
- Must contain numbers

## Database Schema

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

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* ... */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors */ ]
}
```

## Security Considerations

- ✅ Passwords are hashed with bcryptjs (10 salt rounds)
- ✅ JWT tokens signed with secret key
- ✅ Input validation and sanitization
- ✅ CORS enabled for frontend integration
- ✅ Environment variables for sensitive data
- ✅ Role-based access control (RBAC)

## Scalability Notes

### For Production Deployment

1. **Caching Layer**
   - Implement Redis for caching frequently accessed data (user profiles, task lists)
   - Cache API responses with appropriate TTL

2. **Database Optimization**
   - Add database indexes on frequently queried columns
   - Implement pagination for list endpoints
   - Use connection pooling (already configured)

3. **Load Balancing**
   - Deploy multiple instances behind a load balancer (nginx, HAProxy)
   - Use stateless session management with JWT

4. **Microservices Architecture**
   - Separate authentication service from task management
   - Use message queues (RabbitMQ, Kafka) for async operations
   - API Gateway for routing requests

5. **Monitoring & Logging**
   - Implement comprehensive logging (Winston, Morgan)
   - Use APM tools (New Relic, DataDog)
   - Error tracking (Sentry)

6. **Docker & Container Orchestration**
   - Containerize with Docker
   - Deploy with Kubernetes for auto-scaling

7. **API Rate Limiting**
   - Implement rate limiting middleware
   - Prevent abuse and DoS attacks

8. **Security Hardening**
   - Use HTTPS/TLS
   - Implement API key authentication for service-to-service communication
   - Regular security audits and dependency updates

## Testing

Run tests with:
```bash
npm test
```

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please create an issue in the repository.
