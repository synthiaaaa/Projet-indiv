import React, { useEffect, useState } from 'react';

const ProductList = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // APPEL DYNAMIQUE : On récupère les figurines et jeux du backend
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Erreur de récupération :", err));
  }, []);

  return (
    <div className="horizontal-grid">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <img src={product.imageUrl} alt={product.name} className="product-image" />
          <div className="product-info">
            <span className="product-category">{product.type}</span>
            <h3 className="product-name">{product.name}</h3>
            <p className="product-desc">{product.description}</p>
            <div className="product-footer">
              <span className="product-price">{product.price.toFixed(2)} €</span>
              <button className="btn-add-cart-item" onClick={() => onAddToCart(product)}>
                AJOUTER AU PANIER
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;