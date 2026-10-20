/**
 * Builds examples/dist/plain-html.html so the library can be opened with no
 * framework, no bundler and no dev server: two <link> tags and one <script>.
 */
import { build } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'examples', 'dist');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

await build({
  entryPoints: [path.join(root, 'examples', 'plain-html.ts')],
  outfile: path.join(out, 'accordion.js'),
  bundle: true,
  format: 'iife',
  target: 'es2020',
  logLevel: 'info',
});

// index.css @imports "./tokens.css" and "./reset.css" by relative path, so those
// two keep their original names next to it.
await cp(path.join(root, 'lib', 'core', 'index.css'), path.join(out, 'warrior-core.css'));
await cp(path.join(root, 'lib', 'core', 'tokens.css'), path.join(out, 'tokens.css'));
await cp(path.join(root, 'lib', 'core', 'reset.css'), path.join(out, 'reset.css'));
await cp(
  path.join(root, 'lib', 'accordion', 'accordion.css'),
  path.join(out, 'warrior-accordion.css'),
);

// The same three families the docs site uses, so the demo looks like the site.
await mkdir(path.join(out, 'fonts'), { recursive: true });
for (const file of [
  'chakra-petch-500.woff2',
  'chakra-petch-700.woff2',
  'ibm-plex-sans.woff2',
  'jetbrains-mono.woff2',
]) {
  await cp(path.join(root, 'src', 'app', 'fonts', file), path.join(out, 'fonts', file));
}

await cp(
  path.join(root, 'examples', 'plain-html.html'),
  path.join(out, 'plain-html.html'),
);

console.log(`\nOpen ${path.join(out, 'plain-html.html')}`);