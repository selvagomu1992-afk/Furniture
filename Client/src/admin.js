import './admin.css';

const API = '/api/admin';

function getToken() { return localStorage.getItem('token'); }
function getHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }; }

function showToast(msg) {
  const t = document.getElementById('admin-toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

function openModal(title, bodyHtml) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  document.getElementById('modal').classList.add('open');
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.getElementById('modal-overlay').classList.remove('open');
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', closeModal);

// ─── Auth Guard ──────────────────────────────
(function checkAuth() {
  const user = localStorage.getItem('user');
  const token = getToken();
  if (!user || !token) { window.location.href = '/login.html'; return; }
  try {
    const u = JSON.parse(user);
    if (u.role !== 'ADMIN') { window.location.href = '/index.html'; return; }
    document.querySelector('.admin-badge').textContent = u.firstName;
  } catch { window.location.href = '/login.html'; }
})();

// ─── Navigation ──────────────────────────────
document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item[data-section]').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    const section = document.getElementById(`section-${btn.dataset.section}`);
    if (section) section.classList.add('active');
  });
});

document.getElementById('back-to-site').addEventListener('click', () => window.location.href = '/index.html');
document.getElementById('signout-btn').addEventListener('click', () => {
  localStorage.removeItem('token'); localStorage.removeItem('user');
  window.location.href = '/login.html';
});

// ─── API helpers ──────────────────────────────
async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, { ...options, headers: { ...getHeaders(), ...options.headers } });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Request failed');
  return data;
}

// ─── Dashboard ───────────────────────────────
async function loadDashboard() {
  try {
    const data = await api('/dashboard');
    document.getElementById('stat-users').textContent = data.stats.totalUsers;
    document.getElementById('stat-products').textContent = data.stats.totalProducts;
    document.getElementById('stat-orders').textContent = data.stats.totalOrders;
    document.getElementById('stat-collections').textContent = data.stats.totalCollections;
    document.getElementById('stat-revenue').textContent = `$${(data.stats.totalRevenue || 0).toLocaleString()}`;
    document.getElementById('stat-messages').textContent = data.stats.totalContactMessages;

    const container = document.getElementById('orders-by-status');
    if (data.ordersByStatus?.length) {
      container.innerHTML = `<div class="status-bar">${data.ordersByStatus.map(o => `<span class="status-item ${o.status}">${o.status}: ${o.count}</span>`).join('')}</div>`;
    } else {
      container.innerHTML = '<p class="muted">No orders yet</p>';
    }
  } catch (e) { showToast(`Dashboard: ${e.message}`); }
}

// ─── Collections ─────────────────────────────
async function loadCollections() {
  try {
    const data = await api('/collections');
    const tbody = document.getElementById('collections-tbody');
    tbody.innerHTML = data.collections.map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td>${c.slug}</td>
        <td>${c._count?.products ?? 0}</td>
        <td>
          <div class="action-group">
            <button class="btn-secondary" onclick="editCollection('${c.id}')">Edit</button>
            <button class="btn-danger" onclick="deleteCollection('${c.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (e) { showToast(`Collections: ${e.message}`); }
}

document.getElementById('add-collection-btn').addEventListener('click', () => {
  openModal('New Collection', `
    <form class="admin-form" id="collection-form">
      <div class="form-group"><label>Name</label><input type="text" id="col-name" class="form-input" required /></div>
      <div class="form-group"><label>Slug</label><input type="text" id="col-slug" class="form-input" required /></div>
      <div class="form-group"><label>Description</label><textarea id="col-desc" class="form-input" rows="3"></textarea></div>
      <button type="submit" class="btn-primary">Create</button>
    </form>
  `);
  document.getElementById('collection-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/collections', {
        method: 'POST',
        body: JSON.stringify({
          name: document.getElementById('col-name').value,
          slug: document.getElementById('col-slug').value,
          description: document.getElementById('col-desc').value,
        }),
      });
      closeModal(); showToast('Collection created'); loadCollections();
    } catch (e) { showToast(e.message); }
  });
});

window.editCollection = async (id) => {
  try {
    const data = await api(`/collections`);
    const col = data.collections.find(c => c.id === id);
    if (!col) return;
    openModal('Edit Collection', `
      <form class="admin-form" id="collection-form">
        <div class="form-group"><label>Name</label><input type="text" id="col-name" class="form-input" value="${col.name}" required /></div>
        <div class="form-group"><label>Slug</label><input type="text" id="col-slug" class="form-input" value="${col.slug}" required /></div>
        <div class="form-group"><label>Description</label><textarea id="col-desc" class="form-input" rows="3">${col.description || ''}</textarea></div>
        <button type="submit" class="btn-primary">Save</button>
      </form>
    `);
    document.getElementById('collection-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api(`/collections/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: document.getElementById('col-name').value,
            slug: document.getElementById('col-slug').value,
            description: document.getElementById('col-desc').value,
          }),
        });
        closeModal(); showToast('Collection updated'); loadCollections();
      } catch (e) { showToast(e.message); }
    });
  } catch (e) { showToast(e.message); }
};

window.deleteCollection = async (id) => {
  if (!confirm('Delete this collection? Products will be unlinked.')) return;
  try { await api(`/collections/${id}`, { method: 'DELETE' }); showToast('Collection deleted'); loadCollections(); }
  catch (e) { showToast(e.message); }
};

// ─── Products ────────────────────────────────
async function loadProducts() {
  try {
    const data = await api('/products');
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = data.products.map(p => `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td>${p.category}</td>
        <td>$${p.basePrice.toLocaleString()}</td>
        <td>${p.collection?.name || '—'}</td>
        <td><span class="badge-stock ${p.inStock ? 'in' : 'out'}">${p.inStock ? 'In Stock' : 'Out'}</span></td>
        <td>
          <div class="action-group">
            <button class="btn-secondary" onclick="editProduct('${p.id}')">Edit</button>
            <button class="btn-danger" onclick="deleteProduct('${p.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (e) { showToast(`Products: ${e.message}`); }
}

let productCollections = [];

document.getElementById('add-product-btn').addEventListener('click', async () => {
  try {
    const cols = await api('/collections');
    productCollections = cols.collections;
    openModal('New Product', getProductFormHtml());
    document.getElementById('product-form').addEventListener('submit', productFormHandler('create'));
  } catch (e) { showToast(e.message); }
});

function getProductFormHtml(p) {
  const cats = ['LIVING','DINING','BEDROOM','OFFICE'];
  const colOpts = productCollections.map(c => `<option value="${c.id}" ${p?.collectionId === c.id ? 'selected' : ''}>${c.name}</option>`).join('');
  return `
    <form class="admin-form" id="product-form">
      <div class="form-group"><label>Name</label><input type="text" id="prod-name" class="form-input" value="${p?.name || ''}" required /></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div class="form-group"><label>Slug</label><input type="text" id="prod-slug" class="form-input" value="${p?.slug || ''}" required /></div>
        <div class="form-group"><label>Category</label><select id="prod-category" class="form-input">${cats.map(c => `<option value="${c}" ${p?.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      </div>
      <div class="form-group"><label>Description</label><textarea id="prod-desc" class="form-input" rows="3">${p?.description || ''}</textarea></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div class="form-group"><label>Base Price ($)</label><input type="number" id="prod-price" class="form-input" value="${p?.basePrice || ''}" step="1" /></div>
        <div class="form-group"><label>Collection</label><select id="prod-collection" class="form-input"><option value="">None</option>${colOpts}</select></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div class="form-group"><label>Badge</label><input type="text" id="prod-badge" class="form-input" value="${p?.badge || ''}" placeholder="new, bestseller" /></div>
        <div class="form-group"><label>In Stock</label><select id="prod-stock" class="form-input"><option value="true" ${p?.inStock !== false ? 'selected' : ''}>Yes</option><option value="false" ${p?.inStock === false ? 'selected' : ''}>No</option></select></div>
      </div>
      <button type="submit" class="btn-primary">${p ? 'Save' : 'Create'}</button>
    </form>
  `;
}

function productFormHandler(mode) {
  return async (e) => {
    e.preventDefault();
    const body = {
      name: document.getElementById('prod-name').value,
      slug: document.getElementById('prod-slug').value,
      category: document.getElementById('prod-category').value,
      description: document.getElementById('prod-desc').value,
      basePrice: parseFloat(document.getElementById('prod-price').value) || 0,
      collectionId: document.getElementById('prod-collection').value || null,
      badge: document.getElementById('prod-badge').value || null,
      inStock: document.getElementById('prod-stock').value === 'true',
    };
    try {
      if (mode === 'create') {
        await api('/products', { method: 'POST', body: JSON.stringify(body) });
        showToast('Product created');
      }
      closeModal(); loadProducts();
    } catch (e) { showToast(e.message); }
  };
}

window.editProduct = async (id) => {
  try {
    const data = await api(`/products/${id}`);
    const p = data.product;
    const cols = await api('/collections');
    productCollections = cols.collections;
    openModal('Edit Product', getProductFormHtml(p));
    document.getElementById('product-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = {
        name: document.getElementById('prod-name').value,
        slug: document.getElementById('prod-slug').value,
        category: document.getElementById('prod-category').value,
        description: document.getElementById('prod-desc').value,
        basePrice: parseFloat(document.getElementById('prod-price').value) || 0,
        collectionId: document.getElementById('prod-collection').value || null,
        badge: document.getElementById('prod-badge').value || null,
        inStock: document.getElementById('prod-stock').value === 'true',
      };
      try {
        await api(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        closeModal(); showToast('Product updated'); loadProducts();
      } catch (e) { showToast(e.message); }
    });
  } catch (e) { showToast(e.message); }
};

window.deleteProduct = async (id) => {
  if (!confirm('Delete this product?')) return;
  try { await api(`/products/${id}`, { method: 'DELETE' }); showToast('Product deleted'); loadProducts(); }
  catch (e) { showToast(e.message); }
};

// ─── Rates ───────────────────────────────────
async function loadRates() {
  try {
    const data = await api('/rates');
    document.getElementById('rate-delivery').value = data.rates.delivery_rate || '';
    document.getElementById('rate-tax').value = data.rates.tax_rate || '';
    document.getElementById('rate-minimum').value = data.rates.minimum_order || '';
  } catch (e) { showToast(`Rates: ${e.message}`); }
}

document.getElementById('rates-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('/rates', {
      method: 'PUT',
      body: JSON.stringify({
        delivery_rate: document.getElementById('rate-delivery').value,
        tax_rate: document.getElementById('rate-tax').value,
        minimum_order: document.getElementById('rate-minimum').value,
      }),
    });
    showToast('Rates saved');
  } catch (e) { showToast(e.message); }
});

// ─── Address ─────────────────────────────────
async function loadAddress() {
  try {
    const data = await api('/address');
    document.getElementById('addr-name').value = data.address.name || '';
    document.getElementById('addr-address').value = data.address.address || '';
    document.getElementById('addr-phone').value = data.address.phone || '';
    document.getElementById('addr-email').value = data.address.email || '';
  } catch (e) { showToast(`Address: ${e.message}`); }
}

document.getElementById('address-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('/address', {
      method: 'PUT',
      body: JSON.stringify({
        company_name: document.getElementById('addr-name').value,
        company_address: document.getElementById('addr-address').value,
        company_phone: document.getElementById('addr-phone').value,
        company_email: document.getElementById('addr-email').value,
      }),
    });
    showToast('Address saved');
  } catch (e) { showToast(e.message); }
});

// ─── Init all sections ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  loadCollections();
  loadProducts();
  loadRates();
  loadAddress();
});
