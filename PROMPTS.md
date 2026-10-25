# PROMPTS.md

This file contains raw, unedited prompts sent to AI tools during the development of Yourcar.

---

## Session 1 — 2026-10-24

> You are a senior full-stack engineer, UI/UX designer, DevOps-minded, and my pair-programming mentor. I'm Amith, a student who must complete a take-home TDD kata and defend every line in an interview. Explain your reasoning briefly, keep code simple and readable, and do not over-engineer. The attached PDF is the source of truth for requirements.
>
> ## Product
> Name: Yourcar (always one word, capital Y; repo name: yourcar)
> Tagline: "New or pre-owned, right on target."
> The name is a play on the cricket "yorker": precise, lands exactly where you aim.
> Yourcar is a car dealership inventory system that handles BOTH new and pre-owned cars, like a real dealer.
>
> ## Domain rules
> Vehicle (required by the spec): id (unique), make, model, category (e.g. SUV, Sedan, Hatchback, Coupe, Truck, EV), price, quantity.
> Extra fields: condition (NEW | USED), year, fuelType (PETROL | DIESEL | EV | HYBRID), imageUrl, modelUrl (optional .glb for 3D).
> Used-only fields: mileage and ownersCount (required when condition = USED, optional/ignored for NEW).
> Rules:
> - NEW cars: quantity is stock count (multiple identical units). Purchase decrements by 1; restock increments.
> - USED cars: each record is a unique car, so quantity must be 0 or 1. Purchase marks it sold (quantity 0). Restocking a USED car is allowed only if quantity is 0 (relisting).
> - Quantity can never go below 0. Purchase of an out-of-stock vehicle returns a clear error (409).
> - Search/filter: make, model, category, price range (required), plus condition, fuelType, year range (extras).
> - Roles: USER and ADMIN. Only ADMIN can delete and restock; add/update available to ADMIN (decide and document whether USER may add; default: ADMIN only for add/update/delete/restock).
>
> ## Required API (from the spec)
> POST /api/auth/register, POST /api/auth/login (JWT)
> Protected: POST /api/vehicles, GET /api/vehicles, GET /api/vehicles/search, PUT /api/vehicles/:id, DELETE /api/vehicles/:id (Admin), POST /api/vehicles/:id/purchase, POST /api/vehicles/:id/restock (Admin)
> Real database required (no in-memory DB).
>
> ## Frontend (HTML5, CSS3, Tailwind, React; SPA)
> Register/login, dashboard of vehicles with cards, search + filters (including a New/Used toggle), Purchase button disabled when quantity is 0 (label it "Sold out" for used / "Out of stock" for new), admin UI to add/update/delete/restock, responsive, polished UX with loading/empty/error states.
> Extra feature: interactive 3D vehicle view (rotate/zoom) on the vehicle details view, lazy-loaded, with a fallback image if no model exists.
> Design direction: bold, sporty, clean. Propose a palette and a simple wordmark (cricket-ball-as-wheel logo idea) in the frontend foundation phase. A "Pre-owned" badge with mileage/owners on used cars.
>
> ## Graded process rules
> 1. Strict TDD (Red-Green-Refactor) with separate commits for failing test, passing implementation, and refactor, especially on the backend. High, meaningful coverage.
> 2. Clean code, SOLID, layers: routes -> controllers -> services -> repositories. Clear naming, meaningful comments.
> 3. Frequent Conventional Commits. Every commit where AI helped must end with two blank lines, then: Co-authored-by: Claude <noreply@anthropic.com>
> 4. README: project explanation, local setup (backend + frontend), screenshots, detailed "My AI Usage" section (tools, how used, reflection), test report.
> 5. Root PROMPTS.md with my raw, unedited chat logs or public links (no summaries).
> 6. No code copied from other repos. 3D models must be properly licensed (CC0/CC-BY) and credited in the README.
> 7. Optional: deploy live.
>
> ## Proposed stack (challenge it only with tradeoffs)
> - Backend: Node.js, Express, TypeScript.
> - Database: PostgreSQL with Prisma ORM (real database; spin up via docker-compose).
> - Backend testing: Jest + supertest (TDD).
> - Frontend: Vite + React + TypeScript + Tailwind CSS.
> - Frontend testing: Vitest + React Testing Library (TDD for components/hooks).
> - 3D viewer: `@google/model-viewer` (lazy-loaded web component, simple, robust, fallback-friendly).
> - Tooling: ESLint, Prettier, git-lfs for any 3D assets.
>
> Please confirm you've digested all of this. Then:
> 1. Propose any refinements or tradeoffs to the stack/plan.
> 2. Break down the work into sequential, small phases.
> 3. Stop and wait for my approval before touching code.

---

## Session 2 — 2026-10-24

> ill come back to continue tomorrow. for now concisely explain what is prisma and what it does and how it helps in this project.

> mongoose also does the same thing ? yes/no

---

## Session 3 — 2026-10-25

> lets continue.

> its running. carry on. i wont be interacting for the next 10-15 min. so work accordinglt

> lets continue

> next

> lets continue

> lets continue

> yes lets continue.

> continue

> so building and testing is done?? and we r preparing for deployment?

> before that shall i run and check?

> give me the required details to add a new vehicle..

> [Screenshot: 3D MODEL GLB URL input tooltip "Please enter a URL"]

> i tested and the thing is i added the porsche car that u gave and in 3D view it is not porsche

> lets keep this.

> lets continue. i hope we can do changes later on
