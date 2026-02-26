const request = require("supertest");
const { app, server } = require("../src/server");

describe("Products API", () => {
  it("returns seeded products", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
      })
    );
  });
});

afterAll(() => {
  if (server) server.close();
});
