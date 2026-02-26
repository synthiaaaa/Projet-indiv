const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "boutique.db");
const db = new sqlite3.Database(dbPath);

function seedProducts() {
  const defaultProducts = [
    ["Gremlin de Compagnie", "Creature", 45.0, "Attention : ne pas nourrir apres minuit.", "/images/gremlin.jpg"],
    ["Citrouille Rigolarde", "Deco", 19.9, "Une lanterne qui raconte des blagues nulles.", "/images/citrouille.jpg"],
    ["Crane Memento Mori", "Accessoire", 29.99, "Ideal pour decorer votre crypte.", "/images/crane.jpg"],
    ["Bonbons Yeux Gluants", "Friandise", 5.5, "Ils vous regardent pendant que vous les mangez.", "/images/bonbons.jpg"],
  ];

  db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
    if (err) {
      console.error("Erreur seed products:", err.message);
      return;
    }

    if ((row?.count || 0) > 0) {
      return;
    }

    const stmt = db.prepare(
      "INSERT INTO products (name, type, price, description, image_url) VALUES (?, ?, ?, ?, ?)"
    );
    defaultProducts.forEach((product) => stmt.run(product));
    stmt.finalize();
  });
}

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prenom TEXT NOT NULL,
    nom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    verification_code TEXT,
    is_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  seedProducts();
});

module.exports = db;
