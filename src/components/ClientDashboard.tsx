import React, { useState } from 'react';
import type { Order, UserRole } from '../types';
import { 
  Lock, CheckCircle, AlertTriangle, Star, ShieldCheck, 
  Clock, UserCheck, CheckCircle2
} from 'lucide-react';

interface ClientDashboardProps {
  currentUser: { name: string; email: string; phone: string; role: UserRole } | null;
  orders: Order[];
  onApproveEscrow: (orderId: string) => void;
  onRaiseDispute: (orderId: string, reason: string) => void;
  onAddReview: (orderId: string, masterId: string, rating: number, comment: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  currentUser,
  orders,
  onApproveEscrow,
  onRaiseDispute,
  onAddReview,
}) => {
  const [selectedDisputeOrderId, setSelectedDisputeOrderId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>('');
  
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  // Foydalanuvchi roliga qarab buyurtmalarni filterlash (xavfsizlik)
  const userOrders = orders.filter(o => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true; // Admin hammani ko'radi
    if (currentUser.role === 'master') {
      // Ustaga tegishli buyurtmalar
      return o.master_name.toLowerCase().includes(currentUser.name.toLowerCase());
    }
    // Mijozga tegishli buyurtmalar — email yoki ism bo'yicha
    return (
      o.client_name.toLowerCase().includes(currentUser.name.toLowerCase()) ||
      (currentUser.email && o.client_id === currentUser.email)
    );
  });

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDisputeOrderId && disputeReason.trim()) {
      onRaiseDispute(selectedDisputeOrderId, disputeReason.trim());
      setSelectedDisputeOrderId(null);
      setDisputeReason('');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent, order: Order) => {
    e.preventDefault();
    if (comment.trim()) {
      onAddReview(order.id, order.master_id, rating, comment.trim());
      setReviewOrderId(null);
      setComment('');
    }
  };

  const activeEscrowAmount = userOrders
    .filter(o => o.status === 'escrow_locked')
    .reduce((sum, o) => sum + o.price, 0);

  return (
    <section className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border border-blue-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> 
            {currentUser?.role === 'master' ? 'Usta Ishchi Kabineti' : 'Mijoz Shaxsiy Kabineti'}
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            {currentUser?.role === 'master' ? 'Sizga Biriktirilgan Buyurtmalar' : 'Mening Buyurtmalarim & Escrow Hamyon'}
          </h2>
          <p className="text-xs text-gray-400">
            {currentUser?.role === 'master'
              ? "Ish to'liq topshirilib, mijoz qabul qilgach 98% mablag' balansingizga o'tadi."
              : "Siz to'lagan pullar ish to'liq topshirilmaguncha platformada xavfsiz muzlatiladi."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 rounded-xl text-center">
            <div className="text-[11px] text-amber-300 font-semibold">Muzlatilgan Escrow:</div>
            <div className="text-xl font-extrabold text-amber-400">
              {activeEscrowAmount.toLocaleString()} so'm
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{currentUser?.role === 'master' ? 'Bajarilayotgan Ishlar' : 'Barcha Buyurtmalar'}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-bold">
              {userOrders.length} ta
            </span>
          </h3>
        </div>

        {userOrders.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-400 text-sm space-y-3">
            <Clock className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="font-bold text-white">Hali hech qanday buyurtmalar mavjud emas.</p>
            <p className="text-xs">Ustalar katalogidan kerakli mutaxassisni tanlab, Escrow to'lovi orqali buyurtma bering.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {userOrders.map((order) => (
              <div 
                key={order.id}
                className="glass-card p-5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-blue-500/30"
              >
                {/* Left info */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-base">{order.service_title}</span>
                    
                    {/* Status badges */}
                    {order.status === 'escrow_locked' && (
                      <span className="badge-escrow">
                        <Lock className="w-3 h-3 animate-pulse" /> Escrow Muzlatilgan
                      </span>
                    )}
                    {order.status === 'completed' && (
                      <span className="badge-verified">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> Bajarildi & Pul topshirildi
                      </span>
                    )}
                    {order.status === 'disputed' && (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Nizo Ochilgan (Admin Ko'rmoqda)
                      </span>
                    )}
                    {order.status === 'refunded' && (
                      <span className="bg-gray-500/20 text-gray-300 border border-gray-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        Pul Mijozga Qaytarildi
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-300 flex-wrap">
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Usta: <strong className="text-white">{order.master_name}</strong></span>
                    </div>
                    <div>Mijoz: <strong className="text-gray-200">{order.client_name}</strong></div>
                    <div>To'lov: <strong className="text-emerald-400 uppercase">{order.payment_system || 'Payme'}</strong></div>
                    <div>Sana: <span className="font-mono text-gray-400">{new Date(order.created_at).toLocaleDateString('uz-UZ')}</span></div>
                  </div>

                  {order.dispute_reason && (
                    <div className="mt-2 text-xs text-red-300 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>E'tiroz sababi:</strong> {order.dispute_reason}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price & Actions */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block font-semibold">Buyurtma Qiymati:</span>
                    <span className="font-extrabold text-emerald-400 text-xl">
                      {order.price.toLocaleString()} <span className="text-xs font-normal">so'm</span>
                    </span>
                  </div>

                  {/* Actions for ESCROW_LOCKED */}
                  {order.status === 'escrow_locked' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApproveEscrow(order.id)}
                        className="btn-success py-2.5 px-4 text-xs rounded-xl font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Ishni Qabul Qildim</span>
                      </button>

                      <button
                        onClick={() => setSelectedDisputeOrderId(order.id)}
                        className="btn-secondary py-2.5 px-3 text-xs rounded-xl text-red-400 hover:border-red-500/40 font-bold"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>E'tiroz Bildirish</span>
                      </button>
                    </div>
                  )}

                  {/* Actions for COMPLETED & Not Reviewed */}
                  {order.status === 'completed' && !order.reviewed && (
                    <button
                      onClick={() => setReviewOrderId(order.id)}
                      className="btn-primary py-2.5 px-4 text-xs rounded-xl font-bold flex items-center gap-1.5"
                    >
                      <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Baho & Sharh berish</span>
                    </button>
                  )}

                  {order.status === 'completed' && order.reviewed && (
                    <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sharhlangan</span>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      {selectedDisputeOrderId && (
        <div className="modal-overlay" onClick={() => setSelectedDisputeOrderId(null)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Nizo Ochish (Escrow Dispute)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Usta bajargan ish sifatidan rozi bo'lmasangiz, e'tirozingizni batafsil yozing. Pul muzlatilgan holda qoladi va Admin tomonidan ko'rib chiqiladi.
            </p>

            <form onSubmit={handleDisputeSubmit} className="mt-4 space-y-3">
              <textarea
                required
                rows={4}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Kamchiliklarni va kelishilgan shartlar qanday buzilganini yozing..."
                className="w-full bg-[#131B2E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDisputeOrderId(null)}
                  className="btn-secondary text-xs"
                >
                  Bekor qilish
                </button>
                 <button
                  type="submit"
                  className="text-xs font-bold py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white border-none cursor-pointer font-sans transition-all"
                 >
                   E'tiroz Yuborish
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review & Rating Modal */}
      {reviewOrderId && (
        <div className="modal-overlay" onClick={() => setReviewOrderId(null)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span>Ustaga Baho va Sharh Qoldirish</span>
            </h3>
            
            <form onSubmit={(e) => {
              const ord = orders.find(o => o.id === reviewOrderId);
              if (ord) handleReviewSubmit(e, ord);
            }} className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-2 font-semibold">Yulduzli bahongiz:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1 font-semibold">Yozma sharhingiz:</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ustaning mehnati, kelish vaqti va muomalasi haqida samimiy fikringiz..."
                  className="w-full bg-[#131B2E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReviewOrderId(null)} className="btn-secondary text-xs">
                  Bekor qilish
                </button>
                <button type="submit" className="btn-primary text-xs font-bold">
                  Sharhni Chop Etish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};

export default ClientDashboard;
