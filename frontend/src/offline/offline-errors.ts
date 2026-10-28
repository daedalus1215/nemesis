import axios from 'axios';
import { isOriginUnreachableStatus } from '../tauri/cloudflare-access';

export { isAccessDenied } from '../tauri/cloudflare-access';

const isJsonObject = (data: unknown): boolean => {
  if (typeof data !== 'string') {
    return data !== null && typeof data === 'object';
  }
  try {
    const parsed: unknown = JSON.parse(data);
    return parsed !== null && typeof parsed === 'object';
  } catch {
    return false;
  }
};

/**
 * True when a request failed because the backend couldn't be reached at all,
 * as opposed to the backend answering with an error of its own.
 */
export const isBackendUnreachable = (error: unknown): boolean => {
  if (!axios.isAxiosError(error) || axios.isCancel(error)) {
    return false;
  }
  if (!error.response) {
    return true;
  }
  const { status, data } = error.response;
  // The backend sends its 404s as JSON. A plain-text one ("404 page not
  // found") is the reverse proxy with no route to it, e.g. mid-restart.
  // The body is raw text inside the adapter and parsed outside it.
  return (
    isOriginUnreachableStatus(status) ||
    (status === 404 && !isJsonObject(data))
  );
};

/** Something in front of the backend rate-limited the request. */
export const isRateLimited = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 429;

/**
 * Failures a screen should ride out with stored data, as if offline. Rate
 * limiting counts: it's transient, and failing reads outright would break
 * whatever screen made them.
 */
export const isBackendUnavailable = (error: unknown): boolean =>
  isBackendUnreachable(error) || isRateLimited(error);
