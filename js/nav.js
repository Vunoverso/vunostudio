/* ═══════════════════════════════════════════════════════════
   NAV COMPONENT — Vuno Studio
   Detecta a página atual e monta o menu correto.
   Importar em cada página: <script src="js/nav.js"></script>
   ═══════════════════════════════════════════════════════════ */

(function () {
  // ── Detectar página ────────────────────────────────────────
  var path = location.pathname.split('/').pop() || 'index.html';
  var page = 'index';
  if (path.indexOf('servicos') !== -1) page = 'servicos';
  else if (path.indexOf('planos') !== -1) page = 'planos';

  // ── Links por página ──────────────────────────────────────
  var navLinks = {
    index: [
      { href: 'servicos.html',        text: 'Serviços' },
      { href: 'planos.html',          text: 'Planos' },
      { href: 'servicos.html#visual', text: 'Gráfica' },
      { href: '#contato',             text: 'Contato' }
    ],
    servicos: [
      { href: '#digital',  text: 'Digital' },
      { href: '#visual',   text: 'Visual' },
      { href: 'planos.html', text: 'Planos' },
      { href: '#galeria',  text: 'Galeria' },
      { href: '#processo', text: 'Como funciona' }
    ],
    planos: [
      { href: 'index.html',           text: 'Home' },
      { href: 'servicos.html',        text: 'Serviços' },
      { href: 'servicos.html#visual', text: 'Gráfica' },
      { href: '#faq',                 text: 'Dúvidas' }
    ]
  };

  // ── CTA por página ────────────────────────────────────────
  var ctaDefaults = {
    index:    { text: 'Falar no WhatsApp', href: 'https://wa.me/55?text=Ol%C3%A1,%20quero%20saber%20mais%20sobre%20a%20Vuno%20Studio' },
    servicos: { text: 'Orçamento',         href: 'https://wa.me/55?text=Ol%C3%A1!%20Quero%20um%20or%C3%A7amento%20da%20Vuno%20Studio' },
    planos:   { text: 'Peça sua cotação',  href: 'https://wa.me/55?text=Ol%C3%A1!%20Quero%20saber%20mais%20sobre%20os%20planos' }
  };

  // ── data-content paths ────────────────────────────────────
  var ctaContentPath = {
    index:    'pages.index.navCta',
    servicos: 'pages.servicos.navCta',
    planos:   'pages.planos.navCta'
  };

  // ── Montar HTML ───────────────────────────────────────────
  var links = navLinks[page] || navLinks.index;
  var cta   = ctaDefaults[page] || ctaDefaults.index;
  var cp    = ctaContentPath[page] || ctaContentPath.index;

  var linksHTML = links.map(function (l) {
    return '<li><a href="' + l.href + '">' + l.text + '</a></li>';
  }).join('\n        ');

  var navHTML =
    '<header id="site-header">\n' +
    '  <nav id="nav">\n' +
    '    <a href="index.html" class="nav-logo">vuno<em>studio</em></a>\n' +
    '    <button class="nav-hamburger" aria-label="Abrir menu" aria-expanded="false">\n' +
    '      <span></span>\n' +
    '      <span></span>\n' +
    '      <span></span>\n' +
    '    </button>\n' +
    '    <ul class="nav-links">\n' +
    '        ' + linksHTML + '\n' +
    '    </ul>\n' +
    '    <a href="' + cta.href + '" class="nav-cta" target="_blank"' +
    ' data-content-href="' + cp + '.href"' +
    ' data-content-text="' + cp + '.text">' +
    cta.text + '</a>\n' +
    '  </nav>\n' +
    '</header>';

  // ── Injetar ───────────────────────────────────────────────
  var mount = document.getElementById('nav-mount');
  if (mount) {
    mount.outerHTML = navHTML;
  } else {
    // fallback: inserir no início do body
    document.body.insertAdjacentHTML('afterbegin', navHTML);
  }

  // ── Menu Hamburger (Mobile) ───────────────────────────────
  setTimeout(function() {
    var hamburger = document.querySelector('.nav-hamburger');
    var navLinksElement = document.querySelector('.nav-links');
    var nav = document.getElementById('nav');
    
    if (hamburger && navLinksElement) {
      hamburger.addEventListener('click', function() {
        var isOpen = hamburger.getAttribute('aria-expanded') === 'true';
        
        hamburger.setAttribute('aria-expanded', !isOpen);
        hamburger.classList.toggle('active');
        navLinksElement.classList.toggle('active');
        nav.classList.toggle('menu-open');
        
        // Bloquear scroll quando menu aberto
        document.body.style.overflow = isOpen ? '' : 'hidden';
      });
      
      // Fechar menu ao clicar em um link
      navLinksElement.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          hamburger.classList.remove('active');
          navLinksElement.classList.remove('active');
          nav.classList.remove('menu-open');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
    
    // ── Marcar link ativo ─────────────────────────────────────
    var currentPage = location.pathname.split('/').pop() || 'index.html';
    var navLinkElements = document.querySelectorAll('.nav-links a');
    
    navLinkElements.forEach(function(link) {
      var href = link.getAttribute('href');
      
      // Marca como ativo se:
      // 1. O href é igual à página atual
      // 2. Estamos na home e o link é para a home
      // 3. O link aponta para a página atual (sem #)
      if (href === currentPage || 
          (currentPage === 'index.html' && href === 'index.html') ||
          (href.indexOf(currentPage) === 0 && href.indexOf('#') === -1)) {
        link.classList.add('active');
      }
      
      // Caso especial: se estamos em servicos.html e o link é "Digital"
      if (page === 'servicos' && href === '#digital') {
        link.classList.add('active');
      }
      
      // Caso especial: se estamos em index.html e o link é para home
      if (page === 'index' && (href === '#contato' || href.indexOf('index.html') !== -1)) {
        if (href === '#contato' && location.hash === '') {
          link.classList.add('active');
        }
      }
    });
  }, 0);
})();
