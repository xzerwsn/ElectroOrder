/* =============================================
   DATA — MOCK DATA (Russian)
   ============================================= */
const ORDERS = [
  { id:'#ORD-1847', client:'Михаил Воронов',    product:'iPhone 15 Pro Max 256GB',        amount:134990, status:'delivered', date:'04.05.2026' },
  { id:'#ORD-1846', client:'Анна Соколова',     product:'Samsung Galaxy S24 Ultra',       amount:119990, status:'processing',date:'04.05.2026' },
  { id:'#ORD-1845', client:'Дмитрий Петров',    product:'MacBook Air M3 15"',             amount:189990, status:'new',       date:'03.05.2026' },
  { id:'#ORD-1844', client:'Елена Морозова',    product:'AirPods Pro 2-го поколения',     amount:22990,  status:'delivered', date:'03.05.2026' },
  { id:'#ORD-1843', client:'Сергей Козлов',     product:'Sony WH-1000XM5',               amount:31990,  status:'processing',date:'03.05.2026' },
  { id:'#ORD-1842', client:'Ольга Новикова',    product:'iPad Pro 12.9" M4 WiFi 256GB',  amount:114990, status:'cancelled', date:'02.05.2026' },
  { id:'#ORD-1841', client:'Иван Лебедев',      product:'Samsung 65" QLED 4K',           amount:159900, status:'delivered', date:'02.05.2026' },
  { id:'#ORD-1840', client:'Татьяна Федорова',  product:'Xiaomi 14 Ultra 512GB',         amount:94990,  status:'new',       date:'01.05.2026' },
  { id:'#ORD-1839', client:'Андрей Смирнов',    product:'PlayStation 5 Slim',            amount:54990,  status:'processing',date:'01.05.2026' },
  { id:'#ORD-1838', client:'Марина Попова',     product:'Dyson V15 Detect',              amount:64990,  status:'delivered', date:'30.04.2026' },
  { id:'#ORD-1837', client:'Алексей Горбунов',  product:'Ноутбук ASUS ROG Flow Z13',    amount:149990, status:'new',       date:'30.04.2026' },
  { id:'#ORD-1836', client:'Наталья Волкова',   product:'Canon EOS R6 Mark II Body',     amount:'189900',status:'cancelled',date:'29.04.2026' },
  { id:'#ORD-1835', client:'Кирилл Орлов',      product:'Huawei MateBook X Pro 14',     amount:139990, status:'delivered', date:'29.04.2026' },
  { id:'#ORD-1834', client:'Светлана Зайцева',  product:'Honor Magic V2 512GB',          amount:89990,  status:'processing',date:'28.04.2026' },
  { id:'#ORD-1833', client:'Павел Беляев',      product:'Realme GT 6 Pro 256GB',         amount:44990,  status:'delivered', date:'28.04.2026' },
];

const STATUS_LABELS = {
  new:'Новый', processing:'В обработке', delivered:'Доставлен', cancelled:'Отменён'
};
const STATUS_PULSE = { processing: true, new: false, delivered: false, cancelled: false };

const CAMPAIGNS = [
  { id:1, title:'Весенняя распродажа смартфонов', platform:'ВКонтакте', status:'active',
    reach:124500, clicks:8320, budget:50000, spent:41200, ctr:6.68, roas:4.1 },
  { id:2, title:'Акция: MacBook + iPad', platform:'MyTarget',status:'active',
    reach:87300, clicks:5140, budget:35000, spent:28900, ctr:5.89, roas:3.8 },
  { id:3, title:'Промо наушников Sony', platform:'Telegram Ads',status:'paused',
    reach:43200, clicks:2180, budget:20000, spent:14500, ctr:5.05, roas:2.9 },
  { id:4, title:'Ретаргетинг: брошенные корзины', platform:'ВКонтакте',status:'active',
    reach:31800, clicks:2840, budget:15000, spent:12100, ctr:8.93, roas:6.2 },
  { id:5, title:'Лето с техникой Samsung', platform:'MyTarget',status:'paused',
    reach:67000, clicks:3210, budget:30000, spent:18600, ctr:4.79, roas:2.3 },
  { id:6, title:'PlayStation 5 — новое поколение', platform:'VK', status:'ended',
    reach:156000, clicks:7800, budget:40000, spent:39800, ctr:5.0, roas:3.5 },
];

const CHART_DATA = [
  {label:'Пн', val:0.62},{label:'Вт', val:0.78},{label:'Ср', val:0.55},
  {label:'Чт', val:0.91},{label:'Пт', val:0.83},{label:'Сб', val:0.47},
  {label:'Вс', val:0.39},
];

const LINE_DATA = [2.1,2.8,2.4,3.1,2.9,3.6,3.2,3.8,4.1,3.7,4.4,3.85];
const LINE_LABELS = ['Июн','Июл','Авг','Сен','Окт','Ноя','Дек','Янв','Фев','Мар','Апр','Май'];

const TOP_PRODUCTS = [
  { name:'iPhone 15 Pro Max', sales:142, revenue:'₽19.2M', change:+12 },
  { name:'MacBook Air M3', sales:87, revenue:'₽16.5M', change:+8 },
  { name:'Samsung Galaxy S24', sales:213, revenue:'₽25.6M', change:-3 },
  { name:'Sony WH-1000XM5', sales:308, revenue:'₽9.9M', change:+21 },
  { name:'iPad Pro M4', sales:96, revenue:'₽11.0M', change:+5 },
];

const TRAFFIC = [
  { src:'ВКонтакте Ads', pct:38, color:'#4da6ff' },
  { src:'Органический поиск', pct:28, color:'#22d3ee' },
  { src:'MyTarget', pct:19, color:'#34d399' },
  { src:'Прямые переходы', pct:11, color:'#fbbf24' },
  { src:'Прочее', pct:4, color:'#f87171' },
];

const DONUT_DATA = [
  { label:'Доставлено', val:47, color:'#34d399' },
  { label:'В обработке', val:28, color:'#fbbf24' },
  { label:'Новые',       val:18, color:'#4da6ff' },
  { label:'Отменены',    val:7,  color:'#f87171' },
];

/* =============================================
   THEME MANAGEMENT
   ============================================= */
let currentTheme = localStorage.getItem('eopTheme') || 'dark';
const sunIcon = `<circle cx="9" cy="9" r="3.5"/><path d="M9 1.5V3M9 15v1.5M1.5 9H3M15 9h1.5M3.7 3.7l1 1M13.3 13.3l1 1M3.7 14.3l1-1M13.3 4.7l1-1"/>`;
const moonIcon = `<path d="M14 9.6A6.5 6.5 0 119.4 3a5 5 0 004.6 6.6z"/>`;
const systemIcon = `<rect x="2" y="3" width="12" height="9" rx="1.5"/><path d="M9 12v2M6 14h4M6 6h4M6 8.5h2.5"/>`;

function applyTheme(theme) {
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  let resolved = theme;
  if(theme === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  html.setAttribute('data-theme', resolved);
  /* Update icon */
  if(theme === 'dark')   icon.innerHTML = moonIcon;
  else if(theme === 'light') icon.innerHTML = sunIcon;
  else                   icon.innerHTML = systemIcon;
  /* Update settings page chips */
  ['dark','light','system'].forEach(t => {
    const btn = document.getElementById('theme-btn-'+t);
    if(btn) btn.classList.toggle('active', t === theme);
  });
}

function cycleTheme() {
  const order = ['dark','light','system'];
  const idx = order.indexOf(currentTheme);
  currentTheme = order[(idx+1)%3];
  localStorage.setItem('eopTheme', currentTheme);
  /* Spin animation */
  const btn = document.getElementById('themeToggle');
  btn.classList.add('spinning');
  btn.addEventListener('animationend', () => btn.classList.remove('spinning'), {once:true});
  applyTheme(currentTheme);
  showToast('info', 'Тема изменена', currentTheme==='dark'?'Тёмная тема активна':currentTheme==='light'?'Светлая тема активна':'Системная тема');
}

function setTheme(theme, btn) {
  currentTheme = theme;
  localStorage.setItem('eopTheme', theme);
  applyTheme(theme);
}

/* =============================================
   NAVIGATION
   ============================================= */
const PAGE_TITLES = {
  dashboard:'Дашборд', orders:'Управление заказами',
  ads:'Рекламные кампании', analytics:'Аналитика',
  products:'Каталог товаров', settings:'Настройки'
};

function navigateTo(page) {
  /* Deactivate all pages */
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  /* Activate target */
  const section = document.getElementById('page-' + page);
  if(!section) return;
  section.classList.add('active');
  section.classList.add('page-enter');
  section.addEventListener('animationend', () => section.classList.remove('page-enter'), {once:true});

  /* Update nav item */
  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if(navItem) navItem.classList.add('active');

  /* Update topbar title */
  document.getElementById('topbarTitle').textContent = PAGE_TITLES[page] || page;

  /* Run page-specific init */
  if(page === 'analytics') initAnalytics();
  if(page === 'ads') setTimeout(initProgressBars, 300);
}

document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', () => navigateTo(item.dataset.page));
});

/* =============================================
   RENDER ORDERS TABLE
   ============================================= */
function renderOrderRow(order) {
  const pulse = STATUS_PULSE[order.status] ? 'pulse' : '';
  const amount = typeof order.amount === 'number' ? '₽'+order.amount.toLocaleString('ru') : '₽'+order.amount;
  return `
    <tr class="status-${order.status}" onclick="openOrderModal('${order.id}')">
      <td>${order.id}</td>
      <td>${order.client}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${order.product}</td>
      <td class="amount-cell">${amount}</td>
      <td><span class="status-badge status-${order.status}"><div class="status-dot ${pulse}"></div>${STATUS_LABELS[order.status]}</span></td>
      <td>${order.date}</td>
    </tr>`;
}

function renderOrderRowFull(order) {
  const pulse = STATUS_PULSE[order.status] ? 'pulse' : '';
  const amount = typeof order.amount === 'number' ? '₽'+order.amount.toLocaleString('ru') : '₽'+order.amount;
  return `
    <tr class="status-${order.status}" onclick="openOrderModal('${order.id}')">
      <td><label class="checkbox-wrap" style="padding:0"><input type="checkbox" class="checkbox-input row-checkbox"><div class="checkbox-box"><svg class="checkbox-check" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg></div></label></td>
      <td>${order.id}</td>
      <td>${order.client}</td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${order.product}</td>
      <td class="amount-cell">${amount}</td>
      <td><span class="status-badge status-${order.status}"><div class="status-dot ${pulse}"></div>${STATUS_LABELS[order.status]}</span></td>
      <td>${order.date}</td>
      <td><div class="actions-row">
        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openOrderModal('${order.id}')">Детали</button>
        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();showToast('info','Редактирование','Редактируем ${order.id}')">Ред.</button>
      </div></td>
    </tr>`;
}

function initOrdersTables() {
  const dashTbl = document.getElementById('dashboardOrdersTable');
  const ordersTbl = document.getElementById('ordersTable');
  if(dashTbl) dashTbl.innerHTML = ORDERS.slice(0,6).map(renderOrderRow).join('');
  if(ordersTbl) ordersTbl.innerHTML = ORDERS.map(renderOrderRowFull).join('');
}

let currentFilter = 'all';
function filterStatus(status, btn) {
  currentFilter = status;
  document.querySelectorAll('#page-orders .filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderFilteredOrders();
}
function filterOrders(query) {
  renderFilteredOrders(query);
}
function renderFilteredOrders(query) {
  const q = (query || document.getElementById('ordersSearch')?.value || '').toLowerCase();
  const tbl = document.getElementById('ordersTable');
  if(!tbl) return;
  const filtered = ORDERS.filter(o => {
    const matchStatus = currentFilter === 'all' || o.status === currentFilter;
    const matchQuery = !q || o.id.toLowerCase().includes(q) || o.client.toLowerCase().includes(q) || o.product.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });
  tbl.innerHTML = filtered.length ? filtered.map(renderOrderRowFull).join('') :
    `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-tertiary)">Заказы не найдены</td></tr>`;
}

function toggleSelectAll(cb) {
  document.querySelectorAll('.row-checkbox').forEach(c => { c.checked = cb.checked; });
}

/* =============================================
   SORT TABLE
   ============================================= */
let sortState = { col: null, asc: true };
function sortTable(th, col) {
  if(sortState.col === col) sortState.asc = !sortState.asc;
  else { sortState.col = col; sortState.asc = true; }
  document.querySelectorAll('.sort-icon').forEach(i => { i.classList.remove('asc','desc'); });
  const icon = th.querySelector('.sort-icon');
  if(icon) icon.classList.add(sortState.asc ? 'asc' : 'desc');
}

/* =============================================
   BAR CHART
   ============================================= */
function initBarChart() {
  const container = document.getElementById('barChart');
  if(!container) return;
  const existing = container.querySelectorAll('.chart-bar-wrap');
  if(existing.length) return;
  CHART_DATA.forEach((d, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'chart-bar-wrap';
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = (d.val * 100) + '%';
    bar.style.animationDelay = (i * 80) + 'ms';
    const lbl = document.createElement('span');
    lbl.className = 'label';
    lbl.textContent = d.label;
    wrap.appendChild(bar);
    wrap.appendChild(lbl);
    container.appendChild(wrap);
  });
}

function animateBarChart() {
  document.querySelectorAll('.chart-bar').forEach(bar => {
    bar.classList.add('animated');
  });
}

/* =============================================
   DONUT CHART
   ============================================= */
function initDonutChart() {
  const svg = document.getElementById('donutSvg');
  const legend = document.getElementById('donutLegend');
  if(!svg || svg.querySelector('circle.donut-segment')) return;

  const cx = 60, cy = 60, r = 40, stroke = 14;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  /* Background circle */
  const bg = document.createElementNS('http://www.w3.org/2000/svg','circle');
  bg.setAttribute('cx', cx); bg.setAttribute('cy', cy);
  bg.setAttribute('r', r);
  bg.setAttribute('fill','none');
  bg.setAttribute('stroke','var(--bg-overlay)');
  bg.setAttribute('stroke-width', stroke);
  svg.appendChild(bg);

  const total = DONUT_DATA.reduce((s,d)=>s+d.val,0);
  DONUT_DATA.forEach((d,i) => {
    const dashLen = (d.val/total)*circumference;
    const targetOffset = circumference - dashLen - (offset/total)*circumference;

    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('cx',cx); circle.setAttribute('cy',cy);
    circle.setAttribute('r',r); circle.setAttribute('fill','none');
    circle.setAttribute('stroke',d.color); circle.setAttribute('stroke-width',stroke);
    circle.setAttribute('stroke-dasharray', `${dashLen} ${circumference-dashLen}`);
    circle.setAttribute('stroke-dashoffset', circumference - (offset/total)*circumference);
    circle.setAttribute('stroke-linecap','round');
    circle.style.transform = 'rotate(-90deg)';
    circle.style.transformOrigin = '60px 60px';
    circle.className.baseVal = 'donut-segment';
    circle.style.setProperty('--target-offset', targetOffset);
    svg.appendChild(circle);
    offset += d.val;
  });

  /* Center text */
  const t1 = document.createElementNS('http://www.w3.org/2000/svg','text');
  t1.setAttribute('x',cx); t1.setAttribute('y',cy-2);
  t1.setAttribute('text-anchor','middle'); t1.setAttribute('dominant-baseline','middle');
  t1.className.baseVal = 'donut-center-text'; t1.textContent = '1 847';
  svg.appendChild(t1);

  const t2 = document.createElementNS('http://www.w3.org/2000/svg','text');
  t2.setAttribute('x',cx); t2.setAttribute('y',cy+12);
  t2.setAttribute('text-anchor','middle');
  t2.className.baseVal = 'donut-center-sub'; t2.textContent = 'заказов';
  svg.appendChild(t2);

  /* Legend */
  if(legend) {
    legend.innerHTML = DONUT_DATA.map(d => `
      <div class="legend-item">
        <div class="legend-dot" style="background:${d.color}"></div>
        <span class="legend-label">${d.label}</span>
        <span class="legend-val">${d.val}%</span>
      </div>`).join('');
  }
}

function animateDonut() {
  document.querySelectorAll('.donut-segment').forEach((seg, i) => {
    seg.style.animationDelay = (i * 150) + 'ms';
    seg.classList.add('animated');
  });
}

/* =============================================
   CAMPAIGNS GRID
   ============================================= */
function initCampaigns() {
  const grid = document.getElementById('campaignsGrid');
  if(!grid || grid.children.length) return;
  grid.innerHTML = CAMPAIGNS.map(c => {
    const statusLabel = {active:'Активна',paused:'Пауза',ended:'Завершена'}[c.status];
    const progress = Math.round((c.spent/c.budget)*100);
    return `
    <div class="card campaign-card" onclick="openCampaignModal(${c.id})">
      <div class="campaign-header">
        <div>
          <div class="campaign-title">${c.title}</div>
          <div class="campaign-platform">${c.platform} · ${statusLabel}</div>
        </div>
        <div class="campaign-status-indicator ${c.status}"></div>
      </div>
      <div class="campaign-metrics">
        <div class="camp-metric"><div class="camp-metric-label">Охват</div><div class="camp-metric-val">${(c.reach/1000).toFixed(1)}K</div></div>
        <div class="camp-metric"><div class="camp-metric-label">CTR</div><div class="camp-metric-val">${c.ctr}%</div></div>
        <div class="camp-metric"><div class="camp-metric-label">Клики</div><div class="camp-metric-val">${c.clicks.toLocaleString('ru')}</div></div>
        <div class="camp-metric"><div class="camp-metric-label">ROAS</div><div class="camp-metric-val">${c.roas}×</div></div>
      </div>
      <div class="campaign-progress">
        <div class="progress-label">
          <span>Бюджет</span>
          <span>₽${c.spent.toLocaleString('ru')} / ₽${c.budget.toLocaleString('ru')}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="--progress-width:${progress}%"></div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function initProgressBars() {
  document.querySelectorAll('.progress-fill').forEach(el => {
    el.classList.add('animated');
  });
}

/* =============================================
   ANALYTICS
   ============================================= */
function initAnalytics() {
  initLineChart();
  initTopProducts();
  initTrafficSources();
  setTimeout(startCounters, 200);
}

function initLineChart() {
  const svg = document.getElementById('lineChartSvg');
  if(!svg || svg.querySelector('path')) return;

  const W = 800, H = 200, padL = 40, padR = 20, padT = 20, padB = 30;
  const maxVal = Math.max(...LINE_DATA) * 1.1;
  const pts = LINE_DATA.map((v,i) => ({
    x: padL + (i / (LINE_DATA.length-1)) * (W-padL-padR),
    y: H - padB - ((v/maxVal) * (H-padT-padB))
  }));

  /* Grid lines */
  for(let g=0;g<4;g++) {
    const y = padT + (g/(4-1))*(H-padT-padB);
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',padL); line.setAttribute('x2',W-padR);
    line.setAttribute('y1',y); line.setAttribute('y2',y);
    line.setAttribute('stroke','var(--border)'); line.setAttribute('stroke-dasharray','4 4');
    svg.appendChild(line);
  }

  /* Area fill */
  const areaD = `M${pts[0].x},${H-padB} ` + pts.map(p=>`L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length-1].x},${H-padB} Z`;
  const area = document.createElementNS('http://www.w3.org/2000/svg','path');
  area.setAttribute('d', areaD);
  area.setAttribute('fill','var(--accent-blue)');
  area.className.baseVal = 'line-area';
  svg.appendChild(area);

  /* Line */
  const lineD = `M${pts[0].x},${pts[0].y} ` + pts.slice(1).map(p=>`L${p.x},${p.y}`).join(' ');
  const linePth = document.createElementNS('http://www.w3.org/2000/svg','path');
  linePth.setAttribute('d', lineD);
  linePth.className.baseVal = 'line-path';
  svg.appendChild(linePth);

  /* Dots */
  pts.forEach((p,i) => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg','circle');
    dot.setAttribute('cx',p.x); dot.setAttribute('cy',p.y); dot.setAttribute('r','4');
    dot.setAttribute('fill','var(--accent-blue)');
    dot.setAttribute('stroke','var(--bg-surface)'); dot.setAttribute('stroke-width','2');
    svg.appendChild(dot);
    /* X label */
    const lbl = document.createElementNS('http://www.w3.org/2000/svg','text');
    lbl.setAttribute('x',p.x); lbl.setAttribute('y',H-5);
    lbl.setAttribute('text-anchor','middle');
    lbl.style.fontSize = '10px'; lbl.style.fill = 'var(--text-tertiary)';
    lbl.textContent = LINE_LABELS[i];
    svg.appendChild(lbl);
  });

  /* Animate */
  setTimeout(() => {
    linePth.classList.add('animated');
    area.classList.add('animated');
  }, 100);
}

function initTopProducts() {
  const el = document.getElementById('topProductsTable');
  if(!el) return;
  el.innerHTML = TOP_PRODUCTS.map((p,i) => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
      <span style="font-family:var(--font-mono);color:var(--text-tertiary);width:16px;text-align:right">${i+1}</span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</div>
        <div style="font-size:11px;color:var(--text-tertiary)">${p.sales} шт.</div>
      </div>
      <span style="font-family:var(--font-mono);font-size:12.5px;font-weight:500">${p.revenue}</span>
      <span style="font-size:11px;${p.change>0?'color:var(--status-success)':'color:var(--status-error)'}">${p.change>0?'+':''}${p.change}%</span>
    </div>`).join('');
}

function initTrafficSources() {
  const el = document.getElementById('trafficSources');
  if(!el) return;
  el.innerHTML = TRAFFIC.map(t => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px">
        <span style="color:var(--text-secondary)">${t.src}</span>
        <span style="font-family:var(--font-mono);font-weight:500">${t.pct}%</span>
      </div>
      <div class="progress-bar" style="height:6px">
        <div class="progress-fill" style="--progress-width:${t.pct}%;background:${t.color}"></div>
      </div>
    </div>`).join('');
  setTimeout(() => {
    el.querySelectorAll('.progress-fill').forEach(f => f.classList.add('animated'));
  }, 100);
}

/* Animated counter */
function animateCounter(el, target, prefix, suffix, duration) {
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = Math.floor(ease * target);
    el.textContent = prefix + val.toLocaleString('ru') + suffix;
    if(progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function startCounters() {
  const pairs = [
    { el: 'counter-orders', target: 1847, prefix:'', suffix:'' },
    { el: 'counter-revenue', target: 3847290, prefix:'₽', suffix:'' },
    { el: 'counter-conversion', target: 348, prefix:'', suffix:'%', transform: v => (v/100).toFixed(2)+'%' },
  ];
  pairs.forEach(p => {
    const el = document.getElementById(p.el);
    if(!el) return;
    const target = p.target;
    const prefix = p.prefix || '';
    const suffix = p.suffix || '';
    const start = performance.now();
    const duration = 1200;
    function update(now) {
      const progress = Math.min((now-start)/duration,1);
      const ease = 1-Math.pow(1-progress,3);
      const val = Math.floor(ease*target);
      if(p.transform) el.textContent = p.transform(val);
      else el.textContent = prefix+val.toLocaleString('ru')+suffix;
      if(progress<1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

/* =============================================
   INTERSECTION OBSERVER — trigger animations on scroll
   ============================================= */
function initIntersectionObservers() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        const el = entry.target;
        if(el.id === 'barChartCard') animateBarChart();
        if(el.id === 'donutCard') animateDonut();
        if(el.id === 'lineChartCard') { /* handled in initAnalytics */ }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  ['barChartCard','donutCard','lineChartCard'].forEach(id => {
    const el = document.getElementById(id);
    if(el) observer.observe(el);
  });
}

/* =============================================
   MODALS
   ============================================= */
function openModal(type) {
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  content.innerHTML = type === 'createOrder' ? createOrderModalContent() :
                      type === 'createCampaign' ? createCampaignModalContent() : '';
  backdrop.classList.remove('closing');
  backdrop.classList.add('open');
}

function closeModal() {
  const backdrop = document.getElementById('modalBackdrop');
  backdrop.classList.add('closing');
  setTimeout(() => {
    backdrop.classList.remove('open','closing');
  }, 160);
}

document.getElementById('modalBackdrop').addEventListener('click', e => {
  if(e.target === e.currentTarget) closeModal();
});

function openOrderModal(orderId) {
  const order = ORDERS.find(o => o.id === orderId);
  if(!order) return;
  const amount = typeof order.amount === 'number' ? '₽'+order.amount.toLocaleString('ru') : '₽'+order.amount;
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">Детали заказа ${order.id}</div>
      <button class="modal-close" onclick="closeModal()">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div><div class="form-label">Клиент</div><div style="font-size:14px;font-weight:500;margin-top:4px">${order.client}</div></div>
        <div><div class="form-label">Сумма</div><div style="font-family:var(--font-mono);font-size:18px;font-weight:700;margin-top:4px;color:var(--accent-blue)">${amount}</div></div>
        <div><div class="form-label">Товар</div><div style="font-size:13px;margin-top:4px">${order.product}</div></div>
        <div><div class="form-label">Дата</div><div style="font-size:13px;margin-top:4px">${order.date}</div></div>
        <div><div class="form-label">Статус</div><div style="margin-top:4px"><span class="status-badge status-${order.status}"><div class="status-dot ${STATUS_PULSE[order.status]?'pulse':''}"></div>${STATUS_LABELS[order.status]}</span></div></div>
        <div><div class="form-label">Источник</div><div style="font-size:13px;margin-top:4px">Сайт / VK Ads</div></div>
      </div>
      <div class="divider"></div>
      <div class="form-group">
        <label class="form-label">Изменить статус</label>
        <select class="form-select">
          <option>Новый</option><option selected>В обработке</option><option>Доставлен</option><option>Отменён</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Комментарий менеджера</label>
        <textarea class="form-textarea" rows="3" placeholder="Добавить комментарий..."></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="showToast('success','Заказ обновлён','${order.id} успешно сохранён');closeModal()">Сохранить</button>
    </div>`;
  document.getElementById('modalBackdrop').classList.remove('closing');
  document.getElementById('modalBackdrop').classList.add('open');
}

function createOrderModalContent() {
  return `
    <div class="modal-header">
      <div class="modal-title">Новый заказ</div>
      <button class="modal-close" onclick="closeModal()">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group"><label class="form-label">Клиент *</label>
        <input class="form-input" id="newOrderClient" placeholder="Имя клиента"></div>
      <div class="form-group"><label class="form-label">Товар *</label>
        <select class="form-select" id="newOrderProduct">
          <option value="">Выберите товар...</option>
          <option>iPhone 15 Pro Max 256GB — ₽134 990</option>
          <option>Samsung Galaxy S24 Ultra — ₽119 990</option>
          <option>MacBook Air M3 15" — ₽189 990</option>
          <option>AirPods Pro 2 — ₽22 990</option>
          <option>Sony WH-1000XM5 — ₽31 990</option>
        </select></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group"><label class="form-label">Количество</label>
          <input class="form-input" type="number" value="1" min="1"></div>
        <div class="form-group"><label class="form-label">Источник</label>
          <select class="form-select">
            <option>Сайт</option><option>VK Ads</option><option>MyTarget</option><option>Telegram</option><option>Телефон</option>
          </select></div>
      </div>
      <div class="form-group"><label class="form-label">Адрес доставки</label>
        <input class="form-input" placeholder="Город, улица, дом"></div>
      <div class="form-group"><label class="form-label">Комментарий</label>
        <textarea class="form-textarea" rows="2" placeholder="Необязательно..."></textarea></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary btn-glow" onclick="submitNewOrder()">Создать заказ</button>
    </div>`;
}

function submitNewOrder() {
  const client = document.getElementById('newOrderClient')?.value.trim();
  const product = document.getElementById('newOrderProduct')?.value;
  if(!client) { document.getElementById('newOrderClient').classList.add('error'); return; }
  if(!product) { showToast('error','Ошибка','Выберите товар'); return; }
  showToast('success','Заказ создан','#ORD-1848 добавлен в систему');
  closeModal();
}

/* Campaign modal with stepper */
let campaignStep = 0;
function createCampaignModalContent() {
  return `
    <div class="modal-header">
      <div class="modal-title">Новая рекламная кампания</div>
      <button class="modal-close" onclick="closeModal()">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="stepper" id="campaignStepper">
        <div class="step active" id="cstep-0">
          <div class="step-circle">1</div>
          <span class="step-label">Основное</span>
        </div>
        <div class="step-line"></div>
        <div class="step" id="cstep-1">
          <div class="step-circle">2</div>
          <span class="step-label">Аудитория</span>
        </div>
        <div class="step-line"></div>
        <div class="step" id="cstep-2">
          <div class="step-circle">3</div>
          <span class="step-label">Бюджет</span>
        </div>
      </div>

      <div class="step-panel active" id="cpanel-0">
        <div class="form-group"><label class="form-label">Название кампании *</label>
          <input class="form-input" id="campName" placeholder="Например: Акция — Summer Sale 2026"></div>
        <div class="form-group"><label class="form-label">Платформа</label>
          <select class="form-select">
            <option>ВКонтакте</option><option>MyTarget</option><option>Telegram Ads</option>
          </select></div>
        <div class="form-group"><label class="form-label">Цель кампании</label>
          <select class="form-select">
            <option>Охват и узнаваемость</option><option>Трафик на сайт</option><option>Конверсии</option><option>Ретаргетинг</option>
          </select></div>
      </div>

      <div class="step-panel" id="cpanel-1">
        <div class="form-group"><label class="form-label">Возраст аудитории</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <input class="form-input" placeholder="От" type="number" value="18">
            <input class="form-input" placeholder="До" type="number" value="45">
          </div></div>
        <div class="form-group"><label class="form-label">Интересы</label>
          <select class="form-select" multiple style="height:80px">
            <option selected>Электроника</option><option selected>Технологии</option>
            <option>Геймеры</option><option>Фотографы</option><option>Предприниматели</option>
          </select></div>
        <div class="form-group"><label class="form-label">География</label>
          <input class="form-input" placeholder="Москва, Санкт-Петербург..."></div>
      </div>

      <div class="step-panel" id="cpanel-2">
        <div class="form-group"><label class="form-label">Дневной бюджет (₽)</label>
          <input class="form-input" type="number" value="5000"></div>
        <div class="form-group"><label class="form-label">Период</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <input class="form-input" type="date" value="2026-05-05">
            <input class="form-input" type="date" value="2026-05-31">
          </div></div>
        <div style="padding:12px;background:var(--bg-elevated);border-radius:8px;font-size:13px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--text-secondary)">Прогноз охвата</span><span style="font-family:var(--font-mono);font-weight:600">~85 000</span></div>
          <div style="display:flex;justify-content:space-between"><span style="color:var(--text-secondary)">Прогноз кликов</span><span style="font-family:var(--font-mono);font-weight:600">~5 200</span></div>
        </div>
      </div>
    </div>
    <div class="modal-footer" id="campFooter">
      <button class="btn btn-ghost" id="campBackBtn" onclick="campaignStepBack()" style="display:none">← Назад</button>
      <button class="btn btn-ghost" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary btn-glow" id="campNextBtn" onclick="campaignStepNext()">Далее →</button>
    </div>`;
}

function campaignStepNext() {
  const nameEl = document.getElementById('campName');
  if(campaignStep === 0 && nameEl && !nameEl.value.trim()) {
    nameEl.classList.add('error'); return;
  }
  if(campaignStep < 2) {
    document.getElementById('cpanel-'+campaignStep)?.classList.remove('active');
    document.getElementById('cstep-'+campaignStep)?.classList.remove('active');
    document.getElementById('cstep-'+campaignStep)?.classList.add('done');
    campaignStep++;
    document.getElementById('cpanel-'+campaignStep)?.classList.add('active');
    document.getElementById('cstep-'+campaignStep)?.classList.add('active');
    document.getElementById('campBackBtn').style.display = '';
    if(campaignStep === 2) document.getElementById('campNextBtn').textContent = '🚀 Запустить';
  } else {
    showToast('success','Кампания создана','Кампания запускается...');
    closeModal();
    campaignStep = 0;
  }
}
function campaignStepBack() {
  if(campaignStep > 0) {
    document.getElementById('cpanel-'+campaignStep)?.classList.remove('active');
    document.getElementById('cstep-'+campaignStep)?.classList.remove('active');
    campaignStep--;
    document.getElementById('cpanel-'+campaignStep)?.classList.add('active');
    document.getElementById('cstep-'+campaignStep)?.classList.remove('done');
    document.getElementById('cstep-'+campaignStep)?.classList.add('active');
    if(campaignStep === 0) document.getElementById('campBackBtn').style.display = 'none';
    document.getElementById('campNextBtn').textContent = 'Далее →';
  }
}

function openCampaignModal(id) {
  const c = CAMPAIGNS.find(c=>c.id===id); if(!c) return;
  const statusLabel = {active:'Активна',paused:'Пауза',ended:'Завершена'}[c.status];
  const progress = Math.round((c.spent/c.budget)*100);
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">${c.title}</div>
      <button class="modal-close" onclick="closeModal()">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px">
        <span class="status-badge ${c.status==='active'?'status-delivered':c.status==='paused'?'status-processing':'status-cancelled'}">
          <div class="status-dot ${c.status==='active'?'pulse':''}"></div>${statusLabel}
        </span>
        <span style="font-size:12px;color:var(--text-tertiary)">${c.platform}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
        <div style="text-align:center;padding:12px;background:var(--bg-elevated);border-radius:8px">
          <div style="font-family:var(--font-mono);font-size:18px;font-weight:700;color:var(--accent-blue)">${(c.reach/1000).toFixed(1)}K</div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px">Охват</div>
        </div>
        <div style="text-align:center;padding:12px;background:var(--bg-elevated);border-radius:8px">
          <div style="font-family:var(--font-mono);font-size:18px;font-weight:700;color:var(--accent-teal)">${c.clicks.toLocaleString('ru')}</div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px">Клики</div>
        </div>
        <div style="text-align:center;padding:12px;background:var(--bg-elevated);border-radius:8px">
          <div style="font-family:var(--font-mono);font-size:18px;font-weight:700;color:var(--status-success)">${c.roas}×</div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:4px">ROAS</div>
        </div>
      </div>
      <div style="margin-bottom:14px">
        <div class="progress-label"><span>Использование бюджета</span><span>₽${c.spent.toLocaleString('ru')} / ₽${c.budget.toLocaleString('ru')} (${progress}%)</span></div>
        <div class="progress-bar" style="height:8px">
          <div class="progress-fill animated" style="--progress-width:${progress}%;width:${progress}%"></div>
        </div>
      </div>
      <div class="flex-between">
        <span style="font-size:12px;color:var(--text-secondary)">CTR: ${c.ctr}%</span>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="showToast('info','Статистика','Детальный отчёт открывается...')">Статистика</button>
          ${c.status==='active' ? `<button class="btn btn-secondary btn-sm" onclick="showToast('warning','Пауза','Кампания поставлена на паузу');closeModal()">⏸ Пауза</button>` : c.status==='paused' ? `<button class="btn btn-primary btn-sm" onclick="showToast('success','Запуск','Кампания возобновлена');closeModal()">▶ Возобновить</button>` : ''}
        </div>
      </div>
    </div>`;
  document.getElementById('modalBackdrop').classList.remove('closing');
  document.getElementById('modalBackdrop').classList.add('open');
}

/* =============================================
   TOAST SYSTEM
   ============================================= */
const TOAST_ICONS = {
  success:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="8" r="6"/><path d="M5.5 8.5l2 2 3-4"/></svg>`,
  error:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5M8 10.5v.5"/></svg>`,
  info:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 7.5V11M8 5v.5"/></svg>`,
  warning:`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 2L14 13H2L8 2z"/><path d="M8 7v3M8 11.5v.5"/></svg>`,
};

function showToast(type, title, msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-header">
      <span class="toast-icon">${TOAST_ICONS[type]||TOAST_ICONS.info}</span>
      <span class="toast-title">${title}</span>
      <button class="toast-close-btn" onclick="dismissToast(this.closest('.toast'))">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l8 8M10 2L2 10"/></svg>
      </button>
    </div>
    ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    <div class="toast-progress"></div>`;
  container.appendChild(toast);
  setTimeout(() => dismissToast(toast), 3300);
}

function dismissToast(toast) {
  if(!toast || toast.classList.contains('hiding')) return;
  toast.classList.add('hiding');
  setTimeout(() => toast.remove(), 310);
}

/* =============================================
   INIT
   ============================================= */
function init() {
  applyTheme(currentTheme);
  initOrdersTables();
  initBarChart();
  initDonutChart();
  initCampaigns();
  initIntersectionObservers();
  /* Trigger bar chart animation after a brief delay */
  setTimeout(animateBarChart, 500);
  setTimeout(animateDonut, 600);
}

init();

/* =============================================
   TWEAKS PANEL
   ============================================= */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#4da6ff",
  "theme": "dark",
  "fontScale": 100,
  "densityCompact": false
}/*EDITMODE-END*/;

let tweaks = Object.assign({}, TWEAK_DEFAULTS);
let tweaksPanelVisible = false;

/* Listen for host messages */
window.addEventListener('message', e => {
  if(e.data?.type === '__activate_edit_mode')   showTweaksPanel();
  if(e.data?.type === '__deactivate_edit_mode') hideTweaksPanel();
});
window.parent.postMessage({type:'__edit_mode_available'},'*');

function showTweaksPanel() {
  let panel = document.getElementById('tweaksPanel');
  if(!panel) {
    panel = document.createElement('div');
    panel.id = 'tweaksPanel';
    panel.innerHTML = buildTweaksPanelHTML();
    document.body.appendChild(panel);
    initTweakEvents();
  }
  panel.style.display = '';
  tweaksPanelVisible = true;
}
function hideTweaksPanel() {
  const p = document.getElementById('tweaksPanel');
  if(p) p.style.display = 'none';
  tweaksPanelVisible = false;
}
function buildTweaksPanelHTML() {
  return `<div style="
    position:fixed;bottom:24px;right:24px;
    width:240px;
    background:var(--bg-elevated);
    border:1px solid var(--border);
    border-radius:12px;
    box-shadow:var(--shadow-lg);
    z-index:9999;
    font-family:var(--font-ui);
    font-size:13px;
    overflow:hidden;
  ">
    <div style="padding:12px 14px 10px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;cursor:move" id="tweaksDrag">
      <span style="font-weight:600;font-size:13px">Tweaks</span>
      <button onclick="hideTweaksPanel();window.parent.postMessage({type:'__edit_mode_dismissed'},'*')" style="cursor:pointer;background:none;border:none;color:var(--text-secondary);font-size:16px;line-height:1;padding:0 2px">×</button>
    </div>
    <div style="padding:12px 14px;display:flex;flex-direction:column;gap:12px">
      <div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:6px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em">Тема</div>
        <div style="display:flex;gap:4px">
          <button class="tweak-radio" data-val="dark" onclick="setTweak('theme','dark')">Тёмная</button>
          <button class="tweak-radio" data-val="light" onclick="setTweak('theme','light')">Светлая</button>
          <button class="tweak-radio" data-val="system" onclick="setTweak('theme','system')">Сист.</button>
        </div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:6px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em">Акцентный цвет</div>
        <div style="display:flex;gap:6px;align-items:center">
          <input type="color" id="tweakColor" value="${tweaks.accentColor}" oninput="setTweak('accentColor',this.value)" style="width:32px;height:26px;border:none;background:none;cursor:pointer;padding:0;border-radius:4px">
          <div style="flex:1;display:flex;gap:4px">
            ${['#4da6ff','#22d3ee','#a78bfa','#f472b6','#34d399'].map(c=>`<div onclick="setTweak('accentColor','${c}');document.getElementById('tweakColor').value='${c}'" style="width:20px;height:20px;border-radius:50%;background:${c};cursor:pointer;flex-shrink:0;border:2px solid ${c===tweaks.accentColor?'white':'transparent'}"></div>`).join('')}
          </div>
        </div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:6px;font-weight:500;text-transform:uppercase;letter-spacing:0.06em">Масштаб текста: <span id="tweakFontVal">${tweaks.fontScale}%</span></div>
        <input type="range" min="85" max="115" step="5" value="${tweaks.fontScale}" oninput="setTweak('fontScale',+this.value)" style="width:100%;accent-color:var(--accent-blue)">
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:var(--text-secondary)">Компактный режим</span>
        <label style="position:relative;display:inline-block;width:34px;height:18px">
          <input type="checkbox" id="tweakDensity" ${tweaks.densityCompact?'checked':''} onchange="setTweak('densityCompact',this.checked)" style="opacity:0;width:0;height:0">
          <span style="position:absolute;inset:0;background:${tweaks.densityCompact?'var(--accent-blue)':'var(--bg-overlay)'};border-radius:9px;transition:background 200ms ease;border:1px solid var(--border);cursor:pointer" id="tweakDensityTrack"></span>
          <span style="position:absolute;top:2px;left:${tweaks.densityCompact?'16px':'2px'};width:12px;height:12px;border-radius:50%;background:white;transition:left 200ms ease;box-shadow:0 1px 3px rgba(0,0,0,.3)" id="tweakDensityThumb"></span>
        </label>
      </div>
    </div>
    <style>
      .tweak-radio{padding:4px 8px;border-radius:5px;border:1px solid var(--border);background:transparent;color:var(--text-secondary);font-size:11.5px;cursor:pointer;transition:all 150ms ease;font-family:var(--font-ui)}
      .tweak-radio:hover,.tweak-radio.active{background:var(--accent-blue-dim);color:var(--accent-blue);border-color:var(--border-accent)}
    </style>
  </div>`;
}
function initTweakEvents() {
  updateTweakRadios();
}
function updateTweakRadios() {
  document.querySelectorAll('.tweak-radio[data-val]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === tweaks.theme);
  });
}
function setTweak(key, val) {
  tweaks[key] = val;
  if(key === 'theme') { currentTheme = val; localStorage.setItem('eopTheme',val); applyTheme(val); updateTweakRadios(); }
  if(key === 'accentColor') {
    document.documentElement.style.setProperty('--accent-blue', val);
    document.documentElement.style.setProperty('--accent-blue-dim', val+'26');
    document.documentElement.style.setProperty('--accent-blue-glow', val+'40');
    document.documentElement.style.setProperty('--border-accent', val+'4d');
  }
  if(key === 'fontScale') {
    document.documentElement.style.fontSize = (val/100*14)+'px';
    const label = document.getElementById('tweakFontVal');
    if(label) label.textContent = val+'%';
  }
  if(key === 'densityCompact') {
    document.querySelectorAll('.metric-card').forEach(c => c.style.padding = val ? '12px' : '');
    document.querySelectorAll('tbody td').forEach(t => t.style.padding = val ? '7px 16px' : '');
    const track = document.getElementById('tweakDensityTrack');
    const thumb = document.getElementById('tweakDensityThumb');
    if(track) track.style.background = val ? 'var(--accent-blue)' : 'var(--bg-overlay)';
    if(thumb) thumb.style.left = val ? '16px' : '2px';
  }
  window.parent.postMessage({type:'__edit_mode_set_keys', edits: {[key]: val}}, '*');
}

/* Keyboard shortcut: Escape closes modal */
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeModal();
});