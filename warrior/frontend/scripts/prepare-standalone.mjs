/**
 * `output: 'standalone'` does not copy the static assets or `public/` into the
 * server bundle, so `node .next/standalone/server.js` would serve HTML with no
 * CSS. This runs after `next build` and puts them where the server looks.
 *
 * It is also a no-op safety net for the Docker build, which copies the same
 * files into the runtime image.
 */
import { cp, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const standalone = path.join(root, '.next', 'standalone');

if (!existsSync(standalone)) {
  console.error('standalone output not found — did `next build` run?');
  process.exit(1);
}

await mkdir(path.join(standalone, '.next'), { recursive: true });
await cp(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'), {
  recursive: true,
});

if (existsSync(path.join(root, 'public'))) {
  await cp(path.join(root, 'public'), path.join(standalone, 'public'), {
    recursive: true,
  });
}

console.log('standalone assets copied');