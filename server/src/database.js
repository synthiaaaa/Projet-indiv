const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crée un fichier "boutique.db" pour stocker les données
const dbPath = path.resolve(__dirname, 'boutique.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Table Utilisateurs
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    // 2. Table Commandes (Pour l'historique des achats)
    // 1. Table Utilisateurs (avec Nom et Prénom)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prenom TEXT,
        nom TEXT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    // 3. Table Produits
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT,
        price REAL,
        description TEXT,
        imageUrl TEXT
    )`);

    // Insérer les 4 produits au démarrage (S'ils n'y sont pas déjà)
    db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
        if (row && row.count === 0) {
            const insert = db.prepare(`INSERT INTO products (name, type, price, description, imageUrl) VALUES (?, ?, ?, ?, ?)`);
            insert.run("Figurine Funko Pop! - Eddie", "Figurine", 15.99, "La figurine de collection incontournable du héros du Hellfire Club.", "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&q=80");
            insert.run("Coffret Blu-ray 4K - Le Seigneur des Anneaux", "Film", 59.90, "L'intégrale de la trilogie en version longue et remasterisée 4K.", "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&q=80");
            insert.run("Comics - Batman : The Killing Joke", "Bande Dessinée", 15.00, "Le chef-d'œuvre absolu d'Alan Moore sur les origines du Joker.", "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=500&q=80");
            insert.run("Jeu de plateau - Mysterium", "Jeu de Société", 39.99, "Un jeu coopératif d'enquête et de fantômes, idéal pour vos soirées.", "https://placehold.co/500x500/6a1b9a/ffffff?text=Jeu+de+Plateau");
            insert.finalize();
        }
    });
});

module.exports = db;