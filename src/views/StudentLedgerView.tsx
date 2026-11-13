import React, { useState } from 'react';
import {
  History,
  Printer,
  ArrowLeft,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  CreditCard,
  Download,
  Loader2,
  Calculator
} from 'lucide-react';
import { db } from '../services/db';
import { Student, SchoolSettings } from '../types';
import { SchoolCrest, SchoolOfficialSeal, CashierSignature, PrincipalSignature } from '../components/SchoolGraphics';
import { exportElementToPdf } from '../utils/pdfExport';
import { ClassFeeCalculatorModal } from '../components/ClassFeeCalculatorModal';

interface StudentLedgerViewProps {
  studentId: string;
  onBack: () => void;
  onCollectFee: (studentId: string) => void;
}

export const StudentLedgerView: React.FC<StudentLedgerViewProps> = ({
  studentId,
  onBack,
  onCollectFee
}) => {
  const student = db.getStudentById(studentId);
  const settings: SchoolSettings = db.getSettings();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

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

  const ledgerEntries = db.getStudentLedger(student.id);
  const totalDebit = ledgerEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = ledgerEntries.reduce((sum, e) => sum + e.credit, 0);
  const finalOutstanding = Math.max(0, totalDebit - totalCredit);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      await exportElementToPdf('printable-receipt-area', {
        filename: `Student_Ledger_${student.id}_${student.name.replace(/\s+/g, '_')}.pdf`,
        format: 'a4',
        scale: 2.5
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Entry ID', 'Date', 'Type', 'Reference No', 'Description', 'Debit (INR)', 'Credit (INR)', 'Running Balance (INR)'];
    const rows = ledgerEntries.map((e) => [
      e.id,
      e.date,
      e.type,
      e.referenceId,
      `"${e.description}"`,
      e.debit,
      e.credit,
      e.runningBalance
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Ledger_${student.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 space-y-4">
      {/* Top Header Controls (No-Print) */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Profile (ESC)</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            title="Download ledger in PDF format"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Ledger (PDF)'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Print Ledger Sheet</span>
          </button>

          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold shadow-xs transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>Class Matrix Audit</span>
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

      {/* Printable Ledger Sheet Container */}
      <div id="printable-receipt-area" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-4">
        {/* Ledger Institutional Header */}
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
            OFFICIAL STUDENT FINANCIAL LEDGER (AUDITED)
          </div>
        </div>

        {/* Student Metadata Card */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs items-center">
          <div className="flex items-center gap-2 md:col-span-2">
            <div className="w-10 h-12 rounded bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-700">
              {student.photoUrl || student.avatarUrl ? (
                <img src={student.photoUrl || student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <span>{student.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Name</span>
              <span className="font-bold text-slate-900 text-sm">{student.name}</span>
              {student.nameAssamese && (
                <div className="text-[10px] font-assamese text-slate-600">{student.nameAssamese}</div>
              )}
            </div>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Student ID / Barcode</span>
            <span className="font-mono font-bold text-blue-900">{student.id}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Class & Section</span>
            <span className="font-bold text-slate-800">Class {student.classNum}-{student.section}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Admission / Roll</span>
            <span className="font-mono font-bold text-slate-900">{student.admissionNo} · #{student.rollNo}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Session</span>
            <span className="font-bold text-slate-800">{student.academicYear}</span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-y-2 border-slate-800">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Transaction / Description</th>
                <th className="py-2 px-3">Reference / Receipt</th>
                <th className="py-2 px-3 text-right">Debit (Fee Due)</th>
                <th className="py-2 px-3 text-right">Credit (Paid)</th>
                <th className="py-2 px-3 text-right">Running Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ledgerEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                    {new Date(entry.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900">
                    {entry.description}
                  </td>
                  <td className="py-2 px-3 font-mono text-blue-800 text-[11px]">
                    {entry.referenceId}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-red-600 tabular-nums">
                    {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                    {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ₹{entry.runningBalance.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs">
                <td colSpan={3} className="py-2.5 px-3 uppercase text-slate-800">
                  Total Ledger Totals
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-red-600 tabular-nums">
                  ₹{totalDebit.toLocaleString('en-IN')}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-700 tabular-nums">
                  ₹{totalCredit.toLocaleString('en-IN')}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-black text-sm text-red-600 tabular-nums">
                  ₹{finalOutstanding.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Ledger Summary Box */}
        <div className="grid grid-cols-3 gap-3 pt-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div className="text-slate-500">Total Fees Incurred:</div>
            <div className="font-mono font-bold text-base text-slate-900">
              ₹{totalDebit.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
            <div className="text-emerald-800">Total Fees Collected:</div>
            <div className="font-mono font-bold text-base text-emerald-700">
              ₹{totalCredit.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 rounded-lg border border-red-200 bg-red-50/50">
            <div className="text-red-800 font-semibold">Net Outstanding Balance:</div>
            <div className="font-mono font-black text-lg text-red-600">
              ₹{finalOutstanding.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
          <div className="text-center">
            <CashierSignature width={110} height={32} customUrl={settings.accountantSignatureUrl} />
            <div className="border-t border-slate-400 pt-1 font-semibold text-[11px]">
              Verified by Sr. Accountant
            </div>
          </div>
          <div className="text-center">
            <SchoolOfficialSeal size={65} customUrl={settings.sealUrl} />
          </div>
          <div className="text-center">
            <PrincipalSignature width={110} height={32} customUrl={settings.principalSignatureUrl} />
            <div className="border-t border-slate-400 pt-1 font-semibold text-[11px]">
              Principal / Head of Institution
            </div>
          </div>
        </div>
      </div>

      <ClassFeeCalculatorModal
        studentId={student.id}
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onApplyPreset={(preset) => {
          setIsCalculatorOpen(false);
          onCollectFee(student.id);
        }}
      />
    </div>
  );
};
