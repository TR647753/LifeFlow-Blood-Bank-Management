
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { initAdmin } from './config/initAdmin.js';

import auth from './routes/auth.js';
import admin from './routes/admin.js';
import donors from './routes/donors.js';
import patients from './routes/patients.js';
import blood from './routes/blood.js';
import requests from './routes/requests.js';
import donations from './routes/donations.js';
import notifications from './routes/notifications.js';
import upload from './routes/upload.js';
import camps from './routes/camps.js';

const app = express();

// Trust one reverse proxy hop on Render
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  }
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

app.use(express.json({ limit: '100kb' }));

// API routes
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100
  }),
  auth
);

app.use('/api/admin', admin);
app.use('/api/donors', donors);
app.use('/api/patients', patients);
app.use('/api/blood', blood);
app.use('/api/requests', requests);
app.use('/api/donations', donations);
app.use('/api/notifications', notifications);
app.use('/api/upload', upload);
app.use('/api/camps', camps);

// Static uploads
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);

  const status = err.status ||
    (err.code === 11000 ? 409 :
    err.name === 'ZodError' ||
    err.name === 'ValidationError' ? 400 : 500);

  res.status(status).json({
    message:
      err.code === 11000
        ? 'Duplicate email or record'
        : err.name === 'ZodError'
        ? err.issues.map(i => i.message).join(', ')
        : err.message || 'Server error'
  });
});

// Connect to MongoDB Atlas
await connectDB();

// Create default admin if no admin exists
await initAdmin();

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('Server listening on ' + PORT);
});
