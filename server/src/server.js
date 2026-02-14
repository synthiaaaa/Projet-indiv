// ROUTE 2 : Inscription avec Nom/Prénom
app.post('/api/auth/register', (req, res) => {
    const { prenom, nom, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8); 
    
    db.run("INSERT INTO users (prenom, nom, email, password) VALUES (?, ?, ?, ?)", [prenom, nom, email, hashedPassword], function(err) {
        if (err) return res.status(400).json({ error: "Cet email existe déjà." });
        res.status(201).json({ message: "Utilisateur créé avec succès !" });
    });
});

// ROUTE 3 : Connexion (On renvoie le prénom pour le message de bienvenue)
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

// ROUTE 4 : Sauvegarder la commande et SIMULER L'EMAIL
app.post('/api/orders', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: "Accès refusé." });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Session invalide." });

        const { total } = req.body;
        db.run("INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)", [user.id, total, 'Validée'], function(err) {
            if (err) return res.status(500).json({ error: "Erreur serveur." });
            
            // SIMULATION DE L'EMAIL DANS LA CONSOLE DU SERVEUR
            console.log(`\n📧 [EMAIL ENVOYÉ] À: ${user.email}`);
            console.log(`Sujet: Confirmation de votre commande n°CMD-000${this.lastID}`);
            console.log(`Corps: Merci pour votre achat de ${total}€ sur La Petite Maison de l'Épouvante !\n`);

            res.status(201).json({ orderId: this.lastID, message: "Achat validé !" });
        });
    });
});