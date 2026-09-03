import React, { useState, useEffect } from 'react';
import {
  Wrench, User, Mail, KeyRound, ArrowRight, Eye, EyeOff,
  RefreshCw, AlertCircle, CheckCircle2, ArrowLeft,
  Shield, Lock, Star, Phone,
} from 'lucide-react';
import type { UserRole, Region, District, Category } from '../types';
import { formatUzbekPhone } from '../utils/validation';
import { authSignUp, supabase } from '../services/supabase';

interface RegisterPageProps {
  regions: Region[];
  allDistricts: District[];
  categories: Category[];
  onGoLogin: () => void;
  onGoLanding: () => void;
  onRegisterSuccess?: (userData: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    region_id: string;
    district_id: string;
    category_id?: string;
  }) => void;
}

const getSupabaseErrorMsg = (msg: string): string => {
  if (msg.includes('User already registered') || msg.includes('already registered'))
    return 'Bu email allaqachon ro\'yxatdan o\'tgan. Kirish sahifasiga o\'ting.';
  if (msg.includes('Password should be at least'))
    return 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak.';
  if (msg.includes('invalid email') || msg.includes('Invalid email'))
    return 'Email manzil noto\'g\'ri formatda kiritildi.';
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Ko\'p urinish. Bir necha daqiqa kuting.';
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Internet aloqasi yo\'q. Tarmoqni tekshiring.';
  return 'Kutilmagan xatolik yuz berdi. Qayta urinib ko\'ring.';
};

// Password strength calculator
const getPasswordStrength = (pass: string): { level: 0 | 1 | 2 | 3; label: string; color: string } => {
  if (pass.length === 0) return { level: 0, label: '', color: '' };
  if (pass.length < 6) return { level: 1, label: 'Kuchsiz', color: '#EF4444' };
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasDigit = /\d/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);
  const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  if (pass.length >= 10 && score >= 3) return { level: 3, label: 'Kuchli', color: '#10B981' };
  if (pass.length >= 6 && score >= 2) return { level: 2, label: "O'rtacha", color: '#F59E0B' };
  return { level: 1, label: 'Kuchsiz', color: '#EF4444' };
};

const STEPS = ['Rol', 'Ma\'lumotlar', 'Hududingiz'];

export const RegisterPage: React.FC<RegisterPageProps> = ({
  regions,
  allDistricts,
  categories,
  onGoLogin,
  onGoLanding,
  onRegisterSuccess,
}) => {
  const [step, setStep]               = useState(0); // 0,1,2
  const [role, setRole]               = useState<UserRole>('client');
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [phone, setPhone]             = useState('+998 ');
  const [regionId, setRegionId]       = useState(regions[0]?.id ?? '');
  const [districtId, setDistrictId]   = useState(
    allDistricts.find(d => d.region_id === regions[0]?.id)?.id ?? ''
  );
  const [categoryId, setCategoryId]   = useState(categories[0]?.id ?? '');
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [agreed, setAgreed]           = useState(false);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const districts = allDistricts.filter(d => d.region_id === regionId);
  const passStrength = getPasswordStrength(password);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length < 6) { setPhone('+998 '); return; }
    setPhone(formatUzbekPhone(val));
  };

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // Step 0 → 1 validation
  const canGoStep1 = role === 'client' || role === 'master';

  // Step 1 → 2 validation
  const validateStep1 = (): string | null => {
    if (!name.trim() || name.trim().length < 2) return 'Ism va familiyani kiriting (kamida 2 ta belgi)';
    if (!validateEmail(email.trim())) return 'To\'g\'ri email manzil kiriting';
    if (password.length < 6) return 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak';
    if (password !== confirmPass) return 'Parollar mos kelmadi';
    return null;
  };

  const goNext = () => {
    setError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    setStep(s => Math.min(s + 1, 2));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreed) { setError('Foydalanish shartlarini qabul qiling'); return; }
    if (!districtId) { setError('Tuman tanlang'); return; }
    if (role === 'master' && !categoryId) { setError('Mutaxassislik sohasini tanlang'); return; }

    setLoading(true);
    try {
      const signUpRes = await authSignUp({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        role,
        region_id: regionId,
        district_id: districtId,
        category_id: role === 'master' ? categoryId : undefined,
        phone: phone.replace(/\D/g, '').length >= 12 ? phone : undefined,
      });

      const userId = signUpRes?.user?.id || `usr-${Date.now()}`;

      // ── Supabase profiles jadvaliga saqlash (barcha qurilmalar va telefonlarda ko'rinishi uchun) ──
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.replace(/\D/g, '').length >= 12 ? phone : null,
          role,
          region_id: regionId,
          district_id: districtId,
          category_id: role === 'master' ? categoryId : null,
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Profiles table upsert warning:', e);
      }

      const registeredUser = {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, '').length >= 12 ? phone : '',
        role,
        region_id: regionId,
        district_id: districtId,
        category_id: role === 'master' ? categoryId : undefined,
      };

      if (onRegisterSuccess) {
        onRegisterSuccess(registeredUser);
      }

      setSuccess(email.trim().toLowerCase());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      setError(getSupabaseErrorMsg(msg));
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{
          maxWidth: 460, width: '100%',
          background: 'rgba(10,15,28,0.92)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 28, padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: '0 0 80px -20px rgba(16,185,129,0.2)',
          animation: 'fadeUp 0.4s ease',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <CheckCircle2 style={{ width: 32, height: 32, color: '#10B981' }} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>
            Emailni Tasdiqlang!
          </h2>
          <p style={{ color: '#64748B', lineHeight: 1.7, marginBottom: '0.5rem' }}>
            <span style={{ color: '#6EE7B7', fontWeight: 700 }}>{success}</span> manzilingizga
            tasdiqlash xati yuborildi.
          </p>
          <p style={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Pochta qutingizni tekshiring va havolani bosib, ro'yxatdan o'tishni yakunlang.
            Spam papkasini ham tekshiring.
          </p>
          <button
            id="register-success-login-btn"
            className="btn-primary"
            onClick={onGoLogin}
          >
            <span>Kirishga O'tish</span>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <div className="register-left-panel">
        <div style={{ maxWidth: 380 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '3rem' }}>
            <div style={{
              width: 42, height: 42,
              background: 'linear-gradient(135deg, #3B82F6, #10B981)',
              borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Wrench style={{ width: 22, height: 22, color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.15rem', color: '#fff', letterSpacing: '-0.02em' }}>
              USTA<span style={{ color: '#3B82F6' }}>MIJOZ</span>
            </span>
          </div>

          <h2 style={{
            fontSize: '2.2rem', fontWeight: 900, color: '#fff',
            lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '1rem',
          }}>
            Bepul
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #3B82F6, #10B981)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Ro'yxatdan O'ting
            </span>
          </h2>

          <p style={{ color: '#64748B', lineHeight: 1.65, fontSize: '0.9rem', marginBottom: '2rem' }}>
            Bir daqiqada ro'yxatdan o'ting va O'zbekiston bo'yicha 2 800+ tasdiqlangan ustaga yetishib boring.
          </p>

          {/* Steps indicator */}
          <div style={{ marginBottom: '2rem' }}>
            {STEPS.map((label, i) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                marginBottom: 12,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: i <= step ? 'linear-gradient(135deg, #3B82F6, #10B981)' : 'rgba(255,255,255,0.06)',
                  border: i <= step ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 800,
                  color: i <= step ? '#fff' : '#475569',
                  transition: 'all 0.3s ease',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: '0.82rem', fontWeight: 600,
                  color: i <= step ? '#94A3B8' : '#475569',
                  transition: 'color 0.3s',
                }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {[
            { icon: Shield, label: 'Ma\'lumotlaringiz SSL bilan himoyalangan', color: '#10B981' },
            { icon: Lock, label: 'Escrow to\'lov — oldindan pul o\'tkazilmaydi', color: '#F59E0B' },
            { icon: Star, label: 'Ro\'yxatdan o\'tish butunlay bepul', color: '#3B82F6' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 8,
            }}>
              <Icon style={{ width: 14, height: 14, color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#475569' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div className="register-right-panel">
        <button
          id="register-back-btn"
          onClick={onGoLanding}
          className="btn-ghost"
          style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}
        >
          <ArrowLeft style={{ width: 15, height: 15 }} />
          Orqaga
        </button>

        <div
          className="auth-box"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
            transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)',
            maxWidth: 460,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: 50, height: 50,
              background: 'linear-gradient(135deg, #3B82F6, #10B981)',
              borderRadius: 14, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 0.9rem',
              boxShadow: '0 8px 28px rgba(59,130,246,0.4)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}>
              <Wrench style={{ width: 24, height: 24, color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
              Ro'yxatdan O'tish
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.3rem' }}>
              {step === 0 && 'Kim sifatida ro\'yxatdan o\'tmoqchisiz?'}
              {step === 1 && 'Shaxsiy ma\'lumotlaringizni kiriting'}
              {step === 2 && 'Joylashuvingizni belgilang'}
            </p>
          </div>

          {/* Step progress bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: '1.75rem' }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 99,
                background: i <= step
                  ? 'linear-gradient(90deg, #3B82F6, #10B981)'
                  : 'rgba(255,255,255,0.08)',
                transition: 'background 0.4s ease',
              }} />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              id="register-error-alert"
              role="alert"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 9,
                background: 'rgba(239,68,68,0.09)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 12, padding: '0.75rem 0.9rem',
                fontSize: '0.8rem', color: '#FCA5A5', fontWeight: 600,
                marginBottom: '1.25rem', lineHeight: 1.5,
                animation: 'fadeUp 0.2s ease',
              }}
            >
              <AlertCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1, color: '#EF4444' }} />
              {error}
            </div>
          )}

          {/* ── STEP 0: Role ─────────────────────────────────────── */}
          {step === 0 && (
            <div>
              <label className="form-label" style={{ marginBottom: '0.75rem' }}>Siz kimsiz?</label>
              <div style={{ display: 'flex', gap: 12, marginBottom: '2rem' }}>
                <button
                  id="register-role-client"
                  type="button"
                  onClick={() => setRole('client')}
                  className={`role-btn${role === 'client' ? ' active-client' : ''}`}
                  style={{ flex: 1, padding: '1.25rem 1rem' }}
                >
                  <User style={{ width: 24, height: 24 }} />
                  <span style={{ fontSize: '0.9rem' }}>Mijozman</span>
                  <span style={{ fontSize: '0.67rem', opacity: 0.6 }}>Usta topaman</span>
                </button>
                <button
                  id="register-role-master"
                  type="button"
                  onClick={() => setRole('master')}
                  className={`role-btn${role === 'master' ? ' active-master' : ''}`}
                  style={{ flex: 1, padding: '1.25rem 1rem' }}
                >
                  <Wrench style={{ width: 24, height: 24 }} />
                  <span style={{ fontSize: '0.9rem' }}>Ustaman</span>
                  <span style={{ fontSize: '0.67rem', opacity: 0.6 }}>Buyurtma olaman</span>
                </button>
              </div>

              {/* Role info box */}
              <div style={{
                background: role === 'client'
                  ? 'rgba(59,130,246,0.07)' : 'rgba(16,185,129,0.07)',
                border: `1px solid ${role === 'client' ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)'}`,
                borderRadius: 12, padding: '1rem',
                fontSize: '0.8rem', lineHeight: 1.6,
                color: role === 'client' ? '#93C5FD' : '#6EE7B7',
                marginBottom: '1.5rem',
                transition: 'all 0.3s ease',
              }}>
                {role === 'client'
                  ? '👤 Mijoz sifatida siz usta qidirasiz, escrow orqali to\'lov qilasiz va ish sifatini bahosiz.'
                  : '🔧 Usta sifatida siz buyurtma olasiz, KYC tekshiruvidan o\'tasiz va escrow orqali haq olasiz.'}
              </div>

              <button
                id="register-step0-next"
                type="button"
                className="btn-primary"
                onClick={() => { setError(''); setStep(1); }}
                disabled={!canGoStep1}
              >
                <span>Davom Etish</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          )}

          {/* ── STEP 1: Personal info ─────────────────────────────── */}
          {step === 1 && (
            <div>
              {/* Full name */}
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="reg-name" className="form-label">Ism va Familiya</label>
                <input
                  id="reg-name"
                  className="auth-input"
                  type="text"
                  placeholder="Jasurbek Rahimov"
                  value={name}
                  onChange={e => { setName(e.target.value); if (error) setError(''); }}
                  autoComplete="name"
                  autoFocus
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="reg-email" className="form-label">Email Manzil</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-email"
                    className="auth-input"
                    type="email"
                    placeholder="jasur@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (error) setError(''); }}
                    autoComplete="email"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                  <Mail style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)', width: 16, height: 16,
                    color: '#475569', pointerEvents: 'none',
                  }} />
                </div>
              </div>

              {/* Phone (optional) */}
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="reg-phone" className="form-label">
                  Telefon
                  <span style={{ color: '#475569', fontWeight: 500, marginLeft: 4, textTransform: 'none' }}>
                    (ixtiyoriy)
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-phone"
                    className="auth-input"
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={handlePhoneChange}
                    autoComplete="tel"
                    style={{ paddingLeft: '2.75rem', fontFamily: 'monospace', letterSpacing: '0.04em' }}
                  />
                  <Phone style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)', width: 15, height: 15,
                    color: '#475569', pointerEvents: 'none',
                  }} />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="reg-pass" className="form-label">Parol</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-pass"
                    className="auth-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Kamida 6 ta belgi"
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                    autoComplete="new-password"
                    style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  />
                  <KeyRound style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)', width: 16, height: 16,
                    color: '#475569', pointerEvents: 'none',
                  }} />
                  <button
                    type="button"
                    id="reg-toggle-pass"
                    onClick={() => setShowPass(p => !p)}
                    aria-label={showPass ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#475569', padding: 0, lineHeight: 0,
                    }}
                  >
                    {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div style={{ marginTop: 7 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 99,
                          background: passStrength.level >= i ? passStrength.color : 'rgba(255,255,255,0.08)',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: passStrength.color, fontWeight: 700 }}>
                      {passStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="reg-confirm" className="form-label">Parolni Tasdiqlash</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-confirm"
                    className="auth-input"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Parolni qaytadan kiriting"
                    value={confirmPass}
                    onChange={e => { setConfirmPass(e.target.value); if (error) setError(''); }}
                    autoComplete="new-password"
                    style={{
                      paddingLeft: '2.75rem', paddingRight: '2.75rem',
                      borderColor: confirmPass && confirmPass !== password
                        ? 'rgba(239,68,68,0.5)' : undefined,
                    }}
                  />
                  <KeyRound style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)', width: 16, height: 16,
                    color: '#475569', pointerEvents: 'none',
                  }} />
                  <button
                    type="button"
                    id="reg-toggle-confirm"
                    onClick={() => setShowConfirm(p => !p)}
                    aria-label={showConfirm ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#475569', padding: 0, lineHeight: 0,
                    }}
                  >
                    {showConfirm ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                  </button>
                </div>
                {confirmPass && confirmPass !== password && (
                  <p style={{ fontSize: '0.7rem', color: '#EF4444', marginTop: 4, fontWeight: 600 }}>
                    Parollar mos kelmadi
                  </p>
                )}
                {confirmPass && confirmPass === password && (
                  <p style={{ fontSize: '0.7rem', color: '#10B981', marginTop: 4, fontWeight: 600 }}>
                    ✓ Parollar mos
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  id="register-step1-back"
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setError(''); setStep(0); }}
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  ← Orqaga
                </button>
                <button
                  id="register-step1-next"
                  type="button"
                  className="btn-primary"
                  onClick={goNext}
                  style={{ flex: 2 }}
                >
                  <span>Davom Etish</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Location ─────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleRegister}>
              {/* Region & District */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="reg-region" className="form-label">Viloyat</label>
                  <select
                    id="reg-region"
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
                  <label htmlFor="reg-district" className="form-label">Tuman</label>
                  <select
                    id="reg-district"
                    value={districtId}
                    onChange={e => setDistrictId(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name_uz}</option>)}
                  </select>
                </div>
              </div>

              {/* Category — master only */}
              {role === 'master' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="reg-category" className="form-label">Mutaxassislik Sohasi</label>
                  <select
                    id="reg-category"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_uz}</option>)}
                  </select>
                </div>
              )}

              {/* Terms checkbox */}
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                cursor: 'pointer', marginBottom: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, padding: '0.85rem',
              }}>
                <input
                  id="reg-terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={e => { setAgreed(e.target.checked); if (error) setError(''); }}
                  style={{ accentColor: '#3B82F6', width: 15, height: 15, marginTop: 1, flexShrink: 0 }}
                />
                <span style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.55 }}>
                  <span style={{ color: '#94A3B8', fontWeight: 600 }}>Foydalanish shartlari</span> va{' '}
                  <span style={{ color: '#94A3B8', fontWeight: 600 }}>Maxfiylik siyosati</span>ni
                  o'qidim va qabul qilaman. UstaMijoz platforma qoidalariga rioya qilaman.
                </span>
              </label>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  id="register-step2-back"
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setError(''); setStep(1); }}
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  ← Orqaga
                </button>
                <button
                  id="register-submit-btn"
                  type="submit"
                  className="btn-primary"
                  disabled={loading || !agreed}
                  style={{ flex: 2 }}
                >
                  {loading ? (
                    <>
                      <RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                      <span>Ro'yxatdan o'tilmoqda…</span>
                    </>
                  ) : (
                    <>
                      <span>Ro'yxatdan O'tish</span>
                      <ArrowRight style={{ width: 16, height: 16 }} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Divider + login link */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '1.5rem 0', color: '#334155', fontSize: '0.75rem',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span>yoki</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748B' }}>
            Allaqachon a'zomisiz?{' '}
            <button
              id="register-go-login-btn"
              type="button"
              onClick={onGoLogin}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#3B82F6', fontWeight: 700, fontSize: '0.82rem',
                fontFamily: 'inherit', padding: 0,
              }}
            >
              Kirish →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .register-left-panel {
          flex: 1;
          min-height: 100vh;
          background: linear-gradient(150deg, #070B14 0%, #0A1224 60%, #07111e 100%);
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .register-left-panel::before {
          content: '';
          position: absolute;
          top: 20%;
          left: 20%;
          width: 60%;
          height: 60%;
          background: radial-gradient(ellipse, rgba(16,185,129,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .register-right-panel {
          flex: 1;
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 5rem 2rem 3rem;
          position: relative;
          overflow-y: auto;
        }
        .register-right-panel .auth-box {
          width: 100%;
          max-width: 460px;
        }
        @media (max-width: 768px) {
          .register-left-panel { display: none; }
          .register-right-panel { padding: 4rem 1rem 2rem; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
