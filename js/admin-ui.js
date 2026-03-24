/**
 * admin-ui.js
 * Funções de UI: renderização, construção de elementos, helpers
 */

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/** Set valor de input por ID */
function sv(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

/** Get valor de input por ID */
function gv(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

/** Escape HTML para innerHTML */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Construir .field com label + input */
function fld(labelText, cls, value, placeholder, type) {
  return '<div class="field">' +
    '<label>' + labelText + '</label>' +
    '<input type="' + (type || 'text') + '" class="' + cls + '" value="' + esc(value) + '" placeholder="' + esc(placeholder) + '">' +
    '</div>';
}

/** Build <option> elements para select */
function mkOpt(values, selected) {
  return values.map(v => '<option value="' + v + '"' + (v === selected ? ' selected' : '') + '>' + v + '</option>').join('');
}

/** Toast notification */
let _toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

function showPanel(id, el) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  el.classList.add('active');
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULATE: CONFIG
// ═══════════════════════════════════════════════════════════════════════════

function populateConfig(d) {
  const seo = d && d.seo ? d.seo : {};
  const pages = seo.pages || {};
  sv('config_business_name', seo.businessName || '');
  sv('config_og_image', seo.ogImage || '');

  sv('seo_index_title', pages.index?.title || '');
  sv('seo_index_description', pages.index?.description || '');
  sv('seo_index_keywords', pages.index?.keywords || '');

  sv('seo_servicos_title', pages.servicos?.title || '');
  sv('seo_servicos_description', pages.servicos?.description || '');
  sv('seo_servicos_keywords', pages.servicos?.keywords || '');

  sv('seo_planos_title', pages.planos?.title || '');
  sv('seo_planos_description', pages.planos?.description || '');
  sv('seo_planos_keywords', pages.planos?.keywords || '');
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULATE: CONTATO
// ═══════════════════════════════════════════════════════════════════════════

function populateContato(d) {
  sv('wpp_float_href', d.global.whatsappFloat.href);
  sv('footer_wpp_href', d.global.footer.whatsapp.href);
  sv('footer_wpp_text', d.global.footer.whatsapp.text);
  sv('footer_email_href', d.global.footer.email.href);
  sv('footer_email_text', d.global.footer.email.text);
  sv('cta_index_text', d.pages.index.navCta.text);
  sv('cta_index_href', d.pages.index.navCta.href);
  sv('cta_servicos_text', d.pages.servicos.navCta.text);
  sv('cta_servicos_href', d.pages.servicos.navCta.href);
  sv('cta_planos_text', d.pages.planos.navCta.text);
  sv('cta_planos_href', d.pages.planos.navCta.href);
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULATE: DIGITAL
// ═══════════════════════════════════════════════════════════════════════════

function populateDigital(digital) {
  const pw = document.getElementById('digital-plans-wrap');
  pw.innerHTML = '';
  (digital.plans || []).forEach((p, i) => pw.appendChild(buildPlanCard(p, i)));

  const aw = document.getElementById('digital-addons-wrap');
  aw.innerHTML = '';
  (digital.addons || []).forEach(a => aw.appendChild(buildAddonRow(a)));
}

function buildPlanCard(plan, i) {
  const d = document.createElement('div');
  d.className = 'card';
  d.dataset.pi = i;
  d.innerHTML =
    '<div class="card-head">' +
      '<div class="card-label">Plano ' + (i + 1) + (plan.name ? ' — ' + plan.name : '') + '</div>' +
      (plan.featured ? '<span class="badge badge-green">Destaque</span>' : '') +
    '</div>' +
    '<div class="g3">' +
      fld('Tag / Categoria', 'plan-cat', plan.cat, 'Básico') +
      fld('Nome do plano', 'plan-name', plan.name, 'Presença') +
      fld('Preço mensal', 'plan-price', plan.price, 'R$ 297') +
    '</div>' +
    '<div class="g2">' +
      fld('Setup único', 'plan-setup', plan.setup, 'R$ 500') +
      fld('Link WA — cotação', 'plan-wahref', plan.waHref, 'https://wa.me/55?text=...', 'url') +
    '</div>' +
    '<div class="g1">' + fld('Tagline (frase de posicionamento)', 'plan-tagline', plan.tagline, '') + '</div>' +
    '<div style="margin-top:.2rem">' +
      '<label style="margin-bottom:.5rem">Features ' +
        '<span style="font-size:.7rem;opacity:.7;font-weight:400;text-transform:none;letter-spacing:0">' +
        '— ✓ = incluso | Negrito = palavra em destaque | Texto = descrição</span></label>' +
      '<div class="feats-list" id="fl-' + i + '">' +
        (plan.features || []).map((f, fi) => featRowHTML(f, i, fi)).join('') +
      '</div>' +
      '<button class="btn-add" style="margin-top:.2rem" onclick="addFeat(' + i + ')">+ Adicionar feature</button>' +
    '</div>';
  return d;
}

function featRowHTML(f, pi, fi) {
  return '<div class="feat-row">' +
    '<input type="checkbox"' + (f.ok ? ' checked' : '') + ' title="Incluso (✓) ou não incluso (—)">' +
    '<input type="text" class="feat-highlight" value="' + esc(f.highlight || '') + '" placeholder="negrito…">' +
    '<input type="text" class="feat-text" value="' + esc(f.text || '') + '" placeholder="texto da feature">' +
    '<button class="btn-remove" onclick="this.closest(\'.feat-row\').remove()" title="Remover">✕</button>' +
    '</div>';
}

function addFeat(pi) {
  document.getElementById('fl-' + pi).insertAdjacentHTML('beforeend', featRowHTML({ ok: true, highlight: '', text: '' }, pi, 0));
}

function buildAddonRow(addon) {
  const d = document.createElement('div');
  d.className = 'card';
  d.style.cssText = 'padding:.85rem 1.2rem;margin-bottom:.6rem';
  d.innerHTML =
    '<div style="display:grid;grid-template-columns:2fr 3fr 1fr 1fr 28px;gap:.5rem;align-items:end">' +
    fld('Nome', 'addon-name', addon.name, 'Stories diários') +
    fld('Descrição', 'addon-desc', addon.desc, '20 stories/mês') +
    fld('Preço', 'addon-price', addon.price, '+ R$ 200') +
    fld('Período', 'addon-period', addon.period, '/mês') +
    '<button class="btn-remove-row" onclick="this.closest(\'.card\').remove()" style="margin-bottom:0">✕</button>' +
    '</div>';
  return d;
}

function addAddon() {
  document.getElementById('digital-addons-wrap').appendChild(buildAddonRow({ name: '', desc: '', price: '', period: '/mês' }));
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULATE: VISUAL
// ═══════════════════════════════════════════════════════════════════════════

function populateVisual(visual) {
  const w = document.getElementById('visual-products-wrap');
  w.innerHTML = '';
  (visual.products || []).forEach((p, i) => w.appendChild(buildVprodCard(p, i)));

  if (!w.children.length) {
    w.innerHTML = '<div class="card"><div class="card-label">Nenhum produto carregado</div><p style="margin:.5rem 0 0;opacity:.7">Use o botão abaixo para adicionar um produto manualmente e depois salvar no banco.</p></div>';
  }
}

function buildVprodCard(prod, i) {
  const d = document.createElement('div');
  d.className = 'card';
  d.dataset.vi = i;
  const itemsHtml = (prod.items || []).map(item =>
    '<div class="item-row"><input type="text" class="vprod-item" value="' + esc(item) + '">' +
    '<button class="btn-remove" onclick="this.parentElement.remove()">✕</button></div>'
  ).join('');

  d.innerHTML =
    '<div class="card-head">' +
      '<div class="card-label">' + (prod.name || 'Produto ' + (i + 1)) + '</div>' +
      (prod.premium ? '<span class="badge badge-orange">Premium</span>' : '') +
    '</div>' +
    '<div class="g2">' +
      fld('Nome', 'vprod-name', prod.name, 'Gráfica & Impressos') +
      fld('Ícone (emoji)', 'vprod-icon', prod.icon, '🖨️') +
    '</div>' +
    '<div class="g1">' +
      '<div class="field"><label>Descrição</label>' +
      '<textarea class="vprod-desc" rows="2">' + esc(prod.desc) + '</textarea></div>' +
    '</div>' +
    '<div class="g3">' +
      fld('Preço', 'vprod-price', prod.price, 'A partir de R$ 80') +
      fld('Unidade', 'vprod-unit', prod.unit, 'por pedido') +
      fld('Incluso', 'vprod-includes', prod.includes, 'Arte + impressão') +
    '</div>' +
    '<div class="g1">' + fld('Link WA — cotação', 'vprod-wahref', prod.waHref, 'https://wa.me/55?text=...', 'url') + '</div>' +
    '<div style="margin-top:.2rem">' +
      '<label style="margin-bottom:.5rem">Itens inclusos (lista)</label>' +
      '<div class="items-list" id="vi-' + i + '">' + itemsHtml + '</div>' +
      '<button class="btn-add" onclick="addVprodItem(' + i + ')">+ Adicionar item</button>' +
    '</div>';
  return d;
}

function addVprodItem(i) {
  document.getElementById('vi-' + i).insertAdjacentHTML('beforeend',
    '<div class="item-row"><input type="text" class="vprod-item" placeholder="novo item">' +
    '<button class="btn-remove" onclick="this.parentElement.remove()">✕</button></div>');
}

function addVisualProduct() {
  const w = document.getElementById('visual-products-wrap');
  if (!w) return;
  if (w.children.length === 1 && w.firstElementChild && !w.querySelector('.vprod-name')) {
    w.innerHTML = '';
  }
  w.appendChild(buildVprodCard({
    name: '',
    icon: '',
    desc: '',
    price: '',
    unit: '',
    includes: '',
    items: [],
    premium: false,
    waHref: ''
  }, w.querySelectorAll('.card').length));
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULATE: TRÁFEGO
// ═══════════════════════════════════════════════════════════════════════════

function populateTrafego(trafego) {
  const w = document.getElementById('trafego-plans-wrap');
  w.innerHTML = '';
  (trafego.plans || []).forEach((p, i) => w.appendChild(buildTrafCard(p, i)));

  if (!w.children.length) {
    w.innerHTML = '<div class="card"><div class="card-label">Nenhum plano carregado</div><p style="margin:.5rem 0 0;opacity:.7">Use o botão abaixo para adicionar um plano manualmente e depois salvar no banco.</p></div>';
  }
}

function buildTrafCard(plan, i) {
  const d = document.createElement('div');
  d.className = 'card';
  d.dataset.ti = i;
  const featsHtml = (plan.features || []).map(f =>
    '<div class="item-row"><input type="text" class="traf-feat" value="' + esc(f.text) + '"' +
    (f.color ? ' data-color="' + esc(f.color) + '"' : '') + '>' +
    '<button class="btn-remove" onclick="this.parentElement.remove()">✕</button></div>'
  ).join('');

  d.innerHTML =
    '<div class="card-head">' +
      '<div class="card-label">' + (plan.platform || 'Plano ' + (i + 1)) + '</div>' +
      (plan.combo ? '<span class="badge badge-green">Combo</span>' : '') +
    '</div>' +
    '<div class="g3">' +
      fld('Plataforma', 'traf-platform', plan.platform, 'Google Ads') +
      fld('Cor (hex ou var)', 'traf-color', plan.platformColor, '#4285F4') +
      fld('Nome do plano', 'traf-name', plan.name, 'Pesquisa + Maps') +
    '</div>' +
    '<div class="g2">' +
      fld('Preço de gestão', 'traf-price', plan.price, 'R$ 450') +
      fld('Verba mínima', 'traf-verba', plan.verba, 'Mínimo recomendado: R$ 20/dia') +
    '</div>' +
    '<div class="g1">' +
      fld('Tag de economia (combo — deixe vazio se não for combo)', 'traf-save', plan.save || '', 'Economia de R$ 100/mês vs contratar separado') +
    '</div>' +
    '<div class="g1">' +
      '<div class="field"><label>Descrição</label><textarea class="traf-desc" rows="2">' + esc(plan.desc) + '</textarea></div>' +
    '</div>' +
    '<div class="g1">' + fld('Link WA — cotação', 'traf-wahref', plan.waHref, 'https://wa.me/55?text=...', 'url') + '</div>' +
    '<div style="margin-top:.2rem">' +
      '<label style="margin-bottom:.5rem">Features do plano</label>' +
      '<div class="items-list" id="tf-' + i + '">' + featsHtml + '</div>' +
      '<button class="btn-add" onclick="addTrafFeat(' + i + ')">+ Adicionar feature</button>' +
    '</div>';
  return d;
}

function addTrafegoPlan() {
  const w = document.getElementById('trafego-plans-wrap');
  if (!w) return;
  if (w.children.length === 1 && w.firstElementChild && !w.querySelector('.traf-name')) {
    w.innerHTML = '';
  }
  w.appendChild(buildTrafCard({
    platform: '',
    platformColor: '',
    name: '',
    desc: '',
    price: '',
    verba: '',
    combo: false,
    save: '',
    features: [],
    waHref: ''
  }, w.querySelectorAll('.card').length));
}

function addTrafFeat(i) {
  document.getElementById('tf-' + i).insertAdjacentHTML('beforeend',
    '<div class="item-row"><input type="text" class="traf-feat" placeholder="nova feature">' +
    '<button class="btn-remove" onclick="this.parentElement.remove()">✕</button></div>');
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULATE: GALERIA
// ═══════════════════════════════════════════════════════════════════════════

function populateGaleria(data) {
  const list = document.getElementById('gal-list');
  list.innerHTML = '';
  (data.galeria || []).forEach(item => list.appendChild(buildGalRow(item)));
}

function buildGalRow(item) {
  const d = document.createElement('div');
  d.className = 'gal-row';
  d.dataset.featured = item.featured ? '1' : '0';
  d.innerHTML =
    '<div class="field"><label>Foto (caminho)</label>' +
      '<input type="text" class="gal-src" value="' + esc(item.src || '') + '" placeholder="images/galeria/nome.jpg">' +
    '</div>' +
    '<div class="field"><label>Legenda</label>' +
      '<input type="text" class="gal-caption" value="' + esc(item.caption) + '" placeholder="Fachada ACM completa">' +
    '</div>' +
    '<div class="field"><label>Cliente</label>' +
      '<input type="text" class="gal-client" value="' + esc(item.client) + '" placeholder="Pizzaria · Praia Grande">' +
    '</div>' +
    '<div class="gal-row-bottom">' +
      '<div class="field"><label>Categoria</label>' +
        '<select class="gal-cat">' +
          mkOpt(ADMIN_CONFIG.galeriaCategories, item.category) +
        '</select>' +
      '</div>' +
      '<div class="field"><label>Layout</label>' +
        '<select class="gal-layout">' +
          '<option value=""' + (item.layout === '' ? ' selected' : '') + '>normal</option>' +
          '<option value="tall"' + (item.layout === 'tall' ? ' selected' : '') + '>tall — alto</option>' +
          '<option value="wide"' + (item.layout === 'wide' ? ' selected' : '') + '>wide — largo</option>' +
        '</select>' +
      '</div>' +
      '<div></div>' +
      '<button class="btn-remove-row" style="margin-bottom:0" onclick="this.closest(\'.gal-row\').remove()">✕</button>' +
    '</div>';
  return d;
}

function addGalItem() {
  document.getElementById('gal-list').appendChild(
    buildGalRow({ src: '', caption: '', client: '', category: 'digital', layout: '', featured: false })
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULATE: HERO
// ═══════════════════════════════════════════════════════════════════════════

function populateHero(d) {
  const hero = Array.isArray(d.hero) ? d.hero[0] : (d.hero || {});
  sv('hero_badge',               hero.badge          || '');
  sv('hero_title',               hero.titleHtml      || '');
  sv('hero_img_src_field',       hero.heroImageSrc   || '');
  const subEl = document.getElementById('hero_sub');
  if (subEl) subEl.value = hero.sub || '';
  const btnPriText  = document.getElementById('hero_btn_primary_text');
  const btnPriHref  = document.getElementById('hero_btn_primary_href');
  const btnSecText  = document.getElementById('hero_btn_secondary_text');
  const btnSecHref  = document.getElementById('hero_btn_secondary_href');
  const imgSrc      = document.getElementById('hero_image_src');
  if (btnPriText)  btnPriText.value  = hero.buttons?.primaryText    || '';
  if (btnPriHref)  btnPriHref.value  = hero.buttons?.primaryHref    || '';
  if (btnSecText)  btnSecText.value  = hero.buttons?.secondaryText  || '';
  if (btnSecHref)  btnSecHref.value  = hero.buttons?.secondaryHref  || '';
  if (imgSrc)      imgSrc.value      = hero.heroImageSrc            || '';

  const pillsGroup = document.getElementById('hero-proof-pills-group');
  if (pillsGroup) {
    pillsGroup.innerHTML = '';
    (hero.proofPills || []).forEach(p => {
      const inp = document.createElement('input');
      inp.type = 'text'; inp.className = 'proof-pill-input';
      inp.value = p; inp.placeholder = 'Proof pill';
      pillsGroup.appendChild(inp);
    });
  }

  previewHeroImage();
}

function addHeroProofPill() {
  const group = document.getElementById('hero-proof-pills-group');
  const inp = document.createElement('input');
  inp.type = 'text'; inp.className = 'proof-pill-input'; inp.placeholder = 'Nova pill';
  group.appendChild(inp);
}

function previewHeroImage() {
  const srcEl   = document.getElementById('hero_image_src');
  const img     = document.getElementById('hero_img_preview');
  const empty   = document.getElementById('hero_img_preview_empty');
  if (!srcEl || !img) return;
  const val = srcEl.value.trim();
  if (val) {
    img.src = val;
    img.style.display = 'block';
    if (empty) empty.style.display = 'none';
  } else {
    img.style.display = 'none';
    if (empty) empty.style.display = 'block';
  }
}

// ─── STUB para não quebrar chamadas antigas ─────────────────────────────────
function populateHeroSlides(slides) {
  // mantido para compatibilidade — hero agora é form simples
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO NUMBERS
// ═══════════════════════════════════════════════════════════════════════════

function buildNumRow(n) {
  const d = document.createElement('div');
  d.className = 'num-row';
  d.innerHTML =
    '<div class="field"><label>Valor</label>' +
      '<input type="text" class="num-value" value="' + esc(n.value || '') + '" placeholder="48h">' +
    '</div>' +
    '<div class="field"><label>Label</label>' +
      '<input type="text" class="num-label" value="' + esc(n.label || '') + '" placeholder="para entrar no ar">' +
    '</div>' +
    '<button class="btn-remove-row" style="align-self:flex-end" onclick="this.closest(\'.num-row\').remove()">✕</button>';
  return d;
}

function addHeroNumber() {
  const list = document.getElementById('hero-numbers-list');
  if (list) list.appendChild(buildNumRow({ value: '', label: '' }));
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULATE: SERVIÇOS — TEXTOS
// ═══════════════════════════════════════════════════════════════════════════

function populateServicosCopy(copy) {
  if (!copy) return;
  const h = copy.hero || {};
  sv('sv_hero_tag',   h.tag       || '');
  sv('sv_hero_title', h.titleHtml || '');
  sv('sv_hero_sub',   h.sub       || '');

  const d = copy.digital || {};
  sv('sv_digital_label',   d.label      || '');
  sv('sv_digital_title',   d.titleHtml  || '');
  sv('sv_digital_sub',     d.sub        || '');
  sv('sv_digital_addons',  d.addonsTitle|| '');

  const v = copy.visual || {};
  sv('sv_visual_label',  v.label     || '');
  sv('sv_visual_title',  v.titleHtml || '');
  sv('sv_visual_sub',    v.sub       || '');

  const g = copy.galeria || {};
  sv('sv_galeria_label',  g.label     || '');
  sv('sv_galeria_title',  g.titleHtml || '');
  sv('sv_galeria_sub',    g.sub       || '');

  const t = copy.trafego || {};
  sv('sv_trafego_label',  t.label     || '');
  sv('sv_trafego_title',  t.titleHtml || '');
  sv('sv_trafego_sub',    t.sub       || '');

  const p = copy.processo || {};
  sv('sv_processo_label',  p.label     || '');
  sv('sv_processo_title',  p.titleHtml || '');
  sv('sv_processo_sub',    p.sub       || '');

  const c = copy.cta || {};
  sv('sv_cta_label',         c.label          || '');
  sv('sv_cta_title',         c.titleHtml      || '');
  sv('sv_cta_sub',           c.sub            || '');
  sv('sv_cta_btn_main_text', c.mainButtonText || '');
  sv('sv_cta_btn_main_href', c.mainButtonHref || '');
  sv('sv_cta_btn_sec_text',  c.secButtonText  || '');
  sv('sv_cta_btn_sec_href',  c.secButtonHref  || '');
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULATE: PROCESSO
// ═══════════════════════════════════════════════════════════════════════════

function populateProcesso(steps) {
  const list = document.getElementById('processo-steps-list');
  if (!list) return;
  list.innerHTML = '';
  (steps || []).forEach(s => list.appendChild(buildProcessoRow(s)));
  setStatus('statusProcesso', true);
}

function buildProcessoRow(step) {
  const d = document.createElement('div');
  d.className = 'processo-row';
  d.innerHTML =
    '<div class="field"><label>Num</label>' +
      '<input type="text" class="ps-num" value="' + esc(step.num || '') + '" placeholder="01">' +
    '</div>' +
    '<div class="field"><label>Ícone</label>' +
      '<input type="text" class="ps-icon" value="' + esc(step.icon || '') + '" placeholder="🔍">' +
    '</div>' +
    '<div class="field"><label>Nome da etapa</label>' +
      '<input type="text" class="ps-name" value="' + esc(step.name || '') + '" placeholder="Diagnóstico gratuito">' +
    '</div>' +
    '<div class="field"><label>Tempo / badge</label>' +
      '<input type="text" class="ps-time" value="' + esc(step.time || '') + '" placeholder="Sem compromisso">' +
    '</div>' +
    '<div class="processo-row-bottom">' +
      '<div class="field"><label>Descrição</label>' +
        '<input type="text" class="ps-desc" value="' + esc(step.desc || '') + '" placeholder="Analisamos sua presença atual...">' +
      '</div>' +
      '<button class="btn-remove-row" style="margin-bottom:0" onclick="this.closest(\'.processo-row\').remove()">✕</button>' +
    '</div>';
  return d;
}

function addProcessoStep() {
  const list = document.getElementById('processo-steps-list');
  if (list) list.appendChild(buildProcessoRow({ num: '', icon: '', name: '', desc: '', time: '' }));
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULATE: FAQ
// ═══════════════════════════════════════════════════════════════════════════

function populateFaq(faq) {
  const list = document.getElementById('faq-edit-list');
  if (!list) return;
  list.innerHTML = '';
  (faq || []).forEach(item => list.appendChild(buildFaqRow(item)));
  setStatus('statusFaq', true);
}

function buildFaqRow(item) {
  const d = document.createElement('div');
  d.className = 'faq-edit-row';
  d.innerHTML =
    '<div class="field faq-q-field"><label>Pergunta</label>' +
      '<input type="text" class="faq-q-input" value="' + esc(item.q || '') + '" placeholder="O que está incluso no setup único?">' +
    '</div>' +
    '<div class="field"><label>Resposta</label>' +
      '<textarea class="faq-a-input" rows="3">' + esc(item.a || '') + '</textarea>' +
    '</div>' +
    '<div class="faq-row-footer">' +
      '<button class="btn-remove-mini" onclick="this.closest(\'.faq-edit-row\').remove()">✕ Remover</button>' +
    '</div>';
  return d;
}

function addFaqItem() {
  const list = document.getElementById('faq-edit-list');
  if (list) list.appendChild(buildFaqRow({ q: '', a: '' }));
}
