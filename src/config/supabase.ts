import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing:', {
    url: supabaseUrl ? 'SET' : 'MISSING',
    key: supabaseAnonKey ? 'SET' : 'MISSING'
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Producer {
  id?: string;
  structure_name: string;
  contact_lastname: string;
  contact_firstname: string;
  email: string;
  phone: string;
  region: string;
  category: string;
  website?: string;
  charter_accepted: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}
