const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const path = require('path'); // Nécessaire pour gérer les chemins de fichiers
const db = require('./database'); 

const fs = require('fs');
console.log("📂 Contenu du dossier actuel :", fs.readdirSync(__dirname));
if (fs.existsSync(path.join(__dirname, 'client'))) {
    console.log("✅ Dossier client trouvé !");
} else {
    console.log("❌ Dossier client INTROUVABLE à côté de server.js");
}

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = "cle_secrete_pour_le_jury"; 

// --- MIDDLEWARES DE SÉCURITÉ ET CONFIGURATION ---
app.use(helmet({
    contentSecurityPolicy: false, // Désactivé pour faciliter l'affichage du front en démo
}));
app.use(cors());
app.use(express.json());

// --- CONFIGURATION POUR LE FRONTEND (CRUCIAL POUR TON MASTER) ---
// On indique à Express de servir les fichiers statiques du dossier 'client'
// Ce dossier doit être placé dans le dossier 'server' pour être trouvé
app.use(express.static(path.join(__dirname, 'client')));

// --- ROUTES API ---

// ROUTE 1 : Récupérer les produits 
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ROUTE 2 : Inscription avec Nom/Prénom
app.post('/api/auth/register', (req, res) => {
    const { prenom, nom, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8); 
    
    db.run("INSERT INTO users (prenom, nom, email, password) VALUES (?, ?, ?, ?)", [prenom, nom, email, hashedPassword], function(err) {
        if (err) return res.status(400).json({ error: "Cet email existe déjà en base de données." });
        res.status(201).json({ message: "Utilisateur créé avec succès !" });
    });
});

// ROUTE 3 : Connexion (Vérification et création du Jeton JWT)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err || !user) return res.status(401).json({ error: "Utilisateur introuvable." });
        
        const isValid = bcrypt.compareSync(password, user.password); 
        if (!isValid) return res.status(401).json({ error: "Mot de passe incorrect." });

        const token = jwt.sign({ id: user.id, email: user.email, prenom: user.prenom }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ token, prenom: user.prenom, message: "Connexion réussie !" });
    });
});

// ROUTE 4 : Sauvegarder la commande
app.post('/api/orders', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: "Accès refusé. Veuillez vous connecter." });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Session expirée ou invalide." });

        const { total } = req.body;
        db.run("INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)", [user.id, total, 'Validée'], function(err) {
            if (err) return res.status(500).json({ error: "Erreur serveur." });
            
            console.log(`\n📧 [EMAIL ENVOYÉ] À: ${user.email}`);
            console.log(`Sujet: Confirmation de votre commande n°CMD-000${this.lastID}`);
            res.status(201).json({ orderId: this.lastID, message: "Achat ajouté à l'historique !" });
        });
    });
});

// --- REDIRECTION FINALE POUR LE FRONTEND ---
// Pour toute requête qui n'est pas une API, on renvoie l'index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Export de l'application (Nécessaire pour les tests Jest)
module.exports = app;

// Démarrage du serveur si on n'est pas en train de faire un test
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Serveur DevSecOps démarré sur le port ${PORT}`));
}