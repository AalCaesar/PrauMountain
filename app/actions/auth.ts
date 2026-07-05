'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Type untuk response
type ActionResponse = {
  success: boolean;
  error?: string;
  message?: string;
};

/**
 * Server Action untuk Register
 * 1. Buat user di Supabase Auth
 * 2. Insert data tambahan ke tabel public.users
 */
export async function signUp(formData: {
  email: string;
  password: string;
  fullName: string;
  whatsapp: string;
}): Promise<ActionResponse> {
  const supabase = await createClient();

  // Validasi input
  if (!formData.email || !formData.password || !formData.fullName || !formData.whatsapp) {
    return {
      success: false,
      error: 'Semua field wajib diisi',
    };
  }

  if (formData.password.length < 8) {
    return {
      success: false,
      error: 'Password minimal 8 karakter',
    };
  }

  // Step 1: Buat user di Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });

  if (authError) {
    return {
      success: false,
      error: authError.message === 'User already registered'
        ? 'Email sudah terdaftar'
        : authError.message,
    };
  }

  if (!authData.user) {
    return {
      success: false,
      error: 'Gagal membuat akun',
    };
  }

  // Step 2: Insert data tambahan ke tabel public.users
  const { error: dbError } = await supabase.from('users').insert({
    id: authData?.user?.id,
    email: formData.email,
    nama_lengkap: formData.fullName,
    nomor_hp: formData.whatsapp,
    role: 'pendaki',
  });

  if (dbError) {
    console.error('Error inserting user to database:', dbError);
    return {
      success: false,
      error: 'Gagal menyimpan data pengguna. Silakan coba lagi.',
    };
  }

  revalidatePath('/', 'layout');

  return {
    success: true,
    message: 'Akun berhasil dibuat! Silakan login.',
  };
}

/**
 * Server Action untuk Login
 */
export async function signIn(formData: {
  email: string;
  password: string;
}): Promise<ActionResponse> {
  const supabase = await createClient();

  // Validasi input
  if (!formData.email || !formData.password) {
    return {
      success: false,
      error: 'Email dan password wajib diisi',
    };
  }

  // Sign in dengan Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return {
      success: false,
      error:
        error.message === 'Invalid login credentials'
          ? 'Email atau password salah'
          : error.message,
    };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

/**
 * Server Action untuk Logout
 */
export async function signOut(): Promise<ActionResponse> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}

/**
 * Helper function untuk get current user
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
