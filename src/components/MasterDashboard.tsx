import React, { useState } from 'react';
import type { Master, MasterWallet } from '../types';
import { 
  Wallet, ShieldCheck, Clock, CheckCircle2, 
  Upload, ArrowDownRight, CreditCard 
} from 'lucide-react';
import { formatCardNumber } from '../utils/validation';

interface MasterDashboardProps {
  master: Master;
  wallet: MasterWallet;
  onToggleStatus: (masterId: string) => void;
  onSubmitKYC: (masterId: string, passportNum: string, photoUrl: string) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({
  master,
  wallet,
  onToggleStatus,
  onSubmitKYC,
}) => {
  const [passportNumber, setPassportNumber] = useState<string>(master.passport_kyc.passportNumber || '');
  const [passportPhoto] = useState<string>('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600');
  
  // Withdrawal Form state
  const [withdrawCard, setWithdrawCard] = useState<string>('8600 **** **** 4412');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(wallet.available_balance);
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);

  const handleKYCFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passportNumber) {
      onSubmitKYC(master.id, passportNumber, passportPhoto);
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount > 0 && withdrawAmount <= wallet.available_balance) {
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 3000);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Header Card */}
      <div className="glass-panel p-6 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <img
            src={master.avatar}
            alt={master.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{master.name}</h2>
              {master.passport_kyc.status === 'verified' && (
                <span className="badge-verified">
                  <ShieldCheck className="w-3.5 h-3.5" /> KYC Tasdiqlangan
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-400 font-semibold">{master.category_name} • {master.phone}</p>
          </div>
        </div>

        {/* Status Switcher Toggle */}
        <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/10 w-full md:w-auto justify-between">
          <div className="text-xs text-gray-300 font-semibold">
            Status:
          </div>
          <button
            onClick={() => onToggleStatus(master.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              master.status === 'available'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-red-600 text-white shadow-lg shadow-red-600/30'
            }`}
          >
            {master.status === 'available' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Hozir bo'shman (Buyurtmalar qabul qilaman)
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                Bandman (Vaqtincha yopiq)
              </>
            )}
          </button>
        </div>

      </div>

      {/* Internal Wallet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 border border-emerald-500/30">
          <div className="text-xs text-gray-400 font-semibold flex items-center justify-between">
            <span>Mavjud Balans (Yechib olish mumkin)</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">
            {wallet.available_balance.toLocaleString()} <span className="text-xs">so'm</span>
          </div>
        </div>

        <div className="glass-card p-4 border border-amber-500/30">
          <div className="text-xs text-gray-400 font-semibold flex items-center justify-between">
            <span>Escrow Muzlatilgan Pul</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2">
            {wallet.pending_escrow.toLocaleString()} <span className="text-xs">so'm</span>
          </div>
        </div>

        <div className="glass-card p-4 border border-blue-500/30">
          <div className="text-xs text-gray-400 font-semibold flex items-center justify-between">
            <span>Jami Ishlangan</span>
            <ArrowDownRight className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {wallet.total_earned.toLocaleString()} <span className="text-xs">so'm</span>
          </div>
        </div>

        <div className="glass-card p-4 border border-white/10">
          <div className="text-xs text-gray-400 font-semibold flex items-center justify-between">
            <span>Platforma Komissiyasi (2%)</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold">2%</span>
          </div>
          <div className="text-2xl font-extrabold text-gray-300 mt-2">
            {wallet.total_commission_paid.toLocaleString()} <span className="text-xs">so'm</span>
          </div>
        </div>

      </div>

      {/* Main Content Sections: Wallet Withdrawal & KYC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card Withdrawal Section */}
        <div className="glass-panel p-5 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>Plastik Kartaga Pul Yechish (Uzcard / Humo)</span>
          </h3>

          {withdrawSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pul yechib olish so'rovi muvaffaqiyatli bankka yuborildi!</span>
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-3 text-xs">
            <div>
              <label className="text-gray-400 block mb-1">Plastik karta (Uzcard 8600 / Humo 9860):</label>
              <input
                type="text"
                required
                value={withdrawCard}
                onChange={(e) => setWithdrawCard(formatCardNumber(e.target.value))}
                placeholder="8600 0000 0000 0000"
                className="w-full bg-[#131B2E] border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Yechiladigan summa (so'm):</label>
              <input
                type="number"
                required
                max={wallet.available_balance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full bg-[#131B2E] border border-white/10 rounded-xl p-2.5 text-white font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={wallet.available_balance <= 0}
              className="btn-success w-full justify-center py-2.5 rounded-xl font-bold text-xs"
            >
              Kartaga Pul Yechish So'rovini Yuborish
            </button>
          </form>
        </div>

        {/* KYC Verification Upload Form */}
        <div className="glass-panel p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span>Pasport KYC Tekshiruvi</span>
            </h3>

            {master.passport_kyc.status === 'verified' && (
              <span className="badge-verified">Tasdiqlangan</span>
            )}
            {master.passport_kyc.status === 'pending' && (
              <span className="badge-escrow">Moderatsiyada</span>
            )}
          </div>

          <p className="text-xs text-gray-400">
            Profilinizda yashil "KYC Tasdiq" nishonini olish va mijozlar ishonchini oshirish uchun pasport/ID karta seriyasini yuboring.
          </p>

          <form onSubmit={handleKYCFormSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-gray-400 block mb-1">Pasport / ID Karta Seriyasi va Raqami:</label>
              <input
                type="text"
                required
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                placeholder="FA1234567"
                className="w-full bg-[#131B2E] border border-white/10 rounded-xl p-2.5 text-white font-mono outline-none focus:border-blue-500 uppercase"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Pasport/ID fotosurati (Simulatsiya):</label>
              <div className="border border-dashed border-white/20 rounded-xl p-3 text-center bg-black/20">
                <Upload className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <span className="text-gray-400">Hujjat fotosurati yuklangan</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center py-2.5 rounded-xl text-xs"
            >
              Moderatorlarga Tekshirishga Yuborish
            </button>
          </form>
        </div>

      </div>

    </section>
  );
};
