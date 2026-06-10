/* =========================================
   📱 移动端菜单切换
   ========================================= */
const mobile = document.querySelector('.menu-toggle');
const mobileLink = document.querySelector('.sidebar');

if (mobile && mobileLink) {
    mobile.addEventListener("click", function(){
        mobile.classList.toggle("is-active");
        mobileLink.classList.toggle("active");
    });

    mobileLink.addEventListener("click", function(e){
        // 点击菜单链接后自动关闭侧边栏（移动端）
        if (e.target.tagName === 'A' && window.innerWidth <= 768) {
            mobile.classList.remove("is-active");
            mobileLink.classList.remove("active");
        }
    });
}

/* =========================================
   🔄 滚动动画（jQuery）
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
   🛒 购物车逻辑（localStorage）
   ========================================= */

// 1. 初始化购物车数据
let cartItems = JSON.parse(localStorage.getItem('goldenBowlCart')) || [];

// 2. 页面加载时更新购物车数量
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    console.log('🛒 购物车初始化完成，当前商品数:', cartItems.length);
});


/* =========================================
   🪑 Table Check — prompt user before ordering
   ========================================= */
function checkTableBeforeAdd(itemName, itemPrice) {
    if (localStorage.getItem('tableNumber')) {
        addToCart(itemName, itemPrice);
        return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'table-prompt-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:99999;';

    overlay.innerHTML = `
        <div style="background:#fff;border-radius:18px;padding:32px 28px;max-width:360px;width:90%;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,0.2);animation:tpSlideUp 0.25s ease;">
            <div style="width:64px;height:64px;background:#FAF0E6;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                <ion-icon name="restaurant-outline" style="font-size:2rem;color:#AD774C;"></ion-icon>
            </div>
            <h3 style="margin:0 0 8px;font-size:1.2rem;color:#2d2d2d;font-weight:700;">Which table are you at?</h3>
            <p style="color:#8c8c8c;font-size:0.875rem;margin:0 0 20px;line-height:1.5;">Enter your table number to start ordering.<br>You can find it on your table sign.</p>
            <input id="tp-input" type="text" placeholder="e.g. 5, A3, B12" maxlength="10"
                style="width:100%;padding:11px 14px;border:2px solid #e0e0e0;border-radius:10px;font-size:1rem;outline:none;box-sizing:border-box;margin-bottom:6px;transition:border-color 0.2s;text-align:center;letter-spacing:1px;"
                oninput="this.style.borderColor='#AD774C'"
                onkeydown="if(event.key==='Enter')window._tpConfirm()">
            <p id="tp-error" style="color:#e76f51;font-size:0.8rem;min-height:18px;margin:0 0 14px;"></p>
            <div style="display:flex;gap:10px;">
                <button id="tp-cancel"
                    style="flex:1;padding:11px;background:#fff;border:2px solid #e0e0e0;border-radius:10px;cursor:pointer;font-size:0.9rem;color:#8c8c8c;font-weight:600;transition:all 0.2s;"
                    onmouseover="this.style.borderColor='#bbb';this.style.color='#555'"
                    onmouseout="this.style.borderColor='#e0e0e0';this.style.color='#8c8c8c'">
                    Cancel
                </button>
                <button id="tp-confirm"
                    style="flex:1;padding:11px;background:#8E5831;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:0.9rem;font-weight:700;transition:background 0.2s;"
                    onmouseover="this.style.background='#7C4A26'"
                    onmouseout="this.style.background='#8E5831'">
                    Confirm &amp; Add
                </button>
            </div>
        </div>
        <style>
            @keyframes tpSlideUp {
                from { transform:translateY(24px);opacity:0; }
                to   { transform:translateY(0);opacity:1; }
            }
        </style>
    `;

    // Store item for after confirm
    overlay._itemName  = itemName;
    overlay._itemPrice = itemPrice;

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
        addToCart(overlay._itemName, overlay._itemPrice);
    };
    document.getElementById('tp-confirm').onclick = window._tpConfirm;
}

// 3. 添加到购物车（主函数）
function addToCart(itemName, itemPrice) {
    console.log('🛒 addToCart 被调用:', {itemName, itemPrice});
    
    // 检查是否已存在
    const existingItem = cartItems.find(item => item.name === itemName);
    
    if (existingItem) {
        existingItem.quantity += 1;
        console.log('📦 商品已存在，数量 +1');
    } else {
        cartItems.push({
            name: itemName,
            price: itemPrice,
            quantity: 1
        });
        console.log('✨ 新商品加入购物车');
    }

    // 保存到 localStorage
    localStorage.setItem('goldenBowlCart', JSON.stringify(cartItems));
    
    // 更新右上角数量
    updateCartCount();
    
    // 如果购物车弹窗打开，同步更新
    const cartPopup = document.getElementById('cart-popup');
    if (cartPopup && cartPopup.classList.contains('active')) {
        renderPopupCart();
    }
    
    // ✅ 显示 Toast 提示
    showToast(`🛒 ${itemName} added to cart!`);
}

// 4. 更新购物车数量显示
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;
    
    let totalCount = 0;
    cartItems.forEach(item => totalCount += item.quantity);
    cartCount.textContent = totalCount;
    
    // 动画效果：数量变化时闪烁
    cartCount.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartCount.style.transform = 'scale(1)';
    }, 200);
}

// 5. 渲染购物车弹窗内容
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

// 6. 切换购物车弹窗
function toggleCartPopup() {
    const cartPopup = document.getElementById('cart-popup');
    if (!cartPopup) return;
    
    renderPopupCart();
    cartPopup.classList.toggle('active');
}

// 7. 关闭购物车弹窗
function closeCart() {
    const cartPopup = document.getElementById('cart-popup');
    if (cartPopup) {
        cartPopup.classList.remove('active');
    }
}

/* =========================================
   🔍 分类过滤功能
   ========================================= */
function filterMenu(category, event) {
    console.log('🔍 过滤分类:', category);
    
    const cards = document.querySelectorAll('.detail-card');
    const buttons = document.querySelectorAll('.filter-card');
    
    // 重置所有按钮样式
    buttons.forEach(btn => {
        btn.style.backgroundColor = 'var(--whitecolor)';
        btn.style.color = 'var(--tea14)';
        btn.style.borderColor = 'var(--tea6)';
    });
    
    // 高亮当前点击的按钮
    const clickedButton = Array.from(buttons).find(btn => 
        btn.getAttribute('onclick')?.includes(category)
    );
    
    if (clickedButton) {
        clickedButton.style.backgroundColor = 'var(--tea12)';
        clickedButton.style.color = 'var(--whitecolor)';
        clickedButton.style.borderColor = 'var(--tea12)';
    }
    
    // 过滤卡片
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = ''; 
            // 添加淡入动画
            card.style.animation = 'fadeIn 0.3s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

/* =========================================
   🔔 Toast 提示功能
   ========================================= */
function showToast(message) {
    console.log('🔔 showToast:', message);
    
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    
    // 安全检查
    if (!toast) {
        console.error('❌ Toast 元素未找到！请检查 HTML 是否添加了：');
        console.error('<div id="toast-notification" class="toast">...</div>');
        return;
    }
    if (!toastMsg) {
        console.error('❌ Toast 消息元素未找到！请检查 <span id="toast-message">');
        return;
    }
    
    // 更新文字
    toastMsg.textContent = message || 'Successfully added to cart!';
    
    // 显示动画
    toast.classList.add('show');
    
    // 清除之前的定时器
    if (window.toastTimeout) {
        clearTimeout(window.toastTimeout);
    }
    
    // 2.5秒后自动隐藏
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        console.log('🔕 Toast 已隐藏');
    }, 2000);
}

/* =========================================
   🔗 社交媒体链接增强
   ========================================= */
document.addEventListener('DOMContentLoaded', function() {
    // 社交链接新标签页打开
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const url = this.href;
            window.open(url, '_blank', 'noopener,noreferrer');
        });
    });
    
    // 搜索框功能（可选）
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search input');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            const keyword = searchInput.value.trim();
            if (keyword) {
                console.log('🔍 搜索:', keyword);
                filterBySearch(keyword);
            }
        });
        
        // 支持 Enter 键搜索
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
});

/* =========================================
   🔍 辅助函数：按关键词搜索
   ========================================= */
function filterBySearch(keyword) {
    const cards = document.querySelectorAll('.detail-card');
    const lowerKeyword = keyword.toLowerCase();
    
    let found = 0;
    
    cards.forEach(card => {
        const name = card.querySelector('h4')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.detail-sub')?.textContent.toLowerCase() || '';
        
        if (name.includes(lowerKeyword) || desc.includes(lowerKeyword)) {
            card.style.display = '';
            found++;
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log(`🔍 搜索结果: 找到 ${found} 个商品`);
    
    // 显示搜索提示
    if (found === 0) {
        showToast(`😕 No results for "${keyword}"`);
    } else {
        showToast(`✅ Found ${found} item(s)`);
    }
}

/* =========================================
   🎨 添加淡入动画关键帧（动态注入）
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