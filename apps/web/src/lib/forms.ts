/**
 * How a result's words read on the page, once the dictionary's listed forms
 * are known: `dont` is shown as `don't`, since nothing else spells those
 * letters, while `its` stays `its` and the word panel lists `it's` beside it.
 *
 * The engine, the worker protocol, a promotion's key and a hit's id know only
 * the letters-word, so the display is applied here, at the last step, and
 * everything that goes back out (Promote, the filter, Build's checks) starts
 * from the letters again or folds the form back to them. Pure.
 */
import type { DictForm } from '@ars-magna/engine';

/** The forms by the word they spell, in the order the dictionary lists them. */
export type Forms = ReadonlyMap<string, readonly DictForm[]>;

export const NO_FORMS: Forms = new Map();

export function formsFrom(list: readonly DictForm[]): Forms {
  const map = new Map<string, DictForm[]>();
  for (const form of list) map.set(form.letters, [...(map.get(form.letters) ?? []), form]);
  return map;
}

/** The spelling a row shows for one word: its shown form, or the word itself. */
export function displayWord(forms: Forms, word: string): string {
  return forms.get(word)?.find((f) => f.shown)?.form ?? word;
}

/** A row's words as the page shows them. */
export function displayRow(forms: Forms, row: readonly string[]): string[] {
  return row.map((word) => displayWord(forms, word));
}

/** A phrase as the page shows it. */
export function displayPhrase(forms: Forms, row: readonly string[]): string {
  return displayRow(forms, row).join(' ');
}

/** The listed forms that spell `word`, whether or not a row shows one. */
export function formsOf(forms: Forms, word: string): readonly DictForm[] {
  return forms.get(word) ?? [];
}
