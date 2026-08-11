# Multi-stage: neither the TypeScript toolchain nor the C++ build tools reach the shipped
# image. Replaces a single-stage `FROM node:18` build that shipped both.

# ── stage 1: compile the TypeScript ──────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── stage 2: production dependencies, including native ones ──────────────────────────
# This exists as its own stage so python3/make/g++ are available to compile bcrypt, and
# are then thrown away with the stage instead of shipping in the runtime image.
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
COPY patches ./patches
# ⚠️ --ignore-scripts is required, because two lifecycle scripts are devDependencies and
#    fail an --omit=dev install with an opaque `exit code: 127`:
#        "prepare": "husky"        "postinstall": "patch-package"
#
# ⚠️ But --ignore-scripts ALSO skips native module builds, and bcrypt is native. Skipping
#    it produces an image that builds and pushes cleanly, then crash-loops at runtime with
#      Cannot find module '.../bcrypt/lib/binding/napi-v3/bcrypt_lib.node'
#    So the two things the scripts would have done are done explicitly instead.
#
# ⚠️ `npm rebuild` (unqualified) does NOT work here: it re-runs the ROOT package's
#    postinstall, which is patch-package again — and patch-package is only fetched
#    transiently by npx, so it is not on PATH. Another `exit code: 127`. Naming the
#    package rebuilds just that dependency's native binding and leaves root scripts alone.
RUN npm ci --omit=dev --ignore-scripts \
 && npx --yes patch-package \
 && npm rebuild bcrypt sqlite \
 && npm cache clean --force

# ── stage 3: the runtime ─────────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# Migrations compile into dist/ and app.module.ts points TypeORM at __dirname, so
# migrationsRun finds them here.
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
