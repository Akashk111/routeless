# ROUTELESS — THE LAST MILE
### AI-Powered Rural Transportation Management & Smart Mobility Platform

> **"Every Student Deserves a Way to Reach Their Future."**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-black.svg)](https://expressjs.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-OpenStreetMap-199900.svg)](https://leafletjs.com/)

---

## 1. Executive Summary & Problem Statement

In rural India—specifically demonstrated across the **Dakshina Kannada / Udupi** corridor in Karnataka (Kinnigoli, Kateel, Bajpe, Gurupura, Moodbidri, Surathkal, Bantwal)—thousands of students depend on a brittle schedule of government buses (KSRTC Gramina Sarige) to reach colleges such as **Alva's Education Foundation**, **NITK Surathkal**, **St. Joseph Engineering College**, and **Canara Engineering College**.

### The Real-World Dilemma:
- Only 1 or 2 buses run per morning from interior villages.
- When a bus suffers a mechanical breakdown or is delayed by 25+ minutes, students miss practical exams, semester classes, and opportunities.
- Buses frequently arrive at 100% capacity with footboard commuters, forcing drivers to bypass village stops.
- Students have no reliable, centralized way to discover connecting alternatives or shared rural feeders.
- State transport authorities operate in the dark, lacking real-time aggregation of stranded student demand.

### Our Solution:
**ROUTELESS — THE LAST MILE** bridges this gap through:
1. **Dijkstra Graph Route Optimization**: Calculates shortest transit paths with up to 2 synchronized transfers and realistic layover buffers.
2. **AI Alternative Transport Finder (Core Innovation)**: Automatically detects disruptions on regular buses and immediately activates ranked multi-modal alternatives (connecting hub transfers, walking to parallel cross-village stops, verified shared Gramina Maxicab feeders, and student pooling).
3. **Live GPS Bus Tracking Radar**: Interactive Leaflet / OpenStreetMap visualization with live bus positioning, seat availability counters, and speed tracking.
4. **Student Demand Aggregation & Dispatch Alerts**: Clusters stranded student requests to trigger automated relief shuttle dispatch recommendations for KSRTC depot controllers.
5. **ROUTELESS AI Journey Companion**: Ground-truth conversational assistant formulating backup itineraries and answering student questions.
6. **Crowdsourced Transit Problem Reporting**: Public transparency log for skipped stops, delays, and overcrowding with depot action resolutions.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend UI/UX** | React 18, Vite 6, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Recharts |
| **Interactive Maps** | Leaflet, React-Leaflet, OpenStreetMap Tile Layer |
| **Backend API** | Node.js Express (ESM / TypeScript), CORS, dotenv |
| **Algorithms** | Dijkstra Shortest Path Graph, Multi-Modal Recommendation Scoring Engine |
| **Simulation** | Real-time GPS waypoint interpolation engine (updates every 3.5s) |
| **AI Companion** | Context-grounded conversational agent with LLM endpoint + rule-based expert engine |

---

## 3. System Architecture & Algorithms

```text
[ Students & Mobile Users ]   [ KSRTC Depot Admins ]   [ Bus Operators / Drivers ]
             │                          │                           │
             └──────────────┬───────────┴───────────────────────────┘
                            │ (Vite Proxy / REST APIs)
                            ▼
              ┌───────────────────────────┐
              │    ROUTELESS Core API     │
              │  (Node.js / Express / TS) │
              └─────────────┬─────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Dijkstra   │     │  Multi-Modal │     │  Live GPS    │
│  Graph Path  │     │  Alternative │     │  Simulator   │
│ Optimization │     │    Scorer    │     │  (3.5s Tick) │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
              ┌───────────────────────────┐
              │  Central Data Store &     │
              │  Real-Time Notification   │
              │  Event Dispatcher         │
              └───────────────────────────┘
```

### The Alternative Recommendation Scoring Formula
When a service disruption is flagged, alternatives are ranked by an objective 100-point composite score:
$$\text{Score} = w_t \cdot S_{\text{time}} + w_c \cdot S_{\text{cost}} + w_e \cdot S_{\text{ease}} + w_r \cdot S_{\text{reliability}}$$
- **Time Score ($S_{\text{time}}$)**: Penalty for excess travel and transfer waiting minutes.
- **Cost Score ($S_{\text{cost}}$)**: Evaluates student concession eligibility vs private shared fares.
- **Convenience Score ($S_{\text{ease}}$)**: Penalizes walking distance over 500m.
- **Reliability Score ($S_{\text{reliability}}$)**: Weight assigned to scheduled state transit (95%) vs verified shared cruisers (90%) vs ad-hoc carpools (70%).

---

## 4. User Roles & 1-Click Demo Credentials

ROUTELESS features role-based access control with built-in instant 1-click logins on the top banner:

| Role | Demo Account | Default Email | Password | Primary Capabilities |
|---|---|---|---|---|
| **Student** | Ananya Rao | `student@routeless.org` | `password123` | Plan journeys, find alternatives, track buses, submit travel requests, report issues |
| **Admin** | K. R. Hegde | `admin@routeless.org` | `adminpassword` | Fleet overview, dispatch relief buses, resolve reports, demand prediction |
| **Operator** | Suresh Naik | `operator@routeless.org` | `driverpassword` | Update live trip delays, broadcast seat capacity, toggle breakdown |

---

## 5. End-to-End Hackathon Demonstration Script

The application includes a persistent top **Hackathon Evaluation Bar** with 1-click scenario triggers:

### Scenario A: Cancelled Bus (Route 14B)
1. Click **Scenario A: Cancel Bus 14B** in the top bar.
2. Bus `KA-19-F-1402` (Kinnigoli → Moodbidri) is immediately marked as cancelled.
3. Open **Alternative Transport Finder** (`/alternatives`).
4. Notice the system detected the cancellation and computed 4 ranked alternatives (e.g. Connecting bus via Kateel Hub, 900m walk to village cross express, and verified shared Gramina Cruiser).

### Scenario B: High Student Demand Surge
1. Click **Scenario B: Demand Surge (18 reqs)**.
2. 18 urgent student exam requests are aggregated on the Kinnigoli-Moodbidri corridor.
3. Switch role to **Admin: K. R. Hegde** or open **Demand AI** (`/demand`).
4. View the 58-seat morning deficit curve in Recharts.
5. Click **"Dispatch Relief Shuttle (KA-19-F-9901)"** to immediately allocate a spare KSRTC bus and resolve student pending requests.

### Scenario C: Overcrowded Bus
1. Click **Scenario C: Overcrowded 22A**.
2. Bus `KA-19-F-2201` (Gurupura → Vamanjoor) status changes to **Full Capacity (0 seats)**.
3. A priority alert is broadcast notifying downstream students to avoid waiting and take the parallel Maxi-Cab pool.

---

## 6. Local Quick-Start Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/routeless.git
cd routeless
```

### Step 2: Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### Step 3: Run Development Servers
In two terminal tabs:

**Terminal 1 (Backend API):**
```bash
npm run dev:backend
# Starts Express API server on http://localhost:5001
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:frontend
# Starts Vite React client on http://localhost:5173
```

Now open **`http://localhost:5173`** in your browser!

---

## 7. Public Deployment Instructions

### Deploying Frontend to Vercel / Netlify
1. Connect your GitHub repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set Root Directory to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable: `VITE_API_BASE_URL` = your deployed backend URL.

### Deploying Backend to Render / Railway
1. Set Root Directory to `backend`.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Port: `5001` (or use `$PORT`).

---

## 8. Pilot Network Geographical Coordinates

The demonstration utilizes real geographical coordinates in coastal Karnataka:
- **Kinnigoli Bus Stand**: `13.0854° N, 74.8722° E`
- **Kateel Temple Junction**: `13.0673° N, 74.8488° E`
- **Bajpe Rural Transit Hub**: `12.9818° N, 74.8872° E`
- **Moodbidri (Alva's Education Complex)**: `13.0722° N, 74.9961° E`
- **Gurupura Kaikamba**: `12.9463° N, 74.9351° E`
- **Vamanjoor (St. Joseph Engg College)**: `12.9197° N, 74.8967° E`
- **Surathkal (NITK Campus)**: `13.0076° N, 74.7946° E`
- **Bantwal (Canara Engg Gateway)**: `12.8931° N, 75.0352° E`

---

## 9. Future Roadmap
- Integration with Karnataka KSRTC Sarige QR ticketing and UPI concession passes.
- Offline-first Progressive Web App (PWA) with SMS fallback (USSD) for 2G rural regions.
- Driver mobile companion app using native smartphone GPS telemetry.
- Multi-lingual audio voice assistant in Tulu, Kannada, and Konkani.

---

### Developed for Innovation Hackathons 2026
**ROUTELESS — Make Every Journey Possible.**
