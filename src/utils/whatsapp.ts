import { PaymentTransaction, Student, SchoolSettings } from '../types';

export function formatIndianPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return '91' + digits;
  }
  return digits;
}

export function generatePaymentReceiptWhatsAppMessage(
  student: Student,
  transaction: PaymentTransaction,
  settings: SchoolSettings
): string {
  const dateFormatted = new Date(transaction.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return `🏫 *${settings.schoolName.toUpperCase()}*
*FEE PAYMENT RECEIPT CONFIRMATION*
━━━━━━━━━━━━━━━━━━━
Dear Parent / Guardian,

Payment of *₹${transaction.netAmountPaid.toLocaleString('en-IN')}* has been successfully received and recorded in the school ledger.

📄 *Receipt No:* ${transaction.receiptNo}
📅 *Date:* ${dateFormatted}
👤 *Student:* ${student.name} (${student.id})
📚 *Class:* ${student.classNum} - Section ${student.section} (Roll: ${student.rollNo})
💳 *Payment Mode:* ${transaction.paymentMethod} ${transaction.upiUtr ? `(UTR: ${transaction.upiUtr})` : ''}

💰 *Amount Paid Today:* ₹${transaction.netAmountPaid.toLocaleString('en-IN')}
⚠️ *Remaining Due Balance:* ₹${transaction.remainingOutstanding.toLocaleString('en-IN')}

Official computerized receipt has been issued. Thank you for your timely payment!

Accounts Office,
${settings.schoolName}
📞 ${settings.phone}`;
}

export function generateDueReminderWhatsAppMessage(
  student: Student,
  totalDue: number,
  settings: SchoolSettings,
  breakdown?: { tuition: number; books: number; exam: number; others: number }
): string {
  const breakdownText = breakdown
    ? `\n• Tuition Fee: ₹${breakdown.tuition.toLocaleString('en-IN')}
• Books & Study Kit: ₹${breakdown.books.toLocaleString('en-IN')}
• Examination Fee: ₹${breakdown.exam.toLocaleString('en-IN')}
• Other Charges: ₹${breakdown.others.toLocaleString('en-IN')}`
    : '';

  return `🏫 *${settings.schoolName.toUpperCase()}*
*NOTICE: OUTSTANDING SCHOOL FEE REMINDER*
━━━━━━━━━━━━━━━━━━━
Dear Parent of *${student.name}* (${student.id}),
Class: ${student.classNum}-${student.section}, Roll: ${student.rollNo}

This is a gentle reminder that the academic fee for session ${settings.academicYear} remains outstanding.

⚠️ *Total Outstanding Balance:* *₹${totalDue.toLocaleString('en-IN')}*${breakdownText}

Kindly clear the pending fees at the school accounts counter or via UPI/Bank transfer on or before the due date (10th of current month) to ensure uninterrupted academic services.

If payment has already been made in the last 24 hours, kindly disregard this notice or present your receipt at the counter.

Accounts Department,
${settings.schoolName}
📞 Contact: ${settings.phone}`;
}

export function openWhatsAppDirect(phone: string, text: string) {
  const sanitizedPhone = formatIndianPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/${sanitizedPhone}?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
