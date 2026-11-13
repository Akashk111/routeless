import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';

const router = Router();

// GET notifications
router.get('/', (req: Request, res: Response) => {
  const role = req.query.role as string;
  res.json({ notifications: store.getNotifications(role) });
});

// MARK read
router.patch('/:id/read', (req: Request, res: Response) => {
  const updated = store.markNotificationRead(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Notification not found' });
  res.json({ notification: updated });
});

export default router;
