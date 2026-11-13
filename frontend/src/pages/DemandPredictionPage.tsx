import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  Bus,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';

const PIE_COLORS = ['#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6', '#10B981', '#64748B'];

export const DemandPredictionPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allocatingBus, setAllocatingBus] = useState(false);
  const [allocationMessage, setAllocationMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPrediction();
  }, []);

  const loadPrediction = async () => {
    try {
      const pred = await api.getDemandPrediction();
      setData(pred);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllocateRelief = async () => {
    setAllocatingBus(true);
    try {
      const res = await api.allocateReliefBus('route-14b', 'KA-19-F-9901');
      setAllocationMessage(res.message);
      await loadPrediction();
      setTimeout(() => setAllocationMessage(null), 6000);
    } catch (e) {
      console.error(e);
    } finally {
      setAllocatingBus(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8 text-xs text-slate-500">
        <BarChart3 className="w-8 h-8 text-brand-blue animate-spin mb-2" />
        <span className="ml-2">Aggregating student demand patterns and route capacity curves...</span>
      </div>
    );
  }

  const {
    summary,
    demandByTimeOfDay,
    villageWiseDemand,
    popularDestinations,
    capacityUtilization,
    problemCategories,
    smartRecommendations
  } = data;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Statistical & Aggregated AI Transit Forecasting</span>
            </div>
            <h1 className="text-3xl font-extrabold text-navy-900">Demand Prediction & Capacity Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies rural education commute bottlenecks and recommends optimal fleet allocation across Dakshina Kannada.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAllocateRelief}
              disabled={allocatingBus}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Bus className="w-4 h-4" />
              <span>{allocatingBus ? 'Dispatching...' : 'Dispatch Relief Shuttle (KA-19-F-9901)'}</span>
            </button>

            <button
              onClick={loadPrediction}
              className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ALLOCATION TOAST MESSAGE */}
        {allocationMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-bold">{allocationMessage}</span>
            </div>
            <span className="text-[11px] text-emerald-700">Student pending requests updated to ADDITIONAL_BUS_ASSIGNED</span>
          </div>
        )}

        {/* METRIC STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Students in Network</span>
            <div className="text-2xl font-black text-navy-900 mt-1">{summary.totalStudents}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">Active rural passholders</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Fleet</span>
            <div className="text-2xl font-black text-brand-blue mt-1">{summary.activeBuses}</div>
            <span className="text-[10px] text-slate-500 font-medium">Across {summary.totalRoutes} corridors</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Fleet Utilization</span>
            <div className="text-2xl font-black text-purple-700 mt-1">{summary.fleetUtilizationPercent}%</div>
            <span className="text-[10px] text-purple-600 font-semibold">Peak seat occupancy</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Travel Requests</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{summary.totalRequests}</div>
            <span className="text-[10px] text-amber-600 font-semibold">Aggregated today</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Unresolved Issues</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{summary.unresolvedReports}</div>
            <span className="text-[10px] text-rose-600 font-semibold">{summary.totalReports} total logged</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Critical Corridor</span>
            <div className="text-sm font-extrabold text-rose-700 mt-2 truncate">{summary.criticalCorridor}</div>
            <span className="text-[10px] text-slate-400 font-medium">Deficit: ~58 seats</span>
          </div>
        </div>

        {/* AI SMART ALLOCATION RECOMMENDATIONS */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white p-6 rounded-2xl border border-navy-700 shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">AI Resource Allocation Engine</h2>
              <p className="text-xs text-slate-300">Algorithmic findings from aggregated student commute patterns</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {smartRecommendations.map((rec: any) => (
              <div key={rec.id} className="bg-navy-950/80 border border-navy-700/80 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    rec.priority === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">{rec.corridor}</span>
                </div>
                <p className="text-slate-300">{rec.finding}</p>
                <div className="bg-navy-900 p-2.5 rounded-lg border border-navy-800 text-amber-300 font-medium">
                  <strong>Action:</strong> {rec.recommendedAction}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Impact: {rec.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHARTS ROW 1: TIME OF DAY COMMUTE DEMAND CURVE & VILLAGE STRESS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Demand by Time Slot (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy-900">Student Demand vs Bus Capacity Curve</h3>
                <p className="text-xs text-slate-500">Commute volume across morning, afternoon, and evening windows</p>
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-brand-blue px-2 py-1 rounded">
                Hourly Time Slots
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demandByTimeOfDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="timeSlot" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#102A43', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="studentCount" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.4} name="Student Commuters" />
                  <Area type="monotone" dataKey="busCapacity" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Scheduled Bus Capacity" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-blue shrink-0" />
              <span><strong>Deficit Identified:</strong> Morning peak 07:30 - 08:30 AM has an unmet student demand of 58 seats, requiring immediate relief shuttle dispatch.</span>
            </div>
          </div>

          {/* Village Wise Demand (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-navy-900">Village-Wise Demand & Alert Index</h3>
              <p className="text-xs text-slate-500">Origin villages ranked by stranded student count</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={villageWiseDemand} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="village" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#102A43', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="requests" fill="#F59E0B" radius={[0, 6, 6, 0]} name="Student Requests" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* CHARTS ROW 2: CAPACITY UTILIZATION & PROBLEM BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Capacity Utilization Table / Bar (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-navy-900">Bus Fleet Capacity Utilization</h3>
              <p className="text-xs text-slate-500">Live seat occupancy percentages by corridor</p>
            </div>

            <div className="space-y-3">
              {capacityUtilization.map((b: any) => (
                <div key={b.busNumber} className="text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{b.busNumber} • {b.routeName}</span>
                    <span className={b.utilizationPercent >= 100 ? 'text-rose-600 font-extrabold' : b.utilizationPercent >= 80 ? 'text-amber-600' : 'text-emerald-600'}>
                      {b.utilizationPercent}% ({b.availableSeats} seats left)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.utilizationPercent >= 100 ? 'bg-rose-500' : b.utilizationPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.utilizationPercent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Problem Categories Pie (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-navy-900">Logged Transport Disruption Types</h3>
              <p className="text-xs text-slate-500">Breakdown of reported issues</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={problemCategories}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: any) => `${name.substring(0, 10)} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {problemCategories.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#102A43', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
