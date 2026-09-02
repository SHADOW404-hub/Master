import React, { useState, useEffect } from 'react';
import {
  Wrench, Mail, ArrowRight, RefreshCw,
  AlertCircle, CheckCircle2, ArrowLeft,
} from 'lucide-react';
import { authResetPassword } from '../services/supabase';

interface ForgotPasswordPageProps {
  onGoLogin: () => void;
  onGoLanding: () => void;
}

const getSupabaseErrorMsg = (msg: string): string => {
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Ko\'p urinish. Bir necha daqiqa kuting.';
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Internet aloqasi yo\'q. Tarmoqni tekshiring.';
  return 'Xatolik yuz berdi. Qayta urinib ko\'ring.';
};

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onGoLogin }) => {
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

    if (!email.trim()) { setError('Email manzilini kiriting'); return; }
    if (!validateEmail(email.trim())) { setError('To\'g\'ri email manzil kiriting'); return; }

    setLoading(true);
    try {
      await authResetPassword(email.trim().toLowerCase());
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xatolik yuz berdi';
      setError(getSupabaseErrorMsg(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div
        className="auth-box"
        style={{
          maxWidth: 420,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
          transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)',
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
              width: 60, height: 60, borderRadius: 16,
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <CheckCircle2 style={{ width: 28, height: 28, color: '#10B981' }} />
            </div>
            <h2 style={{ fontWeight: 900, fontSize: '1.4rem', color: '#fff', marginBottom: '0.75rem' }}>
              Xat Yuborildi!
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '0.5rem' }}>
              <span style={{ color: '#6EE7B7', fontWeight: 700 }}>{email}</span> manzilingizga
              parolni tiklash havolasi yuborildi.
            </p>
            <p style={{ color: '#475569', fontSize: '0.78rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Pochta qutingizni tekshiring. Xat kelmasa, spam papkasini ham tekshiring.
              Havola 1 soat davomida faol bo'ladi.
            </p>
            <button
              id="forgot-success-login-btn"
              className="btn-primary"
              onClick={onGoLogin}
            >
              <span>Kirishga O'tish</span>
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 52, height: 52,
                background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 28px rgba(59,130,246,0.4)',
                animation: 'pulse-glow 3s ease-in-out infinite',
              }}>
                <Wrench style={{ width: 24, height: 24, color: '#fff' }} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
                Parolni Tiklash
              </h1>
              <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.35rem' }}>
                Email manzilingizni kiriting
              </p>
            </div>

            {/* Info box */}
            <div style={{
              background: 'rgba(59,130,246,0.07)',
              border: '1px solid rgba(59,130,246,0.18)',
              borderRadius: 12, padding: '0.85rem 1rem',
              fontSize: '0.8rem', color: '#93C5FD',
              marginBottom: '1.5rem', lineHeight: 1.6,
            }}>
              Ro'yxatdan o'tgan email manzilingizni kiriting. Biz parolni tiklash havolasini yuboramiz.
            </div>

            {/* Error */}
            {error && (
              <div
                id="forgot-error-alert"
                role="alert"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 9,
                  background: 'rgba(239,68,68,0.09)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 12, padding: '0.75rem 0.9rem',
                  fontSize: '0.8rem', color: '#FCA5A5', fontWeight: 600,
                  marginBottom: '1.25rem', lineHeight: 1.5,
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
