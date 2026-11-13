import { Route, Bus } from '../types/index.js';
import { store } from '../data/store.js';

export interface JourneyLeg {
  routeId: string;
  routeNumber: string;
  routeName: string;
  busNumber: string;
  busStatus: string;
  operator: string;
  fromStop: string;
  toStop: string;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  distanceKm: number;
  fareRupees: number;
  availableSeats: number;
}

export interface OptimizedJourney {
  id: string;
  type: 'fastest' | 'fewest_transfers' | 'cheapest';
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  totalDurationMin: number;
  totalDistanceKm: number;
  totalFareRupees: number;
  transferCount: number;
  transfersAt: string[];
  legs: JourneyLeg[];
  statusSummary: 'Optimal' | 'Delayed' | 'Full Capacity' | 'Cancelled';
  advisoryNote?: string;
}

// Helper to normalize stop/village names for fuzzy matching
export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

export function findMatchingStopInRoute(route: Route, query: string): number {
  const normQuery = normalizeName(query);
  return route.stops.findIndex(s => {
    const normStop = normalizeName(s.name);
    const normVillage = s.villageTag ? normalizeName(s.villageTag) : '';
    return normStop.includes(normQuery) || normQuery.includes(normStop) || (normVillage && (normVillage.includes(normQuery) || normQuery.includes(normVillage)));
  });
}

export function planJourneys(
  originQuery: string,
  destQuery: string,
  preferredTime: string = '07:30'
): OptimizedJourney[] {
  const routes = store.getRoutes();
  const buses = store.getBuses();
  const journeys: OptimizedJourney[] = [];

  // Helper to get active bus info for a route
  const getBusForRoute = (routeId: string) => {
    return buses.find(b => b.routeId === routeId) || buses[0];
  };

  // 1. DIRECT ROUTES
  for (const route of routes) {
    const fromIdx = findMatchingStopInRoute(route, originQuery);
    const toIdx = findMatchingStopInRoute(route, destQuery);

    if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
      const bus = getBusForRoute(route.id);
      const isCancelled = bus.status === 'Cancelled';
      if (isCancelled) continue; // Don't return regular direct route as valid if it's completely cancelled

      const stopCount = toIdx - fromIdx;
      const legDuration = Math.round((route.estimatedDurationMin / Math.max(1, route.stops.length - 1)) * stopCount);
      const legDistance = Number(((route.distanceKm / Math.max(1, route.stops.length - 1)) * stopCount).toFixed(1));
      const legFare = Math.round((route.fareRupees / Math.max(1, route.stops.length - 1)) * stopCount);

      // Find matching schedule time >= preferredTime
      const sched = route.schedule.find(s => s.departureTime >= preferredTime) || route.schedule[0];
      const depTime = sched ? sched.departureTime : preferredTime;
      const [h, m] = depTime.split(':').map(Number);
      const arrMinutes = h * 60 + m + legDuration + (bus.delayMinutes || 0);
      const arrH = Math.floor(arrMinutes / 60) % 24;
      const arrM = arrMinutes % 60;
      const arrTime = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;

      let statusSummary: OptimizedJourney['statusSummary'] = 'Optimal';
      let advisoryNote = undefined;
      if (bus.status === 'Delayed') {
        statusSummary = 'Delayed';
        advisoryNote = `Running ~${bus.delayMinutes}m late due to rural road congestion.`;
      } else if (bus.status === 'Full Capacity') {
        statusSummary = 'Full Capacity';
        advisoryNote = 'Bus is currently at 100% capacity. Boarding may be restricted at intermediate stops.';
      }

      journeys.push({
        id: `journey-dir-${route.id}-${Date.now()}`,
        type: 'fewest_transfers',
        origin: route.stops[fromIdx].name,
        destination: route.stops[toIdx].name,
        departureTime: depTime,
        arrivalTime: arrTime,
        totalDurationMin: legDuration + (bus.delayMinutes || 0),
        totalDistanceKm: legDistance,
        totalFareRupees: legFare,
        transferCount: 0,
        transfersAt: [],
        statusSummary,
        advisoryNote,
        legs: [
          {
            routeId: route.id,
            routeNumber: route.routeNumber,
            routeName: route.routeName,
            busNumber: bus.busNumber,
            busStatus: bus.status,
            operator: bus.operator,
            fromStop: route.stops[fromIdx].name,
            toStop: route.stops[toIdx].name,
            departureTime: depTime,
            arrivalTime: arrTime,
            durationMin: legDuration,
            distanceKm: legDistance,
            fareRupees: legFare,
            availableSeats: bus.availableSeats
          }
        ]
      });
    }
  }

  // 2. CONNECTING 1-TRANSFER ROUTES
  // Route 1 (origin -> Transfer Hub) & Route 2 (Transfer Hub -> destination)
  for (const r1 of routes) {
    const fromIdx = findMatchingStopInRoute(r1, originQuery);
    if (fromIdx === -1) continue;

    for (let i = fromIdx + 1; i < r1.stops.length; i++) {
      const hubStop = r1.stops[i];
      const hubName = hubStop.name;

      for (const r2 of routes) {
        if (r1.id === r2.id) continue;
        const hubIdxInR2 = findMatchingStopInRoute(r2, hubName);
        const toIdxInR2 = findMatchingStopInRoute(r2, destQuery);

        if (hubIdxInR2 !== -1 && toIdxInR2 !== -1 && hubIdxInR2 < toIdxInR2) {
          const bus1 = getBusForRoute(r1.id);
          const bus2 = getBusForRoute(r2.id);

          if (bus1.status === 'Cancelled' || bus2.status === 'Cancelled') continue;

          // Leg 1 calculations
          const leg1Stops = i - fromIdx;
          const leg1Duration = Math.round((r1.estimatedDurationMin / Math.max(1, r1.stops.length - 1)) * leg1Stops);
          const leg1Distance = Number(((r1.distanceKm / Math.max(1, r1.stops.length - 1)) * leg1Stops).toFixed(1));
          const leg1Fare = Math.round((r1.fareRupees / Math.max(1, r1.stops.length - 1)) * leg1Stops);

          // Departure of leg 1
          const sched1 = r1.schedule.find(s => s.departureTime >= preferredTime) || r1.schedule[0];
          const depTime1 = sched1 ? sched1.departureTime : preferredTime;
          const [h1, m1] = depTime1.split(':').map(Number);
          const arr1Minutes = h1 * 60 + m1 + leg1Duration + (bus1.delayMinutes || 0);
          const arr1H = Math.floor(arr1Minutes / 60) % 24;
          const arr1M = arr1Minutes % 60;
          const arr1Time = `${String(arr1H).padStart(2, '0')}:${String(arr1M).padStart(2, '0')}`;

          // Transfer buffer at hub: 12 minutes
          const transferWaitMin = 12;
          const dep2Minutes = arr1Minutes + transferWaitMin;
          const dep2H = Math.floor(dep2Minutes / 60) % 24;
          const dep2M = dep2Minutes % 60;
          const dep2Time = `${String(dep2H).padStart(2, '0')}:${String(dep2M).padStart(2, '0')}`;

          // Leg 2 calculations
          const leg2Stops = toIdxInR2 - hubIdxInR2;
          const leg2Duration = Math.round((r2.estimatedDurationMin / Math.max(1, r2.stops.length - 1)) * leg2Stops);
          const leg2Distance = Number(((r2.distanceKm / Math.max(1, r2.stops.length - 1)) * leg2Stops).toFixed(1));
          const leg2Fare = Math.round((r2.fareRupees / Math.max(1, r2.stops.length - 1)) * leg2Stops);

          const arr2Minutes = dep2Minutes + leg2Duration + (bus2.delayMinutes || 0);
          const arr2H = Math.floor(arr2Minutes / 60) % 24;
          const arr2M = arr2Minutes % 60;
          const arr2Time = `${String(arr2H).padStart(2, '0')}:${String(arr2M).padStart(2, '0')}`;

          const totalDuration = leg1Duration + (bus1.delayMinutes || 0) + transferWaitMin + leg2Duration + (bus2.delayMinutes || 0);

          journeys.push({
            id: `journey-conn-${r1.id}-${r2.id}-${Date.now()}`,
            type: 'fastest',
            origin: r1.stops[fromIdx].name,
            destination: r2.stops[toIdxInR2].name,
            departureTime: depTime1,
            arrivalTime: arr2Time,
            totalDurationMin: totalDuration,
            totalDistanceKm: Number((leg1Distance + leg2Distance).toFixed(1)),
            totalFareRupees: leg1Fare + leg2Fare,
            transferCount: 1,
            transfersAt: [hubStop.name],
            statusSummary: bus1.status === 'Delayed' || bus2.status === 'Delayed' ? 'Delayed' : 'Optimal',
            advisoryNote: `Smooth transfer at ${hubStop.name} (~${transferWaitMin}m transfer buffer).`,
            legs: [
              {
                routeId: r1.id,
                routeNumber: r1.routeNumber,
                routeName: r1.routeName,
                busNumber: bus1.busNumber,
                busStatus: bus1.status,
                operator: bus1.operator,
                fromStop: r1.stops[fromIdx].name,
                toStop: hubStop.name,
                departureTime: depTime1,
                arrivalTime: arr1Time,
                durationMin: leg1Duration,
                distanceKm: leg1Distance,
                fareRupees: leg1Fare,
                availableSeats: bus1.availableSeats
              },
              {
                routeId: r2.id,
                routeNumber: r2.routeNumber,
                routeName: r2.routeName,
                busNumber: bus2.busNumber,
                busStatus: bus2.status,
                operator: bus2.operator,
                fromStop: hubStop.name,
                toStop: r2.stops[toIdxInR2].name,
                departureTime: dep2Time,
                arrivalTime: arr2Time,
                durationMin: leg2Duration,
                distanceKm: leg2Distance,
                fareRupees: leg2Fare,
                availableSeats: bus2.availableSeats
              }
            ]
          });
        }
      }
    }
  }

  // Sort and assign types
  if (journeys.length > 0) {
    journeys.sort((a, b) => a.totalDurationMin - b.totalDurationMin);
    journeys[0].type = 'fastest';
    if (journeys.length > 1) {
      // Find one with fewest transfers
      const minTransfers = Math.min(...journeys.map(j => j.transferCount));
      const fewestTransferJourney = journeys.find(j => j.transferCount === minTransfers && j.id !== journeys[0].id);
      if (fewestTransferJourney) fewestTransferJourney.type = 'fewest_transfers';

      // Find cheapest
      const minFare = Math.min(...journeys.map(j => j.totalFareRupees));
      const cheapestJourney = journeys.find(j => j.totalFareRupees === minFare && j.id !== journeys[0].id && (!fewestTransferJourney || j.id !== fewestTransferJourney.id));
      if (cheapestJourney) cheapestJourney.type = 'cheapest';
    }
  }

  return journeys;
}
