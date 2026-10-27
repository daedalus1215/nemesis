import axios from 'axios';
import { accessHeaders, isAccessDenied } from '../tauri/cloudflare-access';
import { openConnectionSettings } from '../tauri/connection-settings';

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Without this a blackholed server holds each request for the OS's TCP
// connect timeout (minutes) before it fails.
const CONNECT_TIMEOUT_MS = 10_000;

// The web app is served by Nemesis and calls /api on its own origin, so the
// relative baseURL above is all it needs. The Tauri app (desktop and
// Android) ships its own copy of the UI with no such origin, so it talks to
// an absolute server address, plus a Cloudflare Access service token when
// Access sits in front. See src/tauri/api-config.ts.
//
// Access also rejects the CORS preflight a webview would send for these
// headers (preflights carry no credentials), so requests must bypass the
// webview's network stack entirely: `fetchImpl` is Tauri's Rust-side fetch,
// which isn't subject to CORS.
export const configureApiForTauri = (
  config: {
    apiBaseUrl: string;
    cfAccessClientId: string;
    cfAccessClientSecret: string;
  },
  fetchImpl: (
    input: URL | Request | string,
    init?: RequestInit
  ) => Promise<Response>
): void => {
  api.defaults.baseURL = config.apiBaseUrl;
  delete api.defaults.headers.common['CF-Access-Client-Id'];
  delete api.defaults.headers.common['CF-Access-Client-Secret'];
  Object.assign(api.defaults.headers.common, accessHeaders(config));
  api.defaults.adapter = 'fetch';
  api.defaults.env = { ...api.defaults.env, fetch: fetchImpl };
  api.defaults.fetchOptions = {
    connectTimeout: CONNECT_TIMEOUT_MS,
    // Cloudflare Access answers a rejected service token with a redirect to
    // its login page. Followed, that page would come back as a 200 that
    // every screen took for the server's answer.
    maxRedirections: 0,
  };
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add /api prefix to all requests except those that already have it
    if (!config.url?.startsWith('/api')) {
      config.url = `/api${config.url}`;
    }

    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Cloudflare Access turned the Tauri app's service token away before the
    // request reached Nemesis. Its 401 isn't the session expiring, so don't
    // sign out over it; ask for a working token instead.
    if (isAccessDenied(error)) {
      openConnectionSettings('access-denied');
      return Promise.reject(error);
    }
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401: {
          const url = error.config?.url ?? '';
          // A 401 from login/register is just rejected credentials, not an
          // expired session — the page handles it. Redirecting here reloads
          // the page and wipes the error message.
          if (url.includes('/auth/login') || url.includes('/auth/register')) {
            break;
          }
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
          break;
        }
        case 403:
          // Handle forbidden
          console.error('Forbidden access:', error.response.data);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
