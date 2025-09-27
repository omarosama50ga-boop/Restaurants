// ننتظر حتى يتم تحميل كل عناصر الصفحة قبل تشغيل الكود
        document.addEventListener('DOMContentLoaded', () => {

            // ===================================================================
            // =================  1. تحديد كل العناصر المهمة في الصفحة =================
            // ===================================================================
            const cartIcon = document.querySelector('.cart-icon');
            const cartSidebar = document.querySelector('.cart-sidebar');
            const closeCartBtn = document.querySelector('.close-cart-btn');
            const overlay = document.querySelector('.overlay');
            const cartItemsContainer = document.querySelector('.cart-items');
            const cartCounter = document.querySelector('.cart-counter');
            const totalPriceEl = document.querySelector('.total-price');
            const checkoutBtn = document.querySelector('.checkout-btn');
            const checkoutModal = document.getElementById('checkout-modal');
            const closeModalBtn = document.querySelector('.close-modal-btn');
            const checkoutForm = document.getElementById('checkout-form');
            const modalTotalPriceEl = document.getElementById('modal-total-price');
            const addressGroup = document.getElementById('address-group');
            const addressInput = document.getElementById('address');
            const deliveryOptions = document.querySelectorAll('input[name="delivery_option"]');
            
            // ===================================================================
            // =================  2. إعداد سلة الطلبات الأولية =====================
            // ===================================================================
            // تغيير localStorage إلى "Restaurants" بدلاً من "cart"
            let cart = JSON.parse(localStorage.getItem('Restaurants')) || [];

            // ===================================================================
            // =================  3. الدوال الأساسية (Functions) ===================
            // ===================================================================

            // دالة لفتح وإغلاق العناصر
            const open = (element) => { 
                element.classList.add('open'); 
                overlay.classList.add('open'); 
                document.body.style.overflow = 'hidden'; // منع التمرير عند فتح العناصر
            };
            
            const close = (element) => { 
                element.classList.remove('open'); 
                overlay.classList.remove('open'); 
                document.body.style.overflow = ''; // إعادة التمرير
            };

            // دالة لإضافة طبق إلى السلة
            function addToCart(productCard) {
                const productId = productCard.dataset.id;
                const existingItem = cart.find(item => item.id === productId);
                
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    const productName = productCard.dataset.name;
                    const productPrice = parseFloat(productCard.dataset.price);
                    const productImage = productCard.dataset.image;
                    cart.push({ id: productId, name: productName, price: productPrice, image: productImage, quantity: 1 });
                }
                updateCart();
                
                // إظهار رسالة تأكيد
                showNotification('تم إضافة المنتج إلى السلة بنجاح!');
            }

            // دالة لإظهار رسالة تأكيد
            function showNotification(message) {
                // إنصراف العنصر إذا كان موجوداً
                const existingNotification = document.querySelector('.notification');
                if (existingNotification) {
                    existingNotification.remove();
                }
                
                const notification = document.createElement('div');
                notification.className = 'notification';
                notification.textContent = message;
                notification.style.cssText = `
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: var(--primary-orange);
                    color: #000;
                    padding: 15px 20px;
                    border-radius: 5px;
                    font-weight: bold;
                    z-index: 10000;
                    animation: slideIn 0.3s ease, fadeOut 0.3s ease 2s forwards;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                `;
                
                // إضافة أنيميشن
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
                
                document.body.appendChild(notification);
                
                // إزالة الرسالة بعد 2.5 ثانية
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 2500);
            }

            // دالة لتحديث واجهة سلة الطلبات
            function updateCart() {
                cartItemsContainer.innerHTML = '';
                if (cart.length === 0) {
                    cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-dark);">سلة الطلبات فارغة.</p>';
                }
                
                let total = 0;
                cart.forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>${item.price} جنيه</p>
                        </div>
                        <div class="cart-item-actions">
                            <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                        </div>
                        <i class="fas fa-trash-alt remove-item-btn" data-id="${item.id}"></i>
                    `;
                    cartItemsContainer.appendChild(cartItem);
                    total += item.price * item.quantity;
                });

                totalPriceEl.textContent = `الإجمالي: ${total} جنيه`;
                modalTotalPriceEl.textContent = `${total} جنيه`;
                cartCounter.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
                checkoutBtn.disabled = cart.length === 0;
                
                // حفظ السلة في localStorage باستخدام مفتاح "Restaurants"
                localStorage.setItem('Restaurants', JSON.stringify(cart));
            }

            // دالة إرسال الطلب النهائية عبر واتساب
            function handleCheckout(e) {
                e.preventDefault();
                const customerName = document.getElementById('name').value;
                const customerPhone = document.getElementById('phone').value;
                const deliveryOption = document.querySelector('input[name="delivery_option"]:checked').value;
                const customerAddress = (deliveryOption === 'توصيل للمنزل') ? document.getElementById('address').value : 'سيتم الاستلام من الفرع';
                const notes = document.getElementById('notes').value || 'لا يوجد';

                let productsText = "";
                cart.forEach(item => {
                    productsText += `\n- ${item.name} (الكمية: ${item.quantity}) - ${item.price * item.quantity} جنيه`;
                });

                const fullMessage = `
*طلب جديد من مطعم فليفرز* 🍔🍕
=====================
*بيانات العميل:*
👤 الاسم: ${customerName}
📞 الهاتف: ${customerPhone}
---------------------
*تفاصيل الطلب:*
🛵 طريقة الاستلام: *${deliveryOption}*
📍 العنوان: ${customerAddress}
---------------------
*الطلبات:*
${productsText}
---------------------
*ملاحظات:*
📝 ${notes}
=====================
*💰 الإجمالي:* ${modalTotalPriceEl.textContent}
`;

                const ownerPhoneNumber = "201143708997"; // <-- ضع رقمك هنا
                const whatsappURL = `https://wa.me/${ownerPhoneNumber}?text=${encodeURIComponent(fullMessage)}`;
                window.open(whatsappURL, '_blank');

                // إظهار رسالة تأكيد
                showNotification('جاري فتح واتساب لإرسال الطلب...');
                
                setTimeout(() => {
                    cart = [];
                    updateCart();
                    checkoutForm.reset();
                    close(checkoutModal);
                }, 2000);
            }
            
            // دالة للتحكم في ظهور حقل العنوان
            function toggleAddressField() {
                const deliveryOption = document.querySelector('input[name="delivery_option"]:checked').value;
                addressGroup.style.display = (deliveryOption === 'توصيل للمنزل') ? 'block' : 'none';
                addressInput.required = (deliveryOption === 'توصيل للمنزل');
            }

            // ===================================================================
            // =================  4. ربط الدوال بالأحداث (Event Listeners) =========
            // ===================================================================
            
            // المستمع الرئيسي لكل النقرات في الصفحة
            document.addEventListener('click', (e) => {
                const target = e.target;

                // إذا تم النقر على زر "أضف للطلب"
                if (target.classList.contains('add-to-cart-btn')) {
                    addToCart(target.closest('.product-card'));
                }
                
                // إذا تم النقر داخل سلة الطلبات (للتحكم بالكمية أو الحذف)
                if (target.closest('.cart-items')) {
                    const itemId = target.dataset.id;
                    const item = cart.find(item => item.id === itemId);
                    if (!item) return;

                    if (target.classList.contains('quantity-btn')) {
                        if (target.dataset.action === 'increase') item.quantity++;
                        else if (target.dataset.action === 'decrease' && item.quantity > 1) item.quantity--;
                    }
                    if (target.classList.contains('remove-item-btn')) {
                        cart = cart.filter(cartItem => cartItem.id !== itemId);
                        showNotification('تم إزالة المنتج من السلة');
                    }
                    updateCart();
                }

                // فتح وإغلاق العناصر
                if (target.closest('.cart-icon')) open(cartSidebar);
                if (target.classList.contains('close-cart-btn')) close(cartSidebar);
                if (target.classList.contains('checkout-btn')) { 
                    close(cartSidebar); 
                    open(checkoutModal); 
                }
                if (target.classList.contains('close-modal-btn')) close(checkoutModal);
                if (target.classList.contains('overlay')) { 
                    close(cartSidebar); 
                    close(checkoutModal); 
                }
            });

            // ربط فورم الدفع بدالة الإرسال
            checkoutForm.addEventListener('submit', handleCheckout);
            
            // ربط خيارات التوصيل بدالة إظهار/إخفاء العنوان
            deliveryOptions.forEach(option => option.addEventListener('change', toggleAddressField));

            // ===================================================================
            // =================  5. التشغيل الأولي عند تحميل الصفحة ===============
            // ===================================================================
            updateCart();
            toggleAddressField();
        });