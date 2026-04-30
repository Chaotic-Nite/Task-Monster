# Task Monster Backend API

A Node.js/Express backend API for the Task Monster application, providing user authentication and task management functionality.

## Features

- User registration and authentication with JWT
- Task group management
- Task creation, updating, and completion tracking
- MongoDB database integration
- RESTful API endpoints
- Input validation and error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or cloud service like MongoDB Atlas)

## Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd task-monster-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   - `PORT`: Server port (default: 5000)
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT tokens (use a strong random string in production)

4. Start MongoDB service (if running locally)

5. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Task Groups
- `GET /api/task-groups` - Get all task groups for user
- `GET /api/task-groups/:id` - Get specific task group
- `POST /api/task-groups` - Create new task group
- `PUT /api/task-groups/:id` - Update task group
- `DELETE /api/task-groups/:id` - Delete task group

### Tasks
- `GET /api/tasks` - Get all tasks for user (optional `?group_id=...` filter)
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Health Check
- `GET /api/health` - API health check

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Data Models

### User
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `name`: String (optional)
- `createdAt`: Date
- `lastLogin`: Date

### TaskGroup
- `name`: String (required)
- `description`: String (optional)
- `monster_name`: String
- `monster_image`: String (optional)
- `color`: String
- `participants`: Array of strings
- `created_by`: ObjectId (reference to User)
- `createdAt`: Date
- `updatedAt`: Date

### Task
- `title`: String (required)
- `description`: String (optional)
- `points`: Number (default: 10)
- `completed`: Boolean (default: false)
- `completed_at`: Date (optional)
- `assigned_to`: String (optional)
- `group_id`: ObjectId (reference to TaskGroup)
- `created_by`: ObjectId (reference to User)
- `createdAt`: Date
- `updatedAt`: Date

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Project Structure
```
task-monster-backend/
├── models/           # Mongoose models
├── routes/           # API route handlers
├── middleware/       # Custom middleware
├── server.js         # Main server file
├── package.json
├── .env.example      # Environment variables template
└── README.md
```

## Deployment

1. Set up a MongoDB database (local or cloud)
2. Configure environment variables in production
3. Build and deploy the application
4. Ensure the frontend is configured to use the correct API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License