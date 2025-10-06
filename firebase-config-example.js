// EXEMPLE de configuration Firebase pour TransFiles
// Copiez ce fichier vers firebase-config.js et remplacez les valeurs

// Configuration Firebase (à remplacer par vos vraies clés)
const firebaseConfig = {
    // Remplacez par votre API Key
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    
    // Remplacez par votre Auth Domain
    authDomain: "votre-projet-id.firebaseapp.com",
    
    // Remplacez par votre Database URL
    databaseURL: "https://votre-projet-id-default-rtdb.firebaseio.com",
    
    // Remplacez par votre Project ID
    projectId: "votre-projet-id",
    
    // Remplacez par votre Storage Bucket
    storageBucket: "votre-projet-id.appspot.com",
    
    // Remplacez par votre Messaging Sender ID
    messagingSenderId: "123456789012",
    
    // Remplacez par votre App ID
    appId: "1:123456789012:web:abcdefghijklmnopqrstuvwxyz"
};

// Instructions pour obtenir ces clés :
// 1. Allez sur https://console.firebase.google.com
// 2. Créez un nouveau projet ou sélectionnez un projet existant
// 3. Allez dans "Paramètres du projet" > "Vos applications"
// 4. Cliquez sur "Ajouter une application" > "Web"
// 5. Copiez la configuration firebaseConfig
// 6. Activez Realtime Database et Storage dans le menu de gauche
// 7. Configurez les règles de sécurité (voir README.md)

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
