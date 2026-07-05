-- =====================================================
-- RLS POLICIES untuk Sistem Booking Pendakian Gunung Prau
-- =====================================================

-- =====================================================
-- 1. HELPER FUNCTIONS
-- =====================================================

-- Fungsi untuk mendapatkan role user yang sedang login
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Fungsi untuk mendapatkan basecamp_id untuk Admin Basecamp
-- Disesuaikan dengan ERD: mengambil dari tabel basecamps berdasarkan admin_id
CREATE OR REPLACE FUNCTION get_user_basecamp_id()
RETURNS UUID AS $$
  SELECT id FROM public.basecamps WHERE admin_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Fungsi helper untuk cek apakah user adalah Super Admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Fungsi helper untuk cek apakah user adalah Admin Basecamp
CREATE OR REPLACE FUNCTION is_admin_basecamp()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin_basecamp'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- 2. ENABLE RLS pada semua tabel
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basecamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jalur_pendakian ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggota_rombongan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistik_bawaan ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. POLICIES untuk tabel USERS
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "Super Admin: Full access to users"
ON public.users FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Admin Basecamp: Bisa lihat semua user di basecamp mereka + profil sendiri
CREATE POLICY "Admin Basecamp: View users in their basecamp"
ON public.users FOR SELECT
TO authenticated
USING (
  is_admin_basecamp() AND (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.basecamps 
      WHERE basecamps.admin_id = auth.uid()
    )
  )
);

-- Pendaki: Hanya bisa lihat dan update profil sendiri
CREATE POLICY "Pendaki: View own profile"
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Pendaki: Update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- =====================================================
-- 4. POLICIES untuk tabel BASECAMPS
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "Super Admin: Full access to basecamps"
ON public.basecamps FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Admin Basecamp: Hanya bisa SELECT dan UPDATE basecamp mereka (berdasarkan admin_id)
CREATE POLICY "Admin Basecamp: View own basecamp"
ON public.basecamps FOR SELECT
TO authenticated
USING (
  is_admin_basecamp() AND
  admin_id = auth.uid()
);

CREATE POLICY "Admin Basecamp: Update own basecamp"
ON public.basecamps FOR UPDATE
TO authenticated
USING (
  is_admin_basecamp() AND
  admin_id = auth.uid()
)
WITH CHECK (
  is_admin_basecamp() AND
  admin_id = auth.uid()
);

-- Pendaki: Bisa melihat semua basecamp yang aktif
CREATE POLICY "Pendaki: View active basecamps"
ON public.basecamps FOR SELECT
TO authenticated
USING (
  get_user_role() = 'pendaki' AND
  status_buka = true
);

-- =====================================================
-- 5. POLICIES untuk tabel JALUR_PENDAKIAN
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "Super Admin: Full access to jalur_pendakian"
ON public.jalur_pendakian FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Admin Basecamp: CRUD jalur di basecamp mereka
CREATE POLICY "Admin Basecamp: View own jalur"
ON public.jalur_pendakian FOR SELECT
TO authenticated
USING (
  is_admin_basecamp() AND
  basecamp_id = get_user_basecamp_id()
);

CREATE POLICY "Admin Basecamp: Insert jalur"
ON public.jalur_pendakian FOR INSERT
TO authenticated
WITH CHECK (
  is_admin_basecamp() AND
  basecamp_id = get_user_basecamp_id()
);

CREATE POLICY "Admin Basecamp: Update own jalur"
ON public.jalur_pendakian FOR UPDATE
TO authenticated
USING (
  is_admin_basecamp() AND
  basecamp_id = get_user_basecamp_id()
)
WITH CHECK (
  is_admin_basecamp() AND
  basecamp_id = get_user_basecamp_id()
);

CREATE POLICY "Admin Basecamp: Delete own jalur"
ON public.jalur_pendakian FOR DELETE
TO authenticated
USING (
  is_admin_basecamp() AND
  basecamp_id = get_user_basecamp_id()
);

-- Pendaki: Bisa melihat semua jalur yang aktif
CREATE POLICY "Pendaki: View active jalur"
ON public.jalur_pendakian FOR SELECT
TO authenticated
USING (
  get_user_role() = 'pendaki'
);

-- =====================================================
-- 6. POLICIES untuk tabel BOOKINGS
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "Super Admin: Full access to bookings"
ON public.bookings FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Admin Basecamp: Lihat dan update booking di basecamp mereka
CREATE POLICY "Admin Basecamp: View bookings in their basecamp"
ON public.bookings FOR SELECT
TO authenticated
USING (
  is_admin_basecamp() AND
  EXISTS (
    SELECT 1 FROM public.jalur_pendakian
    WHERE jalur_pendakian.id = bookings.jalur_id
    AND jalur_pendakian.basecamp_id = get_user_basecamp_id()
  )
);

CREATE POLICY "Admin Basecamp: Update bookings in their basecamp"
ON public.bookings FOR UPDATE
TO authenticated
USING (
  is_admin_basecamp() AND
  EXISTS (
    SELECT 1 FROM public.jalur_pendakian
    WHERE jalur_pendakian.id = bookings.jalur_id
    AND jalur_pendakian.basecamp_id = get_user_basecamp_id()
  )
)
WITH CHECK (
  is_admin_basecamp() AND
  EXISTS (
    SELECT 1 FROM public.jalur_pendakian
    WHERE jalur_pendakian.id = bookings.jalur_id
    AND jalur_pendakian.basecamp_id = get_user_basecamp_id()
  )
);

-- Pendaki: CRUD booking milik sendiri (menggunakan ketua_id)
CREATE POLICY "Pendaki: View own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (
  get_user_role() = 'pendaki' AND
  ketua_id = auth.uid()
);

CREATE POLICY "Pendaki: Create own booking"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (
  get_user_role() = 'pendaki' AND
  ketua_id = auth.uid()
);

CREATE POLICY "Pendaki: Update own booking"
ON public.bookings FOR UPDATE
TO authenticated
USING (
  get_user_role() = 'pendaki' AND
  ketua_id = auth.uid()
)
WITH CHECK (
  get_user_role() = 'pendaki' AND
  ketua_id = auth.uid()
);

-- =====================================================
-- 7. POLICIES untuk tabel ANGGOTA_ROMBONGAN
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "Super Admin: Full access to anggota_rombongan"
ON public.anggota_rombongan FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Admin Basecamp: Lihat dan update anggota dari booking di basecamp mereka
CREATE POLICY "Admin Basecamp: View anggota in their basecamp"
ON public.anggota_rombongan FOR SELECT
TO authenticated
USING (
  is_admin_basecamp() AND
  EXISTS (
    SELECT 1 FROM public.bookings
    JOIN public.jalur_pendakian ON bookings.jalur_id = jalur_pendakian.id
    WHERE bookings.id = anggota_rombongan.booking_id
    AND jalur_pendakian.basecamp_id = get_user_basecamp_id()
  )
);

CREATE POLICY "Admin Basecamp: Update anggota in their basecamp"
ON public.anggota_rombongan FOR UPDATE
TO authenticated
USING (
  is_admin_basecamp() AND
  EXISTS (
    SELECT 1 FROM public.bookings
    JOIN public.jalur_pendakian ON bookings.jalur_id = jalur_pendakian.id
    WHERE bookings.id = anggota_rombongan.booking_id
    AND jalur_pendakian.basecamp_id = get_user_basecamp_id()
  )
)
WITH CHECK (
  is_admin_basecamp() AND
  EXISTS (
    SELECT 1 FROM public.bookings
    JOIN public.jalur_pendakian ON bookings.jalur_id = jalur_pendakian.id
    WHERE bookings.id = anggota_rombongan.booking_id
    AND jalur_pendakian.basecamp_id = get_user_basecamp_id()
  )
);

-- Pendaki: CRUD anggota dari booking milik sendiri (menggunakan ketua_id)
CREATE POLICY "Pendaki: Manage anggota in own booking"
ON public.anggota_rombongan FOR ALL
TO authenticated
USING (
  get_user_role() = 'pendaki' AND
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = anggota_rombongan.booking_id
    AND bookings.ketua_id = auth.uid()
  )
)
WITH CHECK (
  get_user_role() = 'pendaki' AND
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = anggota_rombongan.booking_id
    AND bookings.ketua_id = auth.uid()
  )
);

-- =====================================================
-- 8. POLICIES untuk tabel LOGISTIK_BAWAAN
-- =====================================================

-- Super Admin: Full access
CREATE POLICY "Super Admin: Full access to logistik_bawaan"
ON public.logistik_bawaan FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Admin Basecamp: Lihat dan update logistik dari booking di basecamp mereka
CREATE POLICY "Admin Basecamp: View logistik in their basecamp"
ON public.logistik_bawaan FOR SELECT
TO authenticated
USING (
  is_admin_basecamp() AND
  EXISTS (
    SELECT 1 FROM public.bookings
    JOIN public.jalur_pendakian ON bookings.jalur_id = jalur_pendakian.id
    WHERE bookings.id = logistik_bawaan.booking_id
    AND jalur_pendakian.basecamp_id = get_user_basecamp_id()
  )
);

CREATE POLICY "Admin Basecamp: Update logistik in their basecamp"
ON public.logistik_bawaan FOR UPDATE
TO authenticated
USING (
  is_admin_basecamp() AND
  EXISTS (
    SELECT 1 FROM public.bookings
    JOIN public.jalur_pendakian ON bookings.jalur_id = jalur_pendakian.id
    WHERE bookings.id = logistik_bawaan.booking_id
    AND jalur_pendakian.basecamp_id = get_user_basecamp_id()
  )
)
WITH CHECK (
  is_admin_basecamp() AND
  EXISTS (
    SELECT 1 FROM public.bookings
    JOIN public.jalur_pendakian ON bookings.jalur_id = jalur_pendakian.id
    WHERE bookings.id = logistik_bawaan.booking_id
    AND jalur_pendakian.basecamp_id = get_user_basecamp_id()
  )
);

-- Pendaki: CRUD logistik dari booking milik sendiri (menggunakan ketua_id)
CREATE POLICY "Pendaki: Manage logistik in own booking"
ON public.logistik_bawaan FOR ALL
TO authenticated
USING (
  get_user_role() = 'pendaki' AND
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = logistik_bawaan.booking_id
    AND bookings.ketua_id = auth.uid()
  )
)
WITH CHECK (
  get_user_role() = 'pendaki' AND
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = logistik_bawaan.booking_id
    AND bookings.ketua_id = auth.uid()
  )
);

-- =====================================================
-- SELESAI! RLS Policies sudah aktif
-- =====================================================
--
-- CATATAN PENTING:
-- 1. Pastikan tabel users memiliki kolom basecamp_id (UUID, nullable)
-- 2. User dengan role 'admin_basecamp' HARUS memiliki basecamp_id yang terisi
-- 3. User dengan role 'super_admin' atau 'pendaki' boleh basecamp_id NULL
-- 4. Test policies dengan user dari masing-masing role untuk memastikan akses sudah benar
--
-- Cara test:
-- - Login sebagai user dengan role berbeda
-- - Coba akses data dari tabel yang berbeda
-- - Pastikan hanya data yang sesuai role yang bisa diakses
-- =====================================================
