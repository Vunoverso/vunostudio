/* ═══════════════════════════════════════════════════════════════
   blog-post.js — Single post reader
   Vuno Studio
   ═══════════════════════════════════════════════════════════════ */

var CAT_THEMES_POST = {
  'Presença Digital': { bg: '#071a11', accent: '#1D9E75' },
  'Comunicação Visual': { bg: '#1a0e06', accent: '#E8622A' },
  'Tráfego Pago': { bg: '#050d1a', accent: '#3B82F6' },
  'default': { bg: '#0f0f0f', accent: '#1D9E75' }
};

function getSlugFromUrl() {
  var params = new URLSearchParams(window.location.search);
  return params.get('slug') || '';
}

function formatDatePost(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function updateMeta(post) {
  // Title
  var titleEl = document.getElementById('post-seo-title');
  if (titleEl) titleEl.textContent = post.title + ' | Vuno Studio';
  document.title = post.title + ' | Vuno Studio';

  // Description
  var descEl = document.getElementById('post-seo-desc');
  if (descEl) descEl.setAttribute('content', post.excerpt || '');

  // OG image
  var ogImg = document.getElementById('post-og-image');
  if (ogImg && post.cover) ogImg.setAttribute('content', post.cover);

  // OG url / title / desc
  setOrCreate('og:url', 'property', 'https://www.vunostudio.com.br/blog/post?slug=' + post.slug);
  setOrCreate('og:title', 'property', post.title + ' | Vuno Studio');
  setOrCreate('og:description', 'property', post.excerpt || '');
  setOrCreate('twitter:title', 'name', post.title + ' | Vuno Studio');
  setOrCreate('twitter:description', 'name', post.excerpt || '');

  // Canonical
  var canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = 'https://www.vunostudio.com.br/blog/post?slug=' + post.slug;

  // Schema.org Article
  var schema = document.createElement('script');
  schema.type = 'application/ld+json';
  schema.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    datePublished: post.publishedAt || '',
    author: { '@type': 'Organization', name: post.author || 'Vuno Studio' },
    publisher: {
      '@type': 'Organization',
      name: 'Vuno Studio',
      url: 'https://www.vunostudio.com.br/'
    },
    url: 'https://www.vunostudio.com.br/blog/post?slug=' + post.slug,
    image: post.cover || 'https://www.vunostudio.com.br/og-image.svg'
  });
  document.head.appendChild(schema);
}

function setOrCreate(selector, attr, value) {
  var el = document.querySelector('meta[' + attr + '="' + selector + '"]');
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, selector); document.head.appendChild(el); }
  el.setAttribute('content', value);
}

function renderPost(post) {
  var theme = CAT_THEMES_POST[post.category] || CAT_THEMES_POST['default'];

  var badgeStyle = post.category === 'Comunicação Visual'
    ? 'post-badge post-badge-orange'
    : 'post-badge';

  var coverSection = '';
  if (post.cover) {
    coverSection = '<div class="post-cover-wrap"><img src="' + post.cover + '" alt="' + post.title + '"></div>';
  }

  var html =
    '<section class="post-header" style="background:' + theme.bg + '">' +
      '<div class="post-header-grid"></div>' +
      '<div class="post-header-inner">' +
        '<a href="/blog" class="post-back"><span class="post-back-arrow">←</span> Todos os artigos</a>' +
        '<div class="post-header-top">' +
          '<span class="' + badgeStyle + '">' + (post.category || 'Blog') + '</span>' +
          '<div class="post-header-meta">' +
            '<span>' + formatDatePost(post.publishedAt) + '</span>' +
            (post.readTime ? '<span class="dot"></span><span>' + post.readTime + ' de leitura</span>' : '') +
          '</div>' +
        '</div>' +
        '<h1 class="post-header-title">' + post.title + '</h1>' +
        (post.excerpt ? '<p class="post-header-excerpt">' + post.excerpt + '</p>' : '') +
      '</div>' +
    '</section>' +

    coverSection +

    '<div class="post-body-wrap">' +
      '<div class="post-body">' + (post.content || '') + '</div>' +
    '</div>' +

    '<section class="post-cta">' +
      '<div class="post-cta-inner">' +
        '<div class="post-cta-label">Quer resultado assim?</div>' +
        '<h2>Vamos aplicar isso<br>no seu negócio</h2>' +
        '<p>Na Vuno Studio cuidamos da sua presença digital e visual de ponta a ponta. Fale com a gente — o diagnóstico é gratuito.</p>' +
        '<a href="https://wa.me/55?text=Ol%C3%A1!%20Li%20o%20blog%20e%20quero%20saber%20mais%20sobre%20a%20Vuno%20Studio" class="post-cta-btn" target="_blank" rel="noopener">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.54 2 2.07 6.46 2.07 11.95c0 1.76.46 3.48 1.33 5L2 22l5.18-1.36a9.9 9.9 0 0 0 4.84 1.23h.01c5.49 0 9.96-4.46 9.96-9.95 0-2.66-1.03-5.16-2.94-7.01Zm-7.02 15.28h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.08.81.82-3-.2-.31a8.26 8.26 0 0 1-1.28-4.39c0-4.58 3.73-8.31 8.32-8.31 2.22 0 4.31.86 5.88 2.44a8.24 8.24 0 0 1 2.43 5.87c0 4.58-3.73 8.31-8.35 8.31Zm4.56-6.23c-.25-.13-1.47-.73-1.7-.81-.23-.09-.39-.13-.56.12-.17.25-.64.81-.79.98-.14.17-.29.19-.54.07-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.39.11-.52.12-.12.25-.29.37-.43.12-.14.16-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.77-1.84-.2-.47-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.06 0 1.22.89 2.39 1.01 2.56.12.16 1.75 2.68 4.24 3.76.59.26 1.06.42 1.42.54.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.22-.16-.47-.29Z"/></svg>' +
          'Falar no WhatsApp' +
        '</a>' +
      '</div>' +
    '</section>';

  var contentEl = document.getElementById('post-content');
  var loadingEl = document.getElementById('post-loading');
  if (contentEl) { contentEl.innerHTML = html; contentEl.style.display = ''; }
  if (loadingEl) loadingEl.style.display = 'none';

  updateMeta(post);
}

function renderNotFound() {
  var contentEl = document.getElementById('post-content');
  var loadingEl = document.getElementById('post-loading');
  if (loadingEl) loadingEl.style.display = 'none';
  if (contentEl) {
    contentEl.innerHTML =
      '<div class="post-not-found">' +
        '<h1>Artigo não encontrado</h1>' +
        '<p>O artigo que você procura não existe ou foi removido.</p>' +
        '<a href="/blog">← Ver todos os artigos</a>' +
      '</div>';
    contentEl.style.display = '';
  }
  document.title = 'Artigo não encontrado | Vuno Studio';
}

async function loadPost() {
  var slug = getSlugFromUrl();
  if (!slug) { renderNotFound(); return; }

  try {
    var data = await window.loadSiteData('blog', '../data/blog.json');
    if (!data || !data.posts) { renderNotFound(); return; }
    var post = data.posts.find(function(p) { return p.slug === slug; });
    if (!post) { renderNotFound(); return; }
    renderPost(post);
  } catch (err) {
    console.warn('blog post load failed', err);
    renderNotFound();
  }
}

loadPost();
