import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api.js';
import { Bus, Route, BusType } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { getBusImage, handleImageFallback } from '../utils/busImages.js';
import {
  Radio,
  MapPin,
  Compass,
  Bus as BusIcon,
  Navigation,
  Clock,
  Users,
  ShieldCheck,
  RefreshCw,
  Search,
  AlertTriangle,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';

// Custom Leaflet Icons using standard DivIcon so we don't depend on external PNGs
const createBusIcon = (status: string, busType: string, isSelected: boolean) => {
  let color = '#2563EB'; // brand blue
  if (status === 'Delayed') color = '#D97706';
  else if (status === 'Full Capacity') color = '#7C3AED';
  else if (status === 'Cancelled') color = '#DC2626';
  else if (status === 'Approaching Stop') color = '#10B981';

  const size = isSelected ? 40 : 32;
  const border = isSelected ? '3px solid #F59E0B' : '2px solid white';

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35); border: ${border}; transition: all 0.2s ease;">
        <span style="font-size: ${isSelected ? '18px' : '15px'};">🚌</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const stopIcon = (isHub?: boolean) => L.divIcon({
  className: 'custom-stop-marker',
  html: `
    <div style="background-color: ${isHub ? '#F59E0B' : '#102A43'}; width: ${isHub ? '16px' : '12px'}; height: ${isHub ? '16px' : '12px'}; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Color palettes for route polylines
const ROUTE_COLORS: Record<string, string> = {
  'route-31m': '#2563EB',
  'route-14b': '#D97706',
  'route-1exp': '#8B5CF6',
  'route-42u': '#10B981',
  'route-16k': '#EC4899',
  'route-24p': '#06B6D4',
  'route-77b': '#6366F1',
  'route-88u': '#F97316',
  'route-31c': '#14B8A6',
  'route-45f': '#EAB308',
  'route-22a': '#84CC16',
  'route-60b': '#A855F7',
  'route-18c': '#0EA5E9',
  'route-92m': '#F43F5E',
  'route-11s': '#3B82F6',
  'route-alv-sh': '#10B981'
};

export const LiveTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const highlightedBusId = searchParams.get('bus');
  const highlightedRouteId = searchParams.get('route');

  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [filterRoute, setFilterRoute] = useState<string>(highlightedRouteId || 'all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3500); // Poll simulator positions every 3.5s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [busList, routeList] = await Promise.all([
        api.getBuses(),
        api.getRoutes()
      ]);
      setBuses(busList);
      setRoutes(routeList);

      if (highlightedBusId) {
        const found = busList.find(b => b.id === highlightedBusId || b.routeId === highlightedBusId || b.busNumber === highlightedBusId);
        if (found) setSelectedBus(found);
      } else if (!selectedBus && busList.length > 0) {
        setSelectedBus(busList[0]);
      } else if (selectedBus) {
        // Keep selected bus data synced
        const updated = busList.find(b => b.id === selectedBus.id);
        if (updated) setSelectedBus(updated);
      }
    } catch (e) {
      console.error('Error fetching live bus coordinates', e);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredBuses = buses.filter(bus => {
    const matchesRoute = filterRoute === 'all' || bus.routeId === filterRoute;
    const matchesType = filterType === 'all' || bus.busType === filterType;
    return matchesRoute && matchesType;
  });

  const activeSelectedRoute = selectedBus ? routes.find(r => r.id === selectedBus.routeId) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>OpenStreetMap Live Radar</span>
            </div>
            <h1 className="text-3xl font-extrabold text-navy-900">Live Bus GPS Tracking</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live radar monitoring 26 active fleet vehicles with dynamic ETA recalculation across Dakshina Kannada & Udupi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1 rounded-xl shadow-xs">
              DEMO LIVE TRACKING — Simulated GPS
            </span>
            <button
              onClick={handleManualRefresh}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition"
              title="Refresh radar coordinates"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* MAP & SIDEBAR CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* MAP CANVAS (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden h-[640px] relative">
            <MapContainer
              center={[13.06, 74.92]}
              zoom={10}
              scrollWheelZoom={false}
              className="h-full w-full z-10"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* ROUTE POLYLINES */}
              {routes.map(r => {
                const isSelected = selectedBus?.routeId === r.id;
                // If a bus is selected, make others dimmer
                const isFiltered = filterRoute === 'all' || filterRoute === r.id;
                if (!isFiltered) return null;

                const coords: [number, number][] = r.stops.map(s => [s.latitude, s.longitude]);
                return (
                  <Polyline
                    key={r.id}
                    positions={coords}
                    pathOptions={{
                      color: isSelected ? '#F59E0B' : ROUTE_COLORS[r.id] || '#2563EB',
                      weight: isSelected ? 6 : 3,
                      opacity: isSelected ? 1 : selectedBus ? 0.35 : 0.7,
                      dashArray: r.status === 'Disrupted' ? '6, 8' : undefined
                    }}
                  />
                );
              })}

              {/* BUS STOP WAYPOINTS (Highlighting selected bus route stops) */}
              {routes.flatMap(r => r.stops).map((stop, idx) => {
                const isSelectedRouteStop = activeSelectedRoute?.stops.some(s => s.id === stop.id);

                return (
                  <Marker
                    key={`stop-${stop.id}-${idx}`}
                    position={[stop.latitude, stop.longitude]}
                    icon={stopIcon(stop.isHub)}
                  >
                    <Popup>
                      <div className="text-xs space-y-1">
                        <div className="font-bold text-navy-900">{stop.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {stop.isHub ? '⭐ Major Rural Interchange Hub' : 'Village Bus Stop'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {stop.latitude.toFixed(4)}°N, {stop.longitude.toFixed(4)}°E
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* MOVING BUS MARKERS */}
              {filteredBuses.map(bus => {
                const isSelected = selectedBus?.id === bus.id;
                return (
                  <Marker
                    key={bus.id}
                    position={[bus.currentLat, bus.currentLng]}
                    icon={createBusIcon(bus.status, bus.busType, isSelected)}
                    eventHandlers={{
                      click: () => setSelectedBus(bus)
                    }}
                  >
                    <Popup>
                      <div className="text-xs p-1 space-y-1.5 min-w-[220px]">
                        <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-slate-100 mb-1 border border-slate-200">
                          <img
                            src={bus.imageUrl || getBusImage(bus.busType, bus.busNumber)}
                            onError={(e) => handleImageFallback(e, bus.busType, bus.busNumber)}
                            alt={bus.busNumber}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <strong className="text-navy-900 font-extrabold">{bus.busNumber}</strong>
                          <StatusBadge status={bus.status} size="sm" />
                        </div>
                        <div className="text-[11px] font-semibold text-brand-blue">{bus.busName}</div>
                        <div className="text-slate-600 text-[11px]">{bus.routeName}</div>
                        <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                          <div>Speed: <strong>{bus.speedKmH} km/h</strong></div>
                          <div>Next Stop: <strong>{bus.nextStopName} ({bus.distanceToNextStopKm} km)</strong></div>
                          <div>ETA Destination: <strong>{bus.etaDestination}</strong></div>
                          <div>Available: <strong>{bus.availableSeats} of {bus.capacity} seats</strong></div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Over-the-map Legend */}
            <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200/90 shadow-md text-[11px] space-y-1 hidden sm:block">
              <div className="font-bold text-navy-900">Map Legend</div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>On Time Bus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Delayed Bus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600"></span>
                <span>Cancelled Bus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                <span>Full Capacity (0 seats)</span>
              </div>
            </div>
          </div>

          {/* SIDEBAR: FILTERS & SELECTED BUS TELEMETRY PANEL (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Fleet Filters
                </span>
                <span className="text-slate-400 font-normal">({filteredBuses.length} active)</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Bus Type</label>
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold"
                  >
                    <option value="all">All Types</option>
                    <option value="KSRTC Ordinary">KSRTC Ordinary</option>
                    <option value="Express">Express</option>
                    <option value="Private Route">Private Route</option>
                    <option value="College Shuttle">College Shuttle</option>
                    <option value="Shared Feeder">Shared Feeder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Route Corridor</label>
                  <select
                    value={filterRoute}
                    onChange={e => setFilterRoute(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold"
                  >
                    <option value="all">All Corridors</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.routeNumber} ({r.origin}-{r.destination})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SELECTED BUS DETAILED INFORMATION PANEL (Section 6 Requirement) */}
            {selectedBus && (
              <div className="bg-white p-5 rounded-2xl border-2 border-brand-blue shadow-md text-xs space-y-4 animate-fadeIn">
                {/* Visual Bus Photo Header */}
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 group">
                  <img
                    src={selectedBus.imageUrl || getBusImage(selectedBus.busType, selectedBus.busNumber)}
                    onError={(e) => handleImageFallback(e, selectedBus.busType, selectedBus.busNumber)}
                    alt={selectedBus.busNumber}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px]">
                    <span className="font-mono font-bold bg-navy-900/90 px-2 py-0.5 rounded border border-slate-700">
                      {selectedBus.busNumber}
                    </span>
                    <span className="font-bold text-amber-300">
                      {selectedBus.availableSeats} seats free
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {selectedBus.busType} • {selectedBus.operator}
                    </span>
                    <h3 className="text-base font-extrabold text-navy-900 flex items-center gap-1.5 flex-wrap">
                      <span>{selectedBus.busNumber}</span>
                      <span className="text-xs font-normal text-slate-500">({selectedBus.busName})</span>
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-mono text-[10px] font-bold border border-amber-300 rounded">
                        Reg: {selectedBus.registrationNumber || 'KA-19-F-1401'}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-300 rounded">
                        DEMO GPS SIMULATOR
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={selectedBus.status} size="md" />
                </div>

                {/* Route Header */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Assigned Route</div>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{selectedBus.routeName}</div>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-2 gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Next Stop</span>
                    <strong className="text-navy-900 text-xs block">{selectedBus.nextStopName}</strong>
                    <span className="text-[10px] text-slate-500">Distance: {selectedBus.distanceToNextStopKm} km</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">ETA Next Stop</span>
                    <strong className="text-brand-blue text-xs block">{selectedBus.etaNextStop}</strong>
                    <span className="text-[10px] text-slate-500">Speed: {selectedBus.speedKmH} km/h</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Final Terminus</span>
                    <strong className="text-navy-900 text-xs block">{selectedBus.destination}</strong>
                    <span className="text-[10px] text-slate-500">Remaining: {selectedBus.remainingDistanceKm} km</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">ETA Terminus</span>
                    <strong className="text-emerald-600 text-xs block">{selectedBus.etaDestination}</strong>
                    <span className="text-[10px] text-slate-500">Total: {selectedBus.totalDistanceKm} km</span>
                  </div>
                </div>

                {/* Visual Seat Capacity Progress Bar (Section 8 Requirement) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Seat Availability:</span>
                    <span className={`font-bold ${selectedBus.availableSeats > 5 ? 'text-emerald-600' : selectedBus.availableSeats > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {selectedBus.availableSeats} / {selectedBus.capacity} seats free
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedBus.availableSeats > 10 ? 'bg-emerald-500' : selectedBus.availableSeats > 0 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, (selectedBus.availableSeats / selectedBus.capacity) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Driver / Conductor Details */}
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Driver: <strong>{selectedBus.driverName || 'Depot Driver'}</strong></span>
                  <span className="text-brand-blue font-semibold">{selectedBus.driverPhone}</span>
                </div>
              </div>
            )}

            {/* Fleet List Scroll */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2 max-h-[260px] overflow-y-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                All Fleet Radar Telemetry ({filteredBuses.length})
              </div>
              {filteredBuses.map(bus => (
                <div
                  key={bus.id}
                  onClick={() => setSelectedBus(bus)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    selectedBus?.id === bus.id
                      ? 'bg-blue-50/80 border-brand-blue'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-navy-900 font-bold">{bus.busNumber}</strong>
                    <StatusBadge status={bus.status} size="sm" />
                  </div>
                  <div className="text-slate-600 text-[11px] truncate">{bus.routeName}</div>
                  <div className="text-[10px] text-slate-400 flex justify-between mt-1">
                    <span>Next: {bus.nextStopName.split(' ')[0]}</span>
                    <span className={bus.availableSeats > 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                      {bus.availableSeats} seats
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
