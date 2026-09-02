import React from 'react';
import type { Category, Region } from '../types';
import { Search, Shield, Lock, Wrench, Zap, Hammer, Tv, Sofa, Wind } from 'lucide-react';

interface HeroSearchProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedRegion?: Region;
  totalMastersFound: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Wrench,
  Zap,
  Hammer,
  Tv,
  Sofa,
  Wind,
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
    <section className="relative pt-6 pb-8 px-4">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* Trust Badges Bar */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
          <Shield className="w-3.5 h-3.5" />
          <span>Pasport KYC Tekshirilgan Ustalar</span>
          <span className="text-gray-500">•</span>
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-300">Escrow 2% Xavfsiz To'lov</span>
        </div>

        {/* Main Title */}
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          O'zbekistondagi eng yaxshi <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Ustalarni Uyingizga Chaqiring
          </span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
          Muloqot qiling, narxni kelishing va to'lovni platformada muzlatib qo'ying. Pul faqat ishni qabul qilganingizdan so'ng o'tkaziladi.
        </p>

        {/* Search Input Bar */}
        <div className="mt-6 max-w-2xl mx-auto relative">
          <div className="relative flex items-center glass-panel p-2 rounded-2xl border-blue-500/30 focus-within:border-blue-500 shadow-xl shadow-black/40">
            <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qanday usta qidiryapsiz? (Masalan: Santexnik, kran o'rnatish, boyler...)"
              className="w-full bg-transparent text-white placeholder-gray-500 px-3 py-2 text-sm sm:text-base outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 bg-white/10 rounded-lg mr-1"
              >
                Tozalash
              </button>
            )}
            <button className="btn-primary text-xs sm:text-sm py-2 px-5 rounded-xl shrink-0">
              Qidirish
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'glass-card text-gray-300 hover:bg-white/10'
            }`}
          >
            Barchasi
          </button>
          {categories.map((cat) => {
            const IconComp = ICON_MAP[cat.iconName] || Wrench;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? '' : cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'glass-card text-gray-300 hover:bg-white/10'
                }`}
              >
                <IconComp className="w-3.5 h-3.5 text-blue-400" />
                <span>{cat.name_uz}</span>
              </button>
            );
          })}
        </div>

        {/* Region Search Results Count Indicator */}
        <div className="mt-4 text-xs text-gray-400 font-medium flex items-center justify-center gap-1.5">
          <span>
            {selectedRegion ? `${selectedRegion.name_uz} bo'yicha` : 'Butun O\'zbekiston bo\'yicha'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
            {totalMastersFound} ta usta mavjud
          </span>
        </div>

      </div>
    </section>
  );
};
