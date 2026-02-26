import React, { useState } from 'react';
import ProductList from './components/ProductList';
import './App.css'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function App() {
  const [cart, setCart] = useState([]);
  const [currentView, setCurrentView] = useState('catalogue'); 
  const [token, setToken] = useState(null);
  const [orderNumber, setOrderNumber] = useState('');
  
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [userPrenom, setUserPrenom] = useState(''); 
  const [authMode, setAuthMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [posts, setPosts] = useState([
    { author: "VampireDu93", content: "Le dernier numéro d'Evil Ed sur les films de zombies est incroyable 🧟‍♂️ !" },
    { author: "Sorcière_Bien_Aimée", content: "Quelqu'un sait quand sort la prochaine BD Chroniques de l'Effroi ?" }
  ]);
  const [newPost, setNewPost] = useState('');

  const addToCart = (product) => setCart([...cart, product]);
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };
  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  // Validation visuelle du mot de passe
  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    return regex.test(pwd);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (authLoading) return;

    let endpoint = '';
    let payload = {};

    const cleanEmail = email.trim().toLowerCase();
    const cleanPrenom = prenom.trim();
    const cleanNom = nom.trim();

    if (authMode === 'login') {
      endpoint = '/api/auth/login';
      payload = { email: cleanEmail, password };
    } else if (authMode === 'register') {
      if (!validatePassword(password)) {
        alert("⚠️ Mot de passe invalide : 8 caractères min, 1 majuscule et 1 symbole spécial.");
        return;
      }
      endpoint = '/api/auth/register';
      payload = { prenom: cleanPrenom, nom: cleanNom, email: cleanEmail, password };
    }
    
    try {
      setAuthLoading(true);
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch (_err) {
        data = { error: raw || 'Réponse invalide du serveur.' };
      }
      
      if (!res.ok) {
        if (authMode === 'register' && res.status === 409) {
          alert("ℹ️ Cet email existe déjà. Connecte-toi directement.");
          setAuthMode('login');
          return;
        }
        throw new Error(data.error || "Erreur serveur.");
      }
      
      if (authMode === 'login') {
        setToken(data.token); 
        setUserPrenom(data.prenom); 
        alert("👻 Connexion fantomatique réussie !");
        setCurrentView('catalogue');
      } else if (authMode === 'register') {
        alert("🩸 Compte créé ! Connecte-toi maintenant.");
        setAuthMode('login');
      }
    } catch (err) {
      alert("❌ Erreur Maléfique : " + (err.message || "Erreur serveur."));
    } finally {
      setAuthLoading(false);
    }
  };

  const processPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ total: cartTotal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrderNumber(`EPOUVANTE-000${data.orderId}`);
      setCart([]);
      setCurrentView('success');
    } catch (err) {
      alert("😱 Erreur lors du rituel de paiement : " + err.message);
    }
  };

  return (
    <div className="app-container">
      <header className="site-header">
        <div className="logo" onClick={() => setCurrentView('catalogue')}>
          🧟 Le Bazar de l'Étrange
        </div>
        <nav>
          <ul>
            <li><button className="nav-btn" onClick={() => setCurrentView('catalogue')}>🏰 Manoir</button></li>
            <li><button className="nav-btn" onClick={() => setCurrentView('community')}>🦇 Crypte Evil Ed</button></li>
            <li>
              <button className="nav-btn" onClick={() => setCurrentView('cart')}>
                ⚗️ Chaudron <span className="cart-badge">{cart.length}</span>
              </button>
            </li>
            <li>
              {token ? (
                <button className="btn-login" onClick={() => { setToken(null); setUserPrenom(''); setCurrentView('catalogue'); }}>⚰️ Partir</button>
              ) : (
                <button className="btn-login" onClick={() => setCurrentView('auth')}>🔮 Invoquer un compte</button>
              )}
            </li>
          </ul>
        </nav>
      </header>

      {token && (
        <div style={{ backgroundColor: '#39ff14', color: '#000', padding: '10px', textAlign: 'center', fontWeight: 'bold', borderBottom: '2px solid #000' }}>
          🕸️ Salut, créature nommée {userPrenom} ! Heureux de te revoir vivant.
        </div>
      )}

      {currentView === 'catalogue' && (
        <>
          <main className="hero-banner">
            <div className="hero-content">
              <h1>Objets maudits &<br/>Curiosités Funky</h1>
              <p style={{color: '#fff', fontSize: '1.2rem'}}>Garantis 100% hantés (ou remboursés en ectoplasme)</p>
            </div>
          </main>
          <div id="catalogue">
            <ProductList onAddToCart={addToCart} />
          </div>
        </>
      )}

      {currentView === 'community' && (
        <div className="page-container" style={{ maxWidth: '800px' }}>
          <h2>🦇 La Crypte d'Evil Ed</h2>
          <p style={{ textAlign: 'center', marginBottom: '20px', color: '#e0e0e0' }}>
            L'espace communautaire réservé aux abonnés et contributeurs du fanzine.
          </p>

          <div style={{ backgroundColor: '#1a0b2e', padding: '20px', borderRadius: '10px', border: '1px solid #444', marginBottom: '20px' }}>
            {posts.map((post, index) => (
              <div key={index} style={{ borderBottom: '1px dashed #555', padding: '10px 0' }}>
                <strong style={{ color: '#39ff14' }}>{post.author}</strong> : <span style={{ color: '#e0e0e0' }}>{post.content}</span>
              </div>
            ))}
          </div>

          <div>
            {token ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Écrire un message d'outre-tombe..." 
                  style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #39ff14', background: '#000', color: '#fff' }}
                />
                <button className="btn-pay" style={{ width: '150px', marginTop: '0' }} onClick={() => {
                    if(newPost.trim() !== '') { setPosts([...posts, { author: userPrenom, content: newPost }]); setNewPost(''); }
                  }}>
                  Publier
                </button>
              </div>
            ) : (
              <div className="security-warning">
                ⚠️ Vous devez signer le pacte (vous connecter) pour participer à la communauté Evil Ed.
              </div>
            )}
          </div>
        </div>
      )}

      {currentView === 'auth' && (
        <div className="page-container">
          <h2>
            {authMode === 'login' ? '🔑 Entrer dans le Crypt' : '🩸 Signer le Pacte'}
          </h2>
          
          <form className="checkout-form" onSubmit={handleAuth}>
            
            {authMode === 'register' && (
              <>
                <div className="form-group"><label>Prénom d'Humain</label><input type="text" required value={prenom} onChange={(e)=>setPrenom(e.target.value)} /></div>
                <div className="form-group"><label>Nom de Famille</label><input type="text" required value={nom} onChange={(e)=>setNom(e.target.value)} /></div>
              </>
            )}

            <>
              <div className="form-group">
                <label>Email Spectral</label>
                <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="fantome@cimetiere.com" />
              </div>
              <div className="form-group">
                <label>Mot de Passe Secret</label>
                <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="********" 
                  style={{ borderColor: (password && !validatePassword(password) && authMode === 'register') ? 'red' : '#555' }}
                />
                {authMode === 'register' && password && !validatePassword(password) && (
                    <p style={{color: 'red', fontSize: '0.8rem', marginTop: '5px'}}>
                        ⚠️ 8 caractères min, 1 majuscule, 1 symbole spécial (!@#$%) requis.
                    </p>
                )}
              </div>
            </>

            <button type="submit" className="btn-pay" disabled={authLoading}>
              {authLoading ? "Patiente..." : (authMode === 'login' ? 'Ouvrir la porte' : "Rejoindre l'au-delà")}
            </button>

            <p style={{textAlign: 'center', cursor: 'pointer', color: '#39ff14', marginTop: '15px'}} onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? "💀 Pas encore mort ? Inscris-toi !" : "🦇 Déjà un compte ? Connecte-toi"}
            </p>
          </form>
        </div>
      )}

      {currentView === 'cart' && (
        <div className="page-container">
          <h2>Votre Chaudron</h2>
          {!token && <div className="security-warning">⚡ ALERTE : Identifie-toi avant que les articles ne disparaissent !</div>}
          {cart.length === 0 ? (
            <p style={{textAlign: 'center'}}>Il n'y a que des toiles d'araignées ici...</p>
          ) : (
            <div className="cart-content">
              <ul className="cart-items">
                {cart.map((item, index) => (
                  <li key={index} className="cart-item">
                    <span>🎃 {item.name}</span>
                    <span>{item.price.toFixed(2)} € <button className="btn-remove" onClick={() => removeFromCart(index)}>🧹</button></span>
                  </li>
                ))}
              </ul>
              <div className="cart-summary">
                <h3 style={{color: '#ff7518'}}>Total Maléfique : {cartTotal.toFixed(2)} €</h3>
                <button className="btn-checkout-final" disabled={!token} onClick={() => setCurrentView('checkout')}>Valider le rituel d'achat</button>
              </div>
            </div>
          )}
        </div>
      )}

      {currentView === 'checkout' && (
        <div className="page-container">
          <h2>Dernière étape avant l'apocalypse</h2>
          <form className="checkout-form" onSubmit={processPayment}>
            <div className="form-group"><label>À qui envoyer le colis ?</label><input type="text" required placeholder="Ex: Comte Dracula" /></div>
            <div className="form-group"><label>Adresse du Manoir / Crypte</label><input type="text" required placeholder="123 Allée des Ténèbres" /></div>
            <div className="form-group"><label>Numéro de Carte (Factice)</label><input type="text" required placeholder="**** **** **** ****" maxLength="16" /></div>
            <button type="submit" className="btn-pay">Sacrifier {cartTotal.toFixed(2)} €</button>
            <button type="button" className="btn-remove" style={{marginTop: '10px', fontSize: '1rem', width: '100%'}} onClick={() => setCurrentView('cart')}>Annuler le sort</button>
          </form>
        </div>
      )}

      {currentView === 'success' && (
        <div className="page-container text-center">
          <div className="success-box">
            <h2 style={{fontSize: '3rem'}}>🧙‍♂️ Abracadabra !</h2>
            <p>Votre commande a été téléportée dans notre base de données.</p>
            <p style={{color: '#39ff14', fontSize: '1.2rem'}}><strong>Code du Sortilège : {orderNumber}</strong></p>
            <br/>
            <p>🦇 <strong>Une chauve-souris vient de partir avec votre reçu (email).</strong></p>
            <button className="btn-add-cart-item" onClick={() => setCurrentView('catalogue')}>Retourner hanter la boutique</button>
          </div>
        </div>
      )}

      <footer className="site-footer">
        <p>💀 © 2026 La Petite Maison de l'Horreur - Fait avec du code et du sang frais.</p>
      </footer>
    </div>
  );
}

export default App;
