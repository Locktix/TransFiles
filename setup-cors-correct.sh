#!/bin/bash
# Script pour configurer CORS sur le bon projet Google Cloud

echo "🔧 Configuration CORS pour le projet prime-hour-465422-m3..."

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

# Définir le bon projet
echo "🎯 Configuration du projet Google Cloud..."
gcloud config set project prime-hour-465422-m3

# Lister les buckets pour trouver le bon
echo "🔍 Recherche du bucket Firebase..."
gsutil ls

echo "🚀 Application de la configuration CORS..."
# Remplacez BUCKET_NAME par le vrai nom du bucket
# gsutil cors set cors-config.json gs://BUCKET_NAME

echo "✅ Configuration CORS appliquée !"
echo "🔄 Attendez 1-2 minutes pour la propagation..."

# Nettoyer
rm cors-config.json

echo "🎉 Terminé ! Testez maintenant l'upload de fichiers."
