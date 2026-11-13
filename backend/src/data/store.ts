import { User, Bus, Route, TravelRequest, TransportReport, AppNotification, BusStop, Trip, PassengerRecord } from '../types/index.js';
import { db, Booking } from '../db/database.js';

class DataStore {
  // Database Delegation
  getBuses(): Bus[] { return db.getBuses(); }
  getBusById(id: string): Bus | null { return db.getBusById(id); }
  addBus(bus: Bus): Bus { return db.addBus(bus); }
  updateBus(id: string, updates: Partial<Bus>): Bus | null { return db.updateBus(id, updates); }
  deleteBus(id: string): boolean { return db.deleteBus(id); }

  getRoutes(): Route[] { return db.getRoutes(); }
  getRouteById(id: string): Route | null { return db.getRouteById(id); }
  addRoute(route: Route): Route { return db.addRoute(route); }
  updateRoute(id: string, updates: Partial<Route>): Route | null { return db.updateRoute(id, updates); }
  deleteRoute(id: string): boolean { return db.deleteRoute(id); }

  getStops(query?: string): BusStop[] { return db.getStops(query); }
  getStopById(id: string): BusStop | null { return db.getStopById(id); }

  getTrips(routeId?: string): Trip[] { return db.getTrips(routeId); }
  getTripById(id: string): Trip | null { return db.getTripById(id); }

  getPassengers(tripId?: string): PassengerRecord[] { return db.getPassengers(tripId); }

  getBookings(studentId?: string): Booking[] { return db.getBookings(studentId); }
  createBooking(data: {
    tripId: string;
    busId?: string;
    fromStop: string;
    toStop: string;
    departureTime: string;
    arrivalTime: string;
    travelDate: string;
    studentId: string;
    passengerName: string;
    farePaid?: number;
  }) {
    return db.createBooking(data);
  }
  cancelBooking(bookingId: string) { return db.cancelBooking(bookingId); }

  getRequests(): TravelRequest[] { return db.getRequests(); }
  addRequest(req: TravelRequest): TravelRequest { return db.addRequest(req); }
  updateRequestStatus(id: string, status: TravelRequest['status']): boolean { return db.updateRequestStatus(id, status); }

  getReports(): TransportReport[] { return db.getReports(); }
  addReport(rep: TransportReport): TransportReport { return db.addReport(rep); }
  updateReportStatus(id: string, status: TransportReport['status'], notes?: string): boolean { return db.updateReportStatus(id, status, notes); }

  getNotifications(role?: string): AppNotification[] { return db.getNotifications(role); }
  addNotification(n: AppNotification): AppNotification { return db.addNotification(n); }
  markNotificationRead(id: string): boolean { return db.markNotificationRead(id); }

  getUsers(): User[] { return db.getUsers(); }
  getUserByEmail(email: string): User | null { return db.getUserByEmail(email); }
  getUserById(id: string): User | null { return db.getUserById(id); }
  addUser(user: User): User { return db.addUser(user); }

  getBusLocation(id: string) { return db.getBusLocation(id); }
}

export const store = new DataStore();
export { db };
