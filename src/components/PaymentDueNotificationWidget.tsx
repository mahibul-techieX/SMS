import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  AlertTriangle,
  Clock,
  CreditCard,
  Smartphone,
  ChevronRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  Eye,
  CalendarClock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Check
} from 'lucide-react';
import { db } from '../services/db';
import { Student, PaymentDueAlert, ALL_CLASSES } from '../types';
import { WhatsAppNoticeModal } from './WhatsAppNoticeModal';

interface PaymentDueNotificationWidgetProps {
  onNavigate: (view: string, studentId?: string) => void;
  defaultWindowDays?: number;
}

export const PaymentDueNotificationWidget: React.FC<PaymentDueNotificationWidgetProps> = ({
  onNavigate,
  defaultWindowDays = 7
}) => {
  const [windowDays, setWindowDays] = useState<number>(defaultWindowDays);
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [studentForNotice, setStudentForNotice] = useState<Student | null>(null);
  const [studentForReschedule, setStudentForReschedule] = useState<PaymentDueAlert | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Retrieve alert list
  const alerts = db.getStudentsWithPaymentsDueWithin(windowDays);

  // Filter alerts by class and search
  const filteredAlerts = alerts.filter((alert) => {
    if (selectedClass !== 'All' && String(alert.student.classNum) !== selectedClass) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        alert.student.name.toLowerCase().includes(q) ||
        alert.student.id.toLowerCase().includes(q) ||
        alert.student.mobile.includes(q)
      );
    }
    return true;
  });

  const totalDueSum = filteredAlerts.reduce((sum, a) => sum + a.totalDue, 0);
  const urgentCount = filteredAlerts.filter((a) => a.daysLeft <= 1).length;

  const handleOpenReschedule = (alert: PaymentDueAlert) => {
    setStudentForReschedule(alert);
    setNewDueDate(alert.dueDate);
    setRescheduleSuccess(false);
  };

  const handleApplyReschedule = (dateStr: string) => {
    if (!studentForReschedule) return;
    db.updateStudentNextPaymentDueDate(studentForReschedule.student.id, dateStr);
    setRescheduleSuccess(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => {
      setStudentForReschedule(null);
      setRescheduleSuccess(false);
    }, 1200);
  };

  const handleQuickAddDays = (daysToAdd: number) => {
    const base = new Date();
    base.setDate(base.getDate() + daysToAdd);
    const dateStr = base.toISOString().split('T')[0];
    setNewDueDate(dateStr);
  };

  return (
    <div key={refreshKey} className="bg-white rounded-2xl border border-[#16559E]/30 shadow-sm overflow-hidden">
      {/* Top Banner / Widget Header with Section Color #16559E */}
      <div className="bg-[#16559E] text-white p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-inner">
                <Bell className="w-5 h-5 animate-bounce-subtle" />
              </div>
              {filteredAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-black text-white items-center justify-center">
                    {filteredAlerts.length}
                  </span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                  <span>Fee Payments Due Notification</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                    Next {windowDays} Days Window
                  </span>
                </h2>
                {urgentCount > 0 && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-600 text-white shadow-xs animate-pulse">
                    {urgentCount} Critical (0-1 Day)
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Students with upcoming tuition & session fee deadlines requiring collection or WhatsApp notice
              </p>
            </div>
          </div>

          {/* Right Header Stats & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-white/15 px-3 py-1.5 rounded-lg border border-white/20 text-right">
              <div className="text-[10px] font-medium text-blue-100 uppercase tracking-wider">
                Total Upcoming Due
              </div>
              <div className="text-base font-black text-white font-mono tabular-nums leading-none mt-0.5">
                ₹{totalDueSum.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Toggle collapse */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors"
              title={isCollapsed ? 'Expand Widget' : 'Collapse Widget'}
            >
              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Filter & View Bar (Only if not collapsed) */}
        {!isCollapsed && (
          <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            {/* Window selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-blue-100 font-semibold text-[11px] mr-1">Timeframe:</span>
              {[
                { label: 'Next 3 Days', days: 3 },
                { label: 'Next 7 Days', days: 7 },
                { label: 'Next 14 Days', days: 14 }
              ].map((pill) => (
                <button
                  key={pill.days}
                  onClick={() => setWindowDays(pill.days)}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all ${
                    windowDays === pill.days
                      ? 'bg-white text-[#16559E] shadow-xs'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Class filter & Search */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-white text-slate-800 font-semibold text-[11px] px-2.5 py-1 rounded-md border-0 focus:ring-2 focus:ring-white/50 outline-none"
              >
                <option value="All">All Classes</option>
                {ALL_CLASSES.map((c) => (
                  <option key={String(c)} value={c}>
                    {typeof c === 'string' ? c : `Class ${c}`}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search student or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white text-slate-800 placeholder-slate-400 text-[11px] px-2.5 py-1 rounded-md outline-none w-36 sm:w-44 focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Body: Students with upcoming due dates */}
      {!isCollapsed && (
        <div className="p-4 bg-slate-50/70">
          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">All Clear! No Payments Due</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No active students have fee deadlines scheduled within the next {windowDays} days for the selected filters.
              </p>
              <button
                onClick={() => {
                  setSelectedClass('All');
                  setSearchTerm('');
                  setWindowDays(14);
                }}
                className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Expand window to 14 days
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredAlerts.map((alert) => {
                const s = alert.student;
                const formattedDueDate = new Date(alert.dueDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short'
                });

                return (
                  <div
                    key={s.id}
                    className={`bg-white rounded-xl border p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between ${
                      alert.daysLeft === 0
                        ? 'border-red-400 ring-1 ring-red-300/60 bg-red-50/15'
                        : alert.daysLeft === 1
                        ? 'border-amber-400 ring-1 ring-amber-300/40 bg-amber-50/15'
                        : 'border-slate-200 hover:border-[#16559E]'
                    }`}
                  >
                    {/* Top Student Header */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {/* Student Avatar / Photo */}
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center text-slate-700 font-bold text-xs shadow-2xs">
                            {s.photoUrl || s.avatarUrl ? (
                              <img
                                src={s.photoUrl || s.avatarUrl}
                                alt={s.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{s.name.substring(0, 2).toUpperCase()}</span>
                            )}
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-slate-900 leading-tight">
                              {s.name}
                            </h4>
                            <div className="text-[11px] text-slate-500 font-medium">
                              Class {s.classNum}-{s.section} · Roll #{s.rollNo}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {s.id}
                            </div>
                          </div>
                        </div>

                        {/* Due Countdown Badge */}
                        <div className="text-right shrink-0">
                          {alert.isOverdue ? (
                            <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-600 text-white shadow-2xs">
                              Overdue
                            </span>
                          ) : alert.daysLeft === 0 ? (
                            <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-600 text-white shadow-2xs animate-pulse">
                              Due Today
                            </span>
                          ) : alert.daysLeft === 1 ? (
                            <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-orange-600 text-white shadow-2xs">
                              Due Tomorrow
                            </span>
                          ) : (
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                                alert.daysLeft <= 3
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                                  : 'bg-blue-50 text-blue-800 border border-blue-200'
                              }`}
                            >
                              Due in {alert.daysLeft} days
                            </span>
                          )}
                          <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                            {formattedDueDate}
                          </div>
                        </div>
                      </div>

                      {/* Fee Breakdown & Amount Box */}
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {alert.primaryFeeCategory}
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium flex gap-2 flex-wrap mt-0.5">
                            {alert.tuitionDue > 0 && (
                              <span>Tuition: ₹{alert.tuitionDue.toLocaleString('en-IN')}</span>
                            )}
                            {alert.examDue > 0 && (
                              <span>Exam: ₹{alert.examDue.toLocaleString('en-IN')}</span>
                            )}
                            {alert.booksDue > 0 && (
                              <span>Books: ₹{alert.booksDue.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-red-600 uppercase block">
                            Total Due
                          </span>
                          <span className="text-sm font-black text-red-700 font-mono tabular-nums">
                            ₹{alert.totalDue.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Guardian Mobile Info */}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                        <span className="truncate">Parent: {s.fatherName || s.guardianName}</span>
                        <span className="font-mono text-slate-600 shrink-0 font-medium">
                          📞 {s.mobile}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        {/* WhatsApp Notice Button */}
                        <button
                          onClick={() => setStudentForNotice(s)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300 transition-colors"
                          title="Send fee reminder via WhatsApp"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>

                        {/* Reschedule Due Date Button */}
                        <button
                          onClick={() => handleOpenReschedule(alert)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                          title="Adjust or reschedule due date"
                        >
                          <CalendarClock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Reschedule</span>
                        </button>

                        {/* Profile/Ledger Button */}
                        <button
                          onClick={() => onNavigate('profile', s.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="View student ledger profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Fast Collect Fee Button */}
                      <button
                        onClick={() => onNavigate('collect', s.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Collect Fee</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Navigation Bar */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                {filteredAlerts.length} students due
              </span>
              <span>·</span>
              <span>₹{totalDueSum.toLocaleString('en-IN')} outstanding</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('dues')}
                className="text-xs font-bold text-[#16559E] hover:text-[#124682] flex items-center gap-1"
              >
                <span>Open Full Due Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Notice Modal */}
      {studentForNotice && (
        <WhatsAppNoticeModal
          student={studentForNotice}
          onClose={() => setStudentForNotice(null)}
        />
      )}

      {/* Reschedule Due Date Modal */}
      {studentForReschedule && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-300 overflow-hidden">
            <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold">Reschedule Payment Due Date</h3>
              </div>
              <button
                onClick={() => setStudentForReschedule(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div>
                <span className="text-[11px] text-slate-500">Student:</span>
                <div className="font-bold text-slate-900">
                  {studentForReschedule.student.name} ({studentForReschedule.student.id})
                </div>
                <div className="text-[11px] text-red-600 font-semibold mt-0.5">
                  Current Due: ₹{studentForReschedule.totalDue.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Select New Payment Due Date
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg outline-none focus:border-amber-500"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Quick Extensions
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickAddDays(3)}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                  >
                    +3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddDays(7)}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                  >
                    +7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAddDays(14)}
                    className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold"
                  >
                    +14 Days
                  </button>
                </div>
              </div>

              {rescheduleSuccess && (
                <div className="p-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-semibold rounded-lg flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Due date updated successfully!</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setStudentForReschedule(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyReschedule(newDueDate)}
                disabled={!newDueDate}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold disabled:opacity-50"
              >
                Save New Due Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
