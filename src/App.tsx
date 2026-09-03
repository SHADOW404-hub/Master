import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from './services/store';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ProfilePage } from './components/ProfilePage';
import { HeroSearch } from './components/HeroSearch';
import { MasterCard } from './components/MasterCard';
import { MasterDetailModal } from './components/MasterDetailModal';
import { EscrowCheckoutModal } from './components/EscrowCheckoutModal';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminPanel } from './components/AdminPanel';
import { JobBoard } from './components/JobBoard';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { Master, UserRole } from './types';
import { Shield, Lock, Wrench } from 'lucide-react';
import { supabase, onAuthStateChange, authSignOut } from './services/supabase';

// ─── Theme helpers (run immediately so no flash on load) ─────────────────────
const THEME_KEY = 'usta_mijoz_theme';

function getInitialTheme(): 'dark' | 'light' {
  try {
    const saved = localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
    if (saved === 'dark' || saved === 'light') return saved;
  } catch { /* ignore */ }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// Apply theme to <html> before first render
(function applyThemeEarly() {
  const t = (() => {
    try {
      const s = localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
      if (s === 'dark' || s === 'light') return s;
    } catch { /* ignore */ }
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  })();
  document.documentElement.setAttribute('data-theme', t);
})();

// ─── Page View types ────────────────────────────────────────────────────────
type PageView =
  | 'landing'
  | 'login'
  | 'register'
  | 'forgot'
  | 'catalog'
  | 'jobs'
  | 'orders'
  | 'profile'
  | 'admin_panel';

// ─── Foydalanuvchi ma'lumotlari ─────────────────────────────────────────────
export interface CurrentUser {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  region_id?: string;
  district_id?: string;
}

const STORAGE_KEY = 'usta_mijoz_current_user';
const PUBLIC_PAGES: PageView[] = ['landing', 'login', 'register', 'forgot', 'catalog', 'jobs', 'profile'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getSavedUser(): CurrentUser | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as CurrentUser) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveUser(user: CurrentUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export function App() {
  const store = useAppStore();

  // ── Theme State ─────────────────────────────────────────────────────
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme);

  const handleToggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Sync data-theme attribute on mount (in case React hydration differs)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Auth State ──────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(getSavedUser);

  // ── Page Routing ────────────────────────────────────────────────────
  const [activePage, setActivePage] = useState<PageView>(() =>
    getSavedUser() ? 'catalog' : 'landing'
  );

  // ── Toast ───────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: 'success' | 'escrow' | 'warning' | 'info', title: string, message: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Modal states ────────────────────────────────────────────────────
  const [selectedMasterForDetail, setSelectedMasterForDetail] = useState<Master | null>(null);
  const [escrowCheckoutData, setEscrowCheckoutData] = useState<{
    master: Master;
    serviceTitle: string;
    price: number;
  } | null>(null);

  // Restore and sync saved master profile + fetch all registered masters from Supabase on mount
  useEffect(() => {
    const fetchMastersFromDatabase = async () => {
      // 1. Sync local saved master if present
      const saved = getSavedUser();
      if (saved && saved.role === 'master') {
        store.registerMasterInStore(saved);
      }

      // 2. Fetch all registered masters from Supabase profiles table
      try {
        const { data: dbMasters, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'master');

        if (dbMasters && !error && dbMasters.length > 0) {
          dbMasters.forEach((m) => {
            store.registerMasterInStore({
              id: m.id,
              name: m.name,
              email: m.email,
              phone: m.phone || '',
              role: 'master',
              region_id: m.region_id || '',
              district_id: m.district_id || '',
              category_id: m.category_id || undefined,
            });
          });
        }
      } catch (e) {
        console.warn('Supabase ustalarni yuklashda tarmoq xatosi:', e);
      }
    };

    fetchMastersFromDatabase();
  }, []);

  // ── Supabase auth state listener ────────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (authUser) => {
      if (!authUser) {
        // Session tugadi — faqat avval login qilingan bo'lsa landingga o'tadi
        const hadSavedUser = Boolean(localStorage.getItem(STORAGE_KEY));
        clearUser();
        setCurrentUser(null);
        if (hadSavedUser) {
          setActivePage('landing');
        }
        return;
      }

      // Session bor — Supabase profiles jadvalidan haqiqiy ma'lumot ol
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, name, email, phone, role, region_id, district_id, category_id')
          .eq('id', authUser.id)
          .single();

        if (profile && !error) {
          const user: CurrentUser = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone || '',
            role: profile.role as UserRole,
            region_id: profile.region_id || '',
            district_id: profile.district_id || '',
          };
          if (profile.role === 'master') {
            store.registerMasterInStore({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              phone: profile.phone || '',
              role: 'master',
              region_id: profile.region_id || '',
              district_id: profile.district_id || '',
              category_id: profile.category_id || undefined,
            });
          }
          setCurrentUser(user);
          saveUser(user);
          store.setActiveRole(profile.role as UserRole);
          if (profile.region_id) store.setSelectedRegionId(profile.region_id);
          if (profile.district_id) store.setSelectedDistrictId(profile.district_id);
        }
      } catch {
        // Supabase ulanmagan bo'lsa — localStorage'dagi ma'lumotni ishlatib davom et
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived values ──────────────────────────────────────────────────
  const selectedRegion = store.regions.find((r) => r.id === store.selectedRegionId);
  const escrowOrdersCount = store.orders.filter((o) => o.status === 'escrow_locked').length;

  // Joriy foydalanuvchiga tegishli master profilini top (agar usta bo'lsa)
  const currentMaster =
    currentUser?.role === 'master'
      ? store.allMasters.find(
          (m) =>
            m.name.toLowerCase() === currentUser.name.toLowerCase() ||
            m.user_id === currentUser.id
        ) || store.allMasters[0]
      : store.allMasters[0];

  const masterWallet = store.getMasterWallet(currentMaster?.id || 'master-1');
  const financialStats = store.getFinancialStats();

  // ── Handlers ────────────────────────────────────────────────────────

  /** Muvaffaqiyatli login/register dan keyin chaqiriladi */
  const handleLoginSuccess = useCallback(
    (userData: {
      id?: string;
      name: string;
      email: string;
      phone: string;
      role: UserRole;
      region_id: string;
      district_id: string;
      category_id?: string;
    }) => {
      const user: CurrentUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        region_id: userData.region_id,
        district_id: userData.district_id,
      };

      if (userData.role === 'master') {
        store.registerMasterInStore(userData);
      }

      setCurrentUser(user);
      saveUser(user);
      store.setActiveRole(userData.role);
      if (userData.region_id) store.setSelectedRegionId(userData.region_id);
      if (userData.district_id) store.setSelectedDistrictId(userData.district_id);
      setActivePage('catalog');
      addToast(
        'success',
        'Xush Kelibsiz!',
        `${userData.name}, platformadan xavfsiz foydalanishingiz mumkin.`
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addToast]
  );

  const handleLogout = useCallback(async () => {
    try {
      await authSignOut();
    } catch {
      /* ignore network errors */
    }
    clearUser();
    setCurrentUser(null);
    setActivePage('landing');
    addToast('info', 'Tizimdan Chiqildi', 'Xavfsiz ravishda chiqdingiz.');
  }, [addToast]);

  const handleInitiateEscrow = useCallback(
    (master: Master, serviceTitle: string, price: number) => {
      if (!currentUser) {
        setActivePage('login');
        addToast(
          'info',
          'Tizimga Kirish Shart',
          "Buyurtma berish uchun iltimos kiring yoki ro'yxatdan o'ting."
        );
        return;
      }
      setSelectedMasterForDetail(null);
      setEscrowCheckoutData({ master, serviceTitle, price });
    },
    [currentUser, addToast]
  );

  const handleEscrowSuccess = useCallback(
    (paymentSystem: 'payme' | 'click') => {
      if (escrowCheckoutData) {
        store.createEscrowOrder(
          escrowCheckoutData.master,
          escrowCheckoutData.serviceTitle,
          escrowCheckoutData.price,
          paymentSystem,
          currentUser
        );
        addToast(
          'escrow',
          "Escrow To'lovi Muzlatildi!",
          `${escrowCheckoutData.price.toLocaleString()} so'm pul platformada xavfsiz muzlatildi.`
        );
        setEscrowCheckoutData(null);
        setActivePage('orders');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [escrowCheckoutData, currentUser, addToast]
  );

  // ── Auth pages (no Navbar) ───────────────────────────────────────────

  /** Landing — faqat login qilmagan foydalanuvchilar uchun */
  if (activePage === 'landing' && !currentUser) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <LandingPage
          onGoLogin={() => setActivePage('login')}
          onGoRegister={() => setActivePage('register')}
          onBrowseGuest={() => setActivePage('catalog')}
        />
      </>
    );
  }

  /** Kirish sahifasi */
  if (activePage === 'login' && !currentUser) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onGoRegister={() => setActivePage('register')}
          onGoLanding={() => setActivePage('landing')}
          onForgotPassword={() => setActivePage('forgot')}
        />
      </>
    );
  }

  /** Ro'yxatdan o'tish sahifasi */
  if (activePage === 'register' && !currentUser) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <RegisterPage
          regions={store.regions}
          allDistricts={store.allDistricts}
          categories={store.categories}
          onGoLogin={() => setActivePage('login')}
          onGoLanding={() => setActivePage('landing')}
          onRegisterSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  /** Parolni tiklash sahifasi */
  if (activePage === 'forgot' && !currentUser) {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <ForgotPasswordPage
          onGoLogin={() => setActivePage('login')}
          onGoLanding={() => setActivePage('landing')}
        />
      </>
    );
  }

  // ── Main app (with Navbar) ──────────────────────────────────────────
  // Login qilmagan foydalanuvchi yopiq sahifaga ('orders', 'admin_panel') kirmasligi uchun
  if (!currentUser && !PUBLIC_PAGES.includes(activePage)) {
    setActivePage('login');
    return null;
  }

  // Navbar uchun activeTab
  const navTab = (['catalog', 'jobs', 'orders', 'profile', 'admin_panel'] as const).includes(
    activePage as 'catalog' | 'jobs' | 'orders' | 'profile' | 'admin_panel'
  )
    ? (activePage as 'catalog' | 'jobs' | 'orders' | 'profile' | 'admin_panel')
    : 'catalog';

  const openJobsCount = currentUser?.role === 'client'
    ? store.jobRequests.filter(j => (j.client_id === currentUser.id || j.client_id === currentUser.email) && j.status === 'open').length
    : store.jobRequests.filter(j => j.status === 'open').length;

  return (
    <div
      className="min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Navbar */}
      <Navbar
        activeRole={store.activeRole}
        setActiveRole={store.setActiveRole}
        activeTab={navTab}
        setActiveTab={(tab) => setActivePage(tab)}
        regions={store.regions}
        districts={store.districts}
        selectedRegionId={store.selectedRegionId}
        setSelectedRegionId={store.setSelectedRegionId}
        selectedDistrictId={store.selectedDistrictId}
        setSelectedDistrictId={store.setSelectedDistrictId}
        escrowOrdersCount={escrowOrdersCount}
        openJobsCount={openJobsCount}
        currentUser={currentUser}
        onOpenAuth={() => setActivePage('login')}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">

        {/* VIEW: CATALOG (Ustalarga Mijozlar Ishlari stoli, Mijozlarga Ustalari katalogi ko'rinadi) */}
        {activePage === 'catalog' && (
          currentUser?.role === 'master' ? (
            <JobBoard
              currentUser={currentUser}
              currentMaster={currentMaster}
              jobRequests={store.jobRequests}
              categories={store.categories}
              regions={store.regions}
              allDistricts={store.allDistricts}
              selectedRegionId={store.selectedRegionId}
              onAcceptJob={(jobId, master, arrivalTime) => {
                store.acceptJobRequest(jobId, master, arrivalTime);
                addToast(
                  'escrow',
                  'Ish Qabul Qilindi!',
                  `Mijozga xabar berildi va borish vaqti (${arrivalTime}) saqlandi. To'lov platformada muzlatildi.`
                );
              }}
              onCreateJob={() => { /* usta ish e'lon qila olmaydi */ }}
              onCancelJob={(jobId) => {
                store.cancelJobRequest(jobId);
                addToast('info', "E'lon O'chirildi", "Ish e'loningiz muvaffaqiyatli o'chirildi.");
              }}
              onOpenAuth={() => setActivePage('login')}
            />
          ) : (
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
              <section className="max-w-7xl mx-auto pb-16">
                {store.masters.length === 0 ? (
                  <div className="glass-panel p-10 text-center text-gray-400 max-w-md mx-auto space-y-4 my-8 border border-blue-500/20 rounded-3xl shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30">
                      <Wrench className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-extrabold text-white">
                      {store.allMasters.length === 0
                        ? "Hozircha ro'yxatdan o'tgan ustalar mavjud emas"
                        : "Tanlangan filtr bo'yicha usta topilmadi"}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {store.allMasters.length === 0
                        ? "Platformaga birinchi usta bo'lib ro'yxatdan o'ting va o'z xizmatlaringizni taklif qiling!"
                        : "Iltimos, viloyat yoki tumanni almashtiring yoki qidiruv so'rovini tozalang."}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                      {store.allMasters.length === 0 ? (
                        <button
                          onClick={() => setActivePage('register')}
                          className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold"
                        >
                          Usta Bo'lib Ro'yxatdan O'tish
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            store.setSelectedRegionId('');
                            store.setSelectedDistrictId('');
                            store.setSelectedCategory('');
                            store.setSearchQuery('');
                          }}
                          className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold"
                        >
                          Filtrlarni Tozalash
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
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
          )
        )}

        {/* VIEW: JOB BOARD */}
        {activePage === 'jobs' && (
          <JobBoard
            currentUser={currentUser}
            currentMaster={currentMaster}
            jobRequests={store.jobRequests}
            categories={store.categories}
            regions={store.regions}
            allDistricts={store.allDistricts}
            selectedRegionId={store.selectedRegionId}
            onAcceptJob={(jobId, master, arrivalTime) => {
              store.acceptJobRequest(jobId, master, arrivalTime);
              addToast(
                'escrow',
                'Ish Qabul Qilindi!',
                `Mijozga xabar berildi va borish vaqti (${arrivalTime}) saqlandi. To'lov platformada muzlatildi.`
              );
            }}
            onCreateJob={(jobData) => {
              if (currentUser) {
                store.createJobRequest({
                  ...jobData,
                  clientUser: currentUser,
                });
                addToast(
                  'success',
                  'Ish E\'lon Qilindi!',
                  'Ishingiz muvaffaqiyatli e\'longa joylandi. Ustalar borish vaqtini belgilab qabul qilishadi.'
                );
              }
            }}
            onCancelJob={(jobId) => {
              store.cancelJobRequest(jobId);
              addToast('info', 'E\'lon O\'chirildi', 'Ish e\'loningiz muvaffaqiyatli o\'chirildi.');
            }}
            onOpenAuth={() => setActivePage('login')}
          />
        )}

        {/* VIEW: ORDERS */}
        {activePage === 'orders' && (
          <ClientDashboard
            currentUser={currentUser}
            orders={store.orders}
            onApproveEscrow={(id) => {
              store.approveAndReleaseEscrow(id);
              addToast(
                'success',
                'Ish Qabul Qilindi!',
                "98% pul ustaga o'tkazildi, 2% platforma komissiyasi olindi."
              );
            }}
            onRaiseDispute={(id, reason) => {
              store.raiseDispute(id, reason);
              addToast(
                'warning',
                'Nizo Ochildi!',
                "Order muzlatildi va Admin Desk ko'rib chiqishga olindi."
              );
            }}
            onAddReview={(ordId, mId, rat, comm) => {
              store.addReview(ordId, mId, rat, comm, currentUser);
              addToast(
                'info',
                'Sharh Chop Etildi',
                'Ustaga yulduzli bahongiz muvaffaqiyatli saqlandi.'
              );
            }}
          />
        )}

        {/* VIEW: PROFILE */}
        {activePage === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            master={currentMaster}
            wallet={masterWallet}
            regions={store.regions}
            allDistricts={store.allDistricts}
            onToggleStatus={(mId) => {
              store.toggleMasterStatus(mId);
              addToast('info', "Status O'zgardi", 'Profil ish statusi muvaffaqiyatli yangilandi.');
            }}
            onUpdateMasterProfile={(mId, updates) => {
              store.updateMasterProfile(mId, updates);
              addToast('success', 'Profil Yangilandi', "Usta xizmat ma'lumotlari saqlandi.");
            }}
            onSubmitKYC={(mId, pass, photo) => {
              store.submitMasterKYC(mId, pass, photo);
              addToast(
                'info',
                'KYC Yuborildi',
                "Pasport ma'lumotlaringiz moderatorlarga tekshiruvga yuborildi."
              );
            }}
            onWithdrawMoney={(mId, amount, card) => {
              store.withdrawMasterBalance(mId, amount, card);
              addToast(
                'success',
                'Pul Yechildi',
                `${amount.toLocaleString()} so'm ${card} kartasiga o'tkazildi.`
              );
            }}
            onOpenAuth={() => setActivePage('login')}
            onLogout={handleLogout}
          />
        )}

        {/* VIEW: ADMIN */}
        {activePage === 'admin_panel' && currentUser?.role === 'admin' && (
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
                `Admin ${adminName}: ${decision === 'refund_client' ? 'Pul mijozga qaytarildi' : "Pul ustaga o'tkazildi"}`
              );
            }}
          />
        )}

        {/* Admin sahifasiga ruxsatsiz kirish */}
        {activePage === 'admin_panel' && currentUser?.role !== 'admin' && (
          <div className="glass-panel p-12 text-center max-w-md mx-auto mt-8 space-y-4">
            <Shield className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Kirish Taqiqlangan</h3>
            <p className="text-xs text-gray-400">
              Admin paneliga faqat tizim administratorlari kirishi mumkin.
            </p>
            <button
              onClick={() => setActivePage('catalog')}
              className="btn-primary text-xs py-2 px-4 rounded-xl"
            >
              Katalogga Qaytish
            </button>
          </div>
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
      <footer
        className="glass-panel border-t py-6 px-4 sm:px-6 text-xs mt-auto"
        style={{ borderTopColor: 'var(--border)', color: 'var(--muted)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-extrabold text-sm" style={{ color: 'var(--text)' }}>
              <Wrench className="w-4 h-4 text-blue-400" />
              <span>USTAMIJOZ.UZ</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
                2% ESCROW PROTOCOL
              </span>
            </div>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>
              O'zbekistonning barcha 14 hududi bo'yicha ishonchli ustalar va mijozlar platformasi.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--muted)' }}>
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Pasport KYC Moderatsiyasi</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--muted)' }}>
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Payme / Click Escrow</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
