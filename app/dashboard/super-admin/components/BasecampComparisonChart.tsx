'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BasecampPerformance } from '../actions';
import { TrendingUp } from 'lucide-react';

interface BasecampComparisonChartProps {
  data: BasecampPerformance[];
}

export default function BasecampComparisonChart({ data }: BasecampComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-center h-[400px]">
        <p className="text-slate-500">Belum ada data transaksi basecamp.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-50 rounded-xl">
          <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Perbandingan Kinerja Basecamp</h2>
          <p className="text-sm text-slate-500">Kompetisi volume transaksi dan jumlah pengunjung</p>
        </div>
      </div>

      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barSize={32}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend 
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Bar dataKey="transaksi" name="Total Transaksi" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pengunjung" name="Total Pengunjung" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
