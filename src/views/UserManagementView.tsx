import React, { useState } from 'react';
import { Shield, UserPlus, CheckCircle2, AlertCircle, Key, UserCheck, UserX } from 'lucide-react';
import { db } from '../services/db';
import { User, Role } from '../types';

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [showAddModal, setShowAddModal] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('Accountant');
  const [notice, setNotice] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) return;

    try {
      const newUser = db.addUser({
        username: username.toLowerCase().trim(),
        fullName: fullName.trim(),
        role,
        active: true,
        lastLogin: 'Never'
      });
      setUsers(db.getUsers());
      setShowAddModal(false);
      setUsername('');
      setFullName('');
      setNotice(`User ${newUser.fullName} added successfully.`);
      setTimeout(() => setNotice(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to add user.');
    }
  };

  const handleRoleChange = (id: string, newRole: Role) => {
    db.updateUserRole(id, newRole);
    setUsers(db.getUsers());
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 space-y-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Staff Accounts & Role-Based Access Control (RBAC)</span>
            <span className="text-xs bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {users.length} Authorized Staff
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage administrative privilege levels: Administrator, Accountant, Viewer
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>ADD STAFF USER</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Role Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-900 font-bold text-sm">
            <span>Administrator</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-[11px] text-slate-500">
            Full root privileges. Fee structure configuration, user management, audit logs, backup & restore.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-900 font-bold text-sm">
            <span>Accountant</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[11px] text-slate-500">
            Rapid barcode scanning, student fee collection, receipt generation, reprint, daily cashier register.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-900 font-bold text-sm">
            <span>Viewer</span>
            <Shield className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-500">
            Read-only access. View student ledger balances, audit reports, and receipt copies.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Authorized Workstation Accounts</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">User ID</th>
                <th className="py-2.5 px-4">Full Name</th>
                <th className="py-2.5 px-4">Username</th>
                <th className="py-2.5 px-4">Role Permission</th>
                <th className="py-2.5 px-4">Last Activity</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono font-bold text-blue-900">{u.id}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{u.fullName}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600">@{u.username}</td>
                  <td className="py-2.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="border border-slate-300 rounded px-2 py-1 text-xs bg-white font-semibold text-slate-800"
                    >
                      <option value="Administrator">Administrator</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                    {u.lastLogin}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      Active
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Password reset prompt sent for ${u.username}.`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 font-medium text-[11px]"
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-300">
            <h2 className="text-sm font-bold text-slate-900">Add Staff Account</h2>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ranjit Goswami"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Username *</label>
                <input
                  type="text"
                  placeholder="e.g. ranjit"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-blue-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Role Permission *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full border border-slate-300 rounded p-2 bg-white font-semibold"
                >
                  <option value="Administrator">Administrator (Full Access)</option>
                  <option value="Accountant">Accountant (Collection & Printing)</option>
                  <option value="Viewer">Viewer (Read Only)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
