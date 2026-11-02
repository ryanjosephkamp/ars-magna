// POST /api/vote: see apps/web/src/votes/api.ts.
import { guard, liveDeps, onlyPost, postVote, type Env } from '../../src/votes/api.ts';

export const onRequestPost = ({ request, env }: { request: Request; env: Env }): Promise<Response> =>
  guard(() => postVote(request, env, liveDeps()));

export const onRequest = onlyPost;
