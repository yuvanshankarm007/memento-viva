# Multi-stage Dockerfile for Memento Viva
# Production build: Vite static frontend + Express TypeScript Agent backend

FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json tsconfig*.json vite.config.ts tailwind.config.js postcss.config.js ./

# Install dependencies
RUN npm ci

# Copy full source
COPY index.html ./
COPY src/ ./src/
COPY server/ ./server/

# Build Vite client and compile TypeScript server
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/server/server.js"]
