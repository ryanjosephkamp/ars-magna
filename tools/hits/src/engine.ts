/**
 * The engine under Node now lives in the engine package, where the MCP
 * server shares it. This path stays so the pipeline's imports did not move.
 */
export { Engine, type SolveOptions } from '@ars-magna/engine/node';
