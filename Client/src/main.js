/* =============================================
   FURNICHER — Main JavaScript
   "And Verity" Editorial Luxury Mode
   ============================================= */

import './style.css';

// ─── DATA ──────────────────────────────────────
const PRODUCTS = [
  {
    id: 'walnut-dining-table',
    name: 'Aldric Dining Table',
    category: 'dining',
    desc: 'Solid walnut with hand-shaped legs and mortise-tenon joinery. Seats 6–10.',
    price: 3850,
    image: '/dining_table.png',
    badge: 'bestseller',
    materials: ['#8B5E3C', '#4E2C15', '#D4A96A'],
  },
  {
    id: 'bouclé-armchair',
    name: 'Verity Armchair',
    category: 'living',
    desc: 'Ivory bouclé upholstery over a solid oak frame. The perfect reading companion.',
    price: 2450,
    image: '/armchair.png',
    badge: 'new',
    materials: ['#F5F0E8', '#9B7653', '#2C1810'],
  },
  {
    id: 'oak-bed-frame',
    name: 'Heron Bed Frame',
    category: 'bedroom',
    desc: 'Solid white oak with a floating linen headboard. Available in all bed sizes.',
    price: 4200,
    image: '/bed_frame.png',
    badge: null,
    materials: ['#C9A87C', '#E8DFD0', '#4A2E1E'],
  },
  {
    id: 'marble-coffee-table',
    name: 'Sable Coffee Table',
    category: 'living',
    desc: 'Calacatta marble top on brushed brass legs. A sculptural centrepiece.',
    price: 3100,
    image: '/coffee_table.png',
    badge: 'new',
    materials: ['#F0EDE8', '#C9B49A', '#B8A080'],
  },
  {
    id: 'walnut-bookshelf',
    name: 'Loftus Shelving Unit',
    category: 'office',
    desc: 'Modular solid walnut shelving with adjustable heights. Flat-pack free.',
    price: 2800,
    image: '/dining_table.png',
    badge: null,
    materials: ['#8B5E3C', '#4E2C15', '#6B4226'],
  },
  {
    id: 'oak-writing-desk',
    name: 'Quill Writing Desk',
    category: 'office',
    desc: 'White oak and leather inlay desk with hidden cable management.',
    price: 3350,
    image: '/armchair.png',
    badge: 'bestseller',
    materials: ['#C9A87C', '#8B6B4C', '#D4A853'],
  },
  {
    id: 'ash-sideboard',
    name: 'Mira Sideboard',
    category: 'dining',
    desc: 'Solid ash with herringbone veneer doors and brass pull handles.',
    price: 4600,
    image: '/coffee_table.png',
    badge: null,
    materials: ['#D0B896', '#9A7A5A', '#B8860B'],
  },
  {
    id: 'linen-sofa',
    name: 'Haven Sofa',
    category: 'living',
    desc: 'Three-seater sofa with hand-tied springs, deep seat cushions, and linen upholstery.',
    price: 5200,
    image: '/armchair.png',
    badge: null,
    materials: ['#E8DFD0', '#C4B4A0', '#8B7355'],
  },
];

const PIECES = [
  { id: 'sofa',         name: 'Sofa',        icon: '🛋️',  basePrice: 4500 },
  { id: 'armchair',    name: 'Armchair',    icon: '🪑',  basePrice: 2450 },
  { id: 'dining-table',name: 'Dining Table',icon: '🍽️',  basePrice: 3850 },
  { id: 'coffee-table',name: 'Coffee Table',icon: '☕',  basePrice: 2200 },
  { id: 'bed-frame',   name: 'Bed Frame',   icon: '🛏️',  basePrice: 4200 },
  { id: 'shelving',    name: 'Shelving Unit',icon: '📚', basePrice: 2800 },
  { id: 'desk',        name: 'Writing Desk', icon: '🖊️', basePrice: 3100 },
  { id: 'sideboard',   name: 'Sideboard',   icon: '🗄️',  basePrice: 4000 },
];

// ─── STATE ─────────────────────────────────────
const state = {
  cart: [],
  wishlist: new Set(),
  currentFilter: 'all',
  currentTestimonial: 0,
  orderFormStep: 1,
  orderData: {
    piece: null,
    material: 'walnut',
    finish: 'natural',
    upholstery: 'none',
    dimension: 'standard',
    notes: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    address: '',
    timeline: 'standard',
    basePrice: 0,
  },
};

// ─── INIT ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNavbar();
  initMobileMenu();
  initAuth();
  initCart();
  initHero();
  initCounters();
  renderProducts();
  initFilters();
  initOrderForm();
  initTestimonials();
  initRevealObserver();
  initContactForm();
  initSmoothNav();
});

// ─── CUSTOM CURSOR ──────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let fx = 0, fy = 0;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    fx += (e.clientX - fx) * 0.12;
    fy += (e.clientY - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
  });

  requestAnimationFrame(function tick() {
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(tick);
  });

  document.querySelectorAll('a, button, .product-card, .piece-option, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ─── AUTH ───────────────────────────────────────
function initAuth() {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const btn = document.getElementById('nav-signin-btn');
  if (!btn) return;

  if (userStr && token) {
    try {
      const user = JSON.parse(userStr);
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${user.firstName}`;
      btn.href = '#';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Sign out of Furnicher?')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
        }
      });
    } catch (_) { /* ignore parse errors */ }
  }
}

// ─── NAVBAR ─────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ─── MOBILE MENU ────────────────────────────────
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ─── CART ───────────────────────────────────────
function initCart() {
  const cartBtn     = document.getElementById('cart-btn');
  const cartClose   = document.getElementById('cart-close');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartSidebar = document.getElementById('cart-sidebar');

  function openCart() {
    cartSidebar?.classList.add('open');
    cartOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartSidebar?.classList.remove('open');
    cartOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  cartBtn?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  document.getElementById('cart-checkout-btn')?.addEventListener('click', () => {
    closeCart();
    document.querySelector('#order')?.scrollIntoView({ behavior: 'smooth' });
  });
}

function addToCart(product) {
  const existing = state.cart.find(i => i.id === product.id);
  if (!existing) {
    state.cart.push({ ...product, qty: 1 });
  }
  renderCart();
  showToast(`${product.name} added to order`);
  updateCartCount();

  // Auto-open cart
  document.getElementById('cart-sidebar')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  renderCart();
  updateCartCount();
}

function renderCart() {
  const itemsEl  = document.getElementById('cart-items');
  const emptyEl  = document.getElementById('cart-empty');
  const footerEl = document.getElementById('cart-footer');
  const totalEl  = document.getElementById('cart-total-price');

  if (!itemsEl) return;

  if (state.cart.length === 0) {
    if (emptyEl) emptyEl.style.display = '';
    if (footerEl) footerEl.style.display = 'none';
    itemsEl.innerHTML = '';
    itemsEl.appendChild(emptyEl || document.createElement('div'));
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (footerEl) footerEl.style.display = '';

  let html = '';
  let total = 0;
  state.cart.forEach(item => {
    total += item.price;
    html += `
      <div class="cart-item-row" id="cart-row-${item.id}">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-detail">${item.category} · Solid Walnut</div>
          <div class="cart-item-price">$${item.price.toLocaleString()}</div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove ${item.name}">✕</button>
      </div>
    `;
  });

  itemsEl.innerHTML = html;
  if (totalEl) totalEl.textContent = '$' + total.toLocaleString();

  itemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });
}

function updateCartCount() {
  const countEl = document.getElementById('cart-count');
  if (!countEl) return;
  countEl.textContent = state.cart.length;
  if (state.cart.length > 0) {
    countEl.classList.add('visible');
  } else {
    countEl.classList.remove('visible');
  }
}

// ─── TOAST ──────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById('toast-notif');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notif';
    toast.style.cssText = `
      position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(80px);
      background:var(--walnut);color:var(--cream);padding:0.85rem 1.75rem;
      border-radius:100px;font-size:0.85rem;z-index:9999;
      box-shadow:0 8px 32px rgba(44,24,16,0.25);
      transition:transform 0.4s cubic-bezier(0.22,1,0.36,1);
      white-space:nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
  }, 2800);
}

// ─── HERO ───────────────────────────────────────
function initHero() {
  const img = document.getElementById('hero-bg-img');
  if (img) {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  }
}

// ─── COUNTERS ───────────────────────────────────
function initCounters() {
  function animateCount(el, target, suffix = '') {
    let start = 0;
    const duration = 2000;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(document.getElementById('stat-pieces'), 2400);
        animateCount(document.getElementById('stat-years'),  15);
        animateCount(document.getElementById('stat-clients'), 890);
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) observer.observe(statsEl);
}

// ─── PRODUCTS ───────────────────────────────────
function renderProducts(filter = 'all') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const filtered = filter === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === filter);

  filtered.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.id = `product-${p.id}`;
    card.setAttribute('data-category', p.category);

    const badgeHtml = p.badge
      ? `<div class="card-badge ${p.badge}">${p.badge === 'bestseller' ? '★ Bestseller' : 'New'}</div>`
      : '';

    const dotsHtml = p.materials
      .map((c, j) => `<span class="mat-dot" id="mat-${p.id}-${j}" style="background:${c}" title="Material option"></span>`)
      .join('');

    const isWishlisted = state.wishlist.has(p.id);

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
        ${badgeHtml}
        <button class="card-wishlist ${isWishlisted ? 'active' : ''}" data-id="${p.id}" id="wish-${p.id}" aria-label="Wishlist ${p.name}">
          ${isWishlisted ? '♥' : '♡'}
        </button>
        <button class="card-quick-order" data-id="${p.id}" id="quick-${p.id}">+ Add to Order</button>
      </div>
      <div class="card-body">
        <div class="card-category">${p.category}</div>
        <h3 class="card-name">${p.name}</h3>
        <p class="card-desc">${p.desc}</p>
        <div class="card-footer">
          <span class="card-price">$${p.price.toLocaleString()}</span>
          <div class="card-materials">${dotsHtml}</div>
        </div>
      </div>
    `;

    grid.appendChild(card);

    // Stagger reveal
    setTimeout(() => card.classList.add('card-visible'), i * 80);

    // Wishlist toggle
    card.querySelector('.card-wishlist').addEventListener('click', (e) => {
      e.stopPropagation();
      const btn = e.currentTarget;
      if (state.wishlist.has(p.id)) {
        state.wishlist.delete(p.id);
        btn.textContent = '♡';
        btn.classList.remove('active');
        showToast(`${p.name} removed from wishlist`);
      } else {
        state.wishlist.add(p.id);
        btn.textContent = '♥';
        btn.classList.add('active');
        showToast(`${p.name} added to wishlist`);
      }
    });

    // Quick add to cart
    card.querySelector('.card-quick-order').addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(p);
    });
  });
}

// ─── FILTERS ────────────────────────────────────
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      state.currentFilter = filter;
      renderProducts(filter);
    });
  });
}

// ─── ORDER FORM ─────────────────────────────────
function initOrderForm() {
  renderPieceSelector();
  updatePriceEstimate();

  // Step navigation
  document.querySelectorAll('.step-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = parseInt(btn.dataset.next);
      if (validateStep(state.orderFormStep)) {
        goToStep(next);
      }
    });
  });

  document.querySelectorAll('.step-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      goToStep(parseInt(btn.dataset.prev));
    });
  });

  // Price recalculation
  document.getElementById('material-select')?.addEventListener('change', updatePriceEstimate);
  document.getElementById('upholstery-select')?.addEventListener('change', updatePriceEstimate);
  document.getElementById('dimension-select')?.addEventListener('change', (e) => {
    const customGroup = document.getElementById('custom-dims-group');
    if (customGroup) {
      customGroup.style.display = e.target.value === 'custom' ? '' : 'none';
    }
    updatePriceEstimate();
  });
  document.getElementById('timeline-select')?.addEventListener('change', updatePriceEstimate);

  // Finish options
  document.querySelectorAll('.finish-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.finish-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      state.orderData.finish = opt.querySelector('input').value;
    });
  });

  // Form submit
  document.getElementById('order-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!document.getElementById('terms-check')?.checked) {
      showToast('Please agree to the Terms & Conditions');
      return;
    }
    submitOrder();
  });
}

function renderPieceSelector() {
  const container = document.getElementById('piece-selector');
  if (!container) return;

  container.innerHTML = PIECES.map(p => `
    <div class="piece-option" id="piece-opt-${p.id}" data-id="${p.id}" data-price="${p.basePrice}">
      <div class="piece-icon">${p.icon}</div>
      <div class="piece-name">${p.name}</div>
      <div class="piece-price-tag">from $${p.basePrice.toLocaleString()}</div>
    </div>
  `).join('');

  container.querySelectorAll('.piece-option').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.piece-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.orderData.piece = opt.dataset.id;
      state.orderData.basePrice = parseInt(opt.dataset.price);
      updatePriceEstimate();
    });
  });

  // Default select first
  const first = container.querySelector('.piece-option');
  if (first) {
    first.classList.add('selected');
    state.orderData.piece = first.dataset.id;
    state.orderData.basePrice = parseInt(first.dataset.price);
  }
}

function updatePriceEstimate() {
  const base = state.orderData.basePrice || 2450;
  const matEl = document.getElementById('material-select');
  const upholEl = document.getElementById('upholstery-select');
  const dimEl = document.getElementById('dimension-select');
  const timeEl = document.getElementById('timeline-select');

  const matDelta   = matEl   ? parseInt(matEl.selectedOptions[0]?.dataset.price || 0) : 0;
  const upholDelta = upholEl ? parseInt(upholEl.selectedOptions[0]?.dataset.price || 0) : 0;
  const dimDelta   = dimEl   ? parseInt(dimEl.selectedOptions[0]?.dataset.price || 0) : 0;
  const timeDelta  = timeEl  ? parseInt(timeEl.selectedOptions[0]?.dataset.price || 0) : 0;

  const total = base + matDelta + upholDelta + dimDelta + timeDelta;
  const el = document.getElementById('price-estimate');
  if (el) {
    el.style.transform = 'scale(1.12)';
    el.textContent = '$' + total.toLocaleString();
    setTimeout(() => el.style.transform = 'scale(1)', 300);
  }

  state.orderData.estimatedPrice = total;
}

function validateStep(step) {
  if (step === 1) {
    if (!state.orderData.piece) {
      showToast('Please select a furniture piece');
      return false;
    }
  }
  if (step === 3) {
    const fn  = document.getElementById('first-name')?.value.trim();
    const ln  = document.getElementById('last-name')?.value.trim();
    const em  = document.getElementById('email')?.value.trim();
    const cnt = document.getElementById('country-select')?.value;
    const adr = document.getElementById('address')?.value.trim();
    if (!fn || !ln) { showToast('Please enter your name'); return false; }
    if (!em || !em.includes('@')) { showToast('Please enter a valid email'); return false; }
    if (!cnt) { showToast('Please select your country'); return false; }
    if (!adr) { showToast('Please enter your delivery address'); return false; }
  }
  return true;
}

function goToStep(step) {
  // Hide current
  document.querySelector(`.form-step.active`)?.classList.remove('active');
  // Show next
  const nextStep = document.getElementById(`form-step-${step}`);
  if (nextStep) {
    nextStep.classList.add('active');
    nextStep.style.display = '';
  }

  // Update progress
  document.querySelectorAll('.progress-step').forEach(ps => {
    const n = parseInt(ps.dataset.step);
    ps.classList.remove('active', 'done');
    if (n === step) ps.classList.add('active');
    if (n < step)  ps.classList.add('done');
  });

  state.orderFormStep = step;

  if (step === 4) renderReview();

  // Scroll to form
  document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderReview() {
  const card = document.getElementById('review-card');
  if (!card) return;

  const pieceObj = PIECES.find(p => p.id === state.orderData.piece);
  const matEl    = document.getElementById('material-select');
  const upholEl  = document.getElementById('upholstery-select');
  const dimEl    = document.getElementById('dimension-select');
  const timeEl   = document.getElementById('timeline-select');

  const fn  = document.getElementById('first-name')?.value || '';
  const ln  = document.getElementById('last-name')?.value  || '';
  const em  = document.getElementById('email')?.value      || '';
  const cnt = document.getElementById('country-select')?.value || '';
  const adr = document.getElementById('address')?.value    || '';

  const rows = [
    ['Piece',       pieceObj?.name || '—'],
    ['Material',    matEl?.value   || '—'],
    ['Finish',      state.orderData.finish],
    ['Upholstery',  upholEl?.value || '—'],
    ['Size',        dimEl?.value   || 'standard'],
    ['Lead Time',   timeEl?.value  || 'standard'],
    ['Name',        `${fn} ${ln}`],
    ['Email',       em],
    ['Country',     cnt],
    ['Address',     adr],
  ];

  card.innerHTML = rows.map(([label, value]) => `
    <div class="review-row">
      <span class="review-row-label">${label}</span>
      <span class="review-row-value">${value}</span>
    </div>
  `).join('') + `
    <div class="review-row">
      <span class="review-row-label">Estimated Total</span>
      <span class="review-row-value review-total">$${(state.orderData.estimatedPrice || 0).toLocaleString()}</span>
    </div>
  `;
}

function submitOrder() {
  const ref = 'FCH-' + Date.now().toString(36).toUpperCase();
  document.getElementById('order-ref').textContent = ref;

  // Hide current step, show success
  document.querySelector('.form-step.active')?.classList.remove('active');
  const success = document.getElementById('form-step-success');
  if (success) {
    success.style.display = '';
    success.classList.add('active');
  }

  // Update progress - all done
  document.querySelectorAll('.progress-step').forEach(ps => {
    ps.classList.remove('active');
    ps.classList.add('done');
  });

  showToast('🎉 Commission submitted successfully!');
  state.orderFormStep = 5;

  // Reset state for next visit
  state.orderData = {
    piece: null, material: 'walnut', finish: 'natural',
    upholstery: 'none', dimension: 'standard', notes: '',
    firstName: '', lastName: '', email: '', phone: '',
    country: '', address: '', timeline: 'standard', basePrice: 0
  };
}

// ─── TESTIMONIALS ───────────────────────────────
function initTestimonials() {
  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('test-dots');
  const cards = document.querySelectorAll('.testimonial-card');
  const total = cards.length;
  if (!track || total === 0) return;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `test-dot ${i === 0 ? 'active' : ''}`;
    dot.id = `test-dot-${i}`;
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goToTestimonial(i));
    dotsContainer?.appendChild(dot);
  });

  document.getElementById('test-prev')?.addEventListener('click', () => {
    goToTestimonial((state.currentTestimonial - 1 + total) % total);
  });

  document.getElementById('test-next')?.addEventListener('click', () => {
    goToTestimonial((state.currentTestimonial + 1) % total);
  });

  // Auto-advance
  setInterval(() => {
    goToTestimonial((state.currentTestimonial + 1) % total);
  }, 6000);
}

function goToTestimonial(index) {
  const track = document.getElementById('testimonials-track');
  if (!track) return;

  state.currentTestimonial = index;
  const cardWidth = track.parentElement?.offsetWidth || 0;
  track.style.transform = `translateX(-${index * (cardWidth + 24)}px)`;

  document.querySelectorAll('.test-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// ─── INTERSECTION OBSERVER (Reveal) ─────────────
function initRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

// ─── CONTACT FORM ───────────────────────────────
function initContactForm() {
  document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('c-name')?.value.trim();
    const email = document.getElementById('c-email')?.value.trim();
    const subject = document.getElementById('c-subject')?.value.trim();
    const msg = document.getElementById('c-message')?.value.trim();

    if (!name || !email || !msg) {
      showToast('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message: msg }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ Message sent! We\'ll reply within 24 hours.');
        e.target.reset();
      } else {
        showToast(data.message || 'Failed to send message');
      }
    } catch (_) {
      showToast('Connection error. Please try again.');
    }
  });
}

// ─── SMOOTH NAV ─────────────────────────────────
function initSmoothNav() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Parallax hero
  window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-bg-img');
    if (hero) {
      const scrolled = window.scrollY;
      hero.style.transform = `scale(1) translateY(${scrolled * 0.3}px)`;
    }
  }, { passive: true });

  // Testimonials responsive resize
  window.addEventListener('resize', () => {
    goToTestimonial(state.currentTestimonial);
  });
}
