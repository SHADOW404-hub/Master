import React, { useState, useEffect } from 'react';
import {
  Wrench, Mail, ArrowRight, RefreshCw,
  AlertCircle, CheckCircle2, ArrowLeft, ShieldCheck,
} from 'lucide-react';
import { authResetPassword } from '../services/supabase';

interface ForgotPasswordPageProps {
  onGoLogin: () => void;
  onGoLanding: () => void;
}

const getSupabaseErrorMsg = (msg: string): string => {
  if (msg.includes('rate limit') || msg.includes('too many'))
    return "Ko'p urinish. Bir necha daqiqa kuting.";
  if (msg.includes('network') || msg.includes('fetch'))
    return "Internet aloqasi yo'q. Tarmoqni tekshiring.";
  if (msg.includes('User not found') || msg.includes('not found'))
    return "Bu email bilan ro'yxatdan o'tilmagan. Tekshirib ko'ring.";
  return 'Xatolik yuz berdi. Qayta urinib ko\'ring.';
};

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onGoLogin, onGoLanding }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setError('Email manzilini kiriting'); return; }
    if (!validateEmail(trimmed)) { setError("To'g'ri email manzil kiriting"); return; }

    setLoading(true);
    try {
      await authResetPassword(trimmed);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      setError(getSupabaseErrorMsg(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 60%)',
      }} />

      {/* Back to landing button */}
      <button
        id="forgot-back-landing-btn"
        onClick={onGoLanding}
        className="btn-ghost"
        style={{ position: 'fixed', top: '1.5rem', left: '1.5rem', zIndex: 10 }}
      >
        <ArrowLeft style={{ width: 15, height: 15 }} />
        Bosh sahifaga
      </button>

      <div
        className="auth-box"
        style={{
          maxWidth: 420,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
          transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Back button */}
        <button
          id="forgot-back-btn"
          onClick={onGoLogin}
          className="btn-ghost"
          style={{ marginBottom: '1.5rem', padding: '0.4rem 0' }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Kirishga qaytish
        </button>

        {/* Success state */}
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}>
              <CheckCircle2 style={{ width: 30, height: 30, color: '#10B981' }} />
            </div>
            <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#fff', marginBottom: '0.75rem' }}>
              Xat Yuborildi!
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '0.5rem' }}>
              <span style={{ color: '#6EE7B7', fontWeight: 700 }}>{email.trim().toLowerCase()}</span> manzilingizga
              parolni tiklash havolasi yuborildi.
            </p>
            <p style={{ color: '#475569', fontSize: '0.78rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Pochta qutingizni tekshiring. Xat kelmasa, spam papkasini ham ko'ring.
              Havola <strong style={{ color: '#93C5FD' }}>1 soat</strong> davomida faol bo'ladi.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                id="forgot-success-login-btn"
                className="btn-primary"
                onClick={onGoLogin}
              >
                <span>Kirishga O'tish</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
              <button
                type="button"
                onClick={() => { setSuccess(false); setEmail(''); }}
                className="btn-ghost"
                style={{ justifyContent: 'center' }}
              >
                Qayta yuborish
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 54, height: 54,
                background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                borderRadius: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 28px rgba(59,130,246,0.45)',
                animation: 'pulse-glow 3s ease-in-out infinite',
              }}>
                <ShieldCheck style={{ width: 26, height: 26, color: '#fff' }} />
              </div>
              <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
                Parolni Tiklash
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.35rem' }}>
                Email manzilingizga havola yuboramiz
              </p>
            </div>

            {/* Info box */}
            <div style={{
              background: 'rgba(59,130,246,0.07)',
              border: '1px solid rgba(59,130,246,0.18)',
              borderRadius: 12, padding: '0.9rem 1rem',
              fontSize: '0.8rem', color: '#93C5FD',
              marginBottom: '1.5rem', lineHeight: 1.6,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <Wrench style={{ width: 15, height: 15, flexShrink: 0, marginTop: 2, color: '#60A5FA' }} />
              <span>
                Ro'yxatdan o'tgan email manzilingizni kiriting. Parolni tiklash havolasini shu manzilga yuboramiz.
              </span>
            </div>

            {/* Error */}
            {error && (
              <div
                id="forgot-error-alert"
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
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="forgot-email" className="form-label">Email Manzil</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="forgot-email"
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

              <button
                id="forgot-submit-btn"
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                    <span>Yuborilmoqda…</span>
                  </>
                ) : (
                  <>
                    <span>Havolani Yuborish</span>
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
