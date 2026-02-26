import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '45s',
  thresholds: {
    http_req_duration: ['p(95)<800'],
    checks: ['rate>0.95'],
  },
};

const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:5000';

export default function () {
  const res = http.get(`${BASE_URL}/api/products`);
  
  check(res, {
    'statut est 200': (r) => r.status === 200,
    'temps de réponse < 800ms': (r) => r.timings.duration < 800,
  });
  
  sleep(0.5);
}
