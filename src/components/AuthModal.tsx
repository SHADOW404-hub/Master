import React, { useState } from 'react';
import type { UserRole, Region, District, Category } from '../types';
import { ShieldCheck, Phone, User, Wrench, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatUzbekPhone, validateUzbekPhone } from '../utils/validation';

interface AuthModalProps {
  regions: Region[];
  allDistricts: District[];
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: {
    name: string;
    phone: string;
    role: UserRole;
    region_id: string;
    district_id: string;
    category_id?: string;
  }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  regions,
  allDistricts,
  categories,
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isLogin, setIsLogin] = useState<boolean>(false); // False = Ro'yxatdan o'tish, True = Kirish
  const [role, setRole] = useState<UserRole>('client');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('+998 ');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('reg-khorezm');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dist-urganch');
  const [categoryId, setCategoryId] = useState<string>('cat-santexnik');
  const [otpStep, setOtpStep] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const districts = allDistricts.filter((d) => d.region_id === selectedRegionId);

  const handleSendSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUzbekPhone(phone)) {
      setErrorMsg('Iltimos, to\'liq O\'zbekiston telefon raqamini kiriting (+998 XX XXX XX XX)');
      return;
    }
    if (!isLogin && !name.trim()) {
      setErrorMsg('Iltimos, ism va familiyangizni kiriting');
      return;
    }
    setErrorMsg('');
    setOtpStep(true);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      name: name || (role === 'master' ? 'Usta Mutaxassis' : 'Mijoz Foydalanuvchi'),
      phone,
      role,
      region_id: selectedRegionId,
      district_id: selectedDistrictId,
      category_id: role === 'master' ? categoryId : undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-md relative border border-blue-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center space-y-2 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isLogin ? 'Tizimga Kirish' : 'Platformada Ro\'yxatdan O\'tish'}
          </h2>
          <p className="text-xs text-gray-400">
            {isLogin
              ? 'Telefon raqamingiz orqali shaxsiy kabinetga kiring'
              : 'O\'zbekiston bo\'ylab ustalar va mijozlar tarmog\'iga qo\'shiling'}
          </p>
        </div>

        {errorMsg && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Initial Form */}
        {!otpStep ? (
          <form onSubmit={handleSendSMS} className="mt-4 space-y-3 text-xs">
            
            {/* Toggle Login vs Register */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 mb-3">
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  !isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'
                }`}
              >
                Ro'yxatdan o'tish
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'
                }`}
              >
                Kirish
              </button>
            </div>

            {/* Role Switcher */}
            {!isLogin && (
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Siz kimsiz?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                      role === 'client'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Mijozman</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('master')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                      role === 'master'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Ustaman</span>
                  </button>
                </div>
              </div>
            )}

            {/* Name Input */}
            {!isLogin && (
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Ismingiz va Familiyangiz:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Sardorbek Azimov"
                  className="w-full bg-[#131B2E] border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Phone Input */}
            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Telefon Raqamingiz:</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatUzbekPhone(e.target.value))}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-[#131B2E] border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none focus:border-blue-500"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* Region & District selector */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Viloyatingiz:</label>
                  <select
                    value={selectedRegionId}
                    onChange={(e) => {
                      setSelectedRegionId(e.target.value);
                      const sub = allDistricts.find(d => d.region_id === e.target.value);
                      if (sub) setSelectedDistrictId(sub.id);
                    }}
                    className="w-full bg-[#131B2E] border border-white/10 rounded-xl p-2 text-white outline-none"
                  >
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>{r.name_uz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Tumaningiz:</label>
                  <select
                    value={selectedDistrictId}
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                    className="w-full bg-[#131B2E] border border-white/10 rounded-xl p-2 text-white outline-none"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name_uz}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Master Category Selector */}
            {!isLogin && role === 'master' && (
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Mutaxassisligingiz (Soha):</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-[#131B2E] border border-white/10 rounded-xl p-2.5 text-white outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_uz}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full justify-center py-3 rounded-xl font-bold mt-2"
            >
              <span>SMS Kod Olish</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        ) : (
          /* Step 2: SMS Code verification */
          <form onSubmit={handleVerifyOTP} className="mt-4 space-y-4 text-center text-xs">
            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-blue-300">
              <strong>{phone}</strong> raqamingizga SMS kod yuborildi (Simulatsiya kodi: <strong>1234</strong>).
            </div>

            <div>
              <label className="text-gray-400 block mb-2 font-semibold">SMS Kodingizni kiriting:</label>
              <input
                type="text"
                maxLength={4}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="1 2 3 4"
                className="w-36 mx-auto text-center bg-[#131B2E] border-2 border-blue-500 rounded-xl px-3 py-2 text-2xl font-mono text-white tracking-widest outline-none"
              />
            </div>

            <button
              type="submit"
              className="btn-success w-full justify-center py-3 rounded-xl font-bold"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Kirish va Davom Etish</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
