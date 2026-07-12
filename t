[35mapp/actions/emergency.ts[m[36m:[m[32m29[m[36m:[m      anggota_rombongan(nama_anggota, kontak_darurat, [1;31mnik[m),
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m29[m[36m:[m  [1;31mnik[m: string;
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m64[m[36m:[m  [1;31mnik[m: string;
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m89[m[36m:[m    { namaLengkap: '', [1;31mnik[m: '', nomorTelepon: '' }
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m139[m[36m:[m        newDetails.push({ namaLengkap: '', [1;31mnik[m: '', nomorTelepon: '' });
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m152[m[36m:[m  const validate[1;31mNIK[m = ([1;31mnik[m: string): boolean => {
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m153[m[36m:[m    return /^\d{16}$/.test([1;31mnik[m);
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m178[m[36m:[m      if (!hiker.[1;31mnik[m) {
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m179[m[36m:[m        newErrors[`[1;31mnik[m_${index}`] = '[1;31mNIK[m wajib diisi';
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m180[m[36m:[m      } else if (!validate[1;31mNIK[m(hiker.[1;31mnik[m)) {
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m181[m[36m:[m        newErrors[`[1;31mnik[m_${index}`] = '[1;31mNIK[m harus 16 digit angka';
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m197[m[36m:[m    const errorKey = field === 'namaLengkap' ? `nama_${index}` : field === '[1;31mnik[m' ? `[1;31mnik[m_${index}` : `telp_${index}`;
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m271[m[36m:[m        [1;31mnik[m: hiker.[1;31mnik[m,
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m475[m[36m:[m                      {/* [1;31mNIK[m */}
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m478[m[36m:[m                          [1;31mNIK[m (16 Digit) <span className="text-red-500">*</span>
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m482[m[36m:[m                          value={hiker.[1;31mnik[m}
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m485[m[36m:[m                            handleHikerDetailChange(index, '[1;31mnik[m', value);
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m487[m[36m:[m                          placeholder="Masukkan 16 digit [1;31mNIK[m"
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m489[m[36m:[m                          className={`bg-slate-50 border rounded-xl px-4 py-3 text-slate-700 transition-all focus:bg-white focus:ring-2 outline-none w-full font-mono ${errors[`[1;31mnik[m_${index}`] ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m492[m[36m:[m                        {errors[`[1;31mnik[m_${index}`] && (
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m493[m[36m:[m                          <p className="text-xs text-red-500 mt-1">{errors[`[1;31mnik[m_${index}`]}</p>
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m495[m[36m:[m                        {hiker.[1;31mnik[m && (
[35mapp/booking/[id]/components/BookingForm.tsx[m[36m:[m[32m496[m[36m:[m                          <p className="mt-1 text-xs text-slate-500">{hiker.[1;31mnik[m.length}/16 digit</p>
[35mapp/booking/[id]/components/ReviewStep.tsx[m[36m:[m[32m19[m[36m:[m  [1;31mnik[m: string;
[35mapp/booking/[id]/components/ReviewStep.tsx[m[36m:[m[32m149[m[36m:[m                  <span className="text-gray-500">[1;31mNIK[m</span>
[35mapp/booking/[id]/components/ReviewStep.tsx[m[36m:[m[32m150[m[36m:[m                  <span className="font-mono text-gray-700 break-all">{hiker.[1;31mnik[m}</span>
[35mapp/dashboard/admin-basecamp/bookings/components/BookingTable.tsx[m[36m:[m[32m356[m[36m:[m                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">[1;31mNIK[m</th>
[35mapp/dashboard/admin-basecamp/bookings/components/BookingTable.tsx[m[36m:[m[32m366[m[36m:[m                            <td className="px-4 py-3 text-sm text-gray-500 font-mono">{anggota.[1;31mnik[m}</td>
[35mapp/dashboard/admin-basecamp/scanner/components/BookingResult.tsx[m[36m:[m[32m160[m[36m:[m    'Orga[1;31mnik[m',
[35mapp/dashboard/pendaki/booking/[id]/page.tsx[m[36m:[m[32m48[m[36m:[m    [1;31mnik[m: string;
[35mapp/dashboard/pendaki/booking/[id]/page.tsx[m[36m:[m[32m83[m[36m:[m        [1;31mnik[m,
[35mapp/dashboard/pendaki/booking/[id]/page.tsx[m[36m:[m[32m357[m[36m:[m                        <p className="text-gray-600 mb-1">[1;31mNIK[m</p>
[35mapp/dashboard/pendaki/booking/[id]/page.tsx[m[36m:[m[32m358[m[36m:[m                        <p className="font-mono font-semibold text-gray-900 break-all">{anggota.[1;31mnik[m}</p>
