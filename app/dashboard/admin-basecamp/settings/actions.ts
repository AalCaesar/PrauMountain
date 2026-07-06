'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getMyBasecamp() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated', data: null };
    }

    const { data: basecamp, error } = await supabase
      .from('basecamps')
      .select('*')
      .eq('admin_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, data: null };
      }
      console.error('Error fetching basecamp:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data: basecamp };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred', data: null };
  }
}

export async function updateBasecampInfo(basecampId: string, formData: {
  nama_basecamp: string;
  nama_gunung: string;
  lokasi: string;
  kontak_telepon?: string;
  kontak_email?: string;
}) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: basecamp } = await supabase
      .from('basecamps')
      .select('admin_id')
      .eq('id', basecampId)
      .single();

    if (!basecamp || basecamp.admin_id !== user.id) {
      return { success: false, error: 'Unauthorized: Not your basecamp' };
    }

    const updateData: Record<string, any> = {
      nama_basecamp: formData.nama_basecamp,
      nama_gunung: formData.nama_gunung,
      lokasi: formData.lokasi,
    };

    if (formData.kontak_telepon !== undefined) {
      updateData.kontak_telepon = formData.kontak_telepon;
    }
    if (formData.kontak_email !== undefined) {
      updateData.kontak_email = formData.kontak_email;
    }

    const { error } = await supabase
      .from('basecamps')
      .update(updateData)
      .eq('id', basecampId);

    if (error) {
      console.error('Error updating basecamp info:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin-basecamp/settings');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateFasilitas(basecampId: string, fasilitas: string[]) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: basecamp } = await supabase
      .from('basecamps')
      .select('admin_id')
      .eq('id', basecampId)
      .single();

    if (!basecamp || basecamp.admin_id !== user.id) {
      return { success: false, error: 'Unauthorized: Not your basecamp' };
    }

    const { error } = await supabase
      .from('basecamps')
      .update({ fasilitas })
      .eq('id', basecampId);

    if (error) {
      console.error('Error updating fasilitas:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin-basecamp/settings');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function uploadBasecampPhoto(basecampId: string, file: File) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated', url: null };
    }

    const { data: basecamp } = await supabase
      .from('basecamps')
      .select('admin_id')
      .eq('id', basecampId)
      .single();

    if (!basecamp || basecamp.admin_id !== user.id) {
      return { success: false, error: 'Unauthorized: Not your basecamp', url: null };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${basecampId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('basecamp-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return { success: false, error: uploadError.message, url: null };
    }

    const { data: publicUrlData } = supabase.storage
      .from('basecamp-images')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from('basecamps')
      .update({ foto: publicUrl })
      .eq('id', basecampId);

    if (updateError) {
      console.error('Error updating foto column:', updateError);
      return { success: false, error: updateError.message, url: null };
    }

    revalidatePath('/dashboard/admin-basecamp/settings');
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred', url: null };
  }
}
