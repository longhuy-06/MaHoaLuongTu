import { createClient } from '@supabase/supabase-js';

// Mặc định sử dụng key người dùng cung cấp nếu không có trong biến môi trường
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yoksdzwrrkgxcjqlszam.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_yTHi9K5ZzICVETtqAtHJVg_dlZEyER-';

export const supabase = createClient(supabaseUrl, supabaseKey);
