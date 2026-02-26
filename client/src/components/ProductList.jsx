import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function ProductList({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        // SÉCURITÉ : On vérifie que le serveur a bien renvoyé un tableau
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("❌ [SRE] Le serveur n'a pas renvoyé une liste valide :", data);
          setProducts([]); 
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("❌ Erreur de connexion au serveur :", err);
        setProducts([]);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div style={{textAlign: 'center', padding: '50px', color: '#39ff14'}}>🦇 Invocation des objets maudits en cours...</div>;
  }

  if (products.length === 0) {
    return <div style={{textAlign: 'center', padding: '50px', color: '#ff7518'}}>🕸️ La crypte est vide. Ajoutez des produits dans la base de données !</div>;
  }

  return (
    <div className="product-list">
      {products?.map(product => (
        <div key={product.id} className="product-card">
          <img src={product.imageUrl || '/images/default.jpg'} alt={product.name} />
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <p style={{ color: '#ff7518', fontWeight: 'bold', fontSize: '1.2rem' }}>
            {product.price ? product.price.toFixed(2) : '0.00'} €
          </p>
          <button 
            className="btn-add-cart-item" 
            onClick={() => onAddToCart(product)}
          >
            🛒 Ajouter au Chaudron
          </button>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
