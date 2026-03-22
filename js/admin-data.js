/**
 * admin-data.js
 * Carregamento, coleta e persistência de dados — Supabase + fallback JSON local
 */

// Estado global
let _content = null;
let _planos = null;
let _images = null;

// ─── Utilitários ─────────────────────────────────────────────────────────────

/**
 * Atualizar elemento de status
 */
function setStatus(id, ok, message) {
  const el = document.getElementById(id);
  if (!el) return;
  if (ok) {
    el.className = 'info-box';
    el.innerHTML = message || '✓ Dados carregados. Edite os campos e clique em <strong>Salvar no Banco</strong> quando terminar.';
  } else {
    el.className = 'info-box warn';
    el.innerHTML = message || '⚠ Não foi possível carregar os dados. Verifique a conexão com o Supabase ou abra com Live Server.';
  }
}

/**
 * Fetch JSON local com tratamento de erro (fallback)
 */
async function fetchJSON(url, statusId, callback) {
  if (location.protocol === 'file:') {
    setStatus(
      statusId,
      false,
      '⚠ O painel foi aberto via arquivo local. O navegador bloqueia leitura de JSON em <code>file://</code>. Abra com <strong>Live Server</strong> ou faça o primeiro salvamento no banco.'
    );
    return;
  }

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    callback(await res.json());
    setStatus(statusId, true);
  } catch (e) {
    setStatus(statusId, false);
  }
}

// ─── Supabase ─────────────────────────────────────────────────────────────────

/**
 * Salvar dados no Supabase (tabela site_data, upsert por key)
 * @param {string} key - 'content' | 'planos' | 'images'
 * @param {object} data
 */
async function saveToSupabase(key, data) {
  if (!window.supabaseClient) {
    toast('⚠ Cliente Supabase não disponível.');
    return;
  }
  const { error } = await window.supabaseClient
    .from('site_data')
    .upsert({ key, data, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) {
    toast('❌ Erro ao salvar: ' + error.message);
    return;
  }
  toast('✅ ' + key + ' salvo no banco!');
}

/**
 * Carregar dados do Supabase; se falhar, usa JSON local como fallback
 * @param {string} key - chave na tabela site_data
 * @param {string} fallbackUrl - caminho do JSON local
 * @param {string} statusId - ID do elemento de status
 * @param {function} callback
 */
async function loadFromSupabase(key, fallbackUrl, statusId, callback) {
  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('site_data')
        .select('data')
        .eq('key', key)
        .maybeSingle();

      if (!error && data) {
        callback(data.data);
        setStatus(statusId, true);
        return;
      }
    } catch (e) { /* fallback abaixo */ }
  }

  if (location.protocol === 'file:') {
    setStatus(
      statusId,
      false,
      '⚠ Nenhum registro encontrado no banco para <code>' + key + '</code> e o fallback local está bloqueado em <code>file://</code>. Abra com <strong>Live Server</strong> ou salve esse conteúdo no banco primeiro.'
    );
    return;
  }

  await fetchJSON(fallbackUrl, statusId, callback);
}

// ─── Carregamento inicial ─────────────────────────────────────────────────────

function loadAll() {
  loadFromSupabase('content', 'data/content.json', 'statusContato', function(d) {
    _content = d;
    populateContato(d);
  });

  loadFromSupabase('planos', 'data/planos.json', 'statusDigital', function(d) {
    _planos = d;
    setStatus('statusVisual', true);
    setStatus('statusTrafego', true);
    populateDigital(d.digital);
    populateVisual(d.visual);
    populateTrafego(d.trafego);
  });

  loadFromSupabase('images', 'data/images.json', 'statusGaleria', function(d) {
    _images = d;
    populateGaleria(d);
  });
}

/**
 * Coletar dados do formulário: Contato
 */
function collectContato() {
  return {
    global: {
      whatsappFloat: { href: gv('wpp_float_href') },
      footer: {
        whatsapp: { href: gv('footer_wpp_href'), text: gv('footer_wpp_text') },
        email: { href: gv('footer_email_href'), text: gv('footer_email_text') }
      }
    },
    pages: {
      index: { navCta: { text: gv('cta_index_text'), href: gv('cta_index_href') } },
      servicos: { navCta: { text: gv('cta_servicos_text'), href: gv('cta_servicos_href') } },
      planos: { navCta: { text: gv('cta_planos_text'), href: gv('cta_planos_href') } }
    }
  };
}

/**
 * Coletar dados dos formulários: Planos + Visual + Tráfego
 */
function collectPlanos() {
  // Digital plans
  const plans = Array.from(document.querySelectorAll('#digital-plans-wrap .card')).map(function(card, i) {
    const orig = (_planos && _planos.digital && _planos.digital.plans) ? _planos.digital.plans[i] : {};
    const features = Array.from(card.querySelectorAll('.feat-row')).map(function(row) {
      const hi = row.querySelector('.feat-highlight').value.trim();
      const obj = {
        ok: row.querySelector('input[type="checkbox"]').checked,
        text: row.querySelector('.feat-text').value
      };
      if (hi) obj.highlight = hi;
      return obj;
    });

    return {
      ribbon: (orig && orig.ribbon) || '#C0B8A8',
      cat: card.querySelector('.plan-cat').value,
      name: card.querySelector('.plan-name').value,
      tagline: card.querySelector('.plan-tagline').value,
      setup: card.querySelector('.plan-setup').value,
      price: card.querySelector('.plan-price').value,
      featured: (orig && orig.featured) || false,
      features: features,
      waHref: card.querySelector('.plan-wahref').value
    };
  });

  // Addons
  const addons = Array.from(document.querySelectorAll('#digital-addons-wrap .card')).map(function(card) {
    return {
      name: card.querySelector('.addon-name').value,
      desc: card.querySelector('.addon-desc').value,
      price: card.querySelector('.addon-price').value,
      period: card.querySelector('.addon-period').value
    };
  });

  // Compare table (preserva original)
  const compare = (_planos && _planos.digital && _planos.digital.compare) || [];

  // Visual products
  const products = Array.from(document.querySelectorAll('#visual-products-wrap .card')).map(function(card, i) {
    const orig = (_planos && _planos.visual && _planos.visual.products) ? _planos.visual.products[i] : {};
    return {
      icon: card.querySelector('.vprod-icon').value,
      name: card.querySelector('.vprod-name').value,
      desc: card.querySelector('.vprod-desc').value,
      price: card.querySelector('.vprod-price').value,
      unit: card.querySelector('.vprod-unit').value,
      premium: (orig && orig.premium) || false,
      includes: card.querySelector('.vprod-includes').value,
      items: Array.from(card.querySelectorAll('.vprod-item')).map(i => i.value),
      waHref: card.querySelector('.vprod-wahref').value
    };
  });

  // Tráfego plans
  const trafPlans = Array.from(document.querySelectorAll('#trafego-plans-wrap .card')).map(function(card, i) {
    const orig = (_planos && _planos.trafego && _planos.trafego.plans) ? _planos.trafego.plans[i] : {};
    const saveVal = card.querySelector('.traf-save').value.trim();

    return {
      platform: card.querySelector('.traf-platform').value,
      platformColor: card.querySelector('.traf-color').value,
      name: card.querySelector('.traf-name').value,
      desc: card.querySelector('.traf-desc').value,
      price: card.querySelector('.traf-price').value,
      verba: card.querySelector('.traf-verba').value,
      combo: (orig && orig.combo) || false,
      save: saveVal || null,
      features: Array.from(card.querySelectorAll('.traf-feat')).map(function(inp) {
        const obj = { text: inp.value };
        if (inp.dataset.color) obj.color = inp.dataset.color;
        return obj;
      }),
      waHref: card.querySelector('.traf-wahref').value
    };
  });

  return {
    digital: { plans, addons, compare },
    visual: { products },
    trafego: { plans: trafPlans }
  };
}

/**
 * Coletar dados do formulário: Galeria
 */
function collectGaleria() {
  return {
    galeria: Array.from(document.querySelectorAll('#gal-list .gal-row')).map(function(row) {
      return {
        src: row.querySelector('.gal-src').value,
        caption: row.querySelector('.gal-caption').value,
        client: row.querySelector('.gal-client').value,
        category: row.querySelector('.gal-cat').value,
        layout: row.querySelector('.gal-layout').value,
        featured: row.dataset.featured === '1'
      };
    })
  };
}

// ─── Funções de salvamento ────────────────────────────────────────────────────

async function saveContato() {
  await saveToSupabase('content', collectContato());
}

async function savePlanos() {
  await saveToSupabase('planos', collectPlanos());
}

async function saveGaleria() {
  await saveToSupabase('images', collectGaleria());
}
