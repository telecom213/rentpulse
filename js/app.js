// RentPulse - Fully Automated Rental Engine
// Mock inventory, dynamic pricing, cart, AI chat, availability simulation

const PRODUCTS = [
  {
    id: 'lp-001',
    name: 'Dell Latitude 5540 Business Laptop',
    category: 'computers',
    categoryLabel: 'Computers',
    specs: 'Intel Core i7-1355U • 16GB RAM • 512GB SSD • 15.6" FHD',
    daily: 28,
    weekly: 140,
    monthly: 420,
    stock: 47,
    image: 'products/laptop.jpg',
    badge: 'Popular',
    available: true
  },
  {
    id: 'ph-001',
    name: 'iPhone 16 Pro Max 256GB',
    category: 'mobile',
    categoryLabel: 'Mobile',
    specs: 'A18 Pro • 6.9" Super Retina • Titanium • 5G',
    daily: 22,
    weekly: 110,
    monthly: 320,
    stock: 32,
    image: 'products/phone.jpg',
    badge: 'New',
    available: true
  },
  {
    id: 'rt-001',
    name: 'Cisco Catalyst 9300 Enterprise Switch',
    category: 'networking',
    categoryLabel: 'Networking',
    specs: '48-port PoE+ • 10G uplinks • StackWise • Layer 3',
    daily: 85,
    weekly: 420,
    monthly: 1250,
    stock: 12,
    image: 'products/router.jpg',
    badge: 'Enterprise',
    available: true
  },
  {
    id: 'sv-001',
    name: 'Dell PowerEdge R760 Server',
    category: 'servers',
    categoryLabel: 'Servers',
    specs: '2x Xeon Gold • 128GB RAM • 4TB NVMe • Dual PSU',
    daily: 180,
    weekly: 900,
    monthly: 2800,
    stock: 8,
    image: 'products/server.jpg',
    badge: 'High Demand',
    available: true
  },
  {
    id: 'vp-001',
    name: 'Cisco IP Phone 8865 VoIP',
    category: 'telecom',
    categoryLabel: 'Telecom',
    specs: 'Color touchscreen • Video • Bluetooth • PoE',
    daily: 12,
    weekly: 55,
    monthly: 160,
    stock: 95,
    image: 'products/voip.jpg',
    available: true
  },
  {
    id: 'tb-001',
    name: 'iPad Pro 13" M4 256GB',
    category: 'mobile',
    categoryLabel: 'Mobile',
    specs: 'M4 chip • Liquid Retina XDR • Apple Pencil Pro ready',
    daily: 25,
    weekly: 125,
    monthly: 380,
    stock: 28,
    image: 'products/tablet.jpg',
    badge: 'Pro',
    available: true
  },
  {
    id: 'ot-001',
    name: 'EXFO OTDR Fiber Tester FTB-1v2',
    category: 'telecom',
    categoryLabel: 'Telecom',
    specs: '1310/1550nm • Dynamic range 40dB • Touchscreen',
    daily: 95,
    weekly: 450,
    monthly: 1400,
    stock: 6,
    image: 'products/otdr.jpg',
    badge: 'Specialist',
    available: true
  },
  {
    id: 'wf-001',
    name: 'Cisco Meraki MR46 Wi-Fi 6 AP',
    category: 'networking',
    categoryLabel: 'Networking',
    specs: 'Wi-Fi 6 • Dual-radio • Cloud managed • PoE+',
    daily: 18,
    weekly: 85,
    monthly: 250,
    stock: 41,
    image: 'products/wifi.jpg',
    available: true
  }
];

// Dynamic pricing engine (simulates demand/seasonality)
function getDynamicPrice(product, period) {
  const base = product[period];
  const demand = 0.9 + (Math.sin(Date.now() / 100000 + product.id.charCodeAt(0)) * 0.15 + 0.1);
  const day = new Date().getDay();
  const weekendBoost = (day === 0 || day === 6) ? 1.08 : 1;
  return Math.round(base * demand * weekendBoost);
}

// State
let cart = JSON.parse(localStorage.getItem('rentpulse_cart') || '[]');
let currentFilter = 'all';
let currentProduct = null;
let selectedDuration = 'weekly';
let selectedQty = 1;

// DOM helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartUI();
  initChat();
  startLiveInventorySimulation();
  updateAdminMetrics();
});

// ========== PRODUCTS ==========
function renderProducts(filter = 'all') {
  currentFilter = filter;
  const grid = $('#product-grid');
  if (!grid) return;

  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  
  grid.innerHTML = filtered.map(p => {
    const price = getDynamicPrice(p, 'daily');
    return `
      <article class="product-card" data-id="${p.id}" data-category="${p.category}">
        <div class="product-image">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
          <span class="product-stock"><span class="live-dot"></span>${p.stock} in stock</span>
        </div>
        <div class="product-body">
          <div class="product-category">${p.categoryLabel}</div>
          <h3 class="product-title">${p.name}</h3>
          <p class="product-specs">${p.specs}</p>
          <div class="product-price">
            <span class="price-value">$${price}</span>
            <span class="price-period">/ day <span class="auto-badge">⚡ Live</span></span>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary" onclick="openRentModal('${p.id}')">Rent Now</button>
            <button class="btn btn-outline" onclick="quickAdd('${p.id}')" title="Quick add 1 week">+</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  $$('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
}

function filterProducts(cat) {
  renderProducts(cat);
}

// ========== RENTAL MODAL ==========
function openRentModal(id) {
  currentProduct = PRODUCTS.find(p => p.id === id);
  if (!currentProduct) return;

  selectedDuration = 'weekly';
  selectedQty = 1;

  const modal = $('#rent-modal');
  $('#modal-img').src = currentProduct.image;
  $('#modal-name').textContent = currentProduct.name;
  $('#modal-specs').textContent = currentProduct.specs;
  $('#modal-stock').textContent = `${currentProduct.stock} available`;
  $('#qty-input').value = 1;
  $('#qty-input').max = currentProduct.stock;

  const durations = [
    { key: 'daily', label: 'Daily', rate: getDynamicPrice(currentProduct, 'daily') },
    { key: 'weekly', label: 'Weekly', rate: getDynamicPrice(currentProduct, 'weekly') },
    { key: 'monthly', label: 'Monthly', rate: getDynamicPrice(currentProduct, 'monthly') },
    { key: 'custom', label: 'Custom', rate: null }
  ];

  const durContainer = $('#duration-options');
  durContainer.innerHTML = durations.map(d => `
    <button type="button" class="duration-btn ${d.key === 'weekly' ? 'active' : ''}" 
            data-duration="${d.key}" onclick="selectDuration('${d.key}')">
      ${d.label}
      ${d.rate ? `<span class="rate">$${d.rate}</span>` : '<span class="rate">Set days</span>'}
    </button>
  `).join('');

  updatePriceSummary();
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('#rent-modal').classList.remove('open');
  document.body.style.overflow = '';
  currentProduct = null;
}

function selectDuration(key) {
  selectedDuration = key;
  $$('#duration-options .duration-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.duration === key);
  });
  const customDays = $('#custom-days-group');
  if (customDays) customDays.style.display = key === 'custom' ? 'block' : 'none';
  updatePriceSummary();
}

function updateQty(delta) {
  const input = $('#qty-input');
  let val = parseInt(input.value) + delta;
  val = Math.max(1, Math.min(currentProduct.stock, val));
  input.value = val;
  selectedQty = val;
  updatePriceSummary();
}

function onQtyChange() {
  selectedQty = Math.max(1, Math.min(currentProduct.stock, parseInt($('#qty-input').value) || 1));
  $('#qty-input').value = selectedQty;
  updatePriceSummary();
}

function updatePriceSummary() {
  if (!currentProduct) return;
  let unitPrice, days, label;

  if (selectedDuration === 'daily') {
    unitPrice = getDynamicPrice(currentProduct, 'daily');
    days = 1;
    label = '1 day';
  } else if (selectedDuration === 'weekly') {
    unitPrice = getDynamicPrice(currentProduct, 'weekly');
    days = 7;
    label = '1 week (7 days)';
  } else if (selectedDuration === 'monthly') {
    unitPrice = getDynamicPrice(currentProduct, 'monthly');
    days = 30;
    label = '1 month (30 days)';
  } else {
    days = parseInt($('#custom-days')?.value) || 14;
    unitPrice = Math.round(getDynamicPrice(currentProduct, 'daily') * days * 0.85);
    label = `${days} days (volume rate)`;
  }

  const subtotal = unitPrice * selectedQty;
  const insurance = Math.round(subtotal * 0.08);
  const delivery = selectedQty > 3 ? 0 : 49;
  const total = subtotal + insurance + delivery;

  $('#summary-period').textContent = label;
  $('#summary-unit').textContent = `$${unitPrice.toLocaleString()} × ${selectedQty}`;
  $('#summary-subtotal').textContent = `$${subtotal.toLocaleString()}`;
  $('#summary-insurance').textContent = `$${insurance.toLocaleString()}`;
  $('#summary-delivery').textContent = delivery === 0 ? 'FREE' : `$${delivery}`;
  $('#summary-total').textContent = `$${total.toLocaleString()}`;
}

function addToCartFromModal() {
  if (!currentProduct) return;

  let days, unitPrice, periodLabel;
  if (selectedDuration === 'daily') {
    unitPrice = getDynamicPrice(currentProduct, 'daily');
    days = 1; periodLabel = '1 day';
  } else if (selectedDuration === 'weekly') {
    unitPrice = getDynamicPrice(currentProduct, 'weekly');
    days = 7; periodLabel = '1 week';
  } else if (selectedDuration === 'monthly') {
    unitPrice = getDynamicPrice(currentProduct, 'monthly');
    days = 30; periodLabel = '1 month';
  } else {
    days = parseInt($('#custom-days')?.value) || 14;
    unitPrice = Math.round(getDynamicPrice(currentProduct, 'daily') * days * 0.85);
    periodLabel = `${days} days`;
  }

  const insurance = Math.round(unitPrice * selectedQty * 0.08);
  const delivery = selectedQty > 3 ? 0 : 49;
  const total = unitPrice * selectedQty + insurance + delivery;

  const existing = cart.find(i => i.id === currentProduct.id && i.duration === selectedDuration);
  if (existing) {
    existing.qty += selectedQty;
    existing.total = (existing.unitPrice * existing.qty) + Math.round(existing.unitPrice * existing.qty * 0.08) + (existing.qty > 3 ? 0 : 49);
  } else {
    cart.push({
      id: currentProduct.id,
      name: currentProduct.name,
      image: currentProduct.image,
      qty: selectedQty,
      duration: selectedDuration,
      days,
      periodLabel,
      unitPrice,
      insurance,
      delivery,
      total
    });
  }

  saveCart();
  updateCartUI();
  closeModal();
  showToast(`✓ ${currentProduct.name} added to cart`);
  openCart();
}

function quickAdd(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const unitPrice = getDynamicPrice(p, 'weekly');
  const insurance = Math.round(unitPrice * 0.08);
  cart.push({
    id: p.id,
    name: p.name,
    image: p.image,
    qty: 1,
    duration: 'weekly',
    days: 7,
    periodLabel: '1 week',
    unitPrice,
    insurance,
    delivery: 49,
    total: unitPrice + insurance + 49
  });
  saveCart();
  updateCartUI();
  showToast(`✓ ${p.name} (1 week) added`);
}

// ========== CART ==========
function saveCart() {
  localStorage.setItem('rentpulse_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const badge = $('#cart-count');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  const itemsEl = $('#cart-items');
  const emptyEl = $('#cart-empty');
  const footer = $('#cart-footer');

  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    if (footer) footer.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (footer) footer.style.display = 'block';

  itemsEl.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="cart-item-meta">${item.qty} × ${item.periodLabel}</div>
        <div class="cart-item-price">$${item.total.toLocaleString()}</div>
      </div>
      <button class="btn btn-ghost" onclick="removeFromCart(${idx})" title="Remove">✕</button>
    </div>
  `).join('');

  const grand = cart.reduce((s, i) => s + i.total, 0);
  $('#cart-grand-total').textContent = `$${grand.toLocaleString()}`;
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  saveCart();
  updateCartUI();
}

function openCart() {
  $('#cart-overlay').classList.add('open');
  $('#cart-sidebar').classList.add('open');
}

function closeCart() {
  $('#cart-overlay').classList.remove('open');
  $('#cart-sidebar').classList.remove('open');
}

function checkout() {
  if (cart.length === 0) return;
  showToast('🚀 Processing automated rental order...');
  setTimeout(() => {
    const orderId = 'RP-' + Date.now().toString(36).toUpperCase();
    cart = [];
    saveCart();
    updateCartUI();
    closeCart();
    showToast(`✅ Order ${orderId} confirmed! Equipment dispatching automatically.`);
  }, 1800);
}

// ========== LIVE INVENTORY SIM ==========
function startLiveInventorySimulation() {
  setInterval(() => {
    PRODUCTS.forEach(p => {
      if (Math.random() > 0.7) {
        const change = Math.random() > 0.5 ? 1 : -1;
        p.stock = Math.max(0, Math.min(120, p.stock + change));
      }
    });
    if (currentFilter) renderProducts(currentFilter);
    updateAdminMetrics();
  }, 12000);
}

// ========== ADMIN METRICS ==========
function updateAdminMetrics() {
  const totalStock = PRODUCTS.reduce((s, p) => s + p.stock, 0);
  const activeRentals = 187 + Math.floor(Math.random() * 12);
  const revenueToday = 12480 + Math.floor(Math.random() * 800);
  const autoOrders = 34 + Math.floor(Math.random() * 5);

  const el = (id, val) => { const e = $(id); if (e) e.textContent = val; };
  el('#metric-stock', totalStock);
  el('#metric-rentals', activeRentals);
  el('#metric-revenue', '$' + revenueToday.toLocaleString());
  el('#metric-auto', autoOrders);
}

// ========== AI CHATBOT ==========
const AI_RESPONSES = {
  greeting: [
    "Hi! I'm PulseAI, your automated rental assistant. I can help you find the perfect laptop, networking gear, telecom tools, or servers. What do you need?",
    "Welcome to RentPulse! Fully automated inventory is live. Ask me about availability, pricing, or recommendations."
  ],
  laptop: "We have excellent business laptops in stock. The Dell Latitude 5540 is our most popular — Core i7, 16GB, available from $28/day with dynamic pricing. Want me to add it to your cart for a week?",
  phone: "Flagship smartphones like the iPhone 16 Pro Max are ready for same-day dispatch. Weekly rate currently ~$110. Enterprise bulk discounts available automatically.",
  network: "For enterprise networking we stock Cisco Catalyst switches and Meraki APs. The Catalyst 9300 starts at $85/day. Do you need PoE or 10G?",
  server: "Dell PowerEdge R760 servers are available with 128GB+ configs. Monthly rentals get priority SLA and free remote monitoring setup.",
  telecom: "VoIP phones (Cisco 8865), fiber OTDRs, and test gear are fully stocked. OTDR units are specialist — only 6 left, book soon!",
  price: "Our AI engine applies live dynamic pricing based on demand, duration, and inventory levels. Longer rentals automatically receive volume discounts. Insurance and free bulk delivery included.",
  delivery: "Automated logistics: most metro areas get next-day delivery. Bulk orders (>3 units) ship free. Tracking is live via IoT once dispatched.",
  return: "Returns are fully automated. Schedule a pickup in your dashboard or use our prepaid return labels. Sensors confirm condition on receipt.",
  track: "Every asset has IoT tracking. Once rented you'll see real-time location, health metrics, and utilization in the customer portal.",
  default: [
    "I can help with product recommendations, live stock checks, pricing quotes, bulk orders, or technical specs. Try asking about laptops, servers, networking, or telecom gear!",
    "Fully automated here — inventory syncs every few seconds. What category interests you: Computers, Mobile, Networking, Servers, or Telecom?",
    "For enterprise accounts we offer dedicated API access for automated provisioning. Want a quote for a multi-device fleet?"
  ]
};

function initChat() {
  setTimeout(() => {
    addBotMessage(AI_RESPONSES.greeting[0]);
  }, 800);
}

function toggleChat() {
  const win = $('#chat-window');
  win.classList.toggle('open');
  if (win.classList.contains('open')) {
    $('#chat-input').focus();
  }
}

function addBotMessage(text) {
  const container = $('#chat-messages');
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function addUserMessage(text) {
  const container = $('#chat-messages');
  const div = document.createElement('div');
  div.className = 'msg user';
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function sendChat() {
  const input = $('#chat-input');
  const text = input.value.trim();
  if (!text) return;
  addUserMessage(text);
  input.value = '';

  setTimeout(() => {
    const lower = text.toLowerCase();
    let reply;
    if (/laptop|notebook|computer|pc|macbook|dell|hp|lenovo/.test(lower)) reply = AI_RESPONSES.laptop;
    else if (/phone|iphone|mobile|smartphone|android/.test(lower)) reply = AI_RESPONSES.phone;
    else if (/router|switch|network|wifi|ap|meraki|cisco|firewall/.test(lower)) reply = AI_RESPONSES.network;
    else if (/server|rack|poweredge|xeon/.test(lower)) reply = AI_RESPONSES.server;
    else if (/voip|phone|fiber|otdr|telecom|tester|radio/.test(lower)) reply = AI_RESPONSES.telecom;
    else if (/price|cost|rate|how much|pricing|dynamic/.test(lower)) reply = AI_RESPONSES.price;
    else if (/deliver|ship|logistics|next day|pickup/.test(lower)) reply = AI_RESPONSES.delivery;
    else if (/return|end rental|send back/.test(lower)) reply = AI_RESPONSES.return;
    else if (/track|location|iot|where|status/.test(lower)) reply = AI_RESPONSES.track;
    else if (/hi|hello|hey|start|help/.test(lower)) reply = AI_RESPONSES.greeting[1];
    else reply = AI_RESPONSES.default[Math.floor(Math.random() * AI_RESPONSES.default.length)];

    addBotMessage(reply);
  }, 600 + Math.random() * 800);
}

function handleChatKey(e) {
  if (e.key === 'Enter') sendChat();
}

// ========== TOAST ==========
function showToast(msg) {
  let toast = $('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
  if (e.target.id === 'rent-modal') closeModal();
  if (e.target.id === 'cart-overlay') closeCart();
});

// Expose for inline handlers
window.filterProducts = filterProducts;
window.openRentModal = openRentModal;
window.closeModal = closeModal;
window.selectDuration = selectDuration;
window.updateQty = updateQty;
window.onQtyChange = onQtyChange;
window.addToCartFromModal = addToCartFromModal;
window.quickAdd = quickAdd;
window.openCart = openCart;
window.closeCart = closeCart;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.toggleChat = toggleChat;
window.sendChat = sendChat;
window.handleChatKey = handleChatKey;
