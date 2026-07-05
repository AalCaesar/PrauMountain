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
  tingkat_kesulitan: 'mudah' | 'sedang' | 'sulit';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
