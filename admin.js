// BAJAR Admin Panel JavaScript

let items = [];
let filteredItems = [];
let itemToDelete = null;

// DOM Elements
const adsTableBody = document.getElementById('adsTableBody');
const adminSearch = document.getElementById('adminSearch');
const categoryFilter = document.getElementById('categoryFilter');
const sortBy = document.getElementById('sortBy');
const clearAllBtn = document.getElementById('clearAllBtn');
const generateItemsBtn = document.getElementById('generateItemsBtn');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const deleteMessage = document.getElementById('deleteMessage');
const totalAdsEl = document.getElementById('totalAds');
const todayAdsEl = document.getElementById('todayAds');
const categoriesCountEl = document.getElementById('categoriesCount');
const editModal = document.getElementById('editModal');
const editItemForm = document.getElementById('editItemForm');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadItems();
    displayItems();
    updateStats();
});

// Load items from server
async function loadItems() {
    try {
        const serverAvailable = await APIClient.checkServerHealth();
        
        if (serverAvailable) {
            items = await APIClient.getAllItems();
            filteredItems = [...items];
        } else {
            console.log('Server not available');
            items = [];
            filteredItems = [];
        }
    } catch (error) {
        console.error('Error loading items:', error);
        items = [];
        filteredItems = [];
    }
}

// Setup event listeners
function setupEventListeners() {
    adminSearch.addEventListener('input', handleFilter);
    categoryFilter.addEventListener('change', handleFilter);
    sortBy.addEventListener('change', handleSort);
    clearAllBtn.addEventListener('click', handleClearAll);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    cancelDeleteBtn.addEventListener('click', closeModal);
    editItemForm.addEventListener('submit', handleEditSubmit);
    
    // Close modal on outside click
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            closeModal();
        }
    });
    
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

// Display items in table
function displayItems() {
    adsTableBody.innerHTML = '';
    
    if (filteredItems.length === 0) {
        adsTableBody.innerHTML = `
            <tr>
                <td colspan="10">
                    <div class="empty-state">
                        <div class="empty-state-icon">📭</div>
                        <h3>कोई विज्ञापन नहीं</h3>
                        <p>विज्ञापन नहीं मिले या हटा दिए गए</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredItems.forEach(item => {
        const row = createTableRow(item);
        adsTableBody.appendChild(row);
    });
}

// Create table row
function createTableRow(item) {
    const row = document.createElement('tr');
    
    const imageUrl = item.image.startsWith('/uploads') ? APIClient.getImageUrl(item.image) : item.image;
    const isRealImage = item.image.startsWith('data:image') || item.image.startsWith('/uploads') || item.image.startsWith('http');
    
    const imageContent = isRealImage
        ? `<img src="${imageUrl}" alt="${item.title}" class="ad-image">` 
        : `<span class="ad-emoji">${item.image}</span>`;
    
    row.innerHTML = `
        <td class="ad-id">#${item.id}</td>
        <td>${imageContent}</td>
        <td><div class="ad-title" title="${item.title}">${item.title}</div></td>
        <td><span class="ad-category category-${item.category}">${formatCategory(item.category)}</span></td>
        <td class="ad-price">₹${item.price.toLocaleString('en-IN')}</td>
        <td class="ad-views">${item.views || 0}</td>
        <td><span class="ad-condition">${formatCondition(item.condition)}</span></td>
        <td class="ad-location">${item.location}</td>
        <td class="ad-seller">${item.seller}</td>
        <td class="ad-date">${formatDate(item.datePosted)}</td>
        <td>
            <button class="btn-edit" onclick="handleEdit(${item.id})">
                ✏️ संपादित करें
            </button>
            <button class="btn-delete" onclick="handleDelete(${item.id})">
                🗑️ हटाएं
            </button>
        </td>
    `;
    
    return row;
}

// Handle generate items - removed as parser was deleted

// Format category
function formatCategory(category) {
    const categoryMap = {
        'electronics': 'इलेक्ट्रॉनिक्स',
        'fashion': 'फैशन',
        'vehicles': 'वाहन',
        'real-estate': 'अचल संपत्ति'
    };
    return categoryMap[category] || category;
}

// Format condition
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

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'आज';
    if (diffDays === 1) return 'कल';
    if (diffDays < 7) return `${diffDays} दिन पहले`;
    
    return date.toLocaleDateString('hi-IN');
}

// Handle filter
function handleFilter() {
    const searchTerm = adminSearch.value.toLowerCase();
    const category = categoryFilter.value;
    
    filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm) ||
                            item.description.toLowerCase().includes(searchTerm) ||
                            item.location.toLowerCase().includes(searchTerm) ||
                            item.seller.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !category || item.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    handleSort();
}

// Handle sort
function handleSort() {
    const sortValue = sortBy.value;
    
    switch(sortValue) {
        case 'newest':
            filteredItems.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
            break;
        case 'oldest':
            filteredItems.sort((a, b) => new Date(a.datePosted) - new Date(b.datePosted));
            break;
        case 'price-low':
            filteredItems.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredItems.sort((a, b) => b.price - a.price);
            break;
    }
    
    displayItems();
}

// Handle delete
function handleDelete(itemId) {
    itemToDelete = itemId;
    const item = items.find(i => i.id === itemId);
    
    if (item) {
        deleteMessage.textContent = `क्या आप वाकई "${item.title}" विज्ञापन को हटाना चाहते हैं?`;
        deleteModal.classList.add('active');
    }
}

// Confirm delete
async function confirmDelete() {
    if (itemToDelete !== null) {
        try {
            await APIClient.deleteItem(itemToDelete);
            await loadItems();
            handleFilter();
            updateStats();
            showNotification('विज्ञापन सफलतापूर्वक हटाया गया! 🗑️', 'success');
            closeModal();
            itemToDelete = null;
        } catch (error) {
            console.error('Error deleting item:', error);
            showNotification('विज्ञापन हटाने में त्रुटि। कृपया पुनः प्रयास करें।', 'error');
        }
    }
}

// Handle clear all
function handleClearAll() {
    if (items.length === 0) {
        showNotification('हटाने के लिए कोई विज्ञापन नहीं', 'info');
        return;
    }
    
    deleteMessage.textContent = `क्या आप वाकई सभी विज्ञापन (${items.length}) हटाना चाहते हैं?`;
    itemToDelete = 'all';
    deleteModal.classList.add('active');
    
    confirmDeleteBtn.onclick = async () => {
        if (itemToDelete === 'all') {
            try {
                await APIClient.deleteAllItems();
                await loadItems();
                handleFilter();
                updateStats();
                showNotification('सभी विज्ञापन हटा दिए गए! 🗑️', 'success');
                closeModal();
                itemToDelete = null;
                // Restore normal delete handler
                confirmDeleteBtn.onclick = confirmDelete;
            } catch (error) {
                console.error('Error deleting all items:', error);
                showNotification('सभी विज्ञापन हटाने में त्रुटि।', 'error');
            }
        }
    };
}

// Close modal
function closeModal() {
    deleteModal.classList.remove('active');
    itemToDelete = null;
    confirmDeleteBtn.onclick = confirmDelete;
}

// Update stats
function updateStats() {
    totalAdsEl.textContent = items.length;
    
    // Count today's ads
    const today = new Date().toISOString().split('T')[0];
    const todayAds = items.filter(item => item.datePosted === today).length;
    todayAdsEl.textContent = todayAds;
    
    // Count unique categories
    const categories = new Set(items.map(item => item.category));
    categoriesCountEl.textContent = categories.size;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#E53935' : '#2196F3';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Handle edit
function handleEdit(itemId) {
    const item = items.find(i => i.id === itemId);
    
    if (item) {
        // Fill form with item data
        document.getElementById('editItemId').value = item.id;
        document.getElementById('editTitle').value = item.title;
        document.getElementById('editCategory').value = item.category;
        document.getElementById('editPrice').value = item.price;
        document.getElementById('editCondition').value = item.condition;
        document.getElementById('editSize').value = item.size || '';
        document.getElementById('editViews').value = item.views || 0;
        document.getElementById('editDescription').value = item.description;
        document.getElementById('editLocation').value = item.location;
        document.getElementById('editSeller').value = item.seller;
        document.getElementById('editPhone').value = item.phone;
        
        // Show modal
        editModal.classList.add('active');
    }
}

// Handle edit form submit
async function handleEditSubmit(e) {
    e.preventDefault();
    
    const itemId = parseInt(document.getElementById('editItemId').value);
    
    try {
        const updatedData = {
            title: document.getElementById('editTitle').value,
            category: document.getElementById('editCategory').value,
            price: parseInt(document.getElementById('editPrice').value),
            condition: document.getElementById('editCondition').value,
            size: document.getElementById('editSize').value,
            views: parseInt(document.getElementById('editViews').value) || 0,
            description: document.getElementById('editDescription').value,
            location: document.getElementById('editLocation').value,
            seller: document.getElementById('editSeller').value,
            phone: document.getElementById('editPhone').value
        };
        
        await APIClient.updateItem(itemId, updatedData);
        
        // Reload items and refresh display
        await loadItems();
        handleFilter();
        updateStats();
        
        // Close modal
        closeEditModal();
        
        showNotification('विज्ञापन सफलतापूर्वक अपडेट किया गया! ✅', 'success');
    } catch (error) {
        console.error('Error updating item:', error);
        showNotification('विज्ञापन अपडेट करने में त्रुटि।', 'error');
    }
}

// Close edit modal
function closeEditModal() {
    editModal.classList.remove('active');
    editItemForm.reset();
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
`;
document.head.appendChild(style);
