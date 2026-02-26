import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '20s',
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.20'],
    checks: ['rate>0.80'],
  },
};

const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:5000';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

function postWithRetry(url, body, params, attempts = 2) {
  let res;
  for (let i = 0; i < attempts; i += 1) {
    res = http.post(url, body, params);
    if (res && res.status < 500) return res;
    sleep(0.2);
  }
  return res;
}

export default function () {
  const suffix = `${__VU}-${__ITER}-${Date.now()}`;
  const email = `loadtest-${suffix}@example.com`;
  const password = 'LoadTest!123';

  const registerRes = postWithRetry(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      prenom: `User${__VU}`,
      nom: 'LoadTest',
      email,
      password,
    }),
    { headers: JSON_HEADERS }
  );

  const loginRes = postWithRetry(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password }),
    { headers: JSON_HEADERS }
  );

  let token = '';
  try {
    token = loginRes.json('token') || '';
  } catch (_err) {
    token = '';
  }

  const productsRes = http.get(`${BASE_URL}/api/products`);
  const orderRes = postWithRetry(
    `${BASE_URL}/api/orders`,
    JSON.stringify({ total: 45 }),
    {
      headers: {
        ...JSON_HEADERS,
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  );

  check(registerRes, {
    'register status 201/409': (r) => r.status === 201 || r.status === 409,
  });
  check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'login returns token': () => token.length > 0,
  });
  check(productsRes, {
    'products status 200': (r) => r.status === 200,
  });
  check(orderRes, {
    'order status 201': (r) => r.status === 201,
  });

  sleep(0.5);
}
