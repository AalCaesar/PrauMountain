import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import midtransClient from 'midtrans-client';

// Initialize Snap
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { booking_id } = await request.json();

    if (!booking_id) {
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    // Initialize Supabase with Service Role (bypass RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('kode_booking, id')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check status in Midtrans
    const transactionStatus = await snap.transaction.status(booking.kode_booking);

    // Update if status is settlement or capture
    if (transactionStatus.transaction_status === 'settlement' || transactionStatus.transaction_status === 'capture') {
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status_booking: 'CONFIRMED' })
            .eq('id', booking_id);

        if (updateError) {
             return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
        }
        return NextResponse.json({ status: 'CONFIRMED' });
    }

    return NextResponse.json({ status: transactionStatus.transaction_status });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
