import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CreditCard,
  Eye,
  Edit,
  History,
  Printer,
  UserX,
  UserCheck,
  UserPlus,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { db } from '../services/db';
import { Student, ALL_CLASSES } from '../types';

interface StudentsListViewProps {
  onViewProfile: (studentId: string) => void;
  onCollectFee: (studentId: string) => void;
  onViewLedger: (studentId: string) => void;
  onEditStudent: (student: Student) => void;
  onPrintIDCard: (student: Student) => void;
  onOpenAddStudent: () => void;
  onOpenBulkIDCards: () => void;
}

export const StudentsListView: React.FC<StudentsListViewProps> = ({
  onViewProfile,
  onCollectFee,
  onViewLedger,
  onEditStudent,
  onPrintIDCard,
  onOpenAddStudent,
  onOpenBulkIDCards
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [dueFilter, setDueFilter] = useState<'All' | 'HasDue' | 'Cleared'>('All');
  const [sortField, setSortField] = useState<'id' | 'name' | 'class' | 'roll' | 'due'>('roll');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const students = db.getAllStudents();

  const handleSort = (field: 'id' | 'name' | 'class' | 'roll' | 'due') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredStudents = students.filter((s) => {
    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      const match =
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.nameAssamese && s.nameAssamese.toLowerCase().includes(q)) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.mobile.includes(q) ||
        String(s.rollNo) === q;
      if (!match) return false;
    }

    // Class filter
    if (selectedClass !== 'All' && String(s.classNum) !== selectedClass) {
      return false;
    }

    // Section filter
    if (selectedSection !== 'All' && s.section !== selectedSection) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'All' && s.status !== selectedStatus) {
      return false;
    }

    // Due filter
    if (dueFilter !== 'All') {
      const due = db.calculateStudentDueSync(s.id);
      if (dueFilter === 'HasDue' && due <= 0) return false;
      if (dueFilter === 'Cleared' && due > 0) return false;
    }

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortField === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'class') {
      const orderA = ALL_CLASSES.indexOf(a.classNum);
      const orderB = ALL_CLASSES.indexOf(b.classNum);
      comparison = orderA !== orderB ? orderA - orderB : a.section.localeCompare(b.section);
    } else if (sortField === 'roll') {
      comparison = a.rollNo - b.rollNo;
    } else if (sortField === 'due') {
      comparison = db.calculateStudentDueSync(a.id) - db.calculateStudentDueSync(b.id);
    }
    return sortAsc ? comparison : -comparison;
  });

  const handleToggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      db.toggleStudentStatus(id);
      // force reload
      setSearchTerm((t) => t + ' ');
      setTimeout(() => setSearchTerm((t) => t.trim()), 10);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Admission No', 'Name', 'Class', 'Section', 'Roll No', 'Guardian', 'Phone', 'Status', 'Outstanding Due (INR)'];
    const rows = filteredStudents.map((s) => [
      s.id,
      s.admissionNo,
      `"${s.name}"`,
      s.classNum,
      s.section,
      s.rollNo,
      `"${s.guardianName || s.fatherName}"`,
      s.mobile,
      s.status,
      db.calculateStudentDueSync(s.id)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Students_List_Session_2026_27.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 space-y-4">
      {/* Top Header & Quick Action Buttons */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Student Management (All Students)</span>
            <span className="text-xs bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {filteredStudents.length} of {students.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ANKUR, MUKUL & Classes 1 to 10 student directory, financial ledger access, and barcode ID card printing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenBulkIDCards}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Bulk Print ID Cards</span>
          </button>

          <button
            onClick={onOpenAddStudent}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>ADD NEW STUDENT</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, Name, Assamese Name, Roll No, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 bg-white font-semibold text-slate-800"
            >
              <option value="All">All Classes</option>
              {ALL_CLASSES.map((c) => (
                <option key={String(c)} value={c}>
                  {typeof c === 'string' ? c : `Class ${c}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Sec:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 bg-white font-semibold text-slate-800"
            >
              <option value="All">All</option>
              <option value="A">Sec A</option>
              <option value="B">Sec B</option>
              <option value="C">Sec C</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Due Status:</span>
            <select
              value={dueFilter}
              onChange={(e) => setDueFilter(e.target.value as any)}
              className="border border-slate-300 rounded px-2 py-1 bg-white font-semibold text-slate-800"
            >
              <option value="All">All Students</option>
              <option value="HasDue">Pending Due Only</option>
              <option value="Cleared">Cleared (₹0 Due)</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 bg-white font-semibold text-slate-800"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Students Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Student ID</span>
                    {sortField === 'id' && <span>{sortAsc ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Student Name</span>
                    {sortField === 'name' && <span>{sortAsc ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('class')}
                  className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Class & Sec</span>
                    {sortField === 'class' && <span>{sortAsc ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('roll')}
                  className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Roll No</span>
                    {sortField === 'roll' && <span>{sortAsc ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th className="py-2.5 px-3.5">Guardian</th>
                <th className="py-2.5 px-3.5">Phone</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th
                  onClick={() => handleSort('due')}
                  className="py-2.5 px-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Outstanding (₹)</span>
                    {sortField === 'due' && <span>{sortAsc ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No students matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const due = db.calculateStudentDueSync(s.id);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => onViewProfile(s.id)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3.5 font-mono font-bold text-blue-900">
                        {s.id}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-slate-300">
                            {s.photoUrl || s.avatarUrl ? (
                              <img src={s.photoUrl || s.avatarUrl} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{s.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{s.name}</div>
                            {s.nameAssamese && (
                              <div className="text-[11px] font-assamese text-slate-600">
                                {s.nameAssamese}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">
                        Class {s.classNum}-{s.section}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-slate-700">
                        {s.rollNo}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-700">
                        {s.guardianName || s.fatherName}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-600">
                        {s.mobile}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            s.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono font-black tabular-nums">
                        <span className={due > 0 ? 'text-red-600' : 'text-emerald-600'}>
                          ₹{due.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onCollectFee(s.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                            title="Collect Fee (F3)"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Collect</span>
                          </button>

                          <button
                            onClick={() => onViewProfile(s.id)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onViewLedger(s.id)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                            title="Student Financial Ledger"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onPrintIDCard(s)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                            title="Print Student ID & Barcode Card"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEditStudent(s)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                            title="Edit Student"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => handleToggleStatus(s.id, e)}
                            className="p-1 rounded bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-300"
                            title={s.status === 'Active' ? 'Deactivate Student' : 'Activate Student'}
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
