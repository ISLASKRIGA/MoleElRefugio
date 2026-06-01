// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(26, 15, 8, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
        navbar.style.padding = '0.5rem 0';
    } else {
        navbar.style.background = 'rgba(43, 27, 16, 0.95)';
        navbar.style.boxShadow = 'none';
        navbar.style.padding = '0';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Simple intersection observer for fade-in animations on scroll
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add animation classes to product cards initially
document.querySelectorAll('.product-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
    observer.observe(card);
});

// --- Cart & Modal Logic ---
let cart = [];
let currentProduct = null;

// Modal Functions
function openProductModal(title, price, imageSrc, desc, weight) {
    currentProduct = { title, price, imageSrc, desc, weight };
    
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-price').textContent = `$${price} MXN`;
    document.getElementById('modal-img').src = imageSrc;
    document.getElementById('modal-desc').textContent = desc;
    document.getElementById('modal-weight').textContent = weight;
    document.getElementById('modal-qty').value = 1;
    
    document.getElementById('product-modal').classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
    document.body.style.overflow = '';
}

function updateModalQty(change) {
    const input = document.getElementById('modal-qty');
    let newVal = parseInt(input.value) + change;
    if (newVal >= 1) {
        input.value = newVal;
    }
}

// Cart Functions
function addToCartFromModal() {
    const qty = parseInt(document.getElementById('modal-qty').value);
    
    const existingItem = cart.find(item => item.title === currentProduct.title);
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({ ...currentProduct, qty });
    }
    
    updateCartUI();
    closeProductModal();
    openCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let itemCount = 0;
    
    cart.forEach((item, index) => {
        total += item.price * item.qty;
        itemCount += item.qty;
        
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <img src="${item.imageSrc}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price} MXN x ${item.qty}</div>
                    <div style="font-size: 0.8rem; color: #aaa;">${item.weight}</div>
                    <button class="remove-item" onclick="removeFromCart(${index})">Eliminar</button>
                </div>
            </div>
        `;
    });
    
    cartCount.textContent = itemCount;
    cartTotalPrice.textContent = `$${total.toFixed(2)} MXN`;
}

function openCart(e) {
    if(e) e.preventDefault();
    document.getElementById('cart-drawer').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    document.getElementById('cart-drawer').classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal/cart when clicking outside
window.addEventListener('click', (e) => {
    const modalOverlay = document.getElementById('product-modal');
    const cartOverlay = document.getElementById('cart-drawer');
    
    if (e.target === modalOverlay) {
        closeProductModal();
    }
    if (e.target === cartOverlay) {
        closeCart();
    }
});

// WhatsApp Checkout
function checkoutWhatsapp() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    
    const phoneNumber = "5215568622824";
    let message = "Hola! Me gustaría hacer un pedido del Mole del Refugio:\n\n";
    let total = 0;
    
    cart.forEach(item => {
        message += `• ${item.qty}x ${item.title} (${item.weight}) - $${item.price * item.qty} MXN\n`;
        total += item.price * item.qty;
    });
    
    message += `\n*Total a pagar: $${total.toFixed(2)} MXN*\n\nPor favor, indíquenme los pasos para el pago y envío. ¡Gracias!`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
}

// --- Slider Logic ---
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
let slideInterval;

function initSlider() {
    if (slides.length > 0) {
        startSlideTimer();
    }
}

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    
    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }
    
    slides[currentSlide].classList.add('active');
}

function moveSlide(direction) {
    showSlide(currentSlide + direction);
    resetSlideTimer();
}

function startSlideTimer() {
    slideInterval = setInterval(() => {
        moveSlide(1);
    }, 5000); // 5 seconds
}

function resetSlideTimer() {
    clearInterval(slideInterval);
    startSlideTimer();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initSlider);
