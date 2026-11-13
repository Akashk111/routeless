/**
 * Robust Distance & Time Engine for ROUTELESS
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
 * Parse any time string ("07:30", "07:30 AM", "7:30 PM", "14:15") into total minutes from midnight (0 - 1439)
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 450; // default 07:30
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');

  // Strip AM/PM and non-digit/colon characters
  const parts = clean.replace(/[^\d:]/g, '').split(':');
  let h = parseInt(parts[0] || '7', 10);
  let m = parseInt(parts[1] || '0', 10);

  if (isNaN(h)) h = 7;
  if (isNaN(m)) m = 0;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  return (h % 24) * 60 + (m % 60);
}

/**
 * Format total minutes from midnight into 24h "HH:MM" format
 */
export function minutesTo24h(minutes: number): string {
  const safe = Math.round(minutes);
  const h = Math.floor(safe / 60) % 24;
  const m = safe % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Format total minutes into display "07:30 AM" format
 */
export function minutesTo12h(minutes: number): string {
  const safe = Math.round(minutes);
  let h = Math.floor(safe / 60) % 24;
  const m = safe % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Add minutes to a time string and return "HH:MM"
 */
export function addMinutesToTimeString(timeStr: string, minutesToAdd: number): string {
  const baseMinutes = parseTimeToMinutes(timeStr);
  return minutesTo24h(baseMinutes + minutesToAdd);
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
  const dwellTimeMin = Math.max(0, remainingStopsCount - 1) * 1.5;
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

/**
 * Parse date string ("13/11/2026", "2026-11-13", etc.) into Day of Week (0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat)
 */
export function parseDateToDayOfWeek(dateStr: string): number {
  if (!dateStr) return 5; // Friday default (Nov 13, 2026)
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // DD/MM/YYYY
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const parsed = new Date(y, m, d);
      if (!isNaN(parsed.getTime())) return parsed.getDay();
    }
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed.getDay();
  return 5;
}
