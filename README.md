# Task Monster

A full-stack task management application where users can create task groups, add tasks, and track progress in a gamified monster-battling experience.

## Features

- **User Authentication**: Register and login with secure JWT authentication
- **Task Groups**: Create and manage groups of related tasks
- **Task Management**: Add, complete, assign, and delete tasks
- **Gamification**: Tasks contribute to "monster battles" with visual progress tracking
- **Real-time Updates**: Live updates using React Query
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
Task-Monster/
├── task-monster/           # React Frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── Components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (UserContext)
│   │   ├── Pages/         # Main application pages
│   │   └── utils/         # Utility functions
│   ├── .env               # Frontend environment variables
│   └── package.json
└── task-monster-backend/   # Node.js Backend
    ├── models/            # MongoDB models
    ├── routes/            # API routes
    ├── middleware/        # Authentication middleware
    ├── server.js          # Main server file
    ├── .env               # Backend environment variables
    └── package.json
```

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**

## Quick Start

### 1. Clone and Setup

```bash
# Install frontend dependencies
cd task-monster
npm install

# Install backend dependencies
cd ../task-monster-backend
npm install
```

### 2. Environment Setup

#### Backend (.env)

```bash
cp .env.example .env
# Edit .env with your MongoDB connection and JWT secret
```

#### Frontend (.env)

```bash
# In task-monster/.env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

Make sure MongoDB is running locally or update the connection string for MongoDB Atlas.

### 4. Start the Applications

#### Terminal 1: Backend

```bash
cd task-monster-backend
npm start
# Server runs on http://localhost:5000
```

#### Terminal 2: Frontend

```bash
cd task-monster
npm start
# App runs on http://localhost:3000
```

## API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Task Group Endpoints

#### Get All Task Groups

```http
GET /api/task-groups
Authorization: Bearer <jwt-token>
```

#### Create Task Group

```http
POST /api/task-groups
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Project Alpha",
  "description": "First project tasks",
  "monster_name": "Dragon",
  "color": "#FF6B6B"
}
```

### Task Endpoints

#### Get Tasks

```http
GET /api/tasks
GET /api/tasks?group_id=<group-id>
Authorization: Bearer <jwt-token>
```

#### Create Task

```http
POST /api/tasks
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Implement login",
  "description": "Create user authentication",
  "points": 15,
  "group_id": "group-id-here"
}
```

## Technology Stack

### Frontend

- **React 19** - UI framework
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Development

### Available Scripts

#### Frontend

```bash
npm start          # Start development server
npm run build      # Create production build
npm test           # Run tests
```

#### Backend

```bash
npm start          # Start production server
npm run dev        # Start development server (requires nodemon)
```

## Deployment

1. Set up MongoDB database
2. Configure environment variables
3. Deploy backend and frontend separately
4. Update API URLs for production

## License

MIT License
