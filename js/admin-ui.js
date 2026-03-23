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
    '<button class="btn-remove-row" onclick="this.closest(\'.gal-row\').remove()">✕</button>';
  return d;
}

function addGalItem() {
  document.getElementById('gal-list').appendChild(
    buildGalRow({ src: '', caption: '', client: '', category: 'digital', layout: '', featured: false })
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// POPULATE: HERO CAROUSEL
// ═══════════════════════════════════════════════════════════════════════════

function populateHeroSlides(slides) {
  const container = document.getElementById('hero-slides-container');
  container.innerHTML = '';
  
  if (!Array.isArray(slides) || slides.length === 0) {
    container.innerHTML = '<div class="info-box">Nenhum slide encontrado. Clique em "+ Adicionar novo slide" para começar.</div>';
    return;
  }
  
  slides.forEach((slide, idx) => {
    container.appendChild(buildHeroSlideCard(slide, idx));
  });
}

function buildHeroSlideCard(slide, idx) {
  const card = document.createElement('div');
  card.className = 'hero-slide-card card';
  card.dataset.index = idx;
  
  const proofPillsHtml = (slide.proofPills || []).map((pill, i) => 
    '<input type="text" class="proof-pill-input" value="' + esc(pill) + '" placeholder="Proof pill ' + (i+1) + '">'
  ).join('');
  
  const numbersHtml = (slide.numbers || []).map(num =>
    '<div class="number-row">' +
      '<input type="text" class="number-value" value="' + esc(num.value) + '" placeholder="3x">' +
      '<input type="text" class="number-label" value="' + esc(num.label) + '" placeholder="mais cliques">' +
      '<button class="btn-remove-mini" onclick="this.closest(\'.number-row\').remove()">✕</button>' +
    '</div>'
  ).join('');
  
  const tagsHtml = (slide.visual?.tags || []).map((tag, i) =>
    '<input type="text" class="tag-input" value="' + esc(tag) + '" placeholder="Tag ' + (i+1) + '">'
  ).join('');
  
  const metricsHtml = (slide.visual?.metrics || []).map(metric =>
    '<div class="metric-row">' +
      '<input type="text" class="metric-number" value="' + esc(metric.number) + '" placeholder="847">' +
      '<input type="text" class="metric-label" value="' + esc(metric.label) + '" placeholder="Visualizações">' +
      '<button class="btn-remove-mini" onclick="this.closest(\'.metric-row\').remove()">✕</button>' +
    '</div>'
  ).join('');
  
  card.innerHTML = 
    '<div class="card-head">' +
      '<div class="card-label">Slide ' + (idx + 1) + '</div>' +
      '<button class="btn-collapse" onclick="toggleSlideCard(this)">▼</button>' +
      '<button class="btn-remove-row" onclick="removeHeroSlide(this)">✕ Remover</button>' +
    '</div>' +
    '<div class="slide-body">' +
      '<div class="field"><label>Badge superior</label>' +
        '<input type="text" class="slide-badge" value="' + esc(slide.badge || '') + '" placeholder="Baixada Santista · SP">' +
      '</div>' +
      '<div class="field"><label>Título (pode usar &lt;em&gt; para destaque)</label>' +
        '<input type="text" class="slide-title" value="' + esc(slide.titleHtml || '') + '" placeholder="Sua empresa &lt;em&gt;visível&lt;/em&gt; onde os clientes estão">' +
      '</div>' +
      '<div class="field"><label>Subtítulo</label>' +
        '<textarea class="slide-sub" rows="2" placeholder="Descrição do slide">' + esc(slide.sub || '') + '</textarea>' +
      '</div>' +
      
      '<div class="divider"></div>' +
      '<div class="card-label">Proof Pills</div>' +
      '<div class="proof-pills-group">' + proofPillsHtml + '</div>' +
      '<button class="btn-add-mini" onclick="addProofPill(this)">+ Proof pill</button>' +
      
      '<div class="divider"></div>' +
      '<div class="card-label">Botões</div>' +
      '<div class="g2">' +
        '<div class="field"><label>Botão primário - texto</label>' +
          '<input type="text" class="btn-primary-text" value="' + esc(slide.buttons?.primaryText || '') + '" placeholder="Diagnóstico grátis →">' +
        '</div>' +
        '<div class="field"><label>Botão primário - link</label>' +
          '<input type="url" class="btn-primary-href" value="' + esc(slide.buttons?.primaryHref || '') + '" placeholder="https://wa.me/55...">' +
        '</div>' +
      '</div>' +
      '<div class="g2">' +
        '<div class="field"><label>Botão secundário - texto</label>' +
          '<input type="text" class="btn-secondary-text" value="' + esc(slide.buttons?.secondaryText || '') + '" placeholder="Ver serviços">' +
        '</div>' +
        '<div class="field"><label>Botão secundário - link</label>' +
          '<input type="url" class="btn-secondary-href" value="' + esc(slide.buttons?.secondaryHref || '') + '" placeholder="#servicos">' +
        '</div>' +
      '</div>' +
      
      '<div class="divider"></div>' +
      '<div class="card-label">Numbers (números de impacto)</div>' +
      '<div class="numbers-group">' + numbersHtml + '</div>' +
      '<button class="btn-add-mini" onclick="addNumberRow(this)">+ Number</button>' +
      
      '<div class="divider"></div>' +
      '<div class="card-label">Visual (painel direito)</div>' +
      '<div class="g2">' +
        '<div class="field"><label>Float badge</label>' +
          '<input type="text" class="visual-float-badge" value="' + esc(slide.visual?.floatBadge || '') + '" placeholder="+47 visitas essa semana">' +
        '</div>' +
        '<div class="field"><label>Top chip</label>' +
          '<input type="text" class="visual-top-chip" value="' + esc(slide.visual?.topChip || '') + '" placeholder="Perfil otimizado">' +
        '</div>' +
      '</div>' +
      '<div class="g2">' +
        '<div class="field"><label>Bottom chip</label>' +
          '<input type="text" class="visual-bottom-chip" value="' + esc(slide.visual?.bottomChip || '') + '" placeholder="Gestão recorrente">' +
        '</div>' +
        '<div class="field"><label>Panel label</label>' +
          '<input type="text" class="visual-panel-label" value="' + esc(slide.visual?.panelLabel || '') + '" placeholder="Google Meu Negócio — Painel">' +
        '</div>' +
      '</div>' +
      '<div class="g2">' +
        '<div class="field"><label>Business name</label>' +
          '<input type="text" class="visual-business-name" value="' + esc(slide.visual?.businessName || '') + '" placeholder="Pizzaria do Bairro">' +
        '</div>' +
        '<div class="field"><label>Business address</label>' +
          '<input type="text" class="visual-business-address" value="' + esc(slide.visual?.businessAddress || '') + '" placeholder="Rua das Flores, 123 · Praia Grande">' +
        '</div>' +
      '</div>' +
      '<div class="field"><label>Score</label>' +
        '<input type="text" class="visual-score" value="' + esc(slide.visual?.score || '') + '" placeholder="4.9 (127 avaliações)">' +
      '</div>' +
      
      '<div class="card-label" style="margin-top:.75rem">Tags</div>' +
      '<div class="tags-group">' + tagsHtml + '</div>' +
      '<button class="btn-add-mini" onclick="addTag(this)">+ Tag</button>' +
      
      '<div class="card-label" style="margin-top:.75rem">Metrics</div>' +
      '<div class="metrics-group">' + metricsHtml + '</div>' +
      '<button class="btn-add-mini" onclick="addMetric(this)">+ Metric</button>' +
      
      '<div class="divider"></div>' +
      '<div class="card-label">Insight (card inferior)</div>' +
      '<div class="field"><label>Insight label</label>' +
        '<input type="text" class="visual-insight-label" value="' + esc(slide.visual?.insightLabel || '') + '" placeholder="Resumo estratégico">' +
      '</div>' +
      '<div class="field"><label>Insight title</label>' +
        '<input type="text" class="visual-insight-title" value="' + esc(slide.visual?.insightTitle || '') + '" placeholder="Mais descoberta local, mais contato qualificado.">' +
      '</div>' +
      '<div class="field"><label>Insight text</label>' +
        '<textarea class="visual-insight-text" rows="2" placeholder="Texto descritivo">' + esc(slide.visual?.insightText || '') + '</textarea>' +
      '</div>' +
    '</div>';
  
  return card;
}

function toggleSlideCard(btn) {
  const card = btn.closest('.hero-slide-card');
  card.classList.toggle('collapsed');
  btn.textContent = card.classList.contains('collapsed') ? '▶' : '▼';
}

function removeHeroSlide(btn) {
  if (confirm('Remover este slide?')) {
    btn.closest('.hero-slide-card').remove();
  }
}

function addHeroSlide() {
  const container = document.getElementById('hero-slides-container');
  const emptySlide = {
    badge: '',
    titleHtml: '',
    sub: '',
    proofPills: ['', ''],
    buttons: { primaryText: '', primaryHref: '', secondaryText: '', secondaryHref: '' },
    numbers: [{ value: '', label: '' }, { value: '', label: '' }, { value: '', label: '' }],
    visual: {
      floatBadge: '',
      topChip: '',
      bottomChip: '',
      panelLabel: '',
      businessName: '',
      businessAddress: '',
      score: '',
      tags: ['', '', ''],
      metrics: [{ number: '', label: '' }, { number: '', label: '' }, { number: '', label: '' }],
      insightLabel: '',
      insightTitle: '',
      insightText: ''
    }
  };
  
  const slides = Array.from(container.querySelectorAll('.hero-slide-card'));
  container.appendChild(buildHeroSlideCard(emptySlide, slides.length));
}

function addProofPill(btn) {
  const group = btn.previousElementSibling;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'proof-pill-input';
  input.placeholder = 'Nova proof pill';
  group.appendChild(input);
}

function addNumberRow(btn) {
  const group = btn.previousElementSibling;
  const row = document.createElement('div');
  row.className = 'number-row';
  row.innerHTML =
    '<input type="text" class="number-value" placeholder="Valor">' +
    '<input type="text" class="number-label" placeholder="Label">' +
    '<button class="btn-remove-mini" onclick="this.closest(\'.number-row\').remove()">✕</button>';
  group.appendChild(row);
}

function addTag(btn) {
  const group = btn.previousElementSibling;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'tag-input';
  input.placeholder = 'Nova tag';
  group.appendChild(input);
}

function addMetric(btn) {
  const group = btn.previousElementSibling;
  const row = document.createElement('div');
  row.className = 'metric-row';
  row.innerHTML =
    '<input type="text" class="metric-number" placeholder="847">' +
    '<input type="text" class="metric-label" placeholder="Label">' +
    '<button class="btn-remove-mini" onclick="this.closest(\'.metric-row\').remove()">✕</button>';
  group.appendChild(row);
}

