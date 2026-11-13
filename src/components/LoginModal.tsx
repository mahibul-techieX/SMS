import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  Eye,
  EyeOff,
  KeyRound,
  Clock,
  Sparkles,
  ShieldAlert,
  Award,
  ChevronRight
} from 'lucide-react';
import { SchoolCrest } from './SchoolGraphics';
import { db } from '../services/db';
import { User, EnterpriseLicense } from '../types';
import { SchoolLicenseActivationModal } from './SchoolLicenseActivationModal';

interface LoginModalProps {
  onSuccess: () => void;
  onOpenVendorPortal?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess, onOpenVendorPortal }) => {
  const settings = db.getSettings();
  const users = db.getUsers();
  const [license, setLicense] = useState<EnterpriseLicense>(db.getLicense());
  const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);
  const [licenseModalTab, setLicenseModalTab] = useState<'validity' | 'trial' | 'key' | 'details'>('validity');

  const [loginMode, setLoginMode] = useState<'staff' | 'enterprise'>('staff');

  // Staff login states
  const [username, setUsername] = useState('accountant');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Enterprise login states
  const [enterpriseUser, setEnterpriseUser] = useState('enterprise');
  const [enterprisePasskey, setEnterprisePasskey] = useState('ENTERPRISE-2026');
  const [enterpriseError, setEnterpriseError] = useState('');

  const daysRemaining = db.getDaysRemaining();
  const isExpired = daysRemaining < 0;
  const isPerpetual = license.validUntil.startsWith('209') || license.validUntil.startsWith('210');

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase().trim());
    if (user && user.active) {
      db.setActiveUser(user);
      onSuccess();
    } else {
      setErrorMsg('Invalid credentials or user account deactivated.');
    }
  };

  const handleEnterpriseLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setEnterpriseError('');

    const isPasskeyOk = db.validateEnterprisePasskey(enterprisePasskey);
    if (!isPasskeyOk) {
      setEnterpriseError('Invalid Enterprise Master Passkey. Try: ENTERPRISE-2026');
      return;
    }

    let entUser = users.find((u) => u.role === 'Enterprise Admin' || u.username === enterpriseUser.toLowerCase().trim());
    if (!entUser) {
      entUser = {
        id: 'USR-ENT-00',
        username: enterpriseUser.toLowerCase().trim() || 'enterprise',
        fullName: 'Enterprise Administrator',
        role: 'Enterprise Admin',
        active: true,
        lastLogin: new Date().toISOString()
      };
      db.addUser(entUser);
    }

    db.setActiveUser(entUser);
    onSuccess();
  };

  const handleStartInstantTrial = () => {
    const updated = db.resetTrial(30);
    setLicense(updated);
    let adminUser = users.find((u) => u.role === 'Enterprise Admin' || u.role === 'Administrator') || users[0];
    db.setActiveUser(adminUser);
    onSuccess();
  };

  const handleQuickLogin = (u: User) => {
    db.setActiveUser(u);
    onSuccess();
  };

  const openValidityModifier = (tab: 'validity' | 'trial' | 'key' | 'details' = 'validity') => {
    setLicenseModalTab(tab);
    setShowLicenseModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
      {/* Background Subtle Geometric Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 text-center border-b-4 border-amber-500 relative">
          <div className="flex justify-center mb-2">
            <SchoolCrest size={56} customUrl={settings.logoUrl} />
          </div>
          <h1 className="text-base font-extrabold tracking-tight uppercase leading-tight">
            {settings.schoolName}
          </h1>
          <div className="text-xs font-assamese text-amber-300 font-medium mt-0.5">
            {settings.schoolNameAssamese}
          </div>

          {/* Software License Validity Status Banner */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs shadow-xs">
            {isExpired ? (
              <span className="flex items-center gap-1.5 text-red-400 font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>Validity Expired</span>
              </span>
            ) : isPerpetual ? (
              <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>Enterprise Perpetual License</span>
              </span>
            ) : license.isTrial ? (
              <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Trial Mode: {daysRemaining} days left</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enterprise Pro: Valid until {license.validUntil}</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowLicenseModal(true)}
              className="ml-1 text-[11px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-0.5 rounded transition-colors"
            >
              School License
            </button>
          </div>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setLoginMode('staff')}
            className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
              loginMode === 'staff'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4 text-blue-600" />
            <span>School Staff Login</span>
          </button>

          <button
            type="button"
            onClick={() => setLoginMode('enterprise')}
            className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
              loginMode === 'enterprise'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-purple-600" />
            <span>Enterprise Admin Portal</span>
          </button>
        </div>

        {/* STAFF LOGIN VIEW */}
        {loginMode === 'staff' && (
          <form onSubmit={handleStaffLogin} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-semibold"
                  placeholder="Enter accountant / admin username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember this offline device</span>
              </label>
              <span className="text-slate-400 text-[11px] font-mono">AY {settings.academicYear}</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>LOGIN TO OFFLINE WORKSTATION</span>
            </button>

            {/* Quick Staff Role Switcher */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Quick Role Test Logins
              </div>
              <div className="grid grid-cols-3 gap-2">
                {users.slice(1, 4).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded border border-slate-200 text-center transition-colors"
                  >
                    <div className="font-bold text-[11px]">{u.role}</div>
                    <div className="text-[9px] text-slate-500 font-mono">@{u.username}</div>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}

        {/* ENTERPRISE LOGIN VIEW */}
        {loginMode === 'enterprise' && (
          <form onSubmit={handleEnterpriseLogin} className="p-6 space-y-4">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-purple-950">Enterprise License Authority: </span>
                <span>
                  Log in to configure commercial licenses, start or extend trial periods, or modify software validity.
                </span>
              </div>
            </div>

            {enterpriseError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {enterpriseError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Enterprise Admin User
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={enterpriseUser}
                  onChange={(e) => setEnterpriseUser(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-semibold"
                  placeholder="enterprise / admin"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Master Enterprise Passkey
                </label>
                <span className="text-[10px] text-purple-700 font-mono font-semibold">
                  Default: ENTERPRISE-2026
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={enterprisePasskey}
                  onChange={(e) => setEnterprisePasskey(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-mono font-bold"
                />
              </div>
            </div>

            {onOpenVendorPortal && (
              <button
                type="button"
                onClick={onOpenVendorPortal}
                className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <KeyRound className="w-4 h-4" />
                <span>OPEN SEPARATE VENDOR & SUPPORT HUB →</span>
              </button>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <Award className="w-4 h-4 text-purple-400" />
              <span>LOG IN TO LOCAL SCHOOL WORKSTATION</span>
            </button>

            {/* Quick Trial & Validity Shortcuts */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Enterprise License Facilities
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleStartInstantTrial}
                  className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-left text-amber-950 transition-colors flex flex-col"
                >
                  <span className="text-xs font-bold flex items-center gap-1.5 text-amber-800">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Instant Trial (30d)</span>
                  </span>
                  <span className="text-[10px] text-amber-700 mt-0.5">
                    Start fresh 30-day evaluation & login directly
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openValidityModifier('validity')}
                  className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-xl text-left text-blue-950 transition-colors flex flex-col"
                >
                  <span className="text-xs font-bold flex items-center gap-1.5 text-blue-800">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                    <span>Modify Validity</span>
                  </span>
                  <span className="text-[10px] text-blue-700 mt-0.5">
                    Extend days or apply commercial key
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Offline Status Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            <span>Local SQLite Engine: Ready</span>
          </div>
          <div className="text-slate-500 font-mono text-[10px]">
            License: <span className="text-slate-800 font-bold">{license.tier.toUpperCase()}</span> ({license.validUntil})
          </div>
        </div>
      </div>

      {/* School License & Key Activation Modal */}
      {showLicenseModal && (
        <SchoolLicenseActivationModal
          onClose={() => setShowLicenseModal(false)}
          onOpenVendorPortal={onOpenVendorPortal}
          onLicenseUpdated={(updated) => {
            setLicense(updated);
          }}
        />
      )}
    </div>
  );
};

