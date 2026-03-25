# Complete Setup Guide

This guide walks you through setting up the entire Full-Stack Application from scratch.

## Prerequisites

### Required Software
- **Node.js** v14 or higher - [Download](https://nodejs.org/)
- **npm** v6 or higher (comes with Node.js)
- **PostgreSQL** v12 or higher - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

### Optional (for containerized deployment)
- **Docker** - [Download](https://www.docker.com/products/docker-desktop/)
- **Docker Compose** - Included with Docker Desktop

## Step 1: Clone the Repository

```bash
cd /home/abhi/Documents/bakcend-projects
git init
git add .
git commit -m "Initial commit: Full-stack application"
```

## Step 2: Set Up PostgreSQL Database

### Option A: Using PostgreSQL Command Line

```bash
# Open PostgreSQL CLI
psql -U postgres

# Create database
CREATE DATABASE fullstack_db;

# Create user (optional, already using postgres)
CREATE USER fullstack WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fullstack_db TO fullstack;

# Exit
\q
```

### Option B: Using PostgreSQL GUI (pgAdmin)

1. Open pgAdmin
2. Right-click Databases → Create → Database
3. Enter name: `fullstack_db`
4. Click Save

## Step 3: Backend Setup

### 3.1 Install Dependencies

```bash
cd backend
npm install
```

Expected output:
```
up to date, audited XX packages in XXs
```

### 3.2 Configure Environment Variables

```bash
cp .env.example .env
```

Edit `backend/.env`:
```
NODE_ENV=development
PORT=5000
JWT_SECRET=change_this_to_a_random_string_in_production
JWT_EXPIRE=7d

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fullstack_db
DB_USER=postgres
DB_PASSWORD=postgres

API_VERSION=v1
API_BASE_URL=http://localhost:5000/api
```

### 3.3 Run Database Migrations

```bash
npm run migrate
```

Expected output:
```
✓ Users table created
✓ Tasks table created
✓ Index created on tasks(user_id)
✓ All migrations completed successfully
```

### 3.4 Start Backend Server

```bash
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5000
📚 API Documentation: http://localhost:5000/api-docs
🔗 API Base URL: http://localhost:5000/api/v1
```

✅ Backend is now running! Leave this terminal open.

## Step 4: Frontend Setup

### 4.1 Open New Terminal

Navigate to frontend directory in a new terminal:

```bash
cd frontend
npm install
```

### 4.2 Start Frontend Server

```bash
npm run dev
```

Expected output:
```
Compiled successfully!
You can now view frontend in the browser.
Local: http://localhost:3000
```

✅ Frontend is now running! Open http://localhost:3000 in your browser.

## Step 5: Test the Application

### 5.1 Create Test Account

1. Go to http://localhost:3000
2. Click "Register here"
3. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: SecurePass123
4. Click Register
5. You'll be redirected to login

### 5.2 Login

1. Email: john@example.com
2. Password: SecurePass123
3. Click Login

### 5.3 Create Task

1. Click "New Task"
2. Fill in the form:
   - Title: "My First Task"
   - Description: "This is a test task description"
   - Priority: High
   - Due Date: (select a date)
3. Click "Create Task"

### 5.4 Test Other Features

- ✅ Update task by clicking "Edit"
- ✅ Mark task complete by checking the checkbox
- ✅ Delete task by clicking "Delete"

## Step 6: API Testing with Postman

### 6.1 Import Postman Collection

1. Download [Postman](https://www.postman.com/downloads/)
2. Open Postman
3. Click Import → Choose `postman-collection.json` from root directory
4. The collection is imported with all endpoints

### 6.2 Test Authentication

1. Select "Register User" request
2. Click Send
3. You should get a 201 response with user data

### 6.3 Test Login

1. Select "Login User" request
2. Click Send
3. Copy the token from the response
4. Set variable: `jwt_token` = your token

### 6.4 Test Protected Endpoints

1. Select "Get All User Tasks"
2. Click Send (now includes JWT token)
3. You should get 200 response with task data

## Step 7: View API Documentation

1. Go to http://localhost:5000/api-docs
2. Interactive Swagger documentation with all endpoints
3. Try out API endpoints directly from the documentation

## Step 8: Docker Deployment (Optional)

### 8.1 Run with Docker Compose

```bash
cd /home/abhi/Documents/bakcend-projects

# Update backend/.env if needed
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# Check services
docker-compose ps
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: localhost:5432

### 8.2 Stop Docker Services

```bash
docker-compose down
```

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

```bash
# Find process using port
lsof -i :5000
# or
netstat -tuln | grep 5000

# Kill process
kill -9 <PID>
```

Or change port in code:
- Backend: Change `PORT` in `.env`
- Frontend: Set port in `npm run dev`

### Database Connection Error

```bash
# Test PostgreSQL connection
psql -U postgres -d fullstack_db -c "SELECT 1"

# Check if service is running
# Windows: services.msc
# macOS: System Preferences → Not needed, use Homebrew
# Linux: sudo systemctl status postgresql
```

### Module Not Found Error

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Error

Ensure backend is running on port 5000 with correct configuration.

### JWT Token Error

- Clear browser localStorage: Dev Tools → Application → Storage → Clear All
- Login again to get fresh token

## Project File Structure

```
bakcend-projects/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and Swagger config
│   │   ├── controllers/    # Request handlers (Auth, Task)
│   │   ├── middlewares/    # Authentication and error handling
│   │   ├── models/         # Database models (User, Task)
│   │   ├── routes/         # API route definitions
│   │   ├── utils/          # Helper functions (JWT, password, etc)
│   │   ├── validators/     # Input validation rules
│   │   ├── migrations/     # Database schema
│   │   └── index.js        # Express app entry point
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Shared components
│   │   ├── pages/          # Page components (Auth, Dashboard)
│   │   ├── services/       # API client and service methods
│   │   ├── context/        # Auth context provider
│   │   ├── styles/         # CSS modules
│   │   ├── App.js          # Main app with routing
│   │   └── index.js        # React entry point
│   ├── package.json
│   ├── .gitignore
│   ├── Dockerfile
│   └── README.md
│
├── README.md               # Main project documentation
├── DEPLOYMENT.md           # Deployment guide
├── SETUP.md               # This file
├── docker-compose.yml     # Docker Compose configuration
├── kubernetes.yaml        # Kubernetes deployment
├── postman-collection.json # Postman API collection
└── .github/workflows/
    └── deploy.yml         # GitHub Actions CI/CD
```

## Key Commands Reference

### Backend
```bash
npm install        # Install dependencies
npm run dev       # Start development server
npm run migrate   # Run database migrations
npm start         # Start production server
npm test          # Run tests
```

### Frontend
```bash
npm install        # Install dependencies
npm run dev       # Start development server
npm run build     # Create production build
npm test          # Run tests
```

### Docker
```bash
docker-compose up -d       # Start all services
docker-compose down        # Stop all services
docker-compose logs -f     # View logs
docker-compose ps         # Check service status
```

## Next Steps

1. **Customize**: Modify colors, branding, task fields as needed
2. **Add Features**: Task categories, tags, comments
3. **Deploy**: Follow DEPLOYMENT.md for production setup
4. **Monitor**: Set up logging, error tracking, monitoring
5. **Scale**: Implement caching, load balancing

## Getting Help

### Backend Issues
- Check `backend/README.md`
- Review error messages in terminal
- Check database connection in `.env`

### Frontend Issues
- Check `frontend/README.md`
- Open browser DevTools (F12) → Console for errors
- Check Network tab for API calls

### General Issues
- Check `README.md` in root directory
- Review `DEPLOYMENT.md` for deployment issues
- Check individual service READMEs

## Security Notes

⚠️ **Important for Production:**

1. Change all default secrets:
   - `JWT_SECRET` - use a strong random string
   - Database password
   - API keys

2. Enable HTTPS:
   - Install SSL certificates
   - Update API URLs to use https://

3. Environment variables:
   - Never commit `.env` files to git
   - Use `.env.example` for documentation
   - Use secret management tools in production

4. Database:
   - Regular backups
   - Change default credentials
   - Restrict network access

## Support & Resources

- **Express.js**: https://expressjs.com/
- **React**: https://react.dev/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Node.js**: https://nodejs.org/docs/
- **JWT**: https://jwt.io/

---

Congratulations! Your full-stack application is now set up and running! 🎉
