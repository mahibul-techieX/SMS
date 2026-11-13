import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  CreditCard,
  Eye,
  Printer,
  Smartphone,
  Download,
  CheckCircle,
  FileSpreadsheet,
  Calculator
} from 'lucide-react';
import { db } from '../services/db';
import { Student, ALL_CLASSES } from '../types';
import { WhatsAppNoticeModal } from '../components/WhatsAppNoticeModal';
import { ClassFeeCalculatorModal } from '../components/ClassFeeCalculatorModal';

interface DueManagementViewProps {
  onViewProfile: (studentId: string) => void;
  onCollectFee: (studentId: string) => void;
}

export const DueManagementView: React.FC<DueManagementViewProps> = ({
  onViewProfile,
  onCollectFee
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [minDue, setMinDue] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudentForNotice, setSelectedStudentForNotice] = useState<Student | null>(null);
  const [selectedStudentForCalculator, setSelectedStudentForCalculator] = useState<string | null>(null);

  const students = db.getAllStudents();

  // Compute dues breakdown for all students
  const studentDues = students
    .map((s) => {
      const breakdown = db.getStudentCategoryBreakdown(s.id);
      const totalDue = db.calculateStudentDueSync(s.id);
      const tuitionDue = breakdown.find((b) => b.feeCategory === 'Tuition Fee')?.due || 0;
      const bookDue = breakdown.find((b) => b.feeCategory === 'Book Fee')?.due || 0;
      const examDue = breakdown.find((b) => b.feeCategory === 'Examination Fee')?.due || 0;
      const otherDue = Math.max(0, totalDue - (tuitionDue + bookDue + examDue));

      return {
        student: s,
        tuitionDue,
        bookDue,
        examDue,
        otherDue,
        totalDue
      };
    })
    .filter((d) => d.totalDue > minDue)
    .filter((d) => {
      if (selectedClass !== 'All' && String(d.student.classNum) !== selectedClass) return false;
      if (selectedSection !== 'All' && d.student.section !== selectedSection) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          d.student.name.toLowerCase().includes(q) ||
          d.student.id.toLowerCase().includes(q) ||
          d.student.mobile.includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => b.totalDue - a.totalDue);

  const totalOutstandingSum = studentDues.reduce((sum, d) => sum + d.totalDue, 0);

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Name', 'Class', 'Section', 'Roll', 'Phone', 'Tuition Due', 'Book Due', 'Exam Due', 'Other Due', 'Total Due'];
    const rows = studentDues.map((d) => [
      d.student.id,
      `"${d.student.name}"`,
      d.student.classNum,
      d.student.section,
      d.student.rollNo,
      d.student.mobile,
      d.tuitionDue,
      d.bookDue,
      d.examDue,
      d.otherDue,
      d.totalDue
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Due_Management_Report_${Date.now()}.csv`);
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
            <span>Outstanding Due Management</span>
            <span className="text-xs bg-red-100 text-red-800 font-mono font-bold px-2 py-0.5 rounded border border-red-200">
              {studentDues.length} Students Pending
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify defaulters, send bulk WhatsApp reminders, and collect outstanding balances
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-200 text-right">
            <div className="text-[10px] font-bold text-red-700 uppercase">
              FILTERED TOTAL DUE
            </div>
            <div className="text-xl font-black text-red-600 font-mono tabular-nums leading-none mt-0.5">
              ₹{totalOutstandingSum.toLocaleString('en-IN')}
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Due List</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Student Name, ID, Phone..."
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
            <span className="text-slate-500 font-medium">Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="border border-slate-300 rounded px-2 py-1 bg-white font-semibold text-slate-800"
            >
              <option value="All">All</option>
              <option value="A">Sec A</option>
              <option value="B">Sec B</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Min Due:</span>
            <select
              value={minDue}
              onChange={(e) => setMinDue(Number(e.target.value))}
              className="border border-slate-300 rounded px-2 py-1 bg-white font-semibold text-slate-800"
            >
              <option value="0">All Dues (&gt; ₹0)</option>
              <option value="2000">&gt; ₹2,000</option>
              <option value="5000">&gt; ₹5,000</option>
              <option value="10000">&gt; ₹10,000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Due Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3.5">Student ID & Name</th>
                <th className="py-2.5 px-3.5">Class & Sec</th>
                <th className="py-2.5 px-3.5 text-right">Tuition Due (₹)</th>
                <th className="py-2.5 px-3.5 text-right">Book Due (₹)</th>
                <th className="py-2.5 px-3.5 text-right">Exam Due (₹)</th>
                <th className="py-2.5 px-3.5 text-right">Other Due (₹)</th>
                <th className="py-2.5 px-3.5 text-right">Total Due (₹)</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentDues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No outstanding fee records matching the selected criteria.
                  </td>
                </tr>
              ) : (
                studentDues.map((item) => (
                  <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3.5">
                      <div className="font-bold text-slate-900">{item.student.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        <span className="text-blue-900 font-bold">{item.student.id}</span> · Roll: {item.student.rollNo} · 📞 {item.student.mobile}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-800">
                      Class {item.student.classNum}-{item.student.section}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-slate-800">
                      ₹{item.tuitionDue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-slate-800">
                      ₹{item.bookDue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-slate-800">
                      ₹{item.examDue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono tabular-nums text-slate-800">
                      ₹{item.otherDue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-mono font-black text-red-600 tabular-nums">
                      ₹{item.totalDue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onCollectFee(item.student.id)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Collect</span>
                        </button>

                        <button
                          onClick={() => setSelectedStudentForNotice(item.student)}
                          className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300"
                          title="Send WhatsApp Fee Reminder"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setSelectedStudentForCalculator(item.student.id)}
                          className="p-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300"
                          title="Automated Class Fee Calculation Breakdown"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onViewProfile(item.student.id)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudentForNotice && (
        <WhatsAppNoticeModal
          student={selectedStudentForNotice}
          onClose={() => setSelectedStudentForNotice(null)}
        />
      )}

      {selectedStudentForCalculator && (
        <ClassFeeCalculatorModal
          studentId={selectedStudentForCalculator}
          isOpen={!!selectedStudentForCalculator}
          onClose={() => setSelectedStudentForCalculator(null)}
          onApplyPreset={(preset) => {
            const sid = selectedStudentForCalculator;
            setSelectedStudentForCalculator(null);
            onCollectFee(sid);
          }}
        />
      )}
    </div>
  );
};
