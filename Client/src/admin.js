import API_BASE from './config.js';
import './admin.css';

const API = `${API_BASE}/api/admin`;

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

// ─── Image Upload Widget ────────────────────
function imageUploadHtml(currentUrl, name) {
  return `
    <div class="image-upload">
      <div class="image-upload-preview" id="${name}-preview">
        ${currentUrl ? `<img src="${currentUrl}" alt="Preview" />` : '<div class="upload-placeholder">No image</div>'}
      </div>
      <div class="image-upload-actions">
        <label class="upload-btn-custom">
          Choose Image
          <input type="file" id="${name}-file" accept="image/jpeg,image/jpg,image/png,image/webp" hidden />
        </label>
        <span class="upload-status" id="${name}-status"></span>
        <input type="hidden" id="${name}-url" value="${currentUrl || ''}" />
      </div>
    </div>
  `;
}

function setupImageUpload(name) {
  const fileInput = document.getElementById(`${name}-file`);
  if (!fileInput) return;
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    const status = document.getElementById(`${name}-status`);
    const preview = document.getElementById(`${name}-preview`);
    const hidden = document.getElementById(`${name}-url`);
    status.textContent = 'Uploading...';
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Upload failed');
      hidden.value = data.url;
      preview.innerHTML = `<img src="${data.url}" alt="Preview" />`;
      status.textContent = '';
    } catch (e) {
      status.textContent = 'Upload failed';
      showToast(`Upload: ${e.message}`);
    }
  });
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

// ─── Mobile sidebar toggle ────────────────────
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('open');
  document.getElementById('mobile-hamburger')?.classList.remove('open');
}
document.getElementById('mobile-hamburger')?.addEventListener('click', () => {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('sidebar-overlay')?.classList.toggle('open');
  document.getElementById('mobile-hamburger')?.classList.toggle('open');
});
document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar);

// ─── Navigation ──────────────────────────────
document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item[data-section]').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    const section = document.getElementById(`section-${btn.dataset.section}`);
    if (section) section.classList.add('active');
    if (btn.dataset.section === 'counterbill') loadCounterBill();
    closeSidebar();
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
      <div class="form-group"><label>Image</label>${imageUploadHtml('', 'col-img')}</div>
      <button type="submit" class="btn-primary">Create</button>
    </form>
  `);
  setupImageUpload('col-img');
  document.getElementById('collection-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/collections', {
        method: 'POST',
        body: JSON.stringify({
          name: document.getElementById('col-name').value,
          slug: document.getElementById('col-slug').value,
          description: document.getElementById('col-desc').value,
          imageUrl: document.getElementById('col-img-url').value || null,
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
        <div class="form-group"><label>Image</label>${imageUploadHtml(col.imageUrl || '', 'col-img')}</div>
        <button type="submit" class="btn-primary">Save</button>
      </form>
    `);
    setupImageUpload('col-img');
    document.getElementById('collection-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api(`/collections/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: document.getElementById('col-name').value,
            slug: document.getElementById('col-slug').value,
            description: document.getElementById('col-desc').value,
            imageUrl: document.getElementById('col-img-url').value || null,
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
        <td><div class="product-thumb">${p.imageUrl ? `<img src="${p.imageUrl}" alt="" />` : '<span>—</span>'}</div></td>
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
    setupImageUpload('prod-img');
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
      <div class="form-group"><label>Image</label>${imageUploadHtml(p?.imageUrl || '', 'prod-img')}</div>
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
      imageUrl: document.getElementById('prod-img-url').value || null,
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
    setupImageUpload('prod-img');
    document.getElementById('product-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = {
        name: document.getElementById('prod-name').value,
        slug: document.getElementById('prod-slug').value,
        category: document.getElementById('prod-category').value,
        description: document.getElementById('prod-desc').value,
        basePrice: parseFloat(document.getElementById('prod-price').value) || 0,
        collectionId: document.getElementById('prod-collection').value || null,
        imageUrl: document.getElementById('prod-img-url').value || null,
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

// ─── Orders ───────────────────────────────────
async function loadOrders() {
  try {
    const status  = document.getElementById('order-status-filter').value;
    const payment = document.getElementById('order-payment-filter').value;
    const search  = (document.getElementById('order-search')?.value || '').toLowerCase().trim();
    const params  = new URLSearchParams();
    if (status)  params.set('status', status);
    if (payment) params.set('payment', payment);
    const data   = await api(`/orders?${params}`);
    const tbody  = document.getElementById('orders-tbody');

    // Update green dot badge with pending order count (unfiltered)
    const badge = document.getElementById('order-badge');
    if (badge) {
      try {
        const allData = await api('/orders?status=PENDING&limit=1');
        const count = allData.total || 0;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
      } catch (_) { badge.style.display = 'none'; }
    }

    // Client-side search filter (name or ref)
    let orders = data.orders || [];
    if (search) {
      orders = orders.filter(o =>
        (o.user?.firstName + ' ' + o.user?.lastName).toLowerCase().includes(search) ||
        (o.referenceCode || '').toLowerCase().includes(search) ||
        (o.user?.email || '').toLowerCase().includes(search)
      );
    }

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--walnut-light);">No orders found</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><code>${o.referenceCode?.slice(0,8) || o.id.slice(0,8)}</code></td>
        <td><strong>${o.user?.firstName || '—'} ${o.user?.lastName || ''}</strong><br><small style="color:var(--walnut-light)">${o.user?.email || ''}</small></td>
        <td class="addr-cell" title="${o.user?.address || o.deliveryAddress || ''}">
          <span class="addr-truncate">${o.user?.address || o.deliveryAddress || '—'}</span>
        </td>
        <td>${o._count?.items ?? o.items?.length ?? 0}</td>
        <td>$${(o.finalPrice || o.estimatedPrice || 0).toLocaleString()}</td>
        <td><span class="badge-order status-${o.status}">${o.status}</span></td>
        <td><span class="badge-order payment-${o.paymentStatus}">${o.paymentStatus}</span></td>
        <td>${new Date(o.createdAt).toLocaleDateString()}</td>
        <td>
          <div class="action-group">
            <button class="btn-secondary" onclick="viewOrder('${o.id}')">View</button>
            <button class="btn-secondary" onclick="updateStatus('${o.id}')">Status</button>
            <button class="btn-primary order-invoice-btn" onclick="printInvoice('${o.id}')" style="font-size:0.7rem;padding:0.4rem 0.8rem;">Invoice</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (e) { showToast(`Orders: ${e.message}`); }
}

async function updateItemQty(orderId, itemId, newQty) {
  try {
    const data = await api(`/orders/${orderId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: newQty }),
    });
    showToast('Quantity updated');
    viewOrder(orderId);
  } catch (e) { showToast(e.message); }
}

window.viewOrder = async (id) => {
  try {
    const data = await api(`/orders/${id}`);
    const o = data.order;
    const itemsHtml = o.items.map(item => `
      <div class="order-item-row">
        <div class="order-item-img">${item.product?.imageUrl ? `<img src="${item.product.imageUrl}" alt="" />` : '<span>—</span>'}</div>
        <div class="order-item-info">
          <strong>${item.product?.name || 'Unknown'}</strong>
          <span class="item-price-label">$${item.price.toLocaleString()} ea</span>
        </div>
        <div class="order-item-qty">
          <button class="qty-btn" onclick="updateItemQty('${id}','${item.id}',${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="updateItemQty('${id}','${item.id}',${item.quantity + 1})">+</button>
        </div>
        <div class="order-item-total">$${(item.quantity * item.price).toLocaleString()}</div>
      </div>
    `).join('');
    openModal(`Order #${o.referenceCode?.slice(0,8) || o.id.slice(0,8)}`, `
      <div class="order-detail">
        <div class="order-detail-grid">
          <div class="detail-group">
            <label>Customer</label>
            <p>${o.user?.firstName || ''} ${o.user?.lastName || ''}</p>
            <p class="small">${o.user?.email || ''}</p>
            ${o.user?.phone ? `<p class="small">${o.user.phone}</p>` : ''}
          </div>
          <div class="detail-group">
            <label>User Address</label>
            <p>${o.user?.address || '—'}</p>
            <p class="small">${o.user?.phone ? `Phone: ${o.user.phone}` : ''}</p>
          </div>
          <div class="detail-group">
            <label>Delivery</label>
            <p>${o.deliveryAddress || '—'}</p>
            <p class="small">${o.country || ''}</p>
          </div>
          <div class="detail-group">
            <label>Status</label>
            <p><span class="badge-order status-${o.status}">${o.status}</span></p>
          </div>
          <div class="detail-group">
            <label>Payment</label>
            <p><span class="badge-order payment-${o.paymentStatus}">${o.paymentStatus}</span></p>
          </div>
        </div>
        <div class="detail-group">
          <label>Customisation</label>
          <p>Material: ${o.material} / Finish: ${o.finish} / Dimension: ${o.dimension}${o.customDimensions ? ` (${o.customDimensions})` : ''}${o.upholstery ? ` / Upholstery: ${o.upholstery}` : ''}</p>
          ${o.notes ? `<p class="small">Notes: ${o.notes}</p>` : ''}
        </div>
        <div class="detail-group">
          <label>Items</label>
          <div class="order-items-list">${itemsHtml}</div>
        </div>
        <div class="order-total-bar">
          <span>Estimated: $${o.estimatedPrice.toLocaleString()}</span>
          ${o.finalPrice ? `<span><strong>Final: $${o.finalPrice.toLocaleString()}</strong></span>` : ''}
        </div>
      </div>
    `);
  } catch (e) { showToast(e.message); }
};

const ORDER_STATUSES = ['PENDING','CONFIRMED','IN_PRODUCTION','QUALITY_CHECK','SHIPPED','DELIVERED','CANCELLED'];

window.updateStatus = async (id) => {
  openModal('Update Order Status', `
    <form class="admin-form" id="status-form">
      <div class="form-group"><label>New Status</label>
        <select id="order-new-status" class="form-input">
          ${ORDER_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <button type="submit" class="btn-primary">Update</button>
    </form>
  `);
  document.getElementById('status-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: document.getElementById('order-new-status').value }),
      });
      closeModal(); showToast('Status updated'); loadOrders();
    } catch (e) { showToast(e.message); }
  });
};

document.getElementById('order-status-filter').addEventListener('change', loadOrders);
document.getElementById('order-payment-filter').addEventListener('change', loadOrders);
document.getElementById('order-search')?.addEventListener('input', loadOrders);

// ─── Invoice Print ────────────────────────────
window.printInvoice = async (id) => {
  try {
    const data = await api(`/orders/${id}`);
    const o = data.order;
    const settings = await api('/rates');
    const addr = await api('/address');

    const itemsRows = o.items.map((item, i) => `
      <tr>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;">${i + 1}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;">${item.product?.name || 'Unknown'}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:center;">${item.quantity}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:right;">$${item.price.toFixed(2)}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:right;">$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    const subtotal = o.items.reduce((s, item) => s + item.quantity * item.price, 0);
    const rate = parseFloat(settings.rates?.delivery_rate || 0);
    const taxPct = parseFloat(settings.rates?.tax_rate || 0);
    const tax = subtotal * (taxPct / 100);
    const total = subtotal + rate + tax;

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Invoice #${o.referenceCode?.slice(0,8) || o.id.slice(0,8)}</title>
      <style>
        @page { margin: 15mm; }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Inter','Helvetica Neue',sans-serif; color:#2C1810; font-size:13px; line-height:1.5; padding:2rem; max-width:800px; margin:0 auto; }
        .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2.5rem; padding-bottom:1.5rem; border-bottom:2px solid #2C1810; }
        .brand { display:flex; align-items:center; gap:0.6rem; }
        .brand-mark { width:36px; height:36px; background:#2C1810; color:#F5F0E8; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1rem; font-weight:600; }
        .brand-text { font-size:0.7rem; font-weight:600; letter-spacing:0.22em; }
        .invoice-title { text-align:right; }
        .invoice-title h1 { font-size:1.6rem; font-weight:400; letter-spacing:0.05em; }
        .invoice-title p { font-size:0.75rem; color:#7A4F36; margin-top:0.2rem; }
        .info-grid { display:flex; justify-content:space-between; margin-bottom:2rem; gap:2rem; }
        .info-box { flex:1; }
        .info-box h3 { font-size:0.65rem; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:#7A4F36; margin-bottom:0.4rem; }
        .info-box p { font-size:0.8rem; color:#2C1810; }
        .info-box .small { font-size:0.7rem; color:#7A4F36; }
        table { width:100%; border-collapse:collapse; margin-bottom:1.5rem; }
        th { text-align:left; padding:0.5rem 0.6rem; font-size:0.65rem; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:#7A4F36; border-bottom:2px solid #2C1810; }
        td { padding:0.5rem 0.6rem; border-bottom:1px solid #E8DFD0; font-size:0.75rem; }
        .totals { margin-left:auto; width:280px; }
        .totals tr:last-child td { border-bottom:2px solid #2C1810; font-weight:600; font-size:0.85rem; }
        .totals td:last-child { text-align:right; }
        .totals td:first-child { color:#7A4F36; }
        .footer { margin-top:2.5rem; padding-top:1.5rem; border-top:1px solid #E8DFD0; text-align:center; font-size:0.7rem; color:#7A4F36; }
        .status-badge { display:inline-block; padding:0.2rem 0.5rem; border-radius:100px; font-size:0.6rem; font-weight:600; background:rgba(90,155,111,0.15); color:#3a7a4f; }
        @media print { body { padding:0; } .no-print { display:none; } }
      </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <div class="brand-mark">J</div>
            <div class="brand-text">JANGID</div>
          </div>
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <p>#${o.referenceCode?.slice(0,8) || o.id.slice(0,8)}</p>
            <p style="margin-top:0.3rem;"><span class="status-badge">${o.status}</span></p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h3>From</h3>
            <p><strong>${addr.address?.name || 'Jangid'}</strong></p>
            <p>${addr.address?.address || ''}</p>
            <p class="small">${addr.address?.phone || ''}</p>
            <p class="small">${addr.address?.email || ''}</p>
          </div>
          <div class="info-box">
            <h3>Bill To</h3>
            <p><strong>${o.user?.firstName || ''} ${o.user?.lastName || ''}</strong></p>
            <p>${o.user?.address || o.deliveryAddress || ''}</p>
            <p class="small">${o.user?.email || ''}</p>
            ${o.user?.phone ? `<p class="small">${o.user.phone}</p>` : ''}
          </div>
          <div class="info-box">
            <h3>Order</h3>
            <p>Date: ${new Date(o.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</p>
            <p class="small">Delivery: ${o.deliveryAddress}</p>
            <p class="small">Material: ${o.material} / ${o.finish}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr><th style="width:3rem;">#</th><th>Item</th><th style="width:3rem;text-align:center;">Qty</th><th style="width:5rem;text-align:right;">Price</th><th style="width:5rem;text-align:right;">Total</th></tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>

        <table class="totals">
          <tr><td>Subtotal</td><td>$${subtotal.toFixed(2)}</td></tr>
          ${rate ? `<tr><td>Delivery</td><td>$${rate.toFixed(2)}</td></tr>` : ''}
          ${tax ? `<tr><td>Tax (${taxPct}%)</td><td>$${tax.toFixed(2)}</td></tr>` : ''}
          <tr><td>Total</td><td>$${total.toFixed(2)}</td></tr>
        </table>

        <div class="footer">
          <p>Thank you for choosing Jangid — heirloom-quality furniture, crafted for a lifetime.</p>
          <p style="margin-top:0.3rem;">${addr.address?.name || 'Jangid'} · ${addr.address?.phone || ''} · ${addr.address?.email || ''}</p>
        </div>

        <div class="no-print" style="text-align:center;margin-top:2rem;">
          <button onclick="window.print()" style="padding:0.6rem 1.5rem;background:#2C1810;color:#F5F0E8;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;">Print Invoice</button>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  } catch (e) { showToast(`Invoice: ${e.message}`); }
};

// ─── Company Invoice ──────────────────────────
window.companyInvoice = async (id) => {
  openModal('Company Invoice', `
    <form class="admin-form" id="company-invoice-form">
      <div class="form-group"><label>Company Name</label><input type="text" id="inv-company" class="form-input" required /></div>
      <div class="form-group"><label>GST / VAT Number</label><input type="text" id="inv-gst" class="form-input" /></div>
      <div class="form-group"><label>Billing Address</label><textarea id="inv-billing-addr" class="form-input" rows="3" required></textarea></div>
      <button type="submit" class="btn-primary">Generate Invoice</button>
    </form>
  `);
  document.getElementById('company-invoice-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    closeModal();
    const company = document.getElementById('inv-company').value;
    const gst = document.getElementById('inv-gst').value;
    const billingAddr = document.getElementById('inv-billing-addr').value;
    await printCompanyInvoice(id, company, gst, billingAddr);
  });
};

async function printCompanyInvoice(id, company, gst, billingAddr) {
  try {
    const data = await api(`/orders/${id}`);
    const o = data.order;
    const settings = await api('/rates');
    const addr = await api('/address');

    const itemsRows = o.items.map((item, i) => `
      <tr>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;">${i + 1}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;">${item.product?.name || 'Unknown'}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:center;">${item.quantity}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:right;">$${item.price.toFixed(2)}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:right;">$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    const subtotal = o.items.reduce((s, item) => s + item.quantity * item.price, 0);
    const rate = parseFloat(settings.rates?.delivery_rate || 0);
    const taxPct = parseFloat(settings.rates?.tax_rate || 0);
    const tax = subtotal * (taxPct / 100);
    const total = subtotal + rate + tax;

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Tax Invoice #${o.referenceCode?.slice(0,8) || o.id.slice(0,8)}</title>
      <style>
        @page { margin: 12mm; }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Inter','Helvetica Neue',sans-serif; color:#2C1810; font-size:13px; line-height:1.5; padding:2rem; max-width:800px; margin:0 auto; }
        .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:2px solid #2C1810; }
        .brand { display:flex; align-items:center; gap:0.6rem; }
        .brand-mark { width:36px; height:36px; background:#2C1810; color:#F5F0E8; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1rem; font-weight:600; }
        .brand-text { font-size:0.7rem; font-weight:600; letter-spacing:0.22em; }
        .invoice-title { text-align:right; }
        .invoice-title h1 { font-size:1.6rem; font-weight:400; letter-spacing:0.05em; }
        .invoice-title p { font-size:0.75rem; color:#7A4F36; margin-top:0.2rem; }
        .invoice-title .gst-tag { display:inline-block; margin-top:0.3rem; padding:0.15rem 0.5rem; border:1px solid #7A4F36; border-radius:3px; font-size:0.6rem; color:#7A4F36; font-weight:600; letter-spacing:0.05em; }
        .info-grid { display:flex; justify-content:space-between; margin-bottom:1.5rem; gap:1.5rem; }
        .info-box { flex:1; }
        .info-box h3 { font-size:0.65rem; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:#7A4F36; margin-bottom:0.4rem; border-bottom:1px solid #E8DFD0; padding-bottom:0.25rem; }
        .info-box p { font-size:0.8rem; color:#2C1810; }
        .info-box .small { font-size:0.7rem; color:#7A4F36; }
        .gst-number { font-size:0.7rem; color:#7A4F36; margin-top:0.2rem; }
        table { width:100%; border-collapse:collapse; margin-bottom:1rem; }
        th { text-align:left; padding:0.5rem 0.6rem; font-size:0.65rem; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:#7A4F36; border-bottom:2px solid #2C1810; background:#F5F0E8; }
        td { padding:0.5rem 0.6rem; border-bottom:1px solid #E8DFD0; font-size:0.75rem; }
        .totals { margin-left:auto; width:280px; }
        .totals td { border-bottom:1px solid #E8DFD0; padding:0.4rem 0.6rem; }
        .totals tr:last-child td { border-bottom:2px solid #2C1810; font-weight:700; font-size:0.9rem; }
        .totals td:last-child { text-align:right; }
        .totals td:first-child { color:#7A4F36; }
        .footer { margin-top:2rem; padding-top:1rem; border-top:1px solid #E8DFD0; text-align:center; font-size:0.7rem; color:#7A4F36; }
        .footer p { margin-bottom:0.15rem; }
        .amount-words { font-size:0.75rem; color:#7A4F36; margin-bottom:0.5rem; font-style:italic; }
        @media print { body { padding:0; } .no-print { display:none; } }
      </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <div class="brand-mark">J</div>
            <div class="brand-text">JANGID</div>
          </div>
          <div class="invoice-title">
            <h1>TAX INVOICE</h1>
            <p>#${o.referenceCode?.slice(0,8) || o.id.slice(0,8)}</p>
            ${gst ? `<span class="gst-tag">GST: ${gst}</span>` : ''}
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h3>Seller</h3>
            <p><strong>${addr.address?.name || 'Jangid'}</strong></p>
            <p>${addr.address?.address || ''}</p>
            <p class="small">${addr.address?.phone || ''}</p>
            <p class="small">${addr.address?.email || ''}</p>
          </div>
          <div class="info-box">
            <h3>Bill To</h3>
            <p><strong>${company}</strong></p>
            <p>${billingAddr}</p>
            ${gst ? `<p class="gst-number">GST: ${gst}</p>` : ''}
          </div>
          <div class="info-box">
            <h3>Shipping</h3>
            <p><strong>${o.user?.firstName || ''} ${o.user?.lastName || ''}</strong></p>
            <p>${o.deliveryAddress || ''}</p>
            <p class="small">${o.country || ''}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr><th style="width:2.5rem;">#</th><th>Description</th><th style="width:3rem;text-align:center;">Qty</th><th style="width:5rem;text-align:right;">Rate</th><th style="width:5rem;text-align:right;">Amount</th></tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>

        <p class="amount-words">Amount in words: ${numberToWords(total)}</p>

        <table class="totals">
          <tr><td>Subtotal</td><td>$${subtotal.toFixed(2)}</td></tr>
          ${rate ? `<tr><td>Delivery</td><td>$${rate.toFixed(2)}</td></tr>` : ''}
          ${tax ? `<tr><td>Tax @ ${taxPct}%</td><td>$${tax.toFixed(2)}</td></tr>` : ''}
          <tr><td>Total</td><td>$${total.toFixed(2)}</td></tr>
        </table>

        <div class="footer">
          <p><strong>${addr.address?.name || 'Jangid'}</strong></p>
          <p>${addr.address?.address || ''} | ${addr.address?.phone || ''} | ${addr.address?.email || ''}</p>
          <p style="margin-top:0.3rem;">Thank you for your business!</p>
        </div>

        <div class="no-print" style="text-align:center;margin-top:2rem;">
          <button onclick="window.print()" style="padding:0.6rem 1.5rem;background:#2C1810;color:#F5F0E8;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;">Print Tax Invoice</button>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  } catch (e) { showToast(`Company invoice: ${e.message}`); }
}

function numberToWords(n) {
  if (n === 0) return 'Zero';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const scale = ['','Thousand','Million','Billion'];
  function convertHundreds(num) {
    if (num === 0) return '';
    let s = '';
    if (num >= 100) { s += ones[Math.floor(num / 100)] + ' Hundred '; num %= 100; }
    if (num >= 20) { s += tens[Math.floor(num / 10)] + ' '; num %= 10; }
    if (num > 0) s += ones[num] + ' ';
    return s.trim() + ' ';
  }
  let result = '', i = 0;
  while (n > 0) {
    const part = Math.floor(n % 1000);
    if (part > 0) result = convertHundreds(part) + scale[i] + ' ' + result;
    n = Math.floor(n / 1000);
    i++;
  }
  return result.trim() + ' Dollars';
}

// ─── Counter Bill ─────────────────────────────
let counterBillItems = [];
let cbProducts = [];

async function loadCounterBill() {
  try {
    const data = await api('/products');
    cbProducts = data.products || [];
    const select = document.getElementById('cb-product-select');
    select.innerHTML = '<option value="">— Select a product —</option>' +
      cbProducts.map(p => `<option value="${p.id}" data-price="${p.basePrice}">${p.name} — $${p.basePrice}</option>`).join('');
  } catch (e) { showToast(`Counter Bill: ${e.message}`); }
  renderCbTable();
}

document.getElementById('cb-add-selected').addEventListener('click', () => {
  const select = document.getElementById('cb-product-select');
  const id = select.value;
  if (!id) { showToast('Select a product'); return; }
  const prod = cbProducts.find(p => p.id === id);
  if (!prod) return;
  const existing = counterBillItems.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    counterBillItems.push({ id, desc: prod.name, qty: 1, rate: prod.basePrice });
  }
  select.value = '';
  renderCbTable();
});

function renderCbTable() {
  const tbody = document.getElementById('cb-items-tbody');
  if (counterBillItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:var(--walnut-light);font-size:0.85rem;">No items added yet. Select a product above.</td></tr>';
    updateCbSummary();
    return;
  }
  tbody.innerHTML = counterBillItems.map((item, i) => `
    <tr>
      <td><strong>${item.desc}</strong></td>
      <td><input type="number" class="form-input cb-qty-inline" value="${item.qty}" min="1" style="width:60px;text-align:center;padding:0.3rem 0.5rem;" data-index="${i}" /></td>
      <td><input type="number" class="form-input cb-rate-inline" value="${item.rate}" step="0.01" min="0" style="width:100px;text-align:right;padding:0.3rem 0.5rem;" data-index="${i}" /></td>
      <td style="font-weight:600;">$${(item.qty * item.rate).toFixed(2)}</td>
      <td><button class="btn-danger" style="padding:0.2rem 0.5rem;font-size:0.7rem;" onclick="removeCbItem(${i})">&times;</button></td>
    </tr>
  `).join('');

  document.querySelectorAll('.cb-qty-inline').forEach(inp => {
    inp.addEventListener('input', () => {
      const idx = parseInt(inp.dataset.index);
      counterBillItems[idx].qty = parseInt(inp.value) || 1;
      renderCbTable();
    });
  });
  document.querySelectorAll('.cb-rate-inline').forEach(inp => {
    inp.addEventListener('input', () => {
      const idx = parseInt(inp.dataset.index);
      counterBillItems[idx].rate = parseFloat(inp.value) || 0;
      renderCbTable();
    });
  });
  updateCbSummary();
}

window.removeCbItem = (idx) => {
  counterBillItems.splice(idx, 1);
  renderCbTable();
};

function getCbGstState() {
  return {
    enabled: document.getElementById('cb-gst-toggle').checked,
    rate: parseFloat(document.getElementById('cb-gst-rate').value) || 0,
  };
}

async function updateCbSummary() {
  const subtotal = counterBillItems.reduce((s, item) => s + item.qty * item.rate, 0);
  const gst = getCbGstState();
  const tax = gst.enabled ? subtotal * (gst.rate / 100) : 0;
  const total = subtotal + tax;
  document.getElementById('cb-subtotal').textContent = '\u20B9' + subtotal.toFixed(2);
  document.getElementById('cb-tax-row').style.display = gst.enabled ? '' : 'none';
  document.getElementById('cb-tax').textContent = '\u20B9' + tax.toFixed(2);
  document.getElementById('cb-grand-total').textContent = '\u20B9' + total.toFixed(2);
}

document.getElementById('cb-gst-toggle').addEventListener('change', updateCbSummary);
document.getElementById('cb-gst-rate').addEventListener('input', updateCbSummary);

document.getElementById('cb-print-btn').addEventListener('click', async () => {
  if (counterBillItems.length === 0) { showToast('Add at least one item'); return; }
  const customer = document.getElementById('cb-customer-name').value || 'Walk-in Customer';
  const phone = document.getElementById('cb-customer-phone').value || '';
  await printCounterBill(customer, phone);
});

async function printCounterBill(customer, phone) {
  try {
    const addr = await api('/address');
    const gst = getCbGstState();
    const subtotal = counterBillItems.reduce((s, item) => s + item.qty * item.rate, 0);
    const tax = gst.enabled ? subtotal * (gst.rate / 100) : 0;
    const total = subtotal + tax;
    const cgst = tax / 2;
    const sgst = tax / 2;
    const billNo = 'CB-' + Date.now().toString(36).toUpperCase();

    const currency = '\u20B9';

    const itemsRows = counterBillItems.map((item, i) => `
      <tr>
        <td style="padding:0.4rem 0.5rem;border-bottom:1px solid #ddd;font-size:0.75rem;">${i + 1}</td>
        <td style="padding:0.4rem 0.5rem;border-bottom:1px solid #ddd;font-size:0.75rem;">${item.desc || '—'}</td>
        <td style="padding:0.4rem 0.5rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:center;">${item.qty}</td>
        <td style="padding:0.4rem 0.5rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:right;">${currency}${item.rate.toFixed(2)}</td>
        <td style="padding:0.4rem 0.5rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:right;">${currency}${(item.qty * item.rate).toFixed(2)}</td>
      </tr>
    `).join('');

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Counter Bill ${billNo}</title>
      <style>
        @page { margin: 12mm; }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Inter','Helvetica Neue',sans-serif; color:#2C1810; font-size:13px; line-height:1.5; padding:2rem; max-width:700px; margin:0 auto; }
        .header { text-align:center; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:2px solid #2C1810; }
        .header h1 { font-size:1.4rem; font-weight:600; letter-spacing:0.15em; margin-bottom:0.2rem; }
        .header .sub { font-size:0.7rem; color:#7A4F36; }
        .header .bill-no { font-size:0.8rem; color:#7A4F36; margin-top:0.3rem; }
        .info-row { display:flex; justify-content:space-between; margin-bottom:1rem; font-size:0.75rem; color:#2C1810; }
        .info-row div { flex:1; }
        .info-row label { font-size:0.6rem; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:#7A4F36; display:block; margin-bottom:0.15rem; }
        table { width:100%; border-collapse:collapse; margin-bottom:0.75rem; }
        th { text-align:left; padding:0.4rem 0.5rem; font-size:0.6rem; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:#7A4F36; border-bottom:2px solid #2C1810; background:#F5F0E8; }
        td { padding:0.4rem 0.5rem; border-bottom:1px solid #E8DFD0; font-size:0.75rem; }
        .totals { margin-left:auto; width:280px; }
        .totals td { border-bottom:1px solid #E8DFD0; padding:0.3rem 0.5rem; }
        .totals tr:last-child td { border-bottom:2px solid #2C1810; font-weight:700; font-size:0.85rem; }
        .totals td:last-child { text-align:right; }
        .totals td:first-child { color:#7A4F36; }
        .footer { text-align:center; margin-top:1.5rem; padding-top:1rem; border-top:1px solid #E8DFD0; font-size:0.65rem; color:#7A4F36; }
        .thankyou { text-align:center; margin-top:1rem; font-size:0.8rem; color:#2C1810; font-style:italic; }
        @media print { body { padding:0; } .no-print { display:none; } }
      </style>
      </head>
      <body>
        <div class="header">
          <h1>${addr.address?.name || 'JANGID'}</h1>
          <div class="sub">${addr.address?.address || ''} | ${addr.address?.phone || ''}</div>
          <div class="bill-no">Bill No: ${billNo} | ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</div>
        </div>

        <div class="info-row">
          <div>
            <label>Customer</label>
            ${customer}
          </div>
          <div style="text-align:right;">
            ${phone ? `<label>Phone</label>${phone}` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr><th style="width:2rem;">#</th><th>Item</th><th style="width:3rem;text-align:center;">Qty</th><th style="width:5rem;text-align:right;">Rate</th><th style="width:5rem;text-align:right;">Amount</th></tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>

        <table class="totals">
          <tr><td>Subtotal</td><td>${currency}${subtotal.toFixed(2)}</td></tr>
          ${gst.enabled ? `
          <tr><td>CGST @ ${(gst.rate/2).toFixed(2)}%</td><td>${currency}${cgst.toFixed(2)}</td></tr>
          <tr><td>SGST @ ${(gst.rate/2).toFixed(2)}%</td><td>${currency}${sgst.toFixed(2)}</td></tr>
          ` : ''}
          <tr><td>Total</td><td>${currency}${total.toFixed(2)}</td></tr>
        </table>

        <div class="thankyou">Thank you, visit again!</div>

        <div class="footer">
          <p>${addr.address?.name || 'Jangid'} | ${addr.address?.address || ''} | ${addr.address?.phone || ''} | ${addr.address?.email || ''}</p>
        </div>

        <div class="no-print" style="text-align:center;margin-top:2rem;">
          <button onclick="window.print()" style="padding:0.6rem 1.5rem;background:#2C1810;color:#F5F0E8;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;">Print Bill</button>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  } catch (e) { showToast(`Counter bill: ${e.message}`); }
}

// Wire the sidebar "+ Counter Bill" button to navigate to the Counter Bill section
document.getElementById('counter-bill-btn').addEventListener('click', () => {
  document.querySelectorAll('.nav-item[data-section]').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelector('[data-section="counterbill"]')?.classList.add('active');
  document.getElementById('section-counterbill')?.classList.add('active');
  loadCounterBill();
});

// ─── Enquiries (Contact Messages) ───────────────
async function loadEnquiries() {
  try {
    const filterVal = document.getElementById('enquiry-filter')?.value || 'all';
    const params = new URLSearchParams();
    if (filterVal === 'unread') params.set('unread', 'true');
    const data = await api(`/enquiries?${params}`);
    const tbody = document.getElementById('enquiries-tbody');

    // Update unread badge in sidebar
    const badge = document.getElementById('enquiry-badge');
    if (badge) {
      if (data.unreadCount > 0) {
        badge.textContent = data.unreadCount;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }

    if (!data.messages || data.messages.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--walnut-light);">No enquiries found</td></tr>`;
      return;
    }

    tbody.innerHTML = data.messages.map(m => `
      <tr class="${m.read ? '' : 'row-unread'}" id="enq-row-${m.id}">
        <td><strong>${m.name}</strong></td>
        <td><a href="mailto:${m.email}" style="color:var(--terracotta);">${m.email}</a></td>
        <td><span class="enq-subject">${m.subject || 'General'}</span></td>
        <td class="addr-cell" title="${m.message}">
          <span class="addr-truncate">${m.message}</span>
        </td>
        <td>${new Date(m.createdAt).toLocaleDateString()}</td>
        <td>
          ${m.read
            ? '<span class="badge-order status-DELIVERED" style="font-size:0.6rem">Read</span>'
            : '<span class="badge-order status-PENDING" style="font-size:0.6rem">Unread</span>'
          }
        </td>
        <td>
          <div class="action-group">
            <button class="btn-secondary" onclick="viewEnquiry('${m.id}')">View</button>
            ${!m.read ? `<button class="btn-secondary" onclick="markRead('${m.id}')">Mark Read</button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  } catch (e) { showToast(`Enquiries: ${e.message}`); }
}

window.viewEnquiry = async (id) => {
  try {
    // Get from current table rows (already loaded)
    const row = document.getElementById(`enq-row-${id}`);
    const cells = row?.querySelectorAll('td');
    if (!cells) { showToast('Cannot find message'); return; }
    const name    = cells[0]?.textContent.trim();
    const email   = cells[1]?.textContent.trim();
    const subject = cells[2]?.textContent.trim();
    const date    = cells[4]?.textContent.trim();

    // Re-fetch full message from the list data (message text may be truncated in cell)
    const data = await api(`/enquiries`);
    const msg = data.messages?.find(m => m.id === id);
    if (!msg) { showToast('Message not found'); return; }

    openModal(`Enquiry — ${msg.name}`, `
      <div class="order-detail">
        <div class="order-detail-grid">
          <div class="detail-group">
            <label>From</label>
            <p><strong>${msg.name}</strong></p>
            <p class="small"><a href="mailto:${msg.email}" style="color:var(--terracotta)">${msg.email}</a></p>
          </div>
          <div class="detail-group">
            <label>Subject</label>
            <p>${msg.subject || 'General'}</p>
          </div>
          <div class="detail-group">
            <label>Date</label>
            <p>${new Date(msg.createdAt).toLocaleString()}</p>
          </div>
          <div class="detail-group">
            <label>Status</label>
            <p>${msg.read
              ? '<span class="badge-order status-DELIVERED">Read</span>'
              : '<span class="badge-order status-PENDING">Unread</span>'
            }</p>
          </div>
        </div>
        <div class="detail-group" style="margin-top:1rem">
          <label>Message</label>
          <div class="enq-message-body">${msg.message.replace(/\n/g, '<br>')}</div>
        </div>
        ${!msg.read ? `
          <div style="margin-top:1.5rem">
            <button class="btn-primary" onclick="markRead('${msg.id}')" id="modal-mark-read">Mark as Read</button>
          </div>
        ` : ''}
      </div>
    `);

    // Auto-mark as read when viewed
    if (!msg.read) {
      try { await api(`/enquiries/${id}/read`, { method: 'PATCH' }); loadEnquiries(); } catch(_) {}
    }
  } catch (e) { showToast(e.message); }
};

window.markRead = async (id) => {
  try {
    await api(`/enquiries/${id}/read`, { method: 'PATCH' });
    showToast('Marked as read');
    closeModal();
    loadEnquiries();
  } catch (e) { showToast(e.message); }
};

document.getElementById('enquiry-filter')?.addEventListener('change', loadEnquiries);

// ─── Pincodes ───────────────────────────────────
let pincodeEditId = null;

async function loadPincodes() {
  try {
    const data = await api('/pincodes');
    const container = document.getElementById('pincodes-container');
    if (!data.pincodes || data.pincodes.length === 0) {
      container.innerHTML = '<div class="pincode-empty">No pincodes added yet. Click "+ Add Pincode" to begin.</div>';
      return;
    }
    container.innerHTML = data.pincodes.map(p => `
      <div class="pincode-card">
        <div class="pincode-card-left">
          <span class="pincode-code">${p.pincode}</span>
          <span class="pincode-area">${p.areaName || '—'}</span>
        </div>
        <div class="pincode-card-center">
          <span class="pincode-charge-label">Delivery</span>
          <span class="pincode-charge">$${p.deliveryCharge.toFixed(2)}</span>
        </div>
        <div class="pincode-card-right">
          <button class="btn-secondary btn-table" onclick="editPincode('${p.id}','${p.pincode}','${p.areaName || ''}',${p.deliveryCharge})">Edit</button>
          <button class="btn-danger btn-table" onclick="deletePincode('${p.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (e) { showToast('Pincodes: ' + e.message); }
}

window.deletePincode = async (id) => {
  if (!confirm('Delete this pincode?')) return;
  try {
    await api(`/pincodes/${id}`, { method: 'DELETE' });
    showToast('Pincode deleted');
    loadPincodes();
  } catch (e) { showToast(e.message); }
};

document.getElementById('pincode-add-btn').addEventListener('click', () => {
  pincodeEditId = null;
  openModal('Add Pincode', `
    <div class="form-group"><label>Pincode</label><input type="text" id="pin-code" class="form-input" maxlength="10" /></div>
    <div class="form-group"><label>Area Name</label><input type="text" id="pin-area" class="form-input" /></div>
    <div class="form-group"><label>Delivery Charge ($)</label><input type="number" id="pin-charge" class="form-input" step="0.01" min="0" /></div>
    <div style="display:flex;gap:0.75rem;margin-top:1rem;">
      <button class="btn-primary" id="pin-save">Save</button>
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `);
  document.getElementById('pin-save').addEventListener('click', savePincode);
});

window.editPincode = (id, pincode, areaName, charge) => {
  pincodeEditId = id;
  openModal('Edit Pincode', `
    <div class="form-group"><label>Pincode</label><input type="text" id="pin-code" class="form-input" value="${pincode}" readonly style="background:var(--cream-mid);cursor:not-allowed;" /></div>
    <div class="form-group"><label>Area Name</label><input type="text" id="pin-area" class="form-input" value="${areaName}" /></div>
    <div class="form-group"><label>Delivery Charge ($)</label><input type="number" id="pin-charge" class="form-input" step="0.01" min="0" value="${charge}" /></div>
    <div style="display:flex;gap:0.75rem;margin-top:1rem;">
      <button class="btn-primary" id="pin-save">Update</button>
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `);
  document.getElementById('pin-save').addEventListener('click', savePincode);
};

async function savePincode() {
  const pincode = document.getElementById('pin-code').value.trim();
  const areaName = document.getElementById('pin-area').value.trim();
  const deliveryCharge = parseFloat(document.getElementById('pin-charge').value);
  if (!pincode || isNaN(deliveryCharge)) { showToast('Enter pincode and delivery charge'); return; }
  try {
    if (pincodeEditId) {
      await api(`/pincodes/${pincodeEditId}`, { method: 'PUT', body: JSON.stringify({ deliveryCharge, areaName }) });
      showToast('Pincode updated');
    } else {
      await api('/pincodes', { method: 'POST', body: JSON.stringify({ pincode, deliveryCharge, areaName }) });
      showToast('Pincode added');
    }
    closeModal();
    loadPincodes();
  } catch (e) { showToast(e.message); }
}

// ─── Init all sections ──────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  loadCollections();
  loadProducts();
  loadOrders();
  loadRates();
  loadAddress();
  loadEnquiries();
  loadPincodes();
});
