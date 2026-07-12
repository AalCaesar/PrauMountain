import { describe, it, expect } from 'vitest';
import { validateNIK, calculateTotalPrice, checkQuota, isValidStatusTransition } from '../lib/bookingUtils';

describe('Booking Business Logic Tests', () => {

  describe('1. Validasi NIK', () => {
    it('harus mereturn true untuk NIK 16 digit angka yang valid', () => {
      expect(validateNIK('1234567890123456')).toBe(true);
    });

    it('harus mereturn false jika NIK kurang dari 16 digit', () => {
      expect(validateNIK('1234567890')).toBe(false);
    });

    it('harus mereturn false jika NIK lebih dari 16 digit', () => {
      expect(validateNIK('1234567890123456789')).toBe(false);
    });

    it('harus mereturn false jika NIK mengandung huruf', () => {
      expect(validateNIK('123456789012345A')).toBe(false);
    });
  });

  describe('2. Perhitungan Total Harga', () => {
    it('harus menghitung total harga dengan benar', () => {
      expect(calculateTotalPrice(150000, 3)).toBe(450000);
    });

    it('harus mereturn 0 jika total anggota adalah 0', () => {
      expect(calculateTotalPrice(150000, 0)).toBe(0);
    });

    it('harus mereturn 0 jika total anggota bernilai negatif', () => {
      expect(calculateTotalPrice(150000, -2)).toBe(0);
    });
  });

  describe('3. Cek Kuota Tersisa', () => {
    it('harus mereturn true jika kuota mencukupi', () => {
      expect(checkQuota(50, 5)).toBe(true);
    });

    it('harus mereturn true jika kuota pas/habis dipesan (sisa 0)', () => {
      expect(checkQuota(5, 5)).toBe(true);
    });

    it('harus mereturn false jika kuota tidak mencukupi', () => {
      expect(checkQuota(10, 15)).toBe(false);
    });

    it('harus mereturn false jika jumlah booking <= 0', () => {
      expect(checkQuota(10, 0)).toBe(false);
      expect(checkQuota(10, -5)).toBe(false);
    });
  });

  describe('4. Business Logic State Transitions (Status Booking)', () => {
    it('harus membolehkan transisi dari PENDING_PAYMENT ke CONFIRMED', () => {
      expect(isValidStatusTransition('PENDING_PAYMENT', 'CONFIRMED')).toBe(true);
    });

    it('harus membolehkan transisi dari CONFIRMED ke CHECKED_IN', () => {
      expect(isValidStatusTransition('CONFIRMED', 'CHECKED_IN')).toBe(true);
    });

    it('harus mencegah perubahan status yang melompat dari DRAFT langsung ke CHECKED_OUT', () => {
      expect(isValidStatusTransition('DRAFT', 'CHECKED_OUT')).toBe(false);
    });

    it('harus mencegah status CANCELLED berubah ke status apapun', () => {
      expect(isValidStatusTransition('CANCELLED', 'CONFIRMED')).toBe(false);
      expect(isValidStatusTransition('CANCELLED', 'PENDING_PAYMENT')).toBe(false);
    });
  });

});
