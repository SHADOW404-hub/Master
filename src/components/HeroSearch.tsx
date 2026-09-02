import React, { useRef } from 'react';
import type { Category, Region } from '../types';
import { Search, Shield, Lock, Wrench, Zap, Hammer, Tv, Sofa, Wind, CheckCircle2, SlidersHorizontal } from 'lucide-react';

interface HeroSearchProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedRegion?: Region;
  totalMastersFound: number;
}

const CATEGORY_STYLE: Record<string, { icon: React.ElementType; color: string; bg: string; glow: string }> = {
  'cat-santexnik':  { icon: Wrench,  color: '#3B82F6', bg: 'rgba(59,130,246,0.14)',  glow: 'rgba(59,130,246,0.3)' },
  'cat-elektrchi':  { icon: Zap,     color: '#F59E0B', bg: 'rgba(245,158,11,0.14)', glow: 'rgba(245,158,11,0.3)' },
  'cat-quruvchi':   { icon: Hammer,  color: '#EC4899', bg: 'rgba(236,72,153,0.14)',  glow: 'rgba(236,72,153,0.3)' },
  'cat-maishiy':    { icon: Tv,      color: '#06B6D4', bg: 'rgba(6,182,212,0.14)',   glow: 'rgba(6,182,212,0.3)' },
  'cat-mebel':      { icon: Sofa,    color: '#8B5CF6', bg: 'rgba(139,92,246,0.14)',  glow: 'rgba(139,92,246,0.3)' },
  'cat-konditsioner':{ icon: Wind,   color: '#10B981', bg: 'rgba(16,185,129,0.14)', glow: 'rgba(16,185,129,0.3)' },
};

const DEFAULT_STYLE = { icon: Wrench, color: '#3B82F6', bg: 'rgba(59,130,246,0.14)', glow: 'rgba(59,130,246,0.3)' };

const TRUST_BADGES = [
  { icon: Shield,       label: 'KYC Pasport Tasdiqlangan', color: 'text-emerald-400' },
  { icon: Lock,         label: "2% Escrow Kafolati",       color: 'text-amber-400' },
  { icon: CheckCircle2, label: '14 Ta Viloyat',            color: 'text-blue-400' },
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  selectedRegion,
  totalMastersFound,
}) => {
  const searchRef = useRef<HTMLInputElement>(null);

  const handleClearAll = () => {
    setSelectedCategory('');
    setSearchQuery('');
    searchRef.current?.focus();
  };

  const isFiltered = !!selectedCategory || !!searchQuery;

  return (
    <section style={{ position: 'relative', paddingTop: '2rem', paddingBottom: '1.5rem' }}>

      {/* ── Ambient background glow ── */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '90%', maxWidth: 900, height: 280,
        background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.13) 0%, rgba(16,185,129,0.07) 50%, transparent 80%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>

        {/* ── Trust Badge Pills ── */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center',
          gap: '0.5rem 1rem', marginBottom: '1.5rem',
          padding: '0.55rem 1.25rem',
          borderRadius: 99,
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.09)',
          backdropFilter: 'blur(12px)',
        }}>
          {TRUST_BADGES.map(({ icon: Icon, label, color }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <span style={{ color: '#334155', fontSize: '0.6rem' }}>●</span>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }} className={color}>
                <Icon style={{ width: 13, height: 13 }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* ── Hero Title ── */}
        <h1 style={{
          fontSize: 'clamp(1.75rem, 5vw, 3.25rem)',
          fontWeight: 900,
          color: '#fff',
          lineHeight: 1.15,
          letterSpacing: '-0.035em',
          marginBottom: '0.85rem',
        }}>
          O'zbekistondagi Eng Yaxshi{' '}
          <span style={{
            background: 'linear-gradient(135deg, #60A5FA, #818CF8, #34D399)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Ustalarni Toping
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(0.82rem, 2vw, 1rem)',
          color: '#94A3B8',
          maxWidth: 580,
          margin: '0 auto 1.75rem',
          lineHeight: 1.7,
          fontWeight: 500,
        }}>
          To'lovni platformada muzlatib qo'ying — pul faqat ishni qabul qilganingizdan keyin ustaga o'tadi.
        </p>

        {/* ── Search Bar ── */}
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(10,15,28,0.9)',
            border: '1.5px solid rgba(59,130,246,0.3)',
            borderRadius: 18,
            padding: '0.35rem',
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5), 0 0 40px -15px rgba(59,130,246,0.2)',
            backdropFilter: 'blur(20px)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
            onFocusCapture={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.7)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px -10px rgba(0,0,0,0.5), 0 0 50px -10px rgba(59,130,246,0.3)';
            }}
            onBlurCapture={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.3)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px -10px rgba(0,0,0,0.5), 0 0 40px -15px rgba(59,130,246,0.2)';
            }}
          >
            <Search style={{ width: 20, height: 20, color: '#4B6A8B', marginLeft: '0.85rem', flexShrink: 0 }} />
            <input
              ref={searchRef}
              id="hero-search-input"
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Santexnik, elektrik, mebel yig'ish, kabel tortish..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#F1F5F9', padding: '0.7rem 0.75rem',
                fontSize: 'clamp(0.8rem, 2vw, 0.925rem)',
                fontFamily: 'inherit', fontWeight: 500,
              }}
            />
            {isFiltered && (
              <button
                onClick={handleClearAll}
                title="Filtrlarni tozalash"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '0.45rem 0.7rem',
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 10, cursor: 'pointer',
                  color: '#F87171', fontSize: '0.7rem', fontWeight: 700,
                  fontFamily: 'inherit', marginRight: 4, whiteSpace: 'nowrap',
                  transition: 'background 0.2s',
                }}
              >
                <SlidersHorizontal style={{ width: 12, height: 12 }} />
                Tozalash
              </button>
            )}
            <button
              id="hero-search-btn"
              onClick={() => searchRef.current?.focus()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0.7rem 1.25rem',
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                border: 'none', borderRadius: 13,
                color: '#fff', fontSize: '0.85rem', fontWeight: 800,
                fontFamily: 'inherit', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(37,99,235,0.45)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(37,99,235,0.6)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(37,99,235,0.45)';
              }}
            >
              <Search style={{ width: 15, height: 15 }} />
              Qidirish
            </button>
          </div>
        </div>

        {/* ── Category Tiles ── */}
        <div style={{ paddingTop: '1.5rem' }}>
          <p style={{
            fontSize: '0.7rem', fontWeight: 700, color: '#475569',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: '0.75rem',
          }}>
            Xizmat Turlari
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '0.6rem',
            maxWidth: 720, margin: '0 auto',
          }}>
            {categories.map((cat) => {
              const style = CATEGORY_STYLE[cat.id] || DEFAULT_STYLE;
              const IconComp = style.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  onClick={() => setSelectedCategory(isSelected ? '' : cat.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: '0.45rem',
                    padding: '0.85rem 0.5rem',
                    borderRadius: 16,
                    border: isSelected
                      ? `1.5px solid ${style.color}`
                      : '1.5px solid rgba(255,255,255,0.07)',
                    background: isSelected
                      ? style.bg
                      : 'rgba(10,15,28,0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                    boxShadow: isSelected ? `0 8px 24px -6px ${style.glow}` : 'none',
                    backdropFilter: 'blur(12px)',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.borderColor = `${style.color}55`;
                      (e.currentTarget as HTMLElement).style.background = style.bg;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(10,15,28,0.6)';
                    }
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: style.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s',
                  }}>
                    <IconComp style={{ width: 18, height: 18, color: style.color }} />
                  </div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    color: isSelected ? '#fff' : '#94A3B8',
                    lineHeight: 1.3, textAlign: 'center',
                    transition: 'color 0.2s',
                  }}>
                    {cat.name_uz}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Live Results Counter ── */}
        <div style={{
          marginTop: '1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontSize: '0.78rem', color: '#64748B', fontWeight: 500,
        }}>
          <span>
            {selectedRegion ? `${selectedRegion.name_uz} viloyatida` : "Butun O'zbekiston bo'yicha"}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0.25rem 0.85rem', borderRadius: 99,
            background: totalMastersFound > 0 ? 'rgba(59,130,246,0.15)' : 'rgba(100,116,139,0.15)',
            border: `1px solid ${totalMastersFound > 0 ? 'rgba(59,130,246,0.3)' : 'rgba(100,116,139,0.2)'}`,
            color: totalMastersFound > 0 ? '#93C5FD' : '#64748B',
            fontWeight: 800, fontSize: '0.75rem',
          }}>
            {totalMastersFound > 0 && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', animation: 'pulse-glow 2s ease-in-out infinite' }} />
            )}
            {totalMastersFound} ta usta topildi
          </span>
        </div>

      </div>
    </section>
  );
};

export default HeroSearch;
