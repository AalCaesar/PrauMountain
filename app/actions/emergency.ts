'use server';

import { createClient } from '@/utils/supabase/server';

export interface OverdueHiker {
  id: string;
  kode_booking: string;
  tanggal_turun: string;
  nama_jalur: string;
  ketua_nama: string;
  kontak_darurat: string;
  telepon_ketua: string;
}

export async function getOverdueHikers(basecamp_id: string): Promise<OverdueHiker[]> {
  const supabase = await createClient();

  // Get current date string (YYYY-MM-DD) local time
  const today = new Date();
  today.setHours(today.getHours() + 7); // Adjust roughly to WIB for server consistency
  const todayStr = today.toISOString().split('T')[0];

  // 1. Fetch bookings that are checked in and overdue
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      kode_booking,
      tanggal_turun,
      ketua_id,
      jalur_pendakian!inner(nama_jalur, basecamp_id),
      anggota_rombongan(nama_anggota, kontak_darurat, nik),
      users(nama_lengkap, nomor_telepon)
    `)
    .eq('status_booking', 'CHECKED_IN')
    .eq('jalur_pendakian.basecamp_id', basecamp_id)
    .lt('tanggal_turun', todayStr); // Less than today means they were supposed to return yesterday or earlier

  if (error) {
    console.error('Error fetching overdue hikers:', error);
    return [];
  }

  if (!bookings || bookings.length === 0) {
    return [];
  }

  const overdueHikers: OverdueHiker[] = bookings.map((booking: any) => {
    // We try to get Ketua from users or anggota_rombongan.
    // First person in anggota_rombongan is usually Ketua.
    const ketuaFromAnggota = booking.anggota_rombongan?.[0];

    let ketua_nama = booking.users?.nama_lengkap || ketuaFromAnggota?.nama_anggota || 'Tidak Diketahui';
    let telepon_ketua = booking.users?.nomor_telepon || 'Tidak Diketahui';
    let kontak_darurat = ketuaFromAnggota?.kontak_darurat || 'Tidak Diketahui';

    return {
      id: booking.id,
      kode_booking: booking.kode_booking,
      tanggal_turun: booking.tanggal_turun,
      nama_jalur: booking.jalur_pendakian?.nama_jalur || 'Tidak Diketahui',
      ketua_nama,
      kontak_darurat,
      telepon_ketua,
    };
  });

  return overdueHikers;
}
