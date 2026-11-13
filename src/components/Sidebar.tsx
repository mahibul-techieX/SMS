import React from 'react';
import {
  LayoutDashboard,
  Users,
  QrCode,
  CreditCard,
  Layers,
  Receipt,
  AlertTriangle,
  BarChart3,
  Shield,
  Save,
  Settings,
  History,
  FileQuestion,
  KeyRound,
  GraduationCap
} from 'lucide-react';
import { db } from '../services/db';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenErrorModal: () => void;
  onOpenEnterprisePortal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  onOpenErrorModal,
  onOpenEnterprisePortal
}) => {
  const activeUser = db.getActiveUser();
  const license = db.getLicense();
  const isAdmin = activeUser.role === 'Administrator' || activeUser.role === 'Enterprise Admin';
  const isAccountant = activeUser.role === 'Accountant' || isAdmin;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      shortcut: 'F1',
      allowed: true
    },
    {
      id: 'scan',
      label: 'Scan Student',
      icon: QrCode,
      shortcut: 'F2',
      badge: 'Fast Flow',
      allowed: true,
      highlight: true
    },
    {
      id: 'collect',
      label: 'Fee Collection',
      icon: CreditCard,
      shortcut: 'F3',
      allowed: isAccountant
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      shortcut: 'F5',
      allowed: true
    },
    {
      id: 'teachers',
      label: "Results Corner",
      icon: GraduationCap,
      badge: 'Academic',
      highlight: true,
      allowed: true
    },
    {
      id: 'dues',
      label: 'Due Management',
      icon: AlertTriangle,
      shortcut: 'F8',
      allowed: true
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: Receipt,
      shortcut: 'F7',
      allowed: true
    },
    {
      id: 'structure',
      label: 'Fee Structure',
      icon: Layers,
      allowed: isAdmin
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      shortcut: 'F6',
      allowed: true
    },
    {
      id: 'users',
      label: 'Staff & Roles',
      icon: Shield,
      allowed: isAdmin
    },
    {
      id: 'audit',
      label: 'Audit Log',
      icon: History,
      allowed: isAdmin
    },
    {
      id: 'backup',
      label: 'Backup & Restore',
      icon: Save,
      allowed: isAdmin
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      allowed: isAdmin
    }
  ];

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div className="py-2.5 px-2">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Navigation</span>
          <span className="text-slate-500 font-mono">F1 - F9</span>
        </div>

        <nav className="space-y-0.5">
          {navItems
            .filter((item) => item.allowed)
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : item.highlight
                      ? 'bg-blue-950/60 text-blue-300 hover:bg-blue-900/60 hover:text-white border border-blue-800/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-blue-400'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && !isActive && (
                      <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1 py-0.2 rounded font-semibold">
                        {item.badge}
                      </span>
                    )}
                    {item.shortcut && (
                      <kbd
                        className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                          isActive
                            ? 'bg-blue-700 text-blue-100'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>
              );
            })}
        </nav>
      </div>

      {/* Footer Area with Edge/Error Test trigger & Offline Status */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={onOpenErrorModal}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-colors border border-slate-700/60"
          title="Simulate error states: Student Not Found, Duplicate ID, Printer Offline, DB Disruption"
        >
          <FileQuestion className="w-3.5 h-3.5 text-amber-400" />
          <span>Error & Edge States</span>
        </button>

        {onOpenEnterprisePortal && (
          <button
            onClick={onOpenEnterprisePortal}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 hover:text-white text-[11px] font-bold transition-colors border border-purple-800/80 group shadow-2xs"
            title="Launch separate Enterprise Vendor Panel to provide license keys according to requirement & handle technical support"
          >
            <span className="flex items-center gap-1.5 truncate">
              <KeyRound className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-45 transition-transform shrink-0" />
              <span className="truncate">Enterprise Panel</span>
            </span>
            <span className="text-[9px] bg-purple-800 text-purple-200 px-1.5 py-0.5 rounded font-mono shrink-0">
              Separate
            </span>
          </button>
        )}

        <div className="px-2 py-1.5 rounded bg-slate-950/70 border border-slate-800 text-[10px] text-slate-400 leading-tight">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span>Offline Ledger</span>
            <span className="text-emerald-400 font-mono">100% OK</span>
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            Local SQLite Sync · No Cloud Lag
          </div>
        </div>
      </div>
    </aside>
  );
};
