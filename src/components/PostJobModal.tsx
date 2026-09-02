import React, { useState } from 'react';
import type { Category, Region, District } from '../types';
import { X, PlusCircle, DollarSign, MapPin, Tag, FileText, Image as ImageIcon } from 'lucide-react';
import { getPortfolioVectorSVG } from '../utils/avatar';

interface PostJobModalProps {
  categories: Category[];
  regions: Region[];
  allDistricts: District[];
  defaultRegionId?: string;
  defaultDistrictId?: string;
  onClose: () => void;
  onSubmitJob: (jobData: {
    title: string;
    description: string;
    price: number;
    category_id: string;
    region_id: string;
    district_id?: string;
    image_url?: string;
  }) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  categories,
  regions,
  allDistricts,
  defaultRegionId,
  defaultDistrictId,
  onClose,
  onSubmitJob,
}) => {
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice]             = useState<number>(150000);
  const [categoryId, setCategoryId]   = useState(categories[0]?.id || '');
  const [regionId, setRegionId]       = useState(defaultRegionId || regions[0]?.id || '');
  const [districtId, setDistrictId]   = useState(defaultDistrictId || '');
  const [imageUrl, setImageUrl]       = useState('');
  const [error, setError]             = useState('');

  const availableDistricts = allDistricts.filter(d => d.region_id === regionId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Ish sarlavhasini kiriting'); return; }
    if (!description.trim()) { setError("Ish haqida batafsil ma'lumot yozing"); return; }
    if (price <= 0) { setError("Ish narxi 0 dan katta bo'lishi kerak"); return; }

    const selectedCat = categories.find(c => c.id === categoryId);
    const finalImage = imageUrl.trim() || getPortfolioVectorSVG(selectedCat?.name_uz || 'Xizmat');

    onSubmitJob({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category_id: categoryId,
      region_id: regionId,
      district_id: districtId || undefined,
      image_url: finalImage,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-w-xl relative border border-blue-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">Yangi Ish E'lon Qilish</h3>
              <p className="text-xs text-gray-400">Ustalar ushbu ishni ko'rib, qabul qilishadi</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-300 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          
          {/* Title */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Ish Nomi / Sarlavha:</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Ariston boyler o'rnatish va quvur ulash..."
              className="auth-input"
            />
          </div>

          {/* Category & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Soha Kategoriya:</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-semibold outline-none focus:border-blue-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name_uz}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>Viloyat:</span>
              </label>
              <select
                value={regionId}
                onChange={(e) => {
                  setRegionId(e.target.value);
                  setDistrictId('');
                }}
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-semibold outline-none focus:border-blue-500"
              >
                {regions.map(r => (
                  <option key={r.id} value={r.id}>{r.name_uz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* District if available */}
          {availableDistricts.length > 0 && (
            <div>
              <label className="form-label">Tuman / Shahar (ixtiyoriy):</label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white font-semibold outline-none focus:border-blue-500"
              >
                <option value="">Tumannni tanlang</option>
                {availableDistricts.map(d => (
                  <option key={d.id} value={d.id}>{d.name_uz}</option>
                ))}
              </select>
            </div>
          )}

          {/* Price Offer */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Taklif Etilayotgan Ish Narxi (so'm):</span>
            </label>
            <input
              type="number"
              required
              step={10000}
              min={10000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="auth-input font-bold font-mono text-emerald-400 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Ish Haqida Batafsil Ma'lumot:</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qanday muammo bor, qanday materiallar kerak yoki manzilingiz haqida qisqacha..."
              className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Image URL optional */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Ish joyi / muammo rasmi (ixtiyoriy URL):</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/rasm.jpg (bo'sh qolsa avto-rasm qo'yiladi)"
              className="auth-input"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary w-full justify-center py-3.5 rounded-xl font-extrabold text-xs flex items-center gap-2 mt-2 shadow-lg shadow-blue-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ishni E'longa Joylash</span>
          </button>
        </form>

      </div>
    </div>
  );
};

export default PostJobModal;
