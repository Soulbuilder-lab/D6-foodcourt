// ============================================
// checkout.js - FIREBASE VERSION
// ============================================
// Required: Import Firebase (add to HTML head)
// <script type="module" src="firebase-checkout.js"></script>

import { collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
import { db } from './firebase-config.js';

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

// Load customer profile
const profile = JSON.parse(localStorage.getItem('customerProfile')) || {};
if(profile.name) document.getElementById('name').value = profile.name;
if(profile.phone) document.getElementById('phone').value = profile.phone;

document.addEventListener('DOMContentLoaded', () => {
    const cartData = JSON.parse(localStorage.getItem('smallCloudCart')) || [];
    const itemsContainer = document.getElementById('checkout-items');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');
    const form = document.getElementById('checkout-form');
    const cartCount = document.getElementById('cart-count');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Check if cart is empty
    if (cartData.length === 0) {
        alert("Your cart is empty! Please add items first.");
        window.location.href = 'cart.html';
        return;
    }

    // Calculate and display cart quantity
    let subtotal = 0;
    const totalQty = cartData.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalQty;

    // Render order items
    cartData.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const div = document.createElement('div');
        div.className = 'checkout-item';
        div.innerHTML = `
            <span>${item.name} × ${item.quantity}</span>
            <span>RM ${itemTotal.toFixed(2)}</span>
        `;
        itemsContainer.appendChild(div);
    });

    // Calculate tax and total
    const tax = subtotal * 0.06;
    const total = subtotal + tax;

    // Update display
    if (subtotalEl) subtotalEl.textContent = `RM ${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `RM ${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `RM ${total.toFixed(2)}`;

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('name')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const payment = document.querySelector('input[name="payment"]:checked')?.value;

        // Validate required fields
        if (!name || !phone || !email) {
            alert("Please fill in all required fields.");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address (e.g. user@example.com)");
            document.getElementById('email')?.focus();
            return;
        }

        // Disable submit button to prevent double submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            // Prepare order data
            const orderData = {
                restaurant: 'Small Cloud',
                table: localStorage.getItem('tableNumber') || 'Kiosk',
                status: 'ordered', // Initial status
                customer: { name, phone, email },
                items: cartData,
                payment: payment === 'cash' ? 'Cash' : 'Card',
                subtotal: subtotal.toFixed(2),
                tax: tax.toFixed(2),
                total: total.toFixed(2),
                orderDate: new Date().toLocaleString('en-MY', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            // ✅ SAVE TO FIREBASE
            const docRef = await addDoc(collection(db, "orders"), orderData);
            console.log("✅ Order saved to Firebase with ID:", docRef.id);

            // Save to localStorage as backup (for offline support)
            const allOrders = JSON.parse(localStorage.getItem('foodcourt_orders')) || [];
            allOrders.push({ id: docRef.id, ...orderData });
            localStorage.setItem('foodcourt_orders', JSON.stringify(allOrders));

            // Save last order
            localStorage.setItem('lastOrder', JSON.stringify({ id: docRef.id, ...orderData }));

            // Save customer profile for future orders
            localStorage.setItem('customerProfile', JSON.stringify({ name, phone, email }));

            // Clear cart
            localStorage.removeItem('smallCloudCart');
            
            // Show success message
            alert('✅ Order placed successfully! Your order ID: ' + docRef.id);

            // Redirect to success page
            window.location.href = 'success.html';

        } catch (error) {
            console.error("❌ Error saving order:", error);
            alert("Error placing order: " + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        }
    });
});