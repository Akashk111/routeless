import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { planJourneys } from '../algorithms/dijkstra.js';

const router = Router();

// GET all routes
router.get('/routes', (_req: Request, res: Response) => {
  res.json({ routes: store.getRoutes() });
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

// PLAN JOURNEYS (Graph Dijkstra)
router.get('/plan', (req: Request, res: Response) => {
  const origin = (req.query.origin as string) || 'Kinnigoli';
  const destination = (req.query.destination as string) || 'Moodbidri';
  const time = (req.query.time as string) || '07:30';

  const journeys = planJourneys(origin, destination, time);
  res.json({
    origin,
    destination,
    preferredTime: time,
    count: journeys.length,
    journeys
  });
});

export default router;
