import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { getStringParam } from '../utils/params.js';

const router = Router();

// GET notifications
router.get('/', (req: Request, res: Response) => {
  const role = typeof req.query.role === 'string' ? req.query.role : undefined;
  res.json({ notifications: store.getNotifications(role) });
});

// MARK read
router.patch('/:id/read', (req: Request, res: Response) => {
  const id = getStringParam(req.params.id);
  if (!id) return res.status(400).json({ error: 'Valid notification ID is required' });
  const updated = store.markNotificationRead(id);
  if (!updated) return res.status(404).json({ error: 'Notification not found' });
  res.json({ notification: updated });
});

export default router;
