# 🚀 Guide de déploiement TransFiles

## Déploiement sur GitHub Pages

### 1. Préparation du repository

1. **Créer un repository GitHub**
   - Nom suggéré : `TransFiles` ou `transfiles`
   - Description : "Partage de fichiers en temps réel"
   - Public (pour GitHub Pages gratuit)

2. **Uploader les fichiers**
   ```
   TransFiles/
   ├── index.html
   ├── demo.html
   ├── styles.css
   ├── app.js
   ├── firebase-config.js
   ├── firebase-config-example.js
   ├── README.md
   ├── _config.yml
   └── .gitignore
   ```

### 2. Configuration GitHub Pages

1. **Aller dans Settings** du repository
2. **Scroller vers "Pages"** dans le menu de gauche
3. **Source** : Deploy from a branch
4. **Branch** : main (ou master)
5. **Folder** : / (root)
6. **Cliquer "Save"**

### 3. Configuration Firebase

1. **Aller sur [Firebase Console](https://console.firebase.google.com)**
2. **Créer un nouveau projet**
3. **Activer les services** :
   - Realtime Database
   - Storage
4. **Récupérer la configuration**
5. **Modifier `firebase-config.js`** avec vos vraies clés

### 4. Règles de sécurité Firebase

**Realtime Database :**
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

**Storage :**
```json
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /rooms/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

### 5. Test de l'application

1. **Ouvrir** `https://votre-username.github.io/TransFiles`
2. **Tester** la création de room
3. **Tester** le partage de texte
4. **Tester** l'upload de fichiers
5. **Tester** sur mobile

## 🔧 Configuration avancée

### Domaine personnalisé (optionnel)

1. **Ajouter un fichier CNAME** :
   ```
   votre-domaine.com
   ```
2. **Configurer DNS** chez votre hébergeur
3. **Activer HTTPS** dans GitHub Pages

### Optimisations

1. **Minification** (optionnel) :
   ```bash
   # Installer un minifier
   npm install -g html-minifier cssnano-cli
   
   # Minifier les fichiers
   html-minifier --collapse-whitespace index.html -o index.min.html
   cssnano styles.css styles.min.css
   ```

2. **Cache** : GitHub Pages gère automatiquement le cache

## 🐛 Dépannage

### Problèmes courants

1. **"Firebase not defined"**
   - Vérifier que les scripts Firebase sont chargés
   - Vérifier la configuration dans `firebase-config.js`

2. **"Permission denied"**
   - Vérifier les règles de sécurité Firebase
   - S'assurer que Database et Storage sont activés

3. **"Upload failed"**
   - Vérifier les règles Storage
   - Vérifier la taille des fichiers (limite 10MB)

4. **"Room not found"**
   - Vérifier la connexion à la base de données
   - Vérifier que les deux utilisateurs utilisent le même code

### Logs de débogage

Ouvrir la console du navigateur (F12) pour voir les erreurs détaillées.

## 📱 Test multi-appareils

1. **Ordinateur** : Test principal
2. **Mobile** : Test responsive
3. **Tablette** : Test interface adaptative
4. **Différents navigateurs** : Chrome, Firefox, Safari, Edge

## 🔄 Mise à jour

Pour mettre à jour l'application :

1. **Modifier les fichiers** localement
2. **Commit et push** vers GitHub
3. **GitHub Pages** se met à jour automatiquement
4. **Tester** la nouvelle version

## 📊 Monitoring

- **GitHub Insights** : Statistiques du repository
- **Firebase Analytics** : Utilisation de l'application
- **Console Firebase** : Logs et erreurs

## 🆘 Support

En cas de problème :

1. **Vérifier** la console du navigateur
2. **Consulter** les logs Firebase
3. **Tester** avec `demo.html` d'abord
4. **Vérifier** la configuration Firebase
