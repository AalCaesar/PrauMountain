'use server';

import { createClient } from '@/utils/supabase/server';

export async function checkSisaKuota(jalur_id: string, tanggal_naik: string) {
  const supabase = await createClient();

  // 1. Get kuota_per_hari
  const { data: jalur, error: errorJalur } = await supabase
    .from('jalur_pendakian')
    .select('kuota_per_hari')
    .eq('id', jalur_id)
    .single();

  if (errorJalur || !jalur) {
    console.error('Error fetching kuota:', errorJalur);
    return { sisaKuota: 0, isFull: true };
  }

  // 2. Get total pendaki untuk tanggal tersebut
  const { data: bookings, error: errorBookings } = await supabase
    .from('bookings')
    .select('total_anggota')
    .eq('jalur_id', jalur_id)
    .eq('tanggal_naik', tanggal_naik)
    .in('status_booking', ['CONFIRMED', 'CHECKED_IN', 'PENDING_PAYMENT']);

  if (errorBookings) {
    console.error('Error fetching bookings for quota:', errorBookings);
    return { sisaKuota: 0, isFull: true };
  }

  const totalTerdaftar = bookings.reduce((sum, booking) => sum + (booking.total_anggota || 0), 0);
  const sisaKuota = Math.max(0, jalur.kuota_per_hari - totalTerdaftar);

  return { 
    sisaKuota, 
    isFull: sisaKuota <= 0 
  };
}

export async function getAdminQuotaStats(basecamp_id: string) {
  const supabase = await createClient();

  // 1. Ambil semua jalur aktif di basecamp ini
  const { data: jalurs, error: errorJalur } = await supabase
    .from('jalur_pendakian')
    .select('id, nama_jalur, kuota_per_hari')
    .eq('basecamp_id', basecamp_id)
    .eq('is_active', true);

  if (errorJalur || !jalurs || jalurs.length === 0) {
    return { next7Days: [], stats: [] };
  }

  // Buat array 7 hari ke depan
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    // Gunakan local timezone agar date-nya match dengan input booking
    d.setHours(d.getHours() + 7); // Adjust for WIB approximately if needed, but let's just use local time
    // More robust way: Use JS local date
    const localD = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    // Format YYYY-MM-DD safely
    const year = localD.getFullYear();
    const month = String(localD.getMonth() + 1).padStart(2, '0');
    const day = String(localD.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // 2. Ambil booking 7 hari ke depan untuk semua jalur di basecamp ini
  const jalurIds = jalurs.map(j => j.id);
  const { data: bookings, error: errorBookings } = await supabase
    .from('bookings')
    .select('jalur_id, tanggal_naik, total_anggota')
    .in('jalur_id', jalurIds)
    .in('tanggal_naik', next7Days)
    .in('status_booking', ['CONFIRMED', 'CHECKED_IN', 'PENDING_PAYMENT']);

  const stats = jalurs.map(jalur => {
    const dailyStats = next7Days.map(date => {
      // Filter bookings for this trail and date
      const dayBookings = bookings?.filter(b => b.jalur_id === jalur.id && b.tanggal_naik === date) || [];
      const totalTerdaftar = dayBookings.reduce((sum, b) => sum + (b.total_anggota || 0), 0);
      const sisaKuota = Math.max(0, jalur.kuota_per_hari - totalTerdaftar);
      const capacityPercentage = jalur.kuota_per_hari > 0 ? (totalTerdaftar / jalur.kuota_per_hari) * 100 : 100;
      
      let status: 'safe' | 'warning' | 'full' = 'safe';
      if (sisaKuota === 0) status = 'full';
      else if (capacityPercentage >= 70) status = 'warning'; // <= 30% available

      return {
        date,
        totalTerdaftar,
        sisaKuota,
        kuota_per_hari: jalur.kuota_per_hari,
        status,
      };
    });

    return {
      jalurId: jalur.id,
      namaJalur: jalur.nama_jalur,
      dailyStats,
    };
  });

  return { next7Days, stats };
}
