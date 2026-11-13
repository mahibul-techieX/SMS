import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Users,
  ShieldCheck,
  Calendar,
  Zap,
  ArrowUpRight,
  AlertCircle,
  Sparkles,
  BarChart3,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { EnterpriseLicense } from '../types';
import { db } from '../services/db';

interface LicenseUsageTrendsChartProps {
  license: EnterpriseLicense;
  onUpgradeTier?: () => void;
  onExtendCapacity?: (newMax: number) => void;
}

export const LicenseUsageTrendsChart: React.FC<LicenseUsageTrendsChartProps> = ({
  license,
  onUpgradeTier,
  onExtendCapacity
}) => {
  const [viewMode, setViewMode] = useState<'growth' | 'utilization' | 'revenue'>('growth');
  const [timeRange, setTimeRange] = useState<'6m' | '3m'>('6m');

  const allStudents = db.getAllStudents();
  const currentCount = allStudents.length;
  const maxCapacity = license.maxStudents || 500;

  // Generate realistic 6-month historical progression leading to current live numbers
  const baseStudents = Math.max(12, Math.round(currentCount * 0.45));
  const step = (currentCount - baseStudents) / 5;

  const rawData6M = [
    {
      month: 'May 2026',
      shortMonth: 'May',
      students: Math.round(baseStudents),
      capacity: maxCapacity,
      utilization: Math.round((baseStudents / maxCapacity) * 100),
      admissions: Math.max(4, Math.round(step * 0.8)),
      collections: 145000,
      activeUsers: 2
    },
    {
      month: 'Jun 2026',
      shortMonth: 'Jun',
      students: Math.round(baseStudents + step * 1),
      capacity: maxCapacity,
      utilization: Math.round(((baseStudents + step * 1) / maxCapacity) * 100),
      admissions: Math.max(6, Math.round(step * 1.1)),
      collections: 215000,
      activeUsers: 2
    },
    {
      month: 'Jul 2026',
      shortMonth: 'Jul',
      students: Math.round(baseStudents + step * 2),
      capacity: maxCapacity,
      utilization: Math.round(((baseStudents + step * 2) / maxCapacity) * 100),
      admissions: Math.max(8, Math.round(step * 1.3)),
      collections: 285000,
      activeUsers: 3
    },
    {
      month: 'Aug 2026',
      shortMonth: 'Aug',
      students: Math.round(baseStudents + step * 3),
      capacity: maxCapacity,
      utilization: Math.round(((baseStudents + step * 3) / maxCapacity) * 100),
      admissions: Math.max(5, Math.round(step * 0.9)),
      collections: 340000,
      activeUsers: 3
    },
    {
      month: 'Sep 2026',
      shortMonth: 'Sep',
      students: Math.round(baseStudents + step * 4),
      capacity: maxCapacity,
      utilization: Math.round(((baseStudents + step * 4) / maxCapacity) * 100),
      admissions: Math.max(7, Math.round(step * 1.0)),
      collections: 410000,
      activeUsers: 4
    },
    {
      month: 'Oct 2026 (Live)',
      shortMonth: 'Oct',
      students: currentCount,
      capacity: maxCapacity,
      utilization: Math.min(100, Math.round((currentCount / maxCapacity) * 100)),
      admissions: Math.max(3, Math.round(step * 0.7)),
      collections: 495000,
      activeUsers: 4
    }
  ];

  const trendData = timeRange === '3m' ? rawData6M.slice(3) : rawData6M;

  // Growth calculations
  const firstCount = trendData[0].students;
  const growthAbsolute = currentCount - firstCount;
  const growthRate = firstCount > 0 ? Math.round((growthAbsolute / firstCount) * 100) : 0;
  const avgMonthlyGrowth = Math.max(1, Math.round(growthAbsolute / (trendData.length - 1 || 1)));
  const remainingSlots = Math.max(0, maxCapacity - currentCount);
  const estimatedMonthsToCap = avgMonthlyGrowth > 0 ? Math.round(remainingSlots / avgMonthlyGrowth) : 99;

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[180px]">
          <div className="font-bold text-amber-400 border-b border-slate-700 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-slate-400 font-normal">AY 2026-27</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {entry.name.includes('Collection') || entry.name.includes('Revenue')
                  ? `₹${entry.value.toLocaleString('en-IN')}`
                  : entry.name.includes('%') || entry.name.includes('Utilization')
                  ? `${entry.value}%`
                  : entry.value}
              </span>
            </div>
          ))}
          <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>License Cap:</span>
            <span className="font-mono text-slate-300 font-bold">{maxCapacity} students</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700">
              License Telemetry & Subscription Runway
            </span>
          </div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            6-Month Historical License Usage & Student Growth
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Track student intake trajectory, quota exhaustion velocity, and institutional expansion metrics
          </p>
        </div>

        {/* View Mode & Range Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 3M / 6M Pill */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTimeRange('6m')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeRange === '6m' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 6 Months
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('3m')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeRange === '3m' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 3 Months
            </button>
          </div>

          {/* Metric View Tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('growth')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'growth'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Growth</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('utilization')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'utilization'
                  ? 'bg-amber-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Utilization %</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('revenue')}
              className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'revenue'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Fee Velocity</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subscription KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80">
          <span className="text-[10px] uppercase font-bold text-blue-700 block">Growth Momentum</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black text-blue-950 font-mono">+{growthRate}%</span>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              +{growthAbsolute} students
            </span>
          </div>
          <span className="text-[10px] text-blue-600 block mt-0.5 font-medium">Avg +{avgMonthlyGrowth} new/month</span>
        </div>

        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Current Capacity Cap</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black text-amber-950 font-mono">{maxCapacity}</span>
            <span className="text-[10px] text-slate-500 font-semibold">Max Quota</span>
          </div>
          <span className="text-[10px] text-amber-800 block mt-0.5 font-medium">
            {remainingSlots} available seats left
          </span>
        </div>

        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Quota Saturation Runway</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black text-emerald-950 font-mono">
              {estimatedMonthsToCap > 36 ? '36+ mos' : `~${estimatedMonthsToCap} mos`}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold">at current rate</span>
          </div>
          <span className="text-[10px] text-emerald-700 block mt-0.5 font-medium">
            {license.isTrial ? 'Trial quota adequate' : 'Commercial headroom safe'}
          </span>
        </div>

        <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80">
          <span className="text-[10px] uppercase font-bold text-purple-700 block">Subscription Tier</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-purple-950 capitalize truncate">
              {license.isTrial ? 'Trial 500' : 'Enterprise Pro'}
            </span>
          </div>
          <span className="text-[10px] text-purple-700 block mt-0.5 font-medium">
            {license.validUntil}
          </span>
        </div>
      </div>

      {/* Recharts Visual Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'growth' ? (
            <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="studentGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="capacityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="shortMonth" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                domain={[0, (dataMax: number) => Math.max(maxCapacity, Math.ceil(dataMax * 1.15))]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />
              <ReferenceLine
                y={maxCapacity}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{ value: `License Cap: ${maxCapacity} Students`, fill: '#b45309', fontSize: 11, position: 'top' }}
              />
              <Area
                type="monotone"
                dataKey="students"
                name="Enrolled Students"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#studentGrowthGradient)"
                activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
              />
              <Area
                type="monotone"
                dataKey="admissions"
                name="Monthly New Intake"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="3 3"
                fill="none"
              />
            </AreaChart>
          ) : viewMode === 'utilization' ? (
            <BarChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="shortMonth" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                domain={[0, 100]}
                unit="%"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />
              <ReferenceLine
                y={80}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: '80% High Warning Cap', fill: '#dc2626', fontSize: 10, position: 'right' }}
              />
              <Bar
                dataKey="utilization"
                name="Capacity Utilization %"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
            </BarChart>
          ) : (
            <LineChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="shortMonth" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                tickFormatter={(val) => `₹${Math.round(val / 1000)}k`}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12, paddingBottom: 10 }} />
              <Line
                type="monotone"
                dataKey="collections"
                name="Monthly Fee Ledger Volume"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 5, fill: '#059669' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Admin Action & Advisory Footer */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Capacity Management Recommendation: </span>
            <span className="text-slate-600">
              {currentCount / maxCapacity > 0.85
                ? 'Your student roster is approaching 85% of your license ceiling. Plan a capacity expansion to prevent registration blocks.'
                : 'Current student trajectory is well within subscription headroom. Next recommended license check: December 2026.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onExtendCapacity && (
            <button
              type="button"
              onClick={() => onExtendCapacity(maxCapacity + 250)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
            >
              <span>+250 Quota</span>
            </button>
          )}
          {onUpgradeTier && (
            <button
              type="button"
              onClick={onUpgradeTier}
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
