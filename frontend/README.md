# Full-Stack Application - Frontend

A modern React-based frontend for the Full-Stack Application. Features user authentication, task management dashboard, and responsive design.

## Features

- ✅ **User Authentication**: Login and registration with JWT tokens
- ✅ **Protected Routes**: Private dashboard accessible only to authenticated users
- ✅ **Task Management**: Create, read, update, and delete tasks
- ✅ **Task Filtering**: View tasks by priority and status
- ✅ **Responsive Design**: Mobile-friendly UI
- ✅ **Error Handling**: User-friendly error and success messages
- ✅ **State Management**: Context API for authentication state

## Tech Stack

- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS Modules
- **State Management**: Context API

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables** (Optional)
   
   Create a `.env` file in the frontend root:
   ```
   REACT_APP_API_URL=http://localhost:5000/api/v1
   ```

## Running the Frontend

### Development Mode
```bash
npm run dev
```

The frontend will open at `http://localhost:3000`

### Production Build
```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── shared.js          # Shared components (Alert, Spinner, etc)
│   ├── pages/
│   │   ├── Auth.js            # Login & Register pages
│   │   └── Dashboard.js       # Task management dashboard
│   ├── services/
│   │   └── api.js             # Axios API client & service methods
│   ├── context/
│   │   └── AuthContext.js     # Authentication context & provider
│   ├── styles/
│   │   ├── global.css         # Global styles
│   │   ├── components.module.css
│   │   ├── auth.module.css
│   │   └── dashboard.module.css
│   ├── App.js                 # Main app component with routing
│   └── index.js               # React DOM render
├── package.json
└── README.md
```

## Features Explained

### Authentication
- **Register**: Create a new account with email and password
- **Login**: Authenticate with credentials to get JWT token
- **Token Storage**: JWT stored in localStorage for persistence
- **Auto-redirect**: Logged-in users redirected from login page

### Task Management
- **Create Tasks**: Add new tasks with title, description, priority, and due date
- **View Tasks**: See all user tasks in a beautiful card layout
- **Edit Tasks**: Update task details inline
- **Delete Tasks**: Remove completed or unwanted tasks
- **Status Tracking**: Mark tasks as pending or completed
- **Priority Levels**: Organize tasks by priority (Low, Medium, High)

### User Experience
- **Error Messages**: Clear error notifications for failed operations
- **Success Messages**: Confirmation messages for completed actions
- **Loading States**: Visual feedback during API calls
- **Empty States**: Helpful messages when no data is available
- **Responsive Design**: Works on desktop, tablet, and mobile

## API Integration

### Authentication Endpoints
```javascript
// Register
POST /api/v1/auth/register
{
  firstName: string,
  lastName: string,
  email: string,
  password: string
}

// Login
POST /api/v1/auth/login
{
  email: string,
  password: string
}
```

### Task Endpoints
```javascript
// Create task
POST /api/v1/tasks
{
  title: string,
  description: string,
  priority: "low" | "medium" | "high",
  dueDate?: string (ISO 8601)
}

// Get user tasks
GET /api/v1/tasks?limit=20&offset=0

// Get specific task
GET /api/v1/tasks/:id

// Update task
PUT /api/v1/tasks/:id
{
  title?: string,
  description?: string,
  priority?: string,
  status?: "pending" | "completed",
  dueDate?: string
}

// Delete task
DELETE /api/v1/tasks/:id
```

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token added to all API requests via Axios interceptor
5. Protected routes check token existence
6. Invalid/expired token redirects to login

## Styling

The application uses CSS Modules for component-scoped styling. Global styles are in `styles/global.css`.

### Color Scheme
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Success: `#28a745` (Green)
- Error: `#dc3545` (Red)
- Warning: `#ffc107` (Yellow)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting via React Router
- CSS Modules for scoped styling
- Lazy loading of components (optional)
- Efficient state management with Context API

## Troubleshooting

### Backend Connection Issues
- Ensure backend is running on `http://localhost:5000`
- Check CORS settings in backend
- Verify `REACT_APP_API_URL` environment variable

### Token Issues
- Clear localStorage and log in again
- Check browser console for token errors
- Verify JWT format in network tab

### Styling Issues
- Clear browser cache
- Ensure CSS Modules are imported correctly
- Check for conflicting global styles

## Future Enhancements

- Add task filtering and sorting
- Implement pagination for task lists
- Add task categories/tags
- Profile management page
- Task comments/notes
- Task sharing functionality
- Dark mode support
- Task analytics dashboard

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please create an issue in the repository.
