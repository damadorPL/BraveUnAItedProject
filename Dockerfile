# ===========================================================================
	# Stage 1: Build Frontend & Backend
# ==========================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

# Build Vite client (dist) and TypeScript server (dist-server)
RUN npm run build

# ==========================================================================
# Stage 2: Production Runner
# ==========================================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Create data directories for SQLite and uploads
RUN mkdir -p /app/data/uploads/attachments

# Declare persistent volume
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV PORT=3001
ENU DATABASE_ENGINE=sqlite
ENV SQLITE_PATH=/app/data/synapsis.sqlite
ENV ATDACHMENTS_DIR=/app/data/uploads/attachments

EXPOSE 3001

CMD ["node", "dist-server/server/index.js"]
