/**
 * Distance Calculation Engine for Rural Transit Network
 * Implements Haversine distance with rural road winding curvature factor (1.28x)
 */

export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;

  // Road curvature factor for rural coastal Western Ghats / Dakshina Kannada terrain
  const roadWindingFactor = 1.28;
  return Number((straightLineKm * roadWindingFactor).toFixed(1));
}

/**
 * Format time adding minutes to a baseline HH:MM time
 */
export function addMinutesToTimeString(timeStr: string, minutesToAdd: number): string {
  try {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMin = h * 60 + m + Math.round(minutesToAdd);
    const finalH = Math.floor(totalMin / 60) % 24;
    const finalM = totalMin % 60;
    return `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
  } catch (e) {
    return timeStr;
  }
}

/**
 * Calculate realistic ETA based on remaining distance, current average speed, and remaining stops dwell time
 */
export function calculateETA(
  currentTimeStr: string,
  remainingDistanceKm: number,
  averageSpeedKmH: number = 38,
  remainingStopsCount: number = 1
): string {
  const safeSpeed = Math.max(15, averageSpeedKmH);
  const inMotionMin = (remainingDistanceKm / safeSpeed) * 60;
  const dwellTimeMin = Math.max(0, remainingStopsCount - 1) * 1.5; // ~1.5 min per rural stop dwell
  const totalMin = inMotionMin + dwellTimeMin;
  return addMinutesToTimeString(currentTimeStr, totalMin);
}

/**
 * Format minutes into readable "1 hr 15 mins" or "35 mins"
 */
export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs > 0) {
    return mins > 0 ? `${hrs} hr ${mins} mins` : `${hrs} hr`;
  }
  return `${mins} mins`;
}
