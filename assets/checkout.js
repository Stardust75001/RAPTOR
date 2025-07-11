/* ========================================================================
   CHECKOUT FUNCTIONALITY
   ======================================================================== */

// Initialize checkout functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
    initializeLazyLoading();
    initializeFormValidation();
});

function initializeCheckout() {
    // Add loading states to checkout buttons
    const checkoutButtons = document.querySelectorAll('.btn-checkout');
    checkoutButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.add('btn-loading');
            this.disabled = true;
        });
    });
    
    // Handle shipping method selection
    const shippingMethods = document.querySelectorAll('input[name="shipping_method"]');
    shippingMethods.forEach(method => {
        method.addEventListener('change', updateShippingTotal);
    });
}

function updateShippingTotal() {
    const selectedMethod = document.querySelector('input[name="shipping_method"]:checked');
    if (selectedMethod) {
        const shippingCost = selectedMethod.dataset.cost;
        const shippingTotalElement = document.getElementById('shipping-total');
        if (shippingTotalElement) {
            shippingTotalElement.textContent = shippingCost;
        }
        updateOrderTotal();
    }
}

function updateOrderTotal() {
    const subtotal = parseFloat(document.getElementById('subtotal')?.dataset.amount || 0);
    const shipping = parseFloat(document.querySelector('input[name="shipping_method"]:checked')?.dataset.amount || 0);
    const tax = parseFloat(document.getElementById('tax-total')?.dataset.amount || 0);
    
    const total = subtotal + shipping + tax;
    const totalElement = document.getElementById('order-total');
    if (totalElement) {
        totalElement.textContent = formatMoney(total);
    }
}

function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/* ========================================================================
   LAZY LOADING
   ======================================================================== */

function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

/* ========================================================================
   FORM VALIDATION
   ======================================================================== */

function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                
                // Focus on first invalid field
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
            }
            form.classList.add('was-validated');
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.checkValidity()) {
                    this.classList.add('is-valid');
                    this.classList.remove('is-invalid');
                } else {
                    this.classList.add('is-invalid');
                    this.classList.remove('is-valid');
                }
            });
        });
    });
}

/* ========================================================================
   ANALYTICS TRACKING
   ======================================================================== */

function trackEvent(eventName, eventData = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, eventData);
    }
    
    // Custom analytics
    if (window.customAnalytics) {
        window.customAnalytics.track(eventName, eventData);
    }
}

// Track checkout steps
function trackCheckoutStep(step, stepName) {
    trackEvent('begin_checkout', {
        step: step,
        step_name: stepName
    });
}

// Track purchase
function trackPurchase(orderData) {
    trackEvent('purchase', {
        transaction_id: orderData.order_id,
        value: orderData.total,
        currency: orderData.currency,
        items: orderData.items
    });
}

/* ========================================================================
   POPUP FUNCTIONALITY
   ======================================================================== */

function showPopup(popupId, options = {}) {
    const popup = document.getElementById(popupId);
    if (!popup) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.onclick = () => hidePopup(popupId);
    
    document.body.appendChild(overlay);
    popup.style.display = 'block';
    popup.classList.add('show');
    
    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hidePopup(popupId);
        }
    });
    
    // Auto-close after delay
    if (options.autoClose) {
        setTimeout(() => hidePopup(popupId), options.autoClose);
    }
}

function hidePopup(popupId) {
    const popup = document.getElementById(popupId);
    const overlay = document.querySelector('.popup-overlay');
    
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.style.display = 'none';
        }, 300);
    }
    
    if (overlay) {
        overlay.remove();
    }
}

/* ========================================================================
   UTILITY FUNCTIONS
   ======================================================================== */

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/* ========================================================================
   PERFORMANCE OPTIMIZATION
   ======================================================================== */

// Preload critical resources
function preloadCriticalResources() {
    const criticalImages = document.querySelectorAll('img[data-critical]');
    criticalImages.forEach(img => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src || img.dataset.src;
        document.head.appendChild(link);
    });
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', preloadCriticalResources);
