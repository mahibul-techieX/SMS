import { useEffect, useState, useCallback } from 'react';
import { db } from './db';
import { BackupRecord } from '../types';

export interface BackupStatusState {
  lastBackup: BackupRecord | null;
  lastBackupDate: Date | null;
  daysSinceLastBackup: number;
  isOverdue: boolean;
  thresholdDays: number;
  formattedDate: string;
  isDismissed: boolean;
}

/**
 * Service to calculate and track offline database backup age
 */
export const backupReminderService = {
  getThresholdDays(): number {
    return 7;
  },

  getStatus(): BackupStatusState {
    const threshold = this.getThresholdDays();
    const info = db.getLastBackupInfo(threshold);
    const isDismissed = db.isBackupReminderDismissed();

    return {
      lastBackup: info.lastBackup,
      lastBackupDate: info.lastBackupDate,
      daysSinceLastBackup: info.daysSinceLastBackup,
      isOverdue: info.isOverdue,
      thresholdDays: threshold,
      formattedDate: info.formattedDate,
      isDismissed
    };
  },

  createInstantBackup(): BackupRecord {
    return db.createBackupNow();
  },

  dismiss(hours = 24): void {
    db.dismissBackupReminder(hours);
  },

  clearDismissal(): void {
    db.clearBackupReminderDismissal();
  },

  simulateOverdue(days = 10): BackupRecord {
    return db.simulateLastBackupDaysAgo(days);
  }
};

/**
 * React Hook that subscribes to backup changes and checks periodically (every 60s)
 */
export function useBackupReminder() {
  const [status, setStatus] = useState<BackupStatusState>(() => backupReminderService.getStatus());
  const [justBackedUp, setJustBackedUp] = useState<boolean>(false);

  const refresh = useCallback(() => {
    setStatus(backupReminderService.getStatus());
  }, []);

  useEffect(() => {
    // Initial refresh
    refresh();

    // Periodic check every 60 seconds
    const interval = setInterval(() => {
      refresh();
    }, 60000);

    // Listen for custom backup state change events
    const handleEvent = () => {
      refresh();
    };

    window.addEventListener('sra-backup-status-changed', handleEvent);
    window.addEventListener('focus', handleEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('sra-backup-status-changed', handleEvent);
      window.removeEventListener('focus', handleEvent);
    };
  }, [refresh]);

  const handleBackupNow = useCallback(() => {
    try {
      const rec = backupReminderService.createInstantBackup();
      setJustBackedUp(true);
      refresh();
      setTimeout(() => setJustBackedUp(false), 5000);
      return rec;
    } catch (err) {
      console.error('Backup creation failed:', err);
      throw err;
    }
  }, [refresh]);

  const handleDismiss = useCallback((hours = 24) => {
    backupReminderService.dismiss(hours);
    refresh();
  }, [refresh]);

  const handleSimulateOverdue = useCallback((days = 10) => {
    backupReminderService.simulateOverdue(days);
    refresh();
  }, [refresh]);

  return {
    ...status,
    refresh,
    handleBackupNow,
    handleDismiss,
    handleSimulateOverdue,
    justBackedUp
  };
}
