import React, { useState, useRef } from 'react';
import type { UserRole, Region, District, Category } from '../types';
import { Wrench, User, ArrowRight, CheckCircle2, Eye, EyeOff, Shield, Lock, Star } from 'lucide-react';
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
  const [isLogin, setIsLogin]               = useState(false);
  const [role, setRole]                     = useState<UserRole>('client');
  const [name, setName]                     = useState('');
  const [phone, setPhone]                   = useState('+998 ');
  const [regionId, setRegionId]             = useState(regions[0]?.id ?? '');
  const [districtId, setDistrictId]         = useState(allDistricts.find(d => d.region_id === regions[0]?.id)?.id ?? '');
  const [categoryId, setCategoryId]         = useState(categories[0]?.id ?? '');
  const [step, setStep]                     = useState<'form' | 'otp'>('form');
  const [otp, setOtp]                       = useState(['', '', '', '']);
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const otpRefs                             = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const districts = allDistricts.filter(d => d.region_id === regionId);

  /* ── helpers ─────────────────────────────────────── */
  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 3) otpRefs[idx + 1].current?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
  };

  /* ── Step 1: send SMS ────────────────────────────── */
  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUzbekPhone(phone)) {
      setError("To'liq O'zbekiston telefon raqami kiriting (+998 XX XXX XX XX)");
      return;
    }
    if (!isLogin && !name.trim()) {
      setError('Ism va familiyangizni kiriting');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate SMS delay
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    }, 800);
  };

  /* ── Step 2: verify OTP ──────────────────────────── */
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 4) {
      setError('4 xonali kodni to\'liq kiriting');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        name: isLogin ? phone : name.trim(),
        phone,
        role,
        region_id: regionId,
        district_id: districtId,
        category_id: role === 'master' ? categoryId : undefined,
      });
    }, 600);
  };

  return (
    <div className="auth-screen">

      {/* ─── Centered Auth Box ───────────────────────── */}
      <div className="auth-box">

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #3B82F6, #10B981)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
          }}>
            <Wrench style={{ width: 28, height: 28, color: '#fff' }} />
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
            USTA<span style={{ color: '#3B82F6' }}>MIJOZ</span>
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.35rem', fontWeight: 500 }}>
            {step === 'otp'
              ? `${phone} raqamiga SMS yuborildi`
              : isLogin
              ? 'Tizimga kirish'
              : "O'zbekiston xizmatlari platformasi"}
          </p>
        </div>

        {/* Trust pills */}
        {step === 'form' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: Shield, label: 'KYC Tasdiqlangan', color: '#10B981' },
              { icon: Lock,   label: '2% Escrow Kafolati', color: '#F59E0B' },
              { icon: Star,   label: '14 Viloyat', color: '#3B82F6' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 99, padding: '4px 12px',
                fontSize: '0.7rem', fontWeight: 700, color,
              }}>
                <Icon style={{ width: 11, height: 11 }} />
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 12, padding: '0.75rem 1rem',
            fontSize: '0.8rem', color: '#FCA5A5', fontWeight: 600,
            marginBottom: '1rem', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* ── STEP 1: FORM ─────────────────────────── */}
        {step === 'form' && (
          <form onSubmit={handleSendOTP}>

            {/* Tab Toggle */}
            <div className="auth-tab-group" style={{ marginBottom: '1.5rem' }}>
              <button type="button" className={`auth-tab${!isLogin ? ' active' : ''}`} onClick={() => { setIsLogin(false); setError(''); }}>
                Ro'yxatdan O'tish
              </button>
              <button type="button" className={`auth-tab${isLogin ? ' active' : ''}`} onClick={() => { setIsLogin(true); setError(''); }}>
                Kirish
              </button>
            </div>

            {/* Role picker — only on register */}
            {!isLogin && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Siz kimsiz?</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`role-btn${role === 'client' ? ' active-client' : ''}`}
                  >
                    <User style={{ width: 20, height: 20 }} />
                    <span>Mijozman</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>Usta topish</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('master')}
                    className={`role-btn${role === 'master' ? ' active-master' : ''}`}
                  >
                    <Wrench style={{ width: 20, height: 20 }} />
                    <span>Ustaman</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>Buyurtma olish</span>
                  </button>
                </div>
              </div>
            )}

            {/* Full name — register only */}
            {!isLogin && (
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Ism va Familiya</label>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Jasurbek Rahimov"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required={!isLogin}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Phone */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Telefon Raqam</label>
              <input
                className="auth-input"
                type="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={e => setPhone(formatUzbekPhone(e.target.value))}
                required
                autoComplete="tel"
                style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
              />
            </div>

            {/* Region & District — register only */}
            {!isLogin && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Viloyat</label>
                  <select
                    value={regionId}
                    onChange={e => {
                      setRegionId(e.target.value);
                      const first = allDistricts.find(d => d.region_id === e.target.value);
                      if (first) setDistrictId(first.id);
                    }}
                    style={{ width: '100%' }}
                  >
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name_uz}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Tuman</label>
                  <select value={districtId} onChange={e => setDistrictId(e.target.value)} style={{ width: '100%' }}>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name_uz}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Category — master only */}
            {!isLogin && role === 'master' && (
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Sohangiz</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ width: '100%' }}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_uz}</option>)}
                </select>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: '0.75rem' }}
            >
              {loading ? (
                <span style={{ opacity: 0.7 }}>Yuborilmoqda…</span>
              ) : (
                <>
                  <span>SMS Kod Olish</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </>
              )}
            </button>

            {/* Guest link */}
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button type="button" className="btn-ghost" onClick={onBrowseGuest}>
                <Eye style={{ width: 14, height: 14 }} />
                Ro'yxatdan o'tmasdan ko'rish
              </button>
            </div>

          </form>
        )}

        {/* ── STEP 2: OTP ──────────────────────────── */}
        {step === 'otp' && (
          <form onSubmit={handleVerify}>

            {/* OTP hint */}
            <div style={{
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 14, padding: '1rem',
              textAlign: 'center', marginBottom: '1.75rem',
              fontSize: '0.8rem', color: '#93C5FD', fontWeight: 500, lineHeight: 1.6,
            }}>
              <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem', marginBottom: 4 }}>
                {phone}
              </strong>
              raqamiga 4 xonali SMS kod yuborildi.<br />
              <span style={{ opacity: 0.7 }}>Demo kod: </span>
              <strong style={{ color: '#fff', fontFamily: 'monospace', fontSize: '1rem', letterSpacing: 4 }}>1234</strong>
            </div>

            {/* 4 OTP boxes */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: '1.75rem' }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                />
              ))}
            </div>

            <button type="submit" className="btn-success" disabled={loading}>
              {loading ? (
                <span style={{ opacity: 0.7 }}>Tekshirilmoqda…</span>
              ) : (
                <>
                  <CheckCircle2 style={{ width: 16, height: 16 }} />
                  <span>Tasdiqlash va Kirish</span>
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => { setStep('form'); setOtp(['','','','']); setError(''); }}
              >
                <EyeOff style={{ width: 14, height: 14 }} />
                Orqaga qaytish
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
