import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

const router = Router();

// GET all bookings (optionally filtered by studentId)
router.get('/', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string;
  const bookings = db.getBookings(studentId);
  res.json({ count: bookings.length, bookings });
});

// CREATE a new booking (decrements seat availability)
router.post('/', (req: Request, res: Response) => {
  const {
    tripId,
    busId,
    fromStop,
    toStop,
    departureTime,
    arrivalTime,
    travelDate,
    studentId,
    passengerName,
    farePaid
  } = req.body;

  if (!fromStop || !toStop) {
    return res.status(400).json({ error: 'fromStop and toStop are required.' });
  }

  const result = db.createBooking({
    tripId: tripId || 'trip-14b-03',
    busId,
    fromStop,
    toStop,
    departureTime: departureTime || '07:30',
    arrivalTime: arrivalTime || '08:14',
    travelDate: travelDate || '13/11/2026',
    studentId: studentId || 'std-guest',
    passengerName: passengerName || 'Student Passenger',
    farePaid: farePaid ? Number(farePaid) : 28
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json({
    success: true,
    message: 'Seat successfully reserved. Available seats updated.',
    booking: result.booking
  });
});

// CANCEL a booking (increments seat availability)
router.post('/:id/cancel', (req: Request, res: Response) => {
  const result = db.cancelBooking(req.params.id);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({
    success: true,
    message: 'Booking cancelled successfully. Seat restored to fleet inventory.'
  });
});

export default router;
