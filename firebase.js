const firebaseConfig = {
    apiKey: "AIzaSyC49uyxoesQ8lV1_LWZ_37bSKYmpygQxco",
    authDomain: "easybudget-d728d.firebaseapp.com",
    projectId: "easybudget-d728d",
    storageBucket: "easybudget-d728d.firebasestorage.app",
    messagingSenderId: "347678442675",
    appId: "1:347678442675:web:dbc76959e35dbff8c89cc6",
    measurementId: "G-SPE5GKFJFQ"
  };


  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize Firestore
const db = firebase.firestore();