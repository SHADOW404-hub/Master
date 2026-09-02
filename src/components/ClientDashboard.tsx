import React, { useState } from 'react';
import type { Order } from '../types';
import { Lock, CheckCircle, AlertTriangle, Star, ShieldCheck } from 'lucide-react';

interface ClientDashboardProps {
  orders: Order[];
  onApproveEscrow: (orderId: string) => void;
  onRaiseDispute: (orderId: string, reason: string) => void;
  onAddReview: (orderId: string, masterId: string, rating: number, comment: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
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

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDisputeOrderId && disputeReason) {
      onRaiseDispute(selectedDisputeOrderId, disputeReason);
      setSelectedDisputeOrderId(null);
      setDisputeReason('');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent, order: Order) => {
    e.preventDefault();
    if (comment) {
      onAddReview(order.id, order.master_id, rating, comment);
      setReviewOrderId(null);
      setComment('');
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border border-blue-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Mijoz Shaxsiy Kabineti
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">Mening Buyurtmalarim & Escrow Hamyon</h2>
          <p className="text-xs text-gray-400">
            Siz to'lagan pullar ish to'liq topshirilmaguncha platformada muzlatiladi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl text-center">
            <div className="text-[11px] text-amber-300 font-semibold">Muzlatilgan Escrow:</div>
            <div className="text-lg font-extrabold text-amber-400">
              {orders
                .filter(o => o.status === 'escrow_locked')
                .reduce((sum, o) => sum + o.price, 0)
                .toLocaleString()} so'm
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Barcha Buyurtmalar</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-normal">
            {orders.length} ta
          </span>
        </h3>

        {orders.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-400 text-sm">
            Hali buyurtmalar mavjud emas. Ustalar katalogidan xizmat tanlang.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="glass-card p-5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
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

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div>Usta: <strong className="text-blue-400">{order.master_name}</strong></div>
                    <div>To'lov tizimi: <strong className="text-white uppercase">{order.payment_system || 'Payme'}</strong></div>
                    <div>Sana: {new Date(order.created_at).toLocaleDateString('uz-UZ')}</div>
                  </div>

                  {order.dispute_reason && (
                    <div className="mt-2 text-xs text-red-300 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                      <strong>E'tiroz sababi:</strong> {order.dispute_reason}
                    </div>
                  )}
                </div>

                {/* Price & Actions */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Summa:</span>
                    <span className="font-extrabold text-emerald-400 text-lg">
                      {order.price.toLocaleString()} so'm
                    </span>
                  </div>

                  {/* Actions for ESCROW_LOCKED */}
                  {order.status === 'escrow_locked' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApproveEscrow(order.id)}
                        className="btn-success py-2 px-3 text-xs rounded-xl"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Ishni Qabul Qildim</span>
                      </button>

                      <button
                        onClick={() => setSelectedDisputeOrderId(order.id)}
                        className="btn-secondary py-2 px-3 text-xs rounded-xl text-red-400 hover:border-red-500/40"
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
                      className="btn-primary py-2 px-3 text-xs rounded-xl"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-300" />
                      <span>Baho & Sharh berish</span>
                    </button>
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
              <span>Nizo Ochish (Dispute)</span>
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
                <button type="submit" className="btn-warning text-xs bg-red-600 hover:bg-red-700">
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
                <label className="text-xs text-gray-400 block mb-2">Yulduzli bahongiz:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1"
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
                <label className="text-xs text-gray-400 block mb-1">Yozma sharhingiz:</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ustaning mehnati va muomalasi haqida fikringiz..."
                  className="w-full bg-[#131B2E] border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReviewOrderId(null)} className="btn-secondary text-xs">
                  Yopish
                </button>
                <button type="submit" className="btn-primary text-xs">
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
