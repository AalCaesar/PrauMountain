import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
const midtransClient = require('midtrans-client');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id } = body;

    if (!booking_id) {
      return NextResponse.json(
        { error: 'booking_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, kode_booking, total_biaya, status_booking, user_id')
      .eq('id', booking_id)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      console.error("🔴 DETAIL ERROR SUPABASE:", bookingError);
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status_booking !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: `Booking status is ${booking.status_booking}, payment not allowed` },
        { status: 400 }
      );
    }

    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_ENVIRONMENT === 'production',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: booking.kode_booking,
        gross_amount: Math.round(Number(booking.total_biaya)),
      },
      item_details: [
        {
          id: 'tiket_pendakian',
          price: Math.round(Number(booking.total_biaya)),
          quantity: 1,
          name: `Tiket Booking: ${booking.kode_booking}`.substring(0, 50),
        },
      ],
      customer_details: {
        first_name: 'Pendaki',
        email: user.email || 'email@contoh.com',
        phone: '080000000000',
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/pendaki/booking/${booking_id}?payment=success`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/pendaki/booking/${booking_id}?payment=error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/pendaki/booking/${booking_id}?payment=pending`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Midtrans transaction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment transaction' },
      { status: 500 }
    );
  }
}