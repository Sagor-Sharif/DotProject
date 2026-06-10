// ================== DATA ==================
const products = [
  { id:1, name:'Auto Cat Feeder', cat:'Smart Devices', price:49, emoji:'🐱', desc:'Fully 3D-printed body with automatic timer-based feeding mechanism. Perfect for busy cat owners.', isNew:true, isTop:true },
  { id:2, name:'Custom Keyring', cat:'Keychains & Rings', price:8, emoji:'🔑', desc:'Personalized keychain with your name, initial, or custom logo. Available in 12 colors.', isNew:true, isTop:true },
  { id:3, name:'Fish Auto Feeder', cat:'Smart Devices', price:35, emoji:'🐠', desc:'Automatic aquarium fish feeder with programmable schedule. Compact and watertight design.', isNew:true, isTop:false },
  { id:4, name:'Mini Floating Shelf', cat:'Home Decor', price:9, emoji:'🏠', desc:'Sleek wall-mounted floating shelf. Minimal design, maximum impact. Easy to install.', isNew:false, isTop:true },
  { id:5, name:'Desk Organizer', cat:'Home Decor', price:14, emoji:'📐', desc:'Modular desk organizer with slots for pens, cards, phone, and more. Clean geometric form.', isNew:true, isTop:false },
  { id:6, name:'Phone Stand', cat:'Home Decor', price:12, emoji:'📱', desc:'Adjustable 3D-printed phone stand compatible with all device sizes. Foldable design.', isNew:false, isTop:true },
  { id:7, name:'Plant Pot Holder', cat:'Home Decor', price:11, emoji:'🌿', desc:'Geometric succulent pot in a modern honeycomb shape. Indoor and outdoor use.', isNew:true, isTop:false },
  { id:8, name:'Miniature Building', cat:'Home Decor', price:22, emoji:'🏛️', desc:'Highly detailed architectural miniature. Great for gifts and desk decoration.', isNew:false, isTop:true },
];

let cart = [];
const SUPER_ADMIN_EMAIL = 'superadmin@gmail.com';
const BKASH_PERSONAL_NUMBER = '0175047924';
const NAGAD_PERSONAL_NUMBER = '0175047924';
let currentUser = JSON.parse(localStorage.getItem('dotCurrentUser') || 'null');
let adminEmails = JSON.parse(localStorage.getItem('dotAdminEmails') || 'null') || [SUPER_ADMIN_EMAIL];
let resetCode = '';
let resetEmail = '';

function getNewProducts(){ return products.filter(p=>p.isNew); }
function getTopProducts(){ return products.filter(p=>p.isTop); }

function renderProductCard(p) {
  return `<div class="product-card" onclick="openProductModal(${p.id})">
    <div class="product-img">
      ${p.isNew ? '<span class="product-badge-new">NEW</span>' : p.isTop ? '<span class="product-badge-hot">🔥 HOT</span>' : ''}
      <span style="font-size:4rem">${p.emoji}</span>
    </div>
    <div class="product-info">
      <div class="product-category">${p.cat}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-desc">${p.desc.substring(0,80)}...</div>
      <div class="product-footer">
        <div class="product-price">$${p.price} <span>USD</span></div>
        <button class="btn-add-cart" onclick="event.stopPropagation();addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>
  </div>`;
}

function renderGrids() {
  document.getElementById('new-products-grid').innerHTML = getNewProducts().map(renderProductCard).join('');
  document.getElementById('top-products-grid').innerHTML = getTopProducts().map(renderProductCard).join('');
  renderAdminTable();
}

function renderAdminTable() {
  const tb = document.getElementById('admin-product-table');
  if(!tb) return;
  tb.innerHTML = products.map(p=>`<tr>
    <td><strong>${p.emoji} ${p.name}</strong></td>
    <td>${p.cat}</td>
    <td>$${p.price}</td>
    <td>10</td>
    <td><span class="status-badge status-active">Active</span></td>
    <td><button class="btn-outline-dark" style="padding:5px 12px;font-size:0.75rem">Edit</button></td>
  </tr>`).join('');
}

// ================== PAGES ==================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  window.scrollTo(0,0);
  if(id==='checkout') renderCheckoutSummary();
  closeAllModals();
}

function scrollToShop() {
  showPage('home');
  setTimeout(()=>{ document.getElementById('new-arrivals')?.scrollIntoView({behavior:'smooth'}); }, 100);
}
function scrollToAbout() {
  showPage('home');
  setTimeout(()=>{ document.getElementById('section-about')?.scrollIntoView({behavior:'smooth'}); }, 100);
}

// ================== MODALS ==================
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
function closeAllModals(){ document.querySelectorAll('.modal-page').forEach(m=>m.classList.remove('open')); }

function openProductModal(id) {
  const p = products.find(x=>x.id===id);
  if(!p) return;
  document.getElementById('modal-product-img').textContent = p.emoji;
  document.getElementById('modal-product-img').style.fontSize = '8rem';
  document.getElementById('modal-product-cat').textContent = p.cat;
  document.getElementById('modal-product-name').textContent = p.name;
  document.getElementById('modal-product-price').textContent = '$'+p.price+' USD';
  document.getElementById('modal-product-desc').textContent = p.desc;
  document.getElementById('modal-product').dataset.productId = id;
  document.getElementById('modal-qty').value = 1;
  openModal('modal-product');
}

function changeQty(delta) {
  const inp = document.getElementById('modal-qty');
  let v = parseInt(inp.value) + delta;
  if(v < 1) v = 1;
  if(v > 99) v = 99;
  inp.value = v;
}

// ================== CART ==================
function addToCart(id) {
  const p = products.find(x=>x.id===id);
  if(!p) return;
  const existing = cart.find(c=>c.id===id);
  if(existing) existing.qty++;
  else cart.push({...p, qty:1});
  updateCartUI();
  showToast('🛒 '+p.name+' added to cart!');
}

function addToCartFromModal() {
  const id = parseInt(document.getElementById('modal-product').dataset.productId);
  const qty = parseInt(document.getElementById('modal-qty').value);
  const p = products.find(x=>x.id===id);
  if(!p) return;
  const existing = cart.find(c=>c.id===id);
  if(existing) existing.qty += qty;
  else cart.push({...p, qty});
  updateCartUI();
  closeModal('modal-product');
  showToast('🛒 '+p.name+' added to cart!');
}

function removeFromCart(id) {
  cart = cart.filter(c=>c.id!==id);
  updateCartUI();
}

function updateCartUI() {
  const total = cart.reduce((s,c)=>s+c.qty, 0);
  document.getElementById('cart-count').textContent = total;
  const totalPrice = cart.reduce((s,c)=>s+(c.price*c.qty), 0);
  document.getElementById('cart-total-price').textContent = '$'+totalPrice.toFixed(2);
  const body = document.getElementById('cart-body');
  if(cart.length === 0) {
    body.innerHTML = '<div class="cart-empty"><div class="empty-icon">🛒</div><p>Your cart is empty</p></div>';
  } else {
    body.innerHTML = cart.map(c=>`<div class="cart-item">
      <div class="cart-item-img">${c.emoji}</div>
      <div class="cart-item-info">
        <h5>${c.name}</h5>
        <p>Qty: ${c.qty}</p>
        <div class="cart-item-price">$${(c.price*c.qty).toFixed(2)}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${c.id})">✕</button>
    </div>`).join('');
  }
}

function toggleCart() {
  const d = document.getElementById('cart-drawer');
  const o = document.getElementById('cart-overlay');
  d.classList.toggle('open');
  o.classList.toggle('open');
}

// ================== CHECKOUT ==================
function hasCartItems() {
  return cart.reduce((total, item) => total + Number(item.qty || 0), 0) > 0;
}

function goToCheckout() {
  if(!hasCartItems()) {
    showToast('Please add a product to your cart before checkout.');
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if(drawer && !drawer.classList.contains('open')) drawer.classList.add('open');
    if(overlay && !overlay.classList.contains('open')) overlay.classList.add('open');
    return;
  }
  showPage('checkout');
}

function updateCheckoutSteps(activeStep = 'payment') {
  const steps = {
    cart: document.getElementById('step1'),
    details: document.getElementById('step2'),
    payment: document.getElementById('step3'),
    confirm: document.getElementById('step4')
  };
  Object.values(steps).forEach(step => step?.classList.remove('active', 'done'));
  if(activeStep === 'payment') {
    steps.cart?.classList.add('done');
    steps.details?.classList.add('done');
    steps.payment?.classList.add('active');
  } else if(activeStep === 'confirm') {
    steps.cart?.classList.add('done');
    steps.details?.classList.add('done');
    steps.payment?.classList.add('done');
    steps.confirm?.classList.add('active');
  } else {
    steps.cart?.classList.add('done');
    steps.details?.classList.add('active');
  }
}

function showCheckoutStage(stage = 'details') {
  const isPayment = stage === 'payment';
  document.querySelectorAll('.checkout-detail-card').forEach(card => card.classList.toggle('hidden', isPayment));
  document.getElementById('checkout-step-payment')?.classList.toggle('hidden', !isPayment);
  document.getElementById('checkout-back-btn')?.classList.toggle('hidden', !isPayment);
  document.getElementById('checkout-next-btn')?.classList.toggle('hidden', isPayment);
  document.getElementById('checkout-place-btn')?.classList.toggle('hidden', !isPayment);
  updateCheckoutSteps(isPayment ? 'payment' : 'details');
  if(isPayment) {
    syncMerchantPaymentNumbers();
    const selectedPay = document.querySelector('.pay-option.selected') || document.querySelector('.pay-option[data-payment="card"]');
    if(selectedPay) selectPay(selectedPay);
  }
}

function continueToPayment() {
  showCheckoutStage('payment');
}

function syncMerchantPaymentNumbers() {
  const bkashNumber = document.getElementById('bkash-merchant-number');
  const nagadNumber = document.getElementById('nagad-merchant-number');
  if(bkashNumber) bkashNumber.textContent = BKASH_PERSONAL_NUMBER;
  if(nagadNumber) nagadNumber.textContent = NAGAD_PERSONAL_NUMBER;
}

function getSelectedPaymentMethod() {
  return document.querySelector('.pay-option.selected')?.dataset.payment || 'card';
}

function validatePaymentDetails() {
  const method = getSelectedPaymentMethod();
  if(method === 'bkash') {
    const trxId = document.getElementById('bkash-trx-id')?.value.trim();
    if(!trxId) {
      showToast('Please enter your bKash TrxID.');
      document.getElementById('bkash-trx-id')?.focus();
      return false;
    }
  }
  if(method === 'nagad') {
    const trxId = document.getElementById('nagad-trx-id')?.value.trim();
    if(!trxId) {
      showToast('Please enter your Nagad TrxID.');
      document.getElementById('nagad-trx-id')?.focus();
      return false;
    }
  }
  return true;
}

function renderCheckoutSummary() {
  const container = document.getElementById('checkout-summary-items');
  const subtotal = cart.reduce((s,c)=>s+(c.price*c.qty), 0);
  if(cart.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.875rem">No items in cart</p>';
  } else {
    container.innerHTML = cart.map(c=>`<div class="summary-item">
      <span class="name">${c.emoji} ${c.name} ×${c.qty}</span>
      <span class="price">$${(c.price*c.qty).toFixed(2)}</span>
    </div>`).join('');
  }
  document.getElementById('summary-subtotal').textContent = '$'+subtotal.toFixed(2);
  document.getElementById('summary-total-price').textContent = '$'+subtotal.toFixed(2);
}

function placeOrder() {
  if(!hasCartItems()) {
    showToast('Your cart is empty. Add a product before placing an order.');
    showPage('home');
    return;
  }
  if(!validatePaymentDetails()) return;
  updateCheckoutSteps('confirm');
  const num = 'DP-' + String(Math.floor(Math.random()*9000)+1000);
  document.getElementById('success-order-num').textContent = 'Order #'+num;
  cart = [];
  updateCartUI();
  showPage('success');
}

function selectPay(el) {
  document.querySelectorAll('.pay-option').forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
  const method = el.dataset.payment || 'card';
  document.querySelectorAll('[data-payment-panel]').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.paymentPanel === method);
  });
  syncMerchantPaymentNumbers();
  updateCheckoutSteps('payment');
}

// ================== AUTH ==================
function handleSignin() {
  closeModal('modal-signin');
  showToast('👋 Welcome back!');
  document.querySelector('.btn-nav-signin').textContent = 'My Account';
}
function handleSignup() {
  closeModal('modal-signup');
  showToast('🎉 Account created! Welcome to DotProject.');
  document.querySelector('.btn-nav-signin').textContent = 'My Account';
}

// ================== ADMIN ==================
function switchAdmin(section, el) {
  document.querySelectorAll('.admin-nav-item').forEach(i=>i.classList.remove('active'));
  el.classList.add('active');
  ['dashboard','add-product','products','orders'].forEach(s=>{
    const el = document.getElementById('admin-'+s);
    if(el) el.style.display = 'none';
  });
  const target = document.getElementById('admin-'+section);
  if(target) target.style.display = 'block';
  if(section==='products') renderAdminTable();
}

function adminAddProduct() {
  const name = document.getElementById('ap-name').value;
  const desc = document.getElementById('ap-desc').value;
  const price = parseFloat(document.getElementById('ap-price').value) || 0;
  const cat = document.getElementById('ap-cat').value;
  const emoji = document.getElementById('preview-emoji').textContent;
  if(!name || !desc || !price) { showToast('⚠️ Please fill all required fields.'); return; }
  products.push({ id: products.length+1, name, cat, price, emoji, desc, isNew:true, isTop:false });
  renderGrids();
  showToast('✅ Product "'+name+'" published!');
  document.getElementById('ap-name').value='';
  document.getElementById('ap-desc').value='';
  document.getElementById('ap-price').value='';
}

// ================== ENHANCED STORE, SHOP, AUTH, AND ADMIN ==================
function normalizeEmail(email){ return (email || '').trim().toLowerCase(); }
function isGmail(email){ return /^[^\s@]+@gmail\.com$/i.test(email || ''); }
function isSuperAdmin(){ return currentUser && normalizeEmail(currentUser.email) === SUPER_ADMIN_EMAIL; }
function isAdminEmail(email){ return adminEmails.map(normalizeEmail).includes(normalizeEmail(email)); }
function saveProducts(){ localStorage.setItem('dotProducts', JSON.stringify(products)); }
function saveAdmins(){ localStorage.setItem('dotAdminEmails', JSON.stringify(adminEmails)); }
function saveCurrentUser(){ localStorage.setItem('dotCurrentUser', JSON.stringify(currentUser)); }
function esc(value){ return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function hydrateProducts(){
  const saved = JSON.parse(localStorage.getItem('dotProducts') || 'null');
  if(saved && Array.isArray(saved)) products.splice(0, products.length, ...saved);
  products.forEach((p, index) => {
    p.id = p.id || index + 1;
    p.photo = p.photo || '';
    p.stock = Number.isFinite(Number(p.stock)) ? Number(p.stock) : 24;
    p.status = p.status || 'Active';
    p.emoji = p.emoji || '3D';
    p.photos = Array.isArray(p.photos) ? p.photos.filter(Boolean) : (typeof p.photos === 'string' ? p.photos.split(',').map(photo => photo.trim()).filter(Boolean) : []);
  });
  saveProducts();
}
function visibleProducts(){ return products.filter(p => p.status === 'Active'); }
function getNewProducts(){ return visibleProducts().filter(p=>p.isNew); }
function getTopProducts(){ return visibleProducts().filter(p=>p.isTop); }
function photoListFrom(value) {
  if(Array.isArray(value)) return value.map(photo => String(photo || '').trim()).filter(Boolean);
  return String(value || '').split(',').map(photo => photo.trim()).filter(Boolean);
}
function productVisual(p, size='4rem') {
  const firstPhoto = [...photoListFrom(p.photos), ...photoListFrom(p.photo)][0];
  return firstPhoto ? `<img src="${esc(firstPhoto)}" alt="${esc(p.name)}">` : `<span style="font-size:${size};font-family:'Syne',sans-serif;font-weight:800;color:var(--queen-blue)">${esc(p.emoji || '3D')}</span>`;
}
function getShortDescription(p) {
  const text = String(p.shortDesc || p.desc || '').trim();
  if(text.length <= 150) return text;
  return text.slice(0, 147).trim() + '...';
}
function getProductGallery(p) {
  const rawPhotos = [
    ...photoListFrom(p.photos),
    ...photoListFrom(p.photo)
  ].map(photo => String(photo || '').trim()).filter(Boolean);
  const photos = [...new Set(rawPhotos)];
  if(photos.length) return photos.map(src => ({ type:'image', src, alt:p.name }));
  const fallbackColors = ['var(--queen-blue-light)', 'var(--taupe-xlight)', 'rgba(72,209,204,0.18)'];
  return fallbackColors.map((color, index) => ({ type:'fallback', color, icon:p.emoji || '3D', alt:p.name, index }));
}
function productGalleryVisual(item, size='5rem') {
  if(item.type === 'image') return `<img src="${esc(item.src)}" alt="${esc(item.alt)}">`;
  return `<span style="font-size:${size};font-family:'DM Sans',sans-serif;font-weight:400;color:var(--queen-blue)">${esc(item.icon)}</span>`;
}
function selectProductPhoto(index) {
  const modal = document.getElementById('modal-product');
  const gallery = JSON.parse(modal.dataset.gallery || '[]');
  const item = gallery[index] || gallery[0];
  if(!item) return;
  const img = document.getElementById('modal-product-img');
  img.innerHTML = productGalleryVisual(item, item.type === 'image' ? '1rem' : '5rem');
  img.style.background = item.type === 'fallback' ? item.color : 'var(--smoke)';
  document.querySelectorAll('#modal-product-thumbs .product-thumb').forEach((thumb, thumbIndex) => {
    thumb.classList.toggle('active', thumbIndex === index);
  });
}
function renderProductCard(p) {
  return `<div class="product-card" onclick="openProductModal(${p.id})">
    <div class="product-img">
      ${p.isNew ? '<span class="product-badge-new">NEW</span>' : p.isTop ? '<span class="product-badge-hot">HOT</span>' : ''}
      ${productVisual(p)}
    </div>
    <div class="product-info">
      <div class="product-category">${esc(p.cat)}</div>
      <div class="product-name">${esc(p.name)}</div>
      <div class="product-desc">${esc(p.desc).substring(0,80)}...</div>
      <div class="product-footer">
        <div class="product-price">$${Number(p.price).toFixed(2)} <span>USD</span></div>
        <button class="btn-add-cart" onclick="event.stopPropagation();addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>
  </div>`;
}
function renderGrids() {
  const newGrid = document.getElementById('new-products-grid');
  const topGrid = document.getElementById('top-products-grid');
  if(newGrid) newGrid.innerHTML = getNewProducts().map(renderProductCard).join('');
  if(topGrid) topGrid.innerHTML = getTopProducts().map(renderProductCard).join('');
  renderShopProducts();
  renderAdminTable();
  renderAdminAccess();
  updateAuthUI();
}
function renderShopProducts() {
  const grid = document.getElementById('shop-products-grid');
  if(!grid) return;
  const query = (document.getElementById('shop-search')?.value || '').trim().toLowerCase();
  const cat = document.getElementById('shop-category')?.value || '';
  const filtered = visibleProducts().filter(p => {
    const matchesText = !query || [p.name,p.cat,p.desc].join(' ').toLowerCase().includes(query);
    const matchesCat = !cat || p.cat === cat;
    return matchesText && matchesCat;
  });
  grid.innerHTML = filtered.length ? filtered.map(renderProductCard).join('') : '<p style="color:var(--text-muted)">No products found.</p>';
}
function searchFromHome(value) {
  const homeInput = document.getElementById('home-product-search');
  const shopInput = document.getElementById('shop-search');
  const shopCategory = document.getElementById('shop-category');
  if(homeInput) homeInput.value = value;
  if(shopInput) shopInput.value = value;
  if(shopCategory) shopCategory.value = '';
  showPage('shop');
}
function openShopCategory(category) {
  const shopInput = document.getElementById('shop-search');
  const shopCategory = document.getElementById('shop-category');
  if(shopInput) shopInput.value = '';
  if(shopCategory) shopCategory.value = category;
  showPage('shop');
}
function submitHomeSearch(event) {
  event.preventDefault();
  searchFromHome(document.getElementById('home-product-search')?.value.trim() || '');
}
const infoPages = {
  contact: {
    badge: 'Contact',
    title: 'Contact DotProject',
    subtitle: 'Reach us for product questions, custom orders, and order help.',
    html: `<div class="info-panel"><h3>Contact Details</h3><p>Phone: <a href="tel:0175047924">0175047924</a></p><p>Facebook: <a href="https://facebook.com/DotProjectBD" target="_blank" rel="noopener noreferrer">DotProject Facebook Page</a></p><p>Location: Dhaka, Bangladesh</p></div><div class="info-panel"><h3>Support</h3><p>WhatsApp support: <a href="https://wa.me/880175047924" target="_blank" rel="noopener noreferrer">0175047924</a></p><p>Facebook support: <a href="https://facebook.com/DotProjectBD" target="_blank" rel="noopener noreferrer">Message us on Facebook</a></p><p>Response time: Usually within 24 hours.</p></div>`
  },
  faq: {
    badge: 'FAQ',
    title: 'Frequently Asked Questions',
    subtitle: 'Basic answers for demo customers.',
    html: `<div class="info-panel"><h3>How long does printing take?</h3><p>Most demo orders are prepared within 2 to 5 business days depending on size and complexity.</p></div><div class="info-panel"><h3>Can I request a custom design?</h3><p>Yes. Use Custom Order from the shop footer and describe the product, size, color, and quantity.</p></div><div class="info-panel"><h3>Do you deliver outside Dhaka?</h3><p>Yes, this demo policy supports nationwide delivery across Bangladesh.</p></div>`
  },
  shipping: {
    badge: 'Support',
    title: 'Shipping Policy',
    subtitle: 'Demo shipping rules for customer testing.',
    html: `<div class="info-panel"><h3>Delivery Time</h3><p>Dhaka demo delivery: 2 to 4 business days. Outside Dhaka: 3 to 7 business days.</p></div><div class="info-panel"><h3>Delivery Charge</h3><p>The current demo checkout shows free shipping. Final delivery fees can be added later.</p></div>`
  },
  returns: {
    badge: 'Support',
    title: 'Returns',
    subtitle: 'Demo return rules for printed products.',
    html: `<div class="info-panel"><h3>Return Window</h3><p>Demo returns are accepted within 3 days if the product arrives damaged or incorrect.</p></div><div class="info-panel"><h3>Custom Products</h3><p>Custom printed items are not returnable unless they are damaged or different from the confirmed design.</p></div>`
  },
  track: {
    badge: 'Support',
    title: 'Track Order',
    subtitle: 'Demo tracking details for testing.',
    html: `<div class="info-panel"><h3>Track by WhatsApp</h3><p>Send your order number to 0175047924 on WhatsApp for a demo tracking update.</p></div><div class="info-panel"><h3>Example Status</h3><ul><li>Order received</li><li>Printing</li><li>Quality check</li><li>Out for delivery</li></ul></div>`
  },
  blog: {
    badge: 'Company',
    title: 'Blog',
    subtitle: 'Demo posts from the DotProject workshop.',
    html: `<div class="info-panel"><h3>How 3D Printing Helps Custom Product Ideas</h3><p>A short demo article about turning sketches into useful printed products.</p></div><div class="info-panel"><h3>Choosing PLA, PETG, and Colors</h3><p>A demo guide for customers choosing material and finish.</p></div>`
  },
  careers: {
    badge: 'Company',
    title: 'Careers',
    subtitle: 'Demo hiring information.',
    html: `<div class="info-panel"><h3>Open Roles</h3><p>No active roles right now. Demo roles may include 3D designer, print operator, and customer support.</p></div><div class="info-panel"><h3>Apply</h3><p>Send your portfolio or CV through the contact number: 0175047924.</p></div>`
  }
};
function openInfoPage(key) {
  const info = infoPages[key] || infoPages.contact;
  document.getElementById('info-badge').textContent = info.badge;
  document.getElementById('info-title').textContent = info.title;
  document.getElementById('info-subtitle').textContent = info.subtitle;
  document.getElementById('info-content').innerHTML = info.html;
  showPage('info');
}
function renderAdminTable() {
  const tb = document.getElementById('admin-product-table');
  if(document.getElementById('admin-product-count')) document.getElementById('admin-product-count').textContent = products.length;
  if(!tb) return;
  tb.innerHTML = products.map(p=>`<tr>
    <td><span class="admin-thumb">${productVisual(p,'1rem')}</span><strong>${esc(p.name)}</strong></td>
    <td>${esc(p.cat)}</td>
    <td>$${Number(p.price).toFixed(2)}</td>
    <td>${Number(p.stock || 0)}</td>
    <td><span class="status-badge ${p.status === 'Active' ? 'status-active' : 'status-low'}">${esc(p.status || 'Active')}</span></td>
    <td><button class="btn-outline-dark" style="padding:5px 12px;font-size:0.75rem" onclick="openEditProduct(${p.id})">Edit</button></td>
  </tr>`).join('');
}
function showPage(id) {
  if(id === 'admin' && (!currentUser || !isAdminEmail(currentUser.email))) {
    openModal('modal-signin');
    showToast('Admin access needs an approved Gmail sign in.');
    return;
  }
  if(id === 'checkout' && !hasCartItems()) {
    showToast('Please add a product to your cart before checkout.');
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if(drawer) drawer.classList.add('open');
    if(overlay) overlay.classList.add('open');
    return;
  }
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const page = document.getElementById('page-'+id);
  if(page) page.classList.add('active');
  window.scrollTo(0,0);
  if(id==='checkout') {
    renderCheckoutSummary();
    syncMerchantPaymentNumbers();
    showCheckoutStage('details');
  }
  if(id==='shop') renderShopProducts();
  if(id==='admin') {
    renderAdminTable();
    renderAdminAccess();
    document.getElementById('admin-current-user').textContent = currentUser.email;
  }
  closeAllModals();
}
function scrollToShop() { showPage('shop'); }
function openProductModal(id) {
  const p = products.find(x=>x.id===id);
  if(!p) return;
  const gallery = getProductGallery(p);
  document.getElementById('modal-product').dataset.gallery = JSON.stringify(gallery);
  document.getElementById('modal-product-thumbs').innerHTML = gallery.map((item, index) => `
    <button class="product-thumb ${index === 0 ? 'active' : ''}" type="button" onclick="selectProductPhoto(${index})" aria-label="Show product photo ${index + 1}">
      ${productGalleryVisual(item, item.type === 'image' ? '1rem' : '1.65rem')}
    </button>
  `).join('');
  selectProductPhoto(0);
  document.getElementById('modal-product-cat').textContent = p.cat;
  document.getElementById('modal-product-name').textContent = p.name;
  document.getElementById('modal-product-price').textContent = '$'+Number(p.price).toFixed(2)+' USD';
  document.getElementById('modal-product-desc').textContent = getShortDescription(p);
  document.getElementById('modal-product-stock').textContent = Number(p.stock || 0)+' items in stock';
  document.getElementById('modal-product').dataset.productId = id;
  document.getElementById('modal-qty').value = 1;
  openModal('modal-product');
}
function updateCartUI() {
  const total = cart.reduce((s,c)=>s+c.qty, 0);
  document.getElementById('cart-count').textContent = total;
  const totalPrice = cart.reduce((s,c)=>s+(c.price*c.qty), 0);
  document.getElementById('cart-total-price').textContent = '$'+totalPrice.toFixed(2);
  const body = document.getElementById('cart-body');
  if(cart.length === 0) {
    body.innerHTML = '<div class="cart-empty"><div class="empty-icon">Cart</div><p>Your cart is empty</p></div>';
  } else {
    body.innerHTML = cart.map(c=>`<div class="cart-item">
      <div class="cart-item-img">${productVisual(c,'1rem')}</div>
      <div class="cart-item-info">
        <h5>${esc(c.name)}</h5>
        <p>Qty: ${c.qty}</p>
        <div class="cart-item-price">$${(c.price*c.qty).toFixed(2)}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${c.id})">X</button>
    </div>`).join('');
  }
}
function renderCheckoutSummary() {
  const container = document.getElementById('checkout-summary-items');
  const subtotal = cart.reduce((s,c)=>s+(c.price*c.qty), 0);
  if(cart.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.875rem">No items in cart</p>';
  } else {
    container.innerHTML = cart.map(c=>`<div class="summary-item">
      <span class="name">${esc(c.name)} x${c.qty}</span>
      <span class="price">$${(c.price*c.qty).toFixed(2)}</span>
    </div>`).join('');
  }
  document.getElementById('summary-subtotal').textContent = '$'+subtotal.toFixed(2);
  document.getElementById('summary-total-price').textContent = '$'+subtotal.toFixed(2);
}
function nameFromEmail(email) {
  return String(email || '').split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()) || 'Customer';
}
function ensureCustomerProfile(user) {
  if(!user) return null;
  const email = normalizeEmail(user.email);
  const savedProfiles = JSON.parse(localStorage.getItem('dotCustomerProfiles') || '{}');
  const saved = savedProfiles[email] || {};
  return {
    email,
    firstName: user.firstName || saved.firstName || nameFromEmail(email).split(' ')[0] || '',
    lastName: user.lastName || saved.lastName || nameFromEmail(email).split(' ').slice(1).join(' '),
    phone: user.phone || saved.phone || '',
    birthdate: user.birthdate || saved.birthdate || '',
    gender: user.gender || saved.gender || '',
    photo: user.photo || saved.photo || '',
    shippingAddress: user.shippingAddress || saved.shippingAddress || '',
    orders: Array.isArray(user.orders) ? user.orders : (Array.isArray(saved.orders) ? saved.orders : [])
  };
}
function getCustomerName(user=currentUser) {
  if(!user) return 'Customer';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || nameFromEmail(user.email);
}
function avatarMarkup(user=currentUser, size='nav') {
  const name = getCustomerName(user);
  if(user && user.photo) return `<img src="${esc(user.photo)}" alt="${esc(name)}">`;
  return esc(name.charAt(0).toUpperCase() || 'C');
}
function persistCustomerProfile() {
  if(!currentUser || !currentUser.email) return;
  const savedProfiles = JSON.parse(localStorage.getItem('dotCustomerProfiles') || '{}');
  savedProfiles[normalizeEmail(currentUser.email)] = currentUser;
  localStorage.setItem('dotCustomerProfiles', JSON.stringify(savedProfiles));
  saveCurrentUser();
}
function updateAuthUI() {
  const btn = document.querySelector('.btn-nav-signin');
  const chip = document.getElementById('account-chip');
  if(!btn || !chip) return;
  if(currentUser) currentUser = ensureCustomerProfile(currentUser);
  if(currentUser) {
    btn.style.display = 'none';
    chip.style.display = 'inline-flex';
    document.getElementById('nav-account-photo').innerHTML = avatarMarkup(currentUser);
    document.getElementById('nav-account-name').textContent = getCustomerName(currentUser);
    persistCustomerProfile();
  } else {
    btn.style.display = 'inline-flex';
    btn.textContent = 'Sign In';
    btn.onclick = () => openModal('modal-signin');
    chip.style.display = 'none';
  }
}
function openAccountModal() {
  if(!currentUser) { openModal('modal-signin'); return; }
  document.getElementById('account-subtitle').textContent = getCustomerName()+' - '+currentUser.email;
  openModal('modal-account');
  showAccountTab('profile');
}
function normalizedCustomerOrders() {
  const orderList = Array.isArray(currentUser?.orders) ? currentUser.orders : [];
  return orderList.map((order, index) => {
    if(typeof order === 'string') {
      return { id: 'Order '+(index + 1), items: order, total: '', status: 'To Review' };
    }
    return {
      id: order.id || order.number || 'Order '+(index + 1),
      items: order.items || order.summary || 'DotProject product',
      total: order.total || '',
      status: order.status || 'To Pay'
    };
  });
}
function renderMyOrders() {
  const statuses = ['To Pay', 'To Ship', 'Shipped', 'To Review', 'Return'];
  const orders = normalizedCustomerOrders();
  const statusCards = statuses.map(status => {
    const count = orders.filter(order => order.status === status).length;
    return `<div class="order-status-card"><strong>${count}</strong><span>${status}</span></div>`;
  }).join('');
  const rows = orders.map(order => `
    <div class="order-list-row">
      <div>
        <strong>${esc(order.id)}</strong>
        <small>${esc(order.items)}${order.total ? ' - '+esc(order.total) : ''}</small>
      </div>
      <span class="status-badge status-active">${esc(order.status)}</span>
    </div>
  `).join('');
  return `
    <h3 style="margin-bottom:1rem">My Order</h3>
    <div class="order-status-grid">${statusCards}</div>
    <div class="order-list">${rows || '<div class="account-empty">No orders yet. Your order updates will appear here.</div>'}</div>
  `;
}
function showAccountTab(tab, clickedButton) {
  document.querySelectorAll('.account-menu button').forEach(btn => btn.classList.toggle('active', btn.dataset.accountTab === tab));
  if(clickedButton) clickedButton.classList.add('active');
  const panel = document.getElementById('account-panel');
  if(tab === 'profile') {
    panel.innerHTML = `
      <div class="profile-photo-row">
        <div class="profile-photo" id="profile-photo-preview">${avatarMarkup(currentUser,'profile')}</div>
        <div>
          <input type="hidden" id="profile-photo-value" value="${esc(currentUser.photo || '')}">
          <input type="file" id="profile-photo-file" accept="image/*" style="display:none" onchange="readCustomerPhoto(this)">
          <button class="btn-outline-dark" type="button" onclick="document.getElementById('profile-photo-file').click()">Change Image</button>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>First name</label><input type="text" id="profile-first-name" value="${esc(currentUser.firstName || '')}"></div>
        <div class="form-group"><label>Last name</label><input type="text" id="profile-last-name" value="${esc(currentUser.lastName || '')}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Phone number</label><input type="tel" id="profile-phone" value="${esc(currentUser.phone || '')}" placeholder="+880 1XXXXXXXXX"></div>
        <div class="form-group"><label>Gmail</label><input type="email" id="profile-email" value="${esc(currentUser.email || '')}" disabled></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Birthdate</label><input type="date" id="profile-birthdate" value="${esc(currentUser.birthdate || '')}"></div>
        <div class="form-group"><label>Gender</label><select id="profile-gender"><option value="">Select</option><option value="Male" ${currentUser.gender === 'Male' ? 'selected' : ''}>Male</option><option value="Female" ${currentUser.gender === 'Female' ? 'selected' : ''}>Female</option></select></div>
      </div>
      <button class="btn-primary" type="button" onclick="saveCustomerProfile()">Save Profile</button>
    `;
  }
  if(tab === 'orders') {
    panel.innerHTML = renderMyOrders();
  }
  if(tab === 'shipping') {
    panel.innerHTML = `<h3 style="margin-bottom:1rem">Shipping Address</h3><div class="form-group"><label>Address</label><textarea id="profile-shipping-address" rows="5" placeholder="House, road, area, city">${esc(currentUser.shippingAddress || '')}</textarea></div><button class="btn-primary" type="button" onclick="saveShippingAddress()">Save Address</button>`;
  }
  if(tab === 'cart') {
    panel.innerHTML = `<h3 style="margin-bottom:1rem">Product Cart</h3><div class="account-empty">${cart.length ? cart.map(c => `${esc(c.name)} x${c.qty} - $${(c.price*c.qty).toFixed(2)}`).join('<br>') : 'Your product cart is empty.'}</div><button class="btn-outline-dark" style="margin-top:1rem" type="button" onclick="closeModal('modal-account');toggleCart()">Open Cart</button>`;
  }
}
function readCustomerPhoto(input) {
  const file = input.files && input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('profile-photo-value').value = reader.result;
    document.getElementById('profile-photo-preview').innerHTML = `<img src="${reader.result}" alt="${esc(getCustomerName())}">`;
  };
  reader.readAsDataURL(file);
}
function saveCustomerProfile() {
  currentUser.firstName = document.getElementById('profile-first-name').value.trim();
  currentUser.lastName = document.getElementById('profile-last-name').value.trim();
  currentUser.phone = document.getElementById('profile-phone').value.trim();
  currentUser.birthdate = document.getElementById('profile-birthdate').value;
  currentUser.gender = document.getElementById('profile-gender').value;
  currentUser.photo = document.getElementById('profile-photo-value').value;
  persistCustomerProfile();
  updateAuthUI();
  document.getElementById('account-subtitle').textContent = getCustomerName()+' - '+currentUser.email;
  showToast('Profile updated.');
}
function saveShippingAddress() {
  currentUser.shippingAddress = document.getElementById('profile-shipping-address').value.trim();
  persistCustomerProfile();
  showToast('Shipping address saved.');
}
function handleLogout() {
  currentUser = null;
  localStorage.removeItem('dotCurrentUser');
  closeModal('modal-account');
  updateAuthUI();
  if(document.getElementById('page-admin')?.classList.contains('active')) {
    showPage('home');
  }
  showToast('You have been logged out.');
}
function handleSignin() {
  const email = normalizeEmail(document.getElementById('signin-email').value);
  if(!email) { showToast('Please enter your email.'); return; }
  currentUser = ensureCustomerProfile({ email });
  persistCustomerProfile();
  closeModal('modal-signin');
  updateAuthUI();
  if(isAdminEmail(email)) {
    showToast('Admin access approved.');
    showPage('admin');
  } else {
    showToast('Welcome back!');
    openAccountModal();
  }
}
function handleSignup() {
  const email = normalizeEmail(document.getElementById('signup-email').value);
  const password = document.getElementById('signup-password').value;
  if(!email || password.length < 6) { showToast('Enter email and a 6+ character password.'); return; }
  currentUser = ensureCustomerProfile({
    email,
    firstName: document.getElementById('signup-first-name').value.trim(),
    lastName: document.getElementById('signup-last-name').value.trim()
  });
  persistCustomerProfile();
  closeModal('modal-signup');
  updateAuthUI();
  showToast('Account created! Welcome to DotProject.');
  openAccountModal();
}
function openResetPassword() {
  closeModal('modal-signin');
  document.getElementById('reset-step-email').classList.add('active');
  document.getElementById('reset-step-code').classList.remove('active');
  document.getElementById('reset-email').value = '';
  document.getElementById('reset-code-input').value = '';
  document.getElementById('reset-new-password').value = '';
  openModal('modal-reset');
}
function sendResetCode() {
  const email = normalizeEmail(document.getElementById('reset-email').value);
  if(!isGmail(email)) { showToast('Please enter a valid Gmail address.'); return; }
  resetEmail = email;
  resetCode = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById('reset-demo-code').textContent = resetCode;
  document.getElementById('reset-step-email').classList.remove('active');
  document.getElementById('reset-step-code').classList.add('active');
  showToast('Reset code sent to '+email+'.');
}
function confirmResetCode() {
  const code = document.getElementById('reset-code-input').value.trim();
  const password = document.getElementById('reset-new-password').value;
  if(code !== resetCode) { showToast('Reset code is not correct.'); return; }
  if(password.length < 6) { showToast('New password must be at least 6 characters.'); return; }
  closeModal('modal-reset');
  showToast('Password updated for '+resetEmail+'.');
}
function renderAdminAccess() {
  const panel = document.getElementById('super-admin-panel');
  const list = document.getElementById('admin-access-list');
  if(panel) panel.style.display = isSuperAdmin() ? 'block' : 'none';
  if(!list) return;
  list.innerHTML = adminEmails.map(email => `<span class="admin-email-chip">${esc(email)}${normalizeEmail(email) === SUPER_ADMIN_EMAIL ? '' : `<button onclick="removeAdminAccess('${esc(email)}')">X</button>`}</span>`).join('');
}
function grantAdminAccess() {
  if(!isSuperAdmin()) { showToast('Only super admin can grant admin access.'); return; }
  const email = normalizeEmail(document.getElementById('grant-admin-email').value);
  if(!isGmail(email)) { showToast('Please enter a Gmail address.'); return; }
  if(!isAdminEmail(email)) adminEmails.push(email);
  saveAdmins();
  document.getElementById('grant-admin-email').value = '';
  renderAdminAccess();
  showToast('Admin access granted to '+email+'.');
}
function removeAdminAccess(email) {
  if(!isSuperAdmin()) return;
  adminEmails = adminEmails.filter(e => normalizeEmail(e) !== normalizeEmail(email) || normalizeEmail(e) === SUPER_ADMIN_EMAIL);
  saveAdmins();
  renderAdminAccess();
  showToast('Admin access removed.');
}
function readProductPhoto(input, targetId) {
  const file = input.files && input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById(targetId).value = reader.result;
    showToast('Product photo loaded.');
  };
  reader.readAsDataURL(file);
}
function openEditProduct(id) {
  const p = products.find(x=>x.id===id);
  if(!p) return;
  document.getElementById('edit-product-id').value = p.id;
  document.getElementById('edit-name').value = p.name;
  document.getElementById('edit-price').value = p.price;
  document.getElementById('edit-cat').value = p.cat;
  document.getElementById('edit-stock').value = p.stock || 0;
  document.getElementById('edit-desc').value = p.desc;
  document.getElementById('edit-photo').value = p.photo || '';
  document.getElementById('edit-is-new').checked = !!p.isNew;
  document.getElementById('edit-is-top').checked = !!p.isTop;
  document.getElementById('edit-status').value = p.status || 'Active';
  openModal('modal-edit-product');
}
function saveProductEdit() {
  const id = parseInt(document.getElementById('edit-product-id').value);
  const p = products.find(x=>x.id===id);
  if(!p) return;
  p.name = document.getElementById('edit-name').value.trim();
  p.price = parseFloat(document.getElementById('edit-price').value) || 0;
  p.cat = document.getElementById('edit-cat').value;
  p.stock = parseInt(document.getElementById('edit-stock').value) || 0;
  p.desc = document.getElementById('edit-desc').value.trim();
  p.photo = document.getElementById('edit-photo').value.trim();
  p.isNew = document.getElementById('edit-is-new').checked;
  p.isTop = document.getElementById('edit-is-top').checked;
  p.status = document.getElementById('edit-status').value;
  if(!p.name || !p.desc || !p.price) { showToast('Please fill title, description, and price.'); return; }
  saveProducts();
  closeModal('modal-edit-product');
  renderGrids();
  showToast('Product updated.');
}
function adminAddProduct() {
  const name = document.getElementById('ap-name').value.trim();
  const desc = document.getElementById('ap-desc').value.trim();
  const price = parseFloat(document.getElementById('ap-price').value) || 0;
  const cat = document.getElementById('ap-cat').value;
  const emoji = document.getElementById('preview-emoji').textContent || '3D';
  const stock = parseInt(document.getElementById('ap-stock').value) || 24;
  const photo = document.getElementById('ap-photo-urls').value.trim() || document.getElementById('ap-photo').value;
  const status = document.getElementById('ap-status').value;
  if(!name || !desc || !price) { showToast('Please fill all required fields.'); return; }
  products.push({ id: Date.now(), name, cat, price, emoji, photo, desc, stock, status, isNew:true, isTop:false });
  saveProducts();
  renderGrids();
  showToast('Product "'+name+'" published!');
  ['ap-name','ap-desc','ap-price','ap-stock','ap-photo','ap-photo-urls'].forEach(id => document.getElementById(id).value='');
}

// ================== TOAST ==================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 3000);
}

// ================== INIT ==================
hydrateProducts();
renderGrids();
