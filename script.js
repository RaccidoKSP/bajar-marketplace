// BAJAR - Indian Resale Marketplace JavaScript

// Smooth scroll functionality for mouse wheel
(function() {
    let scrolling = false;
    let scrollTarget = window.pageYOffset;
    
    // Intercept wheel events
    window.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        // Adjust scroll speed (lower value = slower scroll)
        const scrollSpeed = 0.3; // Change this value: 0.1 = very slow, 0.5 = medium, 1.0 = normal
        scrollTarget += e.deltaY * scrollSpeed;
        
        // Limit scroll target to valid range
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        scrollTarget = Math.max(0, Math.min(scrollTarget, maxScroll));
        
        if (!scrolling) {
            smoothScroll();
        }
    }, { passive: false });
    
    // Smooth scroll animation
    function smoothScroll() {
        scrolling = true;
        const currentScroll = window.pageYOffset;
        const diff = scrollTarget - currentScroll;
        
        // Easing factor (higher = faster easing)
        const ease = 0.1;
        
        if (Math.abs(diff) > 0.5) {
            window.scrollTo(0, currentScroll + diff * ease);
            requestAnimationFrame(smoothScroll);
        } else {
            window.scrollTo(0, scrollTarget);
            scrolling = false;
        }
    }
})();

// Initialize items (will be loaded from server)
let items = [
    {
        id: 1,
        title: "iPhone 13 Pro - 128GB",
        category: "electronics",
        price: 65000,
        condition: "like-new",
        description: "Excellent condition iPhone 13 Pro in Sierra Blue. Battery health 95%. All accessories included with original box. No scratches or dents.",
        location: "Mumbai, Maharashtra",
        seller: "Raj Kumar",
        phone: "9876543210",
        image: "📱",
        views: 245
    },
    {
        id: 999,
        title: "📰 India Today - Latest News & Updates",
        category: "ad",
        price: 0,
        condition: "new",
        description: "Stay informed with India Today! Get the latest breaking news, politics, sports, entertainment, and more. Click to visit India Today.",
        location: "India",
        seller: "India Today",
        phone: "0000000000",
        image: "📰",
        isAd: true,
        adUrl: "https://www.indiatoday.in/",
        views: 9999
    },
    {
        id: 2,
        title: "Designer Saree Collection",
        category: "fashion",
        price: 3500,
        condition: "new",
        description: "Beautiful silk saree with intricate embroidery work. Perfect for weddings and festivals. Worn only once. Comes with matching blouse piece.",
        location: "Delhi, Delhi",
        seller: "Priya Sharma",
        phone: "9876543211",
        image: "👗",
        views: 189
    },
    {
        id: 3,
        title: "Royal Enfield Classic 350",
        category: "vehicles",
        price: 125000,
        condition: "good",
        description: "Well maintained Royal Enfield Classic 350 (2020 model). Single owner, all documents clear. Regular service records available. Runs smoothly.",
        location: "Bangalore, Karnataka",
        seller: "Amit Patel",
        phone: "9876543212",
        image: "🚗",
        views: 512
    },
    {
        id: 4,
        title: "Teak Wood Dining Table",
        category: "home",
        price: 18000,
        condition: "good",
        description: "Solid teak wood dining table with 6 chairs. Beautiful craftsmanship. Minor wear on chairs. Perfect for Indian homes. Can seat 6-8 people comfortably.",
        location: "Pune, Maharashtra",
        seller: "Neha Gupta",
        phone: "9876543213",
        image: "🏠",
        views: 156
    },
    {
        id: 5,
        title: "NCERT Books Class 12 - Complete Set",
        category: "books",
        price: 1200,
        condition: "like-new",
        description: "Complete set of NCERT books for Class 12. All subjects included. Minimal highlighting. Perfect for CBSE students. Some handwritten notes included.",
        location: "Jaipur, Rajasthan",
        seller: "Vikram Singh",
        phone: "9876543214",
        image: "📚",
        views: 98
    },
    {
        id: 6,
        title: "Nike Air Jordan Sneakers",
        category: "fashion",
        price: 8500,
        condition: "like-new",
        description: "Authentic Nike Air Jordan 1 Mid in size 9. Worn 3-4 times only. Original box and tags included. Great condition with minimal creasing.",
        location: "Hyderabad, Telangana",
        seller: "Arjun Reddy",
        phone: "9876543215",
        image: "👟",
        views: 321
    },
    {
        id: 7,
        title: "Breville Espresso Machine",
        category: "home",
        price: 12000,
        condition: "good",
        description: "Semi-automatic espresso machine in working condition. Makes excellent coffee. Includes milk frother. Regular descaling done. Minor cosmetic wear.",
        location: "Chennai, Tamil Nadu",
        seller: "Lakshmi Iyer",
        phone: "9876543216",
        image: "☕",
        views: 203
    },
    {
        id: 8,
        title: "Gaming Laptop - ASUS ROG",
        category: "electronics",
        price: 75000,
        condition: "good",
        description: "ASUS ROG Strix G15 with RTX 3060, i7-11th gen, 16GB RAM, 512GB SSD. Perfect for gaming and video editing. Battery backup 3-4 hours. Small dent on back cover.",
        location: "Kolkata, West Bengal",
        seller: "Sanjay Das",
        phone: "9876543217",
        image: "💻",
        views: 467
    }
];

// DOM Elements
const postAdBtn = document.getElementById('postAdBtn');
const loginBtn = document.getElementById('loginBtn');
const postAdModal = document.getElementById('postAdModal');
const itemDetailModal = document.getElementById('itemDetailModal');
const postAdForm = document.getElementById('postAdForm');
const itemsGrid = document.getElementById('itemsGrid');
const searchBar = document.getElementById('searchBar');
const categoryCards = document.querySelectorAll('.category-card');
const categoryBtns = document.querySelectorAll('.category-btn');

// Show loading screen
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    showLoadingScreen();
    setupEventListeners();
    await loadItemsFromServer();
    
    // Set "All" category as active by default
    const allBtn = document.querySelector('.category-btn[data-category=""]');
    if (allBtn) {
        allBtn.classList.add('active');
    }
});

// Load items from server
async function loadItemsFromServer() {
    try {
        // Check if server is available
        const serverAvailable = await APIClient.checkServerHealth();
        
        if (serverAvailable) {
            // Load from server
            items = await APIClient.getAllItems();
            displayItems(items, true);
        } else {
            // Fallback to database.json if server is not available
            console.log('Server not available, loading from database.json');
            const response = await fetch('database.json');
            const data = await response.json();
            items = data.items;
            displayItems(items, true);
        }
    } catch (error) {
        console.error('Error loading items:', error);
        // Use default items if both server and database.json fail
        displayItems(items, true);
        hideLoadingScreen();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Post Ad Button
    postAdBtn.addEventListener('click', () => {
        postAdModal.style.display = 'block';
        // Auto-fill phone number with +92 022 #####
        const phoneInput = document.getElementById('sellerPhone');
        if (!phoneInput.value) {
            phoneInput.value = '+92 022 #####';
        }
        // Auto-fill location with Mumbai or other Indian cities
        const locationInput = document.getElementById('itemLocation');
        if (!locationInput.value) {
            // Array of Indian cities to randomly choose from
            const indianCities = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur'];
            // Use Mumbai most of the time (80% chance), other cities 20%
            const randomCity = Math.random() < 0.8 ? 'Mumbai' : indianCities[Math.floor(Math.random() * indianCities.length)];
            locationInput.value = randomCity;
        }
        // Auto-fill seller name with random Indian name in Hindi
        autoFillSellerName();
    });

    // Login Button
    loginBtn.addEventListener('click', () => {
        alert('लॉगिन करने के लिए, कृपया अपने भारतीय पासपोर्ट की फोटो संलग्न करें।');
    });

    // Close modals
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Post Ad Form Submit
    postAdForm.addEventListener('submit', handlePostAd);

    // Image upload preview
    const imageInput = document.getElementById('itemImages');
    imageInput.addEventListener('change', handleImagePreview);

    // Search functionality
    searchBar.addEventListener('input', handleSearch);

    // Category filter
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            filterByCategory(category);
        });
    });
    
    // Header category buttons
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Filter items
            if (category === '') {
                displayItems(items);
                hideCommissionBanner();
            } else {
                filterByCategory(category);
            }
        });
    });
}

// Handle image preview
function handleImagePreview(e) {
    const files = e.target.files;
    const previewContainer = document.getElementById('imagePreview');
    previewContainer.innerHTML = '';
    
    if (files.length > 5) {
        alert('अधिकतम 5 फोटो! केवल पहले 5 का चयन किया गया।');
    }
    
    const filesToShow = Math.min(files.length, 5);
    
    for (let i = 0; i < filesToShow; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = function(event) {
            const imgContainer = document.createElement('div');
            imgContainer.style.cssText = 'display: inline-block; margin: 5px; position: relative;';
            imgContainer.innerHTML = `
                <img src="${event.target.result}" alt="Preview ${i + 1}" style="max-width: 150px; max-height: 150px; border-radius: 8px; object-fit: cover; border: 2px solid #E0E0E0;">
                <div style="position: absolute; top: 5px; left: 5px; background: ${i === 0 ? '#FF6B35' : '#27AE60'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">
                    ${i === 0 ? 'मुख्य' : `फोटो ${i + 1}`}
                </div>
            `;
            previewContainer.appendChild(imgContainer);
        };
        reader.readAsDataURL(file);
    }
}

// Get original image (full size)
function getOriginalImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Keep original dimensions but limit to reasonable size
                const maxWidth = 1920;
                const maxHeight = 1920;
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = (height / width) * maxWidth;
                        width = maxWidth;
                    } else {
                        width = (width / height) * maxHeight;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Resize image to standard size (400x300)
function resizeImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set standard dimensions
                canvas.width = 400;
                canvas.height = 300;
                
                // Calculate scaling to cover the canvas
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;
                
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                
                // Convert to base64
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Shuffle array function (Fisher-Yates shuffle algorithm)
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy to avoid mutating the original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Create ad card for India Today
function createAdCard() {
    return {
        id: 999,
        title: "📰 India Today - ताजा समाचार और अपडेट",
        category: "ad",
        price: 0,
        condition: "new",
        description: "India Today के साथ सूचित रहें! नवीनतम समाचार, राजनीति, खेल, मनोरंजन और बहुत कुछ प्राप्त करें। India Today पर जाने के लिए क्लिक करें।",
        location: "भारत",
        seller: "India Today",
        phone: "0000000000",
        image: "📰",
        isAd: true,
        adUrl: "https://www.indiatoday.in/",
        views: 9999
    };
}

// Display items in the grid
function displayItems(itemsToDisplay, animate = true) {
    itemsGrid.innerHTML = '';
    
    if (itemsToDisplay.length === 0) {
        itemsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #7F8C8D; padding: 2rem;">कोई वस्तु नहीं मिली। अपनी खोज या फिल्टर को समायोजित करने का प्रयास करें।</p>';
        hideLoadingScreen();
        hideCommissionBanner();
        return;
    }

    // Shuffle items before displaying to ensure random order on each page load
    const shuffledItems = shuffleArray(itemsToDisplay);
    
    // Insert ad cards every 8-12 items (less frequent)
    const itemsWithAds = [];
    let adCounter = 0;
    
    shuffledItems.forEach((item, index) => {
        itemsWithAds.push(item);
        
        // Insert ad after every 8-12 items (random)
        const nextAdPosition = 8 + Math.floor(Math.random() * 5); // 8, 9, 10, 11, or 12
        if ((index + 1) % nextAdPosition === 0 && index < shuffledItems.length - 1) {
            itemsWithAds.push(createAdCard());
            adCounter++;
        }
    });
    
    // Add one ad only if there are more than 5 items and no ads were added
    if (adCounter === 0 && shuffledItems.length > 5) {
        const randomPosition = 3 + Math.floor(Math.random() * Math.min(5, shuffledItems.length - 3));
        itemsWithAds.splice(randomPosition, 0, createAdCard());
    }
    
    const finalItems = itemsWithAds;

    if (animate) {
        // Show items with sequential animation
        finalItems.forEach((item, index) => {
            setTimeout(() => {
                const itemCard = createItemCard(item);
                // Random delay between 0.2s and 4s
                const randomDelay = 200 + Math.random() * 3800;
                itemCard.style.animationDelay = `${randomDelay}ms`;
                itemsGrid.appendChild(itemCard);
                
                // Hide loading screen after last item
                if (index === finalItems.length - 1) {
                    setTimeout(() => {
                        hideLoadingScreen();
                    }, randomDelay + 500);
                }
            }, 50 * index);
        });
    } else {
        finalItems.forEach(item => {
            const itemCard = createItemCard(item);
            itemsGrid.appendChild(itemCard);
        });
        hideLoadingScreen();
    }
}

// Create item card element
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    // Check if this is an ad item
    if (item.isAd) {
        card.classList.add('ad-card');
        card.innerHTML = `
            <div onclick="window.open('${item.adUrl}', '_blank')" style="cursor: pointer; position: relative;">
                <div class="ad-badge">विज्ञापन</div>
                <div class="item-image" style="font-size: 5rem; background: linear-gradient(135deg, #FF6B35 0%, #F7B731 100%); color: white;">${item.image}</div>
                <div class="item-details">
                    <h4 class="item-title" style="color: #FF6B35;">${item.title}</h4>
                    <div class="item-price" style="font-size: 1rem; color: #27AE60;">निःशुल्क - यहां जाने के लिए क्लिक करें!</div>
                    <div class="item-location">📍 ${item.location}</div>
                    <div class="item-views">👁️ ${item.views || 0} व्यूज</div>
                </div>
            </div>
            <div class="item-actions-card" style="background: linear-gradient(135deg, #FF6B35 0%, #F7B731 100%);">
                <button class="btn-ad" onclick="event.stopPropagation(); window.open('${item.adUrl}', '_blank')" style="width: 100%; background: white; color: #FF6B35; border: none; padding: 0.75rem; border-radius: 8px; font-weight: 700; cursor: pointer;">
                    🌐 India Today पर जाएं
                </button>
            </div>
        `;
        return card;
    }
    
    // Regular item card
    // Get image URL (either from server or base64 or emoji)
    const imageUrl = item.image.startsWith('/uploads') ? APIClient.getImageUrl(item.image) : item.image;
    const fullImage = imageUrl;
    
    const imageContent = (item.image.startsWith('data:image') || item.image.startsWith('/uploads') || item.image.startsWith('http'))
        ? `<img src="${imageUrl}" alt="${item.title}" onclick="event.stopPropagation(); openImageFullscreen('${fullImage}')" style="width: 100%; height: 220px; object-fit: contain; background: #f5f5f5; cursor: zoom-in;" title="बड़ा करने के लिए क्लिक करें">` 
        : `<div class="item-image">${item.image}</div>`;
    
    card.innerHTML = `
        <div onclick="window.location.href='product.html?id=${item.id}'" style="cursor: pointer;">
            ${imageContent}
            <div class="item-details">
                <h4 class="item-title">${item.title}</h4>
                <div class="item-price">₹${item.price.toLocaleString('en-IN')}</div>
                <div class="item-location">📍 ${item.location}</div>
                <div class="item-views">👁️ ${item.views || 0} व्यूज</div>
                <span class="item-condition">${formatCondition(item.condition)}</span>
            </div>
        </div>
        <div class="item-actions-card">
            <button class="btn-delivery" onclick="event.stopPropagation(); handleDeliveryOrder(${item.id})">
                🚚 डिलीवरी के साथ खरीदें
            </button>
        </div>
    `;
    
    return card;
}

// Format condition text
function formatCondition(condition) {
    const conditionMap = {
        'new': 'बिल्कुल नया',
        'like-new': 'नए जैसा',
        'good': 'अच्छा',
        'fair': 'ठीक-ठाक',
        'poor': 'पुर्जों के लिए'
    };
    return conditionMap[condition] || condition;
}

// Handle delivery order
function handleDeliveryOrder(itemId) {
    alert('आपने अपना भारतीय पासपोर्ट सत्यापित नहीं किया है।');
}

// Show passport alert for sidebar items
function showPassportAlert() {
    alert('आपने अपना भारतीय पासपोर्ट सत्यापित नहीं किया है।');
}

// Change main image in gallery
function changeMainImage(thumbnailSrc, originalSrc) {
    const mainImage = document.getElementById('mainGalleryImage');
    if (mainImage) {
        mainImage.src = thumbnailSrc;
        mainImage.dataset.original = originalSrc;
        
        // Update active thumbnail
        const thumbnails = document.querySelectorAll('.thumbnail-image');
        thumbnails.forEach(thumb => {
            if (thumb.src === thumbnailSrc) {
                thumb.style.border = '3px solid #FF6B35';
                thumb.classList.add('active');
            } else {
                thumb.style.border = '3px solid #E0E0E0';
                thumb.classList.remove('active');
            }
        });
    }
}

// Open image in fullscreen
function openImageFullscreen(imageSrc) {
    const imageModal = document.getElementById('imageModal');
    const fullscreenImage = document.getElementById('fullscreenImage');
    
    fullscreenImage.src = imageSrc;
    imageModal.style.display = 'flex';
}

// Show item detail modal
function showItemDetail(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    // If it's an ad, just open the URL
    if (item.isAd) {
        window.open(item.adUrl, '_blank');
        return;
    }
    
    const detailContent = document.getElementById('itemDetailContent');
    
    // Create image gallery if multiple images exist
    let imageGalleryHTML = '';
    
    if (item.imageFiles && item.imageFiles.length > 1) {
        // Multiple images - create gallery
        const mainImageUrl = item.imageFiles[0].startsWith('/uploads') ? APIClient.getImageUrl(item.imageFiles[0]) : item.imageFiles[0];
        
        imageGalleryHTML = `
            <div class="image-gallery">
                <div class="main-image-container">
                    <img id="mainGalleryImage" src="${mainImageUrl}" alt="${item.title}" 
                         onclick="openImageFullscreen(this.src)" 
                         data-original="${mainImageUrl}"
                         style="width: 100%; max-height: 400px; object-fit: contain; border-radius: 10px; cursor: zoom-in; background: #f5f5f5;" 
                         title="बड़ा करने के लिए क्लिक करें">
                </div>
                <div class="thumbnail-gallery">
                    ${item.imageFiles.map((img, index) => {
                        const imgUrl = img.startsWith('/uploads') ? APIClient.getImageUrl(img) : img;
                        return `
                            <img src="${imgUrl}" alt="फोटो ${index + 1}" 
                                 onclick="changeMainImage('${imgUrl}', '${imgUrl}')"
                                 class="thumbnail-image ${index === 0 ? 'active' : ''}"
                                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer; margin: 5px; border: 3px solid ${index === 0 ? '#FF6B35' : '#E0E0E0'};">
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    } else {
        // Single image
        const imageUrl = item.image.startsWith('/uploads') ? APIClient.getImageUrl(item.image) : item.image;
        const isRealImage = item.image.startsWith('data:image') || item.image.startsWith('/uploads') || item.image.startsWith('http');
        
        imageGalleryHTML = isRealImage
            ? `<img src="${imageUrl}" alt="${item.title}" onclick="openImageFullscreen('${imageUrl}')" style="width: 100%; max-height: 400px; object-fit: contain; border-radius: 10px; cursor: zoom-in; background: #f5f5f5;" title="बड़ा करने के लिए क्लिक करें">` 
            : `<div class="item-detail-image">${item.image}</div>`;
    }
    
    detailContent.innerHTML = `
        <div class="item-detail-view">
            ${imageGalleryHTML}
            <h2>${item.title}</h2>
            <div class="item-detail-price">₹${item.price.toLocaleString('en-IN')}</div>
            <div class="item-detail-meta">
                <span class="item-condition">${formatCondition(item.condition)}</span>
                <span style="color: #7F8C8D; margin-left: 1rem;">📏 आकार: ${item.size}</span>
                <span style="color: #7F8C8D; margin-left: 1rem;">📍 ${item.location}</span>
                <span style="color: #7F8C8D; margin-left: 1rem;">👁️ ${item.views || 0} व्यूज</span>
            </div>
            <div class="item-detail-description">
                <h3>विवरण</h3>
                <p>${item.description}</p>
            </div>
            <div class="item-seller-info">
                <h3>विक्रेता की जानकारी</h3>
                <p><strong>नाम:</strong> ${item.seller}</p>
                <p><strong>संपर्क:</strong> <a href="tel:${item.phone}">${item.phone}</a></p>
            </div>
            <div class="item-actions">
                <button class="btn-delivery-large" onclick="handleDeliveryOrder(${item.id})">
                    🚚 BOJAR डिलीवरी के साथ खरीदें
                </button>
                <button class="btn-primary" onclick="contactSeller('${item.phone}', '${item.seller}')">
                    📞 विक्रेता से संपर्क करें
                </button>
                <button class="btn-secondary" onclick="shareItem(${item.id})">
                    🔗 शेयर करें
                </button>
            </div>
        </div>
    `;
    
    itemDetailModal.style.display = 'block';
}

// Handle post ad form submission
async function handlePostAd(e) {
    e.preventDefault();
    
    showNotification('विज्ञापन अपलोड हो रहा है... कृपया प्रतीक्षा करें ⏳');
    
    try {
        // Get form data
        const title = document.getElementById('itemTitle').value;
        const description = document.getElementById('itemDescription').value;
        const location = document.getElementById('itemLocation').value;
        const seller = document.getElementById('sellerName').value;
        
        // Step 1: Translate text to Hindi
        showNotification('पाठ का हिंदी में अनुवाद हो रहा है... ⏳');
        
        const [translatedTitle, translatedDescription, translatedLocation, translatedSeller] = await Promise.all([
            TranslationService.translateToHindi(title),
            TranslationService.translateToHindi(description),
            TranslationService.translateToHindi(location),
            TranslationService.translateToHindi(seller)
        ]);
        
        // Step 2: Upload images
        showNotification('चित्र अपलोड हो रहे हैं... ⏳');
        
        const imageFiles = document.getElementById('itemImages').files;
        let imageUrls = [];
        
        if (imageFiles.length > 0) {
            // Upload images to server
            const filesToProcess = Math.min(imageFiles.length, 5);
            const filesToUpload = Array.from(imageFiles).slice(0, filesToProcess);
            
            try {
                imageUrls = await APIClient.uploadImages(filesToUpload);
            } catch (error) {
                console.error('Error uploading images:', error);
                showNotification('चित्र अपलोड करने में त्रुटि। कृपया पुनः प्रयास करें।');
                return;
            }
        } else {
            // Use category icon if no images
            const icon = getCategoryIcon(document.getElementById('itemCategory').value);
            imageUrls.push(icon);
        }
        
        // Step 3: Create item with translated text
        const newItemData = {
            title: translatedTitle,
            category: document.getElementById('itemCategory').value,
            price: parseInt(document.getElementById('itemPrice').value),
            condition: document.getElementById('itemCondition').value,
            size: document.getElementById('itemSize').value,
            description: translatedDescription,
            location: translatedLocation,
            seller: translatedSeller,
            phone: document.getElementById('sellerPhone').value,
            views: parseInt(document.getElementById('itemViews').value) || 0,
            image: imageUrls[0], // Main image
            imageFiles: imageUrls, // All image URLs
            // Store original text for reference
            originalTitle: title,
            originalDescription: description,
            originalLocation: location,
            originalSeller: seller
        };
        
        // Create item on server
        const newItem = await APIClient.createItem(newItemData);
        
        // Add to local items array
        items.unshift(newItem);
        
        // Refresh display without animation for immediate feedback
        displayItems(items, false);
        
        // Close modal and reset form
        postAdModal.style.display = 'none';
        postAdForm.reset();
        document.getElementById('imagePreview').innerHTML = '';
        
        // Show success message
        showNotification('आपका विज्ञापन सफलतापूर्वक पोस्ट किया गया! 🎉');
    } catch (error) {
        console.error('Error creating item:', error);
        showNotification('विज्ञापन पोस्ट करने में त्रुटि। कृपया पुनः प्रयास करें।');
    }
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'electronics': '📱',
        'fashion': '👗',
        'vehicles': '🚗',
        'real-estate': '🏘️'
    };
    return icons[category] || '📦';
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm === '') {
        displayItems(items, false);
        hideCommissionBanner();
        return;
    }
    
    const filteredItems = items.filter(item => {
        return item.title.toLowerCase().includes(searchTerm) ||
               item.description.toLowerCase().includes(searchTerm) ||
               item.location.toLowerCase().includes(searchTerm) ||
               item.category.toLowerCase().includes(searchTerm) ||
               item.seller.toLowerCase().includes(searchTerm);
    });
    
    displayItems(filteredItems, false);
    hideCommissionBanner();
}

// Filter by category
function filterByCategory(category) {
    // Check if real-estate category is selected
    if (category === 'real-estate') {
        alert('BAJAR के पास अभी तक भारतीय घरों को सूचीबद्ध करने का लाइसेंस नहीं है, कृपया प्रतीक्षा करें। हम केवल 2 महीने से काम कर रहे हैं।');
        return;
    }
    
    showLoadingScreen();
    const filteredItems = items.filter(item => item.category === category);
    
    // Add small delay before displaying to show loading
    setTimeout(() => {
        displayItems(filteredItems, true);
        
        // Show commission message for electronics and vehicles categories
        if (category === 'electronics' || category === 'vehicles') {
            showCommissionBanner();
        } else {
            hideCommissionBanner();
        }
    }, 300);
    
    // Scroll to items
    document.querySelector('.featured-items').scrollIntoView({ behavior: 'smooth' });
}

// Contact seller
function contactSeller(phone, name) {
    alert('आपने अपना भारतीय पासपोर्ट सत्यापित नहीं किया है।');
}

// Share item
function shareItem(itemId) {
    const item = items.find(i => i.id === itemId);
    const shareText = `Check out this item on BAJAR: ${item.title} - ₹${item.price.toLocaleString('en-IN')}`;
    
    if (navigator.share) {
        navigator.share({
            title: item.title,
            text: shareText,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('लिंक क्लिपबोर्ड पर कॉपी किया गया!');
        });
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #27AE60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show commission banner for vehicles and electronics
function showCommissionBanner() {
    // Remove existing banner if any
    hideCommissionBanner();
    
    const banner = document.createElement('div');
    banner.id = 'commissionBanner';
    banner.style.cssText = `
        background: linear-gradient(135deg, #FF6B35 0%, #F7B731 100%);
        color: white;
        padding: 1.5rem;
        text-align: center;
        font-size: 1.3rem;
        font-weight: 700;
        border-radius: 12px;
        margin-bottom: 2rem;
        box-shadow: 0 5px 20px rgba(255, 107, 53, 0.3);
        animation: slideInDown 0.5s ease;
        border: 3px solid #FF6B35;
    `;
    banner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
            <span style="font-size: 2rem;">⚠️</span>
            <span>ऑटोमोबाइल और इलेक्ट्रॉनिक्स की बिक्री पर कमीशन 2000 रुपये है</span>
            <span style="font-size: 2rem;">⚠️</span>
        </div>
    `;
    
    const featuredSection = document.querySelector('.featured-items');
    if (featuredSection) {
        featuredSection.insertBefore(banner, itemsGrid);
    }
}

// Hide commission banner
function hideCommissionBanner() {
    const existingBanner = document.getElementById('commissionBanner');
    if (existingBanner) {
        existingBanner.style.animation = 'slideOutUp 0.3s ease';
        setTimeout(() => existingBanner.remove(), 300);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes slideInDown {
        from {
            transform: translateY(-100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutUp {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-100px);
            opacity: 0;
        }
    }

    .item-detail-view {
        max-width: 100%;
    }

    .item-detail-image {
        font-size: 5rem;
        text-align: center;
        padding: 2rem;
        background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
        border-radius: 10px;
        margin-bottom: 1.5rem;
    }

    .item-detail-price {
        font-size: 2rem;
        font-weight: 700;
        color: #FF6B35;
        margin: 1rem 0;
    }

    .item-detail-meta {
        display: flex;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .item-detail-description,
    .item-seller-info {
        margin: 1.5rem 0;
    }

    .item-detail-description h3,
    .item-seller-info h3 {
        font-size: 1.2rem;
        margin-bottom: 0.8rem;
        color: #2C3E50;
    }

    .item-detail-description p,
    .item-seller-info p {
        color: #7F8C8D;
        line-height: 1.6;
        margin-bottom: 0.5rem;
    }

    .item-seller-info a {
        color: #FF6B35;
        text-decoration: none;
    }

    .item-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
    }

    .item-actions button {
        flex: 1;
    }
`;
document.head.appendChild(style);
