'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { initiatePayment, processSnapPayment } from '@/lib/payment';

interface PaymentButtonProps {
  bookingId: string;
  bookingCode: string;
}

export default function PaymentButton({ bookingId, bookingCode }: PaymentButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);

  // Load Midtrans Snap script
  useEffect(() => {
    const snapScriptUrl = process.env.NEXT_PUBLIC_MIDTRANS_ENVIRONMENT === 'production'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';

    const script = document.createElement('script');
    script.src = snapScriptUrl;
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!);
    script.async = true;

    script.onload = () => {
      setSnapLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Midtrans Snap script');
      alert('Gagal memuat sistem pembayaran. Silakan refresh halaman.');
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!snapLoaded) {
      alert('Sistem pembayaran sedang dimuat. Silakan tunggu sebentar.');
      return;
    }

    setIsLoading(true);

    try {
      // Get payment token from our API
      const { token } = await initiatePayment(bookingId);

      // Process payment with Midtrans Snap
      processSnapPayment(token, {
        onSuccess: (result) => {
          console.log('Payment success:', result);
          alert('Pembayaran berhasil! Booking Anda telah dikonfirmasi.');
          router.refresh(); // Refresh to update booking status
        },
        onPending: (result) => {
          console.log('Payment pending:', result);
          alert('Pembayaran sedang diproses. Kami akan mengkonfirmasi setelah pembayaran selesai.');
          router.refresh();
        },
        onError: (result) => {
          console.error('Payment error:', result);
          alert('Pembayaran gagal. Silakan coba lagi.');
          setIsLoading(false);
        },
        onClose: () => {
          console.log('Payment popup closed');
          setIsLoading(false);
        },
      });

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      alert(error.message || 'Gagal memulai pembayaran. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 rounded-2xl border border-amber-300 shadow-sm p-6">
      <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Menunggu Pembayaran
      </h3>
      <p className="text-sm text-amber-700 mb-4">
        Segera lakukan pembayaran untuk mengkonfirmasi booking Anda.
      </p>
      <button
        onClick={handlePayment}
        disabled={isLoading || !snapLoaded}
        className={`w-full px-4 py-3 rounded-xl font-semibold transition-colors ${
          isLoading || !snapLoaded
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-amber-600 hover:bg-amber-700 text-white'
        }`}
      >
        {isLoading ? 'Memproses...' : !snapLoaded ? 'Memuat...' : 'Bayar Sekarang'}
      </button>
      <p className="text-xs text-gray-500 mt-3 text-center">
        Kode Booking: <span className="font-mono font-semibold">{bookingCode}</span>
      </p>
    </div>
  );
}
