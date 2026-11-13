export type UserRole = 'student' | 'admin' | 'operator';

export type BusType = 'KSRTC Ordinary' | 'Express' | 'Private Route' | 'College Shuttle' | 'Shared Feeder';

export type BusStatus = 'On Time' | 'Delayed' | 'Approaching Stop' | 'Cancelled' | 'Full Capacity' | 'Out of Service';

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

export interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  sequence: number;
  distanceFromStartKm: number;
  villageTag?: string;
  isHub?: boolean;
}

export interface Bus {
  id: string;
  busNumber: string;
  busName: string;
  registrationNumber?: string;
  routeNumber?: string;
  busType: BusType;
  operator: string;
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  stops: string[];
  capacity: number;
  occupiedSeats?: number;
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
  
  // Real-time calculated fields
  nextStopName: string;
  distanceToNextStopKm: number;
  remainingDistanceKm: number;
  etaNextStop: string;
  etaDestination: string;
  fareRupees: number;
  scheduledDeparture: string;
  scheduledArrival: string;
  totalDistanceKm: number;
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
  operatingDays: string;
  busType: BusType;
  stops: BusStop[];
  associatedBusIds: string[];
  schedule: {
    departureTime: string;
    arrivalTime: string;
    busId: string;
    busNumber: string;
    busType: BusType;
    operator: string;
    fareRupees: number;
  }[];
}

export interface JourneyLeg {
  routeId: string;
  routeNumber: string;
  routeName: string;
  busId: string;
  busNumber: string;
  registrationNumber?: string;
  busType: BusType;
  busStatus: string;
  operator: string;
  fromStop: string;
  toStop: string;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  distanceKm: number;
  fareRupees: number;
  availableSeats: number;
  occupiedSeats?: number;
  capacity: number;
  intermediateStops: string[];
}

export interface OptimizedJourney {
  id: string;
  type: 'fastest' | 'fewest_transfers' | 'cheapest' | 'shortest_distance';
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  totalDurationMin: number;
  totalDistanceKm: number;
  totalFareRupees: number;
  transferCount: number;
  transfersAt: string[];
  waitingTimeMin: number;
  legs: JourneyLeg[];
  statusSummary: 'Optimal' | 'Delayed' | 'Full Capacity' | 'Cancelled';
  advisoryNote?: string;
  availableSeats: number;
  occupiedSeats?: number;
  totalSeats?: number;
  minAvailableSeatsInLegs: number;
  primaryBusType: BusType;
  primaryOperator: string;
  primaryBusNumber?: string;
  primaryRegistrationNumber?: string;
}

export interface TravelRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentVillage: string;
  origin: string;
  destination: string;
  travelDate: string;
  departureWindow: string;
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
  distanceKm: number;
  walkingDistanceMeters: number;
  walkingDurationMin: number;
  score: number;
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
