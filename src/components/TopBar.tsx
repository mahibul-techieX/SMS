import React, { useState, useEffect } from 'react';
import {
  Search,
  HardDrive,
  Clock,
  LogOut,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  Award
} from 'lucide-react';
import { db } from '../services/db';
import { User, Student, EnterpriseLicense } from '../types';
import { SchoolCrest } from './SchoolGraphics';

interface TopBarProps {
  activeView: string;
  onNavigate: (view: string, studentId?: string) => void;
  onOpenAddStudent: () => void;
  onOpenDueReport: () => void;
  onLogout: () => void;
  onOpenLicenseModal?: () => void;
  onOpenVendorPortal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onNavigate,
  onOpenAddStudent,
  onOpenDueReport,
  onLogout,
  onOpenLicenseModal,
  onOpenVendorPortal
}) => {
  const [settings, setSettings] = useState(db.getSettings());
  const [activeUser, setActiveUser] = useState<User>(db.getActiveUser());
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [license, setLicense] = useState<EnterpriseLicense>(db.getLicense());
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }
    const q = query.toLowerCase().trim();
    const matches = db.getAllStudents().filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.nameAssamese && s.nameAssamese.toLowerCase().includes(q)) ||
        s.mobile.includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        String(s.rollNo) === q
    );
    setSearchResults(matches.slice(0, 6));
    setIsSearchOpen(true);
  };

  const handleSelectSearchResult = (studentId: string) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    onNavigate('profile', studentId);
  };

  const handleSwitchUser = (user: User) => {
    db.setActiveUser(user);
    setActiveUser(user);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 select-none z-30 shrink-0">
      {/* Top Application Bar - Increased height and generous layout */}
      <div className="h-20 px-6 flex items-center justify-between gap-6">
        {/* Brand Zone */}
        <div className="flex items-center gap-3.5 shrink-0 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center p-1 shadow-inner">
            <SchoolCrest size={40} customUrl={settings.logoUrl} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white leading-none">
                {settings.schoolName}
              </span>
              <span className="text-[10px] bg-blue-950 text-blue-300 font-mono font-bold px-2 py-0.5 rounded border border-blue-800">
                AY {settings.academicYear}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-assamese flex items-center gap-2 mt-1">
              <span>{settings.schoolNameAssamese}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-sans font-medium text-[11px]">
                {settings.affiliationNo || 'Affiliation No: SEBA/CBSE-AS-14028'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Search Bar (F4) */}
        <div className="relative max-w-lg w-full hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Student ID, Name, Roll No, Phone (Press F4)..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchQuery && setIsSearchOpen(true)}
              className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-xs rounded-xl pl-10 pr-12 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-slate-700/80 px-1.5 py-0.5 rounded font-mono font-medium">
              F4
            </span>
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
              <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 flex justify-between">
                <span>Students Matching "{searchQuery}"</span>
                <span>{searchResults.length} found</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {searchResults.map((s) => {
                  const due = db.calculateStudentDueSync(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSearchResult(s.id)}
                      className="px-3.5 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-[10px] text-slate-700 shrink-0">
                          {typeof s.classNum === 'string' ? s.classNum.slice(0, 2) : s.classNum}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{s.name}</span>
                            <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-semibold">
                              {s.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Class {s.classNum}-{s.section} · Roll: {s.rollNo} · 📞 {s.mobile}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-black text-red-600 tabular-nums">
                          ₹{due.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">Due Balance</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Info: Offline SQLite Status, License, Clock, User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Offline Database Status Pill */}
          <div
            className="hidden lg:flex items-center gap-2 bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 px-3 py-1.5 rounded-xl text-xs font-medium shadow-2xs"
            title="Local SQLite / IndexedDB engine active. No internet connection required."
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>SQLite Offline Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          {/* Software License Pill */}
          <button
            type="button"
            onClick={onOpenLicenseModal}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border shadow-2xs ${
              license.status === 'expired'
                ? 'bg-red-950/80 text-red-300 border-red-700/80 hover:bg-red-900/80 animate-pulse'
                : license.isTrial
                ? 'bg-amber-950/80 text-amber-300 border-amber-700/80 hover:bg-amber-900/80'
                : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700/90'
            }`}
            title="School workstation license status"
          >
            {license.status === 'expired' ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Expired</span>
              </>
            ) : license.isTrial ? (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Trial: {db.getDaysRemaining()}d</span>
              </>
            ) : (
              <>
                <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Pro License</span>
              </>
            )}
          </button>

          {/* Live Date & Time Display */}
          <div className="hidden xl:flex flex-col items-end text-right px-1">
            <div className="text-xs font-mono font-bold text-slate-200 tabular-nums flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{currentDate}</div>
          </div>

          {/* Logged In User & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white">
                {activeUser.fullName.charAt(0)}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-white leading-tight">
                  {activeUser.fullName}
                </div>
                <div className="text-[10px] text-amber-400 flex items-center gap-0.5 font-medium">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {activeUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 p-1.5 z-50 text-xs">
                <div className="px-2.5 py-2 border-b border-slate-100">
                  <div className="font-semibold text-slate-800">{activeUser.fullName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">@{activeUser.username}</div>
                  <div className="mt-1 text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded inline-block">
                    Role: {activeUser.role}
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Active Staff Role
                  </div>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSwitchUser(u)}
                      className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-slate-100 ${
                        activeUser.id === u.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{u.fullName}</div>
                        <div className="text-[10px] text-slate-400">{u.role}</div>
                      </div>
                      {activeUser.id === u.id && <span className="text-blue-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenLicenseModal?.();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-blue-700 hover:bg-blue-50 flex items-center gap-1.5 font-medium"
                  >
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>School License & System Info</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded text-red-600 hover:bg-red-50 flex items-center gap-1.5 font-medium mt-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Lock / Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
