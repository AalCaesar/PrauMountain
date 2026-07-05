'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addBasecamp(formData: {
  nama_gunung: string;
  nama_basecamp: string;
  lokasi: string;
  status_buka: boolean;
}) {
  try {
    const supabase = await createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.user.id)
      .single();

    if (!userData || userData.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('basecamps')
      .insert({
        nama_gunung: formData.nama_gunung,
        nama_basecamp: formData.nama_basecamp,
        lokasi: formData.lokasi,
        status_buka: formData.status_buka,
      });

    if (error) {
      console.error('Error inserting basecamp:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/super-admin/basecamps');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateBasecamp(
  id: string,
  formData: {
    nama_gunung: string;
    nama_basecamp: string;
    lokasi: string;
  }
) {
  try {
    const supabase = await createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.user.id)
      .single();

    if (!userData || userData.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('basecamps')
      .update({
        nama_gunung: formData.nama_gunung,
        nama_basecamp: formData.nama_basecamp,
        lokasi: formData.lokasi,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating basecamp:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/super-admin/basecamps');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function toggleBasecampStatus(id: string, currentStatus: boolean) {
  try {
    const supabase = await createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.user.id)
      .single();

    if (!userData || userData.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('basecamps')
      .update({ status_buka: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error toggling basecamp status:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/super-admin/basecamps');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function assignAdminToBasecamp(basecampId: string, adminId: string) {
  try {
    const supabase = await createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.user.id)
      .single();

    if (!userData || userData.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('basecamps')
      .update({ admin_id: adminId })
      .eq('id', basecampId);

    if (error) {
      console.error('Error assigning admin:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/super-admin/basecamps');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
