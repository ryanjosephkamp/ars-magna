import { afterEach, describe, expect, it, vi } from 'vitest';

import { storable, warmCache } from './offline.ts';

/** A response that followed a redirect, as fetching `/hits.html` from Cloudflare Pages gives. */
function redirected(body: string): Response {
  const response = new Response(body, { headers: { 'content-type': 'text/html' } });
  Object.defineProperty(response, 'redirected', { value: true });
  return response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('offline cache', () => {
  it('copies a redirected response into a plain one with the same body and headers', async () => {
    const copy = storable(redirected('<p>gallery</p>'));
    expect(copy.redirected).toBe(false);
    expect(copy.status).toBe(200);
    expect(copy.headers.get('content-type')).toBe('text/html');
    expect(await copy.text()).toBe('<p>gallery</p>');
  });

  it('fetches each page shell from the address the site links to and stores it under its .html name', async () => {
    const files = ['/index.html', '/hits.html', '/build.html', '/how.html', '/hits.json', '/assets/main-abc.js'];
    const fetched: string[] = [];
    const stored = new Map<string, Response>();
    vi.stubGlobal('fetch', async (path: string) => {
      fetched.push(path);
      if (path === '/precache.json') return new Response(JSON.stringify({ files }));
      // Pages redirects the .html names; asking for one would follow a 308.
      if (path.endsWith('.html')) return redirected(`redirected ${path}`);
      return new Response(`body of ${path}`);
    });
    vi.stubGlobal('caches', {
      open: async () => ({
        match: async (path: string) => stored.get(path),
        put: async (path: string, response: Response) => void stored.set(path, response),
      }),
    });

    await warmCache();

    expect(fetched).toEqual(['/precache.json', '/', '/hits', '/build', '/how', '/hits.json', '/assets/main-abc.js']);
    expect([...stored.keys()]).toEqual(files);
    for (const response of stored.values()) expect(response.redirected).toBe(false);
    expect(await stored.get('/hits.html')?.text()).toBe('body of /hits');
  });

  it('replaces a shell an earlier visit cached as a redirected response', async () => {
    const stored = new Map<string, Response>([['/hits.html', redirected('old')], ['/hits.json', new Response('kept')]]);
    const fetched: string[] = [];
    vi.stubGlobal('fetch', async (path: string) => {
      fetched.push(path);
      if (path === '/precache.json') return new Response(JSON.stringify({ files: ['/hits.html', '/hits.json'] }));
      return new Response(`body of ${path}`);
    });
    vi.stubGlobal('caches', {
      open: async () => ({
        match: async (path: string) => stored.get(path),
        put: async (path: string, response: Response) => void stored.set(path, response),
      }),
    });

    await warmCache();

    expect(fetched).toEqual(['/precache.json', '/hits']);
    expect(await stored.get('/hits.html')?.text()).toBe('body of /hits');
  });
});
