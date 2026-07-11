'use client';

import { useState } from 'react';
import { Basecamp } from '@/types/database';
import {
  Search,
  Filter,
  Edit2,
  Power,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import AddBasecampModal from './AddBasecampModal';
import EditBasecampModal from './EditBasecampModal';
import AssignAdminModal from './AssignAdminModal';
import { toggleBasecampStatus } from '../actions';

interface BasecampTableProps {
  basecamps: Basecamp[];
  admins: { id: string; nama_lengkap: string | null; email: string }[];
}

export default function BasecampTable({ basecamps, admins }: BasecampTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBasecampForEdit, setSelectedBasecampForEdit] = useState<Basecamp | null>(null);
  const [selectedBasecampForAssign, setSelectedBasecampForAssign] = useState<Basecamp | null>(null);
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const filteredBasecamps = basecamps.filter((basecamp) => {
    const matchesSearch =
      basecamp.nama_basecamp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      basecamp.nama_gunung.toLowerCase().includes(searchQuery.toLowerCase()) ||
      basecamp.lokasi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && basecamp.status_buka) ||
      (statusFilter === 'inactive' && !basecamp.status_buka);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBasecamps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBasecamps = filteredBasecamps.slice(startIndex, endIndex);

  const handleToggleStatus = async (basecampId: string, currentStatus: boolean) => {
    setToggleLoadingId(basecampId);
    try {
      const result = await toggleBasecampStatus(basecampId, currentStatus);
      if (result.success) {
        alert(`Status basecamp berhasil diubah menjadi ${!currentStatus ? 'Aktif' : 'Nonaktif'}!`);
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

  const handleEdit = (basecamp: Basecamp) => {
    setSelectedBasecampForEdit(basecamp);
  };

  const handleManageAdmin = (basecamp: Basecamp) => {
    setSelectedBasecampForAssign(basecamp);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari basecamp atau gunung..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                setCurrentPage(1);
              }}
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Basecamp</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Basecamp
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Gunung
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
            {currentBasecamps.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Tidak ada basecamp yang sesuai dengan filter.'
                    : 'Belum ada basecamp terdaftar.'}
                </td>
              </tr>
            ) : (
              currentBasecamps.map((basecamp) => (
                <tr key={basecamp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {basecamp.nama_basecamp}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{basecamp.nama_gunung}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {basecamp.lokasi}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {basecamp.admin_id ? (
                        <span className="text-emerald-600">Assigned</span>
                      ) : (
                        <span className="text-gray-400">Belum ada</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        basecamp.status_buka
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {basecamp.status_buka ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(basecamp.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(basecamp)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-all"
                        title="Edit"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(basecamp.id, basecamp.status_buka)}
                        disabled={toggleLoadingId === basecamp.id}
                        className={`p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          basecamp.status_buka
                            ? 'hover:text-red-600'
                            : 'hover:text-emerald-600'
                        }`}
                        title={basecamp.status_buka ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        <Power className={`h-5 w-5 ${toggleLoadingId === basecamp.id ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleManageAdmin(basecamp)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-purple-600 transition-all"
                        title="Kelola Admin"
                      >
                        <UserPlus className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredBasecamps.length)} dari{' '}
            {filteredBasecamps.length} basecamp
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <AddBasecampModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditBasecampModal
        isOpen={!!selectedBasecampForEdit}
        onClose={() => setSelectedBasecampForEdit(null)}
        basecamp={selectedBasecampForEdit}
      />

      <AssignAdminModal
        isOpen={!!selectedBasecampForAssign}
        onClose={() => setSelectedBasecampForAssign(null)}
        basecamp={selectedBasecampForAssign}
        admins={admins}
      />
    </div>
  );
}
