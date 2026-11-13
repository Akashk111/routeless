import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { planJourneys, PlanOptions } from '../algorithms/dijkstra.js';
import { getStringParam, getQueryString } from '../utils/params.js';

const router = Router();

// GET all routes
router.get('/routes', (_req: Request, res: Response) => {
  res.json({ count: store.getRoutes().length, routes: store.getRoutes() });
});

// GET single route by id
router.get('/routes/:id', (req: Request, res: Response) => {
  const id = getStringParam(req.params.id);
  if (!id) return res.status(400).json({ error: 'Valid route ID is required' });
  const route = store.getRouteById(id);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  res.json({ route });
});

// POST / PUT route (Admin)
router.post('/routes', (req: Request, res: Response) => {
  const newRoute = {
    id: `route-${Date.now().toString().slice(-4)}`,
    status: 'Active',
    operatingDays: 'Daily',
    busType: 'KSRTC Ordinary',
    associatedBusIds: [],
    schedule: [],
    stops: [],
    ...req.body
  };
  store.addRoute(newRoute);
  res.status(201).json({ route: newRoute });
});

router.patch('/routes/:id', (req: Request, res: Response) => {
  const id = getStringParam(req.params.id);
  if (!id) return res.status(400).json({ error: 'Valid route ID is required' });
  const updated = store.updateRoute(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Route not found' });
  res.json({ route: updated });
});

// DELETE route
router.delete('/routes/:id', (req: Request, res: Response) => {
  const id = getStringParam(req.params.id);
  if (!id) return res.status(400).json({ error: 'Valid route ID is required' });
  const deleted = store.deleteRoute(id);
  if (!deleted) return res.status(404).json({ error: 'Route not found' });
  res.json({ success: true, deleted });
});

// PLAN JOURNEYS (Graph Dijkstra Route Optimization & Timetables)
const handleJourneyPlan = (req: Request, res: Response) => {
  const origin = getQueryString(req.query.origin || req.query.from, 'Kinnigoli');
  const destination = getQueryString(req.query.destination || req.query.to, 'Moodbidri');
  const time = getQueryString(req.query.time || req.query.departureTime, '07:30 AM');
  const travelDate = getQueryString(req.query.travelDate || req.query.date, '13/11/2026');

  const sort = typeof req.query.sort === 'string' ? (req.query.sort as PlanOptions['sort']) : undefined;
  const busType = typeof req.query.busType === 'string' ? req.query.busType : undefined;
  const maxFare = typeof req.query.maxFare === 'string' && req.query.maxFare.trim() ? Number(req.query.maxFare) : undefined;
  const minSeats = typeof req.query.minSeats === 'string' && req.query.minSeats.trim() ? Number(req.query.minSeats) : undefined;
  const maxTransfers = typeof req.query.maxTransfers === 'string' && req.query.maxTransfers.trim() ? Number(req.query.maxTransfers) : undefined;
  const maxDistance = typeof req.query.maxDistance === 'string' && req.query.maxDistance.trim() ? Number(req.query.maxDistance) : undefined;
  const operator = typeof req.query.operator === 'string' ? req.query.operator : undefined;

  const journeys = planJourneys(origin, destination, time, {
    travelDate,
    sort,
    busType,
    maxFare,
    minSeats,
    maxTransfers,
    maxDistance,
    operator
  });

  res.json({
    origin,
    destination,
    preferredTime: time,
    travelDate,
    count: journeys.length,
    journeys
  });
};

router.get('/plan', handleJourneyPlan);
router.get('/search', handleJourneyPlan);

export default router;
