import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Bus, BusStatus } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import {
  Bus as BusIcon,
  Radio,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Navigation,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>('bus-ka19-1402');
  const [delayMinutes, setDelayMinutes] = useState(25);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [status, setStatus] = useState<BusStatus>('Delayed');
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      const list = await api.getBuses();
      setBuses(list);
      const myBus = list.find(b => b.id === selectedBusId) || list[0];
      if (myBus) {
        setSelectedBusId(myBus.id);
        setStatus(myBus.status);
        setDelayMinutes(myBus.delayMinutes);
        setAvailableSeats(myBus.availableSeats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectBus = (b: Bus) => {
    setSelectedBusId(b.id);
    setStatus(b.status);
    setDelayMinutes(b.delayMinutes);
    setAvailableSeats(b.availableSeats);
  };

  const handleSaveTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateBus(selectedBusId, {
        status,
        delayMinutes: Number(delayMinutes),
        availableSeats: Number(availableSeats)
      });
      setBuses(prev => prev.map(b => b.id === selectedBusId ? updated : b));
      setFlashMessage(`Bus ${updated.busNumber} telemetry broadcasted to students and admin.`);
      setTimeout(() => setFlashMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateBreakdown = async () => {
    try {
      const updated = await api.updateBus(selectedBusId, {
        status: 'Cancelled',
        speedKmH: 0,
        availableSeats: 0
      });
      setStatus('Cancelled');
      setAvailableSeats(0);
      setBuses(prev => prev.map(b => b.id === selectedBusId ? updated : b));
      setFlashMessage(`⚠️ Bus ${updated.busNumber} marked CANCELLED. Alternative routes triggered!`);
      setTimeout(() => setFlashMessage(null), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const activeBus = buses.find(b => b.id === selectedBusId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <BusIcon className="w-4 h-4 text-amber-500" />
              <span>Driver & Conductor Active Telemetry Console</span>
            </div>
            <h1 className="text-2xl font-extrabold text-navy-900">Operator Duty Console</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in: <strong>{user?.name}</strong> • Moodbidri Depot (Dakshina Kannada Rural Fleet)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-50 text-brand-blue font-bold px-3 py-1.5 rounded-xl border border-blue-200">
              Assigned: Route 14B Lead Bus
            </span>
          </div>
        </div>

        {/* FLASH TOAST */}
        {flashMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{flashMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* BUS SELECTOR (4 cols) */}
          <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Active Vehicle</h3>
            <div className="space-y-2">
              {buses.map(b => (
                <div
                  key={b.id}
                  onClick={() => handleSelectBus(b)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    b.id === selectedBusId
                      ? 'bg-blue-50/80 border-brand-blue ring-2 ring-brand-blue/10'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-navy-900">{b.busNumber}</strong>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                  <div className="text-[11px] text-slate-600">{b.routeName}</div>
                </div>
              ))}
            </div>
          </div>

          {/* TELEMETRY UPDATE FORM (8 cols) */}
          <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-navy-900">
                  Update Trip Telemetry: {activeBus?.busNumber}
                </h2>
                <p className="text-xs text-slate-500">{activeBus?.routeName}</p>
              </div>
              <StatusBadge status={status} size="md" />
            </div>

            <form onSubmit={handleSaveTelemetry} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Live Operational Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as BusStatus)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-navy-900"
                  >
                    <option value="On Time">On Time</option>
                    <option value="Approaching Stop">Approaching Stop</option>
                    <option value="Delayed">Delayed (+15 to 30 mins)</option>
                    <option value="Full Capacity">Full Capacity (No Boarding)</option>
                    <option value="Cancelled">Cancelled (Breakdown)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delay in Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={delayMinutes}
                    onChange={e => setDelayMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-navy-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Seats for Students</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={availableSeats}
                    onChange={e => setAvailableSeats(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-navy-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">0 seats flags "Full Capacity" alert</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Speed</label>
                  <div className="px-3 py-2 bg-slate-100 rounded-xl text-slate-600 font-semibold">
                    {activeBus?.speedKmH || 40} km/h (GPS Simulated)
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-md transition"
                >
                  Broadcast Telemetry Update
                </button>

                <button
                  type="button"
                  onClick={handleSimulateBreakdown}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Report Breakdown / Cancellation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
