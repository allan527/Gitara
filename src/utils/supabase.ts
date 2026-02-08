import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getAuthHeaders = () => {
  return {
    'Authorization': `Bearer ${publicAnonKey}`,
    'Content-Type': 'application/json',
  };
};

export const getServerUrl = (path: string) => {
  return `https://${projectId}.supabase.co/functions/v1/make-server-7f28f6fd${path}`;
};
