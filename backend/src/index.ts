import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import busRoutes from './routes/busRoutes.js';
import journeyRoutes from './routes/journeyRoutes.js';
import alternativeRoutes from './routes/alternativeRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import { busSimulator } from './services/busSimulator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Request logging for developer debugging
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/alternatives', alternativeRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/demo', demoRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    platform: 'ROUTELESS — THE LAST MILE',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start Bus GPS Simulator (runs every 3.5 seconds to advance simulated rural bus positions)
busSimulator.start(3500);

app.listen(PORT, () => {
  console.log(`🚌 ROUTELESS Backend API Server running on http://localhost:${PORT}`);
});
