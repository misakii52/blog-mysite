// Search functionality for Bookpango
class SearchManager {
    constructor() {
        this.searchIndex = [];
        this.init();
    }
    
    async init() {
        await this.buildSearchIndex();
        this.setupSearchListeners();
    }
    
    async buildSearchIndex() {
        try {
            const posts = await dbManager.getPosts(100);
            this.searchIndex = posts.map(post => ({
                id: post.id,
                title: post.title,
                excerpt: post.excerpt,
                author: post.bookInfo?.author,
                categories: post.categories || [],
                tags: post.tags || [],
                searchableText: `${post.title} ${post.excerpt} ${post.bookInfo?.author} ${post.tags?.join(' ')}`.toLowerCase()
            }));
        } catch (error) {
            console.error('Error building search index:', error);
        }
    }
    
    setupSearchListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchForm = document.getElementById('searchForm');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.showSuggestions(e.target.value);
            });
            
            searchInput.addEventListener('focus', () => {
                this.showSuggestions(searchInput.value);
            });
            
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    this.hideSuggestions();
                }
            });
        }
        
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
                }
            });
        }
    }
    
    showSuggestions(query) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer) return;
        
        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        const suggestions = this.getSuggestions(query);
        
        if (suggestions.length > 0) {
            suggestionsContainer.innerHTML = suggestions.map(suggestion => `
                <div class="suggestion-item" data-query="${suggestion.query}">
                    <span class="suggestion-text">${suggestion.text}</span>
                    <span class="suggestion-type">${suggestion.type}</span>
                </div>
            `).join('');
            
            suggestionsContainer.style.display = 'block';
            
            suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const query = item.dataset.query;
                    window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
                });
            });
        } else {
            suggestionsContainer.style.display = 'none';
        }
    }
    
    hideSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }
    
    getSuggestions(query) {
        const queryLower = query.toLowerCase();
        const suggestions = new Set();
        
        this.searchIndex.forEach(item => {
            if (item.title.toLowerCase().includes(queryLower)) {
                suggestions.add(JSON.stringify({
                    query: item.title,
                    text: item.title,
                    type: 'Book Title'
                }));
            }
            
            if (item.author && item.author.toLowerCase().includes(queryLower)) {
                suggestions.add(JSON.stringify({
                    query: item.author,
                    text: `Books by ${item.author}`,
                    type: 'Author'
                }));
            }
            
            item.tags.forEach(tag => {
                if (tag.toLowerCase().includes(queryLower)) {
                    suggestions.add(JSON.stringify({
                        query: tag,
                        text: `Tag: ${tag}`,
                        type: 'Tag'
                    }));
                }
            });
        });
        
        return Array.from(suggestions).map(s => JSON.parse(s)).slice(0, 5);
    }
    
    async performSearch(query) {
        try {
            const posts = await dbManager.getPosts(100);
            const searchTerms = query.toLowerCase().split(' ');
            
            const results = posts.filter(post => {
                const searchText = `${post.title} ${post.excerpt} ${post.bookInfo?.author} ${post.tags?.join(' ')}`.toLowerCase();
                return searchTerms.some(term => searchText.includes(term));
            });
            
            return results;
        } catch (error) {
            console.error('Error performing search:', error);
            return [];
        }
    }
}

// Initialize search
document.addEventListener('DOMContentLoaded', () => {
    const searchManager = new SearchManager();
    window.searchManager = searchManager;
});
