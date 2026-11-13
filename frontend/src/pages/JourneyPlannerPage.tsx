import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { OptimizedJourney, BusType } from '../types/index.js';
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
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Tag,
  Radio
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
  'Bantwal',
  'Puttur',
  'Uppinangady',
  'Belthangady',
  'Udupi',
  'Karkala',
  'Manipal',
  'Mangaluru'
];

const DESTINATION_OPTIONS = [
  'Moodbidri (Alva\'s College)',
  'Vamanjoor (St. Joseph Engg)',
  'Surathkal (NITK Campus)',
  'Bantwal (Canara Engg)',
  'Bajpe Bus Station',
  'Udupi Service Bus Stand',
  'Karkala Bus Stand',
  'Puttur KSRTC Stand',
  'Uppinangady Sangam',
  'Belthangady Bus Stand',
  'Mangaluru State Bank'
];

export const JourneyPlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search Inputs
  const [origin, setOrigin] = useState(searchParams.get('origin') || 'Kinnigoli');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Moodbidri');
  const [preferredTime, setPreferredTime] = useState(searchParams.get('time') || '07:30');
  const [travelDate, setTravelDate] = useState('2026-11-13');
  const [passengers, setPassengers] = useState(1);

  // Filter & Sorting States
  const [sortBy, setSortBy] = useState<'fastest' | 'cheapest' | 'fewest_transfers' | 'shortest_distance' | 'earliest_departure'>('fastest');
  const [busTypeFilter, setBusTypeFilter] = useState<string>('all');
  const [maxFare, setMaxFare] = useState<number | undefined>(undefined);
  const [minSeats, setMinSeats] = useState<number | undefined>(undefined);
  const [maxTransfers, setMaxTransfers] = useState<string>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Expanded stops tracking for each card
  const [expandedStops, setExpandedStops] = useState<Record<string, boolean>>({});

  const [journeys, setJourneys] = useState<OptimizedJourney[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    handleSearch();
  }, [sortBy, busTypeFilter, maxTransfers, operatorFilter]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await api.planJourney({
        origin,
        destination,
        time: preferredTime,
        sort: sortBy,
        busType: busTypeFilter !== 'all' ? busTypeFilter : undefined,
        maxFare: maxFare ? Number(maxFare) : undefined,
        minSeats: minSeats ? Number(minSeats) : undefined,
        maxTransfers: maxTransfers !== 'all' ? Number(maxTransfers) : undefined,
        operator: operatorFilter !== 'all' ? operatorFilter : undefined
      });
      setJourneys(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStops = (journeyId: string) => {
    setExpandedStops(prev => ({ ...prev, [journeyId]: !prev[journeyId] }));
  };

  const getBusTypeBadge = (type: BusType | string) => {
    switch (type) {
      case 'Express':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'College Shuttle':
        return 'bg-blue-100 text-brand-blue border-blue-300';
      case 'Private Route':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Shared Feeder':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'KSRTC Ordinary':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Interactive Multi-Bus Transit Scheduler</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900">Smart Rural Journey Planner</h1>
          <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
            Real-time timetable queries across 18 rural corridors with Dijkstra graph routing, transfer waiting calculations, exact road distances, and live seat telemetry.
          </p>
        </div>

        {/* SEARCH FILTER CARD */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Origin */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                Starting Village / Town
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
                Destination College / Station
              </label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {DESTINATION_OPTIONS.map(d => (
                  <option key={d} value={d.split(' ')[0]}>{d}</option>
                ))}
              </select>
            </div>

            {/* Departure Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Departure Time
              </label>
              <input
                type="time"
                value={preferredTime}
                onChange={e => setPreferredTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {/* Travel Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Travel Date
              </label>
              <input
                type="date"
                value={travelDate}
                onChange={e => setTravelDate(e.target.value)}
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
                <span>{isLoading ? 'Searching...' : 'Search Timetables'}</span>
              </button>
            </div>
          </div>

          {/* Toggle Advanced Filters */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters & Sorting'}</span>
              {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <span className="text-[11px] text-slate-400">
              Showing real schedules from regional bus database
            </span>
          </div>

          {/* Advanced Filter Panel */}
          {showAdvancedFilters && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs animate-fadeIn">
              {/* Bus Type */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bus Type</label>
                <select
                  value={busTypeFilter}
                  onChange={e => setBusTypeFilter(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                >
                  <option value="all">All Bus Types</option>
                  <option value="KSRTC Ordinary">KSRTC Ordinary Sarige</option>
                  <option value="Express">Express (Rajahamsa)</option>
                  <option value="Private Route">Coastal Private Buses</option>
                  <option value="College Shuttle">College Campus Buses</option>
                  <option value="Shared Feeder">Shared Maxicab Feeders</option>
                </select>
              </div>

              {/* Max Transfers */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Transfers</label>
                <select
                  value={maxTransfers}
                  onChange={e => setMaxTransfers(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                >
                  <option value="all">Any (Direct & Connecting)</option>
                  <option value="0">Direct Buses Only (0 Transfers)</option>
                  <option value="1">1 Transfer Max (Connecting Hub)</option>
                </select>
              </div>

              {/* Min Available Seats */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Min Available Seats</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  min="0"
                  max="50"
                  value={minSeats || ''}
                  onChange={e => setMinSeats(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                />
              </div>

              {/* Max Fare */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Fare (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  min="10"
                  max="200"
                  value={maxFare || ''}
                  onChange={e => setMaxFare(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>
          )}
        </form>

        {/* RESULTS HEADER & SORTING OPTIONS */}
        {hasSearched && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-navy-900">
                Available Scheduled Journeys from <span className="text-brand-blue font-extrabold">{origin}</span> to <span className="text-brand-blue font-extrabold">{destination}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Found {journeys.length} verified journey option{journeys.length === 1 ? '' : 's'}
              </p>
            </div>

            {/* Sorting Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1">Sort by:</span>
              <button
                onClick={() => setSortBy('fastest')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  sortBy === 'fastest' ? 'bg-brand-blue text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Fastest Arrival
              </button>
              <button
                onClick={() => setSortBy('cheapest')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  sortBy === 'cheapest' ? 'bg-brand-blue text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Lowest Fare
              </button>
              <button
                onClick={() => setSortBy('fewest_transfers')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  sortBy === 'fewest_transfers' ? 'bg-brand-blue text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Fewest Transfers
              </button>
              <button
                onClick={() => setSortBy('shortest_distance')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  sortBy === 'shortest_distance' ? 'bg-brand-blue text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Shortest Distance
              </button>
              <button
                onClick={() => setSortBy('earliest_departure')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  sortBy === 'earliest_departure' ? 'bg-brand-blue text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Earliest Dep
              </button>
            </div>
          </div>
        )}

        {/* JOURNEY CARDS LIST */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              <Compass className="w-8 h-8 text-brand-blue animate-spin mx-auto mb-3" />
              <span>Checking 18 rural routes, transfer buffers, and real-time seat capacities...</span>
            </div>
          ) : journeys.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-900">No Scheduled Bus Matches Selected Filters</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  No direct regular bus runs between {origin} and {destination} with your current filter criteria. Use our AI Alternative Finder to check multi-modal connecting routes or shared rural feeds.
                </p>
              </div>
              <Link
                to={`/alternatives?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-amber-600 text-navy-900 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition"
              >
                <Shuffle className="w-4 h-4" />
                <span>Search AI Alternative Routes</span>
              </Link>
            </div>
          ) : (
            journeys.map(journey => {
              const isStopsExpanded = expandedStops[journey.id];
              const isFull = journey.availableSeats <= 0;

              return (
                <div
                  key={journey.id}
                  className={`bg-white rounded-2xl border transition overflow-hidden shadow-xs hover:shadow-md ${
                    isFull ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200/90'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="bg-slate-50/90 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getBusTypeBadge(journey.primaryBusType)}`}>
                        {journey.primaryBusType}
                      </span>
                      <span className="font-extrabold text-navy-900 text-sm">
                        {journey.legs.map(l => `${l.routeNumber} (${l.busNumber})`).join(' ➔ ')}
                      </span>
                      <StatusBadge status={journey.statusSummary} size="sm" />
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Operator</span>
                        <span className="text-slate-700 font-semibold">{journey.primaryOperator}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Transfers</span>
                        <span className="font-bold text-navy-900">
                          {journey.transferCount === 0 ? 'Direct (0 Transfers)' : `${journey.transferCount} Transfer (${journey.transfersAt.join(', ')})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Journey Details Grid */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs items-center">
                      {/* Departure */}
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Departure</span>
                        <div className="text-lg font-black text-navy-900">{journey.departureTime}</div>
                        <div className="text-[11px] font-medium text-slate-600 truncate">{journey.origin}</div>
                      </div>

                      {/* Travel Duration Indicator */}
                      <div className="text-center">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
                        <div className="text-xs font-bold text-brand-blue">{journey.totalDurationMin} mins</div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                          <span className="h-0.5 w-12 bg-slate-300 inline-block"></span>
                          <span>➔</span>
                        </div>
                      </div>

                      {/* Arrival */}
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Arrival</span>
                        <div className="text-lg font-black text-emerald-600">{journey.arrivalTime}</div>
                        <div className="text-[11px] font-medium text-slate-600 truncate">{journey.destination}</div>
                      </div>

                      {/* Distance & Fare */}
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Distance & Fare</span>
                        <div className="text-sm font-extrabold text-slate-800">{journey.totalDistanceKm} km</div>
                        <div className="text-xs font-bold text-emerald-600">₹{journey.totalFareRupees} (Concession Valid)</div>
                      </div>

                      {/* Available Seats with visual capacity bar */}
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Available Seats</span>
                        <div className={`text-sm font-black ${journey.availableSeats > 5 ? 'text-emerald-600' : journey.availableSeats > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {journey.availableSeats > 0 ? `${journey.availableSeats} seats free` : 'FULL (0 seats)'}
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${journey.availableSeats > 10 ? 'bg-emerald-500' : journey.availableSeats > 0 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(100, (journey.availableSeats / 50) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Disruption or Full Capacity Notice */}
                    {journey.advisoryNote && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{journey.advisoryNote}</span>
                        </div>
                        {isFull && (
                          <Link
                            to={`/alternatives?origin=${encodeURIComponent(journey.origin)}&destination=${encodeURIComponent(journey.destination)}`}
                            className="font-bold text-brand-blue hover:underline text-[11px] shrink-0"
                          >
                            Find Backup Alternatives →
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Transfer Layover Banner if transfer journey */}
                    {journey.transferCount > 0 && (
                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-brand-blue flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Footprints className="w-3.5 h-3.5 text-brand-blue" />
                          Connection at {journey.transfersAt.join(', ')}
                        </span>
                        <span>Waiting time: ~{journey.waitingTimeMin} mins layover</span>
                      </div>
                    )}

                    {/* Expanded Intermediate Stops List */}
                    {isStopsExpanded && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3 animate-fadeIn">
                        <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                          Complete Intermediate Stop Waypoints
                        </div>
                        {journey.legs.map((leg, lIdx) => (
                          <div key={lIdx} className="space-y-1">
                            <div className="font-semibold text-brand-blue">
                              Leg {lIdx + 1}: {leg.routeNumber} ({leg.routeName}) • Bus {leg.busNumber}
                            </div>
                            <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-1.5">
                              {leg.intermediateStops.map((stop, sIdx) => (
                                <span key={sIdx} className="flex items-center gap-1">
                                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                                    {stop}
                                  </span>
                                  {sIdx < leg.intermediateStops.length - 1 && <span>➔</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleStops(journey.id)}
                        className="text-slate-500 hover:text-navy-900 font-semibold flex items-center gap-1 transition"
                      >
                        <span>{isStopsExpanded ? 'Hide Intermediate Stops' : 'View Intermediate Stops'}</span>
                        {isStopsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/tracking?bus=${journey.legs[0].busId}`}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition flex items-center gap-1.5"
                        >
                          <Radio className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Track Bus on Map</span>
                        </Link>

                        <Link
                          to={`/alternatives?origin=${encodeURIComponent(journey.origin)}&destination=${encodeURIComponent(journey.destination)}`}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition flex items-center gap-1"
                        >
                          <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Check Alternatives</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
