import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  IndianRupee,
  Percent,
  CheckSquare,
  Square,
  AlertCircle,
  QrCode,
  Building,
  RotateCcw,
  Check,
  User,
  ArrowRight,
  Send
} from 'lucide-react';
import { db } from '../services/db';
import {
  Student,
  FeeCategory,
  PaymentMethod,
  DiscountType,
  DiscountReason,
  PaymentTransaction
} from '../types';
import { PaymentConfirmationModal } from '../components/PaymentConfirmationModal';
import { playPaymentCashChime } from '../utils/audio';
import { ClassFeeCalculationBar } from '../components/ClassFeeCalculationBar';
import { feeCalculationHelper } from '../services/feeCalculationHelper';

interface FeeCollectionFastViewProps {
  initialStudentId?: string;
  onPaymentSuccess: (transaction: PaymentTransaction) => void;
  onCancel: () => void;
  onSelectAnotherStudent: () => void;
}

interface FeeSelectionRow {
  feeCategory: FeeCategory;
  month?: string;
  assignedAmount: number;
  totalDue: number;
  amountToPay: number;
  isSelected: boolean;
}

export const FeeCollectionFastView: React.FC<FeeCollectionFastViewProps> = ({
  initialStudentId,
  onPaymentSuccess,
  onCancel,
  onSelectAnotherStudent
}) => {
  const allStudents = db.getAllStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || allStudents[0]?.id || ''
  );
  const student = db.getStudentById(selectedStudentId);

  const [feeRows, setFeeRows] = useState<FeeSelectionRow[]>([]);
  const [discountType, setDiscountType] = useState<DiscountType>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<DiscountReason>('Sibling Discount');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [upiUtr, setUpiUtr] = useState<string>('');
  const [chequeNumber, setChequeNumber] = useState<string>('');
  const [chequeBank, setChequeBank] = useState<string>('State Bank of India');
  const [chequeDate, setChequeDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>('');

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load fee rows helper
  const loadFeeRows = () => {
    if (!student) return;

    const breakdown = db.getStudentCategoryBreakdown(student.id);
    const monthlyTuition = db.getMonthlyTuitionBreakdown(student.id);

    const rows: FeeSelectionRow[] = [];

    // Add unpaid categories
    breakdown.forEach((b) => {
      if (b.feeCategory === 'Tuition Fee') {
        // Break down unpaid tuition months
        const unpaidMonths = monthlyTuition.filter((m) => m.status !== 'PAID');
        unpaidMonths.forEach((m) => {
          rows.push({
            feeCategory: 'Tuition Fee',
            month: m.month,
            assignedAmount: m.assignedAmount,
            totalDue: m.dueAmount,
            amountToPay: m.dueAmount, // default full month pay
            isSelected: true
          });
        });
      } else if (b.due > 0) {
        rows.push({
          feeCategory: b.feeCategory,
          assignedAmount: b.total,
          totalDue: b.due,
          amountToPay: b.due, // default full pay
          isSelected: true
        });
      }
    });

    setFeeRows(rows);
    setDiscountValue(0);
    setErrorMessage('');
  };

  // Load fee rows whenever student changes
  useEffect(() => {
    loadFeeRows();
  }, [selectedStudentId]);

  const handleApplyPreset = (preset: 'full' | 'accrued' | 'current_month' | 'quarter' | 'annual_only') => {
    if (!student) return;

    setFeeRows((prev) => {
      if (preset === 'full') {
        return prev.map((r) => ({
          ...r,
          isSelected: r.totalDue > 0,
          amountToPay: r.totalDue
        }));
      }

      if (preset === 'current_month') {
        let matched = false;
        return prev.map((r) => {
          if (r.feeCategory === 'Tuition Fee' && !matched && r.totalDue > 0) {
            matched = true;
            return { ...r, isSelected: true, amountToPay: r.totalDue };
          }
          return { ...r, isSelected: false, amountToPay: 0 };
        });
      }

      if (preset === 'quarter') {
        let count = 0;
        return prev.map((r) => {
          if (r.feeCategory === 'Tuition Fee' && count < 3 && r.totalDue > 0) {
            count++;
            return { ...r, isSelected: true, amountToPay: r.totalDue };
          }
          return { ...r, isSelected: false, amountToPay: 0 };
        });
      }

      if (preset === 'annual_only') {
        return prev.map((r) => {
          if (r.feeCategory !== 'Tuition Fee' && r.totalDue > 0) {
            return { ...r, isSelected: true, amountToPay: r.totalDue };
          }
          return { ...r, isSelected: false, amountToPay: 0 };
        });
      }

      return prev;
    });
  };

  if (!student) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-2" />
        <h2 className="text-base font-bold text-slate-800">No Student Selected</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Scan a barcode or choose a student from the list to begin collection.
        </p>
        <button
          onClick={onSelectAnotherStudent}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
        >
          Scan Student ID (F2)
        </button>
      </div>
    );
  }

  const totalOutstanding = db.calculateStudentDueSync(student.id);

  // Calculations
  const selectedRows = feeRows.filter((r) => r.isSelected && r.amountToPay > 0);
  const grossSelected = selectedRows.reduce((sum, r) => sum + Number(r.amountToPay || 0), 0);

  let calculatedDiscount = 0;
  if (discountType === 'percentage') {
    calculatedDiscount = Math.round((grossSelected * (discountValue || 0)) / 100);
  } else {
    calculatedDiscount = Math.min(grossSelected, Number(discountValue || 0));
  }

  const netPayable = Math.max(0, grossSelected - calculatedDiscount);

  const handleToggleRow = (index: number) => {
    setFeeRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, isSelected: !r.isSelected } : r))
    );
  };

  const handleAmountChange = (index: number, val: number) => {
    setFeeRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const validVal = isNaN(val) ? 0 : Math.max(0, Math.min(r.totalDue, val));
        return {
          ...r,
          amountToPay: validVal,
          isSelected: validVal > 0
        };
      })
    );
  };

  const handleSelectAll = (select: boolean) => {
    setFeeRows((prev) =>
      prev.map((r) => ({
        ...r,
        isSelected: select,
        amountToPay: select ? r.totalDue : 0
      }))
    );
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRows.length === 0) {
      setErrorMessage('Please select at least one fee item to collect.');
      return;
    }
    if (netPayable <= 0 && calculatedDiscount === 0) {
      setErrorMessage('Net payable amount must be greater than zero.');
      return;
    }
    if (paymentMethod === 'UPI' && !upiUtr.trim()) {
      setErrorMessage('Please provide the UPI UTR / Transaction ID for reference.');
      return;
    }
    if (paymentMethod === 'Cheque' && !chequeNumber.trim()) {
      setErrorMessage('Please enter Cheque Number.');
      return;
    }

    setErrorMessage('');
    setShowConfirmModal(true);
  };

  const handleExecutePayment = () => {
    setIsProcessing(true);
    try {
      const itemsPayload = selectedRows.map((r) => ({
        feeCategory: r.feeCategory,
        month: r.month,
        assignedAmount: r.assignedAmount,
        amountPaid: r.amountToPay,
        remainingDue: Math.max(0, r.totalDue - r.amountToPay)
      }));

      const transaction = db.recordPayment({
        studentId: student.id,
        items: itemsPayload,
        discountAmount: calculatedDiscount,
        discountType,
        discountReason: calculatedDiscount > 0 ? discountReason : undefined,
        paymentMethod,
        upiUtr: paymentMethod === 'UPI' ? upiUtr : undefined,
        chequeNumber: paymentMethod === 'Cheque' ? chequeNumber : undefined,
        chequeBank: paymentMethod === 'Cheque' ? chequeBank : undefined,
        chequeDate: paymentMethod === 'Cheque' ? chequeDate : undefined,
        notes: notes.trim() || undefined
      });

      setIsProcessing(false);
      setShowConfirmModal(false);
      playPaymentCashChime();
      onPaymentSuccess(transaction);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Payment execution failed.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 space-y-4">
      {/* Student Banner with Prominent Outstanding */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900">{student.name}</h1>
              <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {student.id}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                Active
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Class <strong className="text-slate-800">{student.classNum}-{student.section}</strong> · Roll: <strong className="text-slate-800">{student.rollNo}</strong> · Parent: {student.guardianName || student.fatherName} · 📞 {student.mobile}
            </div>
          </div>
        </div>

        {/* Prominent Red Total Outstanding */}
        <div className="flex items-center gap-4">
          <div className="text-right bg-red-50 px-4 py-2 rounded-xl border border-red-200">
            <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
              TOTAL OUTSTANDING BALANCE
            </div>
            <div className="text-2xl font-black text-red-600 font-mono tabular-nums leading-tight">
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </div>
          </div>

          <button
            onClick={onSelectAnotherStudent}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Switch Student</span>
          </button>
        </div>
      </div>

      {/* Automated Class Fee Calculation Helper & Preset Consistency Bar */}
      <ClassFeeCalculationBar
        studentId={student.id}
        onApplyPreset={handleApplyPreset}
        onRowsUpdated={loadFeeRows}
      />

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-700 text-xs rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Payment Workspace Layout */}
      <form onSubmit={handleOpenConfirm} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Outstanding Fee Items Selection */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Outstanding Fee Categories</h2>
              <p className="text-[11px] text-slate-500">
                Select items and adjust amount for partial or full settlement
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition-colors shadow-2xs"
              >
                Pay All Dues
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeeRows((prev) =>
                    prev.map((r) => ({
                      ...r,
                      isSelected: r.feeCategory === 'Tuition Fee',
                      amountToPay: r.feeCategory === 'Tuition Fee' ? r.totalDue : 0
                    }))
                  );
                }}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-300 transition-colors shadow-2xs"
              >
                Tuition Only
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {feeRows.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <Check className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
              <div className="font-bold text-slate-800">All fees for this student are fully cleared!</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Outstanding balance is ₹0.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 w-8"></th>
                    <th className="py-2 px-3">Fee Category / Description</th>
                    <th className="py-2 px-3 text-right">Total Due (₹)</th>
                    <th className="py-2 px-3 text-right w-44">Amount to Pay (₹)</th>
                    <th className="py-2 px-3 text-right">Remaining (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feeRows.map((row, idx) => {
                    const remaining = Math.max(0, row.totalDue - (row.amountToPay || 0));
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          row.isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50 opacity-70'
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            checked={row.isSelected}
                            onChange={() => handleToggleRow(idx)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">
                            {row.feeCategory}
                            {row.month && (
                              <span className="ml-1.5 text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded font-mono text-[11px]">
                                {row.month}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Class {student.classNum} Standard Fee
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600 tabular-nums">
                          ₹{row.totalDue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="relative inline-block w-36">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                              ₹
                            </span>
                            <input
                              type="number"
                              disabled={!row.isSelected}
                              value={row.amountToPay === 0 ? '' : row.amountToPay}
                              onChange={(e) => handleAmountChange(idx, Number(e.target.value))}
                              className="w-full text-right font-mono font-bold pl-6 pr-2 py-1 border border-slate-300 rounded focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 tabular-nums"
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[11px] tabular-nums font-medium text-slate-600">
                          {remaining === 0 ? (
                            <span className="text-emerald-600 font-bold">₹0 (Paid)</span>
                          ) : (
                            `₹${remaining.toLocaleString('en-IN')}`
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Payment Details, Discount & Action Bar */}
        <div className="space-y-4">
          {/* Payment Method Selector */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Payment Method & Reference
            </h2>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 px-3 rounded-lg border font-semibold text-center transition-colors ${
                    paymentMethod === m
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* UPI UTR Input */}
            {paymentMethod === 'UPI' && (
              <div className="pt-2 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  UPI UTR / Transaction Ref *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 983204918231 or PhonePe/GPay ID"
                  value={upiUtr}
                  onChange={(e) => setUpiUtr(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
            )}

            {/* Cheque Info Inputs */}
            {paymentMethod === 'Cheque' && (
              <div className="pt-2 space-y-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Cheque Number *
                  </label>
                  <input
                    type="text"
                    placeholder="6-digit cheque number"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    className="w-full font-mono border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={chequeBank}
                    onChange={(e) => setChequeBank(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Cheque Date
                  </label>
                  <input
                    type="date"
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                    className="w-full font-mono border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Discount / Concession Box */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2.5 text-xs">
            <h2 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
              <span>Concession / Discount</span>
              <span className="text-[11px] text-slate-400 font-normal">Audit Recorded</span>
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white font-medium"
                >
                  <option value="fixed">Fixed (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Amount {discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max={discountType === 'percentage' ? 100 : grossSelected}
                  value={discountValue === 0 ? '' : discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  placeholder="0"
                  className="w-full border border-slate-300 rounded px-2 py-1.5 font-mono font-bold text-right tabular-nums"
                />
              </div>
            </div>

            {discountValue > 0 && (
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Concession Reason *</label>
                <select
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white font-medium"
                >
                  <option value="Sibling Discount">Sibling Discount</option>
                  <option value="Scholarship">Merit Scholarship</option>
                  <option value="Staff Child">Staff Child</option>
                  <option value="Management Concession">Management Concession</option>
                  <option value="Other">Other Approval</option>
                </select>
              </div>
            )}
          </div>

          {/* Final Financial Settlement Card */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-md space-y-3">
            <div className="space-y-1.5 text-xs text-slate-300 pb-2 border-b border-slate-700">
              <div className="flex justify-between">
                <span>Selected Fee Gross:</span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  ₹{grossSelected.toLocaleString('en-IN')}
                </span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Concession ({discountReason}):</span>
                  <span className="font-mono font-semibold tabular-nums">
                    -₹{calculatedDiscount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  NET PAYABLE NOW
                </span>
                <span className="text-2xl font-black font-mono text-amber-400 tabular-nums">
                  ₹{netPayable.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <span>Mode: </span>
                <strong className="text-white">{paymentMethod}</strong>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={grossSelected === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>CONFIRM & COLLECT (ENTER)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <PaymentConfirmationModal
          student={student}
          items={selectedRows.map((r) => ({
            feeCategory: r.feeCategory,
            month: r.month,
            assignedAmount: r.assignedAmount,
            amountPaid: r.amountToPay,
            remainingDue: Math.max(0, r.totalDue - r.amountToPay)
          }))}
          grossAmount={grossSelected}
          discountAmount={calculatedDiscount}
          discountType={discountType}
          discountReason={calculatedDiscount > 0 ? discountReason : undefined}
          netAmount={netPayable}
          paymentMethod={paymentMethod}
          upiUtr={upiUtr}
          chequeNumber={chequeNumber}
          chequeBank={chequeBank}
          notes={notes}
          isProcessing={isProcessing}
          onConfirm={handleExecutePayment}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
};
