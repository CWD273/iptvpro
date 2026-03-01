import { buildLocalPlayerHeaders } from './headers.js';
export async function getOrRefreshTokenizedPlaylist(env, session, state) {
  const now = Date.now();
  if (state.playlist && state.expiresAt && state.expiresAt > now + 30000) {
    return {
      playlist: state.playlist,
      token: state.token,
      expiresAt: state.expiresAt,
      originURL: state.originURL
    };
  }
  if (!state.originURL) {
    throw new Error('No originURL set in session state');
  }
  const headers = buildLocalPlayerHeaders(state.sessionHeaders);
  let resp = await fetch(state.originURL, {
    headers,
    redirect: 'manual'
  });
  if (resp.status >= 300 && resp.status < 400) {
    const redirected = resp.headers.get('Location');
    if (!redirected) {
      throw new Error('Redirect with no Location header from origin');
    }
    state.originURL = redirected;
    resp = await fetch(redirected, { headers });
  }
  if (!resp.ok) {
    throw new Error(`Failed to fetch origin playlist: ${resp.status}`);
  }
  const text = await resp.text();
  const token = extractTokenFromUrl(state.originURL);
  const expiresAt = now + 5 * 60_000;
  return {
    playlist: text,
    token,
    expiresAt,
    originURL: state.originURL
  };
}
export async function refreshToken(env, session, state) {
  try {
    const updated = await getOrRefreshTokenizedPlaylist(env, session, state);
    const newState = {
      ...state,
      token: updated.token,
      playlist: updated.playlist,
      expiresAt: updated.expiresAt,
      originURL: updated.originURL
    };
    await session.fetch('https://session/save', {
      method: 'POST',
      body: JSON.stringify(newState)
    });
    return { ok: true, state: newState };
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
