import jsPDF from 'jspdf';

/**
 * Shared Poppins font loader for all PDF generators.
 *
 * Fetches the Poppins Regular and Bold TTF files from /fonts/ at runtime,
 * converts them to base64, registers them with jsPDF, and sets the default
 * font to Poppins. Returns true if registered, false if fallback is needed.
 */

let cachedRegular: string | null = null;
let cachedBold: string | null = null;

async function fetchFontAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} loading font ${url}`);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Register Poppins Regular + Bold with the given jsPDF doc and set it as
 * the active font. Font data is cached after the first call.
 * Returns true if Poppins was registered successfully, false otherwise.
 */
export async function registerPoppins(doc: jsPDF): Promise<boolean> {
  try {
    if (!cachedRegular) {
      cachedRegular = await fetchFontAsBase64('/fonts/Poppins-Regular.ttf');
    }
    if (!cachedBold) {
      cachedBold = await fetchFontAsBase64('/fonts/Poppins-Bold.ttf');
    }

    doc.addFileToVFS('Poppins-Regular.ttf', cachedRegular);
    doc.addFont('Poppins-Regular.ttf', 'Poppins', 'normal');

    doc.addFileToVFS('Poppins-Bold.ttf', cachedBold);
    doc.addFont('Poppins-Bold.ttf', 'Poppins', 'bold');

    doc.setFont('Poppins', 'normal');
    return true;
  } catch (err) {
    console.warn('[PDF Generator] Falling back to standard helvetica font:', err);
    doc.setFont('helvetica', 'normal');
    return false;
  }
}
