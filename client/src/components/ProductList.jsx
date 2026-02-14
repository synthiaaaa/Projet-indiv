import React, { useState, useEffect } from 'react';

export default function ProductList({ onAddToCart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Erreur réseau:", err));
  }, []);

  return (
    <section className="catalog-section">
      <h2 className="section-title">Nos Articles Maudits</h2>
      <div className="product-grid">
        {products.map(p => (
          <div key={p.id} className="product-card">
            <div className="card-image">
              <img src={p.imageUrl} alt={p.name} />
              <span className="badge">{p.type}</span>
            </div>
            <div className="card-content">
              <h3>{p.name}</h3>
              <p className="desc">{p.description}</p>
              <div className="card-footer">
                <span className="price">{p.price.toFixed(2)} €</span>
                <button className="btn-buy" onClick={() => onAddToCart(p)}>
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}