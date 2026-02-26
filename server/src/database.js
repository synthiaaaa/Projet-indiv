const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'boutique.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // ⚠️ CHANGEMENT : On nomme la table 'users_v2' pour forcer la mise à jour des colonnes
    db.run(`CREATE TABLE IF NOT EXISTS users_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prenom TEXT,
        nom TEXT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total_price REAL,
        status TEXT,
        FOREIGN KEY(user_id) REFERENCES users_v2(id)
    )`);
    
    console.log("🦇 [SRE] Base de données (users_v2) initialisée.");
});

module.exports = db;