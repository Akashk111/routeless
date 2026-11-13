import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { generateDemandPrediction } from '../services/demandPredictor.js';

const router = Router();

// GET AI Demand Prediction & Analytics
router.get('/prediction', (_req: Request, res: Response) => {
  const prediction = generateDemandPrediction();
  res.json(prediction);
});

// RESET Demo Data
router.post('/reset', (_req: Request, res: Response) => {
  store.reset();
  res.json({ success: true, message: 'All demo data, buses, routes, and requests have been restored to initial state.' });
});

// TRIGGER SCENARIOS
router.post('/trigger-scenario', (req: Request, res: Response) => {
  const { scenario } = req.body; // 'A' | 'B' | 'C'

  if (scenario === 'A') {
    // Scenario A: Cancelled Bus (14B Kinnigoli to Moodbidri)
    const bus = store.getBusById('bus-ka19-1402');
    if (bus) {
      bus.status = 'Cancelled';
      bus.speedKmH = 0;
      bus.availableSeats = 0;
    }
    store.addNotification({
      id: `notif-scen-a-${Date.now()}`,
      targetRole: 'all',
      title: '🚨 SCENARIO A TRIGGERED: Bus KA-19-F-1402 CANCELLED',
      message: 'Regular 08:00 AM bus from Kinnigoli to Moodbidri cancelled due to axle failure. 25+ students stranded. ROUTELESS Alternative Transport Finder is now active.',
      type: 'alert',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/alternatives'
    });
    return res.json({
      success: true,
      scenario: 'A',
      title: 'Scenario A: Cancelled Bus Activated',
      description: 'Route 14B bus KA-19-F-1402 marked as Cancelled. Check Alternative Transport Finder to see multi-modal recommendations.'
    });
  }

  if (scenario === 'B') {
    // Scenario B: High Student Demand (Spike requests for Alva's College)
    const newReqs = [
      {
        id: `req-spike-1-${Date.now()}`,
        studentId: 'user-std-10',
        studentName: 'Shreya Shenoy & 6 Classmates',
        studentVillage: 'Kinnigoli',
        origin: 'Kinnigoli',
        destination: "Alva's College, Moodbidri",
        travelDate: '2026-11-13',
        departureWindow: '07:30 - 08:30',
        passengerCount: 7,
        status: 'PENDING' as const,
        notes: 'Semester exams start at 09:00 AM. Regular bus is already full.',
        createdAt: new Date().toISOString()
      },
      {
        id: `req-spike-2-${Date.now()}`,
        studentId: 'user-std-11',
        studentName: 'Naveen Kumar & Group',
        studentVillage: 'Kateel',
        origin: 'Kateel',
        destination: "Alva's College, Moodbidri",
        travelDate: '2026-11-13',
        departureWindow: '07:30 - 08:30',
        passengerCount: 11,
        status: 'PENDING' as const,
        notes: 'Kateel temple junction bus skipped. 11 students stranded.',
        createdAt: new Date().toISOString()
      }
    ];

    newReqs.forEach(r => store.addRequest(r));

    store.addNotification({
      id: `notif-scen-b-${Date.now()}`,
      targetRole: 'admin',
      title: '⚡ SCENARIO B TRIGGERED: Student Demand Surge',
      message: '18 additional students have submitted urgent travel requests on Kinnigoli-Moodbidri corridor between 07:30-08:30 AM.',
      type: 'alert',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/admin'
    });

    return res.json({
      success: true,
      scenario: 'B',
      title: 'Scenario B: High Student Demand Activated',
      description: '18 additional travel requests aggregated. Admin dashboard now displays critical corridor deficit.'
    });
  }

  if (scenario === 'C') {
    // Scenario C: Overcrowded Bus (22A Gurupura to Vamanjoor)
    const bus = store.getBusById('bus-ka19-2201');
    if (bus) {
      bus.status = 'Full Capacity';
      bus.availableSeats = 0;
      bus.delayMinutes = 15;
    }
    store.addReport({
      id: `rep-scen-c-${Date.now()}`,
      studentId: 'user-std-4',
      studentName: 'Karthik Prabhu',
      routeId: 'route-22a',
      routeName: '22A (Gurupura → Vamanjoor)',
      busNumber: 'KA-19-F-2201',
      category: 'Bus overcrowded',
      location: 'Polali Dwara Stop',
      description: 'Bus passed Polali Dwara at full capacity without opening front or rear doors. 14 college students left stranded on roadside.',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });

    store.addNotification({
      id: `notif-scen-c-${Date.now()}`,
      targetRole: 'all',
      title: '⚠️ SCENARIO C TRIGGERED: Bus Overcrowded',
      message: 'Route 22A bus KA-19-F-2201 at 100% capacity. Students at downstream stops alerted to take alternative Maxi-Cab feeder.',
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/tracking'
    });

    return res.json({
      success: true,
      scenario: 'C',
      title: 'Scenario C: Overcrowded Bus Activated',
      description: 'Bus 22A set to Full Capacity (0 seats). Overcrowding incident logged for transit authorities.'
    });
  }

  return res.status(400).json({ error: 'Invalid scenario. Choose A, B, or C.' });
});

// Admin 1-Click Allocate Extra Bus
router.post('/allocate-bus', (req: Request, res: Response) => {
  const { routeId = 'route-14b', busNumber = 'KA-19-F-9901', operator = 'KSRTC Special Student Express' } = req.body;

  const allocatedBus = {
    id: `bus-alloc-${Date.now()}`,
    busNumber,
    operator,
    routeId,
    routeName: '14B (Special Relief Shuttle)',
    capacity: 35,
    availableSeats: 35,
    status: 'On Time' as const,
    currentLat: 13.0854,
    currentLng: 74.8722,
    heading: 90,
    speedKmH: 40,
    lastUpdated: new Date().toISOString(),
    currentStopIndex: 0,
    delayMinutes: 0,
    driverName: 'Mohan Kumar (Depot Standby)',
    driverPhone: '+91 94481 00223',
    isSimulatedGps: true
  };

  store.addBus(allocatedBus);

  // Update pending requests on this corridor to ADDITIONAL_BUS_ASSIGNED
  store.getRequests().forEach(r => {
    if (r.status === 'PENDING' || r.status === 'GROUPED') {
      r.status = 'ADDITIONAL_BUS_ASSIGNED';
    }
  });

  store.addNotification({
    id: `notif-alloc-${Date.now()}`,
    targetRole: 'all',
    title: '🎉 Relief Bus Dispatched!',
    message: `KSRTC Relief Bus ${busNumber} has been dispatched to Kinnigoli Bus Stand to accommodate waiting students.`,
    type: 'success',
    read: false,
    createdAt: new Date().toISOString(),
    actionUrl: '/tracking'
  });

  res.json({
    success: true,
    message: `Relief bus ${busNumber} successfully allocated to Route 14B!`,
    bus: allocatedBus
  });
});

export default router;
