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
  async getBuses(): Promise<Bus[]> {
    const res = await fetch(`${API_BASE}/buses`);
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

  async planJourney(origin: string, destination: string, time: string = '07:30'): Promise<OptimizedJourney[]> {
    const res = await fetch(`${API_BASE}/journey/plan?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&time=${encodeURIComponent(time)}`);
    const data = await res.json();
    return data.journeys || [];
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
