import { store } from '../data/store.js';

class BusSimulator {
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  start(intervalMs: number = 4000) {
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
        return;
      }

      const route = routes.find(r => r.id === bus.routeId);
      if (!route || route.stops.length < 2) return;

      const stops = route.stops;
      const currentIdx = bus.currentStopIndex || 0;
      const nextIdx = (currentIdx + 1) % stops.length;

      const currentStop = stops[currentIdx];
      const nextStop = stops[nextIdx];

      // Step 8% towards the next stop coordinate
      const stepFactor = 0.08;
      const dLat = nextStop.latitude - bus.currentLat;
      const dLng = nextStop.longitude - bus.currentLng;

      // Distance remaining
      const distSq = dLat * dLat + dLng * dLng;

      if (distSq < 0.00001) {
        // Arrived at next stop! Advance to next waypoint
        bus.currentStopIndex = nextIdx;
        bus.currentLat = nextStop.latitude;
        bus.currentLng = nextStop.longitude;
        bus.speedKmH = bus.status === 'Approaching Stop' ? 20 : 35;
      } else {
        bus.currentLat += dLat * stepFactor;
        bus.currentLng += dLng * stepFactor;

        // Calculate heading in degrees
        const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
        bus.heading = Math.round((angle + 360) % 360);

        // Fluctuate speed realistically
        const baseSpeed = bus.status === 'Delayed' ? 25 : 45;
        bus.speedKmH = Math.max(15, Math.min(60, Math.round(baseSpeed + (Math.random() * 8 - 4))));
      }

      bus.lastUpdated = new Date().toISOString();
    });
  }
}

export const busSimulator = new BusSimulator();
