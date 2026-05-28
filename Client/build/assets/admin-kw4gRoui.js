import{t as e}from"./config-DDSCtEQs.js";var t=`${e}/api/admin`;function n(){return localStorage.getItem(`token`)}function r(){return{"Content-Type":`application/json`,Authorization:`Bearer ${n()}`}}function i(e){let t=document.getElementById(`admin-toast`);t.textContent=e,t.classList.add(`show`),clearTimeout(t._timer),t._timer=setTimeout(()=>t.classList.remove(`show`),3e3)}function a(e,t){document.getElementById(`modal-title`).textContent=e,document.getElementById(`modal-body`).innerHTML=t,document.getElementById(`modal`).classList.add(`open`),document.getElementById(`modal-overlay`).classList.add(`open`)}function o(){document.getElementById(`modal`).classList.remove(`open`),document.getElementById(`modal-overlay`).classList.remove(`open`)}function s(e,t){return`
    <div class="image-upload">
      <div class="image-upload-preview" id="${t}-preview">
        ${e?`<img src="${e}" alt="Preview" />`:`<div class="upload-placeholder">No image</div>`}
      </div>
      <div class="image-upload-actions">
        <label class="upload-btn-custom">
          Choose Image
          <input type="file" id="${t}-file" accept="image/jpeg,image/jpg,image/png,image/webp" hidden />
        </label>
        <span class="upload-status" id="${t}-status"></span>
        <input type="hidden" id="${t}-url" value="${e||``}" />
      </div>
    </div>
  `}function c(t){let r=document.getElementById(`${t}-file`);r&&r.addEventListener(`change`,async()=>{let a=r.files[0];if(!a)return;let o=document.getElementById(`${t}-status`),s=document.getElementById(`${t}-preview`),c=document.getElementById(`${t}-url`);o.textContent=`Uploading...`;let l=new FormData;l.append(`image`,a);try{let t=await(await fetch(`${e}/api/upload`,{method:`POST`,headers:{Authorization:`Bearer ${n()}`},body:l})).json();if(!t.success)throw Error(t.message||`Upload failed`);c.value=t.url,s.innerHTML=`<img src="${t.url}" alt="Preview" />`,o.textContent=``}catch(e){o.textContent=`Upload failed`,i(`Upload: ${e.message}`)}})}document.getElementById(`modal-close`).addEventListener(`click`,o),document.getElementById(`modal-overlay`).addEventListener(`click`,o),(function(){let e=localStorage.getItem(`user`),t=n();if(!e||!t){window.location.href=`/login.html`;return}try{if(JSON.parse(e).role!==`ADMIN`){window.location.href=`/index.html`;return}}catch{window.location.href=`/login.html`}})();function l(){document.getElementById(`sidebar`)?.classList.remove(`open`),document.getElementById(`sidebar-overlay`)?.classList.remove(`open`),document.getElementById(`mobile-hamburger`)?.classList.remove(`open`)}document.getElementById(`mobile-hamburger`)?.addEventListener(`click`,()=>{document.getElementById(`sidebar`)?.classList.toggle(`open`),document.getElementById(`sidebar-overlay`)?.classList.toggle(`open`),document.getElementById(`mobile-hamburger`)?.classList.toggle(`open`)}),document.getElementById(`sidebar-overlay`)?.addEventListener(`click`,l),document.querySelectorAll(`.nav-item[data-section]`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.nav-item[data-section]`).forEach(e=>e.classList.remove(`active`)),document.querySelectorAll(`.admin-section`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`);let t=document.getElementById(`section-${e.dataset.section}`);t&&t.classList.add(`active`),e.dataset.section===`counterbill`&&T(),l()})}),document.getElementById(`back-to-site`).addEventListener(`click`,()=>window.location.href=`/index.html`),document.getElementById(`signout-btn`).addEventListener(`click`,()=>{localStorage.removeItem(`token`),localStorage.removeItem(`user`),window.location.href=`/login.html`});async function u(e,n={}){let i=await(await fetch(`${t}${e}`,{...n,headers:{...r(),...n.headers}})).json();if(!i.success)throw Error(i.message||`Request failed`);return i}async function d(){try{let e=await u(`/dashboard`);document.getElementById(`stat-users`).textContent=e.stats.totalUsers,document.getElementById(`stat-products`).textContent=e.stats.totalProducts,document.getElementById(`stat-orders`).textContent=e.stats.totalOrders,document.getElementById(`stat-collections`).textContent=e.stats.totalCollections,document.getElementById(`stat-revenue`).textContent=`$${(e.stats.totalRevenue||0).toLocaleString()}`,document.getElementById(`stat-messages`).textContent=e.stats.totalContactMessages;let t=document.getElementById(`orders-by-status`);e.ordersByStatus?.length?t.innerHTML=`<div class="status-bar">${e.ordersByStatus.map(e=>`<span class="status-item ${e.status}">${e.status}: ${e.count}</span>`).join(``)}</div>`:t.innerHTML=`<p class="muted">No orders yet</p>`}catch(e){i(`Dashboard: ${e.message}`)}}async function f(){try{let e=await u(`/collections`),t=document.getElementById(`collections-tbody`);t.innerHTML=e.collections.map(e=>`
      <tr>
        <td><strong>${e.name}</strong></td>
        <td>${e.slug}</td>
        <td>${e._count?.products??0}</td>
        <td>
          <div class="action-group">
            <button class="btn-secondary" onclick="editCollection('${e.id}')">Edit</button>
            <button class="btn-danger" onclick="deleteCollection('${e.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join(``)}catch(e){i(`Collections: ${e.message}`)}}document.getElementById(`add-collection-btn`).addEventListener(`click`,()=>{a(`New Collection`,`
    <form class="admin-form" id="collection-form">
      <div class="form-group"><label>Name</label><input type="text" id="col-name" class="form-input" required /></div>
      <div class="form-group"><label>Slug</label><input type="text" id="col-slug" class="form-input" required /></div>
      <div class="form-group"><label>Description</label><textarea id="col-desc" class="form-input" rows="3"></textarea></div>
      <div class="form-group"><label>Image</label>${s(``,`col-img`)}</div>
      <button type="submit" class="btn-primary">Create</button>
    </form>
  `),c(`col-img`),document.getElementById(`collection-form`).addEventListener(`submit`,async e=>{e.preventDefault();try{await u(`/collections`,{method:`POST`,body:JSON.stringify({name:document.getElementById(`col-name`).value,slug:document.getElementById(`col-slug`).value,description:document.getElementById(`col-desc`).value,imageUrl:document.getElementById(`col-img-url`).value||null})}),o(),i(`Collection created`),f()}catch(e){i(e.message)}})}),window.editCollection=async e=>{try{let t=(await u(`/collections`)).collections.find(t=>t.id===e);if(!t)return;a(`Edit Collection`,`
      <form class="admin-form" id="collection-form">
        <div class="form-group"><label>Name</label><input type="text" id="col-name" class="form-input" value="${t.name}" required /></div>
        <div class="form-group"><label>Slug</label><input type="text" id="col-slug" class="form-input" value="${t.slug}" required /></div>
        <div class="form-group"><label>Description</label><textarea id="col-desc" class="form-input" rows="3">${t.description||``}</textarea></div>
        <div class="form-group"><label>Image</label>${s(t.imageUrl||``,`col-img`)}</div>
        <button type="submit" class="btn-primary">Save</button>
      </form>
    `),c(`col-img`),document.getElementById(`collection-form`).addEventListener(`submit`,async t=>{t.preventDefault();try{await u(`/collections/${e}`,{method:`PUT`,body:JSON.stringify({name:document.getElementById(`col-name`).value,slug:document.getElementById(`col-slug`).value,description:document.getElementById(`col-desc`).value,imageUrl:document.getElementById(`col-img-url`).value||null})}),o(),i(`Collection updated`),f()}catch(e){i(e.message)}})}catch(e){i(e.message)}},window.deleteCollection=async e=>{if(confirm(`Delete this collection? Products will be unlinked.`))try{await u(`/collections/${e}`,{method:`DELETE`}),i(`Collection deleted`),f()}catch(e){i(e.message)}};async function p(){try{let e=await u(`/products`),t=document.getElementById(`products-tbody`);t.innerHTML=e.products.map(e=>`
      <tr>
        <td><div class="product-thumb">${e.imageUrl?`<img src="${e.imageUrl}" alt="" />`:`<span>—</span>`}</div></td>
        <td><strong>${e.name}</strong></td>
        <td>${e.category}</td>
        <td>$${e.basePrice.toLocaleString()}</td>
        <td>${e.collection?.name||`—`}</td>
        <td><span class="badge-stock ${e.inStock?`in`:`out`}">${e.inStock?`In Stock`:`Out`}</span></td>
        <td>
          <div class="action-group">
            <button class="btn-secondary" onclick="editProduct('${e.id}')">Edit</button>
            <button class="btn-danger" onclick="deleteProduct('${e.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join(``)}catch(e){i(`Products: ${e.message}`)}}var m=[];document.getElementById(`add-product-btn`).addEventListener(`click`,async()=>{try{m=(await u(`/collections`)).collections,a(`New Product`,h()),c(`prod-img`),document.getElementById(`product-form`).addEventListener(`submit`,g(`create`))}catch(e){i(e.message)}});function h(e){let t=[`LIVING`,`DINING`,`BEDROOM`,`OFFICE`],n=m.map(t=>`<option value="${t.id}" ${e?.collectionId===t.id?`selected`:``}>${t.name}</option>`).join(``);return`
    <form class="admin-form" id="product-form">
      <div class="form-group"><label>Name</label><input type="text" id="prod-name" class="form-input" value="${e?.name||``}" required /></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div class="form-group"><label>Slug</label><input type="text" id="prod-slug" class="form-input" value="${e?.slug||``}" required /></div>
        <div class="form-group"><label>Category</label><select id="prod-category" class="form-input">${t.map(t=>`<option value="${t}" ${e?.category===t?`selected`:``}>${t}</option>`).join(``)}</select></div>
      </div>
      <div class="form-group"><label>Description</label><textarea id="prod-desc" class="form-input" rows="3">${e?.description||``}</textarea></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div class="form-group"><label>Base Price ($)</label><input type="number" id="prod-price" class="form-input" value="${e?.basePrice||``}" step="1" /></div>
        <div class="form-group"><label>Collection</label><select id="prod-collection" class="form-input"><option value="">None</option>${n}</select></div>
      </div>
      <div class="form-group"><label>Image</label>${s(e?.imageUrl||``,`prod-img`)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
        <div class="form-group"><label>Badge</label><input type="text" id="prod-badge" class="form-input" value="${e?.badge||``}" placeholder="new, bestseller" /></div>
        <div class="form-group"><label>In Stock</label><select id="prod-stock" class="form-input"><option value="true" ${e?.inStock===!1?``:`selected`}>Yes</option><option value="false" ${e?.inStock===!1?`selected`:``}>No</option></select></div>
      </div>
      <button type="submit" class="btn-primary">${e?`Save`:`Create`}</button>
    </form>
  `}function g(e){return async t=>{t.preventDefault();let n={name:document.getElementById(`prod-name`).value,slug:document.getElementById(`prod-slug`).value,category:document.getElementById(`prod-category`).value,description:document.getElementById(`prod-desc`).value,basePrice:parseFloat(document.getElementById(`prod-price`).value)||0,collectionId:document.getElementById(`prod-collection`).value||null,imageUrl:document.getElementById(`prod-img-url`).value||null,badge:document.getElementById(`prod-badge`).value||null,inStock:document.getElementById(`prod-stock`).value===`true`};try{e===`create`&&(await u(`/products`,{method:`POST`,body:JSON.stringify(n)}),i(`Product created`)),o(),p()}catch(e){i(e.message)}}}window.editProduct=async e=>{try{let t=(await u(`/products/${e}`)).product;m=(await u(`/collections`)).collections,a(`Edit Product`,h(t)),c(`prod-img`),document.getElementById(`product-form`).addEventListener(`submit`,async t=>{t.preventDefault();let n={name:document.getElementById(`prod-name`).value,slug:document.getElementById(`prod-slug`).value,category:document.getElementById(`prod-category`).value,description:document.getElementById(`prod-desc`).value,basePrice:parseFloat(document.getElementById(`prod-price`).value)||0,collectionId:document.getElementById(`prod-collection`).value||null,imageUrl:document.getElementById(`prod-img-url`).value||null,badge:document.getElementById(`prod-badge`).value||null,inStock:document.getElementById(`prod-stock`).value===`true`};try{await u(`/products/${e}`,{method:`PUT`,body:JSON.stringify(n)}),o(),i(`Product updated`),p()}catch(e){i(e.message)}})}catch(e){i(e.message)}},window.deleteProduct=async e=>{if(confirm(`Delete this product?`))try{await u(`/products/${e}`,{method:`DELETE`}),i(`Product deleted`),p()}catch(e){i(e.message)}};async function _(){try{let e=await u(`/rates`);document.getElementById(`rate-delivery`).value=e.rates.delivery_rate||``,document.getElementById(`rate-tax`).value=e.rates.tax_rate||``,document.getElementById(`rate-minimum`).value=e.rates.minimum_order||``}catch(e){i(`Rates: ${e.message}`)}}document.getElementById(`rates-form`).addEventListener(`submit`,async e=>{e.preventDefault();try{await u(`/rates`,{method:`PUT`,body:JSON.stringify({delivery_rate:document.getElementById(`rate-delivery`).value,tax_rate:document.getElementById(`rate-tax`).value,minimum_order:document.getElementById(`rate-minimum`).value})}),i(`Rates saved`)}catch(e){i(e.message)}});async function v(){try{let e=await u(`/address`);document.getElementById(`addr-name`).value=e.address.name||``,document.getElementById(`addr-address`).value=e.address.address||``,document.getElementById(`addr-phone`).value=e.address.phone||``,document.getElementById(`addr-email`).value=e.address.email||``}catch(e){i(`Address: ${e.message}`)}}document.getElementById(`address-form`).addEventListener(`submit`,async e=>{e.preventDefault();try{await u(`/address`,{method:`PUT`,body:JSON.stringify({company_name:document.getElementById(`addr-name`).value,company_address:document.getElementById(`addr-address`).value,company_phone:document.getElementById(`addr-phone`).value,company_email:document.getElementById(`addr-email`).value})}),i(`Address saved`)}catch(e){i(e.message)}});async function y(){try{let e=document.getElementById(`order-status-filter`).value,t=document.getElementById(`order-payment-filter`).value,n=(document.getElementById(`order-search`)?.value||``).toLowerCase().trim(),r=new URLSearchParams;e&&r.set(`status`,e),t&&r.set(`payment`,t);let i=await u(`/orders?${r}`),a=document.getElementById(`orders-tbody`),o=document.getElementById(`order-badge`);if(o)try{let e=(await u(`/orders?status=PENDING&limit=1`)).total||0;o.style.display=e>0?`inline-flex`:`none`}catch{o.style.display=`none`}let s=i.orders||[];if(n&&(s=s.filter(e=>(e.user?.firstName+` `+e.user?.lastName).toLowerCase().includes(n)||(e.referenceCode||``).toLowerCase().includes(n)||(e.user?.email||``).toLowerCase().includes(n))),s.length===0){a.innerHTML=`<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--walnut-light);">No orders found</td></tr>`;return}a.innerHTML=s.map(e=>`
      <tr>
        <td><code>${e.referenceCode?.slice(0,8)||e.id.slice(0,8)}</code></td>
        <td><strong>${e.user?.firstName||`—`} ${e.user?.lastName||``}</strong><br><small style="color:var(--walnut-light)">${e.user?.email||``}</small></td>
        <td class="addr-cell" title="${e.user?.address||e.deliveryAddress||``}">
          <span class="addr-truncate">${e.user?.address||e.deliveryAddress||`—`}</span>
        </td>
        <td>${e._count?.items??e.items?.length??0}</td>
        <td>$${(e.finalPrice||e.estimatedPrice||0).toLocaleString()}</td>
        <td><span class="badge-order status-${e.status}">${e.status}</span></td>
        <td><span class="badge-order payment-${e.paymentStatus}">${e.paymentStatus}</span></td>
        <td>${new Date(e.createdAt).toLocaleDateString()}</td>
        <td>
          <div class="action-group">
            <button class="btn-secondary" onclick="viewOrder('${e.id}')">View</button>
            <button class="btn-secondary" onclick="updateStatus('${e.id}')">Status</button>
            <button class="btn-primary order-invoice-btn" onclick="printInvoice('${e.id}')" style="font-size:0.7rem;padding:0.4rem 0.8rem;">Invoice</button>
          </div>
        </td>
      </tr>
    `).join(``)}catch(e){i(`Orders: ${e.message}`)}}window.viewOrder=async e=>{try{let t=(await u(`/orders/${e}`)).order,n=t.items.map(t=>`
      <div class="order-item-row">
        <div class="order-item-img">${t.product?.imageUrl?`<img src="${t.product.imageUrl}" alt="" />`:`<span>—</span>`}</div>
        <div class="order-item-info">
          <strong>${t.product?.name||`Unknown`}</strong>
          <span class="item-price-label">$${t.price.toLocaleString()} ea</span>
        </div>
        <div class="order-item-qty">
          <button class="qty-btn" onclick="updateItemQty('${e}','${t.id}',${t.quantity-1})" ${t.quantity<=1?`disabled`:``}>−</button>
          <span class="qty-value">${t.quantity}</span>
          <button class="qty-btn" onclick="updateItemQty('${e}','${t.id}',${t.quantity+1})">+</button>
        </div>
        <div class="order-item-total">$${(t.quantity*t.price).toLocaleString()}</div>
      </div>
    `).join(``);a(`Order #${t.referenceCode?.slice(0,8)||t.id.slice(0,8)}`,`
      <div class="order-detail">
        <div class="order-detail-grid">
          <div class="detail-group">
            <label>Customer</label>
            <p>${t.user?.firstName||``} ${t.user?.lastName||``}</p>
            <p class="small">${t.user?.email||``}</p>
            ${t.user?.phone?`<p class="small">${t.user.phone}</p>`:``}
          </div>
          <div class="detail-group">
            <label>User Address</label>
            <p>${t.user?.address||`—`}</p>
            <p class="small">${t.user?.phone?`Phone: ${t.user.phone}`:``}</p>
          </div>
          <div class="detail-group">
            <label>Delivery</label>
            <p>${t.deliveryAddress||`—`}</p>
            <p class="small">${t.country||``}</p>
          </div>
          <div class="detail-group">
            <label>Status</label>
            <p><span class="badge-order status-${t.status}">${t.status}</span></p>
          </div>
          <div class="detail-group">
            <label>Payment</label>
            <p><span class="badge-order payment-${t.paymentStatus}">${t.paymentStatus}</span></p>
          </div>
        </div>
        <div class="detail-group">
          <label>Customisation</label>
          <p>Material: ${t.material} / Finish: ${t.finish} / Dimension: ${t.dimension}${t.customDimensions?` (${t.customDimensions})`:``}${t.upholstery?` / Upholstery: ${t.upholstery}`:``}</p>
          ${t.notes?`<p class="small">Notes: ${t.notes}</p>`:``}
        </div>
        <div class="detail-group">
          <label>Items</label>
          <div class="order-items-list">${n}</div>
        </div>
        <div class="order-total-bar">
          <span>Estimated: $${t.estimatedPrice.toLocaleString()}</span>
          ${t.finalPrice?`<span><strong>Final: $${t.finalPrice.toLocaleString()}</strong></span>`:``}
        </div>
      </div>
    `)}catch(e){i(e.message)}};var b=[`PENDING`,`CONFIRMED`,`IN_PRODUCTION`,`QUALITY_CHECK`,`SHIPPED`,`DELIVERED`,`CANCELLED`];window.updateStatus=async e=>{a(`Update Order Status`,`
    <form class="admin-form" id="status-form">
      <div class="form-group"><label>New Status</label>
        <select id="order-new-status" class="form-input">
          ${b.map(e=>`<option value="${e}">${e}</option>`).join(``)}
        </select>
      </div>
      <button type="submit" class="btn-primary">Update</button>
    </form>
  `),document.getElementById(`status-form`).addEventListener(`submit`,async t=>{t.preventDefault();try{await u(`/orders/${e}/status`,{method:`PATCH`,body:JSON.stringify({status:document.getElementById(`order-new-status`).value})}),o(),i(`Status updated`),y()}catch(e){i(e.message)}})},document.getElementById(`order-status-filter`).addEventListener(`change`,y),document.getElementById(`order-payment-filter`).addEventListener(`change`,y),document.getElementById(`order-search`)?.addEventListener(`input`,y),window.printInvoice=async e=>{try{let t=(await u(`/orders/${e}`)).order,n=await u(`/rates`),r=await u(`/address`),i=t.items.map((e,t)=>`
      <tr>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;">${t+1}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;">${e.product?.name||`Unknown`}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:center;">${e.quantity}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:right;">$${e.price.toFixed(2)}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:right;">$${(e.quantity*e.price).toFixed(2)}</td>
      </tr>
    `).join(``),a=t.items.reduce((e,t)=>e+t.quantity*t.price,0),o=parseFloat(n.rates?.delivery_rate||0),s=parseFloat(n.rates?.tax_rate||0),c=s/100*a,l=a+o+c,d=window.open(``,`_blank`);d.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Invoice #${t.referenceCode?.slice(0,8)||t.id.slice(0,8)}</title>
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
            <p>#${t.referenceCode?.slice(0,8)||t.id.slice(0,8)}</p>
            <p style="margin-top:0.3rem;"><span class="status-badge">${t.status}</span></p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h3>From</h3>
            <p><strong>${r.address?.name||`Jangid`}</strong></p>
            <p>${r.address?.address||``}</p>
            <p class="small">${r.address?.phone||``}</p>
            <p class="small">${r.address?.email||``}</p>
          </div>
          <div class="info-box">
            <h3>Bill To</h3>
            <p><strong>${t.user?.firstName||``} ${t.user?.lastName||``}</strong></p>
            <p>${t.user?.address||t.deliveryAddress||``}</p>
            <p class="small">${t.user?.email||``}</p>
            ${t.user?.phone?`<p class="small">${t.user.phone}</p>`:``}
          </div>
          <div class="info-box">
            <h3>Order</h3>
            <p>Date: ${new Date(t.createdAt).toLocaleDateString(`en-US`,{year:`numeric`,month:`long`,day:`numeric`})}</p>
            <p class="small">Delivery: ${t.deliveryAddress}</p>
            <p class="small">Material: ${t.material} / ${t.finish}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr><th style="width:3rem;">#</th><th>Item</th><th style="width:3rem;text-align:center;">Qty</th><th style="width:5rem;text-align:right;">Price</th><th style="width:5rem;text-align:right;">Total</th></tr>
          </thead>
          <tbody>${i}</tbody>
        </table>

        <table class="totals">
          <tr><td>Subtotal</td><td>$${a.toFixed(2)}</td></tr>
          ${o?`<tr><td>Delivery</td><td>$${o.toFixed(2)}</td></tr>`:``}
          ${c?`<tr><td>Tax (${s}%)</td><td>$${c.toFixed(2)}</td></tr>`:``}
          <tr><td>Total</td><td>$${l.toFixed(2)}</td></tr>
        </table>

        <div class="footer">
          <p>Thank you for choosing Jangid — heirloom-quality furniture, crafted for a lifetime.</p>
          <p style="margin-top:0.3rem;">${r.address?.name||`Jangid`} · ${r.address?.phone||``} · ${r.address?.email||``}</p>
        </div>

        <div class="no-print" style="text-align:center;margin-top:2rem;">
          <button onclick="window.print()" style="padding:0.6rem 1.5rem;background:#2C1810;color:#F5F0E8;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;">Print Invoice</button>
        </div>
      </body>
      </html>
    `),d.document.close()}catch(e){i(`Invoice: ${e.message}`)}},window.companyInvoice=async e=>{a(`Company Invoice`,`
    <form class="admin-form" id="company-invoice-form">
      <div class="form-group"><label>Company Name</label><input type="text" id="inv-company" class="form-input" required /></div>
      <div class="form-group"><label>GST / VAT Number</label><input type="text" id="inv-gst" class="form-input" /></div>
      <div class="form-group"><label>Billing Address</label><textarea id="inv-billing-addr" class="form-input" rows="3" required></textarea></div>
      <button type="submit" class="btn-primary">Generate Invoice</button>
    </form>
  `),document.getElementById(`company-invoice-form`).addEventListener(`submit`,async t=>{t.preventDefault(),o();let n=document.getElementById(`inv-company`).value,r=document.getElementById(`inv-gst`).value,i=document.getElementById(`inv-billing-addr`).value;await x(e,n,r,i)})};async function x(e,t,n,r){try{let i=(await u(`/orders/${e}`)).order,a=await u(`/rates`),o=await u(`/address`),s=i.items.map((e,t)=>`
      <tr>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;">${t+1}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;">${e.product?.name||`Unknown`}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:center;">${e.quantity}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:right;">$${e.price.toFixed(2)}</td>
        <td style="padding:0.5rem 0.6rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:right;">$${(e.quantity*e.price).toFixed(2)}</td>
      </tr>
    `).join(``),c=i.items.reduce((e,t)=>e+t.quantity*t.price,0),l=parseFloat(a.rates?.delivery_rate||0),d=parseFloat(a.rates?.tax_rate||0),f=d/100*c,p=c+l+f,m=window.open(``,`_blank`);m.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Tax Invoice #${i.referenceCode?.slice(0,8)||i.id.slice(0,8)}</title>
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
            <p>#${i.referenceCode?.slice(0,8)||i.id.slice(0,8)}</p>
            ${n?`<span class="gst-tag">GST: ${n}</span>`:``}
          </div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h3>Seller</h3>
            <p><strong>${o.address?.name||`Jangid`}</strong></p>
            <p>${o.address?.address||``}</p>
            <p class="small">${o.address?.phone||``}</p>
            <p class="small">${o.address?.email||``}</p>
          </div>
          <div class="info-box">
            <h3>Bill To</h3>
            <p><strong>${t}</strong></p>
            <p>${r}</p>
            ${n?`<p class="gst-number">GST: ${n}</p>`:``}
          </div>
          <div class="info-box">
            <h3>Shipping</h3>
            <p><strong>${i.user?.firstName||``} ${i.user?.lastName||``}</strong></p>
            <p>${i.deliveryAddress||``}</p>
            <p class="small">${i.country||``}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr><th style="width:2.5rem;">#</th><th>Description</th><th style="width:3rem;text-align:center;">Qty</th><th style="width:5rem;text-align:right;">Rate</th><th style="width:5rem;text-align:right;">Amount</th></tr>
          </thead>
          <tbody>${s}</tbody>
        </table>

        <p class="amount-words">Amount in words: ${S(p)}</p>

        <table class="totals">
          <tr><td>Subtotal</td><td>$${c.toFixed(2)}</td></tr>
          ${l?`<tr><td>Delivery</td><td>$${l.toFixed(2)}</td></tr>`:``}
          ${f?`<tr><td>Tax @ ${d}%</td><td>$${f.toFixed(2)}</td></tr>`:``}
          <tr><td>Total</td><td>$${p.toFixed(2)}</td></tr>
        </table>

        <div class="footer">
          <p><strong>${o.address?.name||`Jangid`}</strong></p>
          <p>${o.address?.address||``} | ${o.address?.phone||``} | ${o.address?.email||``}</p>
          <p style="margin-top:0.3rem;">Thank you for your business!</p>
        </div>

        <div class="no-print" style="text-align:center;margin-top:2rem;">
          <button onclick="window.print()" style="padding:0.6rem 1.5rem;background:#2C1810;color:#F5F0E8;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;">Print Tax Invoice</button>
        </div>
      </body>
      </html>
    `),m.document.close()}catch(e){i(`Company invoice: ${e.message}`)}}function S(e){if(e===0)return`Zero`;let t=[``,`One`,`Two`,`Three`,`Four`,`Five`,`Six`,`Seven`,`Eight`,`Nine`,`Ten`,`Eleven`,`Twelve`,`Thirteen`,`Fourteen`,`Fifteen`,`Sixteen`,`Seventeen`,`Eighteen`,`Nineteen`],n=[``,``,`Twenty`,`Thirty`,`Forty`,`Fifty`,`Sixty`,`Seventy`,`Eighty`,`Ninety`],r=[``,`Thousand`,`Million`,`Billion`];function i(e){if(e===0)return``;let r=``;return e>=100&&(r+=t[Math.floor(e/100)]+` Hundred `,e%=100),e>=20&&(r+=n[Math.floor(e/10)]+` `,e%=10),e>0&&(r+=t[e]+` `),r.trim()+` `}let a=``,o=0;for(;e>0;){let t=Math.floor(e%1e3);t>0&&(a=i(t)+r[o]+` `+a),e=Math.floor(e/1e3),o++}return a.trim()+` Dollars`}var C=[],w=[];async function T(){try{w=(await u(`/products`)).products||[];let e=document.getElementById(`cb-product-select`);e.innerHTML=`<option value="">— Select a product —</option>`+w.map(e=>`<option value="${e.id}" data-price="${e.basePrice}">${e.name} — $${e.basePrice}</option>`).join(``)}catch(e){i(`Counter Bill: ${e.message}`)}E()}document.getElementById(`cb-add-selected`).addEventListener(`click`,()=>{let e=document.getElementById(`cb-product-select`),t=e.value;if(!t){i(`Select a product`);return}let n=w.find(e=>e.id===t);if(!n)return;let r=C.find(e=>e.id===t);r?r.qty+=1:C.push({id:t,desc:n.name,qty:1,rate:n.basePrice}),e.value=``,E()});function E(){let e=document.getElementById(`cb-items-tbody`);if(C.length===0){e.innerHTML=`<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:var(--walnut-light);font-size:0.85rem;">No items added yet. Select a product above.</td></tr>`,O();return}e.innerHTML=C.map((e,t)=>`
    <tr>
      <td><strong>${e.desc}</strong></td>
      <td><input type="number" class="form-input cb-qty-inline" value="${e.qty}" min="1" style="width:60px;text-align:center;padding:0.3rem 0.5rem;" data-index="${t}" /></td>
      <td><input type="number" class="form-input cb-rate-inline" value="${e.rate}" step="0.01" min="0" style="width:100px;text-align:right;padding:0.3rem 0.5rem;" data-index="${t}" /></td>
      <td style="font-weight:600;">$${(e.qty*e.rate).toFixed(2)}</td>
      <td><button class="btn-danger" style="padding:0.2rem 0.5rem;font-size:0.7rem;" onclick="removeCbItem(${t})">&times;</button></td>
    </tr>
  `).join(``),document.querySelectorAll(`.cb-qty-inline`).forEach(e=>{e.addEventListener(`input`,()=>{let t=parseInt(e.dataset.index);C[t].qty=parseInt(e.value)||1,E()})}),document.querySelectorAll(`.cb-rate-inline`).forEach(e=>{e.addEventListener(`input`,()=>{let t=parseInt(e.dataset.index);C[t].rate=parseFloat(e.value)||0,E()})}),O()}window.removeCbItem=e=>{C.splice(e,1),E()};function D(){return{enabled:document.getElementById(`cb-gst-toggle`).checked,rate:parseFloat(document.getElementById(`cb-gst-rate`).value)||0}}async function O(){let e=C.reduce((e,t)=>e+t.qty*t.rate,0),t=D(),n=t.enabled?e*(t.rate/100):0,r=e+n;document.getElementById(`cb-subtotal`).textContent=`₹`+e.toFixed(2),document.getElementById(`cb-tax-row`).style.display=t.enabled?``:`none`,document.getElementById(`cb-tax`).textContent=`₹`+n.toFixed(2),document.getElementById(`cb-grand-total`).textContent=`₹`+r.toFixed(2)}document.getElementById(`cb-gst-toggle`).addEventListener(`change`,O),document.getElementById(`cb-gst-rate`).addEventListener(`input`,O),document.getElementById(`cb-print-btn`).addEventListener(`click`,async()=>{if(C.length===0){i(`Add at least one item`);return}await k(document.getElementById(`cb-customer-name`).value||`Walk-in Customer`,document.getElementById(`cb-customer-phone`).value||``)});async function k(e,t){try{let n=await u(`/address`),r=D(),i=C.reduce((e,t)=>e+t.qty*t.rate,0),a=r.enabled?i*(r.rate/100):0,o=i+a,s=a/2,c=a/2,l=`CB-`+Date.now().toString(36).toUpperCase(),d=C.map((e,t)=>`
      <tr>
        <td style="padding:0.4rem 0.5rem;border-bottom:1px solid #ddd;font-size:0.75rem;">${t+1}</td>
        <td style="padding:0.4rem 0.5rem;border-bottom:1px solid #ddd;font-size:0.75rem;">${e.desc||`—`}</td>
        <td style="padding:0.4rem 0.5rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:center;">${e.qty}</td>
        <td style="padding:0.4rem 0.5rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:right;">₹${e.rate.toFixed(2)}</td>
        <td style="padding:0.4rem 0.5rem;border-bottom:1px solid #ddd;font-size:0.75rem;text-align:right;">₹${(e.qty*e.rate).toFixed(2)}</td>
      </tr>
    `).join(``),f=window.open(``,`_blank`);f.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Counter Bill ${l}</title>
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
          <h1>${n.address?.name||`JANGID`}</h1>
          <div class="sub">${n.address?.address||``} | ${n.address?.phone||``}</div>
          <div class="bill-no">Bill No: ${l} | ${new Date().toLocaleDateString(`en-US`,{year:`numeric`,month:`long`,day:`numeric`})}</div>
        </div>

        <div class="info-row">
          <div>
            <label>Customer</label>
            ${e}
          </div>
          <div style="text-align:right;">
            ${t?`<label>Phone</label>${t}`:``}
          </div>
        </div>

        <table>
          <thead>
            <tr><th style="width:2rem;">#</th><th>Item</th><th style="width:3rem;text-align:center;">Qty</th><th style="width:5rem;text-align:right;">Rate</th><th style="width:5rem;text-align:right;">Amount</th></tr>
          </thead>
          <tbody>${d}</tbody>
        </table>

        <table class="totals">
          <tr><td>Subtotal</td><td>₹${i.toFixed(2)}</td></tr>
          ${r.enabled?`
          <tr><td>CGST @ ${(r.rate/2).toFixed(2)}%</td><td>₹${s.toFixed(2)}</td></tr>
          <tr><td>SGST @ ${(r.rate/2).toFixed(2)}%</td><td>₹${c.toFixed(2)}</td></tr>
          `:``}
          <tr><td>Total</td><td>₹${o.toFixed(2)}</td></tr>
        </table>

        <div class="thankyou">Thank you, visit again!</div>

        <div class="footer">
          <p>${n.address?.name||`Jangid`} | ${n.address?.address||``} | ${n.address?.phone||``} | ${n.address?.email||``}</p>
        </div>

        <div class="no-print" style="text-align:center;margin-top:2rem;">
          <button onclick="window.print()" style="padding:0.6rem 1.5rem;background:#2C1810;color:#F5F0E8;border:none;border-radius:6px;cursor:pointer;font-size:0.85rem;">Print Bill</button>
        </div>
      </body>
      </html>
    `),f.document.close()}catch(e){i(`Counter bill: ${e.message}`)}}document.getElementById(`counter-bill-btn`).addEventListener(`click`,()=>{document.querySelectorAll(`.nav-item[data-section]`).forEach(e=>e.classList.remove(`active`)),document.querySelectorAll(`.admin-section`).forEach(e=>e.classList.remove(`active`)),document.querySelector(`[data-section="counterbill"]`)?.classList.add(`active`),document.getElementById(`section-counterbill`)?.classList.add(`active`),T()});async function A(){try{let e=document.getElementById(`enquiry-filter`)?.value||`all`,t=new URLSearchParams;e===`unread`&&t.set(`unread`,`true`);let n=await u(`/enquiries?${t}`),r=document.getElementById(`enquiries-tbody`),i=document.getElementById(`enquiry-badge`);if(i&&(n.unreadCount>0?(i.textContent=n.unreadCount,i.style.display=`inline-flex`):i.style.display=`none`),!n.messages||n.messages.length===0){r.innerHTML=`<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--walnut-light);">No enquiries found</td></tr>`;return}r.innerHTML=n.messages.map(e=>`
      <tr class="${e.read?``:`row-unread`}" id="enq-row-${e.id}">
        <td><strong>${e.name}</strong></td>
        <td><a href="mailto:${e.email}" style="color:var(--terracotta);">${e.email}</a></td>
        <td><span class="enq-subject">${e.subject||`General`}</span></td>
        <td class="addr-cell" title="${e.message}">
          <span class="addr-truncate">${e.message}</span>
        </td>
        <td>${new Date(e.createdAt).toLocaleDateString()}</td>
        <td>
          ${e.read?`<span class="badge-order status-DELIVERED" style="font-size:0.6rem">Read</span>`:`<span class="badge-order status-PENDING" style="font-size:0.6rem">Unread</span>`}
        </td>
        <td>
          <div class="action-group">
            <button class="btn-secondary" onclick="viewEnquiry('${e.id}')">View</button>
            ${e.read?``:`<button class="btn-secondary" onclick="markRead('${e.id}')">Mark Read</button>`}
          </div>
        </td>
      </tr>
    `).join(``)}catch(e){i(`Enquiries: ${e.message}`)}}window.viewEnquiry=async e=>{try{let t=document.getElementById(`enq-row-${e}`)?.querySelectorAll(`td`);if(!t){i(`Cannot find message`);return}t[0]?.textContent.trim(),t[1]?.textContent.trim(),t[2]?.textContent.trim(),t[4]?.textContent.trim();let n=(await u(`/enquiries`)).messages?.find(t=>t.id===e);if(!n){i(`Message not found`);return}if(a(`Enquiry — ${n.name}`,`
      <div class="order-detail">
        <div class="order-detail-grid">
          <div class="detail-group">
            <label>From</label>
            <p><strong>${n.name}</strong></p>
            <p class="small"><a href="mailto:${n.email}" style="color:var(--terracotta)">${n.email}</a></p>
          </div>
          <div class="detail-group">
            <label>Subject</label>
            <p>${n.subject||`General`}</p>
          </div>
          <div class="detail-group">
            <label>Date</label>
            <p>${new Date(n.createdAt).toLocaleString()}</p>
          </div>
          <div class="detail-group">
            <label>Status</label>
            <p>${n.read?`<span class="badge-order status-DELIVERED">Read</span>`:`<span class="badge-order status-PENDING">Unread</span>`}</p>
          </div>
        </div>
        <div class="detail-group" style="margin-top:1rem">
          <label>Message</label>
          <div class="enq-message-body">${n.message.replace(/\n/g,`<br>`)}</div>
        </div>
        ${n.read?``:`
          <div style="margin-top:1.5rem">
            <button class="btn-primary" onclick="markRead('${n.id}')" id="modal-mark-read">Mark as Read</button>
          </div>
        `}
      </div>
    `),!n.read)try{await u(`/enquiries/${e}/read`,{method:`PATCH`}),A()}catch{}}catch(e){i(e.message)}},window.markRead=async e=>{try{await u(`/enquiries/${e}/read`,{method:`PATCH`}),i(`Marked as read`),o(),A()}catch(e){i(e.message)}},document.getElementById(`enquiry-filter`)?.addEventListener(`change`,A);var j=null;async function M(){try{let e=await u(`/hero-slides`),t=document.getElementById(`hero-slides-container`);if(!e.slides||e.slides.length===0){t.innerHTML=`<p class="muted">No hero slides yet. Click "+ Add Slide" to add one.</p>`;return}t.innerHTML=e.slides.map((e,t)=>`
      <div class="pincode-card" style="margin-bottom:0.5rem;">
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <img src="${e.imageUrl}" alt="${e.title||``}" style="width:60px;height:40px;object-fit:cover;border-radius:4px;background:var(--cream-dark);" />
          <div>
            <strong>${e.title||`Untitled`}</strong>
            <span style="display:block;font-size:0.75rem;color:var(--walnut-light);">#${e.order} · ${e.active?`Active`:`Inactive`} · ${e.transition||`zoom`}</span>
          </div>
        </div>
        <div class="pincode-card-right">
          <button class="btn-secondary btn-table" onclick="editHeroSlide('${e.id}')">Edit</button>
          <button class="btn-danger btn-table" onclick="deleteHeroSlide('${e.id}')">Delete</button>
        </div>
      </div>
    `).join(``)}catch(e){i(`Hero: `+e.message)}}window.deleteHeroSlide=async e=>{if(confirm(`Delete this slide?`))try{await u(`/hero-slides/${e}`,{method:`DELETE`}),i(`Deleted`),M()}catch(e){i(e.message)}};function N(e){return`
    <div style="margin-bottom:1rem;">
      <div class="image-upload">
        <div class="image-upload-preview">
          ${e?.imageUrl?`<img src="${e.imageUrl}" id="hero-preview" />`:`<span class="upload-placeholder" id="hero-preview">No image</span>`}
        </div>
        <div class="image-upload-actions">
          <button class="upload-btn-custom" onclick="uploadHeroImage()">Upload Image</button>
          <span class="upload-status" id="hero-upload-status"></span>
        </div>
      </div>
    </div>
    <div class="form-group"><label>Title</label><input type="text" id="hero-title" class="form-input" value="${e?.title||``}" /></div>
    <div class="form-group"><label>Subtitle</label><input type="text" id="hero-subtitle" class="form-input" value="${e?.subtitle||``}" /></div>
    <div class="form-group"><label>Link (optional)</label><input type="text" id="hero-link" class="form-input" value="${e?.link||``}" placeholder="#order" /></div>
    <div class="form-group"><label>Order</label><input type="number" id="hero-order" class="form-input" value="${e?.order??0}" min="0" /></div>
    <div class="form-group"><label>Transition Effect</label>
      <select id="hero-transition" class="form-input" style="appearance:auto;">
        <option value="zoom" ${(e?.transition||`zoom`)===`zoom`?`selected`:``}>Zoom In</option>
        <option value="fade" ${e?.transition===`fade`?`selected`:``}>Fade</option>
        <option value="slide-left" ${e?.transition===`slide-left`?`selected`:``}>Slide Left</option>
        <option value="slide-up" ${e?.transition===`slide-up`?`selected`:``}>Slide Up</option>
        <option value="none" ${e?.transition===`none`?`selected`:``}>None</option>
      </select>
    </div>
    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.85rem;">
      <input type="checkbox" id="hero-active" ${e?.active===!1?``:`checked`} /> Active
    </label>
    <div style="display:flex;gap:0.75rem;margin-top:0.5rem;">
      <button class="btn-primary" id="hero-save-btn">${e?`Update`:`Add`}</button>
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `}window.uploadHeroImage=()=>{let t=document.createElement(`input`);t.type=`file`,t.accept=`image/*`,t.onchange=async()=>{let r=t.files[0];if(r){document.getElementById(`hero-upload-status`).textContent=`Uploading…`;try{let t=new FormData;t.append(`image`,r);let i=await(await fetch(`${e}/api/upload`,{method:`POST`,headers:{Authorization:`Bearer ${n()}`},body:t})).json();i.url?(document.getElementById(`hero-preview`).outerHTML=`<img src="${i.url}" id="hero-preview" style="width:100%;height:100%;object-fit:cover;" />`,document.getElementById(`hero-upload-status`).textContent=`Uploaded ✓`):document.getElementById(`hero-upload-status`).textContent=`Upload failed`}catch{document.getElementById(`hero-upload-status`).textContent=`Error`}}},t.click()},document.getElementById(`add-hero-btn`).addEventListener(`click`,()=>{j=null,a(`New Hero Slide`,N(null)),document.getElementById(`hero-save-btn`).addEventListener(`click`,P)}),window.editHeroSlide=e=>{j=e,a(`Edit Hero Slide`,`<p class="muted" style="margin-bottom:0.75rem;">Loading…</p>`),u(`/hero-slides`).then(t=>{let n=t.slides.find(t=>t.id===e);if(!n){o(),i(`Slide not found`);return}document.getElementById(`modal-body`).innerHTML=N(n),document.getElementById(`hero-save-btn`).addEventListener(`click`,P)}).catch(e=>{i(e.message),o()})};async function P(){let e=document.getElementById(`hero-preview`)?.getAttribute(`src`)||``,t=document.getElementById(`hero-title`).value.trim(),n=document.getElementById(`hero-subtitle`).value.trim(),r=document.getElementById(`hero-link`).value.trim(),a=parseInt(document.getElementById(`hero-order`).value)||0,s=document.getElementById(`hero-active`).checked,c=document.getElementById(`hero-transition`).value||`zoom`;if(!e||e===`No image`){i(`Please upload an image`);return}try{let l=JSON.stringify({imageUrl:e,title:t,subtitle:n,link:r,order:a,active:s,transition:c});j?(await u(`/hero-slides/${j}`,{method:`PUT`,body:l}),i(`Slide updated`)):(await u(`/hero-slides`,{method:`POST`,body:l}),i(`Slide added`)),o(),M()}catch(e){i(e.message)}}var F=null,I=[];async function L(){try{I=(await u(`/featured-types`)).types||[],R(),z()}catch(e){i(`Carousel: `+e.message)}}function R(){let e=document.getElementById(`carousel-slots`);if(!e)return;let t=I.filter(e=>e.featured).sort((e,t)=>(e.featuredOrder||0)-(t.featuredOrder||0)),n=[];for(let e=0;e<5;e++){let r=t.find(t=>(t.featuredOrder||0)===e+1)||t.find(e=>!n.includes(e.id)&&e.featured);n.push(r?r.id:``)}let r=I.filter(e=>e.active).map(e=>`<option value="${e.id}">${e.name}${e.featured?` ★`:``}</option>`).join(``);e.innerHTML=Array.from({length:5},(e,t)=>`
    <div class="pincode-card" style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0.75rem;">
      <span style="font-weight:600;font-size:0.85rem;min-width:50px;color:var(--terracotta);">Slot ${t+1}</span>
      <select class="carousel-slot-select" data-slot="${t+1}" style="flex:1;padding:0.4rem 0.5rem;border:1.5px solid var(--cream-mid);border-radius:6px;background:var(--white);font-size:0.82rem;color:var(--walnut);">
        <option value="">— None —</option>
        ${r}
      </select>
      <span class="slot-preview" id="slot-preview-${t}" style="font-size:0.75rem;color:var(--walnut-light);min-width:60px;text-align:right;">
        ${n[t]?`✓ Selected`:``}
      </span>
    </div>
  `).join(``),e.querySelectorAll(`.carousel-slot-select`).forEach(e=>{let n=parseInt(e.dataset.slot),r=t.find(e=>e.featuredOrder===n);r&&(e.value=r.id)})}function z(){let e=document.getElementById(`featured-types-container`);if(e){if(!I.length){e.innerHTML=`<p class="muted">No types yet. Click "+ Add Type" to add one.</p>`;return}I.filter(e=>e.featured).length,e.innerHTML=I.map(e=>`
    <div class="pincode-card" style="margin-bottom:0.5rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        ${e.imageUrl?`<img src="${e.imageUrl}" style="width:60px;height:40px;object-fit:cover;border-radius:4px;background:var(--cream-dark);" />`:`<div style="width:60px;height:40px;border-radius:4px;background:var(--cream-dark);display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:var(--walnut-light);">No img</div>`}
        <div>
          <strong>${e.name}</strong>
          <span style="display:block;font-size:0.75rem;color:var(--walnut-light);">Order ${e.order} · ${e.active?`Active`:`Inactive`}${e.featured?` · Carousel Slot #${e.featuredOrder}`:``}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <div class="pincode-card-right">
          <button class="btn-secondary btn-table" onclick="editFeaturedType('${e.id}')">Edit</button>
          <button class="btn-danger btn-table" onclick="deleteFeaturedType('${e.id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join(``)}}document.getElementById(`carousel-save-slots`)?.addEventListener(`click`,async()=>{let e=document.querySelectorAll(`.carousel-slot-select`),t=[];if(e.forEach(e=>{let n=parseInt(e.dataset.slot),r=e.value;r&&t.push({typeId:r,slot:n})}),t.length===0){i(`Select at least one type for the carousel`);return}try{for(let e of I)e.featured&&await u(`/featured-types/${e.id}`,{method:`PUT`,body:JSON.stringify({featured:!1})});for(let e of t)await u(`/featured-types/${e.typeId}`,{method:`PUT`,body:JSON.stringify({featured:!0,featuredOrder:e.slot})});i(`Carousel saved!`),L()}catch(e){i(e.message)}}),window.deleteFeaturedType=async e=>{if(confirm(`Delete this type?`))try{await u(`/featured-types/${e}`,{method:`DELETE`}),i(`Deleted`),L()}catch(e){i(e.message)}};function B(e){return`
    <div style="margin-bottom:1rem;">
      <div class="image-upload">
        <div class="image-upload-preview">
          ${e?.imageUrl?`<img src="${e.imageUrl}" id="ft-preview" />`:`<span class="upload-placeholder" id="ft-preview">No image</span>`}
        </div>
        <div class="image-upload-actions">
          <button class="upload-btn-custom" onclick="uploadFtImage()">Upload Image</button>
          <span class="upload-status" id="ft-upload-status"></span>
        </div>
      </div>
    </div>
    <div class="form-group"><label>Name</label><input type="text" id="ft-name" class="form-input" value="${e?.name||``}" /></div>
    <div class="form-group"><label>Description</label><input type="text" id="ft-desc" class="form-input" value="${e?.description||``}" /></div>
    <div class="form-group"><label>Order</label><input type="number" id="ft-order" class="form-input" value="${e?.order??0}" min="0" /></div>
    <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.85rem;">
      <input type="checkbox" id="ft-active" ${e?.active===!1?``:`checked`} /> Active
    </label>
    <div style="display:flex;gap:0.75rem;margin-top:0.5rem;">
      <button class="btn-primary" id="ft-save-btn">${e?`Update`:`Add`}</button>
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `}window.uploadFtImage=()=>{let t=document.createElement(`input`);t.type=`file`,t.accept=`image/*`,t.onchange=async()=>{let r=t.files[0];if(r){document.getElementById(`ft-upload-status`).textContent=`Uploading…`;try{let t=new FormData;t.append(`image`,r);let i=await(await fetch(`${e}/api/upload`,{method:`POST`,headers:{Authorization:`Bearer ${n()}`},body:t})).json();i.url?(document.getElementById(`ft-preview`).outerHTML=`<img src="${i.url}" id="ft-preview" style="width:100%;height:100%;object-fit:cover;" />`,document.getElementById(`ft-upload-status`).textContent=`Uploaded ✓`):document.getElementById(`ft-upload-status`).textContent=`Upload failed`}catch{document.getElementById(`ft-upload-status`).textContent=`Error`}}},t.click()},document.getElementById(`add-featured-btn`).addEventListener(`click`,()=>{F=null,a(`New Featured Type`,B(null)),document.getElementById(`ft-save-btn`).addEventListener(`click`,V)}),window.editFeaturedType=e=>{F=e,a(`Edit Featured Type`,`<p class="muted" style="margin-bottom:0.75rem;">Loading…</p>`),u(`/featured-types`).then(t=>{let n=t.types.find(t=>t.id===e);if(!n){o(),i(`Not found`);return}document.getElementById(`modal-body`).innerHTML=B(n),document.getElementById(`ft-save-btn`).addEventListener(`click`,V)}).catch(e=>{i(e.message),o()})};async function V(){let e=document.getElementById(`ft-preview`)?.getAttribute(`src`)||``,t=document.getElementById(`ft-name`).value.trim(),n=document.getElementById(`ft-desc`).value.trim(),r=parseInt(document.getElementById(`ft-order`).value)||0,a=document.getElementById(`ft-active`).checked;if(!t){i(`Name is required`);return}try{let s=JSON.stringify({name:t,description:n,imageUrl:e,order:r,active:a});F?(await u(`/featured-types/${F}`,{method:`PUT`,body:s}),i(`Updated`)):(await u(`/featured-types`,{method:`POST`,body:s}),i(`Added`)),o(),L()}catch(e){i(e.message)}}var H=null;async function U(){try{let e=await u(`/pincodes`),t=document.getElementById(`pincodes-container`);if(!e.pincodes||e.pincodes.length===0){t.innerHTML=`<div class="pincode-empty">No pincodes added yet. Click "+ Add Pincode" to begin.</div>`;return}t.innerHTML=e.pincodes.map(e=>`
      <div class="pincode-card">
        <div class="pincode-card-left">
          <span class="pincode-code">${e.pincode}</span>
          <span class="pincode-area">${e.areaName||`—`}</span>
        </div>
        <div class="pincode-card-center">
          <span class="pincode-charge-label">Delivery</span>
          <span class="pincode-charge">$${e.deliveryCharge.toFixed(2)}</span>
        </div>
        <div class="pincode-card-right">
          <button class="btn-secondary btn-table" onclick="editPincode('${e.id}','${e.pincode}','${e.areaName||``}',${e.deliveryCharge})">Edit</button>
          <button class="btn-danger btn-table" onclick="deletePincode('${e.id}')">Delete</button>
        </div>
      </div>
    `).join(``)}catch(e){i(`Pincodes: `+e.message)}}window.deletePincode=async e=>{if(confirm(`Delete this pincode?`))try{await u(`/pincodes/${e}`,{method:`DELETE`}),i(`Pincode deleted`),U()}catch(e){i(e.message)}},document.getElementById(`pincode-add-btn`).addEventListener(`click`,()=>{H=null,a(`Add Pincode`,`
    <div class="form-group"><label>Pincode</label><input type="text" id="pin-code" class="form-input" maxlength="10" /></div>
    <div class="form-group"><label>Area Name</label><input type="text" id="pin-area" class="form-input" /></div>
    <div class="form-group"><label>Delivery Charge ($)</label><input type="number" id="pin-charge" class="form-input" step="0.01" min="0" /></div>
    <div style="display:flex;gap:0.75rem;margin-top:1rem;">
      <button class="btn-primary" id="pin-save">Save</button>
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `),document.getElementById(`pin-save`).addEventListener(`click`,W)}),window.editPincode=(e,t,n,r)=>{H=e,a(`Edit Pincode`,`
    <div class="form-group"><label>Pincode</label><input type="text" id="pin-code" class="form-input" value="${t}" readonly style="background:var(--cream-mid);cursor:not-allowed;" /></div>
    <div class="form-group"><label>Area Name</label><input type="text" id="pin-area" class="form-input" value="${n}" /></div>
    <div class="form-group"><label>Delivery Charge ($)</label><input type="number" id="pin-charge" class="form-input" step="0.01" min="0" value="${r}" /></div>
    <div style="display:flex;gap:0.75rem;margin-top:1rem;">
      <button class="btn-primary" id="pin-save">Update</button>
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  `),document.getElementById(`pin-save`).addEventListener(`click`,W)};async function W(){let e=document.getElementById(`pin-code`).value.trim(),t=document.getElementById(`pin-area`).value.trim(),n=parseFloat(document.getElementById(`pin-charge`).value);if(!e||isNaN(n)){i(`Enter pincode and delivery charge`);return}try{H?(await u(`/pincodes/${H}`,{method:`PUT`,body:JSON.stringify({deliveryCharge:n,areaName:t})}),i(`Pincode updated`)):(await u(`/pincodes`,{method:`POST`,body:JSON.stringify({pincode:e,deliveryCharge:n,areaName:t})}),i(`Pincode added`)),o(),U()}catch(e){i(e.message)}}document.addEventListener(`DOMContentLoaded`,()=>{d(),f(),p(),y(),_(),v(),A(),U()});