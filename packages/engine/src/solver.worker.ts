/// <reference lib="webworker" />
/**
 * Worker entry point. Deliberately trivial — all the logic lives in
 * `engineCore.ts`, which is testable without a browser.
 */
import { EngineCore } from './engineCore.ts';
import type { Request } from './protocol.ts';

const core = new EngineCore({
  post: (message) => self.postMessage(message),
});

self.onmessage = (event: MessageEvent<Request>) => {
  void core.handle(event.data);
};

// A panic inside WebAssembly surfaces here rather than as a rejected promise.
self.onerror = (event) => {
  self.postMessage({
    k: 'error',
    id: -1,
    code: 'INTERNAL',
    message: typeof event === 'string' ? event : 'worker crashed',
  });
};
