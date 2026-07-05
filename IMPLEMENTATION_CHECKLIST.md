# Checklist Implementasi Sistem Booking Pendakian Gunung Prau
## SaaS Multi-Tenant (PostgreSQL/Supabase)

> **Progress Tracker**: Tandai dengan `[x]` untuk task yang sudah selesai

---

## 📊 Progress Overview

- **Phase 1**: Setup & Infrastructure - 6/10 tasks
- **Phase 2**: Database & Auth - 16/18 tasks  
- **Phase 3**: Core Features - 0/28 tasks
- **Phase 4**: Testing & QA - 0/8 tasks
- **Phase 5**: Deployment - 0/6 tasks

**Total Progress**: 22/70 tasks (31%)

---

## Phase 1: Setup & Infrastructure

### 1.1 Project Setup
- [x] Setup Next.js 16.2.10 project dengan TypeScript
- [x] Install dependencies utama (Supabase client, UI library, payment gateway SDK)
- [x] Setup environment variables (`.env.local`)
- [ ] Konfigurasi ESLint & Prettier
- [x] Setup Git repository dan `.gitignore`

### 1.2 Supabase Setup
- [x] Buat project Supabase baru
- [x] Copy Supabase URL dan Anon Key ke `.env.local`
- [x] Test koneksi ke Supabase dari aplikasi
- [x] Setup Row Level Security (RLS) policies
- [ ] Enable Realtime (jika diperlukan)

---

## Phase 2: Database & Authentication

### 2.1 Database Schema
- [x] Buat tabel `users` dengan kolom sesuai schema
- [x] Buat tabel `basecamps` dengan kolom sesuai schema
- [x] Buat tabel `jalur_pendakian` dengan kolom sesuai schema
- [x] Buat tabel `bookings` dengan kolom sesuai schema
- [x] Buat tabel `anggota_rombongan` dengan kolom sesuai schema
- [x] Buat tabel `logistik_bawaan` dengan kolom sesuai schema

### 2.2 Database Constraints & Indexes
- [x] Setup Foreign Key constraints antar tabel
- [x] Setup Check constraints (role, status, NIK length, dll)
- [ ] Buat indexes untuk optimasi query (booking status, tanggal, jalur_id)
- [ ] Setup triggers untuk `updated_at` timestamps

### 2.3 Row Level Security (RLS)
- [x] Enable RLS untuk semua tabel
- [x] Policy untuk Super Admin (akses semua data)
- [x] Policy untuk Admin Basecamp (akses data basecamp sendiri saja)
- [x] Policy untuk Pendaki (akses booking sendiri saja)

### 2.4 Authentication
- [x] Setup Supabase Auth (email/password)
- [x] Implementasi register untuk Pendaki
- [x] Implementasi login/logout
- [x] Protected routes berdasarkan role (middleware)

---

## Phase 3: Core Features

### 3.1 Super Admin Dashboard

#### Onboarding Tenant
- [ ] Halaman daftar basecamp (list, search, filter)
- [ ] Form tambah basecamp baru
- [ ] Form edit profil basecamp
- [ ] Aktifkan/nonaktifkan basecamp
- [ ] Form buat admin basecamp + kirim email credentials

#### Monitoring & Analytics
- [ ] Dashboard analytics global (total booking, revenue, dll)
- [ ] Laporan per basecamp
- [ ] Audit trail / activity log

---

### 3.2 Admin Basecamp Dashboard

#### Setup Basecamp
- [ ] Halaman profil basecamp (edit nama, alamat, kontak, foto)
- [ ] Upload foto basecamp
- [ ] Manage fasilitas basecamp (JSONB field)

#### Manage Jalur Pendakian
- [ ] Halaman daftar jalur pendakian
- [ ] Form tambah jalur baru (nama, deskripsi, kuota, harga, tingkat kesulitan)
- [ ] Form edit jalur
- [ ] Aktifkan/nonaktifkan jalur
- [ ] Kelola kuota per jalur per tanggal

#### Manage Booking
- [ ] Halaman daftar booking (filter by status, tanggal, jalur)
- [ ] Detail booking (lihat data rombongan, logistik)
- [ ] Update status booking manual (jika diperlukan)

#### Check-In Management
- [ ] Halaman check-in dengan QR scanner
- [ ] Decode QR Code dari E-Ticket
- [ ] Validasi booking (status CONFIRMED, tanggal sesuai)
- [ ] Tampilkan list anggota rombongan untuk validasi fisik KTP
- [ ] Checkbox untuk tandai kehadiran setiap anggota
- [ ] Verifikasi dan update logistik bawaan
- [ ] Update status booking ke CHECKED_IN

#### Check-Out Management
- [ ] Halaman check-out (cari booking by code atau scan QR)
- [ ] Validasi jumlah pendaki yang turun
- [ ] Form input data sampah (berat, jenis)
- [ ] Checklist peralatan yang dibawa turun
- [ ] Update status booking ke CHECKED_OUT
- [ ] Eskalasi darurat jika ada pendaki hilang

#### Laporan & Statistik
- [ ] Laporan booking per periode
- [ ] Laporan pendapatan
- [ ] Statistik kepatuhan SOP sampah
- [ ] Dashboard KPI basecamp

---

### 3.3 Pendaki (End User) Interface

#### Landing Page & Browsing
- [ ] Landing page dengan daftar basecamp
- [ ] Filter basecamp (lokasi, fasilitas, rating)
- [ ] Halaman detail basecamp
- [ ] Daftar jalur pendakian per basecamp
- [ ] Detail jalur (deskripsi, harga, kuota tersisa, tingkat kesulitan)

#### Booking Flow
- [ ] Form pilih tanggal pendakian
- [ ] Cek ketersediaan kuota realtime
- [ ] Form input jumlah anggota
- [ ] Form input data anggota rombongan (nama, NIK, telepon, alamat)
- [ ] Validasi NIK 16 digit
- [ ] Form input logistik bawaan (tenda, carrier, makanan, dll)
- [ ] Halaman review & konfirmasi booking
- [ ] Hitung total harga otomatis (harga * jumlah anggota)

#### Payment Integration
- [ ] Integrasi payment gateway (Midtrans/Xendit/dll)
- [ ] Generate payment link
- [ ] Handle payment webhook callback
- [ ] Update status booking ke CONFIRMED setelah bayar
- [ ] Generate E-Ticket dengan QR Code
- [ ] Kirim email konfirmasi + E-Ticket PDF

#### User Dashboard
- [ ] Halaman riwayat booking
- [ ] Detail booking (status, E-Ticket, invoice)
- [ ] Download E-Ticket PDF
- [ ] Batalkan booking (sesuai policy refund)

---

### 3.4 State Machine & Business Logic

#### Status Transitions
- [ ] Implementasi transisi DRAFT → PENDING_PAYMENT
- [ ] Implementasi transisi PENDING_PAYMENT → CONFIRMED (webhook)
- [ ] Implementasi transisi PENDING_PAYMENT → EXPIRED (cron job)
- [ ] Implementasi transisi CONFIRMED → CHECKED_IN
- [ ] Implementasi transisi CHECKED_IN → CHECKED_OUT
- [ ] Implementasi pembatalan (CANCELLED dari berbagai status)

#### Background Jobs (Cron)
- [ ] Cron job auto-expire pending payments (setiap 5 menit)
- [ ] Cron job kirim reminder H-1 sebelum pendakian
- [ ] Cron job cleanup booking lama (>6 bulan)

#### Email Notifications
- [ ] Email welcome untuk admin basecamp baru
- [ ] Email payment link untuk pendaki
- [ ] Email konfirmasi booking + E-Ticket
- [ ] Email reminder H-1 pendakian
- [ ] Email thank you + request feedback setelah checkout
- [ ] Email pembatalan booking

---

## Phase 4: Testing & Quality Assurance

### 4.1 Unit Testing
- [ ] Test fungsi validasi NIK
- [ ] Test perhitungan total harga
- [ ] Test cek kuota tersisa
- [ ] Test business logic state transitions

### 4.2 Integration Testing
- [ ] Test alur booking end-to-end (draft → payment → confirmed)
- [ ] Test check-in flow
- [ ] Test check-out flow
- [ ] Test RLS policies (isolasi data per tenant)

### 4.3 Manual Testing
- [ ] Test seluruh user flow sebagai Super Admin
- [ ] Test seluruh user flow sebagai Admin Basecamp
- [ ] Test seluruh user flow sebagai Pendaki
- [ ] Test responsiveness (mobile, tablet, desktop)

### 4.4 Security Testing
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Test CSRF protection
- [ ] Test unauthorized access (RLS)

---

## Phase 5: Deployment & Production

### 5.1 Pre-Deployment
- [ ] Code review & refactoring
- [ ] Setup production environment variables
- [ ] Setup production Supabase project
- [ ] Migrate schema ke production database
- [ ] Setup domain & SSL certificate

### 5.2 Deployment
- [ ] Deploy ke Vercel/Netlify/VPS
- [ ] Setup custom domain
- [ ] Test production environment
- [ ] Setup monitoring (error tracking, analytics)
- [ ] Setup backup database otomatis

### 5.3 Post-Deployment
- [ ] User acceptance testing (UAT)
- [ ] Dokumentasi user manual
- [ ] Training untuk Super Admin & Admin Basecamp
- [ ] Go live announcement
- [ ] Monitor production errors & performance

---

## 📝 Notes & Blockers

### Current Blockers
*(Tambahkan blocker atau issue yang menghambat progress)*

- 

### Technical Decisions
*(Catat keputusan teknis penting)*

- 

### Future Enhancements (Post-MVP)
- [ ] Sistem rating & review untuk basecamp
- [ ] Notifikasi WhatsApp untuk booking
- [ ] Integrasi maps untuk lokasi basecamp
- [ ] Dashboard prediksi cuaca
- [ ] Loyalty program untuk pendaki
- [ ] Mobile app (React Native / Flutter)

---

**Last Updated**: 2026-07-05  
**Project Status**: 🟢 In Progress - RLS Policies Complete  
**Current Phase**: Phase 2 - Database & Authentication (16/18 completed)