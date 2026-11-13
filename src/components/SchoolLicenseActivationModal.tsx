import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Headphones,
  X,
  Award
} from 'lucide-react';
import { db } from '../services/db';
import { EnterpriseLicense } from '../types';

interface SchoolLicenseActivationModalProps {
  onClose: () => void;
  onOpenVendorPortal?: () => void;
  onLicenseUpdated?: (license: EnterpriseLicense) => void;
}

export const SchoolLicenseActivationModal: React.FC<SchoolLicenseActivationModalProps> = ({
  onClose,
  onOpenVendorPortal,
  onLicenseUpdated
}) => {
  const [license, setLicense] = useState<EnterpriseLicense>(db.getLicense());
  const [keyInput, setKeyInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const daysRemaining = db.getDaysRemaining();
  const isExpired = daysRemaining < 0;
  const isPerpetual = license.validUntil.startsWith('209') || license.validUntil.startsWith('210');

  const handleCopyKey = () => {
    navigator.clipboard.writeText(license.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a valid license key provided by your vendor.' });
      return;
    }

    const res = db.activateEnterpriseLicense(keyInput.trim());
    if (res.success) {
      const fresh = db.getLicense();
      setLicense(fresh);
      onLicenseUpdated?.(fresh);
      setFeedback({ type: 'success', message: 'License key activated successfully! Software validity updated.' });
      setKeyInput('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-300 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-4 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">
                School Software License & Activation
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Current workstation validity and vendor license key activation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-red-50 text-red-800 border-b border-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-5 bg-slate-50/50">
          {/* Active License Details Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Current School Workstation Status
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                isExpired
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : isPerpetual
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : license.isTrial
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {isExpired ? 'Expired' : isPerpetual ? 'Perpetual Pro' : license.isTrial ? 'Trial Edition' : 'Active Pro'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Licensed Institution:</span>
                <span className="font-bold text-slate-900 block truncate">{license.organizationName}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Validity Expiration:</span>
                <span className="font-black text-slate-900 font-mono">
                  {isPerpetual ? 'Lifetime (No Expiry)' : license.validUntil}
                </span>
                <span className={`text-[10px] font-bold block ${isExpired ? 'text-red-600' : 'text-emerald-700'}`}>
                  {isPerpetual ? 'Never expires' : isExpired ? 'Expired' : `${daysRemaining} days remaining`}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Active Serial: {license.licenseKey}</span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold text-[11px]"
              >
                {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Key Activation Form */}
          <form onSubmit={handleActivate} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Activate or Extend With Vendor Key</span>
            </h3>
            <p className="text-xs text-slate-500">
              Enter the new official serial key provided by your enterprise software vendor:
            </p>

            <div className="space-y-1">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                placeholder="e.g. SRA-ENT-2026-PAHS-9841-K72B"
                required
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono font-bold uppercase focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ACTIVATE LICENSE ON THIS WORKSTATION</span>
            </button>
          </form>

          {/* Vendor Portal Notice Card */}
          <div className="p-4 bg-purple-50/80 rounded-xl border border-purple-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Headphones className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-purple-950">Enterprise Vendor & Support Hub: </span>
                <span className="text-purple-800">
                  License key generation, school quota customization, and diagnostics are managed via the separate Enterprise Portal.
                </span>
              </div>
            </div>

            {onOpenVendorPortal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVendorPortal();
                }}
                className="px-3.5 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>Open Vendor Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>SRA Enterprise Software Support: +91 361 245 8899</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
