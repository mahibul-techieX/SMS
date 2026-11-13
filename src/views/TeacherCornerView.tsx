import React, { useState, useMemo, useRef } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Printer,
  Share2,
  Save,
  Check,
  X,
  UserCheck,
  UserX,
  FileText,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  PhoneCall,
  MessageSquare,
  Upload,
  Download,
  Table,
  UserPlus,
  Settings2,
  User,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { db } from '../services/db';
import {
  Student,
  ExamResultSheet,
  StudentMarkEntry,
  HomeworkAssignment,
  DailyAttendanceRecord,
  ClassSubject,
  ClassTeacherProfile,
  SchoolClass,
  ALL_CLASSES,
  formatClassDisplay,
  EXAM_TERMS_LIST,
  getExamTermInfo,
  resolveSubjectTermMarks
} from '../types';

export const TeacherCornerView: React.FC = () => {
  // Navigation tabs in Results Corner
  const [activeTab, setActiveTab] = useState<
    'allMarks' | 'students' | 'subjects' | 'homework' | 'attendance' | 'reportCards' | 'profile'
  >('allMarks');

  const [selectedClass, setSelectedClass] = useState<SchoolClass>(5);
  const [selectedSection, setSelectedSection] = useState<'A' | 'B' | 'C'>('A');

  // School settings for branding
  const settings = db.getSettings();

  // Active students in selected class and section
  const [studentsVersion, setStudentsVersion] = useState(0);
  const allStudents = useMemo(() => db.getAllStudents(), [studentsVersion]);

  const classStudents = useMemo(() => {
    return allStudents
      .filter(
        (s) =>
          String(s.classNum) === String(selectedClass) &&
          s.section.toUpperCase() === selectedSection.toUpperCase() &&
          s.status === 'Active'
      )
      .sort((a, b) => a.rollNo - b.rollNo);
  }, [allStudents, selectedClass, selectedSection]);

  // Notice banner helper
  const [toastNotice, setToastNotice] = useState<string>('');
  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(''), 3500);
  };

  // =========================================================
  // 1. CLASS SUBJECTS MASTER
  // =========================================================
  const [subjectsVersion, setSubjectsVersion] = useState(0);
  const classSubjects = useMemo(() => {
    return db.getClassSubjects(selectedClass);
  }, [selectedClass, subjectsVersion]);

  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<ClassSubject | null>(null);
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subMaxMarks, setSubMaxMarks] = useState<number>(100);
  const [subPassMarks, setSubPassMarks] = useState<number>(35);
  const [subIsOptional, setSubIsOptional] = useState<boolean>(false);

  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubName('');
    setSubCode('');
    setSubMaxMarks(100);
    setSubPassMarks(35);
    setSubIsOptional(false);
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (subj: ClassSubject) => {
    setEditingSubject(subj);
    setSubName(subj.name);
    setSubCode(subj.code);
    setSubMaxMarks(subj.maxMarks);
    setSubPassMarks(subj.passMarks);
    setSubIsOptional(Boolean(subj.isOptional));
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subCode.trim()) return;

    const newSub: ClassSubject = {
      id: editingSubject?.id || `SUB-C${selectedClass}-${Date.now().toString().slice(-4)}`,
      classNum: selectedClass,
      name: subName.trim(),
      code: subCode.trim().toUpperCase(),
      maxMarks: subMaxMarks,
      passMarks: subPassMarks,
      isOptional: subIsOptional
    };

    db.saveClassSubject(newSub);
    setSubjectsVersion((v) => v + 1);
    setMarksVersion((v) => v + 1);
    setShowSubjectModal(false);
    showToast(`Subject "${newSub.name}" (${newSub.code}) saved successfully!`);
  };

  // Safe In-App Delete Subject Modal State
  const [subjectToDelete, setSubjectToDelete] = useState<ClassSubject | null>(null);

  const handleConfirmDeleteSubject = (subj: ClassSubject) => {
    setSubjectToDelete(subj);
  };

  const handleExecuteDeleteSubject = () => {
    if (!subjectToDelete) return;
    const deletedName = subjectToDelete.name;
    const deletedId = subjectToDelete.id;

    db.deleteClassSubject(deletedId);

    // Clean up local liveMarksGrid for that subject
    setLiveMarksGrid((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((stId) => {
        if (next[stId] && next[stId][deletedName]) {
          const studentScores = { ...next[stId] };
          delete studentScores[deletedName];
          next[stId] = studentScores;
        }
      });
      return next;
    });

    setSubjectsVersion((v) => v + 1);
    setMarksVersion((v) => v + 1);
    setSubjectToDelete(null);
    showToast(`Subject "${deletedName}" deleted. Class now has ${Math.max(0, classSubjects.length - 1)} subjects.`);
  };

  const handleApplySubjectPreset = (preset: '5_subjects' | '6_subjects' | '4_subjects' | '7_subjects') => {
    const updated = db.applySubjectPreset(selectedClass, preset);
    setSubjectsVersion((v) => v + 1);
    setMarksVersion((v) => v + 1);
    const countName = preset === '5_subjects' ? '5 Core Subjects' : preset === '6_subjects' ? '6 Subjects (+Computer)' : preset === '4_subjects' ? '4 Primary Subjects' : '7 Subjects';
    showToast(`Class ${formatClassDisplay(selectedClass)} set to ${countName} (${updated.length} subjects)!`);
  };

  // Quick subject template presets for Add/Edit Modal
  const COMMON_SUBJECT_TEMPLATES = [
    { name: 'Mathematics', code: 'MATH', max: 100, pass: 35 },
    { name: 'English', code: 'ENG', max: 100, pass: 35 },
    { name: 'General Science', code: 'SCI', max: 100, pass: 35 },
    { name: 'Social Science', code: 'SST', max: 100, pass: 35 },
    { name: 'MIL / Assamese / Hindi', code: 'MIL', max: 100, pass: 35 },
    { name: 'Computer Studies', code: 'COMP', max: 100, pass: 35 },
    { name: 'Environmental Studies', code: 'EVS', max: 100, pass: 35 },
    { name: 'General Knowledge', code: 'GK', max: 50, pass: 18 },
    { name: 'Hindi Second Language', code: 'HIN', max: 100, pass: 35 },
    { name: 'Physical Education', code: 'PE', max: 50, pass: 18 }
  ];

  const handleSelectSubjectTemplate = (tmpl: { name: string; code: string; max: number; pass: number }) => {
    setSubName(tmpl.name);
    setSubCode(tmpl.code);
    setSubMaxMarks(tmpl.max);
    setSubPassMarks(tmpl.pass);
  };

  // =========================================================
  // 2. CONSOLIDATED MULTI-SUBJECT ALL-MARKS & CSV UPLOAD
  // =========================================================
  const EXAM_TERMS = EXAM_TERMS_LIST;
  const [selectedTerm, setSelectedTerm] = useState<string>('Half-Yearly Examination');
  const selectedTermInfo = useMemo(() => getExamTermInfo(selectedTerm), [selectedTerm]);
  const [viewingReportCardStudent, setViewingReportCardStudent] = useState<any | null>(null);

  // Load all exam sheets for this class, section, and term across subjects
  const [marksVersion, setMarksVersion] = useState(0);

  // We maintain a consolidated map of marks:
  // studentId -> { [subjectName]: { marks: number | null, isAbsent: boolean } }
  const consolidatedMarks = useMemo(() => {
    const map: Record<string, Record<string, { marks: number | null; isAbsent: boolean; remarks?: string }>> = {};

    classStudents.forEach((student) => {
      map[student.id] = {};
    });

    classSubjects.forEach((sub) => {
      const sheets = db.getExamResults(selectedClass, selectedTerm, sub.name);
      const sheet = sheets.find((s) => s.section === selectedSection);
      if (sheet) {
        sheet.entries.forEach((entry) => {
          if (!map[entry.studentId]) map[entry.studentId] = {};
          map[entry.studentId][sub.name] = {
            marks: entry.marksObtained,
            isAbsent: entry.isAbsent,
            remarks: entry.remarks
          };
        });
      }
    });

    return map;
  }, [classStudents, classSubjects, selectedClass, selectedSection, selectedTerm, marksVersion]);

  // Local state for live marks grid editing
  const [liveMarksGrid, setLiveMarksGrid] = useState<
    Record<string, Record<string, { marks: number | null; isAbsent: boolean; remarks?: string }>>
  >({});

  // Keep liveMarksGrid in sync when dependencies change
  React.useEffect(() => {
    setLiveMarksGrid(consolidatedMarks);
  }, [consolidatedMarks]);

  const handleCellMarkChange = (studentId: string, subjectName: string, val: string, maxMarks: number) => {
    const num = val === '' ? null : Math.min(maxMarks, Math.max(0, Number(val)));
    setLiveMarksGrid((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectName]: {
          marks: num,
          isAbsent: false,
          remarks: prev[studentId]?.[subjectName]?.remarks || ''
        }
      }
    }));
  };

  const handleCellToggleAbsent = (studentId: string, subjectName: string) => {
    setLiveMarksGrid((prev) => {
      const current = prev[studentId]?.[subjectName];
      const willBeAbsent = !current?.isAbsent;
      return {
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [subjectName]: {
            marks: willBeAbsent ? null : 0,
            isAbsent: willBeAbsent,
            remarks: willBeAbsent ? 'Absent' : ''
          }
        }
      };
    });
  };

  const handleSaveAllMarks = (publish = false) => {
    classSubjects.forEach((sub) => {
      const termMarks = resolveSubjectTermMarks(sub, selectedTerm);
      const existingSheets = db.getExamResults(selectedClass, selectedTerm, sub.name);
      const existingSheet = existingSheets.find((s) => s.section === selectedSection);

      const entries: StudentMarkEntry[] = classStudents.map((st) => {
        const cell = liveMarksGrid[st.id]?.[sub.name];
        const marksObtained = cell?.isAbsent ? null : cell?.marks ?? null;
        const isAbsent = Boolean(cell?.isAbsent);

        let grade = '-';
        if (!isAbsent && marksObtained !== null) {
          const pct = (marksObtained / termMarks.maxMarks) * 100;
          if (pct >= 90) grade = 'A+';
          else if (pct >= 80) grade = 'A';
          else if (pct >= 70) grade = 'B';
          else if (pct >= 60) grade = 'C';
          else if (pct >= 40) grade = 'D';
          else grade = 'F';
        }

        return {
          studentId: st.id,
          studentName: st.name,
          rollNo: st.rollNo,
          marksObtained,
          isAbsent,
          grade,
          remarks: cell?.remarks || (grade === 'A+' ? 'Excellent' : grade === 'F' ? 'Needs Help' : '')
        };
      });

      const updatedSheet: ExamResultSheet = {
        id: existingSheet?.id || `RES-C${selectedClass}-${sub.code}-${selectedTerm.replace(/\s+/g, '')}-${selectedSection}`,
        academicYear: settings.academicYear || '2026-27',
        classNum: selectedClass,
        section: selectedSection,
        examTerm: selectedTerm,
        subject: sub.name,
        maxMarks: termMarks.maxMarks,
        passMarks: termMarks.passMarks,
        isPublished: publish ? true : existingSheet?.isPublished || false,
        publishedDate: publish ? new Date().toISOString().split('T')[0] : existingSheet?.publishedDate,
        teacherName: teacherProfile.name,
        entries
      };

      db.saveExamResultSheet(updatedSheet);
    });

    setMarksVersion((v) => v + 1);
    showToast(
      publish
        ? `All ${selectedTerm} marks (${selectedTermInfo.standardMaxMarks}M standard) PUBLISHED live to parents!`
        : `All ${selectedTerm} marks (${selectedTermInfo.standardMaxMarks}M standard) saved offline.`
    );
  };

  // CSV Import / Export functionality
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadCsvTemplate = () => {
    const headers = [
      'Roll No',
      'Student ID',
      'Student Name',
      'Admission No',
      ...classSubjects.map((s) => {
        const tm = resolveSubjectTermMarks(s, selectedTerm);
        return `${s.name} (Max ${tm.maxMarks})`;
      })
    ];
    const rows = classStudents.map((s) => {
      const marksCells = classSubjects.map((sub) => {
        const cell = liveMarksGrid[s.id]?.[sub.name];
        return cell?.isAbsent ? 'AB' : cell?.marks ?? '';
      });
      return [s.rollNo, s.id, `"${s.name}"`, s.admissionNo, ...marksCells].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Class_${selectedClass}_${selectedSection}_${selectedTerm.replace(/\s+/g, '_')}_Marks_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`CSV template downloaded for ${selectedTerm}.`);
  };

  const handleUploadCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
        if (lines.length < 2) {
          alert('Invalid CSV file: empty or header only.');
          return;
        }

        const headerCols = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const subjectIndices: { subjectName: string; colIdx: number; maxMarks: number }[] = [];

        classSubjects.forEach((sub) => {
          const tm = resolveSubjectTermMarks(sub, selectedTerm);
          const colIdx = headerCols.findIndex(
            (h) => h.toLowerCase().includes(sub.name.toLowerCase()) || h.toLowerCase().includes(sub.code.toLowerCase())
          );
          if (colIdx !== -1) {
            subjectIndices.push({ subjectName: sub.name, colIdx, maxMarks: tm.maxMarks });
          }
        });

        if (subjectIndices.length === 0) {
          alert('Could not match any subject columns. Ensure headers match the template.');
          return;
        }

        let updatedCount = 0;
        setLiveMarksGrid((prev) => {
          const next = { ...prev };

          for (let i = 1; i < lines.length; i++) {
            // Regex handles quoted strings with commas
            const parts = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((p) => p.trim().replace(/^"|"$/g, ''));
            const rollNo = Number(parts[0]);
            const studentId = parts[1];
            const admissionNo = parts[3];

            // Match student
            const matchedStudent = classStudents.find(
              (s) => s.id === studentId || s.admissionNo === admissionNo || s.rollNo === rollNo
            );

            if (matchedStudent) {
              if (!next[matchedStudent.id]) next[matchedStudent.id] = {};

              subjectIndices.forEach(({ subjectName, colIdx, maxMarks }) => {
                const valRaw = parts[colIdx]?.trim();
                if (valRaw === undefined || valRaw === '') return;

                if (valRaw.toUpperCase() === 'AB' || valRaw.toUpperCase() === 'ABSENT') {
                  next[matchedStudent.id][subjectName] = { marks: null, isAbsent: true, remarks: 'Absent in CSV' };
                } else {
                  const num = Math.min(maxMarks, Math.max(0, Number(valRaw)));
                  if (!isNaN(num)) {
                    next[matchedStudent.id][subjectName] = { marks: num, isAbsent: false };
                  }
                }
              });
              updatedCount++;
            }
          }
          return next;
        });

        showToast(`Successfully uploaded & mapped marks for ${updatedCount} students (${selectedTerm})!`);
      } catch (err: any) {
        alert('Failed to parse CSV file: ' + err.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Student marks statistics across all subjects (Calibrated dynamically for Unit Test 50M vs Major Exam 100M)
  const studentTotals = useMemo(() => {
    return classStudents.map((st) => {
      let total = 0;
      let maxTotal = 0;
      let anyAbsent = false;

      classSubjects.forEach((sub) => {
        const tm = resolveSubjectTermMarks(sub, selectedTerm);
        const cell = liveMarksGrid[st.id]?.[sub.name];
        maxTotal += tm.maxMarks;
        if (cell?.isAbsent) {
          anyAbsent = true;
        } else if (cell?.marks !== null && cell?.marks !== undefined) {
          total += cell.marks;
        }
      });

      const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
      let grade = 'F';
      if (pct >= 90) grade = 'A+';
      else if (pct >= 80) grade = 'A';
      else if (pct >= 70) grade = 'B';
      else if (pct >= 60) grade = 'C';
      else if (pct >= 40) grade = 'D';

      return {
        student: st,
        total,
        maxTotal,
        percentage: pct,
        grade,
        anyAbsent
      };
    }).sort((a, b) => b.total - a.total);
  }, [classStudents, classSubjects, liveMarksGrid, selectedTerm]);

  // =========================================================
  // 3. ADD / EDIT STUDENT MODAL & LOGIC
  // =========================================================
  const [showStudentModal, setShowStudentModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [stName, setStName] = useState('');
  const [stNameAssamese, setStNameAssamese] = useState('');
  const [stRollNo, setStRollNo] = useState<number>(1);
  const [stAdmNo, setStAdmNo] = useState('');
  const [stGender, setStGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [stDob, setStDob] = useState('2015-05-15');
  const [stFather, setStFather] = useState('');
  const [stMother, setStMother] = useState('');
  const [stMobile, setStMobile] = useState('');
  const [stAddress, setStAddress] = useState('');

  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    const nextRoll = classStudents.length > 0 ? Math.max(...classStudents.map((s) => s.rollNo)) + 1 : 1;
    const nextAdm = `PAHS/2026/${String(allStudents.length + 1).padStart(3, '0')}`;
    setStName('');
    setStNameAssamese('');
    setStRollNo(nextRoll);
    setStAdmNo(nextAdm);
    setStGender('Male');
    setStDob('2015-05-15');
    setStFather('');
    setStMother('');
    setStMobile('');
    setStAddress('Guwahati, Assam');
    setShowStudentModal(true);
  };

  const handleOpenEditStudent = (s: Student) => {
    setEditingStudent(s);
    setStName(s.name);
    setStNameAssamese(s.nameAssamese || '');
    setStRollNo(s.rollNo);
    setStAdmNo(s.admissionNo);
    setStGender(s.gender);
    setStDob(s.dob);
    setStFather(s.fatherName);
    setStMother(s.motherName);
    setStMobile(s.mobile);
    setStAddress(s.address);
    setShowStudentModal(true);
  };

  const handleSaveStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stName.trim() || !stAdmNo.trim()) return;

    if (editingStudent) {
      db.updateStudent(editingStudent.id, {
        name: stName.trim(),
        nameAssamese: stNameAssamese.trim() || undefined,
        rollNo: stRollNo,
        admissionNo: stAdmNo.trim(),
        gender: stGender,
        dob: stDob,
        fatherName: stFather.trim(),
        motherName: stMother.trim(),
        guardianName: stFather.trim() || stMother.trim(),
        mobile: stMobile.trim(),
        address: stAddress.trim()
      });
      showToast(`Student ${stName} updated successfully.`);
    } else {
      db.addStudent({
        admissionNo: stAdmNo.trim(),
        rollNo: stRollNo,
        name: stName.trim(),
        nameAssamese: stNameAssamese.trim() || undefined,
        gender: stGender,
        dob: stDob,
        classNum: selectedClass,
        section: selectedSection,
        fatherName: stFather.trim(),
        motherName: stMother.trim(),
        guardianName: stFather.trim() || stMother.trim(),
        mobile: stMobile.trim(),
        address: stAddress.trim(),
        admissionDate: new Date().toISOString().split('T')[0],
        academicYear: settings.academicYear || '2026-27',
        status: 'Active'
      });
      showToast(`New student ${stName} enrolled in Class ${selectedClass}-${selectedSection}.`);
    }

    setShowStudentModal(false);
    setStudentsVersion((v) => v + 1);
  };

  // =========================================================
  // 4. CLASS TEACHER OWN PROFILE STATE & EDIT
  // =========================================================
  const [profileVersion, setProfileVersion] = useState(0);
  const teacherProfile = useMemo(() => {
    return db.getClassTeacherProfile(selectedClass, selectedSection);
  }, [selectedClass, selectedSection, profileVersion]);

  const [tName, setTName] = useState(teacherProfile.name);
  const [tDesig, setTDesig] = useState(teacherProfile.designation);
  const [tCode, setTCode] = useState(teacherProfile.employeeCode);
  const [tQual, setTQual] = useState(teacherProfile.qualification);
  const [tSpec, setTSpec] = useState(teacherProfile.specialization);
  const [tPhone, setTPhone] = useState(teacherProfile.mobile);
  const [tEmail, setTEmail] = useState(teacherProfile.email);
  const [tRoom, setTRoom] = useState(teacherProfile.roomNumber || '');
  const [tBio, setTBio] = useState(teacherProfile.bio || '');

  // Re-sync local state when selectedClass/section changes
  React.useEffect(() => {
    setTName(teacherProfile.name);
    setTDesig(teacherProfile.designation);
    setTCode(teacherProfile.employeeCode);
    setTQual(teacherProfile.qualification);
    setTSpec(teacherProfile.specialization);
    setTPhone(teacherProfile.mobile);
    setTEmail(teacherProfile.email);
    setTRoom(teacherProfile.roomNumber || '');
    setTBio(teacherProfile.bio || '');
  }, [teacherProfile]);

  const handleSaveTeacherProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ClassTeacherProfile = {
      ...teacherProfile,
      name: tName.trim(),
      designation: tDesig.trim(),
      employeeCode: tCode.trim(),
      qualification: tQual.trim(),
      specialization: tSpec.trim(),
      mobile: tPhone.trim(),
      email: tEmail.trim(),
      roomNumber: tRoom.trim() || undefined,
      bio: tBio.trim() || undefined
    };

    db.saveClassTeacherProfile(updated);
    setProfileVersion((v) => v + 1);
    showToast('Class Teacher Profile updated successfully!');
  };

  // =========================================================
  // 5. HOMEWORK & ATTENDANCE STATE (Reused & Enhanced)
  // =========================================================
  const [homeworkList, setHomeworkList] = useState<HomeworkAssignment[]>(() =>
    db.getHomeworkList(selectedClass, selectedSection)
  );
  const [showAddHwModal, setShowAddHwModal] = useState(false);
  const [newHwTitle, setNewHwTitle] = useState('');
  const [newHwSubject, setNewHwSubject] = useState(classSubjects[0]?.name || 'Mathematics');
  const [newHwDueDate, setNewHwDueDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [newHwDesc, setNewHwDesc] = useState('');
  const [newHwNote, setNewHwNote] = useState('');

  const refreshHomework = () => {
    setHomeworkList(db.getHomeworkList(selectedClass, selectedSection));
  };

  const handleCreateHomeworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle.trim() || !newHwDesc.trim()) return;

    db.addHomework({
      title: newHwTitle.trim(),
      classNum: selectedClass,
      section: selectedSection,
      subject: newHwSubject,
      dueDate: newHwDueDate,
      description: newHwDesc.trim(),
      attachmentNote: newHwNote.trim() || undefined,
      teacherName: teacherProfile.name,
      status: 'Published'
    });

    setShowAddHwModal(false);
    setNewHwTitle('');
    setNewHwDesc('');
    setNewHwNote('');
    refreshHomework();
    showToast('Homework announcement published to parents!');
  };

  // Daily attendance state
  const [attendanceDate, setAttendanceDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendanceRecord[]>(() =>
    db.getAttendanceForDate(new Date().toISOString().split('T')[0], selectedClass, selectedSection)
  );

  const handleAttendanceChangeContext = (d: string, c: SchoolClass, s: 'A' | 'B' | 'C') => {
    setAttendanceDate(d);
    setSelectedClass(c);
    setSelectedSection(s);
    setAttendanceRecords(db.getAttendanceForDate(d, c, s));
  };

  const handleUpdateStudentAttendance = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => (rec.studentId === studentId ? { ...rec, status } : rec))
    );
  };

  const handleMarkAllPresent = () => {
    setAttendanceRecords((prev) => prev.map((rec) => ({ ...rec, status: 'Present' })));
  };

  const handleSaveAttendance = () => {
    db.saveAttendanceRecords(attendanceRecords);
    showToast('Attendance register successfully saved for today!');
  };

  const absentStudentsList = useMemo(() => {
    const absentMap = new Map(
      attendanceRecords.filter((a) => a.status === 'Absent').map((a) => [a.studentId, a])
    );
    return classStudents.filter((s) => absentMap.has(s.id)).map((s) => ({
      student: s,
      attendanceRecord: absentMap.get(s.id)!
    }));
  }, [attendanceRecords, classStudents]);

  const handleSendAbsentNotification = (student: Student, record: DailyAttendanceRecord) => {
    db.markAttendanceNotified(record.id);
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === record.id ? { ...r, parentNotified: true } : r))
    );
    const phone = student.mobile.replace(/[^0-9]/g, '');
    const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const text = `*ABSENT NOTIFICATION*\n*School:* ${settings.schoolName}\n\nDear Parent/Guardian,\nThis is to notify you that your child *${student.name}* (Roll No: ${student.rollNo}) of *Class ${formatClassDisplay(student.classNum)} - ${student.section}* is marked *ABSENT* today (*${attendanceDate}*).\n\nTeacher In-Charge: ${teacherProfile.name}\nSchool Phone: ${settings.phone}`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 bg-slate-100/70 space-y-4">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* 1. TOP TEACHER COCKPIT & CLASS IDENTIFICATION */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 text-white flex items-center justify-center shadow-md shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Results Corner
              </h1>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                {teacherProfile.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Subject-wise marks spreadsheet & CSV upload, student roster, subject master, daily homework, attendance alerts & profile
            </p>
          </div>
        </div>

        {/* Class Context Selector & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Class:</span>
            <select
              value={String(selectedClass)}
              onChange={(e) => {
                const val = e.target.value === 'ANKUR' || e.target.value === 'MUKUL' ? e.target.value : Number(e.target.value);
                setSelectedClass(val as SchoolClass);
                handleAttendanceChangeContext(attendanceDate, val as SchoolClass, selectedSection);
              }}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
            >
              {ALL_CLASSES.map((c) => (
                <option key={String(c)} value={String(c)}>
                  {formatClassDisplay(c)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sec:</span>
            <select
              value={selectedSection}
              onChange={(e) => {
                const s = e.target.value as 'A' | 'B' | 'C';
                setSelectedSection(s);
                handleAttendanceChangeContext(attendanceDate, selectedClass, s);
              }}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
            >
              <option value="A">Sec A</option>
              <option value="B">Sec B</option>
              <option value="C">Sec C</option>
            </select>
          </div>

          <div className="border-l border-slate-200 pl-2 text-xs font-mono font-bold text-slate-700">
            {classStudents.length} Students · {classSubjects.length} Subjects
          </div>

          <button
            type="button"
            onClick={handleOpenAddStudent}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors ml-1 shadow-2xs"
            title="Enroll New Student to this Class"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Student</span>
          </button>
        </div>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('allMarks')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'allMarks'
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Upload & Enter All Subject Marks</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Class Students Roster</span>
          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
            {classStudents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'subjects'
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage Class Subjects</span>
          <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full font-bold">
            {classSubjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('homework')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'homework'
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Homework Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Attendance & Absent Alerts</span>
          {absentStudentsList.length > 0 && (
            <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">
              {absentStudentsList.length} Absent
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reportCards')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
            activeTab === 'reportCards'
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Report Cards & Merit List</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ml-auto ${
            activeTab === 'profile'
              ? 'bg-purple-700 text-white shadow-xs font-bold'
              : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>My Teacher Profile</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ALL-SUBJECTS MARKS SPREADSHEET & CSV UPLOAD        */}
      {/* ========================================================= */}
      {activeTab === 'allMarks' && (
        <div className="space-y-4">
          {/* Assessment & Bulk Actions Control Deck */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Examination Term & Marks Scale
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    {EXAM_TERMS.map((term) => {
                      const info = getExamTermInfo(term);
                      return (
                        <option key={term} value={term}>
                          {term} ({info.standardMaxMarks} Marks Exam)
                        </option>
                      );
                    })}
                  </select>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${selectedTermInfo.badgeBg} ${selectedTermInfo.badgeText} ${selectedTermInfo.badgeBorder} flex items-center gap-1`}
                  >
                    <span>{selectedTermInfo.standardMaxMarks} Marks Max</span>
                  </span>
                </div>
              </div>

              {/* Quick Term Switcher Buttons */}
              <div className="pt-4 flex items-center gap-1.5 flex-wrap">
                {EXAM_TERMS.map((term) => {
                  const info = getExamTermInfo(term);
                  const isSelected = selectedTerm === term;
                  return (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSelectedTerm(term)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all border ${
                        isSelected
                          ? info.isUnitTest
                            ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                            : 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title={`Switch to ${term} (${info.standardMaxMarks} Marks scale)`}
                    >
                      {info.isUnitTest ? '⚡ ' : '🏆 '}
                      {term.replace(' Examination', '').replace(' Final Examination', ' Final')}
                      <span className="ml-1 opacity-75 font-mono text-[10px]">({info.standardMaxMarks}M)</span>
                    </button>
                  );
                })}
              </div>

              {/* Template & Upload Controls */}
              <div className="pt-4 flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  className="hidden"
                  onChange={handleUploadCsv}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                  title={`Upload completed CSV spreadsheet with ${selectedTermInfo.standardMaxMarks}-mark maximums`}
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Upload CSV Marks</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCsvTemplate}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                  title={`Download clean CSV template with ${selectedTermInfo.standardMaxMarks} marks subject headers`}
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download CSV Template ({selectedTermInfo.standardMaxMarks}M)</span>
                </button>
              </div>
            </div>

            {/* Commit & Publish Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveAllMarks(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save {selectedTermInfo.standardMaxMarks}M Marks Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveAllMarks(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish to Parent App</span>
              </button>
            </div>
          </div>

          {/* Dynamic Exam Weightage Notification Banner (50 Marks Unit Test vs 100 Marks Half Yearly / Annual) */}
          {selectedTermInfo.isUnitTest ? (
            <div className="bg-linear-to-r from-amber-50/90 via-orange-50/50 to-amber-50/80 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex flex-col items-center justify-center font-black text-xs shadow-2xs shrink-0">
                  <span>50</span>
                  <span className="text-[8px] font-sans -mt-1 uppercase">Max</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-950">
                      ⚡ Unit Test Exam Mode Active — 50 Marks Standard
                    </span>
                    <span className="px-2 py-0.2 rounded-full font-bold text-[10px] bg-amber-200 text-amber-900 border border-amber-300">
                      {selectedTerm}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 mt-0.5">
                    All subject marks evaluate out of <strong>50 marks</strong> max (Pass threshold: <strong>18</strong> marks). Total class aggregate: <strong>{classSubjects.reduce((acc, s) => acc + resolveSubjectTermMarks(s, selectedTerm).maxMarks, 0)} marks</strong>. Mark cells prevent input &gt; 50.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded bg-white border border-amber-200 text-amber-900 font-bold shadow-2xs">
                  Pass Mark: 18 / 50 (36%)
                </span>
                <span className="text-amber-800 font-sans font-semibold">
                  CBSE/SEBA Unit Standard
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-linear-to-r from-indigo-50/90 via-blue-50/50 to-indigo-50/80 border border-indigo-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex flex-col items-center justify-center font-black text-xs shadow-2xs shrink-0">
                  <span>100</span>
                  <span className="text-[8px] font-sans -mt-1 uppercase">Max</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-950">
                      🏆 Major Examination Mode Active — 100 Marks Standard
                    </span>
                    <span className="px-2 py-0.2 rounded-full font-bold text-[10px] bg-indigo-200 text-indigo-900 border border-indigo-300">
                      {selectedTerm}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-900/80 mt-0.5">
                    Half-Yearly and Annual examinations evaluate out of <strong>100 marks</strong> max (Pass threshold: <strong>35</strong> marks). Total class aggregate: <strong>{classSubjects.reduce((acc, s) => acc + resolveSubjectTermMarks(s, selectedTerm).maxMarks, 0)} marks</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded bg-white border border-indigo-200 text-indigo-900 font-bold shadow-2xs">
                  Pass Mark: 35 / 100 (35%)
                </span>
                <span className="text-indigo-800 font-sans font-semibold">
                  Board Examination Standard
                </span>
              </div>
            </div>
          )}

          {/* Curriculum Quick Bar for 5 vs 6 Subjects */}
          <div className="bg-linear-to-r from-indigo-50/90 via-slate-50 to-purple-50/70 border border-indigo-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Class {formatClassDisplay(selectedClass)} Curriculum:</span>
              </span>
              <span className="px-2 py-0.5 rounded-full font-bold text-xs bg-indigo-600 text-white shadow-2xs">
                {classSubjects.length} Subjects Active
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {classSubjects.map((s) => (
                  <span
                    key={s.id}
                    className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-indigo-200 text-indigo-900 shadow-2xs flex items-center gap-1"
                  >
                    <span>{s.code}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditSubject(s)}
                      className="text-slate-400 hover:text-indigo-600"
                      title={`Edit ${s.name}`}
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmDeleteSubject(s)}
                      className="text-slate-400 hover:text-rose-600"
                      title={`Delete ${s.name}`}
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Fast Preset Switchers for 5 vs 6 subjects */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 font-semibold mr-1">Quick Config:</span>
              <button
                type="button"
                onClick={() => handleApplySubjectPreset('5_subjects')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  classSubjects.length === 5
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Apply standard 5 core subjects (Math, Eng, Sci, SST, MIL)"
              >
                ⚡ Set 5 Subjects
              </button>
              <button
                type="button"
                onClick={() => handleApplySubjectPreset('6_subjects')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                  classSubjects.length === 6
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Apply standard 6 subjects (5 Core + Computer Studies)"
              >
                ⚡ Set 6 Subjects
              </button>
              <button
                type="button"
                onClick={handleOpenAddSubject}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                title="Add a custom subject to this class"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Subject</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('subjects')}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-bold ml-1 flex items-center gap-0.5"
              >
                <span>Manage Details →</span>
              </button>
            </div>
          </div>

          {/* Subject-wise Multi-Column Spreadsheet */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  Consolidated Marks Matrix: {formatClassDisplay(selectedClass)} ({selectedSection}) — {selectedTerm}
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                  {classSubjects.length} Subjects Evaluated
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">
                Tip: Click ✏️ to edit or 🗑️ to delete subjects. Switch classes with 5 or 6 subjects anytime.
              </span>
            </div>

            <div className="overflow-x-auto max-h-[550px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center border-r border-slate-200 bg-slate-100">Roll</th>
                    <th className="py-2.5 px-3 min-w-[180px] border-r border-slate-200 bg-slate-100">Student Name</th>
                    {classSubjects.map((sub) => {
                      const tm = resolveSubjectTermMarks(sub, selectedTerm);
                      return (
                        <th
                          key={sub.id}
                          className="py-2 px-2.5 text-center border-r border-slate-200 min-w-[125px] bg-slate-100/95 group relative hover:bg-slate-200/80 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                              {sub.code}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                                tm.isUnitTest
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                              }`}
                              title={tm.isUnitTest ? '50 Marks Exam Rule' : '100 Marks Exam Rule'}
                            >
                              {tm.maxMarks}M
                            </span>
                            <div className="flex items-center gap-0.5 opacity-75 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleOpenEditSubject(sub)}
                                className="p-1 hover:bg-indigo-600 hover:text-white text-slate-500 rounded transition-colors"
                                title={`Edit ${sub.name} (Term Max: ${tm.maxMarks}, Pass: ${tm.passMarks})`}
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmDeleteSubject(sub)}
                                className="p-1 hover:bg-rose-600 hover:text-white text-rose-500 rounded transition-colors"
                                title={`Delete ${sub.name} from Class ${formatClassDisplay(selectedClass)}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="font-bold text-slate-900 text-xs truncate" title={sub.name}>
                            {sub.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Max: <strong className="text-slate-800">{tm.maxMarks}</strong> | Pass: <span className="text-rose-700 font-bold">{tm.passMarks}</span>
                          </div>
                        </th>
                      );
                    })}
                    <th className="py-2 px-2 text-center border-r border-slate-200 min-w-[85px] bg-slate-50">
                      <button
                        type="button"
                        onClick={handleOpenAddSubject}
                        className="w-full py-1.5 px-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 border-dashed rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                        title="Add another subject to this class"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add Sub</span>
                      </button>
                    </th>
                    <th className="py-2.5 px-3 text-center min-w-[90px] border-r border-slate-200 bg-indigo-50/70 text-indigo-900 font-bold">
                      Total
                    </th>
                    <th className="py-2.5 px-3 text-center min-w-[70px] border-r border-slate-200 bg-indigo-50/70 text-indigo-900 font-bold">
                      %
                    </th>
                    <th className="py-2.5 px-3 text-center min-w-[70px] bg-indigo-50/70 text-indigo-900 font-bold">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((student) => {
                    const studentStats = studentTotals.find((t) => t.student.id === student.id);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-800 border-r border-slate-200">
                          #{student.rollNo}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <div className="flex items-center justify-between gap-1">
                            <div>
                              <span className="font-bold text-slate-900 block">{student.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{student.admissionNo}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenEditStudent(student)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                              title="Edit student"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Subject Score Cells */}
                        {classSubjects.map((sub) => {
                          const tm = resolveSubjectTermMarks(sub, selectedTerm);
                          const cell = liveMarksGrid[student.id]?.[sub.name];
                          const isAbsent = Boolean(cell?.isAbsent);
                          const marksVal = cell?.marks;
                          const isFail = !isAbsent && marksVal !== null && marksVal !== undefined && marksVal < tm.passMarks;

                          return (
                            <td key={sub.id} className="py-1.5 px-2 text-center border-r border-slate-200">
                              <div className="inline-flex items-center gap-1">
                                <input
                                  type="number"
                                  disabled={isAbsent}
                                  value={isAbsent ? '' : marksVal ?? ''}
                                  onChange={(e) =>
                                    handleCellMarkChange(student.id, sub.name, e.target.value, tm.maxMarks)
                                  }
                                  placeholder="0"
                                  max={tm.maxMarks}
                                  min={0}
                                  className={`w-14 text-center font-mono font-bold text-xs border rounded py-1 px-0.5 focus:outline-none focus:border-indigo-600 tabular-nums ${
                                    isAbsent
                                      ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold placeholder-rose-800'
                                      : isFail
                                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                                      : 'border-slate-300 bg-white text-slate-900'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleCellToggleAbsent(student.id, sub.name)}
                                  className={`text-[9px] font-bold px-1 py-1 rounded transition-colors ${
                                    isAbsent
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                                  }`}
                                  title="Toggle Absent"
                                >
                                  {isAbsent ? 'AB' : 'AB'}
                                </button>
                              </div>
                            </td>
                          );
                        })}

                        {/* Cell matching "+ Add Sub" column */}
                        <td className="py-1.5 px-2 text-center border-r border-slate-200 bg-slate-50/40">
                          <span className="text-slate-300 text-xs font-mono">—</span>
                        </td>

                        {/* Total, %, Grade Columns */}
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-900 border-r border-slate-200 bg-slate-50/50">
                          {studentStats?.total} <span className="text-[10px] text-slate-400">/{studentStats?.maxTotal}</span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-indigo-700 border-r border-slate-200 bg-slate-50/50">
                          {studentStats?.percentage}%
                        </td>
                        <td className="py-2 px-3 text-center bg-slate-50/50 font-bold font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              studentStats?.grade === 'A+' || studentStats?.grade === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : studentStats?.grade === 'B' || studentStats?.grade === 'C'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {studentStats?.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CLASS STUDENTS ROSTER (Add & Edit Students)        */}
      {/* ========================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Enrolled Students: {formatClassDisplay(selectedClass)} (Section {selectedSection})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Class teacher can directly enroll new students, edit personal particulars, update mobile numbers, and manage enrollment
              </p>
            </div>

            <button
              onClick={handleOpenAddStudent}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Enroll New Student</span>
            </button>
          </div>

          {/* Students Grid / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {classStudents.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between hover:border-indigo-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs border border-indigo-200">
                          Roll #{s.rollNo}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.id}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{s.name}</h3>
                      {s.nameAssamese && (
                        <span className="text-[11px] text-slate-500 font-assamese block">{s.nameAssamese}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditStudent(s)}
                      className="p-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-lg transition-colors"
                      title="Edit Student Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Admission No:</span>
                      <span className="font-mono font-bold text-slate-800">{s.admissionNo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Guardian / Father:</span>
                      <span className="font-medium text-slate-800">{s.fatherName || s.guardianName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Parent Mobile:</span>
                      <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-slate-400" />
                        <span>{s.mobile}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Date of Birth:</span>
                      <span className="font-mono text-slate-700">{s.dob}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active Student
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEditStudent(s)}
                    className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1"
                  >
                    <span>Edit Profile →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MANAGE CLASS SUBJECTS (Add, Edit, Delete, Presets) */}
      {/* ========================================================= */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          {/* Header & Quick Preset Strip */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Curriculum Subjects for Class {formatClassDisplay(selectedClass)}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {classSubjects.length} Subjects Configured
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Different classes follow different curriculum structures (e.g. <strong>Class 1–4 have 4–5 subjects</strong>, <strong>Class 5–8 have 5 or 6 subjects</strong>, while higher classes include Computer Studies or regional electives). Use the 1-click presets below or add, edit, and delete individual subjects.
                </p>
              </div>

              <button
                onClick={handleOpenAddSubject}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Custom Subject</span>
              </button>
            </div>

            {/* Quick Presets & Metrics Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Quick Curriculum Presets:</span>
                <button
                  type="button"
                  onClick={() => handleApplySubjectPreset('5_subjects')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    classSubjects.length === 5
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                  title="Mathematics, English, Science, Social Science, MIL"
                >
                  <span>⚡ 5 Core Subjects (500 Marks)</span>
                  {classSubjects.length === 5 && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleApplySubjectPreset('6_subjects')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    classSubjects.length === 6
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                  title="Mathematics, English, Science, Social Science, MIL, Computer Studies"
                >
                  <span>⚡ 6 Subjects (+ Computer Studies)</span>
                  {classSubjects.length === 6 && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleApplySubjectPreset('4_subjects')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    classSubjects.length === 4
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                  title="English, Mathematics, EVS, MIL"
                >
                  <span>⚡ 4 Primary Subjects</span>
                  {classSubjects.length === 4 && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Curriculum Aggregate Statistics showing both 100M Major and 50M Unit Test scales */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] font-sans font-bold uppercase block">
                    🏆 Half-Yearly & Annual (100M)
                  </span>
                  <span className="font-bold text-slate-900 text-xs">
                    {classSubjects.reduce((acc, s) => acc + s.maxMarks, 0)} Max | <span className="text-rose-700">{classSubjects.reduce((acc, s) => acc + s.passMarks, 0)} Pass</span>
                  </span>
                </div>
                <div className="border-l border-slate-300 pl-3">
                  <span className="text-amber-800 text-[10px] font-sans font-bold uppercase block">
                    ⚡ Unit Tests (50M)
                  </span>
                  <span className="font-bold text-amber-950 text-xs">
                    {classSubjects.reduce((acc, s) => acc + resolveSubjectTermMarks(s, 'Unit Test 1').maxMarks, 0)} Max | <span className="text-rose-700">{classSubjects.reduce((acc, s) => acc + resolveSubjectTermMarks(s, 'Unit Test 1').passMarks, 0)} Pass</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Examination Standard Policy Explainer Note */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono text-[10px]">RULE</span>
                <span>
                  <strong>Unit Tests = 50 Marks</strong> · <strong>Half-Yearly & Annual Exams = 100 Marks</strong>. Pass mark ratio (~35%) is preserved automatically.
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[10px]">Board & CBSE Aligned</span>
            </div>
          </div>

          {/* Subject Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {classSubjects.map((sub, sIdx) => {
              const utMarks = resolveSubjectTermMarks(sub, 'Unit Test 1');
              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between hover:border-indigo-300 transition-all hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono text-slate-400">
                            #{sIdx + 1}
                          </span>
                          <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                            {sub.code}
                          </span>
                          {sub.isOptional ? (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Elective
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Compulsory
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-1.5">{sub.name}</h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSubject(sub)}
                          className="p-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-lg transition-colors"
                          title="Edit Subject Name, Code, Max & Pass Marks"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDeleteSubject(sub)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-rose-500 rounded-lg transition-colors"
                          title="Delete Subject from Class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Dual-Tier Examination Marks Breakdown */}
                    <div className="space-y-2 mt-3">
                      {/* Half-Yearly & Annual (100M Standard) */}
                      <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/70">
                        <div className="flex items-center justify-between text-[10px] font-bold text-indigo-900 mb-1">
                          <span className="flex items-center gap-1">
                            <span>🏆 Half-Yearly & Annual Exam</span>
                          </span>
                          <span className="font-mono text-slate-500">100M Scale</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Max Marks</span>
                            <span className="text-sm font-black text-slate-900 font-mono block">
                              {sub.maxMarks}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Pass Marks</span>
                            <span className="text-sm font-black text-rose-700 font-mono block">
                              {sub.passMarks}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Unit Test (50M Standard) */}
                      <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-200/70">
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-900 mb-1">
                          <span className="flex items-center gap-1">
                            <span>⚡ Unit Test 1 & 2 Exam</span>
                          </span>
                          <span className="font-mono text-amber-800">50M Scale</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[9px] text-amber-800/70 font-bold uppercase block">Max Marks</span>
                            <span className="text-sm font-black text-amber-950 font-mono block">
                              {utMarks.maxMarks}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-amber-800/70 font-bold uppercase block">Pass Marks</span>
                            <span className="text-sm font-black text-rose-700 font-mono block">
                              {utMarks.passMarks}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Class {sub.classNum} Curriculum</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditSubject(sub)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                    >
                      Edit
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => handleConfirmDeleteSubject(sub)}
                      className="text-rose-600 hover:text-rose-800 font-bold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: EDIT CLASS TEACHER'S OWN PROFILE                   */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 max-w-3xl">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Class Teacher Profile & In-Charge Credentials
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your teacher designation, contact numbers, room assignment, and official marksheet endorsement signature
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveTeacherProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teacher Full Name & Degrees *</label>
                <input
                  type="text"
                  required
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Employee / Faculty Code</label>
                <input
                  type="text"
                  value={tCode}
                  onChange={(e) => setTCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Designation</label>
                <input
                  type="text"
                  value={tDesig}
                  onChange={(e) => setTDesig(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Class & Section</label>
                <input
                  type="text"
                  disabled
                  value={`Class ${formatClassDisplay(selectedClass)} (Section ${selectedSection})`}
                  className="w-full border border-slate-200 bg-slate-100 rounded-lg p-2 font-bold text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Educational Qualification</label>
                <input
                  type="text"
                  value={tQual}
                  onChange={(e) => setTQual(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Specialization</label>
                <input
                  type="text"
                  value={tSpec}
                  onChange={(e) => setTSpec(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Mobile / Accounts Phone</label>
                <input
                  type="text"
                  value={tPhone}
                  onChange={(e) => setTPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Institutional Email</label>
                <input
                  type="email"
                  value={tEmail}
                  onChange={(e) => setTEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Classroom / Faculty Room Location</label>
                <input
                  type="text"
                  value={tRoom}
                  onChange={(e) => setTRoom(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Teacher's Note / Mission Statement</label>
                <textarea
                  rows={3}
                  value={tBio}
                  onChange={(e) => setTBio(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-sm transition-colors text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Teacher Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: HOMEWORK (Retained & Enhanced)                     */}
      {/* ========================================================= */}
      {activeTab === 'homework' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Daily Assignments for {formatClassDisplay(selectedClass)} ({selectedSection})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Announcements are shared into class WhatsApp groups and synced to Parent Android App
              </p>
            </div>

            <button
              onClick={() => setShowAddHwModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Publish New Homework</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeworkList.map((hw) => (
              <div
                key={hw.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {hw.subject}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{hw.title}</h3>
                    </div>
                    <span className="font-mono font-bold text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Due: {hw.dueDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-2.5 leading-relaxed bg-slate-50/60 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line">
                    {hw.description}
                  </p>
                  {hw.attachmentNote && (
                    <div className="mt-2 text-[11px] text-indigo-700 bg-indigo-50/60 px-2 py-1 rounded">
                      Ref: {hw.attachmentNote}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">By {hw.teacherName}</span>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `*HOMEWORK: ${hw.subject}*\n${hw.title}\nDue: ${hw.dueDate}\n${hw.description}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded border border-emerald-200 flex items-center gap-1"
                  >
                    <Share2 className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: ATTENDANCE & ABSENT ALERTS                        */}
      {/* ========================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) =>
                    handleAttendanceChangeContext(e.target.value, selectedClass, selectedSection)
                  }
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                >
                  Mark All Present
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveAttendance}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Register</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-14">Roll</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Parent Mobile</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Absent Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((st) => {
                    const record = attendanceRecords.find((r) => r.studentId === st.id);
                    const isAbsent = record?.status === 'Absent';

                    return (
                      <tr key={st.id} className={isAbsent ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                        <td className="py-2 px-3 font-mono font-bold">#{st.rollNo}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{st.name}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{st.mobile}</td>
                        <td className="py-2 px-3 text-center">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                            <button
                              type="button"
                              onClick={() => handleUpdateStudentAttendance(st.id, 'Present')}
                              className={`px-2.5 py-1 rounded text-xs font-bold ${
                                record?.status === 'Present' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                              }`}
                            >
                              P
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStudentAttendance(st.id, 'Absent')}
                              className={`px-2.5 py-1 rounded text-xs font-bold ${
                                record?.status === 'Absent' ? 'bg-rose-600 text-white' : 'text-slate-600'
                              }`}
                            >
                              A
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStudentAttendance(st.id, 'Late')}
                              className={`px-2.5 py-1 rounded text-xs font-bold ${
                                record?.status === 'Late' ? 'bg-amber-600 text-white' : 'text-slate-600'
                              }`}
                            >
                              L
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right">
                          {isAbsent && (
                            <button
                              type="button"
                              onClick={() => handleSendAbsentNotification(st, record!)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>{record?.parentNotified ? 'Resend' : 'WhatsApp Alert'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: REPORT CARDS & MERIT LIST                          */}
      {/* ========================================================= */}
      {activeTab === 'reportCards' && (
        <div className="space-y-4">
          {/* Header & Term Selector Deck */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Official Merit List & Report Cards: Class {formatClassDisplay(selectedClass)} ({selectedSection})
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedTermInfo.badgeBg} ${selectedTermInfo.badgeText} ${selectedTermInfo.badgeBorder}`}
                >
                  {selectedTermInfo.categoryName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Teacher In-Charge: <strong>{teacherProfile.name}</strong> · Session {settings.academicYear || '2026-27'} · {classStudents.length} Students Evaluated
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                title="Print consolidated class marksheet & merit list"
              >
                <Printer className="w-4 h-4" />
                <span>Print Consolidated Marksheet</span>
              </button>
            </div>
          </div>

          {/* Examination Term Quick Selection Deck for Report Cards */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700 text-xs">Select Term for Report Cards:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {EXAM_TERMS.map((term) => {
                  const info = getExamTermInfo(term);
                  const isSelected = selectedTerm === term;
                  return (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSelectedTerm(term)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                        isSelected
                          ? info.isUnitTest
                            ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                            : 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {info.isUnitTest ? '⚡ ' : '🏆 '}
                      {term}
                      <span className="ml-1 opacity-80 font-mono text-[10px]">({info.standardMaxMarks}M)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-slate-500 font-sans">Active Scale:</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-800">
                {selectedTermInfo.standardMaxMarks} Marks / Subject · Pass: {selectedTermInfo.standardPassMarks}
              </span>
            </div>
          </div>

          {/* Merit List Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Class Rank</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Admission No</th>
                    <th className="py-2.5 px-3 text-center">Total Marks</th>
                    <th className="py-2.5 px-3 text-center">Percentage</th>
                    <th className="py-2.5 px-3 text-center">Division/Grade</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Individual Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentTotals.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-800 font-black'
                              : idx === 1
                              ? 'bg-slate-200 text-slate-800 font-bold'
                              : idx === 2
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'text-slate-600'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{item.student.name}</span>
                        {item.student.nameAssamese && (
                          <span className="text-[10px] text-slate-400 font-assamese block">{item.student.nameAssamese}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{item.student.admissionNo}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                        {item.total} <span className="text-slate-400 font-normal">/ {item.maxTotal}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">
                        {item.percentage}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.grade === 'A+'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.grade === 'A'
                              ? 'bg-blue-100 text-blue-800'
                              : item.grade === 'B'
                              ? 'bg-indigo-100 text-indigo-800'
                              : item.grade === 'C'
                              ? 'bg-amber-100 text-amber-800'
                              : item.grade === 'D'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.percentage >= 40 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.percentage >= 40 ? 'Passed' : 'Needs Improvement'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingReportCardStudent(item)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                          title={`View official report card for ${item.student.name}`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>View Card</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: INDIVIDUAL STUDENT OFFICIAL REPORT CARD             */}
      {/* ========================================================= */}
      {viewingReportCardStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">
                  Official Student Report Card: {viewingReportCardStudent.student.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  title="Print student report card"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReportCardStudent(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Report Card Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
              {/* Institution Header */}
              <div className="text-center border-b-2 border-indigo-600 pb-4">
                <span className="text-[10px] font-bold tracking-widest text-indigo-700 uppercase block font-sans">
                  Assam Board of Secondary Education & CBSE Pattern
                </span>
                <h1 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  {settings.schoolName || 'ASSAM VALLEY ACADEMY HIGHER SECONDARY'}
                </h1>
                <p className="text-[11px] text-slate-500 font-sans">
                  {settings.address || 'College Road, Panbazar, Guwahati, Assam - 781001'} · Affiliation No. AS/2014/92
                </p>
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full font-bold text-xs text-indigo-900">
                  <span>{selectedTerm} Report Card ({selectedTermInfo.standardMaxMarks} Marks Standard)</span>
                  <span>·</span>
                  <span>Session {settings.academicYear || '2026-27'}</span>
                </div>
              </div>

              {/* Student Identification Profile Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Student Name</span>
                  <span className="font-bold text-slate-900 block">{viewingReportCardStudent.student.name}</span>
                  {viewingReportCardStudent.student.nameAssamese && (
                    <span className="text-[10px] text-slate-500 font-assamese">{viewingReportCardStudent.student.nameAssamese}</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Roll No & Class</span>
                  <span className="font-bold text-slate-900 font-mono">
                    #{viewingReportCardStudent.student.rollNo} · Class {formatClassDisplay(selectedClass)} ({selectedSection})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Admission No</span>
                  <span className="font-bold text-slate-900 font-mono">{viewingReportCardStudent.student.admissionNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Father / Guardian</span>
                  <span className="font-bold text-slate-900">{viewingReportCardStudent.student.fatherName || 'Guardian'}</span>
                </div>
              </div>

              {/* Subject Scores Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Scholastic Performance Breakdown</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    Scale: {selectedTermInfo.isUnitTest ? '50 Marks Exam Rule' : '100 Marks Exam Rule'}
                  </span>
                </div>

                <table className="w-full text-left border-collapse border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 border-r border-slate-200">#</th>
                      <th className="py-2 px-3 border-r border-slate-200">Subject Name</th>
                      <th className="py-2 px-3 text-center border-r border-slate-200">Max Marks</th>
                      <th className="py-2 px-3 text-center border-r border-slate-200">Pass Marks</th>
                      <th className="py-2 px-3 text-center border-r border-slate-200 bg-indigo-50/50">Marks Obtained</th>
                      <th className="py-2 px-3 text-center border-r border-slate-200">Grade</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classSubjects.map((sub, sIdx) => {
                      const tm = resolveSubjectTermMarks(sub, selectedTerm);
                      const cell = liveMarksGrid[viewingReportCardStudent.student.id]?.[sub.name];
                      const isAbsent = Boolean(cell?.isAbsent);
                      const marksVal = cell?.marks;
                      const hasMark = marksVal !== null && marksVal !== undefined && !isAbsent;
                      const isPass = hasMark && marksVal >= tm.passMarks;

                      let subGrade = '-';
                      if (hasMark) {
                        const pct = (marksVal / tm.maxMarks) * 100;
                        if (pct >= 90) subGrade = 'A+';
                        else if (pct >= 80) subGrade = 'A';
                        else if (pct >= 70) subGrade = 'B';
                        else if (pct >= 60) subGrade = 'C';
                        else if (pct >= 40) subGrade = 'D';
                        else subGrade = 'F';
                      }

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/60">
                          <td className="py-2 px-3 font-mono text-slate-400 border-r border-slate-200">
                            {sIdx + 1}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200">
                            <span className="font-bold text-slate-900">{sub.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono ml-1.5">({sub.code})</span>
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-700 border-r border-slate-200">
                            {tm.maxMarks}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-rose-700 border-r border-slate-200">
                            {tm.passMarks}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-black text-slate-900 border-r border-slate-200 bg-indigo-50/30">
                            {isAbsent ? (
                              <span className="text-rose-600 font-bold">AB</span>
                            ) : hasMark ? (
                              marksVal
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold border-r border-slate-200">
                            {subGrade}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isAbsent ? (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Absent</span>
                            ) : hasMark ? (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  isPass ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                                }`}
                              >
                                {isPass ? 'Passed' : 'Failed'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Table Footer Aggregate */}
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs">
                    <tr>
                      <td colSpan={2} className="py-2 px-3 text-right uppercase text-slate-600 border-r border-slate-200">
                        Class Aggregate Score:
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-900 border-r border-slate-200">
                        {viewingReportCardStudent.maxTotal}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-rose-700 border-r border-slate-200">
                        {Math.round(viewingReportCardStudent.maxTotal * 0.35)}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-black text-indigo-700 border-r border-slate-200 bg-indigo-100/40">
                        {viewingReportCardStudent.total}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-indigo-700 border-r border-slate-200">
                        {viewingReportCardStudent.grade}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            viewingReportCardStudent.percentage >= 40
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {viewingReportCardStudent.percentage >= 40 ? 'Passed' : 'Needs Help'}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Comprehensive Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Aggregate Total</span>
                  <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                    {viewingReportCardStudent.total} / {viewingReportCardStudent.maxTotal}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {selectedTermInfo.standardMaxMarks}M per subject standard
                  </span>
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 text-center">
                  <span className="text-[10px] text-indigo-800 font-bold uppercase block">Percentage</span>
                  <span className="text-lg font-black text-indigo-700 font-mono mt-0.5 block">
                    {viewingReportCardStudent.percentage}%
                  </span>
                  <span className="text-[10px] text-indigo-600 font-medium">
                    {viewingReportCardStudent.percentage >= 75 ? 'Distinction' : viewingReportCardStudent.percentage >= 60 ? 'First Division' : 'Satisfactory'}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Final Grade</span>
                  <span className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">
                    Grade {viewingReportCardStudent.grade}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    Rank in Class: #{studentTotals.findIndex((t) => t.student.id === viewingReportCardStudent.student.id) + 1}
                  </span>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-8 border-t border-slate-200 flex items-end justify-between px-2 text-center text-xs">
                <div>
                  <div className="border-b border-slate-400 w-36 mb-1"></div>
                  <span className="font-bold text-slate-800 block">{teacherProfile.name}</span>
                  <span className="text-[10px] text-slate-400">Class Teacher In-Charge</span>
                </div>

                <div className="p-2 border border-slate-300 rounded-lg text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                  Official School Seal
                </div>

                <div>
                  <div className="border-b border-slate-400 w-36 mb-1"></div>
                  <span className="font-bold text-slate-800 block">Dr. H. Barooah, M.A.</span>
                  <span className="text-[10px] text-slate-400">Principal / Headmaster</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 text-[11px]">
                Rule Enforced: Unit Tests evaluate out of 50M | Half-Yearly & Annual Exams out of 100M
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingReportCardStudent(null)}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT STUDENT                                  */}
      {/* ========================================================= */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold">
                  {editingStudent ? `Edit Student: ${editingStudent.name}` : `Enroll Student into Class ${selectedClass}-${selectedSection}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStudentModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={stName}
                    onChange={(e) => setStName(e.target.value)}
                    placeholder="e.g. Priyom Sharma"
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assamese Name (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={stNameAssamese}
                    onChange={(e) => setStNameAssamese(e.target.value)}
                    placeholder="প্ৰিয়ম শৰ্মা"
                    className="w-full border border-slate-300 rounded-lg p-2 font-assamese"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Roll Number *</label>
                  <input
                    type="number"
                    required
                    value={stRollNo}
                    onChange={(e) => setStRollNo(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admission No *</label>
                  <input
                    type="text"
                    required
                    value={stAdmNo}
                    onChange={(e) => setStAdmNo(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={stGender}
                    onChange={(e) => setStGender(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={stFather}
                    onChange={(e) => setStFather(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    value={stMother}
                    onChange={(e) => setStMother(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Mobile (for WhatsApp alerts) *</label>
                  <input
                    type="text"
                    required
                    value={stMobile}
                    onChange={(e) => setStMobile(e.target.value)}
                    placeholder="9864012345"
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={stDob}
                    onChange={(e) => setStDob(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={stAddress}
                  onChange={(e) => setStAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {editingStudent ? 'Save Student Updates' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT SUBJECT                                  */}
      {/* ========================================================= */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold">
                  {editingSubject ? `Edit Subject: ${editingSubject.name}` : `Add New Subject to Class ${selectedClass}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="p-5 space-y-3.5 text-xs">
              {/* Quick Template Chips */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Pick Standard Subject Template:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
                  {COMMON_SUBJECT_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.code}
                      type="button"
                      onClick={() => handleSelectSubjectTemplate(tmpl)}
                      className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
                        subCode === tmpl.code
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {tmpl.name} ({tmpl.code})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. General Science, Advanced Mathematics"
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Code / Abbreviation *</label>
                <input
                  type="text"
                  required
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value)}
                  placeholder="e.g. GSCI, AMTH, COMP"
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Maximum Marks *</label>
                  <input
                    type="number"
                    required
                    value={subMaxMarks}
                    onChange={(e) => setSubMaxMarks(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pass Marks *</label>
                  <input
                    type="number"
                    required
                    value={subPassMarks}
                    onChange={(e) => setSubPassMarks(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-center"
                  />
                </div>
              </div>

              {/* Exam standard auto-scaling helper note */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900">
                <div className="flex items-center gap-1 font-bold text-amber-950 mb-0.5">
                  <span>⚡ Exam Standard Policy Rule:</span>
                </div>
                <p>
                  Base marks configured above ({subMaxMarks}M) apply to <strong>Half-Yearly & Annual Exams (100M Standard)</strong>. For <strong>Unit Tests</strong>, this subject automatically evaluates out of <strong>50 Marks</strong> (Pass threshold: {Math.round(subPassMarks * 0.5) || 18}).
                </p>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                  <input
                    type="checkbox"
                    checked={subIsOptional}
                    onChange={(e) => setSubIsOptional(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span>Optional / Elective Subject</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {editingSubject ? 'Save Subject Changes' : 'Add Subject to Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE SUBJECT CONFIRMATION                        */}
      {/* ========================================================= */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-rose-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-200" />
                <h3 className="text-sm font-bold">
                  Delete Subject from Class {formatClassDisplay(selectedClass)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSubjectToDelete(null)}
                className="text-rose-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900 text-sm">{subjectToDelete.name}</span>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-rose-200 text-rose-800">
                    {subjectToDelete.code}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs">
                  Are you sure you want to remove <strong>{subjectToDelete.name}</strong> from Class {formatClassDisplay(selectedClass)}?
                </p>
                <div className="text-[11px] text-slate-600 font-mono bg-white/70 p-2 rounded border border-rose-100">
                  <div>• Current Subjects: <strong>{classSubjects.length}</strong> → After Deletion: <strong>{Math.max(0, classSubjects.length - 1)}</strong></div>
                  <div>• Max Marks: <strong>{subjectToDelete.maxMarks}</strong> | Pass Threshold: <strong>{subjectToDelete.passMarks}</strong></div>
                  <div className="text-rose-700 font-sans mt-1">Note: This subject's column and scores will be removed from the class marksheet and total score percentages.</div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSubjectToDelete(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDeleteSubject}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete Subject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PUBLISH HOMEWORK                                    */}
      {/* ========================================================= */}
      {showAddHwModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold">
                  Publish Homework: Class {formatClassDisplay(selectedClass)} ({selectedSection})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddHwModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHomeworkSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={newHwSubject}
                    onChange={(e) => setNewHwSubject(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white font-medium"
                  >
                    {classSubjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Submission Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newHwDueDate}
                    onChange={(e) => setNewHwDueDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={newHwTitle}
                  onChange={(e) => setNewHwTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Fractions Practice"
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Instructions *</label>
                <textarea
                  rows={4}
                  required
                  value={newHwDesc}
                  onChange={(e) => setNewHwDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reference Material</label>
                <input
                  type="text"
                  value={newHwNote}
                  onChange={(e) => setNewHwNote(e.target.value)}
                  placeholder="e.g. Mathematics Textbook Page 78"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddHwModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Publish Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
