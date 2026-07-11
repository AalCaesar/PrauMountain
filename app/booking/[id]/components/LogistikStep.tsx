'use client';

import { Plus, Minus, Tent, Backpack, Moon, Bed, Flame, Trash2, Heart } from 'lucide-react';

interface LogistikState {
  tenda: number;
  carrier: number;
  sleepingBag: number;
  matras: number;
  kompor: number;
  kantongSampah: number;
  p3k: number;
}

interface LogistikStepProps {
  logistics: LogistikState;
  onChange: (logistics: LogistikState) => void;
  onNext: () => void;
  onBack: () => void;
}

interface LogistikItem {
  key: keyof LogistikState;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const logistikItems: LogistikItem[] = [
  {
    key: 'tenda',
    name: 'Tenda',
    description: 'Kapasitas 2-4 orang',
    icon: Tent,
  },
  {
    key: 'carrier',
    name: 'Carrier',
    description: 'Tas gunung besar',
    icon: Backpack,
  },
  {
    key: 'sleepingBag',
    name: 'Sleeping Bag',
    description: 'Kantung tidur hangat',
    icon: Moon,
  },
  {
    key: 'matras',
    name: 'Matras',
    description: 'Alas tidur',
    icon: Bed,
  },
  {
    key: 'kompor',
    name: 'Kompor',
    description: 'Kompor portable',
    icon: Flame,
  },
  {
    key: 'kantongSampah',
    name: 'Kantong Sampah',
    description: 'Untuk sampah pribadi',
    icon: Trash2,
  },
  {
    key: 'p3k',
    name: 'P3K',
    description: 'Kotak obat-obatan',
    icon: Heart,
  },
];

export default function LogistikStep({ logistics, onChange, onNext, onBack }: LogistikStepProps) {
  const handleQuantityChange = (key: keyof LogistikState, delta: number) => {
    const newValue = Math.max(0, logistics[key] + delta);
    onChange({ ...logistics, [key]: newValue });
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm mb-6">
      <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 mb-5">
        Peralatan Logistik
      </h2>
      
      <div className="space-y-8">
        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Catatan:</strong> Pilih peralatan yang akan Anda bawa. Ini membantu kami mempersiapkan fasilitas yang sesuai di basecamp.
          </p>
        </div>

        {/* Logistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {logistikItems.map((item) => {
            const Icon = item.icon;
            const quantity = logistics[item.key];

            return (
              <div
                key={item.key}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 transition-all shadow-sm p-4 md:p-6"
              >
                {/* Item Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <Icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                  </div>
                </div>

                {/* Quantity Counter */}
                <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 mt-auto">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.key, -1)}
                    disabled={quantity === 0}
                    className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4 text-slate-700" />
                  </button>

                  <div className="text-center w-12">
                    <p className="text-lg font-bold text-slate-800">{quantity}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">unit</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.key, 1)}
                    className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-4 w-4 text-emerald-700" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          Kembali
        </button>
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto min-h-[44px] px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
        >
          Lanjut ke Review
        </button>
      </div>
    </div>
  );
}
