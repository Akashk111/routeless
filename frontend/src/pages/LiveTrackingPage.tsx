import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api.js';
import { Bus, Route } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
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
  AlertTriangle
} from 'lucide-react';

// Custom Leaflet Icons using standard DivIcon so we don't depend on external PNGs
const createBusIcon = (status: string, heading: number = 0) => {
  let color = '#2563EB'; // brand blue
  if (status === 'Delayed') color = '#D97706';
  else if (status === 'Full Capacity') color = '#7C3AED';
  else if (status === 'Cancelled') color = '#DC2626';
  else if (status === 'Approaching Stop') color = '#10B981';

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
        <span style="font-size: 16px; transform: rotate(${heading}deg); display: inline-block;">🚌</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

const stopIcon = L.divIcon({
  className: 'custom-stop-marker',
  html: `
    <div style="background-color: #102A43; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Color palettes for route polylines
const ROUTE_COLORS: Record<string, string> = {
  'route-14b': '#2563EB',
  'route-22a': '#10B981',
  'route-31c': '#F59E0B',
  'route-45f': '#8B5CF6',
  'route-55s': '#EC4899',
  'route-60b': '#06B6D4'
};

export const LiveTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const highlightedBusId = searchParams.get('bus');

  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [filterRoute, setFilterRoute] = useState<string>('all');
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
        const found = busList.find(b => b.id === highlightedBusId || b.routeId === highlightedBusId);
        if (found) setSelectedBus(found);
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

  const filteredBuses = filterRoute === 'all'
    ? buses
    : buses.filter(b => b.routeId === filterRoute);

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
              Simulated demonstration GPS tracking across the Dakshina Kannada rural network. Positions update every 3.5 seconds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-lg">
              ⚠️ Simulated GPS Data (Demo)
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
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden h-[620px] relative">
            <MapContainer
              center={[13.02, 74.89]}
              zoom={11}
              scrollWheelZoom={false}
              className="h-full w-full z-10"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* ROUTE POLYLINES */}
              {routes.map(r => {
                if (filterRoute !== 'all' && r.id !== filterRoute) return null;
                const coords: [number, number][] = r.stops.map(s => [s.latitude, s.longitude]);
                return (
                  <Polyline
                    key={r.id}
                    positions={coords}
                    pathOptions={{
                      color: ROUTE_COLORS[r.id] || '#2563EB',
                      weight: 4,
                      opacity: 0.7,
                      dashArray: r.status === 'Disrupted' ? '6, 8' : undefined
                    }}
                  />
                );
              })}

              {/* BUS STOP WAYPOINTS */}
              {routes.flatMap(r => r.stops).map((stop, idx) => (
                <Marker
                  key={`stop-${stop.id}-${idx}`}
                  position={[stop.latitude, stop.longitude]}
                  icon={stopIcon}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-navy-900">{stop.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {stop.isHub ? '⭐ Major Rural Interchange Hub' : 'Village Regular Bus Stop'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {stop.latitude.toFixed(4)}°N, {stop.longitude.toFixed(4)}°E
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* MOVING BUS MARKERS */}
              {filteredBuses.map(bus => (
                <Marker
                  key={bus.id}
                  position={[bus.currentLat, bus.currentLng]}
                  icon={createBusIcon(bus.status, bus.heading)}
                  eventHandlers={{
                    click: () => setSelectedBus(bus)
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1 space-y-1.5 min-w-[180px]">
                      <div className="flex items-center justify-between">
                        <strong className="text-navy-900 font-extrabold">{bus.busNumber}</strong>
                        <StatusBadge status={bus.status} size="sm" />
                      </div>
                      <div className="text-slate-600 font-medium">{bus.routeName}</div>
                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <div>Speed: <strong>{bus.speedKmH} km/h</strong></div>
                        <div>Available: <strong>{bus.availableSeats} / {bus.capacity} seats</strong></div>
                        <div>Operator: {bus.operator}</div>
                        {bus.delayMinutes > 0 && (
                          <div className="text-amber-600 font-bold">Delay: +{bus.delayMinutes} mins</div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Over-the-map Legend */}
            <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200/90 shadow-md text-[11px] space-y-1.5 hidden sm:block">
              <div className="font-bold text-navy-900">Network Map Legend</div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>On Time Bus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Delayed (+15m)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-600"></span>
                <span>Cancelled Service</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                <span>Full Capacity (0 seats)</span>
              </div>
            </div>
          </div>

          {/* SIDEBAR: BUS LIST & SELECTED BUS TELEMETRY (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Filter by Route Dropdown */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Filter by Route</label>
              <select
                value={filterRoute}
                onChange={e => setFilterRoute(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-navy-900"
              >
                <option value="all">All Rural Corridors ({buses.length} active buses)</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.routeNumber} ({r.routeName})</option>
                ))}
              </select>
            </div>

            {/* Selected Bus Detailed Telemetry */}
            {selectedBus ? (
              <div className="bg-white p-5 rounded-2xl border-2 border-brand-blue shadow-md text-xs space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Selected Telemetry</span>
                    <h3 className="text-base font-extrabold text-navy-900">{selectedBus.busNumber}</h3>
                  </div>
                  <StatusBadge status={selectedBus.status} size="md" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Route:</span>
                    <span className="font-bold text-slate-800">{selectedBus.routeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operator:</span>
                    <span className="font-medium text-slate-700">{selectedBus.operator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Speed:</span>
                    <span className="font-bold text-slate-900">{selectedBus.speedKmH} km/h (GPS radar)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Seats Free:</span>
                    <span className={`font-bold ${selectedBus.availableSeats > 5 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedBus.availableSeats} of {selectedBus.capacity} seats
                    </span>
                  </div>
                  {selectedBus.driverName && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Driver / Conductor:</span>
                      <span className="font-medium text-slate-700">{selectedBus.driverName}</span>
                    </div>
                  )}
                  {selectedBus.driverPhone && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Depot Contact:</span>
                      <span className="font-medium text-brand-blue">{selectedBus.driverPhone}</span>
                    </div>
                  )}
                </div>

                {selectedBus.status === 'Cancelled' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Service Cancelled</span>
                    </div>
                    <p className="text-[11px]">
                      Students expecting this bus should immediately consult Alternative Transport Finder for connecting feeder routes.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center text-xs text-slate-500 py-6">
                <BusIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>Click on any bus pin on the map or select from the fleet list below to view telemetry.</p>
              </div>
            )}

            {/* Fleet Cards List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2 max-h-[290px] overflow-y-auto">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Active Fleet Radar ({filteredBuses.length})
              </div>
              {filteredBuses.map(bus => (
                <div
                  key={bus.id}
                  onClick={() => setSelectedBus(bus)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    selectedBus?.id === bus.id
                      ? 'bg-blue-50/60 border-brand-blue'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-navy-900 font-bold">{bus.busNumber}</strong>
                    <StatusBadge status={bus.status} size="sm" />
                  </div>
                  <div className="text-slate-600 text-[11px] truncate">{bus.routeName}</div>
                  <div className="text-[10px] text-slate-400 flex justify-between mt-1">
                    <span>{bus.speedKmH} km/h</span>
                    <span>{bus.availableSeats} seats free</span>
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
