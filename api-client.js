// BAJAR - API Client for Server Communication
// This module handles all communication with the backend server

const API_BASE_URL = 'http://localhost:3000/api';

// API Client Object
const APIClient = {
    // Check if server is available
    async checkServerHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            const data = await response.json();
            return data.status === 'OK';
        } catch (error) {
            console.error('Server health check failed:', error);
            return false;
        }
    },

    // Get all items from server
    async getAllItems() {
        try {
            const response = await fetch(`${API_BASE_URL}/items`);
            const data = await response.json();
            if (data.success) {
                return data.items;
            }
            throw new Error(data.error || 'Failed to fetch items');
        } catch (error) {
            console.error('Error fetching items:', error);
            throw error;
        }
    },

    // Get single item by ID
    async getItem(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/items/${id}`);
            const data = await response.json();
            if (data.success) {
                return data.item;
            }
            throw new Error(data.error || 'Failed to fetch item');
        } catch (error) {
            console.error('Error fetching item:', error);
            throw error;
        }
    },

    // Upload images to server
    async uploadImages(files) {
        try {
            const formData = new FormData();
            
            // Add all files to FormData
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }

            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                return data.files; // Returns array of file URLs
            }
            throw new Error(data.error || 'Failed to upload images');
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        }
    },

    // Create new item
    async createItem(itemData) {
        try {
            const response = await fetch(`${API_BASE_URL}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemData)
            });

            const data = await response.json();
            if (data.success) {
                return data.item;
            }
            throw new Error(data.error || 'Failed to create item');
        } catch (error) {
            console.error('Error creating item:', error);
            throw error;
        }
    },

    // Update existing item
    async updateItem(id, itemData) {
        try {
            const response = await fetch(`${API_BASE_URL}/items/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemData)
            });

            const data = await response.json();
            if (data.success) {
                return data.item;
            }
            throw new Error(data.error || 'Failed to update item');
        } catch (error) {
            console.error('Error updating item:', error);
            throw error;
        }
    },

    // Delete item
    async deleteItem(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/items/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                return true;
            }
            throw new Error(data.error || 'Failed to delete item');
        } catch (error) {
            console.error('Error deleting item:', error);
            throw error;
        }
    },

    // Delete all items
    async deleteAllItems() {
        try {
            const response = await fetch(`${API_BASE_URL}/items`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                return true;
            }
            throw new Error(data.error || 'Failed to delete all items');
        } catch (error) {
            console.error('Error deleting all items:', error);
            throw error;
        }
    },

    // Get full URL for uploaded image
    getImageUrl(imagePath) {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('data:')) return imagePath; // Base64 image
        
        // Remove leading slash if present
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        return `http://localhost:3000/${cleanPath}`;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}
