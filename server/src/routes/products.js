const express = require('express');
const router = express.Router();

const products = [
  { 
    id: 1, 
    name: "Figurine - Kakashi Hatake (Lightning)", 
    type: "Figurine", 
    price: 34.99,
    description: "Figurine détaillée avec effets de foudre.",
    imageUrl: "https://m.media-amazon.com/images/I/61m9v6S07FL._AC_SL1500_.jpg" 
  },
  { 
    id: 2, 
    name: "Jeu de Plateau - Labyrinthe", 
    type: "Jeu de Société", 
    price: 29.90,
    description: "Le classique jeu de chasse aux trésors dans un labyrinthe mouvant.",
    imageUrl: "https://m.media-amazon.com/images/I/91Nms6Wz23L._AC_SL1500_.jpg"
  },
  { 
    id: 3, 
    name: "Comics - Les Chroniques de l'Effroi", 
    type: "Bande Dessinée", 
    price: 22.50,
    description: "BD exclusive Evil Ed.",
    imageUrl: "https://images.unsplash.com/photo-1588497859490-85d1c17db96d?w=500"
  }
];

router.get('/', (req, res) => {
  res.status(200).json(products);
});

module.exports = router;