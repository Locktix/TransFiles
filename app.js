// Application principale TransFiles
// Gestion du partage de fichiers et texte en temps réel

class TransFilesApp {
    constructor() {
        // Éléments DOM
        this.roomIdInput = document.getElementById('roomId');
        this.joinRoomBtn = document.getElementById('joinRoom');
        this.createRoomBtn = document.getElementById('createRoom');
        this.roomStatus = document.getElementById('roomStatus');
        
        this.textInput = document.getElementById('textInput');
        this.sendTextBtn = document.getElementById('sendText');
        
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
        
        // Références Firebase
        this.database = window.firebaseConfig.database;
        this.storage = window.firebaseConfig.storage;
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
        
        // Gestionnaire pour les boutons de copie (délégation d'événements)
        this.receivedContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy')) {
                const copyText = e.target.getAttribute('data-copy-text');
                if (copyText) {
                    this.copyToClipboard(copyText);
                }
            }
        });
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
            timestamp: Date.now(),
            sender: 'Vous'
        };
        
        this.saveToRoom(textData);
        this.textInput.value = '';
        this.showNotification('Texte envoyé !', 'success');
    }
    
    // === GESTION DES FICHIERS ===
    
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
        
        // Vérifier la taille (limite de 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.showNotification('Fichier trop volumineux (max 10MB)', 'error');
            return;
        }
        
        this.currentFile = file;
        this.fileName.textContent = file.name;
        this.fileInfo.style.display = 'flex';
        this.fileDropZone.style.display = 'none';
        
        this.showNotification(`Fichier sélectionné : ${file.name}`, 'info');
    }
    
    // Envoyer un fichier
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
            this.showNotification('Upload en cours...', 'info');
            
            // Vérifier la taille du fichier (limite 10MB)
            const maxSize = 10 * 1024 * 1024;
            if (this.currentFile.size > maxSize) {
                this.showNotification('Fichier trop volumineux (max 10MB)', 'error');
                return;
            }
            
            // Upload vers Firebase Storage avec gestion d'erreurs améliorée
            const fileName = `${Date.now()}_${this.currentFile.name}`;
            const storageRef = this.storage.ref(`rooms/${this.currentRoom}/${fileName}`);
            
            // Configuration de l'upload avec métadonnées
            const metadata = {
                contentType: this.currentFile.type,
                customMetadata: {
                    originalName: this.currentFile.name,
                    roomId: this.currentRoom
                }
            };
            
            const uploadTask = storageRef.put(this.currentFile, metadata);
            
            // Suivi du progrès
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    this.showNotification(`Upload: ${Math.round(progress)}%`, 'info');
                },
                (error) => {
                    console.error('Erreur upload:', error);
                    if (error.code === 'storage/unauthorized') {
                        this.showNotification('Erreur d\'autorisation. Vérifiez les règles Firebase Storage.', 'error');
                    } else if (error.code === 'storage/canceled') {
                        this.showNotification('Upload annulé', 'error');
                    } else {
                        this.showNotification(`Erreur upload: ${error.message}`, 'error');
                    }
                },
                async () => {
                    try {
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        
                        const fileData = {
                            type: 'file',
                            name: this.currentFile.name,
                            size: this.currentFile.size,
                            url: downloadURL,
                            timestamp: Date.now(),
                            sender: 'Vous'
                        };
                        
                        this.saveToRoom(fileData);
                        this.resetFileSelection();
                        this.showNotification('Fichier envoyé !', 'success');
                    } catch (urlError) {
                        console.error('Erreur récupération URL:', urlError);
                        this.showNotification('Erreur lors de la récupération du lien', 'error');
                    }
                }
            );
            
        } catch (error) {
            console.error('Erreur upload:', error);
            this.showNotification('Erreur lors de l\'upload', 'error');
        }
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
            // Stocker le contenu original dans un attribut data pour éviter les problèmes d'échappement
            item.setAttribute('data-content', data.content);
            
            item.innerHTML = `
                <div class="item-header">
                    <span class="item-type">📝 Texte</span>
                    <span class="item-timestamp">${timestamp}</span>
                </div>
                <div class="item-content">
                    <pre>${this.escapeHtml(data.content)}</pre>
                </div>
                <div class="item-actions">
                    <button class="action-btn copy" data-copy-text="${this.escapeHtml(data.content)}">
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
                    <p><strong>Nom :</strong> ${this.escapeHtml(data.name)}</strong></p>
                    <p><strong>Taille :</strong> ${sizeText}</p>
                </div>
                <div class="item-actions">
                    <a href="${data.url}" download="${data.name}" class="action-btn download">
                        📥 Télécharger
                    </a>
                </div>
            `;
        }
        
        return item;
    }
    
    // === UTILITAIRES ===
    
    // Copier dans le presse-papiers
    async copyToClipboard(text) {
        try {
            // Décoder le HTML échappé si nécessaire
            const decodedText = this.decodeHtmlEntities(text);
            await navigator.clipboard.writeText(decodedText);
            this.showNotification('Copié dans le presse-papiers !', 'success');
        } catch (error) {
            // Fallback pour les navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = this.decodeHtmlEntities(text);
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
    
    // Décoder les entités HTML
    decodeHtmlEntities(text) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    }
    
    // Formater la taille de fichier
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TransFilesApp();
});
