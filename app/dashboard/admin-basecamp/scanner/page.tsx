import { Scan } from 'lucide-react';
import ScannerManager from './components/ScannerManager';

export default function ScannerPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-row items-start md:items-center gap-3">
        <Scan className="h-8 w-8 text-emerald-600 shrink-0 mt-1 md:mt-0" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Scanner Check-in/Check-out</h1>
          <p className="text-sm text-gray-600 mt-1">
            Scan QR code atau masukkan ID booking secara manual
          </p>
        </div>
      </div>

      <ScannerManager />
    </div>
  );
}
