import { User, Bus, Route, TravelRequest, TransportReport, AppNotification } from '../types/index.js';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-std-1',
    name: 'Ananya Rao',
    email: 'student@routeless.org',
    password: 'password123',
    role: 'student',
    phone: '+91 98451 22341',
    village: 'Kinnigoli',
    institution: "Alva's College, Moodbidri",
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-10T08:00:00Z',
  },
  {
    id: 'user-adm-1',
    name: 'K. R. Hegde',
    email: 'admin@routeless.org',
    password: 'adminpassword',
    role: 'admin',
    phone: '+91 94480 55120',
    village: 'Mangaluru Central Control',
    institution: 'KSRTC / Rural Transport Authority',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'user-opr-1',
    name: 'Suresh Naik',
    email: 'operator@routeless.org',
    password: 'driverpassword',
    role: 'operator',
    phone: '+91 97410 99882',
    village: 'Moodbidri Depot',
    institution: 'Route 14B Lead Conductor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-01T08:00:00Z',
  }
];

export const INITIAL_ROUTES: Route[] = [
  {
    id: 'route-14b',
    routeNumber: '14B',
    routeName: 'Kinnigoli to Moodbidri (Alva\'s Campus)',
    origin: 'Kinnigoli',
    destination: 'Moodbidri',
    via: ['Kateel', 'Bajpe Cross', 'Ganjimutt'],
    distanceKm: 28.5,
    estimatedDurationMin: 55,
    fareRupees: 35,
    status: 'Active',
    stops: [
      { id: 'stop-kin', name: 'Kinnigoli Bus Stand', latitude: 13.0854, longitude: 74.8722, sequence: 1, villageTag: 'Kinnigoli', isHub: true },
      { id: 'stop-kat', name: 'Kateel Temple Junction', latitude: 13.0673, longitude: 74.8488, sequence: 2, villageTag: 'Kateel', isHub: true },
      { id: 'stop-baj-cr', name: 'Bajpe Rural Cross', latitude: 13.0125, longitude: 74.8790, sequence: 3, villageTag: 'Bajpe' },
      { id: 'stop-gan', name: 'Ganjimutt Tech Zone', latitude: 13.0298, longitude: 74.9450, sequence: 4, villageTag: 'Ganjimutt' },
      { id: 'stop-alv', name: "Alva's Vidyagiri Gate", latitude: 13.0650, longitude: 74.9890, sequence: 5, villageTag: 'Moodbidri', isHub: true },
      { id: 'stop-mbd', name: 'Moodbidri Bus Terminus', latitude: 13.0722, longitude: 74.9961, sequence: 6, villageTag: 'Moodbidri', isHub: true }
    ],
    schedule: [
      { departureTime: '07:15', arrivalTime: '08:10', busId: 'bus-ka19-1401' },
      { departureTime: '08:00', arrivalTime: '08:55', busId: 'bus-ka19-1402' },
      { departureTime: '13:30', arrivalTime: '14:25', busId: 'bus-ka19-1401' },
      { departureTime: '16:45', arrivalTime: '17:40', busId: 'bus-ka19-1402' }
    ]
  },
  {
    id: 'route-22a',
    routeNumber: '22A',
    routeName: 'Gurupura to Vamanjoor (SJEC Engineering)',
    origin: 'Gurupura',
    destination: 'Vamanjoor',
    via: ['Polali Cross', 'Kaikamba', 'Pilikula'],
    distanceKm: 14.2,
    estimatedDurationMin: 32,
    fareRupees: 22,
    status: 'Active',
    stops: [
      { id: 'stop-gur', name: 'Gurupura Kaikamba', latitude: 12.9463, longitude: 74.9351, sequence: 1, villageTag: 'Gurupura', isHub: true },
      { id: 'stop-pol', name: 'Polali Dwara Stop', latitude: 12.9350, longitude: 74.9210, sequence: 2, villageTag: 'Polali' },
      { id: 'stop-pil', name: 'Pilikula Heritage Gate', latitude: 12.9260, longitude: 74.9080, sequence: 3, villageTag: 'Pilikula' },
      { id: 'stop-sjec', name: 'St. Joseph Engg College', latitude: 12.9197, longitude: 74.8967, sequence: 4, villageTag: 'Vamanjoor', isHub: true }
    ],
    schedule: [
      { departureTime: '07:45', arrivalTime: '08:17', busId: 'bus-ka19-2201' },
      { departureTime: '08:30', arrivalTime: '09:02', busId: 'bus-ka19-2202' },
      { departureTime: '14:00', arrivalTime: '14:32', busId: 'bus-ka19-2201' },
      { departureTime: '17:15', arrivalTime: '17:47', busId: 'bus-ka19-2202' }
    ]
  },
  {
    id: 'route-31c',
    routeNumber: '31C',
    routeName: 'Kateel to Bajpe & Mangaluru Airport',
    origin: 'Kateel',
    destination: 'Bajpe',
    via: ['Permude', 'Yekkar Grama'],
    distanceKm: 12.0,
    estimatedDurationMin: 22,
    fareRupees: 18,
    status: 'Active',
    stops: [
      { id: 'stop-kat', name: 'Kateel Temple Junction', latitude: 13.0673, longitude: 74.8488, sequence: 1, villageTag: 'Kateel', isHub: true },
      { id: 'stop-yek', name: 'Yekkar Grama Panchayat', latitude: 13.0310, longitude: 74.8640, sequence: 2, villageTag: 'Yekkar' },
      { id: 'stop-baj-hub', name: 'Bajpe Bus Station', latitude: 12.9818, longitude: 74.8872, sequence: 3, villageTag: 'Bajpe', isHub: true }
    ],
    schedule: [
      { departureTime: '07:30', arrivalTime: '07:52', busId: 'bus-ka19-3101' },
      { departureTime: '08:15', arrivalTime: '08:37', busId: 'bus-ka19-3101' },
      { departureTime: '09:00', arrivalTime: '09:22', busId: 'bus-ka19-3101' },
      { departureTime: '16:30', arrivalTime: '16:52', busId: 'bus-ka19-3101' }
    ]
  },
  {
    id: 'route-45f',
    routeNumber: '45F',
    routeName: 'Bajpe to Moodbidri Direct Feeder',
    origin: 'Bajpe',
    destination: 'Moodbidri',
    via: ['Pojekallu', 'Mijar (Alva\'s Shobhavana)'],
    distanceKm: 19.4,
    estimatedDurationMin: 35,
    fareRupees: 28,
    status: 'Active',
    stops: [
      { id: 'stop-baj-hub', name: 'Bajpe Bus Station', latitude: 12.9818, longitude: 74.8872, sequence: 1, villageTag: 'Bajpe', isHub: true },
      { id: 'stop-poj', name: 'Pojekallu Cross', latitude: 13.0150, longitude: 74.9250, sequence: 2, villageTag: 'Pojekallu' },
      { id: 'stop-mij', name: 'Mijar Alvas Engineering', latitude: 13.0480, longitude: 74.9650, sequence: 3, villageTag: 'Mijar' },
      { id: 'stop-mbd', name: 'Moodbidri Bus Terminus', latitude: 13.0722, longitude: 74.9961, sequence: 4, villageTag: 'Moodbidri', isHub: true }
    ],
    schedule: [
      { departureTime: '07:45', arrivalTime: '08:20', busId: 'bus-ka19-4501' },
      { departureTime: '08:35', arrivalTime: '09:10', busId: 'bus-ka19-4501' },
      { departureTime: '17:00', arrivalTime: '17:35', busId: 'bus-ka19-4501' }
    ]
  },
  {
    id: 'route-55s',
    routeNumber: '55S',
    routeName: 'Mulki to Surathkal (NITK Campus Express)',
    origin: 'Mulki',
    destination: 'Surathkal',
    via: ['Haleyangadi', 'Pavanje', 'Mukka'],
    distanceKm: 13.5,
    estimatedDurationMin: 25,
    fareRupees: 20,
    status: 'Active',
    stops: [
      { id: 'stop-mul', name: 'Mulki Town Bus Stand', latitude: 13.0906, longitude: 74.7937, sequence: 1, villageTag: 'Mulki', isHub: true },
      { id: 'stop-hal', name: 'Haleyangadi Grama Cross', latitude: 13.0580, longitude: 74.7940, sequence: 2, villageTag: 'Haleyangadi' },
      { id: 'stop-muk', name: 'Mukka Hospital / Srinivas College', latitude: 13.0280, longitude: 74.7950, sequence: 3, villageTag: 'Mukka' },
      { id: 'stop-nitk', name: 'NITK Surathkal Main Gate', latitude: 13.0076, longitude: 74.7946, sequence: 4, villageTag: 'Surathkal', isHub: true }
    ],
    schedule: [
      { departureTime: '07:30', arrivalTime: '07:55', busId: 'bus-ka19-5501' },
      { departureTime: '08:15', arrivalTime: '08:40', busId: 'bus-ka19-5502' },
      { departureTime: '16:30', arrivalTime: '16:55', busId: 'bus-ka19-5501' }
    ]
  },
  {
    id: 'route-60b',
    routeNumber: '60B',
    routeName: 'Bantwal to Vamanjoor (Canara & SJEC link)',
    origin: 'Bantwal',
    destination: 'Vamanjoor',
    via: ['Benjanapadavu (Canara Engg)', 'Farangipete', 'Polali Dwara'],
    distanceKm: 18.2,
    estimatedDurationMin: 38,
    fareRupees: 26,
    status: 'Active',
    stops: [
      { id: 'stop-btw', name: 'Bantwal BC Road Depot', latitude: 12.8931, longitude: 75.0352, sequence: 1, villageTag: 'Bantwal', isHub: true },
      { id: 'stop-can', name: 'Benjanapadavu Canara Engg', latitude: 12.8990, longitude: 74.9810, sequence: 2, villageTag: 'Benjanapadavu', isHub: true },
      { id: 'stop-far', name: 'Farangipete Rural Stop', latitude: 12.8780, longitude: 74.9350, sequence: 3, villageTag: 'Farangipete' },
      { id: 'stop-sjec', name: 'St. Joseph Engg College', latitude: 12.9197, longitude: 74.8967, sequence: 4, villageTag: 'Vamanjoor', isHub: true }
    ],
    schedule: [
      { departureTime: '07:40', arrivalTime: '08:18', busId: 'bus-ka19-6001' },
      { departureTime: '08:45', arrivalTime: '09:23', busId: 'bus-ka19-6001' },
      { departureTime: '17:00', arrivalTime: '17:38', busId: 'bus-ka19-6001' }
    ]
  }
];

export const INITIAL_BUSES: Bus[] = [
  {
    id: 'bus-ka19-1401',
    busNumber: 'KA-19-F-1401',
    operator: 'KSRTC Rural Gramina Sarige',
    routeId: 'route-14b',
    routeName: '14B (Kinnigoli → Moodbidri)',
    capacity: 52,
    availableSeats: 14,
    status: 'On Time',
    currentLat: 13.0720,
    currentLng: 74.8550,
    heading: 95,
    speedKmH: 42,
    lastUpdated: new Date().toISOString(),
    currentStopIndex: 2,
    delayMinutes: 0,
    driverName: 'Ramesh Shetty',
    driverPhone: '+91 98452 11001',
    isSimulatedGps: true
  },
  {
    id: 'bus-ka19-1402',
    busNumber: 'KA-19-F-1402',
    operator: 'KSRTC Rural Gramina Sarige',
    routeId: 'route-14b',
    routeName: '14B (Kinnigoli → Moodbidri Peak)',
    capacity: 52,
    availableSeats: 0,
    status: 'Delayed',
    currentLat: 13.0854,
    currentLng: 74.8722,
    heading: 110,
    speedKmH: 15,
    lastUpdated: new Date().toISOString(),
    currentStopIndex: 1,
    delayMinutes: 25,
    driverName: 'Suresh Naik',
    driverPhone: '+91 97410 99882',
    isSimulatedGps: true
  },
  {
    id: 'bus-ka19-2201',
    busNumber: 'KA-19-F-2201',
    operator: 'Dakshina Kannada District Sarige',
    routeId: 'route-22a',
    routeName: '22A (Gurupura → Vamanjoor)',
    capacity: 48,
    availableSeats: 0,
    status: 'Full Capacity',
    currentLat: 12.9370,
    currentLng: 74.9230,
    heading: 260,
    speedKmH: 38,
    lastUpdated: new Date().toISOString(),
    currentStopIndex: 2,
    delayMinutes: 5,
    driverName: 'Prakash Poojary',
    driverPhone: '+91 99012 33451',
    isSimulatedGps: true
  },
  {
    id: 'bus-ka19-3101',
    busNumber: 'KA-19-F-3101',
    operator: 'KSRTC Rural Feeder',
    routeId: 'route-31c',
    routeName: '31C (Kateel → Bajpe Hub)',
    capacity: 45,
    availableSeats: 22,
    status: 'Approaching Stop',
    currentLat: 13.0450,
    currentLng: 74.8580,
    heading: 160,
    speedKmH: 45,
    lastUpdated: new Date().toISOString(),
    currentStopIndex: 2,
    delayMinutes: 0,
    driverName: 'Gopal Devadiga',
    driverPhone: '+91 94812 44781',
    isSimulatedGps: true
  },
  {
    id: 'bus-ka19-4501',
    busNumber: 'KA-19-F-4501',
    operator: 'Moodbidri Janatha Shuttle',
    routeId: 'route-45f',
    routeName: '45F (Bajpe → Moodbidri)',
    capacity: 40,
    availableSeats: 18,
    status: 'On Time',
    currentLat: 13.0320,
    currentLng: 74.9450,
    heading: 45,
    speedKmH: 48,
    lastUpdated: new Date().toISOString(),
    currentStopIndex: 2,
    delayMinutes: 0,
    driverName: 'Sharath Kulal',
    driverPhone: '+91 96112 55990',
    isSimulatedGps: true
  },
  {
    id: 'bus-ka19-5501',
    busNumber: 'KA-19-F-5501',
    operator: 'Coastal Express Service',
    routeId: 'route-55s',
    routeName: '55S (Mulki → Surathkal NITK)',
    capacity: 55,
    availableSeats: 26,
    status: 'On Time',
    currentLat: 13.0420,
    currentLng: 74.7945,
    heading: 180,
    speedKmH: 52,
    lastUpdated: new Date().toISOString(),
    currentStopIndex: 2,
    delayMinutes: 0,
    driverName: 'Anand Mendon',
    driverPhone: '+91 97312 66012',
    isSimulatedGps: true
  },
  {
    id: 'bus-ka19-6001',
    busNumber: 'KA-19-F-6001',
    operator: 'Bantwal Taluk Rural Connect',
    routeId: 'route-60b',
    routeName: '60B (Bantwal → SJEC Vamanjoor)',
    capacity: 50,
    availableSeats: 19,
    status: 'On Time',
    currentLat: 12.8950,
    currentLng: 74.9700,
    heading: 310,
    speedKmH: 40,
    lastUpdated: new Date().toISOString(),
    currentStopIndex: 2,
    delayMinutes: 0,
    driverName: 'Mohammed Ashfaq',
    driverPhone: '+91 94491 77821',
    isSimulatedGps: true
  }
];

export const INITIAL_REQUESTS: TravelRequest[] = [
  {
    id: 'req-101',
    studentId: 'user-std-1',
    studentName: 'Ananya Rao',
    studentVillage: 'Kinnigoli',
    origin: 'Kinnigoli',
    destination: "Alva's College, Moodbidri",
    travelDate: '2026-11-13',
    departureWindow: '07:30 - 08:30',
    passengerCount: 1,
    status: 'PENDING',
    notes: 'Morning semester practical exam at 9:00 AM sharp.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'req-102',
    studentId: 'user-std-2',
    studentName: 'Praveen Kotian',
    studentVillage: 'Kinnigoli',
    origin: 'Kinnigoli',
    destination: "Alva's College, Moodbidri",
    travelDate: '2026-11-13',
    departureWindow: '07:30 - 08:30',
    passengerCount: 4,
    status: 'GROUPED',
    notes: 'Group of 4 B.Sc students stranded due to bus delay.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'req-103',
    studentId: 'user-std-3',
    studentName: 'Meghana Bhat',
    studentVillage: 'Kateel',
    origin: 'Kateel',
    destination: "Alva's College, Moodbidri",
    travelDate: '2026-11-13',
    departureWindow: '07:30 - 08:30',
    passengerCount: 7,
    status: 'GROUPED',
    notes: 'Kateel Cross pickup point. Regular bus 14B skipped.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'req-104',
    studentId: 'user-std-4',
    studentName: 'Karthik Prabhu',
    studentVillage: 'Gurupura',
    origin: 'Gurupura',
    destination: 'St. Joseph Engg College',
    travelDate: '2026-11-13',
    departureWindow: '08:00 - 08:45',
    passengerCount: 6,
    status: 'PENDING',
    notes: 'Bus 22A arriving overcrowded, unable to board.',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

export const INITIAL_REPORTS: TransportReport[] = [
  {
    id: 'rep-201',
    studentId: 'user-std-1',
    studentName: 'Ananya Rao',
    routeId: 'route-14b',
    routeName: '14B (Kinnigoli → Moodbidri)',
    busNumber: 'KA-19-F-1402',
    category: 'Bus cancelled',
    location: 'Kinnigoli Bus Stand',
    description: 'The 08:00 AM scheduled service KA-19-F-1402 was cancelled due to axle mechanical failure at depot. Over 25 students are waiting at Kinnigoli.',
    status: 'INVESTIGATING',
    adminNotes: 'Contacting Moodbidri depot master for spare shuttle.',
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },
  {
    id: 'rep-202',
    studentId: 'user-std-4',
    studentName: 'Karthik Prabhu',
    routeId: 'route-22a',
    routeName: '22A (Gurupura → Vamanjoor)',
    busNumber: 'KA-19-F-2201',
    category: 'Bus overcrowded',
    location: 'Gurupura Kaikamba Stop',
    description: 'Conductor closed doors without letting 12 students board because footboard was full of commuters.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString()
  },
  {
    id: 'rep-203',
    studentId: 'user-std-5',
    studentName: 'Deepak Salian',
    routeId: 'route-55s',
    routeName: '55S (Mulki → Surathkal)',
    busNumber: 'KA-19-F-5501',
    category: 'Bus skipped stop',
    location: 'Haleyangadi Grama Cross',
    description: 'Driver stayed on flyover and bypassed the Grama stop completely.',
    status: 'RESOLVED',
    adminNotes: 'Operator warned. Mandatory GPS geofence stop penalty logged.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    targetRole: 'all',
    title: 'Service Alert: Route 14B Delay',
    message: 'Bus KA-19-F-1402 from Kinnigoli is delayed by 25 mins. Alternative connecting options via Kateel have been activated in the Journey Planner.',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    actionUrl: '/alternatives'
  },
  {
    id: 'notif-2',
    targetRole: 'admin',
    title: 'High Student Demand Alert: Kinnigoli to Moodbidri',
    message: '18 students are requesting travel between 07:30 AM and 08:30 AM on Route 14B. Recommendation: Dispatch spare Mini-Bus from Bajpe.',
    type: 'alert',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    actionUrl: '/admin'
  },
  {
    id: 'notif-3',
    targetRole: 'student',
    title: 'Welcome to ROUTELESS',
    message: 'Every student deserves a way to reach their future. Your smart rural travel companion is active.',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];
