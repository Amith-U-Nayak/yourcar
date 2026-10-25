# Yourcar 🏏🚗
> *"New or pre-owned, right on target."*

A full-stack car dealership inventory platform built with **strict Test-Driven Development (TDD)**, TypeScript, React, Express, PostgreSQL, and Prisma ORM.

The name **Yourcar** is a play on the cricket *"yorker"* — a delivery bowled right at the batsman's toes that lands precisely where aimed. Whether you are seeking a brand-new showroom model or a verified pre-owned vehicle, Yourcar hits the target with absolute domain precision.

---

## 🎯 Table of Contents
1. [Core Architecture & Design](#-core-architecture--design)
2. [Domain Rules & Business Invariants](#-domain-rules--business-invariants)
3. [Interactive 3D Viewer & Media](#-interactive-3d-viewer--media)
4. [Tech Stack](#-tech-stack)
5. [Local Setup & Getting Started](#-local-setup--getting-started)
6. [Seed Data & Demo Accounts](#-seed-data--demo-accounts)
7. [Automated Test Suite & Coverage](#-automated-test-suite--coverage)
8. [My AI Usage & Pair Programming Reflection](#-my-ai-usage--pair-programming-reflection)
9. [3D Model Attribution](#-3d-model-attribution)
10. [Production Docker & Cloud Deployment](#-production-docker--cloud-deployment)

---

## 🏛 Core Architecture & Design

Yourcar follows a strict **Layered Clean Architecture** that enforces separation of concerns, high testability, and the SOLID principles:

```
                  ┌────────────────────────┐
                  │    HTTP Client (SPA)   │
                  └───────────┬────────────┘
                              │ JSON / REST
                  ┌───────────▼────────────┐
                  │      Express Routes    │ (Validation & Auth Middleware)
                  └───────────┬────────────┘
                              │
                  ┌───────────▼────────────┐
                  │       Controllers      │ (HTTP request/response mapping)
                  └───────────┬────────────┘
                              │
                  ┌───────────▼────────────┐
                  │        Services        │ (Pure Domain Logic & Invariants)
                  └───────────┬────────────┘
                              │
                  ┌───────────▼────────────┐
                  │      Repositories      │ (Prisma Client & Database Access)
                  └───────────┬────────────┘
                              │
                  ┌───────────▼────────────┐
                  │   PostgreSQL Database  │
                  └────────────────────────┘
```

### Clean Architecture Principles Enforced:
- **Single Responsibility Principle (SRP)**: Controllers only handle HTTP status codes and payloads. Business rules (e.g., used car uniqueness, restock checks) live exclusively inside `src/services/`.
- **Open/Closed Principle (OCP)**: Multi-criteria vehicle filtering (`src/repositories/vehicle.repository.ts`) constructs Prisma query clauses dynamically without modifying core repository contracts.
- **Dependency Inversion Principle (DIP)**: Controllers consume service interfaces, and services interact with encapsulated repositories rather than coupling directly to raw database queries.
- **Real Database Persistence**: No mock in-memory databases. All backend tests execute against a real isolated PostgreSQL test database (`localhost:5433`) managed via Docker Compose.

---

## 📋 Domain Rules & Business Invariants

The Yourcar domain models real-world automotive dealership logistics with strict constraints:

| Domain Dimension | `NEW` Vehicles | `USED` Vehicles (Pre-owned) |
| :--- | :--- | :--- |
| **Stock Definition** | Batch inventory (multiple identical units) | Unique physical vehicle (individual VIN/record) |
| **Allowed Quantities** | `quantity ≥ 0` | Strictly `quantity ∈ {0, 1}` |
| **Required Attributes** | Standard vehicle specs | Requires `mileage` and `ownersCount` |
| **Purchase Rule** | Decrements `quantity` by 1; returns `409 Conflict` if 0 | Decrements `quantity` from 1 to 0 (sold); returns `409 Conflict` if already sold |
| **Restock Rule** | Admin increments stock by $+n$ units | Admin can relist a sold vehicle (`0 → 1`). Restocking an active car (`1`) returns `409 Conflict`; attempting to restock with quantity $> 1$ returns `400 Bad Request` |
| **UI Stock Status** | Shows remaining stock count or `"Out of stock"` | Shows `"In Stock (1 of 1)"` or `"Sold out"` |

### Role-Based Access Control (RBAC):
- **Customer (`USER`)**: Browse inventory, multi-criteria filtering, view 3D models and studio specifications, purchase vehicles in stock.
- **Dealership Admin (`ADMIN`)**: All customer capabilities, plus adding new inventory, editing vehicle specifications, batch restocking NEW cars, relisting sold USED cars, and deleting vehicle records.

---

## 🚗 Interactive 3D Viewer & Media

Yourcar features an interactive **3D Vehicle Inspection Studio** on the vehicle details modal:
- **WebGL 3D Rendering**: Built with Google's `<model-viewer>` web component, supporting 360° mouse/touch orbit rotation, camera zoom, auto-rotation, and realistic HDR lighting.
- **Zero Performance Penalty**: The 3D viewer library is dynamically code-split (`dist/assets/model-viewer-*.js`) and lazy-loaded only when the user clicks **"View 3D"**. The initial JavaScript bundle remains ultra-lean (~95 kB gzipped).
- **Graceful 2D Fallback**: Vehicles without a 3D asset automatically render high-resolution 2D studio photography accompanied by a `"3D Model Available on Selected Showroom Units"` badge.

---

## 🛠 Tech Stack

### Backend
- **Runtime & Language**: Node.js 20+, TypeScript 5.6
- **Server Framework**: Express 4.21
- **Database & ORM**: PostgreSQL 16, Prisma ORM 5.22
- **Authentication**: JWT (`jsonwebtoken`), password hashing with `bcryptjs`
- **Validation**: Zod schema validation
- **Testing**: Jest 29, Supertest 7, `ts-jest`

### Frontend
- **Framework & Build**: React 18, TypeScript 5.6, Vite 5.4
- **Styling & Icons**: Tailwind CSS 3.4, Lucide React icons
- **State & Data Fetching**: TanStack Query (React Query) v5 with optimistic UI updates
- **Routing**: React Router v6
- **3D Visualization**: Google `<model-viewer>` v4
- **Testing**: Vitest 2.1, React Testing Library, JSDOM

### Infrastructure & DevOps
- **Docker Compose**: Dual-container setup (`yourcar_db` on port 5434, `yourcar_db_test` on port 5433)
- **Version Control**: Git with strict Conventional Commits and TDD Red-Green commit pairs

---

## 🚀 Local Setup & Getting Started

### Prerequisites
- Node.js ≥ 20.x
- Docker & Docker Desktop

### 1. Clone & Environment Configuration
```bash
git clone https://github.com/Amith-U-Nayak/yourcar.git
cd yourcar

# Copy root environment variables
cp .env.example .env
cp .env.example backend/.env
```

### 2. Start PostgreSQL Containers
```bash
docker compose up -d
```
*Note: Dev PostgreSQL runs on host port **5434**, and the test PostgreSQL runs on host port **5433** to prevent collisions with any native local PostgreSQL installations.*

### 3. Backend Setup
```bash
cd backend
npm install

# Run database migrations
npm run db:migrate

# Seed realistic initial inventory & accounts
npm run db:seed

# Run the backend test suite (69 tests)
npm test

# Start backend dev server (port 3000)
npm run dev
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install

# Run the frontend test suite (28 tests)
npm test

# Start frontend dev server (port 5173)
npm run dev
```

Visit **http://localhost:5173** to view the application.

---

## 👤 Seed Data & Demo Accounts

The database seed script (`backend/prisma/seed.ts`) populates the system with 10 realistic vehicles (Porsche, Tesla, BMW, Ford, Audi, Mercedes, Toyota, etc.) and pre-configured accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@yourcar.com` | `AdminPass123!` | Create, update, delete, restock, relist, purchase |
| **Customer** | `customer@yourcar.com` | `CustomerPass123!` | Browse, filter, 3D inspect, purchase |

---

## 🧪 Automated Test Suite & Coverage

The project was developed following **strict Red-Green-Refactor TDD**. Every feature has a dedicated failing test commit (`[RED]`) followed by a passing implementation commit (`[GREEN]`).

### Summary
- **Total Automated Tests**: **97 passing tests** across 14 test suites
- **Backend Tests**: 69 passing tests (Jest + Supertest against real PostgreSQL)
- **Backend Statement Coverage**: **97.52%**
- **Frontend Tests**: 28 passing tests (Vitest + RTL)

### Backend Coverage Breakdown

```
------------------------|---------|----------|---------|---------|-------------------
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------------------|---------|----------|---------|---------|-------------------
All files               |   97.52 |    87.91 |   96.07 |   97.51 |                   
 src                    |     100 |    92.85 |     100 |     100 |                   
  app.ts                |     100 |      100 |     100 |     100 |                   
  config.ts             |     100 |    92.85 |     100 |     100 | 20                
 src/controllers        |   95.45 |       75 |     100 |   95.45 |                   
  auth.controller.ts    |     100 |      100 |     100 |     100 |                   
  vehicle.controller.ts |   94.23 |    66.66 |     100 |   94.23 | 20,36,53          
 src/errors             |     100 |      100 |     100 |     100 |                   
  AppError.ts           |     100 |      100 |     100 |     100 |                   
 src/lib                |     100 |       50 |     100 |     100 |                   
  prisma.ts             |     100 |       50 |     100 |     100 | 15                
 src/middleware         |   97.72 |      100 |     100 |   97.67 |                   
  auth.ts               |     100 |      100 |     100 |     100 |                   
  errorHandler.ts       |     100 |      100 |     100 |     100 |                   
  validate.ts           |    92.3 |      100 |     100 |   91.66 | 20                
 src/repositories       |     100 |      100 |     100 |     100 |                   
  user.repository.ts    |     100 |      100 |     100 |     100 |                   
  vehicle.repository.ts |     100 |      100 |     100 |     100 |                   
 src/routes             |     100 |      100 |     100 |     100 |                   
  auth.routes.ts        |     100 |      100 |     100 |     100 |                   
  vehicle.routes.ts     |     100 |      100 |     100 |     100 |                   
 src/services           |     100 |    85.71 |     100 |     100 |                   
  auth.service.ts       |     100 |      100 |     100 |     100 |                   
  vehicle.service.ts    |     100 |    83.87 |     100 |     100 | 62-65,88          
 src/validators         |   85.71 |       75 |      50 |   85.71 |                   
  auth.validator.ts     |     100 |      100 |     100 |     100 |                   
  vehicle.validator.ts  |   82.35 |       75 |      50 |   82.35 | 9-20,70           
------------------------|---------|----------|---------|---------|-------------------
```

---

## 🤖 My AI Usage & Pair Programming Reflection

This section documents the role of Artificial Intelligence in the development of **Yourcar**, the prompting strategies utilized, and key reflections on the human-AI collaboration.

### 1. Tools & Interaction Model
- **Primary AI Pair**: Claude 3.5 Sonnet / Antigravity Agent.
- **Persona Setup**: The AI was directed to act as a *senior full-stack mentor, UI/UX designer, and DevOps pair*, while I acted as the developer defending every line of code for an interview.
- **Transparency**: Every single commit assisted by AI includes the conventional co-author tag:
  ```
  Co-authored-by: Claude <noreply@anthropic.com>
  ```
- **Prompt Log**: The root [`PROMPTS.md`](./PROMPTS.md) file contains the unedited, raw prompt history.

### 2. Prompting Strategies Employed
- **Phase-by-Phase Gated Workflow**: Rather than asking AI to generate the entire repository at once, the project was partitioned into 9 strictly bounded phases (Phase 0 Scaffolding through Phase 8 3D Viewer and Phase 9 Polish). Each phase required approval before proceeding.
- **Strict TDD Guardrails**: The prompt explicitly mandated the Red-Green-Refactor sequence. The AI was required to write the failing test suite first, run the test runner to prove failure (`[RED]`), commit the test, and only then write the minimal implementation code to turn it green (`[GREEN]`).
- **Domain-Specific Edge Case Probing**: Instead of generic CRUD prompts, prompts emphasized automotive business rules: *"What happens if an admin tries to restock a used car that hasn't been sold yet? What happens if someone purchases the last unit concurrently?"*

### 3. What the AI Excelled At
- **Exhaustive Edge Case Test Generation**: Writing 69 backend integration tests covering edge cases (e.g., negative prices, case-insensitive partial substring search, SQL injection resilience via Prisma, token tampering).
- **TypeScript & Prisma Schema Modeling**: Generating clean Prisma relational schemas and mapped TypeScript DTOs.
- **Modern Responsive UI Layouts**: Creating a clean Tailwind design system with sport-inspired red-orange accents, status badges, and loading skeletons.
- **Lazy-Loaded 3D Integration**: Code-splitting Google `<model-viewer>` so the 1MB 3D bundle is only fetched when inspecting a 3D car.

### 4. Where Human Guidance & Intervention Was Critical
- **Port Conflict Debugging**: On the host Windows machine, a native PostgreSQL service was already running on standard port `5432`. The AI initially attempted to bind the Docker container to 5432, resulting in authentication failures. Human diagnosis led to cleanly remapping the development database to `5434:5432` and the test database to `5433:5432`.
- **Express Route Parameter Precedence**: In `src/routes/vehicle.routes.ts`, Express was matching `/api/vehicles/search` to `/api/vehicles/:id` because `:id` was initially declared earlier in the file. Human domain inspection identified that `router.get("/search", ...)` must be registered before parameterized `:id` routes.
- **Strict Used Car Invariants**: Ensuring that `POST /api/vehicles/:id/restock` rejected increments greater than 1 for used cars (`400 Bad Request`) and rejected restocking unsold used cars (`409 Conflict`), maintaining the invariant that a used car represents a single physical vehicle.
- **Platform Tooling Nuances**: Dealing with Windows PowerShell script execution policy for `npx` commands and handling Docker Desktop named-pipe permissions.

---

## 🎨 3D Model Attribution

The 3D vehicle model bundled in `frontend/public/models/sample-car.glb` is:
- **Model**: "ToyCar" from the Khronos Group glTF Sample Models repository.
- **Creator**: The Khronos Group & glTF Sample Assets contributors.
- **License**: [Creative Commons Attribution 4.0 International (CC-BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
- **Modifications**: Converted and packaged as a standalone binary `.glb` for web asset delivery in Google `<model-viewer>`.

---

## 🚀 Production Docker & Cloud Deployment

Yourcar is pre-configured for both one-command production Docker deployments and cloud hosting:

### Single-Command Production Run (Docker Compose):
```bash
docker compose -f docker-compose.prod.yml up --build -d
```
- **Frontend SPA**: `http://localhost:8080` (Nginx Alpine with SPA routing and Gzip compression)
- **Backend API**: `http://localhost:3000` (Node 20 Alpine with auto-migration)
- **PostgreSQL**: Internal private container network

For cloud deployment options on **Vercel, Render, and Neon.tech**, see the complete [`DEPLOYMENT.md`](./DEPLOYMENT.md) guide.

---

## 📄 License

This project is licensed under the MIT License — see the repository for details.
