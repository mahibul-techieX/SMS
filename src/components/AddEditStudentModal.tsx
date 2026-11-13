import React, { useState, useRef } from 'react';
import { UserPlus, X, Save, Printer, PlusCircle, AlertCircle, Camera, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { Student, SchoolSettings, ALL_CLASSES } from '../types';
import { db } from '../services/db';
import { resizeImageFile } from '../utils/imageUpload';

interface AddEditStudentModalProps {
  studentToEdit?: Student;
  onClose: () => void;
  onSaved: (student: Student, shouldPrintID?: boolean, saveAndNew?: boolean) => void;
}

export const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({
  studentToEdit,
  onClose,
  onSaved
}) => {
  const settings: SchoolSettings = db.getSettings();
  const allStudents = db.getAllStudents();
  const nextRoll = allStudents.length + 1;
  const autoId = `SRA26-${String(nextRoll).padStart(3, '0')}`;
  const autoAdm = `ADM/2026/${String(40 + nextRoll).padStart(3, '0')}`;

  const [id, setId] = useState<string>(studentToEdit?.id || autoId);
  const [admissionNo, setAdmissionNo] = useState<string>(studentToEdit?.admissionNo || autoAdm);
  const [name, setName] = useState<string>(studentToEdit?.name || '');
  const [nameAssamese, setNameAssamese] = useState<string>(studentToEdit?.nameAssamese || '');
  const [gender, setGender] = useState<Student['gender']>(studentToEdit?.gender || 'Male');
  const [dob, setDob] = useState<string>(studentToEdit?.dob || '2016-01-01');
  const [classNum, setClassNum] = useState<number | string>(studentToEdit?.classNum || 'ANKUR');
  const [section, setSection] = useState<Student['section']>(studentToEdit?.section || 'A');
  const [rollNo, setRollNo] = useState<number>(studentToEdit?.rollNo || nextRoll);
  const [fatherName, setFatherName] = useState<string>(studentToEdit?.fatherName || '');
  const [motherName, setMotherName] = useState<string>(studentToEdit?.motherName || '');
  const [guardianName, setGuardianName] = useState<string>(studentToEdit?.guardianName || '');
  const [mobile, setMobile] = useState<string>(studentToEdit?.mobile || '');
  const [address, setAddress] = useState<string>(studentToEdit?.address || 'Guwahati, Assam');
  const [admissionDate, setAdmissionDate] = useState<string>(
    studentToEdit?.admissionDate || new Date().toISOString().slice(0, 10)
  );
  const [academicYear, setAcademicYear] = useState<string>(
    studentToEdit?.academicYear || settings.academicYear
  );
  const [concessionType, setConcessionType] = useState<string>(
    studentToEdit?.concessionType || 'None'
  );
  const [nextPaymentDueDate, setNextPaymentDueDate] = useState<string>(
    studentToEdit?.nextPaymentDueDate || ''
  );
  const [photoUrl, setPhotoUrl] = useState<string>(
    studentToEdit?.photoUrl || studentToEdit?.avatarUrl || ''
  );

  const [errorMsg, setErrorMsg] = useState<string>('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      setErrorMsg('');
      const base64 = await resizeImageFile(file, 240, 300, 0.88);
      setPhotoUrl(base64);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process student photo.');
    }
  };

  const validate = () => {
    if (!name.trim()) {
      setErrorMsg('Student full name is required.');
      return false;
    }
    if (!id.trim()) {
      setErrorMsg('Student ID is required.');
      return false;
    }
    if (!mobile.trim() || mobile.length < 10) {
      setErrorMsg('Valid 10-digit mobile number is required for WhatsApp notices.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleSave = (shouldPrintID = false, saveAndNew = false) => {
    if (!validate()) return;

    try {
      let savedStudent: Student;
      if (studentToEdit) {
        savedStudent = db.updateStudent(studentToEdit.id, {
          name,
          nameAssamese,
          gender,
          dob,
          classNum,
          section,
          rollNo,
          fatherName,
          motherName,
          guardianName: guardianName || fatherName,
          mobile,
          address,
          admissionDate,
          academicYear,
          photoUrl: photoUrl || undefined,
          avatarUrl: photoUrl || undefined,
          concessionType: concessionType === 'None' ? undefined : concessionType,
          nextPaymentDueDate: nextPaymentDueDate || undefined
        });
      } else {
        savedStudent = db.addStudent({
          id,
          admissionNo,
          name,
          nameAssamese,
          gender,
          dob,
          classNum,
          section,
          rollNo,
          fatherName,
          motherName,
          guardianName: guardianName || fatherName,
          mobile,
          address,
          admissionDate,
          academicYear,
          status: 'Active',
          photoUrl: photoUrl || undefined,
          avatarUrl: photoUrl || undefined,
          concessionType: concessionType === 'None' ? undefined : concessionType,
          nextPaymentDueDate: nextPaymentDueDate || undefined
        });
      }

      onSaved(savedStudent, shouldPrintID, saveAndNew);

      if (saveAndNew) {
        // Reset form for next entry
        const updatedTotal = db.getAllStudents().length + 1;
        setId(`SRA26-${String(updatedTotal).padStart(3, '0')}`);
        setAdmissionNo(`ADM/2026/${String(40 + updatedTotal).padStart(3, '0')}`);
        setName('');
        setNameAssamese('');
        setRollNo(updatedTotal);
        setMobile('');
        setPhotoUrl('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save student.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[95vh] overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {studentToEdit ? 'Edit Student Profile' : 'Student Registration & Fee Setup'}
              </h2>
              <p className="text-xs text-slate-400">
                Automatic ledger initialization and Code 128 barcode assignment
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Academic & ID */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200 flex items-center justify-between">
              <span>1. Basic Identity & Enrollment Details</span>
              <span className="text-blue-700 font-mono">Academic Session {academicYear}</span>
            </h3>

            {/* Student Photo Upload Card for ID Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap sm:flex-nowrap items-center gap-4">
              <div className="w-20 h-24 bg-white rounded-lg border-2 border-slate-300 flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-inner relative group">
                {photoUrl ? (
                  <img src={photoUrl} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <Camera className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                    <span className="text-[9px] uppercase font-bold tracking-wider">No Photo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                    Student Photograph (ID Card Photo)
                  </span>
                  <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
                    Printed on ID Card
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Upload official student portrait for digital Student ID Card & offline fee ledger records (JPG, PNG).
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{photoUrl ? 'Change Photo' : 'Upload Student Photo'}</span>
                  </button>

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 text-slate-600 hover:text-red-600 rounded text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold mb-1">Student ID (Barcode Value) *</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value.toUpperCase())}
                  disabled={!!studentToEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold text-blue-900 focus:outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Admission Number *</label>
                <input
                  type="text"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Class (ANKUR, MUKUL, 1 to 10) *</label>
                <select
                  value={classNum}
                  onChange={(e) => setClassNum(isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-bold bg-white"
                >
                  {ALL_CLASSES.map((c) => (
                    <option key={String(c)} value={c}>
                      {typeof c === 'string' ? `Class ${c}` : `Class ${c}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Section *</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-bold bg-white"
                  >
                    <option value="A">Sec A</option>
                    <option value="B">Sec B</option>
                    <option value="C">Sec C</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Roll No *</label>
                  <input
                    type="number"
                    value={rollNo}
                    onChange={(e) => setRollNo(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-bold font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Full Name (English) *</label>
                <input
                  type="text"
                  placeholder="e.g. Anurag Saikia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Name in Assamese (অসমীয়া নাম)
                </label>
                <input
                  type="text"
                  placeholder="e.g. অনুৰাগ শইকীয়া"
                  value={nameAssamese}
                  onChange={(e) => setNameAssamese(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-assamese"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Admission Date</label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Guardian & Contact */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
              2. Parents & Communication (WhatsApp Alerts)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Father's Name</label>
                <input
                  type="text"
                  placeholder="e.g. Diganta Saikia"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Mother's Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rupali Saikia"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Mobile (WhatsApp) *</label>
                <input
                  type="text"
                  placeholder="10-digit mobile, e.g. 9864011223"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Residential Address</label>
              <input
                type="text"
                placeholder="House No, Road, Locality, Guwahati"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Section 3: Fee Scheme & Concession */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
              3. Fee Ledger Configuration & Concession
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-200">
              <div>
                <label className="block font-semibold mb-1 text-slate-800">
                  Approved Concession / Scholarship
                </label>
                <select
                  value={concessionType}
                  onChange={(e) => setConcessionType(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="None">None (Standard Fee Structure)</option>
                  <option value="Sibling Discount">Sibling Discount (10% on Tuition)</option>
                  <option value="Staff Child">Staff Child (25% on Tuition)</option>
                  <option value="Merit Scholarship">Merit Scholarship (50% on Tuition)</option>
                  <option value="Management Concession">Management Discretionary Concession</option>
                </select>
              </div>

              <div className="text-[11px] text-slate-600 flex flex-col justify-center">
                <span className="font-semibold text-slate-800">Class {classNum} Baseline Fees:</span>
                <span>• Admission Fee: Auto-assigned in Ledger</span>
                <span>• Monthly Tuition: Auto-scheduled April to March</span>
                <span>• Books & Examination Fees: Auto-billed</span>
              </div>
            </div>

            <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
              <div>
                <label className="block font-bold text-amber-950 text-xs mb-0.5">
                  Next Scheduled Fee Due Date
                </label>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Deadlines within 7 days are automatically highlighted on the Accounts Desk notification widget.
                </p>
              </div>
              <input
                type="date"
                value={nextPaymentDueDate}
                onChange={(e) => setNextPaymentDueDate(e.target.value)}
                className="bg-white border border-amber-300 rounded px-3 py-1.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-amber-500 shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!studentToEdit && (
              <button
                type="button"
                onClick={() => handleSave(false, true)}
                className="px-3.5 py-2 rounded-lg border border-blue-600 text-blue-700 hover:bg-blue-50 text-xs font-semibold flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>SAVE & NEW</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSave(true, false)}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>SAVE & PRINT ID CARD</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false, false)}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{studentToEdit ? 'UPDATE STUDENT' : 'SAVE STUDENT'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
