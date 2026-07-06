'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import JalurTable from './JalurTable';
import JalurFormModal from './JalurFormModal';

interface JalurManagerProps {
  basecampId: string;
  jalurData: any[];
}

interface JalurFormData {
  id?: string;
  nama_jalur: string;
  deskripsi: string;
  tingkat_kesulitan: 'mudah' | 'sedang' | 'sulit' | 'ekstrem';
  estimasi_waktu?: string;
  harga_per_orang: number;
  kuota_per_hari: number;
}

export default function JalurManager({ basecampId, jalurData }: JalurManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJalur, setEditingJalur] = useState<JalurFormData | null>(null);

  const handleAdd = () => {
    setEditingJalur(null);
    setIsModalOpen(true);
  };

  const handleEdit = (jalur: any) => {
    setEditingJalur({
      id: jalur.id,
      nama_jalur: jalur.nama_jalur,
      deskripsi: jalur.deskripsi || '',
      tingkat_kesulitan: jalur.tingkat_kesulitan,
      estimasi_waktu: jalur.estimasi_waktu || '',
      harga_per_orang: jalur.harga_per_orang,
      kuota_per_hari: jalur.kuota_per_hari,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJalur(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            Total {jalurData.length} jalur pendakian terdaftar
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Jalur
        </button>
      </div>

      <JalurTable jalurData={jalurData} onEdit={handleEdit} />

      <JalurFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        basecampId={basecampId}
        editingJalur={editingJalur}
      />
    </div>
  );
}
