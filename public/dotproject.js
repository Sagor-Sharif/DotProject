// ================== DATA ==================
function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    localStorage.removeItem(key);
    return fallback;
  }
}
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
const SUPER_ADMIN_EMAIL = 'sagorsharif27@gmail.com';
const BKASH_PERSONAL_NUMBER = '0175047924';
const NAGAD_PERSONAL_NUMBER = '0175047924';
let currentUser = readStorage('dotCurrentUser', null);
let adminEmails = readStorage('dotAdminEmails', null) || [SUPER_ADMIN_EMAIL];
const ALL_ADMIN_PERMISSIONS = ['dashboard','addProduct','products','editProduct','stock','orders','orderStatus'];
let adminPermissions = readStorage('dotAdminPermissions', null) || {};
let adminOrders = readStorage('dotAdminOrders', null) || [
  { id:'DP-0064', customer:'Rafiq Ahmed', items:'Auto Cat Feeder x1', total:49, date:'Jun 08', status:'In Process' },
  { id:'DP-0063', customer:'Nusrat Jahan', items:'Custom Keyring x3', total:24, date:'Jun 07', status:'Shipped' },
  { id:'DP-0062', customer:'Tanvir Islam', items:'Fish Auto Feeder x1', total:35, date:'Jun 06', status:'Pending' },
  { id:'DP-0061', customer:'Sadia Hossain', items:'Mini Shelf x2', total:18, date:'Jun 05', status:'Delivered' }
];
let invoices = readStorage('dotInvoices', null) || {};
let lastInvoiceId = localStorage.getItem('dotLastInvoiceId') || '';
let resetCode = '';
let resetEmail = '';

function getNewProducts(){ return products.filter(p=>p.isNew); }
function getTopProducts(){ return products.filter(p=>p.isTop); }

function renderProductCard(p) {
  const stock = Number(p.stock ?? 24);
  const isAvailable = stock > 0 && p.status !== 'Out of Stock';
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
        <button class="btn-add-cart" ${isAvailable ? '' : 'disabled'} onclick="event.stopPropagation();addToCart(${p.id})">${isAvailable ? 'Add to Cart' : 'Out of Stock'}</button>
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
function openModal(id){ document.getElementById(id)?.classList.add('open'); }
function closeModal(id){ document.getElementById(id)?.classList.remove('open'); }
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
  const stock = Number(p.stock ?? 24);
  if(stock <= 0 || p.status === 'Out of Stock') { showToast('This product is out of stock.'); return; }
  const existing = cart.find(c=>c.id===id);
  if(existing) {
    if(existing.qty >= stock) { showToast('Only '+stock+' item(s) available in stock.'); return; }
    existing.qty++;
  } else cart.push({...p, qty:1});
  updateCartUI();
  showToast('🛒 '+p.name+' added to cart!');
}

function addToCartFromModal() {
  const id = parseInt(document.getElementById('modal-product').dataset.productId);
  const qty = parseInt(document.getElementById('modal-qty').value);
  const p = products.find(x=>x.id===id);
  if(!p) return;
  const stock = Number(p.stock ?? 24);
  if(stock <= 0 || p.status === 'Out of Stock') { showToast('This product is out of stock.'); return; }
  if(qty > stock) { showToast('Only '+stock+' item(s) available in stock.'); return; }
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

function getCheckoutDetails() {
  return {
    name: document.getElementById('checkout-name')?.value.trim() || getCustomerName(),
    email: normalizeEmail(document.getElementById('checkout-email')?.value || currentUser?.email || ''),
    phone: document.getElementById('checkout-phone')?.value.trim() || currentUser?.phone || '',
    address: document.getElementById('checkout-address')?.value.trim() || currentUser?.shippingAddress || '',
    city: document.getElementById('checkout-city')?.value.trim() || '',
    district: document.getElementById('checkout-district')?.value.trim() || ''
  };
}
function fillCheckoutDetails() {
  const fields = {
    'checkout-name': getCustomerName(),
    'checkout-email': currentUser?.email || '',
    'checkout-phone': currentUser?.phone || '',
    'checkout-address': currentUser?.shippingAddress || ''
  };
  Object.entries(fields).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if(field && !field.value && value) field.value = value;
  });
}
function validateCheckoutDetails() {
  const details = getCheckoutDetails();
  const checks = [
    ['checkout-name', details.name, 'Please enter your full name.'],
    ['checkout-email', details.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email), 'Please enter a valid email.'],
    ['checkout-phone', details.phone, 'Please enter your phone number.'],
    ['checkout-address', details.address, 'Please enter your shipping address.'],
    ['checkout-city', details.city, 'Please enter your city.'],
    ['checkout-district', details.district, 'Please enter your district.']
  ];
  const failed = checks.find(([, valid]) => !valid);
  if(failed) {
    showToast(failed[2]);
    document.getElementById(failed[0])?.focus();
    return false;
  }
  return true;
}
function continueToPayment() {
  if(!validateCheckoutDetails()) return;
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
  if(method === 'card') {
    const cardNumber = document.getElementById('card-number')?.value.replace(/\s+/g, '') || '';
    const cardName = document.getElementById('card-name')?.value.trim();
    const expiry = document.getElementById('card-expiry')?.value.trim();
    const cvv = document.getElementById('card-cvv')?.value.trim();
    if(!/^\d{12,19}$/.test(cardNumber)) {
      showToast('Please enter a valid card number.');
      document.getElementById('card-number')?.focus();
      return false;
    }
    if(!cardName) {
      showToast('Please enter the name on card.');
      document.getElementById('card-name')?.focus();
      return false;
    }
    if(!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      showToast('Please enter expiry as MM/YY.');
      document.getElementById('card-expiry')?.focus();
      return false;
    }
    if(!/^\d{3,4}$/.test(cvv)) {
      showToast('Please enter a valid CVV.');
      document.getElementById('card-cvv')?.focus();
      return false;
    }
  }
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
function createInvoiceRecord(order, shouldRemember = true) {
  const invoiceId = order.invoiceId || ('INV-' + order.id.replace(/^DP-/, ''));
  const invoice = {
    id: invoiceId,
    orderId: order.id,
    customer: order.customer || 'Customer',
    email: order.email || '',
    phone: order.phone || '',
    date: order.date || new Date().toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' }),
    items: order.items || '',
    total: Number(order.total || 0),
    status: order.status || 'Pending',
    source: order.source || 'Online',
    address: order.address || '',
    payment: order.payment || ''
  };
  invoices[invoiceId] = invoice;
  saveInvoices();
  if(shouldRemember) rememberLastInvoice(invoiceId);
  return invoice;
}
function pdfSafe(value) {
  return String(value ?? '').replace(/[^\x20-\x7E]/g, ' ').replace(/[\\()]/g, '\\$&');
}
function wrapPdfText(value, maxLength=74) {
  const words = String(value || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach(word => {
    const next = line ? line + ' ' + word : word;
    if(next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if(line) lines.push(line);
  return lines.length ? lines : [''];
}
function invoicePdfBlob(invoice) {
  const lines = [
    { text:'DotProject', size:20, x:50, y:780 },
    { text:'Invoice', size:26, x:50, y:748 },
    { text:invoice.id, size:12, x:410, y:780 },
    { text:'Order #'+invoice.orderId, size:11, x:410, y:760 },
    { text:invoice.date, size:11, x:410, y:744 },
    { text:'Bill To', size:14, x:50, y:700 },
    { text:invoice.customer || 'Customer', size:11, x:50, y:680 },
    { text:invoice.phone ? 'Phone: '+invoice.phone : '', size:11, x:50, y:664 },
    { text:invoice.email ? 'Email: '+invoice.email : '', size:11, x:50, y:648 },
    { text:invoice.address ? 'Address: '+invoice.address : '', size:11, x:50, y:632 },
    { text:'Status: '+(invoice.status || 'Pending'), size:11, x:50, y:596 },
    { text:'Source: '+(invoice.source || 'Online'), size:11, x:50, y:580 },
    { text:invoice.payment ? 'Payment: '+invoice.payment : '', size:11, x:50, y:564 },
    { text:'Products', size:14, x:50, y:552 }
  ].filter(line => line.text);
  let y = 528;
  wrapPdfText(invoice.items, 80).forEach(itemLine => {
    lines.push({ text:itemLine, size:11, x:50, y });
    y -= 16;
  });
  lines.push({ text:'Grand Total: $'+Number(invoice.total || 0).toFixed(2), size:16, x:350, y:y-24 });
  lines.push({ text:'Thank you for ordering from DotProject.', size:11, x:50, y:y-70 });
  const textStream = lines.map(line => `BT /F1 ${line.size} Tf ${line.x} ${line.y} Td (${pdfSafe(line.text)}) Tj ET`).join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${textStream.length} >>\nstream\n${textStream}\nendstream`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => {
    pdf += String(offset).padStart(10, '0') + ' 00000 n \n';
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}
function downloadInvoice(invoiceId) {
  const invoice = invoices[invoiceId] || invoices[lastInvoiceId];
  if(!invoice) { showToast('No invoice found.'); return; }
  const blob = invoicePdfBlob(invoice);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = invoice.id + '.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
  if(!validateCheckoutDetails()) {
    showCheckoutStage('details');
    return;
  }
  if(!validatePaymentDetails()) return;
  updateCheckoutSteps('confirm');
  const num = 'DP-' + String(Math.floor(Math.random()*9000)+1000);
  document.getElementById('success-order-num').textContent = 'Order #'+num;
  const orderTotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0);
  const paymentMethod = getSelectedPaymentMethod();
  const orderItems = cart.map(item => item.name+' x'+item.qty).join(', ');
  const orderDate = new Date().toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' });
  const details = getCheckoutDetails();
  const orderRecord = {
    id: num,
    customer: details.name,
    email: details.email,
    phone: details.phone,
    address: [details.address, details.city, details.district].filter(Boolean).join(', '),
    items: orderItems,
    total: orderTotal,
    date: orderDate,
    status: 'Pending',
    source: 'Online',
    payment: paymentMethod
  };
  const invoice = createInvoiceRecord(orderRecord);
  orderRecord.invoiceId = invoice.id;
  adminOrders.unshift({...orderRecord, date: new Date().toLocaleDateString('en-US', { month:'short', day:'2-digit' })});
  saveAdminOrders();
  cart.forEach(item => {
    const product = products.find(product => product.id === item.id);
    if(product) {
      product.stock = Math.max(0, Number(product.stock || 0) - Number(item.qty || 0));
      if(product.stock <= 0) product.status = 'Out of Stock';
    }
  });
  saveProducts();
  if(currentUser) {
    currentUser.firstName = currentUser.firstName || details.name.split(' ')[0] || '';
    currentUser.lastName = currentUser.lastName || details.name.split(' ').slice(1).join(' ');
    currentUser.phone = currentUser.phone || details.phone;
    currentUser.shippingAddress = details.address;
    currentUser.orders = Array.isArray(currentUser.orders) ? currentUser.orders : [];
    currentUser.orders.unshift({
      id: num,
      items: orderItems,
      total: '$'+orderTotal.toFixed(2),
      status: paymentMethod === 'cod' ? 'To Ship' : 'To Pay',
      date: orderDate,
      invoiceId: invoice.id,
      source: 'Online',
      payment: paymentMethod,
      address: orderRecord.address
    });
    persistCustomerProfile();
  }
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
  const permissionMap = { dashboard:'dashboard', 'add-product':'addProduct', products:'products', stock:'stock', orders:'orders' };
  if(!canAdmin(permissionMap[section] || section)) {
    showToast('This admin account does not have access to '+section+'.');
    return;
  }
  document.querySelectorAll('.admin-nav-item').forEach(i=>i.classList.remove('active'));
  if(el) el.classList.add('active');
  ['dashboard','add-product','products','stock','orders'].forEach(s=>{
    const el = document.getElementById('admin-'+s);
    if(el) el.style.display = 'none';
  });
  const target = document.getElementById('admin-'+section);
  if(target) target.style.display = 'block';
  if(section==='products') renderAdminTable();
  if(section==='stock') renderStockTable();
  if(section==='orders') { renderAdminOrders(); setManualInvoiceDate(); }
  if(section==='dashboard') renderAdminDashboard();
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
function migrateAdminAccess(){
  adminEmails = Array.from(new Set([SUPER_ADMIN_EMAIL, ...adminEmails.map(normalizeEmail).filter(Boolean)]));
  adminPermissions[SUPER_ADMIN_EMAIL] = ALL_ADMIN_PERMISSIONS;
  adminEmails.forEach(email => {
    const normalized = normalizeEmail(email);
    if(!adminPermissions[normalized]) adminPermissions[normalized] = normalized === SUPER_ADMIN_EMAIL ? ALL_ADMIN_PERMISSIONS : ['dashboard','products','orders'];
  });
  saveAdmins();
  saveAdminPermissions();
}
function isAdminEmail(email){ return adminEmails.map(normalizeEmail).includes(normalizeEmail(email)); }
function getAdminPermissions(email=currentUser?.email){
  const normalized = normalizeEmail(email);
  if(normalized === SUPER_ADMIN_EMAIL) return ALL_ADMIN_PERMISSIONS;
  return adminPermissions[normalized] || [];
}
function canAdmin(permission){ return isSuperAdmin() || getAdminPermissions().includes(permission); }
function saveProducts(){ localStorage.setItem('dotProducts', JSON.stringify(products)); }
function saveAdmins(){ localStorage.setItem('dotAdminEmails', JSON.stringify(adminEmails)); }
function saveAdminPermissions(){ localStorage.setItem('dotAdminPermissions', JSON.stringify(adminPermissions)); }
function saveAdminOrders(){ localStorage.setItem('dotAdminOrders', JSON.stringify(adminOrders)); }
function saveInvoices(){ localStorage.setItem('dotInvoices', JSON.stringify(invoices)); }
function rememberLastInvoice(id){ lastInvoiceId = id; localStorage.setItem('dotLastInvoiceId', id); }
function saveCurrentUser(){ localStorage.setItem('dotCurrentUser', JSON.stringify(currentUser)); }
function esc(value){ return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function hydrateProducts(){
  migrateAdminAccess();
  migrateOrderInvoices();
  const saved = readStorage('dotProducts', null);
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
function migrateOrderInvoices() {
  let changed = false;
  adminOrders.forEach(order => {
    if(order.invoiceId && invoices[order.invoiceId]) return;
    const invoice = createInvoiceRecord({
      ...order,
      email: order.email || '',
      phone: order.phone || '',
      source: order.source || 'Store',
      date: order.date || new Date().toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' })
    }, false);
    order.invoiceId = invoice.id;
    changed = true;
  });
  if(changed) saveAdminOrders();
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
  let gallery = [];
  try {
    gallery = JSON.parse(modal?.dataset.gallery || '[]');
  } catch (error) {
    gallery = [];
  }
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
  const stock = Number(p.stock ?? 24);
  const isAvailable = stock > 0 && p.status !== 'Out of Stock';
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
        <button class="btn-add-cart" ${isAvailable ? '' : 'disabled'} onclick="event.stopPropagation();addToCart(${p.id})">${isAvailable ? 'Add to Cart' : 'Out of Stock'}</button>
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
  const query = (document.getElementById('admin-product-search')?.value || '').trim().toLowerCase();
  const filtered = products.filter(p => !query || [p.name,p.cat,p.desc,p.status].join(' ').toLowerCase().includes(query));
  tb.innerHTML = filtered.map(p=>`<tr>
    <td><span class="admin-thumb">${productVisual(p,'1rem')}</span><strong>${esc(p.name)}</strong></td>
    <td>${esc(p.cat)}</td>
    <td>$${Number(p.price).toFixed(2)}</td>
    <td>${Number(p.stock || 0)}</td>
    <td><span class="status-badge ${p.status === 'Active' ? 'status-active' : 'status-low'}">${esc(p.status || 'Active')}</span></td>
    <td><button class="btn-outline-dark ${canAdmin('editProduct') ? '' : 'admin-denied'}" style="padding:5px 12px;font-size:0.75rem" onclick="openEditProduct(${p.id})">Edit</button></td>
  </tr>`).join('');
  renderStockTable();
  renderAdminDashboard();
  renderAdminOrders();
  applyAdminPermissions();
}
function statusClass(status) {
  return ['Active','Delivered','Shipped','In Process'].includes(status) ? 'status-active' : 'status-low';
}
function renderStockTable() {
  const tb = document.getElementById('admin-stock-table');
  if(!tb) return;
  const query = (document.getElementById('admin-stock-search')?.value || '').trim().toLowerCase();
  const filtered = products.filter(p => !query || [p.name,p.cat,p.status].join(' ').toLowerCase().includes(query));
  tb.innerHTML = filtered.map(p => {
    const stock = Number(p.stock || 0);
    const stockStatus = stock <= 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock';
    return `<tr>
      <td><span class="admin-thumb">${productVisual(p,'1rem')}</span><strong>${esc(p.name)}</strong></td>
      <td>${esc(p.cat)}</td>
      <td>${stock}</td>
      <td><span class="status-badge ${stock <= 5 ? 'status-low' : 'status-active'}">${stockStatus}</span></td>
      <td><div class="admin-row-actions"><input class="admin-inline-input" type="number" min="0" id="stock-${p.id}" value="${stock}"><button class="btn-outline-dark ${canAdmin('stock') ? '' : 'admin-denied'}" style="padding:6px 10px;font-size:0.75rem" onclick="updateProductStock(${p.id})">Save</button></div></td>
    </tr>`;
  }).join('');
}
function renderAdminOrders() {
  const table = document.getElementById('admin-order-table');
  const recent = document.getElementById('admin-recent-orders');
  setManualInvoiceDate();
  const rows = adminOrders.map(order => `<tr>
    <td><strong>#${esc(order.id)}</strong></td>
    <td>${esc(order.customer)}</td>
    <td>${esc(order.items)}</td>
    <td>$${Number(order.total).toFixed(2)}</td>
    <td>${esc(order.date)}</td>
    <td><span class="status-badge ${statusClass(order.status)}">${esc(order.status)}</span></td>
    <td><div class="order-row-actions"><select class="admin-inline-select ${canAdmin('orderStatus') ? '' : 'admin-denied'}" onchange="updateOrderStatus('${esc(order.id)}', this.value)">
      ${['Pending','In Process','Printing','Shipped','Delivered','Cancelled'].map(status => `<option ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}
    </select><button class="btn-outline-dark" type="button" style="padding:6px 10px;font-size:0.75rem" onclick="downloadInvoice('${esc(order.invoiceId || '')}')">Invoice</button></div></td>
  </tr>`).join('');
  if(table) table.innerHTML = rows;
  if(recent) recent.innerHTML = adminOrders.slice(0,4).map(order => `<tr>
    <td>#${esc(order.id)}</td><td>${esc(order.customer)}</td><td>${esc(order.items)}</td><td>$${Number(order.total).toFixed(2)}</td><td><span class="status-badge ${statusClass(order.status)}">${esc(order.status)}</span></td>
  </tr>`).join('');
}
function setManualInvoiceDate() {
  const dateInput = document.getElementById('manual-invoice-date');
  if(dateInput && !dateInput.value) dateInput.valueAsDate = new Date();
}
function createManualInvoice() {
  if(!canAdmin('orders')) { showToast('This admin account cannot create invoices.'); return; }
  const name = document.getElementById('manual-invoice-name')?.value.trim();
  const phone = document.getElementById('manual-invoice-phone')?.value.trim();
  const email = document.getElementById('manual-invoice-email')?.value.trim();
  const dateValue = document.getElementById('manual-invoice-date')?.value;
  const items = document.getElementById('manual-invoice-items')?.value.trim();
  const total = Number(document.getElementById('manual-invoice-total')?.value || 0);
  const status = document.getElementById('manual-invoice-status')?.value || 'Pending';
  if(!name || !phone || !items || !total) {
    showToast('Please enter customer, phone, products, and total.');
    return;
  }
  const id = 'DP-M' + Date.now().toString().slice(-6);
  const date = dateValue ? new Date(dateValue+'T00:00:00').toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' }) : new Date().toLocaleDateString('en-US', { month:'short', day:'2-digit', year:'numeric' });
  const order = { id, customer:name, email, phone, items, total, date, status, source:'Manual' };
  const invoice = createInvoiceRecord(order);
  order.invoiceId = invoice.id;
  adminOrders.unshift({...order, date: new Date().toLocaleDateString('en-US', { month:'short', day:'2-digit' })});
  saveAdminOrders();
  ['manual-invoice-name','manual-invoice-phone','manual-invoice-email','manual-invoice-items','manual-invoice-total'].forEach(id => {
    const field = document.getElementById(id);
    if(field) field.value = '';
  });
  const dateInput = document.getElementById('manual-invoice-date');
  if(dateInput) dateInput.valueAsDate = new Date();
  renderAdminOrders();
  renderAdminDashboard();
  showToast('Manual invoice created.');
  downloadInvoice(invoice.id);
}
function renderAdminDashboard() {
  const totalRevenue = adminOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const pendingCount = adminOrders.filter(order => order.status === 'Pending').length;
  const revenueEl = document.getElementById('admin-total-revenue');
  const ordersEl = document.getElementById('admin-total-orders');
  const pendingEl = document.getElementById('admin-pending-orders');
  if(revenueEl) revenueEl.textContent = '$'+totalRevenue.toFixed(2);
  if(ordersEl) ordersEl.textContent = adminOrders.length;
  if(pendingEl) pendingEl.textContent = pendingCount;
}
function applyAdminPermissions() {
  document.querySelectorAll('[data-admin-permission]').forEach(item => {
    const allowed = canAdmin(item.dataset.adminPermission);
    item.style.display = allowed ? 'flex' : 'none';
  });
  const addPanel = document.getElementById('admin-add-product');
  if(addPanel) addPanel.classList.toggle('admin-denied', !canAdmin('addProduct'));
}
function openDefaultAdminSection() {
  const sectionMap = [
    ['dashboard','dashboard'],
    ['addProduct','add-product'],
    ['products','products'],
    ['stock','stock'],
    ['orders','orders']
  ];
  const target = sectionMap.find(([permission]) => canAdmin(permission)) || sectionMap[0];
  const navItem = document.querySelector(`[data-admin-permission="${target[0]}"]`);
  switchAdmin(target[1], navItem);
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
    fillCheckoutDetails();
    renderCheckoutSummary();
    syncMerchantPaymentNumbers();
    showCheckoutStage('details');
  }
  if(id==='shop') renderShopProducts();
  if(id==='admin') {
    applyAdminPermissions();
    renderAdminTable();
    renderAdminAccess();
    renderStockTable();
    renderAdminOrders();
    renderAdminDashboard();
    document.getElementById('admin-current-user').textContent = currentUser.email;
    openDefaultAdminSection();
  }
  setTimeout(refreshScrollMotion, 0);
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
  const savedProfiles = readStorage('dotCustomerProfiles', {});
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
  const savedProfiles = readStorage('dotCustomerProfiles', {});
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
      return { id: 'Order '+(index + 1), items: order, total: '', status: 'To Review', date: '', invoiceId: '', source: 'Online', payment: '' };
    }
    return {
      id: order.id || order.number || 'Order '+(index + 1),
      items: order.items || order.summary || 'DotProject product',
      total: order.total || '',
      status: order.status || 'To Pay',
      date: order.date || '',
      invoiceId: order.invoiceId || '',
      source: order.source || 'Online',
      payment: order.payment || ''
    };
  });
}
let activeOrderFilter = 'All';
function showCustomerOrders(status) {
  activeOrderFilter = status || 'All';
  const panel = document.getElementById('account-panel');
  if(panel) panel.innerHTML = renderMyOrders();
}
function toggleOrderDetail(orderId) {
  const detail = document.getElementById('order-detail-'+String(orderId).replace(/[^a-z0-9_-]/gi, '-'));
  if(detail) detail.classList.toggle('hidden');
}
function renderMyOrders() {
  const statuses = ['All', 'To Pay', 'To Ship', 'Shipped'];
  const orders = normalizedCustomerOrders();
  const statusCards = statuses.map(status => {
    const count = status === 'All' ? orders.length : orders.filter(order => order.status === status).length;
    return `<button class="order-status-card ${activeOrderFilter === status ? 'active' : ''}" type="button" onclick="showCustomerOrders('${esc(status)}')"><strong>${count}</strong><span>${status}</span></button>`;
  }).join('');
  const filteredOrders = activeOrderFilter === 'All' ? orders : orders.filter(order => order.status === activeOrderFilter);
  const rows = filteredOrders.map(order => {
    const detailId = 'order-detail-'+String(order.id).replace(/[^a-z0-9_-]/gi, '-');
    return `
    <div class="order-list-row">
      <div>
        <strong>${esc(order.id)}</strong>
        <small>${esc(order.date || 'Order history')} - ${esc(order.items)}${order.total ? ' - '+esc(order.total) : ''}</small>
      </div>
      <div class="order-row-actions">
        <span class="status-badge status-active">${esc(order.status)}</span>
        <button class="btn-outline-dark" type="button" style="padding:6px 10px;font-size:0.75rem" onclick="toggleOrderDetail('${esc(order.id)}')">Details</button>
        <button class="btn-outline-dark" type="button" style="padding:6px 10px;font-size:0.75rem" onclick="downloadInvoice('${esc(order.invoiceId)}')">Invoice</button>
      </div>
      <div class="order-detail-box hidden" id="${esc(detailId)}">
        Products: ${esc(order.items)}<br>
        Total: ${esc(order.total || '$0.00')}<br>
        Status: ${esc(order.status)}<br>
        Source: ${esc(order.source)}${order.payment ? '<br>Payment: '+esc(order.payment) : ''}
      </div>
    </div>
  `}).join('');
  return `
    <h3 style="margin-bottom:1rem">My Order</h3>
    <div class="order-status-grid">${statusCards}</div>
    <h3 style="margin:1.5rem 0 1rem">Order History</h3>
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
  const password = document.getElementById('signin-password')?.value || '';
  if(!email) { showToast('Please enter your email.'); return; }
  if(password.length < 6) { showToast('Please enter your password.'); return; }
  const savedProfiles = readStorage('dotCustomerProfiles', {});
  const savedProfile = savedProfiles[email];
  if(savedProfile?.password && savedProfile.password !== password) {
    showToast('Password does not match this account.');
    return;
  }
  currentUser = ensureCustomerProfile({ email });
  if(!currentUser.password) currentUser.password = password;
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
  const phone = document.getElementById('signup-phone')?.value.trim() || '';
  if(!email || password.length < 8) { showToast('Enter email and an 8+ character password.'); return; }
  if(!phone) { showToast('Please enter your phone number.'); return; }
  if(!document.getElementById('terms')?.checked) { showToast('Please agree to the terms first.'); return; }
  currentUser = ensureCustomerProfile({
    email,
    firstName: document.getElementById('signup-first-name').value.trim(),
    lastName: document.getElementById('signup-last-name').value.trim(),
    phone,
    password
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
  const savedProfiles = readStorage('dotCustomerProfiles', {});
  savedProfiles[normalizeEmail(resetEmail)] = {...(savedProfiles[normalizeEmail(resetEmail)] || { email: resetEmail }), password};
  localStorage.setItem('dotCustomerProfiles', JSON.stringify(savedProfiles));
  if(currentUser && normalizeEmail(currentUser.email) === normalizeEmail(resetEmail)) {
    currentUser.password = password;
    saveCurrentUser();
  }
  closeModal('modal-reset');
  showToast('Password updated for '+resetEmail+'.');
}
function renderAdminAccess() {
  const panel = document.getElementById('super-admin-panel');
  const list = document.getElementById('admin-access-list');
  if(panel) panel.style.display = isSuperAdmin() ? 'block' : 'none';
  if(!list) return;
  list.innerHTML = adminEmails.map(email => {
    const normalized = normalizeEmail(email);
    const roleText = normalized === SUPER_ADMIN_EMAIL ? 'Super admin - full access' : getAdminPermissions(normalized).join(', ');
    return `<span class="admin-email-chip">${esc(normalized)} <small class="admin-role-note">${esc(roleText)}</small>${normalized === SUPER_ADMIN_EMAIL ? '' : `<button onclick="loadAdminForEdit('${esc(normalized)}')">Edit</button><button onclick="removeAdminAccess('${esc(normalized)}')">X</button>`}</span>`;
  }).join('');
}
function grantAdminAccess() {
  if(!isSuperAdmin()) { showToast('Only super admin can grant admin access.'); return; }
  const email = normalizeEmail(document.getElementById('grant-admin-email').value);
  if(!isGmail(email)) { showToast('Please enter a Gmail address.'); return; }
  if(email === SUPER_ADMIN_EMAIL) { showToast('Super admin already has full access.'); return; }
  const selectedPermissions = Array.from(document.querySelectorAll('.grant-permission:checked')).map(input => input.value);
  if(selectedPermissions.length === 0) { showToast('Select at least one permission.'); return; }
  if(!isAdminEmail(email)) adminEmails.push(email);
  adminPermissions[email] = selectedPermissions;
  saveAdmins();
  saveAdminPermissions();
  document.getElementById('grant-admin-email').value = '';
  renderAdminAccess();
  showToast('Admin access saved for '+email+'.');
}
function removeAdminAccess(email) {
  if(!isSuperAdmin()) return;
  adminEmails = adminEmails.filter(e => normalizeEmail(e) !== normalizeEmail(email) || normalizeEmail(e) === SUPER_ADMIN_EMAIL);
  delete adminPermissions[normalizeEmail(email)];
  saveAdmins();
  saveAdminPermissions();
  renderAdminAccess();
  showToast('Admin access removed.');
}
function loadAdminForEdit(email) {
  if(!isSuperAdmin()) return;
  const normalized = normalizeEmail(email);
  document.getElementById('grant-admin-email').value = normalized;
  const permissions = getAdminPermissions(normalized);
  document.querySelectorAll('.grant-permission').forEach(input => {
    input.checked = permissions.includes(input.value);
  });
  showToast('Loaded permissions for '+normalized+'.');
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
  if(!canAdmin('editProduct')) { showToast('This admin account cannot edit products.'); return; }
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
  if(!canAdmin('editProduct')) { showToast('This admin account cannot save product edits.'); return; }
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
  if(!canAdmin('addProduct')) { showToast('This admin account cannot add products.'); return; }
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
function updateProductStock(id) {
  if(!canAdmin('stock')) { showToast('This admin account cannot update stock.'); return; }
  const product = products.find(p => p.id === id);
  if(!product) return;
  const nextStock = parseInt(document.getElementById('stock-'+id)?.value) || 0;
  product.stock = Math.max(0, nextStock);
  product.status = product.stock <= 0 ? 'Out of Stock' : 'Active';
  saveProducts();
  renderGrids();
  renderStockTable();
  showToast('Stock updated for '+product.name+'.');
}
function updateOrderStatus(id, status) {
  if(!canAdmin('orderStatus')) { showToast('This admin account cannot update orders.'); renderAdminOrders(); return; }
  const order = adminOrders.find(item => item.id === id);
  if(!order) return;
  order.status = status;
  if(order.invoiceId && invoices[order.invoiceId]) {
    invoices[order.invoiceId].status = status;
    saveInvoices();
  }
  const customerProfiles = readStorage('dotCustomerProfiles', {});
  Object.values(customerProfiles).forEach(profile => {
    if(!Array.isArray(profile.orders)) return;
    const customerOrder = profile.orders.find(item => item.id === id);
    if(customerOrder) {
      customerOrder.status = status === 'Delivered' ? 'Shipped' : status === 'Shipped' ? 'Shipped' : status === 'Pending' ? 'To Pay' : 'To Ship';
    }
  });
  localStorage.setItem('dotCustomerProfiles', JSON.stringify(customerProfiles));
  if(currentUser?.orders) {
    const ownOrder = currentUser.orders.find(item => item.id === id);
    if(ownOrder) ownOrder.status = status === 'Delivered' ? 'Shipped' : status === 'Shipped' ? 'Shipped' : status === 'Pending' ? 'To Pay' : 'To Ship';
    saveCurrentUser();
  }
  saveAdminOrders();
  renderAdminOrders();
  renderAdminDashboard();
  showToast('Order #'+id+' moved to '+status+'.');
}

// ================== TOAST ==================
function showToast(msg) {
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 3000);
}

// ================== SCROLL MOTION ==================
let motionObserver = null;
function ensureMotionChrome() {
  if(!document.querySelector('.scroll-progress')) {
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    document.body.prepend(progress);
  }
  if(!document.querySelector('.motion-field')) {
    const field = document.createElement('div');
    field.className = 'motion-field';
    document.body.prepend(field);
  }
}
function refreshScrollMotion() {
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll([
    '.hero-content > *',
    '.hero-card',
    '.section-header',
    '.category-card',
    '.product-card',
    '.about-text',
    '.about-visual',
    '.feature',
    '.info-panel',
    '.checkout-card',
    '.success-container',
    '.admin-stat',
    '.data-table',
    '.footer-col'
  ].join(','));
  targets.forEach((el, index) => {
    if(!el.classList.contains('motion-reveal')) {
      el.classList.add('motion-reveal');
      el.style.setProperty('--motion-index', String(index % 8));
    }
    if(motionObserver && !el.classList.contains('is-visible')) motionObserver.observe(el);
  });
  document.querySelectorAll('.hero-card.featured, .about-visual, .logo-dot').forEach(el => el.classList.add('motion-float'));
}
function updateScrollMotion() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  document.documentElement.style.setProperty('--scroll-progress', String(Math.min(1, scrollTop / maxScroll)));
  document.documentElement.style.setProperty('--scroll-y', String(scrollTop));
}
function initScrollMotion() {
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ensureMotionChrome();
  motionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        motionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  refreshScrollMotion();
  updateScrollMotion();
  window.addEventListener('scroll', updateScrollMotion, { passive: true });
  window.addEventListener('resize', updateScrollMotion);
}

// ================== INIT ==================
hydrateProducts();
renderGrids();
initScrollMotion();
