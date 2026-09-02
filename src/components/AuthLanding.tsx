import React, { useState } from 'react';
import type { UserRole, Region, District, Category } from '../types';
import { Phone, User, Wrench, ArrowRight, CheckCircle2, Eye } from 'lucide-react';
import { formatUzbekPhone, validateUzbekPhone } from '../utils/validation';

interface AuthLandingProps {
  regions: Region[];
  allDistricts: District[];
  categories: Category[];
  onLoginSuccess: (userData: {
    name: string;
    phone: string;
    role: UserRole;
    region_id: string;
    district_id: string;
    category_id?: string;
  }) => void;
  onBrowseGuest: () => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({
  regions,
  allDistricts,
  categories,
  onLoginSuccess,
  onBrowseGuest,
}) => {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole>('client');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('+998 ');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('reg-khorezm');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dist-urganch');
  const [categoryId, setCategoryId] = useState<string>('cat-santexnik');
  const [otpStep, setOtpStep] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

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
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 relative bg-[#070A12]">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-r from-blue-600/15 via-indigo-500/15 to-emerald-500/15 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-md w-full glass-panel p-6 sm:p-8 border border-blue-500/30 relative z-10 shadow-2xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-400 p-0.5 shadow-lg shadow-blue-500/30 mx-auto">
            <div className="w-full h-full bg-[#070A12] rounded-[14px] flex items-center justify-center">
              <Wrench className="w-7 h-7 text-blue-400" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            USTA<span className="text-blue-400">MIJOZ</span>
          </h1>
          <p className="text-xs text-gray-300 font-medium">
            {isLogin
              ? 'Tizimga kirish uchun telefon raqamingizni kiriting'
              : 'O\'zbekiston bo\'ylab xavfsiz Escrow xizmatlar platformasi'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-300 font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Login / Register Form */}
        {!otpStep ? (
          <form onSubmit={handleSendSMS} className="space-y-4 text-xs">
            
            {/* Toggle Mode */}
            <div className="flex bg-black/50 p-1.5 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-xl font-extrabold transition-all ${
                  !isLogin ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40' : 'text-gray-400 hover:text-white'
                }`}
              >
                Ro'yxatdan O'tish
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-xl font-extrabold transition-all ${
                  isLogin ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40' : 'text-gray-400 hover:text-white'
                }`}
              >
                Kirish
              </button>
            </div>

            {/* Role Switcher */}
            {!isLogin && (
              <div>
                <label className="text-gray-300 block mb-1.5 font-bold">Siz kimsiz?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                      role === 'client'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/20'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Mijozman</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('master')}
                    className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                      role === 'master'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-emerald-400" />
                    <span>Ustaman</span>
                  </button>
                </div>
              </div>
            )}

            {/* Full Name */}
            {!isLogin && (
              <div>
                <label className="text-gray-300 block mb-1 font-bold">Ismingiz va Familiyangiz:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Jasurbek Rahimov"
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>
            )}

            {/* Phone Input */}
            <div>
              <label className="text-gray-300 block mb-1 font-bold">Telefon Raqamingiz:</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatUzbekPhone(e.target.value))}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-mono text-sm outline-none focus:border-blue-500"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {/* Region & District selector */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-gray-300 block mb-1 font-bold">Viloyat:</label>
                  <select
                    value={selectedRegionId}
                    onChange={(e) => {
                      setSelectedRegionId(e.target.value);
                      const sub = allDistricts.find(d => d.region_id === e.target.value);
                      if (sub) setSelectedDistrictId(sub.id);
                    }}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-white outline-none font-medium"
                  >
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>{r.name_uz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 block mb-1 font-bold">Tuman:</label>
                  <select
                    value={selectedDistrictId}
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-white outline-none font-medium"
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
                <label className="text-gray-300 block mb-1 font-bold">Sohangiz (Kategoriya):</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white outline-none font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_uz}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full justify-center py-3.5 rounded-xl font-extrabold text-sm mt-2"
            >
              <span>SMS Kod Olish</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Guest Browse Option */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onBrowseGuest}
                className="text-gray-400 hover:text-white font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Ro'yxatdan o'tmasdan katalogga ko'z yugurtirish</span>
              </button>
            </div>

          </form>
        ) : (
          /* Step 2: SMS Verification OTP */
          <form onSubmit={handleVerifyOTP} className="space-y-4 text-center text-xs">
            <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-xl text-blue-300 font-medium">
              <strong>{phone}</strong> raqamingizga SMS kod yuborildi. <br />
              (Simulatsiya kodi: <strong className="text-white text-sm">1234</strong> kiriting).
            </div>

            <div>
              <label className="text-gray-300 block mb-2 font-bold">SMS Tasdiqlash Kodini Kiriting:</label>
              <input
                type="text"
                maxLength={4}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="1 2 3 4"
                className="w-40 mx-auto text-center bg-[#0F172A] border-2 border-blue-500 rounded-xl px-4 py-3 text-2xl font-mono text-white tracking-widest outline-none"
              />
            </div>

            <button
              type="submit"
              className="btn-success w-full justify-center py-3.5 rounded-xl font-extrabold text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tasdiqlash va Platformaga Kirish</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
