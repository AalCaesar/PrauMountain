'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ComplianceStats } from '@/app/actions/kpi';
import { ShieldCheck, PackageCheck } from 'lucide-react';

interface SopComplianceChartProps {
  data: ComplianceStats | null;
}

export default function SopComplianceChart({ data }: SopComplianceChartProps) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Statistik Kepatuhan SOP & KPI Lingkungan</h2>
        <p className="text-sm text-slate-500 mt-1">Pantau tingkat kepatuhan pendaki terhadap aturan basecamp</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* KPI Sampah */}
        <div className="flex flex-col items-center p-4 bg-slate-50/50 rounded-xl border border-slate-50">
          <div className="flex items-center gap-2 mb-4 w-full">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-700">Kepatuhan Turun Bawa Sampah</h3>
              <p className="text-xs text-slate-500">Dari total {data.totalSampahBookings} rombongan (CHECKED_OUT)</p>
            </div>
          </div>
          
          <div className="w-full h-[250px]">
            {data.totalSampahBookings > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sampahData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.sampahData.map((entry, index) => (
                      <Cell key={`cell-sampah-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} Rombongan`, 'Jumlah']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                Belum ada data checkout
              </div>
            )}
          </div>
        </div>

        {/* KPI Logistik */}
        <div className="flex flex-col items-center p-4 bg-slate-50/50 rounded-xl border border-slate-50">
          <div className="flex items-center gap-2 mb-4 w-full">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PackageCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-700">Pengecekan Logistik Wajib</h3>
              <p className="text-xs text-slate-500">Dari total {data.totalLogistikItems} item bawaan</p>
            </div>
          </div>

          <div className="w-full h-[250px]">
            {data.totalLogistikItems > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.logistikData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.logistikData.map((entry, index) => (
                      <Cell key={`cell-logistik-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} Item`, 'Jumlah']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                Belum ada data logistik
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
