import { router } from './router.js';
import { SessionState } from './durable/session.js';
export default {
  async fetch(request, env, ctx) {
    env.SESSION_STATE = env.SESSION_STATE || SessionState;
    return router.handle(request, env, ctx);
  }
}
