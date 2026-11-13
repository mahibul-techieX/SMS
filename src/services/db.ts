import {
  Student,
  FeeCategory,
  FeeStructureItem,
  PaymentTransaction,
  LedgerEntry,
  AuditLog,
  SchoolSettings,
  FeeCategoryConfigItem,
  BackupRecord,
  User,
  MonthFeeStatus,
  PaymentDueAlert,
  EnterpriseLicense,
  LicenseStatus,
  LicenseTier,
  IssuedSchoolLicense,
  SupportTicket,
  StudentMarkEntry,
  ExamResultSheet,
  HomeworkAssignment,
  DailyAttendanceRecord,
  ClassSubject,
  ClassTeacherProfile
} from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'sra_offline_students_v1',
  FEE_STRUCTURE: 'sra_offline_feestructure_v1',
  TRANSACTIONS: 'sra_offline_transactions_v1',
  LEDGER: 'sra_offline_ledger_v1',
  AUDIT_LOGS: 'sra_offline_audit_v1',
  SETTINGS: 'sra_offline_settings_v1',
  USERS: 'sra_offline_users_v1',
  BACKUPS: 'sra_offline_backups_v1',
  ACTIVE_USER: 'sra_active_user_v1',
  LICENSE: 'sra_enterprise_license_v1',
  ISSUED_LICENSES: 'sra_enterprise_issued_licenses_v1',
  SUPPORT_TICKETS: 'sra_enterprise_support_tickets_v1',
  TEACHER_HOMEWORK: 'sra_teacher_homework_v1',
  TEACHER_EXAM_RESULTS: 'sra_teacher_exam_results_v1',
  TEACHER_ATTENDANCE: 'sra_teacher_attendance_v1',
  TEACHER_SUBJECTS: 'sra_teacher_subjects_v1',
  TEACHER_PROFILES: 'sra_teacher_profiles_v1'
};

export const MONTH_NAMES = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March'
];

export const DEFAULT_FEE_CATEGORIES_CONFIG: FeeCategoryConfigItem[] = [
  {
    id: 'FC-01',
    name: 'Tuition Fee',
    categoryKey: 'Tuition Fee',
    description: 'Core recurring monthly teaching, classroom instruction, and syllabus coaching fee.',
    isEnabled: true,
    billingMode: 'monthly',
    provisionPolicy: 'school-charged',
    applicableClassRange: 'All Classes (Ankur to 10)',
    defaultAmount: 850,
    notes: 'Standard recurring monthly academic fee due on 5th of each month.'
  },
  {
    id: 'FC-02',
    name: 'Book Fee',
    categoryKey: 'Book Fee',
    description: 'Textbooks, activity workbooks, and syllabus stationery sets.',
    isEnabled: true,
    billingMode: 'annual',
    provisionPolicy: 'school-charged',
    applicableClassRange: 'Class 1 to 8 Free (Govt/Trust scheme); Class 9 & 10 charged',
    defaultAmount: 1800,
    notes: 'Some classes receive free govt textbooks; private publisher reference sets are charged.'
  },
  {
    id: 'FC-03',
    name: 'Uniform Fee',
    categoryKey: 'Uniform Fee',
    description: 'School regular uniform, winter blazer, tie, belt, badge, and physical education sports track.',
    isEnabled: false,
    billingMode: 'self-purchased',
    provisionPolicy: 'student-buys-own',
    applicableClassRange: 'All Classes (Self-procured)',
    defaultAmount: 0,
    notes: 'Students purchase approved uniform directly from vendor or local market on their own; zero fee charged by school.'
  },
  {
    id: 'FC-04',
    name: 'Examination Fee',
    categoryKey: 'Examination Fee',
    description: 'Evaluation sheets, question paper printing, and bi-annual terminal assessments.',
    isEnabled: true,
    billingMode: 'separate-exam',
    provisionPolicy: 'separate',
    applicableClassRange: 'All Classes (Half-Yearly & Annual)',
    defaultAmount: 1200,
    notes: 'Collected separately prior to Half-Yearly (Aug/Sep) and Annual (Feb/Mar) examination cycles.'
  },
  {
    id: 'FC-05',
    name: 'Admission Fee',
    categoryKey: 'Admission Fee',
    description: 'Initial student registration, student record file, and institutional seat allotment.',
    isEnabled: true,
    billingMode: 'with-admission',
    provisionPolicy: 'with-admission',
    applicableClassRange: 'New Admissions & Annual Session Re-enrollment',
    defaultAmount: 2500,
    notes: 'One-time fee collected at the time of admission with enrolment kit.'
  },
  {
    id: 'FC-06',
    name: 'Computer Lab Fee',
    categoryKey: 'Computer Lab Fee',
    description: 'Computer laboratory maintenance, digital smart board access, and practical classes.',
    isEnabled: true,
    billingMode: 'annual',
    provisionPolicy: 'school-charged',
    applicableClassRange: 'Class 3 to 10',
    defaultAmount: 600,
    notes: 'Annual IT and computer practical charge.'
  }
];

export const INITIAL_SETTINGS: SchoolSettings = {
  schoolName: 'Pragjyotish Academy & Higher Secondary',
  schoolNameAssamese: 'প্ৰাগজ্যোতিষ একাডেমী আৰু উচ্চতৰ মাধ্যমিক বিদ্যালয়',
  motto: 'Vidya Param Jnanam (Knowledge is Supreme)',
  address: 'R.G. Baruah Road, Ganeshguri, Guwahati - 781024, Assam',
  phone: '+91 361 245 8899 / 98640 12345',
  email: 'accounts@pragjyotishacademy.edu.in',
  website: 'www.pragjyotishacademy.edu.in',
  affiliationNo: 'SEBA/CBSE-AS-14028',
  principalName: 'Dr. B. K. Sarma, M.Sc., Ph.D.',
  cashierName: 'M. Sharma (Sr. Accountant)',
  academicYear: '2026-27',
  currentAcademicYear: '2026-27',
  currency: '₹',
  receiptFooter: 'This is a computer generated offline-certified receipt. Fees once paid are non-refundable. Please preserve this receipt for your records.',
  defaultPrinter: 'Thermal 80mm',
  defaultPaperSize: '80mm',
  bilingualReceipt: true,
  autoBackupEnabled: true,
  lastBackupTimestamp: '2026-09-26 10:15 AM',
  whatsAppReminderDays: 5,
  feeDueDayOfMonth: 5,
  dueNotificationDays: 7,
  feeCategoriesConfig: DEFAULT_FEE_CATEGORIES_CONFIG
};

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-ENT-00',
    username: 'enterprise',
    fullName: 'Enterprise Administrator',
    role: 'Enterprise Admin',
    active: true,
    lastLogin: '2026-10-01 08:00 AM'
  },
  {
    id: 'USR-01',
    username: 'admin',
    fullName: 'Bhupen Kalita',
    role: 'Administrator',
    active: true,
    lastLogin: '2026-09-26 09:30 AM'
  },
  {
    id: 'USR-02',
    username: 'accountant',
    fullName: 'Mridul Sharma',
    role: 'Accountant',
    active: true,
    lastLogin: '2026-09-26 11:45 AM'
  },
  {
    id: 'USR-03',
    username: 'viewer',
    fullName: 'Ananya Dutta',
    role: 'Viewer',
    active: true,
    lastLogin: '2026-09-25 04:10 PM'
  }
];

export const INITIAL_LICENSE: EnterpriseLicense = {
  licenseKey: 'SRA-ENT-2026-8941-K72B',
  organizationName: 'Pragjyotish Academy & Higher Secondary',
  tier: 'trial',
  status: 'trial',
  issuedDate: '2026-10-01',
  validUntil: '2026-10-31',
  isTrial: true,
  trialDaysGranted: 30,
  maxStudents: 500,
  hardwareFingerprint: 'SRA-HW-AS-9871-E3',
  licensedToEmail: 'director@pragjyotishacademy.edu.in',
  features: {
    feeCollection: true,
    barcodeIdCards: true,
    whatsappAlerts: true,
    financialReports: true,
    cloudBackup: true,
    auditLogs: true,
    multiUserAccess: true,
    unlimitedStudents: true
  },
  lastModifiedBy: 'Enterprise Provisioning System',
  lastModifiedAt: '2026-10-01 08:00:00',
  notes: 'Official 30-Day Enterprise Trial License with full module clearance.'
};

export const INITIAL_ISSUED_LICENSES: IssuedSchoolLicense[] = [
  {
    id: 'LIC-001',
    licenseKey: 'SRA-ENT-2026-8941-K72B',
    schoolName: 'Pragjyotish Academy & Higher Secondary',
    schoolCode: 'PAHS-GUW-01',
    tier: 'trial',
    status: 'trial',
    issuedAt: '2026-10-01',
    validUntil: '2026-10-31',
    maxStudents: 500,
    contactPerson: 'Dr. B. K. Sarma (Principal)',
    contactEmail: 'director@pragjyotishacademy.edu.in',
    contactPhone: '+91 98640 12345',
    hardwareFingerprint: 'SRA-HW-AS-9871-E3',
    features: {
      feeCollection: true,
      barcodeIdCards: true,
      whatsappAlerts: true,
      financialReports: true,
      cloudBackup: true,
      auditLogs: true,
      multiUserAccess: true,
      unlimitedStudents: true
    },
    notes: 'Active trial client school. 30-day evaluation trial with pre-primary modules.'
  },
  {
    id: 'LIC-002',
    licenseKey: 'SRA-ENT-2026-4412-M99Q',
    schoolName: 'St. Xavier English Academy',
    schoolCode: 'SXEA-DIS-04',
    tier: 'enterprise',
    status: 'active',
    issuedAt: '2026-08-15',
    validUntil: '2027-08-14',
    maxStudents: 1500,
    contactPerson: 'Fr. Thomas Varghese',
    contactEmail: 'accounts@stxavieracademy.org',
    contactPhone: '+91 94350 78210',
    hardwareFingerprint: 'SRA-HW-AS-3321-K8',
    features: {
      feeCollection: true,
      barcodeIdCards: true,
      whatsappAlerts: true,
      financialReports: true,
      cloudBackup: true,
      auditLogs: true,
      multiUserAccess: true,
      unlimitedStudents: true
    },
    notes: 'Annual commercial enterprise license. Multi-counter setup with barcode scanning.'
  },
  {
    id: 'LIC-003',
    licenseKey: 'SRA-ENT-2026-7782-X20L',
    schoolName: 'Brahmaputra Valley Public School',
    schoolCode: 'BVPS-JRH-02',
    tier: 'standard',
    status: 'active',
    issuedAt: '2026-09-01',
    validUntil: '2027-03-31',
    maxStudents: 800,
    contactPerson: 'Minakshi Saikia (Headmistress)',
    contactEmail: 'admin@brahmaputraschool.edu.in',
    contactPhone: '+91 98540 66321',
    hardwareFingerprint: 'SRA-HW-AS-1144-P2',
    features: {
      feeCollection: true,
      barcodeIdCards: true,
      whatsappAlerts: true,
      financialReports: true,
      cloudBackup: true,
      auditLogs: true,
      multiUserAccess: false,
      unlimitedStudents: false
    },
    notes: 'Standard single-workstation school edition.'
  },
  {
    id: 'LIC-004',
    licenseKey: 'SRA-ENT-2026-2201-B11Z',
    schoolName: 'Assam Jatiya Vidyalaya Branch 2',
    schoolCode: 'AJV-NUN-09',
    tier: 'trial',
    status: 'expired',
    issuedAt: '2026-08-01',
    validUntil: '2026-08-31',
    maxStudents: 300,
    contactPerson: 'Hemanta Baruah',
    contactEmail: 'h.baruah@ajvguwahati.org',
    contactPhone: '+91 97060 44109',
    hardwareFingerprint: 'SRA-HW-AS-8899-V4',
    features: {
      feeCollection: true,
      barcodeIdCards: true,
      whatsappAlerts: false,
      financialReports: true,
      cloudBackup: false,
      auditLogs: true,
      multiUserAccess: false,
      unlimitedStudents: false
    },
    notes: 'Trial expired. School requested quotation for 1-year Senior Secondary tier.'
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-101',
    ticketNo: 'SRA-SUP-8921',
    schoolName: 'Pragjyotish Academy & Higher Secondary',
    licenseKey: 'SRA-ENT-2026-8941-K72B',
    contactPerson: 'Mridul Sharma (Accountant)',
    phone: '+91 98640 12345',
    category: 'Validity Extension',
    priority: 'High',
    status: 'In Progress',
    subject: 'Request for 30-day trial extension for pre-primary admission session',
    description: 'School started nursery/kindergarten admissions under ANKUR and MUKUL sections. Needs validity extended past October 31.',
    createdAt: '2026-10-01 10:15 AM',
    assignedEngineer: 'Rajesh Bordoloi (Lead Support)'
  },
  {
    id: 'TCK-102',
    ticketNo: 'SRA-SUP-8890',
    schoolName: 'St. Xavier English Academy',
    licenseKey: 'SRA-ENT-2026-4412-M99Q',
    contactPerson: 'Fr. Thomas Varghese',
    phone: '+91 94350 78210',
    category: 'Receipt Printing',
    priority: 'Medium',
    status: 'Resolved',
    subject: 'Thermal 80mm printer paper cutter margin adjustment',
    description: 'Assisted accountant with ESC/POS auto-cutter margin configuration. Printing verified cleanly.',
    createdAt: '2026-09-28 02:40 PM',
    resolvedAt: '2026-09-28 04:10 PM',
    assignedEngineer: 'Dimpu Das (Hardware Support)'
  },
  {
    id: 'TCK-103',
    ticketNo: 'SRA-SUP-8845',
    schoolName: 'Assam Jatiya Vidyalaya Branch 2',
    licenseKey: 'SRA-ENT-2026-2201-B11Z',
    contactPerson: 'Hemanta Baruah',
    phone: '+91 97060 44109',
    category: 'License Activation',
    priority: 'High',
    status: 'Open',
    subject: 'Renewal quotation request & commercial license key delivery',
    description: 'Evaluation trial finished. Management approved commercial purchase for 800 students. Pending key issuance.',
    createdAt: '2026-09-29 11:20 AM',
    assignedEngineer: 'Rajesh Bordoloi (Lead Support)'
  }
];

// Standard fee structures for Classes ANKUR, MUKUL, and 1 to 10
export const INITIAL_FEE_STRUCTURE: FeeStructureItem[] = [
  // Pre-Primary (ANKUR & MUKUL)
  ...['ANKUR', 'MUKUL'].flatMap((c) => [
    { id: `FS-C${c}-ADM`, classNum: c, feeCategory: 'Admission Fee' as FeeCategory, feeType: 'one-time' as const, amount: 5000 },
    { id: `FS-C${c}-TUI`, classNum: c, feeCategory: 'Tuition Fee' as FeeCategory, feeType: 'monthly' as const, amount: 1500 },
    { id: `FS-C${c}-BOK`, classNum: c, feeCategory: 'Book Fee' as FeeCategory, feeType: 'annual' as const, amount: 1800 },
    { id: `FS-C${c}-EXM`, classNum: c, feeCategory: 'Examination Fee' as FeeCategory, feeType: 'annual' as const, amount: 800 },
    { id: `FS-C${c}-UNF`, classNum: c, feeCategory: 'Uniform Fee' as FeeCategory, feeType: 'annual' as const, amount: 1400 }
  ]),
  // Class 1 to 5 (Primary)
  ...[1, 2, 3, 4, 5].flatMap((c) => [
    { id: `FS-C${c}-ADM`, classNum: c, feeCategory: 'Admission Fee' as FeeCategory, feeType: 'one-time' as const, amount: 6500 },
    { id: `FS-C${c}-TUI`, classNum: c, feeCategory: 'Tuition Fee' as FeeCategory, feeType: 'monthly' as const, amount: 1800 },
    { id: `FS-C${c}-BOK`, classNum: c, feeCategory: 'Book Fee' as FeeCategory, feeType: 'annual' as const, amount: 2400 },
    { id: `FS-C${c}-EXM`, classNum: c, feeCategory: 'Examination Fee' as FeeCategory, feeType: 'annual' as const, amount: 1200 },
    { id: `FS-C${c}-UNF`, classNum: c, feeCategory: 'Uniform Fee' as FeeCategory, feeType: 'annual' as const, amount: 1600 }
  ]),
  // Class 6 to 8 (Middle)
  ...[6, 7, 8].flatMap((c) => [
    { id: `FS-C${c}-ADM`, classNum: c, feeCategory: 'Admission Fee' as FeeCategory, feeType: 'one-time' as const, amount: 7500 },
    { id: `FS-C${c}-TUI`, classNum: c, feeCategory: 'Tuition Fee' as FeeCategory, feeType: 'monthly' as const, amount: 2200 },
    { id: `FS-C${c}-BOK`, classNum: c, feeCategory: 'Book Fee' as FeeCategory, feeType: 'annual' as const, amount: 2900 },
    { id: `FS-C${c}-EXM`, classNum: c, feeCategory: 'Examination Fee' as FeeCategory, feeType: 'annual' as const, amount: 1500 },
    { id: `FS-C${c}-LAB`, classNum: c, feeCategory: 'Computer Lab Fee' as FeeCategory, feeType: 'annual' as const, amount: 1200 },
    { id: `FS-C${c}-UNF`, classNum: c, feeCategory: 'Uniform Fee' as FeeCategory, feeType: 'annual' as const, amount: 1800 }
  ]),
  // Class 9 & 10 (Secondary Board Preparation)
  ...[9, 10].flatMap((c) => [
    { id: `FS-C${c}-ADM`, classNum: c, feeCategory: 'Admission Fee' as FeeCategory, feeType: 'one-time' as const, amount: 9000 },
    { id: `FS-C${c}-TUI`, classNum: c, feeCategory: 'Tuition Fee' as FeeCategory, feeType: 'monthly' as const, amount: 2600 },
    { id: `FS-C${c}-BOK`, classNum: c, feeCategory: 'Book Fee' as FeeCategory, feeType: 'annual' as const, amount: 3400 },
    { id: `FS-C${c}-EXM`, classNum: c, feeCategory: 'Examination Fee' as FeeCategory, feeType: 'annual' as const, amount: 1800 },
    { id: `FS-C${c}-LAB`, classNum: c, feeCategory: 'Computer Lab Fee' as FeeCategory, feeType: 'annual' as const, amount: 1500 },
    { id: `FS-C${c}-UNF`, classNum: c, feeCategory: 'Uniform Fee' as FeeCategory, feeType: 'annual' as const, amount: 2000 }
  ])
];

// Pre-seeded students from Class 1 to 10
export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'SRA26-001',
    admissionNo: 'ADM/2026/041',
    rollNo: 1,
    name: 'Anurag Saikia',
    nameAssamese: 'অনুৰাগ শইকীয়া',
    gender: 'Male',
    dob: '2016-04-12',
    classNum: 5,
    section: 'A',
    fatherName: 'Diganta Saikia',
    motherName: 'Rupali Saikia',
    guardianName: 'Diganta Saikia',
    mobile: '9864011223',
    address: 'Zoo Road, Tiniali, Guwahati - 781024',
    admissionDate: '2024-03-10',
    academicYear: '2026-27',
    status: 'Active'
  },
  {
    id: 'SRA26-002',
    admissionNo: 'ADM/2026/042',
    rollNo: 2,
    name: 'Dikshita Barman',
    nameAssamese: 'দীক্ষিতা বৰ্মন',
    gender: 'Female',
    dob: '2015-08-20',
    classNum: 6,
    section: 'A',
    fatherName: 'Prabin Barman',
    motherName: 'Minoti Barman',
    guardianName: 'Prabin Barman',
    mobile: '9435022334',
    address: 'Hatigaon Chariali, Guwahati - 781038',
    admissionDate: '2023-03-15',
    academicYear: '2026-27',
    status: 'Active'
  },
  {
    id: 'SRA26-003',
    admissionNo: 'ADM/2026/043',
    rollNo: 3,
    name: 'Pratyush Borah',
    nameAssamese: 'প্ৰত্যুষ বৰা',
    gender: 'Male',
    dob: '2014-02-14',
    classNum: 7,
    section: 'B',
    fatherName: 'Hemanta Borah',
    motherName: 'Rekha Borah',
    guardianName: 'Hemanta Borah',
    mobile: '9854033445',
    address: 'Beltola Survey, Guwahati - 781028',
    admissionDate: '2022-04-01',
    academicYear: '2026-27',
    status: 'Active'
  },
  {
    id: 'SRA26-004',
    admissionNo: 'ADM/2026/044',
    rollNo: 4,
    name: 'Pallavi Das',
    nameAssamese: 'পল্লৱী দাস',
    gender: 'Female',
    dob: '2013-11-05',
    classNum: 8,
    section: 'A',
    fatherName: 'Biren Das',
    motherName: 'Jayanti Das',
    guardianName: 'Biren Das',
    mobile: '9706044556',
    address: 'Sixmile VIP Road, Guwahati - 781022',
    admissionDate: '2021-03-20',
    academicYear: '2026-27',
    status: 'Active'
  },
  {
    id: 'SRA26-005',
    admissionNo: 'ADM/2026/045',
    rollNo: 5,
    name: 'Abhishek Sarma',
    nameAssamese: 'অভিষেক শৰ্মা',
    gender: 'Male',
    dob: '2011-06-18',
    classNum: 10,
    section: 'A',
    fatherName: 'Dr. Karuna Sarma',
    motherName: 'Nandita Sarma',
    guardianName: 'Dr. Karuna Sarma',
    mobile: '9435155667',
    address: 'Silpukhuri, Guwahati - 781003',
    admissionDate: '2019-03-12',
    academicYear: '2026-27',
    status: 'Active'
  },
  {
    id: 'SRA26-006',
    admissionNo: 'ADM/2026/046',
    rollNo: 6,
    name: 'Rupjyoti Hazarika',
    nameAssamese: 'ৰূপজ্যোতি হাজৰিকা',
    gender: 'Male',
    dob: '2012-09-30',
    classNum: 9,
    section: 'B',
    fatherName: 'Gauranga Hazarika',
    motherName: 'Barnali Hazarika',
    guardianName: 'Gauranga Hazarika',
    mobile: '9864266778',
    address: 'Chandmari Colony, Guwahati - 781003',
    admissionDate: '2020-04-05',
    academicYear: '2026-27',
    status: 'Active'
  },
  {
    id: 'SRA26-007',
    admissionNo: 'ADM/2026/047',
    rollNo: 7,
    name: 'Bhaswati Mahanta',
    nameAssamese: 'ভাস্বতী মহন্ত',
    gender: 'Female',
    dob: '2019-01-22',
    classNum: 2,
    section: 'A',
    fatherName: 'Mukut Mahanta',
    motherName: 'Pratima Mahanta',
    guardianName: 'Mukut Mahanta',
    mobile: '9101277889',
    address: 'Kahilipara Main Road, Guwahati - 781019',
    admissionDate: '2025-03-18',
    academicYear: '2026-27',
    status: 'Active'
  },
  {
    id: 'SRA26-008',
    admissionNo: 'ADM/2026/048',
    rollNo: 8,
    name: 'Himangshu Kalita',
    nameAssamese: 'হিমাংশু কলিতা',
    gender: 'Male',
    dob: '2018-05-14',
    classNum: 3,
    section: 'B',
    fatherName: 'Nayan Kalita',
    motherName: 'Smriti Kalita',
    guardianName: 'Nayan Kalita',
    mobile: '9435388990',
    address: 'Ulubari, B.K. Kakoti Road, Guwahati - 781007',
    admissionDate: '2024-03-25',
    academicYear: '2026-27',
    status: 'Active'
  },
  {
    id: 'SRA26-009',
    admissionNo: 'ADM/2026/049',
    rollNo: 9,
    name: 'Priyanka Dutta',
    nameAssamese: 'প্ৰিয়ংকা দত্ত',
    gender: 'Female',
    dob: '2017-10-10',
    classNum: 4,
    section: 'A',
    fatherName: 'Sanjay Dutta',
    motherName: 'Mridula Dutta',
    guardianName: 'Sanjay Dutta',
    mobile: '9864499001',
    address: 'Dispur Supermarket, Guwahati - 781006',
    admissionDate: '2023-04-10',
    academicYear: '2026-27',
    status: 'Active'
  },
  {
    id: 'SRA26-010',
    admissionNo: 'ADM/2026/050',
    rollNo: 10,
    name: 'Gitartha Goswami',
    nameAssamese: 'গীতৰ্থ গোস্বামী',
    gender: 'Male',
    dob: '2020-03-08',
    classNum: 1,
    section: 'A',
    fatherName: 'Dhruba Goswami',
    motherName: 'Anindita Goswami',
    guardianName: 'Dhruba Goswami',
    mobile: '9954511223',
    address: 'Lachit Nagar, Guwahati - 781007',
    admissionDate: '2026-02-15',
    academicYear: '2026-27',
    status: 'Active'
  },
  {
    id: 'SRA26-011',
    admissionNo: 'ADM/2026/051',
    rollNo: 1,
    name: 'Nilav Das',
    nameAssamese: 'নীলাভ দাস',
    gender: 'Male',
    dob: '2022-05-10',
    classNum: 'ANKUR',
    section: 'A',
    fatherName: 'Bhaskar Das',
    motherName: 'Mamata Das',
    guardianName: 'Bhaskar Das',
    mobile: '9864112233',
    address: 'Zoo Road Tiniali, Guwahati - 781024',
    admissionDate: '2026-01-15',
    academicYear: '2026-27',
    status: 'Active'
  },
  {
    id: 'SRA26-012',
    admissionNo: 'ADM/2026/052',
    rollNo: 1,
    name: 'Manasvi Sharma',
    nameAssamese: 'মনস্বী শৰ্মা',
    gender: 'Female',
    dob: '2021-08-14',
    classNum: 'MUKUL',
    section: 'A',
    fatherName: 'Kamal Sharma',
    motherName: 'Anju Sharma',
    guardianName: 'Kamal Sharma',
    mobile: '9435223344',
    address: 'Uzanbazar, Guwahati - 781001',
    admissionDate: '2026-02-01',
    academicYear: '2026-27',
    status: 'Active'
  }
];

export class LocalLedgerDB {
  private static instance: LocalLedgerDB;

  private students: Student[] = [];
  private feeStructure: FeeStructureItem[] = [];
  private transactions: PaymentTransaction[] = [];
  private ledger: LedgerEntry[] = [];
  private auditLogs: AuditLog[] = [];
  private settings: SchoolSettings = INITIAL_SETTINGS;
  private users: User[] = INITIAL_USERS;
  private backups: BackupRecord[] = [];
  private activeUser: User = INITIAL_USERS[1]; // Default Accountant
  private license: EnterpriseLicense = INITIAL_LICENSE;
  private issuedLicenses: IssuedSchoolLicense[] = [];
  private supportTickets: SupportTicket[] = [];
  private homeworkList: HomeworkAssignment[] = [];
  private examResults: ExamResultSheet[] = [];
  private attendanceRecords: DailyAttendanceRecord[] = [];
  private classSubjects: ClassSubject[] = [];
  private teacherProfiles: ClassTeacherProfile[] = [];

  private constructor() {
    this.initialize();
  }

  public static getInstance(): LocalLedgerDB {
    if (!LocalLedgerDB.instance) {
      LocalLedgerDB.instance = new LocalLedgerDB();
    }
    return LocalLedgerDB.instance;
  }

  private initialize() {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        this.settings = JSON.parse(storedSettings);
      } else {
        this.saveSettings(INITIAL_SETTINGS);
      }

      const storedLicense = localStorage.getItem(STORAGE_KEYS.LICENSE);
      if (storedLicense) {
        this.license = JSON.parse(storedLicense);
        const days = this.getDaysRemaining();
        if (days < 0) {
          this.license.status = 'expired';
        } else if (this.license.isTrial) {
          this.license.status = 'trial';
        } else {
          this.license.status = 'active';
        }
      } else {
        this.license = { ...INITIAL_LICENSE };
        localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(this.license));
      }

      const storedIssued = localStorage.getItem(STORAGE_KEYS.ISSUED_LICENSES);
      if (storedIssued) {
        this.issuedLicenses = JSON.parse(storedIssued);
      } else {
        this.issuedLicenses = [...INITIAL_ISSUED_LICENSES];
        localStorage.setItem(STORAGE_KEYS.ISSUED_LICENSES, JSON.stringify(this.issuedLicenses));
      }

      const storedTickets = localStorage.getItem(STORAGE_KEYS.SUPPORT_TICKETS);
      if (storedTickets) {
        this.supportTickets = JSON.parse(storedTickets);
      } else {
        this.supportTickets = [...INITIAL_SUPPORT_TICKETS];
        localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(this.supportTickets));
      }

      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
        if (!this.users.some((u) => u.username === 'enterprise')) {
          this.users.unshift(INITIAL_USERS[0]);
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
        }
      } else {
        this.users = [...INITIAL_USERS];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      }

      const storedActiveUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (storedActiveUser) {
        this.activeUser = JSON.parse(storedActiveUser);
      }

      const storedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (storedStudents) {
        this.students = JSON.parse(storedStudents);
        // Ensure ANKUR and MUKUL sample students exist
        const hasAnkur = this.students.some((s) => s.classNum === 'ANKUR');
        const hasMukul = this.students.some((s) => s.classNum === 'MUKUL');
        if (!hasAnkur || !hasMukul) {
          const ankurStudent = INITIAL_STUDENTS.find((s) => s.classNum === 'ANKUR');
          const mukulStudent = INITIAL_STUDENTS.find((s) => s.classNum === 'MUKUL');
          if (!hasAnkur && ankurStudent) this.students.push(ankurStudent);
          if (!hasMukul && mukulStudent) this.students.push(mukulStudent);
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(this.students));
        }
      } else {
        this.students = [...INITIAL_STUDENTS];
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(this.students));
      }

      const storedFeeStructure = localStorage.getItem(STORAGE_KEYS.FEE_STRUCTURE);
      if (storedFeeStructure) {
        this.feeStructure = JSON.parse(storedFeeStructure);
        const hasAnkurFee = this.feeStructure.some((f) => f.classNum === 'ANKUR');
        const hasMukulFee = this.feeStructure.some((f) => f.classNum === 'MUKUL');
        if (!hasAnkurFee || !hasMukulFee) {
          const prePrimaryFees = INITIAL_FEE_STRUCTURE.filter(
            (f) => f.classNum === 'ANKUR' || f.classNum === 'MUKUL'
          );
          this.feeStructure.push(...prePrimaryFees);
          localStorage.setItem(STORAGE_KEYS.FEE_STRUCTURE, JSON.stringify(this.feeStructure));
        }
      } else {
        this.feeStructure = [...INITIAL_FEE_STRUCTURE];
        localStorage.setItem(STORAGE_KEYS.FEE_STRUCTURE, JSON.stringify(this.feeStructure));
      }

      const storedLedger = localStorage.getItem(STORAGE_KEYS.LEDGER);
      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

      if (storedLedger && storedTransactions) {
        this.ledger = JSON.parse(storedLedger);
        this.transactions = JSON.parse(storedTransactions);

        // Ensure newly added students have initial fee assignments in ledger
        let ledgerUpdated = false;
        this.students.forEach((student) => {
          const hasEntries = this.ledger.some((l) => l.studentId === student.id);
          if (!hasEntries) {
            const classFees = this.feeStructure.filter(
              (f) => String(f.classNum) === String(student.classNum)
            );
            classFees.forEach((fee) => {
              if (fee.feeType === 'annual' || fee.feeType === 'one-time') {
                this.ledger.push({
                  id: `LED-${student.id}-${fee.feeCategory.substring(0, 3)}`,
                  studentId: student.id,
                  date: '2026-04-01 08:00:00',
                  academicYear: '2026-27',
                  type: 'FEE_ASSIGNED',
                  referenceId: fee.id,
                  description: `Session Fee: ${fee.feeCategory}`,
                  debit: fee.amount,
                  credit: 0,
                  runningBalance: 0
                });
                ledgerUpdated = true;
              } else if (fee.feeType === 'monthly') {
                MONTH_NAMES.slice(0, 6).forEach((month, idx) => {
                  const monthPadded = String(idx + 4).padStart(2, '0');
                  this.ledger.push({
                    id: `LED-${student.id}-TUI-${month}`,
                    studentId: student.id,
                    date: `2026-${monthPadded}-01 08:00:00`,
                    academicYear: '2026-27',
                    type: 'FEE_ASSIGNED',
                    referenceId: `TUI-${month}`,
                    description: `Monthly Tuition Fee - ${month}`,
                    debit: fee.amount,
                    credit: 0,
                    runningBalance: 0
                  });
                  ledgerUpdated = true;
                });
              }
            });
          }
        });
        if (ledgerUpdated) {
          localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(this.ledger));
        }
      } else {
        // Generate baseline fee assignments and initial payments for rich offline experience
        this.seedInitialLedgerAndTransactions();
      }

      const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (storedAudit) {
        this.auditLogs = JSON.parse(storedAudit);
      } else {
        this.auditLogs = [
          {
            id: 'AUD-001',
            timestamp: '2026-09-26 09:30:15',
            user: 'Bhupen Kalita (Admin)',
            role: 'Administrator',
            action: 'Login',
            description: 'System started in Offline Local SQLite storage mode.'
          },
          {
            id: 'AUD-002',
            timestamp: '2026-09-26 10:15:00',
            user: 'System Cron',
            role: 'Administrator',
            action: 'Backup',
            description: 'Auto-snapshot DB backup saved: SRA_BACKUP_20260926_1015.json'
          }
        ];
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      }

      const storedBackups = localStorage.getItem(STORAGE_KEYS.BACKUPS);
      if (storedBackups) {
        this.backups = JSON.parse(storedBackups);
      } else {
        this.backups = [
          {
            id: 'BKP-001',
            filename: 'SRA_BACKUP_20260926_1015.sqlite.json',
            timestamp: '2026-09-26 10:15 AM',
            sizeKb: 142,
            recordCount: 86,
            status: 'Success'
          },
          {
            id: 'BKP-002',
            filename: 'SRA_BACKUP_20260925_1730.sqlite.json',
            timestamp: '2026-09-25 05:30 PM',
            sizeKb: 138,
            recordCount: 79,
            status: 'Success'
          }
        ];
        localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(this.backups));
      }

      const storedHomework = localStorage.getItem(STORAGE_KEYS.TEACHER_HOMEWORK);
      if (storedHomework) {
        this.homeworkList = JSON.parse(storedHomework);
      } else {
        this.homeworkList = this.getInitialHomework();
        localStorage.setItem(STORAGE_KEYS.TEACHER_HOMEWORK, JSON.stringify(this.homeworkList));
      }

      const storedExamResults = localStorage.getItem(STORAGE_KEYS.TEACHER_EXAM_RESULTS);
      if (storedExamResults) {
        this.examResults = JSON.parse(storedExamResults);
      } else {
        this.examResults = this.getInitialExamResults();
        localStorage.setItem(STORAGE_KEYS.TEACHER_EXAM_RESULTS, JSON.stringify(this.examResults));
      }

      const storedAttendance = localStorage.getItem(STORAGE_KEYS.TEACHER_ATTENDANCE);
      if (storedAttendance) {
        this.attendanceRecords = JSON.parse(storedAttendance);
      } else {
        this.attendanceRecords = this.getInitialAttendance();
        localStorage.setItem(STORAGE_KEYS.TEACHER_ATTENDANCE, JSON.stringify(this.attendanceRecords));
      }

      const storedSubjects = localStorage.getItem(STORAGE_KEYS.TEACHER_SUBJECTS);
      if (storedSubjects) {
        this.classSubjects = JSON.parse(storedSubjects);
      } else {
        this.classSubjects = this.getInitialClassSubjects();
        localStorage.setItem(STORAGE_KEYS.TEACHER_SUBJECTS, JSON.stringify(this.classSubjects));
      }

      const storedProfiles = localStorage.getItem(STORAGE_KEYS.TEACHER_PROFILES);
      if (storedProfiles) {
        this.teacherProfiles = JSON.parse(storedProfiles);
      } else {
        this.teacherProfiles = this.getInitialTeacherProfiles();
        localStorage.setItem(STORAGE_KEYS.TEACHER_PROFILES, JSON.stringify(this.teacherProfiles));
      }
    } catch (e) {
      console.error('Failed to initialize local database', e);
    }
  }

  private seedInitialLedgerAndTransactions() {
    this.ledger = [];
    this.transactions = [];

    // Assign fees for each student for academic year 2026-27
    const year = '2026-27';

    this.students.forEach((student) => {
      const classFees = this.feeStructure.filter((f) => f.classNum === student.classNum);
      
      // Assign annual/one-time fees
      classFees.forEach((fee) => {
        if (fee.feeType === 'annual' || fee.feeType === 'one-time') {
          this.ledger.push({
            id: `LED-${student.id}-${fee.feeCategory.substring(0, 3)}`,
            studentId: student.id,
            date: '2026-04-01 08:00:00',
            academicYear: year,
            type: 'FEE_ASSIGNED',
            referenceId: fee.id,
            description: `Session Fee: ${fee.feeCategory}`,
            debit: fee.amount,
            credit: 0,
            runningBalance: 0 // recomputed later
          });
        } else if (fee.feeType === 'monthly') {
          // Assign monthly tuition for first 6 months (April to Sept)
          MONTH_NAMES.slice(0, 6).forEach((month, idx) => {
            const monthPadded = String(idx + 4).padStart(2, '0');
            this.ledger.push({
              id: `LED-${student.id}-TUI-${month}`,
              studentId: student.id,
              date: `2026-${monthPadded}-01 08:00:00`,
              academicYear: year,
              type: 'FEE_ASSIGNED',
              referenceId: `TUI-${month}`,
              description: `Monthly Tuition Fee - ${month}`,
              debit: fee.amount,
              credit: 0,
              runningBalance: 0
            });
          });
        }
      });
    });

    // Seed realistic payments for some students so reports and receipts are live
    const seedTransactionsData = [
      {
        studentId: 'SRA26-001', // Anurag Saikia (Class 5)
        receiptNo: 'REC-2026-00401',
        date: '2026-09-26 10:14:20',
        amountPaid: 6500,
        method: 'UPI' as const,
        upiUtr: 'UTR9832049182',
        items: [
          { feeCategory: 'Admission Fee' as FeeCategory, assignedAmount: 6500, amountPaid: 6500, remainingDue: 0 }
        ]
      },
      {
        studentId: 'SRA26-002', // Dikshita Barman (Class 6)
        receiptNo: 'REC-2026-00402',
        date: '2026-09-26 11:20:05',
        amountPaid: 4400,
        method: 'Cash' as const,
        items: [
          { feeCategory: 'Tuition Fee' as FeeCategory, month: 'April', assignedAmount: 2200, amountPaid: 2200, remainingDue: 0 },
          { feeCategory: 'Tuition Fee' as FeeCategory, month: 'May', assignedAmount: 2200, amountPaid: 2200, remainingDue: 0 }
        ]
      },
      {
        studentId: 'SRA26-003', // Pratyush Borah (Class 7)
        receiptNo: 'REC-2026-00403',
        date: '2026-09-25 14:15:30',
        amountPaid: 5000,
        method: 'Cheque' as const,
        chequeNumber: '741289',
        chequeBank: 'State Bank of India',
        chequeDate: '2026-09-25',
        items: [
          { feeCategory: 'Admission Fee' as FeeCategory, assignedAmount: 7500, amountPaid: 5000, remainingDue: 2500 }
        ]
      },
      {
        studentId: 'SRA26-005', // Abhishek Sarma (Class 10)
        receiptNo: 'REC-2026-00404',
        date: '2026-09-26 11:50:12',
        amountPaid: 9000,
        method: 'Bank Transfer' as const,
        bankReference: 'NEFT-AXIS-9921',
        items: [
          { feeCategory: 'Admission Fee' as FeeCategory, assignedAmount: 9000, amountPaid: 9000, remainingDue: 0 }
        ]
      }
    ];

    seedTransactionsData.forEach((tx) => {
      const student = this.students.find((s) => s.id === tx.studentId)!;
      const prevDue = this.calculateStudentDueSync(student.id);

      const newTx: PaymentTransaction = {
        receiptNo: tx.receiptNo,
        date: tx.date,
        studentId: student.id,
        studentName: student.name,
        classNum: student.classNum,
        section: student.section,
        academicYear: year,
        items: tx.items,
        grossAmount: tx.amountPaid,
        discountAmount: 0,
        discountType: 'fixed',
        netAmountPaid: tx.amountPaid,
        paymentMethod: tx.method,
        upiUtr: tx.upiUtr,
        chequeNumber: tx.chequeNumber,
        chequeBank: tx.chequeBank,
        chequeDate: tx.chequeDate,
        bankReference: tx.bankReference,
        receivedBy: 'M. Sharma (Accountant)',
        status: 'Completed',
        previousOutstanding: prevDue,
        remainingOutstanding: Math.max(0, prevDue - tx.amountPaid)
      };

      this.transactions.push(newTx);

      // Ledger credit entry
      this.ledger.push({
        id: `LED-${tx.receiptNo}`,
        studentId: student.id,
        date: tx.date,
        academicYear: year,
        type: 'PAYMENT',
        referenceId: tx.receiptNo,
        description: `Fee Payment [${tx.method}] - ${tx.items.map((i) => i.feeCategory).join(', ')}`,
        debit: 0,
        credit: tx.amountPaid,
        runningBalance: 0
      });
    });

    this.persistLedger();
    this.persistTransactions();
  }

  private persistStudents() {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(this.students));
  }

  private persistTransactions() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
  }

  private persistLedger() {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(this.ledger));
  }

  private persistAudit() {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
  }

  private persistBackups() {
    localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(this.backups));
  }

  // USER & AUTH METHODS
  public getActiveUser(): User {
    return this.activeUser;
  }

  public setActiveUser(user: User) {
    this.activeUser = user;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    this.logAudit('Login', `User ${user.fullName} switched active session (${user.role}).`);
  }

  public getUsers(): User[] {
    return this.users;
  }

  public addUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: `USR-0${this.users.length + 1}`
    };
    this.users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    this.logAudit('Settings Change', `Added user ${user.username} with role ${user.role}.`);
    return newUser;
  }

  public updateUserRole(id: string, role: User['role']) {
    this.users = this.users.map((u) => (u.id === id ? { ...u, role } : u));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    this.logAudit('Settings Change', `Updated user ${id} role to ${role}.`);
  }

  // ENTERPRISE LICENSE & VALIDITY METHODS
  public getLicense(): EnterpriseLicense {
    const days = this.getDaysRemaining();
    if (days < 0 && this.license.status !== 'expired') {
      this.license.status = 'expired';
      this.saveLicense(this.license);
    }
    return { ...this.license };
  }

  public saveLicense(updated: EnterpriseLicense) {
    this.license = { ...updated };
    localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(this.license));
  }

  public updateLicense(partial: Partial<EnterpriseLicense>): EnterpriseLicense {
    this.license = {
      ...this.license,
      ...partial,
      lastModifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastModifiedBy: this.activeUser?.fullName || 'Enterprise Administrator'
    };
    const daysRemaining = this.getDaysRemaining();
    if (daysRemaining < 0) {
      this.license.status = 'expired';
    } else if (this.license.isTrial) {
      this.license.status = 'trial';
    } else {
      this.license.status = 'active';
    }

    localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(this.license));
    this.logAudit('Enterprise License', `Updated enterprise license parameters for ${this.license.organizationName}.`);
    return { ...this.license };
  }

  public modifyValidity(newValidUntil: string, reason?: string): EnterpriseLicense {
    const prevDate = this.license.validUntil;
    this.license.validUntil = newValidUntil;
    this.license.lastModifiedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.license.lastModifiedBy = this.activeUser?.fullName || 'Enterprise Administrator';

    const daysRemaining = this.getDaysRemaining();
    if (daysRemaining >= 0) {
      this.license.status = this.license.isTrial ? 'trial' : 'active';
    } else {
      this.license.status = 'expired';
    }

    localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(this.license));
    this.logAudit(
      'Enterprise License',
      `Modified software validity from ${prevDate} to ${newValidUntil}. ${reason ? `Reason: ${reason}` : ''}`
    );
    return { ...this.license };
  }

  public grantTrialDays(days: number, reason?: string): EnterpriseLicense {
    const currExpiry = new Date(this.license.validUntil);
    const baseDate = !isNaN(currExpiry.getTime()) && currExpiry > new Date() ? currExpiry : new Date();
    baseDate.setDate(baseDate.getDate() + days);
    const newValidUntil = baseDate.toISOString().split('T')[0];

    this.license.validUntil = newValidUntil;
    this.license.isTrial = true;
    this.license.tier = 'trial';
    this.license.status = 'trial';
    this.license.trialDaysGranted = (this.license.trialDaysGranted || 0) + days;
    this.license.lastModifiedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.license.lastModifiedBy = this.activeUser?.fullName || 'Enterprise Administrator';

    localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(this.license));
    this.logAudit(
      'Enterprise License',
      `Granted +${days} trial days. New validity expiry: ${newValidUntil}. ${reason || ''}`
    );
    return { ...this.license };
  }

  public extendValidity(days: number, reason?: string): EnterpriseLicense {
    const currExpiry = new Date(this.license.validUntil);
    const baseDate = !isNaN(currExpiry.getTime()) && currExpiry > new Date() ? currExpiry : new Date();
    baseDate.setDate(baseDate.getDate() + days);
    const newValidUntil = baseDate.toISOString().split('T')[0];

    this.license.validUntil = newValidUntil;
    if (this.license.status === 'expired') {
      this.license.status = this.license.isTrial ? 'trial' : 'active';
    }
    this.license.lastModifiedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.license.lastModifiedBy = this.activeUser?.fullName || 'Enterprise Administrator';

    localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(this.license));
    this.logAudit(
      'Enterprise License',
      `Extended validity by +${days} days. New validity expiry: ${newValidUntil}. ${reason || ''}`
    );
    return { ...this.license };
  }

  public getLedger(): LedgerEntry[] {
    return [...this.ledger];
  }

  public resetTrial(days = 30): EnterpriseLicense {
    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + days);

    this.license = {
      ...this.license,
      isTrial: true,
      tier: 'trial',
      status: 'trial',
      issuedDate: today.toISOString().split('T')[0],
      validUntil: expiry.toISOString().split('T')[0],
      trialDaysGranted: days,
      lastModifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastModifiedBy: this.activeUser?.fullName || 'Enterprise Administrator',
      notes: `Fresh ${days}-day evaluation trial initiated.`
    };

    localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(this.license));
    this.logAudit('Enterprise License', `Reset evaluation trial to ${days} days (Valid until ${this.license.validUntil}).`);
    return { ...this.license };
  }

  public activateEnterpriseLicense(key: string, orgName?: string): { success: boolean; message: string; license: EnterpriseLicense } {
    if (!key || key.trim().length < 8) {
      return { success: false, message: 'Invalid license key format. Expected SRA-ENT-XXXX-XXXX-XXXX', license: this.license };
    }

    const today = new Date();
    const expiry = new Date();
    expiry.setFullYear(today.getFullYear() + 1);

    this.license = {
      ...this.license,
      licenseKey: key.toUpperCase().trim(),
      organizationName: orgName || this.license.organizationName,
      isTrial: false,
      tier: 'enterprise',
      status: 'active',
      issuedDate: today.toISOString().split('T')[0],
      validUntil: expiry.toISOString().split('T')[0],
      maxStudents: 10000,
      lastModifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastModifiedBy: this.activeUser?.fullName || 'Enterprise Administrator',
      notes: 'Commercial Enterprise Pro License activated.'
    };

    localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(this.license));
    this.logAudit('Enterprise License', `Activated Enterprise License key ${key} for ${this.license.organizationName}.`);
    return { success: true, message: 'Enterprise License activated successfully!', license: this.license };
  }

  public getDaysRemaining(): number {
    if (!this.license || !this.license.validUntil) return 0;
    if (this.license.validUntil.startsWith('209') || this.license.validUntil.startsWith('210')) {
      return 9999;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(this.license.validUntil);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public isLicenseValid(): boolean {
    return this.getDaysRemaining() >= 0;
  }

  public validateEnterprisePasskey(passkey: string): boolean {
    const key = passkey.trim();
    return (
      key === 'ENTERPRISE-2026' ||
      key === 'admin123' ||
      key === 'admin' ||
      key === 'SRA2026' ||
      key === 'superadmin' ||
      key === 'enterprise'
    );
  }

  // ENTERPRISE PARTNER & VENDOR METHODS
  public getIssuedLicenses(): IssuedSchoolLicense[] {
    return [...this.issuedLicenses];
  }

  public issueNewSchoolLicense(data: Omit<IssuedSchoolLicense, 'id' | 'issuedAt'>): IssuedSchoolLicense {
    const today = new Date().toISOString().split('T')[0];
    const newLicense: IssuedSchoolLicense = {
      ...data,
      id: `LIC-${String(this.issuedLicenses.length + 1).padStart(3, '0')}`,
      issuedAt: today
    };
    this.issuedLicenses.unshift(newLicense);
    localStorage.setItem(STORAGE_KEYS.ISSUED_LICENSES, JSON.stringify(this.issuedLicenses));
    this.logAudit('Enterprise License', `Vendor issued license ${newLicense.licenseKey} for ${newLicense.schoolName}.`);
    return newLicense;
  }

  public extendIssuedLicense(key: string, days: number): IssuedSchoolLicense | null {
    const lic = this.issuedLicenses.find((l) => l.licenseKey === key);
    if (!lic) return null;
    const baseDate = new Date(lic.validUntil) > new Date() ? new Date(lic.validUntil) : new Date();
    baseDate.setDate(baseDate.getDate() + days);
    lic.validUntil = baseDate.toISOString().split('T')[0];
    lic.status = lic.tier === 'trial' ? 'trial' : 'active';

    localStorage.setItem(STORAGE_KEYS.ISSUED_LICENSES, JSON.stringify(this.issuedLicenses));
    this.logAudit('Enterprise License', `Extended license ${key} for ${lic.schoolName} by ${days} days.`);

    if (this.license.licenseKey === key) {
      this.grantTrialDays(days, `Synchronized extension from Enterprise Partner Portal`);
    }
    return { ...lic };
  }

  public applyIssuedLicenseToCurrentSchool(key: string): boolean {
    const lic = this.issuedLicenses.find((l) => l.licenseKey === key);
    if (!lic) return false;

    this.license = {
      licenseKey: lic.licenseKey,
      organizationName: lic.schoolName,
      tier: lic.tier,
      status: lic.status,
      issuedDate: lic.issuedAt,
      validUntil: lic.validUntil,
      isTrial: lic.tier === 'trial',
      trialDaysGranted: 30,
      maxStudents: lic.maxStudents,
      hardwareFingerprint: lic.hardwareFingerprint || this.license.hardwareFingerprint,
      licensedToEmail: lic.contactEmail,
      features: { ...lic.features },
      lastModifiedBy: 'Enterprise Partner Portal',
      lastModifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      notes: lic.notes
    };

    localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(this.license));
    this.logAudit('Enterprise License', `Directly applied issued license ${lic.licenseKey} to local school installation.`);
    return true;
  }

  // TECHNICAL SUPPORT DESK METHODS
  public getSupportTickets(): SupportTicket[] {
    return [...this.supportTickets];
  }

  public createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'ticketNo' | 'createdAt'>): SupportTicket {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newTicket: SupportTicket = {
      ...ticket,
      id: `TCK-${Date.now()}`,
      ticketNo: `SRA-SUP-${randNum}`,
      createdAt: dateFormatted
    };
    this.supportTickets.unshift(newTicket);
    localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(this.supportTickets));
    return newTicket;
  }

  public updateSupportTicketStatus(id: string, status: SupportTicket['status']): void {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.supportTickets = this.supportTickets.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status,
          resolvedAt: status === 'Resolved' || status === 'Closed' ? dateFormatted : undefined
        };
      }
      return t;
    });
    localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(this.supportTickets));
  }

  // SETTINGS
  public getSettings(): SchoolSettings {
    if (!this.settings.feeCategoriesConfig || this.settings.feeCategoriesConfig.length === 0) {
      this.settings.feeCategoriesConfig = [...DEFAULT_FEE_CATEGORIES_CONFIG];
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    }
    return { ...this.settings };
  }

  public saveSettings(newSettings: SchoolSettings) {
    this.settings = newSettings;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    this.logAudit('Settings Change', 'School profile, fee categories, and printer settings updated.');
  }

  public getFeeCategoriesConfig(): FeeCategoryConfigItem[] {
    const s = this.getSettings();
    return s.feeCategoriesConfig || [...DEFAULT_FEE_CATEGORIES_CONFIG];
  }

  public saveFeeCategoriesConfig(configs: FeeCategoryConfigItem[]): void {
    const s = this.getSettings();
    s.feeCategoriesConfig = configs;
    this.saveSettings(s);
  }

  // STUDENTS
  public getAllStudents(): Student[] {
    return [...this.students];
  }

  public getStudentById(id: string): Student | undefined {
    if (!id) return undefined;
    const cleanId = id.trim().toUpperCase();
    return this.students.find(
      (s) => s.id.toUpperCase() === cleanId || s.admissionNo.toUpperCase() === cleanId
    );
  }

  public addStudent(studentData: Omit<Student, 'id'> & { id?: string }): Student {
    const nextNum = this.students.length + 1;
    const newId = studentData.id || `SRA26-${String(nextNum).padStart(3, '0')}`;
    
    // Check duplicate
    if (this.students.some((s) => s.id.toUpperCase() === newId.toUpperCase())) {
      throw new Error(`Student ID ${newId} already exists in offline database.`);
    }

    const student: Student = {
      ...studentData,
      id: newId
    };

    this.students.unshift(student);
    this.persistStudents();

    // Assign initial standard fees for student's class
    const classFees = this.feeStructure.filter((f) => String(f.classNum) === String(student.classNum));
    classFees.forEach((fee) => {
      if (fee.feeType === 'annual' || fee.feeType === 'one-time') {
        this.ledger.push({
          id: `LED-${student.id}-${fee.feeCategory.substring(0, 3)}`,
          studentId: student.id,
          date: new Date().toISOString(),
          academicYear: student.academicYear,
          type: 'FEE_ASSIGNED',
          referenceId: fee.id,
          description: `Session Fee: ${fee.feeCategory}`,
          debit: fee.amount,
          credit: 0,
          runningBalance: 0
        });
      } else if (fee.feeType === 'monthly') {
        MONTH_NAMES.slice(0, 6).forEach((month, idx) => {
          const monthPadded = String(idx + 4).padStart(2, '0');
          this.ledger.push({
            id: `LED-${student.id}-TUI-${month}`,
            studentId: student.id,
            date: `2026-${monthPadded}-01 08:00:00`,
            academicYear: student.academicYear,
            type: 'FEE_ASSIGNED',
            referenceId: `TUI-${month}`,
            description: `Monthly Tuition Fee - ${month}`,
            debit: fee.amount,
            credit: 0,
            runningBalance: 0
          });
        });
      }
    });

    this.persistLedger();
    this.logAudit('Student Created', `Registered student ${student.name} (${student.id}) in Class ${student.classNum}-${student.section}.`);
    return student;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student {
    const idx = this.students.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Student not found');
    this.students[idx] = { ...this.students[idx], ...updates };
    this.persistStudents();
    this.logAudit('Student Edited', `Updated profile of student ${this.students[idx].name} (${id}).`);
    return this.students[idx];
  }

  public toggleStudentStatus(id: string): Student {
    const student = this.getStudentById(id);
    if (!student) throw new Error('Student not found');
    const newStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    student.status = newStatus;
    this.persistStudents();
    this.logAudit('Student Deactivated', `Changed status of ${student.name} to ${newStatus}.`);
    return student;
  }

  // FEE STRUCTURE
  public getFeeStructure(): FeeStructureItem[] {
    return [...this.feeStructure];
  }

  public updateFeeStructure(items: FeeStructureItem[]) {
    this.feeStructure = items;
    localStorage.setItem(STORAGE_KEYS.FEE_STRUCTURE, JSON.stringify(items));
    this.logAudit('Fee Structure Change', 'Fee schedule matrix updated across classes.');
  }

  // LEDGER & OUTSTANDING CALCULATIONS
  // Strict non-destructive accounting: Outstanding = Sum(Debits) - Sum(Credits)
  public calculateStudentDueSync(studentId: string, academicYear?: string): number {
    const entries = this.ledger.filter((entry) => {
      if (entry.studentId !== studentId) return false;
      if (academicYear && entry.academicYear !== academicYear) return false;
      return true;
    });

    const totalDebit = entries.reduce((acc, curr) => acc + curr.debit, 0);
    const totalCredit = entries.reduce((acc, curr) => acc + curr.credit, 0);
    return Math.max(0, totalDebit - totalCredit);
  }

  public getStudentLedger(studentId: string): LedgerEntry[] {
    const entries = this.ledger
      .filter((e) => e.studentId === studentId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let balance = 0;
    return entries.map((entry) => {
      balance += entry.debit - entry.credit;
      return {
        ...entry,
        runningBalance: balance
      };
    });
  }

  public getStudentCategoryBreakdown(studentId: string, academicYear = '2026-27') {
    const student = this.getStudentById(studentId);
    if (!student) return [];

    const categories: FeeCategory[] = [
      'Admission Fee',
      'Tuition Fee',
      'Book Fee',
      'Examination Fee',
      'Computer Lab Fee',
      'Uniform Fee',
      'Transport Fee',
      'Other Fee'
    ];

    const studentLedger = this.getStudentLedger(studentId).filter((e) => e.academicYear === academicYear);

    return categories.map((cat) => {
      // Find debits for this category
      const assigned = studentLedger
        .filter((e) => e.type === 'FEE_ASSIGNED' && e.description.toLowerCase().includes(cat.toLowerCase()))
        .reduce((sum, e) => sum + e.debit, 0);

      // Find credits attributed to this category
      const paid = this.transactions
        .filter((t) => t.studentId === studentId && t.status === 'Completed' && t.academicYear === academicYear)
        .flatMap((t) => t.items)
        .filter((item) => item.feeCategory === cat)
        .reduce((sum, item) => sum + item.amountPaid, 0);

      const due = Math.max(0, assigned - paid);

      return {
        feeCategory: cat,
        total: assigned,
        paid,
        due
      };
    }).filter((cat) => cat.total > 0 || cat.due > 0);
  }

  public getMonthlyTuitionBreakdown(studentId: string, academicYear = '2026-27'): MonthFeeStatus[] {
    const student = this.getStudentById(studentId);
    if (!student) return [];

    const classFee = this.feeStructure.find(
      (f) => String(f.classNum) === String(student.classNum) && f.feeCategory === 'Tuition Fee'
    );
    const standardMonthly = classFee ? classFee.amount : 2000;

    const studentTransactions = this.transactions.filter(
      (t) => t.studentId === studentId && t.status === 'Completed' && t.academicYear === academicYear
    );

    return MONTH_NAMES.map((month) => {
      const assignedAmount = standardMonthly;
      const monthPaid = studentTransactions
        .flatMap((t) => t.items)
        .filter((i) => i.feeCategory === 'Tuition Fee' && i.month === month)
        .reduce((acc, curr) => acc + curr.amountPaid, 0);

      const dueAmount = Math.max(0, assignedAmount - monthPaid);
      let status: MonthFeeStatus['status'] = 'DUE';
      if (dueAmount === 0 && monthPaid > 0) {
        status = 'PAID';
      } else if (monthPaid > 0 && dueAmount > 0) {
        status = 'PARTIAL';
      }

      return {
        month,
        assignedAmount,
        paidAmount: monthPaid,
        dueAmount,
        status
      };
    });
  }

  /**
   * Identifies students with fee payments due within the next N days (default 7 days).
   * Takes student-specific payment due dates or calculates from the school's billing cycle.
   */
  public getStudentsWithPaymentsDueWithin(withinDays = 7, refDate = new Date()): PaymentDueAlert[] {
    const alerts: PaymentDueAlert[] = [];
    const ref = new Date(refDate);
    ref.setHours(0, 0, 0, 0);

    for (const student of this.students) {
      if (student.status !== 'Active') continue;

      const totalDue = this.calculateStudentDueSync(student.id);
      if (totalDue <= 0) continue;

      // Determine due date
      let dueDateStr = student.nextPaymentDueDate;
      if (!dueDateStr) {
        // Fallback: staggered offset by roll number (0 to 6 days) so alerts are visible and realistic
        const offsetDays = ((student.rollNo + 1) % 7);
        const derivedDate = new Date(ref.getTime() + offsetDays * 86400000);
        dueDateStr = derivedDate.toISOString().split('T')[0];
      }

      const dueDate = new Date(dueDateStr);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - ref.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // Include if due within withinDays (up to 7 days, plus overdue up to 5 days)
      if (diffDays >= -5 && diffDays <= withinDays) {
        const breakdown = this.getStudentCategoryBreakdown(student.id);
        const tuitionDue = breakdown.find((b) => b.feeCategory === 'Tuition Fee')?.due || 0;
        const booksDue = breakdown.find((b) => b.feeCategory === 'Book Fee')?.due || 0;
        const examDue = breakdown.find((b) => b.feeCategory === 'Examination Fee')?.due || 0;
        const otherDue = Math.max(0, totalDue - (tuitionDue + booksDue + examDue));

        let primaryFeeCategory = 'School Fee';
        if (tuitionDue > 0) primaryFeeCategory = 'Tuition Fee';
        else if (examDue > 0) primaryFeeCategory = 'Exam Fee';
        else if (booksDue > 0) primaryFeeCategory = 'Book Fee';
        else if (otherDue > 0) primaryFeeCategory = 'Admission/Other';

        const urgency: PaymentDueAlert['urgency'] =
          diffDays <= 1 ? 'urgent' : diffDays <= 3 ? 'moderate' : 'upcoming';

        alerts.push({
          student,
          totalDue,
          dueDate: dueDateStr,
          daysLeft: Math.max(0, diffDays),
          isOverdue: diffDays < 0,
          primaryFeeCategory,
          tuitionDue,
          booksDue,
          examDue,
          otherDue,
          urgency
        });
      }
    }

    // Sort: most urgent first (due today / tomorrow), then by amount due descending
    return alerts.sort((a, b) => {
      if (a.daysLeft !== b.daysLeft) return a.daysLeft - b.daysLeft;
      return b.totalDue - a.totalDue;
    });
  }

  public updateStudentNextPaymentDueDate(studentId: string, dueDate: string): void {
    const student = this.students.find((s) => s.id === studentId);
    if (student) {
      student.nextPaymentDueDate = dueDate;
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(this.students));
      this.logAudit(
        'Student Edited',
        `Updated next payment due date for ${student.name} (${student.id}) to ${dueDate}`
      );
    }
  }

  // TRANSACTIONS & PAYMENT RECORDING
  public getAllTransactions(): PaymentTransaction[] {
    return [...this.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  public getTransactionByReceipt(receiptNo: string): PaymentTransaction | undefined {
    return this.transactions.find((t) => t.receiptNo === receiptNo);
  }

  public recordPayment(params: {
    studentId: string;
    items: { feeCategory: FeeCategory; month?: string; assignedAmount: number; amountPaid: number; remainingDue: number }[];
    discountAmount: number;
    discountType: 'fixed' | 'percentage';
    discountReason?: PaymentTransaction['discountReason'];
    paymentMethod: PaymentTransaction['paymentMethod'];
    upiUtr?: string;
    chequeNumber?: string;
    chequeBank?: string;
    chequeDate?: string;
    bankReference?: string;
    notes?: string;
  }): PaymentTransaction {
    const student = this.getStudentById(params.studentId);
    if (!student) throw new Error('Student not found in offline database.');

    const prevDue = this.calculateStudentDueSync(student.id);

    const grossAmount = params.items.reduce((sum, item) => sum + item.amountPaid, 0);
    const netAmountPaid = Math.max(0, grossAmount - (params.discountAmount || 0));

    if (netAmountPaid <= 0 && params.discountAmount === 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const nextReceiptNum = 400 + this.transactions.length + 1;
    const receiptNo = `REC-2026-${String(nextReceiptNum).padStart(5, '0')}`;
    const nowIso = new Date().toISOString();

    const remainingDue = Math.max(0, prevDue - grossAmount);

    const transaction: PaymentTransaction = {
      receiptNo,
      date: nowIso,
      studentId: student.id,
      studentName: student.name,
      classNum: student.classNum,
      section: student.section,
      academicYear: this.settings.academicYear,
      items: params.items,
      grossAmount,
      discountAmount: params.discountAmount || 0,
      discountType: params.discountType,
      discountReason: params.discountReason,
      netAmountPaid,
      paymentMethod: params.paymentMethod,
      upiUtr: params.upiUtr,
      chequeNumber: params.chequeNumber,
      chequeBank: params.chequeBank,
      chequeDate: params.chequeDate,
      bankReference: params.bankReference,
      notes: params.notes,
      receivedBy: `${this.activeUser.fullName} (${this.activeUser.role})`,
      status: 'Completed',
      previousOutstanding: prevDue,
      remainingOutstanding: remainingDue
    };

    this.transactions.unshift(transaction);
    this.persistTransactions();

    // 1. Post Payment credit to Ledger
    this.ledger.push({
      id: `LED-${receiptNo}-PAY`,
      studentId: student.id,
      date: nowIso,
      academicYear: this.settings.academicYear,
      type: 'PAYMENT',
      referenceId: receiptNo,
      description: `Payment [${params.paymentMethod}] ${params.upiUtr ? 'UTR:' + params.upiUtr : ''} - ${params.items.map((i) => i.feeCategory).join(', ')}`,
      debit: 0,
      credit: netAmountPaid,
      runningBalance: 0
    });

    // 2. If discount applied, log discount as separate credit entry in ledger for audit
    if (params.discountAmount > 0) {
      this.ledger.push({
        id: `LED-${receiptNo}-DISC`,
        studentId: student.id,
        date: nowIso,
        academicYear: this.settings.academicYear,
        type: 'DISCOUNT',
        referenceId: receiptNo,
        description: `Concession Approved: ${params.discountReason || 'Discount'} (${params.discountType === 'percentage' ? '%' : '₹'})`,
        debit: 0,
        credit: params.discountAmount,
        runningBalance: 0
      });
      this.logAudit('Discount', `Applied discount ₹${params.discountAmount} (${params.discountReason}) on ${receiptNo}.`);
    }

    this.persistLedger();
    this.logAudit(
      'Payment Collected',
      `Collected ₹${netAmountPaid} from ${student.name} (${student.id}) via ${params.paymentMethod}. Receipt: ${receiptNo}`
    );

    return transaction;
  }

  // CANCEL TRANSACTION (NEVER HARD DELETE)
  public cancelTransaction(receiptNo: string, reason: string): PaymentTransaction {
    const tx = this.getTransactionByReceipt(receiptNo);
    if (!tx) throw new Error('Transaction receipt not found.');
    if (tx.status !== 'Completed') throw new Error(`Cannot cancel a ${tx.status} transaction.`);

    const nowIso = new Date().toISOString();
    tx.status = 'Cancelled';
    tx.cancellationReason = reason;
    tx.cancelledAt = nowIso;
    tx.cancelledBy = `${this.activeUser.fullName} (${this.activeUser.role})`;

    this.persistTransactions();

    // Reversal entry in Ledger: debit to reverse the credit
    this.ledger.push({
      id: `LED-${receiptNo}-REV`,
      studentId: tx.studentId,
      date: nowIso,
      academicYear: tx.academicYear,
      type: 'CANCELLATION',
      referenceId: receiptNo,
      description: `Reversal of Cancelled Receipt ${receiptNo}: ${reason}`,
      debit: tx.netAmountPaid + (tx.discountAmount || 0),
      credit: 0,
      runningBalance: 0
    });

    this.persistLedger();
    this.logAudit('Payment Cancelled', `Cancelled Receipt ${receiptNo} for ₹${tx.netAmountPaid}. Reason: ${reason}`);

    return tx;
  }

  // AUDIT LOG
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public logAudit(action: AuditLog['action'], description: string) {
    const entry: AuditLog = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: this.activeUser ? `${this.activeUser.fullName} (${this.activeUser.role})` : 'Offline System',
      role: this.activeUser?.role || 'Administrator',
      action,
      description
    };
    this.auditLogs.unshift(entry);
    this.persistAudit();
  }

  // BACKUP & RESTORE
  public getBackups(): BackupRecord[] {
    return [...this.backups];
  }

  public createBackupNow(): BackupRecord {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    const filename = `SRA_BACKUP_${dateStr}_${timeStr}.sqlite.json`;

    const snapshot = {
      schemaVersion: '1.0',
      type: 'SQLite_JSON_Offline_Dump',
      createdAt: now.toISOString(),
      school: this.settings.schoolName,
      academicYear: this.settings.academicYear,
      tables: {
        students: this.students,
        feeStructure: this.feeStructure,
        transactions: this.transactions,
        ledger: this.ledger,
        users: this.users,
        settings: this.settings,
        license: this.license,
        auditLogs: this.auditLogs
      }
    };

    const jsonString = JSON.stringify(snapshot, null, 2);
    const sizeKb = Math.round(jsonString.length / 1024);

    const record: BackupRecord = {
      id: `BKP-${Date.now()}`,
      filename,
      timestamp: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isoTimestamp: now.toISOString(),
      sizeKb,
      recordCount: this.students.length + this.transactions.length + this.ledger.length,
      status: 'Success'
    };

    this.backups.unshift(record);
    this.persistBackups();
    this.settings.lastBackupTimestamp = now.toISOString();
    this.saveSettings(this.settings);
    this.clearBackupReminderDismissal();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sra-backup-status-changed'));
    }

    // Trigger download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.logAudit('Backup', `Created snapshot backup ${filename} (${sizeKb} KB, ${record.recordCount} records).`);
    return record;
  }

  // BACKUP REMINDER & STATUS CHECK HELPERS
  public getLastBackupInfo(thresholdDays = 7): {
    lastBackup: BackupRecord | null;
    lastBackupDate: Date | null;
    daysSinceLastBackup: number;
    isOverdue: boolean;
    thresholdDays: number;
    formattedDate: string;
  } {
    if (!this.backups || this.backups.length === 0) {
      return {
        lastBackup: null,
        lastBackupDate: null,
        daysSinceLastBackup: 999,
        isOverdue: true,
        thresholdDays,
        formattedDate: 'Never backed up'
      };
    }

    const latest = this.backups[0];
    let backupDate: Date | null = null;

    if (latest.isoTimestamp) {
      const parsed = new Date(latest.isoTimestamp);
      if (!isNaN(parsed.getTime())) backupDate = parsed;
    }

    if (!backupDate) {
      // Try parsing filename format: SRA_BACKUP_YYYYMMDD_HHMM
      const match = latest.filename.match(/SRA_BACKUP_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})/);
      if (match) {
        backupDate = new Date(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
          Number(match[4]),
          Number(match[5])
        );
      }
    }

    if (!backupDate) {
      const parsed = new Date(latest.timestamp);
      if (!isNaN(parsed.getTime())) backupDate = parsed;
    }

    if (!backupDate) {
      backupDate = new Date();
    }

    const now = new Date();
    const diffMs = now.getTime() - backupDate.getTime();
    const daysSince = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const isOverdue = daysSince >= thresholdDays;

    return {
      lastBackup: latest,
      lastBackupDate: backupDate,
      daysSinceLastBackup: daysSince,
      isOverdue,
      thresholdDays,
      formattedDate: latest.timestamp || backupDate.toLocaleDateString('en-IN')
    };
  }

  public isBackupReminderDismissed(): boolean {
    try {
      const dismissedUntil = localStorage.getItem('sra_backup_reminder_dismissed_until');
      if (!dismissedUntil) return false;
      const expireTime = Number(dismissedUntil);
      if (isNaN(expireTime)) return false;
      return Date.now() < expireTime;
    } catch {
      return false;
    }
  }

  public dismissBackupReminder(hours = 24): void {
    const expireTime = Date.now() + hours * 60 * 60 * 1000;
    localStorage.setItem('sra_backup_reminder_dismissed_until', String(expireTime));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sra-backup-status-changed'));
    }
  }

  public clearBackupReminderDismissal(): void {
    localStorage.removeItem('sra_backup_reminder_dismissed_until');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sra-backup-status-changed'));
    }
  }

  public simulateLastBackupDaysAgo(days: number): BackupRecord {
    const now = new Date();
    const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const dateStr = pastDate.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = String(pastDate.getHours()).padStart(2, '0') + String(pastDate.getMinutes()).padStart(2, '0');
    const filename = `SRA_BACKUP_${dateStr}_${timeStr}.sqlite.json`;

    const record: BackupRecord = {
      id: `BKP-SIM-${Date.now()}`,
      filename,
      timestamp: pastDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + pastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isoTimestamp: pastDate.toISOString(),
      sizeKb: 142,
      recordCount: this.students.length + this.transactions.length + this.ledger.length,
      status: 'Success'
    };

    this.backups = [record, ...this.backups];
    this.persistBackups();
    this.settings.lastBackupTimestamp = pastDate.toISOString();
    this.saveSettings(this.settings);
    this.clearBackupReminderDismissal();
    this.logAudit('Backup', `Simulated backup age to ${days} days ago (${pastDate.toISOString().split('T')[0]}).`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sra-backup-status-changed'));
    }
    return record;
  }

  public restoreFromSnapshotJson(jsonContent: string): boolean {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed.tables || !parsed.tables.students || !parsed.tables.ledger) {
        throw new Error('Invalid backup file schema. Missing required tables.');
      }

      this.students = parsed.tables.students;
      this.feeStructure = parsed.tables.feeStructure || this.feeStructure;
      this.transactions = parsed.tables.transactions || [];
      this.ledger = parsed.tables.ledger || [];
      this.users = parsed.tables.users || this.users;
      this.settings = parsed.tables.settings || this.settings;
      if (parsed.tables.license) {
        this.license = parsed.tables.license;
        localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(this.license));
      }

      this.persistStudents();
      localStorage.setItem(STORAGE_KEYS.FEE_STRUCTURE, JSON.stringify(this.feeStructure));
      this.persistTransactions();
      this.persistLedger();
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      this.saveSettings(this.settings);

      this.logAudit('Restore', `Restored database snapshot from ${parsed.createdAt || 'backup file'}.`);
      return true;
    } catch (err: any) {
      this.logAudit('Restore', `Database restore failed: ${err.message}`);
      throw err;
    }
  }

  // DASHBOARD METRICS SUMMARY
  public getDashboardStats() {
    const totalStudents = this.students.filter((s) => s.status === 'Active').length;
    
    // Today's date YYYY-MM-DD
    const todayPrefix = new Date().toISOString().slice(0, 10);
    const todayTransactions = this.transactions.filter(
      (t) => t.status === 'Completed' && t.date.startsWith(todayPrefix)
    );

    const todayCollection = todayTransactions.reduce((sum, t) => sum + t.netAmountPaid, 0);
    const todayTransactionsCount = todayTransactions.length;

    // Total outstanding across school
    let totalOutstanding = 0;
    this.students.forEach((s) => {
      totalOutstanding += this.calculateStudentDueSync(s.id);
    });

    // Specific category dues
    let admissionDue = 0;
    let tuitionDue = 0;
    let bookDue = 0;
    let examDue = 0;

    this.students.forEach((s) => {
      const breakdown = this.getStudentCategoryBreakdown(s.id);
      breakdown.forEach((b) => {
        if (b.feeCategory === 'Admission Fee') admissionDue += b.due;
        else if (b.feeCategory === 'Tuition Fee') tuitionDue += b.due;
        else if (b.feeCategory === 'Book Fee') bookDue += b.due;
        else if (b.feeCategory === 'Examination Fee') examDue += b.due;
      });
    });

    // Payment methods today
    const methodCounts = {
      Cash: 0,
      UPI: 0,
      Cheque: 0,
      'Bank Transfer': 0,
      Other: 0
    };
    todayTransactions.forEach((t) => {
      if (methodCounts[t.paymentMethod] !== undefined) {
        methodCounts[t.paymentMethod] += t.netAmountPaid;
      }
    });

    return {
      totalStudents,
      todayCollection,
      todayTransactionsCount,
      totalOutstanding,
      admissionDue,
      tuitionDue,
      bookDue,
      examDue,
      methodCounts
    };
  }

  // ==========================================
  // TEACHER'S CORNER - HOMEWORK & ASSIGNMENTS
  // ==========================================
  private getInitialHomework(): HomeworkAssignment[] {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const inThreeDays = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

    return [
      {
        id: 'HW-2026-001',
        title: 'Fractions & Decimal Operations Practice',
        classNum: 5,
        section: 'A',
        subject: 'Mathematics',
        assignedDate: today,
        dueDate: tomorrow,
        description: 'Complete Exercise 4.2 Questions 1 to 10 in Mathematics Homework copy. Focus on finding common denominators and reducing fractions.',
        attachmentNote: 'Textbook Page 78, Chapter 4',
        teacherName: 'M. Sharma (Math Dept)',
        status: 'Published'
      },
      {
        id: 'HW-2026-002',
        title: 'Essay: Preserving Assam Flora & Riverine Ecosystem',
        classNum: 8,
        section: 'A',
        subject: 'English',
        assignedDate: today,
        dueDate: inThreeDays,
        description: 'Write a 250-word essay on the annual Brahmaputra floodplains, Kaziranga wildlife protection, and citizen conservation measures.',
        attachmentNote: 'Reference Chapter 6: Nature & Human Coexistence',
        teacherName: 'Dr. Ananya Dutta (English Dept)',
        status: 'Published'
      },
      {
        id: 'HW-2026-003',
        title: 'Ray Optics & Mirror Formula Derivations',
        classNum: 10,
        section: 'A',
        subject: 'Science',
        assignedDate: today,
        dueDate: tomorrow,
        description: 'Draw 6 distinct ray diagram positions for concave mirror reflection and write corresponding image characteristics (real/virtual, inverted, magnified).',
        attachmentNote: 'Physics Practical Manual Page 45',
        teacherName: 'Bhupen Kalita (Sr. Science Faculty)',
        status: 'Published'
      },
      {
        id: 'HW-2026-004',
        title: 'Plant Parts & Photosynthesis Diagram',
        classNum: 2,
        section: 'A',
        subject: 'EVS',
        assignedDate: today,
        dueDate: tomorrow,
        description: 'Draw and color a flowering plant, labeling Roots, Stem, Leaves, Flower, and Fruit.',
        attachmentNote: 'EVS Workbook Activity 3',
        teacherName: 'R. Baruah (Primary Section)',
        status: 'Published'
      }
    ];
  }

  public getHomeworkList(classNum?: string | number, section?: string): HomeworkAssignment[] {
    let list = [...this.homeworkList];
    if (classNum !== undefined && classNum !== '') {
      list = list.filter((h) => String(h.classNum) === String(classNum));
    }
    if (section && section !== '') {
      list = list.filter((h) => h.section.toUpperCase() === section.toUpperCase());
    }
    return list.sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());
  }

  public addHomework(data: Omit<HomeworkAssignment, 'id' | 'assignedDate'>): HomeworkAssignment {
    const today = new Date().toISOString().split('T')[0];
    const newId = `HW-2026-${String(this.homeworkList.length + 1).padStart(3, '0')}`;
    const newHw: HomeworkAssignment = {
      ...data,
      id: newId,
      assignedDate: today
    };
    this.homeworkList.unshift(newHw);
    localStorage.setItem(STORAGE_KEYS.TEACHER_HOMEWORK, JSON.stringify(this.homeworkList));
    this.logAudit('Settings Change', `Class ${data.classNum}-${data.section} Homework published: ${data.title}`);
    return newHw;
  }

  public updateHomework(id: string, updates: Partial<HomeworkAssignment>): HomeworkAssignment {
    const idx = this.homeworkList.findIndex((h) => h.id === id);
    if (idx === -1) throw new Error('Homework record not found');
    this.homeworkList[idx] = { ...this.homeworkList[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.TEACHER_HOMEWORK, JSON.stringify(this.homeworkList));
    return this.homeworkList[idx];
  }

  public deleteHomework(id: string): void {
    this.homeworkList = this.homeworkList.filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEACHER_HOMEWORK, JSON.stringify(this.homeworkList));
  }

  // ==========================================
  // TEACHER'S CORNER - EXAM RESULTS & MARKS
  // ==========================================
  private getInitialExamResults(): ExamResultSheet[] {
    const class5Students = this.students.filter((s) => String(s.classNum) === '5');
    const class10Students = this.students.filter((s) => String(s.classNum) === '10');

    const marks5: StudentMarkEntry[] = class5Students.map((s, idx) => {
      const marks = [88, 76, 92, 64, 81][idx % 5];
      let grade = 'A';
      if (marks >= 90) grade = 'A+';
      else if (marks >= 80) grade = 'A';
      else if (marks >= 70) grade = 'B';
      else if (marks >= 60) grade = 'C';
      else if (marks >= 40) grade = 'D';
      else grade = 'F';

      return {
        studentId: s.id,
        studentName: s.name,
        rollNo: s.rollNo,
        marksObtained: marks,
        isAbsent: false,
        grade,
        remarks: marks >= 80 ? 'Excellent comprehension' : 'Good effort, practice word problems'
      };
    });

    const marks10: StudentMarkEntry[] = class10Students.map((s, idx) => {
      const marks = [44, 48, 38, 42][idx % 4];
      return {
        studentId: s.id,
        studentName: s.name,
        rollNo: s.rollNo,
        marksObtained: marks,
        isAbsent: false,
        grade: marks >= 45 ? 'A+' : 'A',
        remarks: 'Good grasp of concepts'
      };
    });

    return [
      {
        id: 'RES-C5-MATH-HY',
        academicYear: '2026-27',
        classNum: 5,
        section: 'A',
        examTerm: 'Half-Yearly Examination',
        subject: 'Mathematics',
        maxMarks: 100,
        passMarks: 35,
        isPublished: true,
        publishedDate: '2026-09-24',
        teacherName: 'M. Sharma',
        entries: marks5
      },
      {
        id: 'RES-C10-SCI-UT1',
        academicYear: '2026-27',
        classNum: 10,
        section: 'A',
        examTerm: 'Unit Test 1',
        subject: 'Science',
        maxMarks: 50,
        passMarks: 20,
        isPublished: true,
        publishedDate: '2026-08-15',
        teacherName: 'Bhupen Kalita',
        entries: marks10
      }
    ];
  }

  public getExamResults(classNum?: string | number, examTerm?: string, subject?: string): ExamResultSheet[] {
    let list = [...this.examResults];
    if (classNum !== undefined && classNum !== '') {
      list = list.filter((r) => String(r.classNum) === String(classNum));
    }
    if (examTerm && examTerm !== '') {
      list = list.filter((r) => r.examTerm === examTerm);
    }
    if (subject && subject !== '') {
      list = list.filter((r) => r.subject.toLowerCase() === subject.toLowerCase());
    }
    return list;
  }

  public getExamResultSheetById(id: string): ExamResultSheet | undefined {
    return this.examResults.find((r) => r.id === id);
  }

  public saveExamResultSheet(sheet: ExamResultSheet): ExamResultSheet {
    const idx = this.examResults.findIndex((r) => r.id === sheet.id);
    if (idx !== -1) {
      this.examResults[idx] = sheet;
    } else {
      this.examResults.unshift(sheet);
    }
    localStorage.setItem(STORAGE_KEYS.TEACHER_EXAM_RESULTS, JSON.stringify(this.examResults));
    this.logAudit('Fee Structure Change', `Exam marks saved for Class ${sheet.classNum} ${sheet.subject} (${sheet.examTerm})`);
    return sheet;
  }

  public publishExamResultSheet(id: string, isPublished: boolean): ExamResultSheet {
    const sheet = this.getExamResultSheetById(id);
    if (!sheet) throw new Error('Result sheet not found');
    sheet.isPublished = isPublished;
    if (isPublished) {
      sheet.publishedDate = new Date().toISOString().split('T')[0];
    }
    localStorage.setItem(STORAGE_KEYS.TEACHER_EXAM_RESULTS, JSON.stringify(this.examResults));
    this.logAudit(
      'Settings Change',
      `${isPublished ? 'Published' : 'Unpublished'} results for Class ${sheet.classNum} ${sheet.subject} (${sheet.examTerm})`
    );
    return sheet;
  }

  // ==========================================
  // TEACHER'S CORNER - ATTENDANCE & ABSENT ALERTS
  // ==========================================
  private getInitialAttendance(): DailyAttendanceRecord[] {
    const today = new Date().toISOString().split('T')[0];
    const class5 = this.students.filter((s) => String(s.classNum) === '5');

    return class5.map((s, idx) => ({
      id: `ATT-${today}-${s.id}`,
      date: today,
      classNum: 5,
      section: 'A',
      studentId: s.id,
      // Make 2nd student absent for instant demonstration of Absent Notification functionality
      status: idx === 1 ? 'Absent' : 'Present',
      absentReason: idx === 1 ? 'Uninformed absence' : undefined,
      parentNotified: false
    }));
  }

  public getAttendanceForDate(date: string, classNum: string | number, section: string): DailyAttendanceRecord[] {
    const records = this.attendanceRecords.filter(
      (a) => a.date === date && String(a.classNum) === String(classNum) && a.section.toUpperCase() === section.toUpperCase()
    );

    // If records already exist for this date and class, return them
    if (records.length > 0) return records;

    // Otherwise, generate default attendance rows populated with active students from that class
    const classStudents = this.students.filter(
      (s) => String(s.classNum) === String(classNum) && s.section.toUpperCase() === section.toUpperCase() && s.status === 'Active'
    );

    return classStudents.map((s) => ({
      id: `ATT-${date}-${s.id}`,
      date,
      classNum,
      section,
      studentId: s.id,
      status: 'Present',
      parentNotified: false
    }));
  }

  public saveAttendanceRecords(records: DailyAttendanceRecord[]): void {
    records.forEach((rec) => {
      const idx = this.attendanceRecords.findIndex(
        (a) => a.date === rec.date && a.studentId === rec.studentId
      );
      if (idx !== -1) {
        this.attendanceRecords[idx] = rec;
      } else {
        this.attendanceRecords.push(rec);
      }
    });
    localStorage.setItem(STORAGE_KEYS.TEACHER_ATTENDANCE, JSON.stringify(this.attendanceRecords));
  }

  public markAttendanceNotified(recordId: string): void {
    const rec = this.attendanceRecords.find((a) => a.id === recordId);
    if (rec) {
      rec.parentNotified = true;
      rec.notifiedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.TEACHER_ATTENDANCE, JSON.stringify(this.attendanceRecords));
    }
  }

  // ==========================================
  // TEACHER'S CORNER - SUBJECT MASTER & CONFIG
  // ==========================================
  private getInitialClassSubjects(): ClassSubject[] {
    const defaultList = [
      { name: 'Mathematics', code: 'MATH', maxMarks: 100, passMarks: 35 },
      { name: 'English', code: 'ENG', maxMarks: 100, passMarks: 35 },
      { name: 'Science', code: 'SCI', maxMarks: 100, passMarks: 35 },
      { name: 'Social Science', code: 'SST', maxMarks: 100, passMarks: 35 },
      { name: 'MIL / Assamese / Hindi', code: 'MIL', maxMarks: 100, passMarks: 35 },
      { name: 'Computer Studies', code: 'COMP', maxMarks: 50, passMarks: 18 },
      { name: 'EVS / Environmental Studies', code: 'EVS', maxMarks: 50, passMarks: 18 }
    ];

    const allSubs: ClassSubject[] = [];
    // Seed for sample classes
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'ANKUR', 'MUKUL'].forEach((cls) => {
      defaultList.forEach((sub, sIdx) => {
        allSubs.push({
          id: `SUB-C${cls}-${sub.code}`,
          classNum: cls,
          name: sub.name,
          code: sub.code,
          maxMarks: sub.maxMarks,
          passMarks: sub.passMarks,
          isOptional: sub.code === 'EVS'
        });
      });
    });
    return allSubs;
  }

  public getClassSubjects(classNum: number | string): ClassSubject[] {
    const list = this.classSubjects.filter((s) => String(s.classNum) === String(classNum));
    if (list.length > 0) return list;

    // If none exist for this class, generate standard defaults
    const defaults = [
      { name: 'Mathematics', code: 'MATH', maxMarks: 100, passMarks: 35 },
      { name: 'English', code: 'ENG', maxMarks: 100, passMarks: 35 },
      { name: 'Science', code: 'SCI', maxMarks: 100, passMarks: 35 },
      { name: 'Social Science', code: 'SST', maxMarks: 100, passMarks: 35 },
      { name: 'MIL / Assamese / Hindi', code: 'MIL', maxMarks: 100, passMarks: 35 },
      { name: 'Computer Studies', code: 'COMP', maxMarks: 50, passMarks: 18 }
    ].map((sub) => ({
      id: `SUB-C${classNum}-${sub.code}`,
      classNum,
      name: sub.name,
      code: sub.code,
      maxMarks: sub.maxMarks,
      passMarks: sub.passMarks
    }));

    this.classSubjects.push(...defaults);
    localStorage.setItem(STORAGE_KEYS.TEACHER_SUBJECTS, JSON.stringify(this.classSubjects));
    return defaults;
  }

  public saveClassSubject(subject: ClassSubject): ClassSubject {
    const idx = this.classSubjects.findIndex((s) => s.id === subject.id);
    if (idx !== -1) {
      this.classSubjects[idx] = subject;
    } else {
      this.classSubjects.push(subject);
    }
    localStorage.setItem(STORAGE_KEYS.TEACHER_SUBJECTS, JSON.stringify(this.classSubjects));
    this.logAudit('Settings Change', `Updated Subject ${subject.name} for Class ${subject.classNum}.`);
    return subject;
  }

  public deleteClassSubject(id: string): void {
    const subj = this.classSubjects.find((s) => s.id === id);
    this.classSubjects = this.classSubjects.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEACHER_SUBJECTS, JSON.stringify(this.classSubjects));
    if (subj) {
      this.logAudit('Settings Change', `Deleted Subject ${subj.name} (${subj.code}) for Class ${subj.classNum}.`);
    }
  }

  public applySubjectPreset(
    classNum: number | string,
    presetType: '5_subjects' | '6_subjects' | '4_subjects' | '7_subjects'
  ): ClassSubject[] {
    let presetList: Array<{ name: string; code: string; maxMarks: number; passMarks: number; isOptional?: boolean }> = [];

    if (presetType === '5_subjects') {
      presetList = [
        { name: 'Mathematics', code: 'MATH', maxMarks: 100, passMarks: 35 },
        { name: 'English', code: 'ENG', maxMarks: 100, passMarks: 35 },
        { name: 'General Science', code: 'SCI', maxMarks: 100, passMarks: 35 },
        { name: 'Social Science', code: 'SST', maxMarks: 100, passMarks: 35 },
        { name: 'MIL / Assamese / Hindi', code: 'MIL', maxMarks: 100, passMarks: 35 }
      ];
    } else if (presetType === '6_subjects') {
      presetList = [
        { name: 'Mathematics', code: 'MATH', maxMarks: 100, passMarks: 35 },
        { name: 'English', code: 'ENG', maxMarks: 100, passMarks: 35 },
        { name: 'General Science', code: 'SCI', maxMarks: 100, passMarks: 35 },
        { name: 'Social Science', code: 'SST', maxMarks: 100, passMarks: 35 },
        { name: 'MIL / Assamese / Hindi', code: 'MIL', maxMarks: 100, passMarks: 35 },
        { name: 'Computer Studies', code: 'COMP', maxMarks: 100, passMarks: 35 }
      ];
    } else if (presetType === '4_subjects') {
      presetList = [
        { name: 'English', code: 'ENG', maxMarks: 100, passMarks: 35 },
        { name: 'Mathematics', code: 'MATH', maxMarks: 100, passMarks: 35 },
        { name: 'Environmental Studies', code: 'EVS', maxMarks: 100, passMarks: 35 },
        { name: 'Mother Tongue / MIL', code: 'MIL', maxMarks: 100, passMarks: 35 }
      ];
    } else {
      presetList = [
        { name: 'Mathematics', code: 'MATH', maxMarks: 100, passMarks: 35 },
        { name: 'English', code: 'ENG', maxMarks: 100, passMarks: 35 },
        { name: 'General Science', code: 'SCI', maxMarks: 100, passMarks: 35 },
        { name: 'Social Science', code: 'SST', maxMarks: 100, passMarks: 35 },
        { name: 'MIL / Assamese / Hindi', code: 'MIL', maxMarks: 100, passMarks: 35 },
        { name: 'Computer Studies', code: 'COMP', maxMarks: 50, passMarks: 18 },
        { name: 'General Knowledge & Moral Science', code: 'GK', maxMarks: 50, passMarks: 18, isOptional: true }
      ];
    }

    // Remove existing subjects for this class
    this.classSubjects = this.classSubjects.filter((s) => String(s.classNum) !== String(classNum));

    // Map new preset subjects
    const newSubjects: ClassSubject[] = presetList.map((sub, idx) => ({
      id: `SUB-C${classNum}-${sub.code}-${idx}`,
      classNum,
      name: sub.name,
      code: sub.code,
      maxMarks: sub.maxMarks,
      passMarks: sub.passMarks,
      isOptional: Boolean(sub.isOptional)
    }));

    this.classSubjects.push(...newSubjects);
    localStorage.setItem(STORAGE_KEYS.TEACHER_SUBJECTS, JSON.stringify(this.classSubjects));
    this.logAudit(
      'Settings Change',
      `Applied ${presetType.replace('_', ' ')} preset for Class ${classNum} (${newSubjects.length} subjects).`
    );
    return newSubjects;
  }

  public resetClassSubjectsToDefault(classNum: number | string): ClassSubject[] {
    return this.applySubjectPreset(classNum, '5_subjects');
  }

  // ==========================================
  // TEACHER'S CORNER - CLASS TEACHER PROFILE
  // ==========================================
  private getInitialTeacherProfiles(): ClassTeacherProfile[] {
    return [
      {
        id: 'TCH-PROF-C5-A',
        name: 'Mridul Sharma, M.Sc., B.Ed.',
        classNum: 5,
        section: 'A',
        employeeCode: 'PAHS-FAC-014',
        designation: 'Senior Faculty & In-Charge Teacher',
        qualification: 'M.Sc. Mathematics, B.Ed. (Guwahati University)',
        specialization: 'Mathematics, Mental Arithmetic & Science',
        mobile: '+91 98640 11223',
        email: 'm.sharma@pragjyotishacademy.edu.in',
        roomNumber: 'Room 204 (Primary Academic Wing)',
        bio: 'Dedicated to fostering analytical reasoning, classroom punctuality, and interactive peer problem-solving.'
      },
      {
        id: 'TCH-PROF-C10-A',
        name: 'Bhupen Kalita, M.Sc., Ph.D. (Scholar)',
        classNum: 10,
        section: 'A',
        employeeCode: 'PAHS-FAC-003',
        designation: 'Head of Science & Class Mentor',
        qualification: 'M.Sc. Physics, PGDCA',
        specialization: 'Physics, Applied Science & Board Exam Coaching',
        mobile: '+91 94350 99887',
        email: 'b.kalita@pragjyotishacademy.edu.in',
        roomNumber: 'Science Block Room 102',
        bio: 'Guiding Class 10 candidates towards conceptual clarity, practical experiments, and state board excellence.'
      }
    ];
  }

  public getClassTeacherProfile(classNum: number | string, section: string): ClassTeacherProfile {
    const found = this.teacherProfiles.find(
      (p) => String(p.classNum) === String(classNum) && p.section.toUpperCase() === section.toUpperCase()
    );
    if (found) return found;

    const defaultProfile: ClassTeacherProfile = {
      id: `TCH-PROF-C${classNum}-${section}`,
      name: 'Class Teacher',
      classNum,
      section,
      employeeCode: `TCH-PAHS-${String(classNum)}`,
      designation: `Class Teacher - Class ${classNum} (Sec ${section})`,
      qualification: 'B.A. / B.Sc., B.Ed.',
      specialization: 'General Academics',
      mobile: '+91 98640 00000',
      email: `teacher.c${classNum}${section.toLowerCase()}@pragjyotishacademy.edu.in`,
      roomNumber: `Classroom ${classNum}-${section}`,
      bio: 'Committed to academic excellence, student discipline, and parent partnership.'
    };
    this.teacherProfiles.push(defaultProfile);
    localStorage.setItem(STORAGE_KEYS.TEACHER_PROFILES, JSON.stringify(this.teacherProfiles));
    return defaultProfile;
  }

  public saveClassTeacherProfile(profile: ClassTeacherProfile): ClassTeacherProfile {
    const idx = this.teacherProfiles.findIndex(
      (p) => String(p.classNum) === String(profile.classNum) && p.section.toUpperCase() === profile.section.toUpperCase()
    );
    if (idx !== -1) {
      this.teacherProfiles[idx] = profile;
    } else {
      this.teacherProfiles.push(profile);
    }
    localStorage.setItem(STORAGE_KEYS.TEACHER_PROFILES, JSON.stringify(this.teacherProfiles));
    this.logAudit('Settings Change', `Updated Class Teacher profile for Class ${profile.classNum}-${profile.section} (${profile.name}).`);
    return profile;
  }
}

export const db = LocalLedgerDB.getInstance();
