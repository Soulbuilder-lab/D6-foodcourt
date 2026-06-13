const mobile = document.querySelector('.menu-toggle');
const mobileLink = document.querySelector('.sidebar');
if (mobile && mobileLink) {
  mobile.addEventListener("click", function(){
    mobile.classList.toggle("is-active");
    mobileLink.classList.toggle("active");
  });
  mobileLink.addEventListener("click", function(){
    const menuBars = document.querySelector(".is-active");
    if(window.innerWidth<=768 && menuBars) {
      mobile.classList.toggle("is-active");
      mobileLink.classList.toggle("active");
    }
  });
}

function getCartData() {
  const data = localStorage.getItem('zapfanCart');
  return data ? JSON.parse(data) : [];
}
function saveCartData(data) {
  localStorage.setItem('zapfanCart', JSON.stringify(data));
}

const cartListElement = document.getElementById('cart-list');
const subtotalElement = document.getElementById('subtotal-price');
const taxElement = document.getElementById('tax-price');
const totalElement = document.getElementById('total-price');
const headerCartCount = document.getElementById('header-cart-count');

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});

function renderCart() {
  cartListElement.innerHTML = '';
  let cartData = getCartData();
  if (cartData.length === 0) {
    cartListElement.innerHTML = `
      <div style="text-align:center; padding:40px; color:#a7a7a7;">
        <ion-icon name="cart-outline" style="font-size:48px; opacity:0.5;"></ion-icon>
        <p style="margin-top:10px;">Your cart is empty.</p>
      </div>`;
    updateSummary();
    return;
  }

  cartData.forEach((item, index) => {
    const itemTotal = item.price * (item.quantity || 1);
    
    const itemHTML = `
      <div class="cart-item-card">
        <div class="item-image">
          <img src="${item.image || ''}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'">
        </div>
        <div class="item-details">
          <div class="item-name">${item.name}</div>
          <div class="item-price">RM ${item.price.toFixed(2)}</div>
        </div>
        <div class="item-controls">
          <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
          <span>${item.quantity || 1}</span>
          <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
          <ion-icon name="trash-outline" class="remove-btn" onclick="removeItem(${index})"></ion-icon>
        </div>
      </div>
    `;
    cartListElement.innerHTML += itemHTML;
  });

  updateSummary();
}

function updateQuantity(index, change) {
  let cartData = getCartData();
  if (index >= 0 && index < cartData.length) {
    const newQuantity = cartData[index].quantity + change;
    
    if (newQuantity > 0) {
      cartData[index].quantity = newQuantity;
    } else {
      if(confirm("Remove this item from cart?")) {
        cartData.splice(index, 1);
      } else {
        cartData[index].quantity = 1;
      }
    }
    
    saveCartData(cartData);
    renderCart();
  }
}

function removeItem(index) {
  let cartData = getCartData();
  if (index >= 0 && index < cartData.length) {
    if(confirm("Are you sure you want to remove this item?")) {
      cartData.splice(index, 1);
      saveCartData(cartData);
      renderCart();
    }
  }
}

function updateSummary() {
  let cartData = getCartData();
  let subtotal = 0;
  let totalQty = 0;
  cartData.forEach(item => {
    subtotal += item.price * item.quantity;
    totalQty += item.quantity;
  });

  const tax = subtotal * 0.06;
  const total = subtotal + tax;

  if (subtotalElement) subtotalElement.textContent = `RM ${subtotal.toFixed(2)}`;
  if (taxElement) taxElement.textContent = `RM ${tax.toFixed(2)}`;
  if (totalElement) totalElement.textContent = `RM ${total.toFixed(2)}`;
  if (headerCartCount) headerCartCount.textContent = totalQty;
}

function emptyCart() {
  localStorage.removeItem('zapfanCart');
  renderCart();
  console.log("🗑️ Zapfan Cart emptied");
}

function goCheckout() {
  const cartData = getCartData();
  if (cartData.length === 0) {
    alert("Your cart is empty! Please add items before checking out.");
    return;
  }
  window.location.href = "zapfancheckout.html";
}