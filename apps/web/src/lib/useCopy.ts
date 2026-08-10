import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Copy to the clipboard with a short "copied" acknowledgement.
 *
 * Keyed rather than boolean, because several things on the page are copyable at
 * once and the confirmation has to land on the one that was actually clicked.
 */
export function useCopy(holdMs = 1400) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = useCallback(
    async (key: string, text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(key);
      } catch {
        // Clipboard access is refused in some contexts (no permission, or an
        // insecure origin). Say nothing rather than claiming a copy happened.
        setCopied(null);
        return;
      }
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), holdMs);
    },
    [holdMs],
  );

  return { copied, copy };
}
