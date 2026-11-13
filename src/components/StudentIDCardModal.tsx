import React, { useState, useEffect } from 'react';
import {
  Printer,
  X,
  CreditCard,
  Download,
  Filter,
  CheckSquare,
  Square,
  FileDown,
  Loader2
} from 'lucide-react';
import { Student, SchoolSettings, ALL_CLASSES } from '../types';
import { db } from '../services/db';
import { SchoolCrest, SchoolOfficialSeal, PrincipalSignature } from './SchoolGraphics';
import { generateBarcodeSvg, generateQrDataUrl } from '../utils/barcode';
import { exportElementToPdf } from '../utils/pdfExport';

interface StudentIDCardModalProps {
  initialStudent?: Student;
  onClose: () => void;
}

export const StudentIDCardModal: React.FC<StudentIDCardModalProps> = ({
  initialStudent,
  onClose
}) => {
  const [mode, setMode] = useState<'single' | 'bulk'>(initialStudent ? 'single' : 'bulk');
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>(initialStudent);
  const [selectedClass, setSelectedClass] = useState<number | string>(initialStudent ? initialStudent.classNum : 'ANKUR');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const settings: SchoolSettings = db.getSettings();
  const allStudents = db.getAllStudents();

  const filteredStudents = allStudents.filter((s) => {
    if (String(s.classNum) !== String(selectedClass)) return false;
    if (selectedSection !== 'All' && s.section !== selectedSection) return false;
    return true;
  });

  const studentsToRender = mode === 'single' ? (selectedStudent ? [selectedStudent] : []) : filteredStudents;

  // Generate QR codes for students to render
  useEffect(() => {
    let isMounted = true;
    const generateCodes = async () => {
      const urls: Record<string, string> = {};
      for (const s of studentsToRender) {
        const qrUrl = await generateQrDataUrl(`ID:${s.id}|ADM:${s.admissionNo}|NAME:${s.name}|CLASS:${s.classNum}-${s.section}`, 80);
        urls[s.id] = qrUrl;
      }
      if (isMounted) {
        setQrCodeUrls(urls);
      }
    };
    generateCodes();
    return () => {
      isMounted = false;
    };
  }, [studentsToRender.map((s) => s.id).join(',')]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadIDCardsPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      if (mode === 'single' && selectedStudent) {
        const singleCardEl = document.getElementById(`student-card-${selectedStudent.id}`) || document.getElementById('printable-receipt-area');
        if (singleCardEl) {
          await exportElementToPdf(singleCardEl, {
            filename: `ID_Card_${selectedStudent.id}_${selectedStudent.name.replace(/\s+/g, '_')}.pdf`,
            format: 'id-card',
            orientation: 'portrait',
            scale: 3
          });
        }
      } else {
        await exportElementToPdf('printable-receipt-area', {
          filename: `Student_ID_Cards_Class_${selectedClass}_Session_${settings.academicYear}.pdf`,
          format: 'a4',
          orientation: 'portrait',
          scale: 2.5
        });
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadIDCardsHtml = () => {
    const el = document.getElementById('printable-receipt-area');
    if (!el) return;
    const cardsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Student ID Cards - Session ${settings.academicYear}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .print-bar { margin-bottom: 20px; display: flex; justify-content: flex-end; }
    .btn { background: #0f172a; color: #ffffff; border: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .print-bar { display: none !important; }
      @page { margin: 6mm; size: auto; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <button class="btn" onclick="window.print()">Print ID Cards</button>
  </div>
  <div>
    ${el.innerHTML}
  </div>
</body>
</html>`;
    const blob = new Blob([cardsHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Student_ID_Cards_${mode === 'single' ? (selectedStudent?.id || 'Single') : `Class_${selectedClass}`}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-slate-100 rounded-xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-300">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Print Student ID & Barcode Cards</h2>
              <p className="text-[11px] text-slate-400">
                Code 128 Barcode + QR Code for instant desk fee scanning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode switch */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setMode('single')}
                className={`px-3 py-1 font-semibold rounded ${
                  mode === 'single' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Single Card
              </button>
              <button
                onClick={() => setMode('bulk')}
                className={`px-3 py-1 font-semibold rounded ${
                  mode === 'bulk' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Bulk Class Sheet
              </button>
            </div>

            {mode === 'bulk' && (
              <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded-lg text-xs">
                <span className="text-slate-400 text-[11px]">Class:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
                  className="bg-slate-900 text-white text-xs rounded px-1.5 py-0.5 border border-slate-700"
                >
                  {ALL_CLASSES.map((c) => (
                    <option key={String(c)} value={c}>
                      {typeof c === 'string' ? c : `Class ${c}`}
                    </option>
                  ))}
                </select>

                <span className="text-slate-400 text-[11px] ml-1">Section:</span>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="bg-slate-900 text-white text-xs rounded px-1.5 py-0.5 border border-slate-700"
                >
                  <option value="All">All</option>
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                </select>
              </div>
            )}

            {mode === 'single' && (
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => {
                  const s = allStudents.find((st) => st.id === e.target.value);
                  setSelectedStudent(s);
                }}
                className="bg-slate-800 text-white text-xs rounded px-2 py-1 border border-slate-700 max-w-xs"
              >
                {allStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} - {s.name} (Class {s.classNum}-{s.section})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleDownloadIDCardsPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              title="Download Student ID Card in high resolution PDF format"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>
                {isGeneratingPdf
                  ? 'Generating PDF...'
                  : mode === 'single'
                  ? 'Download ID Card (PDF)'
                  : 'Download All (PDF)'}
              </span>
            </button>

            <button
              onClick={handleDownloadIDCardsHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition-colors border border-slate-700"
              title="Download standalone offline ID cards HTML file"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-300" />
              <span>HTML</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>

            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200/90 flex justify-center">
          <div
            id="printable-receipt-area"
            className="w-full max-w-4xl bg-white p-6 shadow-md rounded border border-slate-300 min-h-[500px]"
          >
            <div className="mb-4 text-center border-b pb-2 no-print">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Official Student Identity & Barcode Cards · Session {settings.academicYear}
              </h3>
              <p className="text-[11px] text-slate-500">
                Printed on 300 GSM PVC card stock / Standard A4 perforated sheet
              </p>
            </div>

            {/* Grid of Student ID Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-5">
              {studentsToRender.map((student) => {
                const barcodeSvgString = generateBarcodeSvg(student.id, {
                  width: 170,
                  height: 48,
                  displayValue: true
                });

                return (
                  <div
                    key={student.id}
                    id={`student-card-${student.id}`}
                    className="w-full max-w-[370px] mx-auto bg-gradient-to-b from-slate-50 via-white to-blue-50/40 rounded-xl border-2 border-slate-900 shadow-sm overflow-hidden flex flex-col justify-between text-slate-900 text-xs page-break-inside-avoid"
                  >
                    {/* Header Banner */}
                    <div className="bg-slate-900 text-white p-2.5 flex items-center gap-2 border-b-2 border-amber-500">
                      <SchoolCrest size={34} customUrl={settings.logoUrl} />
                      <div className="leading-tight">
                        <div className="font-extrabold text-[11px] tracking-tight uppercase">
                          {settings.schoolName}
                        </div>
                        <div className="text-[9px] text-amber-300 font-medium">
                          Academic Session {settings.academicYear}
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-center gap-3">
                        {/* Student Avatar / Photo */}
                        <div className="w-16 h-20 bg-slate-100 border-2 border-slate-400 rounded-md overflow-hidden flex flex-col items-center justify-center shrink-0 shadow-inner">
                          {student.photoUrl || student.avatarUrl ? (
                            <img
                              src={student.photoUrl || student.avatarUrl}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              <span className="text-xl font-extrabold text-blue-900">
                                {student.name.charAt(0)}
                              </span>
                              <span className="text-[8px] text-slate-500 mt-1 uppercase font-semibold">
                                PHOTO
                              </span>
                            </>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="font-extrabold text-sm text-slate-950 truncate leading-snug">
                            {student.name}
                          </div>
                          {student.nameAssamese && (
                            <div className="text-[11px] font-assamese text-slate-700 truncate">
                              {student.nameAssamese}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-x-1 text-[11px] text-slate-600 pt-1">
                            <div>
                              <span className="font-semibold text-slate-800">Class: </span>
                              <span className="font-bold text-blue-900">
                                {student.classNum}-{student.section}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800">Roll: </span>
                              <span className="font-bold text-slate-950">{student.rollNo}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800">Adm No: </span>
                              <span className="font-mono text-[10px]">{student.admissionNo}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800">DOB: </span>
                              <span className="font-mono text-[10px]">{student.dob}</span>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-600 truncate pt-0.5">
                            <span className="font-semibold text-slate-800">Parent: </span>
                            {student.guardianName || student.fatherName}
                          </div>
                        </div>
                      </div>

                      {/* Barcode and QR Section */}
                      <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                        {/* Code 128 Barcode */}
                        <div className="flex-1 flex flex-col items-center">
                          <div
                            dangerouslySetInnerHTML={{ __html: barcodeSvgString }}
                            className="overflow-hidden"
                          />
                        </div>

                        {/* 2D QR Code */}
                        {qrCodeUrls[student.id] && (
                          <div className="shrink-0 flex flex-col items-center">
                            <img
                              src={qrCodeUrls[student.id]}
                              alt={`QR ${student.id}`}
                              className="w-12 h-12 rounded border border-slate-200"
                            />
                            <span className="text-[8px] font-mono text-slate-500 uppercase mt-0.5">
                              Scan QR
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="bg-slate-100 border-t border-slate-200 px-3 py-1.5 flex items-center justify-between text-[9px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <SchoolOfficialSeal size={22} customUrl={settings.sealUrl} />
                        <span>Emergency: 📞 {student.mobile}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <PrincipalSignature width={55} height={16} customUrl={settings.principalSignatureUrl} />
                        <span className="font-bold text-[8px] text-slate-700 uppercase">Head of School</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
