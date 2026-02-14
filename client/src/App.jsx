import React, { useState } from 'react';
import ProductList from './components/ProductList';
import './App.css'; 

function App() {
  const [cart, setCart] = useState([]);
  const [currentView, setCurrentView] = useState('catalogue'); // catalogue, cart, checkout, success, auth
  const [token, setToken] = useState(null);
  const [orderNumber, setOrderNumber] = useState('');
  
  // Nouveaux états pour le Nom, le Prénom et le message de Bienvenue
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [userPrenom, setUserPrenom] = useState(''); 
  
  // États pour les formulaires d'authentification
  const [authMode, setAuthMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const addToCart = (product) => setCart([...cart, product]);
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  // --- Authentification Réelle avec SQLite ---
  const handleAuth = async (e) => {
    e.preventDefault();

    // 🔒 NOUVEAU : Validation de la complexité du mot de passe
    if (authMode === 'register') {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        alert("🛑 Sécurité : Le mot de passe est trop faible !\nIl doit contenir au minimum :\n- 8 caractères\n- 1 majuscule\n- 1 minuscule\n- 1 chiffre\n- 1 caractère spécial (@$!%*?&)");
        return; // On bloque l'inscription et on n'envoie rien au Backend
      }
    }

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    
    // On prépare les données envoyées : avec le nom/prénom si c'est une inscription
    const payload = authMode === 'login' 
      ? { email, password } 
      : { prenom, nom, email, password };
    
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
        alert("Connexion réussie via JWT !");
        setCurrentView('catalogue');
      } else {
        alert("✅ Compte créé avec succès dans la Base de Données ! Vous pouvez vous connecter.");
        setAuthMode('login');
        setPassword(''); // On vide le champ mot de passe par sécurité
      }
    } catch (err) {
      alert("Erreur Sécurité : " + err.message);
    }
  };

  // --- Validation de commande réelle ---
  const processPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ total: cartTotal })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setOrderNumber(`CMD-000${data.orderId}`);
      setCart([]);
      setCurrentView('success');
    } catch (err) {
      alert("Erreur lors du paiement : " + err.message);
    }
  };

  return (
    <div className="app-container">
      <header className="site-header">
        <div className="logo" onClick={() => setCurrentView('catalogue')} style={{cursor: 'pointer'}}>
          🎬 La Petite Maison Pop-Culture
        </div>
        <nav>
          <ul>
            <li><button className="nav-btn" onClick={() => setCurrentView('catalogue')}>Boutique</button></li>
            <li>
              <button className="nav-btn" onClick={() => setCurrentView('cart')}>
                🛒 Panier <span className="cart-badge">{cart.length}</span>
              </button>
            </li>
            <li>
              {token ? (
                <button className="btn-login logged-in" onClick={() => {
                  setToken(null); 
                  setUserPrenom(''); 
                  setCurrentView('catalogue');
                }}>
                  🔓 Déconnexion
                </button>
              ) : (
                <button className="btn-login" onClick={() => setCurrentView('auth')}>
                  🔒 Se connecter / S'inscrire
                </button>
              )}
            </li>
          </ul>
        </nav>
      </header>

      {/* BANNIÈRE DE BIENVENUE (Apparaît uniquement si connecté) */}
      {token && (
        <div style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
          ✨ Bienvenue dans votre espace, {userPrenom} !
        </div>
      )}

      {currentView === 'catalogue' && (
        <>
          <main className="hero-banner">
            <div className="hero-content">
              <h1>Votre boutique Geek & Fantasy</h1>
              <p>Retrouvez vos figurines, BD, jeux et films cultes préférés !</p>
            </div>
          </main>
          <div id="catalogue">
            <ProductList onAddToCart={addToCart} />
          </div>
        </>
      )}

      {/* VUE AUTHENTIFICATION (Formulaires) */}
      {currentView === 'auth' && (
        <div className="page-container">
          <h2>{authMode === 'login' ? 'Connexion sécurisée' : 'Créer un compte'}</h2>
          <form className="checkout-form" onSubmit={handleAuth}>
            
            {/* Champs Nom et Prénom affichés uniquement pour l'inscription */}
            {authMode === 'register' && (
              <>
                <div className="form-group">
                  <label>Prénom</label>
                  <input type="text" required value={prenom} onChange={(e)=>setPrenom(e.target.value)} placeholder="Votre prénom" />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input type="text" required value={nom} onChange={(e)=>setNom(e.target.value)} placeholder="Votre nom" />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email de connexion</label>
              <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="votre@email.com" />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="********" />
            </div>
            <button type="submit" className="btn-pay">
              {authMode === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
            <p style={{textAlign: 'center', cursor: 'pointer', color: '#6a1b9a', fontWeight: 'bold'}} 
               onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
            </p>
          </form>
        </div>
      )}

      {/* VUE PANIER */}
      {currentView === 'cart' && (
        <div className="page-container">
          <h2>Votre Panier de Commande</h2>
          {!token && (
             <div className="security-warning">⚠️ Sécurité : Vous devez vous connecter ou vous inscrire pour passer commande.</div>
          )}
          {cart.length === 0 ? (
            <p>Votre panier est vide.</p>
          ) : (
             // ... Le code du panier reste le même
            <div className="cart-content">
              <ul className="cart-items">
                {cart.map((item, index) => (
                  <li key={index} className="cart-item">
                    <span>{item.name}</span>
                    <span>{item.price.toFixed(2)} € <button className="btn-remove" onClick={() => removeFromCart(index)}>❌</button></span>
                  </li>
                ))}
              </ul>
              <div className="cart-summary">
                <h3>Total : {cartTotal.toFixed(2)} €</h3>
                <button 
                  className="btn-checkout-final" 
                  disabled={!token}
                  onClick={() => setCurrentView('checkout')}
                >
                  Passer à la caisse
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VUE CHECKOUT */}
      {currentView === 'checkout' && (
        <div className="page-container">
          <h2>Finalisation de la commande (Sécurisé HTTPS)</h2>
          <form className="checkout-form" onSubmit={processPayment}>
            <div className="form-group">
              <label>Nom complet</label>
              <input type="text" required placeholder="Ex: Jean Dupont" />
            </div>
            <div className="form-group">
              <label>Adresse de livraison</label>
              <input type="text" required placeholder="123 rue de la Pop-Culture" />
            </div>
            <div className="form-group">
              <label>Carte bancaire (Factice)</label>
              <input type="text" required placeholder="**** **** **** ****" maxLength="16" />
            </div>
            <button type="submit" className="btn-pay">Payer {cartTotal.toFixed(2)} €</button>
            <button type="button" className="btn-cancel" onClick={() => setCurrentView('cart')}>Annuler</button>
          </form>
        </div>
      )}

      {/* VUE SUCCÈS (Avec mention de l'email) */}
      {currentView === 'success' && (
        <div className="page-container text-center">
          <div className="success-box">
            <h2>🎉 Commande Validée !</h2>
            <p>Merci pour votre achat. Il a été ajouté de façon sécurisée à votre historique en base de données.</p>
            <p><strong>Numéro de commande : {orderNumber}</strong></p>
            <br/>
            <p>📧 <strong>Un e-mail de confirmation vient de vous être envoyé avec le récapitulatif de votre commande.</strong></p>
            <button className="btn-continue" onClick={() => setCurrentView('catalogue')}>
              Retourner à la boutique
            </button>
          </div>
        </div>
      )}

      <footer className="site-footer">
        <p>© 2026 La Petite Maison - POC Sécurisé avec Base de Données SQLite et JWT.</p>
      </footer>
    </div>
  );
}

export default App;