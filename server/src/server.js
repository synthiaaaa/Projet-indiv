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

// --- SÉCURITÉ ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// --- SUPERVISION SRE : SERVIR LE FRONTEND ---
const clientPath = path.join(__dirname, '..', '..', 'client'); 
console.log("📂 [SRE] Recherche du Frontend à :", clientPath);

if (fs.existsSync(clientPath)) {
    console.log("✅ [SRE] Frontend détecté avec succès.");
    app.use(express.static(clientPath));
} else {
    console.log("❌ [SRE] Frontend introuvable en mode statique.");
}

// --- ROUTES API ---

app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ROUTE : Inscription avec Validation de Mot de Passe
app.post('/api/auth/register', (req, res) => {
    console.log("📥 [SRE] Tentative d'inscription reçue :", req.body);
    const { prenom, nom, email, password } = req.body;
    
    if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis." });

    // SÉCURITÉ : Validation de la complexité du mot de passe
    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial." 
        });
    }

    const hashedPassword = bcrypt.hashSync(password, 8); 
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    db.run("INSERT INTO users (prenom, nom, email, password, verification_code, is_verified) VALUES (?, ?, ?, ?, ?, 0)", 
    [prenom, nom, email, hashedPassword, verificationCode], function(err) {
        if (err) {
            console.error("❌ [ERREUR SQL INSCRIPTION] :", err.message); 
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }
        
        console.log(`\n🦇 [EMAIL ENVOYÉ] À: ${email}`);
        console.log(`Code secret : ${verificationCode}\n`);

        res.status(201).json({ message: "Veuillez vérifier votre email pour le code secret !" });
    });
});

// ROUTE : Vérification du code OTP
app.post('/api/auth/verify', (req, res) => {
    const { email, code } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err || !user) return res.status(400).json({ error: "Utilisateur introuvable." });
        if (user.verification_code !== code) return res.status(400).json({ error: "Code d'invocation incorrect 🧙‍♂️." });

        db.run("UPDATE users SET is_verified = 1, verification_code = NULL WHERE email = ?", [email], (err) => {
            if (err) return res.status(500).json({ error: "Erreur lors de la validation." });
            console.log(`✅ [SRE] Compte vérifié et activé pour : ${email}`);
            res.json({ message: "Pacte scellé ! Vous pouvez vous connecter." });
        });
    });
});

// ROUTE : Connexion
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err || !user) return res.status(401).json({ error: "Utilisateur introuvable." });
        if (user.is_verified === 0) return res.status(403).json({ error: "Veuillez d'abord vérifier votre compte avec le code reçu par email." });

        const isValid = bcrypt.compareSync(password, user.password); 
        if (!isValid) return res.status(401).json({ error: "Mot de passe incorrect." });

        const token = jwt.sign({ id: user.id, email: user.email, prenom: user.prenom }, SECRET_KEY, { expiresIn: '2h' });
        res.json({ token, prenom: user.prenom, message: "Connexion réussie !" });
    });
});

// ROUTE : Commandes
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
            console.log(`Sujet: Confirmation de votre commande n°EPOUVANTE-000${this.lastID}`);
            console.log(`Corps: Merci pour votre achat de ${total}€ !\n`);

            res.status(201).json({ orderId: this.lastID, message: "Achat ajouté à l'historique en base de données !" });
        });
    });
});

app.get('*', (req, res) => {
    if (fs.existsSync(path.join(clientPath, 'index.html'))) {
        res.sendFile(path.join(clientPath, 'index.html'));
    } else {
        res.status(404).send("Erreur 404 : Frontend non trouvé.");
    }
});

module.exports = app;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`🚀 Serveur DevSecOps démarré sur le port ${PORT}`));
}