// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNZwe5xiM0GhO2WJURqvtkQPtkwszL4gY",
    authDomain: "ugur-test-54b90.firebaseapp.com",
    databaseURL: "https://ugur-test-54b90-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ugur-test-54b90",
    storageBucket: "ugur-test-54b90.firebasestorage.app",
    messagingSenderId: "910605152227",
    appId: "1:910605152227:web:49c43ef15a142908b6bad6",
    measurementId: "G-LMK90XWD7Z"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

// Export for use in other files
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseStorage = storage;
window.firebaseAnalytics = analytics;

console.log("Firebase initialized successfully!");
