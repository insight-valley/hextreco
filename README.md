# Hextreco

Insight Valley's internal developer portal, built on Backstage. The
repo is public on purpose. Decisions, gotchas and trade-offs are
written down in `docs/` and in the lab notes that travel back to the
Insight control plane.

Status: milestone 0, local environment scaffolded. Backstage is pinned
to 1.50.4. The stack runs with Postgres, Prometheus, Grafana and a
self-hosted Langfuse v2 alongside it.

## Pre-requisites

- Node 22 LTS. Use `nvm` and let it read `.nvmrc`, or `asdf` with
  `.tool-versions`.
- Yarn, managed by Corepack. No manual install needed; the repo ships
  Yarn 4.4.1 under `.yarn/releases/`.
- Docker engine (tested with Colima and OrbStack on macOS) and a
  Compose CLI. Either `docker compose` (plugin) or `docker-compose`
  (standalone) works.
- The TCP ports listed below.

## Ports

| Service            | Host port | Notes                              |
| ------------------ | --------- | ---------------------------------- |
| Backstage frontend | 3000      | `yarn dev` serves the SPA          |
| Backstage backend  | 7007      | Express, exposes `/api/metrics`    |
| Prometheus         | 9090      | Scrapes the backend every 15s      |
| Grafana            | 3002      | admin / admin on first login       |
| Langfuse v2        | 3030      | Self-hosted, Postgres-only         |
| Backstage Postgres | 5432      | Reserved for the catalog DB        |
| Langfuse Postgres  | 5433      | Dedicated, do not share with above |

Grafana is on 3002 (not 3001) because Gabriel runs a `bun` dev server
that owns 3001 on his machine.

## Quickstart

```sh
git clone https://github.com/insight-valley/hextreco.git
cd hextreco
nvm use                # picks up .nvmrc → Node 22
cp .env.example .env   # then fill the LANGFUSE_* and POSTGRES_* secrets
yarn install
make reset             # kills stale procs on :3000/:7007 + brings infra up
make dev               # Backstage backend (:7007) + frontend (:3000)
make doctor            # smoke check in another terminal
```

`make help` lists every target. The `Makefile` sources `.env` before
starting the backend — without it, `app-config.local.yaml` resolves
`${POSTGRES_PASSWORD}` to empty and the backend dies with
`SASL: client password must be a string`.

Generate the three Langfuse secrets before the first `make reset`:

```sh
openssl rand -base64 32   # NEXTAUTH_SECRET
openssl rand -base64 32   # SALT
openssl rand -hex 32      # ENCRYPTION_KEY
```

The Compose file refuses to start Langfuse if any of those are unset.

## Smoke checks

After `make reset` and `make dev` are both running:

```sh
curl http://localhost:9090/-/healthy             # → "Prometheus Server is Healthy."
curl http://localhost:9090/api/v1/targets | jq   # → backstage-backend & prometheus UP
curl http://localhost:7007/api/metrics | head    # → Prometheus exposition format
curl -s http://localhost:3030/api/public/health  # → {"status":"OK", ...}
docker exec hextreco-grafana wget -qO- http://localhost:3000/api/health
```

The Grafana check goes through `docker exec` because the host port
is already in use on Gabriel's setup. The browser at
`http://localhost:3002` works fine.

## Layout

```
.
├── packages/
│   ├── app/          Backstage frontend (React)
│   └── backend/      Backstage backend + custom metrics plugin
├── infra/
│   ├── prometheus/   Scrape config
│   └── grafana/      Datasource + dashboard provisioning
├── docker-compose.yml
├── Makefile
└── docs/local-setup.md
```

## What works today

- Backstage scaffolded on the 1.50.4 release pin (see `backstage.json`)
- `/api/metrics` exporter wired into the backend, scraped by Prometheus
- Grafana datasource + a "Backstage Overview" dashboard provisioned
- Langfuse v2 reachable on `:3030` for the LLM observability lab
- Pre-commit (lint-staged) and pre-push (`yarn tsc --noEmit`) hooks

## Doc-as-blog

Cada etapa significativa do projeto vira post no blog do mantenedor.
As lab notes cruas vivem no repositório de controle interno; os posts
saem no Medium, Substack e blog próprio.

## Documentation

- `docs/local-setup.md`, the long-form quickstart with troubleshooting.
- `core-context/insight-valley/hextreco/DESIGN.md` (in the control
  plane), the decision log that drove this milestone.
- `core-context/insight-valley/hextreco/blog-notes.md`, the lab notes
  that become posts on `gdantas.com.br`.

## License

MIT. See `LICENSE`.
