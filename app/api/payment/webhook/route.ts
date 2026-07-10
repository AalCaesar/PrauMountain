import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Midtrans notification payload interface
interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status: string;
  currency: string;
}

// Verify Midtrans signature for security
function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  const input = orderId + statusCode + grossAmount + serverKey;
  const hash = crypto.createHash('sha512').update(input).digest('hex');
  return hash === signatureKey;
}


//Generate HTML email template for booking confirmation
function generateConfirmationEmail(bookingCode: string, bookingId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://prau-mountain.vercel.app';
  const ticketUrl = `${baseUrl}/dashboard/pendaki/booking/${bookingId}`;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pembayaran Berhasil - Gunung Prau</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #2c5f2d 0%, #97be5a 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✓ Pembayaran Berhasil!</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #2c5f2d; font-size: 22px; font-weight: 600;">Tiket Pendakian Gunung Prau Anda telah Dikonfirmasi</h2>

              <p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
                Terima kasih! Pembayaran Anda telah berhasil diproses. Tiket pendakian Anda sudah siap untuk diunduh.
              </p>

              <div style="background-color: #f8f9fa; border-left: 4px solid #2c5f2d; padding: 16px 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px; color: #666666; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Kode Booking</p>
                <p style="margin: 0; color: #2c5f2d; font-size: 24px; font-weight: 700; font-family: 'Courier New', monospace;">${bookingCode}</p>
              </div>

              <p style="margin: 24px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                Silakan unduh e-ticket Anda dan tunjukkan kepada petugas saat check-in di lokasi pendakian.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${ticketUrl}" style="display: inline-block; padding: 16px 48px; background-color: #2c5f2d; color: #ffffff; text-decoration: none; font-size: 18px; font-weight: 600; border-radius: 6px; box-shadow: 0 4px 12px rgba(44, 95, 45, 0.3);">
                      Lihat & Download E-Ticket
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:<br>
                <a href="${ticketUrl}" style="color: #2c5f2d; word-break: break-all;">${ticketUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.5;">
                Email ini dikirim secara otomatis. Mohon tidak membalas email ini.<br>
                Jika ada pertanyaan, silakan hubungi tim dukungan kami.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Receives payment notifications and updates booking status
export async function POST(request: NextRequest) {
  try {
    console.log('--- WEBHOOK REQUEST RECEIVED ---');
    console.log('Headers:', JSON.stringify(Object.fromEntries(request.headers.entries())));
    const body = await request.text();
    console.log('Body raw:', body);

    let notification: MidtransNotification;
    try {
      notification = JSON.parse(body);
    } catch (e) {
      console.error('Failed to parse webhook body:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log('Midtrans Webhook notification parsed:', {
      order_id: notification.order_id,
      transaction_status: notification.transaction_status,
      payment_type: notification.payment_type,
    });

    // Verify signature
    const isValidSignature = verifySignature(
      notification.order_id,
      notification.status_code,
      notification.gross_amount,
      process.env.MIDTRANS_SERVER_KEY!,
      notification.signature_key
    );

    if (!isValidSignature) {
      console.error('Invalid signature for order:', notification.order_id);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Initialize Supabase with Service Role (bypass RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Determine new booking status based on transaction status
    let newStatus: string | null = null;

    switch (notification.transaction_status) {
      case 'capture':
        // For credit card, check fraud status
        if (notification.payment_type === 'credit_card') {
          if (notification.fraud_status === 'accept') {
            newStatus = 'CONFIRMED';
          }
        }
        break;

      case 'settlement':
        newStatus = 'CONFIRMED';
        break;

      case 'pending':
        // Keep as PENDING_PAYMENT, no update needed
        console.log('Payment pending for order:', notification.order_id);
        break;

      case 'deny':
      case 'expire':
      case 'cancel':
        newStatus = 'CANCELLED';
        break;

      default:
        console.warn('Unhandled transaction status:', notification.transaction_status);
    }

    // Update booking status if needed
    if (newStatus) {
      const { data: booking, error: updateError } = await supabase
        .from('bookings')
        .update({
          status_booking: newStatus,
        })
        .eq('kode_booking', notification.order_id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update booking:', updateError);
        // Still return 200 to prevent Midtrans retry
        return NextResponse.json(
          {
            status: 'error',
            message: 'Database update failed',
          },
          { status: 200 }
        );
      }

      console.log(`Booking ${notification.order_id} updated to ${newStatus}`, {
        booking_id: booking?.id,
        previous_status: 'PENDING_PAYMENT',
        new_status: newStatus,
      });

      // Send confirmation email if payment is confirmed
      if (newStatus === 'CONFIRMED' && booking) {
        try {
          // Fetch user email from the database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('id', booking.user_id)
            .single();

          if (userError || !userData?.email) {
            console.error('Failed to fetch user email:', userError);
            // Don't throw - let the webhook continue successfully
          } else {
            // Send confirmation email via Resend
            const emailResult = await resend.emails.send({
              from: 'onboarding@resend.dev',
              to: userData.email,
              subject: 'Pembayaran Berhasil - Tiket Pendakian Gunung Prau',
              html: generateConfirmationEmail(booking.kode_booking, booking.id),
            });

            if (emailResult.error) {
              console.error('Failed to send confirmation email:', emailResult.error);
            } else {
              console.log('Confirmation email sent successfully:', {
                booking_id: booking.id,
                email: userData.email,
                email_id: emailResult.data?.id,
              });
            }
          }
        } catch (emailError: any) {
          // Catch any email-related errors to prevent webhook failure
          console.error('Email sending error (non-critical):', emailError);
          // Webhook continues successfully even if email fails
        }
      }
    }

    // Always return 200 OK to Midtrans
    return NextResponse.json(
      {
        status: 'success',
        message: 'Notification processed',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Webhook processing error:', error);

    // Return 200 even on error to prevent Midtrans retry loop
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Internal server error',
      },
      { status: 200 }
    );
  }
}

// Optional: Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      message: 'Midtrans webhook endpoint is active',
    },
    { status: 200 }
  );
}
