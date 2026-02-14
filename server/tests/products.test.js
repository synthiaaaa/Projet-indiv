const request = require('supertest');
const app = require('../src/server');

describe('API Produits', () => {
  it('doit retourner les produits horrifiques avec un code 200', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body[0]).toHaveProperty('name');
  });
});