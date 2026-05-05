import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export data to a PDF file using jsPDF and jspdf-autotable
 * @param {string} title - Title of the document
 * @param {Array} columns - Array of column header strings
 * @param {Array} data - Array of data arrays (rows)
 * @param {string} filename - Output filename (without .pdf)
 */
export const exportToPDF = (title, columns, data, filename) => {
  const doc = new jsPDF();

  // Add Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add Date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, 14, 30);

  // Generate Table
  autoTable(doc, {
    startY: 36,
    head: [columns],
    body: data,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }, // matches var(--accent-blue)
    styles: { fontSize: 9, cellPadding: 4 },
  });

  doc.save(`${filename}.pdf`);
};

/**
 * Export data to an Excel file using SheetJS
 * @param {Array} data - Array of objects containing the data
 * @param {string} filename - Output filename (without .xlsx)
 */
export const exportToExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
  
  // Create and save file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
