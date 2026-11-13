import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { FeeCategory, PaymentMethod, DiscountType, DiscountReason, Student } from '../types';

interface PaymentConfirmationModalProps {
  student: Student;
  items: {
    feeCategory: FeeCategory;
    month?: string;
    assignedAmount: number;
    amountPaid: number;
    remainingDue: number;
  }[];
  grossAmount: number;
  discountAmount: number;
  discountType: DiscountType;
  discountReason?: DiscountReason;
  netAmount: number;
  paymentMethod: PaymentMethod;
  upiUtr?: string;
  chequeNumber?: string;
  chequeBank?: string;
  chequeDate?: string;
  notes?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  student,
  items,
  grossAmount,
  discountAmount,
  discountType,
  discountReason,
  netAmount,
  paymentMethod,
  upiUtr,
  chequeNumber,
  chequeBank,
  notes,
  isProcessing = false,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Confirm Fee Payment</h2>
              <p className="text-xs text-slate-400">
                Verify transaction details before issuing official receipt
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Student Info Box */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Student
              </div>
              <div className="text-sm font-bold text-slate-900">{student.name}</div>
              <div className="text-slate-600">
                Class {student.classNum}-{student.section} · Roll: {student.rollNo}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Student ID
              </div>
              <div className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {student.id}
              </div>
            </div>
          </div>

          {/* Fee Items Table */}
          <div>
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Selected Fee Items ({items.length})
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-1.5 px-3">Item Description</th>
                    <th className="py-1.5 px-3 text-right">Paying Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 text-slate-800 font-medium">
                        {item.feeCategory} {item.month ? `(${item.month})` : ''}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        ₹{item.amountPaid.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount Breakdown Summary */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Gross Fee Amount:</span>
              <span className="font-mono font-semibold tabular-nums">
                ₹{grossAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>
                  Approved Concession ({discountReason || 'Discount'}{' '}
                  {discountType === 'percentage' ? '%' : '₹'}):
                </span>
                <span className="font-mono tabular-nums">
                  -₹{discountAmount.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-2 border-t border-slate-300">
              <span>NET PAYABLE NOW:</span>
              <span className="font-mono text-base text-blue-900 tabular-nums">
                ₹{netAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Payment Method:</span>
              <span className="font-bold text-blue-950 bg-blue-100 px-2 py-0.5 rounded">
                {paymentMethod}
              </span>
            </div>
            {paymentMethod === 'UPI' && upiUtr && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">UPI Transaction ID / UTR:</span>
                <span className="font-mono font-semibold text-slate-900">{upiUtr}</span>
              </div>
            )}
            {paymentMethod === 'Cheque' && chequeNumber && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Cheque Info:</span>
                <span className="font-mono font-semibold text-slate-900">
                  #{chequeNumber} ({chequeBank})
                </span>
              </div>
            )}
            {notes && (
              <div className="text-[11px] text-slate-600 pt-1 border-t border-blue-200/60">
                <span className="font-medium">Remarks: </span> {notes}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Cancel (ESC)
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Writing to Ledger...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM & PRINT RECEIPT (Enter)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
