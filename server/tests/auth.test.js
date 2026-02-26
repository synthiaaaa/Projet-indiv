const request = require("supertest");
const { app } = require("../src/server");
const db = require("../src/database");

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

describe("Authentication and JWT security", () => {
  it("rejects protected endpoint when token is missing", async () => {
    const res = await request(app).post("/api/orders").send({ total: 45 });
    expect(res.statusCode).toBe(403);
  });

  it("accepts protected endpoint with valid token", async () => {
    const email = `test-${Date.now()}@epouvante.fr`;
    const password = "Secret!Pass1";

    const registerRes = await request(app).post("/api/auth/register").send({
      prenom: "Test",
      nom: "User",
      email,
      password,
    });
    expect([201, 409]).toContain(registerRes.statusCode);

    if (registerRes.statusCode === 201) {
      const userRow = await dbGet("SELECT id, email FROM users WHERE email = ?", [email]);
      expect(userRow).toBeDefined();
      expect(userRow.email).toBe(email);
    }

    const loginRes = await request(app).post("/api/auth/login").send({ email, password });
    expect(loginRes.statusCode).toBe(200);
    const token = loginRes.body.token;
    expect(token).toBeDefined();

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ total: 45 });

    expect(res.statusCode).toBe(201);
    expect(res.body.orderId).toBeDefined();

    const userRow = await dbGet("SELECT id FROM users WHERE email = ?", [email]);
    expect(userRow).toBeDefined();
    const orderRow = await dbGet("SELECT id, user_id, total_price FROM orders WHERE id = ?", [res.body.orderId]);
    expect(orderRow).toBeDefined();
    expect(orderRow.user_id).toBe(userRow.id);
    expect(Number(orderRow.total_price)).toBe(45);
  });
});
