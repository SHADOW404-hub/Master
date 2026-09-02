import type { Region, District, Category, Master, Order, Transaction, Review, AuditLog } from '../types';
import { getAvatarSVG, getPortfolioVectorSVG } from '../utils/avatar';

export const REGIONS: Region[] = [
  { id: 'reg-tashkent-city', name_uz: 'Toshkent shahri' },
  { id: 'reg-khorezm', name_uz: 'Xorazm viloyati' },
  { id: 'reg-samarkand', name_uz: 'Samarqand viloyati' },
  { id: 'reg-fergana', name_uz: "Farg'ona viloyati" },
  { id: 'reg-andijan', name_uz: 'Andijon viloyati' },
  { id: 'reg-namangan', name_uz: 'Namangan viloyati' },
  { id: 'reg-bukhara', name_uz: 'Buxoro viloyati' },
  { id: 'reg-tashkent-reg', name_uz: 'Toshkent viloyati' },
  { id: 'reg-navoiy', name_uz: 'Navoiy viloyati' },
  { id: 'reg-qashqadaryo', name_uz: 'Qashqadaryo viloyati' },
  { id: 'reg-surxondaryo', name_uz: 'Surxondaryo viloyati' },
  { id: 'reg-jizzax', name_uz: 'Jizzax viloyati' },
  { id: 'reg-sirdaryo', name_uz: 'Sirdaryo viloyati' },
  { id: 'reg-karakalpakstan', name_uz: "Qoraqalpog'iston Respublikasi" },
];

export const DISTRICTS: District[] = [
  // Toshkent shahri
  { id: 'dist-yunusobod', region_id: 'reg-tashkent-city', name_uz: 'Yunusobod tumani' },
  { id: 'dist-chilonzor', region_id: 'reg-tashkent-city', name_uz: 'Chilonzor tumani' },
  { id: 'dist-mirzo-ulugbek', region_id: 'reg-tashkent-city', name_uz: 'Mirzo Ulugbek tumani' },
  { id: 'dist-mirobod', region_id: 'reg-tashkent-city', name_uz: 'Mirobod tumani' },
  { id: 'dist-yashnobod', region_id: 'reg-tashkent-city', name_uz: 'Yashnobod tumani' },
  { id: 'dist-olmazor', region_id: 'reg-tashkent-city', name_uz: 'Olmazor tumani' },

  // Xorazm viloyati
  { id: 'dist-urganch', region_id: 'reg-khorezm', name_uz: 'Urganch shahri' },
  { id: 'dist-xiva', region_id: 'reg-khorezm', name_uz: 'Xiva shahri' },
  { id: 'dist-gurlan', region_id: 'reg-khorezm', name_uz: 'Gurlan tumani' },
  { id: 'dist-shovot', region_id: 'reg-khorezm', name_uz: 'Shovot tumani' },
  { id: 'dist-xonqa', region_id: 'reg-khorezm', name_uz: 'Xonqa tumani' },
  { id: 'dist-hazorasp', region_id: 'reg-khorezm', name_uz: 'Hazorasp tumani' },

  // Samarqand
  { id: 'dist-samarkand-sh', region_id: 'reg-samarkand', name_uz: 'Samarqand shahri' },
  { id: 'dist-pastdargom', region_id: 'reg-samarkand', name_uz: "Pastdarg'om tumani" },
  { id: 'dist-toyloq', region_id: 'reg-samarkand', name_uz: 'Toyloq tumani' },
  { id: 'dist-urgut', region_id: 'reg-samarkand', name_uz: 'Urgut tumani' },

  // Farg'ona
  { id: 'dist-fergana-sh', region_id: 'reg-fergana', name_uz: "Farg'ona shahri" },
  { id: 'dist-qoqon', region_id: 'reg-fergana', name_uz: "Qo'qon shahri" },
  { id: 'dist-margilon', region_id: 'reg-fergana', name_uz: "Marg'ilon shahri" },

  // Andijon
  { id: 'dist-andijan-sh', region_id: 'reg-andijan', name_uz: 'Andijon shahri' },
  { id: 'dist-asaka', region_id: 'reg-andijan', name_uz: 'Asaka tumani' },
  { id: 'dist-shahrixon', region_id: 'reg-andijan', name_uz: 'Shahrixon tumani' },

  // Namangan
  { id: 'dist-namangan-sh', region_id: 'reg-namangan', name_uz: 'Namangan shahri' },
  { id: 'dist-chust', region_id: 'reg-namangan', name_uz: 'Chust tumani' },
  { id: 'dist-kosonsoy', region_id: 'reg-namangan', name_uz: 'Kosonsoy tumani' },

  // Buxoro
  { id: 'dist-bukhara-sh', region_id: 'reg-bukhara', name_uz: 'Buxoro shahri' },
  { id: 'dist-gijduvon', region_id: 'reg-bukhara', name_uz: "G'ijduvon tumani" },
  { id: 'dist-kogon', region_id: 'reg-bukhara', name_uz: 'Kogon shahri' },

  // Toshkent viloyati
  { id: 'dist-chirchiq', region_id: 'reg-tashkent-reg', name_uz: 'Chirchiq shahri' },
  { id: 'dist-olmaliq', region_id: 'reg-tashkent-reg', name_uz: 'Olmaliq shahri' },
  { id: 'dist-yangiyol', region_id: 'reg-tashkent-reg', name_uz: 'Yangiyo\'l tumani' },

  // Navoiy
  { id: 'dist-navoiy-sh', region_id: 'reg-navoiy', name_uz: 'Navoiy shahri' },
  { id: 'dist-zarafshon', region_id: 'reg-navoiy', name_uz: 'Zarafshon shahri' },

  // Qashqadaryo
  { id: 'dist-qarshi', region_id: 'reg-qashqadaryo', name_uz: 'Qarshi shahri' },
  { id: 'dist-shahrisabz', region_id: 'reg-qashqadaryo', name_uz: 'Shahrisabz shahri' },

  // Surxondaryo
  { id: 'dist-termiz', region_id: 'reg-surxondaryo', name_uz: 'Termiz shahri' },
  { id: 'dist-denov', region_id: 'reg-surxondaryo', name_uz: 'Denov tumani' },

  // Jizzax
  { id: 'dist-jizzax-sh', region_id: 'reg-jizzax', name_uz: 'Jizzax shahri' },

  // Sirdaryo
  { id: 'dist-guliston', region_id: 'reg-sirdaryo', name_uz: 'Guliston shahri' },

  // Qoraqalpog'iston
  { id: 'dist-nukus-sh', region_id: 'reg-karakalpakstan', name_uz: 'Nukus shahri' },
  { id: 'dist-xujayli', region_id: 'reg-karakalpakstan', name_uz: "Xo'jayli tumani" },
];

export const CATEGORIES: Category[] = [
  {
    id: 'cat-santexnik',
    name_uz: 'Santexnik',
    iconName: 'Wrench',
    description: 'Quvur, kran, boyler va sanitariya jihozlarini ta\'mirlash',
  },
  {
    id: 'cat-elektrchi',
    name_uz: 'Elektrchi',
    iconName: 'Zap',
    description: 'Elektr simlari, rozetkalar, lyustra va shitlarni montaj qilish',
  },
  {
    id: 'cat-quruvchi',
    name_uz: 'Quruvchi & Ta\'mirchi',
    iconName: 'Hammer',
    description: 'Gipsokarton, kafel, malyarka va umumiy ta\'mirlash',
  },
  {
    id: 'cat-maishiy',
    name_uz: 'Maishiy texnika ustasi',
    iconName: 'Tv',
    description: 'Kirlash mashinasi, muzlatgich va konditsioner ta\'miri',
  },
  {
    id: 'cat-mebel',
    name_uz: 'Mebel ustasi',
    iconName: 'Sofa',
    description: 'Mebel yig\'ish, yasash va restavratsiya qilish',
  },
  {
    id: 'cat-konditsioner',
    name_uz: 'Konditsioner ustasi',
    iconName: 'Wind',
    description: 'Konditsioner o\'rnatish, tozalash va freon quyish',
  },
];

export const SEED_MASTERS: Master[] = [
  {
    id: 'master-real-1',
    user_id: 'usr-m1',
    name: 'Jasurbek Otabayev',
    phone: '+998 90 123 45 67',
    avatar: getAvatarSVG('Jasurbek Otabayev'),
    category_id: 'cat-santexnik',
    category_name: 'Santexnik',
    region_id: 'reg-khorezm',
    district_id: 'dist-urganch',
    bio: '10 yillik tajribaga ega professional santexnik. Barcha turdagi quvur va sanitariya ishlarini sifatli bajaraman. Kafolat beriladi.',
    rating: 4.9,
    reviewsCount: 38,
    status: 'available',
    hourlyRate: 120000,
    completedOrders: 42,
    passport_kyc: {
      status: 'verified',
      passportNumber: 'FA1234567',
      submittedAt: '2026-08-10',
    },
    price_list: [
      { id: 'p1', name: 'Kran almashtirish', price: 80000, unit: 'dona' },
      { id: 'p2', name: 'Boyler o\'rnatish', price: 250000, unit: 'komplekt' },
    ],
    portfolio: [
      {
        id: 'port-1',
        title: 'Yangi xonadonda vannaxona santexnikasi',
        imageUrl: getPortfolioVectorSVG('Santexnik'),
        description: 'Barcha quvurlar yashirin montaj qilindi va sinovdan o\'tkazildi.',
      },
    ],
  },
  {
    id: 'master-real-2',
    user_id: 'usr-m2',
    name: 'Sardorbek Rahimov',
    phone: '+998 94 987 65 43',
    avatar: getAvatarSVG('Sardorbek Rahimov'),
    category_id: 'cat-elektrchi',
    category_name: 'Elektrchi',
    region_id: 'reg-tashkent-city',
    district_id: 'dist-yunusobod',
    bio: 'Oliy ma\'lumotli muhandis-elektrchi. Uylar, ofislar va dokonlarda elektr simlarini sifatli montaj qilish va shit yig\'ish.',
    rating: 4.8,
    reviewsCount: 29,
    status: 'available',
    hourlyRate: 150000,
    completedOrders: 31,
    passport_kyc: {
      status: 'verified',
      passportNumber: 'FB7654321',
      submittedAt: '2026-08-15',
    },
    price_list: [
      { id: 'pe1', name: 'Elektr shiti yig\'ish', price: 350000, unit: 'dona' },
      { id: 'pe2', name: 'Rozetka / Avtomat o\'rnatish', price: 25000, unit: 'dona' },
    ],
    portfolio: [],
  },
];

export const SEED_ORDERS: Order[] = [];

export const SEED_TRANSACTIONS: Transaction[] = [];

export const SEED_REVIEWS: Review[] = [];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    admin_id: 'adm-1',
    admin_name: 'Admin Axror',
    action: 'KYC_APPROVE',
    details: 'Master Jasurbek Otabayev (FA1234567) pasport ma\'lumotlari tasdiqlandi.',
    ip_address: '195.158.12.44',
    created_at: '2026-08-10T11:00:00Z',
  },
  {
    id: 'audit-2',
    admin_id: 'adm-2',
    admin_name: 'Admin Nigora',
    action: 'LOGIN_2FA',
    details: 'Tizimga 2FA autentifikatsiyasi orqali muvaffaqiyatli kirildi.',
    ip_address: '213.230.70.12',
    created_at: '2026-09-02T08:00:00Z',
  },
];
