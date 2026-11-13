import { User, Bus, Route, TravelRequest, TransportReport, AppNotification, BusStop, Trip, PassengerRecord } from '../types/index.js';
import {
  INITIAL_USERS,
  INITIAL_BUSES,
  INITIAL_ROUTES,
  INITIAL_REQUESTS,
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS,
  ALL_BUS_STOPS,
  INITIAL_TRIPS,
  INITIAL_PASSENGERS
} from './initialData.js';

class DataStore {
  users: User[] = [];
  buses: Bus[] = [];
  routes: Route[] = [];
  stops: BusStop[] = [];
  trips: Trip[] = [];
  passengers: PassengerRecord[] = [];
  requests: TravelRequest[] = [];
  reports: TransportReport[] = [];
  notifications: AppNotification[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.buses = JSON.parse(JSON.stringify(INITIAL_BUSES));
    this.routes = JSON.parse(JSON.stringify(INITIAL_ROUTES));
    this.stops = JSON.parse(JSON.stringify(ALL_BUS_STOPS));
    this.trips = JSON.parse(JSON.stringify(INITIAL_TRIPS));
    this.passengers = JSON.parse(JSON.stringify(INITIAL_PASSENGERS));
    this.requests = JSON.parse(JSON.stringify(INITIAL_REQUESTS));
    this.reports = JSON.parse(JSON.stringify(INITIAL_REPORTS));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
  }

  // Stops
  getStops() { return this.stops; }
  getStopById(id: string) { return this.stops.find(s => s.id === id); }

  // Trips
  getTrips(routeId?: string) {
    if (routeId && routeId !== 'all') {
      return this.trips.filter(t => t.routeId === routeId);
    }
    return this.trips;
  }
  getTripById(id: string) { return this.trips.find(t => t.id === id); }

  // Passengers
  getPassengers(tripId?: string) {
    if (tripId && tripId !== 'all') {
      return this.passengers.filter(p => p.tripId === tripId);
    }
    return this.passengers;
  }

  // Buses
  getBuses() { return this.buses; }
  getBusById(id: string) { return this.buses.find(b => b.id === id); }
  getBusLocation(id: string) {
    const bus = this.buses.find(b => b.id === id || b.busNumber === id || b.registrationNumber === id);
    if (!bus) return null;
    return {
      busId: bus.id,
      busNumber: bus.busNumber,
      registrationNumber: bus.registrationNumber,
      routeName: bus.routeName,
      routeNumber: bus.routeNumber,
      latitude: bus.currentLat,
      longitude: bus.currentLng,
      speedKmH: bus.speedKmH,
      heading: bus.heading,
      status: bus.status,
      nextStop: bus.nextStopName,
      distanceToNextStopKm: bus.distanceToNextStopKm,
      remainingDistanceKm: bus.remainingDistanceKm,
      etaNextStop: bus.etaNextStop,
      etaDestination: bus.etaDestination,
      lastUpdated: bus.lastUpdated,
      isSimulatedGps: bus.isSimulatedGps ?? true,
      label: bus.isSimulatedGps ? 'DEMO GPS SIMULATOR' : 'HARDWARE GPS'
    };
  }
  updateBus(id: string, updates: Partial<Bus>) {
    const idx = this.buses.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.buses[idx] = { ...this.buses[idx], ...updates, lastUpdated: new Date().toISOString() };
      return this.buses[idx];
    }
    return null;
  }
  addBus(bus: Bus) {
    this.buses.push(bus);
    return bus;
  }
  deleteBus(id: string) {
    const idx = this.buses.findIndex(b => b.id === id);
    if (idx !== -1) {
      return this.buses.splice(idx, 1)[0];
    }
    return null;
  }

  // Routes
  getRoutes() { return this.routes; }
  getRouteById(id: string) { return this.routes.find(r => r.id === id); }
  updateRoute(id: string, updates: Partial<Route>) {
    const idx = this.routes.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.routes[idx] = { ...this.routes[idx], ...updates };
      return this.routes[idx];
    }
    return null;
  }
  addRoute(route: Route) {
    this.routes.push(route);
    return route;
  }
  deleteRoute(id: string) {
    const idx = this.routes.findIndex(r => r.id === id);
    if (idx !== -1) {
      return this.routes.splice(idx, 1)[0];
    }
    return null;
  }

  // Requests
  getRequests() { return this.requests; }
  addRequest(req: TravelRequest) {
    this.requests.unshift(req);
    // Add admin alert notification
    this.addNotification({
      id: `notif-${Date.now()}`,
      targetRole: 'admin',
      title: `New Student Travel Request: ${req.origin} → ${req.destination}`,
      message: `${req.studentName} requested travel for ${req.passengerCount} passengers (${req.departureWindow}).`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/admin'
    });
    return req;
  }
  updateRequestStatus(id: string, status: TravelRequest['status']) {
    const req = this.requests.find(r => r.id === id);
    if (req) {
      req.status = status;
      return req;
    }
    return null;
  }

  // Reports
  getReports() { return this.reports; }
  addReport(report: TransportReport) {
    this.reports.unshift(report);
    // Add alert notification
    this.addNotification({
      id: `notif-rep-${Date.now()}`,
      targetRole: 'all',
      title: `Transport Issue Reported: ${report.category}`,
      message: `${report.location}: ${report.description.substring(0, 80)}...`,
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/reports'
    });
    return report;
  }
  updateReportStatus(id: string, status: TransportReport['status'], adminNotes?: string) {
    const rep = this.reports.find(r => r.id === id);
    if (rep) {
      rep.status = status;
      if (adminNotes !== undefined) rep.adminNotes = adminNotes;
      return rep;
    }
    return null;
  }

  // Notifications
  getNotifications(role?: string) {
    if (!role || role === 'all') return this.notifications;
    return this.notifications.filter(n => n.targetRole === 'all' || n.targetRole === role);
  }
  markNotificationRead(id: string) {
    const n = this.notifications.find(item => item.id === id);
    if (n) n.read = true;
    return n;
  }
  addNotification(n: AppNotification) {
    this.notifications.unshift(n);
    return n;
  }

  // Users
  getUsers() { return this.users; }
  getUserByEmail(email: string) { return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  getUserById(id: string) { return this.users.find(u => u.id === id); }
  addUser(user: User) {
    this.users.push(user);
    return user;
  }
}

export const store = new DataStore();
