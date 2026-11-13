import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  Search,
  UserPlus,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Barcode,
  ArrowRight,
  Sparkles,
  CreditCard,
  UserCheck,
  Volume2
} from 'lucide-react';
import { db } from '../services/db';
import { Student } from '../types';
import { playScannerBeep } from '../utils/audio';

interface ScanStudentViewProps {
  onStudentFound: (studentId: string) => void;
  onOpenAddStudent: () => void;
  onOpenSearch: () => void;
}

export const ScanStudentView: React.FC<ScanStudentViewProps> = ({
  onStudentFound,
  onOpenAddStudent,
  onOpenSearch
}) => {
  const [scannedInput, setScannedInput] = useState<string>('');
  const [scanState, setScanState] = useState<'idle' | 'found' | 'not_found'>('idle');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [manualSearchQuery, setManualSearchQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input focused constantly for hardware barcode scanner wedge
  useEffect(() => {
    inputRef.current?.focus();
    const handleGlobalClick = () => {
      // Re-focus if user clicked elsewhere
      inputRef.current?.focus();
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleScanSubmit = (valueToProcess?: string) => {
    const rawVal = valueToProcess !== undefined ? valueToProcess : scannedInput;
    const cleanId = rawVal.trim().toUpperCase();

    if (!cleanId) return;

    // Check if format has prefix e.g. "ID:SRA26-001"
    let targetId = cleanId;
    if (cleanId.startsWith('ID:')) {
      const parts = cleanId.split('|');
      targetId = parts[0].replace('ID:', '').trim();
    }

    const student = db.getStudentById(targetId);

    if (student) {
      playScannerBeep(true);
      setFoundStudent(student);
      setScanState('found');
      setFeedbackMsg(`Student Found: ${student.name} (Class ${student.classNum}-${student.section})`);
      
      // Auto-transition to fee collection after 650ms for ultra-fast <30s cashier flow
      setTimeout(() => {
        onStudentFound(student.id);
      }, 700);
    } else {
      playScannerBeep(false);
      setFoundStudent(null);
      setScanState('not_found');
      setFeedbackMsg(`Student ID "${targetId}" not found in offline database.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScanSubmit();
    }
  };

  const handleResetScan = () => {
    setScannedInput('');
    setScanState('idle');
    setFoundStudent(null);
    setFeedbackMsg('');
    inputRef.current?.focus();
  };

  const sampleStudents = db.getAllStudents().slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex flex-col items-center justify-center min-h-[550px]">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-center">
        {/* Banner */}
        <div className="bg-slate-900 text-white p-6 border-b-4 border-blue-600">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-600/30 text-blue-400 mb-3 border border-blue-500/40">
            <Barcode className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight">SCAN STUDENT BARCODE</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Point the laser or camera barcode scanner at the Student ID Card. Keyboard input mode will automatically capture the barcode.
          </p>
        </div>

        {/* Central Scan Terminal Box */}
        <div className="p-8 space-y-6">
          {scanState === 'idle' && (
            <div className="space-y-4">
              {/* Scan Input Box */}
              <div className="relative max-w-md mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  value={scannedInput}
                  onChange={(e) => setScannedInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Waiting for barcode scanner..."
                  className="w-full text-center text-lg font-mono font-bold tracking-wider py-3.5 px-4 rounded-xl border-2 border-blue-500 bg-blue-50/20 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 shadow-inner"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleScanSubmit()}
                  className="mt-3 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>IDENTIFY STUDENT (ENTER)</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Ready for scanner beam (Hardware or Manual ID entry)</span>
              </div>
            </div>
          )}

          {/* Student Found State */}
          {scanState === 'found' && foundStudent && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  STUDENT FOUND ✓
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {foundStudent.name}
                </h2>
                <div className="text-xs text-slate-600 font-mono mt-0.5">
                  ID: <span className="font-bold text-blue-900">{foundStudent.id}</span> · Class {foundStudent.classNum}-{foundStudent.section} · Roll: {foundStudent.rollNo}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-700 font-semibold">
                <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                <span>Opening fee collection workstation automatically...</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onStudentFound(foundStudent.id)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors inline-flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>PROCEED TO FEE COLLECTION NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Student Not Found State */}
          {scanState === 'not_found' && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-md">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
                  STUDENT NOT FOUND
                </span>
                <p className="text-xs text-red-700 mt-1">{feedbackMsg}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleResetScan}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>SCAN AGAIN (ESC)</span>
                </button>

                <button
                  onClick={onOpenSearch}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>SEARCH STUDENT (F4)</span>
                </button>

                <button
                  onClick={onOpenAddStudent}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>ADD STUDENT</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Simulator Buttons */}
          <div className="pt-4 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulate Barcode Scanner Hardware (Click any card to scan)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sampleStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setScannedInput(s.id);
                    handleScanSubmit(s.id);
                  }}
                  className="p-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-left transition-colors text-xs flex flex-col justify-between"
                >
                  <div className="font-mono font-bold text-blue-900 flex items-center justify-between">
                    <span>{s.id}</span>
                    <span className="text-[10px] text-slate-500 font-sans">
                      Class {s.classNum}-{s.section}
                    </span>
                  </div>
                  <div className="text-slate-800 font-semibold truncate mt-0.5">{s.name}</div>
                  <div className="text-[10px] text-red-600 font-mono font-bold mt-1">
                    Due: ₹{db.calculateStudentDueSync(s.id).toLocaleString('en-IN')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
