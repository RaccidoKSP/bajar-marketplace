// BAJAR - Server API for Image Upload and Data Synchronization
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure upload settings
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
const MAX_FILES = parseInt(process.env.MAX_FILES) || 5;

// Database file path
const DB_FILE = process.env.DB_FILE || 'database.json';

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));

// Configure multer for file uploads

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR + '/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Load database
function loadDatabase() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading database:', error);
    }
    return { items: [], categories: [], conditions: [] };
}

// Save database
function saveDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving database:', error);
        return false;
    }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Debug endpoint - check uploads folder
app.get('/api/debug/uploads', (req, res) => {
    try {
        const uploadsPath = path.join(__dirname, UPLOAD_DIR);
        const exists = fs.existsSync(uploadsPath);
        
        let files = [];
        if (exists) {
            files = fs.readdirSync(uploadsPath);
        }
        
        res.json({
            uploadsPath: uploadsPath,
            exists: exists,
            filesCount: files.length,
            firstFiles: files.slice(0, 10),
            __dirname: __dirname,
            UPLOAD_DIR: UPLOAD_DIR
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all items
app.get('/api/items', (req, res) => {
    try {
        const db = loadDatabase();
        res.json({ success: true, items: db.items });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single item by ID
app.get('/api/items/:id', (req, res) => {
    try {
        const db = loadDatabase();
        const item = db.items.find(i => i.id === parseInt(req.params.id));
        
        if (item) {
            res.json({ success: true, item: item });
        } else {
            res.status(404).json({ success: false, error: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload images (multiple files)
app.post('/api/upload', upload.array('images', MAX_FILES), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded' });
        }
        
        const fileUrls = req.files.map(file => {
            return `/uploads/${file.filename}`;
        });
        
        res.json({ 
            success: true, 
            message: 'Files uploaded successfully',
            files: fileUrls
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new item
app.post('/api/items', (req, res) => {
    try {
        const db = loadDatabase();
        const newItem = {
            id: Date.now(),
            ...req.body,
            datePosted: new Date().toISOString().split('T')[0],
            views: req.body.views || 0
        };
        
        db.items.unshift(newItem);
        
        if (saveDatabase(db)) {
            res.json({ success: true, item: newItem });
        } else {
            res.status(500).json({ success: false, error: 'Failed to save item' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update item
app.put('/api/items/:id', (req, res) => {
    try {
        const db = loadDatabase();
        const itemIndex = db.items.findIndex(i => i.id === parseInt(req.params.id));
        
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }
        
        db.items[itemIndex] = {
            ...db.items[itemIndex],
            ...req.body,
            id: parseInt(req.params.id) // Preserve original ID
        };
        
        if (saveDatabase(db)) {
            res.json({ success: true, item: db.items[itemIndex] });
        } else {
            res.status(500).json({ success: false, error: 'Failed to update item' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete item
app.delete('/api/items/:id', (req, res) => {
    try {
        const db = loadDatabase();
        const itemIndex = db.items.findIndex(i => i.id === parseInt(req.params.id));
        
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }
        
        // Delete associated images from uploads folder
        const item = db.items[itemIndex];
        if (item.imageFiles && Array.isArray(item.imageFiles)) {
            item.imageFiles.forEach(imagePath => {
                const fullPath = path.join(__dirname, imagePath.replace(/^\//, ''));
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            });
        }
        
        db.items.splice(itemIndex, 1);
        
        if (saveDatabase(db)) {
            res.json({ success: true, message: 'Item deleted successfully' });
        } else {
            res.status(500).json({ success: false, error: 'Failed to delete item' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete all items
app.delete('/api/items', (req, res) => {
    try {
        const db = loadDatabase();
        
        // Delete all uploaded images
        db.items.forEach(item => {
            if (item.imageFiles && Array.isArray(item.imageFiles)) {
                item.imageFiles.forEach(imagePath => {
                    const fullPath = path.join(__dirname, imagePath.replace(/^\//, ''));
                    if (fs.existsSync(fullPath)) {
                        try {
                            fs.unlinkSync(fullPath);
                        } catch (err) {
                            console.error('Error deleting file:', err);
                        }
                    }
                });
            }
        });
        
        db.items = [];
        
        if (saveDatabase(db)) {
            res.json({ success: true, message: 'All items deleted successfully' });
        } else {
            res.status(500).json({ success: false, error: 'Failed to delete items' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get categories
app.get('/api/categories', (req, res) => {
    try {
        const db = loadDatabase();
        res.json({ success: true, categories: db.categories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 BAJAR Server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads folder: ${path.join(__dirname, 'uploads')}`);
    console.log(`💾 Database file: ${path.join(__dirname, DB_FILE)}`);
});
