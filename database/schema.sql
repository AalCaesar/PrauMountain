-- ==========================================
-- SKEMA DATABASE: PRAU MOUNTAIN (SUPABASE)
-- Backup & Dokumentasi Struktur Tabel
-- ==========================================

-- 1. Tabel USERS
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nama_lengkap TEXT,
  nomor_hp TEXT,
  role TEXT NOT NULL DEFAULT 'pendaki' CHECK (role IN ('super_admin', 'admin_basecamp', 'pendaki')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel BASECAMPS
CREATE TABLE public.basecamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_gunung TEXT NOT NULL,
  nama_basecamp TEXT NOT NULL,
  lokasi TEXT,
  status_buka BOOLEAN DEFAULT true,
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  fasilitas JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel JALUR_PENDAKIAN
CREATE TABLE public.jalur_pendakian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  basecamp_id UUID NOT NULL REFERENCES public.basecamps(id) ON DELETE CASCADE,
  nama_jalur TEXT NOT NULL,
  deskripsi TEXT,
  kuota_per_hari INTEGER NOT NULL DEFAULT 0,
  harga_per_orang NUMERIC NOT NULL DEFAULT 0,
  tingkat_kesulitan TEXT CHECK (tingkat_kesulitan IN ('mudah', 'sedang', 'sulit', 'ekstrem')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel BOOKINGS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_booking TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ketua_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  jalur_id UUID NOT NULL REFERENCES public.jalur_pendakian(id) ON DELETE RESTRICT,
  tanggal_naik DATE NOT NULL,
  tanggal_turun DATE NOT NULL,
  total_anggota INTEGER NOT NULL,
  total_biaya NUMERIC NOT NULL,
  status_booking TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' 
    CHECK (status_booking IN ('DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'EXPIRED')),
  midtrans_transaction_id TEXT,
  midtrans_snap_token TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by UUID REFERENCES public.users(id),
  checked_out_at TIMESTAMP WITH TIME ZONE,
  checked_out_by UUID REFERENCES public.users(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel ANGGOTA_ROMBONGAN
CREATE TABLE public.anggota_rombongan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  nama_anggota TEXT NOT NULL,
  nik TEXT NOT NULL,
  kontak_darurat TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabel LOGISTIK_BAWAAN
CREATE TABLE public.logistik_bawaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  nama_barang TEXT NOT NULL,
  jumlah_dibawa INTEGER NOT NULL DEFAULT 1,
  status_pengecekan BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabel LAPORAN_SAMPAH
CREATE TABLE public.laporan_sampah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  berat_sampah NUMERIC NOT NULL,
  jenis_sampah TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabel AUDIT_LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  basecamp_id UUID REFERENCES public.basecamps(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
