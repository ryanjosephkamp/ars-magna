// POST /api/pass: see apps/web/src/votes/api.ts.
import { guard, liveDeps, onlyPost, postPass, type Env } from '../../src/votes/api.ts';

export const onRequestPost = ({ request, env }: { request: Request; env: Env }): Promise<Response> =>
  guard(() => postPass(request, env, liveDeps()));

export const onRequest = onlyPost;
