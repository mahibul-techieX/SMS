import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Printer,
  HardDrive,
  UserX,
  CreditCard,
  FileQuestion,
  RotateCcw,
  CheckCircle2,
  Copy
} from 'lucide-react';

interface ErrorDemoModalProps {
  onClose: () => void;
}

interface ErrorScenario {
  id: string;
  title: string;
  category: 'Scanner' | 'Accounting' | 'Database' | 'Hardware' | 'Import';
  description: string;
  errorMessage: string;
  recoveryAction: string;
}

const ERROR_SCENARIOS: ErrorScenario[] = [
  {
    id: 'not_found',
    title: 'Student Not Found',
    category: 'Scanner',
    description: 'Barcode laser read a non-existent student ID (e.g. SRA26-999).',
    errorMessage: 'Error [ERR_STUDENT_NOT_FOUND]: Barcode SRA26-999 does not match any enrolled student record in offline database for session 2026-27.',
    recoveryAction: 'Use global search (F4) or click "Register New Student". Scanner input remains clear for next scan.'
  },
  {
    id: 'duplicate_id',
    title: 'Duplicate Student ID',
    category: 'Accounting',
    description: 'Attempted to register student with an ID that already exists in ledger.',
    errorMessage: 'Conflict [ERR_DUPLICATE_ID]: Student ID "SRA26-001" is already assigned to Anurag Saikia (Class 5-A, Roll 1). Duplicate primary keys are strictly prohibited.',
    recoveryAction: 'Auto-increment to next sequential ID "SRA26-011" or verify student admission register.'
  },
  {
    id: 'invalid_amount',
    title: 'Invalid Payment Amount (<= 0)',
    category: 'Accounting',
    description: 'Cashier entered zero or negative number in fee collection input.',
    errorMessage: 'Validation Error [ERR_INVALID_AMOUNT]: Payment amount must be a positive integer greater than ₹0. Negative credits violate ledger audit invariance.',
    recoveryAction: 'Review fee line items or apply an approved discount concession if fee is being waived.'
  },
  {
    id: 'greater_than_due',
    title: 'Payment Greater Than Outstanding Due',
    category: 'Accounting',
    description: 'Attempting to collect ₹15,000 on a student with only ₹4,400 outstanding due.',
    errorMessage: 'Accounting Guard [ERR_OVERPAYMENT_EXCEEDED]: Specified payment amount ₹15,000 exceeds total outstanding balance ₹4,400 by ₹10,600. Excess collection cannot be accepted as unallocated credit.',
    recoveryAction: 'Cap amount to ₹4,400 or mark advance session fee explicitly in ledger schedule.'
  },
  {
    id: 'printer_error',
    title: 'Printer Offline / Paper Jam',
    category: 'Hardware',
    description: '80mm Thermal POS printer is disconnected, out of paper rolls, or spooler jammed.',
    errorMessage: 'Hardware Warning [PRINTER_OFFLINE]: Thermal 80mm ESC/POS printer at COM3/USB001 is unresponsive. Spooler timeout after 4000ms.',
    recoveryAction: 'Receipt has been safely committed to SQLite ledger. Click "Reprint" once printer roll is replaced, or export PDF copy.'
  },
  {
    id: 'database_error',
    title: 'Local Database I/O Write Failure',
    category: 'Database',
    description: 'Simulated browser quota exceeded or disk write permission restricted.',
    errorMessage: 'Storage Exception [SQLITE_IOERR_WRITE]: Local IndexedDB transaction could not be written to disk. Storage quota limit approached.',
    recoveryAction: 'Run "Backup & Restore" to export database JSON snapshot and free cached records.'
  },
  {
    id: 'backup_failed',
    title: 'Backup Checksum Mismatch',
    category: 'Database',
    description: 'Interrupted file write or corrupt snapshot disk sector.',
    errorMessage: 'Backup Failed [ERR_CRC32_CHECK]: Ledger record verification failed during snapshot serialization. 1 uncommitted transaction detected.',
    recoveryAction: 'Re-run "Backup Now" after committing all pending cashier transactions.'
  },
  {
    id: 'restore_failed',
    title: 'Restore Failed (Invalid Schema)',
    category: 'Database',
    description: 'User uploaded an incompatible or corrupted JSON file for restoration.',
    errorMessage: 'Schema Violation [ERR_INVALID_SCHEMA]: The uploaded file does not contain valid "students", "ledger", or "transactions" relational tables.',
    recoveryAction: 'Workstation ledger safely rolled back to previous state without data loss.'
  },
  {
    id: 'invalid_excel',
    title: 'Invalid CSV / Excel Import Format',
    category: 'Import',
    description: 'CSV file missing required columns "Student ID" or "Class".',
    errorMessage: 'Import Error [ERR_MALFORMED_CSV]: Missing mandatory column headers: [Student ID, Class, Roll No] on line 1.',
    recoveryAction: 'Download the standard student import CSV template from Settings and verify header names.'
  },
  {
    id: 'duplicate_import',
    title: 'Duplicate Batch Import Records',
    category: 'Import',
    description: 'Bulk CSV contains 4 students already present in local database.',
    errorMessage: 'Batch Conflict: 4 of 25 records were skipped because Student IDs [SRA26-001, SRA26-002, SRA26-003, SRA26-004] already exist in ledger.',
    recoveryAction: '21 unique records imported successfully. Conflict log saved to audit trail.'
  }
];

export const ErrorDemoModal: React.FC<ErrorDemoModalProps> = ({ onClose }) => {
  const [selectedScenario, setSelectedScenario] = useState<ErrorScenario>(ERROR_SCENARIOS[0]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Error & Edge State Simulator</h2>
              <p className="text-xs text-slate-400">
                10 production accounting failure modes and resilience handlers
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Left: Scenarios List */}
          <div className="space-y-1.5 border-r border-slate-200 pr-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Edge Case to Inspect
            </div>
            {ERROR_SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s)}
                className={`w-full text-left p-2 rounded-lg transition-colors border ${
                  selectedScenario.id === s.id
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                    : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{s.title}</span>
                  <span className="text-[9px] bg-slate-100 px-1 py-0.2 rounded text-slate-500 font-normal">
                    {s.category}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Detailed UI Presentation of Selected Error State */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
                <span>{selectedScenario.title}</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-red-200 font-mono text-[11px] text-red-800 leading-relaxed shadow-inner">
                {selectedScenario.errorMessage}
              </div>

              <div className="text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Trigger Scenario: </span>
                {selectedScenario.description}
              </div>
            </div>

            {/* Recovery Action Card */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Automated Recovery & Accounting Safeguard</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {selectedScenario.recoveryAction}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px]">
              <span className="font-semibold text-slate-800">Audit Guarantee: </span>
              In accordance with school ledger integrity standards, failed operations never corrupt existing transaction balances or leave orphan debits.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
