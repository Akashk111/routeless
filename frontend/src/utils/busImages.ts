/**
 * ROUTELESS Transportation Image Management
 * Curated high-resolution bus images by category with local SVG fallbacks.
 */

export const BUS_CATEGORY_IMAGES = {
  government: {
    hero: '/images/buses/government-ksrtc-hero.svg',
    ordinary: '/images/buses/ksrtc-ordinary.svg',
    express: '/images/buses/ksrtc-express.svg',
    photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    photoAlt: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80'
  },
  private: {
    coastal: '/images/buses/private-coastal.svg',
    photo: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=800&q=80'
  },
  college: {
    campus: '/images/buses/college-campus.svg',
    photo: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80'
  },
  rural: {
    feeder: '/images/buses/rural-feeder.svg',
    photo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'
  }
};

/**
 * Returns an appropriate bus image based on bus type and optional bus ID
 */
export function getBusImage(busType?: string, busNumber?: string): string {
  switch (busType) {
    case 'Express':
      return BUS_CATEGORY_IMAGES.government.express;
    case 'Private Route':
      return BUS_CATEGORY_IMAGES.private.coastal;
    case 'College Shuttle':
      return BUS_CATEGORY_IMAGES.college.campus;
    case 'Shared Feeder':
      return BUS_CATEGORY_IMAGES.rural.feeder;
    case 'KSRTC Ordinary':
    default:
      return BUS_CATEGORY_IMAGES.government.ordinary;
  }
}

/**
 * Fallback handler for <img> onError
 */
export function handleImageFallback(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  busType?: string,
  busNumber?: string
) {
  const target = event.currentTarget;
  const fallbackUrl = getBusImage(busType, busNumber);
  if (target.src !== fallbackUrl) {
    target.src = fallbackUrl;
  }
}
