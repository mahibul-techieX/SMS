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
  RefreshCw,
  Building2,
  Lock,
  Layers,
  ChevronRight,
  X,
  FileCheck,
  Award,
  Activity
} from 'lucide-react';
import { db } from '../services/db';
import { EnterpriseLicense, LicenseTier } from '../types';
import { LicenseOverview } from './LicenseOverview';

interface EnterpriseLicenseModalProps {
  onClose: () => void;
  onLicenseUpdated?: (license: EnterpriseLicense) => void;
  defaultTab?: 'overview' | 'validity' | 'trial' | 'key' | 'details';
}

export const EnterpriseLicenseModal: React.FC<EnterpriseLicenseModalProps> = ({
  onClose,
  onLicenseUpdated,
  defaultTab = 'validity'
}) => {
  const [license, setLicense] = useState<EnterpriseLicense>(db.getLicense());
  const [activeTab, setActiveTab] = useState<'overview' | 'validity' | 'trial' | 'key' | 'details'>(defaultTab);
  
  // Validity modification states
  const [customDate, setCustomDate] = useState<string>(license.validUntil || '2026-12-31');
  const [modificationReason, setModificationReason] = useState<string>('Standard administrative extension');
  
  // Trial configuration states
  const [trialDaysInput, setTrialDaysInput] = useState<number>(30);
  const [trialOrgName, setTrialOrgName] = useState<string>(license.organizationName);
  
  // Key activation states
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>('');
  const [keyOrgName, setKeyOrgName] = useState<string>(license.organizationName);
  
  // Admin passkey confirmation
  const [passkeyInput, setPasskeyInput] = useState<string>('ENTERPRISE-2026');
  const [isPasskeyVerified, setIsPasskeyVerified] = useState<boolean>(true);
  const [passkeyError, setPasskeyError] = useState<string>('');
  
  // Feedback notices
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const daysRemaining = db.getDaysRemaining();
  const isPerpetual = license.validUntil.startsWith('209') || license.validUntil.startsWith('210');
  const isExpired = daysRemaining < 0;
  const allStudents = db.getAllStudents();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedbackNotice({ type, message });
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 4000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(license.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleQuickExtend = (days: number) => {
    const updated = db.grantTrialDays(days, `Quick extension of +${days} days via Enterprise Console`);
    setLicense(updated);
    setCustomDate(updated.validUntil);
    onLicenseUpdated?.(updated);
    showNotification('success', `Software validity successfully extended by ${days} days! (Valid until ${updated.validUntil})`);
  };

  const handleSetPerpetual = () => {
    const updated = db.modifyValidity('2099-12-31', 'Granted Lifetime / Perpetual Enterprise License');
    db.updateLicense({ tier: 'enterprise', isTrial: false });
    const fresh = db.getLicense();
    setLicense(fresh);
    setCustomDate(fresh.validUntil);
    onLicenseUpdated?.(fresh);
    showNotification('success', 'Software validity set to Perpetual / Lifetime (Valid until 2099)!');
  };

  const handleApplyCustomDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDate) {
      showNotification('error', 'Please select a valid expiration date.');
      return;
    }
    const updated = db.modifyValidity(customDate, modificationReason);
    setLicense(updated);
    onLicenseUpdated?.(updated);
    showNotification('success', `Software validity date updated to ${customDate}.`);
  };

  const handleResetOrStartTrial = (days: number) => {
    const updated = db.resetTrial(days);
    if (trialOrgName.trim()) {
      db.updateLicense({ organizationName: trialOrgName.trim() });
    }
    const fresh = db.getLicense();
    setLicense(fresh);
    setCustomDate(fresh.validUntil);
    onLicenseUpdated?.(fresh);
    showNotification('success', `Evaluation trial initiated with ${days} days validity (Expiring ${fresh.validUntil})!`);
  };

  const handleGenerateSampleKey = () => {
    const yr = new Date().getFullYear();
    const seg1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const seg2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const seg3 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generated = `SRA-ENT-${yr}-${seg1}-${seg2}-${seg3}`;
    setLicenseKeyInput(generated);
  };

  const handleActivateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) {
      showNotification('error', 'Please provide a valid Enterprise License Key.');
      return;
    }
    const res = db.activateEnterpriseLicense(licenseKeyInput.trim(), keyOrgName.trim());
    if (res.success) {
      const fresh = db.getLicense();
      setLicense(fresh);
      setCustomDate(fresh.validUntil);
      onLicenseUpdated?.(fresh);
      showNotification('success', 'Enterprise Commercial License successfully verified and activated!');
      setLicenseKeyInput('');
    } else {
      showNotification('error', res.message);
    }
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          <span>Validity Expired</span>
        </span>
      );
    }
    if (isPerpetual) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
          <Award className="w-3.5 h-3.5 text-purple-600" />
          <span>Perpetual Enterprise License</span>
        </span>
      );
    }
    if (license.isTrial) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Trial Mode ({daysRemaining} Days Left)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Enterprise Active ({daysRemaining} Days Remaining)</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-300 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-4 border-blue-600 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white">
                  Enterprise Software License & Validity Manager
                </h2>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage commercial deployment, grant trial usage, or extend software operation validity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackNotice && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all ${
              feedbackNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-red-50 text-red-800 border-b border-red-200'
            }`}
          >
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackNotice.message}</span>
          </div>
        )}

        {/* Quick License Status Overview Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Organization
            </div>
            <div className="text-xs font-bold text-slate-900 truncate mt-0.5" title={license.organizationName}>
              {license.organizationName}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              HW: {license.hardwareFingerprint}
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Edition & Tier
            </div>
            <div className="text-xs font-bold text-slate-900 capitalize mt-0.5 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${license.isTrial ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              <span>{license.isTrial ? 'Evaluation Trial' : 'Enterprise Edition'}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Capacity: {allStudents.length} / {license.maxStudents} Students
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Validity Expiry
            </div>
            <div className="text-xs font-black text-slate-900 mt-0.5">
              {isPerpetual ? 'Perpetual (Lifetime)' : license.validUntil}
            </div>
            <div className={`text-[10px] font-bold mt-0.5 ${isExpired ? 'text-red-600' : daysRemaining < 7 ? 'text-amber-600' : 'text-emerald-700'}`}>
              {isPerpetual ? 'No Expiry' : isExpired ? 'Expired' : `${daysRemaining} calendar days left`}
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              License Serial
            </div>
            <div className="text-xs font-mono font-bold text-slate-800 truncate mt-0.5 flex items-center justify-between">
              <span title={license.licenseKey}>{license.licenseKey}</span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="text-slate-400 hover:text-blue-600 p-0.5"
                title="Copy License Key"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Issued: {license.issuedDate}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-4 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span>License Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('validity')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'validity'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Modify Validity Period</span>
          </button>

          <button
            onClick={() => setActiveTab('trial')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'trial'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Trial Provisioning Facility</span>
          </button>

          <button
            onClick={() => setActiveTab('key')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'key'
                ? 'border-purple-600 text-purple-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-purple-600" />
            <span>Commercial Key Activation</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'details'
                ? 'border-slate-800 text-slate-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4 text-slate-600" />
            <span>Modules & Verification</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          {/* TAB 0: LICENSE OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <LicenseOverview
              license={license}
              onExtendQuick={handleQuickExtend}
              onOpenModifyTab={() => setActiveTab('validity')}
              onOpenTrialTab={() => setActiveTab('trial')}
              onOpenKeyTab={() => setActiveTab('key')}
            />
          )}

          {/* TAB 1: MODIFY VALIDITY */}
          {activeTab === 'validity' && (
            <div className="space-y-6">
              {/* Quick Extension Pills */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>One-Click Validity Extension</span>
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Instantly grant additional operating days to the school without re-installing or resetting database records:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(7)}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 hover:text-blue-700 text-center transition-all flex flex-col items-center group"
                  >
                    <span className="text-xs font-black text-blue-600 group-hover:scale-105 transition-transform">+7 Days</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Quick Grace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickExtend(15)}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 hover:text-blue-700 text-center transition-all flex flex-col items-center group"
                  >
                    <span className="text-xs font-black text-blue-600 group-hover:scale-105 transition-transform">+15 Days</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Half Month</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickExtend(30)}
                    className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-400 text-blue-900 text-center transition-all flex flex-col items-center group"
                  >
                    <span className="text-xs font-black text-blue-700 group-hover:scale-105 transition-transform">+30 Days</span>
                    <span className="text-[10px] text-blue-600 mt-0.5">Standard Month</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickExtend(90)}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 hover:text-blue-700 text-center transition-all flex flex-col items-center group"
                  >
                    <span className="text-xs font-black text-blue-600 group-hover:scale-105 transition-transform">+90 Days</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Quarterly Term</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickExtend(365)}
                    className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 hover:border-emerald-400 text-emerald-900 text-center transition-all flex flex-col items-center group"
                  >
                    <span className="text-xs font-black text-emerald-700 group-hover:scale-105 transition-transform">+1 Year</span>
                    <span className="text-[10px] text-emerald-600 mt-0.5">Academic Session</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSetPerpetual}
                    className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100 hover:border-purple-400 text-purple-900 text-center transition-all flex flex-col items-center group"
                  >
                    <span className="text-xs font-black text-purple-700 group-hover:scale-105 transition-transform">Lifetime</span>
                    <span className="text-[10px] text-purple-600 mt-0.5">Perpetual (2099)</span>
                  </button>
                </div>
              </div>

              {/* Exact Custom Date Setter Form */}
              <form onSubmit={handleApplyCustomDate} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Set Exact Expiration Date</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Current Valid Until: <strong className="text-slate-800">{license.validUntil}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Software Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      required
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                    <div className="text-[11px] text-slate-500 mt-1">
                      Pick any date in the future to grant uninterrupted operations.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Administrative Note / Audit Reason
                    </label>
                    <input
                      type="text"
                      value={modificationReason}
                      onChange={(e) => setModificationReason(e.target.value)}
                      placeholder="e.g. Approved trial extension by Managing Director"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                    <div className="text-[11px] text-slate-500 mt-1">
                      Logged in system audit history for compliance and tracking.
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>APPLY NEW SOFTWARE VALIDITY</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: TRIAL PROVISIONING */}
          {activeTab === 'trial' && (
            <div className="space-y-6">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900">Trial Software Provisioning Engine</h4>
                  <p className="mt-0.5 text-amber-800">
                    Use this facility to deploy or refresh free trial usage for prospective school clients, demonstrations, or educational audit evaluation. Trials run with full offline database capabilities.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Trial Instance Configuration
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      School / Client Organization Name
                    </label>
                    <input
                      type="text"
                      value={trialOrgName}
                      onChange={(e) => setTrialOrgName(e.target.value)}
                      placeholder="School Name for Trial"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Trial Duration (Days)
                    </label>
                    <div className="flex gap-2">
                      {[15, 30, 45, 60].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setTrialDaysInput(d)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            trialDaysInput === d
                              ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-amber-50'
                          }`}
                        >
                          {d} Days
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Initiating a trial grants immediate active validity without requiring a commercial serial key.
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResetOrStartTrial(trialDaysInput)}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>START / RESET {trialDaysInput}-DAY EVALUATION TRIAL</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMERCIAL KEY ACTIVATION */}
          {activeTab === 'key' && (
            <div className="space-y-6">
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-purple-900">Commercial Enterprise License Key Activation</h4>
                  <p className="mt-0.5 text-purple-800">
                    Apply official enterprise serial keys issued by the software vendor or distribution partner to convert trial instances to permanent full-license installations.
                  </p>
                </div>
              </div>

              <form onSubmit={handleActivateKey} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Enterprise License Serial Key *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSampleKey}
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Valid Sample Key</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={licenseKeyInput}
                    onChange={(e) => setLicenseKeyInput(e.target.value.toUpperCase())}
                    placeholder="e.g. SRA-ENT-2026-9842-8810"
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Licensed Institution / Organization Name
                  </label>
                  <input
                    type="text"
                    value={keyOrgName}
                    onChange={(e) => setKeyOrgName(e.target.value)}
                    placeholder="Enter Institution Name"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Commercial license unlocks unlimited student profiles & automated cloud backups.
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>VERIFY & ACTIVATE ENTERPRISE LICENSE</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: MODULES & VERIFICATION */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Licensed Functional Modules</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Fee Collection & Counter Desk</div>
                      <div className="text-[11px] text-slate-500">Real-time ledger, dual paper receipts, UPI QR</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Barcode & Student ID Cards</div>
                      <div className="text-[11px] text-slate-500">Code 128 barcode generator & single/bulk printing</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">WhatsApp Due Notices</div>
                      <div className="text-[11px] text-slate-500">Direct WhatsApp API click-to-chat reminders</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Cryptographic Audit Logging</div>
                      <div className="text-[11px] text-slate-500">Tamper-evident logs of receipts, logins & edits</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Pre-Primary (ANKUR & MUKUL)</div>
                      <div className="text-[11px] text-slate-500">Dedicated kindergarten fee structures & ledgers</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Offline SQLite JSON Backups</div>
                      <div className="text-[11px] text-slate-500">One-click snapshot export & restore engine</div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Technical Certificate Info */}
              <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs space-y-2 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Digital Certificate & Environment Verification</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500">License ID:</span>
                    <div className="text-white font-bold">{license.licenseKey.slice(0, 16)}...</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Sign Authority:</span>
                    <div className="text-white font-bold">{license.lastModifiedBy}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Last Modified:</span>
                    <div className="text-white font-bold">{license.lastModifiedAt}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Runtime:</span>
                    <div className="text-emerald-400 font-bold">Offline SQLite v1</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Master Enterprise Passkey: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-700">ENTERPRISE-2026</code></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Close Manager
          </button>
        </div>
      </div>
    </div>
  );
};
