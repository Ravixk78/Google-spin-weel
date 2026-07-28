import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import { Download, RefreshCw, X, QrCode, FileText } from 'lucide-react';
import api from '../services/api';

const QRCodeModal = ({ isOpen, branch, onClose, onRefresh }) => {
  const qrRef = useRef(null);

  if (!isOpen || !branch) return null;

  const targetUrl = `${window.location.origin}/?branch=${branch.code}&qr=${branch.qr_code_token}`;

  // Download PNG
  const downloadPNG = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 100, 100, 800, 800);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngFile;
      downloadLink.download = `QR_Code_${branch.code}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Download PDF Poster
  const downloadPDFPoster = () => {
    const doc = new jsPDF('portrait', 'mm', 'a4');

    // Background Luxury Header
    doc.setFillColor(10, 31, 28); // Deep Emerald
    doc.rect(0, 0, 210, 50, 'F');

    doc.setTextColor(212, 175, 55); // Gold
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MAJLIS AL OUD PERFUMES UAE', 105, 25, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(branch.name.toUpperCase(), 105, 38, { align: 'center' });

    // Poster Instructions
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(16);
    doc.text('SCAN & SPIN TO WIN PRIZES!', 105, 70, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Leave a Google Review for this branch and spin the luxury wheel for rewards.', 105, 78, { align: 'center' });

    // Convert SVG to Canvas image for PDF insertion
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 800;
      canvas.height = 800;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 800, 800);

      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 55, 90, 100, 100);

      // Footer Box
      doc.setFillColor(243, 229, 171); // Light Gold
      doc.rect(20, 210, 170, 25, 'F');

      doc.setFontSize(10);
      doc.setTextColor(10, 31, 28);
      doc.text(`Branch Code: ${branch.code} | Token: ${branch.qr_code_token}`, 105, 222, { align: 'center' });
      doc.text('Valid for store customers with invoice receipt.', 105, 228, { align: 'center' });

      doc.save(`Branch_QR_Poster_${branch.code}.pdf`);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Regenerate Token
  const handleRegenerate = async () => {
    if (window.confirm('Are you sure you want to regenerate the QR Token? The old QR code poster will no longer be valid.')) {
      try {
        await api.post(`/admin/branches/${branch.id}/regenerate-qr`);
        if (onRefresh) onRefresh();
      } catch (err) {
        alert('Failed to regenerate QR code token.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel bg-luxury-card border-gold-400/40 rounded-2xl p-6 text-center shadow-gold-lg">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-300 text-xs font-semibold uppercase mb-3">
          <QrCode className="w-3.5 h-3.5" /> Branch QR Code Standee
        </div>

        <h2 className="text-xl font-bold text-white mb-1">{branch.name}</h2>
        <p className="text-xs text-slate-400 mb-6">{branch.address}</p>

        {/* QR Rendering Container */}
        <div ref={qrRef} className="bg-white p-6 rounded-2xl shadow-xl inline-block mb-6 border-4 border-gold-400">
          <QRCodeSVG
            value={targetUrl}
            size={220}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="bg-slate-900/80 p-3 rounded-lg text-xs font-mono text-slate-300 truncate mb-6 border border-slate-800">
          {targetUrl}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={downloadPNG}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-gold-400" /> Download PNG
          </button>

          <button
            onClick={downloadPDFPoster}
            className="flex items-center justify-center gap-2 px-3 py-2.5 btn-gold rounded-lg text-xs font-bold shadow-gold"
          >
            <FileText className="w-4 h-4" /> Download PDF Poster
          </button>
        </div>

        <button
          onClick={handleRegenerate}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Regenerate QR Token
        </button>

      </div>
    </div>
  );
};

export default QRCodeModal;
