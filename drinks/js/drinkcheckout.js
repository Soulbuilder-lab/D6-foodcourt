const mobile = document.querySelector('.menu-toggle');
const mobileLink = document.querySelector('.sidebar');
mobile.addEventListener("click", function(){
    mobile.classList.toggle("is-active");
    mobileLink.classList.toggle("active");
})
mobileLink.addEventListener("click", function(){
    const menuBars = document.querySelector(".is-active");
    if(window.innerWidth<=768 && menuBars) {
        mobile.classList.toggle("is-active");
        mobileLink.classList.toggle("active");
    }
})

const profile = JSON.parse(localStorage.getItem('customerProfile')) || {};
if(profile.name) document.getElementById('name').value = profile.name;
if(profile.phone) document.getElementById('phone').value = profile.phone;

document.addEventListener('DOMContentLoaded', () => {
    const cartData = JSON.parse(localStorage.getItem('drinkCart')) || [];
    const itemsContainer = document.getElementById('checkout-items');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');
    const form = document.getElementById('checkout-form');
    const cartCount = document.getElementById('cart-count');

    // Check if cart is empty
    if (cartData.length === 0) {
        alert("Your cart is empty! Please add items first.");
        window.location.href = 'drinkcart.html';
        return;
    }

    // Calculate and display cart count
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

    // Form submit handler
    form.addEventListener('submit', (e) => {
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

        // Build order object
        const orderData = {
            id: 'ORD-' + Date.now().toString().slice(-6),
            restaurant: 'Boba Milk',                    // Tagged for admin panel
            timestamp: new Date().toISOString(),
            table: localStorage.getItem('tableNumber') || 'Kiosk',
            status: 'new',                           // CRITICAL for admin panel
            customer: { name, phone, email },
            items: cartData,
            payment: payment === 'cash' ? 'Cash on Delivery' : 'Card',
            subtotal: subtotal.toFixed(2), 
            tax: tax.toFixed(2),
            total: total.toFixed(2),
            orderDate: new Date().toLocaleString('en-MY', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        // Save for success page
        localStorage.setItem('lastOrder', JSON.stringify(orderData));

        // Sync to main admin storage
        const allOrders = JSON.parse(localStorage.getItem('foodcourt_orders')) || [];
        allOrders.push(orderData);
        localStorage.setItem('foodcourt_orders', JSON.stringify(allOrders));

        // Clear cart and redirect
        localStorage.removeItem('drinkCart');
        window.location.href = 'drinksuccess.html';
    });
});