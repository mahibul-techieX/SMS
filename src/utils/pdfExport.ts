import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface PdfExportOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'a5' | 'id-card' | 'receipt-80mm' | 'receipt-58mm';
  scale?: number;
  quality?: number;
}

/**
 * Exports an HTML DOM element to high-resolution downloadable PDF
 */
export async function exportElementToPdf(
  element: HTMLElement | string,
  options: PdfExportOptions = {}
): Promise<boolean> {
  try {
    const targetElement = typeof element === 'string' ? document.getElementById(element) : element;
    if (!targetElement) {
      console.error('Target element for PDF export not found:', element);
      return false;
    }

    const {
      filename = `Document_${Date.now()}.pdf`,
      orientation = 'portrait',
      format = 'a4',
      scale = 2.5
    } = options;

    // Use html2canvas to capture the element faithfully
    const canvas = await html2canvas(targetElement, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // Calculate dimensions based on format
    let pdf: jsPDF;

    if (format === 'id-card') {
      // Standard CR80 ID Card dimensions: 85.6mm x 53.98mm (or landscape)
      const isLandscape = orientation === 'landscape';
      const cardWidth = isLandscape ? 85.6 : 54;
      const cardHeight = isLandscape ? 54 : 85.6;

      pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [cardWidth, cardHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, cardWidth, cardHeight, undefined, 'FAST');
    } else if (format === 'receipt-80mm') {
      // 80mm thermal receipt continuous paper
      // Canvas aspect ratio determines the page height in mm
      const mmWidth = 80;
      const mmHeight = (canvas.height * mmWidth) / canvas.width;

      pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [mmWidth, Math.max(mmHeight, 80)]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight, undefined, 'FAST');
    } else if (format === 'receipt-58mm') {
      const mmWidth = 58;
      const mmHeight = (canvas.height * mmWidth) / canvas.width;

      pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [mmWidth, Math.max(mmHeight, 60)]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight, undefined, 'FAST');
    } else if (format === 'a5') {
      pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a5'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 10;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, Math.min(imgHeight, pageHeight - 10), undefined, 'FAST');
    } else {
      // Default A4
      pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 16;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > pageHeight - 16) {
        // Multi-page or scale to fit
        const scaleFactor = (pageHeight - 20) / imgHeight;
        const fitWidth = imgWidth * scaleFactor;
        const fitHeight = imgHeight * scaleFactor;
        const posX = (pageWidth - fitWidth) / 2;
        pdf.addImage(imgData, 'PNG', posX, 10, fitWidth, fitHeight, undefined, 'FAST');
      } else {
        const posX = 8;
        pdf.addImage(imgData, 'PNG', posX, 8, imgWidth, imgHeight, undefined, 'FAST');
      }
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    return false;
  }
}
