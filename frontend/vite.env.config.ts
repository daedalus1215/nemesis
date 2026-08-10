// Dev-server and preview-server configuration ONLY.
//
// ⚠️ None of these values reach the production bundle. They configure vite's `server` and
// `preview` blocks — which the container does not use at all, because nginx serves the
// built static files and Traefik does the /api routing that the preview proxy used to do.
//
// This file used to be gitignored, which meant `npm run build` failed on any clean
// checkout with "Could not resolve ./vite.env.config" — the build only worked on machines
// that happened to have the untracked file. Reading from process.env with defaults makes
// the build reproducible while still letting you override locally.
export const env = {
  VITE_API_URL: process.env.VITE_API_URL ?? 'http://localhost:3000',
  VITE_PORT: process.env.VITE_PORT ?? '5173',
  VITE_HOST: process.env.VITE_HOST ?? '0.0.0.0',
  VITE_BASE_URL: process.env.VITE_BASE_URL ?? '/',
  VITE_ALLOWED_HOSTS: process.env.VITE_ALLOWED_HOSTS ?? 'localhost',
};
