// GET /api/votes: see apps/web/src/votes/api.ts.
import { getVotes, guard, type Env } from '../../src/votes/api.ts';

export const onRequestGet = ({ request, env }: { request: Request; env: Env }): Promise<Response> =>
  guard(() => getVotes(request, env));
