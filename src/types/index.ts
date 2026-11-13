export type Role = 'Enterprise Admin' | 'Administrator' | 'Accountant' | 'Viewer';

export type LicenseStatus = 'trial' | 'active' | 'expired' | 'grace_period';
export type LicenseTier = 'trial' | 'standard' | 'enterprise';

export interface LicenseFeatures {
  feeCollection: boolean;
  barcodeIdCards: boolean;
  whatsappAlerts: boolean;
  financialReports: boolean;
  cloudBackup: boolean;
  auditLogs: boolean;
  multiUserAccess: boolean;
  unlimitedStudents: boolean;
}

export interface EnterpriseLicense {
  licenseKey: string;
  organizationName: string;
  tier: LicenseTier;
  status: LicenseStatus;
  issuedDate: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  isTrial: boolean;
  trialDaysGranted: number;
  maxStudents: number;
  hardwareFingerprint: string;
  licensedToEmail: string;
  features: LicenseFeatures;
  lastModifiedBy: string;
  lastModifiedAt: string;
  notes?: string;
}

export interface IssuedSchoolLicense {
  id: string;
  licenseKey: string;
  schoolName: string;
  schoolCode?: string;
  tier: LicenseTier;
  status: LicenseStatus;
  issuedAt: string;
  validUntil: string;
  maxStudents: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  hardwareFingerprint?: string;
  features: LicenseFeatures;
  notes?: string;
}

export interface SupportTicket {
  id: string;
  ticketNo: string;
  schoolName: string;
  licenseKey?: string;
  contactPerson: string;
  phone: string;
  category: 'License Activation' | 'Validity Extension' | 'Backup Recovery' | 'Receipt Printing' | 'Database Corruption' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  subject: string;
  description: string;
  createdAt: string;
  resolvedAt?: string;
  assignedEngineer: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  active: boolean;
  lastLogin: string;
}

export type FeeCategory = 
  | 'Admission Fee'
  | 'Tuition Fee'
  | 'Book Fee'
  | 'Examination Fee'
  | 'Uniform Fee'
  | 'Transport Fee'
  | 'Computer Lab Fee'
  | 'Other Fee';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Other';

export type TransactionStatus = 'Completed' | 'Cancelled' | 'Refunded';

export type DiscountType = 'fixed' | 'percentage';

export type DiscountReason = 
  | 'Sibling Discount'
  | 'Scholarship'
  | 'Staff Child'
  | 'Management Concession'
  | 'Other';

export type SchoolClass = 'ANKUR' | 'MUKUL' | number;

export const ALL_CLASSES: (string | number)[] = [
  'ANKUR',
  'MUKUL',
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10
];

export function formatClassDisplay(classVal: number | string, prefix = 'Class '): string {
  if (classVal === 'ANKUR' || classVal === 'MUKUL') {
    return `${prefix}${classVal}`;
  }
  return `${prefix}${classVal}`;
}

export interface Student {
  id: string; // e.g. "SRA26-001"
  admissionNo: string;
  rollNo: number;
  name: string;
  nameAssamese?: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  classNum: number | string; // 'ANKUR', 'MUKUL', 1 to 10
  section: 'A' | 'B' | 'C';
  fatherName: string;
  motherName: string;
  guardianName: string;
  mobile: string;
  address: string;
  admissionDate: string;
  academicYear: string; // "2026-27"
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  photoUrl?: string;
  concessionType?: string;
  nextPaymentDueDate?: string;
}

export interface PaymentDueAlert {
  student: Student;
  totalDue: number;
  dueDate: string;
  daysLeft: number;
  isOverdue: boolean;
  primaryFeeCategory: string;
  tuitionDue: number;
  booksDue: number;
  examDue: number;
  otherDue: number;
  urgency: 'urgent' | 'moderate' | 'upcoming';
}

export interface FeeStructureItem {
  id: string;
  classNum: number | string;
  feeCategory: FeeCategory;
  feeType: 'one-time' | 'monthly' | 'annual';
  amount: number;
}

export interface MonthFeeStatus {
  month: string; // 'April', 'May', ..., 'March'
  assignedAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'PAID' | 'PARTIAL' | 'DUE';
}

export interface PaymentItem {
  feeCategory: FeeCategory;
  month?: string; // e.g. "April", "May" for tuition
  assignedAmount: number;
  amountPaid: number;
  remainingDue: number;
}

export interface PaymentTransaction {
  receiptNo: string; // e.g. "REC-2026-00412"
  date: string; // ISO string
  studentId: string;
  studentName: string;
  classNum: number | string;
  section: string;
  academicYear: string;
  items: PaymentItem[];
  grossAmount: number;
  discountAmount: number;
  discountType: DiscountType;
  discountReason?: DiscountReason;
  netAmountPaid: number;
  paymentMethod: PaymentMethod;
  upiUtr?: string;
  chequeNumber?: string;
  chequeBank?: string;
  chequeDate?: string;
  bankReference?: string;
  notes?: string;
  receivedBy: string;
  status: TransactionStatus;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  previousOutstanding: number;
  remainingOutstanding: number;
}

export type LedgerEntryType = 
  | 'FEE_ASSIGNED'
  | 'PAYMENT'
  | 'DISCOUNT'
  | 'ADJUSTMENT'
  | 'REFUND'
  | 'CANCELLATION';

export interface LedgerEntry {
  id: string;
  studentId: string;
  date: string;
  academicYear: string;
  type: LedgerEntryType;
  referenceId: string; // e.g. receiptNo or fee assign code
  description: string;
  debit: number; // increases due
  credit: number; // decreases due
  runningBalance: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: Role;
  action: 
    | 'Login'
    | 'Student Created'
    | 'Student Edited'
    | 'Student Deactivated'
    | 'Payment Collected'
    | 'Payment Cancelled'
    | 'Refund'
    | 'Discount'
    | 'Fee Structure Change'
    | 'Backup'
    | 'Restore'
    | 'Settings Change'
    | 'Enterprise License';
  description: string;
}

export type FeeCategoryBillingMode = 
  | 'monthly' 
  | 'with-admission' 
  | 'separate-exam' 
  | 'annual' 
  | 'one-time' 
  | 'self-purchased' 
  | 'free-provided' 
  | 'optional';

export interface FeeCategoryConfigItem {
  id: string;
  name: string; // e.g. "Tuition Fee", "Book Fee", "Uniform Fee", "Examination Fee", etc.
  categoryKey: FeeCategory | string;
  description: string;
  isEnabled: boolean; // whether this fee is active in the school
  billingMode: FeeCategoryBillingMode; // e.g. 'with-admission', 'separate-exam', 'self-purchased', 'free-provided', 'monthly', 'annual'
  provisionPolicy: 'school-charged' | 'free-provided' | 'student-buys-own' | 'with-admission' | 'separate';
  applicableClassRange?: string; // e.g. "All Classes", "Class 9-10 only", "Class 1-8 Free", etc.
  defaultAmount?: number;
  notes?: string;
}

export interface SchoolSettings {
  schoolName: string;
  schoolNameAssamese: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  affiliationNo: string;
  principalName: string;
  cashierName: string;
  academicYear: string;
  currentAcademicYear?: string;
  currency: string;
  receiptFooter: string;
  defaultPrinter: string;
  defaultPaperSize: 'A4' | 'A5' | '80mm' | '58mm';
  bilingualReceipt: boolean;
  autoBackupEnabled: boolean;
  lastBackupTimestamp: string;
  whatsAppApiKey?: string;
  whatsAppReminderDays: number;
  feeDueDayOfMonth?: number;
  dueNotificationDays?: number;
  logoUrl?: string;
  sealUrl?: string;
  principalSignatureUrl?: string;
  accountantSignatureUrl?: string;
  feeCategoriesConfig?: FeeCategoryConfigItem[];
}

export interface BackupRecord {
  id: string;
  filename: string;
  timestamp: string;
  isoTimestamp?: string;
  sizeKb: number;
  recordCount: number;
  status: 'Success' | 'Failed';
}

export interface StudentMarkEntry {
  studentId: string;
  studentName: string;
  rollNo: number;
  marksObtained: number | null;
  isAbsent: boolean;
  grade?: string;
  remarks?: string;
}

export interface ExamResultSheet {
  id: string;
  academicYear: string;
  classNum: number | string;
  section: string;
  examTerm: string;
  subject: string;
  maxMarks: number;
  passMarks: number;
  isPublished: boolean;
  publishedDate?: string;
  teacherName: string;
  entries: StudentMarkEntry[];
}

export const EXAM_TERMS_LIST = [
  'Half-Yearly Examination',
  'Unit Test 1',
  'Unit Test 2',
  'Annual Final Examination',
  'Class Assessment & Project'
] as const;

export interface ExamTermInfo {
  term: string;
  isUnitTest: boolean;
  isMajorExam: boolean; // Half Yearly or Annual
  standardMaxMarks: number; // 50 for Unit Test, 100 for Half Yearly & Annual
  standardPassMarks: number; // 18 for Unit Test (~35%), 35 for Half Yearly/Annual
  categoryName: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export function getExamTermInfo(termName: string): ExamTermInfo {
  const t = (termName || '').toLowerCase();
  const isUnitTest = t.includes('unit');
  const isAnnual = t.includes('annual') || t.includes('final');
  const isHalfYearly = t.includes('half');
  const isMajorExam = isHalfYearly || isAnnual;
  const standardMaxMarks = isUnitTest ? 50 : 100;
  const standardPassMarks = isUnitTest ? 18 : 35;

  let categoryName = 'Term Examination';
  let badgeBg = 'bg-indigo-50';
  let badgeText = 'text-indigo-800';
  let badgeBorder = 'border-indigo-200';

  if (isUnitTest) {
    categoryName = 'Unit Test (50 Marks Exam)';
    badgeBg = 'bg-amber-50';
    badgeText = 'text-amber-800';
    badgeBorder = 'border-amber-300';
  } else if (isAnnual) {
    categoryName = 'Annual Final (100 Marks Exam)';
    badgeBg = 'bg-emerald-50';
    badgeText = 'text-emerald-800';
    badgeBorder = 'border-emerald-300';
  } else if (isHalfYearly) {
    categoryName = 'Half-Yearly (100 Marks Exam)';
    badgeBg = 'bg-blue-50';
    badgeText = 'text-blue-800';
    badgeBorder = 'border-blue-300';
  }

  return {
    term: termName,
    isUnitTest,
    isMajorExam,
    standardMaxMarks,
    standardPassMarks,
    categoryName,
    badgeBg,
    badgeText,
    badgeBorder
  };
}

export function resolveSubjectTermMarks(
  sub: { maxMarks: number; passMarks: number },
  termName: string
): { maxMarks: number; passMarks: number; isUnitTest: boolean; scaleFactor: number } {
  const info = getExamTermInfo(termName);
  if (info.isUnitTest) {
    // Unit Test: 50 Marks exam rule
    if (sub.maxMarks === 100) {
      return {
        maxMarks: 50,
        passMarks: Math.round(sub.passMarks * 0.5) || 18,
        isUnitTest: true,
        scaleFactor: 0.5
      };
    }
    // Proportional scaling if base is e.g. 50 or 80
    const scaledMax = Math.round(sub.maxMarks * 0.5);
    const scaledPass = Math.round(sub.passMarks * 0.5);
    return {
      maxMarks: scaledMax > 0 ? scaledMax : 50,
      passMarks: scaledPass > 0 ? scaledPass : 18,
      isUnitTest: true,
      scaleFactor: 0.5
    };
  } else {
    // Half Yearly, Annual, and Major Exams: 100 Marks rule
    return {
      maxMarks: sub.maxMarks,
      passMarks: sub.passMarks,
      isUnitTest: false,
      scaleFactor: 1.0
    };
  }
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  classNum: number | string;
  section: string;
  subject: string;
  assignedDate: string;
  dueDate: string;
  description: string;
  attachmentNote?: string;
  teacherName: string;
  status: 'Published' | 'Draft';
}

export interface DailyAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  classNum: number | string;
  section: string;
  studentId: string;
  status: 'Present' | 'Absent' | 'Late';
  absentReason?: string;
  parentNotified: boolean;
  notifiedAt?: string;
}

export interface ClassSubject {
  id: string;
  classNum: number | string;
  name: string;
  code: string;
  maxMarks: number;
  passMarks: number;
  isOptional?: boolean;
}

export interface ClassTeacherProfile {
  id: string;
  name: string;
  classNum: number | string;
  section: string;
  employeeCode: string;
  designation: string;
  qualification: string;
  specialization: string;
  mobile: string;
  email: string;
  roomNumber?: string;
  signatureUrl?: string;
  bio?: string;
}

export interface ConsolidatedStudentMarks {
  studentId: string;
  studentName: string;
  rollNo: number;
  admissionNo: string;
  subjectMarks: Record<string, number | null>; // subjectName -> marks (null if absent)
  totalMarks: number;
  maxTotal: number;
  percentage: number;
  grade: string;
  rank?: number;
  remarks?: string;
}
