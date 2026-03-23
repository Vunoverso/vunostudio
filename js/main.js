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

function setMetaByName(name, content) {
  if (!content) return;
  const el = document.querySelector('meta[name="' + name + '"]');
  if (el) el.setAttribute('content', content);
}

function setMetaByProperty(prop, content) {
  if (!content) return;
  const el = document.querySelector('meta[property="' + prop + '"]');
  if (el) el.setAttribute('content', content);
}

function getCurrentPageKey() {
  const page = document.body && document.body.dataset ? document.body.dataset.page : '';
  if (page) return page;

  const path = (location.pathname || '').toLowerCase();
  if (path.endsWith('/servicos.html')) return 'servicos';
  if (path.endsWith('/planos.html')) return 'planos';
  return 'index';
}

function applySeoConfig(config) {
  const seo = config && config.seo;
  if (!seo) return;

  const pageKey = getCurrentPageKey();
  const pageSeo = seo.pages && seo.pages[pageKey] ? seo.pages[pageKey] : null;
  if (!pageSeo) return;

  if (pageSeo.title) {
    document.title = pageSeo.title;
    setMetaByProperty('og:title', pageSeo.title);
    setMetaByName('twitter:title', pageSeo.title);
  }
  if (pageSeo.description) {
    setMetaByName('description', pageSeo.description);
    setMetaByProperty('og:description', pageSeo.description);
    setMetaByName('twitter:description', pageSeo.description);
  }
  if (pageSeo.keywords) {
    setMetaByName('keywords', pageSeo.keywords);
  }
  if (seo.ogImage) {
    setMetaByProperty('og:image', seo.ogImage);
    setMetaByName('twitter:image', seo.ogImage);
  }
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

async function loadSeoConfig() {
  try {
    const config = await window.loadSiteData('config', 'data/config.json');
    if (!config) return;
    applySeoConfig(config);
  } catch (err) {
    console.warn('seo config load failed', err);
  }
}

loadSeoConfig();

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
