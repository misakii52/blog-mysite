// Admin panel functionality
class AdminManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    async init() {
        await this.checkAuth();
        this.setupEventListeners();
    }
    
    async checkAuth() {
        this.currentUser = firebaseAuth.currentUser;
        
        if (!this.currentUser) {
            window.location.href = '/login.html?redirect=admin';
            return;
        }
        
        const isAdmin = await authManager.checkAdminRole();
        if (!isAdmin) {
            window.location.href = '/';
            return;
        }
        
        this.loadDashboardData();
    }
    
    async loadDashboardData() {
        try {
            const postsSnapshot = await firebaseDb.collection('posts').get();
            const commentsSnapshot = await firebaseDb.collection('comments').get();
            
            const totalPosts = postsSnapshot.size;
            const totalComments = commentsSnapshot.size;
            const pendingComments = commentsSnapshot.docs.filter(doc => !doc.data().isApproved).length;
            
            document.getElementById('totalPosts').textContent = totalPosts;
            document.getElementById('totalComments').textContent = totalComments;
            document.getElementById('pendingComments').textContent = pendingComments;
            
            this.loadRecentPosts();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }
    
    async loadRecentPosts() {
        try {
            const posts = await dbManager.getPosts(5);
            const recentPostsContainer = document.getElementById('recentPosts');
            
            if (recentPostsContainer) {
                recentPostsContainer.innerHTML = posts.map(post => `
                    <div class="post-item">
                        <div class="post-image">
                            <img src="${post.images?.cover || '/assets/images/placeholders/book-placeholder.jpg'}" 
                                 alt="${post.title}">
                        </div>
                        <div class="post-details">
                            <h4>${post.title}</h4>
                            <p>${post.excerpt || ''}</p>
                            <div class="post-meta">
                                <span>Views: ${post.stats?.views || 0}</span>
                                <span>${this.formatDate(post.publishedAt)}</span>
                            </div>
                        </div>
                        <div class="post-actions">
                            <a href="/admin/edit-post.html?id=${post.id}" class="btn-edit">Edit</a>
                            <button class="btn-delete" data-id="${post.id}">Delete</button>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading recent posts:', error);
        }
    }
    
    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US');
    }
    
    setupEventListeners() {
        const logoutBtn = document.getElementById('adminLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await authManager.logout();
                window.location.href = '/';
            });
        }
        
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-delete')) {
                const postId = e.target.dataset.id;
                if (confirm('Are you sure you want to delete this post?')) {
                    await dbManager.deletePost(postId);
                    e.target.closest('.post-item').remove();
                }
            }
        });
    }
}

// Initialize admin
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/admin/')) {
        const adminManager = new AdminManager();
        window.adminManager = adminManager;
    }
});
