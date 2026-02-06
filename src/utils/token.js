import { buildLocalPlayerHeaders } from './headers.js';
export async function getOrRefreshTokenizedPlaylist(env, session, state) {
  const now = Date.now();
  if (state.playlist && state.expiresAt && state.expiresAt > now + 30_000) {
    return { playlist: state.playlist, token: state.token };
  }
  const headers = buildLocalPlayerHeaders(state.sessionHeaders);
  const resp = await fetch(state.originURL, { headers });
  if (!resp.ok) {
    throw new Error(`Failed to fetch origin playlist: ${resp.status}`);
  }
  const text = await resp.text();
  const token = extractTokenFromUrl(state.originURL);
  const expiresAt = now + 5 * 60_000;
  return { playlist: text, token, expiresAt };
}
export async function refreshToken(env, session, state) {
  try {
    const updated = await getOrRefreshTokenizedPlaylist(env, session, state);
    await session.fetch('https://session/save', {
      method: 'POST',
      body: JSON.stringify({
        ...state,
        token: updated.token,
        playlist: updated.playlist,
        expiresAt: updated.expiresAt
      })
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
function extractTokenFromUrl(url) {
  try {
    const u = new URL(url);
    return u.search || '';
  } catch {
    return '';
  }
}
