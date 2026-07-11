'use server';

import { createClient } from '@/utils/supabase/server';

export async function getDashboardStats() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    // Get admin's basecamp
    const { data: basecamp } = await supabase
      .from('basecamps')
      .select('id')
      .eq('admin_id', user.id)
      .single();

    if (!basecamp) {
      return { success: true, data: null };
    }

    // Fetch all relevant bookings for this basecamp
    // We fetch all to do the 6-month aggregation and this month's calculation
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        created_at,
        total_biaya,
        total_anggota,
        status_booking,
        jalur_pendakian!inner(basecamp_id)
      `)
      .eq('jalur_pendakian.basecamp_id', basecamp.id);

    if (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: error.message, data: null };
    }

    // Processing data
    const validStatuses = ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalPendapatanBulanIni = 0;
    let totalPendakiBulanIni = 0;
    let totalPendingPayment = 0;

    // Map for 6-month chart data
    const last6Months: { name: string; pendapatan: number; pendaki: number; year: number; monthIndex: number }[] = [];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      last6Months.push({
        name: d.toLocaleString('id-ID', { month: 'short' }),
        pendapatan: 0,
        pendaki: 0,
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }

    bookings?.forEach((booking: any) => {
      const createdAt = new Date(booking.created_at);
      const bMonth = createdAt.getMonth();
      const bYear = createdAt.getFullYear();
      
      const isThisMonth = bMonth === currentMonth && bYear === currentYear;
      const isValid = validStatuses.includes(booking.status_booking);

      // Current Month Stats
      if (isThisMonth) {
        if (isValid) {
          totalPendapatanBulanIni += booking.total_biaya || 0;
          totalPendakiBulanIni += booking.total_anggota || 0;
        }
        if (booking.status_booking === 'PENDING_PAYMENT') {
          totalPendingPayment++;
        }
      }

      // 6-Month Aggregation
      if (isValid) {
        const targetMonth = last6Months.find(m => m.year === bYear && m.monthIndex === bMonth);
        if (targetMonth) {
          targetMonth.pendapatan += booking.total_biaya || 0;
          targetMonth.pendaki += booking.total_anggota || 0;
        }
      }
    });

    return {
      success: true,
      data: {
        totalPendapatanBulanIni,
        totalPendakiBulanIni,
        totalPendingPayment,
        chartData: last6Months.map(({ name, pendapatan, pendaki }) => ({ name, pendapatan, pendaki })),
      }
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred', data: null };
  }
}
