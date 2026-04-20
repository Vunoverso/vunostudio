/**
 * admin-data.js
 * Carregamento, coleta e persistência de dados — Supabase + fallback JSON local
 */

// Estado global
let _content = null;
let _planos = null;
let _images = null;
let _config = null;
let _servicos = null;
let _blog    = null;

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
  loadFromSupabase('config', 'data/config.json', 'statusConfig', function(d) {
    _config = d;
    populateConfig(d);
  });

  loadHeroData();
  
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
    populatePlanosCta(d.cta || {});
    populateFaq(d.faq || []);
  });

  loadFromSupabase('images', 'data/images.json', 'statusGaleria', function(d) {
    _images = d;
    populateGaleria(d);
  });

  loadFromSupabase('servicos', 'data/servicos.json', 'statusServicosCopy', function(d) {
    _servicos = d;
    populateServicosCopy((d && d.copy) || {});
    populateServicosVisualProducts(d && d.visual ? d.visual : {});
    populateServicosDigitalPlans(d && d.digital ? d.digital : {});
    populateServicosDigitalAddons((d && d.digital && d.digital.addons) || []);
    populateServicosTrafegoCards(d && d.trafego ? d.trafego : {});
    populateServicosTrafegoCombo((d && d.trafego && d.trafego.combo) || {});
    populateProcesso((d && d.processo && d.processo.steps) || []);
  });
  loadFromSupabase('blog', 'data/blog.json', 'statusBlog', function(d) {
    _blog = d;
    populateBlogPosts((d && d.posts) || []);
  });

  // Projetos carregados junto com o hero via loadHeroData() acima
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

function collectConfig() {
  return {
    seo: {
      businessName: gv('config_business_name'),
      ogImage: gv('config_og_image'),
      pages: {
        index: {
          title: gv('seo_index_title'),
          description: gv('seo_index_description'),
          keywords: gv('seo_index_keywords')
        },
        servicos: {
          title: gv('seo_servicos_title'),
          description: gv('seo_servicos_description'),
          keywords: gv('seo_servicos_keywords')
        },
        planos: {
          title: gv('seo_planos_title'),
          description: gv('seo_planos_description'),
          keywords: gv('seo_planos_keywords')
        }
      }
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
    trafego: { plans: trafPlans },
    cta: {
      label: gv('planos_cta_label'),
      titleHtml: gv('planos_cta_title'),
      sub: gv('planos_cta_sub'),
      whatsappText: gv('planos_cta_whatsapp_text'),
      whatsappHref: gv('planos_cta_whatsapp_href'),
      emailText: gv('planos_cta_email_text'),
      emailHref: gv('planos_cta_email_href')
    },
    faq: Array.from(document.querySelectorAll('#faq-edit-list .faq-edit-row')).map(function(row) {
      return { q: (row.querySelector('.faq-q-input') || {}).value || '', a: (row.querySelector('.faq-a-input') || {}).value || '' };
    })
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

async function saveConfig() {
  await saveToSupabase('config', collectConfig());
  toast('✅ Configurações salvas! Recarregue as páginas públicas para conferir o SEO.');
}

async function savePlanos() {
  await saveToSupabase('planos', collectPlanos());
}

async function saveGaleria() {
  await saveToSupabase('images', collectGaleria());
}

// ─── Hero Carousel ────────────────────────────────────────────────────────────

let _index = null;

/**
 * Carregar data/index.json (hero slides + cta)
 */
var _DEFAULT_PROJECTS = [
  { id: 'vunourbano', title: 'Vuno Urbano', url: 'https://www.vunourbano.com.br', desc: 'Leitura urbana do seu bairro', tag: 'Site Urbano', image: '' },
  { id: 'barmate', title: 'Barmate', url: 'https://barmate.vercel.app/', desc: 'Gestão para bares e restaurantes', tag: 'Aplicativo web', image: '' },
  { id: 'vunotrader', title: 'Vuno Trader', url: 'https://vunotrader.vercel.app/', desc: 'Plataforma de análise e trading', tag: 'Plataforma', image: '' }
];

function loadHeroData() {
  loadFromSupabase('index', 'data/index.json', 'statusHero', function(d) {
    _index = d;
    populateHero(d);
    // Se Supabase não tiver projetos, usa lista padrão
    var projs = (d && d.projects && d.projects.length) ? d.projects : _DEFAULT_PROJECTS;
    populateProjects(projs);
    setStatus('statusProjetos', true);
  });
}

/**
 * Coletar dados do formulário hero (form simples)
 */
function collectHero() {
  const proofPills = Array.from(
    document.querySelectorAll('#hero-proof-pills-group .proof-pill-input')
  ).map(i => i.value.trim()).filter(Boolean);

  return {
    hero: {
      badge:          (document.getElementById('hero_badge')              || {}).value || '',
      titleHtml:      (document.getElementById('hero_title')              || {}).value || '',
      sub:            (document.getElementById('hero_sub')                || {}).value || '',
      heroImageSrc:   (document.getElementById('hero_image_src')         || {}).value || '',
      numbers: Array.from(
        document.querySelectorAll('#hero-numbers-list .num-row')
      ).map(function(r) {
        return {
          value: (r.querySelector('.num-value') || {}).value || '',
          label: (r.querySelector('.num-label') || {}).value || ''
        };
      }),
      proofPills,
      buttons: {
        primaryText:   (document.getElementById('hero_btn_primary_text')  || {}).value || '',
        primaryHref:   (document.getElementById('hero_btn_primary_href')  || {}).value || '',
        secondaryText: (document.getElementById('hero_btn_secondary_text')|| {}).value || '',
        secondaryHref: (document.getElementById('hero_btn_secondary_href')|| {}).value || ''
      }
    },
    cta: _index?.cta || {},
    projects: (_index && _index.projects) || []
  };
}

/** Alias para compatibilidade */
function collectHeroSlides() { return collectHero(); }

/**
 * Coletar lista de projetos do formulário
 */
function _normUrlAdmin(u) { return (u && !/^https?:\/\//i.test(u)) ? 'https://' + u : (u || ''); }

function collectProjectsList() {
  return Array.from(document.querySelectorAll('#proj-list .gal-row')).map(function(row) {
    var urlVal = _normUrlAdmin((row.querySelector('.proj-url') || {}).value || '');
    var domain = '';
    try { domain = new URL(urlVal).hostname.replace(/^www\./, ''); } catch(e) { domain = urlVal; }
    var id = domain.replace(/[^a-z0-9]/gi, '');
    return {
      id: id,
      title: (row.querySelector('.proj-title') || {}).value || '',
      url: urlVal,
      desc: (row.querySelector('.proj-desc') || {}).value || '',
      tag: (row.querySelector('.proj-tag') || {}).value || '',
      image: (row.querySelector('.proj-image') || {}).value || ''
    };
  });
}

/**
 * Salvar projetos preservando hero/cta existentes
 */
async function saveProjetos() {
  // Clona _index sem modificar hero/cta — só atualiza projects
  const data = JSON.parse(JSON.stringify(_index || {}));
  data.projects = collectProjectsList();
  _index = data;
  await saveToSupabase('index', data);
  toast('✅ Sites em destaque salvos! Recarregue a home para ver.');
}

/**
 * Salvar hero
 */
async function saveHero() {
  await saveToSupabase('index', collectHero());
  toast('✅ Hero salvo! Recarregue a homepage para ver as alterações.');
}
async function saveHeroSlides() { await saveHero(); }

/**
 * Coletar dados do formulário: Serviços (copy + processo)
 */
function collectServicos() {
  const copy = {
    hero: {
      tag:       gv('sv_hero_tag'),
      titleHtml: gv('sv_hero_title'),
      sub:       gv('sv_hero_sub')
    },
    digital: {
      label:       gv('sv_digital_label'),
      titleHtml:   gv('sv_digital_title'),
      sub:         gv('sv_digital_sub'),
      addonsTitle: gv('sv_digital_addons')
    },
    visual: {
      label:     gv('sv_visual_label'),
      titleHtml: gv('sv_visual_title'),
      sub:       gv('sv_visual_sub')
    },
    galeria: {
      label:     gv('sv_galeria_label'),
      titleHtml: gv('sv_galeria_title'),
      sub:       gv('sv_galeria_sub')
    },
    trafego: {
      label:     gv('sv_trafego_label'),
      titleHtml: gv('sv_trafego_title'),
      sub:       gv('sv_trafego_sub')
    },
    processo: {
      label:     gv('sv_processo_label'),
      titleHtml: gv('sv_processo_title'),
      sub:       gv('sv_processo_sub')
    },
    cta: {
      label:          gv('sv_cta_label'),
      titleHtml:      gv('sv_cta_title'),
      sub:            gv('sv_cta_sub'),
      mainButtonText: gv('sv_cta_btn_main_text'),
      mainButtonHref: gv('sv_cta_btn_main_href'),
      secButtonText:  gv('sv_cta_btn_sec_text'),
      secButtonHref:  gv('sv_cta_btn_sec_href')
    }
  };

  const steps = Array.from(
    document.querySelectorAll('#processo-steps-list .processo-row')
  ).map(function(row) {
    return {
      num:  row.querySelector('.ps-num').value.trim(),
      icon: row.querySelector('.ps-icon').value.trim(),
      name: row.querySelector('.ps-name').value.trim(),
      desc: row.querySelector('.ps-desc').value.trim(),
      time: row.querySelector('.ps-time').value.trim()
    };
  });

  const visualProducts = Array.from(
    document.querySelectorAll('#sv-visual-products-wrap [data-svvi]')
  ).map(function(card) {
    const tagsRaw = ((card.querySelector('.sv-vprod-tags') || {}).value || '').split(',');
    return {
      iconKey: ((card.querySelector('.sv-vprod-iconkey') || {}).value || '').trim(),
      imageLabel: ((card.querySelector('.sv-vprod-imagelabel') || {}).value || '').trim(),
      name: ((card.querySelector('.sv-vprod-name') || {}).value || '').trim(),
      desc: ((card.querySelector('.sv-vprod-desc') || {}).value || '').trim(),
      items: Array.from(card.querySelectorAll('.sv-vprod-item')).map(function(item) {
        return item.value.trim();
      }).filter(Boolean),
      tags: tagsRaw.map(function(tag) { return tag.trim(); }).filter(Boolean),
      premium: !!((card.querySelector('.sv-vprod-premium') || {}).checked),
      badge: ((card.querySelector('.sv-vprod-badge') || {}).value || '').trim()
    };
  }).filter(function(product) {
    return product.name || product.desc || product.items.length;
  });

  const digitalPlans = Array.from(
    document.querySelectorAll('#sv-digital-plans-wrap [data-svdp]')
  ).map(function(card) {
    return {
      name: ((card.querySelector('.sv-dplan-name') || {}).value || '').trim(),
      desc: ((card.querySelector('.sv-dplan-desc') || {}).value || '').trim(),
      featured: !!((card.querySelector('.sv-dplan-featured') || {}).checked),
      tag: ((card.querySelector('.sv-dplan-tag') || {}).value || '').trim(),
      ctaText: ((card.querySelector('.sv-dplan-ctatext') || {}).value || '').trim(),
      ctaHref: ((card.querySelector('.sv-dplan-ctahref') || {}).value || '').trim(),
      features: Array.from(card.querySelectorAll('.sv-dplan-feat')).map(function(el) {
        return el.value.trim();
      }).filter(Boolean)
    };
  }).filter(function(p) { return p.name || p.desc; });

  const digitalAddons = Array.from(
    document.querySelectorAll('#sv-digital-addons-wrap [data-svda]')
  ).map(function(row) {
    return {
      icon: ((row.querySelector('.sv-addon-icon') || {}).value || '').trim(),
      name: ((row.querySelector('.sv-addon-name') || {}).value || '').trim(),
      desc: ((row.querySelector('.sv-addon-desc') || {}).value || '').trim()
    };
  }).filter(function(a) { return a.name || a.desc; });

  const trafegoCards = Array.from(
    document.querySelectorAll('#sv-trafego-cards-wrap [data-svtc]')
  ).map(function(card) {
    return {
      variant: ((card.querySelector('.sv-traf-variant') || {}).value || '').trim(),
      platform: ((card.querySelector('.sv-traf-platform') || {}).value || '').trim(),
      name: ((card.querySelector('.sv-traf-name') || {}).value || '').trim(),
      desc: ((card.querySelector('.sv-traf-desc') || {}).value || '').trim(),
      features: Array.from(card.querySelectorAll('.sv-traf-feat')).map(function(el) {
        return el.value.trim();
      }).filter(Boolean)
    };
  }).filter(function(c) { return c.platform || c.name; });

  const trafegoCombo = {
    label: gv('sv_trafego_combo_label'),
    name: gv('sv_trafego_combo_name'),
    desc: (document.getElementById('sv_trafego_combo_desc') || {}).value || '',
    buttonText: gv('sv_trafego_combo_btn_text'),
    buttonHref: gv('sv_trafego_combo_btn_href')
  };

  return Object.assign({}, _servicos || {}, {
    copy: copy,
    digital: Object.assign({}, (_servicos && _servicos.digital) || {}, {
      plans: digitalPlans,
      addons: digitalAddons
    }),
    visual: Object.assign({}, (_servicos && _servicos.visual) || {}, { products: visualProducts }),
    trafego: Object.assign({}, (_servicos && _servicos.trafego) || {}, {
      cards: trafegoCards,
      combo: trafegoCombo
    }),
    processo: Object.assign({}, (_servicos && _servicos.processo) || {}, { steps: steps })
  });
}

async function saveServicosCopy() {
  await saveToSupabase('servicos', collectServicos());
  toast('✅ Textos de Serviços salvos!');
}


/**
 * Coletar dados do formulario: Blog
 */
function collectBlog() {
  return { posts: (typeof _blogPosts !== 'undefined' ? _blogPosts : []).slice() };
}

async function saveBlog() {
  await saveToSupabase('blog', collectBlog());
  toast('✅ Blog salvo!');
}
