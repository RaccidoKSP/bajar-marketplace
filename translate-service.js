// BAJAR - Translation Service
// Automatically translates text to Hindi (Devanagari script)

const TranslationService = {
    // Free translation API - MyMemory (no key required, 1000 requests/day)
    async translateToHindi(text, sourceLang = 'auto') {
        if (!text || text.trim() === '') {
            return text;
        }

        try {
            // Use MyMemory Translation API (free, no registration)
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|hi`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData) {
                return data.responseData.translatedText;
            } else {
                console.warn('Translation failed, using original text');
                return text;
            }
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Return original text if translation fails
        }
    },

    // Translate multiple fields at once
    async translateItemFields(item) {
        try {
            const [title, description, location] = await Promise.all([
                this.translateToHindi(item.title),
                this.translateToHindi(item.description),
                this.translateToHindi(item.location)
            ]);

            return {
                ...item,
                title: title,
                description: description,
                location: location,
                // Keep original text for reference (optional)
                originalTitle: item.title,
                originalDescription: item.description,
                originalLocation: item.location
            };
        } catch (error) {
            console.error('Error translating item fields:', error);
            return item;
        }
    },

    // Detect if text is already in Hindi (Devanagari script)
    isHindi(text) {
        // Check if text contains Devanagari Unicode characters
        const devanagariRegex = /[\u0900-\u097F]/;
        return devanagariRegex.test(text);
    },

    // Alternative: Google Translate API (requires API key)
    async translateToHindiGoogle(text, apiKey) {
        if (!apiKey) {
            console.error('Google Translate API key required');
            return text;
        }

        try {
            const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    target: 'hi',
                    format: 'text'
                })
            });

            const data = await response.json();
            
            if (data.data && data.data.translations && data.data.translations[0]) {
                return data.data.translations[0].translatedText;
            }
            
            return text;
        } catch (error) {
            console.error('Google Translate error:', error);
            return text;
        }
    },

    // Batch translation for better performance
    async batchTranslate(texts) {
        const translations = await Promise.all(
            texts.map(text => this.translateToHindi(text))
        );
        return translations;
    },

    // Show translation progress
    async translateWithProgress(text, progressCallback) {
        if (progressCallback) {
            progressCallback('Перевод на хинди...');
        }
        
        const result = await this.translateToHindi(text);
        
        if (progressCallback) {
            progressCallback('Перевод завершен');
        }
        
        return result;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranslationService;
}
