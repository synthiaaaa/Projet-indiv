const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// 📂 Chemin vers le dossier client
const clientPath = path.join(__dirname, "../client");

// 🔒 Sécurisation : éviter crash si dossier absent (CI / tests)
if (fs.existsSync(clientPath)) {
  try {
    fs.readdirSync(clientPath);
    console.log("Client folder loaded");
  } catch (err) {
    console.log("Error reading client folder:", err.message);
  }
} else {
  console.log("Client folder not found (test or CI environment)");
}

// 🧪 Route test
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 📦 Exemple route produits
app.get("/api/products", (req, res) => {
  res.json([
    { id: 1, name: "Figurine Eddie Stranger Things" },
    { id: 2, name: "Blu-ray Horreur Italien Restauré" }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // important pour les tests