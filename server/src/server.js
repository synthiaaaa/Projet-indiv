// src/server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware et routes
app.use(express.json());

app.get('/products', (req, res) => {
  res.json([{ id: 1, name: 'Potion de soin' }]);
});

console.log('Client folder loaded');

// Démarrage du serveur seulement si le fichier est exécuté directement
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export pour les tests afin de fermer proprement
module.exports = { app, server };