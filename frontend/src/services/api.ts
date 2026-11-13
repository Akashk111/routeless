import {
  User,
  UserRole,
  Bus,
  Route,
  OptimizedJourney,
  AlternativeOption,
  TravelRequest,
  TransportReport,
  AppNotification
} from '../types/index.js';

const API_BASE = '/api';

export interface PlanJourneyParams {
  origin: string;
  destination: string;
  time?: string;
  travelDate?: string;
  sort?: string;
  busType?: string;
  maxFare?: number;
  minSeats?: number;
  maxTransfers?: number;
  maxDistance?: number;
  operator?: string;
}

export const api = {
  // Auth
  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async demoLogin(role: UserRole): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Demo login failed');
    }
    return res.json();
  },

  async register(data: Partial<User>): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  // Buses
  async getBuses(filters?: { routeId?: string; busType?: string; status?: string }): Promise<Bus[]> {
    let url = `${API_BASE}/buses`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.routeId) params.append('routeId', filters.routeId);
      if (filters.busType) params.append('busType', filters.busType);
      if (filters.status) params.append('status', filters.status);
      url += `?${params.toString()}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    return data.buses;
  },

  async getBusById(id: string): Promise<Bus> {
    const res = await fetch(`${API_BASE}/buses/${id}`);
    const data = await res.json();
    return data.bus;
  },

  async updateBus(id: string, updates: Partial<Bus>): Promise<Bus> {
    const res = await fetch(`${API_BASE}/buses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.bus;
  },

  async updateBusTelemetry(id: string, telemetry: { latitude: number; longitude: number; speedKmH: number; heading?: number; timestamp?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/buses/${id}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telemetry)
    });
    return res.json();
  },

  async addBus(bus: Partial<Bus>): Promise<Bus> {
    const res = await fetch(`${API_BASE}/buses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bus)
    });
    const data = await res.json();
    return data.bus;
  },

  async deleteBus(id: string): Promise<void> {
    await fetch(`${API_BASE}/buses/${id}`, { method: 'DELETE' });
  },

  // Routes & Journey Planner
  async getRoutes(): Promise<Route[]> {
    const res = await fetch(`${API_BASE}/journey/routes`);
    const data = await res.json();
    return data.routes;
  },

  async planJourney(params: PlanJourneyParams): Promise<OptimizedJourney[]> {
    const query = new URLSearchParams();
    query.append('origin', params.origin);
    query.append('destination', params.destination);
    if (params.time) query.append('time', params.time);
    if (params.travelDate) query.append('travelDate', params.travelDate);
    if (params.sort) query.append('sort', params.sort);
    if (params.busType && params.busType !== 'all') query.append('busType', params.busType);
    if (params.maxFare) query.append('maxFare', String(params.maxFare));
    if (params.minSeats) query.append('minSeats', String(params.minSeats));
    if (params.maxTransfers !== undefined && params.maxTransfers !== null) query.append('maxTransfers', String(params.maxTransfers));
    if (params.maxDistance) query.append('maxDistance', String(params.maxDistance));
    if (params.operator && params.operator !== 'all') query.append('operator', params.operator);

    const res = await fetch(`${API_BASE}/journey/plan?${query.toString()}`);
    const data = await res.json();
    return data.journeys || [];
  },

  // Stops & Live Telemetry
  async getStops(query?: string): Promise<any[]> {
    const url = query ? `${API_BASE}/stops?q=${encodeURIComponent(query)}` : `${API_BASE}/stops`;
    const res = await fetch(url);
    const data = await res.json();
    return data.stops || [];
  },

  async getTrips(routeId?: string): Promise<any[]> {
    const url = routeId ? `${API_BASE}/trips?routeId=${encodeURIComponent(routeId)}` : `${API_BASE}/trips`;
    const res = await fetch(url);
    const data = await res.json();
    return data.trips || [];
  },

  async getBusLocation(busId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/buses/${busId}/location`);
    const data = await res.json();
    return data.location;
  },

  // Alternatives
  async getAlternatives(origin: string, destination: string, time: string = '07:30'): Promise<{
    disruptionDetected: boolean;
    disruptionReason?: string;
    affectedBus?: Bus;
    affectedRoute?: Route;
    alternatives: AlternativeOption[];
  }> {
    const res = await fetch(`${API_BASE}/alternatives/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&time=${encodeURIComponent(time)}`);
    return res.json();
  },

  // Requests
  async getRequests(): Promise<TravelRequest[]> {
    const res = await fetch(`${API_BASE}/requests`);
    const data = await res.json();
    return data.requests;
  },

  async createRequest(req: Partial<TravelRequest>): Promise<TravelRequest> {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    const data = await res.json();
    return data.request;
  },

  async updateRequestStatus(id: string, status: TravelRequest['status']): Promise<TravelRequest> {
    const res = await fetch(`${API_BASE}/requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    return data.request;
  },

  // Reports
  async getReports(): Promise<TransportReport[]> {
    const res = await fetch(`${API_BASE}/reports`);
    const data = await res.json();
    return data.reports;
  },

  async createReport(report: Partial<TransportReport>): Promise<TransportReport> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    const data = await res.json();
    return data.report;
  },

  async updateReportStatus(id: string, status: TransportReport['status'], adminNotes?: string): Promise<TransportReport> {
    const res = await fetch(`${API_BASE}/reports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes })
    });
    const data = await res.json();
    return data.report;
  },

  // Notifications
  async getNotifications(role?: string): Promise<AppNotification[]> {
    const res = await fetch(`${API_BASE}/notifications${role ? `?role=${role}` : ''}`);
    const data = await res.json();
    return data.notifications;
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
  },

  // AI Assistant
  async sendAIChat(message: string, history: any[] = []): Promise<{ text: string; cards?: AlternativeOption[]; quickActions?: string[] }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });
    return res.json();
  },

  // Demo Scenarios & Predictions
  async getDemandPrediction(): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/prediction`);
    return res.json();
  },

  async triggerScenario(scenario: 'A' | 'B' | 'C'): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/trigger-scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    return res.json();
  },

  async resetDemoData(): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    return res.json();
  },

  async allocateReliefBus(routeId?: string, busNumber?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/allocate-bus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routeId, busNumber })
    });
    return res.json();
  }
};
