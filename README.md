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

## CI/CD Pipeline

The pipeline runs on every push to `main` and has three stages:

```
push to main
     │
     ▼
┌─────────┐     ┌──────────────────┐     ┌────────────────┐
│  test   │────▶│ build-and-push   │────▶│    deploy      │
│         │     │                  │     │                │
│ npm ci  │     │ docker buildx    │     │ Render webhook │
│ npm test│     │ push → Docker Hub│     │ pull + restart │
└─────────┘     └──────────────────┘     └────────────────┘
```

- **test**: installs dependencies, runs Jest with coverage
- **build-and-push**: builds multi-platform image, tags with `latest` + git SHA, pushes to Docker Hub using GitHub layer cache
- **deploy**: calls Render deploy hook — Render pulls the new image and restarts the service

Pull requests only run the `test` job (no push, no deploy).

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
