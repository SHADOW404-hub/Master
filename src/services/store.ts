import { useState, useEffect } from 'react';
import type { 
  UserRole, Master, Order, Transaction, 
  Review, AuditLog, MasterWallet, JobRequest 
} from '../types';
import { 
  REGIONS, DISTRICTS, CATEGORIES,
  SEED_ORDERS, SEED_TRANSACTIONS, SEED_REVIEWS, SEED_AUDIT_LOGS 
} from '../data/seedData';
import { getAvatarSVG, getPortfolioVectorSVG } from '../utils/avatar';

const STORAGE_KEYS = {
  MASTERS: 'usta_mijoz_masters',
  ORDERS: 'usta_mijoz_orders',
  TRANSACTIONS: 'usta_mijoz_transactions',
  REVIEWS: 'usta_mijoz_reviews',
  AUDITS: 'usta_mijoz_audits',
  PAYOUTS: 'usta_mijoz_payouts',
  JOB_REQUESTS: 'usta_mijoz_job_requests',
};

// Helper for initial load
const getInitial = <T>(key: string, seed: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : seed;
  } catch (e) {
    return seed;
  }
};

export function useAppStore() {
  const [activeRole, setActiveRole] = useState<UserRole>('client');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persistent States — Active real registered masters only (fake seed masters removed)
  const [masters, setMasters] = useState<Master[]>(() => {
    const initial = getInitial<Master[]>(STORAGE_KEYS.MASTERS, []);
    return (initial || []).filter(m => !m.id.startsWith('master-real-'));
  });
  const [orders, setOrders] = useState<Order[]>(() => getInitial(STORAGE_KEYS.ORDERS, SEED_ORDERS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getInitial(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS));
  const [reviews, setReviews] = useState<Review[]>(() => getInitial(STORAGE_KEYS.REVIEWS, SEED_REVIEWS));
  const [audits, setAudits] = useState<AuditLog[]>(() => getInitial(STORAGE_KEYS.AUDITS, SEED_AUDIT_LOGS));
  const [jobRequests, setJobRequests] = useState<JobRequest[]>(() => getInitial(STORAGE_KEYS.JOB_REQUESTS, []));

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MASTERS, JSON.stringify(masters));
  }, [masters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOB_REQUESTS, JSON.stringify(jobRequests));
  }, [jobRequests]);

  // Admin logger helper
  const addAuditLog = (adminName: string, action: string, details: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      admin_id: 'adm-current',
      admin_name: adminName,
      action,
      details,
      ip_address: '195.158.16.88',
      created_at: new Date().toISOString(),
    };
    setAudits(prev => [newLog, ...prev]);
  };

  // --- ACTIONS ---

  // 1. Filtered Masters list with Regional Priority
  const getFilteredMasters = () => {
    return masters.filter(m => {
      // Category filter
      if (selectedCategory && m.category_id !== selectedCategory) return false;
      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchBio = m.bio.toLowerCase().includes(q);
        const matchCategory = m.category_name.toLowerCase().includes(q);
        if (!matchName && !matchBio && !matchCategory) return false;
      }
      // District filter (strict if specified)
      if (selectedDistrictId && m.district_id !== selectedDistrictId) return false;
      // Region filter (strict if specified)
      if (selectedRegionId && m.region_id !== selectedRegionId) return false;

      return true;
    }).sort((a, b) => {
      // Priority sorting: verified KYC first, then rating
      if (a.passport_kyc.status === 'verified' && b.passport_kyc.status !== 'verified') return -1;
      if (a.passport_kyc.status !== 'verified' && b.passport_kyc.status === 'verified') return 1;
      return b.rating - a.rating;
    });
  };

  // 2. Escrow Order Creation & Payment (Payme / Click)
  const createEscrowOrder = (
    master: Master, 
    serviceTitle: string, 
    price: number, 
    paymentSystem: 'payme' | 'click',
    clientUser?: { id?: string; name: string; email?: string } | null
  ) => {
    const orderId = `ord-${Date.now()}`;
    const now = new Date().toISOString();

    const commission = Math.round(price * 0.02); // 2% platform fee
    const payout = price - commission; // 98% master payout

    const clientId = clientUser?.id || clientUser?.email || 'usr-current';
    const clientName = clientUser?.name || 'Mijoz';

    const newOrder: Order = {
      id: orderId,
      client_id: clientId,
      client_name: clientName,
      master_id: master.id,
      master_name: master.name,
      service_title: serviceTitle,
      price,
      status: 'escrow_locked', // Funds frozen
      payment_system: paymentSystem,
      created_at: now,
    };

    const newTransaction: Transaction = {
      id: `trx-${Date.now()}`,
      order_id: orderId,
      client_id: clientId,
      client_name: clientName,
      master_id: master.id,
      master_name: master.name,
      amount: price,
      commission_amount: commission,
      master_payout_amount: payout,
      status: 'escrow_held',
      payment_system: paymentSystem,
      created_at: now,
    };

    setOrders(prev => [newOrder, ...prev]);
    setTransactions(prev => [newTransaction, ...prev]);
  };

  // 3. Client Release Funds ("Ishni qabul qildim")
  const approveAndReleaseEscrow = (orderId: string) => {
    const now = new Date().toISOString();

    let targetMasterId: string | undefined;

    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        targetMasterId = ord.master_id;
        return { ...ord, status: 'completed', completed_at: now };
      }
      return ord;
    }));

    setTransactions(prev => prev.map(trx => {
      if (trx.order_id === orderId) {
        return { ...trx, status: 'released_to_master', released_at: now };
      }
      return trx;
    }));

    // Increment master's completed orders count dynamically
    if (targetMasterId) {
      setMasters(prev => prev.map(m => {
        if (m.id === targetMasterId) {
          return { ...m, completedOrders: m.completedOrders + 1 };
        }
        return m;
      }));
    }
  };

  // 4. Client File Dispute ("E'tiroz bildirish")
  const raiseDispute = (orderId: string, reason: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return { 
          ...ord, 
          status: 'disputed', 
          dispute_reason: reason, 
          disputed_at: now 
        };
      }
      return ord;
    }));
  };

  // 5. Submit Review & Rating
  const addReview = (
    orderId: string, 
    masterId: string, 
    rating: number, 
    comment: string, 
    clientUser?: { name: string; email?: string } | null
  ) => {
    const clientName = clientUser?.name || 'Mijoz';
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      order_id: orderId,
      client_id: clientUser?.email || 'usr-current',
      client_name: clientName,
      master_id: masterId,
      rating,
      comment,
      created_at: new Date().toISOString(),
    };

    setReviews(prev => [newRev, ...prev]);

    // Mark order reviewed
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, reviewed: true } : o));

    // Recalculate master rating safely
    setMasters(prev => prev.map(m => {
      if (m.id === masterId) {
        const currentReviews = reviews.filter(r => r.master_id === masterId && r.id !== newRev.id);
        const allMasterReviews = [newRev, ...currentReviews];
        const avg = allMasterReviews.reduce((sum, r) => sum + r.rating, 0) / allMasterReviews.length;
        return {
          ...m,
          rating: Number(avg.toFixed(1)),
          reviewsCount: allMasterReviews.length,
        };
      }
      return m;
    }));
  };

  // Register / Sync new master profile into masters catalog
  const registerMasterInStore = (userData: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    region_id?: string;
    district_id?: string;
    category_id?: string;
  }) => {
    if (userData.role !== 'master') return;

    setMasters(prev => {
      // Check if master already exists
      const exists = prev.some(
        m =>
          (userData.id && m.user_id === userData.id) ||
          m.name.toLowerCase().trim() === userData.name.toLowerCase().trim()
      );

      if (exists) return prev;

      const catId = userData.category_id || CATEGORIES[0].id;
      const categoryObj = CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
      const regionId = userData.region_id || REGIONS[0].id;
      const districtId = userData.district_id || '';

      const newMaster: Master = {
        id: `master-${userData.id || Date.now()}`,
        user_id: userData.id || `usr-${Date.now()}`,
        name: userData.name,
        phone: userData.phone || '+998 90 123 45 67',
        avatar: getAvatarSVG(userData.name),
        category_id: catId,
        category_name: categoryObj.name_uz,
        region_id: regionId,
        district_id: districtId,
        bio: `${categoryObj.name_uz} bo'yicha professional usta mutaxassis. Xizmatlarni sifatli, kafolatli va o'z vaqtida bajaraman.`,
        rating: 5.0,
        reviewsCount: 0,
        status: 'available',
        passport_kyc: {
          status: 'pending',
          passportNumber: 'FA1234567',
          submittedAt: new Date().toISOString().split('T')[0],
        },
        price_list: [
          { id: `sp-1-${Date.now()}`, name: `${categoryObj.name_uz} xizmati (standart)`, price: 100000, unit: 'ish' },
          { id: `sp-2-${Date.now()}`, name: `${categoryObj.name_uz} (murakkab montaj/ta'mir)`, price: 200000, unit: 'ish' },
        ],
        portfolio: [],
        hourlyRate: 80000,
        completedOrders: 0,
      };

      return [newMaster, ...prev];
    });
  };

  // 6. Master Status Toggle ("available" <-> "busy")
  const toggleMasterStatus = (masterId: string) => {
    setMasters(prev => prev.map(m => {
      if (m.id === masterId) {
        const newStatus = m.status === 'available' ? 'busy' : 'available';
        return { ...m, status: newStatus };
      }
      return m;
    }));
  };

  // Update Master Details (Bio, Hourly rate, Skills)
  const updateMasterProfile = (
    masterId: string, 
    updates: Partial<Pick<Master, 'bio' | 'hourlyRate' | 'name'>>
  ) => {
    setMasters(prev => prev.map(m => {
      if (m.id === masterId) {
        return { ...m, ...updates };
      }
      return m;
    }));
  };

  // 7. Master KYC Submit
  const submitMasterKYC = (masterId: string, passportNum: string, photoUrl: string) => {
    setMasters(prev => prev.map(m => {
      if (m.id === masterId) {
        return {
          ...m,
          passport_kyc: {
            status: 'pending',
            passportNumber: passportNum,
            idPhotoUrl: photoUrl,
            submittedAt: new Date().toISOString().split('T')[0],
          }
        };
      }
      return m;
    }));
  };

  // 8. Admin Moderation: Approve / Reject KYC
  const moderateKYC = (masterId: string, approve: boolean, adminName: string, reason?: string) => {
    setMasters(prev => prev.map(m => {
      if (m.id === masterId) {
        const newStatus = approve ? 'verified' : 'rejected';
        addAuditLog(
          adminName, 
          approve ? 'KYC_APPROVE' : 'KYC_REJECT',
          `Master ${m.name} KYC ${approve ? 'tasdiqlandi' : 'rad etildi: ' + (reason || '')}`
        );
        return {
          ...m,
          passport_kyc: {
            ...m.passport_kyc,
            status: newStatus,
            rejectionReason: approve ? undefined : reason,
          }
        };
      }
      return m;
    }));
  };

  // 9. Admin Dispute Resolution (Refund Client vs Release to Master)
  const resolveDispute = (orderId: string, decision: 'refund_client' | 'release_master', adminName: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (decision === 'refund_client') {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'refunded' } : o));
      setTransactions(prev => prev.map(t => t.order_id === orderId ? { ...t, status: 'refunded_to_client' } : t));
      addAuditLog(adminName, 'DISPUTE_REFUND_CLIENT', `Buyurtma #${orderId} puli mijozga (${order.client_name}) qaytarildi.`);
    } else {
      approveAndReleaseEscrow(orderId);
      addAuditLog(adminName, 'DISPUTE_RELEASE_MASTER', `Nizo ko'rib chiqildi: Buyurtma #${orderId} puli ustaga (${order.master_name}) o'tkazildi.`);
    }
  };

  // Withdraw Money from Master Wallet
  const withdrawMasterBalance = (masterId: string, amount: number, cardNumber: string) => {
    const targetMaster = masters.find(m => m.id === masterId);
    const masterName = targetMaster?.name || masterId;
    const now = new Date().toISOString();
    const payoutTrx: Transaction = {
      id: `payout-${Date.now()}`,
      order_id: `payout-ref-${Date.now()}`,
      client_name: 'Platforma Yechib Olish',
      master_id: masterId,
      master_name: masterName,
      amount: amount,
      commission_amount: 0,
      master_payout_amount: amount,
      status: 'released_to_master',
      payment_system: cardNumber.replace(/\s/g, '').startsWith('9860') ? 'click' : 'payme',
      created_at: now,
      released_at: now,
    };

    setTransactions(prev => [payoutTrx, ...prev]);
  };

  // 11. Client Job Request Posting ("Ish Qoldirish")
  const createJobRequest = (data: {
    title: string;
    description: string;
    price: number;
    category_id: string;
    region_id: string;
    district_id?: string;
    image_url?: string;
    clientUser: { id?: string; name: string; phone?: string; email?: string };
  }) => {
    const categoryObj = CATEGORIES.find(c => c.id === data.category_id) || CATEGORIES[0];
    const newJob: JobRequest = {
      id: `job-${Date.now()}`,
      client_id: data.clientUser.id || data.clientUser.email || 'usr-current',
      client_name: data.clientUser.name,
      client_phone: data.clientUser.phone || '+998 90 123 45 67',
      title: data.title,
      description: data.description,
      price: data.price,
      category_id: data.category_id,
      category_name: categoryObj.name_uz,
      region_id: data.region_id,
      district_id: data.district_id || '',
      image_url: data.image_url || getPortfolioVectorSVG(categoryObj.name_uz),
      status: 'open',
      created_at: new Date().toISOString(),
    };

    setJobRequests(prev => [newJob, ...prev]);
    return newJob;
  };

  // 12. Master Accepts Client Job Request ("Ishni Qabul Qilish & Borish Vaqti")
  const acceptJobRequest = (
    jobId: string,
    master: Master,
    arrivalTime: string
  ) => {
    const now = new Date().toISOString();
    let acceptedJob: JobRequest | undefined;

    setJobRequests(prev => prev.map(job => {
      if (job.id === jobId) {
        acceptedJob = {
          ...job,
          status: 'accepted',
          accepted_by_master_id: master.id,
          accepted_by_master_name: master.name,
          accepted_by_master_phone: master.phone,
          arrival_time: arrivalTime,
          accepted_at: now,
        };
        return acceptedJob;
      }
      return job;
    }));

    // Auto-create Escrow order between Client and Master for accepted job request
    if (acceptedJob) {
      createEscrowOrder(
        master,
        acceptedJob.title,
        acceptedJob.price,
        'payme',
        { id: acceptedJob.client_id, name: acceptedJob.client_name }
      );
    }
  };

  // 13. Cancel / Delete Job Request
  const cancelJobRequest = (jobId: string) => {
    setJobRequests(prev => prev.filter(job => job.id !== jobId));
  };

  // 10. Financial Statistics Calculator
  const getFinancialStats = () => {
    let totalGMV = 0; // Gross Merchandise Volume (only customer orders)
    let platformProfit = 0; // 2% commission collected
    let frozenEscrow = 0; // Currently in escrow
    let masterPayoutsTotal = 0; // Released to masters

    transactions.forEach(t => {
      // Ignore payout withdrawals for GMV calculation
      if (t.client_name === 'Platforma Yechib Olish' || t.order_id.startsWith('payout-')) {
        return;
      }
      totalGMV += t.amount;
      if (t.status === 'released_to_master') {
        platformProfit += t.commission_amount;
        masterPayoutsTotal += t.master_payout_amount;
      } else if (t.status === 'escrow_held') {
        frozenEscrow += t.amount;
      }
    });

    return {
      totalGMV,
      platformProfit,
      frozenEscrow,
      masterPayoutsTotal,
    };
  };

  // Master Wallet Calculation helper
  const getMasterWallet = (masterId: string): MasterWallet => {
    let total_earned = 0;
    let available_balance = 0;
    let pending_escrow = 0;
    let total_commission_paid = 0;

    const masterOrders = orders.filter(o => o.master_id === masterId);
    const masterTrxs = transactions.filter(t => 
      (t.master_id && t.master_id === masterId) || 
      masterOrders.some(o => o.id === t.order_id)
    );

    masterTrxs.forEach(t => {
      if (t.client_name === 'Platforma Yechib Olish' || t.order_id.startsWith('payout-')) return;
      if (t.status === 'released_to_master') {
        total_earned += t.master_payout_amount;
        available_balance += t.master_payout_amount;
        total_commission_paid += t.commission_amount;
      } else if (t.status === 'escrow_held') {
        pending_escrow += t.master_payout_amount;
      }
    });

    // Subtract manual payouts
    const manualPayouts = transactions
      .filter(t => (t.client_name === 'Platforma Yechib Olish' || t.order_id.startsWith('payout-')) && (t.master_id === masterId || t.master_name === masterId))
      .reduce((sum, t) => sum + t.amount, 0);

    available_balance = Math.max(0, available_balance - manualPayouts);

    return {
      master_id: masterId,
      total_earned,
      available_balance,
      pending_escrow,
      total_commission_paid,
      withdrawn: manualPayouts,
      payout_requests: [],
    };
  };

  return {
    activeRole,
    setActiveRole,
    selectedRegionId,
    setSelectedRegionId,
    selectedDistrictId,
    setSelectedDistrictId,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    
    regions: REGIONS,
    districts: DISTRICTS.filter(d => !selectedRegionId || d.region_id === selectedRegionId),
    allDistricts: DISTRICTS,
    categories: CATEGORIES,
    
    masters: getFilteredMasters(),
    allMasters: masters,
    orders,
    transactions,
    reviews,
    audits,
    jobRequests,
    
    // Actions
    registerMasterInStore,
    createEscrowOrder,
    approveAndReleaseEscrow,
    raiseDispute,
    addReview,
    toggleMasterStatus,
    updateMasterProfile,
    submitMasterKYC,
    moderateKYC,
    resolveDispute,
    withdrawMasterBalance,
    getFinancialStats,
    getMasterWallet,
    createJobRequest,
    acceptJobRequest,
    cancelJobRequest,
  };
}

