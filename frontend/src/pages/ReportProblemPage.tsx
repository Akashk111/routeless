import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { TransportReport, Bus, Route } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import {
  AlertTriangle,
  MapPin,
  Bus as BusIcon,
  CheckCircle2,
  Clock,
  Send,
  ShieldAlert,
  Filter,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

const CATEGORIES: TransportReport['category'][] = [
  'Bus not arrived',
  'Bus cancelled',
  'Bus overcrowded',
  'Bus skipped stop',
  'Route disruption',
  'Safety concern',
  'Other'
];

export const ReportProblemPage: React.FC = () => {
  const { user } = useAuth();

  const [reports, setReports] = useState<TransportReport[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form states
  const [category, setCategory] = useState<TransportReport['category']>('Bus cancelled');
  const [location, setLocation] = useState(user?.village || 'Kinnigoli Bus Stand');
  const [selectedRouteId, setSelectedRouteId] = useState('route-14b');
  const [busNumber, setBusNumber] = useState('KA-19-F-1402');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reps, busList, routeList] = await Promise.all([
        api.getReports(),
        api.getBuses(),
        api.getRoutes()
      ]);
      setReports(reps);
      setBuses(busList);
      setRoutes(routeList);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !location) return;

    setIsSubmitting(true);
    try {
      const selRoute = routes.find(r => r.id === selectedRouteId);
      await api.createReport({
        studentId: user?.id || 'user-std-1',
        studentName: user?.name || 'Ananya Rao',
        routeId: selectedRouteId,
        routeName: selRoute?.routeName || 'Route 14B',
        busNumber,
        category,
        location,
        description
      });
      setSubmitSuccess(true);
      setDescription('');
      await loadData();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports = filterCategory === 'all'
    ? reports
    : reports.filter(r => r.category === filterCategory);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Civic Transit Accountability</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900">Report Transportation Problem</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Did your scheduled bus fail to arrive, skip your stop, or arrive dangerously overcrowded? Log it here to alert KSRTC depot supervisors and fellow students.
          </p>
        </div>

        {/* TWO COLUMN LAYOUT: REPORT FORM & COMMUNITY REPORTS FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FORM (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-navy-900">Submit a Service Issue</h2>
              <p className="text-xs text-slate-500">Every report generates a real-time alert for transit administrators.</p>
            </div>

            {submitSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Report logged successfully! KSRTC Central Control has been alerted.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Problem Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-navy-900"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location of Incident</label>
                <input
                  type="text"
                  placeholder="e.g. Kinnigoli Bus Stand or Kateel Cross"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-navy-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Affected Route</label>
                  <select
                    value={selectedRouteId}
                    onChange={e => setSelectedRouteId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-navy-900"
                  >
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.routeNumber} ({r.origin} - {r.destination})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bus Number (if known)</label>
                  <input
                    type="text"
                    placeholder="e.g. KA-19-F-1402"
                    value={busNumber}
                    onChange={e => setBusNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide details: What time did you arrive? How many students were stranded? Did the driver give any reason?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-navy-900 placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting Report...' : 'Broadcast Transport Report'}</span>
              </button>
            </form>
          </div>

          {/* REPORTS FEED (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-navy-900">Community Issue Feed</h2>
                <p className="text-xs text-slate-500">Live public transparency log across Dakshina Kannada</p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold"
                >
                  <option value="all">All Categories ({reports.length})</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredReports.map(rep => (
                <div
                  key={rep.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-navy-900 text-sm">{rep.category}</span>
                        {rep.routeName && (
                          <span className="text-[11px] bg-blue-50 text-brand-blue font-bold px-2 py-0.5 rounded">
                            {rep.routeName}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        📍 <strong>{rep.location}</strong> • Reported by {rep.studentName} • {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <StatusBadge status={rep.status} size="sm" />
                  </div>

                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{rep.description}"
                  </p>

                  {rep.adminNotes && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                        <span>KSRTC Transit Administration Resolution:</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">{rep.adminNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
