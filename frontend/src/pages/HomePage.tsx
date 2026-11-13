import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  MapPin,
  Radio,
  Shuffle,
  Users,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  School,
  CheckCircle2,
  TrendingUp,
  Bot
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const stats = [
    { label: 'Students Connected', value: '420+', icon: Users, note: 'Daily rural commuters' },
    { label: 'Villages Covered', value: '12', icon: MapPin, note: 'Dakshina Kannada network' },
    { label: 'Alternative Routes Found', value: '1,480+', icon: Shuffle, note: 'Preventing missed classes' },
    { label: 'Disruptions Resolved', value: '94.2%', icon: ShieldCheck, note: 'Via dynamic KSRTC relief' },
  ];

  const features = [
    {
      title: 'Graph Route Optimization',
      desc: 'Shortest-path Dijkstra algorithm connects villages through direct and 1-2 transfer links with realistic layover buffers.',
      icon: Compass,
      path: '/planner',
      badge: 'Dijkstra Graph'
    },
    {
      title: 'AI Alternative Finder',
      desc: 'When a regular bus is cancelled or delayed, instant multi-modal alternatives (feeder buses, shared maxicabs, cross-village walks) keep you moving.',
      icon: Shuffle,
      path: '/alternatives',
      badge: 'Core Feature'
    },
    {
      title: 'Live GPS Bus Tracking',
      desc: 'Interactive OpenStreetMap radar showing exact bus positions, real-time speeds, and seat availability along coastal highway corridors.',
      icon: Radio,
      path: '/tracking',
      badge: 'Live Map'
    },
    {
      title: 'Student Demand Aggregation',
      desc: 'Classmates pool travel requests together; when demand spikes, transit authorities receive instant alerts to dispatch relief buses.',
      icon: Users,
      path: '/demand',
      badge: 'Community Pool'
    },
    {
      title: 'Crowdsourced Problem Reporting',
      desc: 'Instant reporting of skipped stops, cancellations, and severe overcrowding with live feedback from KSRTC depot managers.',
      icon: AlertTriangle,
      path: '/report',
      badge: 'Civic Reporting'
    },
    {
      title: 'ROUTELESS AI Companion',
      desc: 'Conversational assistant with full network knowledge answering questions and formulating step-by-step backup itineraries.',
      icon: Bot,
      path: '/ai-assistant',
      badge: '24/7 AI'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Enter Origin & College',
      desc: 'Search your rural village (e.g. Kinnigoli, Kateel, Gurupura) and your educational institution destination.'
    },
    {
      step: '02',
      title: 'Check Live Schedules',
      desc: 'View real-time bus locations, schedule departures, current delay status, and seat occupancy counts.'
    },
    {
      step: '03',
      title: 'Receive Smart Alternatives',
      desc: 'If a regular bus fails to arrive, the algorithm calculates connecting feeders, shared maxicabs, or walking routes.'
    },
    {
      step: '04',
      title: 'Reach Class With Confidence',
      desc: 'Board your backup transit with step-by-step guidance and arrive for morning lectures and semester exams on time.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1D3A] via-[#102A43] to-[#1F3A60] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#60A5FA_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left text column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-brand-blue/20 border border-blue-400/30 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI-Assisted Rural Transportation Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                NO BUS SHOULD MEAN{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-orange-400">
                  NO MISSED FUTURES.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal max-w-2xl">
                Smart rural mobility that connects students to schools, colleges, and opportunities — even when the regular bus doesn't arrive.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/planner"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-accent to-amber-600 text-navy-900 hover:brightness-110 shadow-lg shadow-amber-500/20 flex items-center gap-2 group transition"
                >
                  <span>Plan Your Journey</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  to="/alternatives"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm flex items-center gap-2 transition"
                >
                  <Shuffle className="w-4 h-4 text-amber-300" />
                  <span>Test Alternative Finder</span>
                </Link>

                <Link
                  to="/tracking"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-brand-blue hover:bg-brand-blue-dark text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
                >
                  <Radio className="w-4 h-4 text-emerald-300" />
                  <span>View Live Bus Map</span>
                </Link>
              </div>

              {/* Pilot region tag */}
              <div className="pt-4 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Pilot: Kinnigoli • Kateel • Bajpe • Moodbidri (Alva's Campus)</span>
              </div>
            </motion.div>

            {/* Right transportation illustration card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="relative bg-gradient-to-b from-navy-800 to-navy-900 border border-navy-700/80 rounded-2xl p-6 shadow-2xl overflow-hidden">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-navy-700">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
                    <span className="text-xs font-mono text-slate-400 ml-2">ROUTELESS Radar v1.0</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    REAL-TIME SYNC
                  </span>
                </div>

                {/* Simulated Scenario Showcase Card */}
                <div className="mt-4 space-y-3.5">
                  <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-rose-300 mb-1">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        Regular Bus KA-19-F-1402 Cancelled
                      </span>
                      <span className="text-[10px] bg-rose-900 text-rose-200 px-1.5 py-0.5 rounded">07:30 AM</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Mechanical axle failure at depot. 25 students waiting at Kinnigoli Bus Stand.
                    </p>
                  </div>

                  <div className="flex justify-center -my-1">
                    <div className="bg-brand-blue text-white text-[10px] font-bold px-3 py-1 rounded-full shadow border border-blue-400 flex items-center gap-1.5 animate-bounce">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      ROUTELESS AI Recommended Alternatives
                    </div>
                  </div>

                  <div className="bg-navy-900/90 border border-emerald-500/30 rounded-xl p-3.5 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Option 1: Connecting Bus via Kateel
                      </span>
                      <span className="text-xs font-bold text-emerald-400">92% Match</span>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Departure:</span>
                        <span className="font-semibold text-white">07:45 AM (via 31C to Bajpe)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Arrival at Alva's:</span>
                        <span className="font-semibold text-white">08:35 AM (In time for 9AM exam)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fare:</span>
                        <span className="font-semibold text-amber-300">₹32 (Student Pass Valid)</span>
                      </div>
                    </div>
                  </div>

                  {/* Micro mini-map preview */}
                  <div className="bg-navy-950 rounded-xl p-3 border border-navy-700 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-blue/30 flex items-center justify-center text-brand-blue-light font-bold">
                        🚌
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">Relief Shuttle Dispatched</div>
                        <div className="text-[10px] text-slate-400">KSRTC Standby KA-19-F-9901</div>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold text-[10px]">ETA 8 mins</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-navy-700/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Demo coordinates: 13.0854°N, 74.8722°E</span>
                  <Link to="/planner" className="text-brand-blue-light font-semibold hover:underline">
                    Test live route planner →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* IMPACT STATISTICS SECTION */}
      <section className="relative -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demo Stat</span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-navy-900">{stat.value}</div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{stat.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{stat.note}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* HOW ROUTELESS WORKS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-blue uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Intelligent Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 mt-3">
            How ROUTELESS Keeps Students Moving
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            A 4-step fail-safe system that ensures no student is stranded when regular transport breaks down.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(step => (
            <div
              key={step.step}
              className="relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition"
            >
              <div className="text-3xl font-black text-brand-blue/20 mb-3">{step.step}</div>
              <h3 className="text-base font-bold text-navy-900 mb-2">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE CORE PROBLEM & OUR SOLUTION */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-navy-900">
              The Rural Education Mobility Gap
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              In villages across Karnataka and rural India, millions of bright students miss practical exams, semester classes, and degree completions due to brittle single-bus schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* The Real Problem */}
            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-7 space-y-4">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>The Rural Transport Dilemma Today</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span><strong>Only 1 or 2 buses per day</strong> connect remote interior villages to regional colleges.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span><strong>Mechanical delays or sudden cancellations</strong> leave students standing stranded on roadside stops with zero information.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span><strong>Overcrowded footboard commuting</strong> forces conductors to skip intermediate rural stops entirely.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span><strong>Transit authorities have no real-time data</strong> on where students are stranded until after exams are missed.</span>
                </li>
              </ul>
            </div>

            {/* Our Solution */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-7 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>How ROUTELESS Solves It</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span><strong>AI Alternative Finder</strong> instantly calculates backup connecting routes, shared rural cruisers, and cross-village pickups.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span><strong>Demand Aggregation Engine</strong> clusters stranded student requests and empowers KSRTC controllers to dispatch relief shuttles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span><strong>Live GPS Radar & Capacity Badges</strong> give students transparent visibility of seat availability before buses arrive.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span><strong>ROUTELESS AI Assistant</strong> provides conversational guidance and step-by-step navigation in Kannada and English contexts.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SHOWCASE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-blue uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 mt-3">
            Engineered for Real-World Rural Transit
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Explore the core technology modules built to empower students, operators, and transport administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-navy-800 text-amber-400 flex items-center justify-center shadow-md shadow-navy-900/10">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-brand-blue border border-blue-200">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-navy-900 mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">{feat.desc}</p>
                </div>
                <Link
                  to={feat.path}
                  className="text-xs font-bold text-brand-blue hover:text-brand-blue-dark flex items-center gap-1 group"
                >
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="bg-gradient-to-r from-navy-900 via-navy-800 to-[#102A43] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-navy-700">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Live Hackathon Evaluation</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            "Your destination matters. We'll help you get there."
          </h2>

          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            Experience the complete end-to-end journey planner, trigger live bus cancellation scenarios, and test AI multi-modal alternative recommendations right now.
          </p>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/planner"
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-accent to-amber-600 text-navy-900 hover:brightness-110 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
            >
              <span>Get Started as Student</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/admin"
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition"
            >
              <span>Open Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
