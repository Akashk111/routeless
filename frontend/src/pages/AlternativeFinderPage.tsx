import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { AlternativeOption, Bus, Route } from '../types/index.js';
import { ScoreBar } from '../components/common/ScoreBar.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import {
  Shuffle,
  AlertTriangle,
  Clock,
  Footprints,
  Bus as BusIcon,
  Car,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  MapPin,
  Search,
  ExternalLink
} from 'lucide-react';

export const AlternativeFinderPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get('origin') || 'Kinnigoli');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Moodbidri');
  const [preferredTime, setPreferredTime] = useState('07:30');

  const [disruptionDetected, setDisruptionDetected] = useState(false);
  const [disruptionReason, setDisruptionReason] = useState<string | undefined>();
  const [affectedBus, setAffectedBus] = useState<Bus | undefined>();
  const [affectedRoute, setAffectedRoute] = useState<Route | undefined>();
  const [alternatives, setAlternatives] = useState<AlternativeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlternatives();
  }, []);

  const fetchAlternatives = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const data = await api.getAlternatives(origin, destination, preferredTime);
      setDisruptionDetected(data.disruptionDetected);
      setDisruptionReason(data.disruptionReason);
      setAffectedBus(data.affectedBus);
      setAffectedRoute(data.affectedRoute);
      setAlternatives(data.alternatives);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getOptionIcon = (type: AlternativeOption['type']) => {
    switch (type) {
      case 'connecting_bus':
        return <BusIcon className="w-5 h-5 text-brand-blue" />;
      case 'nearby_village_bus':
        return <Footprints className="w-5 h-5 text-emerald-600" />;
      case 'shared_rural_feeder':
        return <Car className="w-5 h-5 text-amber-600" />;
      case 'community_pool':
        return <Users className="w-5 h-5 text-purple-600" />;
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'walk':
        return <Footprints className="w-3.5 h-3.5 text-slate-500" />;
      case 'bus':
        return <BusIcon className="w-3.5 h-3.5 text-brand-blue" />;
      case 'shared_auto':
        return <Car className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ROUTELESS Core Differentiator Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900">AI Alternative Transport Finder</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            When a regular government bus is cancelled, delayed, or overcrowded, ROUTELESS automatically aggregates nearby cross-village links, synchronizes connecting transit hubs, and ranks verified shared rural feeders with transparent recommendation scores.
          </p>
        </div>

        {/* SEARCH FORM */}
        <form onSubmit={fetchAlternatives} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Origin Village</label>
              <input
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-navy-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Destination College</label>
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-navy-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Departure Time</label>
              <input
                type="time"
                value={preferredTime}
                onChange={e => setPreferredTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-navy-900"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>{isLoading ? 'Scanning Network...' : 'Calculate Alternatives'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* DISRUPTION STATUS CALLOUT BANNER */}
        {disruptionDetected && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 shadow-sm animate-fadeIn space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                  <AlertTriangle className="w-7 h-7 text-rose-600 animate-pulse" />
                </div>
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-200 text-rose-900 mb-1">
                    Direct Service Disruption Detected
                  </div>
                  <h2 className="text-base font-extrabold text-rose-950">
                    {disruptionReason}
                  </h2>
                  <p className="text-xs text-rose-800 mt-1">
                    Route <strong>{affectedRoute?.routeNumber || '14B'}</strong> ({origin} → {destination}) is non-operational. Without intervention, students risk missing morning classes and exams.
                  </p>
                </div>
              </div>

              {affectedBus && (
                <div className="text-right shrink-0 hidden sm:block">
                  <StatusBadge status={affectedBus.status} size="lg" />
                  <div className="text-[11px] text-slate-500 mt-1">Bus {affectedBus.busNumber}</div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-rose-200 flex flex-wrap items-center justify-between text-xs text-rose-900">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                ROUTELESS Alternative Algorithm generated {alternatives.length} verified fallback routes below.
              </span>
              <span className="text-[11px] text-rose-700">Estimated arrival before 08:45 AM</span>
            </div>
          </div>
        )}

        {/* ALTERNATIVES CARDS GRID */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900">
              Ranked Alternative Travel Options
            </h2>
            <span className="text-xs text-slate-500">Sorted by AI Match Score</span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              <Shuffle className="w-8 h-8 text-brand-blue animate-spin mx-auto mb-2" />
              <span>Checking connecting bus routes, nearby village stops, and verified shared rural feeders...</span>
            </div>
          ) : alternatives.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No alternatives found for this pair. Try adjusting your departure time or village.
            </div>
          ) : (
            alternatives.map((alt, idx) => (
              <div
                key={alt.id}
                className={`bg-white rounded-2xl border transition overflow-hidden shadow-sm hover:shadow-md ${
                  idx === 0 ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                      {getOptionIcon(alt.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {idx === 0 && (
                          <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            #1 Top Recommended
                          </span>
                        )}
                        <h3 className="text-base font-extrabold text-navy-900">{alt.title}</h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-2xl">{alt.description}</p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="w-full md:w-64 shrink-0 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                    <ScoreBar score={alt.score} breakdown={alt.scoreBreakdown} />
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-4 bg-white border-b border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Departure & Arrival</span>
                    <strong className="text-navy-900 text-sm">
                      {alt.departureTime} → {alt.arrivalTime}
                    </strong>
                    <span className="text-[11px] text-slate-500 block">({alt.durationMin} mins total)</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Walking Required</span>
                    <strong className="text-slate-800 text-sm">{alt.walkingDistanceMeters}m</strong>
                    <span className="text-[11px] text-slate-500 block">~{alt.walkingDurationMin} mins walk</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Cost</span>
                    <strong className="text-emerald-600 text-sm font-bold">₹{alt.fareRupees}</strong>
                    <span className="text-[11px] text-slate-500 block">Student pass applicable</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Connection Hub</span>
                    <strong className="text-slate-800 text-sm">{alt.intermediateHub || 'Direct Multi-modal'}</strong>
                    <span className="text-[11px] text-emerald-600 font-semibold block">Confirmed Route</span>
                  </div>
                </div>

                {/* Why Recommended AI explanation */}
                <div className="px-6 py-3 bg-blue-50/50 border-b border-slate-100 flex items-start gap-2 text-xs text-brand-blue-dark">
                  <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <strong>Why ROUTELESS recommends this:</strong> {alt.whyRecommended}
                  </div>
                </div>

                {/* Step-by-Step Navigation */}
                <div className="p-6 space-y-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Step-by-Step Multi-modal Journey Guide
                  </div>

                  <div className="space-y-3">
                    {alt.steps.map((st, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-3 text-xs">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                          {getStepIcon(st.type)}
                        </div>
                        <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                          <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                            <span>{st.from} → {st.to}</span>
                            <span className="text-slate-500 font-medium text-[11px]">
                              {st.durationMin} mins {st.distanceText ? `(${st.distanceText})` : ''}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{st.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      {alt.isSimulatedEstimate ? 'Demo alternative estimate based on rural transit operator union agreements.' : 'Verified KSRTC connecting timetable.'}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        to="/ai-assistant"
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold transition"
                      >
                        Ask AI About This Option
                      </Link>

                      <Link
                        to="/tracking"
                        className="px-4 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white font-bold shadow-sm transition"
                      >
                        Select & Track This Route
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
