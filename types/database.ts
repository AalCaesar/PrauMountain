export interface Basecamp {
  id: string;
  nama_gunung: string;
  nama_basecamp: string;
  lokasi: string;
  status_buka: boolean;
  admin_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  nama_lengkap: string | null;
  role: 'super_admin' | 'admin_basecamp' | 'pendaki';
  created_at: string;
  updated_at: string;
}

export interface JalurPendakian {
  id: string;
  basecamp_id: string;
  nama_jalur: string;
  deskripsi: string | null;
  kuota_per_hari: number;
  harga_per_orang: number;
  tingkat_kesulitan: 'mudah' | 'sedang' | 'sulit' | 'ekstrem';
  estimasi_waktu: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  user_id: string;
  jalur_id: string;
  tanggal_pendakian: string;
  jumlah_anggota: number;
  total_harga: number;
  status: 'DRAFT' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'EXPIRED';
  payment_method: string | null;
  paid_at: string | null;
  payment_expired_at: string | null;
  checked_in_at: string | null;
  checked_in_by: string | null;
  checked_out_at: string | null;
  checked_out_by: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithRelations extends Booking {
  jalur_pendakian: {
    nama_jalur: string;
    basecamp_id: string;
  };
  users: {
    nama_lengkap: string | null;
    email: string;
  };
}
