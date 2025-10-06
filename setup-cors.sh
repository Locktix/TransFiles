#!/bin/bash
# Script pour configurer CORS sur Firebase Storage

echo "🔧 Configuration CORS pour TransFiles..."

# Configuration CORS
cat > cors-config.json << EOF
[
  {
    "origin": ["https://locktix.github.io", "https://*.github.io", "http://localhost:*"],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin", "Access-Control-Allow-Methods"]
  }
]
EOF

echo "📝 Configuration CORS créée..."

# Appliquer la configuration
echo "🚀 Application de la configuration CORS..."
gsutil cors set cors-config.json gs://transfiles-4c5ca.firebasestorage.app

echo "✅ Configuration CORS appliquée !"
echo "🔄 Attendez 1-2 minutes pour la propagation..."

# Nettoyer
rm cors-config.json

echo "🎉 Terminé ! Testez maintenant l'upload de fichiers."
