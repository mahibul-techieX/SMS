import React, { useState } from 'react';
import { History, Search, Filter, ShieldCheck, Download, FileSpreadsheet } from 'lucide-react';
import { db } from '../services/db';

export const AuditLogView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const logs = db.getAuditLogs();

  const filteredLogs = logs.filter((log) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!log.description.toLowerCase().includes(q) && !log.user.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (actionFilter !== 'All' && log.action !== actionFilter) {
      return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'User', 'Role', 'Action', 'Description'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.user}"`,
      l.role,
      l.action,
      `"${l.description}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_Register_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>System Financial Audit Trail</span>
            <span className="text-xs bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {filteredLogs.length} Events Logged
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident chronological audit of all user actions, ledger receipts, reversals, and backups
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, staff username, receipt number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-500 font-medium">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 bg-white font-semibold text-slate-800"
          >
            <option value="All">All Actions</option>
            <option value="Payment Collected">Payment Collected</option>
            <option value="Payment Cancelled">Payment Cancelled</option>
            <option value="Discount">Discount Approval</option>
            <option value="Student Created">Student Created</option>
            <option value="Fee Structure Change">Fee Structure Change</option>
            <option value="Backup">Database Backup</option>
            <option value="Restore">Database Restore</option>
            <option value="Login">User Login</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Date & Time</th>
                <th className="py-2.5 px-4">User & Role</th>
                <th className="py-2.5 px-4">Action Event</th>
                <th className="py-2.5 px-4">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{log.user}</div>
                    <div className="text-[10px] text-slate-500">{log.role}</div>
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.action.includes('Payment Collected')
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action.includes('Payment Cancelled')
                          ? 'bg-red-100 text-red-800'
                          : log.action.includes('Backup') || log.action.includes('Restore')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-800 font-medium">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
