# Rapport de Projet Individuel - Version GCP

Realisee par: Synthia KABANGO  
Promotion: MAALSI BNP M2  
Sujet: Modernisation du Systeme d'Information - La Petite Maison de l'Epouvante

Ce repository implemente le POC "Version Blockbuster" en conservant une cible Google Cloud:
- Execution: Google Kubernetes Engine (GKE)
- Registry: Artifact Registry
- CI/CD: GitHub Actions
- Orchestration API: Kong (si CRDs presentes)

## 1. Besoins et attributs qualite (ISO 25010)

### 1.1 Besoins fonctionnels implementes
- Catalogue dynamique produits: `GET /api/products`
- Inscription / verification / connexion utilisateur: `/api/auth/*`
- Commande protegee JWT: `POST /api/orders`
- Espace communautaire front (base POC)

### 1.2 Besoins non fonctionnels
- Securite: Helmet, bcryptjs, JWT, secrets Kubernetes
- Fiabilite: health/readiness probes + deployment multi-replicas
- Maintenabilite: separation frontend/backend + tests + pipeline
- Portabilite: conteneurisation Docker + Kubernetes

## 2. Démarche DevSecOps

Pipeline GitHub Actions:
1. `npm ci`
2. lint
3. tests
4. audit des dependances
5. build/push image vers Artifact Registry
6. deploiement GKE

Le pipeline bloque le deploiement si la qualite/sécurité echoue.

Fichier principal: `.github/workflows/ci-cd.yml`

## 3. Architecture existante et cible

### 3.1 Architecture cible POC (GCP)
- Frontend React/Vite
- Backend Node.js/Express
- DB SQLite (POC)
- Kubernetes (GKE) + Service + HPA
- Ingress Kong optionnel (active uniquement si CRDs Kong presentes)

### 3.2 Note de trajectoire
Le rapport identifie SQLite comme limite de scalabilite.  
La cible de production est PostgreSQL managé (migration planifiee).

## 4. Etude technologique retenue

- Frontend: React + Vite
- Backend: Node.js + Express
- Authentification: JWT
- CI/CD: GitHub Actions
- Hebergement: GKE (Google Cloud)

## 5. Environnement d'execution et deploiement

## 5.1 Prerequis
- Projet GCP: `project-6ead5f33-15fd-443c-817`
- Cluster GKE operationnel
- Repository Artifact Registry: `bazar-api-repo` (region `europe-west9`)
- Secrets GitHub Actions:
  - `WIF_PROVIDER`
  - `WIF_SERVICE_ACCOUNT`
  - `GKE_CLUSTER`
  - `GKE_LOCATION`
- Secret Kubernetes:
  - `bazar-api-secrets` avec `jwt_secret`, `email_user`, `email_pass`

### 5.2 Manifests
- `k8s/deployment.yaml`
- `k8s/service.yaml`
- `k8s/hpa.yaml`
- `k8s/kong-config.yaml` (si Kong installe)

## 6. Strategie de tests

- Tests API integration: Jest + Supertest
- Tests securite acces route protegee JWT
- Tests charge: k6 (`load-test.js`, `server/test-charge.js`)
- Analyse qualite SonarQube (optionnelle, activee uniquement si secrets valides)

### 6.1 Configuration SonarQube (optionnelle)

Le workflow CI/CD ignore automatiquement SonarQube si les secrets ne sont pas configures, ou si l'URL SonarQube ne repond pas correctement.

Secrets GitHub a definir (repo `synthiaaaa/Projet-indiv`):
- `SONAR_HOST_URL`: URL reelle de ton serveur SonarQube (pas une URL exemple)
- `SONAR_TOKEN`: token utilisateur SonarQube

Commandes:
```bash
gh secret set SONAR_HOST_URL --body "https://<vrai-sonarqube>" -R synthiaaaa/Projet-indiv
gh secret set SONAR_TOKEN --body "<ton-token-sonar>" -R synthiaaaa/Projet-indiv
```

Verification locale de l'URL SonarQube:
```bash
export SONAR_HOST_URL="https://<vrai-sonarqube>"
curl -sS "$SONAR_HOST_URL/api/server/version"
```
La commande doit renvoyer une version (`10.x.x`) et pas une page HTML de redirection.

## 7. Securite DevSecOps

Mesures appliquees:
- Hash de mot de passe bcryptjs
- JWT pour routes protegees
- Headers securite via Helmet
- Scan dependances (`npm audit`)
- Secrets hors code via Kubernetes/GitHub secrets

## 8. Gestion des risques

Risque principal identifie:
- Limite de concurrence SQLite pour la phase Blockbuster

Plan de remediation:
- Migration vers PostgreSQL managé
- Maintien architecture conteneurisee pour scalabilite

## 9. Traitement de l'erreur "deployment exceeded its progress deadline"

Les correctifs appliques dans ce repo:
- Passage Artifact Registry (fin de dependance `gcr.io`)
- Tag image immuable (digest) dans les manifests
- Rollout CI avec timeout explicite et diagnostics automatiques
- Deployment K8s durci:
  - `progressDeadlineSeconds: 900`
  - strategie rolling update explicite

## 10. Commandes utiles

```bash
# Build local (optionnel)
docker build -t europe-west9-docker.pkg.dev/project-6ead5f33-15fd-443c-817/bazar-api-repo/bazar-api:local ./server

# Deploy manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# Rollout status
kubectl rollout status deployment/bazar-api --timeout=300s
kubectl get pods -l app=bazar-api
```
