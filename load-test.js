import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuration du scénario SRE
export const options = {
  // Seuil de réussite : 95% des requêtes doivent être sous 500ms
  thresholds: {
    http_req_duration: ['p(95)<500'], 
  },
  // Simulation de montée en charge
  stages: [
    { duration: '5s', target: 10 },  // Montée à 10 utilisateurs
    { duration: '10s', target: 10 }, // Plateau stable
    { duration: '5s', target: 0 },   // Descente
  ],
};

export default function () {
  // Le serveur tourne sur le localhost du runner GitHub
  const res = http.get('http://localhost:5000/api/products');

  check(res, {
    'status est 200': (r) => r.status === 200,
    'temps de réponse < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}