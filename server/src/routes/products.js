// server/routes/products.js
const express = require('express');
const router = express.Router();

const products = [
  { 
    id: 1, 
    name: "Gremlin de Compagnie", 
    type: "Créature", 
    price: 45.00,
    description: "Attention : ne pas nourrir après minuit. Livré sans eau.",
    imageUrl: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80"
  },
  { 
    id: 2, 
    name: "Citrouille Rigolarde", 
    type: "Déco", 
    price: 19.90,
    description: "Une lanterne qui raconte des blagues nulles quand on passe devant.",
    imageUrl: "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?auto=format&fit=crop&w=600&q=80"
  },
  { 
    id: 3, 
    name: "Crâne 'Memento Mori'", 
    type: "Accessoire", 
    price: 29.99,
    description: "Idéal pour décorer votre crypte ou pour jouer Hamlet.",
    imageUrl: "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    name: "Bonbons 'Yeux Gluants'",
    type: "Friandise",
    price: 5.50,
    description: "Ils vous regardent pendant que vous les mangez. Goût Fraise.",
    imageUrl: "https://images.unsplash.com/photo-1633519783686-e8d1973b0610?auto=format&fit=crop&w=600&q=80"
  }
];

router.get('/', (req, res) => {
  res.status(200).json(products);
});

module.exports = router;