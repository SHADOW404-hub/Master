import { useState } from 'react';
import { useAppStore } from './services/store';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { MasterCard } from './components/MasterCard';
import { MasterDetailModal } from './components/MasterDetailModal';
import { EscrowCheckoutModal } from './components/EscrowCheckoutModal';
import { ClientDashboard } from './components/ClientDashboard';
import { MasterDashboard } from './components/MasterDashboard';
import { AdminPanel } from './components/AdminPanel';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { Master } from './types';
import { Shield, Lock, Wrench } from 'lucide-react';

export function App() {
  const store = useAppStore();

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'escrow' | 'warning' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [selectedMasterForDetail, setSelectedMasterForDetail] = useState<Master | null>(null);
  
  // Escrow Checkout State
  const [escrowCheckoutData, setEscrowCheckoutData] = useState<{
    master: Master;
    serviceTitle: string;
    price: number;
  } | null>(null);

  const [clientViewTab, setClientViewTab] = useState<'catalog' | 'my_orders'>('catalog');

  const selectedRegion = store.regions.find(r => r.id === store.selectedRegionId);
  const escrowOrdersCount = store.orders.filter(o => o.status === 'escrow_locked').length;

  const currentMaster = store.allMasters[0]; // Master view default context
  const masterWallet = store.getMasterWallet(currentMaster?.id || 'master-1');
  const financialStats = store.getFinancialStats();

  const handleInitiateEscrow = (master: Master, serviceTitle: string, price: number) => {
    setSelectedMasterForDetail(null);
    setEscrowCheckoutData({ master, serviceTitle, price });
  };

  const handleEscrowSuccess = (paymentSystem: 'payme' | 'click') => {
    if (escrowCheckoutData) {
      store.createEscrowOrder(
        escrowCheckoutData.master,
        escrowCheckoutData.serviceTitle,
        escrowCheckoutData.price,
        paymentSystem
      );
      addToast(
        'escrow', 
        'Escrow To\'lovi Muzlatildi!', 
        `${escrowCheckoutData.price.toLocaleString()} so'm pul platformada xavfsiz muzlatildi.`
      );
      setEscrowCheckoutData(null);
      setClientViewTab('my_orders');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-gray-100 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Header Navbar */}
      <Navbar
        activeRole={store.activeRole}
        setActiveRole={store.setActiveRole}
        regions={store.regions}
        districts={store.districts}
        selectedRegionId={store.selectedRegionId}
        setSelectedRegionId={store.setSelectedRegionId}
        selectedDistrictId={store.selectedDistrictId}
        setSelectedDistrictId={store.setSelectedDistrictId}
        escrowOrdersCount={escrowOrdersCount}
      />

      {/* MAIN CONTENT ROUTING BY ROLE */}
      <main className="flex-1">
        
        {/* ROLE 1: CLIENT PORTAL */}
        {store.activeRole === 'client' && (
          <div>
            {/* Hero Search */}
            <HeroSearch
              categories={store.categories}
              selectedCategory={store.selectedCategory}
              setSelectedCategory={store.setSelectedCategory}
              searchQuery={store.searchQuery}
              setSearchQuery={store.setSearchQuery}
              selectedRegion={selectedRegion}
              totalMastersFound={store.masters.length}
            />

            {/* Sub-nav for Client View: Katalog vs Mening Buyurtmalarim */}
            <div className="max-w-7xl mx-auto px-4 mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setClientViewTab('catalog')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    clientViewTab === 'catalog'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'glass-card text-gray-400 hover:text-white'
                  }`}
                >
                  Ustalar Katalogi ({store.masters.length})
                </button>

                <button
                  onClick={() => setClientViewTab('my_orders')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    clientViewTab === 'my_orders'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'glass-card text-gray-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mening Buyurtmalarim ({store.orders.length})</span>
                </button>
              </div>

              {selectedRegion && (
                <div className="text-xs text-blue-400 font-semibold hidden sm:block">
                  Filtr: {selectedRegion.name_uz}
                </div>
              )}
            </div>

            {/* Catalog Grid View */}
            {clientViewTab === 'catalog' && (
              <section className="max-w-7xl mx-auto px-4 pb-12">
                {store.masters.length === 0 ? (
                  <div className="glass-panel p-12 text-center text-gray-400 max-w-md mx-auto space-y-3 my-8">
                    <Wrench className="w-12 h-12 text-gray-500 mx-auto" />
                    <h3 className="text-lg font-bold text-white">Tanlangan hudud bo'yicha usta topilmadi</h3>
                    <p className="text-xs text-gray-400">
                      Iltimos, viloyat yoki tumanni almashtiring yoki qidiruv so'rovini tozalang.
                    </p>
                    <button
                      onClick={() => {
                        store.setSelectedRegionId('');
                        store.setSelectedDistrictId('');
                        store.setSelectedCategory('');
                        store.setSearchQuery('');
                      }}
                      className="btn-primary text-xs py-2 px-4 rounded-xl"
                    >
                      Filtrlarni Tozalash
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {store.masters.map((master) => (
                      <MasterCard
                        key={master.id}
                        master={master}
                        regions={store.regions}
                        allDistricts={store.allDistricts}
                        onOpenDetail={(m) => setSelectedMasterForDetail(m)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* My Orders Escrow View */}
            {clientViewTab === 'my_orders' && (
              <ClientDashboard
                orders={store.orders}
                onApproveEscrow={(id) => {
                  store.approveAndReleaseEscrow(id);
                  addToast('success', 'Ish Qabul Qilindi!', '98% pul ustaga o\'tkazildi, 2% platforma komissiyasi olindi.');
                }}
                onRaiseDispute={(id, reason) => {
                  store.raiseDispute(id, reason);
                  addToast('warning', 'Nizo Ochildi!', 'Order muzlatildi va Admin Desk ko\'rib chiqishga olindi.');
                }}
                onAddReview={(ordId, mId, rat, comm) => {
                  store.addReview(ordId, mId, rat, comm);
                  addToast('info', 'Sharh Chop Etildi', 'Ustaga yulduzli bahongiz muvaffaqiyatli saqlandi.');
                }}
              />
            )}
          </div>
        )}

        {/* ROLE 2: MASTER WORKSPACE */}
        {store.activeRole === 'master' && (
          <MasterDashboard
            master={currentMaster}
            wallet={masterWallet}
            onToggleStatus={(mId) => {
              store.toggleMasterStatus(mId);
              addToast('info', 'Status O\'zgardi', 'Profil ish statusi muvaffaqiyatli yangilandi.');
            }}
            onSubmitKYC={(mId, pass, photo) => {
              store.submitMasterKYC(mId, pass, photo);
              addToast('info', 'KYC Yuborildi', 'Pasport ma\'lumotlaringiz moderatorlarga tekshiruvga yuborildi.');
            }}
          />
        )}

        {/* ROLE 3: DUAL-ADMIN CONTROL PANEL */}
        {store.activeRole === 'admin' && (
          <AdminPanel
            masters={store.allMasters}
            orders={store.orders}
            audits={store.audits}
            financialStats={financialStats}
            onModerateKYC={(mId, approve, adminName, reason) => {
              store.moderateKYC(mId, approve, adminName, reason);
              addToast(
                approve ? 'success' : 'warning',
                approve ? 'KYC Tasdiqlandi' : 'KYC Rad Etildi',
                `Admin ${adminName}: Master KYC ${approve ? 'tasdiqlandi' : 'rad etildi'}`
              );
            }}
            onResolveDispute={(ordId, decision, adminName) => {
              store.resolveDispute(ordId, decision, adminName);
              addToast(
                'success',
                'Nizo Hal Qilindi',
                `Admin ${adminName}: ${decision === 'refund_client' ? 'Pul mijozga qaytarildi' : 'Pul ustaga o\'tkazildi'}`
              );
            }}
          />
        )}

      </main>

      {/* MODAL WINDOWS */}
      {selectedMasterForDetail && (
        <MasterDetailModal
          master={selectedMasterForDetail}
          reviews={store.reviews}
          regions={store.regions}
          allDistricts={store.allDistricts}
          onClose={() => setSelectedMasterForDetail(null)}
          onInitiateEscrow={handleInitiateEscrow}
        />
      )}

      {escrowCheckoutData && (
        <EscrowCheckoutModal
          master={escrowCheckoutData.master}
          serviceTitle={escrowCheckoutData.serviceTitle}
          price={escrowCheckoutData.price}
          onClose={() => setEscrowCheckoutData(null)}
          onSuccess={handleEscrowSuccess}
        />
      )}

      {/* FOOTER */}
      <footer className="glass-panel border-t border-white/10 mt-16 py-8 px-4 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-white text-base">
              <Wrench className="w-4 h-4 text-blue-400" />
              <span>USTAMIJOZ.UZ</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                2% ESCROW PROTOCOL
              </span>
            </div>
            <p className="mt-1 text-gray-400">
              O'zbekistonning barcha 12 viloyati, Toshkent shahri va Qoraqalpog'iston uchun xavfsiz ustalar platformasi.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-gray-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Pasport KYC Moderatsiyasi</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Payme / Click API Escrow</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default App;
