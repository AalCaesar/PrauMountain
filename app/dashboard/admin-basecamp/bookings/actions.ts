'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { insertAuditLog } from '@/app/actions/audit';

export async function getBookings() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated', data: [] };
    }

    // Get admin's basecamp
    const { data: basecamp } = await supabase
      .from('basecamps')
      .select('id')
      .eq('admin_id', user.id)
      .single();

    if (!basecamp) {
      return { success: true, data: [] };
    }

    // Fetch bookings with joined data
    // Join with jalur_pendakian to get trail info and filter by basecamp
    // Join with users to get hiker info
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        jalur_pendakian:jalur_id (
          nama_jalur,
          basecamp_id
        ),
        users:user_id (
          nama_lengkap,
          email,
          nomor_hp
        ),
        anggota_rombongan (*),
        logistik_bawaan (*)
      `)
      .eq('jalur_pendakian.basecamp_id', basecamp.id)
      .not('status_booking', 'in', '("CANCELLED","EXPIRED")')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: bookings || [] };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred', data: [] };
  }
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'EXPIRED'
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify the booking belongs to this admin's basecamp
    const { data: booking } = await supabase
      .from('bookings')
      .select('jalur_id, status_booking, jalur_pendakian!inner(basecamp_id, basecamps!inner(admin_id))')
      .eq('id', bookingId)
      .single();

    if (!booking || (booking as any).jalur_pendakian.basecamps.admin_id !== user.id) {
      return { success: false, error: 'Unauthorized: Not your booking' };
    }

    // specific validation for CANCELLED should be handled by cancelBooking, but kept here for safety if called directly
    if (newStatus === 'CANCELLED') {
      if (!['PENDING_PAYMENT', 'CONFIRMED'].includes((booking as any).status_booking)) {
        return { success: false, error: 'Aksi tidak diizinkan untuk status booking ini' };
      }
    }

    // Update the booking status
    const updateData: any = {
      status_booking: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Add timestamp for specific status changes
    if (newStatus === 'CONFIRMED') {
      // Payment confirmed
      if (!(booking as any).paid_at) {
        updateData.paid_at = new Date().toISOString();
      }
    } else if (newStatus === 'CANCELLED') {
      updateData.cancelled_at = new Date().toISOString();
      updateData.cancelled_by = user.id;
    } else if (newStatus === 'CHECKED_IN') {
      updateData.checked_in_at = new Date().toISOString();
      updateData.checked_in_by = user.id;
    } else if (newStatus === 'CHECKED_OUT') {
      updateData.checked_out_at = new Date().toISOString();
      updateData.checked_out_by = user.id;
    }

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking status:', error);
      if (error.code === '23514') { // Check constraint violation
        return { success: false, error: 'Aksi tidak diizinkan untuk status booking ini' };
      }
      return { success: false, error: error.message };
    }

    // Insert Audit Log
    await insertAuditLog({
      user_id: user.id,
      action: `UPDATE_STATUS_${newStatus}`,
      entity_type: 'bookings',
      entity_id: bookingId,
      basecamp_id: (booking as any).jalur_pendakian.basecamp_id
    });

    revalidatePath('/dashboard/admin-basecamp/bookings');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify the booking belongs to this admin's basecamp and get current status
    const { data: booking } = await supabase
      .from('bookings')
      .select('status_booking, jalur_pendakian!inner(basecamp_id, basecamps!inner(admin_id))')
      .eq('id', bookingId)
      .single();

    if (!booking || (booking as any).jalur_pendakian.basecamps.admin_id !== user.id) {
      return { success: false, error: 'Unauthorized: Not your booking' };
    }

    // specific validation for CANCELLED
    if (!['PENDING_PAYMENT', 'CONFIRMED'].includes((booking as any).status_booking)) {
      return { success: false, error: 'Aksi tidak diizinkan untuk status booking ini' };
    }

    // Update the booking status
    const updateData = {
      status_booking: 'CANCELLED',
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId);

    if (error) {
      console.error('Error cancelling booking:', error);
      if (error.code === '23514') { // Check constraint violation
        return { success: false, error: 'Aksi tidak diizinkan untuk status booking ini' };
      }
      return { success: false, error: error.message };
    }

    // Insert Audit Log
    await insertAuditLog({
      user_id: user.id,
      action: 'CANCEL_BOOKING',
      entity_type: 'bookings',
      entity_id: bookingId,
      basecamp_id: (booking as any).jalur_pendakian.basecamp_id
    });

    revalidatePath('/dashboard/admin-basecamp/bookings');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
