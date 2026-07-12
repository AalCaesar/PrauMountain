'use server';

import { createClient } from '@/utils/supabase/server';

export interface ComplianceStats {
  sampahData: { name: string; value: number; fill: string }[];
  logistikData: { name: string; value: number; fill: string }[];
  totalSampahBookings: number;
  totalLogistikItems: number;
}

export async function getComplianceStats(basecamp_id: string): Promise<ComplianceStats | null> {
  try {
    const supabase = await createClient();

    // 1. KPI Sampah (Berdasarkan booking yang CHECKED_OUT)
    const { data: bookingsSampah, error: errorSampah } = await supabase
      .from('bookings')
      .select(`
        id,
        jalur_pendakian!inner(basecamp_id),
        laporan_sampah(id)
      `)
      .eq('status_booking', 'CHECKED_OUT')
      .eq('jalur_pendakian.basecamp_id', basecamp_id);

    if (errorSampah) {
      console.error('Error fetching data sampah KPI:', errorSampah);
      return null;
    }

    let patuhSampah = 0;
    let pelanggaranSampah = 0;

    console.log("Debug Data Sampah:", bookingsSampah);

    if (bookingsSampah) {
      bookingsSampah.forEach((b: any) => {
        if (b.laporan_sampah && Array.isArray(b.laporan_sampah) && b.laporan_sampah.length > 0) {
          patuhSampah++;
        } else if (b.laporan_sampah && !Array.isArray(b.laporan_sampah) && Object.keys(b.laporan_sampah).length > 0) {
          patuhSampah++;
        } else {
          pelanggaranSampah++;
        }
      });
    }

    // 2. KPI Logistik (Total item logistik bawaan untuk basecamp ini)
    const { data: logistik, error: errorLogistik } = await supabase
      .from('logistik_bawaan')
      .select(`
        status_pengecekan,
        bookings!inner(jalur_pendakian!inner(basecamp_id))
      `)
      .eq('bookings.jalur_pendakian.basecamp_id', basecamp_id);

    if (errorLogistik) {
      console.error('Error fetching data logistik KPI:', errorLogistik);
      return null;
    }

    let lolosLogistik = 0;
    let bermasalahLogistik = 0;

    if (logistik) {
      logistik.forEach((l: any) => {
        if (l.status_pengecekan === true) {
          lolosLogistik++;
        } else {
          bermasalahLogistik++;
        }
      });
    }

    return {
      sampahData: [
        { name: 'Patuh Bawa Sampah', value: patuhSampah, fill: '#10b981' }, // Emerald-500
        { name: 'Tanpa Laporan (Pelanggaran)', value: pelanggaranSampah, fill: '#f43f5e' }, // Rose-500
      ],
      logistikData: [
        { name: 'Sesuai SOP', value: lolosLogistik, fill: '#3b82f6' }, // Blue-500
        { name: 'Bermasalah / Tertinggal', value: bermasalahLogistik, fill: '#f59e0b' }, // Amber-500
      ],
      totalSampahBookings: patuhSampah + pelanggaranSampah,
      totalLogistikItems: lolosLogistik + bermasalahLogistik,
    };
  } catch (error) {
    console.error('Unexpected error in getComplianceStats:', error);
    return null;
  }
}
