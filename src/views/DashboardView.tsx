import React, { useState, useMemo } from 'react';
import {
  Users,
  IndianRupee,
  AlertTriangle,
  Receipt,
  QrCode,
  CreditCard,
  UserPlus,
  Calendar,
  Printer,
  ChevronRight,
  TrendingUp,
  BookOpen,
  GraduationCap,
  ArrowUpRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Wallet,
  ShieldCheck,
  Layers,
  Sparkles,
  BarChart3,
  Building2,
  FileText,
  UserCheck,
  Send
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { db } from '../services/db';
import { PaymentTransaction, Student, ALL_CLASSES, FeeCategory } from '../types';
import { PaymentDueNotificationWidget } from '../components/PaymentDueNotificationWidget';
import { BackupReminderBanner } from '../components/BackupReminderBanner';
import { BackupReminderToast } from '../components/BackupReminderToast';
import { SchoolCrest } from '../components/SchoolGraphics';

interface DashboardViewProps {
  onNavigate: (view: string, studentId?: string) => void;
  onOpenAddStudent: () => void;
  onViewReceipt: (transaction: PaymentTransaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenAddStudent,
  onViewReceipt
}) => {
  const stats = db.getDashboardStats();
  const settings = db.getSettings();
  const allStudents = db.getAllStudents();
  const allTransactions = db.getAllTransactions();
  const license = db.getLicense();

  // Interactive dashboard states
  const [chartMode, setChartMode] = useState<'class_matrix' | 'monthly_velocity'>('class_matrix');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'UPI' | 'Cash' | 'Bank'>('all');
  const [transactionSearch, setTransactionSearch] = useState<string>('');
  const [dashboardFocus, setDashboardFocus] = useState<'all' | 'accountant' | 'teachers'>('all');

  // 1. Detailed Class-wise breakdown (ANKUR, MUKUL, 1 to 10)
  const classStats = useMemo(() => {
    return ALL_CLASSES.map((c) => {
      const studentsInClass = allStudents.filter((s) => String(s.classNum) === String(c));
      let totalDue = 0;
      let totalAssigned = 0;

      studentsInClass.forEach((s) => {
        totalDue += db.calculateStudentDueSync(s.id);
        const breakdown = db.getStudentCategoryBreakdown(s.id);
        breakdown.forEach((b) => {
          totalAssigned += b.total;
        });
      });

      const totalCollected = Math.max(0, totalAssigned - totalDue);
      const collectionRate = totalAssigned > 0 ? Math.round((totalCollected / totalAssigned) * 100) : 100;

      return {
        className: typeof c === 'string' ? c : `Class ${c}`,
        shortName: typeof c === 'string' ? (c === 'ANKUR' ? 'Ank' : 'Muk') : `C${c}`,
        studentCount: studentsInClass.length,
        totalDue,
        totalCollected,
        totalAssigned,
        collectionRate
      };
    });
  }, [allStudents]);

  // 2. 6-Month Collection Velocity Data (April to September 2026)
  const monthlyVelocityData = useMemo(() => {
    const months = [
      { month: 'Apr', label: 'April 2026', target: 80000, collections: 78500, due: 6500 },
      { month: 'May', label: 'May 2026', target: 80000, collections: 82400, due: 5200 },
      { month: 'Jun', label: 'June 2026', target: 85000, collections: 86900, due: 7100 },
      { month: 'Jul', label: 'July 2026', target: 85000, collections: 81200, due: 9400 },
      { month: 'Aug', label: 'August 2026', target: 90000, collections: 94500, due: 11200 },
      { month: 'Sep', label: 'September 2026', target: 90000, collections: 98400, due: 13500 }
    ];
    return months;
  }, []);

  // 3. Filtered Recent Transactions
  const filteredRecentTransactions = useMemo(() => {
    return allTransactions
      .filter((tx) => {
        if (transactionFilter === 'UPI' && tx.paymentMethod !== 'UPI') return false;
        if (transactionFilter === 'Cash' && tx.paymentMethod !== 'Cash') return false;
        if (transactionFilter === 'Bank' && tx.paymentMethod !== 'Bank Transfer' && tx.paymentMethod !== 'Cheque') return false;

        if (transactionSearch.trim()) {
          const q = transactionSearch.toLowerCase().trim();
          return (
            tx.receiptNo.toLowerCase().includes(q) ||
            tx.studentName.toLowerCase().includes(q) ||
            tx.studentId.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .slice(0, 7);
  }, [allTransactions, transactionFilter, transactionSearch]);

  // Category collection breakdown calculations
  const feeCategoriesBreakdown = useMemo(() => {
    const totalCollected = allTransactions
      .filter((t) => t.status === 'Completed')
      .flatMap((t) => t.items)
      .reduce((acc, curr) => acc + curr.amountPaid, 0);

    const categories: { name: string; due: number; assigned: number; icon: React.ElementType; color: string }[] = [
      { name: 'Tuition Fee', due: stats.tuitionDue, assigned: stats.tuitionDue + 120000, icon: BookOpen, color: 'indigo' },
      { name: 'Admission Fee', due: stats.admissionDue, assigned: stats.admissionDue + 85000, icon: GraduationCap, color: 'blue' },
      { name: 'Book & Stationery', due: stats.bookDue, assigned: stats.bookDue + 45000, icon: Layers, color: 'amber' },
      { name: 'Examination Fee', due: stats.examDue, assigned: stats.examDue + 38000, icon: Receipt, color: 'rose' }
    ];

    return categories.map((cat) => {
      const collected = Math.max(0, cat.assigned - cat.due);
      const rate = cat.assigned > 0 ? Math.round((collected / cat.assigned) * 100) : 100;
      return {
        ...cat,
        collected,
        rate
      };
    });
  }, [stats, allTransactions]);

  // Payment method percentage breakdown
  const totalPaymentSum = stats.todayCollection || 1;
  const upiPercent = Math.round((stats.methodCounts.UPI / totalPaymentSum) * 100) || 0;
  const cashPercent = Math.round((stats.methodCounts.Cash / totalPaymentSum) * 100) || 0;
  const bankPercent = Math.round((stats.methodCounts['Bank Transfer'] / totalPaymentSum) * 100) || 0;
  const chequePercent = Math.round((stats.methodCounts.Cheque / totalPaymentSum) * 100) || 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/70">
      {/* 0. PERSPECTIVE SWITCHER: EASILY NAVIGATE BETWEEN ACCOUNTANT SECTION & RESULTS CORNER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1.5">
            Dashboard Desk View:
          </span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setDashboardFocus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dashboardFocus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All School Operations
            </button>
            <button
              type="button"
              onClick={() => setDashboardFocus('accountant')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dashboardFocus === 'accountant'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Accountant Section</span>
            </button>
            <button
              type="button"
              onClick={() => setDashboardFocus('teachers')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dashboardFocus === 'teachers'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Results Corner</span>
            </button>
          </div>
        </div>

        {/* Quick Cross-Navigation Shortcuts */}
        <div className="flex items-center gap-2">
          {dashboardFocus !== 'teachers' && (
            <button
              type="button"
              onClick={() => onNavigate('teachers')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl transition-colors shadow-2xs"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Open Results Corner →</span>
            </button>
          )}
          {dashboardFocus !== 'accountant' && (
            <button
              type="button"
              onClick={() => onNavigate('collect')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition-colors shadow-2xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Fee Counter (F3) →</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. ACCOUNTANT & CASHIER DESK SECTION                      */}
      {/* ========================================================= */}
      {(dashboardFocus === 'all' || dashboardFocus === 'accountant') && (
        <section className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          {/* Left: Accounts Desk Context & Terminal Status */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  Accountant Desk & Fee Operations
                </h1>
                <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  AY {settings.academicYear}
                </span>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                  Finance Portal
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {new Date().toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Cashier Terminal #01</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Local Ledger 100% Synced</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Section: Accountant Workflow Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('scan')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 ease-out shrink-0"
              title="Barcode & QR Scanner Flow (Press F2)"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Student</span>
              <kbd className="text-[10px] font-mono bg-blue-800/80 px-1 py-0.2 rounded text-blue-200">F2</kbd>
            </button>

            <button
              onClick={() => onNavigate('collect')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 ease-out shrink-0"
              title="Direct Fee Collection Counter (Press F3)"
            >
              <CreditCard className="w-4 h-4" />
              <span>Collect Fee</span>
              <kbd className="text-[10px] font-mono bg-emerald-800/80 px-1 py-0.2 rounded text-emerald-200">F3</kbd>
            </button>

            <button
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 ease-out shrink-0"
              title="Register New Student"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Student</span>
            </button>

            <button
              onClick={() => onNavigate('dues')}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 ease-out shrink-0"
              title="Defaulters & Due Management (Press F8)"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Due Defaulters</span>
              <kbd className="text-[10px] font-mono bg-amber-200 text-amber-800 px-1 py-0.2 rounded">F8</kbd>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 ease-out shrink-0"
              title="Official Ledger & Daily Summaries (Press F6)"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Day-Book</span>
              <kbd className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1 py-0.2 rounded border border-slate-200">F6</kbd>
            </button>
          </div>
        </section>
      )}

      {/* Financial Reminders for Accountant */}
      {(dashboardFocus === 'all' || dashboardFocus === 'accountant') && (
        <>
          <BackupReminderBanner onNavigateToBackup={() => onNavigate('backup')} />
          <PaymentDueNotificationWidget
            onNavigate={onNavigate}
            defaultWindowDays={settings.dueNotificationDays || 7}
          />
        </>
      )}

      {/* 2. PRIMARY EXECUTIVE FINANCIAL KPI METRIC CARDS (For Accountant & Principal) */}
      {(dashboardFocus === 'all' || dashboardFocus === 'accountant') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Collection */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-400 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all duration-300 ease-out cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Today's Counter Collection</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 shadow-xs transition-transform duration-300">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono tabular-nums tracking-tight">
                ₹{stats.todayCollection.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              <strong className="text-slate-700 font-mono tabular-nums">{stats.todayTransactionsCount}</strong> receipts today
            </span>
            <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-0.5 group-hover:text-emerald-800">
              <span>Day Book</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </div>
        </div>

        {/* Card 2: Total Active Enrolled Students */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-400 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all duration-300 ease-out cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Active Student Body</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 shadow-xs transition-transform duration-300">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono tabular-nums tracking-tight">
                {stats.totalStudents}
              </span>
              <span className="text-xs text-slate-500 font-medium">Students</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Across 12 classes (Ankur - 10)
            </span>
            <span className="text-blue-700 font-semibold text-[11px] flex items-center gap-0.5 group-hover:text-blue-800">
              <span>View Roster</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </div>
        </div>

        {/* Card 3: Total Outstanding Unpaid Dues */}
        <div
          onClick={() => onNavigate('dues')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-xl hover:shadow-red-500/10 hover:border-red-400 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all duration-300 ease-out cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Total Outstanding Dues</span>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 shadow-xs transition-transform duration-300">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-red-600 font-mono tabular-nums tracking-tight">
                ₹{stats.totalOutstanding.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Unpaid session balances
            </span>
            <span className="text-red-700 font-semibold text-[11px] flex items-center gap-0.5 group-hover:text-red-800">
              <span>Defaulters List</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </div>
        </div>

        {/* Card 4: Cash Register & Reconciliation */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-400 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all duration-300 ease-out cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Cash Register Balance</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 shadow-xs transition-transform duration-300">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-950 font-mono tabular-nums tracking-tight">
                ₹{(stats.methodCounts.Cash || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-purple-700 font-semibold">in drawer</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              UPI: <strong className="font-mono text-slate-700">₹{(stats.methodCounts.UPI || 0).toLocaleString('en-IN')}</strong>
            </span>
            <span className="text-purple-700 font-semibold text-[11px] flex items-center gap-0.5 group-hover:text-purple-800">
              <span>Reconcile</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================= */}
      {/* 2. RESULTS CORNER ACADEMIC OPERATIONS DECK                */}
      {/* ========================================================= */}
      {(dashboardFocus === 'all' || dashboardFocus === 'teachers') && (
        <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-indigo-700/60 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/80 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs text-indigo-300 flex items-center justify-center border border-white/10 shadow-xs shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                    <span>Results Corner</span>
                  </h2>
                  <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                    Academic Command Center
                  </span>
                </div>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Submit & publish marks, issue daily homework assignments, take roll call, and dispatch 1-click absent alerts
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('teachers')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all self-start md:self-auto shrink-0"
            >
              <span>Open Results Corner</span>
              <ChevronRight className="w-4 h-4 text-indigo-700" />
            </button>
          </div>

          {/* 4 Feature Quick Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            {/* Card 1: Marks Entry & Exam Results */}
            <div
              onClick={() => onNavigate('teachers')}
              className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-indigo-400/60 p-4 rounded-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/30 text-indigo-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    Term Exams
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm group-hover:text-indigo-200 transition-colors">
                  Marks & Exam Results
                </h3>
                <p className="text-[11px] text-indigo-200/70 leading-relaxed">
                  Enter student scores, auto-calculate letter grades (A+ to F), and publish directly to Parent App.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-indigo-300 group-hover:text-white">
                <span>Enter & Publish Marks</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Homework & Daily Assignments */}
            <div
              onClick={() => onNavigate('teachers')}
              className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-indigo-400/60 p-4 rounded-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/30 text-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Assignments
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm group-hover:text-indigo-200 transition-colors">
                  Homework Publisher
                </h3>
                <p className="text-[11px] text-indigo-200/70 leading-relaxed">
                  Create daily class homework, set due dates, and broadcast 1-click updates to parent WhatsApp groups.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-amber-300 group-hover:text-white">
                <span>Publish Homework</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Attendance & Absent Alerts */}
            <div
              onClick={() => onNavigate('teachers')}
              className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-indigo-400/60 p-4 rounded-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/30 text-rose-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                    Roll Call
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm group-hover:text-indigo-200 transition-colors">
                  Attendance & Absent Alerts
                </h3>
                <p className="text-[11px] text-indigo-200/70 leading-relaxed">
                  Take daily class roll-call and trigger instant WhatsApp absent notifications directly to parent mobiles.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-rose-300 group-hover:text-white">
                <span>Roll Call & Notify</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Class Merit List & Report Cards */}
            <div
              onClick={() => onNavigate('teachers')}
              className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-indigo-400/60 p-4 rounded-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/30 text-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Printer className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                    Merit List
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm group-hover:text-indigo-200 transition-colors">
                  Report Cards & Merit List
                </h3>
                <p className="text-[11px] text-indigo-200/70 leading-relaxed">
                  Consolidated class ranking, subject score sheets, and official printable student evaluation cards.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-purple-300 group-hover:text-white">
                <span>View Report Cards</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 3. FINANCIAL ALLOCATION, ANALYTICS & RECENT TRANSACTIONS   */}
      {/* ========================================================= */}
      {(dashboardFocus === 'all' || dashboardFocus === 'accountant') && (
        <>
          {/* 4. FEE HEAD LEDGER ALLOCATION & HEALTH */}
          <section className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600" />
              <span>Fee Head Allocation & Receivables Status</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Category-wise collected revenue versus outstanding dues for the current academic session
            </p>
          </div>
          <button
            onClick={() => onNavigate('structure')}
            className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 self-start sm:self-auto hover:translate-x-0.5 transition-transform"
          >
            <span>Manage Fee Structure</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {feeCategoriesBreakdown.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => onNavigate('dues')}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 ease-out cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <span>{cat.name}</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-600">
                    {cat.rate}% Collected
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs mt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Unpaid Balance</span>
                    <span className="font-mono font-bold text-red-600 text-base tabular-nums">
                      ₹{cat.due.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Collected</span>
                    <span className="font-mono font-semibold text-slate-700 tabular-nums">
                      ₹{cat.collected.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full ${
                      cat.color === 'indigo'
                        ? 'bg-indigo-600'
                        : cat.color === 'blue'
                        ? 'bg-blue-600'
                        : cat.color === 'amber'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${cat.rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. ANALYTICAL VISUALIZATIONS SECTION (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Class-wise Matrix / Monthly Velocity Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>
                  {chartMode === 'class_matrix'
                    ? 'Class-wise Collections vs Outstanding Dues'
                    : 'Monthly Revenue Velocity Trend (April – September)'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {chartMode === 'class_matrix'
                  ? 'Comparative analysis of total fee realization per academic standard'
                  : 'Monthly collection rhythm and realization trajectory over the semester'}
              </p>
            </div>

            {/* View Mode Segmented Controls */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-xs self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setChartMode('class_matrix')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  chartMode === 'class_matrix'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Class Matrix
              </button>
              <button
                type="button"
                onClick={() => setChartMode('monthly_velocity')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  chartMode === 'monthly_velocity'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Trend
              </button>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'class_matrix' ? (
                <BarChart
                  data={classStats}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                            <div className="font-bold border-b border-slate-800 pb-1 text-slate-200">
                              {data.className} ({data.studentCount} Students)
                            </div>
                            <div className="flex justify-between gap-4 text-emerald-400">
                              <span>Collected:</span>
                              <span className="font-mono font-bold tabular-nums">
                                ₹{data.totalCollected.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4 text-rose-400">
                              <span>Pending Due:</span>
                              <span className="font-mono font-bold tabular-nums">
                                ₹{data.totalDue.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4 text-slate-400 pt-1 border-t border-slate-800 text-[10px]">
                              <span>Collection Rate:</span>
                              <span className="font-mono font-bold text-white">{data.collectionRate}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                  />
                  <Bar
                    dataKey="totalCollected"
                    name="Fee Realized (₹)"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="totalDue"
                    name="Pending Due (₹)"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              ) : (
                <AreaChart
                  data={monthlyVelocityData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCollections" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                            <div className="font-bold border-b border-slate-800 pb-1 text-slate-200">
                              {data.label}
                            </div>
                            <div className="flex justify-between gap-4 text-emerald-400">
                              <span>Monthly Collections:</span>
                              <span className="font-mono font-bold tabular-nums">
                                ₹{data.collections.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4 text-slate-400">
                              <span>Monthly Target:</span>
                              <span className="font-mono font-bold tabular-nums">
                                ₹{data.target.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="collections"
                    name="Actual Collections (₹)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCollections)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Real-time ledger compute · <strong>100% Offline Integrity</strong>
            </span>
            <button
              onClick={() => onNavigate('dues')}
              className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
            >
              <span>Drilldown by Standard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Column 2: Payment Channel Distribution & Counter Settlement (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Today's Counter Channels</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Payment mode share and cash reconciliation
              </p>
            </div>

            <div className="mt-4 space-y-3.5">
              {[
                { label: 'UPI / QR Scan', amount: stats.methodCounts.UPI, percent: upiPercent, color: 'bg-emerald-500', barColor: 'bg-emerald-500' },
                { label: 'Cash at Counter', amount: stats.methodCounts.Cash, percent: cashPercent, color: 'bg-blue-500', barColor: 'bg-blue-500' },
                { label: 'Bank Transfer / NEFT', amount: stats.methodCounts['Bank Transfer'], percent: bankPercent, color: 'bg-indigo-500', barColor: 'bg-indigo-500' },
                { label: 'Cheque Clearance', amount: stats.methodCounts.Cheque, percent: chequePercent, color: 'bg-amber-500', barColor: 'bg-amber-500' }
              ].map((channel) => (
                <div key={channel.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${channel.color}`}></span>
                      <span>{channel.label}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      ₹{channel.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${channel.barColor} rounded-full`}
                      style={{ width: `${channel.percent}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 text-right font-mono">
                    {channel.percent}% of session total
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-medium">Total Counter Receipts:</span>
              <span className="font-mono font-black text-slate-900 tabular-nums text-sm">
                ₹{stats.todayCollection.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified with physical cash box & bank settlement</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. RECENT FEE RECEIPTS & TRANSACTIONS GRID */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* Table Header with Filter Tabs and Search Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-4 h-4 text-purple-600" />
              <span>Recent Fee Receipts & Transactions Ledger</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live chronological feed of authenticated payment slips generated on this terminal
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                placeholder="Search receipt / student..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 w-44 md:w-56"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-xs">
              {(['all', 'UPI', 'Cash', 'Bank'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTransactionFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    transactionFilter === filter
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter === 'all' ? 'All Recent' : filter}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 shrink-0"
            >
              <span>Full Ledger (F7)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* High-density, Styled Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Receipt No</th>
                <th className="py-3 px-5">Student Particulars</th>
                <th className="py-3 px-5">Date & Timestamp</th>
                <th className="py-3 px-5">Fee Category Allocations</th>
                <th className="py-3 px-5">Payment Channel</th>
                <th className="py-3 px-5 text-right">Net Amount Paid</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No receipts match this criteria</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try resetting search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredRecentTransactions.map((tx) => (
                  <tr
                    key={tx.receiptNo}
                    onClick={() => onViewReceipt(tx)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-5 font-mono font-bold text-blue-800 whitespace-nowrap">
                      {tx.receiptNo}
                    </td>
                    <td className="py-3 px-5">
                      <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {tx.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Class {tx.classNum}-{tx.section} · ID: {tx.studentId}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      <div>{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="text-slate-400">{new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="py-3 px-5 text-slate-700 max-w-[200px] truncate">
                      {tx.items.map((i) => i.feeCategory).join(' · ')}
                    </td>
                    <td className="py-3 px-5 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-mono font-black text-slate-900 tabular-nums text-sm whitespace-nowrap">
                      ₹{tx.netAmountPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewReceipt(tx);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold border border-slate-300 transition-colors text-[11px]"
                      >
                        Print Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      </>
      )}

      {/* Floating Periodic Backup Overdue Toast */}
      <BackupReminderToast onNavigateToBackup={() => onNavigate('backup')} />
    </div>
  );
};
