import React from 'react';
import type { Master, Region, District } from '../types';
import { Star, ShieldCheck, MapPin, Phone, Clock, ChevronRight } from 'lucide-react';

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
  const regionName = regions.find(r => r.id === master.region_id)?.name_uz || master.region_id;
  const districtName = allDistricts.find(d => d.id === master.district_id)?.name_uz || '';

  return (
    <div className="glass-card p-5 flex flex-col justify-between relative group border border-white/10 hover:border-blue-500/50 shadow-xl">
      
      {/* Top Profile Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={master.avatar}
                alt={master.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/40 group-hover:border-blue-500 transition-all shadow-md"
              />
              {master.passport_kyc.status === 'verified' && (
                <div 
                  className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-md"
                  title="Pasport KYC Tasdiqlangan Usta"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <h3 className="font-extrabold text-white text-base group-hover:text-blue-400 transition-colors">
                {master.name}
              </h3>
              <p className="text-xs font-bold text-blue-400 mt-0.5">{master.category_name}</p>
              
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 font-medium">
                <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                <span>{regionName}{districtName ? `, ${districtName}` : ''}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {master.status === 'available' ? (
              <span className="badge-available">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Hozir bo'shman
              </span>
            ) : (
              <span className="badge-busy">
                <Clock className="w-3.5 h-3.5" /> Bandman
              </span>
            )}
          </div>
        </div>

        {/* Rating & Orders Row */}
        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-black/40 border border-white/5 text-xs my-3">
          <div className="flex items-center gap-1.5 font-bold">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-white text-sm">{master.rating}</span>
            <span className="text-gray-400 font-normal">({master.reviewsCount} sharh)</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="text-gray-300 font-medium">
            <span className="text-emerald-400 font-bold">{master.completedOrders}</span> buyurtma
          </div>
        </div>

        {/* Bio summary */}
        <p className="text-xs text-gray-300 line-clamp-2 mb-4 leading-relaxed font-normal">
          {master.bio}
        </p>

        {/* Price list snippet chips */}
        {master.price_list.length > 0 && (
          <div className="bg-white/5 rounded-xl p-3 mb-4 text-xs space-y-1.5 border border-white/5">
            <div className="text-gray-400 font-bold text-[11px] uppercase tracking-wider mb-1">
              Prays-list xizmatlari:
            </div>
            {master.price_list.slice(0, 2).map((item) => (
              <div key={item.id} className="flex justify-between items-center text-gray-200">
                <span className="truncate pr-2 font-medium">{item.name}</span>
                <span className="font-extrabold text-emerald-400 shrink-0">
                  {item.price.toLocaleString()} so'm
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-white/10 flex items-center gap-2">
        <a
          href={`tel:${master.phone.replace(/\s+/g, '')}`}
          className="btn-secondary py-2.5 px-3 text-xs rounded-xl hover:text-emerald-400 hover:border-emerald-500/40 shrink-0 font-bold"
          title="Ustaga telefon qilish"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>{master.phone}</span>
        </a>

        <button
          onClick={() => onOpenDetail(master)}
          className="btn-primary py-2.5 px-3 text-xs rounded-xl flex-1 justify-center font-bold"
        >
          <span>Profil & Buyurtma</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
