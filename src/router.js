import { handleWeb } from './handlers/web.js';
import { handlePlst } from './handlers/plst.js';
import { handlePlaylist } from './handlers/playlist.js';
import { handleSegment } from './handlers/segment.js';
import { notFound } from './handlers/errors.js';
class Router {
  async handle(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === '/web') {
      return handleWeb(request, env, ctx);
    }
    if (path === '/plst') {
      return handlePlst(request, env, ctx);
    }
    if (path === '/playlist') {
      return handlePlaylist(request, env, ctx);
    }
    if (path === '/seg') {
      return handleSegment(request, env, ctx);
    }
    return notFound();
  }
}
export const router = new Router();
