import { badRequest } from './errors.js';
import { validateWebAccess } from '../utils/validate.js';
export async function handleWeb(request, env, ctx) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return badRequest('Missing id');
  }
  const valid = validateWebAccess(request, env);
  if (!valid.ok) {
    return valid.response;
  }
  const playlistUrl = new URL(request.url);
  playlistUrl.pathname = '/playlist';
  playlistUrl.searchParams.set('id', id);
  playlistUrl.searchParams.set('type', 'web');
  const body = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=3000000
${playlistUrl.toString()}
`;
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.apple.mpegurl'
    }
  });
}
