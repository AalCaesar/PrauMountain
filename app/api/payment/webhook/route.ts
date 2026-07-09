import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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

/**
 * Verify Midtrans signature for security
 * Formula: SHA512(order_id + status_code + gross_amount + server_key)
 */
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

/**
 * Midtrans Webhook Handler
 * Receives payment notifications and updates booking status
 */
export async function POST(request: NextRequest) {
  try {
    const notification: MidtransNotification = await request.json();

    console.log('Midtrans Webhook received:', {
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
