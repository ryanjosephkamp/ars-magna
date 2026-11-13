/**
 * The definitions client lives in the engine package now, so the MCP server
 * can read the same shards off disk. The app keeps this path so nothing that
 * imports it had to move.
 */
export {
  Definitions,
  PROVENANCE_LABEL,
  fnv1a,
  shouldExplain,
  type Provenance,
  type Sense,
  type WordInfo,
} from '@ars-magna/engine/definitions';
