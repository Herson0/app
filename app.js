// Array of flower images with proper paths
const flowerImages = [
    'images/rose.jpg',
    'images/lily.jpg',
    'images/tulip.jpg',
    'images/mixed.jpg'
];

// Cart object to store items
let cart = [];

// Install prompt event
let deferredPrompt;
let isPWASupported = false;

// Function to get random image
function getRandomImage() {
    return flowerImages[Math.floor(Math.random() * flowerImages.length)];
}

// Update cart count badge
function updateCartBadge() {
    const cartBadge = document.getElementById('cart-count');
    if (cartBadge) {
        cartBadge.textContent = cart.length;
    }
}

// Show custom install instructions modal
function showInstallInstructions() {
    const modal = document.createElement('div');
    modal.className = 'install-modal';
    modal.innerHTML = `
        <div class="install-modal-content">
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
            <h2>📱 Install Floral Paradise</h2>
            <p>Add Floral Paradise to your home screen for quick access!</p>
            <div class="install-instructions">
                <div class="instruction-step">
                    <h3>Desktop (Chrome/Edge):</h3>
                    <ol>
                        <li>Click the menu icon (⋮) in the top-right</li>
                        <li>Select "Install app"</li>
                        <li>Click "Install"</li>
                    </ol>
                </div>
                <div class="instruction-step">
                    <h3>Mobile (Chrome/Edge):</h3>
                    <ol>
                        <li>Tap the menu icon (⋮)</li>
                        <li>Select "Install app" or "Add to Home screen"</li>
                        <li>Confirm the installation</li>
                    </ol>
                </div>
                <div class="instruction-step">
                    <h3>iPhone/Safari:</h3>
                    <ol>
                        <li>Tap the Share button</li>
                        <li>Select "Add to Home Screen"</li>
                        <li>Tap "Add"</li>
                    </ol>
                </div>
            </div>
            <button class="modal-close-btn" onclick="this.parentElement.parentElement.remove()">Got it!</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Handle install prompt
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event for later use
    deferredPrompt = e;
    isPWASupported = true;
    // Show the install button
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.style.display = 'block';
    }
});

// Handle app installed event
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
});

// Change images on page load
document.addEventListener('DOMContentLoaded', function() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW registration failed'));
    }

    // Load cart from localStorage
    loadCartFromStorage();

    // Handle install button - works with or without PWA support
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        // Always show the install button
        installBtn.style.display = 'block';
        
        installBtn.addEventListener('click', async () => {
            if (isPWASupported && deferredPrompt) {
                // Show native PWA install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                // We've used the prompt, and can't use it again
                deferredPrompt = null;
                // Hide the install button
                installBtn.style.display = 'none';
            } else {
                // Show custom install instructions for non-PWA browsers
                showInstallInstructions();
            }
        });
    }

    // Set main hero image
    if (document.getElementById('main-image')) {
        document.getElementById('main-image').src = 'images/mixed.jpg';
    }

    // Handle product "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product details from the card
            const flowerCard = this.closest('.flower-card');
            const productName = flowerCard.querySelector('h3').textContent;
            const priceText = flowerCard.querySelector('.price').textContent;
            const price = parseFloat(priceText.replace('$', ''));
            
            // Create product object
            const product = {
                id: Date.now(),
                name: productName,
                price: price,
                quantity: 1
            };
            
            // Add to cart
            addToCart(product);
            
            // Show feedback
            this.textContent = '✓ Added!';
            setTimeout(() => {
                this.textContent = 'Add to Cart';
            }, 1500);
        });
    });

    // Handle filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter products
            const filterValue = this.getAttribute('data-filter');
            const flowerItems = document.querySelectorAll('.flower-item');
            
            flowerItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Handle Shop Now button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            document.getElementById('flowers').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Handle search functionality
    const searchBox = document.getElementById('search-box');
    if (searchBox) {
        searchBox.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const flowerItems = document.querySelectorAll('.flower-item');
            
            flowerItems.forEach(item => {
                const productName = item.querySelector('h3').textContent.toLowerCase();
                const description = item.querySelector('.description').textContent.toLowerCase();
                
                if (productName.includes(searchTerm) || description.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Logged in successfully!');
            window.location.href = 'index.html';
        });
    }

    // Checkout
    const checkoutBtn = document.getElementById('checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            alert('Checkout successful! Thank you for your order.');
            cart = [];
            saveCartToStorage();
            loadCart();
            updateCartBadge();
        });
    }

    // Load and display cart if on cart page
    loadCart();
});

function addToCart(product) {
    // Check if product already exists in cart
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push(product);
    }
    
    saveCartToStorage();
    updateCartBadge();
    loadCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartBadge();
    loadCart();
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const stored = localStorage.getItem('cart');
    cart = stored ? JSON.parse(stored) : [];
    updateCartBadge();
}

function loadCart() {
    const cartItems = document.getElementById('cart-items');
    const totalSpan = document.getElementById('total');
    
    if (!cartItems) return;

    cartItems.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        if (totalSpan) totalSpan.textContent = '0.00';
        return;
    }
    
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-details">
                <span>${item.name}</span>
                <span>$${item.price.toFixed(2)} x ${item.quantity}</span>
            </div>
            <div class="cart-item-total">
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
                <button class="remove-btn" data-id="${item.id}">Remove</button>
            </div>
        `;
        cartItems.appendChild(div);
        
        // Add remove button event listener
        const removeBtn = div.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function() {
            removeFromCart(item.id);
        });
        
        total += item.price * item.quantity;
    });
    
    if (totalSpan) totalSpan.textContent = total.toFixed(2);
}