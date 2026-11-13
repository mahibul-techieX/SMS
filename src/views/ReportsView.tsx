import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Printer,
  FileSpreadsheet,
  Download,
  IndianRupee,
  Layers,
  CreditCard,
  AlertTriangle,
  Users
} from 'lucide-react';
import { db, MONTH_NAMES } from '../services/db';
import { SchoolSettings, PaymentTransaction, ALL_CLASSES } from '../types';
import { SchoolCrest, SchoolOfficialSeal, CashierSignature, PrincipalSignature } from '../components/SchoolGraphics';

export const ReportsView: React.FC = () => {
  const [activeReportTab, setActiveReportTab] = useState<
    'daily' | 'monthly' | 'classwise' | 'methods' | 'dues'
  >('daily');

  const settings: SchoolSettings = db.getSettings();
  const allStudents = db.getAllStudents();
  const allTransactions = db.getAllTransactions();

  // Daily report calculations
  const todayPrefix = new Date().toISOString().slice(0, 10);
  const todayTransactions = allTransactions.filter(
    (t) => t.status === 'Completed' && t.date.startsWith(todayPrefix)
  );
  const totalToday = todayTransactions.reduce((sum, t) => sum + t.netAmountPaid, 0);

  const cashToday = todayTransactions
    .filter((t) => t.paymentMethod === 'Cash')
    .reduce((sum, t) => sum + t.netAmountPaid, 0);
  const upiToday = todayTransactions
    .filter((t) => t.paymentMethod === 'UPI')
    .reduce((sum, t) => sum + t.netAmountPaid, 0);
  const chequeToday = todayTransactions
    .filter((t) => t.paymentMethod === 'Cheque')
    .reduce((sum, t) => sum + t.netAmountPaid, 0);
  const bankToday = todayTransactions
    .filter((t) => t.paymentMethod === 'Bank Transfer')
    .reduce((sum, t) => sum + t.netAmountPaid, 0);

  // Class-wise Report data (Classes ANKUR, MUKUL, 1 to 10)
  const classWiseData = ALL_CLASSES.map((c) => {
    const studentsInClass = allStudents.filter((s) => String(s.classNum) === String(c));
    let totalAssigned = 0;
    let totalCollected = 0;
    let totalDue = 0;
    let admissionDue = 0;
    let tuitionDue = 0;
    let bookDue = 0;
    let examDue = 0;

    studentsInClass.forEach((s) => {
      const due = db.calculateStudentDueSync(s.id);
      totalDue += due;
      const breakdown = db.getStudentCategoryBreakdown(s.id);
      breakdown.forEach((b) => {
        totalAssigned += b.total;
        totalCollected += b.paid;
        if (b.feeCategory === 'Admission Fee') admissionDue += b.due;
        else if (b.feeCategory === 'Tuition Fee') tuitionDue += b.due;
        else if (b.feeCategory === 'Book Fee') bookDue += b.due;
        else if (b.feeCategory === 'Examination Fee') examDue += b.due;
      });
    });

    return {
      classNum: c,
      studentCount: studentsInClass.length,
      totalAssigned,
      totalCollected,
      totalDue,
      admissionDue,
      tuitionDue,
      bookDue,
      examDue
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let filename = `Report_${activeReportTab}_${Date.now()}.csv`;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeReportTab === 'daily') {
      headers = ['Receipt No', 'Date', 'Student ID', 'Student Name', 'Class', 'Method', 'Net Paid (INR)'];
      rows = todayTransactions.map((t) => [
        t.receiptNo,
        t.date,
        t.studentId,
        `"${t.studentName}"`,
        `${t.classNum}-${t.section}`,
        t.paymentMethod,
        t.netAmountPaid
      ]);
    } else if (activeReportTab === 'classwise') {
      headers = ['Class', 'Students', 'Assigned (INR)', 'Collected (INR)', 'Due (INR)', 'Tuition Due', 'Book Due', 'Exam Due'];
      rows = classWiseData.map((d) => [
        typeof d.classNum === 'string' ? `Class ${d.classNum}` : `Class ${d.classNum}`,
        d.studentCount,
        d.totalAssigned,
        d.totalCollected,
        d.totalDue,
        d.tuitionDue,
        d.bookDue,
        d.examDue
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 space-y-4">
      {/* Top Header Controls (No-Print) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Financial Accounting Reports</span>
            <span className="text-xs bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              Session {settings.academicYear}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Offline collection audits, class-wise distribution, and financial statements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Print Report (F9)</span>
          </button>
        </div>
      </div>

      {/* Report Tab Selector (No-Print) */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto no-print text-xs">
        <button
          onClick={() => setActiveReportTab('daily')}
          className={`px-3.5 py-1.5 font-bold rounded-lg transition-colors ${
            activeReportTab === 'daily'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Daily Collection Report
        </button>
        <button
          onClick={() => setActiveReportTab('classwise')}
          className={`px-3.5 py-1.5 font-bold rounded-lg transition-colors ${
            activeReportTab === 'classwise'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Class-wise Fee Matrix (1-10)
        </button>
        <button
          onClick={() => setActiveReportTab('methods')}
          className={`px-3.5 py-1.5 font-bold rounded-lg transition-colors ${
            activeReportTab === 'methods'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Payment Methods Audit
        </button>
        <button
          onClick={() => setActiveReportTab('dues')}
          className={`px-3.5 py-1.5 font-bold rounded-lg transition-colors ${
            activeReportTab === 'dues'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Institutional Dues Breakdown
        </button>
      </div>

      {/* Printable Sheet View */}
      <div
        id="printable-receipt-area"
        className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-5"
      >
        {/* Header */}
        <div className="text-center pb-3 border-b-2 border-slate-900">
          <div className="flex justify-center mb-1">
            <SchoolCrest size={48} customUrl={settings.logoUrl} />
          </div>
          <h1 className="text-base font-extrabold uppercase text-slate-950 tracking-tight">
            {settings.schoolName}
          </h1>
          <div className="text-xs font-assamese text-slate-700 font-semibold">
            {settings.schoolNameAssamese}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {settings.address} · Affiliation: {settings.affiliationNo}
          </div>
          <div className="mt-2 py-1 px-4 bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider inline-block rounded">
            {activeReportTab === 'daily'
              ? 'DAILY CASH & FEE COLLECTION AUDIT REPORT'
              : activeReportTab === 'classwise'
              ? 'CLASS-WISE FEE REVENUE & OUTSTANDING REPORT'
              : activeReportTab === 'methods'
              ? 'PAYMENT INSTRUMENTS & RECONCILIATION STATEMENT'
              : 'OUTSTANDING DUES BY CATEGORY'}
          </div>
        </div>

        {/* 1. Daily Collection Report */}
        {activeReportTab === 'daily' && (
          <div className="space-y-4">
            {/* Daily KPI summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Cash</span>
                <span className="font-mono font-bold text-base text-blue-900">
                  ₹{cashToday.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">UPI / QR</span>
                <span className="font-mono font-bold text-base text-emerald-800">
                  ₹{upiToday.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Cheque</span>
                <span className="font-mono font-bold text-base text-amber-800">
                  ₹{chequeToday.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Bank / NEFT</span>
                <span className="font-mono font-bold text-base text-indigo-900">
                  ₹{bankToday.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-slate-900 text-white rounded-lg">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Today</span>
                <span className="font-mono font-black text-base text-amber-400">
                  ₹{totalToday.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Daily Transactions Table */}
            <div>
              <div className="text-xs font-bold text-slate-800 mb-2">
                Today's Receipt Ledger Entries ({todayTransactions.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-y border-slate-300">
                      <th className="py-2 px-3">Receipt No</th>
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Student Name</th>
                      <th className="py-2 px-3">Class</th>
                      <th className="py-2 px-3">Method & Ref</th>
                      <th className="py-2 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {todayTransactions.map((tx) => (
                      <tr key={tx.receiptNo}>
                        <td className="py-2 px-3 font-mono font-bold text-blue-900">
                          {tx.receiptNo}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">
                          {new Date(tx.date).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {tx.studentName} ({tx.studentId})
                        </td>
                        <td className="py-2 px-3">
                          Class {tx.classNum}-{tx.section}
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-medium text-slate-800">{tx.paymentMethod}</span>
                          {tx.upiUtr && (
                            <span className="text-slate-500 font-mono text-[10px] ml-1">
                              ({tx.upiUtr})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          ₹{tx.netAmountPaid.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-900">
                      <td colSpan={5} className="py-2 px-3">
                        Total Day Collections
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-800 text-sm">
                        ₹{totalToday.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. Class-wise Report (1 to 10) */}
        {activeReportTab === 'classwise' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-y-2 border-slate-800">
                    <th className="py-2 px-3">Class</th>
                    <th className="py-2 px-3 text-center">Students</th>
                    <th className="py-2 px-3 text-right">Total Assigned</th>
                    <th className="py-2 px-3 text-right">Collected (₹)</th>
                    <th className="py-2 px-3 text-right">Tuition Due</th>
                    <th className="py-2 px-3 text-right">Book Due</th>
                    <th className="py-2 px-3 text-right">Exam Due</th>
                    <th className="py-2 px-3 text-right">Total Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {classWiseData.map((d) => (
                    <tr key={String(d.classNum)} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {typeof d.classNum === 'string' ? `Class ${d.classNum}` : `Class ${d.classNum}`}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{d.studentCount}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        ₹{d.totalAssigned.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700">
                        ₹{d.totalCollected.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        ₹{d.tuitionDue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        ₹{d.bookDue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        ₹{d.examDue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-red-600">
                        ₹{d.totalDue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Payment Methods Audit */}
        {activeReportTab === 'methods' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Audit reconciliation statement by instrument channel for all completed fee transactions.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['Cash', 'UPI', 'Cheque', 'Bank Transfer'].map((method) => {
                const txs = allTransactions.filter(
                  (t) => t.paymentMethod === method && t.status === 'Completed'
                );
                const sum = txs.reduce((acc, curr) => acc + curr.netAmountPaid, 0);

                return (
                  <div key={method} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-sm text-slate-900">{method}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {txs.length} receipts issued
                    </div>
                    <div className="font-mono font-black text-lg text-blue-900 mt-2">
                      ₹{sum.toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Dues by Category */}
        {activeReportTab === 'dues' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Aggregate breakdown of unpaid fees categorized by school expenditure heads.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { title: 'Tuition Fee (Monthly)', amount: db.getDashboardStats().tuitionDue },
                { title: 'Admission Fee', amount: db.getDashboardStats().admissionDue },
                { title: 'Books & Kit', amount: db.getDashboardStats().bookDue },
                { title: 'Examination Fee', amount: db.getDashboardStats().examDue }
              ].map((item) => (
                <div key={item.title} className="p-3 bg-red-50/50 rounded-lg border border-red-200">
                  <div className="text-slate-600 font-semibold">{item.title}</div>
                  <div className="font-mono font-extrabold text-base text-red-600 mt-1">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="pt-8 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
          <div className="text-center">
            <CashierSignature width={110} height={32} customUrl={settings.accountantSignatureUrl} />
            <div className="border-t border-slate-400 pt-1 font-semibold text-[11px]">
              Certified by Senior Accountant
            </div>
          </div>
          <div className="text-center">
            <SchoolOfficialSeal size={65} customUrl={settings.sealUrl} />
          </div>
          <div className="text-center">
            <PrincipalSignature width={110} height={32} customUrl={settings.principalSignatureUrl} />
            <div className="border-t border-slate-400 pt-1 font-semibold text-[11px]">
              Principal / Headmaster
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
