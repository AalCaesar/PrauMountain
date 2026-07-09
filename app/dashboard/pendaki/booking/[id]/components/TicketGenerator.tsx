'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Download, Loader2 } from 'lucide-react';

interface BookingData {
  bookingCode: string;
  leaderName: string;
  totalMembers: number;
  hikingDate: string;
  pathName: string;
  mountainName?: string;
  basecampName?: string;
}

interface TicketGeneratorProps {
  bookingData: BookingData;
  className?: string;
}

export default function TicketGenerator({ bookingData, className = '' }: TicketGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const generateTicket = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Generate QR Code as Data URL (high resolution for scanning)
      const qrCodeDataUrl = await QRCode.toDataURL(bookingData.bookingCode, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#065f46', // emerald-800 (darker for better contrast)
          light: '#FFFFFF',
        },
      });

      // Create PDF (A5 size: 148mm x 210mm - larger, professional format)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });

      // Dynamic page dimensions (A5: 148mm x 210mm)
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15; // Increased margin for A5
      const contentWidth = pageWidth - (margin * 2);

      // ============= DYNAMIC Y POSITIONING =============
      let yPos = 0;

      // ============= HEADER SECTION =============
      // Dark green header background (taller for A5)
      pdf.setFillColor(6, 95, 70); // #065f46 - darker emerald
      pdf.rect(0, 0, pageWidth, 35, 'F');

      yPos = 12;
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18); // Larger for A5
      pdf.setFont('helvetica', 'bold');
      pdf.text('E-TICKET PENDAKIAN', pageWidth / 2, yPos, { align: 'center' });

      yPos += 10;
      pdf.setFontSize(22); // Larger for A5
      pdf.text('GUNUNG PRAU', pageWidth / 2, yPos, { align: 'center' });

      yPos += 8;
      pdf.setFontSize(10); // Slightly larger
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(209, 250, 229); // light emerald
      pdf.text('Dieng Plateau, Jawa Tengah', pageWidth / 2, yPos, { align: 'center' });

      // ============= QR CODE SECTION =============
      yPos = 45; // More space from header for A5
      const qrSize = 50; // Larger QR for A5
      const qrX = (pageWidth - qrSize) / 2;

      // QR Code border/padding
      pdf.setFillColor(248, 250, 252); // very light gray background
      pdf.setDrawColor(209, 250, 229); // emerald-100 border
      pdf.setLineWidth(0.5);
      pdf.roundedRect(qrX - 4, yPos - 4, qrSize + 8, qrSize + 8, 2, 2, 'FD');

      // Add QR code
      pdf.addImage(qrCodeDataUrl, 'PNG', qrX, yPos, qrSize, qrSize);
      yPos += qrSize + 8; // Move past QR code

      // Booking code below QR (perfectly centered)
      pdf.setFontSize(12); // Larger for A5
      pdf.setTextColor(6, 95, 70); // dark emerald
      pdf.setFont('helvetica', 'bold');
      pdf.text(bookingData.bookingCode, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8; // More space after booking code

      // Divider line after QR section
      pdf.setDrawColor(229, 231, 235); // gray-200
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 4.5; // More space after divider

      // ============= INFORMASI BOOKING SECTION =============
      // Section title
      pdf.setFontSize(11); // Larger for A5
      pdf.setTextColor(6, 95, 70);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMASI BOOKING', margin, yPos);
      yPos += 8; // More space after title

      // Card background (draw first, then fill content)
      const cardStartY = yPos;
      const cardHeight = bookingData.basecampName ? 45 : 38; // Taller for A5
      pdf.setFillColor(249, 250, 251); // gray-50
      pdf.setDrawColor(229, 231, 235); // gray-200
      pdf.setLineWidth(0.3);
      pdf.roundedRect(margin, cardStartY, contentWidth, cardHeight, 2, 2, 'FD');

      yPos += 6; // Padding inside card

      // Two-column layout for details (wider spacing for A5)
      const labelX = margin + 5;
      const colonX = margin + 50; // More space between label and value
      const valueX = margin + 55;
      const lineHeight = 6; // More line spacing for A5

      // Helper function for two-column detail rows
      const addDetailRow = (label: string, value: string) => {
        // Label (darker, normal weight)
        pdf.setTextColor(75, 85, 99); // gray-600
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10); // Larger for A5
        pdf.text(label, labelX, yPos);

        // Colon separator
        pdf.text(':', colonX, yPos);

        // Value (bold and distinct)
        pdf.setTextColor(31, 41, 55); // gray-800
        pdf.setFont('helvetica', 'bold');
        const maxWidth = pageWidth - valueX - margin - 5;
        const lines = pdf.splitTextToSize(value, maxWidth);
        pdf.text(lines, valueX, yPos);

        yPos += lineHeight;
      };

      addDetailRow('Nama Ketua', bookingData.leaderName);
      addDetailRow('Jumlah Anggota', `${bookingData.totalMembers} orang`);
      addDetailRow('Tanggal Naik', formatDate(bookingData.hikingDate));
      addDetailRow('Jalur', bookingData.pathName);

      if (bookingData.basecampName) {
        addDetailRow('Basecamp', bookingData.basecampName);
      }

      // Move past card
      yPos = cardStartY + cardHeight + 8;

      // ============= IMPORTANT NOTICE - RED =============
      const noticeHeight = 14; // Slightly taller for A5

      // Red background for emphasis
      pdf.setFillColor(254, 226, 226); // red-100
      pdf.setDrawColor(248, 113, 113); // red-400
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin, yPos, contentWidth, noticeHeight, 2, 2, 'FD');

      pdf.setFontSize(11); // Larger for A5
      pdf.setTextColor(185, 28, 28); // red-700
      pdf.setFont('helvetica', 'bold');
      pdf.text('⚠ WAJIB DIBAWA', pageWidth / 2, yPos + 6, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8); // Slightly larger
      pdf.text('Tunjukkan e-ticket ini saat check-in di Basecamp', pageWidth / 2, yPos + 11, { align: 'center' });

      yPos += noticeHeight + 8; // More space after notice

      // ============= TERMS & CONDITIONS =============
      pdf.setFontSize(7); // Slightly larger for A5
      pdf.setTextColor(107, 114, 128); // gray-500
      pdf.setFont('helvetica', 'normal');

      const terms = [
        '• E-ticket berlaku untuk 1x pendakian sesuai tanggal tertera',
        '• Harap tiba di basecamp minimal 30 menit sebelum pendakian',
        '• Bawa identitas asli (KTP/SIM) untuk verifikasi',
      ];

      terms.forEach((term) => {
        pdf.text(term, margin + 3, yPos);
        yPos += 4.5; // More spacing between terms
      });

      // Save PDF with sanitized filename
      const sanitizedCode = bookingData.bookingCode.replace(/[^a-zA-Z0-9-]/g, '_');
      pdf.save(`E-Ticket-${sanitizedCode}.pdf`);

    } catch (err) {
      console.error('Error generating ticket:', err);
      setError('Gagal membuat e-ticket. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={className}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={generateTicket}
        disabled={isGenerating}
        className="w-full min-h-[44px] px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Membuat E-Ticket...
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            Download E-Ticket
          </>
        )}
      </button>

      <p className="mt-2 text-xs text-center text-gray-500">
        Format: PDF (A5) • Ukuran: ~100KB
      </p>
    </div>
  );
}
