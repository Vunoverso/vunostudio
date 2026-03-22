const VISUAL_SVGS = {
  impressos: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><rect x="5" y="3" width="14" height="18" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></svg>',
  adesivos: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20"/><circle cx="8" cy="14" r="2"/><path d="M14 12l3 3 3-3"/></svg>',
  banners: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M4 6h16v12H4z"/><path d="M4 6l8 6 8-6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
  acm: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/><rect x="9" y="10" width="2" height="2"/><rect x="13" y="10" width="2" height="2"/></svg>'
};

function setText(selector, value) {
  if (typeof value !== 'string') return;
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

function setHtml(selector, value) {
  if (typeof value !== 'string') return;
  const el = document.querySelector(selector);
  if (el) el.innerHTML = value;
}

function setHref(selector, value) {
  if (typeof value !== 'string') return;
  const el = document.querySelector(selector);
  if (el) el.setAttribute('href', value);
}

function renderStaticCopy(copy) {
  if (!copy) return;

  setText('.hero-tag', copy.hero && copy.hero.tag);
  setHtml('.hero h1', copy.hero && copy.hero.titleHtml);
  setText('.hero-sub', copy.hero && copy.hero.sub);

  setText('.digital .section-label', copy.digital && copy.digital.label);
  setHtml('.digital .section-title', copy.digital && copy.digital.titleHtml);
  setText('.digital .section-sub', copy.digital && copy.digital.sub);
  setText('.adicionais-title', copy.digital && copy.digital.addonsTitle);

  setText('.visual .section-label', copy.visual && copy.visual.label);
  setHtml('.visual .section-title', copy.visual && copy.visual.titleHtml);
  setText('.visual .section-sub', copy.visual && copy.visual.sub);

  setText('.galeria-header .section-label', copy.galeria && copy.galeria.label);
  setHtml('.galeria-header .section-title', copy.galeria && copy.galeria.titleHtml);
  setText('.galeria-header .section-sub', copy.galeria && copy.galeria.sub);

  setText('.trafego .section-label', copy.trafego && copy.trafego.label);
  setHtml('.trafego .section-title', copy.trafego && copy.trafego.titleHtml);
  setText('.trafego .section-sub', copy.trafego && copy.trafego.sub);

  setText('.processo .section-label', copy.processo && copy.processo.label);
  setHtml('.processo .section-title', copy.processo && copy.processo.titleHtml);
  setText('.processo .section-sub', copy.processo && copy.processo.sub);

  setText('.cta-label', copy.cta && copy.cta.label);
  setHtml('.cta-title', copy.cta && copy.cta.titleHtml);
  setText('.cta-sub', copy.cta && copy.cta.sub);
  setText('.cta-btn-main-text', copy.cta && copy.cta.mainButtonText);
  setHref('.cta-btn-main', copy.cta && copy.cta.mainButtonHref);
  setText('.cta-btn-sec', copy.cta && copy.cta.secButtonText);
  setHref('.cta-btn-sec', copy.cta && copy.cta.secButtonHref);
}

function renderDigitalSection(digital) {
  const plansRow = document.querySelector('.plans-row');
  const addGrid = document.querySelector('.add-grid');

  if (plansRow && Array.isArray(digital.plans)) {
    plansRow.innerHTML = digital.plans.map((plan) => {
      const features = (plan.features || []).map((feat) => `<li>${feat}</li>`).join('');
      return `<div class="plan${plan.featured ? ' featured' : ''}">
        ${plan.featured && plan.tag ? `<div class="plan-tag">${plan.tag}</div>` : ''}
        <div class="plan-name">${plan.name}</div>
        <div class="plan-desc">${plan.desc}</div>
        <div class="plan-divider"></div>
        <ul class="plan-feats">${features}</ul>
        <a href="${plan.ctaHref}" class="plan-btn" target="_blank" rel="noopener">${plan.ctaText}</a>
      </div>`;
    }).join('');
  }

  if (addGrid && Array.isArray(digital.addons)) {
    addGrid.innerHTML = digital.addons.map((addon) => {
      return `<div class="add-item">
        <div class="add-icon" aria-hidden="true">${addon.icon}</div>
        <div class="add-name">${addon.name}</div>
        <div class="add-desc">${addon.desc}</div>
      </div>`;
    }).join('');
  }
}

function renderVisualSection(visual) {
  const grid = document.querySelector('.produtos-grid');
  if (!grid || !Array.isArray(visual.products)) return;

  grid.innerHTML = visual.products.map((product) => {
    const items = (product.items || []).map((item) => `<li>${item}</li>`).join('');
    const tags = (product.tags || []).map((tag) => `<span class="prod-tag">${tag}</span>`).join('');
    const svg = VISUAL_SVGS[product.iconKey] || VISUAL_SVGS.impressos;

    return `<div class="produto${product.premium ? ' premium' : ''}">
      ${product.premium && product.badge ? `<div class="prod-badge">${product.badge}</div>` : ''}
      <div class="prod-img">
        ${svg}
        <span class="prod-img-label">${product.imageLabel}</span>
      </div>
      <div class="prod-body">
        <div class="prod-name">${product.name}</div>
        <div class="prod-desc">${product.desc}</div>
        <ul class="prod-itens">${items}</ul>
        <div class="prod-tags">${tags}</div>
      </div>
    </div>`;
  }).join('');
}

function renderTrafegoSection(trafego) {
  const cardsGrid = document.querySelector('.traf-grid');
  const comboBox = document.querySelector('.traf-combo');

  if (cardsGrid && Array.isArray(trafego.cards)) {
    cardsGrid.innerHTML = trafego.cards.map((card) => {
      const features = (card.features || []).map((feat) => `<li>${feat}</li>`).join('');
      return `<div class="traf-card ${card.variant}">
        <div class="traf-plat">${card.platform}</div>
        <div class="traf-name">${card.name}</div>
        <div class="traf-desc">${card.desc}</div>
        <ul class="traf-feats">${features}</ul>
      </div>`;
    }).join('');
  }

  if (comboBox && trafego.combo) {
    comboBox.innerHTML = `<div class="combo-text">
      <div class="combo-label">${trafego.combo.label}</div>
      <div class="combo-name">${trafego.combo.name}</div>
      <div class="combo-desc">${trafego.combo.desc}</div>
    </div>
    <a href="${trafego.combo.buttonHref}" class="combo-btn" target="_blank" rel="noopener">${trafego.combo.buttonText}</a>`;
  }
}

function renderProcessSection(processo) {
  const stepsWrap = document.querySelector('.processo-steps');
  if (!stepsWrap || !Array.isArray(processo.steps)) return;

  stepsWrap.innerHTML = processo.steps.map((step) => {
    return `<div class="pstep">
      <div class="pstep-num">${step.num}</div>
      <div class="pstep-icon" aria-hidden="true">${step.icon}</div>
      <div class="pstep-name">${step.name}</div>
      <div class="pstep-desc">${step.desc}</div>
      <span class="pstep-time">${step.time}</span>
    </div>`;
  }).join('');
}

async function loadServicos() {
  if (!document.querySelector('.digital')) return;

  try {
    const data = await window.loadSiteData('servicos', 'data/servicos.json');
    if (!data) return;
    renderStaticCopy(data.copy || {});
    renderDigitalSection(data.digital || {});
    renderVisualSection(data.visual || {});
    renderTrafegoSection(data.trafego || {});
    renderProcessSection(data.processo || {});
  } catch (error) {
    console.warn('servicos load failed', error);
  }
}

loadServicos();
