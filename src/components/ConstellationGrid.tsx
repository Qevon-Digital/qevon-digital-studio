import { useEffect, useRef } from 'react';
import { THEME_CHANGE_EVENT } from './ThemeToggle';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  radius: number;
  pulse: number;
  /** Stable 0-1 value derived from the grid slot — seeds the jitter phase. */
  phase: number;
  /** Render-only jitter offset. Never folded into x/y, so it cannot displace. */
  jx: number;
  jy: number;
}

// Qevon palette, matched to src/index.css's --bg/--text tokens. Canvas2D
// can't read CSS custom properties, so BG_COLOR/NODE_RGB are re-synced from
// the DOM (see syncThemeColors) on mount and on every theme toggle instead
// of being fixed constants — light mode inverts to dark nodes on warm white.
// ACCENT_RGB stays a plain const: --accent is identical in both themes.
let BG_COLOR = '#0A0A0A';
const NODE_RGB = [245, 243, 238]; // mutated in place by syncThemeColors, never reassigned —
// draw closures below hold a reference to this exact array.
const ACCENT_RGB = [255, 90, 31]; // Qevon orange

// Light mode's near-black mesh at the same alpha used in dark mode composited
// to roughly the same grey as body text sitting on top of it — the paragraph
// dissolved into its own background pattern. This dims the grey mesh only
// (connections + resting node fill); the orange glow/proximity tint under the
// pointer is untouched in both themes, so the interaction reads identically.
let MESH_ALPHA = 1;

// Glow strength, scaled per theme. The orange is the same colour in both
// themes, but it reads noticeably weaker over the warm-white light background
// than it does over near-black — so light gets the larger lift. This is the
// one theme-dependent value the glow has; everything else about it is shared.
let GLOW_ALPHA_SCALE = 1;

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.trim().replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const n = parseInt(full, 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** The one bridge between the CSS theme tokens and the canvas-drawn mesh. */
const syncThemeColors = () => {
  if (typeof document === 'undefined') return;
  const style = getComputedStyle(document.documentElement);
  const bg = style.getPropertyValue('--bg').trim();
  const text = style.getPropertyValue('--text').trim();
  if (bg) BG_COLOR = bg;
  if (text) {
    const [r, g, b] = hexToRgb(text);
    NODE_RGB[0] = r;
    NODE_RGB[1] = g;
    NODE_RGB[2] = b;
  }
  const light = document.documentElement.getAttribute('data-theme') === 'light';
  MESH_ALPHA = light ? 0.55 : 1;
  GLOW_ALPHA_SCALE = light ? 1.3 : 1.1;
};

const lerpColor = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

// Framerate-independent exponential ease toward `target`. `tau` is roughly
// "seconds to close most of the gap" — used for presence/heat ramps instead
// of a linear step so they read as a soft build/decay rather than a ramp
// with a visible kink at the end.
const approach = (current: number, target: number, dt: number, tau: number) =>
  current + (target - current) * (1 - Math.exp(-dt / tau));

// Deterministic 0-1 from a grid slot. Replaces Math.random() for per-node
// radius and shimmer phase: the same slot must produce the same dot on every
// reload and every rebuild, or the mesh visibly reshuffles (see initNodes).
const hash01 = (i: number, j: number) => {
  let h = Math.imul(i | 0, 73856093) ^ Math.imul(j | 0, 19349663);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// Idle shutoff: once every node is within this speed (px per 60fps-frame,
// same units as vx/vy below) and presence/heat have both settled, stop
// scheduling frames entirely rather than redrawing an unchanging scene.
const IDLE_VEL_EPS = 0.05;
const IDLE_SETTLE_EPS = 0.01;
const IDLE_TIMEOUT_MS = 600;

// Interaction geometry. Phones get a much tighter light: 200px on a 375px
// viewport is an ambient wash across most of the screen rather than a glow
// under the finger, and the heat expansion is scaled back to match.
const LIGHT_RADIUS_PHONE = 96;
const LIGHT_RADIUS_DESKTOP = 176;
const PHYS_RADIUS_PHONE = 105;
const PHYS_RADIUS_DESKTOP = 140;
const HEAT_EXPAND_PHONE = 0.3;
const HEAT_EXPAND_DESKTOP = 0.6;

// Glow alpha, before GLOW_ALPHA_SCALE (theme) is applied. `base` is the
// hover / currently-touching wash; `heat` is the press-and-hold bloom layered
// on top. Pulled out of the render loop so both live next to the geometry.
const GLOW_BASE_ALPHA = 0.09;
const GLOW_HEAT_ALPHA = 0.13;

// Heat timing. The floor is applied the instant a press starts so feedback is
// visible on the very next frame instead of ramping up from nothing; the rise
// then carries it the rest of the way while the press is held. Release decays
// faster than it rose and snaps to exactly 0 below HEAT_EPS, so no residual
// warmth is left sitting in the scene. Both tuned short so the whole system
// reads as immediate rather than eased.
const HEAT_FLOOR = 0.5;
const HEAT_RISE_TAU = 0.1;
const HEAT_FALL_TAU = 0.12;
const HEAT_EPS = 0.005;
// After a touch lifts, keep the pointer "on screen" at its last position for
// this long instead of parking it instantly. A fast flick-scroll holds the
// finger down for barely 100ms; without this window the whole gesture — heat,
// kickback — is over before it renders a single frame, because every effect
// downstream is gated on the pointer being on screen. During the window the
// press is already released (active = false), so nothing drags or buzzes; the
// mesh just coasts to a stop and the heat decays the way a release should.
const TOUCH_RELEASE_MS = 300;
// Scroll-driven heat gets its own, much longer ramp than a press does. A
// press is a discrete on/off event, so it should snap; scroll velocity is a
// continuously fluctuating signal, and following it at press speed made the
// glow visibly pump and jump with every variation in scroll rate.
const HEAT_SCROLL_TAU = 0.3;

// Press-drag: nodes near the pointer get pushed along the drag vector.
//
// The root cause of "jumpy" fast sweeps isn't smoothing strength — it's that
// touchmove fires irregularly relative to rAF. Most frames get zero new
// data (the pointer's raw x/y hasn't changed since last frame) and then one
// frame gets a big jump when a sample finally arrives. No amount of easing
// *toward* that signal changes the fact that the signal itself is a mix of
// flat-then-spike steps — the spike is still a spike, just spread over a
// couple of frames instead of one.
//
// So instead: a single continuously-integrated follow point (pointer.glowX/Y)
// is the *only* thing physics and drawing ever read a position or velocity
// from — never the raw event coordinates directly.
//
// It's driven by a critically damped spring rather than an exponential ease,
// and that specific choice is the whole point. An exponential ease sets
// velocity proportional to the remaining gap, so the moment a delayed touch
// sample lands and the gap jumps, velocity jumps with it — a discontinuity,
// i.e. exactly the visible stutter, just smaller. A second-order spring
// integrates velocity instead: a step in the target moves *acceleration*, and
// position and velocity both stay continuous no matter how ragged the input
// is. That's what makes a fast sweep read as one fluid arc while still
// arriving under the finger in ~150ms.
//
// Speed, drag velocity, and the physics segment are all derived from THIS
// point's motion, so all of them inherit that continuity for free.
const FOLLOW_OMEGA = 26; // rad/s; settles in roughly 4/omega ≈ 150ms
const DRAG_FOLLOW = 0.22;
const MAX_DRAG_PX = 40;

// How much "dwell time" one full interaction-radius of swept path is worth,
// in seconds. The repulsion impulse is `strength * (dt + arcInside/radius *
// this)`: the first term is time spent near a node, the second is distance
// travelled past it. Expressing the sweep component as distance rather than
// frames is what makes the total force over a gesture depend only on the
// path's geometry, so it can't change with framerate or with how touchmove
// happened to be chunked across frames.
const SWEEP_TIME_PER_RADIUS = 0.022;

// Base repulsion strength, and how much pointer speed adds on top. Kept low
// on purpose — this is a gentle drift, and larger displacements read as the
// mesh being knocked around rather than easing aside.
const REPEL_BASE = 130;
const REPEL_SPEED_GAIN = 16;

// Real scroll (including the momentum that keeps running after a finger
// lifts off a fast flick) keeps the glow/heat alive and moving with it,
// instead of letting it die at wherever the last touch happened to end.
// This only ever drives glow position and heat/presence — never node
// velocity — so it can't reproduce the whole-mesh "rebound" that was
// removed; scrolling itself still never moves a node off its anchor.
const SCROLL_HEAT_NORM = 1200; // px/sec of scroll that reads as "full" heat
// Long enough that heat follows the overall arc of a scroll rather than its
// frame-to-frame noise — this was the main source of the heat "jumping".
const SCROLL_VEL_TAU = 0.16;
const SCROLL_VEL_CLAMP = 4000;
const SCROLL_ENGAGE_PX_S = 40; // scroll speed below which it no longer "engages"

// Gesture energy: starts fresh at 1 the instant a press or a scroll
// engagement begins, and decays toward a floor the longer it continues
// uninterrupted. Without this, a long fast drag or scroll stays maxed out
// for its whole duration, which is what read as "tacky" — a quick flick
// should feel like one clean, immediate hit; a long one should visibly
// settle rather than staying keyed up throughout. Resets to 1 the instant
// nothing is engaged, so the very next gesture always starts at full
// strength regardless of how the previous one ended.
const GESTURE_ENERGY_TAU = 0.5;
const GESTURE_ENERGY_FLOOR = 0.3;

// Long press: hold still past HOLD_DELAY_MS and nearby nodes buzz in place.
const HOLD_STILL_PX = 2.5;
const HOLD_DELAY_MS = 300;
const HOLD_RAMP_MS = 220;
const JITTER_PX = 1.4;

// Extra canvas height kept in reserve on touch devices. Mobile browsers fire
// `resize` every time the URL bar collapses or expands; covering that range up
// front means a normal scroll never changes the grid geometry at all.
const VIEWPORT_BUFFER = 140;

/**
 * Sitewide ambient background: a spring-mass node mesh that drifts back to
 * its grid position and softly scatters away from a pointer — mouse OR
 * touch. Mounted once, fixed behind all page content (see Layout.tsx);
 * pointer-events stay off so it never intercepts clicks.
 *
 * The layout is deliberately *fixed and deterministic*: node anchors are
 * `index * spacing`, and per-node radius/phase come from a hash of the grid
 * slot rather than Math.random(), so the same gesture on the same viewport
 * always produces the same result and a rebuild is visually a no-op.
 *
 * Touch has no hover, so it gets its own vocabulary layered on the same
 * mouse-hover model:
 *  - `presence` (0-1): is there a meaningfully-positioned pointer right now.
 *  - `heat` (0-1): snaps to a floor the instant a press starts, builds while
 *    held, and decays to exactly zero on release. Drives the glow's intensity
 *    and radius.
 *  - Drag while pressed pushes nearby nodes along the (smoothed) drag
 *    vector; the spring always pulls them home, so nothing shifts
 *    permanently. This is the only thing that moves nodes off their anchor —
 *    page scroll by itself never does. The mesh is a fixed viewport
 *    background: scrolling the page moves content over it, not the mesh.
 *  - The physics interaction is tested against the *swept segment* the
 *    pointer travelled this frame, not just its current point — otherwise a
 *    fast drag only ever disturbs nodes right at the start and end of the
 *    gesture (wherever the pointer happened to linger), leaving everything
 *    in between untouched because the pointer swept past them in a single
 *    frame. A "gesture energy" (GESTURE_ENERGY_*) on top of that starts at
 *    full strength the instant a press/scroll begins and tapers the longer
 *    it continues uninterrupted, so a long fast gesture settles rather than
 *    staying maxed out the whole time.
 *  - Real scroll (mouse wheel, trackpad, or a touch flick's momentum after
 *    the finger has already lifted) keeps the glow/heat alive and drifting
 *    with it rather than dying at wherever the last touch ended — see the
 *    SCROLL_* constants. Purely a glow/heat effect; it never nudges a node's
 *    velocity, so it can't reproduce a whole-mesh bounce.
 *  - Holding still adds a render-only micro-jitter to nearby nodes.
 *  - On desktop, the mouse leaving the browser viewport entirely fades
 *    everything out (glow, heat, node tint) — detected via a document-level
 *    `mouseout` with no `relatedTarget`, since `mouseleave` on `window`
 *    itself doesn't fire reliably across browsers.
 *
 * Touch press state is driven by Touch Events rather than Pointer Events on
 * purpose: browsers fire `pointercancel` the moment a touch turns into a
 * scroll, which would drop the press exactly during press-and-drag. Touch
 * events keep reporting through a scroll and only end when the finger lifts.
 * Every listener here is passive and none call preventDefault() — page
 * scrolling must be completely unaffected.
 *
 * `paused`: while true, no frames are scheduled at all (reduced-motion still
 * draws its one static frame). Layout uses this to keep this loop fully off
 * for the ~2.7s the logo intro covers the screen. The first activation fires
 * one short bloom at viewport centre — the hand-off point for the intro zoom.
 *
 * Also idles itself: once node velocities, presence, heat and jitter have all
 * been at rest for IDLE_TIMEOUT_MS, the loop stops scheduling frames rather
 * than redrawing an unchanging scene at 60fps. Any interaction wakes it.
 *
 * NOTE: this renders at z-index -1, so `body` must not carry an opaque
 * background — see the comment in src/index.css.
 */
export default function ConstellationGrid({ paused = false }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  // Sole bridge from the `paused` prop into the imperative rAF world below —
  // the whole effect deliberately runs once (mount-only setup: listeners,
  // node grid, the render loop) rather than re-running on every prop change,
  // which would be both wasteful and would re-attach listeners mid-flight.
  const activateRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    syncThemeColors();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;

    let animationFrameId = 0;
    let running = false;
    let width = 0;
    let height = 0;
    // Largest viewport height seen at the current width. The canvas is sized
    // to this rather than to the live innerHeight so the URL bar sliding in
    // and out doesn't rebuild the grid. Reset when the width really changes.
    let heightHighWater = 0;
    let lastWinWidth = -1;
    let firstActivation = true;

    const pointer = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      // The follow point (see FOLLOW_OMEGA): a critically-damped spring
      // chasing x/y. Everything downstream reads this, not x/y. Frozen when
      // x/y park offscreen, so the glow fades out in place instead of
      // jumping to (-1000,-1000) mid-decay when a touch ends.
      glowX: 0,
      glowY: 0,
      glowVX: 0,
      glowVY: 0,
      presence: 0,
      heat: 0,
      jitter: 0,
      holdStillMs: 0,
      active: false,
      // Counts down from TOUCH_RELEASE_MS after a touch lifts. While > 0 the
      // pointer stays "on screen" at its last position so the release gesture
      // can finish rendering; when it hits 0, x/y park offscreen.
      releaseMs: 0,
      energy: 1, // gesture energy — see GESTURE_ENERGY_* above
      radius: PHYS_RADIUS_DESKTOP, // physics interaction zone (node scatter)
      lightRadius: LIGHT_RADIUS_DESKTOP, // visible glow radius
      heatExpand: HEAT_EXPAND_DESKTOP,
    };

    // Grid geometry, set by initNodes and reused by the connection pass.
    // Nodes are stored column-major: nodes[i * rows + j] is column i, row j.
    let nodes: Node[] = [];
    let cols = 0;
    let rows = 0;
    let maxConnDist = 0;
    let connAlpha = 0.5;

    // Resizing a canvas clears its bitmap. The animated path repaints on the
    // next frame, but the reduced-motion path has no loop — without this it
    // would stay blank after any resize. Assigned below only in that mode.
    let redrawStatic: (() => void) | null = null;

    // Press-drag velocity (px/sec), derived each frame from the follow
    // point's own motion — see FOLLOW_OMEGA above for why that's the fix for
    // jumpiness rather than smoothing this value itself harder.
    let dragVelX = 0;
    let dragVelY = 0;
    // Pointer speed, likewise derived from the follow point's motion.
    let speedSmooth = 0;

    // Real scroll tracking. The handler only records a number; velocity is
    // derived once per rAF frame below, so the handler itself can never
    // contribute to scroll jank.
    let scrollY = window.scrollY;
    let prevScrollY = scrollY;
    let scrollVel = 0;
    const handleScroll = () => {
      scrollY = window.scrollY;
      wake();
    };

    const initNodes = () => {
      // Carrying live state across a rebuild is what makes a rebuild
      // invisible: without it, a resize mid-bounce snaps every node back to
      // its anchor with zero velocity, which reads as the mesh "jumping".
      const prev = nodes;
      const prevCols = cols;
      const prevRows = rows;

      const isPhone = width < 768;
      // Phones get wider spacing (fewer nodes — the O(n) connection pass
      // below still scales with node count) but slightly larger dots and
      // stronger connection lines to compensate, so the mesh reads at a
      // similar density rather than just looking sparse.
      const spacing = isPhone ? 68 : 44;
      connAlpha = isPhone ? 0.62 : 0.5;
      cols = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;
      // Just past one grid step, so orthogonal neighbours link but diagonals
      // (spacing * 1.414) stay clear — that keeps the clean grid read instead
      // of a busy web.
      maxConnDist = spacing * 1.35;

      pointer.radius = isPhone ? PHYS_RADIUS_PHONE : PHYS_RADIUS_DESKTOP;
      pointer.lightRadius = isPhone ? LIGHT_RADIUS_PHONE : LIGHT_RADIUS_DESKTOP;
      pointer.heatExpand = isPhone ? HEAT_EXPAND_PHONE : HEAT_EXPAND_DESKTOP;

      const next: Node[] = new Array(cols * rows);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * spacing;
          const baseY = j * spacing;
          const h = hash01(i, j);
          const carried = i < prevCols && j < prevRows ? prev[i * prevRows + j] : undefined;
          next[i * rows + j] = {
            x: carried ? carried.x : baseX,
            y: carried ? carried.y : baseY,
            vx: carried ? carried.vx : 0,
            vy: carried ? carried.vy : 0,
            baseX,
            baseY,
            radius: isPhone ? h * 0.9 + 1.3 : h * 0.7 + 1,
            pulse: carried ? carried.pulse : hash01(j, i) * Math.PI * 2,
            phase: h,
            jx: 0,
            jy: 0,
          };
        }
      }
      nodes = next;
    };

    // Geometry only — no `wake()` call. This runs once synchronously during
    // setup, below, before `wake` itself (a `const` further down) has been
    // initialized; calling it from here would throw. `handleResize`, used
    // for the actual resize *listener*, wraps this and adds the redraw/wake
    // calls, since by the time a real resize event fires the whole effect
    // body — including `wake` — has long since finished running.
    const applyResize = () => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      if (winW !== lastWinWidth) {
        // A genuine width change (rotation, desktop resize) — start the
        // height high-water mark over rather than inheriting a portrait
        // height into landscape.
        lastWinWidth = winW;
        heightHighWater = 0;
      }
      heightHighWater = Math.max(heightHighWater, winH + (isCoarse ? VIEWPORT_BUFFER : 0));

      if (winW === width && heightHighWater === height && nodes.length > 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = winW;
      height = heightHighWater;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      // setTransform REPLACES the matrix rather than compounding it —
      // ctx.scale() here would keep stacking on every resize (including
      // React StrictMode's dev-mode double effect-invocation), scaling the
      // canvas further out of alignment each time.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
    };

    const handleResize = () => {
      applyResize();
      redrawStatic?.();
      wake();
    };

    // Arriving from the parked offscreen position — sync prev to current so
    // the next frame measures the entry as rest rather than reading the
    // ~1000px jump as a huge velocity spike.
    const syncEntry = (x: number, y: number) => {
      if (pointer.x < -500) {
        pointer.prevX = x;
        pointer.prevY = y;
      }
    };

    // --- Mouse / pen (Pointer Events) ------------------------------------
    // Touch is excluded here and handled by the touch listeners below; see
    // the component doc comment for why.

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      syncEntry(e.clientX, e.clientY);
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      wake();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      syncEntry(e.clientX, e.clientY);
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.holdStillMs = 0;
      pointer.releaseMs = 0;
      pointer.energy = 1;
      pointer.heat = Math.max(pointer.heat, HEAT_FLOOR);
      wake();
    };

    const handlePointerEnd = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer.active = false;
      pointer.holdStillMs = 0;
      // A mouse keeps "presence" on hover with no button held — that's the
      // existing, unchanged desktop behaviour. A pen has no hover state, so
      // release parks it and lets the glow decay at the last touched spot.
      if (e.pointerType !== 'mouse') {
        pointer.releaseMs = 0;
        pointer.x = -1000;
        pointer.y = -1000;
      }
      wake();
    };

    // --- Touch -----------------------------------------------------------

    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      syncEntry(t.clientX, t.clientY);
      pointer.x = t.clientX;
      pointer.y = t.clientY;
      pointer.glowX = t.clientX;
      pointer.glowY = t.clientY;
      // A new touch starts from rest — don't inherit the previous gesture's
      // follow velocity, or the first frames of a fresh slow press would
      // lurch as if it were still mid-sweep.
      pointer.glowVX = 0;
      pointer.glowVY = 0;
      pointer.active = true;
      pointer.holdStillMs = 0;
      pointer.releaseMs = 0;
      pointer.energy = 1;
      speedSmooth = 0;
      dragVelX = 0;
      dragVelY = 0;
      pointer.heat = Math.max(pointer.heat, HEAT_FLOOR);
      wake();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      pointer.x = t.clientX;
      pointer.y = t.clientY;
      wake();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Multi-touch: only end the press once the last finger is off.
      if (e.touches.length > 0) return;
      pointer.active = false;
      pointer.holdStillMs = 0;
      // Don't park x/y yet — hand off to the release window (see
      // TOUCH_RELEASE_MS). The pointer stays where the finger left it, marked
      // released, so the mesh can coast to a stop and the heat can decay
      // before the position goes offscreen. render() does the countdown.
      pointer.releaseMs = TOUCH_RELEASE_MS;
      wake();
    };

    // Fires when the mouse leaves the browser viewport entirely (as opposed
    // to moving between elements within the page, which also dispatches
    // `mouseout` but with a `relatedTarget`). Deliberately document-level
    // `mouseout` rather than `window`'s `mouseleave` — the latter isn't
    // dispatched reliably on `window` across browsers, which was letting the
    // glow/heat/node-tint get stuck showing whatever was last true right at
    // the window edge instead of fading out.
    const handleMouseLeaveDoc = (e: MouseEvent) => {
      if (e.relatedTarget) return;
      pointer.releaseMs = 0;
      pointer.x = -1000;
      pointer.y = -1000;
      pointer.active = false;
      pointer.holdStillMs = 0;
      wake();
    };

    const handleVisibility = () => {
      if (!document.hidden) wake();
    };

    // Only compares each node against its forward neighbours within a 2-cell
    // window instead of every other node. The old all-pairs pass was O(n^2)
    // and would have roughly tripled at this density; nodes never drift more
    // than a fraction of a cell from their anchor, so distant pairs can't
    // reach maxConnDist and checking them was wasted work.
    const NEIGHBOURS: [number, number][] = [
      [0, 1], [0, 2],
      [1, -2], [1, -1], [1, 0], [1, 1], [1, 2],
      [2, -2], [2, -1], [2, 0], [2, 1], [2, 2],
    ];

    const drawConnections = (alphaScale: number) => {
      const maxSq = maxConnDist * maxConnDist;
      ctx.lineWidth = 0.6;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const n = nodes[i * rows + j];

          for (let k = 0; k < NEIGHBOURS.length; k++) {
            const ni = i + NEIGHBOURS[k][0];
            const nj = j + NEIGHBOURS[k][1];
            if (ni >= cols || nj < 0 || nj >= rows) continue;

            const n2 = nodes[ni * rows + nj];
            const ndx = n.x - n2.x;
            const ndy = n.y - n2.y;
            const distSq = ndx * ndx + ndy * ndy;
            if (distSq >= maxSq) continue;

            const alpha = (1 - Math.sqrt(distSq) / maxConnDist) * alphaScale;
            ctx.strokeStyle = `rgba(${NODE_RGB.join(',')}, ${alpha})`;
            ctx.beginPath();
            // Lines are drawn at the jittered position too, so a long-press
            // buzz moves dots and their links together instead of tearing
            // the mesh apart.
            ctx.moveTo(n.x + n.jx, n.y + n.jy);
            ctx.lineTo(n2.x + n2.jx, n2.y + n2.jy);
            ctx.stroke();
          }
        }
      }
    };

    applyResize();
    // Sane default so a fast scroll before any touch/mouse activity drifts
    // the glow from viewport centre rather than from the top-left corner.
    pointer.glowX = width / 2;
    pointer.glowY = Math.min(height, window.innerHeight) / 2;

    const drawStatic = () => {
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, width, height);

      drawConnections(connAlpha * MESH_ALPHA);

      ctx.fillStyle = `rgba(${NODE_RGB.join(',')}, ${0.5 * MESH_ALPHA})`;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    if (reduceMotion) {
      redrawStatic = drawStatic;
      activateRef.current = () => redrawStatic?.();
      if (!pausedRef.current) activateRef.current();
      const handleThemeChangeStatic = () => {
        syncThemeColors();
        redrawStatic?.();
      };
      window.addEventListener(THEME_CHANGE_EVENT, handleThemeChangeStatic);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChangeStatic);
      };
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerEnd, { passive: true });
    window.addEventListener('pointercancel', handlePointerEnd, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    document.addEventListener('mouseout', handleMouseLeaveDoc, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    const handleThemeChangeAnimated = () => {
      syncThemeColors();
      wake();
    };
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChangeAnimated);

    let lastTime = performance.now();
    let idleAccumMs = 0;

    const wake = () => {
      if (running || document.hidden) return;
      running = true;
      lastTime = performance.now();
      idleAccumMs = 0;
      animationFrameId = requestAnimationFrame(render);
    };
    activateRef.current = () => {
      wake();
      if (firstActivation) {
        firstActivation = false;
        // A one-off "waking up" bloom at viewport centre, reusing the same
        // heat mechanism a real press uses rather than a bespoke effect —
        // also the hand-off point the logo intro zooms into (see Layout.tsx).
        // Centred on the *visible* viewport, not the buffered canvas height.
        pointer.x = width / 2;
        pointer.y = Math.min(height, window.innerHeight) / 2;
        pointer.glowX = pointer.x;
        pointer.glowY = pointer.y;
        pointer.active = true;
        pointer.heat = Math.max(pointer.heat, HEAT_FLOOR);
        window.setTimeout(() => {
          pointer.active = false;
        }, 260);
      }
    };

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const nowSec = now / 1000;

      // Touch release window: a lifted finger keeps its last position for
      // TOUCH_RELEASE_MS so the release gesture finishes rendering, then the
      // pointer parks offscreen and scroll-driven heat (which needs x <= -500)
      // can take over.
      if (pointer.releaseMs > 0) {
        pointer.releaseMs -= dt * 1000;
        if (pointer.releaseMs <= 0) {
          pointer.releaseMs = 0;
          pointer.x = -1000;
          pointer.y = -1000;
        }
      }

      // Real scroll velocity (px/sec), sampled once per frame and lightly
      // smoothed. Drives glow/heat only — see the SCROLL_* constants above.
      const scrollDeltaPx = scrollY - prevScrollY;
      prevScrollY = scrollY;
      const rawScrollVel = scrollDeltaPx / (dt || 1 / 60);
      const clampedScrollVel = Math.max(-SCROLL_VEL_CLAMP, Math.min(SCROLL_VEL_CLAMP, rawScrollVel));
      scrollVel = approach(scrollVel, clampedScrollVel, dt, SCROLL_VEL_TAU);
      // Only "engages" glow/heat when there's no live pointer to more
      // precisely drive them already — a steady mouse hover during a
      // wheel-scroll shouldn't fight with the hover glow sitting under it.
      const scrollActive = pointer.x <= -500 && Math.abs(scrollVel) > SCROLL_ENGAGE_PX_S;

      // Gesture energy: full strength right as a press/scroll begins, taper
      // while it continues uninterrupted, snap back to full the moment
      // nothing is engaged so the next gesture always starts fresh. Computed
      // up front so it's available to both the heat target and the physics
      // loop below. Not applied to jitter — a long hold should stay a stable
      // buzz regardless of how long it's been held.
      const engaged = pointer.active || scrollActive;
      pointer.energy = engaged ? approach(pointer.energy, GESTURE_ENERGY_FLOOR, dt, GESTURE_ENERGY_TAU) : 1;

      // --- The follow point -------------------------------------------
      // Everything below (physics segment, speed, drag velocity, the glow,
      // node tint, jitter weighting) reads position and velocity from HERE,
      // never from the raw event coordinates. See FOLLOW_OMEGA above: the
      // spring integrates every rAF frame regardless of whether a touch
      // sample arrived this frame, and does so with continuous velocity, so
      // its motion stays smooth even though its input sits still and jumps.
      const prevFollowX = pointer.glowX;
      const prevFollowY = pointer.glowY;
      const pointerOnScreen = pointer.x > -500 && pointer.y > -500;

      if (pointerOnScreen) {
        // Critically damped spring, semi-implicit Euler. Velocity is
        // integrated rather than assigned, which is what keeps the motion
        // C1-continuous through a ragged input signal — see FOLLOW_OMEGA.
        const k = FOLLOW_OMEGA * FOLLOW_OMEGA;
        const c = 2 * FOLLOW_OMEGA;
        pointer.glowVX += (k * (pointer.x - pointer.glowX) - c * pointer.glowVX) * dt;
        pointer.glowVY += (k * (pointer.y - pointer.glowY) - c * pointer.glowVY) * dt;
        pointer.glowX += pointer.glowVX * dt;
        pointer.glowY += pointer.glowVY * dt;
      } else if (scrollActive) {
        // No live pointer — most commonly a fast flick's momentum still
        // running after the finger has already lifted, or a mouse-wheel/
        // trackpad scroll with the cursor parked elsewhere. Drift the glow
        // with the content instead of leaving it stuck at the last touch
        // point: scrolling down moves content up, so a glow "attached" to
        // that content moves up by the same amount.
        pointer.glowY -= scrollDeltaPx;
        pointer.glowY = Math.max(-100, Math.min(height + 100, pointer.glowY));
      }

      // The segment the FOLLOW POINT swept this frame — not the raw pointer.
      // Because the follow point moves a little every frame, this segment is
      // always short and its length varies smoothly, instead of alternating
      // between zero-length (no touch sample this frame) and very long (a
      // sample finally landed) the way a raw-pointer segment does. That
      // alternation was what made nodes get hit in visible bursts.
      const segStartX = prevFollowX;
      const segStartY = prevFollowY;
      const followDX = pointer.glowX - prevFollowX;
      const followDY = pointer.glowY - prevFollowY;

      // Speed and drag velocity, both derived from the follow point's own
      // (already continuous) motion, so neither needs further smoothing.
      const followVX = followDX / (dt || 1 / 60);
      const followVY = followDY / (dt || 1 / 60);
      speedSmooth = pointerOnScreen
        ? Math.min(4, Math.sqrt(followVX * followVX + followVY * followVY) / 1000)
        : 0;

      const dragClampScale = (() => {
        const m = Math.sqrt(followDX * followDX + followDY * followDY);
        return m > MAX_DRAG_PX ? MAX_DRAG_PX / m : 1;
      })();
      dragVelX = pointerOnScreen ? followVX * dragClampScale : 0;
      dragVelY = pointerOnScreen ? followVY * dragClampScale : 0;

      // Long-press stillness is judged against the RAW pointer delta, not the
      // follow point: the follow point keeps creeping toward its target for a
      // few frames after the finger stops, and treating that as movement
      // would keep resetting the hold timer and suppress the buzz.
      const rawDX = pointerOnScreen ? pointer.x - pointer.prevX : 0;
      const rawDY = pointerOnScreen ? pointer.y - pointer.prevY : 0;
      if (pointerOnScreen) {
        pointer.prevX = pointer.x;
        pointer.prevY = pointer.y;
      }
      const dragMag = Math.sqrt(rawDX * rawDX + rawDY * rawDY);

      const positionKnown = (pointer.x > -500 && pointer.y > -500) || scrollActive;
      pointer.presence = approach(pointer.presence, positionKnown ? 1 : 0, dt, 0.12);
      // A held press always wants full heat; an unpressed-but-scrolling state
      // wants heat proportional to how fast it's currently scrolling (so a
      // gentle scroll only glows a little while an aggressive flick blooms),
      // tapered by gesture energy so a long sustained fast scroll settles
      // instead of staying maxed out for its whole duration.
      const heatTarget = pointer.active
        ? 1
        : scrollActive
          ? Math.min(1, Math.abs(scrollVel) / SCROLL_HEAT_NORM) * pointer.energy
          : 0;
      const heatEngaged = pointer.active || scrollActive;
      // A press is a discrete event and should snap; scroll-driven heat
      // follows a continuously fluctuating velocity, so it gets a much
      // longer ramp — at press speed it visibly pumped with every variation
      // in scroll rate, which is what read as the heat "jumping".
      const heatTau = pointer.active ? HEAT_RISE_TAU : scrollActive ? HEAT_SCROLL_TAU : HEAT_FALL_TAU;
      pointer.heat = approach(pointer.heat, heatTarget, dt, heatTau);
      // Exponential decay never actually reaches zero — snap it, so a release
      // leaves no residual warmth sitting in the scene (and so the idle check
      // below can actually be satisfied).
      if (!heatEngaged && pointer.heat < HEAT_EPS) pointer.heat = 0;

      // Long press: accumulate held-and-still time; any real movement resets
      // it, so a drag never buzzes.
      if (pointer.active && dragMag < HOLD_STILL_PX) pointer.holdStillMs += dt * 1000;
      else pointer.holdStillMs = 0;
      const jitterTarget = pointer.active
        ? Math.max(0, Math.min(1, (pointer.holdStillMs - HOLD_DELAY_MS) / HOLD_RAMP_MS))
        : 0;
      pointer.jitter = approach(pointer.jitter, jitterTarget, dt, 0.12);
      if (jitterTarget === 0 && pointer.jitter < 0.004) pointer.jitter = 0;

      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, width, height);

      // The "light": a soft radial glow washed over the mesh before
      // nodes/lines are drawn, so the grid reads as lit up around the
      // pointer rather than relying on individual node opacity alone.
      // `presence` is the baseline (hover, for a mouse; "currently touching"
      // for touch); `heat` is the extra press-and-hold bloom on top of that.
      const glowBase = pointer.presence * GLOW_BASE_ALPHA * GLOW_ALPHA_SCALE;
      const glowHeat = pointer.heat * GLOW_HEAT_ALPHA * GLOW_ALPHA_SCALE;
      const glowAlpha = glowBase + glowHeat;
      const glowRadius = pointer.lightRadius * (1 + pointer.heat * pointer.heatExpand);

      if (glowAlpha > 0.002) {
        const glow = ctx.createRadialGradient(pointer.glowX, pointer.glowY, 0, pointer.glowX, pointer.glowY, glowRadius);
        glow.addColorStop(0, `rgba(${ACCENT_RGB.join(',')}, ${glowAlpha})`);
        glow.addColorStop(0.45, `rgba(${ACCENT_RGB.join(',')}, ${glowAlpha * 0.4})`);
        glow.addColorStop(1, `rgba(${ACCENT_RGB.join(',')}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pointer.glowX, pointer.glowY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spring-mass-damping system: a gentle spring pull-back, heavy enough
      // damping to settle instead of oscillating, and a weak pointer drag
      // impulse layered on top. Page scroll never touches this — the mesh
      // is a fixed background and only a held, dragging pointer moves it.
      //
      // Softened from 9/0.9: a stiffer spring snapped nodes home fast enough
      // that a sweep read as a sharp pop-and-return at each node rather than
      // the mesh flowing behind the finger. Lower K plus slightly heavier
      // damping trails more and overshoots less.
      const SPRING_K = 6.5;
      const DAMPING = 0.88;

      // Segment the FOLLOW POINT swept this frame — see where segStartX/Y are
      // captured above. Precomputed once rather than per-node.
      const segABX = followDX;
      const segABY = followDY;
      const segLenSq = segABX * segABX + segABY * segABY;
      const segLen = Math.sqrt(segLenSq);
      const radiusSq = pointer.radius * pointer.radius;

      let maxSpeedSq = 0;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.pulse += dt * 1.2; // slow shimmer

        // `pointerOnScreen` gate: scroll drifts the glow above, but must
        // never move a node.
        // Distance to the closest point on the swept segment, not just to
        // the pointer's current point — otherwise a fast drag only ever
        // catches whichever nodes it happens to be sitting on this exact
        // frame, leaving everything it swept past in between untouched.
        let t = segLenSq > 1e-6 ? ((n.x - segStartX) * segABX + (n.y - segStartY) * segABY) / segLenSq : 0;
        if (t < 0) t = 0;
        else if (t > 1) t = 1;
        const closeX = segStartX + segABX * t;
        const closeY = segStartY + segABY * t;
        const dx = closeX - n.x;
        const dy = closeY - n.y;
        const distSq = dx * dx + dy * dy;

        if (pointerOnScreen && distSq < radiusSq && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const power = 1 - dist / pointer.radius;
          const invDist = 1 / dist;
          const dirX = dx * invDist;
          const dirY = dy * invDist;

          // Impulse has two parts, and this split is what makes fast and
          // slow gestures deliver comparable, non-bursty force:
          //
          //  - DWELL: force * dt. Dominant when the pointer is slow or
          //    stationary, where a node genuinely sits in range for many
          //    consecutive frames.
          //  - SWEEP: force * (arc length of this frame's segment that lies
          //    inside the node's radius) / radius. Dominant when moving.
          //    Because it's measured in *distance travelled through the
          //    node's neighbourhood* rather than frames spent there, the
          //    total a node receives over a gesture depends only on the path
          //    geometry — identical whether the path was delivered in one
          //    long frame or ten short ones. That frame-chunk independence is
          //    precisely what removes the burst-on-arrival popping; there's
          //    no longer any "first contact" special case to pop.
          let arcInside = 0;
          if (segLen > 1e-4) {
            const half = Math.sqrt(radiusSq - distSq);
            const sMid = t * segLen;
            const s1 = Math.max(0, sMid - half);
            const s2 = Math.min(segLen, sMid + half);
            if (s2 > s1) arcInside = s2 - s1;
          }
          const strength = power * (REPEL_BASE + speedSmooth * REPEL_SPEED_GAIN) * pointer.energy;
          const impulse = strength * (dt + (arcInside / pointer.radius) * SWEEP_TIME_PER_RADIUS);
          n.vx -= dirX * impulse;
          n.vy -= dirY * impulse;

          // While actually pressed, nodes also lean *with* the drag rather
          // than only away from it — that's what makes a press-and-drag read
          // as pulling the mesh along.
          if (pointer.active) {
            n.vx += dragVelX * power * DRAG_FOLLOW * dt * pointer.energy;
            n.vy += dragVelY * power * DRAG_FOLLOW * dt * pointer.energy;
          }
        }

        const homeDx = n.baseX - n.x;
        const homeDy = n.baseY - n.y;
        n.vx += homeDx * SPRING_K * dt;
        n.vy += homeDy * SPRING_K * dt;

        n.vx *= DAMPING;
        n.vy *= DAMPING;

        n.x += n.vx * dt * 60;
        n.y += n.vy * dt * 60;

        // Long-press buzz. Deliberately a *render* offset: n.x/n.y are never
        // touched, so no amount of holding can walk a node off its anchor.
        if (pointer.jitter > 0) {
          const jdx = pointer.glowX - n.x;
          const jdy = pointer.glowY - n.y;
          const jd = Math.sqrt(jdx * jdx + jdy * jdy);
          const w = Math.max(0, 1 - jd / pointer.lightRadius) * pointer.jitter;
          if (w > 0) {
            const ph = n.phase * Math.PI * 2;
            n.jx = Math.sin(nowSec * 41 + ph) * JITTER_PX * w;
            n.jy = Math.cos(nowSec * 47 + ph * 1.7) * JITTER_PX * w;
          } else {
            n.jx = 0;
            n.jy = 0;
          }
        } else if (n.jx !== 0 || n.jy !== 0) {
          n.jx = 0;
          n.jy = 0;
        }

        const speedSq = n.vx * n.vx + n.vy * n.vy;
        if (speedSq > maxSpeedSq) maxSpeedSq = speedSq;
      }

      drawConnections(connAlpha * MESH_ALPHA);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const px = n.x + n.jx;
        const py = n.y + n.jy;
        const dx = pointer.glowX - px;
        const dy = pointer.glowY - py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // The whole mesh stays clearly visible on its own (this is the
        // baseline look, not a "hover to reveal" effect) — proximity only
        // adds a tint on top, gated by presence so it fades in/out with the
        // pointer rather than lingering. MESH_ALPHA (light-mode legibility
        // dimming) applies only to the resting mesh, never to that tint —
        // the glow under the pointer stays exactly as strong in both themes.
        const proximity = Math.max(0, 1 - dist / pointer.lightRadius) * pointer.presence;
        const baseAlpha = (0.5 + Math.sin(n.pulse) * 0.1) * MESH_ALPHA;
        const alpha = Math.min(0.9, baseAlpha + proximity * 0.35);
        // Capped below 1 so lit nodes warm toward the brand orange rather
        // than hitting full saturation — a tint, not a highlighter.
        const color =
          proximity > 0 ? lerpColor(NODE_RGB, ACCENT_RGB, Math.min(0.8, proximity * 1.2)) : NODE_RGB;

        ctx.fillStyle = `rgba(${color.join(',')}, ${alpha})`;

        // Grows by well under one radius at the centre of the light. A
        // larger multiplier made nearby dots balloon and read as a
        // magnifier rather than a light.
        const currentRadius = n.radius + Math.sin(n.pulse) * 0.2 + proximity * n.radius * 0.7;

        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        ctx.fill();

        if (proximity > 0.5) {
          const pulseRing = ((n.pulse * 10) % 24) + 3; // slow, tight ring
          const ringAlpha = (1 - pulseRing / 27) * 0.18 * proximity;

          ctx.strokeStyle = `rgba(${ACCENT_RGB.join(',')}, ${ringAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(px, py, pulseRing, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Idle shutoff: stop scheduling once everything — node motion,
      // presence, heat, jitter — has been at rest for a beat. Any future
      // pointer/touch event or resize calls wake() to restart instantly.
      const settled =
        maxSpeedSq < IDLE_VEL_EPS * IDLE_VEL_EPS &&
        pointer.presence < IDLE_SETTLE_EPS &&
        pointer.heat < IDLE_SETTLE_EPS &&
        pointer.jitter < IDLE_SETTLE_EPS &&
        !pointer.active &&
        pointer.releaseMs <= 0 &&
        !scrollActive;

      if (settled) {
        idleAccumMs += dt * 1000;
      } else {
        idleAccumMs = 0;
      }

      if (idleAccumMs > IDLE_TIMEOUT_MS || document.hidden) {
        running = false;
        return;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    if (!pausedRef.current) activateRef.current();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      document.removeEventListener('mouseout', handleMouseLeaveDoc);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChangeAnimated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!paused) activateRef.current();
  }, [paused]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        // The canvas is deliberately taller than the viewport on touch
        // devices (see VIEWPORT_BUFFER) so the URL bar sliding in and out
        // never resizes it — clip the reserve.
        overflow: 'hidden',
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
}
