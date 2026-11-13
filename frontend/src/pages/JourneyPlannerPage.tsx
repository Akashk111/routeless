import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { OptimizedJourney } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import {
  Compass,
  MapPin,
  Clock,
  ArrowRight,
  Shuffle,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Footprints,
  Bus as BusIcon,
  ChevronRight,
  Sparkles,
  Search
} from 'lucide-react';

const VILLAGE_OPTIONS = [
  'Kinnigoli',
  'Kateel',
  'Bajpe',
  'Moodbidri',
  'Gurupura',
  'Vamanjoor',
  'Mulki',
  'Surathkal',
  'Bantwal'
];

const DESTINATION_OPTIONS = [
  'Moodbidri (Alva\'s College)',
  'Vamanjoor (St. Joseph Engg)',
  'Surathkal (NITK Campus)',
  'Bantwal (Canara Engg)',
  'Bajpe Bus Station'
];

export const JourneyPlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get('origin') || 'Kinnigoli');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Moodbidri');
  const [preferredTime, setPreferredTime] = useState(searchParams.get('time') || '07:30');
  const [passengers, setPassengers] = useState(1);
  const [maxWalkDist, setMaxWalkDist] = useState('1.5 km');

  const [journeys, setJourneys] = useState<OptimizedJourney[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'fastest' | 'fewest_transfers' | 'cheapest'>('all');

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await api.planJourney(origin, destination, preferredTime);
      setJourneys(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredJourneys = activeTab === 'all'
    ? journeys
    : journeys.filter(j => j.type === activeTab);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Graph Dijkstra Route Optimization</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900">Smart Rural Journey Planner</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Calculates weighted network paths connecting rural villages with direct services or synchronized 1-2 transfer links.
          </p>
        </div>

        {/* SEARCH FILTER CARD */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Origin */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                Starting Village / Stop
              </label>
              <select
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {VILLAGE_OPTIONS.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                Destination College / Town
              </label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Moodbidri">Moodbidri (Alva's College)</option>
                <option value="Vamanjoor">Vamanjoor (St. Joseph Engg)</option>
                <option value="Surathkal">Surathkal (NITK Campus)</option>
                <option value="Bantwal">Bantwal (Canara Engg)</option>
                <option value="Bajpe">Bajpe Bus Station</option>
              </select>
            </div>

            {/* Departure Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Preferred Departure
              </label>
              <input
                type="time"
                value={preferredTime}
                onChange={e => setPreferredTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {/* Passengers */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Passengers
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={passengers}
                onChange={e => setPassengers(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>{isLoading ? 'Computing Paths...' : 'Find Best Routes'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* RESULTS HEADER & FILTER TABS */}
        {hasSearched && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-navy-900">
                Journeys from <span className="text-brand-blue">{origin}</span> to <span className="text-brand-blue">{destination}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Found {journeys.length} optimized route combination{journeys.length === 1 ? '' : 's'}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'all' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-navy-900'}`}
              >
                All Options ({journeys.length})
              </button>
              <button
                onClick={() => setActiveTab('fastest')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'fastest' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-navy-900'}`}
              >
                Fastest
              </button>
              <button
                onClick={() => setActiveTab('fewest_transfers')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'fewest_transfers' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-navy-900'}`}
              >
                Fewest Transfers
              </button>
              <button
                onClick={() => setActiveTab('cheapest')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'cheapest' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-navy-900'}`}
              >
                Value / Eco
              </button>
            </div>
          </div>
        )}

        {/* JOURNEY CARDS LIST */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              <Compass className="w-8 h-8 text-brand-blue animate-spin mx-auto mb-3" />
              <span>Analyzing graph connectivity and waiting times at interchange hubs...</span>
            </div>
          ) : filteredJourneys.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-900">No Direct Bus Scheduled at Selected Time</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Regular government services between {origin} and {destination} may be cancelled, suspended, or require rural multi-modal connections.
                </p>
              </div>
              <Link
                to={`/alternatives?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-amber-600 text-navy-900 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition"
              >
                <Shuffle className="w-4 h-4" />
                <span>Search AI Multi-Modal Alternatives</span>
              </Link>
            </div>
          ) : (
            filteredJourneys.map(journey => (
              <div
                key={journey.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Card Top Summary Bar */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                      journey.type === 'fastest'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : journey.type === 'fewest_transfers'
                        ? 'bg-blue-100 text-brand-blue border border-blue-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {journey.type === 'fastest' ? '⚡ Fastest Route' : journey.type === 'fewest_transfers' ? 'Direct / Fewest Transfers' : '💰 Most Economical'}
                    </span>
                    <StatusBadge status={journey.statusSummary} size="sm" />
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Duration</span>
                      <strong className="text-navy-900 text-sm">{journey.totalDurationMin} mins</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Distance</span>
                      <strong className="text-slate-700 text-sm">{journey.totalDistanceKm} km</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Fare</span>
                      <strong className="text-emerald-600 text-sm font-bold">₹{journey.totalFareRupees}</strong>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Leg Breakdown */}
                <div className="p-6 space-y-6">
                  {/* Advisory alert if delayed or overcrowded */}
                  {journey.advisoryNote && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{journey.advisoryNote}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {journey.legs.map((leg, idx) => (
                      <div key={idx} className="relative pl-6 border-l-2 border-brand-blue/30 space-y-2">
                        {/* Dot */}
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-brand-blue border-2 border-white ring-2 ring-brand-blue/20 flex items-center justify-center">
                          <BusIcon className="w-2.5 h-2.5 text-white" />
                        </div>

                        {/* Leg header */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-navy-900 text-sm">
                              {leg.routeNumber} ({leg.routeName})
                            </span>
                            <span className="text-xs text-slate-500">• {leg.operator}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-600">
                            Bus {leg.busNumber} • {leg.availableSeats} seats free
                          </span>
                        </div>

                        {/* From & To with Timestamps */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Boarding Point</span>
                            <div className="font-bold text-navy-900 text-xs mt-0.5">{leg.fromStop}</div>
                            <div className="text-brand-blue font-semibold mt-0.5">Dep: {leg.departureTime}</div>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Disembarking Point</span>
                            <div className="font-bold text-navy-900 text-xs mt-0.5">{leg.toStop}</div>
                            <div className="text-emerald-600 font-semibold mt-0.5">Arr: ~{leg.arrivalTime}</div>
                          </div>
                        </div>

                        {/* Layover buffer if there's a next leg */}
                        {idx < journey.legs.length - 1 && (
                          <div className="py-2 px-3 bg-blue-50/70 border border-blue-200/70 rounded-lg text-xs text-brand-blue flex items-center justify-between font-medium">
                            <span className="flex items-center gap-1.5">
                              <Footprints className="w-3.5 h-3.5 text-brand-blue" />
                              Platform Interchange at {leg.toStop}
                            </span>
                            <span>~12 mins layover buffer</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500">
                      Departure in {origin} at <strong>{journey.departureTime}</strong> → Arrive {destination} by <strong>{journey.arrivalTime}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/tracking?bus=${journey.legs[0].routeId}`}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition"
                      >
                        Track Leg 1 Bus
                      </Link>

                      <Link
                        to={`/alternatives?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`}
                        className="px-3.5 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue-dark text-white font-bold shadow-sm transition flex items-center gap-1"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>Check Backup Alternatives</span>
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
