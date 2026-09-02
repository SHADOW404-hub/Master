import React, { useEffect, useRef } from 'react';
import {
  Wrench, Shield, Lock, Star, ArrowRight, CheckCircle2,
  Users, MapPin, Clock, Award, ChevronDown, Zap, Handshake,
  TrendingUp,
} from 'lucide-react';

interface LandingPageProps {
  onGoLogin: () => void;
  onGoRegister: () => void;
  onBrowseGuest: () => void;
}

const STATS = [
  { value: '14+', label: "Viloyat", icon: MapPin },
  { value: '2 800+', label: "Tasdiqlangan Ustalar", icon: Award },
  { value: '98%', label: "Muvaffaqiyatli Buyurtmalar", icon: TrendingUp },
  { value: '2%', label: "Escrow Komissiya", icon: Shield },
];

const FEATURES = [
  {
    icon: Shield,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
    title: 'KYC Pasport Tekshiruvi',
    desc: 'Har bir usta pasport va hujjatlari orqali tasdiqlanadi. Soxta profil mavjud emas.',
  },
  {
    icon: Lock,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    title: 'Escrow To\'lov Tizimi',
    desc: 'Pulni avans o\'tkazmaysiz. Ish bajarilgandan keyin usta pul oladi. 2% xizmat haqi.',
  },
  {
    icon: Star,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.1)',
    title: 'Baholash va Sharhlar',
    desc: 'Faqat haqiqiy buyurtmachilar baho qoldira oladi. Sifatni oldindan biling.',
  },
  {
    icon: Clock,
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.1)',
    title: 'Tez Topish',
    desc: 'Viloyat va tuman bo\'yicha filtrlash. Bitta qidiruv bilan eng yaqin ustani toping.',
  },
  {
    icon: Handshake,
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.1)',
    title: 'Nizo Hal Qilish',
    desc: 'Muammo yuzaga kelsa, admin dasturchi komandasimiz 24 soat ichida hal qiladi.',
  },
  {
    icon: Zap,
    color: '#F97316',
    bg: 'rgba(249,115,22,0.1)',
    title: 'Tezkor Buyurtma',
    desc: 'Bir necha soniya ichida buyurtma bering. SMS va email orqali bildirishnoma.',
  },
];

const HOW_IT_WORKS = [
  { num: '01', title: 'Usta Tanlang', desc: 'Hudud va soha bo\'yicha filtrlang, ustalarni taqqoslang.' },
  { num: '02', title: 'Escrow\'ga To\'lang', desc: 'Pul platformada xavfsiz muzlatiladi, ustaga o\'tmaydi.' },
  { num: '03', title: 'Ishni Tasdiqlang', desc: 'Ish tugagach tasdiqlayman, pul ustaga o\'tadi.' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGoLogin, onGoRegister, onBrowseGuest }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated particles background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.4 + 0.08,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,130,246,${p.alpha})`;
        ctx.fill();
      });

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(59,130,246,${0.07 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {/* Animated canvas background */}
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      />

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
            }}>
              <Wrench style={{ width: 20, height: 20, color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>
              USTA<span style={{ color: '#3B82F6' }}>MIJOZ</span>
            </span>
            <span style={{
              fontSize: '0.6rem', background: 'rgba(16,185,129,0.15)',
              color: '#34D399', border: '1px solid rgba(16,185,129,0.3)',
              padding: '2px 8px', borderRadius: 99, fontWeight: 700, marginLeft: 4,
            }}>BETA</span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              id="landing-guest-btn"
              onClick={onBrowseGuest}
              className="btn-ghost"
              style={{ fontSize: '0.82rem' }}
            >
              Kuzatuvchi sifatida
            </button>
            <button
              id="landing-login-btn"
              onClick={onGoLogin}
              className="btn-secondary"
              style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.82rem' }}
            >
              Kirish
            </button>
            <button
              id="landing-register-btn"
              onClick={onGoRegister}
              className="btn-primary"
              style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.82rem' }}
            >
              Ro'yxatdan O'tish
            </button>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="landing-hero" style={{ position: 'relative', zIndex: 1 }}>
        {/* Glow blob */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%',
          transform: 'translateX(-50%)',
          width: 700, height: 400,
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 780, margin: '0 auto', padding: '0 1.5rem' }}>
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 99, padding: '6px 16px',
            fontSize: '0.75rem', fontWeight: 700, color: '#93C5FD',
            marginBottom: '1.75rem',
            animation: 'fadeUp 0.6s ease forwards',
          }}>
            <Zap style={{ width: 12, height: 12 }} />
            O'zbekistonning #1 Usta-Mijoz Platformasi
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
            fontWeight: 900, lineHeight: 1.08,
            letterSpacing: '-0.035em',
            color: '#fff',
            animation: 'fadeUp 0.6s 0.1s ease both',
          }}>
            Ishonchli Ustani{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3B82F6, #10B981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Tez Toping
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#94A3B8', marginTop: '1.25rem', lineHeight: 1.7,
            animation: 'fadeUp 0.6s 0.2s ease both',
          }}>
            KYC tasdiqlangan ustalar. Escrow to'lov tizimi. 14 viloyat bo'yicha xizmat.
            <br />Pul xavfsizligingiz — bizning mas'uliyatimiz.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center',
            marginTop: '2.25rem', flexWrap: 'wrap',
            animation: 'fadeUp 0.6s 0.3s ease both',
          }}>
            <button
              id="hero-register-btn"
              onClick={onGoRegister}
              className="btn-primary"
              style={{
                width: 'auto', padding: '0.9rem 2rem',
                fontSize: '0.95rem', borderRadius: 14,
                boxShadow: '0 8px 32px rgba(37,99,235,0.45)',
              }}
            >
              Bepul Boshlash
              <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
            <button
              id="hero-browse-btn"
              onClick={onBrowseGuest}
              className="btn-secondary"
              style={{
                width: 'auto', padding: '0.9rem 2rem',
                fontSize: '0.95rem', borderRadius: 14,
              }}
            >
              <Users style={{ width: 16, height: 16 }} />
              Ustalarni Ko'rish
            </button>
          </div>

          {/* Trust badges */}
          <div style={{
            display: 'flex', gap: 8, justifyContent: 'center',
            marginTop: '2rem', flexWrap: 'wrap',
            animation: 'fadeUp 0.6s 0.4s ease both',
          }}>
            {[
              { icon: Shield, label: 'KYC Verified', color: '#10B981' },
              { icon: Lock, label: 'Escrow Protected', color: '#F59E0B' },
              { icon: CheckCircle2, label: 'Ro\'yxatdan o\'tish bepul', color: '#3B82F6' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 99, padding: '5px 12px',
                fontSize: '0.72rem', fontWeight: 700, color,
              }}>
                <Icon style={{ width: 11, height: 11 }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 4, marginTop: '4rem', color: '#475569', fontSize: '0.7rem',
          fontWeight: 600, letterSpacing: '0.05em', animation: 'bounce 2s infinite',
        }}>
          <span>PASTGA SURING</span>
          <ChevronDown style={{ width: 16, height: 16 }} />
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="stat-card">
              <Icon style={{ width: 22, height: 22, color: '#3B82F6', marginBottom: 8 }} />
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8', marginTop: 6 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '3rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
              Nima Uchun <span style={{
                background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>UstaMijoz?</span>
            </h2>
            <p style={{ color: '#64748B', marginTop: '0.75rem', fontSize: '1rem' }}>
              Boshqa platformalardan farqli, biz xavfsizlikni birinchi o'ringa qo'yamiz
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="feature-card">
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem', flexShrink: 0,
                }}>
                  <Icon style={{ width: 22, height: 22, color }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  {title}
                </h3>
                <p style={{ fontSize: '0.83rem', color: '#64748B', lineHeight: 1.65 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '3rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
              Qanday Ishlaydi?
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 0, flexDirection: 'column' }}>
            {HOW_IT_WORKS.map(({ num, title, desc }, idx) => (
              <div key={num} style={{
                display: 'flex', gap: 24, alignItems: 'flex-start',
                padding: '1.5rem 0',
                borderBottom: idx < HOW_IT_WORKS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(16,185,129,0.1))',
                  border: '1px solid rgba(59,130,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '1rem', color: '#3B82F6',
                  fontFamily: 'monospace',
                }}>
                  {num}
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', marginBottom: 4 }}>{title}</h3>
                  <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '3rem 1.5rem 6rem' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto', textAlign: 'center',
          background: 'rgba(10,15,28,0.8)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 28, padding: '3.5rem 2rem',
          boxShadow: '0 0 80px -20px rgba(59,130,246,0.2)',
          backdropFilter: 'blur(24px)',
        }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #3B82F6, #10B981)',
            borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 28px rgba(59,130,246,0.4)',
          }}>
            <Wrench style={{ width: 32, height: 32, color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
            Bugun Boshlang
          </h2>
          <p style={{ color: '#64748B', marginTop: '0.75rem', lineHeight: 1.7 }}>
            Ro'yxatdan o'tish bepul va bir daqiqa vaqt oladi.
            O'zbekiston bo'yicha 2 800+ tasdiqlangan usta kutmoqda.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button
              id="cta-register-btn"
              onClick={onGoRegister}
              className="btn-primary"
              style={{ width: 'auto', padding: '0.85rem 2rem', fontSize: '0.95rem', borderRadius: 14 }}
            >
              Ro'yxatdan O'tish
              <ArrowRight style={{ width: 17, height: 17 }} />
            </button>
            <button
              id="cta-login-btn"
              onClick={onGoLogin}
              className="btn-secondary"
              style={{ width: 'auto', padding: '0.85rem 2rem', fontSize: '0.95rem', borderRadius: 14 }}
            >
              Allaqachon a'zomisiz? Kirish
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '2rem 1.5rem', textAlign: 'center',
        color: '#475569', fontSize: '0.78rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 6 }}>
          <Wrench style={{ width: 14, height: 14, color: '#3B82F6' }} />
          <span style={{ fontWeight: 800, color: '#94A3B8' }}>
            USTA<span style={{ color: '#3B82F6' }}>MIJOZ</span>.UZ
          </span>
        </div>
        <p>© 2026 UstaMijoz. O'zbekistonning ishonchli usta-mijoz platformasi.</p>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }

        .landing-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(7,11,20,0.9);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 0 1.5rem;
          height: 62px;
          display: flex;
          align-items: center;
        }

        .landing-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .landing-hero {
          padding: 6rem 1.5rem 3rem;
          text-align: center;
          position: relative;
        }

        .stat-card {
          background: rgba(13,20,36,0.7);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 1.75rem 1.5rem;
          text-align: center;
          backdrop-filter: blur(16px);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59,130,246,0.3);
        }

        .feature-card {
          background: rgba(13,20,36,0.65);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 1.75rem;
          backdrop-filter: blur(16px);
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(59,130,246,0.25);
          box-shadow: 0 20px 40px -12px rgba(37,99,235,0.18);
        }

        @media (max-width: 600px) {
          .landing-header nav .btn-ghost { display: none; }
          .landing-hero { padding: 4rem 1rem 2rem; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
