import { getSessionStub } from '../durable/session.js';
import { rewritePlaylist } from '../utils/rewrite.js';
import { getOrRefreshTokenizedPlaylist } from '../utils/token.js';
import { badRequest, serverError } from './errors.js';

export async function handlePlaylist(request, env, ctx) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type') || 'web';

    if (!id) {
      return badRequest('Missing id');
    }

    const session = getSessionStub(env, id);
    const state = await session.fetch('https://session/init', {
      method: 'POST',
      body: JSON.stringify({ id })
    }).then(r => r.json());

    const originURL = state.originURL;
    if (!originURL) {
      // For now, hardcode mapping; later, pull from KV or config
      // Example: single test stream
      state.originURL = 'http://206.212.244.71:8080/live/BRIDGITS@YAHOO.COM/BRIDGITS@2022/46708.m3u8';
    }

    const upstream = await getOrRefreshTokenizedPlaylist(env, session, state);
    const rewritten = rewritePlaylist(upstream.playlist, {
      id,
      type,
      baseUrl: `${url.origin}`
    });

    // Persist updated state
    await session.fetch('https://session/save', {
      method: 'POST',
      body: JSON.stringify({
        ...state,
        token: upstream.token,
        playlist: rewritten
      })
    });

    return new Response(rewritten, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl'
      }
    });
  } catch (err) {
    return serverError(err);
  }
}
