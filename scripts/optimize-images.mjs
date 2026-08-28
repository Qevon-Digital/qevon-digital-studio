/**
 * Downscale + re-encode project screenshots to WebP.
 *
 *   npm run images
 *
 * Why it's built this way: there is no image tooling on the dev machine (no
 * ImageMagick, no sharp, no cwebp), and adding a native dependency for a
 * handful of screenshots isn't worth it. Headless Chromium is already present
 * — every OS this is likely to run on ships Edge or Chrome — so this loads
 * each image into a canvas, resizes it, and reads the WebP back out of the
 * DOM. Ugly, zero dependencies, reproducible.
 *
 * Typical result: 2880px PNG screenshots at ~2.2MB total came out at ~310KB.
 *
 * ---------------------------------------------------------------------------
 * TO ADD A NEW PROJECT'S SCREENSHOTS: edit JOBS below, run `npm run images`,
 * then reference `/work/<name>.webp` from src/data/projects.ts.
 * ---------------------------------------------------------------------------
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import os from 'node:os';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'work');

/**
 * [ sourcePath, outputName, targetWidth, cropHeightInSourcePx|null ]
 *
 * cropHeight is for very tall full-page captures: the site renders these in
 * 16/9 slots, so a 2880x12000 screenshot squashed to fit is unreadable. Crop
 * to the top N source pixels instead and it lands on the useful part.
 */
const JOBS = [
  // --- Grand Motel OS -----------------------------------------------------
  ['C:/dev1/GrandMotel/screenshots/02-pos-cart-payment.png', 'grandmotel-pos', 1600, null],
  ['C:/dev1/GrandMotel/screenshots/03-sale-recorded.png', 'grandmotel-sale', 1600, null],
  ['C:/dev1/GrandMotel/screenshots/07-design-system-full.png', 'grandmotel-design-system', 1600, 1800],

  // --- SentinelOps --------------------------------------------------------
  ['C:/dev/SentinelOps/screenshots/05-scan-complete.png', 'sentinelops-scan', 1600, null],
  ['C:/dev/SentinelOps/screenshots/07-scan-running.png', 'sentinelops-running', 1600, null],
  ['C:/dev/SentinelOps/screenshots/04-project.png', 'sentinelops-history', 1600, null],

  // --- Phishing URL Detection ---------------------------------------------
  // No UI to screenshot; these are generated graphics rendered from the real
  // classification report. Source HTML is not kept in the repo — regenerate
  // from HANDOFF.md if they ever need changing.
];

/** First Chromium-family browser we can find. */
function findBrowser() {
  const candidates = process.platform === 'win32'
    ? [
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
        'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      ]
    : process.platform === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        ]
      : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge'];

  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    console.error('No Chromium-based browser found. Checked:\n  ' + candidates.join('\n  '));
    process.exit(1);
  }
  return found;
}

function convert(browser, src, name, targetW, cropH) {
  if (!fs.existsSync(src)) {
    console.warn(`  skip  ${name} — source not found: ${src}`);
    return null;
  }

  const htmlPath = path.join(os.tmpdir(), `qevon-img-${name}.html`);
  const srcUrl = 'file:///' + src.replace(/\\/g, '/');

  fs.writeFileSync(htmlPath, `<!doctype html><body><div id="o"></div><script>
    const img = new Image();
    img.onload = () => {
      const cropH = ${cropH === null ? 'img.naturalHeight' : cropH};
      const scale = ${targetW} / img.naturalWidth;
      const c = document.createElement('canvas');
      c.width = ${targetW};
      c.height = Math.round(cropH * scale);
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, img.naturalWidth, cropH, 0, 0, c.width, c.height);
      document.getElementById('o').textContent = c.toDataURL('image/webp', 0.82);
    };
    img.onerror = () => { document.getElementById('o').textContent = 'ERROR'; };
    img.src = ${JSON.stringify(srcUrl)};
  </script></body>`);

  let dom;
  try {
    dom = execFileSync(browser, [
      '--headless=new',
      '--disable-gpu',
      // Required: without it, drawing a file:// image taints the canvas and
      // toDataURL throws a security error.
      '--allow-file-access-from-files',
      '--virtual-time-budget=8000',
      '--dump-dom',
      'file:///' + htmlPath.replace(/\\/g, '/'),
    ], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  } finally {
    fs.rmSync(htmlPath, { force: true });
  }

  const match = dom.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
  if (!match) {
    console.error(`  FAIL  ${name} — no image data returned`);
    return null;
  }

  const buf = Buffer.from(match[1], 'base64');
  fs.writeFileSync(path.join(OUT_DIR, `${name}.webp`), buf);
  return { before: fs.statSync(src).size, after: buf.length };
}

const browser = findBrowser();
fs.mkdirSync(OUT_DIR, { recursive: true });

console.log(`Optimising ${JOBS.length} image(s) -> public/work/\n`);
let totalBefore = 0;
let totalAfter = 0;

for (const [src, name, targetW, cropH] of JOBS) {
  const r = convert(browser, src, name, targetW, cropH);
  if (!r) continue;
  totalBefore += r.before;
  totalAfter += r.after;
  const kb = (n) => `${Math.round(n / 1024)}KB`;
  console.log(`  ok    ${name}.webp  ${kb(r.before)} -> ${kb(r.after)}`);
}

if (totalBefore) {
  const mb = (n) => `${(n / 1024 / 1024).toFixed(2)}MB`;
  console.log(`\nTotal: ${mb(totalBefore)} -> ${mb(totalAfter)}`);
}
