import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 }, // Montée à 100 utilisateurs en 1 min
    { duration: '3m', target: 500 }, // Pic à 500 utilisateurs pendant 3 min
    { duration: '1m', target: 0 },   // Redescente à 0 pour tester la résilience
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requêtes doivent être < 500ms
  },
};

export default function () {
  const res = http.get('http://localhost:5000/api/products');
  
  check(res, {
    'statut est 200': (r) => r.status === 200,
    'temps de réponse < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
