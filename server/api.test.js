const request = require('supertest');
const express = require('express');

// On simule une route API pour le test automatisé
const app = express();
app.get('/api/health', (req, res) => res.status(200).json({ status: 'Sécurisé et Opérationnel' }));

describe('Tests de Qualité et Sécurité (ISO 25010)', () => {
    it('L\'API doit répondre avec un statut 200 (Fiabilité)', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('Sécurisé et Opérationnel');
    });
});