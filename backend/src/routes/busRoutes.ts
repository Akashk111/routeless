import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { busSimulator } from '../services/busSimulator.js';

const router = Router();

// GET all buses
router.get('/', (_req: Request, res: Response) => {
  res.json({ buses: store.getBuses() });
});

// Trigger manual tick of simulation
router.post('/tick', (_req: Request, res: Response) => {
  busSimulator.tick();
  res.json({ buses: store.getBuses() });
});

// GET bus by id
router.get('/:id', (req: Request, res: Response) => {
  const bus = store.getBusById(req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  res.json({ bus });
});

// UPDATE bus (Admin / Operator)
router.patch('/:id', (req: Request, res: Response) => {
  const updated = store.updateBus(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Bus not found' });

  // If status is changed to Cancelled, create an emergency notification
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
