'use server';

import { createClient } from '@/utils/supabase/server';

export interface BasecampPerformance {
  name: string;
  transaksi: number;
  pengunjung: number;
}

export interface SuperAdminStatsResponse {
  success: boolean;
  totalPendapatan?: number;
  basecampPerformance?: BasecampPerformance[];
  error?: string;
}

export async function getSuperAdminStats(): Promise<SuperAdminStatsResponse> {
  try {
    const supabase = await createClient();

    // 1. Total Pendapatan Keseluruhan
    const { data: revenueData, error: revenueError } = await supabase
      .from('bookings')
      .select('total_biaya')
      .in('status_booking', ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']);
    
    if (revenueError) {
      console.error('Error fetching revenue:', revenueError);
      return { success: false, error: 'Gagal mengambil data pendapatan' };
    }

    const totalPendapatan = revenueData?.reduce((acc, curr) => acc + (curr.total_biaya || 0), 0) || 0;

    // 2. Perbandingan Performa Basecamp
    const { data: basecamps, error: basecampError } = await supabase
      .from('basecamps')
      .select('id, nama_basecamp, nama_gunung');

    if (basecampError) {
      console.error('Error fetching basecamps:', basecampError);
      return { success: false, error: 'Gagal mengambil data basecamp' };
    }

    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, total_anggota, jalur_pendakian!inner(basecamp_id)')
      .in('status_booking', ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']);
    
    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return { success: false, error: 'Gagal mengambil data performa' };
    }

    const basecampPerformance: BasecampPerformance[] = basecamps.map(bc => {
      // Filter bookings that belong to this basecamp
      const bcBookings = bookingsData.filter((b: any) => b.jalur_pendakian?.basecamp_id === bc.id);
      
      const totalTransaksi = bcBookings.length;
      const totalPengunjung = bcBookings.reduce((acc, curr) => acc + (curr.total_anggota || 0), 0);

      return {
        name: `${bc.nama_basecamp} (${bc.nama_gunung})`,
        transaksi: totalTransaksi,
        pengunjung: totalPengunjung,
      };
    });

    // Optional: Sort by transactions
    basecampPerformance.sort((a, b) => b.transaksi - a.transaksi);

    return {
      success: true,
      totalPendapatan,
      basecampPerformance,
    };
  } catch (error) {
    console.error('Unexpected error in getSuperAdminStats:', error);
    return { success: false, error: 'Terjadi kesalahan sistem' };
  }
}
