// POST /api/promote: see apps/web/src/votes/api.ts.
import { guard, liveDeps, onlyPost, postPromote, type Env } from '../../src/votes/api.ts';

export const onRequestPost = ({ request, env }: { request: Request; env: Env }): Promise<Response> =>
  guard(() => postPromote(request, env, liveDeps()), 'Promotions are not available right now.');

export const onRequest = onlyPost;
