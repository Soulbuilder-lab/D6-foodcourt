/* =========================================
 Mobile Menu Toggle
========================================= */
const mobile = document.querySelector('.menu-toggle');
const mobileLink = document.querySelector('.sidebar');
if (mobile && mobileLink) {
    mobile.addEventListener("click", function(){
        mobile.classList.toggle("is-active");
        mobileLink.classList.toggle("active");
    });
    mobileLink.addEventListener("click", function(e){
        if (e.target.tagName === 'A' && window.innerWidth <= 768) {
            mobile.classList.remove("is-active");
            mobileLink.classList.remove("active");
        }
    });
}

/* =========================================
🔄 Scroll Animation (jQuery)
========================================= */
var step = 100;
var stepFilter = 60;
$(".back").bind("click", function(e){
    e.preventDefault();
    $(".highlight-wrapper").animate({ scrollLeft: "-=" + step + "px" }, 300);
});
$(".next").bind("click", function(e){
    e.preventDefault();
    $(".highlight-wrapper").animate({ scrollLeft: "+=" + step + "px" }, 300);
});
$(".back-menus").bind("click", function(e){
    e.preventDefault();
    $(".filter-wrapper").animate({ scrollLeft: "-=" + stepFilter + "px" }, 300);
});
$(".next-menus").bind("click", function(e){
    e.preventDefault();
    $(".filter-wrapper").animate({ scrollLeft: "+=" + stepFilter + "px" }, 300);
});

/* =========================================
🛒 Cart Logic (LocalStorage)
========================================= */
// 1. Initialize Cart Data - Uses ZapFan specific key
let cartItems = JSON.parse(localStorage.getItem('zapfanCart')) || [];

// 2. Update cart count on load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});

/* =========================================
🪑 Table Check — prompt user before ordering
========================================= */
function checkTableBeforeAdd(itemName, itemPrice, imageUrl= '') {
    if (localStorage.getItem('tableNumber')) {
        addToCart(itemName, itemPrice, imageUrl);
        return;
    }
const overlay = document.createElement('div');
overlay.id = 'table-prompt-overlay';
overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:99999;';

overlay.innerHTML = `
    <div style="background:var(--whiteColor);border-radius:18px;padding:32px 28px;max-width:360px;width:90%;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,0.2);animation:tpSlideUp 0.25s ease;">
        <div style="width:64px;height:64px;background:var(--softGreenColor);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
            <ion-icon name="restaurant-outline" style="font-size:2rem;color:var(--primaryColor);"></ion-icon>
        </div>
        <h3 style="margin:0 0 8px;font-size:1.2rem;color:var(--blackColor);font-weight:700;">Which table are you at?</h3>
        <p style="color:var(--darkGreyColor);font-size:0.875rem;margin:0 0 20px;line-height:1.5;">Enter your table number to start ordering.<br>You can find it on your table sign.</p>
        <input id="tp-input" type="text" placeholder="e.g. 5, A3, B12" maxlength="10"
            style="width:100%;padding:11px 14px;border:2px solid var(--greyColor);border-radius:10px;font-size:1rem;outline:none;box-sizing:border-box;margin-bottom:6px;transition:border-color 0.2s;text-align:center;letter-spacing:1px;"
            oninput="this.style.borderColor='var(--primaryColor)'"
            onkeydown="if(event.key==='Enter')window._tpConfirm()">
        <p id="tp-error" style="color:#e76f51;font-size:0.8rem;min-height:18px;margin:0 0 14px;"></p>
        <div style="display:flex;gap:10px;">
            <button id="tp-cancel"
                style="flex:1;padding:11px;background:var(--whiteColor);border:2px solid var(--greyColor);border-radius:10px;cursor:pointer;font-size:0.9rem;color:var(--darkGreyColor);font-weight:600;transition:all 0.2s;"
                onmouseover="this.style.borderColor='var(--secondaryColor)';this.style.color='var(--blackColor)'"
                onmouseout="this.style.borderColor='var(--greyColor)';this.style.color='var(--darkGreyColor)'">
                Cancel
            </button>
            <button id="tp-confirm"
                style="flex:1;padding:11px;background:var(--primaryColor);color:var(--whiteColor);border:none;border-radius:10px;cursor:pointer;font-size:0.9rem;font-weight:700;transition:filter 0.2s;"
                onmouseover="this.style.filter='brightness(0.9)'"
                onmouseout="this.style.filter='brightness(1)'">
                Confirm &amp; Add
            </button>
        </div>
    </div>
    <style>
        #table-prompt-overlay {
            --primaryColor: #84a98c;
            --secondaryColor: #cad2c5;
            --whiteColor: #ffffff;
            --blackColor: #333333;
            --softGreenColor: #f0efeb;
            --darkGreyColor: #888888;
            --greyColor: #dde5d0;
        }
        @keyframes tpSlideUp {
            from { transform:translateY(24px);opacity:0; }
            to   { transform:translateY(0);opacity:1; }
        }
    </style>
`;


    overlay._itemName  = itemName;
    overlay._itemPrice = itemPrice;
    overlay._imageUrl = imageUrl; 

    document.body.appendChild(overlay);
    setTimeout(() => document.getElementById('tp-input')?.focus(), 80);

    document.getElementById('tp-cancel').onclick  = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    window._tpConfirm = function() {
        const val = document.getElementById('tp-input')?.value.trim();
        const err = document.getElementById('tp-error');
        if (!val) { err.textContent = 'Please enter your table number.'; return; }
        localStorage.setItem('tableNumber', val);
        localStorage.setItem('tableSessionId', 'T' + val + '-' + Date.now().toString().slice(-6));
        overlay.remove();
        addToCart(overlay._itemName, overlay._itemPrice, overlay._imageUrl || '');
    };
    document.getElementById('tp-confirm').onclick = window._tpConfirm;
}

// 3. Add to Cart Function
function addToCart(itemName, itemPrice, imageUrl='') {
    console.log('🛒 addToCart called:', {itemName, itemPrice, imageUrl});
    const existingItem = cartItems.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.quantity += 1;
        console.log('📦 Item exists, quantity +1');
    } else {
        cartItems.push({
            name: itemName,
            price: itemPrice,
            quantity: 1,
            image: imageUrl
        });
        console.log('✨ New item added');
    }

    // Save to ZapFan specific storage
    localStorage.setItem('zapfanCart', JSON.stringify(cartItems));

    updateCartCount();

    const cartPopup = document.getElementById('cart-popup');
    if (cartPopup && cartPopup.classList.contains('active')) {
        renderPopupCart();
    }

    showToast(`🛒 ${itemName} added to cart!`);
}

// 4. Update Cart Count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;
    let totalCount = 0;
    cartItems.forEach(item => totalCount += item.quantity);
    cartCount.textContent = totalCount;

    cartCount.style.transition = 'transform 0.2s';
    cartCount.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartCount.style.transform = 'scale(1)';
    }, 200);
}

// 5. Render Cart Popup
function renderPopupCart() {
    const cartItemsBody = document.getElementById('cart-items')?.getElementsByTagName('tbody')[0];
    const cartTotal = document.getElementById('cart-total');
    if (!cartItemsBody || !cartTotal) return;

    cartItemsBody.innerHTML = '';
    let total = 0;

    if (cartItems.length === 0) {
        cartItemsBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Cart is empty</td></tr>';
        cartTotal.textContent = '0.00';
        return;
    }

    cartItems.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const row = cartItemsBody.insertRow();
        row.innerHTML = `
             <td>${item.name}</td>
             <td>${item.quantity}</td>
             <td>RM ${item.price.toFixed(2)}</td>
             <td>RM ${itemTotal.toFixed(2)}</td>
        `;
    });

    cartTotal.textContent = total.toFixed(2);
}

// 6. Toggle Cart Popup
function toggleCartPopup() {
    const cartPopup = document.getElementById('cart-popup');
    if (!cartPopup) return;
    renderPopupCart();
    cartPopup.classList.toggle('active');
}

// 7. Close Cart Popup
function closeCart() {
    const cartPopup = document.getElementById('cart-popup');
    if (cartPopup) {
        cartPopup.classList.remove('active');
    }
}

/* =========================================
🔍 Filter Function
========================================= */
function filterMenu(category, event) {
    console.log('🔍 Filtering category:', category);
    const cards = document.querySelectorAll('.detail-card');
    const buttons = document.querySelectorAll('.filter-card');

    // Reset buttons style
    buttons.forEach(btn => {
        btn.style.backgroundColor = 'var(--whitecolor)';
        btn.style.color = 'var(--blue14)';
        btn.style.borderColor = 'var(--blue6)';
    });

    // Highlight clicked button
    const clickedButton = Array.from(buttons).find(btn => 
        btn.getAttribute('onclick')?.includes(category)
    );

    if (clickedButton) {
        clickedButton.style.backgroundColor = 'var(--blue12)';
        clickedButton.style.color = 'var(--whitecolor)';
        clickedButton.style.borderColor = 'var(--blue12)';
    }

    // Filter cards
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = ''; 
            card.style.animation = 'fadeIn 0.3s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

/* =========================================
🔔 Toast Notification
========================================= */
function showToast(message) {
    console.log(' showToast:', message);
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');

    if (!toast || !toastMsg) return;

    toastMsg.textContent = message || 'Successfully added to cart!';
    toast.classList.add('show');

    if (window.toastTimeout) {
        clearTimeout(window.toastTimeout);
    }

    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        console.log('🔕 Toast hidden');
    }, 2000);
}

/* =========================================
🔗 Social Links & Search Enhancements
========================================= */
document.addEventListener('DOMContentLoaded', function() {
    // Social links new tab
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const url = this.href;
            window.open(url, '_blank', 'noopener,noreferrer');
        });
    });

    // Search box functionality
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search input');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            const keyword = searchInput.value.trim();
            if (keyword) {
                console.log('🔍 Searching:', keyword);
                filterBySearch(keyword);
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
});

/* =========================================
🔍 Search Filter
========================================= */
function filterBySearch(keyword) {
    const cards = document.querySelectorAll('.detail-card');
    const lowerKeyword = keyword.toLowerCase();
    let found = 0;

    cards.forEach(card => {
        const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
        
        if (name.includes(lowerKeyword) || desc.includes(lowerKeyword)) {
            card.style.display = '';
            found++;
        } else {
            card.style.display = 'none';
        }
    });

    console.log(`🔍 Search results: Found ${found} items`);

    if (found === 0) {
        showToast(`😕 No results for "${keyword}"`);
    } else {
        showToast(`✅ Found ${found} item(s)`);
    }
}

/* =========================================
🎨 Fade-in Animation Injection
========================================= */
(function addFadeInAnimation() {
    if (document.getElementById('fade-in-style')) return;
    const style = document.createElement('style');
    style.id = 'fade-in-style';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
})();