export type UserRole = 'client' | 'master' | 'admin';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Region {
  id: string;
  name_uz: string;
}

export interface District {
  id: string;
  region_id: string;
  name_uz: string;
}

export interface Category {
  id: string;
  name_uz: string;
  iconName: string;
  description: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
}

export interface KYCData {
  status: 'none' | 'pending' | 'verified' | 'rejected';
  passportNumber?: string;
  idPhotoUrl?: string;
  submittedAt?: string;
  rejectionReason?: string;
}

export interface Master {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  avatar: string;
  category_id: string;
  category_name: string;
  region_id: string;
  district_id: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  status: 'available' | 'busy';
  passport_kyc: KYCData;
  price_list: ServiceItem[];
  portfolio: PortfolioItem[];
  hourlyRate: number;
  completedOrders: number;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  avatar: string;
  region_id: string;
  district_id: string;
}

export type OrderStatus = 
  | 'created'         // Negotiated, waiting payment
  | 'escrow_locked'   // Paid via Payme/Click, funds frozen in platform
  | 'completed'       // Approved by client, 2% platform + 98% master payout
  | 'disputed'        // Client raised conflict, waiting admin review
  | 'refunded'        // Admin refunded client
  | 'cancelled';

export interface Order {
  id: string;
  client_id: string;
  client_name: string;
  master_id: string;
  master_name: string;
  service_title: string;
  price: number;
  status: OrderStatus;
  payment_system?: 'payme' | 'click';
  created_at: string;
  completed_at?: string;
  dispute_reason?: string;
  disputed_at?: string;
  reviewed?: boolean;
}

export interface Transaction {
  id: string;
  order_id: string;
  client_id?: string;
  client_name: string;
  master_id?: string;
  master_name: string;
  amount: number;
  commission_amount: number; // 2%
  master_payout_amount: number; // 98%
  status: 'escrow_held' | 'released_to_master' | 'refunded_to_client';
  payment_system: 'payme' | 'click';
  created_at: string;
  released_at?: string;
}

export interface Review {
  id: string;
  order_id: string;
  client_id: string;
  client_name: string;
  client_avatar?: string;
  master_id: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}

export interface PayoutRequest {
  id: string;
  master_id: string;
  master_name: string;
  cardNumber: string; // Uzcard (8600) / Humo (9860)
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface MasterWallet {
  master_id: string;
  total_earned: number;
  available_balance: number;
  pending_escrow: number;
  total_commission_paid: number;
  withdrawn: number;
  payout_requests: PayoutRequest[];
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface JobRequest {
  id: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  category_name: string;
  region_id: string;
  district_id?: string;
  image_url?: string;
  status: 'open' | 'accepted' | 'completed' | 'cancelled';
  accepted_by_master_id?: string;
  accepted_by_master_name?: string;
  accepted_by_master_phone?: string;
  arrival_time?: string;
  accepted_at?: string;
  created_at: string;
}
