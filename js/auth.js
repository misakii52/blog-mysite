// Authentication Management
class AuthManager {
    constructor() {
        this.user = null;
        this.init();
    }
    
    init() {
        // Check auth state
        firebaseAuth.onAuthStateChanged((user) => {
            this.user = user;
            this.updateUI();
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
        });
    }
    
    async loginWithEmail(email, password) {
        try {
            const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }
    
    async signupWithEmail(email, password, displayName) {
        try {
            const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({
                displayName: displayName
            });
            
            // Create user document in Firestore
            await this.createUserDocument(userCredential.user, displayName);
            
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: error.message };
        }
    }
    
    async loginWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const userCredential = await firebaseAuth.signInWithPopup(provider);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Google login error:', error);
            return { success: false, error: error.message };
        }
    }
    
    async logout() {
        try {
            await firebaseAuth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }
    
    async createUserDocument(user, displayName) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: displayName || user.displayName,
            photoURL: user.photoURL || '',
            role: 'user',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await firebaseDb.collection('users').doc(user.uid).set(userData);
    }
    
    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const loggedInMenu = document.getElementById('loggedInMenu');
        const userAvatarImg = document.getElementById('userAvatarImg');
        const mobileAuthLinks = document.getElementById('mobileAuthLinks');
        
        if (this.user) {
            // User is logged in
            if (authButtons) authButtons.style.display = 'none';
            if (loggedInMenu) loggedInMenu.style.display = 'flex';
            if (mobileAuthLinks) mobileAuthLinks.style.display = 'none';
            
            // Update user avatar
            if (userAvatarImg && this.user.photoURL) {
                userAvatarImg.src = this.user.photoURL;
                userAvatarImg.alt = this.user.displayName || 'User';
            }
            
            // Add logout handler
            const logoutButton = document.getElementById('logoutButton');
            if (logoutButton) {
                logoutButton.onclick = async (e) => {
                    e.preventDefault();
                    await this.logout();
                    window.location.href = '/';
                };
            }
        } else {
            // User is logged out
            if (authButtons) authButtons.style.display = 'flex';
            if (loggedInMenu) loggedInMenu.style.display = 'none';
            if (mobileAuthLinks) mobileAuthLinks.style.display = 'flex';
        }
    }
    
    async checkAdminRole() {
        if (!this.user) return false;
        
        try {
            const userDoc = await firebaseDb.collection('users').doc(this.user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                return userData.role === 'admin';
            }
            return false;
        } catch (error) {
            console.error('Error checking admin role:', error);
            return false;
        }
    }
}

// Initialize Auth Manager
const authManager = new AuthManager();

// Export for use in other files
window.authManager = authManager;

// Check auth state on page load
function checkAuthState() {
    return new Promise((resolve) => {
        const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });
}
