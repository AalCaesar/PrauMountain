'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getJalur() {
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

    const { data: jalur, error } = await supabase
      .from('jalur_pendakian')
      .select('*')
      .eq('basecamp_id', basecamp.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jalur:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: jalur || [] };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred', data: [] };
  }
}

export async function createJalur(basecampId: string, formData: {
  nama_jalur: string;
  deskripsi: string;
  tingkat_kesulitan: 'mudah' | 'sedang' | 'sulit' | 'ekstrem';
  estimasi_waktu?: string;
  harga_per_orang: number;
  kuota_per_hari: number;
}) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify the basecamp belongs to this admin
    const { data: basecamp } = await supabase
      .from('basecamps')
      .select('admin_id')
      .eq('id', basecampId)
      .single();

    if (!basecamp || basecamp.admin_id !== user.id) {
      return { success: false, error: 'Unauthorized: Not your basecamp' };
    }

    const insertData: Record<string, any> = {
      basecamp_id: basecampId,
      nama_jalur: formData.nama_jalur,
      deskripsi: formData.deskripsi,
      tingkat_kesulitan: formData.tingkat_kesulitan,
      harga_per_orang: formData.harga_per_orang,
      kuota_per_hari: formData.kuota_per_hari,
      is_active: true,
    };

    if (formData.estimasi_waktu) {
      insertData.estimasi_waktu = formData.estimasi_waktu;
    }

    const { error } = await supabase
      .from('jalur_pendakian')
      .insert(insertData);

    if (error) {
      console.error('Error creating jalur:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin-basecamp/jalur');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function updateJalur(jalurId: string, formData: {
  nama_jalur: string;
  deskripsi: string;
  tingkat_kesulitan: 'mudah' | 'sedang' | 'sulit' | 'ekstrem';
  estimasi_waktu?: string;
  harga_per_orang: number;
  kuota_per_hari: number;
}) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify the jalur belongs to this admin's basecamp
    const { data: jalur } = await supabase
      .from('jalur_pendakian')
      .select('basecamp_id, basecamps!inner(admin_id)')
      .eq('id', jalurId)
      .single();

    if (!jalur || (jalur as any).basecamps.admin_id !== user.id) {
      return { success: false, error: 'Unauthorized: Not your trail' };
    }

    const updateData: Record<string, any> = {
      nama_jalur: formData.nama_jalur,
      deskripsi: formData.deskripsi,
      tingkat_kesulitan: formData.tingkat_kesulitan,
      harga_per_orang: formData.harga_per_orang,
      kuota_per_hari: formData.kuota_per_hari,
    };

    if (formData.estimasi_waktu !== undefined) {
      updateData.estimasi_waktu = formData.estimasi_waktu;
    }

    const { error } = await supabase
      .from('jalur_pendakian')
      .update(updateData)
      .eq('id', jalurId);

    if (error) {
      console.error('Error updating jalur:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin-basecamp/jalur');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function toggleJalurStatus(jalurId: string, currentStatus: boolean) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify the jalur belongs to this admin's basecamp
    const { data: jalur } = await supabase
      .from('jalur_pendakian')
      .select('basecamp_id, basecamps!inner(admin_id)')
      .eq('id', jalurId)
      .single();

    if (!jalur || (jalur as any).basecamps.admin_id !== user.id) {
      return { success: false, error: 'Unauthorized: Not your trail' };
    }

    const { error } = await supabase
      .from('jalur_pendakian')
      .update({ is_active: !currentStatus })
      .eq('id', jalurId);

    if (error) {
      console.error('Error toggling jalur status:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/admin-basecamp/jalur');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
