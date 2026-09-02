import React from 'react';
import type { Master, Region, District } from '../types';
import { Star, ShieldCheck, MapPin, Phone, Clock, ChevronRight, Briefcase } from 'lucide-react';

interface MasterCardProps {
  master: Master;
  regions: Region[];
  allDistricts: District[];
  onOpenDetail: (m: Master) => void;
}

export const MasterCard: React.FC<MasterCardProps> = ({
  master,
  regions,
  allDistricts,
  onOpenDetail,
}) => {
  const regionName = regions.find(r => r.id === master.region_id)?.name_uz || '';
  const districtName = allDistricts.find(d => d.id === master.district_id)?.name_uz || '';
  const locationLabel = [districtName, regionName].filter(Boolean).join(', ');

  const isVerified = master.passport_kyc.status === 'verified';
  const isAvailable = master.status === 'available';

  // Avatar fallback
  const avatarSrc = master.avatar && master.avatar.startsWith('http')
    ? master.avatar
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(master.name)}&backgroundColor=1D4ED8`;

  return (
    <article
      className="glass-card flex flex-col justify-between relative group"
      style={{
        border: isVerified
          ? '1px solid rgba(16,185,129,0.2)'
          : '1px solid rgba(255,255,255,0.08)',
        padding: '1.25rem',
        borderRadius: 22,
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* KYC badge — top right */}
      {isVerified && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.35)',
          borderRadius: 99, padding: '0.2rem 0.6rem',
          fontSize: '0.65rem', fontWeight: 800, color: '#34D399',
        }}>
          <ShieldCheck style={{ width: 11, height: 11 }} />
          KYC
        </div>
      )}

      {/* ── Profile Header ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '0.85rem' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={avatarSrc}
              alt={master.name}
              loading="lazy"
              style={{
                width: 58, height: 58,
                borderRadius: 16,
                objectFit: 'cover',
                border: isVerified
                  ? '2px solid rgba(16,185,129,0.5)'
                  : '2px solid rgba(59,130,246,0.35)',
                transition: 'border-color 0.3s',
              }}
              onError={e => {
                (e.currentTarget as HTMLImageElement).src =
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(master.name)}&backgroundColor=1D4ED8`;
              }}
            />
            {/* Online dot */}
            {isAvailable && (
              <div style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 12, height: 12, borderRadius: '50%',
                background: '#10B981',
                border: '2px solid #0D1424',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }} />
            )}
          </div>

          {/* Name & category */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{
              fontWeight: 800, fontSize: '0.975rem', color: '#F1F5F9',
              marginBottom: '0.2rem',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              transition: 'color 0.2s',
            }}
              className="group-hover:text-blue-400"
            >
              {master.name}
            </h3>
            <p style={{
              fontSize: '0.72rem', fontWeight: 700, color: '#60A5FA',
              marginBottom: '0.3rem',
            }}>
              {master.category_name}
            </p>
            {locationLabel && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: '#64748B' }}>
                <MapPin style={{ width: 11, height: 11, color: '#F87171', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {locationLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.35)', borderRadius: 12,
          padding: '0.55rem 0.85rem', marginBottom: '0.85rem',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Star style={{ width: 15, height: 15, color: '#FBBF24', fill: '#FBBF24' }} />
            <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>{master.rating}</span>
            <span style={{ color: '#475569', fontSize: '0.7rem' }}>({master.reviewsCount})</span>
          </div>

          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />

          {/* Orders */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem' }}>
            <Briefcase style={{ width: 12, height: 12, color: '#60A5FA' }} />
            <span style={{ color: '#34D399', fontWeight: 800 }}>{master.completedOrders}</span>
            <span style={{ color: '#475569' }}>buyurtma</span>
          </div>

          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />

          {/* Status */}
          {isAvailable ? (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.68rem', fontWeight: 700, color: '#10B981',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
              Bo'sh
            </span>
          ) : (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.68rem', fontWeight: 700, color: '#F87171',
            }}>
              <Clock style={{ width: 11, height: 11 }} />
              Band
            </span>
          )}
        </div>

        {/* ── Bio ── */}
        <p style={{
          fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.65,
          marginBottom: '0.85rem',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {master.bio}
        </p>

        {/* ── Price list snippet ── */}
        {master.price_list.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 12, padding: '0.65rem 0.85rem',
            marginBottom: '0.85rem',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <p style={{
              fontSize: '0.62rem', fontWeight: 700, color: '#475569',
              textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.45rem',
            }}>
              Xizmatlar narxi:
            </p>
            {master.price_list.slice(0, 2).map((item) => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '0.3rem',
              }}>
                <span style={{
                  fontSize: '0.72rem', color: '#CBD5E1', fontWeight: 500,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  paddingRight: 8, flex: 1,
                }}>
                  {item.name}
                </span>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 800, color: '#34D399', flexShrink: 0,
                }}>
                  {item.price.toLocaleString('uz-UZ')} so'm
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Action Buttons ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        paddingTop: '0.85rem',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Phone call */}
        <a
          href={`tel:${master.phone.replace(/\s+/g, '')}`}
          id={`master-call-${master.id}`}
          aria-label={`${master.name}ga telefon qilish`}
          title={`${master.name}ga qo'ng'iroq qilish`}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '0.6rem 0.85rem',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 12, color: '#34D399',
            fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.2)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.5)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.1)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.25)';
          }}
        >
          <Phone style={{ width: 13, height: 13 }} />
          <span>{master.phone}</span>
        </a>

        {/* Detail / Order */}
        <button
          id={`master-detail-${master.id}`}
          onClick={() => onOpenDetail(master)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '0.65rem 1rem',
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            border: 'none', borderRadius: 12,
            color: '#fff', fontSize: '0.78rem', fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(37,99,235,0.5)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = '';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)';
          }}
        >
          <span>Profil & Buyurtma</span>
          <ChevronRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </article>
  );
};

export default MasterCard;
