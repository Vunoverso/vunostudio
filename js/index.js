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

// ==================== HERO (estático, dados sobrescrevem via JS) ====================

function renderHero(heroData) {
  const d = Array.isArray(heroData) ? heroData[0] : heroData;
  if (!d) return;

  const badge = document.getElementById('heroBadge');
  const title = document.getElementById('heroTitle');
  const sub   = document.getElementById('heroSub');
  const btns  = document.getElementById('heroBtns');
  const proof = document.getElementById('heroProof');
  const nums  = document.getElementById('heroNums');

  if (badge && d.badge)     badge.textContent = d.badge;
  if (title && d.titleHtml) title.innerHTML   = d.titleHtml;
  if (sub   && d.sub)       sub.textContent   = d.sub;

  if (proof && Array.isArray(d.proofPills) && d.proofPills.length) {
    proof.innerHTML = d.proofPills.map(p => `<div class="proof-pill">${p}</div>`).join('');
  }

  if (btns && d.buttons) {
    const primary   = btns.querySelector('#heroBtnPrimary');
    const secondary = btns.querySelector('#heroBtnSecondary');
    if (primary   && d.buttons.primaryText)    primary.textContent   = d.buttons.primaryText;
    if (primary   && d.buttons.primaryHref)    primary.href          = d.buttons.primaryHref;
    if (secondary && d.buttons.secondaryText)  secondary.textContent = d.buttons.secondaryText;
    if (secondary && d.buttons.secondaryHref)  secondary.href        = d.buttons.secondaryHref;
  }

  if (nums && Array.isArray(d.numbers) && d.numbers.length) {
    nums.innerHTML = d.numbers.map(n =>
      `<div class="num-item"><div class="num-val">${n.value}</div><div class="num-lbl">${n.label}</div></div>`
    ).join('');
  }
}

function renderCta(cta) {
  if (!cta) return;
  setText('#contato h2', cta.title);
  setText('#contato p', cta.sub);
  setText('#ctaButtonText', cta.buttonText);
  setHref('.cta-white', cta.buttonHref);
}

async function loadIndexData() {
  if (!document.getElementById('hero')) return;

  try {
    const data = await window.loadSiteData('index', 'data/index.json');
    if (!data) return;
    renderHero(data.hero);
    renderCta(data.cta);
  } catch (error) {
    console.warn('index data load failed', error);
  }
}

loadIndexData();

