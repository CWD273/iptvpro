import { FORCED_WEB_REFERER } from './constants.js';
export function validateWebAccess(request, env) {
  const referer = request.headers.get('Referer') || '';
  if (!referer.includes(FORCED_WEB_REFERER)) {
    return {
      ok: false,
      response: new Response('Forbidden (invalid referer)', { status: 403 })
    };
  }
  return { ok: true };
}
export function validatePlstAccess(request, env) {
  return { ok: true };
}
