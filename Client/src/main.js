/* =============================================
   JANGID — Main JavaScript
   "And Verity" Editorial Luxury Mode
   ============================================= */

import API_BASE from './config.js';
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
  refreshUserProfile(); // async — fetches latest user profile, updates form if needed
  initTestimonials();
  initRevealObserver();
  initContactForm();
  initSmoothNav();
  initNavSearch();
  initCompanyInfo();
  initFeaturedTypes();
});

// ─── CUSTOM CURSOR (disabled — using regular cursor) ──
function initCursor() {
  // Custom cursor disabled — regular system cursor is used
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (cursor) cursor.style.display = 'none';
  if (follower) follower.style.display = 'none';
}

// ─── AUTH ───────────────────────────────────────
function initAuth() {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const container = document.getElementById('nav-signin-btn');
  if (!container) return;

  if (userStr && token) {
    try {
      const user = JSON.parse(userStr);
      container.classList.add('logged-in');
      container.innerHTML = `
        <div class="user-dropdown">
          <button class="user-dropdown-trigger">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${user.role === 'ADMIN' ? 'Jangid' : user.firstName}
            <svg class="dropdown-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l4 4 4-4"/></svg>
          </button>
          <div class="dropdown-menu">
            ${user.role === 'ADMIN' ? '<a href="/admin.html" class="dropdown-item">Admin Panel</a>' : ''}
            <a href="/orders.html" class="dropdown-item">My Orders</a>
            <button class="dropdown-item" id="logout-btn">Sign Out</button>
          </div>
        </div>`;

      container.querySelector('.user-dropdown-trigger').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.querySelector('.dropdown-menu').classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        const menu = container.querySelector('.dropdown-menu');
        if (menu && !container.contains(e.target)) {
          menu.classList.remove('open');
        }
      });

      container.querySelector('#logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      });

      // Update mobile menu sign-in → user name + sign out
      const mobSignin = document.getElementById('mob-signin');
      if (mobSignin) {
        const links = [];
        if (user.role === 'ADMIN') links.push('<a href="/admin.html" class="mobile-link">Admin Panel</a>');
        links.push('<a href="/orders.html" class="mobile-link">My Orders</a>');
        mobSignin.outerHTML = `
          <div class="mobile-user">
            <span class="mobile-user-name">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ${user.role === 'ADMIN' ? 'Jangid' : user.firstName}
            </span>
            ${links.join('')}
            <button class="mobile-link mobile-signout" id="mob-signout">Sign Out</button>
          </div>`;
        document.getElementById('mob-signout')?.addEventListener('click', () => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.reload();
        });
      }
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
    // Navigate to the order section
    document.querySelector('#order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Pre-populate the order form from cart + user session
    setTimeout(() => {
      prefillOrderFromCart();
      prefillUserDetails();
    }, 500);
  });
}

function addToCart(product) {
  const existing = state.cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
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

function updateCartQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  const newQty = item.qty + delta;
  if (newQty <= 0) {
    removeFromCart(id);
    return;
  }
  item.qty = newQty;
  renderCart();
  updateCartCount();
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
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    html += `
      <div class="cart-item-row" id="cart-row-${item.id}">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-detail">${item.category} · Solid Walnut</div>
          <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
        </div>
        <div class="cart-item-qty">
          <button class="cart-qty-btn" data-id="${item.id}" data-delta="-1">−</button>
          <span class="cart-qty-value">${item.qty}</span>
          <button class="cart-qty-btn" data-id="${item.id}" data-delta="1">+</button>
        </div>
        <div class="cart-item-line-total">₹${lineTotal.toLocaleString()}</div>
        <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove ${item.name}">✕</button>
      </div>
    `;
  });

  itemsEl.innerHTML = html;
  if (totalEl) totalEl.textContent = '₹' +  total.toLocaleString();

  itemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });
  itemsEl.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => updateCartQty(btn.dataset.id, parseInt(btn.dataset.delta)));
  });
}

function updateCartCount() {
  const countEl = document.getElementById('cart-count');
  if (!countEl) return;
  const totalQty = state.cart.reduce((sum, i) => sum + i.qty, 0);
  countEl.textContent = totalQty;
  if (totalQty > 0) {
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

// ─── HERO CAROUSEL ──────────────────────────────
let heroSlides = [];
let heroCurrent = 0;
let heroTimer = null;

async function initHero() {
  const bg = document.getElementById('hero-bg');
  const tag = document.getElementById('hero-tag');
  const title = document.getElementById('hero-title');
  const subtitle = document.getElementById('hero-subtitle');
  const dots = document.getElementById('hero-dots');
  if (!bg) return;

  try {
    const res = await fetch(`${API_BASE}/api/settings/hero-slides`);
    const data = await res.json();
    heroSlides = data.slides || [];
  } catch (_) {}

  if (heroSlides.length === 0) {
    bg.style.background = 'linear-gradient(135deg, #1a0f0a 0%, #2c1810 50%, #4a2e1e 100%)';
    if (title) title.innerHTML = 'Furniture <span class="italic">crafted</span> with soul.';
    if (tag) tag.textContent = 'Est. 2009 · Artisan Workshop';
    if (subtitle) subtitle.textContent = 'Every piece tells a story. Handmade to order using sustainably sourced solid woods and premium upholstery — built to be passed down through generations.';
    return;
  }

  function showSlide(index) {
    const s = heroSlides[index];
    if (!s) return;
    const prev = heroSlides[heroCurrent];
    const transition = s.transition || 'zoom';

    // Remove all transition classes
    bg.classList.remove('hero-trans-zoom', 'hero-trans-fade', 'hero-trans-slide-left', 'hero-trans-slide-up', 'hero-trans-none');

    bg.style.backgroundImage = `url(${s.imageUrl})`;
    bg.style.backgroundSize = 'cover';
    bg.style.backgroundPosition = 'center';

    if (tag) tag.textContent = s.subtitle || 'Jangid · Artisan Workshop';
    if (title) title.innerHTML = s.title ? s.title.replace(/\n/g, '<br>') : 'Jangid';
    if (subtitle) {
      subtitle.textContent = s.subtitle || '';
      subtitle.style.display = s.subtitle ? '' : 'none';
    }
    if (dots) {
      dots.innerHTML = heroSlides.map((_, i) =>
        `<button class="hero-dot ${i === index ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i+1}"></button>`
      ).join('');
      dots.querySelectorAll('.hero-dot').forEach(btn => {
        btn.addEventListener('click', () => { clearInterval(heroTimer); showSlide(parseInt(btn.dataset.index)); startTimer(); });
      });
    }

    // Force reflow then add transition class
    void bg.offsetWidth;
    bg.classList.add('hero-trans-' + transition);

    heroCurrent = index;
  }

  function startTimer() {
    if (heroTimer) clearInterval(heroTimer);
    if (heroSlides.length > 1) {
      heroTimer = setInterval(() => showSlide((heroCurrent + 1) % heroSlides.length), 6000);
    }
  }

  showSlide(0);
  startTimer();
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
          <span class="card-price">₹${p.price.toLocaleString()}</span>
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

  // Auto-fill from localStorage immediately (no delay)
  prefillUserDetails();

  // Show a sign-in nudge in Step 3 for guests
  const token = localStorage.getItem('token');
  const guestNotice = document.getElementById('order-guest-notice');
  if (guestNotice) guestNotice.style.display = token ? 'none' : '';

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

// Refresh user profile in background (doesn't block form init)
async function refreshUserProfile() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const r = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (d.success) {
      const existing = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...existing, ...d.user }));
      // Re-prefill in case new fields arrived
      prefillUserDetails();
    }
  } catch (_) {}
}

function renderPieceSelector() {
  const container = document.getElementById('piece-selector');
  if (!container) return;

  container.innerHTML = PIECES.map(p => `
    <div class="piece-option" id="piece-opt-${p.id}" data-id="${p.id}" data-price="${p.basePrice}">
      <div class="piece-icon">${p.icon}</div>
      <div class="piece-name">${p.name}</div>
      <div class="piece-price-tag">from ₹${p.basePrice.toLocaleString()}</div>
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
    el.textContent = '₹' +  total.toLocaleString();
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
      <span class="review-row-value review-total">₹${(state.orderData.estimatedPrice || 0).toLocaleString()}</span>
    </div>
  `;
}

// ─── PREFILL ORDER FORM FROM CART ──────────────────────────
function prefillOrderFromCart() {
  if (state.cart.length === 0) return;
  // Map product category → closest PIECE id
  const catToPiece = {
    living:  ['armchair', 'sofa', 'coffee-table'],
    dining:  ['dining-table', 'sideboard'],
    bedroom: ['bed-frame'],
    office:  ['desk', 'shelving'],
  };
  const firstItem   = state.cart[0];
  const candidates  = catToPiece[firstItem.category] || [];
  let matched = false;
  for (const pieceId of candidates) {
    const opt = document.querySelector(`.piece-option[data-id="${pieceId}"]`);
    if (opt) {
      document.querySelectorAll('.piece-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.orderData.piece    = opt.dataset.id;
      state.orderData.basePrice = parseInt(opt.dataset.price) || 2450;
      updatePriceEstimate();
      matched = true;
      break;
    }
  }
  // Advance form to step 2 so the user sees their piece already selected
  if (matched && state.orderFormStep === 1) {
    goToStep(2);
  }
}

// ─── PREFILL USER DETAILS ──────────────────────────────
function prefillUserDetails() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    set('first-name',     user.firstName);
    set('last-name',      user.lastName);
    set('email',          user.email);
    set('phone',          user.phone);
    set('country-select', user.country);
    set('address',        user.address);
  } catch (_) {}
}

// ─── SHOW ORDER SUCCESS SCREEN ────────────────────────
function showOrderSuccess(ref) {
  const refEl = document.getElementById('order-ref');
  if (refEl) refEl.textContent = ref;
  document.querySelector('.form-step.active')?.classList.remove('active');
  const success = document.getElementById('form-step-success');
  if (success) { success.style.display = ''; success.classList.add('active'); }
  document.querySelectorAll('.progress-step').forEach(ps => { ps.classList.remove('active'); ps.classList.add('done'); });
  showToast('🎉 Commission submitted successfully!');
  state.orderFormStep = 5;
  // Reset form state
  state.orderData = {
    piece: null, material: 'walnut', finish: 'natural',
    upholstery: 'none', dimension: 'standard', notes: '',
    firstName: '', lastName: '', email: '', phone: '',
    country: '', address: '', timeline: 'standard', basePrice: 0,
  };
  // Clear cart
  state.cart = [];
  renderCart();
  updateCartCount();
}

// ─── SUBMIT ORDER (real API call) ───────────────────────
async function submitOrder() {
  const token = localStorage.getItem('token');
  const deliveryAddress = document.getElementById('address')?.value.trim() || '';
  const country         = document.getElementById('country-select')?.value || '';

  if (!token) {
    // Guest — treat as a quote request (no real DB order)
    showOrderSuccess('FCH-' + Date.now().toString(36).toUpperCase());
    return;
  }

  // Show a loading state on submit button
  const submitBtn = document.getElementById('submit-order');
  const origText  = submitBtn?.querySelector('span')?.textContent;
  if (submitBtn) { submitBtn.disabled = true; submitBtn.querySelector('span').textContent = 'Submitting…'; }

  try {
    // Fetch real DB products to find a matching productId
    const prodRes  = await fetch(`${API_BASE}/api/products`);
    const prodData = await prodRes.json();
    const products = prodData.products || [];

    // Map PIECE id → DB product category
    const pieceToCategory = {
      sofa:           'LIVING',
      armchair:       'LIVING',
      'coffee-table': 'LIVING',
      'dining-table': 'DINING',
      sideboard:      'DINING',
      'bed-frame':    'BEDROOM',
      desk:           'OFFICE',
      shelving:       'OFFICE',
    };
    const wantedCategory = pieceToCategory[state.orderData.piece] || null;

    // Find best matching product (same category first, then any in-stock)
    let product = wantedCategory
      ? products.find(p => p.category === wantedCategory && p.inStock)
      : null;
    if (!product) product = products.find(p => p.inStock);
    if (!product && products.length) product = products[0];

    if (!product) {
      // No products in DB at all — fall back to quote ref
      showOrderSuccess('FCH-' + Date.now().toString(36).toUpperCase());
      return;
    }

    const body = {
      productId:        product.id,
      material:         document.getElementById('material-select')?.value || state.orderData.material,
      finish:           state.orderData.finish,
      upholstery:       document.getElementById('upholstery-select')?.value || null,
      dimension:        document.getElementById('dimension-select')?.value || 'standard',
      customDimensions: document.getElementById('custom-dimensions')?.value || null,
      notes:            document.getElementById('special-notes')?.value || null,
      timeline:         document.getElementById('timeline-select')?.value || 'standard',
      estimatedPrice:   state.orderData.estimatedPrice || product.basePrice,
      deliveryAddress,
      country,
    };

    const res  = await fetch(`${API_BASE}/api/orders`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify(body),
    });
    const data = await res.json();

    if (data.success) {
      const orderId = data.order.id;
      // Save address to profile so we don't ask again
      try {
        const fn = document.getElementById('first-name')?.value.trim();
        const ln = document.getElementById('last-name')?.value.trim();
        const ph = document.getElementById('phone')?.value.trim();
        const addrRes = await fetch(`${API_BASE}/api/auth/me`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ firstName: fn, lastName: ln, phone: ph, country, address: deliveryAddress }),
        });
        const addrData = await addrRes.json();
        if (addrData.success) {
          const existing = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...existing, ...addrData.user }));
        }
      } catch (_) { /* non-blocking */ }
      // Initiate Cashfree payment
      try {
        const payRes = await fetch(`${API_BASE}/api/payments/create-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orderId }),
        });
        const payData = await payRes.json();
        if (payData.success && payData.paymentSessionId) {
          window.Cashfree && new window.Cashfree(payData.paymentSessionId).redirect({ redirectTarget: 'REDIRECT_TARGET_SELF' });
          return;
        }
      } catch (_) {}
      showOrderSuccess(data.order.referenceCode || orderId.slice(0, 8).toUpperCase());
    } else {
      showToast(data.message || 'Failed to place order. Please try again.');
    }
  } catch (err) {
    showToast('Connection error. Please try again.');
    console.error('submitOrder:', err);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      if (submitBtn.querySelector('span')) submitBtn.querySelector('span').textContent = origText || 'Submit Commission';
    }
  }
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
      const res = await fetch(`${API_BASE}/api/contact`, {
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
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Parallax hero
  window.addEventListener('scroll', () => {
    const hero = document.getElementById('hero-bg');
    if (hero) {
      const scrolled = window.scrollY;
      hero.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
  }, { passive: true });

  // Testimonials responsive resize
  window.addEventListener('resize', () => {
    goToTestimonial(state.currentTestimonial);
  });
}

// ─── COMPANY INFO (Dynamic from Admin) ──────────────────
async function initCompanyInfo() {
  try {
    const res = await fetch(`${API_BASE}/api/settings/address`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success || !data.address) return;

    const { name, address, phone, email } = data.address;

    // Contact section
    if (address) {
      const el = document.getElementById('contact-address');
      if (el) el.textContent = address;
    }
    if (phone) {
      const el = document.getElementById('contact-phone');
      if (el) el.textContent = phone;
    }
    if (email) {
      const el = document.getElementById('contact-email');
      if (el) el.textContent = email;
    }
  } catch (_) {
    // Silently fail — hardcoded defaults remain visible
  }
}

// ─── FEATURED TYPES CAROUSEL ────────────────────
async function initFeaturedTypes() {
  const track = document.getElementById('featured-track');
  const dots = document.getElementById('featured-dots');
  const prev = document.getElementById('featured-prev');
  const next = document.getElementById('featured-next');
  if (!track) return;

  try {
    const res = await fetch(`${API_BASE}/api/settings/featured-types`);
    const data = await res.json();
    const types = data.types || [];
    if (types.length === 0) { document.getElementById('featured').style.display = 'none'; return; }

    track.innerHTML = types.map(t => `
      <div class="featured-card">
        <div class="featured-card-img">
          ${t.imageUrl ? `<img src="${t.imageUrl}" alt="${t.name}" loading="lazy" />` : '<div class="featured-card-placeholder"></div>'}
        </div>
        <div class="featured-card-body">
          <h3>${t.name}</h3>
          ${t.description ? `<p>${t.description}</p>` : ''}
          <a href="#collections" class="featured-card-link">Explore →</a>
        </div>
      </div>
    `).join('');

    const cards = track.querySelectorAll('.featured-card');
    let current = 0;
    const perView = window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 2 : 3;
    const max = Math.max(0, cards.length - perView);

    function updateCarousel() {
      cards.forEach((c, i) => {
        c.classList.toggle('active', i >= current && i < current + perView);
      });
      if (dots) {
        const dotCount = Math.max(1, cards.length - perView + 1);
        dots.innerHTML = Array.from({ length: dotCount }, (_, i) =>
          `<button class="featured-dot ${i === current ? 'active' : ''}" data-idx="${i}"></button>`
        ).join('');
        dots.querySelectorAll('.featured-dot').forEach(btn => {
          btn.addEventListener('click', () => { current = parseInt(btn.dataset.idx); updateCarousel(); });
        });
      }
    }

    prev?.addEventListener('click', () => { if (current > 0) { current--; updateCarousel(); } });
    next?.addEventListener('click', () => { if (current < max) { current++; updateCarousel(); } });

    // Touch swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.changedTouches[0].screenX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && current < max) { current++; updateCarousel(); }
        else if (diff < 0 && current > 0) { current--; updateCarousel(); }
      }
    }, { passive: true });

    // Recalculate perView on resize
    window.addEventListener('resize', () => {
      const v = window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 2 : 3;
      if (v !== perView) location.reload(); // simple approach: refresh to re-render
    });

    updateCarousel();
  } catch (_) {
    document.getElementById('featured').style.display = 'none';
  }
}

// ─── NAVBAR SEARCH ──────────────────────────────
function initNavSearch() {
  const toggleBtn  = document.getElementById('nav-search-toggle');
  const searchBox  = document.getElementById('nav-search-box');
  const searchInput = document.getElementById('nav-search-input');
  const clearBtn   = document.getElementById('nav-search-clear');
  const navSearch  = document.getElementById('nav-search');

  if (!toggleBtn || !searchBox || !searchInput) return;

  // Create results dropdown
  const resultsEl = document.createElement('div');
  resultsEl.className = 'nav-search-results';
  resultsEl.id = 'nav-search-results';
  navSearch.appendChild(resultsEl);

  let isOpen = false;

  function openSearch() {
    isOpen = true;
    searchBox.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    setTimeout(() => searchInput.focus(), 50);
  }

  function closeSearch() {
    isOpen = false;
    searchBox.classList.remove('open');
    resultsEl.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    searchInput.value = '';
    clearBtn.classList.remove('visible');
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen ? closeSearch() : openSearch();
  });

  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    resultsEl.classList.remove('open');
    searchInput.focus();
  });

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    clearBtn.classList.toggle('visible', query.length > 0);

    if (query.length < 1) {
      resultsEl.classList.remove('open');
      return;
    }

    const matches = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.desc.toLowerCase().includes(query)
    ).slice(0, 5);

    if (matches.length === 0) {
      resultsEl.innerHTML = `<div class="search-no-results">No results for "${searchInput.value}"</div>`;
    } else {
      resultsEl.innerHTML = matches.map(p => `
        <div class="search-result-item" data-id="${p.id}" tabindex="0">
          <img class="search-result-img" src="${p.image}" alt="${p.name}" loading="lazy" />
          <div class="search-result-info">
            <div class="search-result-name">${p.name}</div>
            <div class="search-result-cat">${p.category}</div>
          </div>
          <span class="search-result-price">₹${p.price.toLocaleString()}</span>
        </div>
      `).join('');

      resultsEl.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.dataset.id;
          // Set filter and scroll to collections
          const catMap = { living:'living', dining:'dining', bedroom:'bedroom', office:'office' };
          const product = PRODUCTS.find(p => p.id === id);
          if (product) {
            const filterBtn = document.querySelector(`.filter-btn[data-filter="${product.category}"]`);
            if (filterBtn) filterBtn.click();
          }
          document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
          closeSearch();
        });

        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') item.click();
        });
      });
    }

    resultsEl.classList.add('open');
  });

  // Keyboard: Escape closes search
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
  });

  // Click outside closes
  document.addEventListener('click', (e) => {
    if (isOpen && !navSearch.contains(e.target)) {
      closeSearch();
    }
  });
}
