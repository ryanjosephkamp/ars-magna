/** Test support, never shipped: time the tests move by hand, for the count's time limit. */

/**
 * A clock the test moves by hand: `wait` resolves once `advance` has passed
 * its time, and an engine answers a rung after as long as that rung costs.
 */
export function clock() {
  let now = 0;
  const timers: { at: number; resolve: () => void }[] = [];
  const settle = async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  };
  return {
    wait: (ms: number) => new Promise<void>((resolve) => timers.push({ at: now + ms, resolve })),
    async advance(ms: number) {
      // Whatever was set going just now registers its timers first.
      await settle();
      const until = now + ms;
      for (;;) {
        const next = timers.filter((t) => t.at <= until).sort((a, b) => a.at - b.at)[0];
        if (!next) break;
        now = next.at;
        timers.splice(timers.indexOf(next), 1);
        next.resolve();
        await settle();
      }
      now = until;
      await settle();
    },
  };
}
