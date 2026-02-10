// Authentication state observer
firebase.auth().onAuthStateChanged((user) => {
    const authButtons = document.getElementById('authButtons');
    const loggedInMenu = document.getElementById('loggedInMenu');
    const userAvatarImg = document.getElementById('userAvatarImg');
    const mobileAuthLinks = document.getElementById('mobileAuthLinks');
    
    if (user) {
        // User is signed in
        if (authButtons) authButtons.style.display = 'none';
        if (loggedInMenu) loggedInMenu.style.display = 'flex';
        if (userAvatarImg) {
            userAvatarImg.src = user.photoURL || '/assets/images/default-avatar.jpg';
            userAvatarImg.alt = user.displayName || 'User';
        }
        if (mobileAuthLinks) mobileAuthLinks.style.display = 'none';
    } else {
        // User is signed out
        if (authButtons) authButtons.style.display = 'flex';
        if (loggedInMenu) loggedInMenu.style.display = 'none';
        if (mobileAuthLinks) mobileAuthLinks.style.display = 'flex';
    }
});

// Logout functionality
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await firebase.auth().signOut();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error signing out. Please try again.');
        }
    });
}

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');

if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
    });
}
