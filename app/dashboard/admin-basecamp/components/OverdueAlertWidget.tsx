'use client';

import { AlertTriangle, Copy, Phone, CalendarX2 } from 'lucide-react';
import { OverdueHiker } from '@/app/actions/emergency';
import { useState } from 'react';

export default function OverdueAlertWidget({ overdueHikers }: { overdueHikers: OverdueHiker[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!overdueHikers || overdueHikers.length === 0) {
    return null;
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  };

  return (
    <div className="bg-rose-50 border border-rose-500 rounded-2xl shadow-sm overflow-hidden mb-6">
      {/* Header Alert */}
      <div className="bg-rose-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <AlertTriangle className="h-6 w-6 animate-pulse" />
          <h2 className="text-lg font-bold">
            URGENT: {overdueHikers.length} Rombongan Melewati Batas Waktu Turun!
          </h2>
        </div>
      </div>

      {/* Content / Table */}
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-rose-100/50 text-rose-800 font-bold border-b border-rose-200">
            <tr>
              <th className="px-6 py-4">Kode Booking & Jalur</th>
              <th className="px-6 py-4">Ketua Rombongan</th>
              <th className="px-6 py-4">Seharusnya Turun</th>
              <th className="px-6 py-4 text-right">Aksi Darurat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-100">
            {overdueHikers.map((hiker) => (
              <tr key={hiker.id} className="hover:bg-rose-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-rose-900">{hiker.kode_booking}</div>
                  <div className="text-rose-700 text-xs mt-0.5 font-medium">{hiker.nama_jalur}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-rose-900">{hiker.ketua_nama}</div>
                  <div className="text-rose-700 text-xs mt-0.5">
                    HP: {hiker.telepon_ketua} <br />
                    Darurat: {hiker.kontak_darurat}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-rose-800 font-semibold">
                    <CalendarX2 className="h-4 w-4 text-rose-500" />
                    {formatDate(hiker.tanggal_turun)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleCopy(hiker.telepon_ketua, `hp-${hiker.id}`)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors text-xs font-bold shadow-sm"
                      title="Copy Nomor Ketua"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedId === `hp-${hiker.id}` ? 'Disalin!' : 'Copy HP'}
                    </button>
                    
                    <a
                      href={`https://wa.me/${hiker.kontak_darurat.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-xs font-bold shadow-sm"
                      title="Hubungi Kontak Darurat via WhatsApp"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      WA Darurat
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
