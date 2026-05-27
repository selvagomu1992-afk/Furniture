import './orders.css';

// ─── Auth Guard ──────────────────────────────
(function checkAuth() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  if (!token || !userStr) { window.location.href = '/login.html'; return; }
  try {
    const u = JSON.parse(userStr);
    document.getElementById('orders-greeting').textContent = `Welcome back, ${u.firstName}.`;
  } catch { window.location.href = '/login.html'; }
})();

// ─── Sign Out ────────────────────────────────
document.getElementById('orders-signout-btn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
});

// ─── Load Orders ─────────────────────────────
async function loadOrders() {
  const container = document.getElementById('orders-list');
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const orders = data.user.orders || [];
    if (!orders.length) {
      container.innerHTML = '<div class="empty-orders"><p>You haven\'t placed any orders yet.</p><a href="/index.html#order" class="auth-btn">Start your order →</a></div>';
      return;
    }

    container.innerHTML = orders.map(o => `
      <div class="order-card">
        <div class="order-card-left">
          <span class="order-ref">#${o.referenceCode?.slice(0,8) || o.id.slice(0,8)}</span>
          <span class="order-card-date">${new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="order-card-right">
          <span class="order-card-total">$${(o.finalPrice || o.estimatedPrice || 0).toLocaleString()}</span>
          <span class="badge-order status-${o.status}">${o.status}</span>
          <button class="auth-btn outline" onclick="viewOrder('${o.id}')">View</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<p class="orders-muted">Could not load orders. <button class="auth-btn outline" id="retry-btn" style="margin-top:0.5rem;">Try again</button></p>';
    document.getElementById('retry-btn')?.addEventListener('click', loadOrders);
  }
}

// ─── View Order Detail ───────────────────────
function openModal(title, bodyHtml) {
  let overlay = document.getElementById('modal-overlay');
  let modal = document.getElementById('modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal';
    modal.className = 'modal';
    modal.innerHTML = '<div class="modal-header"><h2 id="modal-title"></h2><button class="modal-close" id="modal-close">&times;</button></div><div class="modal-body" id="modal-body"></div>';
    document.body.appendChild(modal);
    document.getElementById('modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
  }
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  modal.classList.add('open');
  overlay.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('modal');
  const overlay = document.getElementById('modal-overlay');
  if (modal) modal.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

window.viewOrder = async (id) => {
  try {
    const res = await fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    const o = data.order;

    const itemsHtml = (o.items || []).map(item => `
      <div class="order-item-row">
        <div class="order-item-img">${item.product?.imageUrl ? `<img src="${item.product.imageUrl}" alt="" />` : '<span>—</span>'}</div>
        <div class="order-item-info">
          <strong>${item.product?.name || 'Unknown'}</strong>
          <span>Qty: ${item.quantity} × $${item.price.toLocaleString()}</span>
        </div>
        <div class="order-item-total">$${(item.quantity * item.price).toLocaleString()}</div>
      </div>
    `).join('');

    openModal(`Order #${o.referenceCode?.slice(0,8) || o.id.slice(0,8)}`, `
      <div class="order-detail-grid">
        <div class="detail-group">
          <label>Status</label>
          <p><span class="badge-order status-${o.status}">${o.status}</span></p>
        </div>
        <div class="detail-group">
          <label>Payment</label>
          <p><span class="badge-order payment-${o.paymentStatus}">${o.paymentStatus}</span></p>
        </div>
        <div class="detail-group">
          <label>Delivery</label>
          <p>${o.deliveryAddress || '—'}</p>
          <p class="small">${o.country || ''}</p>
        </div>
        <div class="detail-group">
          <label>Customisation</label>
          <p class="small">Material: ${o.material} / Finish: ${o.finish}${o.upholstery ? ` / Upholstery: ${o.upholstery}` : ''}</p>
          ${o.customDimensions ? `<p class="small">Custom: ${o.customDimensions}</p>` : ''}
        </div>
      </div>
      ${o.notes ? `<div class="detail-group"><label>Notes</label><p class="small">${o.notes}</p></div>` : ''}
      <div class="detail-group">
        <label>Items</label>
        <div class="order-items-list">${itemsHtml}</div>
      </div>
      <div class="order-total-bar">
        <span>Estimated: $${o.estimatedPrice.toLocaleString()}</span>
        ${o.finalPrice ? `<span><strong>Final: $${o.finalPrice.toLocaleString()}</strong></span>` : ''}
      </div>
    `);
  } catch (e) {
    console.error(e);
  }
};

// ─── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', loadOrders);
