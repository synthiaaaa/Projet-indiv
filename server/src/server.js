const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const db = require('./database'); 

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = "cle_secrete_pour_le_jury"; 

app.use(helmet());
app.use(cors());
app.use(express.json());

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

// ROUTE 4 : Sauvegarder la commande et simuler l'Email
app.post('/api/orders', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: "Accès refusé. Veuillez vous connecter." });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Session expirée ou invalide." });

        const { total } = req.body;
        db.run("INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)", [user.id, total, 'Validée'], function(err) {
            if (err) return res.status(500).json({ error: "Erreur serveur." });
            
            // SIMULATION DE L'EMAIL DANS LA CONSOLE
            console.log(`\n📧 [EMAIL ENVOYÉ] À: ${user.email}`);
            console.log(`Sujet: Confirmation de votre commande n°CMD-000${this.lastID}`);
            console.log(`Corps: Merci pour votre achat de ${total}€ sur La Petite Maison de l'Épouvante !\n`);

            res.status(201).json({ orderId: this.lastID, message: "Achat ajouté à l'historique en base de données !" });
        });
    });
});

// Export de l'application (Nécessaire pour les tests Jest)
module.exports = app;

// Démarrage du serveur si on n'est pas en train de faire un test
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Serveur DevSecOps démarré sur le port ${PORT}`));
}