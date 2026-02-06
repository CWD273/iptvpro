import { DEFAULT_LOCAL_UA } from './constants.js';

export function buildLocalPlayerHeaders(sessionHeaders = {}) {
  return {
    'User-Agent': sessionHeaders['User-Agent'] || DEFAULT_LOCAL_UA,
    'Accept': sessionHeaders['Accept'] || '*/*',
    'Connection': sessionHeaders['Connection'] || 'keep-alive',
    ...sessionHeaders
  };
}
