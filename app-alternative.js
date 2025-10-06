// Version alternative de app.js qui évite les problèmes CORS
// en utilisant Base64 au lieu de Firebase Storage

class TransFilesAppAlternative {
    constructor() {
        // Éléments DOM
        this.roomIdInput = document.getElementById('roomId');
        this.joinRoomBtn = document.getElementById('joinRoom');
        this.createRoomBtn = document.getElementById('createRoom');
        this.roomStatus = document.getElementById('roomStatus');
        
        this.textInput = document.getElementById('textInput');
        this.sendTextBtn = document.getElementById('sendText');
        this.languageSelect = document.getElementById('languageSelect');
        
        this.fileDropZone = document.getElementById('fileDropZone');
        this.fileInput = document.getElementById('fileInput');
        this.fileInputBtn = document.getElementById('fileInputBtn');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.sendFileBtn = document.getElementById('sendFile');
        
        this.receivedContent = document.getElementById('receivedContent');
        this.notification = document.getElementById('notification');
        
        // État de l'application
        this.currentRoom = null;
        this.currentFile = null;
        this.isConnected = false;
        
        // Références Firebase (seulement pour la base de données)
        this.database = window.firebaseConfig.database;
        this.generateRoomId = window.firebaseConfig.generateRoomId;
        this.isValidRoomId = window.firebaseConfig.isValidRoomId;
        
        this.init();
    }
    
    // Initialisation de l'application
    init() {
        this.setupEventListeners();
        this.showNotification('Application prête ! Créez ou rejoignez une room.', 'info');
    }
    
    // Configuration des événements
    setupEventListeners() {
        // Gestion des rooms
        this.joinRoomBtn.addEventListener('click', () => this.joinRoom());
        this.createRoomBtn.addEventListener('click', () => this.createRoom());
        this.roomIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinRoom();
        });
        
        // Gestion du texte
        this.sendTextBtn.addEventListener('click', () => this.sendText());
        this.textInput.addEventListener('keypress', (e) => {
            if (e.ctrlKey && e.key === 'Enter') this.sendText();
        });
        
        // Gestion des fichiers
        this.fileInputBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        this.sendFileBtn.addEventListener('click', () => this.sendFile());
        
        // Drag & Drop
        this.fileDropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.fileDropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.fileDropZone.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Clic sur la zone de drop
        this.fileDropZone.addEventListener('click', () => this.fileInput.click());
    }
    
    // === GESTION DES ROOMS ===
    
    // Créer une nouvelle room
    createRoom() {
        const roomId = this.generateRoomId();
        this.roomIdInput.value = roomId;
        this.joinRoom(roomId);
        this.showNotification(`Room créée : ${roomId}`, 'success');
    }
    
    // Rejoindre une room
    joinRoom(roomId = null) {
        const id = roomId || this.roomIdInput.value.trim().toUpperCase();
        
        if (!this.isValidRoomId(id)) {
            this.showNotification('Code de room invalide. Utilisez 6 caractères (A-Z, 0-9)', 'error');
            return;
        }
        
        // Vider le contenu reçu lors du changement de room
        this.clearReceivedContent();
        
        this.currentRoom = id;
        this.setupRoomListener();
        this.updateRoomStatus(true);
        this.showNotification(`Connecté à la room : ${id}`, 'success');
    }
    
    // Écouter les changements dans la room
    setupRoomListener() {
        const roomRef = this.database.ref(`rooms/${this.currentRoom}`);
        
        roomRef.on('child_added', (snapshot) => {
            const data = snapshot.val();
            this.displayReceivedContent(data);
        });
        
        roomRef.on('child_changed', (snapshot) => {
            const data = snapshot.val();
            this.updateReceivedContent(snapshot.key, data);
        });
    }
    
    // === GESTION DU TEXTE ===
    
    // Envoyer du texte
    sendText() {
        const text = this.textInput.value.trim();
        
        if (!text) {
            this.showNotification('Veuillez saisir du texte', 'error');
            return;
        }
        
        if (!this.isConnected) {
            this.showNotification('Veuillez d\'abord rejoindre une room', 'error');
            return;
        }
        
        const textData = {
            type: 'text',
            content: text,
            language: this.languageSelect.value,
            timestamp: Date.now(),
            sender: 'Vous'
        };
        
        this.saveToRoom(textData);
        this.textInput.value = '';
        this.showNotification('Texte envoyé !', 'success');
    }
    
    // === GESTION DES FICHIERS (VERSION ALTERNATIVE) ===
    
    // Gestion du drag & drop
    handleDragOver(e) {
        e.preventDefault();
        this.fileDropZone.classList.add('drag-over');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.fileDropZone.classList.remove('drag-over');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.fileDropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFileSelect(files[0]);
        }
    }
    
    // Sélection de fichier
    handleFileSelect(file) {
        if (!file) return;
        
        // Vérifier la taille (limite de 5MB pour Base64)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            this.showNotification('Fichier trop volumineux (max 5MB pour cette méthode)', 'error');
            return;
        }
        
        this.currentFile = file;
        this.fileName.textContent = file.name;
        this.fileInfo.style.display = 'flex';
        this.fileDropZone.style.display = 'none';
        
        this.showNotification(`Fichier sélectionné : ${file.name}`, 'info');
    }
    
    // Envoyer un fichier (version Base64)
    async sendFile() {
        if (!this.currentFile) {
            this.showNotification('Aucun fichier sélectionné', 'error');
            return;
        }
        
        if (!this.isConnected) {
            this.showNotification('Veuillez d\'abord rejoindre une room', 'error');
            return;
        }
        
        try {
            this.showNotification('Conversion en cours...', 'info');
            
            // Convertir le fichier en Base64
            const base64 = await this.fileToBase64(this.currentFile);
            
            const fileData = {
                type: 'file',
                name: this.currentFile.name,
                size: this.currentFile.size,
                mimeType: this.currentFile.type,
                data: base64, // Stockage direct en Base64
                timestamp: Date.now(),
                sender: 'Vous'
            };
            
            this.saveToRoom(fileData);
            this.resetFileSelection();
            this.showNotification('Fichier envoyé !', 'success');
            
        } catch (error) {
            console.error('Erreur conversion:', error);
            this.showNotification('Erreur lors de la conversion', 'error');
        }
    }
    
    // Convertir un fichier en Base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    // Réinitialiser la sélection de fichier
    resetFileSelection() {
        this.currentFile = null;
        this.fileInfo.style.display = 'none';
        this.fileDropZone.style.display = 'block';
        this.fileInput.value = '';
    }
    
    // === GESTION DE LA BASE DE DONNÉES ===
    
    // Sauvegarder dans la room
    saveToRoom(data) {
        const roomRef = this.database.ref(`rooms/${this.currentRoom}`);
        roomRef.push(data);
    }
    
    // === AFFICHAGE DU CONTENU REÇU ===
    
    // Vider le contenu reçu
    clearReceivedContent() {
        this.receivedContent.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <p>En attente de contenu...</p>
                <p><small>Room ${this.currentRoom || 'nouvelle'}</small></p>
            </div>
        `;
    }
    
    // Afficher le contenu reçu
    displayReceivedContent(data) {
        // Supprimer l'état vide s'il existe
        const emptyState = this.receivedContent.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        const item = this.createReceivedItem(data);
        this.receivedContent.appendChild(item);
        this.scrollToBottom();
    }
    
    // Mettre à jour le contenu reçu
    updateReceivedContent(key, data) {
        const existingItem = this.receivedContent.querySelector(`[data-key="${key}"]`);
        if (existingItem) {
            existingItem.remove();
        }
        this.displayReceivedContent(data);
    }
    
    // Créer un élément reçu
    createReceivedItem(data) {
        const item = document.createElement('div');
        item.className = `received-item ${data.type}`;
        item.setAttribute('data-key', data.timestamp);
        
        const timestamp = new Date(data.timestamp).toLocaleString('fr-FR');
        
        if (data.type === 'text') {
            const language = data.language || 'text';
            const languageLabel = this.getLanguageLabel(language);
            const languageIcon = this.getLanguageIcon(language);
            
            item.innerHTML = `
                <div class="item-header">
                    <span class="item-type">${languageIcon} ${languageLabel}</span>
                    <span class="item-timestamp">${timestamp}</span>
                </div>
                <div class="item-content">
                    <pre class="language-${language}">${this.escapeHtml(data.content)}</pre>
                </div>
                <div class="item-actions">
                    <button class="action-btn copy" onclick="app.copyToClipboard('${this.escapeHtml(data.content)}')">
                        📋 Copier
                    </button>
                </div>
            `;
        } else if (data.type === 'file') {
            const sizeText = this.formatFileSize(data.size);
            item.innerHTML = `
                <div class="item-header">
                    <span class="item-type">📎 Fichier</span>
                    <span class="item-timestamp">${timestamp}</span>
                </div>
                <div class="item-content">
                    <p><strong>Nom :</strong> ${this.escapeHtml(data.name)}</p>
                    <p><strong>Taille :</strong> ${sizeText}</p>
                    <p><strong>Type :</strong> ${data.mimeType || 'Inconnu'}</p>
                </div>
                <div class="item-actions">
                    <button class="action-btn download" onclick="app.downloadBase64File('${data.data}', '${data.name}', '${data.mimeType}')">
                        📥 Télécharger
                    </button>
                </div>
            `;
        }
        
        return item;
    }
    
    // Télécharger un fichier Base64
    downloadBase64File(base64Data, fileName, mimeType) {
        try {
            // Créer un lien de téléchargement
            const link = document.createElement('a');
            link.href = base64Data;
            link.download = fileName;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('Fichier téléchargé !', 'success');
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            this.showNotification('Erreur lors du téléchargement', 'error');
        }
    }
    
    // === UTILITAIRES ===
    
    // Copier dans le presse-papiers
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Copié dans le presse-papiers !', 'success');
        } catch (error) {
            // Fallback pour les navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Copié dans le presse-papiers !', 'success');
        }
    }
    
    // Échapper le HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Formater la taille de fichier
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Obtenir le label de la langue
    getLanguageLabel(language) {
        const labels = {
            'text': 'Texte',
            'javascript': 'JavaScript',
            'java': 'Java',
            'python': 'Python',
            'html': 'HTML',
            'css': 'CSS',
            'sql': 'SQL',
            'json': 'JSON',
            'xml': 'XML',
            'bash': 'Bash/Shell',
            'cpp': 'C++',
            'csharp': 'C#',
            'php': 'PHP',
            'ruby': 'Ruby',
            'go': 'Go',
            'rust': 'Rust'
        };
        return labels[language] || 'Texte';
    }
    
    // Obtenir l'icône de la langue
    getLanguageIcon(language) {
        const icons = {
            'text': '📝',
            'javascript': '🟨',
            'java': '☕',
            'python': '🐍',
            'html': '🌐',
            'css': '🎨',
            'sql': '🗄️',
            'json': '📋',
            'xml': '📄',
            'bash': '💻',
            'cpp': '⚡',
            'csharp': '🔷',
            'php': '🐘',
            'ruby': '💎',
            'go': '🐹',
            'rust': '🦀'
        };
        return icons[language] || '📝';
    }
    
    // Faire défiler vers le bas
    scrollToBottom() {
        this.receivedContent.scrollTop = this.receivedContent.scrollHeight;
    }
    
    // Mettre à jour le statut de la room
    updateRoomStatus(connected) {
        this.isConnected = connected;
        this.roomStatus.textContent = connected ? `Connecté à ${this.currentRoom}` : 'Non connecté';
        this.roomStatus.className = connected ? 'room-status connected' : 'room-status';
    }
    
    // Afficher une notification
    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
}

// Fonction pour afficher les informations "À propos"
function showAbout() {
    const aboutInfo = `
📁 TransFiles v1.0.0

🎯 Objectif :
Application web pour le partage de fichiers et texte en temps réel entre étudiants.

✨ Fonctionnalités :
• Partage de texte instantané
• Upload de fichiers (drag & drop)
• Système de rooms partagées
• Interface responsive
• Temps réel avec Firebase

🛠️ Technologies :
• HTML5, CSS3, JavaScript
• Firebase Realtime Database
• Firebase Storage (version alternative)
• GitHub Pages

👨‍💻 Développé par :
Alan P. - Étudiant HELMO

📄 Licence : MIT
🔗 GitHub : https://github.com/locktix/TransFiles
    `;
    
    alert(aboutInfo);
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TransFilesAppAlternative();
});
