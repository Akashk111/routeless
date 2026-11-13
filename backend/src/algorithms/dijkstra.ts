import { Route, Bus, BusType, OptimizedJourney, JourneyLeg, BusStop } from '../types/index.js';
import { store } from '../data/store.js';
import { addMinutesToTimeString, parseTimeToMinutes, parseDateToDayOfWeek } from './distance.js';

export interface PlanOptions {
  sort?: 'fastest' | 'cheapest' | 'fewest_transfers' | 'shortest_distance' | 'earliest_departure';
  busType?: string;
  maxFare?: number;
  minSeats?: number;
  maxTransfers?: number;
  maxDistance?: number;
  operator?: string;
  travelDate?: string;
}

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Tokenize a search string into meaningful keywords, stripping common bus stop fillers
 */
export function tokenizeQuery(query: string): string[] {
  const fillers = new Set(['bus', 'stand', 'stop', 'gate', 'road', 'circle', 'junction', 'cross', 'terminal', 'terminus', 'near', 'opp', 'the']);
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 1 && !fillers.has(t));
}

/**
 * Multi-factor stop matcher scoring:
 * Considers exact match, normalized substring, aliases, village tags, and keyword token overlap
 */
export function scoreStopMatch(stop: BusStop, rawQuery: string): number {
  if (!rawQuery || !stop) return 0;
  const normQuery = normalizeName(rawQuery);
  const normStop = normalizeName(stop.name);
  const normVillage = stop.villageTag ? normalizeName(stop.villageTag) : '';

  // 1. Exact match
  if (normStop === normQuery) return 100;
  if (normVillage && normVillage === normQuery) return 95;

  // 2. Direct substring containment
  if (normStop.includes(normQuery) || normQuery.includes(normStop)) return 85;
  if (normVillage && (normVillage.includes(normQuery) || normQuery.includes(normVillage))) return 75;

  // 3. Aliases matching
  if (stop.aliases && stop.aliases.length > 0) {
    for (const alias of stop.aliases) {
      const normAlias = normalizeName(alias);
      if (normAlias === normQuery) return 95;
      if (normAlias.includes(normQuery) || normQuery.includes(normAlias)) return 80;
    }
  }

  // 4. Token overlap matching (handles e.g. "Moodbidri (Alva's College)" -> "Alva's Vidyagiri Campus Gate")
  const queryTokens = tokenizeQuery(rawQuery);
  if (queryTokens.length === 0) return 0;

  const targetTokens = new Set([
    ...tokenizeQuery(stop.name),
    ...(stop.villageTag ? tokenizeQuery(stop.villageTag) : []),
    ...(stop.aliases ? stop.aliases.flatMap(a => tokenizeQuery(a)) : [])
  ]);

  let matchedTokens = 0;
  for (const token of queryTokens) {
    for (const target of targetTokens) {
      if (target === token || target.includes(token) || token.includes(target)) {
        matchedTokens++;
        break;
      }
    }
  }

  if (matchedTokens > 0) {
    const ratio = matchedTokens / queryTokens.length;
    return Math.round(ratio * 70); // Up to 70 score based on keyword coverage
  }

  return 0;
}

export function findMatchingStopInRoute(route: Route, query: string): number {
  let bestIdx = -1;
  let bestScore = 0;

  for (let i = 0; i < route.stops.length; i++) {
    const score = scoreStopMatch(route.stops[i], query);
    if (score > bestScore && score >= 25) {
      bestScore = score;
      bestIdx = i;
    }
  }

  return bestIdx;
}

export function planJourneys(
  originQuery: string,
  destQuery: string,
  preferredTime: string = '07:30 AM',
  options: PlanOptions = {}
): OptimizedJourney[] {
  const routes = store.getRoutes();
  const buses = store.getBuses();
  const journeys: OptimizedJourney[] = [];
  const prefMinutes = parseTimeToMinutes(preferredTime);

  // Day of week check if travelDate is supplied (e.g. 13/11/2026 -> Friday)
  const dayOfWeek = options.travelDate ? parseDateToDayOfWeek(options.travelDate) : null;

  const getBusesForRoute = (routeId: string): Bus[] => {
    const list = buses.filter(b => b.routeId === routeId);
    return list.length > 0 ? list : buses.slice(0, 1);
  };

  // ==========================================
  // 1. DIRECT BUSES
  // ==========================================
  for (const route of routes) {
    // Check operating days
    if (dayOfWeek && route.operatingDays === 'Mon-Sat' && dayOfWeek === 'Sunday') {
      continue;
    }

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
        const isFull = (sched.availableSeats ?? bus.availableSeats) <= 0;

        // Skip completely cancelled buses
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

        const availSeats = sched.availableSeats ?? bus.availableSeats ?? 12;
        const occSeats = sched.occupiedSeats ?? bus.occupiedSeats ?? 38;
        const totSeats = sched.capacity ?? bus.capacity ?? 50;
        const regNumber = sched.registrationNumber || bus.registrationNumber || 'KA-19-F-2244';
        const busNumber = sched.busNumber || bus.busNumber || route.routeNumber;
        const opName = sched.operator || bus.operator || 'KSRTC Rural Service';
        const busType = sched.busType || bus.busType || route.busType;

        journeys.push({
          id: `journey-dir-${route.id}-${sched.tripId || sched.busId}-${depTime.replace(/[^a-zA-Z0-9]/g, '')}`,
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
          availableSeats: availSeats,
          occupiedSeats: occSeats,
          totalSeats: totSeats,
          minAvailableSeatsInLegs: availSeats,
          primaryBusType: busType,
          primaryOperator: opName,
          primaryBusNumber: busNumber,
          primaryRegistrationNumber: regNumber,
          legs: [
            {
              routeId: route.id,
              routeNumber: route.routeNumber,
              routeName: route.routeName,
              busId: bus.id,
              busNumber,
              registrationNumber: regNumber,
              busType,
              busStatus: bus.status,
              operator: opName,
              fromStop: fromStop.name,
              toStop: toStop.name,
              departureTime: depTime,
              arrivalTime: arrTime,
              durationMin: legDuration,
              distanceKm: legDist,
              fareRupees: legFare,
              availableSeats: availSeats,
              occupiedSeats: occSeats,
              capacity: totSeats,
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
    if (dayOfWeek && r1.operatingDays === 'Mon-Sat' && dayOfWeek === 'Sunday') continue;

    const fromIdx = findMatchingStopInRoute(r1, originQuery);
    if (fromIdx === -1) continue;

    for (let i = fromIdx + 1; i < r1.stops.length; i++) {
      const hubStop = r1.stops[i];
      const hubName = hubStop.name;

      for (const r2 of routes) {
        if (r1.id === r2.id) continue;
        if (dayOfWeek && r2.operatingDays === 'Mon-Sat' && dayOfWeek === 'Sunday') continue;

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

          // Find synchronized schedules where Leg 2 departs at least 5 mins AFTER Leg 1 arrives
          for (const s1 of r1.schedule) {
            const bus1 = r1Buses.find(b => b.id === s1.busId) || r1Buses[0];
            if (bus1.status === 'Cancelled') continue;

            const depTime1 = s1.departureTime;
            const arrTime1 = addMinutesToTimeString(depTime1, leg1Duration + (bus1.delayMinutes || 0));
            const arr1Minutes = parseTimeToMinutes(arrTime1);

            for (const s2 of r2.schedule) {
              const bus2 = r2Buses.find(b => b.id === s2.busId) || r2Buses[0];
              if (bus2.status === 'Cancelled') continue;

              const depTime2 = s2.departureTime;
              const dep2Minutes = parseTimeToMinutes(depTime2);
              const waitingMin = dep2Minutes - arr1Minutes;

              // Transfer buffer: Minimum 5 minutes, Maximum 55 minutes
              if (waitingMin >= 5 && waitingMin <= 55) {
                const arrTime2 = addMinutesToTimeString(depTime2, leg2Duration + (bus2.delayMinutes || 0));
                const totalDuration = leg1Duration + (bus1.delayMinutes || 0) + waitingMin + leg2Duration + (bus2.delayMinutes || 0);

                const inter1 = r1.stops.slice(fromIdx, i + 1).map(s => s.name);
                const inter2 = r2.stops.slice(hubIdxInR2, toIdxInR2 + 1).map(s => s.name);

                const reg1 = s1.registrationNumber || bus1.registrationNumber || 'KA-19-F-1100';
                const reg2 = s2.registrationNumber || bus2.registrationNumber || 'KA-19-F-2200';

                journeys.push({
                  id: `journey-conn-${r1.id}-${r2.id}-${s1.departureTime.replace(/[^a-zA-Z0-9]/g, '')}-${s2.departureTime.replace(/[^a-zA-Z0-9]/g, '')}`,
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
                  availableSeats: Math.min(s1.availableSeats ?? bus1.availableSeats, s2.availableSeats ?? bus2.availableSeats),
                  occupiedSeats: Math.max(s1.occupiedSeats ?? bus1.occupiedSeats, s2.occupiedSeats ?? bus2.occupiedSeats),
                  totalSeats: s1.capacity ?? bus1.capacity,
                  minAvailableSeatsInLegs: Math.min(s1.availableSeats ?? bus1.availableSeats, s2.availableSeats ?? bus2.availableSeats),
                  primaryBusType: s1.busType || bus1.busType,
                  primaryOperator: `${s1.operator || bus1.operator} + ${s2.operator || bus2.operator}`,
                  primaryBusNumber: `${s1.busNumber || bus1.busNumber} / ${s2.busNumber || bus2.busNumber}`,
                  primaryRegistrationNumber: `${reg1} / ${reg2}`,
                  legs: [
                    {
                      routeId: r1.id,
                      routeNumber: r1.routeNumber,
                      routeName: r1.routeName,
                      busId: bus1.id,
                      busNumber: s1.busNumber || bus1.busNumber,
                      registrationNumber: reg1,
                      busType: s1.busType || bus1.busType,
                      busStatus: bus1.status,
                      operator: s1.operator || bus1.operator,
                      fromStop: fromStop1.name,
                      toStop: hubStop.name,
                      departureTime: depTime1,
                      arrivalTime: arrTime1,
                      durationMin: leg1Duration,
                      distanceKm: leg1Dist,
                      fareRupees: leg1Fare,
                      availableSeats: s1.availableSeats ?? bus1.availableSeats,
                      occupiedSeats: s1.occupiedSeats ?? bus1.occupiedSeats,
                      capacity: s1.capacity ?? bus1.capacity,
                      intermediateStops: inter1
                    },
                    {
                      routeId: r2.id,
                      routeNumber: r2.routeNumber,
                      routeName: r2.routeName,
                      busId: bus2.id,
                      busNumber: s2.busNumber || bus2.busNumber,
                      registrationNumber: reg2,
                      busType: s2.busType || bus2.busType,
                      busStatus: bus2.status,
                      operator: s2.operator || bus2.operator,
                      fromStop: hubStop.name,
                      toStop: toStop2.name,
                      departureTime: depTime2,
                      arrivalTime: arrTime2,
                      durationMin: leg2Duration,
                      distanceKm: leg2Dist,
                      fareRupees: leg2Fare,
                      availableSeats: s2.availableSeats ?? bus2.availableSeats,
                      occupiedSeats: s2.occupiedSeats ?? bus2.occupiedSeats,
                      capacity: s2.capacity ?? bus2.capacity,
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
  const sortBy = options.sort || 'earliest_departure';

  filtered.sort((a, b) => {
    // If sorting by earliest_departure or default, prioritize departures closest to or after preferredTime
    if (sortBy === 'earliest_departure') {
      const aDep = parseTimeToMinutes(a.departureTime);
      const bDep = parseTimeToMinutes(b.departureTime);
      // Give preference to departures around or after preferredTime
      const aDiff = aDep >= prefMinutes ? (aDep - prefMinutes) : (aDep - prefMinutes + 1440);
      const bDiff = bDep >= prefMinutes ? (bDep - prefMinutes) : (bDep - prefMinutes + 1440);
      return aDiff - bDiff;
    }

    switch (sortBy) {
      case 'cheapest':
        return a.totalFareRupees - b.totalFareRupees;
      case 'fewest_transfers':
        return a.transferCount - b.transferCount || a.totalDurationMin - b.totalDurationMin;
      case 'shortest_distance':
        return a.totalDistanceKm - b.totalDistanceKm;
      case 'fastest':
      default:
        return a.totalDurationMin - b.totalDurationMin;
    }
  });

  return filtered;
}
