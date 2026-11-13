import React, { useState, useRef } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Building,
  Printer,
  Smartphone,
  Globe,
  Upload,
  Image as ImageIcon,
  Trash2,
  FileCheck,
  RotateCcw,
  Sparkles,
  Layers,
  BookOpen,
  Shirt,
  Plus,
  HelpCircle,
  FileText,
  Tag,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { db, DEFAULT_FEE_CATEGORIES_CONFIG } from '../services/db';
import { SchoolSettings, EnterpriseLicense, FeeCategoryConfigItem, FeeCategoryBillingMode } from '../types';
import { SchoolCrest, SchoolOfficialSeal, PrincipalSignature, CashierSignature } from '../components/SchoolGraphics';
import { resizeImageFile } from '../utils/imageUpload';
import { KeyRound, ShieldAlert, ShieldCheck, Clock, Award } from 'lucide-react';
import { SchoolLicenseActivationModal } from '../components/SchoolLicenseActivationModal';

interface SettingsViewProps {
  onOpenVendorPortal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenVendorPortal }) => {
  const [settings, setSettings] = useState<SchoolSettings>(db.getSettings());
  const [license, setLicense] = useState<EnterpriseLicense>(db.getLicense());
  const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  // Custom Category Add State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatPolicy, setNewCatPolicy] = useState<'school-charged' | 'free-provided' | 'student-buys-own' | 'with-admission' | 'separate'>('school-charged');
  const [newCatBilling, setNewCatBilling] = useState<FeeCategoryBillingMode>('annual');
  const [newCatAmount, setNewCatAmount] = useState<number>(500);
  const [newCatClassRange, setNewCatClassRange] = useState('All Classes');
  const [newCatNotes, setNewCatNotes] = useState('');

  const daysRemaining = db.getDaysRemaining();
  const isExpired = daysRemaining < 0;
  const isPerpetual = license.validUntil.startsWith('209') || license.validUntil.startsWith('210');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const sealInputRef = useRef<HTMLInputElement>(null);
  const principalSigInputRef = useRef<HTMLInputElement>(null);
  const accountantSigInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    file: File | undefined,
    field: 'logoUrl' | 'sealUrl' | 'principalSignatureUrl' | 'accountantSignatureUrl',
    maxDim = 400
  ) => {
    if (!file) return;
    try {
      setUploadError('');
      const base64 = await resizeImageFile(file, maxDim, maxDim, 0.9);
      setSettings((prev) => ({
        ...prev,
        [field]: base64
      }));
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process uploaded image.');
    }
  };

  const handleRemoveGraphic = (
    field: 'logoUrl' | 'sealUrl' | 'principalSignatureUrl' | 'accountantSignatureUrl'
  ) => {
    setSettings((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleUpdateCategory = (id: string, updates: Partial<FeeCategoryConfigItem>) => {
    setSettings((prev) => {
      const currentList = prev.feeCategoriesConfig || DEFAULT_FEE_CATEGORIES_CONFIG;
      const updatedList = currentList.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      return { ...prev, feeCategoriesConfig: updatedList };
    });
  };

  const handleToggleCategory = (id: string) => {
    setSettings((prev) => {
      const currentList = prev.feeCategoriesConfig || DEFAULT_FEE_CATEGORIES_CONFIG;
      const updatedList = currentList.map((item) =>
        item.id === id ? { ...item, isEnabled: !item.isEnabled } : item
      );
      return { ...prev, feeCategoriesConfig: updatedList };
    });
  };

  const handleRemoveCategory = (id: string) => {
    setSettings((prev) => {
      const currentList = prev.feeCategoriesConfig || DEFAULT_FEE_CATEGORIES_CONFIG;
      const updatedList = currentList.filter((item) => item.id !== id);
      return { ...prev, feeCategoriesConfig: updatedList };
    });
  };

  const handleResetCategoriesToDefault = () => {
    if (window.confirm('Reset all fee categories and descriptions back to institutional standard defaults?')) {
      setSettings((prev) => ({
        ...prev,
        feeCategoriesConfig: [...DEFAULT_FEE_CATEGORIES_CONFIG]
      }));
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newId = `FC-${Date.now().toString().slice(-4)}`;
    const newCategoryItem: FeeCategoryConfigItem = {
      id: newId,
      name: newCatName.trim(),
      categoryKey: newCatName.trim(),
      description: newCatDesc.trim() || `${newCatName.trim()} configured in school settings.`,
      isEnabled: true,
      billingMode: newCatBilling,
      provisionPolicy: newCatPolicy,
      applicableClassRange: newCatClassRange.trim() || 'All Classes',
      defaultAmount: newCatAmount,
      notes: newCatNotes.trim()
    };
    setSettings((prev) => ({
      ...prev,
      feeCategoriesConfig: [...(prev.feeCategoriesConfig || DEFAULT_FEE_CATEGORIES_CONFIG), newCategoryItem]
    }));
    setShowAddCategoryModal(false);
    setNewCatName('');
    setNewCatDesc('');
    setNewCatAmount(500);
    setNewCatNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveSettings(settings);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>School Profile & Institutional Configuration</span>
            <span className="text-xs bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              Offline Desktop Setup
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure school particulars, receipt printing hardware, and academic year settings
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>SAVE ALL CONFIGURATION</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings successfully updated across receipts, print templates, and ledgers.</span>
        </div>
      )}

      {/* Enterprise License & Validity Status Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
          <div>
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-600" />
              <span>Enterprise Software License & Validity</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Current software validity status, trial mode period, and commercial activation credentials
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isExpired ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>Expired</span>
              </span>
            ) : isPerpetual ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                <span>Lifetime Perpetual</span>
              </span>
            ) : license.isTrial ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Trial Mode ({daysRemaining}d left)</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Commercial Active ({daysRemaining}d left)</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowLicenseModal(true)}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Activate / Renew License</span>
            </button>
            {onOpenVendorPortal && (
              <button
                type="button"
                onClick={onOpenVendorPortal}
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>Vendor Portal</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Organization</span>
            <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">{license.organizationName}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Expiration</span>
            <span className="font-bold text-slate-800 text-xs mt-0.5 block font-mono">
              {isPerpetual ? 'Perpetual (No Expiry)' : license.validUntil}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Serial Key</span>
            <span className="font-bold text-slate-800 text-xs mt-0.5 block font-mono truncate">{license.licenseKey}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Section 1: Institution Details */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h2 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>School Identification & Legal Entity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-700">
                School Name (English) *
              </label>
              <input
                type="text"
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                className="w-full border border-slate-300 rounded p-2 font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">
                School Name in Assamese (অসমীয়া নাম) *
              </label>
              <input
                type="text"
                value={settings.schoolNameAssamese}
                onChange={(e) => setSettings({ ...settings, schoolNameAssamese: e.target.value })}
                className="w-full border border-slate-300 rounded p-2 font-assamese text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1 text-slate-700">
                Postal Address (Printed on Receipts) *
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">Official Phone / Accounts</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full border border-slate-300 rounded p-2 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">Affiliation & Board Code</label>
              <input
                type="text"
                value={settings.affiliationNo}
                onChange={(e) => setSettings({ ...settings, affiliationNo: e.target.value })}
                className="w-full border border-slate-300 rounded p-2 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">Principal / Headmaster Name</label>
              <input
                type="text"
                value={settings.principalName}
                onChange={(e) => setSettings({ ...settings, principalName: e.target.value })}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">Official Currency Symbol</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full border border-slate-300 rounded p-2 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Institutional Branding & Official Signatures Upload */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
            <div>
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Institutional Branding & Official Signatures</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload authentic school logo, official stamp seal, and authorized signatures for receipts & ID cards
              </p>
            </div>
            {uploadError && (
              <span className="text-[11px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {uploadError}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. School Logo */}
            <div className="border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between bg-slate-50/50 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                    School Crest / Logo
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      settings.logoUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {settings.logoUrl ? 'Custom Image' : 'Default Crest'}
                  </span>
                </div>
                <div className="h-28 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2 shadow-2xs overflow-hidden">
                  <SchoolCrest size={64} customUrl={settings.logoUrl} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                  Printed on Fee Receipts, Student ID Cards, Financial Ledgers & Reports.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], 'logoUrl', 300)}
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded border border-blue-200 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload School Logo</span>
                </button>
                {settings.logoUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGraphic('logoUrl')}
                    className="w-full flex items-center justify-center gap-1.5 py-1 text-slate-500 hover:text-red-600 text-[11px] transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Reset to Default Crest</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. Official Stamp / Seal */}
            <div className="border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between bg-slate-50/50 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                    School Stamp / Seal
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      settings.sealUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {settings.sealUrl ? 'Custom Stamp' : 'Default Seal'}
                  </span>
                </div>
                <div className="h-28 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2 shadow-2xs overflow-hidden">
                  <SchoolOfficialSeal size={80} customUrl={settings.sealUrl} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                  Official circular rubber stamp imprinted on valid fee receipts and audit certificates.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <input
                  type="file"
                  ref={sealInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], 'sealUrl', 350)}
                />
                <button
                  type="button"
                  onClick={() => sealInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded border border-blue-200 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload School Stamp</span>
                </button>
                {settings.sealUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGraphic('sealUrl')}
                    className="w-full flex items-center justify-center gap-1.5 py-1 text-slate-500 hover:text-red-600 text-[11px] transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Reset to Default Seal</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3. Principal Signature */}
            <div className="border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between bg-slate-50/50 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                    Principal Signature
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      settings.principalSignatureUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {settings.principalSignatureUrl ? 'Custom Signature' : 'Default Signature'}
                  </span>
                </div>
                <div className="h-28 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2 shadow-2xs overflow-hidden">
                  <PrincipalSignature width={130} height={38} customUrl={settings.principalSignatureUrl} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                  Principal / Headmaster signature printed on receipts and student certificates.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <input
                  type="file"
                  ref={principalSigInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], 'principalSignatureUrl', 350)}
                />
                <button
                  type="button"
                  onClick={() => principalSigInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded border border-blue-200 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Signature</span>
                </button>
                {settings.principalSignatureUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGraphic('principalSignatureUrl')}
                    className="w-full flex items-center justify-center gap-1.5 py-1 text-slate-500 hover:text-red-600 text-[11px] transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Reset to Default</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4. Accountant Signature */}
            <div className="border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between bg-slate-50/50 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                    Accountant Signature
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      settings.accountantSignatureUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {settings.accountantSignatureUrl ? 'Custom Signature' : 'Default Signature'}
                  </span>
                </div>
                <div className="h-28 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2 shadow-2xs overflow-hidden">
                  <CashierSignature width={130} height={38} customUrl={settings.accountantSignatureUrl} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                  Cashier & Accounts Officer signature printed beside receipt total verification.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <input
                  type="file"
                  ref={accountantSigInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], 'accountantSignatureUrl', 350)}
                />
                <button
                  type="button"
                  onClick={() => accountantSigInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded border border-blue-200 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Signature</span>
                </button>
                {settings.accountantSignatureUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGraphic('accountantSignatureUrl')}
                    className="w-full flex items-center justify-center gap-1.5 py-1 text-slate-500 hover:text-red-600 text-[11px] transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Reset to Default</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Hardware & Printer Specifications */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h2 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Printer className="w-4 h-4 text-purple-600" />
            <span>Printer & Hardware Configuration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-700">Default Receipt Paper Size</label>
              <select
                value={settings.defaultPaperSize}
                onChange={(e) => setSettings({ ...settings, defaultPaperSize: e.target.value as any })}
                className="w-full border border-slate-300 rounded p-2 bg-white font-semibold"
              >
                <option value="80mm">80mm Thermal POS Receipt</option>
                <option value="58mm">58mm Compact Thermal POS</option>
                <option value="A4">A4 Full Standard Sheet</option>
                <option value="A5">A5 Half Sheet</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700">Active Academic Session</label>
              <select
                value={settings.academicYear}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                className="w-full border border-slate-300 rounded p-2 bg-white font-mono font-bold text-blue-900"
              >
                <option value="2026-27">2026-27 (Current)</option>
                <option value="2027-28">2027-28 (Upcoming)</option>
                <option value="2028-29">2028-29</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={settings.bilingualReceipt}
                  onChange={(e) => setSettings({ ...settings, bilingualReceipt: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Include Assamese Bilingual Headers on Receipts</span>
              </label>
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold mb-1 text-slate-700">
                Legal Receipt Footer Terms & Conditions
              </label>
              <textarea
                rows={2}
                value={settings.receiptFooter}
                onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: WhatsApp Notification Dispatch & Due Alerts */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h2 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Dashboard Payment Due Alerts & Automated WhatsApp Dispatch</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 text-xs">
                Dashboard Due Notification Window
              </label>
              <select
                value={settings.dueNotificationDays || 7}
                onChange={(e) =>
                  setSettings({ ...settings, dueNotificationDays: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded p-2 bg-white text-xs font-semibold"
              >
                <option value={3}>Next 3 Days</option>
                <option value={5}>Next 5 Days</option>
                <option value={7}>Next 7 Days (Standard)</option>
                <option value={10}>Next 10 Days</option>
                <option value={14}>Next 14 Days (Two Weeks)</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Highlights students on the main dashboard widget whose fee deadlines fall within this window.
              </span>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 text-xs">
                Default Monthly Fee Due Day
              </label>
              <select
                value={settings.feeDueDayOfMonth || 5}
                onChange={(e) =>
                  setSettings({ ...settings, feeDueDayOfMonth: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded p-2 bg-white text-xs font-semibold"
              >
                <option value={1}>1st of Every Month</option>
                <option value={5}>5th of Every Month (Recommended)</option>
                <option value={7}>7th of Every Month</option>
                <option value={10}>10th of Every Month</option>
                <option value={15}>15th of Every Month</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard monthly fee payment cut-off date for students without custom due dates.
              </span>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 text-xs">
                WhatsApp Notice Dispatch Window
              </label>
              <select
                value={settings.whatsAppReminderDays}
                onChange={(e) =>
                  setSettings({ ...settings, whatsAppReminderDays: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded p-2 bg-white text-xs font-semibold"
              >
                <option value={3}>3 Days prior to Due Day</option>
                <option value={5}>5 Days prior to Due Day (Recommended)</option>
                <option value={7}>7 Days prior to Due Day</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Dispatches reminders via browser WhatsApp hooks directly to parent's registered mobile.
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Fee Category / Description & Operational Policies */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-sm">
                  Fee Categories, Descriptions & Policy Specifications
                </h2>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Institutional Master
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-2xl">
                Define and customize fee heads, institutional operational descriptions, and specific school policies (e.g., free book schemes for select classes, student-purchased uniforms, separate vs bundled examination fees).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetCategoriesToDefault}
                className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                title="Restore default category definitions"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddCategoryModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Fee Category</span>
              </button>
            </div>
          </div>

          {/* Operational Policy Guide Banner */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-950 block">Flexible School Policies Supported:</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                • <strong>Book Fee:</strong> Support schools where certain classes receive free textbooks (Govt or Trust welfare scheme) while higher classes pay for specialized study material.
                <br />
                • <strong>Uniform:</strong> Configure whether the school supplies uniforms directly or if students purchase them on their own from the open market (₹0 in ledger).
                <br />
                • <strong>Examination Fee:</strong> Set whether exams are collected as a separate term-wise assessment or bundled with the annual admission package.
              </p>
            </div>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {(settings.feeCategoriesConfig || DEFAULT_FEE_CATEGORIES_CONFIG).map((cat) => {
              const isTuition = cat.categoryKey === 'Tuition Fee';
              const isBooks = cat.categoryKey === 'Book Fee';
              const isUniform = cat.categoryKey === 'Uniform Fee';
              const isExam = cat.categoryKey === 'Examination Fee';

              return (
                <div
                  key={cat.id}
                  className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                    cat.isEnabled
                      ? 'bg-white border-slate-200 shadow-2xs hover:border-indigo-300'
                      : 'bg-slate-50/80 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Row: Title, Policy Badge & Toggle */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isTuition
                              ? 'bg-blue-100 text-blue-700'
                              : isBooks
                              ? 'bg-amber-100 text-amber-700'
                              : isUniform
                              ? 'bg-emerald-100 text-emerald-700'
                              : isExam
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {isTuition ? (
                            <BookOpen className="w-4 h-4" />
                          ) : isBooks ? (
                            <FileText className="w-4 h-4" />
                          ) : isUniform ? (
                            <Shirt className="w-4 h-4" />
                          ) : isExam ? (
                            <FileCheck className="w-4 h-4" />
                          ) : (
                            <Layers className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-xs">{cat.name}</h3>
                            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                              {cat.id}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Key: {cat.categoryKey}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Policy Badge */}
                        {cat.provisionPolicy === 'free-provided' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Free Books / Welfare
                          </span>
                        )}
                        {cat.provisionPolicy === 'student-buys-own' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Student Buys Own
                          </span>
                        )}
                        {cat.provisionPolicy === 'separate' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                            Separate Exam Fee
                          </span>
                        )}
                        {cat.provisionPolicy === 'with-admission' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                            With Admission
                          </span>
                        )}
                        {cat.provisionPolicy === 'school-charged' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            School Charged
                          </span>
                        )}

                        {/* Enable/Disable Toggle */}
                        <label className="flex items-center cursor-pointer" title="Toggle active status">
                          <input
                            type="checkbox"
                            checked={cat.isEnabled}
                            onChange={() => handleToggleCategory(cat.id)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 relative"></div>
                        </label>

                        {/* Delete for custom categories */}
                        {cat.id.startsWith('FC-') && !['FC-01', 'FC-02', 'FC-03', 'FC-04', 'FC-05'].includes(cat.id) && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(cat.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="Remove category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Operational Description */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Fee Description & Scope
                      </label>
                      <input
                        type="text"
                        value={cat.description}
                        onChange={(e) => handleUpdateCategory(cat.id, { description: e.target.value })}
                        placeholder="Brief summary of what this fee covers..."
                        className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white"
                      />
                    </div>

                    {/* Policy & Billing Controls Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                          Provision Policy
                        </label>
                        <select
                          value={cat.provisionPolicy}
                          onChange={(e) =>
                            handleUpdateCategory(cat.id, {
                              provisionPolicy: e.target.value as any,
                              // If student buys own or free provided, default amount can be 0
                              defaultAmount:
                                e.target.value === 'student-buys-own' || e.target.value === 'free-provided'
                                  ? 0
                                  : cat.defaultAmount || 500
                            })
                          }
                          className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs bg-white font-medium focus:outline-none focus:border-indigo-500"
                        >
                          <option value="school-charged">School Supplies & Charges Fee</option>
                          <option value="free-provided">Free Provided (Govt/Trust - ₹0)</option>
                          <option value="student-buys-own">Student Buys Own (Self-procured)</option>
                          <option value="separate">Take Separate (Prior to Exam/Event)</option>
                          <option value="with-admission">Bundled with Admission Fee</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                          Billing Cadence
                        </label>
                        <select
                          value={cat.billingMode}
                          onChange={(e) =>
                            handleUpdateCategory(cat.id, { billingMode: e.target.value as any })
                          }
                          className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs bg-white font-medium focus:outline-none focus:border-indigo-500"
                        >
                          <option value="monthly">Monthly Recurring</option>
                          <option value="annual">Annual / Session Fee</option>
                          <option value="separate-exam">Separate Exam Cycle (Aug/Feb)</option>
                          <option value="with-admission">One-time at Admission</option>
                          <option value="self-purchased">Self-Purchased / Not Billed</option>
                          <option value="optional">Optional / Opt-in</option>
                        </select>
                      </div>
                    </div>

                    {/* Class Applicability & Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                          Applicable Class Range / Rules
                        </label>
                        <input
                          type="text"
                          value={cat.applicableClassRange || ''}
                          onChange={(e) =>
                            handleUpdateCategory(cat.id, { applicableClassRange: e.target.value })
                          }
                          placeholder="e.g. Class 1-8 Free; 9-10 Paid"
                          className="w-full border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                          Standard Fee (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1 font-mono text-slate-400 text-xs">₹</span>
                          <input
                            type="number"
                            disabled={cat.provisionPolicy === 'free-provided' || cat.provisionPolicy === 'student-buys-own'}
                            value={cat.defaultAmount || 0}
                            onChange={(e) =>
                              handleUpdateCategory(cat.id, { defaultAmount: Number(e.target.value) })
                            }
                            className={`w-full border border-slate-200 rounded pl-6 pr-2 py-1 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 text-right ${
                              cat.provisionPolicy === 'free-provided' || cat.provisionPolicy === 'student-buys-own'
                                ? 'bg-slate-100 text-slate-400'
                                : 'bg-white text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Operational Notes / Exceptions */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                        Cashier Note & Student Policy Clarification
                      </label>
                      <input
                        type="text"
                        value={cat.notes || ''}
                        onChange={(e) => handleUpdateCategory(cat.id, { notes: e.target.value })}
                        placeholder="Internal guidelines or receipt note..."
                        className="w-full border border-slate-200 rounded px-2.5 py-1 text-[11px] text-slate-600 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </form>

      {/* Add Custom Fee Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold">Add Custom School Fee Category</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Science Lab Fee, Sports & Development Fee"
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="State what this fee covers, eligibility, and operational details..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Provision Policy</label>
                  <select
                    value={newCatPolicy}
                    onChange={(e) => setNewCatPolicy(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="school-charged">School Supplies & Charges</option>
                    <option value="free-provided">Free Provided (Welfare Scheme)</option>
                    <option value="student-buys-own">Student Buys Own</option>
                    <option value="separate">Take Separate</option>
                    <option value="with-admission">Bundled with Admission</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing Cadence</label>
                  <select
                    value={newCatBilling}
                    onChange={(e) => setNewCatBilling(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="annual">Annual / Session</option>
                    <option value="monthly">Monthly Recurring</option>
                    <option value="separate-exam">Separate Exam Cycle</option>
                    <option value="with-admission">One-time at Admission</option>
                    <option value="optional">Optional / Opt-in</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Applicable Classes</label>
                  <input
                    type="text"
                    value={newCatClassRange}
                    onChange={(e) => setNewCatClassRange(e.target.value)}
                    placeholder="e.g. All Classes, Class 6-10"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Standard Amount (₹)</label>
                  <input
                    type="number"
                    value={newCatAmount}
                    onChange={(e) => setNewCatAmount(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Notes</label>
                <input
                  type="text"
                  value={newCatNotes}
                  onChange={(e) => setNewCatNotes(e.target.value)}
                  placeholder="Additional cashier remarks or conditions..."
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Save & Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* School License Activation Modal */}
      {showLicenseModal && (
        <SchoolLicenseActivationModal
          onClose={() => setShowLicenseModal(false)}
          onOpenVendorPortal={onOpenVendorPortal}
          onLicenseUpdated={(updated) => setLicense(updated)}
        />
      )}
    </div>
  );
};
