import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, Calendar, FileText, Home, ArrowRight } from 'lucide-react';

function SuccessContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Booking Berhasil Dibuat!
          </h1>
          <p className="text-lg text-gray-600">
            Booking Anda telah berhasil disimpan dan menunggu pembayaran.
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Langkah Selanjutnya</h3>
                <p className="text-gray-600 text-sm">
                  Silakan lakukan pembayaran dalam waktu <strong>24 jam</strong> untuk mengkonfirmasi booking Anda.
                  Detail pembayaran telah dikirim ke email Anda.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 rounded-lg">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">E-Ticket Anda</h3>
                <p className="text-gray-600 text-sm">
                  E-Ticket dengan QR Code akan dikirim ke email Anda setelah pembayaran dikonfirmasi.
                  Tunjukkan E-Ticket saat check-in di basecamp.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard/pendaki"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            <FileText className="h-5 w-5" />
            Lihat Booking Saya
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-xl transition-colors font-semibold"
          >
            <Home className="h-5 w-5" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Ada pertanyaan? Hubungi kami di{' '}
            <a href="mailto:info@praumountain.com" className="text-emerald-600 hover:text-emerald-700 font-medium">
              info@praumountain.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
