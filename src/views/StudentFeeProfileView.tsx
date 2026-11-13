import React, { useState } from 'react';
import {
  CreditCard,
  Printer,
  History,
  Edit,
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { db } from '../services/db';
import { Student, PaymentTransaction } from '../types';
import { WhatsAppNoticeModal } from '../components/WhatsAppNoticeModal';

interface StudentFeeProfileViewProps {
  studentId: string;
  onBack: () => void;
  onCollectFee: (studentId: string) => void;
  onViewLedger: (studentId: string) => void;
  onEditStudent: (student: Student) => void;
  onViewReceipt: (tx: PaymentTransaction) => void;
}

export const StudentFeeProfileView: React.FC<StudentFeeProfileViewProps> = ({
  studentId,
  onBack,
  onCollectFee,
  onViewLedger,
  onEditStudent,
  onViewReceipt
}) => {
  const student = db.getStudentById(studentId);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);

  if (!student) {
    return (
      <div className="flex-1 p-8 text-center text-slate-500">
        <p>Student not found.</p>
        <button onClick={onBack} className="mt-2 text-blue-600 underline">
          Go Back
        </button>
      </div>
    );
  }

  const totalOutstanding = db.calculateStudentDueSync(student.id);
  const categoryBreakdown = db.getStudentCategoryBreakdown(student.id);
  const monthlyBreakdown = db.getMonthlyTuitionBreakdown(student.id);
  const studentTransactions = db
    .getAllTransactions()
    .filter((t) => t.studentId === student.id);

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 space-y-4">
      {/* Top Navigation and Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Students (ESC)</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Notice</span>
          </button>

          <button
            onClick={() => onEditStudent(student)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => onViewLedger(student.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Complete Ledger</span>
          </button>

          <button
            onClick={() => onCollectFee(student.id)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>COLLECT FEE (F3)</span>
          </button>
        </div>
      </div>

      {/* Student Profile Identity Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-900 text-white flex flex-col items-center justify-center font-extrabold text-2xl shadow-sm border-2 border-amber-400 overflow-hidden shrink-0">
            {student.photoUrl || student.avatarUrl ? (
              <img
                src={student.photoUrl || student.avatarUrl}
                alt={student.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{student.name.charAt(0)}</span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900">{student.name}</h1>
              <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {student.id}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                Active
              </span>
            </div>

            {student.nameAssamese && (
              <div className="text-xs font-assamese text-slate-600 mt-0.5">
                {student.nameAssamese}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
              <div>
                <span className="text-slate-400">Class & Sec: </span>
                <strong className="text-slate-800">
                  Class {student.classNum}-{student.section}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Roll No: </span>
                <strong className="text-slate-800">{student.rollNo}</strong>
              </div>
              <div>
                <span className="text-slate-400">Admission No: </span>
                <span className="font-mono font-medium text-slate-700">{student.admissionNo}</span>
              </div>
              <div>
                <span className="text-slate-400">Academic Year: </span>
                <strong className="text-slate-800">{student.academicYear}</strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400">Father/Guardian: </span>
                <strong className="text-slate-800">
                  {student.guardianName || student.fatherName}
                </strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400">Mobile (WhatsApp): </span>
                <strong className="text-blue-900 font-mono">📞 {student.mobile}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Prominent Red Total Outstanding Highlight */}
        <div className="bg-red-50 border-2 border-red-300 p-4 rounded-xl text-right min-w-[200px]">
          <div className="text-[11px] font-black text-red-700 uppercase tracking-wider">
            TOTAL OUTSTANDING
          </div>
          <div className="text-3xl font-black text-red-600 font-mono tabular-nums mt-0.5">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-red-600 mt-1 font-semibold">
            {totalOutstanding === 0 ? 'Fee completely cleared ✓' : 'Payment pending on ledger'}
          </div>
        </div>
      </div>

      {/* Fee Category Breakdown Table */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Fee Category Summary</h2>
            <p className="text-[11px] text-slate-500">
              Assigned vs Paid balances across institutional heads
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500">
            Session {student.academicYear}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Fee Type</th>
                <th className="py-2.5 px-4 text-right">Total Assigned (₹)</th>
                <th className="py-2.5 px-4 text-right">Amount Paid (₹)</th>
                <th className="py-2.5 px-4 text-right">Outstanding Due (₹)</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoryBreakdown.map((row) => (
                <tr key={row.feeCategory} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{row.feeCategory}</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                    ₹{row.total.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                    ₹{row.paid.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-red-600">
                    {row.due > 0 ? `₹${row.due.toLocaleString('en-IN')}` : '₹0'}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        row.due === 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.paid > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {row.due === 0 ? 'PAID' : row.paid > 0 ? 'PARTIAL' : 'DUE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Tuition Fee Breakdown (April to March) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Monthly Tuition Fee Breakdown (12 Months)
            </h2>
            <p className="text-[11px] text-slate-500">
              April to March recurring schedule tracking
            </p>
          </div>
          <span className="text-xs text-slate-500">
            Standard: ₹{monthlyBreakdown[0]?.assignedAmount.toLocaleString('en-IN')}/month
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-1">
          {monthlyBreakdown.map((m) => (
            <div
              key={m.month}
              className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                m.status === 'PAID'
                  ? 'bg-emerald-50/50 border-emerald-300'
                  : m.status === 'PARTIAL'
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-red-50/40 border-red-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs">{m.month}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      m.status === 'PAID'
                        ? 'bg-emerald-600 text-white'
                        : m.status === 'PARTIAL'
                        ? 'bg-amber-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Fee: <span className="font-mono">₹{m.assignedAmount}</span>
                </div>
                <div className="text-[11px] text-emerald-700">
                  Paid: <span className="font-mono font-semibold">₹{m.paidAmount}</span>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Due:</span>
                <span
                  className={`font-mono font-bold ${
                    m.dueAmount > 0 ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  ₹{m.dueAmount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History For This Student */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900">
            Payment History & Receipts ({studentTransactions.length})
          </h2>
          <button
            onClick={() => onViewLedger(student.id)}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            View Full Student Ledger
          </button>
        </div>

        {studentTransactions.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No payments collected yet for this student.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Receipt No</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Items Paid</th>
                  <th className="py-2 px-3">Method</th>
                  <th className="py-2 px-3 text-right">Net Paid (₹)</th>
                  <th className="py-2 px-3 text-right">Balance Due (₹)</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentTransactions.map((tx) => (
                  <tr key={tx.receiptNo} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-blue-900">
                      {tx.receiptNo}
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-2 px-3 text-slate-700">
                      {tx.items.map((i) => i.feeCategory).join(', ')}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800">
                      {tx.paymentMethod}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ₹{tx.netAmountPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-red-600 tabular-nums">
                      ₹{tx.remainingOutstanding.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => onViewReceipt(tx)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded border border-slate-300 font-medium text-[11px]"
                      >
                        Print Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showWhatsAppModal && (
        <WhatsAppNoticeModal student={student} onClose={() => setShowWhatsAppModal(false)} />
      )}
    </div>
  );
};
