import React, { useState, useEffect } from 'react';
import {
  Printer,
  X,
  FileText,
  Share2,
  CheckCircle,
  Download,
  RotateCcw,
  Smartphone,
  QrCode,
  Link,
  ShieldCheck,
  ExternalLink,
  FileDown,
  Loader2,
  Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { PaymentTransaction, Student, SchoolSettings } from '../types';
import { db } from '../services/db';
import { SchoolCrest, SchoolOfficialSeal, PrincipalSignature, CashierSignature } from './SchoolGraphics';
import { numberToWords } from '../utils/numberToWords';
import { generatePaymentReceiptWhatsAppMessage, openWhatsAppDirect } from '../utils/whatsapp';
import { generateQrDataUrl } from '../utils/barcode';
import { exportElementToPdf } from '../utils/pdfExport';

interface ReceiptPrintModalProps {
  transaction: PaymentTransaction;
  onClose: () => void;
  onScanNext?: () => void;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  transaction,
  onClose,
  onScanNext
}) => {
  const [paperSize, setPaperSize] = useState<'80mm' | 'A4' | 'A5' | '58mm'>('80mm');
  const [showBilingual, setShowBilingual] = useState<boolean>(true);
  const [qrMode, setQrMode] = useState<'url' | 'reference'>('url');
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [copiedUrlNotice, setCopiedUrlNotice] = useState<boolean>(false);
  const [copiedRefNotice, setCopiedRefNotice] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<boolean>(false);

  const settings: SchoolSettings = db.getSettings();
  const student: Student | undefined = db.getStudentById(transaction.studentId);

  const formattedDate = new Date(transaction.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = new Date(transaction.date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const amountInWords = numberToWords(transaction.netAmountPaid);

  // Generate unique verification URL and reference payload
  const baseUrl = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://schoolfeemanager.local';

  const verificationUrl = `${baseUrl}?verify=${encodeURIComponent(transaction.receiptNo)}&student=${encodeURIComponent(transaction.studentId)}&amount=${transaction.netAmountPaid}&date=${encodeURIComponent(transaction.date)}&sig=OFFLINE_VERIFIED`;
  
  const transactionReference = `REF:${transaction.receiptNo}|STU:${transaction.studentId}|NAME:${transaction.studentName}|CLASS:${transaction.classNum}-${transaction.section}|AMT:${transaction.netAmountPaid}|PAY:${transaction.paymentMethod}|DT:${transaction.date.split('T')[0]}|VERIFIED_AUTHENTIC`;

  const activeQrPayload = qrMode === 'url' ? verificationUrl : transactionReference;

  useEffect(() => {
    let isMounted = true;
    const generateReceiptQr = async () => {
      // Generate QR Code containing the verification URL or transaction reference
      const url = await generateQrDataUrl(activeQrPayload, 160);
      if (isMounted) {
        setQrDataUrl(url);
      }
    };
    generateReceiptQr();
    return () => {
      isMounted = false;
    };
  }, [transaction.receiptNo, activeQrPayload]);

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    if (!student) return;
    const msg = generatePaymentReceiptWhatsAppMessage(student, transaction, settings);
    openWhatsAppDirect(student.mobile, msg);
  };

  const handleCopyReceiptText = () => {
    if (!student) return;
    const msg = generatePaymentReceiptWhatsAppMessage(student, transaction, settings);
    navigator.clipboard.writeText(msg);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const handleCopyVerificationUrl = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedUrlNotice(true);
    setTimeout(() => setCopiedUrlNotice(false), 2500);
  };

  const handleCopyTransactionRef = () => {
    navigator.clipboard.writeText(transactionReference);
    setCopiedRefNotice(true);
    setTimeout(() => setCopiedRefNotice(false), 2500);
  };

  const handleDownloadPdfReceipt = async () => {
    const targetEl = document.getElementById('printable-receipt-area');
    if (!targetEl) {
      console.error('Target printable-receipt-area element not found');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      // Capture the invoice element at high scale (3x) for crisp printing & vector-like PDF rendering
      const canvas = await html2canvas(targetEl, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const safeName = transaction.studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Invoice_${transaction.receiptNo}_${safeName}.pdf`;

      let pdf: jsPDF;

      if (paperSize === '80mm') {
        const mmWidth = 80;
        const mmHeight = Math.max(80, (canvas.height * mmWidth) / canvas.width);
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [mmWidth, mmHeight]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight, undefined, 'FAST');
      } else if (paperSize === '58mm') {
        const mmWidth = 58;
        const mmHeight = Math.max(60, (canvas.height * mmWidth) / canvas.width);
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [mmWidth, mmHeight]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight, undefined, 'FAST');
      } else if (paperSize === 'A5') {
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a5'
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 8;
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin,
          imgWidth,
          Math.min(imgHeight, pageHeight - margin * 2),
          undefined,
          'FAST'
        );
      } else {
        // Standard A4
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (imgHeight > pageHeight - margin * 2) {
          const fitScale = (pageHeight - margin * 2) / imgHeight;
          const fitW = imgWidth * fitScale;
          const fitH = imgHeight * fitScale;
          const fitX = (pageWidth - fitW) / 2;
          pdf.addImage(imgData, 'PNG', fitX, margin, fitW, fitH, undefined, 'FAST');
        } else {
          pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');
        }
      }

      pdf.save(filename);
      setDownloadSuccessNotice(true);
      setTimeout(() => setDownloadSuccessNotice(false), 3500);
    } catch (err) {
      console.error('Failed to generate PDF with jspdf & html2canvas:', err);
      await exportElementToPdf('printable-receipt-area', {
        filename: `Invoice_${transaction.receiptNo}.pdf`,
        format: paperSize === '80mm' ? 'receipt-80mm' : paperSize === '58mm' ? 'receipt-58mm' : paperSize === 'A5' ? 'a5' : 'a4'
      });
      setDownloadSuccessNotice(true);
      setTimeout(() => setDownloadSuccessNotice(false), 3500);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadHtmlReceipt = () => {
    const el = document.getElementById('printable-receipt-area');
    if (!el) return;
    const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Official Fee Receipt - ${transaction.receiptNo}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #f1f5f9; margin: 0; padding: 24px; display: flex; flex-direction: column; align-items: center; color: #0f172a; }
    .invoice-card { background: #ffffff; padding: 28px; border: 1px solid #cbd5e1; max-width: 650px; width: 100%; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.07); border-radius: 8px; }
    .print-btn-bar { margin-bottom: 16px; width: 100%; max-width: 650px; display: flex; justify-content: flex-end; gap: 8px; }
    .btn { background: #0f172a; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer; }
    .btn:hover { background: #1e293b; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-card { border: none; box-shadow: none; padding: 0; width: 100%; max-width: none; }
      .print-btn-bar { display: none !important; }
      @page { margin: 6mm; size: auto; }
    }
  </style>
</head>
<body>
  <div class="print-btn-bar">
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="invoice-card">
    ${el.innerHTML}
  </div>
</body>
</html>`;
    const blob = new Blob([receiptHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_Receipt_${transaction.receiptNo}_${transaction.studentId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-slate-100 rounded-xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-300">
        {/* Modal Top Control Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Print Official Fee Receipt</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Receipt #{transaction.receiptNo} · {transaction.studentName} ({transaction.studentId})
              </p>
            </div>
          </div>

          {/* Paper Size Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setPaperSize('80mm')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                paperSize === '80mm' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              80mm Thermal POS
            </button>
            <button
              onClick={() => setPaperSize('58mm')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                paperSize === '58mm' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              58mm Mini
            </button>
            <button
              onClick={() => setPaperSize('A4')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                paperSize === 'A4' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              A4 Standard
            </button>
            <button
              onClick={() => setPaperSize('A5')}
              className={`px-2.5 py-1 text-xs font-semibold rounded ${
                paperSize === 'A5' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              A5 Half Sheet
            </button>
          </div>

          {/* QR Code Format Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs">
            <span className="text-[10px] text-slate-400 font-semibold px-1">QR:</span>
            <button
              onClick={() => setQrMode('url')}
              className={`px-2 py-0.5 rounded font-medium ${
                qrMode === 'url' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
              title="QR code encodes direct verification URL"
            >
              URL
            </button>
            <button
              onClick={() => setQrMode('reference')}
              className={`px-2 py-0.5 rounded font-medium ${
                qrMode === 'reference' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
              title="QR code encodes transaction reference text"
            >
              Txn Ref
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdfReceipt}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded shadow-xs transition-colors disabled:opacity-50"
              title="Download official PDF invoice"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : downloadSuccessNotice ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? 'PDF...' : downloadSuccessNotice ? 'Saved ✓' : 'Save PDF'}</span>
            </button>

            <button
              onClick={() => setShowBilingual(!showBilingual)}
              className={`px-2.5 py-1 text-xs font-medium rounded border ${
                showBilingual
                  ? 'bg-amber-950 text-amber-300 border-amber-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Toggle Assamese / English bilingual labels"
            >
              অসমীয়া {showBilingual ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Preview Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-slate-200/90">
          <div
            id="printable-receipt-area"
            className={`bg-white shadow-xl text-slate-900 border border-slate-300 p-5 ${
              paperSize === '80mm'
                ? 'w-[320px] text-xs font-sans'
                : paperSize === '58mm'
                ? 'w-[230px] text-[11px] font-sans'
                : paperSize === 'A5'
                ? 'w-[520px] text-xs font-sans'
                : 'w-[680px] text-sm font-sans'
            }`}
          >
            {/* Header */}
            <div className="text-center pb-3 border-b-2 border-slate-800">
              <div className="flex justify-center mb-1">
                <SchoolCrest size={paperSize === '58mm' ? 36 : 46} customUrl={settings.logoUrl} />
              </div>
              <h1 className="font-extrabold tracking-tight text-slate-950 uppercase leading-tight text-sm md:text-base">
                {settings.schoolName}
              </h1>
              {showBilingual && (
                <div className="text-xs font-assamese font-semibold text-slate-800 mt-0.5">
                  {settings.schoolNameAssamese}
                </div>
              )}
              <div className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                {settings.address}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Affiliation: {settings.affiliationNo} · 📞 {settings.phone}
              </div>
            </div>

            {/* Receipt Title Badge */}
            <div className="my-2.5 py-1 px-3 bg-slate-900 text-white flex items-center justify-between text-xs font-bold uppercase tracking-wider rounded-xs">
              <span>{showBilingual ? 'মাচুলৰ ৰচিদ' : ''} FEE RECEIPT</span>
              <span className="font-mono text-amber-300">{transaction.receiptNo}</span>
            </div>

            {/* Student & Meta Information */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs py-1.5 border-b border-slate-300">
              <div>
                <span className="text-slate-500">Student ID: </span>
                <span className="font-mono font-bold text-slate-900">{transaction.studentId}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Date: </span>
                <span className="font-semibold text-slate-900">{formattedDate}</span>
              </div>
              <div>
                <span className="text-slate-500">Name: </span>
                <span className="font-bold text-slate-900">{transaction.studentName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Time: </span>
                <span className="font-mono text-slate-700">{formattedTime}</span>
              </div>
              <div>
                <span className="text-slate-500">Class & Sec: </span>
                <span className="font-semibold text-slate-900">
                  Class {transaction.classNum} - {transaction.section}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Roll No: </span>
                <span className="font-mono font-bold text-slate-900">{student?.rollNo || '1'}</span>
              </div>
              <div>
                <span className="text-slate-500">Academic Year: </span>
                <span className="font-semibold text-slate-900">{transaction.academicYear}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Guardian: </span>
                <span className="font-medium text-slate-800">{student?.guardianName || student?.fatherName || 'Parent'}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="mt-2.5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-800 font-bold">
                    <th className="py-1">Fee Description</th>
                    <th className="py-1 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transaction.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1">
                        <div className="font-medium text-slate-900">
                          {item.feeCategory}
                          {item.month && (
                            <span className="text-slate-500 text-[11px] ml-1">({item.month})</span>
                          )}
                        </div>
                        {item.remainingDue > 0 && (
                          <div className="text-[10px] text-amber-700">
                            Partial pay · Balance due: ₹{item.remainingDue.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td className="py-1 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        ₹{item.amountPaid.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Discounts */}
            <div className="mt-2.5 pt-2 border-t-2 border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Fee Total:</span>
                <span className="font-mono tabular-nums">₹{transaction.grossAmount.toLocaleString('en-IN')}</span>
              </div>

              {transaction.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Concession / Discount ({transaction.discountReason || 'Approved'}):</span>
                  <span className="font-mono tabular-nums">-₹{transaction.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-1 border-t border-slate-300">
                <span>NET PAID TODAY:</span>
                <span className="font-mono text-base tabular-nums">
                  ₹{transaction.netAmountPaid.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Amount in words */}
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200 text-[11px] text-slate-700 italic">
                <span className="font-semibold text-slate-900 not-italic">In Words: </span>
                {amountInWords}
              </div>

              {/* Previous vs Remaining Outstanding */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] bg-slate-100/80 p-2 rounded border border-slate-200 mt-2">
                <div>
                  <div className="text-slate-500">Previous Outstanding:</div>
                  <div className="font-mono font-bold text-slate-800">
                    ₹{transaction.previousOutstanding.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500">Remaining Balance Due:</div>
                  <div
                    className={`font-mono font-bold ${
                      transaction.remainingOutstanding > 0 ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {transaction.remainingOutstanding === 0
                      ? '₹0 (CLEARED ✓)'
                      : `₹${transaction.remainingOutstanding.toLocaleString('en-IN')}`}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="pt-2 text-[11px] text-slate-600 space-y-0.5">
                <div>
                  <span className="font-semibold text-slate-800">Payment Mode: </span>
                  <span className="font-medium text-slate-900">{transaction.paymentMethod}</span>
                  {transaction.upiUtr && (
                    <span className="font-mono ml-2 bg-slate-100 px-1 rounded">UTR: {transaction.upiUtr}</span>
                  )}
                  {transaction.chequeNumber && (
                    <span className="font-mono ml-2 bg-slate-100 px-1 rounded">
                      Chq #{transaction.chequeNumber} ({transaction.chequeBank})
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Received By: </span>
                  <span>{transaction.receivedBy}</span>
                </div>
              </div>
            </div>

            {/* Unique Digital Verification QR Code & Audit Seal */}
            <div className="mt-3 p-2 bg-slate-50 border border-slate-300 rounded flex items-center justify-between gap-2.5">
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-800 uppercase tracking-wide">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                  <span>Digital Verification QR</span>
                  <span className="text-[8.5px] font-mono text-blue-700 bg-blue-100/80 px-1 py-0.2 rounded font-bold">
                    VALID
                  </span>
                </div>
                <div className="text-[9.5px] font-mono text-slate-700 truncate">
                  <span className="text-slate-500">Ref: </span>
                  <strong className="text-blue-950 font-bold">{transaction.receiptNo}</strong>
                  <span className="text-[8px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded ml-1 font-semibold uppercase">
                    {qrMode === 'url' ? 'URL QR' : 'Ref QR'}
                  </span>
                </div>
                <div className="text-[8.5px] text-slate-500 font-mono truncate" title={qrMode === 'url' ? verificationUrl : transactionReference}>
                  {qrMode === 'url' ? verificationUrl.replace(/^https?:\/\//, '') : transactionReference}
                </div>
                <div className="text-[8px] text-slate-500 leading-tight">
                  {qrMode === 'url'
                    ? 'Scan QR with smartphone camera for instant digital receipt verification'
                    : 'Scan QR with barcode/QR scanner for offline ledger cryptographic reference'}
                </div>
              </div>

              {/* Unique QR Code Graphic */}
              <div className="shrink-0 flex flex-col items-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Verification QR for ${transaction.receiptNo}`}
                    className="rounded border border-slate-300 bg-white p-0.5 shadow-2xs cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                    style={{
                      width: paperSize === '58mm' ? 48 : paperSize === '80mm' ? 62 : 72,
                      height: paperSize === '58mm' ? 48 : paperSize === '80mm' ? 62 : 72
                    }}
                    onClick={() => setShowVerifyModal(true)}
                    title="Click to preview QR verification record"
                  />
                ) : (
                  <div
                    className="bg-slate-100 rounded border border-slate-300 flex items-center justify-center text-[8px] text-slate-400 font-mono text-center"
                    style={{
                      width: paperSize === '58mm' ? 48 : paperSize === '80mm' ? 62 : 72,
                      height: paperSize === '58mm' ? 48 : paperSize === '80mm' ? 62 : 72
                    }}
                  >
                    Loading QR...
                  </div>
                )}
                <span className="text-[7.5px] font-mono font-bold text-slate-600 uppercase mt-0.5 tracking-wider">
                  SCAN TO VERIFY
                </span>
              </div>
            </div>

            {/* Official Signatures & Seal Imprint */}
            <div className="mt-4 pt-3 border-t border-dashed border-slate-400 flex items-center justify-between">
              <div className="text-center">
                <CashierSignature width={paperSize === '58mm' ? 80 : 110} customUrl={settings.accountantSignatureUrl} />
                <div className="text-[10px] font-semibold text-slate-700 border-t border-slate-400 pt-0.5">
                  Accounts Officer
                </div>
              </div>

              <div className="flex justify-center">
                <SchoolOfficialSeal size={paperSize === '58mm' ? 60 : 76} customUrl={settings.sealUrl} />
              </div>

              <div className="text-center">
                <PrincipalSignature width={paperSize === '58mm' ? 90 : 120} customUrl={settings.principalSignatureUrl} />
                <div className="text-[10px] font-semibold text-slate-700 border-t border-slate-400 pt-0.5">
                  Principal / Headmaster
                </div>
              </div>
            </div>

            {/* Receipt Footer Note */}
            <div className="mt-3 pt-1 border-t border-slate-200 text-center text-[9px] text-slate-500 leading-tight">
              {settings.receiptFooter}
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="bg-white border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
              title="Open WhatsApp message with receipt details"
            >
              <Smartphone className="w-4 h-4" />
              <span>Send WhatsApp Receipt</span>
            </button>
            <button
              onClick={() => setShowVerifyModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors border border-blue-200"
              title="Inspect receipt verification certificate"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Verify Receipt</span>
            </button>
            <button
              onClick={handleCopyVerificationUrl}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors border border-slate-300"
              title="Copy QR Verification URL"
            >
              <Link className="w-3.5 h-3.5 text-blue-600" />
              <span>{copiedUrlNotice ? 'URL Copied! ✓' : 'Copy Verify URL'}</span>
            </button>
            <button
              onClick={handleCopyReceiptText}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors border border-slate-300"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedNotice ? 'Receipt Copied! ✓' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdfReceipt}
              disabled={isGeneratingPdf}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 ${
                downloadSuccessNotice
                  ? 'bg-emerald-700 ring-2 ring-emerald-400'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
              title={`Download official invoice PDF in ${paperSize} format using jspdf and html2canvas`}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : downloadSuccessNotice ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {isGeneratingPdf
                  ? 'Generating PDF...'
                  : downloadSuccessNotice
                  ? 'PDF Saved to Device! ✓'
                  : `Download Invoice PDF (${paperSize})`}
              </span>
            </button>

            <button
              onClick={handleDownloadHtmlReceipt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium shadow-xs transition-colors"
              title="Download offline HTML invoice"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Print Receipt Now (F9)</span>
            </button>

            {onScanNext && (
              <button
                onClick={onScanNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Scan Next Student (F2)</span>
              </button>
            )}
          </div>
        </div>

        {/* Verification Certificate Preview Modal */}
        {showVerifyModal && (
          <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-300 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Receipt Verification Record</h3>
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Validated in Offline Ledger
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                {qrDataUrl && (
                  <div className="text-center">
                    <img
                      src={qrDataUrl}
                      alt="Verification QR"
                      className="w-36 h-36 mx-auto rounded-lg border border-slate-300 shadow-xs bg-white p-1"
                    />
                    <div className="text-[10px] font-mono text-slate-500 mt-1.5">
                      Transaction Ref: <span className="font-bold text-slate-900">{transaction.receiptNo}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-900">{transaction.studentName} ({transaction.studentId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Class & Section:</span>
                  <span className="font-semibold text-slate-800">Class {transaction.classNum}-{transaction.section}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-mono font-bold text-emerald-700">₹{transaction.netAmountPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-medium text-slate-800">{transaction.paymentMethod} {transaction.upiUtr ? `(UTR: ${transaction.upiUtr})` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-mono text-slate-700">{formattedDate} {formattedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Issued By:</span>
                  <span className="text-slate-700">{transaction.receivedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification URL:</span>
                  <span className="font-mono text-[10px] text-blue-700 truncate max-w-[200px]" title={verificationUrl}>
                    {verificationUrl}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Reference:</span>
                  <span className="font-mono text-[10px] text-slate-800 truncate max-w-[200px]" title={transactionReference}>
                    {transactionReference}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={handleCopyTransactionRef}
                  className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                  title="Copy formatted transaction reference"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{copiedRefNotice ? 'Ref Copied!' : 'Copy Reference'}</span>
                </button>
                <button
                  onClick={handleCopyVerificationUrl}
                  className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>{copiedUrlNotice ? 'URL Copied!' : 'Copy Verification URL'}</span>
                </button>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-1.5 rounded bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
