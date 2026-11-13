import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Github, ExternalLink, ShieldCheck, PhoneCall, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-900 text-slate-300 border-t border-navy-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-navy-800">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white">
                <Compass className="w-5 h-5 text-amber-400" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">ROUTELESS</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every student deserves a way to reach their future. AI-assisted rural transit management and smart alternative mobility.
            </p>
            <div className="text-xs text-amber-400 font-medium bg-navy-800/80 p-2.5 rounded-lg border border-amber-400/20">
              📍 Pilot Network: Dakshina Kannada & Udupi Rural Corridor (Kinnigoli ↔ Moodbidri)
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Transit Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/planner" className="hover:text-white transition">Smart Journey Planner</Link>
              </li>
              <li>
                <Link to="/tracking" className="hover:text-white transition">Live Bus GPS Tracking</Link>
              </li>
              <li>
                <Link to="/alternatives" className="hover:text-white transition">Alternative Transport Finder</Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="hover:text-white transition">ROUTELESS AI Companion</Link>
              </li>
              <li>
                <Link to="/demand" className="hover:text-white transition">AI Demand Prediction</Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">User Dashboards</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-white transition">Student Portal</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition">KSRTC Admin Command Center</Link>
              </li>
              <li>
                <Link to="/operator" className="hover:text-white transition">Bus Operator Console</Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-white transition">Report Disruption / Overcrowding</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">System Architecture & Docs</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hackathon Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Hackathon Showcase</h4>
            <p className="text-xs text-slate-400">
              Built for production demonstration with real-time graph pathfinding, multi-modal alternative scoring, and continuous GPS simulation.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Mail className="w-3.5 h-3.5 text-brand-blue-light" />
              <span>demo@routeless.org</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <PhoneCall className="w-3.5 h-3.5 text-brand-blue-light" />
              <span>Dakshina Kannada Transit Helpline</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 ROUTELESS — The Last Mile. Open Source Project.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-300">About</Link>
            <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300">Terms of Service</Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-white transition"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
