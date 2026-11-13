import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  ShieldAlert,
  Users,
  Award,
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import { EnterpriseLicense } from '../types';
import { db } from '../services/db';

interface LicenseOverviewProps {
  license: EnterpriseLicense;
  onExtendQuick?: (days: number) => void;
  onOpenModifyTab?: () => void;
  onOpenTrialTab?: () => void;
  onOpenKeyTab?: () => void;
}

export const LicenseOverview: React.FC<LicenseOverviewProps> = ({
  license,
  onExtendQuick,
  onOpenModifyTab,
  onOpenTrialTab,
  onOpenKeyTab
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  const allStudents = db.getAllStudents();
  const currentStudents = allStudents.length;
  const maxStudents = license.maxStudents || 500;
  const capacityPercent = Math.min(100, Math.round((currentStudents / maxStudents) * 100));

  const isPerpetual = license.validUntil.startsWith('209') || license.validUntil.startsWith('210');
  const isTrial = license.isTrial;

  // Calculate dynamic countdown ticker every second
  useEffect(() => {
    const updateCountdown = () => {
      if (isPerpetual) {
        setTimeLeft({ days: 9999, hours: 23, minutes: 59, seconds: 59, totalSeconds: 99999999 });
        return;
      }

      // Target expiration at 23:59:59 on the expiration date
      const targetTime = new Date(`${license.validUntil}T23:59:59`).getTime();
      const now = new Date().getTime();
      const diffMs = targetTime - now;

      if (diffMs <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
      } else {
        const totalSecs = Math.floor(diffMs / 1000);
        const days = Math.floor(totalSecs / (3600 * 24));
        const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = Math.floor(totalSecs % 60);
        setTimeLeft({ days, hours, minutes, seconds, totalSeconds: totalSecs });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [license.validUntil, isPerpetual]);

  // Calculate license time elapsed percentage
  const calculateTimeProgress = () => {
    if (isPerpetual) return 100;
    try {
      const issued = new Date(`${license.issuedDate}T00:00:00`).getTime();
      const expiry = new Date(`${license.validUntil}T23:59:59`).getTime();
      const now = new Date().getTime();

      if (now >= expiry) return 0; // 0% remaining
      if (now <= issued) return 100;

      const totalSpan = expiry - issued;
      const remainingSpan = expiry - now;
      const percentRemaining = Math.max(0, Math.min(100, Math.round((remainingSpan / totalSpan) * 100)));
      return percentRemaining;
    } catch {
      return 50;
    }
  };

  const remainingPercent = calculateTimeProgress();
  const isExpired = !isPerpetual && timeLeft.totalSeconds <= 0;
  const isCritical = !isPerpetual && !isExpired && timeLeft.days < 7;
  const isModerate = !isPerpetual && !isExpired && timeLeft.days >= 7 && timeLeft.days < 15;

  // SVG Radial Gauge calculation for student capacity
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (capacityPercent / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
      {/* Overview Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs ${
            isExpired
              ? 'bg-red-100 text-red-700 border border-red-200'
              : isTrial
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {isExpired ? (
              <ShieldAlert className="w-5 h-5 text-red-600" />
            ) : isTrial ? (
              <Clock className="w-5 h-5 text-amber-600" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Software License & Operational Capacity Overview
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                isExpired
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : isPerpetual
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : isTrial
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {isExpired ? 'Expired' : isPerpetual ? 'Perpetual Pro' : isTrial ? 'Trial Edition' : 'Commercial Pro'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time consumption telemetry, student allocation quota, and live countdown timer
            </p>
          </div>
        </div>

        {/* Quick Validity Extension Buttons */}
        <div className="flex items-center gap-2">
          {onExtendQuick && (
            <button
              type="button"
              onClick={() => onExtendQuick(15)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>+15 Days Trial</span>
            </button>
          )}
          {onOpenModifyTab && (
            <button
              type="button"
              onClick={onOpenModifyTab}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-300" />
              <span>Modify Expiry</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Metric Panel: (1) Live Countdown Timer & (2) Student Usage Radial Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER: Live Expiry Countdown Timer Widget (7 Cols) */}
        <div className={`lg:col-span-7 rounded-2xl p-5 border flex flex-col justify-between relative overflow-hidden transition-all ${
          isExpired
            ? 'bg-red-50/70 border-red-200 text-red-950'
            : isCritical
            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
            : isTrial
            ? 'bg-gradient-to-br from-amber-50/50 via-slate-50 to-blue-50/40 border-slate-200 text-slate-900'
            : 'bg-gradient-to-br from-emerald-50/50 via-slate-50 to-purple-50/40 border-slate-200 text-slate-900'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isExpired ? 'text-red-600' : isTrial ? 'text-amber-600' : 'text-emerald-600'}`} />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {isTrial ? 'Trial Validity Expiration Countdown' : 'Enterprise License Term Countdown'}
                </span>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500">
                Target: {isPerpetual ? 'Lifetime (No Expiry)' : license.validUntil}
              </span>
            </div>

            {/* Live Ticker Blocks */}
            {isPerpetual ? (
              <div className="py-5 px-4 bg-white/90 rounded-xl border border-purple-200 shadow-2xs flex items-center justify-center gap-4 text-center">
                <Award className="w-8 h-8 text-purple-600 shrink-0" />
                <div className="text-left">
                  <div className="text-xl font-black text-purple-950 tracking-tight">
                    Perpetual Enterprise License Active
                  </div>
                  <div className="text-xs text-purple-700 mt-0.5">
                    No expiration date configured. Lifetime offline operation granted for {license.organizationName}.
                  </div>
                </div>
              </div>
            ) : isExpired ? (
              <div className="py-4 px-4 bg-white rounded-xl border border-red-300 shadow-2xs text-center space-y-2">
                <div className="text-2xl font-black text-red-600 tracking-tight animate-pulse flex items-center justify-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span>00d : 00h : 00m : 00s</span>
                </div>
                <div className="text-xs font-bold text-red-800">
                  Software validity has elapsed. Extend evaluation days or apply commercial key to resume write actions.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:gap-3 py-1">
                {/* Days */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    Days
                  </div>
                </div>

                {/* Hours */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    Hours
                  </div>
                </div>

                {/* Minutes */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    Minutes
                  </div>
                </div>

                {/* Seconds */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-center">
                  <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                    isCritical ? 'text-amber-600' : 'text-blue-600'
                  }`}>
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                    Seconds
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time Remaining Life-cycle Progress Bar */}
          <div className="mt-4 pt-4 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span>Validity Time Cycle Remaining:</span>
              </span>
              <span className={`font-black font-mono ${
                isExpired ? 'text-red-600' : isCritical ? 'text-amber-600' : 'text-emerald-700'
              }`}>
                {isPerpetual ? '100% (Lifetime)' : isExpired ? '0% (Expired)' : `${remainingPercent}% Active`}
              </span>
            </div>

            {/* Styled Progress Track */}
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isExpired
                    ? 'bg-red-500 w-full'
                    : isCritical
                    ? 'bg-gradient-to-r from-amber-500 to-red-500'
                    : isModerate
                    ? 'bg-gradient-to-r from-blue-500 to-amber-500'
                    : 'bg-gradient-to-r from-emerald-500 to-blue-500'
                }`}
                style={{ width: isExpired ? '100%' : `${remainingPercent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>Issued: {license.issuedDate}</span>
              <span>Expires: {isPerpetual ? '2099-12-31' : license.validUntil}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Student Capacity Utilization Circular Gauge (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-50/70 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Student Capacity Gauge
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600">
              {currentStudents} / {maxStudents}
            </span>
          </div>

          {/* Circular SVG Radial Gauge */}
          <div className="py-2 flex items-center justify-center gap-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 128 128">
                {/* Background Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Active Utilization Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke={capacityPercent > 90 ? '#ef4444' : capacityPercent > 70 ? '#f59e0b' : '#3b82f6'}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Inside Gauge Center Numbers */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {capacityPercent}%
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Capacity Used
                </span>
              </div>
            </div>

            {/* Quota Breakdown Stats */}
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled Students</span>
                <span className="text-sm font-black text-slate-900 font-mono">{currentStudents} Active</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Quota</span>
                <span className="text-sm font-black text-emerald-700 font-mono">
                  {Math.max(0, maxStudents - currentStudents)} Slots
                </span>
              </div>
            </div>
          </div>

          {/* Capacity Progress Bar & Status Text */}
          <div className="pt-3 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
              <span>Utilization Status:</span>
              <span className={`font-bold ${
                capacityPercent > 90 ? 'text-red-600' : capacityPercent > 70 ? 'text-amber-600' : 'text-emerald-700'
              }`}>
                {capacityPercent > 90 ? 'Near Quota Limit' : capacityPercent > 50 ? 'Moderate Capacity' : 'Healthy Headroom'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  capacityPercent > 90 ? 'bg-red-500' : capacityPercent > 70 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${capacityPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Entitlements Checklist Bar */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-800">Licensed Software Modules Active:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fee Collection Desk</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Barcode 128 ID Cards</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Due Reminders</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pre-Primary (ANKUR & MUKUL)</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit Trail Engine</span>
          </span>
        </div>
      </div>
    </div>
  );
};
