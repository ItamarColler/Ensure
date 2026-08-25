# Ensure

Digital car-insurance onboarding for Hebrew-speaking users. A React SPA walks the applicant
through vehicle and coverage selection, a policy gate with minimal authentication, and private
information forms, backed by an Express/TypeScript API, a self-hosted Postgres, and a rule-based
premium engine.

## Prerequisites

- Docker (Engine 25+ with the Compose v2 plugin)

Nothing else is required to run the stack. Node and pnpm are only needed for working on the code
outside Docker.

## Run

```bash
git clone https://github.com/ItamarColler/Ensure.git
cd Ensure
docker compose up
```

Then open <http://localhost>.

No `.env` file is required for a local run — every secret-shaped variable falls back to an
obviously fake development default. Copy `.env.example` to `.env` and fill it in for a real
deployment.

## Environment variables

| Variable              | Used by                | Local default                     | Purpose                                                                                                        |
| --------------------- | ---------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `POSTGRES_PASSWORD`   | postgres, migrate, api | `local-dev-not-a-real-password`   | Postgres superuser password for the `ensure` role                                                              |
| `JWT_SECRET`          | api                    | `local-dev-not-a-real-jwt-secret` | Signing key for session JWTs                                                                                   |
| `PUBLIC_HOSTNAME`     | caddy                  | `http://localhost`                | Caddy site address. A bare hostname enables automatic HTTPS; the `http://` prefix disables ACME for local runs |
| `INSURER_WEBHOOK_URL` | api                    | Cloud Run stub base URL           | Base URL of the insurer webhook (no path)                                                                      |

## Workspace layout

```
ensure/
├── apps/
│   ├── api/            Express 5 API, run with tsx in dev and production
│   │   ├── migrations/ drizzle-kit generated SQL, committed
│   │   └── src/{db,http,repositories}
│   └── web/            React 19 + Vite SPA, Hebrew RTL behind an i18n layer
│       └── src/i18n/he Hebrew resource namespaces
├── packages/
│   └── shared/         Zod schemas and the Result<T> envelope, consumed as raw TypeScript source
└── deploy/             Caddyfile and the Caddy image that serves the SPA and proxies /api/*
```

## Topology

`caddy` is the only service that publishes host ports (80 and 443). It serves the built SPA and
reverse-proxies `/api/*` to `api:4000`. `postgres` sits alone on `db-net`, which is
`internal: true`, so it has no route to or from the outside world. `api` is attached to both
networks: `db-net` to reach Postgres, `app-net` to be reached by Caddy and to keep the outbound
route it needs for the insurer webhook. Schema changes are applied by a one-shot `migrate`
service gated on the Postgres healthcheck; `api` does not start until it completes successfully.

## Development

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
```

## Verification

Replay the acceptance checks a reviewer is most likely to care about.

Cold build — proves the stack builds from nothing, not from a warm layer cache:

```bash
docker compose down
docker builder prune -af
docker compose build --no-cache
docker compose up -d --wait
curl -fsS http://localhost/api/health
```

The response is the shared `Result<T>` envelope. `data.db.healthEvents` is a live `COUNT` taken
after a real `INSERT`, and `data.insurerWebhook` is the result of a live call to the insurer
stub's `/health` with a 3 second timeout. A first request made against a cold upstream can report
`unreachable`; the probe is deliberately allowed to degrade rather than fail the route.

Persistence — proves the `pgdata` named volume survives a restart:

```bash
curl -fsS http://localhost/api/health
docker compose down
docker compose up -d --wait
curl -fsS http://localhost/api/health
```

`data.db.healthEvents` after the restart is strictly greater than before it. Note that
`docker compose down -v` deletes the volume and resets the count to zero by design.

Isolation — proves Postgres is unreachable from the host and that only Caddy publishes ports:

```bash
docker inspect ensure-postgres-1 --format '{{.HostConfig.PortBindings}}'
docker network inspect ensure_db-net --format '{{.Internal}}'
docker compose exec caddy nc -z -w 3 postgres 5432
```

The port bindings are empty, `db-net` reports `true`, and Caddy cannot even resolve `postgres`
because it is not attached to `db-net`. A bare `nc -z localhost 5432` from the host is not a
reliable check: it succeeds on any machine that happens to run its own Postgres, which is a
different server entirely.

Conventions:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
```
