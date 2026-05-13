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
 * Registers a Prometheus exporter under the plugin path `/api/metrics`,
 * plus a request counter and a latency histogram wired into the root
 * Express router. The default Node.js process metrics are collected too.
 */
export const metricsPlugin = createBackendPlugin({
  pluginId: 'metrics',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        rootHttpRouter: coreServices.rootHttpRouter,
        logger: coreServices.logger,
      },
      async init({ httpRouter, rootHttpRouter, logger }) {
        // Register default Node.js process metrics once.
        collectDefaultMetrics({ register, prefix: 'hextreco_' });

        const httpRequestsTotal = new Counter({
          name: 'http_requests_total',
          help: 'Total HTTP requests handled by the Backstage backend.',
          labelNames: ['method', 'route', 'status'] as const,
        });

        const httpRequestDuration = new Histogram({
          name: 'http_request_duration_seconds',
          help: 'HTTP request duration in seconds.',
          labelNames: ['method', 'route', 'status'] as const,
          buckets: [0.01, 0.05, 0.1, 0.3, 0.6, 1, 3, 6, 10],
        });

        // Middleware on the root router so every backend route is counted.
        const middleware = Router();
        middleware.use((req, res, next) => {
          const end = httpRequestDuration.startTimer();
          res.on('finish', () => {
            const route = req.route?.path ?? req.baseUrl ?? req.path ?? 'unknown';
            const labels = {
              method: req.method,
              route: String(route),
              status: String(res.statusCode),
            };
            httpRequestsTotal.inc(labels);
            end(labels);
          });
          next();
        });
        rootHttpRouter.use('/', middleware);

        // Expose the /metrics endpoint under the plugin path
        // (resolves to /api/metrics) and allow unauthenticated scrapes.
        const router = Router();
        router.get('/', async (_req, res) => {
          try {
            res.set('Content-Type', register.contentType);
            res.end(await register.metrics());
          } catch (err) {
            logger.error('Failed to render Prometheus metrics', err as Error);
            res.status(500).end();
          }
        });
        httpRouter.use(router);
        httpRouter.addAuthPolicy({ path: '/', allow: 'unauthenticated' });

        logger.info('Hextreco metrics plugin ready at /api/metrics');
      },
    });
  },
});
