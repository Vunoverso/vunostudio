/* ═══════════════════════════════════════════════════════════════
   blog.js — Blog listing page
   Vuno Studio
   ═══════════════════════════════════════════════════════════════ */

// Category themes for placeholder covers
var CAT_THEMES = {
  'Presença Digital': { bg: '#071a11', accent: '#1D9E75', initial: 'P' },
  'Comunicação Visual': { bg: '#1a0e06', accent: '#E8622A', initial: 'C' },
  'Tráfego Pago': { bg: '#050d1a', accent: '#3B82F6', initial: 'T' },
  'default': { bg: '#0f0f0f', accent: '#1D9E75', initial: 'V' }
};

function getCatTheme(cat) {
  return CAT_THEMES[cat] || CAT_THEMES['default'];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function coverHtml(post, featured) {
  var theme = getCatTheme(post.category);
  if (post.cover) {
    return '<img src="' + post.cover + '" alt="' + post.title + '" loading="lazy">';
  }
  var size = featured ? '6rem' : '3.5rem';
  return '<div class="post-cover-ph" style="background:' + theme.bg + '">' +
    '<div class="post-cover-ph-initial" style="font-size:' + size + ';color:' + theme.accent + '">' + theme.initial + '</div>' +
    '<div class="post-cover-ph-label" style="color:' + theme.accent + '">' + (post.category || 'Blog') + '</div>' +
    '</div>';
}

function postUrl(post) {
  return '/blog/post?slug=' + post.slug;
}

function buildFeaturedCard(post) {
  return '<a href="' + postUrl(post) + '" class="post-featured-link reveal">' +
    '<div class="post-featured-cover">' + coverHtml(post, true) + '</div>' +
    '<div class="post-featured-body">' +
      '<span class="post-badge">' + (post.category || 'Blog') + '</span>' +
      '<h2 class="post-featured-title">' + post.title + '</h2>' +
      '<p class="post-featured-excerpt">' + post.excerpt + '</p>' +
      '<div class="post-meta">' +
        '<span>' + formatDate(post.publishedAt) + '</span>' +
        '<span class="post-meta-dot"></span>' +
        '<span>' + (post.readTime || '') + ' de leitura</span>' +
      '</div>' +
      '<div class="post-read-more">Ler artigo <span class="arrow">→</span></div>' +
    '</div>' +
  '</a>';
}

function buildPostCard(post) {
  return '<a href="' + postUrl(post) + '" class="post-card-link reveal">' +
    '<div class="post-card-cover">' + coverHtml(post, false) + '</div>' +
    '<div class="post-card-body">' +
      '<div class="post-card-cat">' + (post.category || 'Blog') + '</div>' +
      '<h3 class="post-card-title">' + post.title + '</h3>' +
      '<p class="post-card-excerpt">' + post.excerpt + '</p>' +
      '<div class="post-card-meta">' +
        '<span>' + formatDate(post.publishedAt) + '</span>' +
        '<span class="post-meta-dot"></span>' +
        '<span>' + (post.readTime || '') + '</span>' +
      '</div>' +
    '</div>' +
  '</a>';
}

function renderBlog(data) {
  var container = document.getElementById('blog-posts-container');
  if (!container) return;

  var posts = (data && data.posts) || [];

  // Sort newest first
  posts = posts.slice().sort(function(a, b) {
    return (b.publishedAt || '') > (a.publishedAt || '') ? 1 : -1;
  });

  if (!posts.length) {
    container.innerHTML =
      '<div class="blog-empty">' +
        '<h2>Em breve por aqui</h2>' +
        '<p>Estamos preparando conteúdo prático sobre presença digital<br>e comunicação visual para negócios locais.</p>' +
        '<a href="https://wa.me/55?text=Ol%C3%A1!%20Quero%20saber%20mais%20sobre%20a%20Vuno%20Studio" class="blog-empty-cta" target="_blank" rel="noopener">Falar no WhatsApp</a>' +
      '</div>';
    return;
  }

  var html = '';
  var featured = posts.find(function(p) { return p.featured; }) || posts[0];
  var rest = posts.filter(function(p) { return p !== featured; });

  html += buildFeaturedCard(featured);

  if (rest.length) {
    html += '<div class="blog-grid">';
    rest.forEach(function(post) { html += buildPostCard(post); });
    html += '</div>';
  }

  container.innerHTML = html;

  // Reveal animation
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e, i) {
      if (e.isIntersecting) {
        setTimeout(function() { e.target.classList.add('visible'); }, i * 80);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  container.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });
}

async function loadBlog() {
  try {
    var data = await window.loadSiteData('blog', 'data/blog.json');
    renderBlog(data);
  } catch (err) {
    console.warn('blog load failed', err);
    var c = document.getElementById('blog-posts-container');
    if (c) c.innerHTML = '<div class="blog-loading">Não foi possível carregar os artigos.</div>';
  }
}

loadBlog();
