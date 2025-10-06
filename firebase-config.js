// Configuration Firebase pour TransFiles
// Remplacez ces valeurs par vos propres clés Firebase

// Configuration Firebase (à remplacer par vos vraies clés)
const firebaseConfig = {
    apiKey: "AIzaSyAhv-pLwgD7zwvw_Pb9pn8jvGQOxvnYUHA",
    authDomain: "transfiles-4c5ca.firebaseapp.com",
    databaseURL: "https://transfiles-4c5ca-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "transfiles-4c5ca",
    storageBucket: "transfiles-4c5ca.firebasestorage.app",
    messagingSenderId: "1073087881903",
    appId: "1:1073087881903:web:23cff3511b64bb693faa5a",
    measurementId: "G-DE3XQ2GBYY"
  };

// Initialisation de Firebase
firebase.initializeApp(firebaseConfig);

// Références aux services Firebase
const database = firebase.database();
const storage = firebase.storage();

// Fonction pour générer un ID de room aléatoire
function generateRoomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Fonction pour valider un ID de room
function isValidRoomId(roomId) {
    return /^[A-Z0-9]{6}$/.test(roomId);
}

// Export des fonctions et références pour utilisation dans app.js
window.firebaseConfig = {
    database,
    storage,
    generateRoomId,
    isValidRoomId
};
