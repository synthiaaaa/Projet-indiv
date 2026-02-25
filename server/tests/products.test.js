// tests/products.test.js
const request = require('supertest');
const { app, server } = require('../src/server');

describe('API /products', () => {
  it('devrait retourner la liste des produits', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 1, name: 'Potion de soin' })
    ]));
  });
});

// Fermeture du serveur après tous les tests
afterAll(() => {
  if (server) server.close();
});