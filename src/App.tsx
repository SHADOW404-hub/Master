import { useState } from 'react';
import { useAppStore } from './services/store';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { HeroSearch } from './components/HeroSearch';
import { MasterCard } from './components/MasterCard';
import { MasterDetailModal } from './components/MasterDetailModal';
import { EscrowCheckoutModal } from './components/EscrowCheckoutModal';
import { ClientDashboard } from './components/ClientDashboard';
import { MasterDashboard } from './components/MasterDashboard';
import { AdminPanel } from './components/AdminPanel';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { Master, UserRole } from './types';
import { Shield, Lock, Wrench } from 'lucide-react';

export function App() {
  const store = useAppStore();

  // Sidebar & Auth State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    phone: string;
    role: UserRole;
  } | null>(() => {
    const saved = localStorage.getItem('usta_mijoz_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'master_workspace' | 'admin_panel'>('catalog');

  // Toasts State
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

  const selectedRegion = store.regions.find(r => r.id === store.selectedRegionId);
  const escrowOrdersCount = store.orders.filter(o => o.status === 'escrow_locked').length;

  const currentMaster = store.allMasters[0];
  const masterWallet = store.getMasterWallet(currentMaster?.id || 'master-1');
  const financialStats = store.getFinancialStats();

  const handleInitiateEscrow = (master: Master, serviceTitle: string, price: number) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
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
      setActiveTab('orders');
    }
  };

  const handleLoginSuccess = (userData: {
    name: string;
    phone: string;
    role: UserRole;
    region_id: string;
    district_id: string;
  }) => {
    const user = { name: userData.name, phone: userData.phone, role: userData.role };
    setCurrentUser(user);
    localStorage.setItem('usta_mijoz_current_user', JSON.stringify(user));
    store.setActiveRole(userData.role);
    store.setSelectedRegionId(userData.region_id);
    store.setSelectedDistrictId(userData.district_id);
    addToast('success', 'Muvaffaqiyatli Kirildi!', `Xush kelibsiz, ${userData.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('usta_mijoz_current_user');
    addToast('info', 'Tizimdan Chiqildi', 'Xavfsiz ravishda chiqdingiz.');
  };

  return (
    <div className="min-h-screen flex bg-[#0B0F19] text-gray-100 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeRole={store.activeRole}
        setActiveRole={store.setActiveRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        escrowOrdersCount={escrowOrdersCount}
      />

      {/* Main Workspace Layout with dynamic left margin */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
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
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1">
          
          {/* TAB 1: CATALOG & HERO SEARCH */}
          {activeTab === 'catalog' && (
            <div>
              <HeroSearch
                categories={store.categories}
                selectedCategory={store.selectedCategory}
                setSelectedCategory={store.setSelectedCategory}
                searchQuery={store.searchQuery}
                setSearchQuery={store.setSearchQuery}
                selectedRegion={selectedRegion}
                totalMastersFound={store.masters.length}
              />

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
            </div>
          )}

          {/* TAB 2: MY ESCROW ORDERS */}
          {activeTab === 'orders' && (
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

          {/* TAB 3: MASTER WORKSPACE */}
          {activeTab === 'master_workspace' && (
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

          {/* TAB 4: ADMIN CONTROL PANEL */}
          {activeTab === 'admin_panel' && (
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
        <AuthModal
          regions={store.regions}
          allDistricts={store.allDistricts}
          categories={store.categories}
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

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
        <footer className="glass-panel border-t border-white/10 py-6 px-6 text-xs text-gray-400 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-white">
                <Wrench className="w-4 h-4 text-blue-400" />
                <span>USTAMIJOZ.UZ</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  2% ESCROW PROTOCOL
                </span>
              </div>
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

    </div>
  );
}

export default App;
