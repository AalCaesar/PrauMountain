import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. Validasi Keamanan: Vercel Cron Secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Inisialisasi Supabase menggunakan Service Role Key agar bebas dari kendala RLS
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

    // 3. Logika Database: Cari PENDING_PAYMENT yang berumur > 24 jam
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const { data: expiredBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id')
      .eq('status_booking', 'PENDING_PAYMENT')
      .lt('created_at', twentyFourHoursAgo);

    if (fetchError) {
      console.error('Error fetching expired bookings:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    if (!expiredBookings || expiredBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending bookings found that exceed the 24-hour limit.',
        expired_count: 0
      });
    }

    // 4. Update status_booking dan expired_at
    const bookingIds = expiredBookings.map(b => b.id);
    
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status_booking: 'EXPIRED',
        expired_at: now,
        updated_at: now
      })
      .in('id', bookingIds);

    if (updateError) {
      console.error('Error updating expired bookings:', updateError);
      return NextResponse.json({ error: 'Failed to update bookings' }, { status: 500 });
    }

    // 5. Berikan respons sukses
    console.log(`[CRON] Auto-expired ${bookingIds.length} bookings.`);
    return NextResponse.json({
      success: true,
      message: 'Successfully auto-expired bookings',
      expired_count: bookingIds.length,
      expired_ids: bookingIds
    });

  } catch (error: any) {
    console.error('[CRON] Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
