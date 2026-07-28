import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export dataset to Excel (.xlsx)
export const exportToExcel = (data, fileName = 'Majlis_Al_Oud_Report') => {
  if (!data || data.length === 0) return alert('No data to export.');

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export dataset to CSV (.csv)
export const exportToCSV = (data, fileName = 'Majlis_Al_Oud_Report') => {
  if (!data || data.length === 0) return alert('No data to export.');

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export dataset to PDF (.pdf)
export const exportToPDF = (headers, rows, title = 'Majlis Al Oud Report', fileName = 'Majlis_Al_Oud_Report') => {
  if (!rows || rows.length === 0) return alert('No data to export.');

  const doc = new jsPDF('landscape');

  // Header background
  doc.setFillColor(10, 31, 28); // Deep Emerald
  doc.rect(0, 0, 297, 30, 'F');

  // Title
  doc.setTextColor(212, 175, 55); // Gold
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MAJLIS AL OUD PERFUMES UAE', 14, 15);

  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 14, 23);

  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 200, 23);

  // AutoTable
  doc.autoTable({
    startY: 35,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 77, 69],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 247, 248]
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    }
  });

  doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
};
