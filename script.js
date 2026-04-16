// --- Product Data ---
const products = [
  { id: 1, name: "The Everyday Hand Bag", price: 839, image: "images/WhatsApp Image 2026-04-04 at 11.54.54 A.jpeg", category: "Hand Bag", images: ["images/WhatsApp Image 2026-04-04 at 11.54.54 A.jpeg", "images/bag1_alt.png"] },
  { id: 2, name: "The Signature Clutch", price: 449, image: "images/WhatsApp Image 2026-04-04 at 1.45.12 PM.jpeg", category: "Clutch", images: ["images/WhatsApp Image 2026-04-04 at 1.45.12 PM.jpeg", "images/bag2_alt.png"] },
  { id: 3, name: "Designed For Kids", price: 439, image: "images/WhatsApp Image 2026-04-04 at 11.54.55 AM.jpeg", category: "Crossbody", images: ["images/WhatsApp Image 2026-04-04 at 11.54.55 AM.jpeg", "images/bag3_alt.png"] },
  { id: 4, name: "The Classic Crossbody", price: 439, image: "images/WhatsApp Image 2026-04-04 at 11.54.5.jpeg", category: "Crossbody", images: ["images/WhatsApp Image 2026-04-04 at 11.54.5.jpeg", "images/bag4_alt.png"] }
];

let cart = [];

// --- Global DOM Elements ---
const navbar = document.getElementById('navbar');
const productGrid = document.getElementById('product-grid');
const cartIcon = document.getElementById('cart-icon');
const cartCount = document.getElementById('cart-count');
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');

const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutBtn = document.getElementById('close-checkout');
const checkoutItemsList = document.getElementById('checkout-items');
const checkoutModalTotal = document.getElementById('checkout-modal-total');
const checkoutForm = document.getElementById('checkout-form');

const hero = document.getElementById('hero');
const heroImg = document.getElementById('hero-img');

// --- Setup ---
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  initGSAP();
});

// --- Scroll Effects ---
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

// --- High-Performance Mouse Parallax (Hero) ---
// Cursor animation removed per user request

// --- Rendering ---
function renderProducts() {
  productGrid.innerHTML = products.map(p => `
    <div class="product-card" onclick="openProduct(${p.id})">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}">
        <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${p.id});">Add to Cart</button>
      </div>
      <div class="product-info">
        <p style="text-transform: uppercase; font-size:0.75rem; color:#999; letter-spacing:2px; font-weight:500;">${p.category}</p>
        <h3>${p.name}</h3>
        <p>₹${p.price.toLocaleString()}</p>
      </div>
    </div>
  `).join('');
}

// --- Lightbox Slider Logic ---
let currentProductImages = [];
let currentImageIndex = 0;

window.openProduct = function(id) {
  const product = products.find(p => p.id === id);
  if(!product) return;
  
  currentProductImages = product.images || [product.image];
  currentImageIndex = 0;
  
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxModal = document.getElementById('lightbox-modal');
  if(!lightboxImg || !lightboxModal) return;
  
  lightboxImg.src = currentProductImages[currentImageIndex];
  lightboxImg.style.opacity = 1;
  lightboxModal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
  const lightboxModal = document.getElementById('lightbox-modal');
  if(lightboxModal) lightboxModal.classList.remove('active');
  document.body.style.overflow = 'auto'; 
};

window.changeSlide = function(direction, event) {
  if (event) event.stopPropagation(); // prevent clicking behind
  if (currentProductImages.length <= 1) return;
  
  const lightboxImg = document.getElementById('lightbox-img');
  lightboxImg.style.opacity = 0;
  
  setTimeout(() => {
    currentImageIndex += direction;
    if (currentImageIndex >= currentProductImages.length) currentImageIndex = 0;
    if (currentImageIndex < 0) currentImageIndex = currentProductImages.length - 1;
    
    lightboxImg.src = currentProductImages[currentImageIndex];
    lightboxImg.style.opacity = 1;
  }, 200);
};


// --- Cart Logic ---
window.addToCart = function (id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });

  updateCart();
  openCart();
};

window.updateQty = function (id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  updateCart();
};

window.removeItem = function (id) {
  cart = cart.filter(i => i.id !== id);
  updateCart();
};

function updateCart() {
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p style="text-align:center; color:#999; margin-top: 3rem; font-size: 1.1rem">Your cart is empty.</p>`;
    cartTotalPrice.textContent = "₹0";
    checkoutBtn.style.display = "none";
    return;
  }

  checkoutBtn.style.display = "block";
  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <div>
          <h4>${item.name}</h4>
          <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeItem(${item.id})">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotalPrice.textContent = `₹${total.toLocaleString()}`;
}

// --- Cart UI ---
function openCart() {
  cartOverlay.classList.add('active');
  cartDrawer.classList.add('active');
  document.body.style.overflow = "hidden"; // Prevent scrolling
}
function closeCart() {
  cartOverlay.classList.remove('active');
  cartDrawer.classList.remove('active');
  document.body.style.overflow = "auto";
}

cartIcon.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// --- Checkout Modal ---
checkoutBtn.addEventListener('click', () => {
  closeCart();
  setTimeout(openCheckout, 400); // Wait for cart animation
});

function openCheckout() {
  checkoutModal.classList.add('active');
  document.body.style.overflow = "hidden";
  checkoutItemsList.innerHTML = cart.map(item => `
    <div class="c-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="c-item-info">
        <h4>${item.name}</h4>
        <p>Qty: ${item.quantity}</p>
        <p style="font-weight: 600; margin-top:0.4rem; color: #111">₹${(item.price * item.quantity).toLocaleString()}</p>
      </div>
    </div>
  `).join('');
  checkoutModalTotal.textContent = cartTotalPrice.textContent;
}

closeCheckoutBtn.addEventListener('click', () => {
  checkoutModal.classList.remove('active');
  document.body.style.overflow = "auto";
});

checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Extract form data
  const formData = new FormData(checkoutForm);
  const orderDetails = Object.fromEntries(formData.entries());
  
  // Add cart info
  orderDetails.cart = cart;
  
  // Calculate total amount
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  orderDetails.amount = totalAmount;

  if (orderDetails.paymentMethod === 'upi') {
      // Direct UPI Integration
      
      // IMPORTANT: The Shop Owner's UPI ID. 
      // You must change this to your actual UPI ID (e.g. 9876543210@paytm)
      const shopUpiID = "rishalk567@oksbi"; 
      const shopName = "Loomi Store";
      const upiURL = `upi://pay?pa=${shopUpiID}&pn=${encodeURIComponent(shopName)}&am=${totalAmount}&cu=INR`;

      const upiOverlay = document.createElement("div");
      upiOverlay.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:flex;justify-content:center;align-items:center;";
      upiOverlay.innerHTML = `
        <div style="background:#fff;padding:2rem;border-radius:12px;text-align:center;max-width:400px;width:90%;">
           <h3 style="margin-bottom:1rem;color:#111;">Pay via UPI</h3>
           <p style="color:#666;font-size:0.9rem;margin-bottom:1rem;">Amount to pay: <b style="color:#111;font-size:1.1rem">₹${totalAmount}</b></p>
           
           <div id="qrcode" style="display:flex;justify-content:center;margin-bottom:1rem;">
               <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiURL)}" width="150" height="150" alt="UPI QR Code" />
           </div>
           <p style="color:#555;font-size:0.8rem;margin-bottom:1rem;">Scan QR code or click the button below from your mobile.</p>

           <a href="${upiURL}" style="display:block;background:#28a745;color:#fff;padding:10px;text-decoration:none;border-radius:6px;font-weight:600;margin-bottom:1.5rem;">📱 Open GPay / Paytm</a>
           
           <div style="text-align:left;border-top:1px solid #ddd;padding-top:1rem;">
               <label style="display:block;font-size:0.85rem;color:#333;margin-bottom:0.5rem;font-weight:600">Enter 12-Digit Transaction (UTR) ID after paying:</label>
               <input type="text" id="upi-utr" placeholder="e.g. 312345678901" required style="width:100%;padding:0.75rem;border:1px solid #ccc;border-radius:4px;margin-bottom:1rem;box-sizing:border-box;">
               <div style="display:flex;gap:10px;">
                   <button type="button" onclick="document.body.removeChild(document.getElementById('upi-overlay'))" style="flex:1;background:#ccc;color:#333;border:none;padding:0.8rem;border-radius:4px;cursor:pointer;">Cancel</button>
                   <button type="button" id="confirm-upi-btn" style="flex:2;background:#111;color:#fff;border:none;padding:0.8rem;border-radius:4px;cursor:pointer;font-weight:600;">Confirm Payment</button>
               </div>
           </div>
        </div>
      `;
      upiOverlay.id = "upi-overlay";
      document.body.appendChild(upiOverlay);

      document.getElementById('confirm-upi-btn').addEventListener('click', async () => {
          const utr = document.getElementById('upi-utr').value.trim();
          if(utr.length < 8) {
              alert("Please enter a valid Transaction/UTR ID.");
              return;
          }
          
          document.body.removeChild(upiOverlay);
          
          orderDetails.payment_utr = utr;
          orderDetails.paymentStatus = "Paid (Pending Verification)";
          
          await submitOrderToBackend(orderDetails);
      });
      
  } else {
      // Cash on Delivery
      await submitOrderToBackend(orderDetails);
  }
});

async function submitOrderToBackend(orderDetails) {
    try {
        const response = await fetch('/place-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderDetails)
        });
        
        const result = await response.json();
        
        if (result.status === "success") {
            const confirmModal = document.getElementById('confirm-modal');
            if (confirmModal) {
                confirmModal.classList.add('active');
            }

            cart = [];
            updateCart();
            checkoutModal.classList.remove('active');
            checkoutForm.reset();
        } else {
            alert('Failed to place order. Please try again.');
        }
    } catch (err) {
        console.error("Checkout Error:", err);
        alert('An error occurred during checkout. Please check your connection or try again later.');
    }
}

const closeConfirmBtn = document.getElementById('close-confirm');
if (closeConfirmBtn) {
  closeConfirmBtn.addEventListener('click', () => {
    document.getElementById('confirm-modal').classList.remove('active');
    document.body.style.overflow = "auto";
  });
}


// --- GSAP Scroll Animations ---
function initGSAP() {
  if (typeof gsap === 'undefined') return;

  // Hero section entry
  gsap.from(".hero-content > *", {
    y: 40, opacity: 0, duration: 1.2, stagger: 0.2, ease: "power3.out", delay: 0.2
  });

  // Shop items staggered fade up
  gsap.from(".product-card", {
    y: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out",
    scrollTrigger: {
      trigger: "#shop",
      start: "top 75%"
    }
  });

  // About text slide up
  gsap.from(".about-content", {
    y: 50, opacity: 0, duration: 1, ease: "power3.out",
    scrollTrigger: { trigger: "#about", start: "top 75%" }
  });

  // Features staggered icons
  gsap.from(".feature-card", {
    y: 40, opacity: 0, duration: 0.8, stagger: 0.2, ease: "power2.out",
    scrollTrigger: { trigger: "#features", start: "top 80%" }
  });
}
