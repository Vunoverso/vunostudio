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

// ==================== HER CAROUSEL ====================

let currentSlide = 0;
let autoplayInterval = null;
let slides = [];

function renderHeroSlide(slide) {
  if (!slide) return '';
  
  const visual = slide.visual || {};
  
  return `
    <div class="hero-slide">
      <div class="hero-content">
        <div class="hero-badge">${slide.badge || ''}</div>
        <h1>${slide.titleHtml || ''}</h1>
        <p>${slide.sub || ''}</p>
        <div class="hero-proof">
          ${(slide.proofPills || []).map(pill => `<div class="proof-pill">${pill}</div>`).join('')}
        </div>
        <div class="hero-btns">
          <a href="${slide.buttons?.primaryHref || '#'}" class="btn-primary" target="_blank">${slide.buttons?.primaryText || ''}</a>
          <a href="${slide.buttons?.secondaryHref || '#'}" class="btn-sec">${slide.buttons?.secondaryText || ''}</a>
        </div>
        <div class="hero-nums">
          ${(slide.numbers || []).map(item => `
            <div class="num-item">
              <div class="num-val">${item.value}</div>
              <div class="num-lbl">${item.label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="hero-visual">
        <div class="float-badge">${visual.floatBadge || ''}</div>
        <div class="visual-chip chip-top">${visual.topChip || ''}</div>
        <div class="visual-chip chip-bottom">${visual.bottomChip || ''}</div>
        <div class="mockup-card">
          <div class="mockup-header">
            <div class="mockup-dots">
              <div class="mockup-dot" style="background:#FF5F57"></div>
              <div class="mockup-dot" style="background:#FFBD2E"></div>
              <div class="mockup-dot" style="background:#28C840"></div>
            </div>
            <span class="mockup-label">${visual.panelLabel || ''}</span>
          </div>
          <div class="mockup-body">
            <div class="google-card">
              <div class="gc-top">
                <div class="gc-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="10" r="4" fill="#1D9E75"/>
                    <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 14 8 14s8-8.75 8-14c0-4.42-3.58-8-8-8z" fill="rgba(29,158,117,.3)"/>
                  </svg>
                </div>
                <div>
                  <div class="gc-name">${visual.businessName || ''}</div>
                  <div class="gc-addr">${visual.businessAddress || ''}</div>
                </div>
              </div>
              <div class="gc-stars">
                <span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span>
                <span class="gc-score">${visual.score || ''}</span>
              </div>
              <div class="gc-tags">
                ${(visual.tags || []).map(tag => `<span class="gc-tag">${tag}</span>`).join('')}
              </div>
            </div>
            <div class="metric-row">
              ${(visual.metrics || []).map(item => `
                <div class="metric-box">
                  <div class="metric-num">${item.number}</div>
                  <div class="metric-txt">${item.label}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-label">${visual.insightLabel || ''}</div>
          <div class="insight-title">${visual.insightTitle || ''}</div>
          <p>${visual.insightText || ''}</p>
        </div>
      </div>
    </div>
  `;
}

function renderHeroCarousel(heroData) {
  if (!heroData) return;
  
  // Suporta tanto formato antigo (objeto único) quanto novo (array de slides)
  if (Array.isArray(heroData)) {
    slides = heroData;
  } else {
    slides = [heroData]; // Converte objeto único em array
  }
  
  if (slides.length === 0) return;
  
  const slidesContainer = document.getElementById('heroSlides');
  const dotsContainer = document.getElementById('heroDots');
  
  if (!slidesContainer || !dotsContainer) return;
  
  // Renderizar slides
  slidesContainer.innerHTML = slides.map(renderHeroSlide).join('');
  
  // Renderizar dots
  dotsContainer.innerHTML = slides.map((_, idx) => 
    `<div class="hero-dot ${idx === 0 ? 'active' : ''}" data-slide="${idx}"></div>`
  ).join('');
  
  // Ativar primeiro slide
  const firstSlide = slidesContainer.querySelector('.hero-slide');
  if (firstSlide) {
    firstSlide.classList.add('active');
  }
  
  // Event listeners para dots
  dotsContainer.querySelectorAll('.hero-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      goToSlide(parseInt(dot.dataset.slide));
      startAutoplay();
    });
  });
  
  // Ocultar controles se houver apenas 1 slide
  if (slides.length <= 1) {
    dotsContainer.style.display = 'none';
  } else {
    // Iniciar autoplay
    startAutoplay();
  }
  
  // Pausar autoplay no hover
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoplay);
    heroSection.addEventListener('mouseleave', startAutoplay);
  }
}

function goToSlide(index) {
  const slidesContainer = document.getElementById('heroSlides');
  const dotsContainer = document.getElementById('heroDots');
  
  if (!slidesContainer || !dotsContainer) return;
  
  const allSlides = slidesContainer.querySelectorAll('.hero-slide');
  const allDots = dotsContainer.querySelectorAll('.hero-dot');
  
  if (index < 0 || index >= allSlides.length) return;
  
  // Remover active de todos
  allSlides.forEach(slide => slide.classList.remove('active'));
  allDots.forEach(dot => dot.classList.remove('active'));
  
  // Ativar novo slide
  allSlides[index].classList.add('active');
  allDots[index].classList.add('active');
  
  currentSlide = index;
}

function nextSlide() {
  const nextIndex = (currentSlide + 1) % slides.length;
  goToSlide(nextIndex);
}

function prevSlide() {
  const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
  goToSlide(prevIndex);
}

function startAutoplay() {
  if (slides.length <= 1) return;
  stopAutoplay();
  autoplayInterval = setInterval(nextSlide, 6000); // 6 segundos
}

function stopAutoplay() {
  if (autoplayInterval) {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
  }
}

function renderHero(hero) {
  renderHeroCarousel(hero);
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
