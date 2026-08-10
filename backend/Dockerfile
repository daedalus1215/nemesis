# Multi-stage: the TypeScript toolchain never reaches the shipped image.
#
# Replaces the previous single-stage `FROM node:18` build, which installed the Nest CLI
# globally into the runtime image and shipped the whole toolchain to production.
FROM node:22-alpine AS build
WORKDIR /app
# package files first — this layer caches until dependencies actually change.
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# ⚠️ Two lifecycle scripts break a production install, and the failure is opaque —
# `exit code: 127`, command not found:
#   "prepare": "husky"            devDependency, absent under --omit=dev
#   "postinstall": "patch-package" likewise
#
# --ignore-scripts sidesteps both, but patch-package is NOT optional here: patches/
# carries a fix to buffer-equal-constant-time, which sits in the PRODUCTION tree via
# @nestjs/jwt -> jsonwebtoken -> jws -> jwa. Skipping it ships an unpatched JWT
# dependency. So: skip the scripts, then apply the patches explicitly.
COPY patches ./patches
RUN npm ci --omit=dev --ignore-scripts \
 && npx --yes patch-package \
 && npm cache clean --force
COPY --from=build /app/dist ./dist
# Migrations are .ts under src/ but compiled into dist/ by nest build, and app.module.ts
# points TypeORM at __dirname — so migrationsRun finds them here.
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
