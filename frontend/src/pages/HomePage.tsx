import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Bot,
  Bus as BusIcon,
  Search,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { BUS_CATEGORY_IMAGES } from '../utils/busImages.js';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [quickOrigin, setQuickOrigin] = useState('Kinnigoli');
  const [quickDestination, setQuickDestination] = useState("Moodbidri (Alva's College)");
  const [quickTime, setQuickTime] = useState('07:30');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/journey?origin=${encodeURIComponent(quickOrigin)}&destination=${encodeURIComponent(quickDestination)}&time=${encodeURIComponent(quickTime)}`);
  };

  const stats = [
    { label: 'Students Connected', value: '420+', icon: Users, note: 'Daily rural commuters' },
    { label: 'Villages Covered', value: '24+', icon: MapPin, note: 'Dakshina Kannada & Udupi network' },
    { label: 'Active Fleet Buses', value: '32', icon: BusIcon, note: 'Government, Private & College' },
    { label: 'Disruptions Resolved', value: '96.4%', icon: ShieldCheck, note: 'Via dynamic KSRTC relief' },
  ];

  const fleetShowcase = [
    {
      category: 'Government Sarige',
      name: 'KSRTC Ordinary & Express',
      tagline: 'Affordable Lifeline for Rural Students',
      image: BUS_CATEGORY_IMAGES.government.ordinary,
      fare: '₹15 - ₹45',
      capacity: '50-55 Seats',
      badge: 'Student Pass Valid',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      routes: 'Kinnigoli, Kateel, Bajpe, Moodbidri, Mangaluru'
    },
    {
      category: 'Coastal Private',
      name: 'Canara Star & Express Liners',
      tagline: 'High-Frequency Inter-Taluk Transit',
      image: BUS_CATEGORY_IMAGES.private.coastal,
      fare: '₹20 - ₹50',
      capacity: '40-45 Seats',
      badge: 'High Frequency',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      routes: 'Udupi, Karkala, Moodbidri, Surathkal'
    },
    {
      category: 'College Shuttles',
      name: "Alva's & Campus Transit Express",
      tagline: 'Direct Point-to-Point Campus Shuttles',
      image: BUS_CATEGORY_IMAGES.college.campus,
      fare: 'Free / ₹10',
      capacity: '40-48 Seats',
      badge: 'Campus Direct',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      routes: 'Vidyagiri Campus, Mijar Engineering, NITK'
    },
    {
      category: 'Rural Feeders',
      name: 'Gramina Maxicab & Rural Feeders',
      tagline: 'Deep Last-Mile Village Connectivity',
      image: BUS_CATEGORY_IMAGES.rural.feeder,
      fare: '₹12 - ₹25',
      capacity: '14-20 Seats',
      badge: 'Last-Mile Connect',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      routes: 'Kinnigoli Interior, Belman, Miyar, Haleyangadi'
    }
  ];

  const features = [
    {
      title: 'Graph Route Optimization',
      desc: 'Shortest-path Dijkstra algorithm connects villages through direct and 1-2 transfer links with realistic layover buffers.',
      icon: Compass,
      path: '/journey',
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
      title: 'Live GPS Bus Radar',
      desc: 'Interactive OpenStreetMap radar showing exact bus positions, real-time speeds, and seat availability along coastal highway corridors.',
      icon: Radio,
      path: '/tracking',
      badge: 'Live Map'
    },
    {
      title: 'Student Demand Pooling',
      desc: 'Classmates pool travel requests together; when demand spikes, transit authorities receive instant alerts to dispatch relief buses.',
      icon: Users,
      path: '/demand',
      badge: 'Community Pool'
    },
    {
      title: 'Crowdsourced Issue Reporting',
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1D3A] via-[#102A43] to-[#1F3A60] text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#60A5FA_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left text column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-brand-blue/20 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI-Assisted Rural Transportation Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                EVERY STUDENT DESERVES A WAY TO REACH THEIR{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-orange-400">
                  FUTURE.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-xl">
                Smart rural mobility for Dakshina Kannada & Udupi. Real timetables, 32 connected buses, live GPS tracking, and instant backup alternatives so no student ever misses class.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/journey"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-accent to-amber-600 text-navy-900 hover:brightness-110 shadow-lg shadow-amber-500/20 flex items-center gap-2 group transition"
                >
                  <span>Search Bus Timetables</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>

                <Link
                  to="/tracking"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-brand-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
                >
                  <Radio className="w-4 h-4 text-emerald-300" />
                  <span>Track Live Buses</span>
                </Link>

                <Link
                  to="/alternatives"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm flex items-center gap-2 transition"
                >
                  <Shuffle className="w-4 h-4 text-amber-300" />
                  <span>Alternative Finder</span>
                </Link>
              </div>

              {/* Active Pilot Route Tag */}
              <div className="pt-3 flex items-center gap-2 text-xs text-slate-300">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-medium">Direct Corridor: Kinnigoli ↔ Kateel ↔ Bajpe ↔ Moodbidri (Alva's College)</span>
              </div>
            </motion.div>

            {/* Right transportation illustration card with LARGE GOVERNMENT BUS HERO */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-6"
            >
              <div className="relative bg-gradient-to-b from-navy-800 to-navy-900 border-2 border-slate-700/80 rounded-3xl p-5 shadow-2xl overflow-hidden group">
                {/* Government Bus Hero Visual */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-950 aspect-[16/9] shadow-inner">
                  <img
                    src="/images/buses/government-ksrtc-hero.svg"
                    alt="KSRTC Karnataka Sarige Rural Bus"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent"></div>

                  {/* Over-image floating badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-red-600/90 text-white text-[10px] font-black uppercase rounded-lg tracking-wider shadow">
                      KSRTC Gramina
                    </span>
                    <span className="px-2.5 py-1 bg-navy-900/90 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-bold rounded-lg shadow">
                      KA-19-F-1401
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Route 14B</div>
                      <div className="font-extrabold text-white text-sm">Kinnigoli ➔ Moodbidri (Alva's)</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        On Time (42 km/h)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Micro Status Bar */}
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-navy-950/70 p-2.5 rounded-xl border border-navy-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Departure</span>
                    <strong className="text-white text-sm">07:30 AM</strong>
                  </div>
                  <div className="bg-navy-950/70 p-2.5 rounded-xl border border-navy-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Arrival Alva's</span>
                    <strong className="text-emerald-400 text-sm">08:14 AM</strong>
                  </div>
                  <div className="bg-navy-950/70 p-2.5 rounded-xl border border-navy-700">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Seats</span>
                    <strong className="text-amber-400 text-sm">14 Free</strong>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* QUICK JOURNEY PLANNER SEARCH BAR (Interactive) */}
      <section className="relative -mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-30">
        <form
          onSubmit={handleQuickSearch}
          className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-blue" />
              Starting Village / Town
            </label>
            <input
              type="text"
              value={quickOrigin}
              onChange={e => setQuickOrigin(e.target.value)}
              placeholder="e.g. Kinnigoli"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              Destination College / Campus
            </label>
            <input
              type="text"
              value={quickDestination}
              onChange={e => setQuickDestination(e.target.value)}
              placeholder="e.g. Moodbidri (Alva's College)"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Departure Time
            </label>
            <input
              type="time"
              value={quickTime}
              onChange={e => setQuickTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Find Available Buses</span>
            </button>
          </div>
        </form>
      </section>

      {/* IMPACT METRICS */}
      <section className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Stat</span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-navy-900">{stat.value}</div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{stat.label}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{stat.note}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DIVERSE FLEET CATEGORIES SHOWCASE (Part 3 Requirement) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-blue uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Regional Fleet Network
          </span>
          <h2 className="text-3xl font-extrabold text-navy-900 mt-3">
            Connected Multi-Operator Fleet
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Over 30 buses spanning government, coastal express, campus shuttles, and village feeders coordinated through one intelligent backend.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleetShowcase.map((fleet, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Bus Image Header */}
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden border-b border-slate-100">
                <img
                  src={fleet.image}
                  alt={fleet.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-2.5 left-2.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${fleet.badgeColor}`}>
                  {fleet.badge}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{fleet.category}</span>
                  <h3 className="font-extrabold text-navy-900 text-sm mt-0.5">{fleet.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{fleet.tagline}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Typical Fare:</span>
                    <strong className="text-slate-700">{fleet.fare}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Capacity:</span>
                    <strong className="text-slate-700">{fleet.capacity}</strong>
                  </div>
                </div>

                <Link
                  to={`/journey?busType=${encodeURIComponent(fleet.category.includes('Government') ? 'KSRTC Ordinary' : fleet.category.includes('Private') ? 'Private Route' : fleet.category.includes('College') ? 'College Shuttle' : 'Shared Feeder')}`}
                  className="w-full py-2 rounded-xl bg-slate-50 hover:bg-brand-blue hover:text-white text-brand-blue font-bold text-xs text-center border border-slate-200 transition"
                >
                  View Scheduled Buses →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CORE PLATFORM CAPABILITIES */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Platform Modules
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 mt-3">
              Built Specifically for Rural Commuting Realities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <Link
                  key={feat.title}
                  to={feat.path}
                  className="p-6 rounded-2xl border border-slate-200/90 hover:border-brand-blue hover:shadow-md transition group bg-slate-50/50 hover:bg-white"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-brand-blue text-brand-blue group-hover:text-white flex items-center justify-center transition">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-navy-900 mb-2 group-hover:text-brand-blue transition">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
