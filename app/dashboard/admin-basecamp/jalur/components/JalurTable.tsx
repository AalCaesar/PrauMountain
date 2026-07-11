'use client';

import { useState } from 'react';
import { Edit2, Power, Loader2, Clock, Users, DollarSign } from 'lucide-react';
import { toggleJalurStatus } from '../actions';

interface JalurTableProps {
  jalurData: any[];
  onEdit: (jalur: any) => void;
}

export default function JalurTable({ jalurData, onEdit }: JalurTableProps) {
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);

  const handleToggleStatus = async (jalurId: string, currentStatus: boolean) => {
    setToggleLoadingId(jalurId);
    try {
      const result = await toggleJalurStatus(jalurId, currentStatus);
      if (result.success) {
        // Success - revalidation will update the UI
      } else {
        alert(`Gagal mengubah status: ${result.error}`);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Terjadi kesalahan saat mengubah status');
    } finally {
      setToggleLoadingId(null);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      mudah: 'bg-emerald-100 text-emerald-700',
      sedang: 'bg-blue-100 text-blue-700',
      sulit: 'bg-amber-100 text-amber-700',
      ekstrem: 'bg-red-100 text-red-700',
    };
    return badges[difficulty as keyof typeof badges] || 'bg-slate-100 text-slate-700';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (jalurData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Belum Ada Jalur Pendakian
          </h3>
          <p className="text-gray-600 mb-4">
            Tambahkan jalur pendakian pertama Anda dengan klik tombol "Tambah Jalur" di atas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Nama Jalur
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Tingkat Kesulitan
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Harga
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Kuota Harian
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {jalurData.map((jalur) => (
              <tr key={jalur.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {jalur.nama_jalur}
                  </div>
                  {jalur.deskripsi && (
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {jalur.deskripsi}
                    </div>
                  )}
                  {jalur.estimasi_waktu && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      {jalur.estimasi_waktu}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadge(
                      jalur.tingkat_kesulitan
                    )}`}
                  >
                    {jalur.tingkat_kesulitan.charAt(0).toUpperCase() +
                      jalur.tingkat_kesulitan.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    {formatPrice(jalur.harga_per_orang)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <Users className="h-4 w-4 text-gray-400" />
                    {jalur.kuota_per_hari} orang/hari
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleStatus(jalur.id, jalur.is_active)}
                    disabled={toggleLoadingId === jalur.id}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      jalur.is_active
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {toggleLoadingId === jalur.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Power className="h-3 w-3 mr-1" />
                    )}
                    {jalur.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(jalur)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition-all"
                    title="Edit Jalur"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
