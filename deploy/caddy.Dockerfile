FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter web build

FROM caddy:2-alpine
COPY --from=build /repo/apps/web/dist /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
