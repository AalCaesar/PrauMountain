# WORKFLOW.md
# Sistem Booking Online Pendakian Gunung Prau
## Arsitektur SaaS (Software as a Service)

---

## 📋 Daftar Isi

1. [Aktor & Hak Akses](#aktor--hak-akses)
2. [Alur Kerja Utama](#alur-kerja-utama)
   - [Alur 1: Onboarding Tenant](#alur-1-onboarding-tenant)
   - [Alur 2: Proses Booking](#alur-2-proses-booking)
   - [Alur 3: Check-In di Basecamp](#alur-3-check-in-di-basecamp)
   - [Alur 4: Check-Out Kepulangan](#alur-4-check-out-kepulangan)
3. [State Machine](#state-machine)
4. [Pemetaan Tabel Database](#pemetaan-tabel-database)

---

## 🎭 Aktor & Hak Akses

Sistem ini memiliki 3 jenis aktor utama dengan hak akses berbeda:

### 1. Super Admin
**Deskripsi**: Administrator tertinggi yang mengelola seluruh platform SaaS.

**Hak Akses**:
- ✅ Mengelola semua tenant (basecamp)
- ✅ Membuat, mengaktifkan, atau menonaktifkan basecamp
- ✅ Melihat seluruh data transaksi booking dari semua basecamp
- ✅ Mengelola user admin basecamp
- ✅ Mengakses dashboard analytics global
- ✅ Konfigurasi sistem dan pengaturan platform
- ✅ Audit trail seluruh aktivitas sistem

**Use Case Utama**:
- Onboarding basecamp baru ke dalam platform
- Monitoring performa seluruh basecamp
- Menangani eskalasi masalah dari admin basecamp
- Maintenance dan update sistem

---

### 2. Admin Basecamp (Tenant)
**Deskripsi**: Pengelola basecamp yang bertanggung jawab atas operasional basecamp tertentu (multi-tenant isolation).

**Hak Akses**:
- ✅ Mengelola profil basecamp sendiri (nama, alamat, kontak, fasilitas)
- ✅ Membuat dan mengatur jalur pendakian (nama jalur, kuota harian, harga tiket)
- ✅ Melihat dan mengelola booking yang masuk ke basecamp sendiri
- ✅ Melakukan check-in dan check-out pendaki
- ✅ Validasi fisik data pendaki dan anggota rombongan
- ✅ Pencatatan logistik bawaan dan sampah
- ✅ Mengelola ketersediaan kuota per tanggal
- ✅ Melihat laporan pendapatan dan statistik basecamp sendiri
- ❌ Tidak dapat melihat data basecamp lain (tenant isolation)

**Use Case Utama**:
- Setup jalur pendakian dan pricing
- Verifikasi dan validasi booking pendaki
- Operasional harian (check-in/check-out)
- Monitoring kepatuhan SOP keselamatan
- Laporan keuangan dan operasional

---

### 3. Pendaki (End User)
**Deskripsi**: Pengguna akhir yang melakukan booking pendakian.

**Hak Akses**:
- ✅ Mendaftar dan login ke sistem
- ✅ Melihat daftar basecamp dan jalur pendakian yang tersedia
- ✅ Melihat kuota dan harga per jalur
- ✅ Membuat booking baru (draft)
- ✅ Mengisi data diri dan anggota rombongan
- ✅ Mengisi data logistik bawaan (untuk SOP keselamatan)
- ✅ Melakukan pembayaran
- ✅ Melihat riwayat booking sendiri
- ✅ Download E-Ticket dengan QR Code
- ✅ Membatalkan booking (sesuai policy)
- ❌ Tidak dapat melihat data pendaki lain

**Use Case Utama**:
- Mencari dan memilih jalur pendakian
- Melakukan booking dan pembayaran
- Mengelola data rombongan
- Check-in dengan E-Ticket QR Code
- Tracking status booking

---

## 🔄 Alur Kerja Utama

### Alur 1: Onboarding Tenant

**Tujuan**: Mendaftarkan basecamp baru ke dalam platform SaaS dan mempersiapkan jalur pendakian.

#### Langkah-langkah:

**1.1. Super Admin Mendaftarkan Basecamp Baru**

```
┌─────────────────┐
│  Super Admin    │
└────────┬────────┘
         │
         │ 1. Login ke Admin Panel
         │
         ▼
┌─────────────────────────────────┐
│  Buat Basecamp Baru             │
│  - Nama Basecamp                │
│  - Alamat & Lokasi              │
│  - Kontak Person                │
│  - Email & Telepon              │
│  - Status: ACTIVE/INACTIVE      │
└────────┬────────────────────────┘
         │
         │ 2. Insert ke tabel `basecamps`
         │
         ▼
┌─────────────────────────────────┐
│  Buat Admin Basecamp            │
│  - Nama Admin                   │
│  - Email                        │
│  - Password (temporary)         │
│  - Role: admin_basecamp         │
│  - basecamp_id (foreign key)    │
└────────┬────────────────────────┘
         │
         │ 3. Insert ke tabel `users`
         │
         ▼
┌─────────────────────────────────┐
│  Kirim Email Credentials        │
│  - Link aktivasi akun           │
│  - Username & temporary password│
└─────────────────────────────────┘
```

**Tabel yang Terlibat**:
- `basecamps`: Data profil basecamp
- `users`: Akun admin basecamp dengan role `admin_basecamp`

---

**1.2. Admin Basecamp Setup Jalur Pendakian**

```
┌─────────────────┐
│ Admin Basecamp  │
└────────┬────────┘
         │
         │ 1. Login pertama kali (ganti password)
         │
         ▼
┌─────────────────────────────────┐
│  Lengkapi Profil Basecamp       │
│  - Update foto                  │
│  - Update deskripsi             │
│  - Update fasilitas             │
└────────┬────────────────────────┘
         │
         │ 2. Update tabel `basecamps`
         │
         ▼
┌─────────────────────────────────┐
│  Buat Jalur Pendakian           │
│  - Nama Jalur (ex: Via Patak    │
│    Banteng, Via Watu Gunung)    │
│  - Deskripsi jalur              │
│  - Tingkat kesulitan            │
│  - Estimasi waktu tempuh        │
│  - Kuota harian                 │
│  - Harga per orang              │
│  - Status: ACTIVE/INACTIVE      │
└────────┬────────────────────────┘
         │
         │ 3. Insert ke tabel `jalur_pendakian`
         │    dengan basecamp_id
         │
         ▼
┌─────────────────────────────────┐
│  Jalur Siap untuk Booking       │
└─────────────────────────────────┘
```

**Tabel yang Terlibat**:
- `basecamps`: Update profil lengkap
- `jalur_pendakian`: Data jalur dengan foreign key ke `basecamps`

**Validasi**:
- ✅ Satu basecamp bisa memiliki banyak jalur
- ✅ Kuota harian per jalur harus > 0
- ✅ Harga harus valid (tidak negatif)

---

### Alur 2: Proses Booking

**Tujuan**: Pendaki melakukan reservasi jalur pendakian hingga pembayaran berhasil.

#### Langkah-langkah:

**2.1. Pendaki Memilih Jalur dan Tanggal**

```
┌─────────────────┐
│    Pendaki      │
└────────┬────────┘
         │
         │ 1. Browse basecamp & jalur
         │
         ▼
┌─────────────────────────────────┐
│  Pilih Basecamp                 │
│  - Lihat daftar basecamp        │
│  - Filter berdasarkan lokasi    │
└────────┬────────────────────────┘
         │
         │ 2. Query tabel `basecamps`
         │    WHERE status = 'ACTIVE'
         │
         ▼
┌─────────────────────────────────┐
│  Pilih Jalur Pendakian          │
│  - Lihat jalur dari basecamp    │
│  - Lihat harga & kuota          │
└────────┬────────────────────────┘
         │
         │ 3. Query tabel `jalur_pendakian`
         │    WHERE basecamp_id = ?
         │    AND status = 'ACTIVE'
         │
         ▼
┌─────────────────────────────────┐
│  Pilih Tanggal Pendakian        │
│  - Check ketersediaan kuota     │
│  - Tentukan jumlah anggota      │
└────────┬────────────────────────┘
         │
         │ 4. Cek kuota tersisa:
         │    SELECT COUNT(*) FROM anggota_rombongan
         │    JOIN bookings ON ...
         │    WHERE jalur_id = ? AND tanggal = ?
         │    AND status IN ('CONFIRMED','CHECKED_IN')
         │
         ▼
┌─────────────────────────────────┐
│  Kuota Tersedia?                │
│  - Ya: Lanjut ke form booking   │
│  - Tidak: Tampilkan pesan error │
└─────────────────────────────────┘
```

---

**2.2. Mengisi Data Booking dan Rombongan**

```
┌─────────────────────────────────┐
│  Buat Booking (DRAFT)           │
│  - jalur_id                     │
│  - user_id (pendaki)            │
│  - tanggal_pendakian            │
│  - jumlah_anggota               │
│  - total_harga (otomatis)       │
│  - status: DRAFT                │
└────────┬────────────────────────┘
         │
         │ 5. Insert ke tabel `bookings`
         │    status = 'DRAFT'
         │
         ▼
┌─────────────────────────────────┐
│  Isi Data Anggota Rombongan     │
│  Untuk setiap anggota:          │
│  - Nama lengkap                 │
│  - NIK (validasi 16 digit)      │
│  - No. Telepon                  │
│  - Alamat                       │
│  - Status: ketua/anggota        │
└────────┬────────────────────────┘
         │
         │ 6. Insert ke tabel `anggota_rombongan`
         │    booking_id (foreign key)
         │
         ▼
┌─────────────────────────────────┐
│  Isi Logistik Bawaan            │
│  - Tenda (jumlah)               │
│  - Carrier (jumlah)             │
│  - Sleeping bag (jumlah)        │
│  - Kompor & gas (jumlah)        │
│  - Makanan & minuman (kg)       │
│  - Catatan tambahan             │
└────────┬────────────────────────┘
         │
         │ 7. Insert ke tabel `logistik_bawaan`
         │    booking_id (foreign key)
         │
         ▼
┌─────────────────────────────────┐
│  Review & Konfirmasi            │
│  - Tampilkan ringkasan          │
│  - Total harga                  │
│  - Syarat & ketentuan           │
└─────────────────────────────────┘
```

---

**2.3. Pembayaran**

```
┌─────────────────────────────────┐
│  Proses Pembayaran              │
│  - Pilih metode bayar           │
│  - Generate payment link        │
│  - Redirect ke payment gateway  │
└────────┬────────────────────────┘
         │
         │ 8. Update tabel `bookings`
         │    status = 'PENDING_PAYMENT'
         │
         ▼
┌─────────────────────────────────┐
│  Payment Gateway Callback       │
│  - Webhook dari payment provider│
│  - Verifikasi signature         │
└────────┬────────────────────────┘
         │
         │ 9. Jika bayar berhasil:
         │    UPDATE bookings
         │    SET status = 'CONFIRMED'
         │    SET paid_at = NOW()
         │
         ▼
┌─────────────────────────────────┐
│  Generate E-Ticket              │
│  - Booking code (unique)        │
│  - QR Code (encode booking_id)  │
│  - Detail booking               │
└────────┬────────────────────────┘
         │
         │ 10. Kirim email konfirmasi
         │     dengan E-Ticket PDF
         │
         ▼
┌─────────────────────────────────┐
│  Booking CONFIRMED              │
└─────────────────────────────────┘
```

**Tabel yang Terlibat**:
- `bookings`: Data transaksi utama
- `jalur_pendakian`: Referensi jalur dan harga
- `anggota_rombongan`: Data identitas pendaki
- `logistik_bawaan`: Data barang bawaan

**Validasi**:
- ✅ NIK harus 16 digit dan valid
- ✅ Jumlah anggota di `anggota_rombongan` harus sesuai `bookings.jumlah_anggota`
- ✅ Total harga = `jalur.harga * jumlah_anggota`
- ✅ Kuota tidak boleh over-booked

---

### Alur 3: Check-In di Basecamp

**Tujuan**: Validasi fisik pendaki, scan E-Ticket QR Code, dan pencatatan logistik untuk SOP keselamatan.

#### Langkah-langkah:

**3.1. Pendaki Tiba di Basecamp**

```
┌─────────────────┐
│    Pendaki      │
└────────┬────────┘
         │
         │ 1. Tiba di basecamp sesuai jadwal
         │    (H-1 atau pagi hari pendakian)
         │
         ▼
┌─────────────────────────────────┐
│  Tunjukkan E-Ticket             │
│  - Buka email konfirmasi        │
│  - Tampilkan QR Code            │
└────────┬────────────────────────┘
         │
         │ 2. Admin scan QR Code
         │
         ▼
┌─────────────────────────────────┐
│  Admin Scan QR Code             │
│  - Decode QR → booking_id       │
│  - Query tabel `bookings`       │
│  - Validasi status = CONFIRMED  │
│  - Validasi tanggal sesuai      │
└────────┬────────────────────────┘
         │
         │ 3. Validasi booking:
         │    SELECT * FROM bookings
         │    WHERE id = ? 
         │    AND status = 'CONFIRMED'
         │    AND tanggal_pendakian = CURDATE()
         │
         ▼
┌─────────────────────────────────┐
│  Booking Valid?                 │
│  - Tidak: Tolak & beri alasan   │
│  - Ya: Lanjut validasi fisik    │
└─────────────────────────────────┘
```

---

**3.2. Validasi Fisik Anggota Rombongan**

```
┌─────────────────────────────────┐
│  Tampilkan Data Rombongan       │
│  - Query tabel anggota_rombongan│
│  - Tampilkan list anggota       │
│  - Tampilkan NIK masing-masing  │
└────────┬────────────────────────┘
         │
         │ 4. Query:
         │    SELECT * FROM anggota_rombongan
         │    WHERE booking_id = ?
         │    ORDER BY status DESC (ketua dulu)
         │
         ▼
┌─────────────────────────────────┐
│  Admin Cek Identitas Fisik      │
│  Untuk setiap anggota:          │
│  - Cek KTP/identitas fisik      │
│  - Cocokkan dengan NIK di sistem│
│  - Tandai ✓ jika valid          │
│  - Tandai ✗ jika tidak hadir    │
└────────┬────────────────────────┘
         │
         │ 5. Admin update status kehadiran
         │    (field baru: is_present)
         │
         ▼
┌─────────────────────────────────┐
│  Semua Anggota Hadir?           │
│  - Tidak lengkap: Eskalasi      │
│    (apakah tetap berangkat?)    │
│  - Ya: Lanjut cek logistik      │
└─────────────────────────────────┘
```

---

**3.3. Verifikasi dan Pencatatan Logistik Bawaan**

```
┌─────────────────────────────────┐
│  Tampilkan Data Logistik        │
│  - Query tabel logistik_bawaan  │
│  - Tampilkan list barang        │
└────────┬────────────────────────┘
         │
         │ 6. Query:
         │    SELECT * FROM logistik_bawaan
         │    WHERE booking_id = ?
         │
         ▼
┌─────────────────────────────────┐
│  Admin Verifikasi Fisik Barang  │
│  - Cek tenda (jumlah)           │
│  - Cek carrier/tas              │
│  - Cek sleeping bag             │
│  - Cek kompor & tabung gas      │
│  - Estimasi berat makanan       │
│  - Catat item tambahan          │
└────────┬────────────────────────┘
         │
         │ 7. Admin update/koreksi data
         │    jika ada perbedaan
         │
         ▼
┌─────────────────────────────────┐
│  Briefing Keselamatan           │
│  - SOP pendakian                │
│  - Jalur yang akan ditempuh     │
│  - Estimasi waktu               │
│  - Peringatan cuaca             │
│  - Kebijakan sampah (carry out) │
└────────┬────────────────────────┘
         │
         │ 8. Admin update booking:
         │    UPDATE bookings
         │    SET status = 'CHECKED_IN'
         │    SET checked_in_at = NOW()
         │    SET checked_in_by = admin_id
         │
         ▼
┌─────────────────────────────────┐
│  Check-In BERHASIL              │
│  - Status: CHECKED_IN           │
│  - Pendaki boleh mulai mendaki  │
└─────────────────────────────────┘
```

**Tabel yang Terlibat**:
- `bookings`: Update status menjadi `CHECKED_IN`
- `anggota_rombongan`: Validasi kehadiran fisik
- `logistik_bawaan`: Verifikasi barang bawaan

**Validasi**:
- ✅ Booking harus berstatus `CONFIRMED`
- ✅ Tanggal check-in harus sesuai `tanggal_pendakian`
- ✅ Identitas fisik (KTP) harus cocok dengan NIK di sistem
- ✅ Logistik minimal harus memenuhi syarat keselamatan

**Edge Cases**:
- Jika ada anggota tidak hadir: Admin bisa tetap proses dengan jumlah berkurang (tidak ada refund otomatis)
- Jika booking sudah expired (lewat tanggal): Tolak check-in, minta booking ulang
- Jika cuaca buruk: Admin bisa menunda atau membatalkan keberangkatan

---

### Alur 4: Check-Out Kepulangan

**Tujuan**: Validasi pendaki yang turun gunung dan pengecekan sampah/logistik untuk keperluan SOP lingkungan.

#### Langkah-langkah:

**4.1. Pendaki Kembali ke Basecamp**

```
┌─────────────────┐
│    Pendaki      │
└────────┬────────┘
         │
         │ 1. Turun dari gunung
         │    (biasanya H+1 atau H+2)
         │
         ▼
┌─────────────────────────────────┐
│  Lapor ke Admin Basecamp        │
│  - Tunjukkan E-Ticket atau      │
│    sebutkan booking code        │
└────────┬────────────────────────┘
         │
         │ 2. Admin cari booking
         │
         ▼
┌─────────────────────────────────┐
│  Admin Cari Booking             │
│  - Input booking_code atau scan │
│  - Query tabel `bookings`       │
│  - Validasi status = CHECKED_IN │
└────────┬────────────────────────┘
         │
         │ 3. Query:
         │    SELECT * FROM bookings
         │    WHERE booking_code = ?
         │    AND status = 'CHECKED_IN'
         │
         ▼
┌─────────────────────────────────┐
│  Booking Ditemukan?             │
│  - Tidak: Error / sudah checkout│
│  - Ya: Lanjut validasi rombongan│
└─────────────────────────────────┘
```

---

**4.2. Validasi Jumlah Anggota yang Turun**

```
┌─────────────────────────────────┐
│  Tampilkan List Anggota         │
│  - Query anggota_rombongan      │
│  - Tampilkan yang check-in      │
│  - Hitung jumlah yang hadir     │
└────────┬────────────────────────┘
         │
         │ 4. Query:
         │    SELECT * FROM anggota_rombongan
         │    WHERE booking_id = ?
         │    AND is_present = true
         │
         ▼
┌─────────────────────────────────┐
│  Admin Hitung Pendaki Turun     │
│  - Cek satu per satu            │
│  - Pastikan semua turun         │
│  - Tandai jika ada yang hilang  │
└────────┬────────────────────────┘
         │
         │ 5. Validasi jumlah
         │
         ▼
┌─────────────────────────────────┐
│  Jumlah Sesuai?                 │
│  - Tidak: ESKALASI DARURAT      │
│    (ada pendaki hilang/tertinggal)│
│  - Ya: Lanjut cek logistik      │
└─────────────────────────────────┘
```

**PENTING**: Jika jumlah pendaki tidak sesuai, ini adalah **insiden keselamatan kritis**:
- Admin harus segera eskalasi ke tim SAR
- Booking **TIDAK BOLEH** di-checkout
- Status tetap `CHECKED_IN` sampai semua pendaki ditemukan

---

**4.3. Pengecekan Sampah dan Logistik Kepulangan**

```
┌─────────────────────────────────┐
│  Admin Cek Sampah Bawaan        │
│  - Apakah membawa sampah turun? │
│  - Timbang sampah (kg)          │
│  - Bandingkan dengan estimasi   │
│    berat makanan saat naik      │
└────────┬────────────────────────┘
         │
         │ 6. Catat hasil pengecekan
         │
         ▼
┌─────────────────────────────────┐
│  Sampah Sesuai SOP?             │
│  - Ya: Beri apresiasi           │
│  - Kurang: Beri edukasi/teguran │
│  - Tidak bawa: Denda/sanksi     │
└────────┬────────────────────────┘
         │
         │ 7. Update logistik_bawaan:
         │    UPDATE logistik_bawaan
         │    SET sampah_dibawa_turun = true
         │    SET berat_sampah_kg = ?
         │    SET catatan_checkout = ?
         │    WHERE booking_id = ?
         │
         ▼
┌─────────────────────────────────┐
│  Cek Peralatan yang Dibawa Turun│
│  - Tenda kembali?               │
│  - Carrier kembali?             │
│  - Tidak ada peralatan tertinggal?│
└────────┬────────────────────────┘
         │
         │ 8. Update data logistik
         │
         ▼
┌─────────────────────────────────┐
│  Finalisasi Check-Out           │
│  - Update booking status        │
│  - Catat waktu checkout         │
│  - Catat admin yang handle      │
└────────┬────────────────────────┘
         │
         │ 9. Update bookings:
         │    UPDATE bookings
         │    SET status = 'CHECKED_OUT'
         │    SET checked_out_at = NOW()
         │    SET checked_out_by = admin_id
         │
         ▼
┌─────────────────────────────────┐
│  Check-Out SELESAI              │
│  - Kirim email thank you        │
│  - Minta feedback/rating        │
│  - Booking selesai              │
└─────────────────────────────────┘
```

**Tabel yang Terlibat**:
- `bookings`: Update status menjadi `CHECKED_OUT`
- `anggota_rombongan`: Validasi semua anggota turun
- `logistik_bawaan`: Pencatatan sampah dan peralatan

**Validasi**:
- ✅ Jumlah pendaki turun harus sama dengan yang naik (atau sudah ada laporan resmi)
- ✅ Sampah wajib dibawa turun (carry in, carry out)
- ✅ Peralatan besar (tenda, carrier) harus tercatat
- ✅ Status booking sebelumnya harus `CHECKED_IN`

**KPI/Metrics**:
- Persentase pendaki yang membawa sampah turun
- Rata-rata berat sampah per rombongan
- Jumlah insiden keselamatan (pendaki hilang/tertinggal)
- Waktu rata-rata dari check-in ke check-out

---

## 🔄 State Machine

**State Machine Booking** adalah diagram transisi status pada tabel `bookings` yang menggambarkan siklus hidup sebuah transaksi booking dari awal hingga selesai.

### Status Flow Diagram

```
                    ┌──────────────┐
                    │   DRAFT      │ ← Pendaki mulai isi form
                    └──────┬───────┘
                           │
                           │ Submit booking & pilih bayar
                           │
                    ┌──────▼────────────┐
                    │ PENDING_PAYMENT   │ ← Menunggu pembayaran
                    └──────┬────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         (Bayar berhasil)      (Bayar gagal/expired)
                │                     │
         ┌──────▼────────┐      ┌────▼─────────┐
         │  CONFIRMED    │      │   CANCELLED  │
         └──────┬────────┘      └──────────────┘
                │
                │ Pendaki tiba di basecamp
                │ Admin scan QR & validasi
                │
         ┌──────▼────────┐
         │  CHECKED_IN   │ ← Pendaki naik gunung
         └──────┬────────┘
                │
                │ Pendaki turun gunung
                │ Admin validasi & cek sampah
                │
         ┌──────▼─────────┐
         │  CHECKED_OUT   │ ← Booking selesai
         └────────────────┘
```

---

### Deskripsi Status

| Status | Deskripsi | Aktor yang Bisa Mengubah | Transisi Valid Berikutnya |
|--------|-----------|--------------------------|---------------------------|
| **DRAFT** | Booking baru dibuat, data masih bisa diedit. Belum ada pembayaran. | Pendaki (otomatis saat buat booking) | `PENDING_PAYMENT`, `CANCELLED` |
| **PENDING_PAYMENT** | Booking sudah disubmit, menunggu pembayaran via payment gateway. Ada timeout (misal: 2 jam). | Sistem (otomatis setelah submit) | `CONFIRMED`, `CANCELLED`, `EXPIRED` |
| **CONFIRMED** | Pembayaran berhasil. Booking valid dan menunggu check-in. | Payment Gateway (callback webhook) | `CHECKED_IN`, `CANCELLED` |
| **CHECKED_IN** | Pendaki sudah check-in di basecamp dan naik gunung. | Admin Basecamp (scan QR) | `CHECKED_OUT` |
| **CHECKED_OUT** | Pendaki sudah turun gunung dan check-out. Booking selesai. | Admin Basecamp (validasi kepulangan) | *(final state)* |
| **CANCELLED** | Booking dibatalkan (by user atau admin atau sistem). | Pendaki, Admin Basecamp, atau Sistem | *(final state)* |
| **EXPIRED** | Booking tidak dibayar dalam waktu yang ditentukan. | Sistem (cron job) | *(final state)* |

---

### Business Rules per Status

#### 1. DRAFT → PENDING_PAYMENT
**Trigger**: Pendaki klik "Bayar Sekarang"

**Validasi**:
- ✅ Data anggota rombongan harus lengkap (sesuai `jumlah_anggota`)
- ✅ NIK semua anggota harus valid (16 digit)
- ✅ Logistik bawaan harus diisi
- ✅ Kuota jalur harus masih tersedia untuk tanggal yang dipilih

**Actions**:
- Generate `booking_code` (unique identifier)
- Generate payment link dari payment gateway
- Set `payment_expired_at` = NOW() + 2 jam
- Kirim email dengan link pembayaran

---

#### 2. PENDING_PAYMENT → CONFIRMED
**Trigger**: Webhook callback dari payment gateway (pembayaran berhasil)

**Validasi**:
- ✅ Payment signature valid
- ✅ Amount sesuai dengan `total_harga`
- ✅ Booking belum expired

**Actions**:
- Update `paid_at` = timestamp pembayaran
- Update `payment_method` = metode yang digunakan (VA, e-wallet, dll)
- Generate E-Ticket dengan QR Code
- Kirim email konfirmasi + E-Ticket PDF
- **Kurangi kuota jalur** untuk tanggal tersebut (soft lock)

---

#### 3. PENDING_PAYMENT → EXPIRED
**Trigger**: Cron job yang berjalan setiap 5 menit

**Kondisi**:
- `status = 'PENDING_PAYMENT'`
- `payment_expired_at < NOW()`

**Actions**:
- Update status ke `EXPIRED`
- **Lepas kuota jalur** yang sempat di-hold
- Kirim email notifikasi (opsional)

---

#### 4. CONFIRMED → CHECKED_IN
**Trigger**: Admin Basecamp scan QR Code E-Ticket pendaki

**Validasi**:
- ✅ QR Code valid dan decode ke `booking_id` yang benar
- ✅ Status booking = `CONFIRMED`
- ✅ Tanggal check-in sesuai dengan `tanggal_pendakian`
- ✅ Identitas fisik anggota cocok dengan data di sistem

**Actions**:
- Update `checked_in_at` = NOW()
- Update `checked_in_by` = `admin_user_id`
- Update `anggota_rombongan.is_present` untuk setiap anggota yang hadir
- Update/koreksi data `logistik_bawaan` jika ada perbedaan fisik
- Kirim notifikasi ke pendaki (SMS/WhatsApp): "Check-in berhasil. Selamat mendaki!"

---

#### 5. CHECKED_IN → CHECKED_OUT
**Trigger**: Admin Basecamp validasi kepulangan pendaki

**Validasi**:
- ✅ Status booking = `CHECKED_IN`
- ✅ Jumlah pendaki yang turun = jumlah yang naik (atau ada laporan SAR)
- ✅ Sampah sudah dicatat (berat, jenis)

**Actions**:
- Update `checked_out_at` = NOW()
- Update `checked_out_by` = `admin_user_id`
- Update `logistik_bawaan` dengan data sampah dan peralatan yang dibawa turun
- Kirim email thank you + request feedback/rating
- **Lepas kuota jalur** secara final (jika ada sistem waitlist, bisa notif pendaki lain)

---

#### 6. Pembatalan (CANCELLED)
**Bisa terjadi dari status**: `DRAFT`, `PENDING_PAYMENT`, `CONFIRMED`

**Trigger**:
- Pendaki membatalkan sendiri (sesuai policy refund)
- Admin membatalkan (force majeure, cuaca buruk)
- Sistem membatalkan (fraud detection)

**Actions**:
- Update `cancelled_at` = NOW()
- Update `cancelled_by` = user_id atau admin_id
- Update `cancellation_reason` = alasan pembatalan
- **Lepas kuota jalur** jika sudah di-lock
- Proses refund (jika ada) sesuai policy:
  - H-7 atau lebih: refund 100%
  - H-3 s/d H-6: refund 50%
  - H-2 atau kurang: tidak ada refund
- Kirim email konfirmasi pembatalan

---

### Query untuk Cek Status

**Cek booking yang bisa di-check-in hari ini**:
```sql
SELECT b.*, u.name as pendaki_name, j.nama_jalur
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN jalur_pendakian j ON b.jalur_id = j.id
WHERE b.status = 'CONFIRMED'
  AND b.tanggal_pendakian = CURDATE()
ORDER BY b.created_at ASC;
```

**Cek booking yang masih di gunung (belum checkout)**:
```sql
SELECT b.*, u.name, j.nama_jalur, 
       TIMESTAMPDIFF(HOUR, b.checked_in_at, NOW()) as hours_since_checkin
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN jalur_pendakian j ON b.jalur_id = j.id
WHERE b.status = 'CHECKED_IN'
ORDER BY b.checked_in_at ASC;
```

**Auto-expire pending payments**:
```sql
UPDATE bookings
SET status = 'EXPIRED'
WHERE status = 'PENDING_PAYMENT'
  AND payment_expired_at < NOW();
```

---

## 🗂️ Pemetaan Tabel Database

Sistem ini menggunakan **6 tabel utama** dengan relasi yang jelas untuk mendukung arsitektur SaaS multi-tenant.

### Diagram Relasi Tabel

```
┌─────────────────────┐
│      users          │
│  ─────────────────  │
│  id (PK)            │
│  email              │
│  role ◄─────────────┼──── ENUM: super_admin, admin_basecamp, pendaki
│  basecamp_id (FK)   │      - super_admin: null
│  name               │      - admin_basecamp: wajib diisi
│  password_hash      │      - pendaki: null
└──────┬──────────────┘
       │ 1
       │
       │ N
       ▼
┌─────────────────────┐         ┌─────────────────────┐
│    basecamps        │         │  jalur_pendakian    │
│  ─────────────────  │ 1     N │  ─────────────────  │
│  id (PK)            ├─────────┤  id (PK)            │
│  nama               │         │  basecamp_id (FK)   │
│  alamat             │         │  nama_jalur         │
│  kontak             │         │  kuota_harian       │
│  status             │         │  harga              │
└─────────────────────┘         │  status             │
                                └──────┬──────────────┘
                                       │ 1
                                       │
                                       │ N
                                       ▼
                                ┌─────────────────────┐
                                │     bookings        │
                                │  ─────────────────  │
                                │  id (PK)            │
                                │  booking_code       │
                                │  user_id (FK)       │───┐
                                │  jalur_id (FK)      │   │
                                │  tanggal_pendakian  │   │
                                │  jumlah_anggota     │   │
                                │  total_harga        │   │
                                │  status             │   │
                                │  paid_at            │   │
                                │  checked_in_at      │   │
                                │  checked_out_at     │   │
                                └──────┬──────────────┘   │
                                       │ 1                │
                          ┌────────────┼──────────────┐   │
                          │            │              │   │
                        N │          N │              │ 1 │
                          ▼            ▼              │   │
                ┌──────────────────┐  ┌──────────────▼───▼───┐
                │ anggota_rombongan│  │  logistik_bawaan     │
                │ ──────────────── │  │  ─────────────────── │
                │ id (PK)          │  │  id (PK)             │
                │ booking_id (FK)  │  │  booking_id (FK)     │
                │ nama_lengkap     │  │  tenda               │
                │ nik              │  │  carrier             │
                │ no_telepon       │  │  sleeping_bag        │
                │ alamat           │  │  kompor_gas          │
                │ status_anggota   │  │  berat_makanan_kg    │
                │ is_present       │  │  sampah_dibawa_turun │
                └──────────────────┘  │  berat_sampah_kg     │
                                      │  catatan             │
                                      └──────────────────────┘
```

---

### Deskripsi Tabel

#### 1. `users`
**Deskripsi**: Menyimpan data pengguna sistem (Super Admin, Admin Basecamp, Pendaki).

**Kolom Utama**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin_basecamp', 'pendaki')),
  basecamp_id UUID REFERENCES basecamps(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Relasi**:
- `basecamp_id` → `basecamps.id` (NULL untuk super_admin dan pendaki)
- **1 user bisa punya banyak bookings** (sebagai pendaki)

**Business Logic**:
- Super Admin: `role = 'super_admin'`, `basecamp_id = NULL`
- Admin Basecamp: `role = 'admin_basecamp'`, `basecamp_id` wajib diisi
- Pendaki: `role = 'pendaki'`, `basecamp_id = NULL`

---

#### 2. `basecamps`
**Deskripsi**: Data profil basecamp (tenant dalam arsitektur SaaS).

**Kolom Utama**:
```sql
CREATE TABLE basecamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  alamat TEXT NOT NULL,
  kontak_person VARCHAR(255),
  email VARCHAR(255),
  telepon VARCHAR(50),
  deskripsi TEXT,
  fasilitas JSONB,
  foto_url TEXT,
  status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Relasi**:
- **1 basecamp bisa punya banyak jalur** (`jalur_pendakian`)
- **1 basecamp bisa punya banyak admin** (`users`)

**Multi-Tenant Isolation**:
- Admin Basecamp hanya bisa akses data dengan `basecamp_id` mereka sendiri
- Query wajib filter: `WHERE basecamp_id = current_user_basecamp_id`

---

#### 3. `jalur_pendakian`
**Deskripsi**: Jalur pendakian yang tersedia di setiap basecamp.

**Kolom Utama**:
```sql
CREATE TABLE jalur_pendakian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  basecamp_id UUID NOT NULL REFERENCES basecamps(id) ON DELETE CASCADE,
  nama_jalur VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  tingkat_kesulitan VARCHAR(50) CHECK (tingkat_kesulitan IN ('MUDAH', 'SEDANG', 'SULIT')),
  estimasi_waktu_jam INT,
  kuota_harian INT NOT NULL CHECK (kuota_harian > 0),
  harga DECIMAL(10, 2) NOT NULL CHECK (harga >= 0),
  status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Relasi**:
- `basecamp_id` → `basecamps.id`
- **1 jalur bisa punya banyak bookings**

**Business Logic**:
- Kuota harian per jalur per tanggal dihitung dinamis:
  ```sql
  SELECT kuota_harian - (
    SELECT COALESCE(SUM(jumlah_anggota), 0)
    FROM bookings
    WHERE jalur_id = ? 
      AND tanggal_pendakian = ?
      AND status IN ('CONFIRMED', 'CHECKED_IN')
  ) AS kuota_tersisa;
  ```

---

#### 4. `bookings`
**Deskripsi**: Transaksi utama booking pendakian.

**Kolom Utama**:
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jalur_id UUID NOT NULL REFERENCES jalur_pendakian(id) ON DELETE RESTRICT,
  tanggal_pendakian DATE NOT NULL,
  jumlah_anggota INT NOT NULL CHECK (jumlah_anggota > 0),
  total_harga DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 
    'CHECKED_OUT', 'CANCELLED', 'EXPIRED'
  )),
  payment_method VARCHAR(50),
  paid_at TIMESTAMP,
  payment_expired_at TIMESTAMP,
  checked_in_at TIMESTAMP,
  checked_in_by UUID REFERENCES users(id),
  checked_out_at TIMESTAMP,
  checked_out_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMP,
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Relasi**:
- `user_id` → `users.id` (pendaki)
- `jalur_id` → `jalur_pendakian.id`
- **1 booking punya banyak anggota** (`anggota_rombongan`)
- **1 booking punya 1 logistik** (`logistik_bawaan`)

**Indexes**:
```sql
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_tanggal ON bookings(tanggal_pendakian);
CREATE INDEX idx_bookings_jalur_tanggal ON bookings(jalur_id, tanggal_pendakian);
```

---

#### 5. `anggota_rombongan`
**Deskripsi**: Data identitas setiap anggota dalam rombongan pendaki.

**Kolom Utama**:
```sql
CREATE TABLE anggota_rombongan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  nama_lengkap VARCHAR(255) NOT NULL,
  nik VARCHAR(16) NOT NULL CHECK (LENGTH(nik) = 16),
  no_telepon VARCHAR(20) NOT NULL,
  alamat TEXT NOT NULL,
  status_anggota VARCHAR(50) DEFAULT 'ANGGOTA' CHECK (status_anggota IN ('KETUA', 'ANGGOTA')),
  is_present BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Relasi**:
- `booking_id` → `bookings.id`

**Business Logic**:
- Jumlah row dengan `booking_id` yang sama harus = `bookings.jumlah_anggota`
- NIK harus unik per booking (tidak boleh duplikat dalam 1 rombongan)
- `is_present` diupdate saat check-in fisik

---

#### 6. `logistik_bawaan`
**Deskripsi**: Pencatatan barang bawaan dan sampah untuk SOP keselamatan dan lingkungan.

**Kolom Utama**:
```sql
CREATE TABLE logistik_bawaan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  tenda INT DEFAULT 0,
  carrier INT DEFAULT 0,
  sleeping_bag INT DEFAULT 0,
  kompor_gas INT DEFAULT 0,
  berat_makanan_kg DECIMAL(5, 2) DEFAULT 0,
  catatan_naik TEXT,
  sampah_dibawa_turun BOOLEAN DEFAULT false,
  berat_sampah_kg DECIMAL(5, 2),
  catatan_checkout TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Relasi**:
- `booking_id` → `bookings.id` (1-to-1 relationship)

**Business Logic**:
- Diisi saat pendaki mengisi form booking
- Diupdate/koreksi saat check-in fisik
- Divalidasi dan dicatat saat check-out

---

### Query Pattern untuk Multi-Tenant

**Admin Basecamp hanya bisa lihat booking basecamp mereka**:
```sql
SELECT b.*, j.nama_jalur, u.name as pendaki_name
FROM bookings b
JOIN jalur_pendakian j ON b.jalur_id = j.id
JOIN users u ON b.user_id = u.id
WHERE j.basecamp_id = (
  SELECT basecamp_id FROM users WHERE id = current_admin_id
)
ORDER BY b.created_at DESC;
```

**Super Admin bisa lihat semua booking dari semua basecamp**:
```sql
SELECT b.*, j.nama_jalur, bc.nama as nama_basecamp, u.name as pendaki_name
FROM bookings b
JOIN jalur_pendakian j ON b.jalur_id = j.id
JOIN basecamps bc ON j.basecamp_id = bc.id
JOIN users u ON b.user_id = u.id
ORDER BY b.created_at DESC;
```

---

## 📝 Kesimpulan

Workflow sistem booking pendakian Gunung Prau ini dirancang untuk:

1. **Multi-Tenant SaaS**: Isolasi data antar basecamp dengan `basecamp_id`
2. **State Machine yang Jelas**: Transisi status booking yang terstruktur dan traceable
3. **SOP Keselamatan**: Pencatatan identitas, logistik, dan validasi fisik di setiap tahap
4. **Audit Trail**: Tracking siapa melakukan apa dan kapan (`checked_in_by`, `checked_out_by`, timestamps)
5. **Scalability**: Arsitektur database relasional yang mendukung pertumbuhan jumlah basecamp dan transaksi

**Best Practices yang Diterapkan**:
- ✅ Foreign key constraints untuk data integrity
- ✅ Soft deletes melalui status (bukan hard delete)
- ✅ Timestamps untuk audit trail
- ✅ Enum/Check constraints untuk validasi data
- ✅ Indexes pada kolom yang sering di-query
- ✅ Row Level Security (RLS) di Supabase untuk tenant isolation

---

**Dibuat untuk**: Sistem Booking Online Pendakian Gunung Prau  
**Arsitektur**: SaaS Multi-Tenant (PostgreSQL/Supabase)  
**Target User**: Super Admin, Admin Basecamp, Pendaki  
**Versi**: 1.0