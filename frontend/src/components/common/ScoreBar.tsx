import React from 'react';

interface ScoreBarProps {
  score: number; // 0 - 100
  breakdown?: {
    timeScore: number;
    costScore: number;
    convenienceScore: number;
    reliabilityScore: number;
  };
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ score, breakdown }) => {
  const getScoreColor = (val: number) => {
    if (val >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (val >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (val >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Recommendation Match</span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(score)}`}>
          {score}% Score
        </span>
      </div>

      {/* Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            score >= 90 ? 'bg-emerald-500' : score >= 80 ? 'bg-blue-600' : score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Breakdown Pills */}
      {breakdown && (
        <div className="grid grid-cols-4 gap-1.5 pt-1 text-[11px] text-slate-600 text-center">
          <div className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
            <span className="text-slate-400 block text-[9px] uppercase">Speed</span>
            <span className="font-semibold">{breakdown.timeScore}%</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
            <span className="text-slate-400 block text-[9px] uppercase">Economy</span>
            <span className="font-semibold">{breakdown.costScore}%</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
            <span className="text-slate-400 block text-[9px] uppercase">Ease</span>
            <span className="font-semibold">{breakdown.convenienceScore}%</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
            <span className="text-slate-400 block text-[9px] uppercase">Reliability</span>
            <span className="font-semibold text-emerald-600">{breakdown.reliabilityScore}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
