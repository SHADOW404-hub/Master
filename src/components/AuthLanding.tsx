import React, { useState } from 'react';
import type { UserRole, Region, District, Category } from '../types';
import {
  Wrench, User, ArrowRight, CheckCircle2, Eye, EyeOff,
  Shield, Lock, Star, Mail, KeyRound, AlertCircle, RefreshCw,
} from 'lucide-react';
import { formatUzbekPhone } from '../utils/validation';
import { authSignUp, authSignIn, authResetPassword } from '../services/supabase';

interface AuthLandingProps {
  regions: Region[];
  allDistricts: District[];
  categories: Category[];
  onLoginSuccess: (userData: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    region_id: string;
    district_id: string;
    category_id?: string;
  }) => void;
  onBrowseGuest: () => void;
}

type AuthView = 'register' | 'login' | 'forgot';

export const AuthLanding: React.FC<AuthLandingProps> = ({
  regions,
  allDistricts,
  categories,
  onLoginSuccess,
  onBrowseGuest,
}) => {
  const [view, setView]               = useState<AuthView>('register');
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

  const districts = allDistricts.filter(d => d.region_id === regionId);

  // ─── helpers ─────────────────────────────────────────────

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length < 6) { setPhone('+998 '); return; }
    setPhone(formatUzbekPhone(val));
  };

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const getSupabaseErrorMsg = (msg: string) => {
    if (msg.includes('Invalid login credentials')) return 'Email yoki parol noto\'g\'ri';
    if (msg.includes('Email not confirmed')) return 'Email tasdiqlanmagan. Pochta qutingizni tekshiring';
    if (msg.includes('User already registered')) return 'Bu email allaqachon ro\'yxatdan o\'tgan';
    if (msg.includes('Password should be at least')) return 'Parol kamida 6 ta belgi bo\'lishi kerak';
    if (msg.includes('rate limit')) return 'Ko\'p urinish. Biroz kuting';
    return msg;
  };

  // ─── Register ────────────────────────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Ism va familiyani kiriting'); return; }
    if (!validateEmail(email)) { setError('To\'g\'ri email manzil kiriting'); return; }
    if (password.length < 6) { setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak'); return; }
    if (password !== confirmPass) { setError('Parollar mos kelmadi'); return; }

    setLoading(true);
    try {
      await authSignUp({
        email: email.trim(),
        password,
        name: name.trim(),
        role,
        region_id: regionId,
        district_id: districtId,
        category_id: role === 'master' ? categoryId : undefined,
        phone: phone.replace(/\D/g, '').length >= 12 ? phone : undefined,
      });

      setSuccess(
        `✅ ${email} manzilingizga tasdiqlash xati yuborildi! Emailni tekshirib, havolani bosing.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      setError(getSupabaseErrorMsg(msg));
    } finally {
      setLoading(false);
    }
  };

  // ─── Login ────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) { setError('To\'g\'ri email kiriting'); return; }
    if (!password) { setError('Parolni kiriting'); return; }

    setLoading(true);
    try {
      const { user } = await authSignIn({ email: email.trim(), password });

      if (user) {
        onLoginSuccess({
          name: (user.user_metadata?.name as string) || email.split('@')[0],
          email: user.email || email,
          phone: (user.user_metadata?.phone as string) || '',
          role: ((user.user_metadata?.role as UserRole) || 'client'),
          region_id: (user.user_metadata?.region_id as string) || regionId,
          district_id: (user.user_metadata?.district_id as string) || districtId,
          category_id: user.user_metadata?.category_id as string | undefined,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      setError(getSupabaseErrorMsg(msg));
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password ──────────────────────────────────────

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) { setError('To\'g\'ri email kiriting'); return; }

    setLoading(true);
    try {
      await authResetPassword(email.trim());
      setSuccess(`✅ ${email} manzilingizga parolni tiklash havolasi yuborildi!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      setError(getSupabaseErrorMsg(msg));
    } finally {
      setLoading(false);
    }
  };

  // ─── render helpers ───────────────────────────────────────

  const switchView = (v: AuthView) => {
    setView(v);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPass('');
  };

  // ─── JSX ─────────────────────────────────────────────────

  return (
    <div className="auth-screen">
      <div className="auth-box">

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 28px rgba(59,130,246,0.4)',
            animation: 'pulse-glow 3s ease-in-out infinite',
          }}>
            <Wrench style={{ width: 28, height: 28, color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
            USTA<span style={{ color: '#3B82F6' }}>MIJOZ</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.4rem', fontWeight: 500 }}>
            {view === 'register' && "O'zbekiston xizmatlari platformasi"}
            {view === 'login' && 'Shaxsiy kabinetga kirish'}
            {view === 'forgot' && 'Parolni tiklash'}
          </p>
        </div>

        {/* Trust pills */}
        {view === 'register' && (
          <div style={{ display: 'flex', gap: 7, marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: Shield, label: 'KYC Tasdiqlangan', color: '#10B981' },
              { icon: Lock,   label: '2% Escrow',        color: '#F59E0B' },
              { icon: Star,   label: '14 Viloyat',       color: '#3B82F6' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 99, padding: '4px 11px',
                fontSize: '0.68rem', fontWeight: 700, color,
              }}>
                <Icon style={{ width: 10, height: 10 }} />
                {label}
              </div>
            ))}
          </div>
        )}

        {/* Tab Toggle — login/register */}
        {view !== 'forgot' && (
          <div className="auth-tab-group" style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              className={`auth-tab${view === 'register' ? ' active' : ''}`}
              onClick={() => switchView('register')}
            >
              Ro'yxatdan O'tish
            </button>
            <button
              type="button"
              className={`auth-tab${view === 'login' ? ' active' : ''}`}
              onClick={() => switchView('login')}
            >
              Kirish
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: 'rgba(239,68,68,0.09)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 12, padding: '0.7rem 0.9rem',
            fontSize: '0.8rem', color: '#FCA5A5', fontWeight: 600,
            marginBottom: '1rem',
          }}>
            <AlertCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1, color: '#EF4444' }} />
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: 'rgba(16,185,129,0.09)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 12, padding: '0.8rem 0.9rem',
            fontSize: '0.8rem', color: '#6EE7B7', fontWeight: 600,
            marginBottom: '1rem', lineHeight: 1.55,
          }}>
            <CheckCircle2 style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} />
            {success}
          </div>
        )}

        {/* ─── REGISTER FORM ──────────────────────────────── */}
        {view === 'register' && !success && (
          <form onSubmit={handleRegister}>

            {/* Role picker */}
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

            {/* Full name */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Ism va Familiya</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Jasurbek Rahimov"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email Manzil</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="jasur@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{ paddingLeft: '2.75rem' }}
                />
                <Mail style={{
                  position: 'absolute', left: '0.85rem', top: '50%',
                  transform: 'translateY(-50%)', width: 16, height: 16,
                  color: '#475569', pointerEvents: 'none',
                }} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Parol</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Kamida 6 ta belgi"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                />
                <KeyRound style={{
                  position: 'absolute', left: '0.85rem', top: '50%',
                  transform: 'translateY(-50%)', width: 16, height: 16,
                  color: '#475569', pointerEvents: 'none',
                }} />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', padding: 0,
                  }}
                >
                  {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
              {/* Strength indicator */}
              {password.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 99,
                      background: password.length >= i * 4
                        ? (password.length >= 10 ? '#10B981' : password.length >= 6 ? '#F59E0B' : '#EF4444')
                        : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                  <span style={{ fontSize: '0.65rem', color: '#64748B', alignSelf: 'center', marginLeft: 4 }}>
                    {password.length >= 10 ? 'Kuchli' : password.length >= 6 ? "O'rtacha" : 'Kuchsiz'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Parolni Tasdiqlash</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-input"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Parolni qaytadan kiriting"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{
                    paddingLeft: '2.75rem', paddingRight: '2.75rem',
                    borderColor: confirmPass && confirmPass !== password ? 'rgba(239,68,68,0.5)' : undefined,
                  }}
                />
                <KeyRound style={{
                  position: 'absolute', left: '0.85rem', top: '50%',
                  transform: 'translateY(-50%)', width: 16, height: 16,
                  color: '#475569', pointerEvents: 'none',
                }} />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', padding: 0,
                  }}
                >
                  {showConfirm ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Phone — optional */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                Telefon Raqam
                <span style={{ color: '#475569', fontWeight: 500, marginLeft: 4 }}>(ixtiyoriy)</span>
              </label>
              <input
                className="auth-input"
                type="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={handlePhoneChange}
                autoComplete="tel"
                style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
              />
            </div>

            {/* Region & District */}
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
                <select
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
                <label className="form-label">Mutaxassislik Sohasi</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ width: '100%' }}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_uz}</option>)}
                </select>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.75rem' }}>
              {loading ? (
                <><RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /><span>Ro'yxatdan o'tilmoqda…</span></>
              ) : (
                <><span>Ro'yxatdan O'tish</span><ArrowRight style={{ width: 16, height: 16 }} /></>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button type="button" className="btn-ghost" onClick={onBrowseGuest}>
                <Eye style={{ width: 14, height: 14 }} />
                Ro'yxatdan o'tmasdan ko'rish
              </button>
            </div>

          </form>
        )}

        {/* ─── LOGIN FORM ────────────────────────────────── */}
        {view === 'login' && (
          <form onSubmit={handleLogin}>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email Manzil</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="jasur@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{ paddingLeft: '2.75rem' }}
                />
                <Mail style={{
                  position: 'absolute', left: '0.85rem', top: '50%',
                  transform: 'translateY(-50%)', width: 16, height: 16,
                  color: '#475569', pointerEvents: 'none',
                }} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">Parol</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Parolingizni kiriting"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                />
                <KeyRound style={{
                  position: 'absolute', left: '0.85rem', top: '50%',
                  transform: 'translateY(-50%)', width: 16, height: 16,
                  color: '#475569', pointerEvents: 'none',
                }} />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', padding: 0,
                  }}
                >
                  {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => switchView('forgot')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#3B82F6', fontSize: '0.78rem', fontWeight: 600,
                  fontFamily: 'inherit',
                }}
              >
                Parolni unutdingizmi?
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <><RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /><span>Kirilmoqda…</span></>
              ) : (
                <><span>Tizimga Kirish</span><ArrowRight style={{ width: 16, height: 16 }} /></>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button type="button" className="btn-ghost" onClick={onBrowseGuest}>
                <Eye style={{ width: 14, height: 14 }} />
                Ro'yxatdan o'tmasdan ko'rish
              </button>
            </div>

          </form>
        )}

        {/* ─── FORGOT PASSWORD FORM ──────────────────────── */}
        {view === 'forgot' && !success && (
          <form onSubmit={handleForgotPassword}>
            <div style={{
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 12, padding: '0.85rem 1rem',
              fontSize: '0.8rem', color: '#93C5FD',
              marginBottom: '1.25rem', lineHeight: 1.6,
            }}>
              Ro'yxatdan o'tgan email manzilingizni kiriting. Parolni tiklash havolasi yuboriladi.
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Email Manzil</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="jasur@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{ paddingLeft: '2.75rem' }}
                />
                <Mail style={{
                  position: 'absolute', left: '0.85rem', top: '50%',
                  transform: 'translateY(-50%)', width: 16, height: 16,
                  color: '#475569', pointerEvents: 'none',
                }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <><RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /><span>Yuborilmoqda…</span></>
              ) : (
                <><span>Havolani Yuborish</span><ArrowRight style={{ width: 16, height: 16 }} /></>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button type="button" className="btn-ghost" onClick={() => switchView('login')}>
                ← Kirishga qaytish
              </button>
            </div>

          </form>
        )}

        {/* Success state back to login */}
        {success && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => switchView('login')}
            style={{ marginTop: '0.5rem' }}
          >
            <span>Kirishga O'tish</span>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        )}

      </div>
    </div>
  );
};
