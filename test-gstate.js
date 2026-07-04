import { jsPDF } from 'jspdf';
const pdf = new jsPDF();
try {
  const state = new pdf.GState({ opacity: 0.1 });
  console.log("Success:", state);
} catch (e) {
  console.error("Failed pdf.GState:", e.message);
}
