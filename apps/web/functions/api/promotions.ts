// GET /api/promotions: see apps/web/src/votes/api.ts.
import { getPromotions, guard, type Env } from '../../src/votes/api.ts';

export const onRequestGet = ({ request, env }: { request: Request; env: Env }): Promise<Response> =>
  guard(() => getPromotions(request, env), 'Promotions are not available right now.');
