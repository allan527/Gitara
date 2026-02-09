import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = publicAnonKey;

// Singleton pattern to prevent multiple client instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        storageKey: 'gitala-branch-auth-token', // Custom storage key to avoid conflicts
      }
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient();

export const getAuthHeaders = () => {
  return {
    'Authorization': `Bearer ${publicAnonKey}`,
    'Content-Type': 'application/json',
  };
};

export const getServerUrl = (path: string) => {
  return `https://${projectId}.supabase.co/functions/v1/make-server-7f28f6fd${path}`;
};