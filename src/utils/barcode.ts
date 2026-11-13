import QRCode from 'qrcode';

// Code 128 Subset B patterns (ASCII 32 to 127)
// Each character is 11 modules wide (6 bars/spaces), stop character is 13 modules
const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', // 0-9 (sp to ))
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', // 10-19 (* to 3)
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', // 20-29 (4 to =)
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', // 30-39 (> to G)
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', // 40-49 (H to Q)
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', // 50-59 (R to [)
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', // 60-69 (\ to e)
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', // 70-79 (f to o)
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', // 80-89 (p to y)
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', // 90-99 (z to c1)
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112' // 100-106 (startA, startB, startC, stop)
];

const START_B = 104;
const STOP = 106;

/**
 * Encodes an ASCII string into Code 128 Subtype B modules
 */
export function encodeCode128B(text: string): string {
  if (!text) return '';
  const charCodes: number[] = [];
  
  // Start with Start B
  charCodes.push(START_B);
  let checksum = START_B;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    if (code >= 0 && code <= 95) {
      charCodes.push(code);
      checksum += code * (i + 1);
    }
  }

  // Calculate check character
  const checkChar = checksum % 103;
  charCodes.push(checkChar);
  charCodes.push(STOP);

  // Convert to widths pattern
  let moduleString = '';
  for (const code of charCodes) {
    const pattern = CODE128_PATTERNS[code];
    if (!pattern) continue;
    let isBar = true;
    for (const widthChar of pattern) {
      const width = parseInt(widthChar, 10);
      moduleString += (isBar ? '1' : '0').repeat(width);
      isBar = !isBar;
    }
  }

  return moduleString;
}

/**
 * Returns an SVG string for a Code 128 barcode
 */
export function generateBarcodeSvg(
  text: string, 
  options?: { width?: number; height?: number; displayValue?: boolean }
): string {
  const { width = 220, height = 54, displayValue = true } = options || {};
  const modules = encodeCode128B(text);
  if (!modules) return '';

  const quietZone = 10;
  const totalModules = modules.length + quietZone * 2;
  const barHeight = displayValue ? height - 16 : height;
  const moduleWidth = width / totalModules;

  let rects = '';
  for (let i = 0; i < modules.length; i++) {
    if (modules[i] === '1') {
      const x = (i + quietZone) * moduleWidth;
      rects += `<rect x="${x.toFixed(2)}" y="2" width="${moduleWidth.toFixed(2)}" height="${barHeight}" fill="#0f172a" />`;
    }
  }

  const textElement = displayValue
    ? `<text x="${(width / 2).toFixed(2)}" y="${(height - 2).toFixed(2)}" style="font-family: monospace; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-anchor: middle;" textAnchor="middle" fill="#0f172a">${text}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#ffffff; border-radius: 4px; padding: 2px;">
    ${rects}
    ${textElement}
  </svg>`;
}

/**
 * Generates QR Code Data URL async
 */
export async function generateQrDataUrl(text: string, size = 120): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#0f2b48',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}
