export const validateNIK = (nik: string): boolean => {
  return /^\d{16}$/.test(nik);
};

export const calculateTotalPrice = (hargaPerOrang: number, totalAnggota: number): number => {
  if (totalAnggota <= 0 || hargaPerOrang < 0) {
    return 0;
  }
  return hargaPerOrang * totalAnggota;
};

export const checkQuota = (kuotaPerHari: number, jumlahOrangBooking: number): boolean => {
  if (jumlahOrangBooking <= 0) return false;
  return (kuotaPerHari - jumlahOrangBooking) >= 0;
};

export type BookingStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'EXPIRED';

export const isValidStatusTransition = (currentStatus: BookingStatus, newStatus: BookingStatus): boolean => {
  const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
    'DRAFT': ['PENDING_PAYMENT', 'CANCELLED'],
    'PENDING_PAYMENT': ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
    'CONFIRMED': ['CHECKED_IN', 'CANCELLED'],
    'CHECKED_IN': ['CHECKED_OUT'],
    'CHECKED_OUT': [],
    'CANCELLED': [],
    'EXPIRED': []
  };

  return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
};
