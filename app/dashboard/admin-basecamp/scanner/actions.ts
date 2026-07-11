'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getBookingByCode(kode_booking: string) {
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
      return { success: false, error: 'No basecamp assigned to your account', data: null };
    }

    // Fetch booking with joined data including anggota_rombongan and logistik_bawaan
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        jalur_pendakian:jalur_id (
          nama_jalur,
          basecamp_id
        ),
        users:user_id (
          nama_lengkap,
          email
        ),
        anggota_rombongan (
          id,
          nama_anggota
        ),
        logistik_bawaan (
          id,
          nama_barang,
          status_pengecekan
        )
      `)
      .eq('kode_booking', kode_booking)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return { success: false, error: 'Booking not found', data: null };
    }

    // Verify the booking's trail belongs to this admin's basecamp
    if ((booking as any).jalur_pendakian?.basecamp_id !== basecamp.id) {
      return {
        success: false,
        error: 'This booking is not for your basecamp',
        data: null
      };
    }

    return { success: true, data: booking };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred', data: null };
  }
}

export async function processCheckIn(
  bookingId: string,
  verifiedMemberIds: string[],
  verifiedLogisticsIds: string[]
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get admin's basecamp
    const { data: basecamp } = await supabase
      .from('basecamps')
      .select('id')
      .eq('admin_id', user.id)
      .single();

    if (!basecamp) {
      return { success: false, error: 'No basecamp assigned to your account' };
    }

    // Verify the booking belongs to this admin's basecamp and fetch details
    const { data: booking } = await supabase
      .from('bookings')
      .select(`
        id,
        status_booking,
        jalur_pendakian:jalur_id!inner (
          basecamp_id
        ),
        anggota_rombongan (id),
        logistik_bawaan (id)
      `)
      .eq('id', bookingId)
      .single();

    if (!booking || (booking as any).jalur_pendakian.basecamp_id !== basecamp.id) {
      return { success: false, error: 'Unauthorized: Not your booking' };
    }

    // Check if booking is in CONFIRMED status
    if ((booking as any).status_booking !== 'CONFIRMED') {
      return {
        success: false,
        error: `Cannot check-in. Current status: ${(booking as any).status_booking}. Booking must be CONFIRMED first.`
      };
    }

    // Validate that all members are verified
    const allMemberIds = ((booking as any).anggota_rombongan || []).map((m: any) => m.id);
    const missingMembers = allMemberIds.filter((id: string) => !verifiedMemberIds.includes(id));
    if (missingMembers.length > 0) {
      return {
        success: false,
        error: `Semua anggota rombongan harus diverifikasi. ${missingMembers.length} anggota belum dicentang.`
      };
    }

    // Validate that all logistics are verified
    const allLogisticsIds = ((booking as any).logistik_bawaan || []).map((l: any) => l.id);
    const missingLogistics = allLogisticsIds.filter((id: string) => !verifiedLogisticsIds.includes(id));
    if (missingLogistics.length > 0) {
      return {
        success: false,
        error: `Semua logistik bawaan harus diverifikasi. ${missingLogistics.length} item belum dicentang.`
      };
    }

    // Step 1: Update logistik_bawaan status_pengecekan to true
    if (verifiedLogisticsIds.length > 0) {
      const { error: logisticsError } = await supabase
        .from('logistik_bawaan')
        .update({ status_pengecekan: true })
        .in('id', verifiedLogisticsIds)
        .eq('booking_id', bookingId);

      if (logisticsError) {
        console.error('Error updating logistics:', logisticsError);
        return { success: false, error: `Gagal update logistik: ${logisticsError.message}` };
      }
    }

    // Step 2: Update booking status to CHECKED_IN
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        status_booking: 'CHECKED_IN',
        checked_in_at: new Date().toISOString(),
        checked_in_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (bookingError) {
      console.error('Error processing check-in:', bookingError);
      return { success: false, error: `Gagal update status booking: ${bookingError.message}` };
    }

    revalidatePath('/dashboard/admin-basecamp/scanner');
    revalidatePath('/dashboard/admin-basecamp/bookings');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function processCheckOut(
  bookingId: string,
  beratSampah: number,
  jenisSampah: string,
  verifiedLogisticsIds: string[]
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get admin's basecamp
    const { data: basecamp } = await supabase
      .from('basecamps')
      .select('id')
      .eq('admin_id', user.id)
      .single();

    if (!basecamp) {
      return { success: false, error: 'No basecamp assigned to your account' };
    }

    // Verify the booking belongs to this admin's basecamp
    const { data: booking } = await supabase
      .from('bookings')
      .select('jalur_id, status_booking, jalur_pendakian!inner(basecamp_id)')
      .eq('id', bookingId)
      .single();

    if (!booking || (booking as any).jalur_pendakian.basecamp_id !== basecamp.id) {
      return { success: false, error: 'Unauthorized: Not your booking' };
    }

    // Check if booking is in CHECKED_IN status
    if ((booking as any).status_booking !== 'CHECKED_IN') {
      return {
        success: false,
        error: `Cannot check-out. Current status: ${(booking as any).status_booking}. Booking must be CHECKED_IN first.`
      };
    }

    // Validate inputs
    if (beratSampah < 0) {
      return { success: false, error: 'Berat sampah tidak boleh negatif.' };
    }
    if (!jenisSampah.trim()) {
      return { success: false, error: 'Jenis sampah harus diisi.' };
    }

    // Step 1: Insert laporan_sampah
    const { error: sampahError } = await supabase
      .from('laporan_sampah')
      .insert({
        booking_id: bookingId,
        berat_sampah: beratSampah,
        jenis_sampah: jenisSampah.trim(),
      });

    if (sampahError) {
      console.error('Error inserting laporan_sampah:', sampahError);
      return { success: false, error: `Gagal menyimpan laporan sampah: ${sampahError.message}` };
    }

    // Step 2: Update logistik_bawaan status_pengecekan
    if (verifiedLogisticsIds.length > 0) {
      const { error: logisticsError } = await supabase
        .from('logistik_bawaan')
        .update({ status_pengecekan: true })
        .in('id', verifiedLogisticsIds)
        .eq('booking_id', bookingId);

      if (logisticsError) {
        console.error('Error updating logistics:', logisticsError);
        return { success: false, error: `Gagal update logistik: ${logisticsError.message}` };
      }
    }

    // Step 3: Update booking status to CHECKED_OUT
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        status_booking: 'CHECKED_OUT',
        checked_out_at: new Date().toISOString(),
        checked_out_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (bookingError) {
      console.error('Error processing check-out:', bookingError);
      return { success: false, error: `Gagal update status booking: ${bookingError.message}` };
    }

    revalidatePath('/dashboard/admin-basecamp/scanner');
    revalidatePath('/dashboard/admin-basecamp/bookings');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
