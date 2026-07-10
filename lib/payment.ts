'use client';

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export interface PaymentResponse {
  token: string;
  redirect_url: string;
}

export async function initiatePayment(bookingId: string): Promise<PaymentResponse> {
  const response = await fetch('/api/payment/create-transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ booking_id: bookingId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment transaction');
  }

  return response.json();
}


export function processSnapPayment(
  token: string,
  callbacks?: {
    onSuccess?: (result: any) => void;
    onPending?: (result: any) => void;
    onError?: (result: any) => void;
    onClose?: () => void;
  }
) {
  if (!window.snap) {
    throw new Error('Midtrans Snap script not loaded');
  }

  window.snap.pay(token, {
    onSuccess: (result) => {
      console.log('Payment success:', result);
      callbacks?.onSuccess?.(result);
    },
    onPending: (result) => {
      console.log('Payment pending:', result);
      callbacks?.onPending?.(result);
    },
    onError: (result) => {
      console.error('Payment error:', result);
      callbacks?.onError?.(result);
    },
    onClose: () => {
      console.log('Payment popup closed');
      callbacks?.onClose?.();
    },
  });
}
