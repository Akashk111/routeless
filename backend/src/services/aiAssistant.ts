import { store } from '../data/store.js';
import { planJourneys } from '../algorithms/dijkstra.js';
import { findAlternatives } from '../algorithms/alternativeFinder.js';
import { AlternativeOption } from '../types/index.js';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  cards?: AlternativeOption[];
  quickActions?: string[];
}

const VILLAGES = [
  'Kinnigoli',
  'Kateel',
  'Bajpe',
  'Moodbidri',
  'Gurupura',
  'Vamanjoor',
  'Mulki',
  'Surathkal',
  'Bantwal',
  'Polali',
  'Mijar',
  'Ganjimutt'
];

const DESTINATIONS = [
  "Alva's College",
  "Alva's",
  'Moodbidri',
  'NITK',
  'Surathkal',
  'St. Joseph Engg College',
  'SJEC',
  'Vamanjoor',
  'Canara Engineering',
  'Benjanapadavu'
];

export async function processAIChat(
  userMessage: string,
  _history: ChatMessage[] = []
): Promise<{ text: string; cards?: AlternativeOption[]; quickActions?: string[] }> {
  const lower = userMessage.toLowerCase();

  // Try extracting origin and destination
  let origin: string | null = null;
  let destination: string | null = null;

  for (const v of VILLAGES) {
    if (lower.includes(v.toLowerCase())) {
      if (!origin) origin = v;
      else if (!destination && v !== origin) destination = v;
    }
  }

  for (const d of DESTINATIONS) {
    if (lower.includes(d.toLowerCase())) {
      destination = d;
      break;
    }
  }

  // Check for cancellation / stranded / alternative keywords
  const isAskingAboutCancellation = lower.includes('cancel') || lower.includes('miss') || lower.includes('not arrive') || lower.includes('stranded') || lower.includes('alternative') || lower.includes('another way') || lower.includes('stuck');
  const isAskingAboutLiveTracking = lower.includes('track') || lower.includes('where is') || lower.includes('live location') || lower.includes('gps');
  const isAskingAboutReport = lower.includes('complain') || lower.includes('report') || lower.includes('issue') || lower.includes('problem');
  const isAskingAboutDemand = lower.includes('request') || lower.includes('pool') || lower.includes('more bus') || lower.includes('crowded');

  // If asking about live bus tracking
  if (isAskingAboutLiveTracking) {
    const buses = store.getBuses();
    const activeBusList = buses.map(b => `• **${b.busNumber}** (${b.routeName}): Status is *${b.status}* with **${b.availableSeats}** seats free (Current speed: ${b.speedKmH} km/h).`).join('\n');
    return {
      text: `Here is the current live status of active rural buses in our network:\n\n${activeBusList}\n\nYou can also open the **Live Bus Tracking** interactive map for continuous GPS positioning of all routes.`,
      quickActions: ['View Live Map', 'Track Route 14B', 'Find Alternatives']
    };
  }

  // If asking how to report a problem
  if (isAskingAboutReport) {
    return {
      text: `To report a missed bus, cancellation, or overcrowding:\n\n1. Go to the **Report Problem** tab in your dashboard.\n2. Select your category (e.g. "Bus cancelled" or "Bus overcrowded").\n3. Provide the location and bus number if known.\n\nYour report alerts both KSRTC transit administrators and fellow students traveling on that route immediately.`,
      quickActions: ['Go to Report Problem', 'Check Route 14B Status', 'Find Alternatives']
    };
  }

  // If specific origin and destination or asking about route
  if (origin || destination || isAskingAboutCancellation) {
    const from = origin || 'Kinnigoli';
    const to = destination || 'Moodbidri';

    const altResult = findAlternatives(from, to, '07:30');
    const directJourneys = planJourneys(from, to, '07:30');

    let responseText = '';

    if (altResult.disruptionDetected) {
      responseText = `⚠️ **Alert Detected:** ${altResult.disruptionReason}\n\nDon't worry — ROUTELESS has computed **${altResult.alternatives.length} verified alternative travel solutions** to ensure you reach your classes on time without missing exams:\n\n1. **${altResult.alternatives[0].title}** (Score: ${altResult.alternatives[0].score}/100) — ${altResult.alternatives[0].whyRecommended}\n2. **${altResult.alternatives[1].title}** — Leaves at ${altResult.alternatives[1].departureTime}, arriving by ${altResult.alternatives[1].arrivalTime}.\n\nReview the step-by-step navigation cards below:`;
      return {
        text: responseText,
        cards: altResult.alternatives.slice(0, 3),
        quickActions: ['Book Shared Feeder', 'Submit Group Demand', 'Report Cancellation']
      };
    } else if (directJourneys.length > 0) {
      const j = directJourneys[0];
      responseText = `I found a recommended journey from **${from}** to **${to}**:\n\n• **Route:** ${j.legs[0].routeNumber} (${j.legs[0].routeName})\n• **Departure:** ${j.departureTime} | **Arrival:** ~${j.arrivalTime} (${j.totalDurationMin} mins)\n• **Fare:** ₹${j.totalFareRupees} | **Available Seats:** ${j.legs[0].availableSeats}\n• **Status:** ${j.statusSummary}\n\nWould you like me to show alternative routes or community shared transport options?`;
      return {
        text: responseText,
        cards: altResult.alternatives.slice(0, 2),
        quickActions: ['Find Alternatives', 'Track This Bus', 'Request Extra Bus']
      };
    } else {
      responseText = `There is currently no direct government bus from **${from}** to **${to}**. However, ROUTELESS AI calculated multi-modal alternative options connecting via nearby rural junctions:`;
      return {
        text: responseText,
        cards: altResult.alternatives,
        quickActions: ['Submit Travel Request', 'View Network Map', 'Contact Operator']
      };
    }
  }

  // Default helpful welcoming response
  return {
    text: `Hello! I'm **ROUTELESS AI**, your rural travel companion. 🚌\n\nI can assist you with:\n• Finding alternative transport when your regular bus is cancelled or delayed\n• Finding the fastest connecting route to college (e.g. Alva's Moodbidri, NITK, SJEC)\n• Checking live seat availability and bus GPS locations\n• Submitting student group travel requests to transport authorities\n\nWhere are you traveling from today? (e.g., *"I'm in Kinnigoli, bus 14B is cancelled, how do I get to Alva's College?"*)`,
    quickActions: [
      'Bus cancelled from Kinnigoli to Moodbidri',
      'How to reach Alvas College by 8:30 AM?',
      'Check bus from Gurupura to SJEC',
      'View active travel alerts'
    ]
  };
}
