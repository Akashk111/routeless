import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { api } from '../services/api.js';
import { Bus, TravelRequest, TransportReport, Booking } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { getBusImage } from '../utils/busImages.js';
import {
  Compass,
  Shuffle,
  Radio,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  School,
  Ticket,
  QrCode,
  XCircle,
  ShieldCheck
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  const [buses, setBuses] = useState<Bus[]>([]);
  const [requests, setRequests] = useState<TravelRequest[]>([]);
  const [reports, setReports] = useState<TransportReport[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quick travel request modal / mini-form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [origin, setOrigin] = useState(user?.village || 'Kinnigoli');
  const [destination, setDestination] = useState("Alva's College, Moodbidri");
  const [departureWindow, setDepartureWindow] = useState('07:30 - 08:30');
  const [passengerCount, setPassengerCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [busData, reqData, repData, bookData] = await Promise.all([
        api.getBuses(),
        api.getRequests(),
        api.getReports(),
        api.getBookings()
      ]);
      setBuses(busData);
      setRequests(reqData);
      setReports(repData);
      setBookings(bookData);
    } catch (e) {
      console.error('Error loading dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Cancel this seat reservation? Your seat will immediately be returned to available fleet capacity.')) return;
    setIsCancelling(bookingId);
    try {
      const res = await api.cancelBooking(bookingId);
      if (res.success) {
        await loadData();
      }
    } catch (e) {
      console.error('Error cancelling booking', e);
    } finally {
      setIsCancelling(null);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createRequest({
        studentId: user?.id || 'user-std-1',
        studentName: user?.name || 'Ananya Rao',
        studentVillage: user?.village || origin,
        origin,
        destination,
        departureWindow,
        passengerCount,
        notes
      });
      setRequestSuccess(true);
      setShowRequestForm(false);
      setNotes('');
      await loadData();
      setTimeout(() => setRequestSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find if there's any active disruption on user's primary route (Kinnigoli -> Moodbidri)
  const route14bBus = buses.find(b => b.routeId === 'route-14b');
  const hasDisruption = route14bBus && (route14bBus.status === 'Cancelled' || route14bBus.status === 'Delayed');

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* WELCOME HEADER & PROFILE SUMMARY */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-brand-blue/15 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-navy-900">
                  Welcome back, {user?.name.split(' ')[0]}!
                </h1>
                <span className="bg-blue-100 text-brand-blue text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Student Pass Active
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Home Village: <strong className="text-slate-700">{user?.village || 'Kinnigoli'}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-slate-400" />
                  Institution: <strong className="text-slate-700">{user?.institution || "Alva's College, Moodbidri"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Next Scheduled Journey Preview Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs w-full md:w-auto min-w-[280px]">
            <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
              <span>Primary Commute</span>
              <span className="text-brand-blue font-bold">Route 14B</span>
            </div>
            <div className="font-bold text-navy-900 text-sm">
              {user?.village || 'Kinnigoli'} → {user?.institution?.split(',')[0] || "Alva's College"}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
              <span className="text-slate-500">Regular Departure: 07:30 AM</span>
              <StatusBadge status={route14bBus?.status || 'On Time'} size="sm" />
            </div>
          </div>
        </div>

        {/* ACTIVE DISRUPTION ALERT BANNER */}
        {hasDisruption && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-rose-900">
                  {route14bBus.status === 'Cancelled' ? 'Route 14B Bus Service Cancelled' : 'Route 14B Running 25m Delayed'}
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Regular morning bus KA-19-F-1402 is unavailable. Don't worry — ROUTELESS AI has generated verified backup connections via Kateel and shared rural shuttles.
                </p>
              </div>
            </div>
            <Link
              to="/alternatives"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-sm transition flex items-center gap-1.5"
            >
              <Shuffle className="w-4 h-4" />
              <span>View Alternative Routes</span>
            </Link>
          </div>
        )}

        {/* REQUEST SUCCESS NOTIFICATION */}
        {requestSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Travel request submitted! Transport authorities and KSRTC depot controllers have been notified to evaluate student demand on your corridor.
            </span>
          </div>
        )}

        {/* QUICK ACTION CARDS */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/planner"
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-blue shadow-sm hover:shadow-md transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm group-hover:text-brand-blue transition">Plan a Journey</h3>
              <p className="text-xs text-slate-500 mt-1">Dijkstra graph route finder for fastest connecting routes.</p>
            </Link>

            <Link
              to="/alternatives"
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Shuffle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm group-hover:text-amber-600 transition">Find Alternatives</h3>
              <p className="text-xs text-slate-500 mt-1">AI suggestions when regular buses are cancelled or full.</p>
            </Link>

            <Link
              to="/tracking"
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm group-hover:text-emerald-600 transition">Track My Bus</h3>
              <p className="text-xs text-slate-500 mt-1">Live OpenStreetMap GPS radar with seat availability.</p>
            </Link>

            <Link
              to="/report"
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-rose-400 shadow-sm hover:shadow-md transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-900 text-sm group-hover:text-rose-600 transition">Report a Problem</h3>
              <p className="text-xs text-slate-500 mt-1">Report cancelled, delayed, or overcrowded buses.</p>
            </Link>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT: LIVE BUS MONITOR & TRAVEL DEMAND REQUESTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Bookings + Available Buses & Network Feed */}
          <div className="lg:col-span-8 space-y-6">
            {/* MY RESERVED SEATS & TICKETS (Part 6 Requirement) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-navy-900">My Reserved Seats & Digital Passes</h2>
                    <p className="text-xs text-slate-500">Live seat bookings linked to your student pass</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {bookings.filter(b => b.status === 'CONFIRMED').length} Active
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 space-y-2">
                  <p>You haven't reserved any seats yet today.</p>
                  <Link
                    to="/journey"
                    className="inline-flex items-center gap-1.5 font-bold text-brand-blue hover:underline"
                  >
                    <span>Search bus timetables to reserve a seat →</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <div
                      key={b.id}
                      className={`p-4 rounded-xl border text-xs transition space-y-2 ${
                        b.status === 'CONFIRMED'
                          ? 'bg-gradient-to-r from-emerald-50/50 via-white to-white border-emerald-200 shadow-xs'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-navy-900 text-sm">{b.bookingReference}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Boarding Seat</span>
                          <strong className="text-emerald-700 font-extrabold text-sm">Seat #{b.seatNumber}</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">Bus & Reg</span>
                          <strong>{b.busNumber}</strong>
                          <span className="text-[10px] text-slate-500 block font-mono">{b.registrationNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Route Journey</span>
                          <strong className="text-brand-blue">{b.fromStop} ➔ {b.toStop}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Departure</span>
                          <strong>{b.departureTime}</strong> ({b.travelDate})
                        </div>
                        <div>
                          <span className="text-slate-400 block">Fare Paid</span>
                          <strong className="text-slate-800">₹{b.farePaid} (Concession)</strong>
                        </div>
                      </div>

                      {b.status === 'CONFIRMED' && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1 font-mono">
                            <QrCode className="w-3.5 h-3.5 text-slate-600" />
                            Digital Concession Token Active
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(b.id)}
                            disabled={isCancelling === b.id}
                            className="px-3 py-1 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold transition flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>{isCancelling === b.id ? 'Releasing Seat...' : 'Cancel Reservation'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-navy-900">Active Rural Bus Services</h2>
                  <p className="text-xs text-slate-500">Live operational status across Dakshina Kannada network</p>
                </div>
                <Link to="/tracking" className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1">
                  <span>Full Map</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {buses.slice(0, 5).map(bus => (
                  <div key={bus.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-900 text-sm">{bus.busNumber}</span>
                        <StatusBadge status={bus.status} size="sm" />
                      </div>
                      <div className="text-slate-600 font-medium mt-0.5">{bus.routeName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                        <span>Speed: {bus.speedKmH} km/h</span>
                        <span>•</span>
                        <span>Operator: {bus.operator}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-500">Seat Capacity</div>
                        <div className={`font-bold text-xs ${bus.availableSeats > 5 ? 'text-emerald-600' : bus.availableSeats > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {bus.availableSeats} / {bus.capacity} seats free
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/tracking?bus=${bus.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                      >
                        Track
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transport Complaints & Community Status */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-navy-900">Recent Transport Reports</h2>
                  <p className="text-xs text-slate-500">Crowdsourced issues logged by students along your route</p>
                </div>
                <Link to="/report" className="text-xs font-bold text-brand-blue hover:underline">
                  Submit New Report
                </Link>
              </div>

              <div className="space-y-3">
                {reports.slice(0, 3).map(rep => (
                  <div key={rep.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{rep.category} • {rep.location}</span>
                      <StatusBadge status={rep.status} size="sm" />
                    </div>
                    <p className="text-slate-600">{rep.description}</p>
                    {rep.adminNotes && (
                      <div className="text-[11px] bg-blue-50 text-blue-900 border border-blue-200 rounded p-1.5 mt-1">
                        <strong>KSRTC Control Action:</strong> {rep.adminNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Student Travel Requests & Submit Tool */}
          <div className="lg:col-span-4 space-y-6">
            {/* Travel Request Card */}
            <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-2xl p-6 shadow-md border border-navy-700">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold">Request Extra Bus / Ride</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Stranded or commuting with classmates? Submit a demand request. When 6+ students pool requests, transit controllers dispatch relief vehicles.
              </p>

              {!showRequestForm ? (
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="w-full py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-dark font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>Submit Travel Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <form onSubmit={handleCreateRequest} className="space-y-3 bg-navy-950/70 p-4 rounded-xl border border-navy-700 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Starting Village</label>
                    <input
                      type="text"
                      value={origin}
                      onChange={e => setOrigin(e.target.value)}
                      required
                      className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Destination</label>
                    <input
                      type="text"
                      value={destination}
                      onChange={e => setDestination(e.target.value)}
                      required
                      className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Time Window</label>
                      <select
                        value={departureWindow}
                        onChange={e => setDepartureWindow(e.target.value)}
                        className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2 py-1.5 text-white"
                      >
                        <option value="06:30 - 07:30">06:30 - 07:30</option>
                        <option value="07:30 - 08:30">07:30 - 08:30</option>
                        <option value="08:30 - 09:30">08:30 - 09:30</option>
                        <option value="16:00 - 17:30">16:00 - 17:30</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">No. of Students</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={passengerCount}
                        onChange={e => setPassengerCount(Number(e.target.value))}
                        className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Reason / Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM semester exam"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg text-white"
                    >
                      {isSubmitting ? 'Submitting...' : 'Post Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* My Active & Community Requests List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-navy-900">Community Travel Requests</h3>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                  {requests.length} active
                </span>
              </div>

              <div className="space-y-3">
                {requests.slice(0, 4).map(req => (
                  <div key={req.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{req.origin} → {req.destination.split(',')[0]}</span>
                      <StatusBadge status={req.status} size="sm" />
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>{req.studentName} ({req.passengerCount} students)</span>
                      <span>{req.departureWindow}</span>
                    </div>
                    {req.notes && <div className="text-[10px] text-slate-400 italic">"{req.notes}"</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Companion Quick Card */}
            <div className="bg-gradient-to-tr from-brand-blue to-blue-700 text-white rounded-2xl p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="font-bold text-sm">Need Journey Advice?</h3>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                Ask ROUTELESS AI: "Bus 14B is cancelled, how do I get to Alva's College before 9:00 AM?"
              </p>
              <Link
                to="/ai-assistant"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-navy-900 hover:bg-slate-100 px-4 py-2 rounded-xl shadow-sm transition"
              >
                <span>Chat with AI Companion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
