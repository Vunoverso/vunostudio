// Planos.js - Renderização dinâmica de planos e gerenciamento de interatividade

let planosData = null;

// Carregar dados
async function loadPlanosData() {
  try {
    planosData = await window.loadSiteData('planos', 'data/planos.json');
    if (!planosData) return;
    renderPlans();
  } catch (error) {
    console.error('Erro ao carregar planos:', error);
  }
}

// ==================== RENDERIZAÇÃO ====================

function renderPlans() {
  renderDigitalPlans();
  renderVisualProducts();
  renderTrafficPlans();
  renderFaq();
  setupEventListeners();
  handleDeepLink();
}

// ─── DIGITAL PLANS ───
function renderDigitalPlans() {
  const digitalData = planosData.digital;
  const plansWrap = document.querySelector('#cat-digital .digital-plans');
  
  if (!plansWrap) return;
  
  plansWrap.innerHTML = digitalData.plans.map(plan => `
    <div class="plan ${plan.featured ? 'featured' : ''}">
      <div class="plan-ribbon" style="background:${plan.ribbon}"></div>
      <div class="plan-cat">${plan.cat}</div>
      <div class="plan-name">${plan.name}</div>
      <div class="plan-tagline">${plan.tagline}</div>
      <div class="price-area">
        <div class="setup-tag">+ R$ ${plan.setup.toLocaleString('pt-BR')} setup único</div>
        <div class="price-row">
          <div class="price-val">R$ ${plan.price.toLocaleString('pt-BR')}</div>
          <div class="price-mo">/mês</div>
        </div>
      </div>
      <div class="plan-div"></div>
      <ul class="feats">
        ${plan.features.map(feat => `
          <li>
            <span class="feat-check ${feat.ok ? 'yes' : 'no'}">${feat.ok ? '✓' : '—'}</span>
            <span>${feat.highlight ? `<span class="feat-highlight">${feat.highlight}</span>` : ''}${feat.text || ''}</span>
          </li>
        `).join('')}
      </ul>
      <a href="https://wa.me/55?text=Quero%20cotação%20do%20plano%20${encodeURIComponent(plan.name)}" class="plan-btn" target="_blank" rel="noopener">Peça sua cotação</a>
    </div>
  `).join('');
  
  renderAddons();
  renderCompareTable(digitalData);
}

function renderAddons() {
  const addonsData = planosData.digital.addons;
  let addonsContainer = document.querySelector('#cat-digital [style*="margin-top:2.5rem"]');
  
  // Se não existe, criar
  if (!addonsContainer) {
    const digitalWrap = document.querySelector('#cat-digital');
    addonsContainer = document.createElement('div');
    addonsContainer.style.marginTop = '2.5rem';
    digitalWrap.appendChild(addonsContainer);
  }
  
  const addonsHtml = `
    <div class="reveal">
      <div class="addons-label">Serviços adicionais — adicione ao seu plano</div>
      <div class="addons-grid">
        ${addonsData.map(addon => `
          <div class="addon-item">
            <div><div class="addon-name">${addon.name}</div><div class="addon-desc">${addon.desc}</div></div>
            <div class="addon-price">+ R$ ${addon.price.toLocaleString('pt-BR')}<div class="addon-period">${addon.period}</div></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  addonsContainer.innerHTML = addonsHtml;
}

function renderCompareTable(digitalData) {
  let compareWrap = document.querySelector('#cat-digital [style*="margin-top:2rem"]:last-of-type');
  
  // Se não existe, criar
  if (!compareWrap) {
    compareWrap = document.createElement('div');
    compareWrap.style.marginTop = '2rem';
    document.querySelector('#cat-digital').appendChild(compareWrap);
  }
  
  const headers = ['Básico', 'Visibilidade', 'Autoridade'];
  const prices = ['R$ 297/mês', 'R$ 497/mês', 'R$ 700/mês'];
  
  const tableHtml = `
    <div class="reveal">
      <div class="compare-toggle">
        <span>Ver comparativo completo dos planos</span>
        <span class="compare-arrow" id="carr">▼</span>
      </div>
      <div class="compare-table-wrap" id="ctw">
        <table class="compare-table">
          <thead><tr><th>Recurso</th><th style="text-align:center">${headers[0]}<br><small style="font-weight:400;opacity:.6">${prices[0]}</small></th><th style="text-align:center;background:var(--greenl)">${headers[1]}<br><small style="font-weight:400;opacity:.7">${prices[1]}</small></th><th style="text-align:center">${headers[2]}<br><small style="font-weight:400;opacity:.6">${prices[2]}</small></th></tr></thead>
          <tbody>
            ${digitalData.compare.map(row => `
              <tr>
                <td>${row.resource}</td>
                <td class="c-${row.basico === 'yes' || row.basico === 'no' ? row.basico : 'val'}">${row.basico}</td>
                <td class="c-${row.visibilidade === 'yes' || row.visibilidade === 'no' ? row.visibilidade : 'val'}" style="background:rgba(29,158,117,.04)">${row.visibilidade}</td>
                <td class="c-${row.autoridade === 'yes' || row.autoridade === 'no' ? row.autoridade : 'val'}">${row.autoridade}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  compareWrap.innerHTML = tableHtml;
  
  // Re-attach toggle listener
  const toggle = compareWrap.querySelector('.compare-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => toggleCompare(toggle));
  }
}

// ─── VISUAL PRODUCTS ───
function renderVisualProducts() {
  const visualData = planosData.visual.products;
  const visualWrap = document.querySelector('#cat-visual .visual-plans');
  
  if (!visualWrap) return;
  
  visualWrap.innerHTML = visualData.map(prod => `
    <div class="vprod ${prod.premium ? 'premium-prod' : ''}">
      ${prod.premium ? '<div class="vprod-badge">Premium</div>' : ''}
      <div class="vprod-icon" aria-hidden="true">${prod.icon}</div>
      <div class="vprod-name">${prod.name}</div>
      <div class="vprod-desc">${prod.desc}</div>
      <div class="vprod-price-row"><div class="vprod-price">${prod.price}</div>${prod.unit ? `<div class="vprod-unit">${prod.unit}</div>` : ''}</div>
      <div class="vprod-includes">${prod.includes}</div>
      <ul class="vprod-list">
        ${prod.items.map(item => `<li>${item}</li>`).join('')}
      </ul>
      <a href="https://wa.me/55?text=Quero%20cotação%20de%20${encodeURIComponent(prod.name)}" class="vprod-cta" target="_blank" rel="noopener">Peça sua cotação</a>
    </div>
  `).join('');
}

// ─── TRAFFIC PLANS ───
function renderTrafficPlans() {
  const trafData = planosData.trafego;
  
  // Plans
  const trafficPlansWrap = document.querySelector('#cat-trafego .traf-plans');
  if (trafficPlansWrap) {
    trafficPlansWrap.innerHTML = trafData.plans.map(plan => `
      <div class="tplan ${plan.combo ? 'combo' : ''}">
        <div class="tplan-plat" style="color:${plan.platformColor}">${plan.platform}</div>
        <div class="tplan-name">${plan.name}</div>
        <div class="tplan-desc">${plan.desc}</div>
        ${plan.save ? `<div class="tplan-save">${plan.save}</div>` : ''}
        <div class="tplan-price">R$ ${plan.price.toLocaleString('pt-BR')}</div>
        <div class="tplan-mo">/mês de gestão${plan.combo ? ' total' : ''}</div>
        <div class="tplan-verba">+ verba de anúncio paga por você<br>${plan.verba}</div>
        <div class="tplan-div"></div>
        <ul class="tplan-list">
          ${plan.features.map(feat => `
            <li ${feat.color ? `style="color:${feat.color}"` : ''}>${feat.text}</li>
          `).join('')}
        </ul>
        <a href="https://wa.me/55?text=Quero%20cotação%20de%20${encodeURIComponent(plan.name)}" class="tplan-btn" target="_blank" rel="noopener">Peça sua cotação</a>
      </div>
    `).join('');
  }
  
  // Info boxes
  let infoBoxesWrap = document.querySelector('#cat-trafego .info-boxes');
  if (!infoBoxesWrap) {
    const container = document.querySelector('#cat-trafego');
    if (container) {
      const wrapper = document.createElement('div');
      wrapper.style.marginTop = '2rem';
      wrapper.className = 'reveal';
      wrapper.innerHTML = '<div class="info-boxes"></div>';
      container.appendChild(wrapper);
      infoBoxesWrap = wrapper.querySelector('.info-boxes');
    }
  }
  
  if (infoBoxesWrap) {
    infoBoxesWrap.innerHTML = trafData.infoBoxes.map((box, idx) => `
      <div class="info-box" ${idx > 0 ? 'style="border-left:1px solid var(--border)"' : ''}>
        <div class="info-box-label">${box.label}</div>
        <div class="info-box-title">${box.title}</div>
        <div class="info-box-desc">${box.desc}</div>
      </div>
    `).join('');
  }
}

// ─── FAQ ───
function renderFaq() {
  const faqData = planosData.faq;
  const faqContainer = document.querySelector('.faq-section .faq-inner');
  
  if (!faqContainer) return;
  
  const faqHtml = `
    <h2 class="faq-title reveal">Perguntas frequentes</h2>
    ${faqData.map(item => `
      <div class="faq-item reveal">
        <div class="faq-q" role="button" tabindex="0" aria-expanded="false"><span>${item.q}</span><em class="faq-icon" aria-hidden="true">+</em></div>
        <div class="faq-a"><div class="faq-a-inner">${item.a}</div></div>
      </div>
    `).join('')}
  `;
  
  faqContainer.innerHTML = faqHtml;
  
  // Attach event listeners
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', faqClickHandler);
    q.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        faqClickHandler.call(q);
      }
    });
  });
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Tabs
  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach((tab, index) => {
    tab.removeEventListener('click', handleTabClick);
    tab.addEventListener('click', handleTabClick);
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', index === 0);
  });
}

const handleTabClick = function(e) {
  const categories = ['digital', 'visual', 'trafego'];
  const tabs = document.querySelectorAll('.cat-tab');
  const index = Array.from(tabs).indexOf(e.currentTarget);
  if (index === -1 || index >= categories.length) return;
  
  showCat(categories[index], e.currentTarget);
  
  // Update aria-selected
  tabs.forEach((t, i) => {
    t.setAttribute('aria-selected', i === index);
  });
};

function faqClickHandler(e) {
  const btn = this;
  toggleFaq(btn);
}

// ==================== INTERACTION FUNCTIONS ====================

function showCat(id, btn) {
  document.querySelectorAll('.plans-wrap').forEach(w => w.classList.remove('on'));
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('on'));
  const el = document.getElementById('cat-' + id);
  if (el) {
    el.classList.add('on');
    btn.classList.add('on');
    window.history.pushState(null, '', '#' + id);
  }
}

function toggleFaq(el) {
  const item = el.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) {
    item.classList.add('open');
    el.setAttribute('aria-expanded', 'true');
  } else {
    el.setAttribute('aria-expanded', 'false');
  }
}

function toggleCompare(el) {
  const wrap = document.getElementById('ctw');
  const arr = document.getElementById('carr');
  if (!wrap || !arr) return;
  const isOpen = wrap.classList.contains('open');
  wrap.classList.toggle('open', !isOpen);
  arr.classList.toggle('open', !isOpen);
}

// ==================== DEEP LINKING ===========================

function handleDeepLink() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;
  
  const categories = ['digital', 'visual', 'trafego'];
  const index = categories.indexOf(hash);
  
  if (index === -1) return;
  
  document.querySelectorAll('.plans-wrap').forEach(w => w.classList.remove('on'));
  document.querySelectorAll('.cat-tab').forEach((t, i) => {
    t.classList.remove('on');
    t.setAttribute('aria-selected', i === index);
  });
  
  const el = document.getElementById('cat-' + hash);
  if (el) {
    el.classList.add('on');
    const tabs = document.querySelectorAll('.cat-tab');
    if (tabs[index]) tabs[index].classList.add('on');
  }
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', loadPlanosData);
