import { useState, useEffect } from 'react';
import { useAppStore } from './services/store';
import { Navbar } from './components/Navbar';
import { AuthLanding } from './components/AuthLanding';
import { ProfilePage } from './components/ProfilePage';
import { HeroSearch } from './components/HeroSearch';
import { MasterCard } from './components/MasterCard';
import { MasterDetailModal } from './components/MasterDetailModal';
import { EscrowCheckoutModal } from './components/EscrowCheckoutModal';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminPanel } from './components/AdminPanel';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { Master, UserRole } from './types';
import { Shield, Lock, Wrench } from 'lucide-react';
import { supabase, onAuthStateChange } from './services/supabase';

export function App() {
  const store = useAppStore();

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    phone: string;
    role: UserRole;
  } | null>(() => {
    const saved = localStorage.getItem('usta_mijoz_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Supabase auth holati o'zgarganda user yangilanadi
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (authUser) => {
      if (!authUser) {
        // Session yo'q — local storage dan o'chiramiz
        const saved = localStorage.getItem('usta_mijoz_current_user');
        if (!saved) setCurrentUser(null);
      } else {
        // Session bor — profil ma'lumotlarini olamiz
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          const user = {
            name: profile.name,
            email: profile.email,
            phone: profile.phone || '',
            role: profile.role as UserRole,
          };
          setCurrentUser(user);
          localStorage.setItem('usta_mijoz_current_user', JSON.stringify(user));
          store.setActiveRole(profile.role as UserRole);
          if (profile.region_id) store.setSelectedRegionId(profile.region_id);
          if (profile.district_id) store.setSelectedDistrictId(profile.district_id);
        }
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Active view tab state ('auth' | 'catalog' | 'orders' | 'profile' | 'admin_panel')
  const [activeTab, setActiveTab] = useState<'auth' | 'catalog' | 'orders' | 'profile' | 'admin_panel'>(() => {
    const savedUser = localStorage.getItem('usta_mijoz_current_user');
    return savedUser ? 'catalog' : 'auth'; // Default to Auth Landing if not logged in
  });

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
      setActiveTab('auth');
      addToast('info', 'Tizimga Kirish Shart', 'Buyurtma berish uchun iltimos kiring yoki ro\'yxatdan o\'ting.');
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
    email: string;
    phone: string;
    role: UserRole;
    region_id: string;
    district_id: string;
    category_id?: string;
  }) => {
    const user = { name: userData.name, email: userData.email, phone: userData.phone, role: userData.role };
    setCurrentUser(user);
    localStorage.setItem('usta_mijoz_current_user', JSON.stringify(user));
    store.setActiveRole(userData.role);
    store.setSelectedRegionId(userData.region_id);
    store.setSelectedDistrictId(userData.district_id);
    setActiveTab('catalog');
    addToast('success', 'Xush Kelibsiz!', `${userData.name}, platformadan xavfsiz foydalanishingiz mumkin.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('usta_mijoz_current_user');
    setActiveTab('auth');
    addToast('info', 'Tizimdan Chiqildi', 'Xavfsiz ravishda chiqdingiz.');
  };

  // If activeTab is 'auth', show full-screen Auth Landing page
  if (activeTab === 'auth' && !currentUser) {
    return (
      <div className="min-h-screen bg-[#070A12] text-gray-100 font-sans">
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <AuthLanding
          regions={store.regions}
          allDistricts={store.allDistricts}
          categories={store.categories}
          onLoginSuccess={handleLoginSuccess}
          onBrowseGuest={() => setActiveTab('catalog')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070A12] text-gray-100 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Floating Header Navbar */}
      <Navbar
        activeRole={store.activeRole}
        setActiveRole={store.setActiveRole}
        activeTab={activeTab === 'auth' ? 'catalog' : activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        regions={store.regions}
        districts={store.districts}
        selectedRegionId={store.selectedRegionId}
        setSelectedRegionId={store.setSelectedRegionId}
        selectedDistrictId={store.selectedDistrictId}
        setSelectedDistrictId={store.setSelectedDistrictId}
        escrowOrdersCount={escrowOrdersCount}
        currentUser={currentUser}
        onOpenAuth={() => setActiveTab('auth')}
        onLogout={handleLogout}
      />

      {/* MAIN VIEW ROUTER */}
      <main className="flex-1">
        
        {/* VIEW 1: CATALOG & MARKETPLACE SEARCH */}
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

            <section className="max-w-7xl mx-auto px-4 pb-16">
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
                    className="btn-primary text-xs py-2 px-4 rounded-xl font-bold"
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

        {/* VIEW 2: MY ESCROW ORDERS */}
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

        {/* VIEW 3: STANDALONE PROFILE PAGE */}
        {activeTab === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            master={currentMaster}
            wallet={masterWallet}
            regions={store.regions}
            allDistricts={store.allDistricts}
            onToggleStatus={(mId) => {
              store.toggleMasterStatus(mId);
              addToast('info', 'Status O\'zgardi', 'Profil ish statusi muvaffaqiyatli yangilandi.');
            }}
            onSubmitKYC={(mId, pass, photo) => {
              store.submitMasterKYC(mId, pass, photo);
              addToast('info', 'KYC Yuborildi', 'Pasport ma\'lumotlaringiz moderatorlarga tekshiruvga yuborildi.');
            }}
            onOpenAuth={() => setActiveTab('auth')}
            onLogout={handleLogout}
          />
        )}

        {/* VIEW 4: DUAL ADMIN DESK */}
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

      {/* MODALS */}
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
            <div className="flex items-center gap-2 font-extrabold text-white text-sm">
              <Wrench className="w-4 h-4 text-blue-400" />
              <span>USTAMIJOZ.UZ</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
                2% ESCROW PROTOCOL
              </span>
            </div>
            <p className="text-gray-400 mt-1">
              O'zbekistonning barcha 14 hududi bo'yicha ishonchli ustalar va mijozlar platformasi.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-gray-300 font-semibold">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Pasport KYC Moderatsiyasi</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300 font-semibold">
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
