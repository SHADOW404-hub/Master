import React, { useState, useRef, useEffect } from 'react';
import type { UserRole, Region, District } from '../types';
import {
  ShieldCheck, MapPin, Wrench, Lock, LogIn,
  Home, User, Menu, X, LogOut, Settings, Briefcase,
  Sun, Moon,
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
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Block body scroll when mobile menu is open
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
    // Ish E'lonlari faqat mijoz va guest uchun (usta uchun catalog = job board)
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
    // Admin panel faqat admin uchun
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

  const isDark = theme === 'dark';

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: 'var(--navbar-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--navbar-border)',
          boxShadow: isDark ? '0 4px 30px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.08)',
          transition: 'background 0.3s ease, border-color 0.3s ease',
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
              className="md:hidden p-2 rounded-xl transition-colors"
              style={{ background: 'var(--bg-input)', color: 'var(--text)' }}
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
                  style={{ background: isDark ? '#070A12' : '#fff' }}
                >
                  <Wrench className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1
                    className="font-extrabold text-lg tracking-tight"
                    style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}
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
                <p className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>
                  O'zbekiston xizmatlar platformasi
                </p>
              </div>
            </button>
          </div>

          {/* ── Center: Desktop nav tabs ── */}
          <nav
            className="hidden md:flex items-center gap-1"
            style={{
              background: 'var(--bg-input)',
              padding: '0.35rem',
              borderRadius: 16,
              border: '1px solid var(--border)',
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
                      : `hover:bg-white/5`
                  }`}
                  style={{
                    position: 'relative',
                    color: isActive ? undefined : 'var(--muted)',
                  }}
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

          {/* ── Right: Theme toggle + Region + User ── */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Theme Toggle */}
            <button
              id="navbar-theme-toggle"
              onClick={onToggleTheme}
              aria-label={isDark ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish"}
              title={isDark ? "Kunduzgi rejim" : "Tungi rejim"}
              className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
              style={{
                background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(234,179,8,0.12)',
                border: isDark ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(234,179,8,0.4)',
              }}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-500" />
              )}
            </button>

            {/* Region filter */}
            <div
              className="hidden sm:flex items-center gap-1.5"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
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
                className="text-xs font-semibold outline-none cursor-pointer"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0.15rem 0',
                  maxWidth: 120,
                  color: 'var(--text)',
                }}
              >
                <option value="">Barcha viloyat</option>
                {regions.map(r => (
                  <option key={r.id} value={r.id} style={{ background: 'var(--select-option-bg)' }}>
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
                    background: 'rgba(59,130,246,0.10)',
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
                  <span
                    className="text-xs font-bold hidden sm:inline max-w-[90px] truncate"
                    style={{ color: 'var(--text)' }}
                  >
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

                {/* Dropdown menu — single profile menu */}
                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      width: 210,
                      background: 'var(--modal-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 16, padding: '0.5rem',
                      boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.7)' : '0 8px 30px rgba(0,0,0,0.15)',
                      animation: 'fadeUp 0.2s ease',
                      zIndex: 200,
                    }}
                  >
                    {/* User info header */}
                    <div
                      className="px-3 py-2 mb-1 rounded-xl"
                      style={{ background: 'var(--bg-input)', borderRadius: 10 }}
                    >
                      <div
                        className="font-bold text-sm truncate"
                        style={{ color: 'var(--text)' }}
                      >
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] font-semibold" style={{ color: 'var(--muted)' }}>
                        {currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'master' ? 'Usta Mutaxassis' : 'Mijoz'}
                      </div>
                    </div>

                    <button
                      id="navbar-dropdown-profile"
                      onClick={() => { setActiveTab('profile'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left"
                      style={{ color: 'var(--text)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-input)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Settings className="w-4 h-4 text-blue-400" />
                      Mening Profilim
                    </button>

                    <div style={{ height: 1, background: 'var(--border)', margin: '0.3rem 0.5rem' }} />

                    <button
                      id="navbar-logout-btn"
                      onClick={() => { onLogout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 transition-colors text-left"
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
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

          {/* Drawer — slides from LEFT */}
          <div
            className="fixed top-0 left-0 z-50 md:hidden flex flex-col animate-slide-in-left"
            style={{
              width: 'min(280px, 85vw)',
              height: '100vh',
              background: 'var(--drawer-bg)',
              borderRight: '1px solid var(--drawer-border)',
              boxShadow: '4px 0 30px rgba(0,0,0,0.4)',
              overflowY: 'auto',
            }}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <span className="font-extrabold text-base" style={{ color: 'var(--text)' }}>
                  USTA<span className="text-blue-400">MIJOZ</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-input)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                aria-label="Menyuni yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User info in drawer */}
            {currentUser && (
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: '1px solid var(--border)', background: 'rgba(59,130,246,0.06)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>
                    {currentUser.name}
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                    {currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'master' ? 'Usta Mutaxassis' : 'Mijoz'}
                  </div>
                </div>
              </div>
            )}

            {/* Region select for mobile */}
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px] font-bold" style={{ color: 'var(--muted)' }}>VILOYAT</span>
              </div>
              <select
                value={selectedRegionId}
                onChange={e => {
                  setSelectedRegionId(e.target.value);
                  setSelectedDistrictId('');
                }}
                className="w-full text-xs font-semibold rounded-xl px-3 py-2 outline-none"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  appearance: 'none',
                }}
              >
                <option value="">Barcha viloyat</option>
                {regions.map(r => (
                  <option key={r.id} value={r.id}>{r.name_uz}</option>
                ))}
              </select>
            </div>

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
                      isActive ? activeColorMap[color] : ''
                    }`}
                    style={{
                      position: 'relative',
                      color: isActive ? undefined : 'var(--text)',
                      background: isActive ? undefined : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.background = 'var(--bg-input)';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Icon className={`${isActive ? '' : iconColorMap[color]}`} style={{ width: 18, height: 18 }} />
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

            {/* Drawer footer: Theme toggle + Logout */}
            <div className="px-4 pb-6 pt-2 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
              {/* Theme toggle in drawer */}
              <button
                onClick={onToggleTheme}
                className="w-full flex items-center gap-3 py-2.5 px-4 rounded-2xl text-sm font-bold transition-colors"
                style={{
                  color: 'var(--text)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                }}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-500" />
                )}
                {isDark ? "Kunduzgi Rejim" : "Tungi Rejim"}
              </button>

              {currentUser ? (
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold text-red-400"
                  style={{ border: '1px solid rgba(239,68,68,0.2)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
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
