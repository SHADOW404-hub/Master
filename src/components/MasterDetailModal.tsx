import React, { useState } from 'react';
import type { Master, Review, Region, District } from '../types';
import { 
  X, Star, ShieldCheck, MapPin, Phone, Lock, 
  Image as ImageIcon, FileText, MessageSquare 
} from 'lucide-react';

interface MasterDetailModalProps {
  master: Master;
  reviews: Review[];
  regions: Region[];
  allDistricts: District[];
  onClose: () => void;
  onInitiateEscrow: (master: Master, serviceTitle: string, price: number) => void;
}

export const MasterDetailModal: React.FC<MasterDetailModalProps> = ({
  master,
  reviews,
  regions,
  allDistricts,
  onClose,
  onInitiateEscrow,
}) => {
  const [activeTab, setActiveTab] = useState<'prices' | 'portfolio' | 'reviews' | 'kyc'>('prices');
  const [customPrice, setCustomPrice] = useState<number>(master.hourlyRate || 150000);
  const [customTitle, setCustomTitle] = useState<string>('Kelishilgan xizmat narxi');

  const regionName = regions.find(r => r.id === master.region_id)?.name_uz || master.region_id;
  const districtName = allDistricts.find(d => d.id === master.district_id)?.name_uz || '';
  const masterReviews = reviews.filter(r => r.master_id === master.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Master Header Profile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-white/10">
          <img
            src={master.avatar}
            alt={master.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-lg shadow-blue-500/20"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white">{master.name}</h2>
              {master.passport_kyc.status === 'verified' && (
                <span className="badge-verified">
                  <ShieldCheck className="w-3.5 h-3.5" /> KYC Pasport Tasdiqlangan
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-blue-400 mt-0.5">{master.category_name}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-300 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{regionName}{districtName ? `, ${districtName}` : ''}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{master.rating} ({master.reviewsCount} sharh)</span>
              </div>
              <div className="text-emerald-400 font-medium">
                {master.completedOrders} muvaffaqiyatli buyurtma
              </div>
            </div>
          </div>

          <a
            href={`tel:${master.phone.replace(/\s+/g, '')}`}
            className="btn-success py-2.5 px-4 text-xs rounded-xl flex items-center gap-2 shrink-0"
          >
            <Phone className="w-4 h-4" />
            <span>{master.phone}</span>
          </a>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 my-4 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('prices')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'prices'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Prays-list & Xizmatlar</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'portfolio'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white bg-white/5'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Portfolio ({master.portfolio.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Sharhlar ({masterReviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
              activeTab === 'kyc'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>KYC Pasport</span>
          </button>
        </div>

        {/* Tab 1: Prices & Services */}
        {activeTab === 'prices' && (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Escrow xavfsiz to'lov:</strong> Xizmatni tanlab "Buyurtma berish" tugmasini bosing. Mablag' to'langanidan so'ng platformada muzlatiladi.
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Xizmatlar Narxnomasi</h4>
              {master.price_list.map((item) => (
                <div 
                  key={item.id}
                  className="glass-card p-3 flex items-center justify-between gap-3 border border-white/5 hover:border-blue-500/30"
                >
                  <div>
                    <h5 className="font-bold text-white text-sm">{item.name}</h5>
                    <p className="text-xs text-gray-400">O'lchov: {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-emerald-400 text-base">
                      {item.price.toLocaleString()} so'm
                    </span>
                    <button
                      onClick={() => onInitiateEscrow(master, item.name, item.price)}
                      className="btn-primary py-1.5 px-3 text-xs rounded-lg flex items-center gap-1"
                    >
                      <Lock className="w-3 h-3 text-amber-300" />
                      <span>Buyurtma</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Agreement Form */}
            <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Telefon orqali boshqa narx kelishdingizmi?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Xizmat nomi..."
                  className="bg-[#131B2E] text-xs text-white p-2 rounded-lg border border-white/10"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    placeholder="Summa (so'm)..."
                    className="bg-[#131B2E] text-xs text-white p-2 rounded-lg border border-white/10 w-full"
                  />
                  <button
                    onClick={() => onInitiateEscrow(master, customTitle, customPrice)}
                    className="btn-warning py-2 px-3 text-xs rounded-lg shrink-0 font-bold"
                  >
                    To'lash
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Portfolio Gallery */}
        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            {master.portfolio.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                Usta hali portfolio rasmlarini yuklamagan.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {master.portfolio.map((item) => (
                  <div key={item.id} className="glass-card overflow-hidden border border-white/10">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3">
                      <h5 className="font-bold text-white text-sm">{item.title}</h5>
                      <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {masterReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                Usta haqida hali sharhlar qoldirilmagan.
              </div>
            ) : (
              masterReviews.map((rev) => (
                <div key={rev.id} className="glass-card p-3 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{rev.client_name}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-300">{rev.comment}</p>
                  <span className="text-[10px] text-gray-500">
                    {new Date(rev.created_at).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: KYC Passport Info */}
        {activeTab === 'kyc' && (
          <div className="space-y-4 text-xs">
            <div className="glass-card p-4 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>KYC Shaxsiyat Tekshiruvi Matni</span>
              </div>
              <p className="text-gray-300">
                Usta platforma administratsiyasiga pasport va ID kartasi fotosuratini yuborgan. Hujjatlar moderatsiyadan muvaffaqiyatli o'tgan.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-gray-400 border-t border-white/10">
                <div>Pasport seriyasi: <strong className="text-white">{master.passport_kyc.passportNumber}</strong></div>
                <div>Tasdiqlangan sana: <strong className="text-white">{master.passport_kyc.submittedAt || '2026-08-10'}</strong></div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
