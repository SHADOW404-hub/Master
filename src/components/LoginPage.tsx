import React, { useState, useEffect } from 'react';
import {
  Wrench, Mail, KeyRound, ArrowRight, Eye, EyeOff,
  RefreshCw, AlertCircle, ArrowLeft, Shield, Lock,
} from 'lucide-react';
import { authSignIn, supabase } from '../services/supabase';
import type { UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: (userData: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    region_id: string;
    district_id: string;
    category_id?: string;
  }) => void;
  onGoRegister: () => void;
  onGoLanding: () => void;
  onForgotPassword: () => void;
}

const getSupabaseErrorMsg = (msg: string): string => {
  if (msg.includes('Invalid login credentials')) return "Email yoki parol noto'g'ri. Tekshirib qayta urinib ko'ring.";
  if (msg.includes('Email not confirmed')) return 'Email tasdiqlanmagan. Pochta qutingizni tekshiring.';
  if (msg.includes('rate limit') || msg.includes('too many')) return "Ko'p urinish. Biroz kuting va qayta urinib ko'ring.";
  if (msg.includes('network') || msg.includes('fetch')) return "Internet aloqasi yo'q. Tarmoqni tekshiring.";
  return 'Kutilmagan xatolik. Qayta urinib ko\'ring.';
};

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onGoRegister,
  onGoLanding,
  onForgotPassword,
}) => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted]     = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    // Remembered email restore
    const remembered = localStorage.getItem('usta_remember_email');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
    return () => clearTimeout(t);
  }, []);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) { setError('Email manzilini kiriting'); return; }
    if (!validateEmail(trimmedEmail)) { setError("To'g'ri email manzil kiriting (masalan: name@example.com)"); return; }
    if (!password) { setError('Parolni kiriting'); return; }
    if (password.length < 6) { setError('Parol kamida 6 ta belgidan iborat'); return; }

    setLoading(true);
    try {
      const { user, session } = await authSignIn({ email: trimmedEmail, password });

      if (!user || !session) {
        setError("Tizimga kirish amalga oshmadi. Qayta urinib ko'ring.");
        return;
      }

      // Remember email preference
      if (rememberMe) {
        localStorage.setItem('usta_remember_email', trimmedEmail);
      } else {
        localStorage.removeItem('usta_remember_email');
      }

      // Supabase profiles jadvalidan haqiqiy ma'lumot olish
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, email, phone, role, region_id, district_id, category_id')
        .eq('id', user.id)
        .single();

      if (profile) {
        onLoginSuccess({
          id: profile.id,
          name: profile.name || trimmedEmail.split('@')[0],
          email: profile.email || trimmedEmail,
          phone: profile.phone || '',
          role: (profile.role as UserRole) || 'client',
          region_id: profile.region_id || '',
          district_id: profile.district_id || '',
          category_id: profile.category_id || undefined,
        });
      } else {
        // Profil yo'q bo'lsa — user_metadata dan foydalanish (fallback)
        onLoginSuccess({
          id: user.id,
          name: (user.user_metadata?.name as string) || trimmedEmail.split('@')[0],
          email: user.email || trimmedEmail,
          phone: (user.user_metadata?.phone as string) || '',
          role: ((user.user_metadata?.role as UserRole) || 'client'),
          region_id: (user.user_metadata?.region_id as string) || '',
          district_id: (user.user_metadata?.district_id as string) || '',
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>

      {/* ── LEFT PANEL (decoration) — mobilda yashiriladi ── */}
      <div className="login-left-panel">
        <div style={{ maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '3rem' }}>
            <div style={{
              width: 44, height: 44,
              background: 'linear-gradient(135deg, #3B82F6, #10B981)',
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
            }}>
              <Wrench style={{ width: 22, height: 22, color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.02em' }}>
              USTA<span style={{ color: '#3B82F6' }}>MIJOZ</span>
            </span>
          </div>

          <h2 style={{
            fontSize: '2.6rem', fontWeight: 900, color: '#fff',
            lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '1.25rem',
          }}>
            Xush Kelibsiz
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #3B82F6, #10B981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Qaytib!</span>
          </h2>

          <p style={{ color: '#64748B', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '2.5rem' }}>
            Shaxsiy kabinetingizga kiring va ustalar bilan ishingizni davom ettiring.
          </p>

          {/* Feature pills */}
          {[
            { icon: Shield, label: 'KYC Tasdiqlangan Ustalar', color: '#10B981' },
            { icon: Lock, label: "Escrow To'lov Himoyasi", color: '#F59E0B' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '0.85rem 1.1rem',
              marginBottom: 10,
              transition: 'background 0.2s',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon style={{ width: 17, height: 17, color }} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8' }}>{label}</span>
            </div>
          ))}

          {/* Decorative orb */}
          <div style={{
            position: 'absolute', bottom: '10%', left: '10%',
            width: 200, height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="login-right-panel">

        {/* Back button */}
        <button
          id="login-back-btn"
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
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 56, height: 56,
              background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
              borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.1rem',
              boxShadow: '0 8px 28px rgba(59,130,246,0.45)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}>
              <Wrench style={{ width: 26, height: 26, color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
              Tizimga Kirish
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.35rem', fontWeight: 500 }}>
              Shaxsiy kabinetingizga xush kelibsiz
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div
              id="login-error-alert"
              role="alert"
              aria-live="polite"
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

          {/* Form */}
          <form onSubmit={handleLogin} noValidate>
            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="login-email" className="form-label">Email Manzil</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  placeholder="sizning@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (error) setError(''); }}
                  required
                  autoComplete="email"
                  autoFocus
                  style={{ paddingLeft: '2.75rem' }}
                />
                <Mail style={{
                  position: 'absolute', left: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)', width: 16, height: 16,
                  color: '#475569', pointerEvents: 'none',
                }} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '0.6rem' }}>
              <label htmlFor="login-password" className="form-label">Parol</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  className="auth-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Parolingizni kiriting"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                  required
                  autoComplete="current-password"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                />
                <KeyRound style={{
                  position: 'absolute', left: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)', width: 16, height: 16,
                  color: '#475569', pointerEvents: 'none',
                }} />
                <button
                  type="button"
                  id="login-toggle-pass"
                  onClick={() => setShowPass(p => !p)}
                  aria-label={showPass ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', padding: 0, lineHeight: 0,
                  }}
                >
                  {showPass
                    ? <EyeOff style={{ width: 16, height: 16 }} />
                    : <Eye style={{ width: 16, height: 16 }} />
                  }
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '1.5rem',
            }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 7,
                cursor: 'pointer', fontSize: '0.78rem', color: '#64748B',
              }}>
                <input
                  id="login-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#3B82F6', width: 14, height: 14 }}
                />
                Eslab qolish
              </label>
              <button
                type="button"
                id="login-forgot-btn"
                onClick={onForgotPassword}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#3B82F6', fontSize: '0.78rem', fontWeight: 600,
                  fontFamily: 'inherit', padding: 0,
                  transition: 'color 0.2s',
                }}
              >
                Parolni unutdingizmi?
              </button>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                  <span>Kirilmoqda…</span>
                </>
              ) : (
                <>
                  <span>Tizimga Kirish</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '1.5rem 0', color: '#334155', fontSize: '0.75rem',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span>yoki</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Register link */}
          <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748B' }}>
            Hali a'zo emassiz?{' '}
            <button
              id="login-go-register-btn"
              type="button"
              onClick={onGoRegister}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#3B82F6', fontWeight: 700, fontSize: '0.82rem',
                fontFamily: 'inherit', padding: 0,
                transition: 'color 0.2s',
              }}
            >
              Ro'yxatdan o'tish →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .login-left-panel {
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
        .login-left-panel::before {
          content: '';
          position: absolute;
          top: 20%;
          left: 20%;
          width: 60%;
          height: 60%;
          background: radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-right-panel {
          flex: 1;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem 3rem;
          position: relative;
          overflow-y: auto;
        }
        .login-right-panel .auth-box {
          width: 100%;
          max-width: 420px;
        }
        @media (max-width: 768px) {
          .login-left-panel { display: none; }
          .login-right-panel {
            padding: 4.5rem 1.25rem 2rem;
            min-height: 100vh;
            width: 100%;
          }
        }
        @media (max-width: 360px) {
          .login-right-panel { padding: 4rem 1rem 2rem; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
