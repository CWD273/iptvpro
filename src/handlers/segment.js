import { getSessionStub } from '../durable/session.js';
import { buildLocalPlayerHeaders } from '../utils/headers.js';
import { refreshToken } from '../utils/token.js';
import { badRequest, serverError } from './errors.js';
export async function handleSegment(request, env, ctx) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const n = url.searchParams.get('n');
    const path = url.searchParams.get('p');
    if (!id || !n || !path) {
      return badRequest('Missing id, n, or p');
    }
    const session = getSessionStub(env, id);
    let state = await session.fetch('https://session/get').then(r => r.json());
    if (!state || !state.originURL) {
      return badRequest('No session state for this stream');
    }
    const origin = new URL(state.originURL);
    const segmentUrl = new URL(path, `${origin.protocol}//${origin.host}`).toString();
    const headers = buildLocalPlayerHeaders(state.sessionHeaders);
    let upstreamResp = await fetch(segmentUrl, { headers });
    if (upstreamResp.status === 403) {
      const refreshed = await refreshToken(env, session, state);
      if (!refreshed.ok) {
        return new Response('Forbidden (token refresh failed)', { status: 403 });
      }
      state = refreshed.state || await session.fetch('https://session/get').then(r => r.json());
      const newOrigin = new URL(state.originURL);
      const refreshedSegmentUrl = new URL(path, `${newOrigin.protocol}//${newOrigin.host}`).toString();
      upstreamResp = await fetch(refreshedSegmentUrl, { headers });
    }
    if (!upstreamResp.ok) {
      return new Response('Upstream error', { status: upstreamResp.status });
    }
    await session.fetch('https://session/save', {
      method: 'POST',
      body: JSON.stringify({
        ...state,
        lastSegment: Number(n)
      })
    });
    return new Response(upstreamResp.body, {
      status: 200,
      headers: {
        'Content-Type': upstreamResp.headers.get('Content-Type') || 'video/mp2t',
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    return serverError(err);
  }
}
