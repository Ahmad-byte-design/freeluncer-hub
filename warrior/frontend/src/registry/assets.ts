import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ComponentAssets, ComponentMeta } from './types';

/**
 * Server-only. Reads a component's source files at request time so the code tab
 * shows the real file on disk rather than a copy kept in the registry.
 */
export function readAssets(meta: ComponentMeta): ComponentAssets {
  const assets: ComponentAssets = {};
  const dir = path.join(process.cwd(), meta.libPath);

  for (const asset of meta.assets) {
    try {
      assets[asset.id] = readFileSync(path.join(dir, asset.file), 'utf8');
    } catch {
      assets[asset.id] = `/* ${asset.file} could not be read */`;
    }
  }

  return assets;
}