const express = require('express');
const router = express.Router();

// Base de données avec des best-sellers Pop-Culture / Fantastique
const products = [
  { 
    id: 1, 
    name: "Figurine Funko Pop! - Eddie (Stranger Things)", 
    type: "Figurine", 
    price: 15.99,
    description: "La figurine de collection incontournable du héros du Hellfire Club.",
    imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&q=80" 
  },
  { 
    id: 2, 
    name: "Coffret Blu-ray 4K - Le Seigneur des Anneaux", 
    type: "Film", 
    price: 59.90,
    description: "L'intégrale de la trilogie en version longue et remasterisée 4K.",
    imageUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&q=80"
  },
  { 
    id: 3, 
    name: "Comics - Batman : The Killing Joke", 
    type: "Bande Dessinée", 
    price: 15.00,
    description: "Le chef-d'œuvre absolu d'Alan Moore sur les origines du Joker.",
    imageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=500&q=80"
  },
  { 
    id: 4, 
    name: "Jeu de plateau - Mysterium", 
    type: "Jeu de Société", 
    price: 39.99,
    description: "Un jeu coopératif d'enquête et de fantômes, idéal pour vos soirées.",
    imageUrl: "https://placehold.co/500x500/6a1b9a/ffffff?text=Jeu+de+Plateau"
  }
];

router.get('/', (req, res) => {
  res.status(200).json(products);
});

module.exports = router;