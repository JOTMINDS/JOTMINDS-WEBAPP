import jsPDF from 'jspdf';

/**
 * Shared Poppins font loader for all PDF generators.
 *
 * Fetches the Poppins Regular and Bold TTF files from /fonts/ at runtime,
 * converts them to base64, registers them with jsPDF, and sets the default
 * font to Poppins.
 *
 * Call once per jsPDF document instance before rendering any text.
 */

let cachedRegular: string | null = null;
let cachedBold: string | null = null;

async function fetchFontAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
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
 */
export async function registerPoppins(doc: jsPDF): Promise<void> {
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
  } catch (err) {
    console.warn('Failed to load Poppins font, falling back to helvetica:', err);
    // Graceful fallback – PDFs still generate, just with the default font.
  }
}
