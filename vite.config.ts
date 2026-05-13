import path from 'path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Dev proxy receives Set-Cookie from the API host; strip Domain/Secure/SameSite=None so
 * the browser stores cookies for http://localhost (cookie-based auth in local dev).
 */
function rewriteSetCookieForLocalDev(cookie: string): string {
  return (
    cookie
      .replace(/;\s*Domain=[^;]*/gi, '')
      .replace(/;\s*Partitioned\b/gi, '')
      .replace(/;\s*Secure\b/gi, '')
      .replace(/;\s*SameSite=[^;]*/gi, '')
      .trim()
      .replace(/;+$/, '') + '; SameSite=Lax'
  )
}

function isHttpServerResponse(res: unknown): res is ServerResponse {
  return (
    res != null &&
    typeof res === 'object' &&
    'writeHead' in res &&
    typeof (res as ServerResponse).writeHead === 'function'
  )
}

function attachProxyErrorHandler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proxy: any,
  label: string,
  target: string
): void {
  proxy.on('error', (err: unknown, _req: unknown, res: unknown) => {
    const e = err instanceof Error ? err : new Error(String(err))
    console.error(`[vite] ${label} proxy → ${target}`)
    console.error(`[vite]`, e.message, e.stack ?? '')
    if (isHttpServerResponse(res) && !res.headersSent) {
      const body = JSON.stringify({
        success: false,
        message: `Dev proxy could not reach the API (${label}). ${e.message}`,
        hint:
          'Confirm the API is up: curl -v ' +
          target.replace(/\/$/, '') +
          '/api/v1/users/me — If TLS errors appear, set VITE_DEV_PROXY_SECURE=false in .env.local',
      })
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(body)
    }
  })
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  /** When the SPA uses relative `/api` in dev, forward here. Keep aligned with `DEFAULT_API` in `src/lib/apiOrigin.ts`. */
  const devProxyTarget =
    env.VITE_DEV_PROXY_TARGET?.trim() || 'https://bizxflow-production.up.railway.app'
  const rewriteCookies = env.VITE_DEV_PROXY_REWRITE_COOKIES?.trim().toLowerCase() !== 'false'
  /** `false` skips TLS certificate verification (dev-only workaround for corporate proxies / odd CA stores). */
  const proxySecure = env.VITE_DEV_PROXY_SECURE?.trim().toLowerCase() !== 'false'

  const commonProxy = {
    target: devProxyTarget,
    changeOrigin: true,
    secure: proxySecure,
    /** Cold starts / slow API (e.g. Railway) — avoid premature socket close. */
    timeout: 120_000,
    proxyTimeout: 120_000,
  } as const

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      proxy: {
        '/api': {
          ...commonProxy,
          configure(proxy) {
            attachProxyErrorHandler(proxy, '/api', devProxyTarget)
            if (rewriteCookies) {
              proxy.on('proxyRes', (proxyRes: IncomingMessage) => {
                const raw = proxyRes.headers['set-cookie']
                if (raw == null) return
                const list = Array.isArray(raw) ? raw : [raw]
                proxyRes.headers['set-cookie'] = list.map(rewriteSetCookieForLocalDev)
              })
            }
          },
        },
        '/socket.io': {
          ...commonProxy,
          ws: true,
          configure(proxy) {
            attachProxyErrorHandler(proxy, 'socket.io', devProxyTarget)
          },
        },
      },
    },
  }
})
