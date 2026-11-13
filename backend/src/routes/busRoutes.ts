import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { busSimulator } from '../services/busSimulator.js';

const router = Router();

// GET all buses (with optional filters)
router.get('/', (req: Request, res: Response) => {
  let buses = store.getBuses();

  const { routeId, busType, status } = req.query;
  if (routeId && routeId !== 'all') {
    buses = buses.filter(b => b.routeId === routeId);
  }
  if (busType && busType !== 'all') {
    buses = buses.filter(b => b.busType === busType);
  }
  if (status && status !== 'all') {
    buses = buses.filter(b => b.status === status);
  }

  res.json({ count: buses.length, buses });
});

// Trigger manual tick of simulation
router.post('/tick', (_req: Request, res: Response) => {
  busSimulator.tick();
  res.json({ buses: store.getBuses() });
});

// GET bus location (TASK 7: GET /api/buses/:id/location)
router.get('/:id/location', (req: Request, res: Response) => {
  const loc = store.getBusLocation(req.params.id);
  if (!loc) return res.status(404).json({ error: 'Bus location not found' });
  res.json({ location: loc });
});

// GET bus by id
router.get('/:id', (req: Request, res: Response) => {
  const bus = store.getBusById(req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  res.json({ bus });
});

// REAL GPS TELEMETRY INGESTION ENDPOINT (Section 6: Real GPS integration architecture)
router.post('/:id/telemetry', (req: Request, res: Response) => {
  const { latitude, longitude, speedKmH, heading, timestamp } = req.body;

  if (latitude === undefined || longitude === undefined || speedKmH === undefined) {
    return res.status(400).json({ error: 'latitude, longitude, and speedKmH are required.' });
  }

  const success = busSimulator.updateTelemetry(req.params.id, {
    latitude: Number(latitude),
    longitude: Number(longitude),
    speedKmH: Number(speedKmH),
    heading: heading !== undefined ? Number(heading) : undefined,
    timestamp: timestamp || new Date().toISOString()
  });

  if (!success) {
    return res.status(400).json({
      error: 'Telemetry rejected. Invalid bus ID or stale timestamp (> 2 hours old).'
    });
  }

  const updatedBus = store.getBusById(req.params.id);
  res.json({
    success: true,
    message: 'Hardware GPS Telemetry updated successfully.',
    bus: updatedBus
  });
});

// UPDATE bus (Admin / Operator)
router.patch('/:id', (req: Request, res: Response) => {
  const updated = store.updateBus(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Bus not found' });

  // If status is changed to Cancelled, broadcast alert notification
  if (req.body.status === 'Cancelled') {
    store.addNotification({
      id: `notif-cancel-${Date.now()}`,
      targetRole: 'all',
      title: `URGENT: Bus ${updated.busNumber} Cancelled`,
      message: `${updated.routeName} has been marked CANCELLED. Students should check Alternative Routes immediately.`,
      type: 'alert',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/alternatives'
    });
  }

  res.json({ bus: updated });
});

// ADD bus (Admin)
router.post('/', (req: Request, res: Response) => {
  const newBus = {
    id: `bus-ka19-${Date.now().toString().slice(-4)}`,
    isSimulatedGps: true,
    speedKmH: 40,
    heading: 90,
    currentStopIndex: 0,
    lastUpdated: new Date().toISOString(),
    distanceToNextStopKm: 5.0,
    remainingDistanceKm: 25.0,
    etaNextStop: '08:00',
    etaDestination: '08:45',
    delayMinutes: 0,
    stops: [],
    ...req.body
  };
  store.addBus(newBus);
  res.status(201).json({ bus: newBus });
});

// DELETE bus
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = store.deleteBus(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Bus not found' });
  res.json({ success: true, deleted });
});

export default router;
