import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Bus, Route, TravelRequest, TransportReport, BusStatus } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
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
  Filter
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [reports, setReports] = useState<TransportReport[]>([]);
  const [activeTab, setActiveTab] = useState<'buses' | 'routes' | 'requests' | 'reports'>('buses');
  const [isLoading, setIsLoading] = useState(true);

  // Add Bus Modal State
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [newBusNumber, setNewBusNumber] = useState('KA-19-F-8800');
  const [newBusOperator, setNewBusOperator] = useState('KSRTC Rural Gramina Sarige');
  const [newBusRouteId, setNewBusRouteId] = useState('route-14b');
  const [newBusCapacity, setNewBusCapacity] = useState(50);
  const [newBusSeats, setNewBusSeats] = useState(50);
  const [newBusStatus, setNewBusStatus] = useState<BusStatus>('On Time');

  // Flash message
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [busList, routeList, reqList, repList] = await Promise.all([
        api.getBuses(),
        api.getRoutes(),
        api.getRequests(),
        api.getReports()
      ]);
      setBuses(busList);
      setRoutes(routeList);
      setRequests(reqList);
      setReports(repList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBusStatus = async (busId: string, status: BusStatus) => {
    try {
      const updated = await api.updateBus(busId, { status });
      setBuses(prev => prev.map(b => b.id === busId ? updated : b));
      showFlash(`Bus ${updated.busNumber} updated to ${status}.`);
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
        operator: newBusOperator,
        routeId: newBusRouteId,
        routeName: selRoute?.routeName || 'Route 14B',
        capacity: newBusCapacity,
        availableSeats: newBusSeats,
        status: newBusStatus,
        currentLat: 13.0854,
        currentLng: 74.8722
      });
      setBuses(prev => [...prev, created]);
      setShowAddBusModal(false);
      showFlash(`New bus ${created.busNumber} registered into network.`);
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>KSRTC / Transport Authority Central Command</span>
            </div>
            <h1 className="text-2xl font-extrabold text-navy-900">Administrator Console</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as: <strong>{user?.name}</strong> (KSRTC Rural Controller, Dakshina Kannada Division)
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
              <span>Reset Demo State</span>
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
            <span className="text-[10px] text-slate-500 font-medium">All active</span>
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
            <span className="text-[10px] text-slate-500 font-medium">Auto-rerouting active</span>
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
            <span>Bus Management ({buses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'routes' ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RouteIcon className="w-4 h-4" />
            <span>Routes & Stops ({routes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'requests' ? 'bg-navy-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Requests ({requests.length})</span>
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
        </div>

        {/* TAB 1: BUS MANAGEMENT */}
        {activeTab === 'buses' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-navy-900">Registered Bus Fleet</h2>
                <p className="text-xs text-slate-500">Update capacity, toggle delay status, or simulate cancellations</p>
              </div>

              <button
                onClick={() => setShowAddBusModal(true)}
                className="px-3.5 py-1.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bus</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3 px-2">Bus Number</th>
                    <th className="py-3 px-2">Route</th>
                    <th className="py-3 px-2">Operator</th>
                    <th className="py-3 px-2">Seats (Free / Cap)</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buses.map(bus => (
                    <tr key={bus.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-2 font-bold text-navy-900">{bus.busNumber}</td>
                      <td className="py-3 px-2 text-slate-700">{bus.routeName}</td>
                      <td className="py-3 px-2 text-slate-500">{bus.operator}</td>
                      <td className="py-3 px-2 font-semibold">
                        <span className={bus.availableSeats > 5 ? 'text-emerald-600' : 'text-rose-600'}>
                          {bus.availableSeats}
                        </span>
                        <span className="text-slate-400"> / {bus.capacity}</span>
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={bus.status} size="sm" />
                      </td>
                      <td className="py-3 px-2 text-right space-x-2">
                        {/* Status switcher */}
                        <select
                          value={bus.status}
                          onChange={e => handleUpdateBusStatus(bus.id, e.target.value as BusStatus)}
                          className="bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-semibold"
                        >
                          <option value="On Time">On Time</option>
                          <option value="Delayed">Delayed</option>
                          <option value="Full Capacity">Full Capacity</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => handleDeleteBus(bus.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete bus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ROUTES & BUS STOPS */}
        {activeTab === 'routes' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-navy-900">Rural Transit Corridors</h2>
              <p className="text-xs text-slate-500">Sequential stops, transfer junctions, and fare matrices</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map(r => (
                <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-navy-900 text-sm">
                      {r.routeNumber} • {r.routeName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-brand-blue">
                      ₹{r.fareRupees} • {r.estimatedDurationMin}m
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Stops ({r.stops.length}): {r.stops.map(s => s.name).join(' → ')}
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
                <h2 className="text-base font-bold text-navy-900">Student Travel Demands</h2>
                <p className="text-xs text-slate-500">Crowdsourced transit needs from rural colleges</p>
              </div>
            </div>

            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800 text-sm">
                      {req.origin} → {req.destination}
                    </div>
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Requested by: <strong>{req.studentName}</strong> ({req.passengerCount} passengers)</span>
                    <span>Departure window: <strong>{req.departureWindow}</strong></span>
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
                        Resolve & Add Note
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operator</label>
                  <input
                    type="text"
                    value={newBusOperator}
                    onChange={e => setNewBusOperator(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign to Route</label>
                  <select
                    value={newBusRouteId}
                    onChange={e => setNewBusRouteId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Available Seats</label>
                    <input
                      type="number"
                      value={newBusSeats}
                      onChange={e => setNewBusSeats(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-xl"
                  >
                    Save & Deploy
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
