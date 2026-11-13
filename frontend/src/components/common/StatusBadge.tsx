import React from 'react';
import { BusStatus } from '../../types/index.js';

interface StatusBadgeProps {
  status: BusStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let pulse = false;

  switch (status) {
    case 'On Time':
    case 'Optimal':
    case 'Active':
    case 'RESOLVED':
    case 'ADDITIONAL_BUS_ASSIGNED':
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'Approaching Stop':
    case 'In Progress':
      color = 'bg-blue-50 text-blue-700 border-blue-200';
      dotColor = 'bg-blue-500';
      pulse = true;
      break;
    case 'Delayed':
    case 'INVESTIGATING':
    case 'GROUPED':
      color = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500';
      pulse = true;
      break;
    case 'Full Capacity':
      color = 'bg-purple-50 text-purple-700 border-purple-200';
      dotColor = 'bg-purple-500';
      break;
    case 'Cancelled':
    case 'Disrupted':
    case 'Out of Service':
    case 'REJECTED':
      color = 'bg-rose-50 text-rose-700 border-rose-200';
      dotColor = 'bg-rose-500';
      pulse = true;
      break;
    case 'PENDING':
      color = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-400';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${color} ${sizeClasses}`}>
      <span className={`h-2 w-2 rounded-full ${dotColor} ${pulse ? 'animate-ping' : ''}`} />
      <span>{status}</span>
    </span>
  );
};
