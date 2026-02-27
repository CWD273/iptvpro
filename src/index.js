import { router } from './router.js';
import { SessionState } from './durable/session.js';
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  }
};
export { SessionState };
