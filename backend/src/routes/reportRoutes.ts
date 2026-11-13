import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';

const router = Router();

// GET all reports
router.get('/', (_req: Request, res: Response) => {
  res.json({ reports: store.getReports() });
});

// CREATE report
router.post('/', (req: Request, res: Response) => {
  const { studentId, studentName, routeId, routeName, busNumber, category, location, description } = req.body;

  if (!category || !location || !description) {
    return res.status(400).json({ error: 'Category, location, and description are required' });
  }

  const newReport = store.addReport({
    id: `rep-${Date.now().toString().slice(-4)}`,
    studentId: studentId || 'user-std-1',
    studentName: studentName || 'Ananya Rao',
    routeId,
    routeName,
    busNumber,
    category,
    location,
    description,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ report: newReport });
});

// UPDATE report status (Admin)
router.patch('/:id/status', (req: Request, res: Response) => {
  const { status, adminNotes } = req.body;
  const updated = store.updateReportStatus(req.params.id, status, adminNotes);
  if (!updated) return res.status(404).json({ error: 'Report not found' });
  res.json({ report: updated });
});

export default router;
