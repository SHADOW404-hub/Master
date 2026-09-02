import React, { useState } from 'react';
import type { Master, MasterWallet, Region, District } from '../types';
import { 
  User, ShieldCheck, Phone, MapPin, Wallet, CreditCard, 
  CheckCircle2, Settings 
} from 'lucide-react';
import { getAvatarSVG } from '../utils/avatar';

interface ProfilePageProps {
  currentUser: { name: string; phone: string; role: 'client' | 'master' | 'admin' } | null;
  master?: Master;
  wallet?: MasterWallet;
  regions: Region[];
  allDistricts: District[];
  onToggleStatus: (masterId: string) => void;
  onSubmitKYC: (masterId: string, passportNum: string, photoUrl: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  master,
  wallet,
  regions,
  allDistricts,
  onToggleStatus,
  onSubmitKYC,
  onOpenAuth,
  onLogout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'wallet' | 'kyc'>('info');

  // KYC form state
  const [passportNum, setPassportNum] = useState<string>(master?.passport_kyc.passportNumber || '');
  const [kycSuccess, setKycSuccess] = useState<boolean>(false);

  // Withdrawal form state
  const [withdrawCard, setWithdrawCard] = useState<string>('8600 **** **** 4412');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(wallet?.available_balance || 0);
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Profilga Kirilmagan</h2>
        <p className="text-xs text-gray-400">
          Profil va hamyoningizni ko'rish uchun iltimos platformaga kiring yoki ro'yxatdan o'ting.
        </p>
        <button onClick={onOpenAuth} className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold">
          Kirish / Ro'yxatdan O'tish
        </button>
      </div>
    );
  }

  const userRegion = regions.find(r => r.id === master?.region_id)?.name_uz || 'Toshkent shahri';
  const userDistrict = allDistricts.find(d => d.id === master?.district_id)?.name_uz || '';

  const handleKYCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (master && passportNum) {
      onSubmitKYC(master.id, passportNum, 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600');
      setKycSuccess(true);
      setTimeout(() => setKycSuccess(false), 3000);
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount > 0 && wallet && withdrawAmount <= wallet.available_balance) {
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 3000);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Profile Banner Header */}
      <div className="glass-panel p-6 border border-blue-500/30 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <img
            src={getAvatarSVG(currentUser.name)}
            alt={currentUser.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-lg shadow-blue-500/20"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-extrabold text-white">{currentUser.name}</h2>
              {master?.passport_kyc.status === 'verified' && (
                <span className="badge-verified">
                  <ShieldCheck className="w-3.5 h-3.5" /> KYC Tasdiqlangan
                </span>
              )}
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                {currentUser.role === 'master' ? 'Usta Mutaxassis' : 'Mijoz'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-300 font-medium pt-1">
              <div className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentUser.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{userRegion}{userDistrict ? `, ${userDistrict}` : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Master Status Switcher / Logout */}
        <div className="flex items-center gap-3">
          {currentUser.role === 'master' && master && (
            <button
              onClick={() => onToggleStatus(master.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                master.status === 'available'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{master.status === 'available' ? 'Hozir Bo\'shman' : 'Bandman'}</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="btn-secondary text-xs py-2.5 px-4 rounded-xl text-red-400 hover:border-red-500/40 font-bold"
          >
            Chiqish
          </button>
        </div>

      </div>

      {/* Profile Sub-tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('info')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            activeSubTab === 'info'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
              : 'text-gray-400 hover:text-white bg-white/5'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Shaxsiy Ma'lumotlar</span>
        </button>

        {currentUser.role === 'master' && wallet && (
          <button
            onClick={() => setActiveSubTab('wallet')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'wallet'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40'
                : 'text-gray-400 hover:text-white bg-white/5'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Hamyon & Pul Yechish</span>
          </button>
        )}

        {currentUser.role === 'master' && (
          <button
            onClick={() => setActiveSubTab('kyc')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'kyc'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                : 'text-gray-400 hover:text-white bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pasport KYC</span>
          </button>
        )}
      </div>

      {/* Sub-tab 1: Personal Info */}
      {activeSubTab === 'info' && (
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Hisob Sozlamalari</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="bg-black/30 p-3.5 rounded-xl border border-white/10">
              <span className="text-gray-400 block mb-1 font-semibold">Foydalanuvchi Ismi:</span>
              <strong className="text-white text-sm font-extrabold">{currentUser.name}</strong>
            </div>

            <div className="bg-black/30 p-3.5 rounded-xl border border-white/10">
              <span className="text-gray-400 block mb-1 font-semibold">Telefon Raqami:</span>
              <strong className="text-emerald-400 text-sm font-mono font-extrabold">{currentUser.phone}</strong>
            </div>

            <div className="bg-black/30 p-3.5 rounded-xl border border-white/10">
              <span className="text-gray-400 block mb-1 font-semibold">Birlashgan Viloyat:</span>
              <strong className="text-white text-sm font-extrabold">{userRegion}</strong>
            </div>

            <div className="bg-black/30 p-3.5 rounded-xl border border-white/10">
              <span className="text-gray-400 block mb-1 font-semibold">Platforma Roli:</span>
              <strong className="text-blue-300 text-sm font-extrabold uppercase">{currentUser.role}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Master Wallet */}
      {activeSubTab === 'wallet' && wallet && (
        <div className="space-y-6">
          
          {/* Wallet Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 border border-emerald-500/30">
              <span className="text-xs text-gray-400 font-semibold block">Mavjud Balans</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {wallet.available_balance.toLocaleString()} <span className="text-xs">so'm</span>
              </div>
            </div>

            <div className="glass-card p-4 border border-amber-500/30">
              <span className="text-xs text-gray-400 font-semibold block">Escrow Muzlatilgan</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                {wallet.pending_escrow.toLocaleString()} <span className="text-xs">so'm</span>
              </div>
            </div>

            <div className="glass-card p-4 border border-blue-500/30">
              <span className="text-xs text-gray-400 font-semibold block">Jami Ishlangan</span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {wallet.total_earned.toLocaleString()} <span className="text-xs">so'm</span>
              </div>
            </div>

            <div className="glass-card p-4 border border-white/10">
              <span className="text-xs text-gray-400 font-semibold block">2% Platforma Yig'imi</span>
              <div className="text-2xl font-extrabold text-gray-300 mt-1">
                {wallet.total_commission_paid.toLocaleString()} <span className="text-xs">so'm</span>
              </div>
            </div>
          </div>

          {/* Withdrawal Form */}
          <div className="glass-panel p-6 border border-emerald-500/30 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>Plastik Kartaga Pul Yechib Olish (Uzcard / Humo)</span>
            </h3>

            {withdrawSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pul yechib olish so'rovi bank tranzaksiyasiga yuborildi!</span>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-3 text-xs max-w-md">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Karta Raqami (8600 Uzcard / 9860 Humo):</label>
                <input
                  type="text"
                  required
                  value={withdrawCard}
                  onChange={(e) => setWithdrawCard(e.target.value)}
                  placeholder="8600 0000 0000 0000"
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-mono outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Yechiladigan Summa (so'm):</label>
                <input
                  type="number"
                  required
                  max={wallet.available_balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={wallet.available_balance <= 0}
                className="btn-success w-full justify-center py-3 rounded-xl font-extrabold text-xs"
              >
                Kartaga Pul Yechish So'rovini Yuborish
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Sub-tab 3: Master KYC Passport Upload */}
      {activeSubTab === 'kyc' && master && (
        <div className="glass-panel p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span>Pasport KYC Moderatsiyasi</span>
            </h3>

            {master.passport_kyc.status === 'verified' && (
              <span className="badge-verified">Tasdiqlangan</span>
            )}
          </div>

          {kycSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pasport ma'lumotlari adminlarga tekshiruvga yuborildi!</span>
            </div>
          )}

          <form onSubmit={handleKYCSubmit} className="space-y-3 text-xs max-w-md">
            <div>
              <label className="text-gray-400 block mb-1 font-semibold">Pasport / ID karta seriyasi (FA1234567):</label>
              <input
                type="text"
                required
                value={passportNum}
                onChange={(e) => setPassportNum(e.target.value)}
                placeholder="FA1234567"
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-mono uppercase outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center py-3 rounded-xl font-extrabold text-xs"
            >
              Moderatorlarga Yuborish
            </button>
          </form>
        </div>
      )}

    </section>
  );
};
