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

// --- SECTION DIAGNOSTIC & SUPERVISION (BLOC 3) ---
// On liste les chemins possibles où le Frontend pourrait se trouver dans le conteneur
const possiblePaths = [
    path.join(__dirname, 'client/dist'), // Si buildé avec Vite
    path.join(__dirname, 'client'),      // Si fichiers bruts
    path.join(__dirname, '../client')    // Sécurité si structure décalée
];

let staticPath = possiblePaths.find(p => fs.existsSync(p));

console.log("📂 --- INSPECTION SRE ---");
console.log("📍 Répertoire courant :", __dirname);
console.log("🔎 Dossiers visibles :", fs.readdirSync(__dirname));

if (staticPath) {
    console.log("✅ SUCCÈS : Dossier frontend détecté à :", staticPath);
} else {
    console.log("❌ ERREUR CRITIQUE : Aucun dossier 'client' trouvé. Le site affichera 'Cannot GET'.");
}

// --- MIDDLEWARES (DEVSECOPS) ---
app.use(helmet({
    contentSecurityPolicy: false, // Autorise le chargement des scripts pour la démo
}));
app.use(cors());
app.use(express.json());

// --- SERVICE DES FICHIERS STATIQUES ---
if (staticPath) {
    app.use(express.static(staticPath));
}

// --- ROUTES API ---

app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/auth/register', (req, res) => {
    const { prenom, nom, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8); 
    db.run("INSERT INTO users (prenom, nom, email, password) VALUES (?, ?, ?, ?)", [prenom, nom, email, hashedPassword], function(err) {
        if (err) return res.status(400).json({ error: "Cet email existe déjà." });
        res.status(201).json({ message: "Utilisateur créé avec succès !" });
    });
});

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

app.post('/api/orders', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: "Accès refusé." });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Session invalide." });
        const { total } = req.body;
        db.run("INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)", [user.id, total, 'Validée'], function(err) {
            if (err) return res.status(500).json({ error: "Erreur base de données." });
            console.log(`📧 [SRE LOG] Commande confirmée pour : ${user.email}`);
            res.status(201).json({ orderId: this.lastID, message: "Commande enregistrée !" });
        });
    });
});

// --- ROUTE PAR DÉFAUT (FALLBACK FRONTEND) ---
// Cette route renvoie l'index.html pour toutes les requêtes non-API
app.get('*', (req, res) => {
    if (staticPath && fs.existsSync(path.join(staticPath, 'index.html'))) {
        res.sendFile(path.join(staticPath, 'index.html'));
    } else {
        res.status(404).send("<h1>Erreur 404</h1><p>Le Frontend n'est pas encore déployé ou accessible sur le serveur.</p>");
    }
});

module.exports = app;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Serveur opérationnel sur le port ${PORT}`);
    });
}

