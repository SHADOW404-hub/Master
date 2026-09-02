import React, { useState } from 'react';
import type { Master, Order, AuditLog } from '../types';
import { 
  ShieldCheck, DollarSign, Lock, 
  UserCheck, History, ArrowRightLeft, CheckCircle2, XCircle 
} from 'lucide-react';

interface AdminPanelProps {
  masters: Master[];
  orders: Order[];
  audits: AuditLog[];
  financialStats: {
    totalGMV: number;
    platformProfit: number;
    frozenEscrow: number;
    masterPayoutsTotal: number;
  };
  onModerateKYC: (masterId: string, approve: boolean, adminName: string, reason?: string) => void;
  onResolveDispute: (orderId: string, decision: 'refund_client' | 'release_master', adminName: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  masters,
  orders,
  audits,
  financialStats,
  onModerateKYC,
  onResolveDispute,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'finance' | 'kyc' | 'disputes' | 'audits'>('finance');
  const [selectedAdmin, setSelectedAdmin] = useState<string>('Admin Axror');

  const pendingKYCMasters = masters.filter(m => m.passport_kyc.status === 'pending');
  const disputedOrders = orders.filter(o => o.status === 'disputed');

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Banner & Dual-Admin Security Header */}
      <div className="glass-panel p-6 border border-indigo-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 2FA Autentifikatsiya Faol
            </span>
            <span className="text-xs text-gray-400">IP Cheklov: 195.158.12.44</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white mt-1">
            Boshqaruv Paneli (Admin Desk)
          </h2>
          <p className="text-xs text-gray-400">
            Teng huquqli 2 ta hamkor adminlar uchun RBAC modullari va moliya nazorati.
          </p>
        </div>

        {/* Admin Switcher */}
        <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/10 text-xs">
          <span className="text-gray-400 font-semibold">Admin:</span>
          <select
            value={selectedAdmin}
            onChange={(e) => setSelectedAdmin(e.target.value)}
            className="bg-[#131B2E] text-white font-bold px-3 py-1.5 rounded-lg border border-white/10 outline-none"
          >
            <option value="Admin Axror">Admin Axror (Hamkor 1)</option>
            <option value="Admin Nigora">Admin Nigora (Hamkor 2)</option>
          </select>
        </div>

      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 border border-indigo-500/30">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
            <span>2% Sof Platforma Foydasi</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">
            {financialStats.platformProfit.toLocaleString()} <span className="text-xs">so'm</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Barcha muvaffaqiyatli 2% yig'imlar</p>
        </div>

        <div className="glass-card p-5 border border-amber-500/30">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
            <span>Muzlatilgan Escrow Pul</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2">
            {financialStats.frozenEscrow.toLocaleString()} <span className="text-xs">so'm</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Hozir platforma hisobida saqlanmoqda</p>
        </div>

        <div className="glass-card p-5 border border-blue-500/30">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
            <span>Jami Tranzaksiyalar (GMV)</span>
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {financialStats.totalGMV.toLocaleString()} <span className="text-xs">so'm</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Platforma aylanmasi</p>
        </div>

        <div className="glass-card p-5 border border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
            <span>Ustalarga O'tkazilgan (98%)</span>
            <UserCheck className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-2xl font-extrabold text-gray-200 mt-2">
            {financialStats.masterPayoutsTotal.toLocaleString()} <span className="text-xs">so'm</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Ustalarning sof daromadi</p>
        </div>

      </div>

      {/* Admin Module Tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveAdminTab('finance')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeAdminTab === 'finance'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 bg-white/5 hover:text-white'
          }`}
        >
          Moliya Moduli
        </button>

        <button
          onClick={() => setActiveAdminTab('kyc')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
            activeAdminTab === 'kyc'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 bg-white/5 hover:text-white'
          }`}
        >
          <span>KYC Moderatsiya</span>
          {pendingKYCMasters.length > 0 && (
            <span className="bg-amber-500 text-black px-1.5 py-0.2 rounded-full font-bold text-[10px]">
              {pendingKYCMasters.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('disputes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
            activeAdminTab === 'disputes'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 bg-white/5 hover:text-white'
          }`}
        >
          <span>Nizolar Stoli (Dispute Desk)</span>
          {disputedOrders.length > 0 && (
            <span className="bg-red-500 text-white px-1.5 py-0.2 rounded-full font-bold text-[10px] animate-pulse">
              {disputedOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('audits')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
            activeAdminTab === 'audits'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 bg-white/5 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Log Tarixi</span>
        </button>
      </div>

      {/* Tab 1: Finance Summary */}
      {activeAdminTab === 'finance' && (
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-base font-bold text-white">Platformaning Moliya Statistikasi va Tranzaksiyalar</h3>
          <p className="text-xs text-gray-400">
            Har bir muvaffaqiyatli buyurtmadan avtomatik 2% platforma komissiyasi ushlanadi.
          </p>

          <div className="bg-black/30 rounded-xl border border-white/10 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block">Jami Ustalar Soni:</span>
                <strong className="text-white text-base">{masters.length} ta</strong>
              </div>
              <div>
                <span className="text-gray-400 block">KYC Tasdiqlangan Ustalar:</span>
                <strong className="text-emerald-400 text-base">
                  {masters.filter(m => m.passport_kyc.status === 'verified').length} ta
                </strong>
              </div>
              <div>
                <span className="text-gray-400 block">Jami Buyurtmalar:</span>
                <strong className="text-blue-400 text-base">{orders.length} ta</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: KYC Moderation Queue */}
      {activeAdminTab === 'kyc' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Pasport va Shaxsiyat Moderatsiyasi Navbati</h3>
          
          {pendingKYCMasters.length === 0 ? (
            <div className="glass-card p-8 text-center text-gray-400 text-xs">
              Yangi moderatsiyaga kelgan KYC hujjatlari yo'q. Allaqachon ko'rib chiqilgan.
            </div>
          ) : (
            pendingKYCMasters.map((master) => (
              <div key={master.id} className="glass-card p-5 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={master.avatar} alt={master.name} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-base">{master.name}</h4>
                    <p className="text-xs text-gray-400">
                      Kategoriya: <strong className="text-blue-400">{master.category_name}</strong> | Pasport: <strong className="text-white uppercase">{master.passport_kyc.passportNumber}</strong>
                    </p>
                    <span className="text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Yuborilgan sana: {master.passport_kyc.submittedAt || 'Bugun'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onModerateKYC(master.id, true, selectedAdmin)}
                    className="btn-success py-2 px-4 text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tasdiqlash (Approve)</span>
                  </button>

                  <button
                    onClick={() => onModerateKYC(master.id, false, selectedAdmin, "Pasport nusxasi noaniq")}
                    className="btn-secondary text-red-400 hover:border-red-500/40 py-2 px-3 text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rad Etish</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Dispute Desk */}
      {activeAdminTab === 'disputes' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Mijoz va Usta O'rtasidagi Nizolarni Hal Qilish</h3>
          
          {disputedOrders.length === 0 ? (
            <div className="glass-card p-8 text-center text-gray-400 text-xs">
              Hozirda hech qanday hal qilinmagan nizolar mavjud emas.
            </div>
          ) : (
            disputedOrders.map((order) => (
              <div key={order.id} className="glass-card p-5 border border-red-500/40 space-y-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <span className="text-xs text-red-400 font-bold uppercase tracking-wider block">
                      Nizoli Buyurtma #{order.id}
                    </span>
                    <h4 className="text-lg font-extrabold text-white">{order.service_title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Muzlatilgan Escrow Summa:</span>
                    <span className="text-xl font-extrabold text-amber-400">
                      {order.price.toLocaleString()} so'm
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-black/40 p-3 rounded-xl border border-white/10">
                  <div>Mijoz: <strong className="text-white">{order.client_name}</strong></div>
                  <div>Usta: <strong className="text-blue-400">{order.master_name}</strong></div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-200">
                  <strong>E'tiroz Sababi:</strong> {order.dispute_reason}
                </div>

                {/* Admin Decision Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => onResolveDispute(order.id, 'refund_client', selectedAdmin)}
                    className="btn-secondary text-red-300 hover:bg-red-500/20 py-2 px-4 text-xs font-bold rounded-xl"
                  >
                    Pulni Mijozga QAYTARISH ({order.price.toLocaleString()} so'm)
                  </button>

                  <button
                    onClick={() => onResolveDispute(order.id, 'release_master', selectedAdmin)}
                    className="btn-success py-2 px-4 text-xs font-bold rounded-xl"
                  >
                    Pulni Ustaga O'TKAZISH (98% Usta / 2% Admin)
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeAdminTab === 'audits' && (
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Admin Bajarilgan Harakatlar Audit Tarixi (RBAC Log)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Sana & Vaqt</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Harakat</th>
                  <th className="p-3">Tafsilotlar</th>
                  <th className="p-3">IP Manzil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {audits.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5">
                    <td className="p-3 text-gray-400 font-mono">
                      {new Date(log.created_at).toLocaleString('uz-UZ')}
                    </td>
                    <td className="p-3 font-bold text-indigo-300">{log.admin_name}</td>
                    <td className="p-3 font-bold text-white">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">{log.details}</td>
                    <td className="p-3 font-mono text-gray-400">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </section>
  );
};
