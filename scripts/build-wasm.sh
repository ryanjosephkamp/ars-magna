#!/usr/bin/env bash
# Build the anagram engine to WASM and drop it where the TS engine package expects it.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/packages/engine/src/wasm"

# rustup installs to ~/.cargo; make sure it's on PATH even in non-login shells.
[ -f "$HOME/.cargo/env" ] && . "$HOME/.cargo/env"

PROFILE="${1:-release}"

echo "==> building anagram-wasm ($PROFILE) -> $OUT"
cd "$ROOT/crates/anagram-wasm"

wasm-pack build \
  --target web \
  --out-dir "$OUT" \
  --out-name anagram \
  "--$PROFILE" \
  --no-pack

# wasm-pack writes a .gitignore that would hide the output from tooling that
# walks the tree; we ignore the directory at the repo root instead.
rm -f "$OUT/.gitignore"

echo "==> wasm payload: $(du -h "$OUT/anagram_bg.wasm" | cut -f1)"
