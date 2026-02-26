const request = require('supertest');
const app = require('../src/server'); // Import de ton application express
const jwt = require('jsonwebtoken');

describe('🛡️ Tests de Sécurité - Authentification JWT', () => {
    
    const SECRET_KEY = "cle_secrete_devsecops_master"; // Doit correspondre à celle du serveur

    it('❌ Devrait refuser l’accès à une route protégée sans jeton (403)', async () => {
        const res = await request(app)
            .post('/api/orders') // Exemple d'une route sensible
            .send({ total: 45.00 });
        
        expect(res.statusCode).toEqual(403);
        expect(res.body.error).toBeDefined();
        console.log("✅ Test réussi : Accès anonyme bloqué.");
    });

    it('✅ Devrait autoriser l’accès avec un jeton JWT valide (201)', async () => {
        // Simulation d'un jeton valide pour un utilisateur test
        const token = jwt.sign({ id: 1, email: 'test@epouvante.fr' }, SECRET_KEY);

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({ total: 45.00 });

        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toContain("Commande enregistrée");
        console.log("✅ Test réussi : Authentification JWT validée.");
    });
});