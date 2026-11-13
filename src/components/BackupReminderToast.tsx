import React, { useState } from 'react';
import {
  HardDriveDownload,
  ShieldAlert,
  CheckCircle2,
  X,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useBackupReminder } from '../services/backupReminderService';

interface BackupReminderToastProps {
  onNavigateToBackup?: () => void;
}

export const BackupReminderToast: React.FC<BackupReminderToastProps> = ({
  onNavigateToBackup
}) => {
  const {
    isOverdue,
    daysSinceLastBackup,
    formattedDate,
    isDismissed,
    handleBackupNow,
    handleDismiss,
    justBackedUp
  } = useBackupReminder();

  const [isToastClosed, setIsToastClosed] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // If not overdue, or dismissed, or closed by user, don't show
  if ((!isOverdue && !justBackedUp) || (isDismissed && !justBackedUp) || isToastClosed) {
    return null;
  }

  const handleInstantBackup = () => {
    setIsProcessing(true);
    try {
      handleBackupNow();
      setTimeout(() => {
        setIsToastClosed(true);
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseToast = () => {
    setIsToastClosed(true);
    handleDismiss(24);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 p-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            {justBackedUp ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white tracking-tight">
                {justBackedUp ? 'Snapshot Saved!' : 'Backup Recommended'}
              </h4>
              <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800">
                {daysSinceLastBackup === 999 ? '7+ Days' : `${daysSinceLastBackup}d Ago`}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              {justBackedUp
                ? 'Your offline database has been downloaded and secured.'
                : `No backup generated in the last ${daysSinceLastBackup} days. Backup now to protect school fee ledger.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCloseToast}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          title="Dismiss for 24 hours"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!justBackedUp && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleInstantBackup}
            disabled={isProcessing}
            className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            {isProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <HardDriveDownload className="w-3.5 h-3.5" />
            )}
            <span>Backup Now</span>
          </button>

          {onNavigateToBackup && (
            <button
              type="button"
              onClick={() => {
                setIsToastClosed(true);
                onNavigateToBackup();
              }}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              Manage
            </button>
          )}
        </div>
      )}
    </div>
  );
};
