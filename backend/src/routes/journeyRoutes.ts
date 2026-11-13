import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { planJourneys } from '../algorithms/dijkstra.js';

const router = Router();

// GET all routes
router.get('/routes', (_req: Request, res: Response) => {
  res.json({ count: store.getRoutes().length, routes: store.getRoutes() });
});

// GET single route by id
router.get('/routes/:id', (req: Request, res: Response) => {
  const route = store.getRouteById(req.params.id);
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
  const updated = store.updateRoute(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Route not found' });
  res.json({ route: updated });
});

// DELETE route
router.delete('/routes/:id', (req: Request, res: Response) => {
  const deleted = store.deleteRoute(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Route not found' });
  res.json({ success: true, deleted });
});

// PLAN JOURNEYS (Graph Dijkstra Route Optimization & Timetables)
router.get('/plan', (req: Request, res: Response) => {
  const origin = (req.query.origin as string) || 'Kinnigoli';
  const destination = (req.query.destination as string) || 'Moodbidri';
  const time = (req.query.time as string) || '07:30';

  const sort = req.query.sort as any;
  const busType = req.query.busType as string;
  const maxFare = req.query.maxFare ? Number(req.query.maxFare) : undefined;
  const minSeats = req.query.minSeats ? Number(req.query.minSeats) : undefined;
  const maxTransfers = req.query.maxTransfers !== undefined && req.query.maxTransfers !== '' ? Number(req.query.maxTransfers) : undefined;
  const maxDistance = req.query.maxDistance ? Number(req.query.maxDistance) : undefined;
  const operator = req.query.operator as string;

  const journeys = planJourneys(origin, destination, time, {
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
    count: journeys.length,
    journeys
  });
});

export default router;
