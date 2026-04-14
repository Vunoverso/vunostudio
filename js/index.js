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

  const img = document.getElementById('heroImage');
  if (img && d.heroImageSrc) img.src = d.heroImageSrc;
}

function renderCta(cta) {
  if (!cta) return;
  setText('#contato h2', cta.title);
  setText('#contato p', cta.sub);
  setText('#ctaButtonText', cta.buttonText);
  setHref('.cta-white', cta.buttonHref);
}

function _normUrl(url) {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : 'https://' + url;
}

function renderProjects(projects) {
  const carousel = document.getElementById('projCarousel');
  const dotsWrap = document.getElementById('projDots');
  if (!carousel || !Array.isArray(projects) || !projects.length) return;

  // Build cards
  carousel.innerHTML = projects.map(function(p, i) {
    var url = _normUrl(p.url);
    var domain = '';
    try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch(e) { domain = url || ''; }
    var screenshotSrc = p.image || ('https://s0.wp.com/mshots/v1/' + encodeURIComponent(url) + '?w=800&h=600');

    return '<div class="proj-slide' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '">' +
      '<div class="proj-browser-bar">' +
        '<span class="proj-browser-dot"></span>' +
        '<span class="proj-browser-dot"></span>' +
        '<span class="proj-browser-dot"></span>' +
        '<span class="proj-browser-url">' + domain + '</span>' +
      '</div>' +
      '<div class="proj-preview">' +
        '<img src="' + screenshotSrc + '" alt="' + (p.title || domain) + '"' +
          ' onload="this.classList.add(\'loaded\')"' +
          ' onerror="this.style.display=\'none\'">' +
      '</div>' +
      '<a class="proj-overlay" href="' + url + '" target="_blank" rel="noopener">' +
        '<span class="proj-overlay-name">' + (p.title || domain) + '</span>' +
        (p.tag ? '<span class="proj-overlay-tag">' + p.tag + '</span>' : '') +
      '</a>' +
    '</div>';
  }).join('');

  // Dots
  if (dotsWrap && projects.length > 1) {
    dotsWrap.innerHTML = projects.map(function(_, i) {
      return '<button class="proj-dot' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '"></button>';
    }).join('');
    dotsWrap.addEventListener('click', function(e) {
      var btn = e.target.closest('.proj-dot');
      if (btn) _goToSlide(+btn.dataset.idx);
    });
  }

  // Auto-rotate
  var _cur = 0;
  var _timer = setInterval(function() { _goToSlide((_cur + 1) % projects.length); }, 4500);

  function _goToSlide(idx) {
    _cur = idx;
    carousel.querySelectorAll('.proj-slide').forEach(function(s) {
      s.classList.toggle('active', +s.dataset.idx === idx);
    });
    if (dotsWrap) dotsWrap.querySelectorAll('.proj-dot').forEach(function(d) {
      d.classList.toggle('active', +d.dataset.idx === idx);
    });
    clearInterval(_timer);
    _timer = setInterval(function() { _goToSlide((_cur + 1) % projects.length); }, 4500);
  }
}

async function loadIndexData() {
  if (!document.getElementById('hero')) return;

  try {
    const data = await window.loadSiteData('index', 'data/index.json');
    if (!data) return;
    renderHero(data.hero);
    renderCta(data.cta);
    renderProjects(data.projects || []);
  } catch (error) {
    console.warn('index data load failed', error);
  }
}

loadIndexData();

