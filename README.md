# devops-api

Simple REST API built with Node.js + Express, containerized with Docker and deployed automatically via GitHub Actions → Docker Hub → Render.

## Endpoints

| Method | Path      | Description            |
|--------|-----------|------------------------|
| GET    | `/`       | Service info           |
| GET    | `/health` | Health check + uptime  |

---

## Run locally

### With Node.js

```bash
npm install
npm start
# → http://localhost:3000
```

### With Docker

```bash
docker build -t devops-api .
docker run -p 3000:3000 devops-api
# → http://localhost:3000
```

### Run tests

```bash
npm test
```

---

## Branching strategy (Gitflow)

```
main          ──────────────────────────────●── production
                                           ↑
release/x.x   ──────────────────────●──────┘   staging image built
                                   ↑
develop       ──────●──────●───────┘            integration
                   ↑       ↑
feature/*     ─────┘       └────────            isolated features
```

| Branch | Pipeline behavior |
|---|---|
| `feature/*` | test only |
| `develop` | test only |
| `release/*` | test + build + push image tagged with version |
| `main` | test + build + push (`latest`) + deploy to Render |
| PR to `develop` or `main` | test only |

### Typical workflow

```bash
# start a feature
git checkout develop
git checkout -b feature/my-feature

# ... code, commit ...

# merge into develop via PR
git checkout develop
git merge --no-ff feature/my-feature

# cut a release
git checkout -b release/1.1.0
# bump version if needed, final fixes
git checkout main
git merge --no-ff release/1.1.0
git tag v1.1.0
git checkout develop
git merge --no-ff release/1.1.0
```

---

## CI/CD Pipeline

```
feature/* / develop → PR → main
         │                   │
         ▼                   ▼
    ┌─────────┐         ┌─────────┐   ┌──────────────────┐   ┌────────────────┐
    │  test   │         │  test   │──▶│ build-and-push   │──▶│    deploy      │
    │ npm ci  │         │ npm ci  │   │ docker buildx    │   │ Render webhook │
    │ npm test│         │ npm test│   │ push → Docker Hub│   │ pull + restart │
    └─────────┘         └─────────┘   └──────────────────┘   └────────────────┘
   (no image push)                         (main only
                                            tags: latest
                                            + sha)
```

- **test**: runs on every branch and PR
- **build-and-push**: runs on `release/*` and `main` — tags image with git SHA; `latest` tag only on `main`; `release/*` tags with version number
- **deploy**: runs only on `main` — triggers Render to pull the new image and restart

---

## Deploy to Render (setup)

1. Create a new **Web Service** on [render.com](https://render.com)
2. Choose **Deploy an existing image from a registry**
3. Set image URL: `docker.io/reymanuel/devops-api:latest`
4. Copy the **Deploy Hook URL** from the service settings
5. Add the following secrets to your GitHub repository (`Settings → Secrets → Actions`):

| Secret                  | Value                        |
|-------------------------|------------------------------|
| `DOCKER_USERNAME`       | Your Docker Hub username     |
| `DOCKER_PASSWORD`       | Docker Hub access token      |
| `RENDER_DEPLOY_HOOK_URL`| Deploy hook URL from Render  |

Every push to `main` will build, publish the image, and trigger a fresh deploy automatically.
