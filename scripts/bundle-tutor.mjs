/**
 * Membundel netlify/functions/tutor.js dengan esbuild (sama seperti Netlify, node_bundler = "esbuild")
 * ke node_modules/.cache, lalu mengimpornya. Diperlukan karena fungsi mengimpor JSON konten.
 */
import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export async function loadTutorFunction(root = process.cwd()) {
  const outDir = resolve(root, 'node_modules/.cache/tutor-local');
  mkdirSync(outDir, { recursive: true });
  const outfile = resolve(outDir, `tutor-${Date.now()}.mjs`);
  await build({
    entryPoints: [resolve(root, 'netlify/functions/tutor.js')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    outfile,
    logLevel: 'warning',
  });
  return import(pathToFileURL(outfile).href);
}
