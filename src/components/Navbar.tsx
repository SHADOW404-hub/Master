import React from 'react';
import type { UserRole, Region, District } from '../types';
import { MapPin, Wrench, Lock, Menu, LogIn } from 'lucide-react';

interface NavbarProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  regions: Region[];
  districts: District[];
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedDistrictId: string;
  setSelectedDistrictId: (id: string) => void;
  escrowOrdersCount: number;
  onToggleSidebar: () => void;
  currentUser: { name: string; phone: string; role: UserRole } | null;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  setActiveRole,
  regions,
  districts,
  selectedRegionId,
  setSelectedRegionId,
  selectedDistrictId,
  setSelectedDistrictId,
  escrowOrdersCount,
  onToggleSidebar,
  currentUser,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-white/10 px-4 lg:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title="Menyuni Ochish / Yopish"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveRole('client')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-400 p-0.5 shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Wrench className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg tracking-tight text-white">
                  USTA<span className="text-blue-400">MIJOZ</span>
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ESCROW 2%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Region & District Selector */}
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-1 text-blue-400 pl-1 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
          </div>

          <select
            value={selectedRegionId}
            onChange={(e) => {
              setSelectedRegionId(e.target.value);
              setSelectedDistrictId('');
            }}
            className="bg-[#131B2E] text-white text-xs font-medium rounded-lg px-2 py-1 border border-white/10 outline-none cursor-pointer"
          >
            <option value="">Barcha viloyatlar</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name_uz}
              </option>
            ))}
          </select>

          {selectedRegionId && (
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="bg-[#131B2E] text-white text-xs font-medium rounded-lg px-2 py-1 border border-white/10 outline-none cursor-pointer hidden md:block"
            >
              <option value="">Barcha tumanlar</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name_uz}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right User Actions & Auth */}
        <div className="flex items-center gap-3">
          {escrowOrdersCount > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl text-amber-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 animate-pulse" />
              <span>{escrowOrdersCount} Muzlatilgan</span>
            </div>
          )}

          {currentUser ? (
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-xl text-xs">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                {currentUser.name.substring(0, 1)}
              </div>
              <span className="font-bold text-white hidden sm:inline">{currentUser.name}</span>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-primary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Kirish / Registratsiya</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

