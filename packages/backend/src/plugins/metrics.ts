import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { Router } from 'express';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  register,
} from 'prom-client';

/**
 * Hextreco metrics plugin.
 *
 * Registers a Prometheus exporter at `/api/metrics`, plus an HTTP
 * request counter and latency histogram that observe every response
 * served by the plugin router. Default Node.js process metrics are
 * collected with the `hextreco_` prefix.
 *
 * The endpoint is unauthenticated so the local Prometheus container
 * can scrape it on `host.docker.internal:7007`.
 */
export const metricsPlugin = createBackendPlugin({
  pluginId: 'metrics',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
      },
      async init({ httpRouter, logger }) {
        // Default Node.js process metrics. Registered idempotently so a
        // hot reload during development does not throw.
        try {
          collectDefaultMetrics({ register, prefix: 'hextreco_' });
        } catch {
          // already registered — ignore
        }

        const httpRequestsTotal = new Counter({
          name: 'http_requests_total',
          help: 'Total HTTP requests handled by the metrics plugin router.',
          labelNames: ['method', 'status'] as const,
        });

        const httpRequestDuration = new Histogram({
          name: 'http_request_duration_seconds',
          help: 'HTTP request duration in seconds.',
          labelNames: ['method', 'status'] as const,
          buckets: [0.01, 0.05, 0.1, 0.3, 0.6, 1, 3, 6, 10],
        });

        const router = Router();

        router.use((req, res, next) => {
          const end = httpRequestDuration.startTimer();
          res.on('finish', () => {
            const labels = {
              method: req.method,
              status: String(res.statusCode),
            };
            httpRequestsTotal.inc(labels);
            end(labels);
          });
          next();
        });

        router.get('/', async (_req, res) => {
          try {
            res.set('Content-Type', register.contentType);
            res.end(await register.metrics());
          } catch (err) {
            logger.error('Failed to render Prometheus metrics', err as Error);
            res.status(500).end();
          }
        });

        // Cast smooths over a duplicated @types/express-serve-static-core
        // chain in the dependency tree; the runtime contract is plain
        // Express middleware in both cases.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        httpRouter.use(router as any);
        httpRouter.addAuthPolicy({ path: '/', allow: 'unauthenticated' });

        logger.info('Hextreco metrics plugin ready at /api/metrics');
      },
    });
  },
});
