import { store } from '../data/store.js';

export interface DemandPredictionResult {
  summary: {
    totalStudents: number;
    activeBuses: number;
    totalRoutes: number;
    totalRequests: number;
    totalReports: number;
    unresolvedReports: number;
    criticalCorridor: string;
    fleetUtilizationPercent: number;
  };
  demandByTimeOfDay: {
    timeSlot: string;
    studentCount: number;
    busCapacity: number;
    deficit: number;
  }[];
  villageWiseDemand: {
    village: string;
    requests: number;
    activeAlerts: number;
    stressLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  }[];
  popularDestinations: {
    destination: string;
    studentCount: number;
    servedByRoutes: string;
    status: 'Sufficient' | 'Strained' | 'Severe Shortage';
  }[];
  capacityUtilization: {
    routeName: string;
    busNumber: string;
    utilizationPercent: number;
    availableSeats: number;
    status: string;
  }[];
  problemCategories: {
    category: string;
    count: number;
  }[];
  smartRecommendations: {
    id: string;
    priority: 'High' | 'Medium' | 'Low';
    corridor: string;
    finding: string;
    recommendedAction: string;
    impact: string;
  }[];
}

export function generateDemandPrediction(): DemandPredictionResult {
  const requests = store.getRequests();
  const reports = store.getReports();
  const buses = store.getBuses();
  const routes = store.getRoutes();
  const users = store.getUsers();

  const totalStudents = users.filter(u => u.role === 'student').length + 420; // 420 simulated rural student base
  const activeBuses = buses.filter(b => b.status !== 'Cancelled' && b.status !== 'Out of Service').length;
  const totalReports = reports.length;
  const unresolvedReports = reports.filter(r => r.status !== 'RESOLVED').length;

  // Aggregate student requests by village
  const villageCounts: Record<string, number> = {
    'Kinnigoli': 24,
    'Kateel': 18,
    'Gurupura': 16,
    'Bajpe': 14,
    'Mulki': 11,
    'Bantwal': 15,
    'Ganjimutt': 8
  };

  requests.forEach(r => {
    const v = r.studentVillage || r.origin;
    villageCounts[v] = (villageCounts[v] || 0) + (r.passengerCount || 1);
  });

  const villageWiseDemand = Object.entries(villageCounts).map(([village, count]) => {
    let stressLevel: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Moderate';
    if (count > 20) stressLevel = 'Critical';
    else if (count > 15) stressLevel = 'High';
    else if (count <= 10) stressLevel = 'Low';

    const alerts = reports.filter(rep => rep.location.toLowerCase().includes(village.toLowerCase())).length;

    return {
      village,
      requests: count,
      activeAlerts: alerts,
      stressLevel
    };
  }).sort((a, b) => b.requests - a.requests);

  // Time slot analysis (rural school/college morning and evening peaks)
  const demandByTimeOfDay = [
    { timeSlot: '06:30 - 07:30', studentCount: 45, busCapacity: 90, deficit: 0 },
    { timeSlot: '07:30 - 08:30', studentCount: 168, busCapacity: 110, deficit: 58 },
    { timeSlot: '08:30 - 09:30', studentCount: 135, busCapacity: 120, deficit: 15 },
    { timeSlot: '12:30 - 14:00', studentCount: 52, busCapacity: 80, deficit: 0 },
    { timeSlot: '16:00 - 17:30', studentCount: 155, busCapacity: 110, deficit: 45 },
    { timeSlot: '17:30 - 19:00', studentCount: 65, busCapacity: 80, deficit: 0 }
  ];

  // Popular destinations
  const popularDestinations = [
    { destination: "Alva's Education Complex (Moodbidri)", studentCount: 142, servedByRoutes: '14B, 45F', status: 'Severe Shortage' as const },
    { destination: 'St. Joseph Engineering College (Vamanjoor)', studentCount: 88, servedByRoutes: '22A, 60B', status: 'Strained' as const },
    { destination: 'NITK & Gov PU College (Surathkal)', studentCount: 65, servedByRoutes: '55S', status: 'Sufficient' as const },
    { destination: 'Canara Engineering College (Benjanapadavu)', studentCount: 46, servedByRoutes: '60B', status: 'Sufficient' as const },
    { destination: 'Mangalore University Campus (Konaje)', studentCount: 38, servedByRoutes: 'Feeder Link', status: 'Strained' as const }
  ];

  // Bus capacity utilization
  const capacityUtilization = buses.map(b => {
    const totalCap = b.capacity || 50;
    const occupied = Math.max(0, totalCap - b.availableSeats);
    const utilPercent = b.status === 'Full Capacity' ? 100 : Math.round((occupied / totalCap) * 100);
    return {
      routeName: b.routeName,
      busNumber: b.busNumber,
      utilizationPercent: utilPercent,
      availableSeats: b.availableSeats,
      status: b.status
    };
  });

  // Average fleet utilization
  const avgUtil = Math.round(
    capacityUtilization.reduce((sum, b) => sum + b.utilizationPercent, 0) / Math.max(1, capacityUtilization.length)
  );

  // Problem category counts
  const catCounts: Record<string, number> = {};
  reports.forEach(r => {
    catCounts[r.category] = (catCounts[r.category] || 0) + 1;
  });
  const problemCategories = Object.entries(catCounts).map(([category, count]) => ({ category, count }));

  // AI Smart Recommendations
  const smartRecommendations = [
    {
      id: 'rec-1',
      priority: 'High' as const,
      corridor: 'Kinnigoli → Moodbidri (Route 14B)',
      finding: 'High deficit of 58 seats identified between 07:30 AM – 08:30 AM with 24 registered students from Kinnigoli and Kateel.',
      recommendedAction: 'Dispatch spare 32-seater KSRTC Gramina shuttle KA-19-F-9901 currently stationed at Bajpe Depot.',
      impact: 'Will eliminate student wait times and ensure 100% on-time exam attendance at Alva\'s College.'
    },
    {
      id: 'rec-2',
      priority: 'High' as const,
      corridor: 'Gurupura → Vamanjoor (Route 22A)',
      finding: 'Bus KA-19-F-2201 running at 100% full capacity, causing students at Polali Dwara stop to be skipped.',
      recommendedAction: 'Temporarily authorize local Grama Panchayat Maxi-Cab pool with student pass subsidy.',
      impact: 'Prevents safety risk of students hanging on bus footboards on NH-169.'
    },
    {
      id: 'rec-3',
      priority: 'Medium' as const,
      corridor: 'Kateel → Bajpe Transfer Hub (Route 31C)',
      finding: 'Synchronize 31C arrival at Bajpe Bus Station with 45F departure to tighten connection window from 22m to 8m.',
      recommendedAction: 'Adjust Route 31C timetable departure from Kateel by +5 minutes.',
      impact: 'Reduces student waiting time by 14 minutes for coastal village transfers.'
    }
  ];

  return {
    summary: {
      totalStudents,
      activeBuses,
      totalRoutes: routes.length,
      totalRequests: requests.length + 32,
      totalReports,
      unresolvedReports,
      criticalCorridor: 'Kinnigoli ↔ Moodbidri (Route 14B)',
      fleetUtilizationPercent: avgUtil
    },
    demandByTimeOfDay,
    villageWiseDemand,
    popularDestinations,
    capacityUtilization,
    problemCategories,
    smartRecommendations
  };
}
