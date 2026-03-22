(function initSupabaseClient() {
  if (!window.supabase || !window.SUPABASE_CONFIG) {
    console.error('Supabase nao foi inicializado: dependencia ausente.');
    return;
  }

  const cfg = window.SUPABASE_CONFIG;
  window.supabaseClient = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
})();
