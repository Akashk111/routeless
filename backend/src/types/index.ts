export type UserRole = 'student' | 'admin' | 'operator';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone: string;
  village: string;
  institution?: string;
  avatar?: string;
  createdAt: string;
}

export type BusStatus = 'On Time' | 'Delayed' | 'Approaching Stop' | 'Cancelled' | 'Full Capacity' | 'Out of Service';

export interface Bus {
  id: string;
  busNumber: string;
  operator: string;
  routeId: string;
  routeName: string;
  capacity: number;
  availableSeats: number;
  status: BusStatus;
  currentLat: number;
  currentLng: number;
  heading: number;
  speedKmH: number;
  lastUpdated: string;
  currentStopIndex: number;
  delayMinutes: number;
  driverName?: string;
  driverPhone?: string;
  isSimulatedGps: boolean;
}

export interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sequence: number;
  villageTag?: string;
  isHub?: boolean;
}

export interface Route {
  id: string;
  routeNumber: string;
  routeName: string;
  origin: string;
  destination: string;
  via: string[];
  distanceKm: number;
  estimatedDurationMin: number;
  fareRupees: number;
  status: 'Active' | 'Disrupted' | 'Suspended';
  stops: BusStop[];
  schedule: {
    departureTime: string;
    arrivalTime: string;
    busId: string;
  }[];
}

export interface Trip {
  id: string;
  busId: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  tripStatus: 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed' | 'Cancelled';
  assignedDriver: string;
  occupancyPercent: number;
}

export interface TravelRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentVillage: string;
  origin: string;
  destination: string;
  travelDate: string;
  departureWindow: string; // e.g. "07:30 - 08:30"
  passengerCount: number;
  status: 'PENDING' | 'GROUPED' | 'ADDITIONAL_BUS_ASSIGNED' | 'REJECTED';
  notes?: string;
  createdAt: string;
}

export interface TransportReport {
  id: string;
  studentId: string;
  studentName: string;
  routeId?: string;
  routeName?: string;
  busNumber?: string;
  category: 'Bus not arrived' | 'Bus cancelled' | 'Bus overcrowded' | 'Bus skipped stop' | 'Route disruption' | 'Safety concern' | 'Other';
  location: string;
  description: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED';
  adminNotes?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  targetRole?: UserRole | 'all';
  targetUserId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface AlternativeOption {
  id: string;
  type: 'connecting_bus' | 'nearby_village_bus' | 'shared_rural_feeder' | 'community_pool';
  title: string;
  description: string;
  origin: string;
  destination: string;
  intermediateHub?: string;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  fareRupees: number;
  walkingDistanceMeters: number;
  walkingDurationMin: number;
  score: number; // 0 - 100
  scoreBreakdown: {
    timeScore: number;
    costScore: number;
    convenienceScore: number;
    reliabilityScore: number;
  };
  whyRecommended: string;
  steps: {
    type: 'walk' | 'bus' | 'shared_auto';
    from: string;
    to: string;
    detail: string;
    durationMin: number;
    distanceText?: string;
  }[];
  isSimulatedEstimate: boolean;
}
