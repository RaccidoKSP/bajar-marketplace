// BAJAR - Product Page JavaScript

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

// Change main image in gallery
function changeMainImage(thumbnailSrc) {
    const mainImage = document.getElementById('mainGalleryImage');
    if (mainImage) {
        mainImage.src = thumbnailSrc;
        
        // Update active thumbnail
        const thumbnails = document.querySelectorAll('.thumbnail-image');
        thumbnails.forEach(thumb => {
            if (thumb.src === thumbnailSrc) {
                thumb.classList.add('active');
            } else {
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

// Close image modal
function closeImageModal() {
    const imageModal = document.getElementById('imageModal');
    imageModal.style.display = 'none';
}

// Handle delivery order
function handleDeliveryOrder() {
    alert('आपने अपना भारतीय पासपोर्ट सत्यापित नहीं किया है।');
}

// Contact seller
function contactSeller(phone, name) {
    if (confirm(`क्या आप ${name} से संपर्क करना चाहते हैं?\nफोन: ${phone}`)) {
        window.location.href = `tel:${phone}`;
    }
}

// Share product
function shareProduct() {
    const url = window.location.href;
    const title = document.getElementById('productTitle').textContent;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('लिंक कॉपी किया गया! अब आप इसे शेयर कर सकते हैं।');
        });
    }
}

// Hide page loader
function hidePageLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 300);
    }
}

// Load product data
async function loadProduct() {
    try {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        console.log('🔍 Loading product ID:', productId);
        
        if (!productId) {
            console.error('❌ No product ID in URL');
            alert('उत्पाद नहीं मिला\n\nProduct ID not found in URL');
            window.location.href = 'index.html';
            return;
        }
        
        // Fetch product data from API
        const apiUrl = `${APIClient.baseURL}/items/${productId}`;
        console.log('📡 Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('📥 Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Data received:', data);
        
        const item = data.item || data;
        
        if (!item || !item.id) {
            throw new Error('Invalid item data structure');
        }
        
        console.log('✅ Product loaded successfully:', item.title);
        
        // Update page title
        document.title = `${item.title} - BAJAR`;
        
        // Display product details
        displayProductDetails(item);
        
        // Hide loader after successful load
        hidePageLoader();
        
    } catch (error) {
        console.error('❌ Error loading product:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        
        // Hide loader even on error
        hidePageLoader();
        
        alert(`उत्पाद लोड करने में त्रुटि।\n\nError: ${error.message}\n\nकृपया पुनः प्रयास करें।`);
        // Uncomment to redirect on error
        // window.location.href = 'index.html';
    }
}

// Display product details
function displayProductDetails(item) {
    // Set title
    document.getElementById('productTitle').textContent = item.title;
    
    // Set price
    document.getElementById('productPrice').textContent = `₹${item.price.toLocaleString('en-IN')}`;
    
    // Set meta information
    const metaHTML = `
        <span class="item-condition">${formatCondition(item.condition)}</span>
        <span>📏 आकार: ${item.size}</span>
        <span>📍 ${item.location}</span>
        <span>👁️ ${item.views || 0} व्यूज</span>
    `;
    document.getElementById('productMeta').innerHTML = metaHTML;
    
    // Set description
    document.getElementById('productDescription').textContent = item.description;
    
    // Set seller info
    const sellerHTML = `
        <p><strong>नाम:</strong> ${item.seller}</p>
        <p><strong>संपर्क:</strong> <a href="tel:${item.phone}">${item.phone}</a></p>
    `;
    document.getElementById('sellerInfo').innerHTML = sellerHTML;
    
    // Set contact button action
    const contactBtn = document.getElementById('contactSellerBtn');
    contactBtn.onclick = () => contactSeller(item.phone, item.seller);
    
    // Display images
    displayProductImages(item);
}

// Display product images
function displayProductImages(item) {
    const imagesContainer = document.getElementById('productImages');
    
    // Check if multiple images exist
    if (item.imageFiles && item.imageFiles.length > 1) {
        // Multiple images - create gallery
        const mainImageUrl = item.imageFiles[0].startsWith('/uploads') 
            ? APIClient.getImageUrl(item.imageFiles[0]) 
            : item.imageFiles[0];
        
        let galleryHTML = `
            <div class="main-image-container">
                <img id="mainGalleryImage" 
                     src="${mainImageUrl}" 
                     alt="${item.title}" 
                     onclick="openImageFullscreen('${mainImageUrl}')"
                     title="बड़ा करने के लिए क्लिक करें">
            </div>
            <div class="thumbnail-gallery">
        `;
        
        item.imageFiles.forEach((img, index) => {
            const imgUrl = img.startsWith('/uploads') ? APIClient.getImageUrl(img) : img;
            galleryHTML += `
                <img src="${imgUrl}" 
                     alt="फोटो ${index + 1}" 
                     onclick="changeMainImage('${imgUrl}')"
                     class="thumbnail-image ${index === 0 ? 'active' : ''}">
            `;
        });
        
        galleryHTML += '</div>';
        imagesContainer.innerHTML = galleryHTML;
        
    } else {
        // Single image
        const imageUrl = item.image.startsWith('/uploads') 
            ? APIClient.getImageUrl(item.image) 
            : item.image;
        const isRealImage = item.image.startsWith('data:image') || 
                           item.image.startsWith('/uploads') || 
                           item.image.startsWith('http');
        
        if (isRealImage) {
            imagesContainer.innerHTML = `
                <div class="main-image-container">
                    <img src="${imageUrl}" 
                         alt="${item.title}" 
                         onclick="openImageFullscreen('${imageUrl}')"
                         title="बड़ा करने के लिए क्लिक करें">
                </div>
            `;
        } else {
            // Emoji or text image
            imagesContainer.innerHTML = `
                <div class="main-image-container" style="font-size: 10rem; text-align: center; padding: 3rem; background: #f5f5f5; border-radius: 15px;">
                    ${item.image}
                </div>
            `;
        }
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const imageModal = document.getElementById('imageModal');
    if (event.target === imageModal) {
        closeImageModal();
    }
};

// Load product when page loads
document.addEventListener('DOMContentLoaded', loadProduct);
