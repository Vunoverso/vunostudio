function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function applyContentConfig(content) {
  document.querySelectorAll('[data-content-text]').forEach((el) => {
    const key = el.getAttribute('data-content-text');
    const value = key ? getByPath(content, key) : undefined;
    if (typeof value === 'string') el.textContent = value;
  });

  document.querySelectorAll('[data-content-href]').forEach((el) => {
    const key = el.getAttribute('data-content-href');
    const value = key ? getByPath(content, key) : undefined;
    if (typeof value === 'string') el.setAttribute('href', value);
  });
}

async function loadContentConfig() {
  try {
    const content = await window.loadSiteData('content', 'data/content.json');
    if (!content) return;
    applyContentConfig(content);
  } catch (err) {
    console.warn('content config load failed', err);
  }
}

loadContentConfig();

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Nav scroll effect
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  nav.style.boxShadow = window.scrollY > 20 ? '0 2px 20px rgba(0,0,0,.08)' : 'none';
});

// ─── PLANOS RENDERER ──────────────────────────────────────────────────────────
function renderFeatsHTML(features) {
  return features.map(function(f) {
    var check = f.ok
      ? '<span class="feat-check yes">✓</span>'
      : '<span class="feat-check no">—</span>';
    var inner = f.highlight
      ? '<span class="feat-highlight">' + f.highlight + '</span>' + (f.text || '')
      : (f.text || '');
    return '<li>' + check + '<span>' + inner + '</span></li>';
  }).join('');
}

function renderDigitalPlans(digital) {
  var wrap = document.querySelector('#cat-digital .digital-plans');
  if (wrap && digital.plans) {
    wrap.innerHTML = digital.plans.map(function(p) {
      return '<div class="plan' + (p.featured ? ' featured' : '') + '">' +
        '<div class="plan-ribbon" style="background:' + p.ribbon + '"></div>' +
        '<div class="plan-cat">' + p.cat + '</div>' +
        '<div class="plan-name">' + p.name + '</div>' +
        '<div class="plan-tagline">' + p.tagline + '</div>' +
        '<div class="price-area">' +
          '<div class="setup-tag">+ ' + p.setup + ' setup único</div>' +
          '<div class="price-row">' +
            '<div class="price-val">' + p.price + '</div>' +
            '<div class="price-mo">/mês</div>' +
          '</div>' +
        '</div>' +
        '<div class="plan-div"></div>' +
        '<ul class="feats">' + renderFeatsHTML(p.features) + '</ul>' +
        '<a href="' + p.waHref + '" class="plan-btn" target="_blank">Peça sua cotação</a>' +
      '</div>';
    }).join('');
  }

  var addonsGrid = document.querySelector('#cat-digital .addons-grid');
  if (addonsGrid && digital.addons) {
    addonsGrid.innerHTML = digital.addons.map(function(a) {
      return '<div class="addon-item">' +
        '<div><div class="addon-name">' + a.name + '</div>' +
        '<div class="addon-desc">' + a.desc + '</div></div>' +
        '<div class="addon-price">' + a.price +
          '<div class="addon-period">' + a.period + '</div>' +
        '</div></div>';
    }).join('');
  }

  if (digital.compare && digital.plans && digital.plans.length >= 3) {
    var tbody = document.querySelector('#ctw tbody');
    if (tbody) {
      tbody.innerHTML = digital.compare.map(function(row) {
        function cell(v, mid) {
          var s = mid ? ' style="background:rgba(29,158,117,.04)"' : '';
          if (v === 'yes') return '<td class="c-yes"' + s + '>✓</td>';
          if (v === 'no')  return '<td class="c-no"'  + s + '>—</td>';
          return '<td class="c-val"' + s + '>' + v + '</td>';
        }
        return '<tr><td>' + row.resource + '</td>' +
          cell(row.basico, false) + cell(row.visibilidade, true) + cell(row.autoridade, false) +
        '</tr>';
      }).join('');
    }
    var ths = document.querySelectorAll('#ctw thead th');
    if (ths.length >= 4) {
      var p = digital.plans;
      ths[1].innerHTML = p[0].name + '<br><small style="font-weight:400;opacity:.6">' + p[0].price + '/mês</small>';
      ths[2].innerHTML = p[1].name + '<br><small style="font-weight:400;opacity:.7">' + p[1].price + '/mês</small>';
      ths[3].innerHTML = p[2].name + '<br><small style="font-weight:400;opacity:.6">' + p[2].price + '/mês</small>';
    }
  }
}

function renderVisualProducts(visual) {
  var wrap = document.querySelector('#cat-visual .visual-plans');
  if (!wrap || !visual.products) return;
  wrap.innerHTML = visual.products.map(function(p) {
    var inlineUnit = p.unit.charAt(0) === '/';
    var unitInline = inlineUnit ? '<div class="vprod-unit">' + p.unit + '</div>' : '';
    var unitBlock  = !inlineUnit ? '<div class="vprod-unit" style="margin-bottom:.8rem">' + p.unit + '</div>' : '';
    return (p.premium ? '<div class="vprod premium-prod">' : '<div class="vprod">') +
      (p.premium ? '<div class="vprod-badge">Premium</div>' : '') +
      '<div class="vprod-icon">' + p.icon + '</div>' +
      '<div class="vprod-name">' + p.name + '</div>' +
      '<div class="vprod-desc">' + p.desc + '</div>' +
      '<div class="vprod-price-row"><div class="vprod-price">' + p.price + '</div>' + unitInline + '</div>' +
      unitBlock +
      '<div class="vprod-includes">' + p.includes + '</div>' +
      '<ul class="vprod-list">' + p.items.map(function(i) { return '<li>' + i + '</li>'; }).join('') + '</ul>' +
      '<a href="' + p.waHref + '" class="vprod-cta" target="_blank">Peça sua cotação</a>' +
    '</div>';
  }).join('');
}

function renderTrafPlans(trafego) {
  var wrap = document.querySelector('#cat-trafego .traf-plans');
  if (!wrap || !trafego.plans) return;
  wrap.innerHTML = trafego.plans.map(function(p) {
    return '<div class="tplan' + (p.combo ? ' combo' : '') + '">' +
      '<div class="tplan-plat" style="color:' + p.platformColor + '">' + p.platform + '</div>' +
      '<div class="tplan-name">' + p.name + '</div>' +
      '<div class="tplan-desc">' + p.desc + '</div>' +
      (p.save ? '<div class="tplan-save">' + p.save + '</div>' : '') +
      '<div class="tplan-price">' + p.price + '</div>' +
      '<div class="tplan-mo">/mês de gestão' + (p.combo ? ' total' : '') + '</div>' +
      '<div class="tplan-verba">+ verba de anúncio paga por você<br>' + p.verba + '</div>' +
      '<div class="tplan-div"></div>' +
      '<ul class="tplan-list">' + p.features.map(function(f) {
        return '<li' + (f.color ? ' style="color:' + f.color + '"' : '') + '>' + f.text + '</li>';
      }).join('') + '</ul>' +
      '<a href="' + p.waHref + '" class="tplan-btn" target="_blank">Peça sua cotação</a>' +
    '</div>';
  }).join('');
}

async function loadPlanos() {
  if (!document.querySelector('.plans-section')) return;
  try {
    var data = await window.loadSiteData('planos', 'data/planos.json');
    if (!data) return;
    renderDigitalPlans(data.digital);
    renderVisualProducts(data.visual);
    renderTrafPlans(data.trafego);
  } catch (err) {
    console.warn('planos load failed', err);
  }
}
loadPlanos();

// ─── GALERIA RENDERER ─────────────────────────────────────────────────────────
var CATEGORY_SVG = {
  acm:       '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><rect x="9" y="10" width="2" height="2"/><rect x="13" y="10" width="2" height="2"/></svg>',
  digital:   '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1"><rect x="2" y="3" width="20" height="18" rx="2"/><circle cx="12" cy="12" r="4"/></svg>',
  lona:      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1"><path d="M4 6h16v12H4z"/><path d="M8 6V4h8v2"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
  adesivo:   '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20"/></svg>',
  impresso:  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1"><rect x="5" y="3" width="14" height="18" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/></svg>',
  identidade:'<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
};

function renderGaleria(images) {
  var grid = document.querySelector('.galeria-grid');
  if (!grid || !images.galeria) return;
  grid.innerHTML = images.galeria.map(function(item) {
    var cls = 'galeria-item' + (item.layout ? ' ' + item.layout : '');
    var imgContent = item.src
      ? '<img src="' + item.src + '" alt="' + item.caption + ' — ' + item.client + '" loading="lazy">'
      : (CATEGORY_SVG[item.category] || CATEGORY_SVG.digital);
    return '<div class="' + cls + '">' +
      '<div class="galeria-img">' + imgContent + '</div>' +
      '<div class="galeria-overlay">' +
        '<div class="galeria-caption">' + item.caption +
          '<small>' + item.client + '</small>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

async function loadGaleria() {
  if (!document.querySelector('.galeria-grid')) return;
  try {
    var data = await window.loadSiteData('images', 'data/images.json');
    if (!data) return;
    renderGaleria(data);
  } catch (err) {
    console.warn('galeria load failed', err);
  }
}
loadGaleria();
