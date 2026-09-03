import React, { useState } from 'react';
import type { JobRequest, Master, Category, Region, District, UserRole } from '../types';
import { 
  Briefcase, PlusCircle, MapPin, Clock, 
  CheckCircle2, AlertCircle, Wrench, Calendar, XCircle
} from 'lucide-react';
import { PostJobModal } from './PostJobModal';

interface JobBoardProps {
  currentUser: { id?: string; name: string; phone: string; email?: string; role: UserRole } | null;
  currentMaster?: Master;
  jobRequests: JobRequest[];
  categories: Category[];
  regions: Region[];
  allDistricts: District[];
  selectedRegionId: string;
  onAcceptJob: (jobId: string, master: Master, arrivalTime: string) => void;
  onCreateJob: (jobData: {
    title: string;
    description: string;
    price: number;
    category_id: string;
    region_id: string;
    district_id?: string;
    image_url?: string;
  }) => void;
  onCancelJob: (jobId: string) => void;
  onOpenAuth: () => void;
}

export const JobBoard: React.FC<JobBoardProps> = ({
  currentUser,
  currentMaster,
  jobRequests,
  categories,
  regions,
  allDistricts,
  selectedRegionId,
  onAcceptJob,
  onCreateJob,
  onCancelJob,
  onOpenAuth,
}) => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedJobForAccept, setSelectedJobForAccept] = useState<JobRequest | null>(null);
  const [arrivalTime, setArrivalTime] = useState('Bugun soat 15:00 da');

  const [filterCategory, setFilterCategory] = useState('');
  const [filterRegion, setFilterRegion]   = useState(selectedRegionId || '');

  // Filter job requests
  const filteredJobs = jobRequests.filter(job => {
    // Mijoz faqat o'zi e'lon qilgan ishlarni ko'radi!
    if (currentUser?.role === 'client') {
      const isMyJob = currentUser.id
        ? (job.client_id === currentUser.id || job.client_id === currentUser.email)
        : (job.client_id === currentUser.email);
      if (!isMyJob) return false;
    }
    if (filterCategory && job.category_id !== filterCategory) return false;
    if (filterRegion && job.region_id !== filterRegion) return false;
    return true;
  });

  const handleAcceptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedJobForAccept && currentMaster && arrivalTime.trim()) {
      onAcceptJob(selectedJobForAccept.id, currentMaster, arrivalTime.trim());
      setSelectedJobForAccept(null);
      setArrivalTime('Bugun soat 15:00 da');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 border border-blue-500/30 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>
              {currentUser?.role === 'client'
                ? "Mening Ish E'lonlarim"
                : "Mijozlar Buyurtmalar Stoli (Client Job Board)"}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text)' }}>
            {currentUser?.role === 'master'
              ? "Mijozlar Qoldirgan Ishlar va Topshiriqlar"
              : currentUser?.role === 'client'
                ? "Mening E'lon Qilgan Ishlarim"
                : "Mijozlar E'lon Qilgan Ishlar va Narx Takliflari"}
          </h2>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {currentUser?.role === 'master'
              ? "Sizga mos ishni tanlang, borish vaqtingizni belgilang va buyurtmani qabul qiling."
              : currentUser?.role === 'client'
                ? "Siz joylagan ish e'lonlari. Bu yerda yangi e'lon berishingiz yoki ularni o'chirishingiz mumkin."
                : "Ishingiz rasmi va taklif narxingizni joylang — ustalar borish vaqtini belgilab qabul qilishadi."}
          </p>
        </div>

        {/* Action Button: Yagona tugma (faqat mijoz va mehmonlar uchun) */}
        {currentUser?.role !== 'master' && (
          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuth();
                return;
              }
              setShowPostModal(true);
            }}
            className="btn-primary text-xs py-2.5 px-4 sm:px-5 rounded-2xl font-extrabold flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-blue-600/30 max-w-full"
            style={{ width: 'auto' }}
          >
            <PlusCircle className="w-4.5 h-4.5 shrink-0" />
            <span>Yangi Ish E'lon Qilish</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 border border-white/10">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="select-custom rounded-xl px-3 py-2 text-xs outline-none font-semibold"
          >
            <option value="">Barcha Kategoriyalar</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name_uz}</option>
            ))}
          </select>

          {/* Region Filter */}
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="select-custom rounded-xl px-3 py-2 text-xs outline-none font-semibold"
          >
            <option value="">Barcha Viloyatlar</option>
            {regions.map(r => (
              <option key={r.id} value={r.id}>{r.name_uz}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
          Topildi: <strong style={{ color: 'var(--text)' }}>{filteredJobs.length} ta</strong> e'lon
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="glass-panel p-12 text-center max-w-md mx-auto space-y-3 my-8 border border-white/10 rounded-3xl">
          <Briefcase className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
            {currentUser?.role === 'client'
              ? "Siz hozircha hech qanday ish e'loni joylamadingiz"
              : "Hozircha e'lon qilingan ishlar yo'q"}
          </h3>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {currentUser?.role === 'master'
              ? "Hozircha hech qanday ish e'loni mavjud emas. Biroz kuting!"
              : currentUser?.role === 'client'
                ? "Yuqoridagi 'Yangi Ish E'lon Qilish' tugmasi orqali bajarilishi kerak bo'lgan ishni joylang."
                : "Birinchi bo'lib o'zingiz bajarilishi kerak bo'lgan ishni e'longa joylang!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const regionName = regions.find(r => r.id === job.region_id)?.name_uz || '';
            const districtName = allDistricts.find(d => d.id === job.district_id)?.name_uz || '';
            const locationStr = [districtName, regionName].filter(Boolean).join(', ');
            const isOpen = job.status === 'open';

            return (
              <article 
                key={job.id}
                className="glass-card p-5 border border-white/10 flex flex-col justify-between space-y-4 hover:border-blue-500/30 transition-all rounded-2xl"
              >
                <div>
                  {/* Photo / Header */}
                  {job.image_url && (
                    <img 
                      src={job.image_url} 
                      alt={job.title}
                      className="w-full h-36 object-cover rounded-xl border border-white/10 mb-3"
                    />
                  )}

                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      {job.category_name}
                    </span>

                    {isOpen ? (
                      <span className="badge-available">
                        <Clock className="w-3 h-3" /> E'lon Ochiq
                      </span>
                    ) : (
                      <span className="badge-verified">
                        <CheckCircle2 className="w-3 h-3" /> Usta Qabul Qildi
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-white text-base leading-snug">{job.title}</h3>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-3 leading-relaxed">{job.description}</p>

                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5 text-xs text-gray-400">
                    <div className="flex items-center justify-between">
                      <span>Mijoz:</span>
                      <strong className="text-white">{job.client_name}</strong>
                    </div>
                    {locationStr && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{locationStr}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-white/5 pt-1.5">
                      <span>Taklif qilingan narx:</span>
                      <strong className="text-emerald-400 font-extrabold text-base">
                        {job.price.toLocaleString()} so'm
                      </strong>
                    </div>
                  </div>

                  {/* Accepted Info if accepted */}
                  {job.status === 'accepted' && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Biriktirilgan Usta: {job.accepted_by_master_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Borish vaqti: {job.arrival_time || "Vaqt belgilangan"}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2">
                  {isOpen && currentUser?.role === 'master' && currentMaster && (
                    <button
                      onClick={() => setSelectedJobForAccept(job)}
                      className="btn-success w-full justify-center py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ishni Qabul Qilish & Vaqtni Belgilash</span>
                    </button>
                  )}

                  {isOpen && currentUser && (currentUser.id === job.client_id || currentUser.email === job.client_id) && (
                    <button
                      onClick={() => onCancelJob(job.id)}
                      className="btn-secondary w-full justify-center py-2 text-xs rounded-xl text-red-400 hover:border-red-500/40 font-bold flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>E'lonni O'chirish</span>
                    </button>
                  )}

                  {!currentUser && (
                    <button
                      onClick={onOpenAuth}
                      className="btn-primary w-full justify-center py-2 text-xs rounded-xl font-bold"
                    >
                      Qabul Qilish Uchun Kiring
                    </button>
                  )}
                </div>

              </article>
            );
          })}
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <PostJobModal
          regions={regions}
          allDistricts={allDistricts}
          defaultRegionId={selectedRegionId}
          onClose={() => setShowPostModal(false)}
          onSubmitJob={(jobData) => {
            if (currentUser) {
              onCreateJob(jobData);
              setShowPostModal(false);
            }
          }}
        />
      )}

      {/* Accept Job Modal (for Master to specify arrival time) */}
      {selectedJobForAccept && (
        <div className="modal-overlay" onClick={() => setSelectedJobForAccept(null)}>
          <div className="modal-content max-w-md relative" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Ishni Qabul Qilish va Borish Vaqti</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              <strong>"{selectedJobForAccept.title}"</strong> ishi uchun mijozga qachon borishingizni yozing.
            </p>

            <form onSubmit={handleAcceptSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Qachon borishingiz (Sana va Vaqt):</label>
                <input
                  type="text"
                  required
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  placeholder="Masalan: Bugun soat 16:30 da, yoki Ertaga soat 10:00 da..."
                  className="auth-input font-bold"
                />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Ish qabul qilingach mijozga xabar beriladi va {selectedJobForAccept.price.toLocaleString()} so'm pul platformada xavfsiz muzlatiladi.
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedJobForAccept(null)}
                  className="btn-secondary text-xs"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="btn-success text-xs font-bold py-2.5 px-4 rounded-xl"
                >
                  Ishni Qabul Qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};

export default JobBoard;
