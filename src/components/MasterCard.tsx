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
    <div className="glass-card p-5 flex flex-col justify-between relative group border border-white/10 hover:border-blue-500/40">
      
      {/* Top Banner & Status */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={master.avatar}
                alt={master.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/30 group-hover:border-blue-500 transition-colors"
              />
              {master.passport_kyc.status === 'verified' && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-md" title="Pasport KYC Tasdiqlangan">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                  {master.name}
                </h3>
              </div>
              <p className="text-xs text-blue-400 font-semibold">{master.category_name}</p>
              
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                <span>{regionName}{districtName ? `, ${districtName}` : ''}</span>
              </div>
            </div>
          </div>

          {/* Availability Badge */}
          <div>
            {master.status === 'available' ? (
              <span className="badge-available">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Hozir bo'shman
              </span>
            ) : (
              <span className="badge-busy">
                <Clock className="w-3 h-3" /> Bandman
              </span>
            )}
          </div>
        </div>

        {/* Rating & Stats row */}
        <div className="flex items-center gap-4 py-2 px-3 rounded-xl bg-black/30 border border-white/5 text-xs my-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-bold text-white text-sm">{master.rating}</span>
            <span className="text-gray-400">({master.reviewsCount} sharh)</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="text-gray-300 font-medium">
            <span className="text-emerald-400 font-bold">{master.completedOrders}</span> buyurtma
          </div>
          {master.passport_kyc.status === 'verified' && (
            <>
              <div className="h-3 w-px bg-white/10" />
              <div className="badge-verified">KYC Tasdiq</div>
            </>
          )}
        </div>

        {/* Bio snippet */}
        <p className="text-xs text-gray-300 line-clamp-2 mb-4 leading-relaxed">
          {master.bio}
        </p>

        {/* Price list preview snippet */}
        {master.price_list.length > 0 && (
          <div className="bg-white/5 rounded-xl p-2.5 mb-4 text-xs space-y-1">
            <div className="text-gray-400 font-semibold text-[11px] uppercase tracking-wider mb-1">
              Prays-list namunasi:
            </div>
            {master.price_list.slice(0, 2).map((item) => (
              <div key={item.id} className="flex justify-between items-center text-gray-200">
                <span className="truncate pr-2">{item.name}</span>
                <span className="font-bold text-blue-300 shrink-0">
                  {item.price.toLocaleString()} so'm
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-white/10 flex items-center gap-2">
        <a
          href={`tel:${master.phone.replace(/\s+/g, '')}`}
          className="btn-secondary py-2 px-3 text-xs rounded-xl hover:text-emerald-400 hover:border-emerald-500/40"
          title="Ustaga telefon qilish"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold">{master.phone}</span>
        </a>

        <button
          onClick={() => onOpenDetail(master)}
          className="btn-primary py-2 px-3 text-xs rounded-xl flex-1 justify-center"
        >
          <span>Profil & Buyurtma</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
