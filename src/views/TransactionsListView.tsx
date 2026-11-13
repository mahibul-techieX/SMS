import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Printer,
  XCircle,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { db } from '../services/db';
import { PaymentTransaction } from '../types';

interface TransactionsListViewProps {
  onViewReceipt: (transaction: PaymentTransaction) => void;
}

export const TransactionsListView: React.FC<TransactionsListViewProps> = ({
  onViewReceipt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [cancelModalTx, setCancelModalTx] = useState<PaymentTransaction | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Bounced cheque or incorrect student selected');

  const transactions = db.getAllTransactions();

  const filteredTransactions = transactions.filter((t) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        t.receiptNo.toLowerCase().includes(q) ||
        t.studentName.toLowerCase().includes(q) ||
        t.studentId.toLowerCase().includes(q) ||
        (t.upiUtr && t.upiUtr.toLowerCase().includes(q)) ||
        (t.chequeNumber && t.chequeNumber.includes(q));
      if (!match) return false;
    }

    if (methodFilter !== 'All' && t.paymentMethod !== methodFilter) {
      return false;
    }

    if (statusFilter !== 'All' && t.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const totalCollected = filteredTransactions
    .filter((t) => t.status === 'Completed')
    .reduce((sum, t) => sum + t.netAmountPaid, 0);

  const handleExecuteCancel = () => {
    if (!cancelModalTx) return;
    try {
      db.cancelTransaction(cancelModalTx.receiptNo, cancelReason);
      setCancelModalTx(null);
      // trigger rerender
      setSearchTerm((s) => s + ' ');
      setTimeout(() => setSearchTerm((s) => s.trim()), 10);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel transaction.');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Receipt No',
      'Date',
      'Student ID',
      'Student Name',
      'Class',
      'Section',
      'Payment Method',
      'Reference/UTR',
      'Gross Amount',
      'Discount',
      'Net Paid',
      'Received By',
      'Status'
    ];
    const rows = filteredTransactions.map((t) => [
      t.receiptNo,
      t.date,
      t.studentId,
      `"${t.studentName}"`,
      t.classNum,
      t.section,
      t.paymentMethod,
      t.upiUtr || t.chequeNumber || '',
      t.grossAmount,
      t.discountAmount,
      t.netAmountPaid,
      `"${t.receivedBy}"`,
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fee_Transactions_Register_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Payment Receipts & Cash Register</span>
            <span className="text-xs bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {filteredTransactions.length} Transactions
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable offline ledger entries · Reprint receipts without duplicate records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 text-right">
            <div className="text-[10px] font-bold text-emerald-800 uppercase">
              REGISTER TOTAL (FILTERED)
            </div>
            <div className="text-xl font-black text-emerald-700 font-mono tabular-nums leading-none mt-0.5">
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Receipt No, Student Name, Student ID, UTR..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 bg-white font-semibold text-slate-800"
            >
              <option value="All">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 bg-white font-semibold text-slate-800"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3.5">Receipt No</th>
                <th className="py-2.5 px-3.5">Date & Time</th>
                <th className="py-2.5 px-3.5">Student</th>
                <th className="py-2.5 px-3.5">Fee Items</th>
                <th className="py-2.5 px-3.5">Method</th>
                <th className="py-2.5 px-3.5">Received By</th>
                <th className="py-2.5 px-3.5 text-right">Net Amount (₹)</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.receiptNo} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-blue-900">
                      {tx.receiptNo}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 font-mono text-[11px]">
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}{' '}
                      {new Date(tx.date).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="font-bold text-slate-900">{tx.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Class {tx.classNum}-{tx.section} · {tx.studentId}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 max-w-xs truncate">
                      {tx.items.map((i) => i.feeCategory).join(', ')}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 text-[11px]">{tx.receivedBy}</td>
                    <td className="py-2.5 px-3.5 text-right font-mono font-black tabular-nums text-slate-900">
                      ₹{tx.netAmountPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          tx.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewReceipt(tx)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                          title="Print / Reprint Official Receipt"
                        >
                          <Printer className="w-3 h-3 text-blue-400" />
                          <span>Reprint</span>
                        </button>

                        {tx.status === 'Completed' && (
                          <button
                            onClick={() => setCancelModalTx(tx)}
                            className="p-1 rounded bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-700 border border-slate-300"
                            title="Cancel Transaction (Ledger Audit Reversal)"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Transaction Modal */}
      {cancelModalTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-300">
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <AlertCircle className="w-5 h-5" />
              <span>Cancel Financial Transaction</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to cancel receipt <strong className="font-mono">{cancelModalTx.receiptNo}</strong> for{' '}
              <strong>₹{cancelModalTx.netAmountPaid.toLocaleString('en-IN')}</strong> paid by{' '}
              {cancelModalTx.studentName}.
              <br />
              <span className="text-amber-700 font-semibold block mt-1">
                Note: In accordance with offline accounting standards, transactions are NEVER deleted. A formal audit reversal entry will be written to the ledger.
              </span>
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Reason for Cancellation *
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setCancelModalTx(null)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Dismiss
              </button>
              <button
                onClick={handleExecuteCancel}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
