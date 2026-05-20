# Local setup

Long-form companion to the README. Covers the order of operations,
what each piece does, and the gotchas that showed up while putting
milestone 0 together.

## Order of operations

1. **Pin Node**. `nvm use` reads `.nvmrc` and selects 22. The
   `package.json` engines field accepts `22 || 24`, but the lab runs
   on 22 because Backstage 1.41 was tested against it.

2. **Generate secrets**. Langfuse refuses to boot if
   `NEXTAUTH_SECRET`, `SALT` or `ENCRYPTION_KEY` is missing. Use the
   `openssl rand` commands from the README and paste them into `.env`.

3. **`yarn install`**. Corepack downloads Yarn 4.4.1 on the first
   run. Expect ~1 GiB of `node_modules` and a few warnings about
   TypeScript patches that don't apply cleanly. Those are harmless
   on this release pin.

4. **`docker-compose up -d`**. Boots two Postgres instances,
   Prometheus, Grafana and Langfuse on a dedicated `hextreco`
   network. The healthchecks make Langfuse wait for its Postgres
   before starting, and Grafana wait for Prometheus.

5. **`yarn dev`**. Runs the Backstage app and backend in the same
   terminal. The backend listens on 7007 and immediately exposes
   `/api/metrics`. Prometheus picks the target up on the next scrape
   cycle (≤15s).

## Verifying each piece

### Prometheus

```sh
curl http://localhost:9090/-/healthy
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
```

Both `prometheus` and `backstage-backend` should report `health: "up"`.
If the Backstage target is `down`, the most likely cause is the
backend not running on the host — check `lsof -nP -iTCP:7007`.

### Grafana

The host port is 3002. The container listens on 3000 internally, so
the host check that always works regardless of port conflicts is:

```sh
docker exec hextreco-grafana wget -qO- http://localhost:3000/api/health
```

In the browser, open `http://localhost:3002` and log in with `admin /
admin`. Grafana will ask for a new password on first login. The
Prometheus datasource and a "Backstage Overview" dashboard are
pre-provisioned under the `Hextreco` folder.

### Langfuse

```sh
curl -s http://localhost:3030/api/public/health
```

Should return `{"status":"OK","version":"2.95.x"}`. The web UI on
`http://localhost:3030` will ask you to create a project on the first
visit.

### Backstage metrics

```sh
curl -s http://localhost:7007/api/metrics | head -20
```

The output is in the Prometheus exposition format. Metrics with the
`hextreco_` prefix come from `prom-client`'s default Node.js
collector; `http_requests_total` and `http_request_duration_seconds_*`
come from the middleware in `packages/backend/src/plugins/metrics.ts`.

## Troubleshooting

### Compose says "Cannot connect to the Docker daemon"

Colima isn't running. `colima start` and retry. If you use OrbStack
or Docker Desktop, open the app first.

### Grafana 404 on every endpoint

Another process owns the host port. Run `lsof -nP -iTCP:3002 -sTCP:LISTEN`
to find it. If you can't free the port, change the `ports` mapping
in `docker-compose.yml` and update the README.

### Langfuse refuses to start

The Compose file uses `${VAR:?error}` so an unset secret aborts the
boot with a clear message. Check that `.env` exists and that all three
secrets are non-empty.

### Backstage backend stalls at "Service has not started up yet"

Plugin initialization is still running. Wait around 30 seconds. If
it never completes, look for `Backend startup failed` in the log; it
lists which plugin owns the missing dependency. The `mcp-actions`
and `catalog` plugins stall under the 1.41 release pin because they
expect a core service ref called `alpha.core.metrics` that the pinned
`backend-defaults` does not provide. `mcp-actions` is already
commented out in `packages/backend/src/index.ts` for that reason.

### `yarn lint` complains about a missing `eslint-plugin-jest`

That plugin is required by the Backstage ESLint config but was not
included in the 0.8.2 scaffold for some workspaces. It's a direct
devDependency of the root `package.json` now, so a fresh `yarn install`
is the fix.

## Tearing down

```sh
docker-compose down            # stops containers, keeps volumes
docker-compose down -v         # also removes Postgres + Grafana volumes
```

The Postgres volumes are named (`backstage_pg_data`,
`langfuse_pg_data`), so they survive `docker-compose down` by default.
Reach for `-v` when you want a clean DB.

## What's next

After milestone 0 is signed off, the next milestones land here as
separate docs. Likely order: Postgres-backed Backstage catalog,
first `catalog-info.yaml` for `insight-site`, TechDocs builder,
GitHub Actions plugin.
