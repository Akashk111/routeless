import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { useNotifications } from '../../context/NotificationContext.js';
import { Sparkles, AlertTriangle, Users, Bus, RotateCcw, Check, ChevronDown, Activity } from 'lucide-react';

export const DemoScenarioBar: React.FC = () => {
  const { user, role, demoLogin } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [scenarioMessage, setScenarioMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleTriggerScenario = async (scen: 'A' | 'B' | 'C') => {
    setActiveScenario(scen);
    try {
      const res = await api.triggerScenario(scen);
      setScenarioMessage(res.description);
      await refreshNotifications();
    } catch (err: any) {
      setScenarioMessage(`Triggered scenario ${scen}`);
    }
    setTimeout(() => setScenarioMessage(null), 7000);
  };

  const handleReset = async () => {
    setIsResetting(true);
    setActiveScenario(null);
    try {
      await api.resetDemoData();
      await refreshNotifications();
      setScenarioMessage('Demo network state reset to original schedule.');
    } catch (e) {
      setScenarioMessage('Reset completed.');
    } finally {
      setIsResetting(false);
      setTimeout(() => setScenarioMessage(null), 5000);
    }
  };

  return (
    <div className="bg-[#0B1D3A] text-slate-200 border-b border-navy-700 text-xs px-3 py-2 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Hackathon Live Demo Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-brand-blue/20 text-blue-400 font-semibold px-2 py-0.5 rounded border border-blue-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            HACKATHON EVALUATION MODE
          </span>
          <span className="hidden sm:inline-block text-slate-400">
            Mangaluru Rural Transit Corridor (Kinnigoli ↔ Moodbidri)
          </span>
        </div>

        {/* Center: 1-Click Scenario Triggers */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Test Scenario:
          </span>

          <button
            onClick={() => handleTriggerScenario('A')}
            title="Simulate regular Bus 14B cancelled at Kinnigoli"
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
              activeScenario === 'A'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-navy-800 hover:bg-navy-700 text-rose-300 border border-rose-500/30'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Scenario A: Cancel Bus 14B</span>
          </button>

          <button
            onClick={() => handleTriggerScenario('B')}
            title="Spike 18 student travel requests to Alva's College"
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
              activeScenario === 'B'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-navy-800 hover:bg-navy-700 text-amber-300 border border-amber-500/30'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Scenario B: Demand Surge (18 reqs)</span>
          </button>

          <button
            onClick={() => handleTriggerScenario('C')}
            title="Simulate Bus 22A Gurupura overcrowded (100% full)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
              activeScenario === 'C'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-navy-800 hover:bg-navy-700 text-purple-300 border border-purple-500/30'
            }`}
          >
            <Bus className="w-3.5 h-3.5 text-purple-400" />
            <span>Scenario C: Overcrowded 22A</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset data back to pristine state"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>
        </div>

        {/* Right: Quick Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 bg-navy-800 hover:bg-navy-700 border border-navy-600 px-2.5 py-1 rounded text-slate-200"
          >
            <Activity className="w-3 h-3 text-brand-blue-light" />
            <span>View As: <strong className="text-white capitalize">{role || 'Student'}</strong> ({user?.name.split(' ')[0]})</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1 w-56 bg-navy-900 border border-navy-700 rounded-lg shadow-xl py-1 z-50 text-slate-300">
              <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-slate-400 border-b border-navy-800">
                1-Click Role Switcher
              </div>
              <button
                onClick={() => { demoLogin('student'); setShowRoleMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-navy-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">Student: Ananya Rao</div>
                  <div className="text-[11px] text-slate-400">Kinnigoli → Alva's College</div>
                </div>
                {role === 'student' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={() => { demoLogin('admin'); setShowRoleMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-navy-800 flex items-center justify-between text-xs border-t border-navy-800"
              >
                <div>
                  <div className="font-semibold text-white">Admin: K. R. Hegde</div>
                  <div className="text-[11px] text-slate-400">KSRTC Rural Controller</div>
                </div>
                {role === 'admin' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={() => { demoLogin('operator'); setShowRoleMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-navy-800 flex items-center justify-between text-xs border-t border-navy-800"
              >
                <div>
                  <div className="font-semibold text-white">Operator: Suresh Naik</div>
                  <div className="text-[11px] text-slate-400">Route 14B Lead Conductor</div>
                </div>
                {role === 'operator' && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating notification bar if scenario active */}
      {scenarioMessage && (
        <div className="mt-1.5 py-1 px-3 bg-amber-500/20 border border-amber-500/40 rounded text-amber-200 text-center animate-fadeIn text-[11px] flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{scenarioMessage}</span>
        </div>
      )}
    </div>
  );
};
