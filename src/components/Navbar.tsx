import React from 'react';
import type { UserRole, Region, District } from '../types';
import { 
  ShieldCheck, MapPin, Wrench, Lock, LogIn, Home 
} from 'lucide-react';

interface NavbarProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeTab: 'catalog' | 'orders' | 'master_workspace' | 'admin_panel';
  setActiveTab: (tab: 'catalog' | 'orders' | 'master_workspace' | 'admin_panel') => void;
  regions: Region[];
  districts: District[];
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedDistrictId: string;
  setSelectedDistrictId: (id: string) => void;
  escrowOrdersCount: number;
  currentUser: { name: string; phone: string; role: UserRole } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  setActiveRole,
  activeTab,
  setActiveTab,
  regions,
  selectedRegionId,
  setSelectedRegionId,
  setSelectedDistrictId,
  escrowOrdersCount,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Brand Logo & Escrow Badge */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setActiveRole('client');
              setActiveTab('catalog');
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#070A12] rounded-[14px] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-tight text-white">
                  USTA<span className="text-blue-400">MIJOZ</span>
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  2% ESCROW
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">O'zbekiston xizmatlar platformasi</p>
            </div>
          </div>

          {/* Mobile Escrow Badge */}
          {escrowOrdersCount > 0 && (
            <div className="md:hidden flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl text-amber-400 text-xs font-bold">
              <Lock className="w-3.5 h-3.5 animate-pulse" />
              <span>{escrowOrdersCount} Muzlatilgan</span>
            </div>
          )}
        </div>

        {/* Center Main Navigation Route Tabs */}
        <div className="flex items-center gap-1.5 bg-black/50 p-1.5 rounded-2xl border border-white/10 overflow-x-auto max-w-full">
          
          <button
            onClick={() => {
              setActiveRole('client');
              setActiveTab('catalog');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'catalog' && activeRole === 'client'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Katalog</span>
          </button>

          <button
            onClick={() => {
              setActiveRole('client');
              setActiveTab('orders');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Buyurtmalarim</span>
            {escrowOrdersCount > 0 && (
              <span className="bg-amber-500 text-black font-extrabold text-[10px] px-1.5 rounded-full">
                {escrowOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveRole('master');
              setActiveTab('master_workspace');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeRole === 'master'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span>Usta Kabineti</span>
          </button>

          <button
            onClick={() => {
              setActiveRole('admin');
              setActiveTab('admin_panel');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeRole === 'admin'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
            <span>Admin Desk</span>
          </button>

        </div>

        {/* Right Region Dropdown & User Profile */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Region Dropdown */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10 text-xs">
            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
            
            <select
              value={selectedRegionId}
              onChange={(e) => {
                setSelectedRegionId(e.target.value);
                setSelectedDistrictId('');
              }}
              className="bg-[#0F172A] text-white text-xs font-semibold rounded-lg px-2 py-1 border border-white/10 outline-none cursor-pointer"
            >
              <option value="">Barcha viloyatlar</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name_uz}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile / Auth Button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="glass-card px-3 py-1.5 rounded-xl border border-blue-500/30 flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {currentUser.name.substring(0, 1)}
                </div>
                <span className="font-bold text-white hidden sm:inline">{currentUser.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 p-2 rounded-xl border border-red-500/20 font-bold"
                title="Tizimdan chiqish"
              >
                Chiqish
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Kirish / Ro'yxatdan O'tish</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
