# 🚀 Yourcar Deployment Guide

This document outlines the deployment strategies available for **Yourcar**, covering both containerized production deployments with Docker and zero-cost cloud hosting.

---

## 1. Single-Command Production Deployment (Docker Compose)

Yourcar includes a turnkey production Docker Compose stack (`docker-compose.prod.yml`) that builds and runs:
1. **Production PostgreSQL 16 Alpine** container with health checks and persistent volume storage.
2. **Production Backend API** container running the optimized Node.js runtime, executing Prisma migrations on startup, and listening on port `3000`.
3. **Production Frontend (Nginx Alpine)** container serving the optimized, code-split React SPA with Gzip compression and reverse-proxying `/api/` calls on port `8080`.

### Running Production Locally:
```bash
# 1. Build and start all three containers
docker compose -f docker-compose.prod.yml up --build -d

# 2. Seed production database with sample cars and demo users
docker exec -it yourcar_prod_backend npx prisma db seed

# 3. Access the application:
# - Frontend: http://localhost:8080
# - Backend API: http://localhost:3000/health
```

### Stopping Production:
```bash
docker compose -f docker-compose.prod.yml down
```

---

## 2. Cloud Deployment (Free Tier Stack)

The architecture is fully decoupled, making it straightforward to deploy across modern free-tier hosting providers:

### Recommended Setup:
- **Frontend**: [Vercel](https://vercel.com) (or [Netlify](https://netlify.com))
- **Backend**: [Render](https://render.com) (Web Service)
- **Database**: [Neon.tech](https://neon.tech) (Serverless PostgreSQL)

---

### Step A: Database on Neon.tech
1. Create a free account at [neon.tech](https://neon.tech).
2. Create a new project called `yourcar-db`.
3. Copy the pooled connection string (e.g. `postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`).

---

### Step B: Backend on Render.com
1. Create a free account at [render.com](https://render.com).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository: `https://github.com/Amith-U-Nayak/yourcar`.
4. Configure the service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && node dist/index.js`
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: *(Your Neon.tech connection string)*
   - `JWT_SECRET`: *(A secure 64-character random string)*
   - `JWT_EXPIRES_IN`: `7d`
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `CORS_ORIGIN`: `*` *(or your Vercel frontend URL)*
6. Click **Create Web Service**.
7. Once deployed, run the seed command via Render's shell:
   ```bash
   npm run db:seed
   ```
8. Note your public backend URL (e.g. `https://yourcar-api.onrender.com`).

---

### Step C: Frontend on Vercel
1. Create a free account at [vercel.com](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository: `https://github.com/Amith-U-Nayak/yourcar`.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and choose `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://yourcar-api.onrender.com/api` *(Your Render backend URL)*
6. Click **Deploy**.
7. In a minute, your frontend will be live with full HTTPS and automatic CI/CD on every push to `main`!

---

## 3. Production Health & Verification Checklist

Once deployed to any environment:
- [ ] Visit `GET /health` on the backend API — returns `{"status":"ok","timestamp":"..."}`.
- [ ] Verify CORS headers allow the frontend origin.
- [ ] Log in with seeded admin credentials (`admin@yourcar.com` / `AdminPass123!`).
- [ ] Test adding, purchasing, and 3D-inspecting a vehicle.
