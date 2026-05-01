const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB.
// 1) Use MONGODB_URI when provided (recommended, persistent).
// 2) Fallback to MongoMemoryServer with a persistent dbPath.
async function connectPersistentLocalMongo() {
  const dbPath = process.env.MONGODB_MEMORY_DB_PATH || path.join(__dirname, '.mongo-data');
  fs.mkdirSync(dbPath, { recursive: true });

  const mongoServer = await MongoMemoryServer.create({
    instance: {
      dbPath,
      dbName: 'task_monster',
      storageEngine: 'wiredTiger'
    }
  });

  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  console.log(`MongoDB Memory Server connected (persistent dbPath: ${dbPath})`);
}

async function connectDB() {
  const configuredMongoUri = process.env.MONGODB_URI;

  if (configuredMongoUri) {
    try {
      await mongoose.connect(configuredMongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('MongoDB connected via MONGODB_URI');
      return;
    } catch (error) {
      console.warn('MONGODB_URI connection failed, falling back to local persistent MongoDB memory server.');
      console.warn(error.message);
    }
  }

  try {
    await connectPersistentLocalMongo();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/task-groups', require('./routes/quests'));
app.use('/api/quests', require('./routes/quests'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/adventuring-parties', require('./routes/adventuringParties'));
app.use('/api/quest-presets', require('./routes/questPresets'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Task Monster API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

module.exports = app;