# 🔧 Résolution du problème CORS Firebase Storage

## Problème identifié
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
from origin 'https://locktix.github.io' has been blocked by CORS policy
```

## Solutions à appliquer

### 1. 🔥 Règles Firebase Storage (OBLIGATOIRE)

Allez dans [Firebase Console](https://console.firebase.google.com) → Storage → Rules

**Remplacez les règles par :**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /rooms/{allPaths=**} {
      allow read, write: if true;
    }
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

### 2. 🌐 Configuration CORS (si nécessaire)

Si le problème persiste, configurez CORS pour Firebase Storage :

1. **Installez Google Cloud SDK** (si pas déjà fait)
2. **Authentifiez-vous** : `gcloud auth login`
3. **Configurez le projet** : `gcloud config set project transfiles-4c5ca`
4. **Appliquez la configuration CORS** :

```bash
gsutil cors set cors-config.json gs://transfiles-4c5ca.firebasestorage.app
```

### 3. 🔍 Vérifications supplémentaires

#### Vérifier que Storage est activé
- Firebase Console → Storage → Vérifier que le bucket existe
- Vérifier que les règles sont publiées

#### Vérifier les domaines autorisés
- Firebase Console → Authentication → Settings → Authorized domains
- Ajouter `locktix.github.io` si nécessaire

### 4. 🧪 Test de la correction

1. **Ouvrir la console du navigateur** (F12)
2. **Tester l'upload d'un petit fichier**
3. **Vérifier qu'aucune erreur CORS n'apparaît**
4. **Tester le téléchargement**

### 5. 🚨 Si le problème persiste

#### Solution alternative : Utiliser Firebase Functions
Si CORS continue à poser problème, on peut utiliser Firebase Functions comme proxy :

```javascript
// firebase-functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.uploadFile = functions.https.onRequest((req, res) => {
  // Logique d'upload via Functions
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // ... logique d'upload
});
```

### 6. 📋 Checklist de résolution

- [ ] Règles Firebase Storage mises à jour
- [ ] Règles publiées dans Firebase Console
- [ ] Test d'upload d'un petit fichier
- [ ] Vérification console navigateur (pas d'erreurs CORS)
- [ ] Test de téléchargement
- [ ] Test sur différents navigateurs

### 7. 🔄 Redéploiement

Après modification des règles :
1. **Attendre 1-2 minutes** pour la propagation
2. **Vider le cache du navigateur** (Ctrl+F5)
3. **Tester à nouveau**

## 📞 Support

Si le problème persiste après ces étapes :
1. Vérifier les logs Firebase Console
2. Tester avec un autre navigateur
3. Vérifier la configuration du projet Firebase
