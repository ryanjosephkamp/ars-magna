import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { OPENLIST } from './pins.ts';

const here = dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = resolve(here, '../../..');

export const CACHE_DIR = resolve(REPO_ROOT, '.cache');
export const OPENLIST_CACHE = resolve(CACHE_DIR, 'openlist', OPENLIST.rev);
export const FREQ_CACHE = resolve(CACHE_DIR, 'freq');
export const FACTS_CACHE = resolve(CACHE_DIR, 'facts');

export const WORDS_PATH = resolve(OPENLIST_CACHE, 'merged_valid_words.txt');
export const META_PATH = resolve(OPENLIST_CACHE, 'merged_valid_dict.json');
export const FREQ_PATH = resolve(FREQ_CACHE, 'en_full.txt');

export const DIST_DIR = resolve(REPO_ROOT, 'apps/web/public/dict');
