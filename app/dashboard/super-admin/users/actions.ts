'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createAdminBasecamp(formData: {
  email: string;
  full_name: string;
  password: string;
  nomor_hp: string;
}) {
  try {
    const supabase = await createClient();

    // Verify current user is super_admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized: Only super admins can create admin accounts' };
    }

    // Create user in Supabase Auth using admin client
    const { data: authUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: {
        role: 'admin_basecamp',
        full_name: formData.full_name,
      },
    });

    if (createAuthError) {
      console.error('Error creating auth user:', createAuthError);
      return { success: false, error: createAuthError.message };
    }

    if (!authUser.user) {
      return { success: false, error: 'Failed to create user in auth system' };
    }

    // Insert into public users table
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        email: formData.email,
        nama_lengkap: formData.full_name,
        nomor_hp: formData.nomor_hp,
        role: 'admin_basecamp',
      });

    if (insertError) {
      console.error('Error inserting into users table:', insertError);
      // Attempt to delete the auth user if public users insert fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return { success: false, error: `Failed to create user profile: ${insertError.message}` };
    }

    revalidatePath('/dashboard/super-admin/users');

    // TODO: Implement Resend/Nodemailer to send credentials to email
    // For now, return the password so Super Admin can manually send it
    return {
      success: true,
      credentials: {
        email: formData.email,
        password: formData.password,
      },
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
