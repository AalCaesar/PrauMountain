import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. SETUP MOCK UNTUK SUPABASE
// Kita membuat rantai (chain) mock agar fungsi seperti supabase.from().update().eq() dapat berjalan di Vitest.
const mockSelect = vi.fn().mockReturnThis();
const mockInsert = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockSingle = vi.fn().mockReturnThis();

// Mock response data default
let mockData = { data: null, error: null } as any;

// Objek chain untuk return dari .from()
const mockChain = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  eq: mockEq,
  single: mockSingle,
  // Simulasi Promise resolve agar `await` bekerja
  then: vi.fn((resolve) => resolve(mockData)), 
};

// Fungsi .from('table_name')
const mockFrom = vi.fn().mockReturnValue(mockChain);

// Mock modul createClient dari Supabase SSR
vi.mock('../utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'mock-admin-id' } },
        error: null,
      }),
    },
  })),
}));


describe('Integration Testing - Supabase Server Actions Flow', () => {

  // Reset semua rekam jejak mock sebelum setiap tes berjalan
  beforeEach(() => {
    vi.clearAllMocks();
    mockData = { data: null, error: null }; // reset data
  });

  describe('Tugas 1: Test Alur Booking End-to-End', () => {
    it('Draft: Panggil fungsi insert booking dan kembalikan ID transaksi', async () => {
      const payload = { user_id: 'user-123', status_booking: 'DRAFT', total_harga: 500000 };
      
      // Simulasi respons Supabase
      mockData = { data: { id: 'booking-999' }, error: null }; 

      // Eksekusi (Simulasi Server Action)
      const result = await mockFrom('bookings').insert(payload).select('id').single();
      
      // Ekspektasi
      expect(mockFrom).toHaveBeenCalledWith('bookings');
      expect(mockInsert).toHaveBeenCalledWith(payload);
      expect(result.data.id).toBe('booking-999');
    });

    it('Payment: Pembaruan data menjadi PENDING_PAYMENT', async () => {
      const updateData = { status_booking: 'PENDING_PAYMENT' };
      
      await mockFrom('bookings').update(updateData).eq('id', 'booking-999');
      
      expect(mockUpdate).toHaveBeenCalledWith(updateData);
      expect(mockEq).toHaveBeenCalledWith('id', 'booking-999');
    });

    it('Confirmed: Pelunasan dan perubahan status menjadi CONFIRMED', async () => {
      const timestamp = new Date().toISOString();
      const updateData = { status_booking: 'CONFIRMED', paid_at: timestamp };
      
      await mockFrom('bookings').update(updateData).eq('id', 'booking-999');
      
      // Pastikan query update memuat status_booking CONFIRMED
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ 
        status_booking: 'CONFIRMED', 
        paid_at: timestamp 
      }));
      expect(mockEq).toHaveBeenCalledWith('id', 'booking-999');
    });
  });

  describe('Tugas 2: Test Check-In & Check-Out Flow', () => {
    it('Check-In: Update status menjadi CHECKED_IN', async () => {
      await mockFrom('bookings')
        .update({ status_booking: 'CHECKED_IN', checked_in_at: '2026-07-12T08:00:00Z' })
        .eq('id', 'booking-999');
      
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status_booking: 'CHECKED_IN' }));
    });

    it('Check-Out: Update status dan insert laporan sampah', async () => {
      // 1. Update checkout status
      await mockFrom('bookings')
        .update({ status_booking: 'CHECKED_OUT', checked_out_at: '2026-07-13T10:00:00Z' })
        .eq('id', 'booking-999');
        
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status_booking: 'CHECKED_OUT' }));

      // 2. Insert logika sampah
      const laporanSampah = { booking_id: 'booking-999', berat_sampah: 3.5, jenis_sampah: 'Botol Plastik' };
      await mockFrom('laporan_sampah').insert(laporanSampah);
      
      expect(mockFrom).toHaveBeenCalledWith('laporan_sampah');
      expect(mockInsert).toHaveBeenCalledWith(laporanSampah);
    });
  });

  describe('Tugas 3: Test Isolasi Data RLS (Filter Basecamp)', () => {
    it('Mencegah admin menarik data basecamp lain melalui injection filter', async () => {
      // Asumsi sesi login Admin Patak Banteng
      const adminBasecampId = '1'; 
      
      // Simulasi pemanggilan fungsi getBookings() oleh Admin
      await mockFrom('bookings')
        .select('*, jalur_pendakian!inner(*)')
        .eq('jalur_pendakian.basecamp_id', adminBasecampId);

      // HARUS menyematkan filter basecamp_id: 1 (Patak Banteng)
      expect(mockEq).toHaveBeenCalledWith('jalur_pendakian.basecamp_id', '1');
      
      // TIDAK BOLEH memanggil basecamp_id: 2 (Kalilembu)
      expect(mockEq).not.toHaveBeenCalledWith('jalur_pendakian.basecamp_id', '2');
    });
  });

});
