# Projet individuel - Le Bazar de l'Etrange

POC full-stack deploye sur Google Cloud (GKE), orchestre via Kong, avec pipeline CI/CD DevSecOps GitHub Actions.

## 1) Protocole d'experimentation en bac a sable

Technologies testees:
- Frontend: React (Vite)
- Backend: Node.js + Express
- Base de donnees: SQLite (POC)
- Conteneurisation: Docker
- Orchestration: Kubernetes (GKE) + Kong Ingress
- CI/CD: GitHub Actions

Interactions testees:
- Frontend -> API `/api/products`, `/api/auth/*`, `/api/orders`
- Kong -> routage vers service `bazar-api`
- API -> DB SQLite
- Pipeline -> build image GCR -> deploy manifests GKE

Difficultes rencontrees:
- Incoherences de routes (`/api/catalogue` vs `/api/products`)
- Incoherences manifests (labels/services differents)
- Tests non aligns avec les routes et exports serveur

Resultat:
- Architecture stabilisee, routes coherentes, tests automatises, deploiement GKE/Kong versionnable.

## 2) POC technique et faisabilite architecture

Points cles validates:
- Decoupage applicatif: client et API separes
- Communication interservice: Ingress Kong -> Service -> Deployment
- Securite: Helmet, JWT, mots de passe hashés (bcryptjs), probes health/readiness
- Hebergement managé: GKE
- Orchestration: Kubernetes + Kong
- Scalabilite: HPA (`k8s/hpa.yaml`)

Fichiers d'architecture:
- `k8s/deployment.yaml`
- `k8s/service.yaml`
- `k8s/hpa.yaml`
- `k8s/kong-config.yaml`

## 3) Fonctionnalite metier POC

Fonctionnalites implementees:
- Consultation du catalogue (`GET /api/products`)
- Inscription, verification, connexion (`/api/auth/register`, `/api/auth/verify`, `/api/auth/login`)
- Creation de commande securisee JWT (`POST /api/orders`)

## 4) Livraison continue DevSecOps (GitHub -> GCP)

Workflow:
- Qualite/Securite: lint + tests + audit npm
- Build image: Docker -> `gcr.io/project-6ead5f33-15fd-443c-817/bazar-api:<sha>`
- Deploiement: `kubectl apply` manifests + `kubectl set image`

Fichier:
- `.github/workflows/ci-cd.yml`

Schema simplifie:
1. Push GitHub
2. `npm ci`, lint, tests, audit
3. Build/push image GCR
4. Deploy GKE
5. Routage Kong

## 5) Competences equipe et action de formation

Competences recensees:
- Dev backend Node/Express
- Kubernetes de base
- Pipeline GitHub Actions

Expertises a renforcer:
- Securite applicative (OWASP API Top 10)
- Observabilite (SLO/SLI, metriques Prometheus)
- Policy as code (OPA/Gatekeeper)

Action de formation proposee:
- Parcours court "Kubernetes Security + DevSecOps CI/CD" (2 jours) avec atelier pratique sur ce repo.

## 6) Environnement managé + disponibilite + montee en charge

Disponibilite:
- `replicas: 2` sur le deployment
- `livenessProbe` et `readinessProbe`

Montee en charge:
- Horizontal Pod Autoscaler CPU 70% (`k8s/hpa.yaml`)
- Test de charge k6 (`load-test.js`, `server/test-charge.js`)

## 7) Indicateurs qualite logicielle (>=4)

Expose via `GET /metrics`:
- Nombre d'utilisateurs
- Nombre de produits
- Nombre de commandes
- Chiffre d'affaires cumule

Objectifs qualite couverts:
- Fonctionnalite: endpoints metier
- Performance: seuil k6 p95 < 500ms
- Fiabilite: health/readiness probes
- Maintenabilite: pipeline CI/CD + tests automatises

## 8) Processus de test formalise

Types de tests:
- Integration API (Jest + Supertest)
- Tests securite JWT (acces protege)
- Test de charge (k6)

Fichiers:
- `server/tests/products.test.js`
- `server/tests/auth.test.js`
- `server/api.test.js`
- `load-test.js`

Execution:
```bash
cd server
npm test
```

## 9) Plan de remediation securite (priorise)

Risques prioritaires:
1. Fuite de secrets (JWT, SMTP)
2. Surface d'attaque API
3. Vuln libs npm

Actions implementees:
- Bonnes pratiques #1: gestion des secrets via `Secret` Kubernetes (pas de secret en dur dans les manifests)
- Bonnes pratiques #2: container non-root + drop capabilities + probes de sante
- Bonnes pratiques #3: audit npm dans pipeline
- Bonnes pratiques #4: authentification JWT obligatoire sur creation de commande

## 10) Deploiement

Prerequis:
- Cluster GKE
- Kong Ingress Controller installe
- Secrets GitHub (`GCP_SA_KEY`, `GKE_CLUSTER`, `GKE_LOCATION`)
- Secret K8s `bazar-api-secrets` avec `jwt_secret`, `email_user`, `email_pass`

Commande locale:
```bash
gcloud builds submit --tag gcr.io/project-6ead5f33-15fd-443c-817/bazar-api ./server
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/kong-config.yaml
```
