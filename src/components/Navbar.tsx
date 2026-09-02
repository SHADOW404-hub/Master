import React from 'react';
import type { UserRole, Region, District } from '../types';
import { ShieldCheck, MapPin, User, Wrench, Lock } from 'lucide-react';

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
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  setActiveRole,
  regions,
  districts,
  selectedRegionId,
  setSelectedRegionId,
  selectedDistrictId,
  setSelectedDistrictId,
  escrowOrdersCount,
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Tagline */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveRole('client')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-blue-500/30">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-tight text-white">
                  USTA<span className="text-blue-400">MIJOZ</span>
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  ESCROW 2%
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">O'zbekiston bo'ylab ishonchli xizmatlar</p>
            </div>
          </div>

          {/* Mobile Escrow Badge */}
          <div className="md:hidden flex items-center gap-2">
            {escrowOrdersCount > 0 && (
              <span className="badge-escrow text-xs">
                <Lock className="w-3 h-3" /> {escrowOrdersCount} Muzlatilgan
              </span>
            )}
          </div>
        </div>

        {/* Region & District Geolocation Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto bg-black/40 p-1.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 text-blue-400 pl-2 text-xs font-semibold">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Hudud:</span>
          </div>

          <select
            value={selectedRegionId}
            onChange={(e) => {
              setSelectedRegionId(e.target.value);
              setSelectedDistrictId('');
            }}
            className="bg-[#131B2E] text-white text-xs font-medium rounded-lg px-2.5 py-1.5 border border-white/10 outline-none focus:border-blue-500 cursor-pointer"
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
              className="bg-[#131B2E] text-white text-xs font-medium rounded-lg px-2.5 py-1.5 border border-white/10 outline-none focus:border-blue-500 cursor-pointer"
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

        {/* Role Switcher & User Control */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Active Escrow Indicator */}
          {escrowOrdersCount > 0 && (
            <div className="hidden md:flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-amber-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 animate-pulse" />
              <span>{escrowOrdersCount} ta xavfsiz to'lov muzlatilgan</span>
            </div>
          )}

          {/* Role Switch Tabs */}
          <div className="bg-[#131B2E] p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setActiveRole('client')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeRole === 'client'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Mijoz</span>
            </button>

            <button
              onClick={() => setActiveRole('master')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeRole === 'master'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Usta Profili</span>
            </button>

            <button
              onClick={() => setActiveRole('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeRole === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span>Admin Panel</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
