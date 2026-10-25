# ─── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (including devDependencies for TypeScript build)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build

# Remove development dependencies to keep production image small
RUN npm prune --production

# ─── Stage 2: Production Runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install openssl for Prisma engine
RUN apk add --no-cache openssl

# Copy production artifacts and dependencies
COPY package*.json ./
COPY prisma ./prisma/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Create non-root user for security
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]
