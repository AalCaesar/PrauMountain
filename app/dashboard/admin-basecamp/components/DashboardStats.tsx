'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Wallet, Users, Clock, TrendingUp } from 'lucide-react';

interface ChartData {
  name: string;
  pendapatan: number;
  pendaki: number;
}

interface DashboardStatsProps {
  stats: {
    totalPendapatanBulanIni: number;
    totalPendakiBulanIni: number;
    totalPendingPayment: number;
    chartData: ChartData[];
  } | null;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center">
        <p className="text-gray-500">Data statistik tidak tersedia. Pastikan basecamp Anda telah diatur.</p>
      </div>
    );
  }

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-emerald-600 text-sm font-medium">
              Pendapatan: {formatRupiah(payload[0].value)}
            </p>
            <p className="text-blue-600 text-sm font-medium">
              Pendaki: {payload[1].value} orang
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-6 -top-6 bg-emerald-50 rounded-full w-24 h-24 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Pendapatan (Bulan Ini)</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatRupiah(stats.totalPendapatanBulanIni)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-1.5 text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-emerald-600 font-medium">Data Real-time</span>
          </div>
        </div>

        {/* Climbers Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-6 -top-6 bg-blue-50 rounded-full w-24 h-24 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Pendaki (Bulan Ini)</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.totalPendakiBulanIni} <span className="text-base font-normal text-gray-500">orang</span>
              </h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-1.5 text-sm">
            <span className="text-blue-600 font-medium">Bulan berjalan</span>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-6 -top-6 bg-amber-50 rounded-full w-24 h-24 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Menunggu Pembayaran</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.totalPendingPayment} <span className="text-base font-normal text-gray-500">booking</span>
              </h3>
            </div>
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-1.5 text-sm">
            <span className="text-amber-600 font-medium">Perlu dikonfirmasi</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Statistik Pendapatan & Pendaki</h3>
          <p className="text-sm text-gray-500 mt-1">Pergerakan data 6 bulan terakhir</p>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.chartData}
              margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => `Rp ${value / 1000000}M`}
                dx={-10}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                dx={10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
              <Bar 
                yAxisId="left" 
                dataKey="pendapatan" 
                name="Pendapatan" 
                fill="#059669" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
              />
              <Bar 
                yAxisId="right" 
                dataKey="pendaki" 
                name="Pendaki" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
