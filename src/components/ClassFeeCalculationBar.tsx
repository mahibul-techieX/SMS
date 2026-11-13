import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import {
  feeCalculationHelper,
  StudentFeeCalculationResult
} from '../services/feeCalculationHelper';
import { ClassFeeCalculatorModal } from './ClassFeeCalculatorModal';
import { formatClassDisplay } from '../types';

interface ClassFeeCalculationBarProps {
  studentId: string;
  onApplyPreset: (preset: 'full' | 'accrued' | 'current_month' | 'quarter' | 'annual_only') => void;
  onRowsUpdated?: () => void;
}

export const ClassFeeCalculationBar: React.FC<ClassFeeCalculationBarProps> = ({
  studentId,
  onApplyPreset,
  onRowsUpdated
}) => {
  const [calculation, setCalculation] = useState<StudentFeeCalculationResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const recompute = () => {
    if (!studentId) return;
    try {
      const res = feeCalculationHelper.calculateStudentDues(studentId);
      setCalculation(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    recompute();
  }, [studentId]);

  if (!calculation) return null;

  const { student, presets, isLedgerFullySynced, monthlyTuitionRate } = calculation;

  const handleSync = () => {
    setIsSyncing(true);
    try {
      const res = feeCalculationHelper.syncStudentLedgerWithClassStructure(student.id);
      recompute();
      setSyncNotice(res.message);
      if (onRowsUpdated) onRowsUpdated();
      setTimeout(() => setSyncNotice(''), 4000);
    } catch (err: any) {
      setSyncNotice(err.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-4 border border-blue-200/90 shadow-xs space-y-3">
        {syncNotice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{syncNotice}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Class Matrix Benchmark Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 tracking-tight">
                  Automated Class Fee Engine
                </span>
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded border border-blue-200">
                  {formatClassDisplay(student.classNum)} Benchmark
                </span>
                {isLedgerFullySynced ? (
                  <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Structure Verified</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ledger Update Available</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Standard Tuition: <strong className="font-mono text-slate-700">₹{monthlyTuitionRate}/mo</strong> · Full Year Dues: <strong className="font-mono text-slate-700">₹{calculation.totalFullYearExpected.toLocaleString('en-IN')}</strong> · Unpaid Balance: <strong className="font-mono text-rose-600">₹{calculation.totalOutstandingFullYear.toLocaleString('en-IN')}</strong>
              </p>
            </div>
          </div>

          {/* Right: Modal trigger & Ledger Sync */}
          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
            {!isLedgerFullySynced && (
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold border border-amber-300 transition-colors flex items-center gap-1"
                title="Synchronize student's ledger debits with the class fee matrix"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync with Class</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-blue-800 rounded-xl text-xs font-bold border border-slate-300 hover:border-blue-300 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Inspect Structure Breakdown</span>
            </button>
          </div>
        </div>

        {/* Quick Consistency Preset Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Consistency Presets:</span>
          </span>

          <button
            type="button"
            onClick={() => onApplyPreset('full')}
            disabled={presets.fullDuesAmount <= 0}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-bold border border-blue-200 transition-colors disabled:opacity-40"
            title="Auto-select all outstanding fees for the session"
          >
            Clear All Dues (₹{presets.fullDuesAmount.toLocaleString('en-IN')})
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('current_month')}
            disabled={presets.currentMonthAmount <= 0}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors disabled:opacity-40"
            title="Auto-select current month tuition"
          >
            Current Month (₹{presets.currentMonthAmount.toLocaleString('en-IN')})
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('quarter')}
            disabled={presets.quarterAmount <= 0}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors disabled:opacity-40"
            title="Auto-select 3 months of tuition"
          >
            Quarter / 3 Months (₹{presets.quarterAmount.toLocaleString('en-IN')})
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('annual_only')}
            disabled={presets.annualFeesOnlyAmount <= 0}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors disabled:opacity-40"
            title="Auto-select non-tuition statutory fees (Admission, Exam, Books)"
          >
            Annual Dues Only (₹{presets.annualFeesOnlyAmount.toLocaleString('en-IN')})
          </button>
        </div>
      </div>

      <ClassFeeCalculatorModal
        studentId={student.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplyPreset={onApplyPreset}
      />
    </>
  );
};
