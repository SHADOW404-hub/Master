import React, { useState } from 'react';
import type { Master } from '../types';
import { X, Lock, CreditCard, CheckCircle2 } from 'lucide-react';
import { formatCardNumber } from '../utils/validation';

interface EscrowCheckoutModalProps {
  master: Master;
  serviceTitle: string;
  price: number;
  onClose: () => void;
  onSuccess: (paymentSystem: 'payme' | 'click') => void;
}

export const EscrowCheckoutModal: React.FC<EscrowCheckoutModalProps> = ({
  master,
  serviceTitle,
  price,
  onClose,
  onSuccess,
}) => {
  const [paymentSystem, setPaymentSystem] = useState<'payme' | 'click'>('payme');
  const [cardNumber, setCardNumber] = useState<string>('8600 4512 8890 1234');
  const [expiry, setExpiry] = useState<string>('12/28');
  const [otpCode, setOtpCode] = useState<string>('');
  const [step, setStep] = useState<'card' | 'otp' | 'success'>('card');
  const [loading, setLoading] = useState<boolean>(false);

  const commission = Math.round(price * 0.02);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 800);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      setTimeout(() => {
        onSuccess(paymentSystem);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-md relative border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Escrow Xavfsiz To'lov</h3>
              <p className="text-xs text-gray-400">Mablag' platforma hisobida muzlatiladi</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Card input & gateway selection */}
        {step === 'card' && (
          <form onSubmit={handleSendOTP} className="space-y-4 mt-4">
            
            {/* Order summary box */}
            <div className="bg-black/40 rounded-xl p-3 border border-white/10 text-xs space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Usta:</span>
                <strong className="text-white">{master.name}</strong>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Xizmat:</span>
                <strong className="text-blue-400">{serviceTitle}</strong>
              </div>
              <div className="flex justify-between text-gray-300 border-t border-white/10 pt-2">
                <span>Tranzaksiya summasi:</span>
                <strong className="text-emerald-400 font-extrabold text-sm">
                  {price.toLocaleString()} so'm
                </strong>
              </div>
              <div className="text-[11px] text-gray-400 bg-white/5 p-2 rounded-lg flex justify-between">
                <span>Platforma komissiyasi (2%):</span>
                <span>{commission.toLocaleString()} so'm</span>
              </div>
            </div>

            {/* Payment System Switcher */}
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">
                To'lov tizimini tanlang:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentSystem('payme')}
                  className={`p-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    paymentSystem === 'payme'
                      ? 'bg-[#00CCCC]/20 border-[#00CCCC] text-[#00CCCC] shadow-lg shadow-[#00CCCC]/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Payme API</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentSystem('click')}
                  className={`p-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    paymentSystem === 'click'
                      ? 'bg-[#0080FF]/20 border-[#0080FF] text-[#0080FF] shadow-lg shadow-[#0080FF]/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Click Pass</span>
                </button>
              </div>
            </div>

            {/* Plastic Card Form (Uzcard / Humo) */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">
                  Plastik karta raqami (Uzcard / Humo):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="8600 0000 0000 0000"
                    className="w-full bg-[#131B2E] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-blue-500"
                  />
                  <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">
                  Amal qilish muddati:
                </label>
                <input
                  type="text"
                  required
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full bg-[#131B2E] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-success w-full justify-center py-3 rounded-xl font-bold text-sm mt-2"
            >
              {loading ? 'Ulanmoqda...' : `SMS Tasdiqlash Kodini Olish (${price.toLocaleString()} so'm)`}
            </button>

          </form>
        )}

        {/* Step 2: OTP SMS Code Confirmation */}
        {step === 'otp' && (
          <form onSubmit={handleConfirmPayment} className="space-y-4 mt-4 text-center">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
              Telefoningizga 4 xonali SMS kod yuborildi (Simulatsiya: <strong>1234</strong> kiriting).
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-2">
                SMS Tasdiqlash Kodingiz:
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="1 2 3 4"
                className="w-40 mx-auto text-center bg-[#131B2E] border-2 border-blue-500 rounded-xl px-4 py-3 text-2xl font-mono text-white tracking-widest outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 rounded-xl font-bold text-sm"
            >
              {loading ? 'Muzlatilmoqda...' : 'To\'lovni Amalga Oshirish & Pulni Muzlatish'}
            </button>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white">To'lov Muvaffaqiyatli Muzlatildi!</h3>
            <p className="text-xs text-gray-300 max-w-xs mx-auto">
              Pul ustaga o'tkazilmadi. Ish yakunlangach "Ishni qabul qildim" tugmasini bosasiz.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
