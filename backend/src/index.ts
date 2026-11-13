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
import bookingRoutes from './routes/bookingRoutes.js';
import { busSimulator } from './services/busSimulator.js';
import { store } from './data/store.js';
import { planJourneys } from './algorithms/dijkstra.js';

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
app.use('/api/bookings', bookingRoutes);
app.use('/api/alternatives', alternativeRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/demo', demoRoutes);

// ========================================================
// Direct TASK 7 Compliance Endpoints
// ========================================================

// GET /api/stops (All 56 geocoded bus stops across the regional network)
app.get('/api/stops', (req, res) => {
  const query = req.query.q as string;
  let stops = store.getStops();
  if (query) {
    const q = query.toLowerCase();
    stops = stops.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.villageTag && s.villageTag.toLowerCase().includes(q)) ||
      (s.aliases && s.aliases.some(a => a.toLowerCase().includes(q)))
    );
  }
  res.json({ count: stops.length, stops });
});

// GET /api/stops/:id
app.get('/api/stops/:id', (req, res) => {
  const stop = store.getStopById(req.params.id);
  if (!stop) return res.status(404).json({ error: 'Stop not found' });
  res.json({ stop });
});

// GET /api/routes (All 20 connected bus routes)
app.get('/api/routes', (_req, res) => {
  const routes = store.getRoutes();
  res.json({ count: routes.length, routes });
});

// GET /api/routes/:id
app.get('/api/routes/:id', (req, res) => {
  const route = store.getRouteById(req.params.id);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  res.json({ route });
});

// GET /api/trips (All scheduled trips across the network)
app.get('/api/trips', (req, res) => {
  const routeId = req.query.routeId as string;
  const trips = store.getTrips(routeId);
  res.json({ count: trips.length, trips });
});

// GET /api/trips/:id
app.get('/api/trips/:id', (req, res) => {
  const trip = store.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json({ trip });
});

// GET /api/trips/:id/passengers (Task 7: Passenger records for trip)
app.get('/api/trips/:id/passengers', (req, res) => {
  const passengers = store.getPassengers(req.params.id);
  res.json({ tripId: req.params.id, count: passengers.length, passengers });
});

// GET /api/journeys/search (Task 7 Journey Search API)
app.get(['/api/journeys/search', '/api/journey/search'], (req, res) => {
  const origin = (req.query.origin as string) || (req.query.from as string) || 'Kinnigoli';
  const destination = (req.query.destination as string) || (req.query.to as string) || 'Moodbidri';
  const time = (req.query.departureTime as string) || (req.query.time as string) || '07:30 AM';
  const travelDate = (req.query.date as string) || (req.query.travelDate as string) || '13/11/2026';

  const journeys = planJourneys(origin, destination, time, {
    travelDate,
    sort: req.query.sort as any,
    busType: req.query.busType as string,
    maxFare: req.query.maxFare ? Number(req.query.maxFare) : undefined,
    minSeats: req.query.minSeats ? Number(req.query.minSeats) : undefined,
    maxTransfers: req.query.maxTransfers !== undefined && req.query.maxTransfers !== '' ? Number(req.query.maxTransfers) : undefined,
    maxDistance: req.query.maxDistance ? Number(req.query.maxDistance) : undefined,
    operator: req.query.operator as string
  });

  res.json({
    origin,
    destination,
    preferredTime: time,
    travelDate,
    count: journeys.length,
    journeys
  });
});

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

export default app;
