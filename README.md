# 📁 TransFiles - Partage de fichiers en temps réel

Une application web simple permettant à deux utilisateurs de partager des fichiers, du texte ou du code en temps réel via une interface intuitive.

## ✨ Fonctionnalités

- **Partage en temps réel** : Texte et fichiers partagés instantanément
- **Interface intuitive** : Deux zones claires (envoi/réception)
- **Drag & Drop** : Glissez-déposez vos fichiers facilement
- **Système de rooms** : Partagez un code pour vous connecter
- **Responsive** : Fonctionne sur ordinateur et mobile
- **Sans authentification** : Aucun compte requis

## 🚀 Utilisation

1. **Créer une room** : Cliquez sur "Nouvelle Room" pour générer un code
2. **Partager le code** : Donnez le code à votre partenaire
3. **Rejoindre** : L'autre personne saisit le code et clique "Rejoindre"
4. **Partager** : Envoyez du texte ou des fichiers instantanément !

## 🛠️ Configuration Firebase

Pour utiliser l'application, vous devez configurer Firebase :

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com)
2. Activez **Realtime Database** et **Storage**
3. Récupérez vos clés de configuration
4. Remplacez les valeurs dans `firebase-config.js`

### Configuration des règles Firebase

**Realtime Database (règles) :**
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

**Storage (règles) :**
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

## 📁 Structure du projet

```
TransFiles/
├── index.html          # Page principale
├── styles.css          # Styles CSS
├── app.js             # Logique de l'application
├── firebase-config.js # Configuration Firebase
└── README.md          # Documentation
```

## 🎨 Interface

- **Zone d'envoi** : Saisie de texte et upload de fichiers
- **Zone de réception** : Affichage du contenu partagé
- **Gestion des rooms** : Création et connexion aux sessions
- **Notifications** : Retour visuel sur les actions

## 🔧 Fonctionnalités techniques

- **Firebase Realtime Database** : Synchronisation en temps réel
- **Firebase Storage** : Stockage des fichiers
- **Drag & Drop API** : Interface intuitive
- **Clipboard API** : Copie facile du texte
- **Responsive Design** : Adaptation mobile

## 📱 Compatibilité

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile et desktop
- ✅ GitHub Pages
- ✅ Pas de backend requis

## 🚀 Déploiement sur GitHub Pages

1. Créez un repository GitHub
2. Uploadez tous les fichiers
3. Activez GitHub Pages dans les paramètres
4. Votre app sera disponible sur `https://votre-username.github.io/TransFiles`

## 📝 Notes pour les développeurs

- Code commenté pour faciliter la compréhension
- Structure modulaire et extensible
- Gestion d'erreurs intégrée
- Interface responsive avec CSS Grid/Flexbox

## 🤝 Contribution

Ce projet est conçu pour être simple et modifiable par des étudiants débutants. N'hésitez pas à proposer des améliorations !

## 📄 Licence

MIT License - Libre d'utilisation et de modification.
