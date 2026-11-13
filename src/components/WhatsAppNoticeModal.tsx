import React, { useState } from 'react';
import { Smartphone, X, Send, Copy, Check, MessageSquare, AlertTriangle } from 'lucide-react';
import { Student, SchoolSettings } from '../types';
import { db } from '../services/db';
import { generateDueReminderWhatsAppMessage, openWhatsAppDirect } from '../utils/whatsapp';

interface WhatsAppNoticeModalProps {
  student: Student;
  onClose: () => void;
}

export const WhatsAppNoticeModal: React.FC<WhatsAppNoticeModalProps> = ({
  student,
  onClose
}) => {
  const settings: SchoolSettings = db.getSettings();
  const totalDue = db.calculateStudentDueSync(student.id);
  const breakdownList = db.getStudentCategoryBreakdown(student.id);

  const tuitionDue = breakdownList.find((b) => b.feeCategory === 'Tuition Fee')?.due || 0;
  const booksDue = breakdownList.find((b) => b.feeCategory === 'Book Fee')?.due || 0;
  const examDue = breakdownList.find((b) => b.feeCategory === 'Examination Fee')?.due || 0;
  const othersDue = totalDue - (tuitionDue + booksDue + examDue);

  const defaultMessage = generateDueReminderWhatsAppMessage(student, totalDue, settings, {
    tuition: tuitionDue,
    books: booksDue,
    exam: examDue,
    others: Math.max(0, othersDue)
  });

  const [messageText, setMessageText] = useState(defaultMessage);
  const [copied, setCopied] = useState(false);

  const handleSend = () => {
    openWhatsAppDirect(student.mobile, messageText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">WhatsApp Fee Reminder Notice</h2>
              <p className="text-[11px] text-emerald-200">
                To Parent of {student.name} ({student.id}) · 📞 {student.mobile}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-300 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Total Outstanding: <strong className="text-red-700 font-mono">₹{totalDue.toLocaleString('en-IN')}</strong>. Automated notification scheduled 5 days prior to month due date.
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              WhatsApp Message Preview (Editable)
            </label>
            <textarea
              rows={11}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch WhatsApp Web / App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
