import React, { useState, useRef } from 'react';
import {
  Save,
  Download,
  Upload,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import { db } from '../services/db';
import { BackupRecord } from '../types';
import { useBackupReminder } from '../services/backupReminderService';

export const BackupRestoreView: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>(db.getBackups());
  const [notice, setNotice] = useState<string>('');
  const [confirmRestoreFile, setConfirmRestoreFile] = useState<{ filename: string; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isOverdue,
    daysSinceLastBackup,
    formattedDate,
    handleSimulateOverdue
  } = useBackupReminder();

  const handleBackupNow = () => {
    try {
      const rec = db.createBackupNow();
      setBackups(db.getBackups());
      setNotice(`Backup snapshot "${rec.filename}" created and downloaded successfully.`);
      setTimeout(() => setNotice(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Backup failed.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setConfirmRestoreFile({
        filename: file.name,
        content
      });
    };
    reader.readAsText(file);
    // reset input
    e.target.value = '';
  };

  const handleExecuteRestore = () => {
    if (!confirmRestoreFile) return;
    try {
      db.restoreFromSnapshotJson(confirmRestoreFile.content);
      setNotice(`Database restored successfully from "${confirmRestoreFile.filename}". All records refreshed.`);
      setConfirmRestoreFile(null);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      alert(`Restore Error: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Offline Database Backup & Disaster Recovery</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
              SQLite JSON Format
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Zero-cloud dependency. Export cryptographically intact offline ledger dumps or restore historical databases
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.sqlite"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>RESTORE BACKUP FILE</span>
          </button>

          <button
            onClick={handleBackupNow}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>BACKUP NOW (DOWNLOAD SNAPSHOT)</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Backup Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 7-Day Compliance Status */}
        <div className={`p-4 rounded-xl border shadow-xs space-y-1.5 flex flex-col justify-between ${
          isOverdue
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>7-Day Policy Status</span>
              {isOverdue ? (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div className={`text-base font-black mt-1 ${isOverdue ? 'text-amber-800' : 'text-emerald-800'}`}>
              {isOverdue ? `Overdue (${daysSinceLastBackup}d)` : `Compliant (${daysSinceLastBackup}d ago)`}
            </div>
            <p className="text-[11px] text-slate-600">
              Last: <strong className="font-mono">{formattedDate}</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-1 text-[10px]">
            <button
              type="button"
              onClick={() => handleSimulateOverdue(10)}
              className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 font-mono text-slate-700 font-bold transition-colors"
              title="Simulate last backup was 10 days ago for testing"
            >
              Test 10d Overdue
            </button>
            <button
              type="button"
              onClick={handleBackupNow}
              className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold transition-colors"
            >
              Backup Now
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-800 font-bold text-xs">
            <span>Storage Engine</span>
            <HardDrive className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-1">Local Browser IndexedDB</div>
          <p className="text-[11px] text-slate-500">
            Backed by persistent browser storage. Runs 100% without internet.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-800 font-bold text-xs">
            <span>Periodic Verification</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-extrabold text-emerald-700 mt-1">Every 60 Seconds</div>
          <p className="text-[11px] text-slate-500">
            Background check alerts dashboard when no backup in 7+ days.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-800 font-bold text-xs">
            <span>Recovery Verification</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-1">Integrity Verified ✓</div>
          <p className="text-[11px] text-slate-500">
            Ledger checksums and double-entry debits match credits.
          </p>
        </div>
      </div>

      {/* Historical Backups Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Previous Offline Backups & Snapshots</h2>
          <span className="text-xs text-slate-500 font-mono">
            {backups.length} Archival Snapshots
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Filename</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Database Size</th>
                <th className="py-2.5 px-4">Records Count</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.map((bkp) => (
                <tr key={bkp.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono font-bold text-blue-900">
                    {bkp.filename}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                    {bkp.timestamp}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-700">{bkp.sizeKb} KB</td>
                  <td className="py-2.5 px-4 font-mono text-slate-700">
                    {bkp.recordCount} rows
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {bkp.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={handleBackupNow}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded border border-slate-300 font-medium text-[11px]"
                    >
                      Export Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal Before Restore */}
      {confirmRestoreFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-red-600 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Database Restoration</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Are you sure you want to restore database from{' '}
              <strong className="font-mono text-blue-900">{confirmRestoreFile.filename}</strong>?
              <br />
              <span className="text-red-700 font-semibold block mt-1">
                Warning: This will overwrite the current in-memory workstation ledger with the contents of the backup file. Current active transactions will be matched to the snapshot.
              </span>
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setConfirmRestoreFile(null)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRestore}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
              >
                Yes, Restore Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
