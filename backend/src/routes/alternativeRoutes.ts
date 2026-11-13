import { Router, Request, Response } from 'express';
import { findAlternatives } from '../algorithms/alternativeFinder.js';

const router = Router();

// GET alternatives
router.get('/search', (req: Request, res: Response) => {
  const origin = (req.query.origin as string) || 'Kinnigoli';
  const destination = (req.query.destination as string) || 'Moodbidri';
  const time = (req.query.time as string) || '07:30';

  const result = findAlternatives(origin, destination, time);
  res.json(result);
});

export default router;
