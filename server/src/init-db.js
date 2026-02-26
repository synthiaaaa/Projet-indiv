const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'boutique.db');

// 1. ACTION SRE : Suppression de l'ancienne base
if (fs.existsSync(dbPath)) {
    console.log("🗑️ [SRE] Suppression de l'ancienne base de données...");
    fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("🦇 [SRE] Création des tables...");

    // Table Utilisateurs
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prenom TEXT,
        nom TEXT,
        email TEXT UNIQUE,
        password TEXT,
        verification_code TEXT,
        is_verified INTEGER DEFAULT 0
    )`);

    // Table Commandes
    db.run(`CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total_price REAL,
        status TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Table Produits
    db.run(`CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT,
        price REAL,
        description TEXT,
        image_url TEXT
    )`);

    console.log("📦 [SRE] Amorçage des données (Data Seeding) des produits...");
    
    // Insertion des articles par défaut
    const insertProduct = db.prepare("INSERT INTO products (name, type, price, description, image_url) VALUES (?, ?, ?, ?, ?)");
    
    insertProduct.run("Gremlin de Compagnie", "Créature", 45.00, "Attention : ne pas nourrir après minuit. Livré sans eau.", "/images/gremlin.jpg");
    insertProduct.run("Citrouille Rigolarde", "Déco", 19.90, "Une lanterne qui raconte des blagues nulles quand on passe devant.", "/images/citrouille.jpg");
    insertProduct.run("Crâne 'Memento Mori'", "Accessoire", 29.99, "Idéal pour décorer votre crypte ou pour jouer Hamlet.", "/images/crane.jpg");
    insertProduct.run("Bonbons 'Yeux Gluants'", "Friandise", 5.50, "Ils vous regardent pendant que vous les mangez. Goût Fraise.", "/images/bonbons.jpg");
    
    insertProduct.finalize();

    console.log("✅ [SRE] Base de données recréée et remplie avec succès !");
});

db.close();