'use client';

import { Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface DailyStat {
  date: string;
  totalTerdaftar: number;
  sisaKuota: number;
  kuota_per_hari: number;
  status: 'safe' | 'warning' | 'full';
}

interface TrailStat {
  jalurId: string;
  namaJalur: string;
  dailyStats: DailyStat[];
}

interface QuotaCapacityProps {
  statsData: {
    next7Days: string[];
    stats: TrailStat[];
  } | null;
}

export default function QuotaCapacity({ statsData }: QuotaCapacityProps) {
  if (!statsData || statsData.stats.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 mt-6">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          Kapasitas Kuota (7 Hari Kedepan)
        </h2>
        <p className="text-sm text-slate-500 mt-1">Pantau ketersediaan kuota pendakian secara real-time</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">Jalur Pendakian</th>
              {statsData.next7Days.map((date) => (
                <th key={date} className="px-4 py-4 text-center whitespace-nowrap">
                  {formatDate(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {statsData.stats.map((trail) => (
              <tr key={trail.jalurId} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                  {trail.namaJalur}
                </td>
                {trail.dailyStats.map((stat, idx) => (
                  <td key={idx} className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      {stat.status === 'safe' && (
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                          {stat.sisaKuota} sisa
                        </div>
                      )}
                      {stat.status === 'warning' && (
                        <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                          {stat.sisaKuota} sisa
                        </div>
                      )}
                      {stat.status === 'full' && (
                        <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                          Penuh
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium">
                        {stat.totalTerdaftar}/{stat.kuota_per_hari} terisi
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span className="font-medium">Aman (&gt;30% sisa)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="font-medium">Mau Penuh (≤30% sisa)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="font-medium">Penuh (0 sisa)</span>
        </div>
      </div>
    </div>
  );
}
