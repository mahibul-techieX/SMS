import React, { useState } from 'react';
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  RefreshCw,
  X,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  feeCalculationHelper,
  StudentFeeCalculationResult
} from '../services/feeCalculationHelper';
import { formatClassDisplay } from '../types';

interface ClassFeeCalculatorModalProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset?: (preset: 'full' | 'accrued' | 'current_month' | 'quarter' | 'annual_only') => void;
}

export const ClassFeeCalculatorModal: React.FC<ClassFeeCalculatorModalProps> = ({
  studentId,
  isOpen,
  onClose,
  onApplyPreset
}) => {
  if (!isOpen || !studentId) return null;

  const [calculation, setCalculation] = useState<StudentFeeCalculationResult>(() =>
    feeCalculationHelper.calculateStudentDues(studentId)
  );
  const [syncFeedback, setSyncFeedback] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const { student } = calculation;

  const handleSyncLedger = () => {
    setIsSyncing(true);
    try {
      const res = feeCalculationHelper.syncStudentLedgerWithClassStructure(student.id);
      setCalculation(feeCalculationHelper.calculateStudentDues(student.id));
      setSyncFeedback(res.message);
      setTimeout(() => setSyncFeedback(''), 5000);
    } catch (e: any) {
      setSyncFeedback(e.message || 'Sync failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const tuitionCategory = calculation.categories.find((c) => c.feeCategory === 'Tuition Fee');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  Automated Class Fee Calculation Engine
                </h2>
                <span className="text-[11px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded">
                  {formatClassDisplay(student.classNum)} Matrix
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Computed from official class fee schedule for <strong>{student.name}</strong> ({student.id}) · AY {calculation.academicYear}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {syncFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}

          {/* Aggregate Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Year Statutory</span>
              <span className="text-lg font-black text-slate-900 font-mono tabular-nums mt-0.5 block">
                ₹{calculation.totalFullYearExpected.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400">Class {student.classNum} standard</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Accrued to Date</span>
              <span className="text-lg font-black text-blue-700 font-mono tabular-nums mt-0.5 block">
                ₹{calculation.totalAccruedToDate.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400">Up to current semester</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Realized</span>
              <span className="text-lg font-black text-emerald-700 font-mono tabular-nums mt-0.5 block">
                ₹{calculation.totalPaid.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400">Cumulative receipts</span>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Outstanding Due</span>
              <span className="text-lg font-black text-rose-600 font-mono tabular-nums mt-0.5 block">
                ₹{calculation.totalOutstandingFullYear.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-rose-600 font-medium">Pending realization</span>
            </div>
          </div>

          {/* Quick Consistency Presets Bar */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>One-Click Payment Presets (Ensures Schedule Consistency)</span>
              </div>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Automatically populate the cashier terminal with exact statutory amounts
              </p>
            </div>

            {onApplyPreset && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onApplyPreset('full');
                    onClose();
                  }}
                  disabled={calculation.presets.fullDuesAmount <= 0}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-40"
                >
                  Clear All (₹{calculation.presets.fullDuesAmount.toLocaleString('en-IN')})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onApplyPreset('current_month');
                    onClose();
                  }}
                  disabled={calculation.presets.currentMonthAmount <= 0}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 rounded-lg text-xs font-bold transition-colors disabled:opacity-40"
                >
                  Current Month (₹{calculation.presets.currentMonthAmount.toLocaleString('en-IN')})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onApplyPreset('quarter');
                    onClose();
                  }}
                  disabled={calculation.presets.quarterAmount <= 0}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 rounded-lg text-xs font-bold transition-colors disabled:opacity-40"
                >
                  Quarter (₹{calculation.presets.quarterAmount.toLocaleString('en-IN')})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onApplyPreset('annual_only');
                    onClose();
                  }}
                  disabled={calculation.presets.annualFeesOnlyAmount <= 0}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 rounded-lg text-xs font-bold transition-colors disabled:opacity-40"
                >
                  Annual Dues (₹{calculation.presets.annualFeesOnlyAmount.toLocaleString('en-IN')})
                </button>
              </div>
            )}
          </div>

          {/* Statutory Category Audit Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">
                Class {student.classNum} Statutory Fee Head Allocation
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncLedger}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-300 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Ledger with Class Structure</span>
                </button>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Fee Category</th>
                  <th className="py-2.5 px-4">Billing Cadence</th>
                  <th className="py-2.5 px-4 text-right">Class Matrix Rate</th>
                  <th className="py-2.5 px-4 text-right">Assessed Debit</th>
                  <th className="py-2.5 px-4 text-right">Paid Amount</th>
                  <th className="py-2.5 px-4 text-right">Remaining Due</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {calculation.categories.map((cat) => (
                  <tr key={cat.feeCategory} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{cat.feeCategory}</td>
                    <td className="py-2.5 px-4 capitalize text-slate-500">{cat.feeType}</td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                      ₹{cat.structureRate.toLocaleString('en-IN')}{cat.feeType === 'monthly' ? '/mo' : ''}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-900 font-bold">
                      ₹{cat.totalAssigned.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-emerald-700 font-bold">
                      ₹{cat.totalPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-black text-rose-600">
                      ₹{cat.remainingDue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          cat.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cat.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {cat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 12-Month Tuition Realization Timeline */}
          {tuitionCategory?.months && (
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Academic Tuition Timeline (April to March)</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Standard Rate: <strong>₹{calculation.monthlyTuitionRate}/mo</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {tuitionCategory.months.map((m) => (
                  <div
                    key={m.month}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-colors ${
                      m.status === 'PAID'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : m.status === 'PARTIAL'
                        ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-[11px]">{m.month}</div>
                    <div className="mt-1 font-mono text-xs font-black">
                      {m.status === 'PAID' ? (
                        <span className="text-emerald-700">₹{m.paid}</span>
                      ) : (
                        <span className="text-rose-600">Due: ₹{m.due}</span>
                      )}
                    </div>
                    <div className="text-[9.5px] mt-0.5 uppercase font-bold tracking-wider">
                      {m.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed zero calculation variance with Class {student.classNum} fee structure.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
