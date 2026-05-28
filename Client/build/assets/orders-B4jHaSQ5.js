import{t as e}from"./config-DDSCtEQs.js";(function(){let e=localStorage.getItem(`token`),t=localStorage.getItem(`user`);if(!e||!t){window.location.href=`/login.html`;return}try{let e=JSON.parse(t);document.getElementById(`orders-greeting`).textContent=`Welcome back, ${e.firstName}.`}catch{window.location.href=`/login.html`}})(),document.getElementById(`orders-signout-btn`).addEventListener(`click`,()=>{localStorage.removeItem(`token`),localStorage.removeItem(`user`),window.location.href=`/login.html`});async function t(){let n=document.getElementById(`orders-list`);try{let t=await(await fetch(`${e}/api/auth/me`,{headers:{Authorization:`Bearer ${localStorage.getItem(`token`)}`}})).json();if(!t.success)throw Error(t.message);let r=t.user.orders||[];if(!r.length){n.innerHTML=`<div class="empty-orders"><p>You haven't placed any orders yet.</p><a href="/index.html#order" class="auth-btn">Start your order →</a></div>`;return}n.innerHTML=r.map(e=>`
      <div class="order-card">
        <div class="order-card-left">
          <span class="order-ref">#${e.referenceCode?.slice(0,8)||e.id.slice(0,8)}</span>
          <span class="order-card-date">${new Date(e.createdAt).toLocaleDateString(`en-US`,{year:`numeric`,month:`long`,day:`numeric`})}</span>
        </div>
        <div class="order-card-right">
          <span class="order-card-total">$${(e.finalPrice||e.estimatedPrice||0).toLocaleString()}</span>
          <span class="badge-order status-${e.status}">${e.status}</span>
          <button class="auth-btn outline" onclick="viewOrder('${e.id}')">View</button>
        </div>
      </div>
    `).join(``)}catch{n.innerHTML=`<p class="orders-muted">Could not load orders. <button class="auth-btn outline" id="retry-btn" style="margin-top:0.5rem;">Try again</button></p>`,document.getElementById(`retry-btn`)?.addEventListener(`click`,t)}}function n(e,t){let n=document.getElementById(`modal-overlay`),i=document.getElementById(`modal`);n||(n=document.createElement(`div`),n.id=`modal-overlay`,n.className=`modal-overlay`,document.body.appendChild(n)),i||(i=document.createElement(`div`),i.id=`modal`,i.className=`modal`,i.innerHTML=`<div class="modal-header"><h2 id="modal-title"></h2><button class="modal-close" id="modal-close">&times;</button></div><div class="modal-body" id="modal-body"></div>`,document.body.appendChild(i),document.getElementById(`modal-close`).addEventListener(`click`,r),n.addEventListener(`click`,r)),document.getElementById(`modal-title`).textContent=e,document.getElementById(`modal-body`).innerHTML=t,i.classList.add(`open`),n.classList.add(`open`)}function r(){let e=document.getElementById(`modal`),t=document.getElementById(`modal-overlay`);e&&e.classList.remove(`open`),t&&t.classList.remove(`open`)}window.viewOrder=async t=>{try{let r=await(await fetch(`${e}/api/orders/${t}`,{headers:{Authorization:`Bearer ${localStorage.getItem(`token`)}`}})).json();if(!r.success)throw Error(r.message);let i=r.order,a=(i.items||[]).map(e=>`
      <div class="order-item-row">
        <div class="order-item-img">${e.product?.imageUrl?`<img src="${e.product.imageUrl}" alt="" />`:`<span>—</span>`}</div>
        <div class="order-item-info">
          <strong>${e.product?.name||`Unknown`}</strong>
          <span>Qty: ${e.quantity} × $${e.price.toLocaleString()}</span>
        </div>
        <div class="order-item-total">$${(e.quantity*e.price).toLocaleString()}</div>
      </div>
    `).join(``);n(`Order #${i.referenceCode?.slice(0,8)||i.id.slice(0,8)}`,`
      <div class="order-detail-grid">
        <div class="detail-group">
          <label>Status</label>
          <p><span class="badge-order status-${i.status}">${i.status}</span></p>
        </div>
        <div class="detail-group">
          <label>Payment</label>
          <p><span class="badge-order payment-${i.paymentStatus}">${i.paymentStatus}</span></p>
        </div>
        <div class="detail-group">
          <label>Delivery</label>
          <p>${i.deliveryAddress||`—`}</p>
          <p class="small">${i.country||``}</p>
        </div>
        <div class="detail-group">
          <label>Customisation</label>
          <p class="small">Material: ${i.material} / Finish: ${i.finish}${i.upholstery?` / Upholstery: ${i.upholstery}`:``}</p>
          ${i.customDimensions?`<p class="small">Custom: ${i.customDimensions}</p>`:``}
        </div>
      </div>
      ${i.notes?`<div class="detail-group"><label>Notes</label><p class="small">${i.notes}</p></div>`:``}
      <div class="detail-group">
        <label>Items</label>
        <div class="order-items-list">${a}</div>
      </div>
      <div class="order-total-bar">
        <span>Estimated: $${i.estimatedPrice.toLocaleString()}</span>
        ${i.finalPrice?`<span><strong>Final: $${i.finalPrice.toLocaleString()}</strong></span>`:``}
      </div>
    `)}catch(e){console.error(e)}},document.addEventListener(`DOMContentLoaded`,t);