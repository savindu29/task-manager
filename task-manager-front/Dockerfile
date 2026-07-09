# syntax=docker/dockerfile:1

# ---- deps stage: install node_modules from the lockfile only ----
# Split out so it only re-runs when package.json / package-lock.json change.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build stage: compile the Next.js standalone output ----
FROM node:22-alpine AS build
WORKDIR /app

# NEXT_PUBLIC_* vars are inlined into the client bundle at BUILD time, so the
# backend URL must be supplied here (not at `docker run`). Pass with
# `--build-arg NEXT_PUBLIC_API_URL=https://your-domain`.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime stage: minimal image running the standalone server ----
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
# The standalone server reads PORT/HOSTNAME; bind to all interfaces so the
# container is reachable, and match the port Caddy proxies to.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as the built-in non-root `node` user.
# `output: "standalone"` emits server.js + a trimmed node_modules; the public/
# and .next/static folders are NOT included and must be copied in alongside it.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000
CMD ["node", "server.js"]
