import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Bus, Route, TravelRequest, TransportReport, BusStatus, BusType, Booking } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { getBusImage } from '../utils/busImages.js';
import {
  ShieldCheck,
  Bus as BusIcon,
  Route as RouteIcon,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  Clock,
  Radio,
  Ticket,
  XCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [reports, setReports] = useState<TransportReport[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'buses' | 'routes' | 'requests' | 'reports' | 'bookings'>('buses');
  const [isLoading, setIsLoading] = useState(true);

  // Add Bus Modal State
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [newBusNumber, setNewBusNumber] = useState('KA-19-F-8820');
  const [newBusRegistration, setNewBusRegistration] = useState('KA-19-F-8820');
  const [newBusName, setNewBusName] = useState('Moodbidri Express Feeder');
  const [newBusType, setNewBusType] = useState<BusType>('KSRTC Ordinary');
  const [newBusOperator, setNewBusOperator] = useState('KSRTC Rural Gramina Sarige');
  const [newBusRouteId, setNewBusRouteId] = useState('route-14b');
  const [newBusCapacity, setNewBusCapacity] = useState(50);
  const [newBusSeats, setNewBusSeats] = useState(50);

  // Flash message
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [busList, routeList, reqList, repList, bookList] = await Promise.all([
        api.getBuses(),
        api.getRoutes(),
        api.getRequests(),
        api.getReports(),
        api.getBookings()
      ]);
      setBuses(busList);
      setRoutes(routeList);
      setRequests(reqList);
      setReports(repList);
      setBookings(bookList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Cancel this passenger booking? Seat will be refunded back to the bus inventory.')) return;
    try {
      const res = await api.cancelBooking(bookingId);
      if (res.success) {
        await loadAdminData();
        showFlash('Booking cancelled. Seat inventory restored.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateBusStatus = async (busId: string, status: BusStatus, delayMinutes: number = 0) => {
    try {
      const updates: Partial<Bus> = { status, delayMinutes };
      if (status === 'Full Capacity') updates.availableSeats = 0;
      if (status === 'Cancelled') {
        updates.availableSeats = 0;
        updates.speedKmH = 0;
      }

      const updated = await api.updateBus(busId, updates);
      setBuses(prev => prev.map(b => b.id === busId ? updated : b));
      showFlash(`Bus ${updated.busNumber} updated to ${status}. Changes active in student journey planner.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSeats = async (busId: string, availableSeats: number) => {
    try {
      const updated = await api.updateBus(busId, { availableSeats });
      setBuses(prev => prev.map(b => b.id === busId ? updated : b));
      showFlash(`Bus ${updated.busNumber} seats updated to ${availableSeats}.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBus = async (busId: string) => {
    if (!confirm('Are you sure you want to retire this bus from fleet radar?')) return;
    try {
      await api.deleteBus(busId);
      setBuses(prev => prev.filter(b => b.id !== busId));
      showFlash('Bus removed from active fleet.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selRoute = routes.find(r => r.id === newBusRouteId);
      const created = await api.addBus({
        busNumber: newBusNumber,
        registrationNumber: newBusRegistration,
        busName: newBusName,
        busType: newBusType,
        operator: newBusOperator,
        routeId: newBusRouteId,
        routeName: selRoute?.routeName || 'Route 14B',
        origin: selRoute?.origin || 'Kinnigoli',
        destination: selRoute?.destination || 'Moodbidri',
        capacity: newBusCapacity,
        availableSeats: newBusSeats,
        status: 'On Time',
        currentLat: selRoute?.stops[0]?.latitude || 13.0854,
        currentLng: selRoute?.stops[0]?.longitude || 74.8722,
        fareRupees: selRoute?.fareRupees || 35,
        totalDistanceKm: selRoute?.distanceKm || 28.5,
        imageUrl: getBusImage(newBusType, newBusNumber)
      });
      setBuses(prev => [...prev, created]);
      setShowAddBusModal(false);
      showFlash(`New bus ${created.busNumber} registered into regional network.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    const note = prompt('Enter resolution notes for this problem:', 'Relief bus allocated. Operator reprimanded.');
    if (note === null) return;
    try {
      const updated = await api.updateReportStatus(reportId, 'RESOLVED', note);
      setReports(prev => prev.map(r => r.id === reportId ? updated : r));
      showFlash(`Report #${reportId} marked as RESOLVED.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateRequestStatus = async (reqId: string, status: TravelRequest['status']) => {
    try {
      const updated = await api.updateRequestStatus(reqId, status);
      setRequests(prev => prev.map(r => r.id === reqId ? updated : r));
      showFlash(`Request marked as ${status}.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispatchRelief = async () => {
    try {
      const res = await api.allocateReliefBus('route-14b', 'KA-19-F-9901');
      await loadAdminData();
      showFlash(res.message);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset all demo state to original pristine dataset?')) return;
    try {
      await api.resetDemoData();
      await loadAdminData();
      showFlash('Demo data reset to initial state.');
    } catch (e) {
      console.error(e);
    }
  };

  const showFlash = (msg: string) => {
    setFlashMessage(msg);
    setTimeout(() => setFlashMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>KSRTC / Transport Authority Central Command</span>
            </div>
            <h1 className="text-2xl font-extrabold text-navy-900">Administrator Console</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in: <strong>{user?.name}</strong> • KSRTC Rural Transit Controller, Dakshina Kannada Division
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDispatchRelief}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <BusIcon className="w-4 h-4" />
              <span>Dispatch Relief Bus (KA-19-F-9901)</span>
            </button>

            <button
              onClick={handleResetData}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>

            <button
              onClick={loadAdminData}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FLASH TOAST */}
        {flashMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{flashMessage}</span>
          </div>
        )}

        {/* TOP OVERVIEW STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Fleet</span>
            <div className="text-2xl font-black text-navy-900 mt-1">{buses.length} Buses</div>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {buses.filter(b => b.status === 'On Time').length} on schedule
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Rural Corridors</span>
            <div className="text-2xl font-black text-brand-blue mt-1">{routes.length} Routes</div>
            <span className="text-[10px] text-slate-500 font-medium">Dakshina Kannada network</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Student Travel Reqs</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{requests.length} Requests</div>
            <span className="text-[10px] text-amber-600 font-semibold">
              {requests.filter(r => r.status === 'PENDING').length} pending review
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Transport Complaints</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{reports.length} Reports</div>
            <span className="text-[10px] text-rose-600 font-semibold">
              {reports.filter(r => r.status !== 'RESOLVED').length} unresolved
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Network Integrity</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">94.8%</div>
            <span className="text-[10px] text-slate-500 font-medium">Automatic fallback ready</span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('buses')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'buses' ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BusIcon className="w-4 h-4" />
            <span>Bus Fleet Management ({buses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'routes' ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RouteIcon className="w-4 h-4" />
            <span>Routes & Stops Database ({routes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'requests' ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Demand Requests ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'reports' ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Problem Reports ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'bookings' ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Passenger Bookings ({bookings.length})</span>
          </button>
        </div>

        {/* TAB 1: BUS MANAGEMENT (Section 10 Requirement) */}
        {activeTab === 'buses' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-navy-900">Active Bus Fleet Database ({buses.length})</h2>
                <p className="text-xs text-slate-500">Live operational status, route assignment, seats, and simulated breakdown controls</p>
              </div>

              <button
                onClick={() => setShowAddBusModal(true)}
                className="px-3.5 py-1.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bus to Fleet</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3 px-2">Bus Reg / Name</th>
                    <th className="py-3 px-2">Type & Operator</th>
                    <th className="py-3 px-2">Route Corridor</th>
                    <th className="py-3 px-2">Next Stop & ETA</th>
                    <th className="py-3 px-2">Seats (Free / Cap)</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Quick Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buses.map(bus => (
                    <tr key={bus.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={bus.imageUrl || getBusImage(bus.busType, bus.busNumber)}
                            alt={bus.busNumber}
                            className="w-12 h-8 rounded-lg object-cover border border-slate-200 shrink-0 shadow-2xs"
                          />
                          <div>
                            <div className="font-extrabold text-navy-900">{bus.busNumber}</div>
                            <div className="text-[10px] text-slate-500">{bus.busName}</div>
                            <div className="text-[10px] font-mono text-amber-800 font-bold">Reg: {bus.registrationNumber || 'KA-19-F-1401'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        <span className="font-semibold text-slate-700">{bus.busType}</span>
                        <div className="text-[10px] text-slate-400">{bus.operator}</div>
                      </td>

                      <td className="py-3 px-2">
                        <div className="text-slate-800 font-semibold">{bus.routeName}</div>
                        <div className="text-[10px] text-slate-400">{bus.origin} ➔ {bus.destination} ({bus.totalDistanceKm} km)</div>
                      </td>

                      <td className="py-3 px-2">
                        <div className="font-bold text-slate-800">{bus.nextStopName.split(' ')[0]}</div>
                        <div className="text-[10px] text-brand-blue">ETA: {bus.etaNextStop} ({bus.distanceToNextStopKm} km)</div>
                      </td>

                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={bus.capacity}
                            value={bus.availableSeats}
                            onChange={e => handleUpdateSeats(bus.id, Number(e.target.value))}
                            className="w-14 bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-xs"
                          />
                          <span className="text-slate-400">/ {bus.capacity}</span>
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        <StatusBadge status={bus.status} size="sm" />
                      </td>

                      <td className="py-3 px-2 text-right space-x-1.5">
                        {/* 1-Click Status Controls */}
                        <button
                          onClick={() => handleUpdateBusStatus(bus.id, 'On Time', 0)}
                          title="Mark On Time"
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] border border-emerald-200"
                        >
                          On Time
                        </button>

                        <button
                          onClick={() => handleUpdateBusStatus(bus.id, 'Delayed', 20)}
                          title="Mark Delayed +20m"
                          className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-[10px] border border-amber-200"
                        >
                          +20m Late
                        </button>

                        <button
                          onClick={() => handleUpdateBusStatus(bus.id, 'Full Capacity', 0)}
                          title="Mark Full (0 seats)"
                          className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-[10px] border border-purple-200"
                        >
                          Full
                        </button>

                        <button
                          onClick={() => handleUpdateBusStatus(bus.id, 'Cancelled', 0)}
                          title="Cancel bus service"
                          className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px] border border-rose-200"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={() => handleDeleteBus(bus.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete bus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ROUTES & BUS STOPS (Section 2 Requirement) */}
        {activeTab === 'routes' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-navy-900">Interconnected Rural Routes Database ({routes.length})</h2>
              <p className="text-xs text-slate-500">Official routes with cumulative distance in km, stop sequences, and schedules</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map(r => (
                <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-navy-900 text-sm">
                      {r.routeNumber} • {r.routeName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-brand-blue">
                      {r.distanceKm} km • ₹{r.fareRupees}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    <strong>Intermediate Stops ({r.stops.length}):</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.stops.map(s => (
                        <span key={s.id} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700">
                          {s.name} ({s.distanceFromStartKm} km)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>Operating: <strong>{r.operatingDays}</strong> ({r.busType})</span>
                    <span>Schedules: <strong>{r.schedule.length} trips daily</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT DEMAND REQUESTS */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-navy-900">Student Travel Demand Aggregation</h2>
                <p className="text-xs text-slate-500">Group travel requests from rural villages</p>
              </div>
            </div>

            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800 text-sm">
                      {req.origin} ➔ {req.destination}
                    </div>
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Student: <strong>{req.studentName}</strong> ({req.passengerCount} passengers)</span>
                    <span>Window: <strong>{req.departureWindow}</strong></span>
                  </div>
                  {req.notes && <div className="text-[11px] text-slate-500 italic">"{req.notes}"</div>}
                  <div className="pt-2 flex items-center gap-2 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Change Status:</span>
                    <button
                      onClick={() => handleUpdateRequestStatus(req.id, 'GROUPED')}
                      className="px-2 py-1 bg-amber-100 text-amber-800 font-bold rounded text-[11px]"
                    >
                      Group
                    </button>
                    <button
                      onClick={() => handleUpdateRequestStatus(req.id, 'ADDITIONAL_BUS_ASSIGNED')}
                      className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold rounded text-[11px]"
                    >
                      Assign Relief Bus
                    </button>
                    <button
                      onClick={() => handleUpdateRequestStatus(req.id, 'REJECTED')}
                      className="px-2 py-1 bg-rose-100 text-rose-800 font-bold rounded text-[11px]"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROBLEM REPORTS & COMPLAINTS */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-navy-900">Reported Route Complaints</h2>
              <p className="text-xs text-slate-500">Student feedback on skipped stops, delays, and overcrowding</p>
            </div>

            <div className="space-y-3">
              {reports.map(rep => (
                <div key={rep.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{rep.category} • {rep.location}</span>
                    <StatusBadge status={rep.status} size="sm" />
                  </div>
                  <p className="text-slate-600 text-[11px]">"{rep.description}"</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400">
                      Reported by {rep.studentName} on {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                    {rep.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolveReport(rep.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                      >
                        Resolve & Add Resolution Note
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PASSENGER BOOKINGS MANIFEST (Part 6 Requirement) */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-navy-900">Passenger Seat Bookings Manifest ({bookings.length})</h2>
                <p className="text-xs text-slate-500">Live student reservations, boarding tokens, and seat inventory controls</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                {bookings.filter(b => b.status === 'CONFIRMED').length} Active Reservations
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                No bookings recorded yet in the database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-3 px-2">Booking Ref</th>
                      <th className="py-3 px-2">Student Passenger</th>
                      <th className="py-3 px-2">Bus & Reg</th>
                      <th className="py-3 px-2">Journey Route</th>
                      <th className="py-3 px-2">Seat #</th>
                      <th className="py-3 px-2">Departure</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-2 font-mono font-bold text-navy-900">{b.bookingReference}</td>
                        <td className="py-3 px-2">
                          <strong className="text-slate-800">{b.passengerName}</strong>
                          <div className="text-[10px] text-slate-400 font-mono">{b.studentId}</div>
                        </td>
                        <td className="py-3 px-2">
                          <strong className="text-brand-blue">{b.busNumber}</strong>
                          <div className="text-[10px] text-slate-500 font-mono">{b.registrationNumber}</div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-slate-700">{b.fromStop} ➔ {b.toStop}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-extrabold text-emerald-700">Seat #{b.seatNumber}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span>{b.departureTime}</span>
                          <span className="text-[10px] text-slate-400 block">{b.travelDate}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleAdminCancelBooking(b.id)}
                              className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px] border border-rose-200 transition"
                            >
                              Cancel & Release Seat
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADD BUS MODAL */}
        {showAddBusModal && (
          <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-navy-900 text-sm">Register New Bus to Fleet</h3>
                <button onClick={() => setShowAddBusModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleAddBus} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bus Registration Number</label>
                  <input
                    type="text"
                    value={newBusNumber}
                    onChange={e => setNewBusNumber(e.target.value)}
                    required
                    placeholder="e.g. KA-19-F-8820"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bus Name / Service</label>
                  <input
                    type="text"
                    value={newBusName}
                    onChange={e => setNewBusName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bus Type</label>
                    <select
                      value={newBusType}
                      onChange={e => setNewBusType(e.target.value as BusType)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-2"
                    >
                      <option value="KSRTC Ordinary">KSRTC Ordinary</option>
                      <option value="Express">Express</option>
                      <option value="Private Route">Private Route</option>
                      <option value="College Shuttle">College Shuttle</option>
                      <option value="Shared Feeder">Shared Feeder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Operator</label>
                    <input
                      type="text"
                      value={newBusOperator}
                      onChange={e => setNewBusOperator(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign to Route</label>
                  <select
                    value={newBusRouteId}
                    onChange={e => setNewBusRouteId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold"
                  >
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.routeNumber} ({r.routeName})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Capacity</label>
                    <input
                      type="number"
                      value={newBusCapacity}
                      onChange={e => setNewBusCapacity(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Available Seats</label>
                    <input
                      type="number"
                      value={newBusSeats}
                      onChange={e => setNewBusSeats(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-emerald-600"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-xl"
                  >
                    Save & Deploy to Network
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddBusModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
