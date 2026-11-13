import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  ShieldCheck,
  Cpu,
  Sparkles,
  ArrowRight,
  Radio,
  Shuffle,
  Users,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Heart
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* HERO */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue font-bold px-3 py-1 rounded-full text-xs">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>ROUTELESS — THE LAST MILE</span>
          </div>
          <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">
            Every Student Deserves a Way to Reach Their Future.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            An AI-powered rural transportation management and smart mobility platform bridging the last mile for rural students when public buses fail.
          </p>
        </div>

        {/* INSPIRATION & PROBLEM */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 space-y-4 text-xs text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-600" />
            <span>The Real-World Context: Dakshina Kannada Rural Transit</span>
          </h2>
          <p>
            In coastal Karnataka (Mangaluru, Udupi, Moodbidri, Bantwal) and across rural India, thousands of students from villages like Kinnigoli, Kateel, Gurupura, and Bajpe commute daily to prominent colleges (Alva's Education Foundation, NITK Surathkal, St. Joseph Engineering College, Canara Engineering).
          </p>
          <p>
            Students rely on a fragile network of state government buses (KSRTC Gramina Sarige) with only 1 or 2 trips scheduled per morning. When a single bus experiences mechanical axle failure, runs 30 minutes late, or arrives overcrowded with commuter footboard passengers, entire cohorts of students miss practical exams, semester lectures, and opportunities.
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-medium">
            <strong>The Missing Link:</strong> Transport authorities previously had zero real-time visibility into stranded student demand, and students had no automated platform to discover synchronized multi-modal alternatives. ROUTELESS solves this end-to-end.
          </div>
        </div>

        {/* 3 DEMONSTRATION SCENARIOS */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-navy-900">3 Live Demonstration Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 uppercase">
                Scenario A
              </span>
              <h3 className="font-bold text-navy-900 text-sm">Cancelled Bus Service</h3>
              <p className="text-slate-600 leading-relaxed">
                Bus KA-19-F-1402 on Route 14B breaks down at Kinnigoli. The AI Alternative Finder instantly activates connecting routes via Kateel and shared maxicabs.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 uppercase">
                Scenario B
              </span>
              <h3 className="font-bold text-navy-900 text-sm">High Student Demand Surge</h3>
              <p className="text-slate-600 leading-relaxed">
                18 students submit urgent exam-morning requests. The Demand Engine flags a 58-seat corridor deficit, prompting KSRTC controllers to dispatch a relief shuttle.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase">
                Scenario C
              </span>
              <h3 className="font-bold text-navy-900 text-sm">Overcrowded Bus (100% Full)</h3>
              <p className="text-slate-600 leading-relaxed">
                Bus 22A Gurupura reaches 100% capacity and skips downstream stops. ROUTELESS alerts waiting students to redirect to parallel rural feeder vans.
              </p>
            </div>
          </div>
        </div>

        {/* TECHNOLOGY STACK */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 space-y-4 text-xs text-slate-700">
          <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-blue" />
            <span>Technology Stack & Algorithmic Architecture</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-navy-900 block mb-1">Frontend Engineering</strong>
              <span>React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Leaflet OpenStreetMap, Recharts.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-navy-900 block mb-1">Backend & Pathfinding</strong>
              <span>Node.js Express (ESM/TypeScript), Dijkstra weighted graph route optimization, real-time bus GPS interpolation simulator.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-navy-900 block mb-1">Multi-Modal Alternative Scoring</strong>
              <span>Multi-variable ranking formula weighting transit speed, layover buffer, rural passenger safety, walking distance, and fare.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-navy-900 block mb-1">AI Assistant & Grounding</strong>
              <span>Intelligent conversational AI companion grounded in Dakshina Kannada network coordinates, timetables, and live alerts.</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            to="/planner"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-xs shadow-md transition"
          >
            <span>Launch Journey Planner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
