/**
 * Deletes dist/server — the intermediate SSR bundle scripts/prerender.mjs
 * reads from. It's only ever needed during the build; shipping it to Vercel
 * would just be dead weight in the deploy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, '..', 'dist', 'server');

if (fs.existsSync(serverDir)) {
  fs.rmSync(serverDir, { recursive: true, force: true });
  console.log('cleanup-ssr: removed dist/server');
}
