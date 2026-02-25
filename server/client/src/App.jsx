import React, { useState } from 'react';
import ProductList from './components/ProductList';
import './App.css'; 

function App() {
  const [cart, setCart] = useState([]);
  const [currentView, setCurrentView] = useState('catalogue'); 
  const [token, setToken] = useState(null);
  const [userPrenom, setUserPrenom] = useState(''); 
  const [authMode, setAuthMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');

  const addToCart = (product) => setCart([...cart, product]);
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = authMode === 'login' ? { email, password } : { prenom, nom, email, password };
    
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      if (authMode === 'login') {
        setToken(data.token); 
        setUserPrenom(data.prenom); 
        setCurrentView('catalogue');
      } else {
        setAuthMode('login');
        alert("Pacte lié avec succès.");
      }
    } catch (err) {
      alert("Erreur de rituel : " + err.message);
    }
  };

  return (
    <div className="app-container">
      {/* HEADER NAVIGATION */}
      <header className="site-header">
        <div className="logo" onClick={() => setCurrentView('catalogue')}>
          <span className="logo-symbol">💀</span> LA PETITE MAISON ÉPROUVANTE
        </div>
        <nav className="top-nav">
          <span className="nav-link">Authentification</span>
          <span className="nav-link">Boutique</span>
          <button className="btn-nav-red" onClick={() => setCurrentView('cart')}>
             Panier ({cart.length})
          </button>
        </nav>
      </header>

      {/* ZONE DE BIENVENUE JWT */}
      {token && (
        <div className="welcome-ribbon">
          Bienvenue sur notre boutique, {userPrenom}
        </div>
      )}

      {/* DISPOSITION PRINCIPALE */}
      <div className="main-layout">
        
        {/* SECTION GAUCHE : CONNEXION */}
        <aside className="left-sidebar">
          <div className="ritual-card">
            <h2 className="ritual-title">Rituel de Connexion</h2>
            <form onSubmit={handleAuth} className="ritual-form">
              <div className="input-group">
                <label>Nom:</label>
                <input type="text" value={nom} onChange={(e)=>setNom(e.target.value)} placeholder="Votre nom" />
              </div>
              <div className="input-group">
                <label>Email:</label>
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Password:</label>
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
              </div>
              <p className="auth-footer" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                {authMode === 'login' ? "Créer un pacte ? S'inscrire" : "Déjà lié ? Se connecter"}
              </p>
              <button type="submit" className="btn-action-horror">S'IDENTIFIER</button>
            </form>
          </div>
        </aside>

        {/* SECTION DROITE : GRILLE D'ARTICLES */}
        <main className="content-area">
          <div className="horizontal-grid">
            {/* Ici on appelle ta liste d'articles qui s'affichera horizontalement grâce au CSS */}
            <ProductList onAddToCart={addToCart} />
          </div>
        </main>
      </div>

      <footer className="footer-status">
        © 2026 La Petite Maison Éprouvante - POC Supervisé Azure AKS [ISO 25010]
      </footer>
    </div>
  );
}

export default App;