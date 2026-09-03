import React, { useState, useRef } from 'react';
import type { Region, District } from '../types';
import { X, PlusCircle, DollarSign, MapPin, FileText, Image as ImageIcon, Upload } from 'lucide-react';

interface PostJobModalProps {
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

// Format price with thousand separators
function formatPrice(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  regions,
  allDistricts,
  defaultRegionId,
  defaultDistrictId,
  onClose,
  onSubmitJob,
}) => {
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [priceStr, setPriceStr]       = useState('');
  const [regionId, setRegionId]       = useState(defaultRegionId || regions[0]?.id || '');
  const [districtId, setDistrictId]   = useState(defaultDistrictId || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError]             = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableDistricts = allDistricts.filter(d => d.region_id === regionId);

  // Handle file upload — convert to base64 for client-side preview & storage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: only accept image types
    if (!file.type.startsWith('image/')) {
      setError("Faqat rasm fayllari qabul qilinadi (JPG, PNG, WEBP)");
      return;
    }

    // Max 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError("Rasm hajmi 5MB dan oshmasligi kerak");
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, '');
    if (/^\d*$/.test(raw)) {
      setPriceStr(formatPrice(raw));
    }
  };

  const getPriceNumber = () => Number(priceStr.replace(/\s/g, ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Ish sarlavhasini kiriting'); return; }
    if (!description.trim()) { setError("Ish haqida batafsil ma'lumot yozing"); return; }

    const priceNum = getPriceNumber();
    if (!priceNum || priceNum < 1000) { setError("Ish narxi kamida 1 000 so'm bo'lishi kerak"); return; }
    if (priceNum > 999_999_999) { setError("Ish narxi juda katta"); return; }
    if (!regionId) { setError('Viloyatni tanlang'); return; }

    onSubmitJob({
      title: title.trim(),
      description: description.trim(),
      price: priceNum,
      category_id: 'general',
      region_id: regionId,
      district_id: districtId || undefined,
      image_url: imagePreview || undefined,
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
            aria-label="Yopish"
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

          {/* Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className="select-custom"
              >
                {regions.map(r => (
                  <option key={r.id} value={r.id}>{r.name_uz}</option>
                ))}
              </select>
            </div>

            {/* District if available */}
            {availableDistricts.length > 0 && (
              <div>
                <label className="form-label">Tuman (ixtiyoriy):</label>
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="select-custom"
                >
                  <option value="">Tanlang...</option>
                  {availableDistricts.map(d => (
                    <option key={d.id} value={d.id}>{d.name_uz}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Price Offer */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Taklif Etilayotgan Ish Narxi (so'm):</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                inputMode="numeric"
                value={priceStr}
                onChange={handlePriceChange}
                placeholder="Masalan: 150 000"
                className="auth-input font-bold font-mono text-emerald-400 text-sm pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold pointer-events-none">
                so'm
              </span>
            </div>
            {getPriceNumber() > 0 && (
              <p className="mt-1 text-[11px] text-emerald-400 font-semibold">
                ≈ {getPriceNumber().toLocaleString('uz-UZ')} so'm
              </p>
            )}
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
              className="textarea-custom"
            />
          </div>

          {/* Image Upload — file picker (not URL) */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Ish joyi / muammo rasmi (ixtiyoriy):</span>
            </label>

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 flex items-center justify-center transition-colors"
                  aria-label="Rasmni o'chirish"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <div
                className="image-upload-area"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleFileChange(fakeEvent);
                  }
                }}
              >
                <Upload className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-gray-300 font-semibold">
                  Rasm tanlash uchun bosing yoki sürüklang
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  JPG, PNG, WEBP — max 5MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              aria-label="Rasm faylini tanlang"
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
