import { store } from '../data/store.js';
import { calculateHaversineDistanceKm, calculateETA } from '../algorithms/distance.js';

class BusSimulator {
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  start(intervalMs: number = 3500) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = setInterval(() => {
      this.tick();
    }, intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  tick() {
    const buses = store.getBuses();
    const routes = store.getRoutes();

    buses.forEach(bus => {
      if (bus.status === 'Cancelled' || bus.status === 'Out of Service') {
        bus.speedKmH = 0;
        bus.distanceToNextStopKm = 0;
        bus.etaNextStop = 'Service Cancelled';
        bus.etaDestination = 'Service Cancelled';
        return;
      }

      const route = routes.find(r => r.id === bus.routeId);
      if (!route || route.stops.length < 2) return;

      const stops = route.stops;
      const currentIdx = bus.currentStopIndex || 0;
      const nextIdx = (currentIdx + 1) % stops.length;

      const currentStop = stops[currentIdx];
      const nextStop = stops[nextIdx];

      // Step 6% towards next stop
      const stepFactor = 0.06;
      const dLat = nextStop.latitude - bus.currentLat;
      const dLng = nextStop.longitude - bus.currentLng;
      const distSq = dLat * dLat + dLng * dLng;

      if (distSq < 0.00002) {
        // Arrived at next stop
        bus.currentStopIndex = nextIdx;
        bus.currentLat = nextStop.latitude;
        bus.currentLng = nextStop.longitude;
        bus.speedKmH = bus.status === 'Approaching Stop' ? 22 : 36;
      } else {
        bus.currentLat += dLat * stepFactor;
        bus.currentLng += dLng * stepFactor;

        // Heading angle in degrees
        const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
        bus.heading = Math.round((angle + 360) % 360);

        // Fluctuate speed realistically
        const baseSpeed = bus.busType === 'Express' ? 55 : bus.status === 'Delayed' ? 25 : 42;
        bus.speedKmH = Math.max(18, Math.min(65, Math.round(baseSpeed + (Math.random() * 6 - 3))));
      }

      // Next Stop details
      const actualNextStop = stops[(bus.currentStopIndex + 1) % stops.length];
      bus.nextStopName = actualNextStop.name;
      bus.distanceToNextStopKm = calculateHaversineDistanceKm(
        bus.currentLat,
        bus.currentLng,
        actualNextStop.latitude,
        actualNextStop.longitude
      );

      // Remaining distance to route terminus
      const remainingStopsCount = Math.max(1, stops.length - 1 - bus.currentStopIndex);
      const totalKm = route.distanceKm || 30;
      const currentStopDistance = currentStop.distanceFromStartKm || (totalKm * (bus.currentStopIndex / Math.max(1, stops.length - 1)));
      bus.remainingDistanceKm = Number(Math.max(0, totalKm - currentStopDistance).toFixed(1));

      // Calculate realistic ETAs
      const currentTimeStr = new Date().toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });

      bus.etaNextStop = calculateETA(currentTimeStr, bus.distanceToNextStopKm, bus.speedKmH, 1);
      bus.etaDestination = calculateETA(currentTimeStr, bus.remainingDistanceKm, bus.speedKmH, remainingStopsCount);
      bus.lastUpdated = new Date().toISOString();

      // Persist updated GPS coordinates and real-time state into SQLite
      store.updateBus(bus.id, {
        currentLat: bus.currentLat,
        currentLng: bus.currentLng,
        heading: bus.heading,
        speedKmH: bus.speedKmH,
        currentStopIndex: bus.currentStopIndex,
        nextStopName: bus.nextStopName,
        distanceToNextStopKm: bus.distanceToNextStopKm,
        remainingDistanceKm: bus.remainingDistanceKm,
        etaNextStop: bus.etaNextStop,
        etaDestination: bus.etaDestination,
        lastUpdated: bus.lastUpdated
      });
    });
  }

  // Support for real GPS device updates from bus operators
  updateTelemetry(
    busId: string,
    telemetry: {
      latitude: number;
      longitude: number;
      speedKmH: number;
      heading?: number;
      timestamp: string;
    }
  ): boolean {
    const bus = store.getBusById(busId);
    if (!bus) return false;

    // Check if timestamp is valid and not stale (> 2 hours old)
    const updateTime = new Date(telemetry.timestamp).getTime();
    if (isNaN(updateTime) || Date.now() - updateTime > 7200000) {
      return false; // Reject stale or invalid GPS
    }

    bus.currentLat = telemetry.latitude;
    bus.currentLng = telemetry.longitude;
    bus.speedKmH = telemetry.speedKmH;
    if (telemetry.heading !== undefined) bus.heading = telemetry.heading;
    bus.lastUpdated = telemetry.timestamp;
    bus.isSimulatedGps = false; // Flagged as verified hardware GPS

    // Recompute next stop and ETA
    const route = store.getRouteById(bus.routeId);
    if (route && route.stops.length > 0) {
      // Find closest stop sequence
      let minDist = Infinity;
      let closestIdx = 0;
      route.stops.forEach((s, idx) => {
        const d = calculateHaversineDistanceKm(bus.currentLat, bus.currentLng, s.latitude, s.longitude);
        if (d < minDist) {
          minDist = d;
          closestIdx = idx;
        }
      });
      bus.currentStopIndex = closestIdx;
      const nextIdx = Math.min(route.stops.length - 1, closestIdx + 1);
      bus.nextStopName = route.stops[nextIdx].name;
      bus.distanceToNextStopKm = calculateHaversineDistanceKm(
        bus.currentLat,
        bus.currentLng,
        route.stops[nextIdx].latitude,
        route.stops[nextIdx].longitude
      );
    }

    return true;
  }
}

export const busSimulator = new BusSimulator();
