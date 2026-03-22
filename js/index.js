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

function renderHero(hero) {
  if (!hero) return;

  setText('.hero-badge', hero.badge);
  setHtml('.hero-content h1', hero.titleHtml);
  setText('.hero-content > p', hero.sub);

  if (Array.isArray(hero.proofPills)) {
    const wrap = document.querySelector('.hero-proof');
    if (wrap) {
      wrap.innerHTML = hero.proofPills
        .map((pill) => `<div class="proof-pill">${pill}</div>`)
        .join('');
    }
  }

  if (hero.buttons) {
    setText('.btn-primary', hero.buttons.primaryText);
    setHref('.btn-primary', hero.buttons.primaryHref);
    setText('.btn-sec', hero.buttons.secondaryText);
    setHref('.btn-sec', hero.buttons.secondaryHref);
  }

  if (Array.isArray(hero.numbers)) {
    const wrap = document.querySelector('.hero-nums');
    if (wrap) {
      wrap.innerHTML = hero.numbers
        .map((item) => `<div class="num-item"><div class="num-val">${item.value}</div><div class="num-lbl">${item.label}</div></div>`)
        .join('');
    }
  }

  const visual = hero.visual || {};
  setText('.float-badge', visual.floatBadge);
  setText('.chip-top', visual.topChip);
  setText('.chip-bottom', visual.bottomChip);
  setText('.mockup-label', visual.panelLabel);
  setText('.gc-name', visual.businessName);
  setText('.gc-addr', visual.businessAddress);
  setText('.gc-score', visual.score);
  setText('.insight-label', visual.insightLabel);
  setText('.insight-title', visual.insightTitle);
  setText('.insight-card p', visual.insightText);

  if (Array.isArray(visual.tags)) {
    const tags = document.querySelector('.gc-tags');
    if (tags) {
      tags.innerHTML = visual.tags.map((tag) => `<span class="gc-tag">${tag}</span>`).join('');
    }
  }

  if (Array.isArray(visual.metrics)) {
    const metrics = document.querySelector('.metric-row');
    if (metrics) {
      metrics.innerHTML = visual.metrics
        .map((item) => `<div class="metric-box"><div class="metric-num">${item.number}</div><div class="metric-txt">${item.label}</div></div>`)
        .join('');
    }
  }
}

function renderCta(cta) {
  if (!cta) return;
  setText('.cta-final h2', cta.title);
  setText('.cta-final p', cta.sub);
  setText('.cta-white-text', cta.buttonText);
  setHref('.cta-white', cta.buttonHref);
}

async function loadIndexData() {
  if (!document.querySelector('.hero-section')) return;

  try {
    const data = await window.loadSiteData('index', 'data/index.json');
    if (!data) return;
    renderHero(data.hero || {});
    renderCta(data.cta || {});
  } catch (error) {
    console.warn('index data load failed', error);
  }
}

loadIndexData();
