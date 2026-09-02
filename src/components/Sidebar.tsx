import React from 'react';
import type { UserRole } from '../types';
import { 
  Home, Lock, Wrench, ShieldCheck, LogOut, 
  ChevronLeft, ChevronRight, PlusCircle 
} from 'lucide-react';

interface SidebarProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeTab: 'catalog' | 'orders' | 'master_workspace' | 'admin_panel';
  setActiveTab: (tab: 'catalog' | 'orders' | 'master_workspace' | 'admin_panel') => void;
  currentUser: { name: string; phone: string; role: UserRole } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  escrowOrdersCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRole,
  setActiveRole,
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  isCollapsed,
  setIsCollapsed,
  escrowOrdersCount,
}) => {
  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 glass-panel border-r border-white/10 transition-all duration-300 flex flex-col justify-between p-3 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand & Collapse button */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-white/10 px-1 pt-2">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('catalog')}>
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-600/40">
                U
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
                  USTA<span className="text-blue-400">MIJOZ</span>
                </h1>
                <span className="text-[10px] font-bold text-emerald-400">Escrow 2% Platforma</span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xl mx-auto shadow-lg shadow-blue-600/40">
              U
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
            title={isCollapsed ? 'Kengaytirish' : 'Kichiklashtirish'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card info badge */}
        <div className="my-4 px-1">
          {currentUser ? (
            <div className={`glass-card p-2.5 border border-blue-500/20 rounded-xl flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center text-white font-bold shrink-0 text-sm">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <h4 className="font-bold text-white text-xs truncate">{currentUser.name}</h4>
                  <span className="text-[10px] font-semibold text-blue-300 block">{currentUser.phone}</span>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`btn-primary w-full text-xs py-2 px-3 rounded-xl justify-center ${
                isCollapsed ? 'p-2' : ''
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Kirish / Ro'yxatdan O'tish</span>}
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 mt-2">
          
          <button
            onClick={() => {
              setActiveRole('client');
              setActiveTab('catalog');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'catalog' && activeRole === 'client'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4 text-blue-400 shrink-0" />
            {!isCollapsed && <span>Katalog & Bosh Sahifa</span>}
          </button>

          <button
            onClick={() => {
              setActiveRole('client');
              setActiveTab('orders');
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              {!isCollapsed && <span>Escrow Buyurtmalarim</span>}
            </div>
            {!isCollapsed && escrowOrdersCount > 0 && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {escrowOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveRole('master');
              setActiveTab('master_workspace');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeRole === 'master'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span>Usta Kabineti & Wallet</span>}
          </button>

          <button
            onClick={() => {
              setActiveRole('admin');
              setActiveTab('admin_panel');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeRole === 'admin'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            {!isCollapsed && <span>Admin Desk (2FA)</span>}
          </button>

        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="border-t border-white/10 pt-3">
        {currentUser ? (
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-2 text-xs text-red-400 hover:bg-red-500/10 p-2 rounded-xl font-bold transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Chiqish</span>}
          </button>
        ) : (
          <div className="text-[11px] text-gray-500 text-center px-1">
            {!isCollapsed && <span>UstaMijoz v2.5 • PostgreSQL</span>}
          </div>
        )}
      </div>

    </aside>
  );
};
