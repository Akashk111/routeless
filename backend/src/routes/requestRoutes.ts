import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';

const router = Router();

// GET all travel requests
router.get('/', (_req: Request, res: Response) => {
  res.json({ requests: store.getRequests() });
});

// CREATE travel request
router.post('/', (req: Request, res: Response) => {
  const { studentId, studentName, studentVillage, origin, destination, travelDate, departureWindow, passengerCount, notes } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination are required' });
  }

  const newReq = store.addRequest({
    id: `req-${Date.now().toString().slice(-4)}`,
    studentId: studentId || 'user-std-1',
    studentName: studentName || 'Ananya Rao',
    studentVillage: studentVillage || origin,
    origin,
    destination,
    travelDate: travelDate || new Date().toISOString().split('T')[0],
    departureWindow: departureWindow || '07:30 - 08:30',
    passengerCount: Number(passengerCount) || 1,
    status: 'PENDING',
    notes,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ request: newReq });
});

// UPDATE request status (Admin)
router.patch('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const updated = store.updateRequestStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: 'Request not found' });
  res.json({ request: updated });
});

export default router;
