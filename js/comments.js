// Comments system for Bookpango
class CommentsManager {
    constructor() {
        this.currentPostId = this.getPostIdFromURL();
        this.init();
    }
    
    getPostIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    
    async init() {
        if (!this.currentPostId) return;
        
        await this.loadComments();
        this.setupEventListeners();
    }
    
    async loadComments() {
        try {
            const comments = await dbManager.getCommentsForPost(this.currentPostId);
            this.renderComments(comments);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }
    
    renderComments(comments) {
        const commentsContainer = document.getElementById('commentsContainer');
        if (!commentsContainer) return;
        
        if (comments.length === 0) {
            commentsContainer.innerHTML = `
                <div class="no-comments">
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
            return;
        }
        
        commentsContainer.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <div class="comment-author">
                        <strong>${comment.userName || 'Anonymous'}</strong>
                    </div>
                    <div class="comment-date">
                        ${this.formatDate(comment.createdAt)}
                    </div>
                </div>
                <div class="comment-content">
                    ${comment.content}
                </div>
                ${comment.rating ? `
                    <div class="comment-rating">
                        Rating: ${'★'.repeat(comment.rating)}${'☆'.repeat(5 - comment.rating)}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const user = firebaseAuth.currentUser;
                if (!user) {
                    window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
                    return;
                }
                
                const content = document.getElementById('commentContent').value.trim();
                const rating = document.querySelector('input[name="rating"]:checked')?.value;
                
                if (!content) {
                    alert('Please enter a comment');
                    return;
                }
                
                const commentData = {
                    postId: this.currentPostId,
                    userId: user.uid,
                    userName: user.displayName || 'Anonymous',
                    userEmail: user.email,
                    content: content,
                    rating: rating ? parseInt(rating) : null
                };
                
                const result = await dbManager.addComment(commentData);
                if (result.success) {
                    alert('Comment submitted for review. Thank you!');
                    commentForm.reset();
                } else {
                    alert('Error submitting comment: ' + result.error);
                }
            });
        }
    }
    
    formatDate(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize comments when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const commentsManager = new CommentsManager();
    window.commentsManager = commentsManager;
});
