import { Route, Bus, BusType, OptimizedJourney, JourneyLeg } from '../types/index.js';
import { store } from '../data/store.js';
import { addMinutesToTimeString } from './distance.js';

export interface PlanOptions {
  sort?: 'fastest' | 'cheapest' | 'fewest_transfers' | 'shortest_distance' | 'earliest_departure';
  busType?: string;
  maxFare?: number;
  minSeats?: number;
  maxTransfers?: number;
  maxDistance?: number;
  operator?: string;
}

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

export function findMatchingStopInRoute(route: Route, query: string): number {
  const normQuery = normalizeName(query);
  return route.stops.findIndex(s => {
    const normStop = normalizeName(s.name);
    const normVillage = s.villageTag ? normalizeName(s.villageTag) : '';
    return (
      normStop.includes(normQuery) ||
      normQuery.includes(normStop) ||
      (normVillage && (normVillage.includes(normQuery) || normQuery.includes(normVillage)))
    );
  });
}

function timeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function planJourneys(
  originQuery: string,
  destQuery: string,
  preferredTime: string = '07:30',
  options: PlanOptions = {}
): OptimizedJourney[] {
  const routes = store.getRoutes();
  const buses = store.getBuses();
  const journeys: OptimizedJourney[] = [];
  const prefMinutes = timeStringToMinutes(preferredTime);

  // Helper to find all matching active buses for a route
  const getBusesForRoute = (routeId: string): Bus[] => {
    const list = buses.filter(b => b.routeId === routeId);
    return list.length > 0 ? list : buses.slice(0, 1);
  };

  // ==========================================
  // 1. DIRECT BUSES
  // ==========================================
  for (const route of routes) {
    const fromIdx = findMatchingStopInRoute(route, originQuery);
    const toIdx = findMatchingStopInRoute(route, destQuery);

    if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
      const fromStop = route.stops[fromIdx];
      const toStop = route.stops[toIdx];

      // Distance & duration
      const legDist = Number(
        (toStop.distanceFromStartKm - fromStop.distanceFromStartKm > 0
          ? toStop.distanceFromStartKm - fromStop.distanceFromStartKm
          : (route.distanceKm / Math.max(1, route.stops.length - 1)) * (toIdx - fromIdx)
        ).toFixed(1)
      );

      const stopCount = toIdx - fromIdx;
      const legDuration = Math.round(
        (route.estimatedDurationMin / Math.max(1, route.stops.length - 1)) * stopCount
      );
      const legFare = Math.round(
        (route.fareRupees / Math.max(1, route.stops.length - 1)) * stopCount
      );

      const intermediateStops = route.stops.slice(fromIdx, toIdx + 1).map(s => s.name);
      const routeBuses = getBusesForRoute(route.id);

      // Search through each schedule entry
      for (const sched of route.schedule) {
        const bus = routeBuses.find(b => b.id === sched.busId) || routeBuses[0];
        const isCancelled = bus.status === 'Cancelled';
        const isFull = bus.availableSeats <= 0;

        // Skip completely cancelled buses from standard direct results unless specifically filtering
        if (isCancelled) continue;

        const depTime = sched.departureTime;
        const arrTime = addMinutesToTimeString(depTime, legDuration + (bus.delayMinutes || 0));

        let statusSummary: OptimizedJourney['statusSummary'] = 'Optimal';
        let advisoryNote = undefined;

        if (bus.status === 'Delayed') {
          statusSummary = 'Delayed';
          advisoryNote = `Running ~${bus.delayMinutes}m late due to rural road traffic.`;
        } else if (isFull) {
          statusSummary = 'Full Capacity';
          advisoryNote = 'Bus is currently at 100% capacity (0 free seats). Boarding may be restricted.';
        }

        journeys.push({
          id: `journey-dir-${route.id}-${sched.busId}-${depTime}`,
          type: 'fewest_transfers',
          origin: fromStop.name,
          destination: toStop.name,
          departureTime: depTime,
          arrivalTime: arrTime,
          totalDurationMin: legDuration + (bus.delayMinutes || 0),
          totalDistanceKm: legDist,
          totalFareRupees: legFare,
          transferCount: 0,
          transfersAt: [],
          waitingTimeMin: 0,
          statusSummary,
          advisoryNote,
          availableSeats: bus.availableSeats,
          minAvailableSeatsInLegs: bus.availableSeats,
          primaryBusType: bus.busType,
          primaryOperator: bus.operator,
          legs: [
            {
              routeId: route.id,
              routeNumber: route.routeNumber,
              routeName: route.routeName,
              busId: bus.id,
              busNumber: bus.busNumber,
              busType: bus.busType,
              busStatus: bus.status,
              operator: bus.operator,
              fromStop: fromStop.name,
              toStop: toStop.name,
              departureTime: depTime,
              arrivalTime: arrTime,
              durationMin: legDuration,
              distanceKm: legDist,
              fareRupees: legFare,
              availableSeats: bus.availableSeats,
              capacity: bus.capacity,
              intermediateStops
            }
          ]
        });
      }
    }
  }

  // ==========================================
  // 2. ONE-TRANSFER CONNECTING JOURNEYS
  // ==========================================
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
          const fromStop1 = r1.stops[fromIdx];
          const toStop2 = r2.stops[toIdxInR2];

          // Leg 1 calculations
          const leg1Stops = i - fromIdx;
          const leg1Dist = Number(
            (hubStop.distanceFromStartKm - fromStop1.distanceFromStartKm > 0
              ? hubStop.distanceFromStartKm - fromStop1.distanceFromStartKm
              : (r1.distanceKm / Math.max(1, r1.stops.length - 1)) * leg1Stops
            ).toFixed(1)
          );
          const leg1Duration = Math.round(
            (r1.estimatedDurationMin / Math.max(1, r1.stops.length - 1)) * leg1Stops
          );
          const leg1Fare = Math.round(
            (r1.fareRupees / Math.max(1, r1.stops.length - 1)) * leg1Stops
          );

          // Leg 2 calculations
          const leg2Stops = toIdxInR2 - hubIdxInR2;
          const leg2Dist = Number(
            (toStop2.distanceFromStartKm - r2.stops[hubIdxInR2].distanceFromStartKm > 0
              ? toStop2.distanceFromStartKm - r2.stops[hubIdxInR2].distanceFromStartKm
              : (r2.distanceKm / Math.max(1, r2.stops.length - 1)) * leg2Stops
            ).toFixed(1)
          );
          const leg2Duration = Math.round(
            (r2.estimatedDurationMin / Math.max(1, r2.stops.length - 1)) * leg2Stops
          );
          const leg2Fare = Math.round(
            (r2.fareRupees / Math.max(1, r2.stops.length - 1)) * leg2Stops
          );

          const r1Buses = getBusesForRoute(r1.id);
          const r2Buses = getBusesForRoute(r2.id);

          // Find synchronized schedules where Leg 2 departs at least 8 mins AFTER Leg 1 arrives
          for (const s1 of r1.schedule) {
            const bus1 = r1Buses.find(b => b.id === s1.busId) || r1Buses[0];
            if (bus1.status === 'Cancelled') continue;

            const depTime1 = s1.departureTime;
            const arrTime1 = addMinutesToTimeString(depTime1, leg1Duration + (bus1.delayMinutes || 0));
            const arr1Minutes = timeStringToMinutes(arrTime1);

            for (const s2 of r2.schedule) {
              const bus2 = r2Buses.find(b => b.id === s2.busId) || r2Buses[0];
              if (bus2.status === 'Cancelled') continue;

              const depTime2 = s2.departureTime;
              const dep2Minutes = timeStringToMinutes(depTime2);
              const waitingMin = dep2Minutes - arr1Minutes;

              // Transfer buffer: Minimum 6 minutes, Maximum 45 minutes
              if (waitingMin >= 6 && waitingMin <= 45) {
                const arrTime2 = addMinutesToTimeString(depTime2, leg2Duration + (bus2.delayMinutes || 0));
                const totalDuration = leg1Duration + (bus1.delayMinutes || 0) + waitingMin + leg2Duration + (bus2.delayMinutes || 0);

                const inter1 = r1.stops.slice(fromIdx, i + 1).map(s => s.name);
                const inter2 = r2.stops.slice(hubIdxInR2, toIdxInR2 + 1).map(s => s.name);

                journeys.push({
                  id: `journey-conn-${r1.id}-${r2.id}-${s1.departureTime}-${s2.departureTime}`,
                  type: 'fastest',
                  origin: fromStop1.name,
                  destination: toStop2.name,
                  departureTime: depTime1,
                  arrivalTime: arrTime2,
                  totalDurationMin: totalDuration,
                  totalDistanceKm: Number((leg1Dist + leg2Dist).toFixed(1)),
                  totalFareRupees: leg1Fare + leg2Fare,
                  transferCount: 1,
                  transfersAt: [hubStop.name],
                  waitingTimeMin: waitingMin,
                  statusSummary: bus1.status === 'Delayed' || bus2.status === 'Delayed' ? 'Delayed' : 'Optimal',
                  advisoryNote: `Guaranteed connection at ${hubStop.name} with ${waitingMin}m layover buffer.`,
                  availableSeats: Math.min(bus1.availableSeats, bus2.availableSeats),
                  minAvailableSeatsInLegs: Math.min(bus1.availableSeats, bus2.availableSeats),
                  primaryBusType: bus1.busType,
                  primaryOperator: `${bus1.operator} + ${bus2.operator}`,
                  legs: [
                    {
                      routeId: r1.id,
                      routeNumber: r1.routeNumber,
                      routeName: r1.routeName,
                      busId: bus1.id,
                      busNumber: bus1.busNumber,
                      busType: bus1.busType,
                      busStatus: bus1.status,
                      operator: bus1.operator,
                      fromStop: fromStop1.name,
                      toStop: hubStop.name,
                      departureTime: depTime1,
                      arrivalTime: arrTime1,
                      durationMin: leg1Duration,
                      distanceKm: leg1Dist,
                      fareRupees: leg1Fare,
                      availableSeats: bus1.availableSeats,
                      capacity: bus1.capacity,
                      intermediateStops: inter1
                    },
                    {
                      routeId: r2.id,
                      routeNumber: r2.routeNumber,
                      routeName: r2.routeName,
                      busId: bus2.id,
                      busNumber: bus2.busNumber,
                      busType: bus2.busType,
                      busStatus: bus2.status,
                      operator: bus2.operator,
                      fromStop: hubStop.name,
                      toStop: toStop2.name,
                      departureTime: depTime2,
                      arrivalTime: arrTime2,
                      durationMin: leg2Duration,
                      distanceKm: leg2Dist,
                      fareRupees: leg2Fare,
                      availableSeats: bus2.availableSeats,
                      capacity: bus2.capacity,
                      intermediateStops: inter2
                    }
                  ]
                });
              }
            }
          }
        }
      }
    }
  }

  // ==========================================
  // APPLY FILTERS
  // ==========================================
  let filtered = journeys;

  if (options.busType && options.busType !== 'all') {
    filtered = filtered.filter(j => j.primaryBusType.toLowerCase().includes(options.busType!.toLowerCase()));
  }

  if (options.maxFare && options.maxFare > 0) {
    filtered = filtered.filter(j => j.totalFareRupees <= options.maxFare!);
  }

  if (options.minSeats && options.minSeats > 0) {
    filtered = filtered.filter(j => j.minAvailableSeatsInLegs >= options.minSeats!);
  }

  if (options.maxTransfers !== undefined && options.maxTransfers >= 0) {
    filtered = filtered.filter(j => j.transferCount <= options.maxTransfers!);
  }

  if (options.maxDistance && options.maxDistance > 0) {
    filtered = filtered.filter(j => j.totalDistanceKm <= options.maxDistance!);
  }

  if (options.operator && options.operator !== 'all') {
    filtered = filtered.filter(j => j.primaryOperator.toLowerCase().includes(options.operator!.toLowerCase()));
  }

  // ==========================================
  // APPLY SORTING
  // ==========================================
  const sortBy = options.sort || 'fastest';

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'cheapest':
        return a.totalFareRupees - b.totalFareRupees;
      case 'fewest_transfers':
        return a.transferCount - b.transferCount || a.totalDurationMin - b.totalDurationMin;
      case 'shortest_distance':
        return a.totalDistanceKm - b.totalDistanceKm;
      case 'earliest_departure':
        return timeStringToMinutes(a.departureTime) - timeStringToMinutes(b.departureTime);
      case 'fastest':
      default:
        return a.totalDurationMin - b.totalDurationMin;
    }
  });

  return filtered;
}
