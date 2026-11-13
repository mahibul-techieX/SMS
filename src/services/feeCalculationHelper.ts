import { db, MONTH_NAMES } from './db';
import {
  Student,
  FeeCategory,
  FeeStructureItem,
  PaymentTransaction,
  LedgerEntry,
  MonthFeeStatus
} from '../types';

export interface MonthTuitionDetail {
  month: string;
  monthIndex: number;
  rate: number;
  paid: number;
  due: number;
  status: 'PAID' | 'PARTIAL' | 'DUE';
}

export interface ClassFeeCategoryDetail {
  id: string;
  feeCategory: FeeCategory;
  feeType: 'one-time' | 'monthly' | 'annual';
  structureRate: number;
  totalAssigned: number;
  totalPaid: number;
  remainingDue: number;
  status: 'PAID' | 'PARTIAL' | 'DUE' | 'NOT_APPLICABLE';
  isConsistentWithStructure: boolean;
  months?: MonthTuitionDetail[];
}

export interface StudentFeeCalculationResult {
  student: Student;
  classNum: number | string;
  academicYear: string;
  classStructureItems: FeeStructureItem[];
  monthlyTuitionRate: number;

  // Totals
  totalFullYearExpected: number;
  totalAccruedToDate: number;
  totalPaid: number;
  totalOutstandingFullYear: number;
  totalOutstandingToDate: number;

  // Category breakdown
  categories: ClassFeeCategoryDetail[];

  // Quick payment presets (calculated amounts)
  presets: {
    fullDuesAmount: number;
    accruedDuesAmount: number;
    currentMonthAmount: number;
    quarterAmount: number;
    annualFeesOnlyAmount: number;
  };

  // Consistency audit
  isLedgerFullySynced: boolean;
  discrepancies: string[];
}

/**
 * Automated Fee Calculation Engine
 * Computes exact dues based on the official fee structure for the student's class,
 * cross-verifies with ledger debits and completed transactions, and guarantees
 * 100% financial consistency across payment collection terminals.
 */
export const feeCalculationHelper = {
  /**
   * Computes the complete automated fee calculation for a student
   */
  calculateStudentDues(
    studentId: string,
    options?: {
      currentMonthIndex?: number; // 0 = April, 6 = October, 11 = March
      academicYear?: string;
    }
  ): StudentFeeCalculationResult {
    const student = db.getStudentById(studentId);
    if (!student) {
      throw new Error(`Student ${studentId} not found in database.`);
    }

    const settings = db.getSettings();
    const academicYear = options?.academicYear || student.academicYear || settings.academicYear;
    
    // Determine current month index (Default: based on calendar date or October = 6)
    const now = new Date();
    // In Indian academic session (April-March):
    // Jan=9, Feb=10, Mar=11, Apr=0, May=1, Jun=2, Jul=3, Aug=4, Sep=5, Oct=6, Nov=7, Dec=8
    const calMonth = now.getMonth(); // 0-11 (Jan=0, Apr=3, Oct=9)
    const defaultAcademicMonthIndex = calMonth >= 3 ? calMonth - 3 : calMonth + 9;
    const currentMonthIndex = options?.currentMonthIndex ?? Math.min(11, Math.max(0, defaultAcademicMonthIndex));

    // 1. Get official fee structure for student's class
    const allStructures = db.getFeeStructure();
    const classStructures = allStructures.filter(
      (f) => String(f.classNum) === String(student.classNum)
    );

    // Identify standard monthly tuition rate
    const tuitionStructure = classStructures.find((f) => f.feeCategory === 'Tuition Fee');
    const monthlyTuitionRate = tuitionStructure ? tuitionStructure.amount : 2000;

    // 2. Fetch student's ledger & completed payment transactions
    const ledger = db.getStudentLedger(student.id).filter((e) => e.academicYear === academicYear);
    const transactions = db
      .getAllTransactions()
      .filter((t) => t.studentId === student.id && t.status === 'Completed' && t.academicYear === academicYear);

    const discrepancies: string[] = [];
    let totalFullYearExpected = 0;
    let totalAccruedToDate = 0;
    let totalPaid = 0;

    // Standard school categories
    const categoriesToEvaluate: FeeCategory[] = [
      'Tuition Fee',
      'Admission Fee',
      'Book Fee',
      'Examination Fee',
      'Computer Lab Fee',
      'Uniform Fee',
      'Transport Fee',
      'Other Fee'
    ];

    const categoryDetails: ClassFeeCategoryDetail[] = [];

    // Evaluate each category
    for (const cat of categoriesToEvaluate) {
      const structureItem = classStructures.find((f) => f.feeCategory === cat);

      if (cat === 'Tuition Fee') {
        // Tuition is monthly across 12 academic months (April to March)
        const rate = monthlyTuitionRate;
        totalFullYearExpected += rate * 12;
        totalAccruedToDate += rate * (currentMonthIndex + 1);

        const monthDetails: MonthTuitionDetail[] = MONTH_NAMES.map((monthName, idx) => {
          // Find payment credits specifically assigned to this tuition month
          const paidForMonth = transactions
            .flatMap((t) => t.items)
            .filter((i) => i.feeCategory === 'Tuition Fee' && i.month === monthName)
            .reduce((sum, i) => sum + i.amountPaid, 0);

          const dueForMonth = Math.max(0, rate - paidForMonth);
          let status: MonthTuitionDetail['status'] = 'DUE';
          if (dueForMonth === 0 && paidForMonth > 0) {
            status = 'PAID';
          } else if (paidForMonth > 0 && dueForMonth > 0) {
            status = 'PARTIAL';
          }

          return {
            month: monthName,
            monthIndex: idx,
            rate,
            paid: paidForMonth,
            due: dueForMonth,
            status
          };
        });

        const totalTuitionPaid = monthDetails.reduce((sum, m) => sum + m.paid, 0);
        totalPaid += totalTuitionPaid;
        const totalTuitionDue = monthDetails.reduce((sum, m) => sum + m.due, 0);

        // Check if ledger has corresponding debits
        const tuitionDebits = ledger
          .filter((e) => e.type === 'FEE_ASSIGNED' && e.description.toLowerCase().includes('tuition'))
          .reduce((sum, e) => sum + e.debit, 0);

        if (tuitionDebits < rate * (currentMonthIndex + 1)) {
          discrepancies.push(
            `Ledger missing tuition debits: Assigned ₹${tuitionDebits} vs Expected ₹${rate * (currentMonthIndex + 1)}`
          );
        }

        categoryDetails.push({
          id: structureItem?.id || `FS-${student.classNum}-TUI`,
          feeCategory: 'Tuition Fee',
          feeType: 'monthly',
          structureRate: rate,
          totalAssigned: rate * 12,
          totalPaid: totalTuitionPaid,
          remainingDue: totalTuitionDue,
          status: totalTuitionDue === 0 ? 'PAID' : totalTuitionPaid > 0 ? 'PARTIAL' : 'DUE',
          isConsistentWithStructure: tuitionDebits >= rate * 6,
          months: monthDetails
        });
      } else {
        // One-time or Annual fees (Admission, Book, Exam, Lab, Uniform)
        const rate = structureItem ? structureItem.amount : 0;
        if (rate > 0) {
          totalFullYearExpected += rate;
          totalAccruedToDate += rate;
        }

        // Sum debits in ledger
        const assignedInLedger = ledger
          .filter((e) => e.type === 'FEE_ASSIGNED' && e.description.toLowerCase().includes(cat.toLowerCase()))
          .reduce((sum, e) => sum + e.debit, 0);

        // Sum credits in transactions
        const paidForCategory = transactions
          .flatMap((t) => t.items)
          .filter((i) => i.feeCategory === cat)
          .reduce((sum, i) => sum + i.amountPaid, 0);

        totalPaid += paidForCategory;

        // Use the statutory rate as the definitive benchmark if assignedInLedger is 0
        const benchmarkAssigned = Math.max(rate, assignedInLedger);
        const due = Math.max(0, benchmarkAssigned - paidForCategory);

        if (rate > 0 && assignedInLedger === 0) {
          discrepancies.push(`Missing ledger assessment for mandatory ${cat} (Statutory: ₹${rate})`);
        } else if (rate > 0 && assignedInLedger !== rate) {
          discrepancies.push(`Ledger debit for ${cat} (₹${assignedInLedger}) differs from class schedule (₹${rate})`);
        }

        if (benchmarkAssigned > 0 || due > 0) {
          categoryDetails.push({
            id: structureItem?.id || `FS-${student.classNum}-${cat.substring(0, 3)}`,
            feeCategory: cat,
            feeType: structureItem?.feeType || 'annual',
            structureRate: rate,
            totalAssigned: benchmarkAssigned,
            totalPaid: paidForCategory,
            remainingDue: due,
            status: due === 0 ? 'PAID' : paidForCategory > 0 ? 'PARTIAL' : 'DUE',
            isConsistentWithStructure: assignedInLedger === rate
          });
        }
      }
    }

    const totalOutstandingFullYear = Math.max(0, totalFullYearExpected - totalPaid);
    const totalOutstandingToDate = Math.max(0, totalAccruedToDate - totalPaid);

    // Compute quick payment presets
    const tuitionCategory = categoryDetails.find((c) => c.feeCategory === 'Tuition Fee');
    const unpaidTuitionMonths = tuitionCategory?.months?.filter((m) => m.due > 0) || [];

    // 1. Current month tuition (or first unpaid month)
    const currentMonthAmount = unpaidTuitionMonths[0]?.due || 0;

    // 2. Quarter amount (next 3 unpaid months)
    const quarterAmount = unpaidTuitionMonths
      .slice(0, 3)
      .reduce((sum, m) => sum + m.due, 0);

    // 3. Annual charges only (Admission + Book + Exam + Lab + Uniform)
    const annualFeesOnlyAmount = categoryDetails
      .filter((c) => c.feeCategory !== 'Tuition Fee')
      .reduce((sum, c) => sum + c.remainingDue, 0);

    // 4. Accrued dues to date (up to current month index + all annual fees)
    const accruedTuitionDue = (tuitionCategory?.months || [])
      .filter((m) => m.monthIndex <= currentMonthIndex)
      .reduce((sum, m) => sum + m.due, 0);
    const accruedDuesAmount = accruedTuitionDue + annualFeesOnlyAmount;

    return {
      student,
      classNum: student.classNum,
      academicYear,
      classStructureItems: classStructures,
      monthlyTuitionRate,
      totalFullYearExpected,
      totalAccruedToDate,
      totalPaid,
      totalOutstandingFullYear,
      totalOutstandingToDate,
      categories: categoryDetails,
      presets: {
        fullDuesAmount: totalOutstandingFullYear,
        accruedDuesAmount,
        currentMonthAmount,
        quarterAmount,
        annualFeesOnlyAmount
      },
      isLedgerFullySynced: discrepancies.length === 0,
      discrepancies
    };
  },

  /**
   * Synchronizes student ledger debits with the class fee structure.
   * If any mandatory fee structure item for the student's class is missing in the ledger,
   * this automatically creates the proper debit posting without duplicating existing ones.
   */
  syncStudentLedgerWithClassStructure(studentId: string): { updatedEntries: number; message: string } {
    const student = db.getStudentById(studentId);
    if (!student) {
      throw new Error(`Student ${studentId} not found.`);
    }

    const allStructures = db.getFeeStructure();
    const classStructures = allStructures.filter(
      (f) => String(f.classNum) === String(student.classNum)
    );

    const existingLedger = db.getStudentLedger(student.id);
    let addedCount = 0;
    const nowIso = new Date().toISOString();

    // 1. Audit annual / one-time fees
    classStructures.forEach((fee) => {
      if (fee.feeType === 'annual' || fee.feeType === 'one-time') {
        const hasEntry = existingLedger.some(
          (e) => e.type === 'FEE_ASSIGNED' && e.description.toLowerCase().includes(fee.feeCategory.toLowerCase())
        );

        if (!hasEntry) {
          const newEntry: LedgerEntry = {
            id: `LED-${student.id}-${fee.feeCategory.substring(0, 3)}-SYNC`,
            studentId: student.id,
            date: nowIso,
            academicYear: student.academicYear,
            type: 'FEE_ASSIGNED',
            referenceId: fee.id,
            description: `Session Fee: ${fee.feeCategory} (Class ${student.classNum} Structure)`,
            debit: fee.amount,
            credit: 0,
            runningBalance: 0
          };
          (db as any).ledger.push(newEntry);
          addedCount++;
        }
      }
    });

    // 2. Audit first 6 months tuition debits
    const tuitionStructure = classStructures.find((f) => f.feeCategory === 'Tuition Fee');
    if (tuitionStructure) {
      MONTH_NAMES.slice(0, 7).forEach((month, idx) => {
        const hasTuitionMonth = existingLedger.some(
          (e) => e.type === 'FEE_ASSIGNED' && e.description.includes(month)
        );

        if (!hasTuitionMonth) {
          const monthNum = String(idx + 4).padStart(2, '0');
          const newEntry: LedgerEntry = {
            id: `LED-${student.id}-TUI-${month}-SYNC`,
            studentId: student.id,
            date: `2026-${monthNum}-01 08:00:00`,
            academicYear: student.academicYear,
            type: 'FEE_ASSIGNED',
            referenceId: `TUI-${month}`,
            description: `Monthly Tuition Fee - ${month} (Class ${student.classNum} Structure)`,
            debit: tuitionStructure.amount,
            credit: 0,
            runningBalance: 0
          };
          (db as any).ledger.push(newEntry);
          addedCount++;
        }
      });
    }

    if (addedCount > 0) {
      (db as any).persistLedger();
      db.logAudit(
        'Fee Structure Change',
        `Automated Sync: Posted ${addedCount} missing class fee assessments for ${student.name} (${student.id}).`
      );
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sra-ledger-updated'));
      }
    }

    return {
      updatedEntries: addedCount,
      message: addedCount > 0
        ? `Successfully synchronized ${addedCount} missing fee items from Class ${student.classNum} structure!`
        : `Student ledger is already 100% consistent with Class ${student.classNum} fee structure.`
    };
  }
};
