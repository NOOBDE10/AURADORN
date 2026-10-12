import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * Dev only: serves the Vercel functions in /api from `npm run dev`, so checkout and
 * order tracking work locally. In production Vercel runs these files itself.
 * Uses FIREBASE_SERVICE_ACCOUNT from the environment, or secrets/aa-jewelers-admin.json.
 */
export function apiDevServer(): Plugin {
  return {
    name: 'api-dev-server',
    apply: 'serve',
    configureServer(server) {
      if (!process.env.FIREBASE_SERVICE_ACCOUNT || !process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith('{')) {
        const keyFile = path.resolve('secrets/aa-jewelers-admin.json');
        if (fs.existsSync(keyFile)) process.env.FIREBASE_SERVICE_ACCOUNT = fs.readFileSync(keyFile, 'utf8');
      }
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([a-z-]+)(\?.*)?$/);
        const file = match && path.resolve('api', `${match[1]}.ts`);
        if (!file || !fs.existsSync(file)) return next();
        try {
          const mod = await server.ssrLoadModule(file);
          const handler = mod[req.method || 'GET'];
          if (typeof handler !== 'function') {
            res.statusCode = 405;
            return res.end('Method not allowed');
          }
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c as Buffer);
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
          const request = new Request(`http://${req.headers.host}${req.url}`, {
            method: req.method,
            headers,
            body: ['GET', 'HEAD'].includes(req.method || 'GET') ? undefined : Buffer.concat(chunks),
          });
          const response: Response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (e) {
          console.error('[api-dev-server]', e);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Local API error, see terminal' }));
        }
      });
    },
  };
}
