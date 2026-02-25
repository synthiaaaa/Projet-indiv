const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const path = require('path'); 
const fs = require('fs');
const db = require('./database'); 

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = "cle_secrete_pour_le_jury"; 

// --- SECTION DIAGNOSTIC SRE (MISE À JOUR) ---
// Puisque server.js est dans /src, on remonte vers le parent pour trouver /client
const rootPath = path.join(__dirname, '..', 'client', 'dist'); // Le dossier /server
const clientPath = path.join(rootPath, 'client');

console.log("📂 --- INSPECTION SRE ---");
console.log("📍 Répertoire du script :", __dirname);
console.log("📍 Répertoire racine attendu :", rootPath);
console.log("🔎 Contenu de la racine :", fs.readdirSync(rootPath));

if (fs.existsSync(clientPath)) {
    console.log("✅ SUCCÈS : Dossier 'client' détecté à :", clientPath);
} else {
    console.log("❌ ERREUR : 'client' introuvable. Vérifie ton Dockerfile !");
}

// --- MIDDLEWARES ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// --- SERVICE DU FRONTEND ---
app.use(express.static(clientPath));

// --- ROUTES API ---
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// (Garde ici tes autres routes auth/register/login/orders...)

// --- ROUTE PAR DÉFAUT (FALLBACK) ---
app.get('*', (req, res) => {
    const indexPath = path.join(clientPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("<h1>Projet Master - Erreur 404</h1><p>Le fichier index.html est introuvable.</p>");
    }
});

module.exports = app;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`🚀 Serveur opérationnel sur le port ${PORT}`));
}