/**
 * Generate the social/link-preview image -> public/og-image.jpg
 *
 *   npm run og
 *
 * Why it exists: the first OG image set the headline edge-to-edge across the
 * full 1200x630 frame. Chat apps (WhatsApp, Telegram, Messenger) that fall
 * back to a small ~square thumbnail centre-crop that frame, so the preview
 * showed "...DUCTS THAT / N BUSINESS" — sliced words. This composition keeps
 * every essential element (mark, wordmark, one-line tagline) inside the
 * centre 630x630 safe zone, so it reads whether the client shows the wide
 * card or the square crop.
 *
 * Same zero-dependency trick as optimize-images.mjs: draw into a <canvas> in
 * headless Edge/Chrome and read the encoded image back out of the DOM. JPEG,
 * not PNG — the background has a soft gradient that PNG stores badly (the old
 * file was 178KB); JPEG q0.90 lands around 60KB with no visible loss at
 * preview size, and every scraper supports it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import os from 'node:os';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'og-image.jpg');

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

// The mark geometry is copied from src/components/Logo.tsx (viewBox 0 0 100
// 100, stroke 9, circle r34 @ 50,50, diagonal 60,60 -> 84,84). Keep in sync
// if the logo ever changes.
const page = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;700;900&family=Space+Grotesk:wght@700&display=swap">
<style>html,body{margin:0}</style></head>
<body><div id="o"></div><canvas id="c" width="1200" height="630"></canvas>
<script>
const W = 1200, H = 630;
const ACCENT = '#FF5A1F', INK = '#0C0C0D', TEXT = '#F4F1EC', MUT = '#8A8A8A';

async function draw() {
  await document.fonts.load('900 96px "Inter Tight"');
  await document.fonts.load('700 34px "Space Grotesk"');
  await document.fonts.load('700 22px "Inter Tight"');
  await document.fonts.ready;

  const c = document.getElementById('c');
  const x = c.getContext('2d');

  // Background: near-black with a soft warm glow off the right, like the site.
  x.fillStyle = INK;
  x.fillRect(0, 0, W, H);
  const g = x.createRadialGradient(W * 0.82, H * 0.32, 40, W * 0.82, H * 0.32, 620);
  g.addColorStop(0, 'rgba(255,90,31,0.20)');
  g.addColorStop(1, 'rgba(255,90,31,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);

  // Dot grid.
  x.fillStyle = 'rgba(255,255,255,0.05)';
  for (let gy = 40; gy < H; gy += 40)
    for (let gx = 40; gx < W; gx += 40) { x.beginPath(); x.arc(gx, gy, 1.1, 0, 7); x.fill(); }

  // Top accent rule.
  x.fillStyle = ACCENT;
  x.fillRect(0, 0, W, 5);

  // --- centred lockup (stays inside the middle 630px square) ---
  const cx = W / 2;

  // Mark: scale the 100-unit viewBox to a 92px box centred at (cx-70, 150).
  const s = 92 / 100, ox = cx - 96, oy = 132;
  x.save();
  x.translate(ox, oy);
  x.scale(s, s);
  x.strokeStyle = ACCENT;
  x.lineWidth = 9;
  x.lineCap = 'butt';
  x.beginPath(); x.arc(50, 50, 34, 0, 7); x.stroke();
  x.beginPath(); x.moveTo(60, 60); x.lineTo(84, 84); x.stroke();
  x.restore();

  // Wordmark "evon" right of the mark.
  x.fillStyle = TEXT;
  x.font = '700 62px "Space Grotesk", sans-serif';
  x.textBaseline = 'alphabetic';
  x.textAlign = 'left';
  x.fillText('evon', ox + 92 * s - 6, oy + 78 * s);

  // Kicker.
  x.fillStyle = ACCENT;
  x.font = '700 22px "Inter Tight", sans-serif';
  x.textAlign = 'center';
  x.fillText('S O F T W A R E   E N G I N E E R I N G   S T U D I O', cx, 312);

  // Tagline — three centred lines. Broken this way (not two) so the longest
  // line clears the centre-square safe zone (~630px) that chat-app thumbnail
  // crops use, while still reading big on the wide 1.91:1 card.
  x.fillStyle = TEXT;
  x.font = '900 60px "Inter Tight", sans-serif';
  x.fillText('We build', cx, 388);
  x.fillText('digital products', cx, 454);
  x.fillText('that mean business.', cx, 520);

  // Footer domain.
  x.fillStyle = MUT;
  x.font = '500 21px "Inter Tight", sans-serif';
  x.fillText('qevon.vercel.app', cx, 582);

  document.getElementById('o').textContent = c.toDataURL('image/jpeg', 0.9);
}
draw();
</script></body></html>`;

const htmlPath = path.join(os.tmpdir(), 'qevon-og.html');
fs.writeFileSync(htmlPath, page);

const browser = findBrowser();
let dom;
try {
  dom = execFileSync(browser, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-color-profile=srgb',
    '--virtual-time-budget=12000',
    '--dump-dom',
    'file:///' + htmlPath.replace(/\\/g, '/'),
  ], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
} finally {
  fs.rmSync(htmlPath, { force: true });
}

const m = dom.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);
if (!m) {
  console.error('No image data returned. Font load or canvas draw failed.');
  process.exit(1);
}
const buf = Buffer.from(m[1], 'base64');
fs.writeFileSync(OUT, buf);

// Drop the old PNG so it can't be referenced by mistake.
const oldPng = path.join(ROOT, 'public', 'og-image.png');
if (fs.existsSync(oldPng)) fs.rmSync(oldPng);

console.log(`ok  public/og-image.jpg  ${(buf.length / 1024).toFixed(1)}KB  (1200x630)`);
