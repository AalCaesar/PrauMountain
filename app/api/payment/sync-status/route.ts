import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
const midtransClient = require('midtrans-client');
import { Resend } from 'resend';
import { jsPDF } from 'jspdf'; // 🔥 TAMBAHAN: Import jsPDF
import QRCode from 'qrcode'; // 🔥 TAMBAHAN: Import QRCode

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  console.log("=========================================");
  console.log("🚀 API SYNC-STATUS DIPANGGIL DARI BROWSER!");

  try {
    const body = await request.json();
    const { booking_id } = body;

    if (!booking_id) {
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseKey!);

    // 🔥 MENGAMBIL SEMUA DATA YANG DIBUTUHKAN UNTUK PDF TIKET
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        kode_booking,
        tanggal_naik,
        total_anggota,
        jalur_pendakian (
          nama_jalur,
          basecamps (
            nama_basecamp
          )
        ),
        users!bookings_user_id_fkey(email, nama_lengkap)
      `)
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const transactionStatus = await snap.transaction.status(booking.kode_booking);

    if (transactionStatus.transaction_status === 'settlement' || transactionStatus.transaction_status === 'capture') {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status_booking: 'CONFIRMED',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', booking_id);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
      }

      try {
        revalidatePath('/dashboard/admin-basecamp/bookings');
      } catch (cacheError) {
        console.warn('Failed to clear cache for admin dashboard:', cacheError);
      }

      try {
        // @ts-ignore
        const userEmail = booking.users?.email || 'email@contoh.com';
        // @ts-ignore
        const userName = booking.users?.nama_lengkap || 'Pendaki';

        // ====================================================================
        // 🖨️ PROSES PEMBUATAN PDF E-TICKET (IDENTIK DENGAN TICKETGENERATOR.TSX)
        // ====================================================================
        console.log("⚙️ Membuat PDF E-Ticket...");

        const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
          });
        };

        const qrCodeDataUrl = await QRCode.toDataURL(booking.kode_booking, {
          width: 400, margin: 2, errorCorrectionLevel: 'H',
          color: { dark: '#065f46', light: '#FFFFFF' },
        });

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - (margin * 2);
        let yPos = 0;

        // Header
        pdf.setFillColor(6, 95, 70);
        pdf.rect(0, 0, pageWidth, 35, 'F');
        yPos = 12;
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('E-TICKET PENDAKIAN', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
        pdf.setFontSize(20);
        pdf.text('GUNUNG PRAU', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(209, 250, 229);
        pdf.text('Dieng Plateau, Jawa Tengah', pageWidth / 2, yPos, { align: 'center' });

        // QR Code
        yPos = 45;
        const qrSize = 50;
        const qrX = (pageWidth - qrSize) / 2;
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(209, 250, 229);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(qrX - 4, yPos - 4, qrSize + 8, qrSize + 8, 2, 2, 'FD');
        pdf.addImage(qrCodeDataUrl, 'PNG', qrX, yPos, qrSize, qrSize);
        yPos += qrSize + 8;

        // Booking Code
        pdf.setFontSize(12);
        pdf.setTextColor(6, 95, 70);
        pdf.setFont('helvetica', 'bold');
        pdf.text(booking.kode_booking, pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;

        // Divider
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 4.5;

        // Info Booking
        pdf.setFontSize(11);
        pdf.setTextColor(6, 95, 70);
        pdf.setFont('helvetica', 'bold');
        pdf.text('INFORMASI BOOKING', margin, yPos);
        yPos += 8;

        const cardStartY = yPos;
        const cardHeight = 45;
        pdf.setFillColor(249, 250, 251);
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(margin, cardStartY, contentWidth, cardHeight, 2, 2, 'FD');
        yPos += 6;

        const labelX = margin + 5;
        const colonX = margin + 50;
        const valueX = margin + 55;
        const lineHeight = 6;

        const addDetailRow = (label: string, value: string) => {
          pdf.setTextColor(75, 85, 99);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.text(label, labelX, yPos);
          pdf.text(':', colonX, yPos);
          pdf.setTextColor(31, 41, 55);
          pdf.setFont('helvetica', 'bold');
          const maxWidth = pageWidth - valueX - margin - 5;
          const lines = pdf.splitTextToSize(value, maxWidth);
          pdf.text(lines, valueX, yPos);
          yPos += lineHeight;
        };

        // @ts-ignore
        const jalurName = booking.jalur_pendakian?.nama_jalur || '-';
        // @ts-ignore
        const basecampName = booking.jalur_pendakian?.basecamps?.nama_basecamp || '-';

        addDetailRow('Nama Ketua', userName);
        addDetailRow('Jumlah Anggota', `${booking.total_anggota} orang`);
        addDetailRow('Tanggal Naik', formatDate(booking.tanggal_naik));
        addDetailRow('Jalur', jalurName);
        addDetailRow('Basecamp', basecampName);

        yPos = cardStartY + cardHeight + 8;

        // Notice Red Box
        const noticeHeight = 14;
        pdf.setFillColor(254, 226, 226);
        pdf.setDrawColor(248, 113, 113);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, yPos, contentWidth, noticeHeight, 2, 2, 'FD');
        pdf.setFontSize(11);
        pdf.setTextColor(185, 28, 28);
        pdf.setFont('helvetica', 'bold');
        pdf.text('! WAJIB DIBAWA', pageWidth / 2, yPos + 6, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text('Tunjukkan e-ticket ini saat check-in di Basecamp', pageWidth / 2, yPos + 11, { align: 'center' });
        yPos += noticeHeight + 8;

        // Terms
        pdf.setFontSize(7);
        pdf.setTextColor(107, 114, 128);
        pdf.setFont('helvetica', 'normal');
        const terms = [
          '• E-ticket berlaku untuk 1x pendakian sesuai tanggal tertera',
          '• Harap tiba di basecamp minimal 30 menit sebelum pendakian',
          '• Bawa identitas asli (KTP/SIM) untuk verifikasi',
        ];
        terms.forEach((term) => {
          pdf.text(term, margin + 3, yPos);
          yPos += 4.5;
        });

        // Mengubah PDF menjadi Buffer agar bisa dilampirkan via Email
        const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

        // ====================================================================
        // 📧 KIRIM EMAIL DENGAN LAMPIRAN PDF
        // ====================================================================
        console.log("📧 Mengirim email beserta lampiran PDF...");
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: userEmail,
          subject: 'Bukti Pembayaran Berhasil - E-Ticket Gunung Prau',
          html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #059669; text-align: center;">Pembayaran Berhasil! 🎉</h2>
                <p>Halo <b>${userName}</b>, pembayaran untuk tiket pendakian Gunung Prau Anda telah berhasil.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
                  <p style="margin: 0; color: #4b5563; font-size: 14px;">Kode Booking Anda:</p>
                  <h3 style="margin: 5px 0 0; color: #111827; letter-spacing: 1px;">${booking.kode_booking}</h3>
                </div>
                <p style="text-align: center; color: #4b5563;">E-Ticket PDF telah kami lampirkan pada email ini. Silakan unduh dan tunjukkan kepada petugas basecamp saat check-in.</p>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://prau-mountain.vercel.app'}/dashboard/pendaki/booking/${booking.id}" 
                     style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Lihat Status Booking di Website
                  </a>
                </div>
              </div>
            `,
          attachments: [
            {
              filename: `E-Ticket_PRAU_${booking.kode_booking}.pdf`,
              content: pdfBuffer
            }
          ]
        });
        console.log("✅ Email & Lampiran E-Ticket sukses terkirim!");
      } catch (emailError) {
        console.error("❌ Gagal kirim email:", emailError);
      }

      return NextResponse.json({ status: 'CONFIRMED' });
    }

    return NextResponse.json({ status: transactionStatus.transaction_status });
  } catch (error: any) {
    console.error('❌ Kesalahan sistem server:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}