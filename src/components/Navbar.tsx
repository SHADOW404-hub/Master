import React, { useState, useRef, useEffect } from 'react';
import type { UserRole, Region, District } from '../types';
import {
  ShieldCheck, MapPin, Wrench, Lock, LogIn,
  Home, User, Menu, X, LogOut, Settings, Briefcase,
} from 'lucide-react';

interface NavbarProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeTab: 'catalog' | 'jobs' | 'orders' | 'profile' | 'admin_panel';
  setActiveTab: (tab: 'catalog' | 'jobs' | 'orders' | 'profile' | 'admin_panel') => void;
  regions: Region[];
  districts: District[];
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedDistrictId: string;
  setSelectedDistrictId: (id: string) => void;
  escrowOrdersCount: number;
  openJobsCount?: number;
  currentUser: { name: string; phone: string; role: UserRole } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole: _activeRole,
  setActiveRole,
  activeTab,
  setActiveTab,
  regions,
  selectedRegionId,
  setSelectedRegionId,
  setSelectedDistrictId,
  escrowOrdersCount,
  openJobsCount,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // User menyu tashqarisiga bosganda yopish
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Mobil menyu ochilganda scroll'ni bloklash
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navItems = [
    {
      id: 'catalog' as const,
      label: 'Katalog',
      icon: Home,
      color: 'blue',
      onClick: () => {
        setActiveRole('client');
        setActiveTab('catalog');
        setMobileMenuOpen(false);
      },
    },
    // Ish E'lonlari menyusi faqat mijozlar uchun (ustalarda bo'lmaydi)
    ...(currentUser?.role !== 'master' ? [{
      id: 'jobs' as const,
      label: "Ish E'lonlari",
      icon: Briefcase,
      color: 'indigo',
      badge: openJobsCount && openJobsCount > 0 ? openJobsCount : undefined,
      onClick: () => {
        setActiveTab('jobs');
        setMobileMenuOpen(false);
      },
    }] : []),
    {
      id: 'orders' as const,
      label: 'Buyurtmalar',
      icon: Lock,
      color: 'amber',
      badge: escrowOrdersCount > 0 ? escrowOrdersCount : undefined,
      onClick: () => {
        setActiveRole('client');
        setActiveTab('orders');
        setMobileMenuOpen(false);
      },
    },
    {
      id: 'profile' as const,
      label: 'Profil',
      icon: User,
      color: 'emerald',
      onClick: () => {
        setActiveTab('profile');
        setMobileMenuOpen(false);
      },
    },
    // Admin panel faqat admin uchun ko'rsatiladi
    ...(currentUser?.role === 'admin' ? [{
      id: 'admin_panel' as const,
      label: 'Admin',
      icon: ShieldCheck,
      color: 'indigo',
      onClick: () => {
        setActiveRole('admin');
        setActiveTab('admin_panel');
        setMobileMenuOpen(false);
      },
    }] : []),
  ];

  const activeColorMap: Record<string, string> = {
    blue:   'bg-blue-600 text-white shadow-lg shadow-blue-600/40',
    amber:  'bg-amber-500 text-black shadow-lg shadow-amber-500/40',
    emerald:'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40',
    indigo: 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40',
  };

  const iconColorMap: Record<string, string> = {
    blue:   'text-blue-400',
    amber:  'text-amber-400',
    emerald:'text-emerald-400',
    indigo: 'text-indigo-400',
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: 'rgba(7,11,20,0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
        }}
      >
        <div
          className="max-w-7xl mx-auto flex items-center justify-between"
          style={{ padding: '0 1.25rem', height: 64 }}
        >

          {/* ── Left: Hamburger + Logo ── */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              id="navbar-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <button
              id="navbar-logo-btn"
              onClick={() => {
                setActiveRole('client');
                setActiveTab('catalog');
              }}
              className="flex items-center gap-3 group"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div
                className="w-10 h-10 rounded-2xl p-0.5 group-hover:scale-105 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6, #6366F1, #10B981)',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
                }}
              >
                <div
                  className="w-full h-full rounded-[13px] flex items-center justify-center"
                  style={{ background: '#070A12' }}
                >
                  <Wrench className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1
                    className="font-extrabold text-lg tracking-tight text-white"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    USTA<span className="text-blue-400">MIJOZ</span>
                  </h1>
                  <span
                    className="text-[9px] font-extrabold px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(59,130,246,0.15)',
                      color: '#93C5FD',
                      border: '1px solid rgba(59,130,246,0.3)',
                    }}
                  >
                    2% ESCROW
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 font-medium">
                  O'zbekiston xizmatlar platformasi
                </p>
              </div>
            </button>
          </div>

          {/* ── Center: Desktop nav tabs ── */}
          <nav
            className="hidden md:flex items-center gap-1"
            style={{
              background: 'rgba(0,0,0,0.5)',
              padding: '0.35rem',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {navItems.map(({ id, label, icon: Icon, color, badge, onClick }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  id={`nav-tab-${id}`}
                  onClick={onClick}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? activeColorMap[color]
                      : `text-gray-400 hover:text-white hover:bg-white/5 ${iconColorMap[color]}`
                  }`}
                  style={{ position: 'relative' }}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? '' : iconColorMap[color]}`} />
                  <span>{label}</span>
                  {badge !== undefined && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-extrabold"
                      style={{
                        background: '#F59E0B',
                        color: '#000',
                        animation: 'pulse-glow 2s infinite',
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* ── Right: Region dropdown + User ── */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Region filter */}
            <div
              className="flex items-center gap-1.5"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '0.3rem 0.6rem',
              }}
            >
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <select
                id="navbar-region-select"
                value={selectedRegionId}
                onChange={e => {
                  setSelectedRegionId(e.target.value);
                  setSelectedDistrictId('');
                }}
                aria-label="Viloyatni tanlang"
                className="text-white text-xs font-semibold outline-none cursor-pointer"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0.15rem 0',
                  maxWidth: 120,
                }}
              >
                <option value="">Barcha viloyat</option>
                {regions.map(r => (
                  <option key={r.id} value={r.id} style={{ background: '#0F172A' }}>
                    {r.name_uz}
                  </option>
                ))}
              </select>
            </div>

            {/* User menu / Login */}
            {currentUser ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  id="navbar-user-btn"
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all"
                  style={{
                    background: 'rgba(59,130,246,0.1)',
                    border: `1px solid ${userMenuOpen ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.25)'}`,
                  }}
                >
                  {/* Avatar initials */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
                  >
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-white hidden sm:inline max-w-[90px] truncate">
                    {currentUser.name}
                  </span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full hidden sm:inline"
                    style={{
                      background: currentUser.role === 'admin'
                        ? 'rgba(99,102,241,0.2)'
                        : currentUser.role === 'master'
                          ? 'rgba(16,185,129,0.2)'
                          : 'rgba(59,130,246,0.2)',
                      color: currentUser.role === 'admin'
                        ? '#A5B4FC'
                        : currentUser.role === 'master'
                          ? '#6EE7B7'
                          : '#93C5FD',
                    }}
                  >
                    {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'master' ? 'Usta' : 'Mijoz'}
                  </span>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      width: 200,
                      background: '#0A0F1C',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16, padding: '0.5rem',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
                      animation: 'fadeUp 0.2s ease',
                      zIndex: 200,
                    }}
                  >
                    <button
                      onClick={() => { setActiveTab('profile'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/8 transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-blue-400" />
                      Mening Profilim
                    </button>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0.3rem 0.5rem' }} />
                    <button
                      id="navbar-logout-btn"
                      onClick={() => { onLogout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Tizimdan Chiqish
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={onOpenAuth}
                className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold"
                style={{ width: 'auto' }}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Kirish</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div
            className="fixed top-0 left-0 z-50 md:hidden flex flex-col"
            style={{
              width: 'min(280px, 85vw)',
              height: '100vh',
              background: '#080E1C',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '4px 0 30px rgba(0,0,0,0.6)',
              animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)',
              overflowY: 'auto',
            }}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <span className="font-extrabold text-white text-base">
                  USTA<span className="text-blue-400">MIJOZ</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Menyuni yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User info in drawer */}
            {currentUser && (
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(59,130,246,0.06)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-gray-400">
                    {currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'master' ? 'Usta Mutaxassis' : 'Mijoz'}
                  </div>
                </div>
              </div>
            )}

            {/* Nav items */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navItems.map(({ id, label, icon: Icon, color, badge, onClick }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    id={`mobile-nav-${id}`}
                    onClick={onClick}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left ${
                      isActive
                        ? activeColorMap[color]
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                    style={{ position: 'relative' }}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? '' : iconColorMap[color]}`} style={{ width: 18, height: 18 }} />
                    <span>{label}</span>
                    {badge !== undefined && (
                      <span
                        className="ml-auto w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-extrabold"
                        style={{ background: '#F59E0B', color: '#000' }}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Drawer footer */}
            <div className="px-4 pb-6 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {currentUser ? (
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Tizimdan Chiqish
                </button>
              ) : (
                <button
                  onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                  className="btn-primary rounded-2xl font-bold"
                >
                  <LogIn className="w-4 h-4" />
                  Kirish / Ro'yxatdan O'tish
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
