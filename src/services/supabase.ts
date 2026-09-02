import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase URL yoki Anon Key topilmadi. .env.local faylini tekshiring.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ─── Auth helpers ──────────────────────────────────────────────────

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: 'client' | 'master' | 'admin';
  region_id: string;
  district_id: string;
  category_id?: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'master' | 'admin';
  region_id?: string;
  district_id?: string;
  category_id?: string;
  avatar_url?: string;
  created_at: string;
}

/**
 * Yangi foydalanuvchi ro'yxatdan o'tkazish
 */
export async function authSignUp(data: SignUpData) {
  const { email, password, name, role, region_id, district_id, category_id, phone } = data;

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
        region_id,
        district_id,
        category_id: category_id || null,
        phone: phone || null,
      },
    },
  });

  if (error) throw error;
  return authData;
}

/**
 * Tizimga kirish
 */
export async function authSignIn(data: SignInData) {
  const { email, password } = data;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return authData;
}

/**
 * Tizimdan chiqish
 */
export async function authSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Parolni tiklash emaili yuborish
 */
export async function authResetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/#reset-password`,
  });
  if (error) throw error;
}

/**
 * Joriy foydalanuvchi profilini olish
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Profil olishda xato:', error.message);
    return null;
  }
  return data as UserProfile;
}

/**
 * Foydalanuvchi profilini yangilash
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

/**
 * Auth holat o'zgarishini kuzatish
 */
export function onAuthStateChange(
  callback: (user: { id: string; email: string } | null) => void
) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({ id: session.user.id, email: session.user.email || '' });
    } else {
      callback(null);
    }
  });
}

/**
 * Supabase `job_requests` jadvalidan ish e'lonlarini olish
 */
export async function fetchJobRequestsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('job_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

/**
 * Supabase `job_requests` jadvaliga yangi ish e'lonini saqlash
 */
export async function insertJobRequestToSupabase(jobData: Record<string, any>) {
  try {
    const { data, error } = await supabase
      .from('job_requests')
      .insert(jobData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase job_requests saqlashda tarmoq xatosi:', err);
    return null;
  }
}

/**
 * Supabase `job_requests` jadvalida usta ishni qabul qilganda yangilash
 */
export async function acceptJobRequestInSupabase(
  jobId: string,
  masterData: { master_id: string; master_name: string; master_phone: string; arrival_time: string }
) {
  try {
    const { data, error } = await supabase
      .from('job_requests')
      .update({
        status: 'accepted',
        accepted_by_master_id: masterData.master_id,
        accepted_by_master_name: masterData.master_name,
        accepted_by_master_phone: masterData.master_phone,
        arrival_time: masterData.arrival_time,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase job_requests accept update xatosi:', err);
    return null;
  }
}
