/**
 * Phase 0 shell. The real search UI arrives in Phase 4; this exists so
 * `pnpm dev` serves something styled and the toolchain is proven end to end.
 */
export function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="font-display text-6xl tracking-tight sm:text-7xl">Ars Magna</h1>

      <p className="mt-4 text-lg opacity-70">
        <span className="font-mono tracking-widest uppercase">Ars Magna</span> is an anagram of{' '}
        <span className="font-mono tracking-widest uppercase">Anagrams</span>.
      </p>

      <p className="mt-8 max-w-prose leading-relaxed opacity-80">
        Give it any text. It returns every way those exact letters can be rearranged into real
        English words — spaces moved freely, nothing added, nothing dropped.
      </p>

      <p className="mt-10 font-mono text-sm opacity-50">
        Phase 0 · scaffold. Search lands in Phase 4.
      </p>
    </main>
  );
}
