(function() {
  async function loadSiteData(key, fallbackUrl) {
    if (window.supabaseClient) {
      try {
        const { data, error } = await window.supabaseClient
          .from('site_data')
          .select('data')
          .eq('key', key)
          .maybeSingle();

        if (!error && data && data.data) {
          return data.data;
        }
      } catch (error) {
        console.warn('supabase site data load failed for ' + key, error);
      }
    }

    if (!fallbackUrl) return null;

    try {
      const response = await fetch(fallbackUrl, { cache: 'no-store' });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.warn('fallback site data load failed for ' + key, error);
      return null;
    }
  }

  window.loadSiteData = loadSiteData;
})();