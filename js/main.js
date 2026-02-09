// Main JavaScript functionality for Bookpango
class BookpangoApp {
    constructor() {
        this.categories = [];
        this.popularBooks = [];
        this.latestReviews = [];
        this.init();
    }
    
    async init() {
        await this.loadCategories();
        await this.loadPopularBooks();
        await this.loadLatestReviews();
        this.setupEventListeners();
    }
    
    async loadCategories() {
        try {
            this.categories = await dbManager.getCategories();
            this.renderCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    async loadPopularBooks() {
        try {
            this.popularBooks = await dbManager.getPosts(6);
            this.renderPopularBooks();
        } catch (error) {
            console.error('Error loading popular books:', error);
        }
    }
    
    async loadLatestReviews() {
        try {
            this.latestReviews = await dbManager.getPosts(6);
            this.renderLatestReviews();
        } catch (error) {
            console.error('Error loading latest reviews:', error);
        }
    }
    
    renderCategories() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        const categoriesDropdown = document.getElementById('categoriesDropdown');
        const footerCategories = document.getElementById('footerCategories');
        
        if (categoriesGrid && this.categories.length > 0) {
            categoriesGrid.innerHTML = this.categories.map(category => `
                <div class="category-card">
                    <a href="/categories.html?id=${category.id}" class="category-link">
                        <div class="category-icon">📚</div>
                        <h3 class="category-name">${category.name}</h3>
                        <p class="category-count">${category.postCount || 0} books</p>
                    </a>
                </div>
            `).join('');
        }
        
        if (categoriesDropdown && this.categories.length > 0) {
            categoriesDropdown.innerHTML = this.categories.map(category => `
                <a href="/categories.html?id=${category.id}" class="dropdown-item">${category.name}</a>
            `).join('');
        }
        
        if (footerCategories && this.categories.length > 0) {
            const topCategories = this.categories.slice(0, 5);
            footerCategories.innerHTML = topCategories.map(category => `
                <li><a href="/categories.html?id=${category.id}">${category.name}</a></li>
            `).join('');
        }
    }
    
    renderPopularBooks() {
        const popularGrid = document.getElementById('popularGrid');
        
        if (popularGrid && this.popularBooks.length > 0) {
            popularGrid.innerHTML = this.popularBooks.map(book => `
                <article class="book-card">
                    <div class="book-image">
                        <img src="${book.images?.cover || '/assets/images/placeholders/book-placeholder.jpg'}" 
                             alt="${book.title}"
                             loading="lazy">
                        <div class="book-rating">
                            <span class="stars">${'★'.repeat(Math.floor(book.review?.rating || 0))}${'☆'.repeat(5 - Math.floor(book.review?.rating || 0))}</span>
                            <span class="rating-text">${book.review?.rating || 0}/5</span>
                        </div>
                    </div>
                    <div class="book-content">
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">by ${book.bookInfo?.author || 'Unknown Author'}</p>
                        <p class="book-excerpt">${book.excerpt || 'No excerpt available'}</p>
                        <div class="book-meta">
                            <span class="meta-item">📖 ${book.bookInfo?.pages || 'N/A'} pages</span>
                            <span class="meta-item">👁️ ${book.stats?.views || 0} views</span>
                        </div>
                        <div class="book-actions">
                            <a href="/post.html?id=${book.id}" class="btn btn-outline btn-sm">Read Review</a>
                            ${book.affiliate?.amazonLink ? 
                                `<a href="${book.affiliate.amazonLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Buy on Amazon</a>` 
                                : ''}
                        </div>
                    </div>
                </article>
            `).join('');
        } else if (popularGrid) {
            popularGrid.innerHTML = `
                <div class="empty-state">
                    <p>No popular books found. Check back later!</p>
                </div>
            `;
        }
    }
    
    renderLatestReviews() {
        const latestReviews = document.getElementById('latestReviews');
        
        if (latestReviews && this.latestReviews.length > 0) {
            latestReviews.innerHTML = this.latestReviews.map(review => `
                <article class="review-card">
                    <div class="review-header">
                        <div class="reviewer-avatar">
                            <img src="${review.author?.photo || '/assets/images/placeholders/avatar-placeholder.jpg'}" 
                                 alt="${review.author?.name || 'Reviewer'}">
                        </div>
                        <div class="reviewer-info">
                            <h4 class="reviewer-name">${review.author?.name || 'Anonymous'}</h4>
                            <time class="review-date">${this.formatDate(review.publishedAt)}</time>
                        </div>
                    </div>
                    <div class="review-body">
                        <h3 class="review-title">${review.title}</h3>
                        <p class="review-excerpt">${review.excerpt || 'No excerpt available'}</p>
                        <div class="review-tags">
                            ${review.tags?.slice(0, 3).map(tag => 
                                `<span class="tag">${tag}</span>`
                            ).join('') || ''}
                        </div>
                    </div>
                    <div class="review-footer">
                        <a href="/post.html?id=${review.id}" class="read-more">Read full review →</a>
                    </div>
                </article>
            `).join('');
        }
    }
    
    formatDate(timestamp) {
        if (!timestamp) return 'Recently';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    setupEventListeners() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileNav = document.getElementById('mobileNav');
        
        if (mobileMenuBtn && mobileNav) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });
        }
        
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailInput = newsletterForm.querySelector('input[type="email"]');
                const email = emailInput.value;
                
                if (this.validateEmail(email)) {
                    await this.subscribeToNewsletter(email);
                    emailInput.value = '';
                    this.showNotification('Successfully subscribed to newsletter!', 'success');
                } else {
                    this.showNotification('Please enter a valid email address.', 'error');
                }
            });
        }
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    async subscribeToNewsletter(email) {
        try {
            await firebaseDb.collection('newsletter_subscribers').add({
                email: email,
                subscribedAt: firebase.firestore.FieldValue.serverTimestamp(),
                active: true
            });
            return true;
        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
            return false;
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const app = new BookpangoApp();
    window.bookpangoApp = app;
});
