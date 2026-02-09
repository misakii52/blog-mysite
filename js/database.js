// Database operations for Bookpango
class DatabaseManager {
    constructor() {
        this.db = firebaseDb;
    }
    
    // Posts operations
    async getPosts(limit = 10, startAfter = null) {
        try {
            let query = this.db.collection('posts')
                .where('status', '==', 'published')
                .orderBy('publishedAt', 'desc')
                .limit(limit);
            
            if (startAfter) {
                query = query.startAfter(startAfter);
            }
            
            const snapshot = await query.get();
            const posts = [];
            snapshot.forEach(doc => {
                posts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return posts;
        } catch (error) {
            console.error('Error getting posts:', error);
            return [];
        }
    }
    
    async getPostById(id) {
        try {
            const doc = await this.db.collection('posts').doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting post:', error);
            return null;
        }
    }
    
    async createPost(postData) {
        try {
            const postWithMeta = {
                ...postData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'published',
                views: 0,
                stats: {
                    views: 0,
                    shares: 0,
                    readingTime: 0
                }
            };
            
            const docRef = await this.db.collection('posts').add(postWithMeta);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating post:', error);
            return { success: false, error: error.message };
        }
    }
    
    async updatePost(id, postData) {
        try {
            await this.db.collection('posts').doc(id).update({
                ...postData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating post:', error);
            return { success: false, error: error.message };
        }
    }
    
    async deletePost(id) {
        try {
            await this.db.collection('posts').doc(id).delete();
            return { success: true };
        } catch (error) {
            console.error('Error deleting post:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Categories operations
    async getCategories() {
        try {
            const snapshot = await this.db.collection('categories')
                .where('isActive', '==', true)
                .orderBy('order')
                .get();
            
            const categories = [];
            snapshot.forEach(doc => {
                categories.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return categories;
        } catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    }
    
    async getCategoryById(id) {
        try {
            const doc = await this.db.collection('categories').doc(id).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting category:', error);
            return null;
        }
    }
    
    // Slider operations
    async getSliderItems() {
        try {
            const snapshot = await this.db.collection('slider_items')
                .where('isActive', '==', true)
                .orderBy('order')
                .get();
            
            const items = [];
            snapshot.forEach(doc => {
                items.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return items;
        } catch (error) {
            console.error('Error getting slider items:', error);
            return [];
        }
    }
    
    // Comments operations
    async getCommentsForPost(postId) {
        try {
            const snapshot = await this.db.collection('comments')
                .where('postId', '==', postId)
                .where('isApproved', '==', true)
                .orderBy('createdAt', 'desc')
                .get();
            
            const comments = [];
            snapshot.forEach(doc => {
                comments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return comments;
        } catch (error) {
            console.error('Error getting comments:', error);
            return [];
        }
    }
    
    async addComment(commentData) {
        try {
            const commentWithMeta = {
                ...commentData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isApproved: false // Admin approval required
            };
            
            const docRef = await this.db.collection('comments').add(commentWithMeta);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error adding comment:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Search operations
    async searchPosts(query) {
        try {
            // Simple search implementation
            const snapshot = await this.db.collection('posts')
                .where('status', '==', 'published')
                .get();
            
            const results = [];
            const searchTerms = query.toLowerCase().split(' ');
            
            snapshot.forEach(doc => {
                const post = doc.data();
                let matches = 0;
                
                // Check title
                if (post.title.toLowerCase().includes(query.toLowerCase())) {
                    matches += 10;
                }
                
                // Check content
                if (post.content.toLowerCase().includes(query.toLowerCase())) {
                    matches += 5;
                }
                
                // Check author
                if (post.bookInfo?.author?.toLowerCase().includes(query.toLowerCase())) {
                    matches += 8;
                }
                
                // Check tags
                if (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) {
                    matches += 3;
                }
                
                if (matches > 0) {
                    results.push({
                        id: doc.id,
                        ...post,
                        relevance: matches
                    });
                }
            });
            
            // Sort by relevance
            results.sort((a, b) => b.relevance - a.relevance);
            return results;
        } catch (error) {
            console.error('Error searching posts:', error);
            return [];
        }
    }
}

// Initialize Database Manager
const dbManager = new DatabaseManager();

// Export for use in other files
window.dbManager = dbManager;
