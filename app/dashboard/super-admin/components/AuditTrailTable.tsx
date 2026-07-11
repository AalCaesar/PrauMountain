'use client';

import { Activity, Clock } from 'lucide-react';

const DUMMY_AUDIT_LOGS = [
  { id: 1, waktu: '2023-11-20 14:32:00', aksi: 'Booking Dibatalkan (Expired)', pelaku: 'Sistem Cron', basecamp: 'Dieng' },
  { id: 2, waktu: '2023-11-20 13:15:22', aksi: 'Mengubah Status Pembayaran (Manual)', pelaku: 'Admin Basecamp A', basecamp: 'Patak Banteng' },
  { id: 3, waktu: '2023-11-20 10:05:10', aksi: 'Menambahkan Fasilitas Baru', pelaku: 'Super Admin', basecamp: 'Kalilembu' },
  { id: 4, waktu: '2023-11-19 19:40:05', aksi: 'Menutup Jalur Sementara (Cuaca Buruk)', pelaku: 'Admin Basecamp C', basecamp: 'Wates' },
  { id: 5, waktu: '2023-11-19 08:22:12', aksi: 'Mendaftarkan Admin Baru', pelaku: 'Super Admin', basecamp: 'Semua' },
];

export default function AuditTrailTable() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Aktivitas Terkini (Audit Trail)</h2>
            <p className="text-sm text-slate-500">Pantau pergerakan data sistem secara real-time</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold">Waktu</th>
              <th className="px-6 py-4 font-semibold">Aksi</th>
              <th className="px-6 py-4 font-semibold">Pelaku</th>
              <th className="px-6 py-4 font-semibold">Basecamp Terkait</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {DUMMY_AUDIT_LOGS.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    {log.waktu}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-700">{log.aksi}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    log.pelaku === 'Sistem Cron' ? 'bg-slate-100 text-slate-700' : 
                    log.pelaku === 'Super Admin' ? 'bg-purple-100 text-purple-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {log.pelaku}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{log.basecamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
