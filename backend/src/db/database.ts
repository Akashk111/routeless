import { DatabaseSync, SQLInputValue, SQLOutputValue } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import {
  User,
  Bus,
  Route,
  BusStop,
  Trip,
  PassengerRecord,
  TravelRequest,
  TransportReport,
  AppNotification
} from '../types/index.js';
import {
  INITIAL_USERS,
  INITIAL_BUSES,
  INITIAL_ROUTES,
  ALL_BUS_STOPS,
  INITIAL_TRIPS,
  INITIAL_PASSENGERS,
  INITIAL_REQUESTS,
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS
} from '../data/initialData.js';

export interface Booking {
  id: string;
  bookingReference: string;
  tripId: string;
  busId: string;
  busNumber: string;
  registrationNumber: string;
  routeNumber: string;
  fromStop: string;
  toStop: string;
  departureTime: string;
  arrivalTime: string;
  travelDate: string;
  studentId: string;
  passengerName: string;
  seatNumber: number;
  farePaid: number;
  status: 'CONFIRMED' | 'CANCELLED';
  bookedAt: string;
}

// Type-safe row mapping functions for node:sqlite output
function mapPassengerRow(row: Record<string, SQLOutputValue>): PassengerRecord {
  return {
    id: String(row.id ?? ''),
    tripId: String(row.tripId ?? ''),
    busNumber: String(row.busNumber ?? ''),
    studentId: String(row.studentId ?? ''),
    studentName: String(row.studentName ?? ''),
    seatNumber: Number(row.seatNumber ?? 0),
    boardingStop: String(row.boardingStop ?? ''),
    destinationStop: String(row.destinationStop ?? ''),
    farePaid: Number(row.farePaid ?? 0),
    bookingDate: String(row.bookingDate ?? ''),
    status: (row.status as PassengerRecord['status']) || 'CONFIRMED'
  };
}

function mapBookingRow(row: Record<string, SQLOutputValue>): Booking {
  return {
    id: String(row.id ?? ''),
    bookingReference: String(row.bookingReference ?? ''),
    tripId: String(row.tripId ?? ''),
    busId: String(row.busId ?? ''),
    busNumber: String(row.busNumber ?? ''),
    registrationNumber: String(row.registrationNumber ?? ''),
    routeNumber: String(row.routeNumber ?? ''),
    fromStop: String(row.fromStop ?? ''),
    toStop: String(row.toStop ?? ''),
    departureTime: String(row.departureTime ?? ''),
    arrivalTime: String(row.arrivalTime ?? ''),
    travelDate: String(row.travelDate ?? ''),
    studentId: String(row.studentId ?? ''),
    passengerName: String(row.passengerName ?? ''),
    seatNumber: Number(row.seatNumber ?? 0),
    farePaid: Number(row.farePaid ?? 0),
    status: (row.status as Booking['status']) || 'CONFIRMED',
    bookedAt: String(row.bookedAt ?? '')
  };
}

function mapRequestRow(row: Record<string, SQLOutputValue>): TravelRequest {
  return {
    id: String(row.id ?? ''),
    studentId: String(row.studentId ?? ''),
    studentName: String(row.studentName ?? ''),
    studentVillage: String(row.studentVillage ?? ''),
    origin: String(row.origin ?? ''),
    destination: String(row.destination ?? ''),
    travelDate: String(row.travelDate ?? ''),
    departureWindow: String(row.departureWindow ?? ''),
    passengerCount: Number(row.passengerCount ?? 1),
    status: (row.status as TravelRequest['status']) || 'PENDING',
    notes: row.notes != null ? String(row.notes) : undefined,
    createdAt: String(row.createdAt ?? '')
  };
}

function mapReportRow(row: Record<string, SQLOutputValue>): TransportReport {
  return {
    id: String(row.id ?? ''),
    studentId: String(row.studentId ?? ''),
    studentName: String(row.studentName ?? ''),
    routeId: row.routeId != null ? String(row.routeId) : undefined,
    routeName: row.routeName != null ? String(row.routeName) : undefined,
    busNumber: row.busNumber != null ? String(row.busNumber) : undefined,
    category: (row.category as TransportReport['category']) || 'Other',
    location: String(row.location ?? ''),
    description: String(row.description ?? ''),
    status: (row.status as TransportReport['status']) || 'PENDING',
    adminNotes: row.adminNotes != null ? String(row.adminNotes) : undefined,
    createdAt: String(row.createdAt ?? '')
  };
}

class SQLiteDatabase {
  private db: DatabaseSync;

  constructor() {
    const dbDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'routeless.sqlite');
    this.db = new DatabaseSync(dbPath);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 5000;
    `);
    this.initTables();
    this.seedIfEmpty();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        role TEXT,
        village TEXT,
        institution TEXT,
        phone TEXT,
        studentId TEXT,
        studentPassActive INTEGER DEFAULT 1,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS stops (
        id TEXT PRIMARY KEY,
        name TEXT,
        latitude REAL,
        longitude REAL,
        sequence INTEGER,
        distanceFromStartKm REAL,
        villageTag TEXT,
        aliases_json TEXT,
        isHub INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS routes (
        id TEXT PRIMARY KEY,
        routeNumber TEXT,
        routeName TEXT,
        origin TEXT,
        destination TEXT,
        via_json TEXT,
        distanceKm REAL,
        estimatedDurationMin INTEGER,
        fareRupees REAL,
        status TEXT,
        operatingDays TEXT,
        busType TEXT,
        stops_json TEXT,
        associatedBusIds_json TEXT,
        schedule_json TEXT
      );

      CREATE TABLE IF NOT EXISTS buses (
        id TEXT PRIMARY KEY,
        busNumber TEXT,
        registrationNumber TEXT,
        busName TEXT,
        busType TEXT,
        operator TEXT,
        routeId TEXT,
        routeName TEXT,
        origin TEXT,
        destination TEXT,
        capacity INTEGER,
        occupiedSeats INTEGER,
        availableSeats INTEGER,
        fareRupees REAL,
        status TEXT,
        currentLat REAL,
        currentLng REAL,
        heading REAL,
        speedKmH REAL,
        lastUpdated TEXT,
        currentStopIndex INTEGER,
        delayMinutes INTEGER,
        nextStopName TEXT,
        distanceToNextStopKm REAL,
        remainingDistanceKm REAL,
        etaNextStop TEXT,
        etaDestination TEXT,
        driverName TEXT,
        driverPhone TEXT,
        isSimulatedGps INTEGER DEFAULT 1,
        imageUrl TEXT,
        stops_json TEXT
      );

      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        tripNumber TEXT,
        routeId TEXT,
        routeNumber TEXT,
        routeName TEXT,
        busId TEXT,
        busNumber TEXT,
        registrationNumber TEXT,
        operator TEXT,
        busType TEXT,
        origin TEXT,
        destination TEXT,
        departureTime TEXT,
        arrivalTime TEXT,
        durationMin INTEGER,
        totalDistanceKm REAL,
        fareRupees REAL,
        capacity INTEGER,
        occupiedSeats INTEGER,
        availableSeats INTEGER,
        status TEXT,
        operatingDays TEXT,
        stops_json TEXT,
        imageUrl TEXT
      );

      CREATE TABLE IF NOT EXISTS passengers (
        id TEXT PRIMARY KEY,
        tripId TEXT,
        busNumber TEXT,
        studentId TEXT,
        studentName TEXT,
        seatNumber INTEGER,
        boardingStop TEXT,
        destinationStop TEXT,
        farePaid REAL,
        bookingDate TEXT,
        status TEXT
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        bookingReference TEXT UNIQUE,
        tripId TEXT,
        busId TEXT,
        busNumber TEXT,
        registrationNumber TEXT,
        routeNumber TEXT,
        fromStop TEXT,
        toStop TEXT,
        departureTime TEXT,
        arrivalTime TEXT,
        travelDate TEXT,
        studentId TEXT,
        passengerName TEXT,
        seatNumber INTEGER,
        farePaid REAL,
        status TEXT,
        bookedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        studentId TEXT,
        studentName TEXT,
        studentVillage TEXT,
        origin TEXT,
        destination TEXT,
        travelDate TEXT,
        departureWindow TEXT,
        passengerCount INTEGER,
        status TEXT,
        notes TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        studentId TEXT,
        studentName TEXT,
        routeId TEXT,
        routeName TEXT,
        busNumber TEXT,
        category TEXT,
        location TEXT,
        description TEXT,
        status TEXT,
        adminNotes TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        targetRole TEXT,
        title TEXT,
        message TEXT,
        type TEXT,
        read INTEGER DEFAULT 0,
        createdAt TEXT,
        actionUrl TEXT
      );
    `);
  }

  public reseed() {
    console.log('🔄 Reseeding SQLite Persistent Database with latest ROUTELESS transport network...');
    this.db.exec(`
      DELETE FROM notifications;
      DELETE FROM reports;
      DELETE FROM requests;
      DELETE FROM passengers;
      DELETE FROM trips;
      DELETE FROM buses;
      DELETE FROM routes;
      DELETE FROM stops;
      DELETE FROM users;
    `);
    this.seedAll();
  }

  private seedIfEmpty() {
    const busCountRow = this.db.prepare('SELECT COUNT(*) as c FROM buses').get() as { c: number };
    const routeCountRow = this.db.prepare('SELECT COUNT(*) as c FROM routes').get() as { c: number };
    if (busCountRow && busCountRow.c >= INITIAL_BUSES.length && routeCountRow && routeCountRow.c >= INITIAL_ROUTES.length) {
      return; // Already populated and up-to-date
    }
    this.reseed();
  }

  private seedAll() {
    console.log('📦 Seeding SQLite Persistent Database with ROUTELESS transport network...');

    // Users
    const insertUser = this.db.prepare(`
      INSERT OR REPLACE INTO users (id, email, password, name, role, village, institution, phone, studentId, studentPassActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const u of INITIAL_USERS) {
      insertUser.run(
        u.id,
        u.email,
        u.password || 'password123',
        u.name,
        u.role,
        u.village || null,
        u.institution || null,
        u.phone || null,
        u.studentId || null,
        u.studentPassActive ? 1 : 0,
        new Date().toISOString()
      );
    }

    // Stops
    const insertStop = this.db.prepare(`
      INSERT OR REPLACE INTO stops (id, name, latitude, longitude, sequence, distanceFromStartKm, villageTag, aliases_json, isHub)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of ALL_BUS_STOPS) {
      insertStop.run(
        s.id,
        s.name,
        s.latitude,
        s.longitude,
        s.sequence,
        s.distanceFromStartKm,
        s.villageTag || null,
        JSON.stringify(s.aliases || []),
        s.isHub ? 1 : 0
      );
    }

    // Routes
    const insertRoute = this.db.prepare(`
      INSERT OR REPLACE INTO routes (
        id, routeNumber, routeName, origin, destination, via_json, distanceKm,
        estimatedDurationMin, fareRupees, status, operatingDays, busType, stops_json,
        associatedBusIds_json, schedule_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const r of INITIAL_ROUTES) {
      insertRoute.run(
        r.id,
        r.routeNumber,
        r.routeName,
        r.origin,
        r.destination,
        JSON.stringify(r.via || []),
        r.distanceKm,
        r.estimatedDurationMin,
        r.fareRupees,
        r.status,
        r.operatingDays,
        r.busType,
        JSON.stringify(r.stops || []),
        JSON.stringify(r.associatedBusIds || []),
        JSON.stringify(r.schedule || [])
      );
    }

    // Buses
    const insertBus = this.db.prepare(`
      INSERT OR REPLACE INTO buses (
        id, busNumber, registrationNumber, busName, busType, operator, routeId, routeName,
        origin, destination, capacity, occupiedSeats, availableSeats, fareRupees, status,
        currentLat, currentLng, heading, speedKmH, lastUpdated, currentStopIndex, delayMinutes,
        nextStopName, distanceToNextStopKm, remainingDistanceKm, etaNextStop, etaDestination,
        driverName, driverPhone, isSimulatedGps, imageUrl, stops_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const b of INITIAL_BUSES) {
      insertBus.run(
        b.id,
        b.busNumber,
        b.registrationNumber || 'KA-19-F-1401',
        b.busName,
        b.busType,
        b.operator,
        b.routeId,
        b.routeName,
        b.origin,
        b.destination,
        b.capacity,
        b.occupiedSeats || (b.capacity - b.availableSeats),
        b.availableSeats,
        b.fareRupees,
        b.status,
        b.currentLat,
        b.currentLng,
        b.heading,
        b.speedKmH,
        b.lastUpdated,
        b.currentStopIndex,
        b.delayMinutes,
        b.nextStopName,
        b.distanceToNextStopKm,
        b.remainingDistanceKm,
        b.etaNextStop,
        b.etaDestination,
        b.driverName || 'Depot Driver',
        b.driverPhone || '+91 94808 00000',
        b.isSimulatedGps ? 1 : 0,
        b.imageUrl || '/images/buses/ksrtc-ordinary.svg',
        JSON.stringify(b.stops || [])
      );
    }

    // Trips
    const insertTrip = this.db.prepare(`
      INSERT OR REPLACE INTO trips (
        id, tripNumber, routeId, routeNumber, routeName, busId, busNumber, registrationNumber,
        operator, busType, origin, destination, departureTime, arrivalTime, durationMin,
        totalDistanceKm, fareRupees, capacity, occupiedSeats, availableSeats, status,
        operatingDays, stops_json, imageUrl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of INITIAL_TRIPS) {
      insertTrip.run(
        t.id,
        t.tripNumber,
        t.routeId,
        t.routeNumber,
        t.routeName,
        t.busId,
        t.busNumber,
        t.registrationNumber,
        t.operator,
        t.busType,
        t.origin,
        t.destination,
        t.departureTime,
        t.arrivalTime,
        t.durationMin,
        t.totalDistanceKm,
        t.fareRupees,
        t.capacity,
        t.occupiedSeats,
        t.availableSeats,
        t.status,
        t.operatingDays,
        JSON.stringify(t.stops || []),
        t.imageUrl || '/images/buses/ksrtc-ordinary.svg'
      );
    }

    // Passengers
    const insertPassenger = this.db.prepare(`
      INSERT OR REPLACE INTO passengers (
        id, tripId, busNumber, studentId, studentName, seatNumber, boardingStop,
        destinationStop, farePaid, bookingDate, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of INITIAL_PASSENGERS) {
      insertPassenger.run(
        p.id,
        p.tripId,
        p.busNumber,
        p.studentId,
        p.studentName,
        p.seatNumber,
        p.boardingStop,
        p.destinationStop,
        p.farePaid,
        p.bookingDate,
        p.status
      );
    }

    // Requests
    const insertRequest = this.db.prepare(`
      INSERT OR REPLACE INTO requests (
        id, studentId, studentName, studentVillage, origin, destination,
        travelDate, departureWindow, passengerCount, status, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const req of INITIAL_REQUESTS) {
      insertRequest.run(
        req.id,
        req.studentId,
        req.studentName,
        req.studentVillage,
        req.origin,
        req.destination,
        req.travelDate,
        req.departureWindow,
        req.passengerCount,
        req.status,
        req.notes || null,
        req.createdAt
      );
    }

    // Reports
    const insertReport = this.db.prepare(`
      INSERT OR REPLACE INTO reports (
        id, studentId, studentName, routeId, routeName, busNumber,
        category, location, description, status, adminNotes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const rep of INITIAL_REPORTS) {
      insertReport.run(
        rep.id,
        rep.studentId,
        rep.studentName,
        rep.routeId || null,
        rep.routeName || null,
        rep.busNumber || null,
        rep.category,
        rep.location,
        rep.description,
        rep.status,
        rep.adminNotes || null,
        rep.createdAt
      );
    }

    // Notifications
    const insertNotif = this.db.prepare(`
      INSERT OR REPLACE INTO notifications (
        id, targetRole, title, message, type, read, createdAt, actionUrl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const n of INITIAL_NOTIFICATIONS) {
      insertNotif.run(
        n.id,
        n.targetRole ?? null,
        n.title,
        n.message,
        n.type,
        n.read ? 1 : 0,
        n.createdAt,
        n.actionUrl ?? null
      );
    }

    console.log('✅ SQLite Database successfully seeded with 32 buses, 20 routes, 56 stops, 40+ trips, and 105 passenger records!');
  }

  // ==========================================
  // BUSES
  // ==========================================
  getBuses(): Bus[] {
    const rows = this.db.prepare('SELECT * FROM buses').all() as any[];
    return rows.map(r => ({
      ...r,
      isSimulatedGps: Boolean(r.isSimulatedGps),
      stops: r.stops_json ? JSON.parse(r.stops_json) : []
    }));
  }

  getBusById(id: string): Bus | null {
    const r = this.db.prepare('SELECT * FROM buses WHERE id = ? OR busNumber = ?').get(id, id) as any;
    if (!r) return null;
    return {
      ...r,
      isSimulatedGps: Boolean(r.isSimulatedGps),
      stops: r.stops_json ? JSON.parse(r.stops_json) : []
    };
  }

  addBus(bus: Bus): Bus {
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO buses (
        id, busNumber, registrationNumber, busName, busType, operator, routeId, routeName,
        origin, destination, capacity, occupiedSeats, availableSeats, fareRupees, status,
        currentLat, currentLng, heading, speedKmH, lastUpdated, currentStopIndex, delayMinutes,
        nextStopName, distanceToNextStopKm, remainingDistanceKm, etaNextStop, etaDestination,
        driverName, driverPhone, isSimulatedGps, imageUrl, stops_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      bus.id,
      bus.busNumber,
      bus.registrationNumber || 'KA-19-F-1401',
      bus.busName,
      bus.busType,
      bus.operator,
      bus.routeId,
      bus.routeName,
      bus.origin,
      bus.destination,
      bus.capacity,
      bus.occupiedSeats ?? 0,
      bus.availableSeats,
      bus.fareRupees,
      bus.status,
      bus.currentLat,
      bus.currentLng,
      bus.heading,
      bus.speedKmH,
      bus.lastUpdated || new Date().toISOString(),
      bus.currentStopIndex || 0,
      bus.delayMinutes || 0,
      bus.nextStopName,
      bus.distanceToNextStopKm,
      bus.remainingDistanceKm,
      bus.etaNextStop,
      bus.etaDestination,
      bus.driverName || 'Depot Driver',
      bus.driverPhone || '+91 94808 00000',
      bus.isSimulatedGps ? 1 : 0,
      bus.imageUrl || '/images/buses/ksrtc-ordinary.svg',
      JSON.stringify(bus.stops || [])
    );

    // Also insert a default scheduled trip so this newly added bus shows up immediately in Journey Search!
    const tripId = `trip-${bus.id}`;
    const insertTrip = this.db.prepare(`
      INSERT OR REPLACE INTO trips (
        id, tripNumber, routeId, routeNumber, routeName, busId, busNumber, registrationNumber,
        operator, busType, origin, destination, departureTime, arrivalTime, durationMin,
        totalDistanceKm, fareRupees, capacity, occupiedSeats, availableSeats, status,
        operatingDays, stops_json, imageUrl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertTrip.run(
      tripId,
      `TRIP-${bus.busNumber}`,
      bus.routeId,
      bus.busNumber.replace(/[^0-9]/g, '') || '10',
      bus.routeName,
      bus.id,
      bus.busNumber,
      bus.registrationNumber || 'KA-19-F-1401',
      bus.operator,
      bus.busType,
      bus.origin,
      bus.destination,
      bus.scheduledDeparture || '07:30',
      bus.scheduledArrival || '08:45',
      45,
      bus.totalDistanceKm || 28,
      bus.fareRupees || 30,
      bus.capacity,
      bus.occupiedSeats ?? 0,
      bus.availableSeats,
      bus.status,
      'Daily',
      JSON.stringify(bus.stops || []),
      bus.imageUrl || '/images/buses/ksrtc-ordinary.svg'
    );

    return bus;
  }

  updateBus(id: string, updates: Partial<Bus>): Bus | null {
    const existing = this.getBusById(id);
    if (!existing) return null;

    const merged = { ...existing, ...updates, lastUpdated: new Date().toISOString() };
    const update = this.db.prepare(`
      UPDATE buses SET
        busNumber = ?, registrationNumber = ?, busName = ?, busType = ?, operator = ?,
        routeId = ?, routeName = ?, origin = ?, destination = ?, capacity = ?,
        occupiedSeats = ?, availableSeats = ?, fareRupees = ?, status = ?,
        currentLat = ?, currentLng = ?, heading = ?, speedKmH = ?, lastUpdated = ?,
        currentStopIndex = ?, delayMinutes = ?, nextStopName = ?, distanceToNextStopKm = ?,
        remainingDistanceKm = ?, etaNextStop = ?, etaDestination = ?, driverName = ?,
        driverPhone = ?, isSimulatedGps = ?, imageUrl = ?, stops_json = ?
      WHERE id = ?
    `);

    update.run(
      merged.busNumber,
      merged.registrationNumber || '',
      merged.busName || '',
      merged.busType || 'KSRTC Ordinary',
      merged.operator || '',
      merged.routeId || '',
      merged.routeName || '',
      merged.origin || '',
      merged.destination || '',
      merged.capacity ?? 50,
      merged.occupiedSeats ?? 0,
      merged.availableSeats ?? 50,
      merged.fareRupees ?? 30,
      merged.status || 'On Time',
      merged.currentLat ?? 0,
      merged.currentLng ?? 0,
      merged.heading ?? 0,
      merged.speedKmH ?? 0,
      merged.lastUpdated,
      merged.currentStopIndex ?? 0,
      merged.delayMinutes ?? 0,
      merged.nextStopName || '',
      merged.distanceToNextStopKm ?? 0,
      merged.remainingDistanceKm ?? 0,
      merged.etaNextStop || '',
      merged.etaDestination || '',
      merged.driverName ?? null,
      merged.driverPhone ?? null,
      merged.isSimulatedGps ? 1 : 0,
      merged.imageUrl ?? null,
      JSON.stringify(merged.stops || []),
      id
    );

    // If status changed (e.g. Cancelled), also update associated trips
    if (updates.status) {
      this.db.prepare('UPDATE trips SET status = ? WHERE busId = ?').run(updates.status, id);
    }
    if (updates.availableSeats !== undefined || updates.occupiedSeats !== undefined) {
      this.db.prepare('UPDATE trips SET availableSeats = ?, occupiedSeats = ? WHERE busId = ?').run(
        merged.availableSeats,
        merged.occupiedSeats,
        id
      );
    }

    return merged;
  }

  deleteBus(id: string): boolean {
    const res = this.db.prepare('DELETE FROM buses WHERE id = ?').run(id);
    this.db.prepare('DELETE FROM trips WHERE busId = ?').run(id);
    return res.changes > 0;
  }

  // ==========================================
  // ROUTES & STOPS
  // ==========================================
  getRoutes(): Route[] {
    const rows = this.db.prepare('SELECT * FROM routes').all() as any[];
    return rows.map(r => ({
      ...r,
      via: r.via_json ? JSON.parse(r.via_json) : [],
      stops: r.stops_json ? JSON.parse(r.stops_json) : [],
      associatedBusIds: r.associatedBusIds_json ? JSON.parse(r.associatedBusIds_json) : [],
      schedule: r.schedule_json ? JSON.parse(r.schedule_json) : []
    }));
  }

  getRouteById(id: string): Route | null {
    const r = this.db.prepare('SELECT * FROM routes WHERE id = ?').get(id) as any;
    if (!r) return null;
    return {
      ...r,
      via: r.via_json ? JSON.parse(r.via_json) : [],
      stops: r.stops_json ? JSON.parse(r.stops_json) : [],
      associatedBusIds: r.associatedBusIds_json ? JSON.parse(r.associatedBusIds_json) : [],
      schedule: r.schedule_json ? JSON.parse(r.schedule_json) : []
    };
  }

  addRoute(route: Route): Route {
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO routes (
        id, routeNumber, routeName, origin, destination, via_json, distanceKm,
        estimatedDurationMin, fareRupees, status, operatingDays, busType, stops_json,
        associatedBusIds_json, schedule_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      route.id,
      route.routeNumber,
      route.routeName,
      route.origin,
      route.destination,
      JSON.stringify(route.via || []),
      route.distanceKm,
      route.estimatedDurationMin,
      route.fareRupees,
      route.status,
      route.operatingDays,
      route.busType,
      JSON.stringify(route.stops || []),
      JSON.stringify(route.associatedBusIds || []),
      JSON.stringify(route.schedule || [])
    );
    return route;
  }

  updateRoute(id: string, updates: Partial<Route>): Route | null {
    const existing = this.getRouteById(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    this.addRoute(merged);
    return merged;
  }

  deleteRoute(id: string): boolean {
    const res = this.db.prepare('DELETE FROM routes WHERE id = ?').run(id);
    return res.changes > 0;
  }

  getStops(query?: string): BusStop[] {
    let sql = 'SELECT * FROM stops';
    const params: any[] = [];
    if (query) {
      sql += ' WHERE name LIKE ? OR villageTag LIKE ?';
      params.push(`%${query}%`, `%${query}%`);
    }
    sql += ' ORDER BY sequence ASC';
    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map(s => ({
      ...s,
      aliases: s.aliases_json ? JSON.parse(s.aliases_json) : [],
      isHub: Boolean(s.isHub)
    }));
  }

  getStopById(id: string): BusStop | null {
    const s = this.db.prepare('SELECT * FROM stops WHERE id = ?').get(id) as any;
    if (!s) return null;
    return {
      ...s,
      aliases: s.aliases_json ? JSON.parse(s.aliases_json) : [],
      isHub: Boolean(s.isHub)
    };
  }

  // ==========================================
  // TRIPS & PASSENGERS
  // ==========================================
  getTrips(routeId?: string): Trip[] {
    let sql = 'SELECT * FROM trips';
    const params: any[] = [];
    if (routeId && routeId !== 'all') {
      sql += ' WHERE routeId = ?';
      params.push(routeId);
    }
    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map(t => ({
      ...t,
      stops: t.stops_json ? JSON.parse(t.stops_json) : []
    }));
  }

  getTripById(id: string): Trip | null {
    const t = this.db.prepare('SELECT * FROM trips WHERE id = ?').get(id) as any;
    if (!t) return null;
    return {
      ...t,
      stops: t.stops_json ? JSON.parse(t.stops_json) : []
    };
  }

  getPassengers(tripId?: string): PassengerRecord[] {
    let sql = 'SELECT * FROM passengers';
    const params: SQLInputValue[] = [];
    if (tripId && tripId !== 'all') {
      sql += ' WHERE tripId = ?';
      params.push(tripId);
    }
    const rows = this.db.prepare(sql).all(...params) as Record<string, SQLOutputValue>[];
    return rows.map(mapPassengerRow);
  }

  // ==========================================
  // BOOKINGS (Seat Decrement / Increment Logic)
  // ==========================================
  getBookings(studentId?: string): Booking[] {
    let sql = 'SELECT * FROM bookings';
    const params: SQLInputValue[] = [];
    if (studentId && studentId !== 'all') {
      sql += ' WHERE studentId = ?';
      params.push(studentId);
    }
    sql += ' ORDER BY bookedAt DESC';
    const rows = this.db.prepare(sql).all(...params) as Record<string, SQLOutputValue>[];
    return rows.map(mapBookingRow);
  }

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
  }): { success: boolean; booking?: Booking; error?: string } {
    // 1. Fetch trip or bus
    const trip = this.getTripById(data.tripId);
    const bus = data.busId ? this.getBusById(data.busId) : (trip ? this.getBusById(trip.busId) : null);

    if (!trip && !bus) {
      return { success: false, error: 'Target bus service or trip not found.' };
    }

    const targetBus = bus || (trip ? this.getBusById(trip.busId) : null);
    if (!targetBus) {
      return { success: false, error: 'Assigned fleet vehicle not found.' };
    }

    if (targetBus.availableSeats <= 0) {
      return { success: false, error: 'Bus is at 100% capacity. No available seats remaining.' };
    }

    // 2. Decrement available seats, increment occupied seats
    const newAvail = targetBus.availableSeats - 1;
    const newOccupied = (targetBus.occupiedSeats ?? 0) + 1;
    this.updateBus(targetBus.id, { availableSeats: newAvail, occupiedSeats: newOccupied });

    if (trip) {
      this.db.prepare('UPDATE trips SET availableSeats = ?, occupiedSeats = ? WHERE id = ?').run(
        newAvail,
        newOccupied,
        trip.id
      );
    }

    // 3. Generate booking reference & record
    const ref = `BK-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const bookingId = `book-${Date.now()}`;
    const assignedSeat = newOccupied;

    const booking: Booking = {
      id: bookingId,
      bookingReference: ref,
      tripId: data.tripId,
      busId: targetBus.id,
      busNumber: targetBus.busNumber,
      registrationNumber: targetBus.registrationNumber,
      routeNumber: targetBus.routeNumber || (trip ? trip.routeNumber : '14B'),
      fromStop: data.fromStop,
      toStop: data.toStop,
      departureTime: data.departureTime,
      arrivalTime: data.arrivalTime,
      travelDate: data.travelDate || '13/11/2026',
      studentId: data.studentId,
      passengerName: data.passengerName,
      seatNumber: assignedSeat,
      farePaid: data.farePaid ?? targetBus.fareRupees ?? 28,
      status: 'CONFIRMED',
      bookedAt: new Date().toISOString()
    };

    this.db.prepare(`
      INSERT INTO bookings (
        id, bookingReference, tripId, busId, busNumber, registrationNumber,
        routeNumber, fromStop, toStop, departureTime, arrivalTime, travelDate,
        studentId, passengerName, seatNumber, farePaid, status, bookedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      booking.id,
      booking.bookingReference,
      booking.tripId,
      booking.busId,
      booking.busNumber,
      booking.registrationNumber,
      booking.routeNumber,
      booking.fromStop,
      booking.toStop,
      booking.departureTime,
      booking.arrivalTime,
      booking.travelDate,
      booking.studentId,
      booking.passengerName,
      booking.seatNumber,
      booking.farePaid,
      booking.status,
      booking.bookedAt
    );

    // Also add to passengers manifest
    this.db.prepare(`
      INSERT INTO passengers (
        id, tripId, busNumber, studentId, studentName, seatNumber,
        boardingStop, destinationStop, farePaid, bookingDate, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `pass-${Date.now()}`,
      booking.tripId,
      booking.busNumber,
      booking.studentId,
      booking.passengerName,
      booking.seatNumber,
      booking.fromStop,
      booking.toStop,
      booking.farePaid,
      booking.travelDate,
      'CONFIRMED'
    );

    // Create notification
    this.addNotification({
      id: `notif-bk-${Date.now()}`,
      targetRole: 'all',
      title: `Seat Confirmed: ${booking.busNumber} (${booking.fromStop} ➔ ${booking.toStop})`,
      message: `Booking Ref: ${ref} confirmed for ${booking.passengerName} (Seat #${assignedSeat}).`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/dashboard'
    });

    return { success: true, booking };
  }

  cancelBooking(bookingId: string): { success: boolean; error?: string } {
    const booking = this.db.prepare('SELECT * FROM bookings WHERE id = ? OR bookingReference = ?').get(bookingId, bookingId) as Booking | undefined;
    if (!booking) return { success: false, error: 'Booking not found.' };

    if (booking.status === 'CANCELLED') {
      return { success: false, error: 'Booking is already cancelled.' };
    }

    // 1. Mark booking cancelled
    this.db.prepare("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?").run(booking.id);
    this.db.prepare("UPDATE passengers SET status = 'CANCELLED' WHERE tripId = ? AND studentId = ? AND seatNumber = ?").run(
      booking.tripId,
      booking.studentId,
      booking.seatNumber
    );

    // 2. Increment available seats, decrement occupied
    const bus = this.getBusById(booking.busId);
    if (bus) {
      const newAvail = bus.availableSeats + 1;
      const newOccupied = Math.max(0, (bus.occupiedSeats ?? 0) - 1);
      this.updateBus(bus.id, { availableSeats: newAvail, occupiedSeats: newOccupied });

      this.db.prepare('UPDATE trips SET availableSeats = ?, occupiedSeats = ? WHERE busId = ?').run(
        newAvail,
        newOccupied,
        bus.id
      );
    }

    return { success: true };
  }

  // ==========================================
  // REQUESTS, REPORTS, NOTIFICATIONS, USERS
  // ==========================================
  getRequests(): TravelRequest[] {
    const rows = this.db.prepare('SELECT * FROM requests ORDER BY createdAt DESC').all() as Record<string, SQLOutputValue>[];
    return rows.map(mapRequestRow);
  }

  addRequest(req: TravelRequest): TravelRequest {
    this.db.prepare(`
      INSERT INTO requests (id, studentId, studentName, studentVillage, origin, destination, travelDate, departureWindow, passengerCount, status, notes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.id,
      req.studentId,
      req.studentName,
      req.studentVillage,
      req.origin,
      req.destination,
      req.travelDate,
      req.departureWindow,
      req.passengerCount,
      req.status,
      req.notes || null,
      req.createdAt
    );
    return req;
  }

  updateRequestStatus(id: string, status: TravelRequest['status']): boolean {
    const res = this.db.prepare('UPDATE requests SET status = ? WHERE id = ?').run(status, id);
    return res.changes > 0;
  }

  getReports(): TransportReport[] {
    const rows = this.db.prepare('SELECT * FROM reports ORDER BY createdAt DESC').all() as Record<string, SQLOutputValue>[];
    return rows.map(mapReportRow);
  }

  addReport(rep: TransportReport): TransportReport {
    this.db.prepare(`
      INSERT INTO reports (id, studentId, studentName, routeId, routeName, busNumber, category, location, description, status, adminNotes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      rep.id,
      rep.studentId,
      rep.studentName,
      rep.routeId || null,
      rep.routeName || null,
      rep.busNumber || null,
      rep.category,
      rep.location,
      rep.description,
      rep.status,
      rep.adminNotes || null,
      rep.createdAt
    );
    return rep;
  }

  updateReportStatus(id: string, status: TransportReport['status'], adminNotes?: string): boolean {
    const res = this.db.prepare('UPDATE reports SET status = ?, adminNotes = ? WHERE id = ?').run(
      status,
      adminNotes || null,
      id
    );
    return res.changes > 0;
  }

  getNotifications(role?: string): AppNotification[] {
    let sql = 'SELECT * FROM notifications';
    const params: SQLInputValue[] = [];
    if (role && role !== 'all') {
      sql += " WHERE targetRole = ? OR targetRole = 'all'";
      params.push(role);
    }
    sql += ' ORDER BY createdAt DESC';
    const rows = this.db.prepare(sql).all(...params) as Record<string, SQLOutputValue>[];
    return rows.map(n => ({
      id: String(n.id ?? ''),
      targetRole: (n.targetRole as AppNotification['targetRole']) || 'all',
      title: String(n.title ?? ''),
      message: String(n.message ?? ''),
      type: (n.type as AppNotification['type']) || 'info',
      read: Boolean(n.read),
      createdAt: String(n.createdAt ?? ''),
      actionUrl: n.actionUrl != null ? String(n.actionUrl) : undefined
    }));
  }

  addNotification(n: AppNotification): AppNotification {
    this.db.prepare(`
      INSERT INTO notifications (id, targetRole, title, message, type, read, createdAt, actionUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      n.id,
      n.targetRole ?? null,
      n.title,
      n.message,
      n.type,
      n.read ? 1 : 0,
      n.createdAt,
      n.actionUrl ?? null
    );
    return n;
  }

  markNotificationRead(id: string): boolean {
    const res = this.db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id);
    return res.changes > 0;
  }

  getUsers(): User[] {
    const rows = this.db.prepare('SELECT * FROM users').all() as any[];
    return rows.map(u => ({
      ...u,
      studentPassActive: Boolean(u.studentPassActive)
    }));
  }

  getUserByEmail(email: string): User | null {
    const u = this.db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;
    if (!u) return null;
    return {
      ...u,
      studentPassActive: Boolean(u.studentPassActive)
    };
  }

  getUserById(id: string): User | null {
    const u = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!u) return null;
    return {
      ...u,
      studentPassActive: Boolean(u.studentPassActive)
    };
  }

  addUser(user: User): User {
    this.db.prepare(`
      INSERT INTO users (id, email, password, name, role, village, institution, phone, studentId, studentPassActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      user.email,
      user.password || 'password123',
      user.name,
      user.role,
      user.village || null,
      user.institution || null,
      user.phone || null,
      user.studentId || null,
      user.studentPassActive ? 1 : 0,
      new Date().toISOString()
    );
    return user;
  }

  getBusLocation(id: string) {
    const bus = this.getBusById(id);
    if (!bus) return null;
    return {
      busId: bus.id,
      busNumber: bus.busNumber,
      registrationNumber: bus.registrationNumber,
      routeName: bus.routeName,
      routeNumber: bus.routeNumber || '14B',
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
      imageUrl: bus.imageUrl,
      lastUpdated: bus.lastUpdated,
      isSimulatedGps: bus.isSimulatedGps ?? true,
      label: bus.isSimulatedGps ? 'DEMO GPS SIMULATOR' : 'HARDWARE GPS'
    };
  }
}

export const db = new SQLiteDatabase();
