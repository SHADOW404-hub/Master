import React from 'react';
import type { Category, Region } from '../types';
import { Search, Shield, Lock, Wrench, Zap, Hammer, Tv, Sofa, Wind, CheckCircle2 } from 'lucide-react';

interface HeroSearchProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedRegion?: Region;
  totalMastersFound: number;
}

const CATEGORY_STYLE: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'cat-santexnik': { icon: Wrench, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  'cat-elektrchi': { icon: Zap, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  'cat-quruvchi': { icon: Hammer, color: '#EC4899', bg: 'rgba(236, 72, 153, 0.15)' },
  'cat-maishiy': { icon: Tv, color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.15)' },
  'cat-mebel': { icon: Sofa, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
  'cat-konditsioner': { icon: Wind, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
};

export const HeroSearch: React.FC<HeroSearchProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  selectedRegion,
  totalMastersFound,
}) => {
  return (
    <section className="relative pt-8 pb-10 px-4">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
        
        {/* Trust Pill Badges */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/50 border border-white/10 text-xs font-semibold backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span>KYC Pasport Tasdiqlangan</span>
          </div>
          <span className="text-gray-600">•</span>
          <div className="flex items-center gap-1.5 text-amber-400">
            <Lock className="w-3.5 h-3.5" />
            <span>2% Escrow Kafolati</span>
          </div>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <div className="items-center gap-1.5 text-blue-400 hidden sm:flex">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>14 Ta Viloyat Qamrovi</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          O'zbekistondagi Eng Yaxshi Ustalarni <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Toping va Xavfsiz To'lang
          </span>
        </h1>

        <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto font-medium">
          Muloqot qiling, narxni kelishing va to'lovni platformada muzlatib qo'ying. Pul faqat ishni qabul qilganingizdan so'ng ustaga topshiriladi.
        </p>

        {/* Search Bar Input */}
        <div className="max-w-2xl mx-auto relative pt-2">
          <div className="relative flex items-center glass-panel p-2 rounded-2xl border border-blue-500/30 focus-within:border-blue-500 shadow-2xl shadow-blue-500/10 transition-all">
            <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qanday usta kerak? (Masalan: Santexnik, boyler ta'miri, elektr shiti...)"
              className="w-full bg-transparent text-white placeholder-gray-400 px-3 py-2.5 text-sm sm:text-base outline-none font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 bg-white/10 rounded-lg mr-1 font-semibold"
              >
                Tozalash
              </button>
            )}
            <button className="btn-primary text-xs sm:text-sm py-2.5 px-6 rounded-xl shrink-0 font-bold">
              Qidirish
            </button>
          </div>
        </div>

        {/* Category Tiles Grid */}
        <div className="pt-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Ommabop Xizmat Kategoriyalari
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => {
              const style = CATEGORY_STYLE[cat.id] || { icon: Wrench, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' };
              const IconComp = style.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? '' : cat.id)}
                  className={`p-3.5 rounded-2xl glass-card text-left transition-all duration-300 flex flex-col items-center justify-center text-center gap-2 border ${
                    isSelected
                      ? 'border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-500/30 scale-[1.03]'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: style.bg, color: style.color }}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                    {cat.name_uz}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Filter Indicator Pill */}
        <div className="pt-2 text-xs text-gray-400 font-medium flex items-center justify-center gap-2">
          <span>
            {selectedRegion ? `${selectedRegion.name_uz} bo'yicha` : 'Butun O\'zbekiston bo\'yicha'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-extrabold border border-blue-500/30">
            {totalMastersFound} ta usta mavjud
          </span>
        </div>

      </div>
    </section>
  );
};
