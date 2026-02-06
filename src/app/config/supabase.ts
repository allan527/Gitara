// Supabase configuration for GITARA BRANCH frontend
// Connected to Supabase project: zruzetnnneigombftzlj

export const supabaseConfig = {
  // Supabase project details
  projectId: 'zruzetnnneigombftzlj',
  url: 'https://zruzetnnneigombftzlj.supabase.co',
  publicAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydXpldG5ubmVpZ29tYmZ0emxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MTYxNzEsImV4cCI6MjA4NTk5MjE3MX0.yfWHsGXYchHtm7CRmg8znlFfx2W_bI_fydvb5whn0QM',
};

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return true; // Supabase is configured and ready
};

// For easier imports
export const { projectId, publicAnonKey, url: supabaseUrl } = supabaseConfig;

console.log('☁️ Supabase mode enabled - Checking connection...');