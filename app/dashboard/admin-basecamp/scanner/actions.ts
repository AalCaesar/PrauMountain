'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getBookingById(bookingId: string) {
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

    // Fetch booking with joined data
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
        )
      `)
      .eq('id', bookingId)
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

export async function processCheckIn(bookingId: string) {
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
      .select('jalur_id, status, jalur_pendakian!inner(basecamp_id)')
      .eq('id', bookingId)
      .single();

    if (!booking || (booking as any).jalur_pendakian.basecamp_id !== basecamp.id) {
      return { success: false, error: 'Unauthorized: Not your booking' };
    }

    // Check if booking is in CONFIRMED status
    if ((booking as any).status !== 'CONFIRMED') {
      return {
        success: false,
        error: `Cannot check-in. Current status: ${(booking as any).status}. Booking must be CONFIRMED first.`
      };
    }

    // Update to CHECKED_IN status
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'CHECKED_IN',
        checked_in_at: new Date().toISOString(),
        checked_in_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error processing check-in:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin-basecamp/scanner');
    revalidatePath('/dashboard/admin-basecamp/bookings');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function processCheckOut(bookingId: string) {
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
      .select('jalur_id, status, jalur_pendakian!inner(basecamp_id)')
      .eq('id', bookingId)
      .single();

    if (!booking || (booking as any).jalur_pendakian.basecamp_id !== basecamp.id) {
      return { success: false, error: 'Unauthorized: Not your booking' };
    }

    // Check if booking is in CHECKED_IN status
    if ((booking as any).status !== 'CHECKED_IN') {
      return {
        success: false,
        error: `Cannot check-out. Current status: ${(booking as any).status}. Booking must be CHECKED_IN first.`
      };
    }

    // Update to CHECKED_OUT status
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'CHECKED_OUT',
        checked_out_at: new Date().toISOString(),
        checked_out_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error processing check-out:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin-basecamp/scanner');
    revalidatePath('/dashboard/admin-basecamp/bookings');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
