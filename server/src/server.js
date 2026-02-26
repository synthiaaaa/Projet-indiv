const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database");

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(403).json({ error: "Jeton JWT manquant." });
  }

  const token = header.slice("Bearer ".length);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Jeton JWT invalide." });
  }
}

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP", uptimeSec: process.uptime() });
});

app.get("/ready", async (_req, res) => {
  try {
    await get("SELECT 1 AS ok");
    res.status(200).json({ ready: true });
  } catch (_err) {
    res.status(503).json({ ready: false });
  }
});

app.get("/metrics", async (_req, res) => {
  try {
    const users = await get("SELECT COUNT(*) AS count FROM users");
    const products = await get("SELECT COUNT(*) AS count FROM products");
    const orders = await get("SELECT COUNT(*) AS count FROM orders");
    const revenue = await get("SELECT COALESCE(SUM(total_price), 0) AS total FROM orders");

    res.status(200).json({
      indicators: {
        users: users?.count || 0,
        products: products?.count || 0,
        orders: orders?.count || 0,
        revenue: Number(revenue?.total || 0),
      },
    });
  } catch (_err) {
    res.status(500).json({ error: "Impossible de calculer les indicateurs." });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { prenom, nom, email, password } = req.body || {};
  const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

  if (!prenom || !nom || !email || !password) {
    return res.status(400).json({ error: "Champs obligatoires manquants." });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: "Mot de passe trop faible." });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const normalizedEmail = email.toLowerCase();
  try {
    try {
      await run(
        "INSERT INTO users (prenom, nom, email, password, verification_code, is_verified) VALUES (?, ?, ?, ?, ?, ?)",
        [prenom, nom, normalizedEmail, hashedPassword, "verified", 1]
      );
    } catch (err) {
      const message = String(err.message || "");
      /* istanbul ignore next */
      const legacySchema =
        message.includes("no column named verification_code") ||
        message.includes("no column named is_verified");
      if (!legacySchema) throw err;

      // Backward compatibility for old SQLite schema without verification fields.
      /* istanbul ignore next */
      await run("INSERT INTO users (prenom, nom, email, password) VALUES (?, ?, ?, ?)", [
        prenom,
        nom,
        normalizedEmail,
        hashedPassword,
      ]);
    }
    return res.status(201).json({ message: "Compte cree. Vous pouvez vous connecter." });
  } catch (err) {
    const message = String(err.message || "");
    if (message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Email deja utilise." });
    }
    /* istanbul ignore next */
    if (message.includes("SQLITE_BUSY")) {
      return res.status(503).json({ error: "Service temporairement indisponible. Reessayez." });
    }
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  try {
    const user = await get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
    if (!user) return res.status(401).json({ error: "Identifiants invalides." });
    /* istanbul ignore next */
    if (Object.prototype.hasOwnProperty.call(user, "is_verified") && !user.is_verified) {
      return res.status(403).json({ error: "Compte non verifie." });
    }

    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(401).json({ error: "Identifiants invalides." });

    const token = jwt.sign({ id: user.id, email: user.email, prenom: user.prenom }, JWT_SECRET, { expiresIn: "2h" });
    return res.status(200).json({ token, prenom: user.prenom });
  } catch (_err) {
    return res.status(500).json({ error: "Erreur serveur." });
  }
});

app.get("/api/products", async (_req, res) => {
  try {
    const products = await all("SELECT id, name, type, price, description, image_url FROM products");
    return res.status(200).json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        price: p.price,
        description: p.description,
        imageUrl: p.image_url,
      }))
    );
  } catch (_err) {
    return res.status(500).json({ error: "Erreur base de donnees." });
  }
});

app.post("/api/orders", authRequired, async (req, res) => {
  const total = Number(req.body?.total);
  if (!Number.isFinite(total) || total <= 0) {
    return res.status(400).json({ error: "Montant invalide." });
  }

  try {
    const result = await run("INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)", [
      req.user.id,
      total,
      "created",
    ]);
    return res.status(201).json({ message: "Commande enregistree.", orderId: result.lastID });
  } catch (_err) {
    return res.status(500).json({ error: "Erreur lors de la commande." });
  }
});

let server;
if (require.main === module) {
  server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`API started on 0.0.0.0:${PORT}`);
  });
}

module.exports = { app, server };
