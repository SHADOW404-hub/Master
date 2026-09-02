import { useState, useEffect } from 'react';
import type { 
  UserRole, Master, Order, Transaction, 
  Review, AuditLog, MasterWallet 
} from '../types';
import { 
  REGIONS, DISTRICTS, CATEGORIES, SEED_MASTERS, 
  SEED_ORDERS, SEED_TRANSACTIONS, SEED_REVIEWS, SEED_AUDIT_LOGS 
} from '../data/seedData';

const STORAGE_KEYS = {
  MASTERS: 'usta_mijoz_masters',
  ORDERS: 'usta_mijoz_orders',
  TRANSACTIONS: 'usta_mijoz_transactions',
  REVIEWS: 'usta_mijoz_reviews',
  AUDITS: 'usta_mijoz_audits',
  PAYOUTS: 'usta_mijoz_payouts',
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
  const [selectedRegionId, setSelectedRegionId] = useState<string>('reg-khorezm');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persistent States
  const [masters, setMasters] = useState<Master[]>(() => getInitial(STORAGE_KEYS.MASTERS, SEED_MASTERS));
  const [orders, setOrders] = useState<Order[]>(() => getInitial(STORAGE_KEYS.ORDERS, SEED_ORDERS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getInitial(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS));
  const [reviews, setReviews] = useState<Review[]>(() => getInitial(STORAGE_KEYS.REVIEWS, SEED_REVIEWS));
  const [audits, setAudits] = useState<AuditLog[]>(() => getInitial(STORAGE_KEYS.AUDITS, SEED_AUDIT_LOGS));

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
      client_name: clientName,
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

    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
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

    // Recalculate master rating
    setMasters(prev => prev.map(m => {
      if (m.id === masterId) {
        const masterReviews = [...reviews.filter(r => r.master_id === masterId), newRev];
        const avg = masterReviews.reduce((sum, r) => sum + r.rating, 0) / masterReviews.length;
        return {
          ...m,
          rating: Number(avg.toFixed(1)),
          reviewsCount: masterReviews.length,
        };
      }
      return m;
    }));
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
    const now = new Date().toISOString();
    const payoutTrx: Transaction = {
      id: `payout-${Date.now()}`,
      order_id: `payout-ref-${Date.now()}`,
      client_name: 'Platforma Yechib Olish',
      master_name: masterId,
      amount: amount,
      commission_amount: 0,
      master_payout_amount: amount,
      status: 'released_to_master',
      payment_system: cardNumber.startsWith('9860') ? 'click' : 'payme',
      created_at: now,
      released_at: now,
    };

    setTransactions(prev => [payoutTrx, ...prev]);
  };

  // 10. Financial Statistics Calculator
  const getFinancialStats = () => {
    let totalGMV = 0; // Gross Merchandise Volume
    let platformProfit = 0; // 2% commission collected
    let frozenEscrow = 0; // Currently in escrow
    let masterPayoutsTotal = 0; // Released to masters

    transactions.forEach(t => {
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
    const masterTrxs = transactions.filter(t => masterOrders.some(o => o.id === t.order_id));

    masterTrxs.forEach(t => {
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
      .filter(t => t.client_name === 'Platforma Yechib Olish' && t.master_name === masterId)
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
    
    // Actions
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
  };
}

