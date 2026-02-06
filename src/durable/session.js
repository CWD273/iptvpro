export class SessionState {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.data = {
      token: null,
      playlist: null,
      lastSegment: 0,
      expiresAt: 0,
      originURL: null,
      sessionHeaders: {}
    };
  }
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === 'POST' && path.endsWith('/init')) {
      const body = await request.json();
      const { id } = body;
      const stored = await this.state.storage.get(id);
      if (stored) {
        this.data = stored;
      } else {
        this.data.originURL = null;
      }
      return new Response(JSON.stringify(this.data), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (request.method === 'GET' && path.endsWith('/get')) {
      return new Response(JSON.stringify(this.data), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (request.method === 'POST' && path.endsWith('/save')) {
      const body = await request.json();
      this.data = body;
      await this.state.storage.put('session', this.data);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response('Not found', { status: 404 });
  }
}
export function getSessionStub(env, id) {
  const idObj = env.SESSION_STATE.idFromName(id);
  return env.SESSION_STATE.get(idObj);
        }
