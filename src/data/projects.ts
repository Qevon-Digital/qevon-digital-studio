/**
 * Single source of truth for the four real projects — Home's grid, Work's
 * archive, and each CaseStudy page all render from this list rather than
 * keeping three hand-maintained copies that drift apart.
 *
 * Every stat here is a verifiable fact taken from the project itself: check
 * and category counts from SentinelOps' own rubric, module counts from Grand
 * Motel's shipped navigation, and metrics straight off the phishing model's
 * held-out classification report. Nothing is estimated or rounded up — if a
 * number can't be sourced, it doesn't go in.
 *
 * Images live in /public/work as WebP (originals were 2880px PNGs totalling
 * ~2.2MB; re-encoded to ~310KB for the whole set).
 */

export interface ProjectStat {
  label: string;
  value: string;
}

export interface ProjectImage {
  /**
   * null renders the neutral ImagePlaceholder instead of an <img> — see
   * src/components/ImagePlaceholder.tsx. A non-null src that fails to load
   * falls back to the same placeholder at runtime (via ProjectMedia's
   * onError), so a dead URL never shows a broken-image icon.
   */
  src: string | null;
  alt: string;
  /**
   * Screenshots are wider than the 16/9 slots they sit in, so the default
   * centre crop cuts the top off. 'top' keeps the header and primary content
   * visible, which is the part worth seeing.
   */
  position?: 'top' | 'center';
}

export interface Project {
  num: string;
  slug: string;
  title: string;
  tags: string[];
  year: string;
  /** Short 1–2 sentence description for the Home/Work grid cards. */
  cardDesc: string;
  hero: ProjectImage;
  challenge: string;
  solution: string;
  result: string;
  stats: ProjectStat[];
  /** Gallery images on the case study page. */
  images: ProjectImage[];
  /**
   * Real client quote only — never fabricate one. Omit until an actual
   * client has given a real quote to use; CaseStudy renders this block
   * only when present.
   */
  testimonial?: { quote: string; author: string; role: string };
  /** Same rule as `testimonial`: only a real logo file, never a placeholder. */
  clientLogo?: string;
}

export const projects: Project[] = [
  {
    num: '01',
    slug: 'grandmotel-os',
    title: 'GRAND MOTEL OS',
    tags: ['Software', 'Web', 'Operations'],
    year: '2024',
    cardDesc: 'Point of sale, inventory and customers in one system — stock moves as orders do, and the day reconciles itself.',
    hero: { src: '/work/grandmotel-pos.webp', alt: 'Grand Motel OS point of sale with an open cart and cash payment', position: 'top' },
    challenge: 'Stock, orders and customer history lived in separate spreadsheets. Nothing reconciled, and the numbers were only true until the next sale.',
    solution: 'One system for the whole day: a keyboard-driven point of sale, live inventory, customer profiles, and finance and reporting — all on the same data.',
    result: 'A cashier rings up a sale without leaving the keyboard, and it updates inventory, the customer record and the ledger at once.',
    stats: [
      { label: 'MODULES SHIPPED', value: '7' },
      { label: 'PAYMENT METHODS', value: '4' },
      { label: 'BODY TEXT CONTRAST', value: '20:1' },
      { label: 'DESIGN TOKENS', value: '100%' },
    ],
    images: [
      { src: '/work/grandmotel-sale.webp', alt: 'Sale recorded confirmation showing line items, total, amount paid and change due', position: 'center' },
      { src: '/work/grandmotel-design-system.webp', alt: 'Grand Motel OS component catalog showing the type scale and measured colour contrast', position: 'top' },
    ],
  },
  {
    num: '02',
    slug: 'sentinelops',
    title: 'SENTINELOPS',
    tags: ['Security', 'DevOps', 'Tooling'],
    year: '2024',
    cardDesc: 'Point it at a repo. It runs 29 checks across 6 categories and scores production-readiness out of 100.',
    hero: { src: '/work/sentinelops-scan.webp', alt: 'SentinelOps scan results showing a score of 93 out of 100, Grade A, with the category breakdown', position: 'top' },
    challenge: "Teams had no fast way to tell whether a backend was actually production-ready — missing CI, a container running as root, a credential committed months ago. Easy to miss under deadline, expensive to miss in production.",
    solution: "Point SentinelOps at a repo and it runs 29 checks across six categories, then returns a score out of 100 with what's wrong, why it matters, and what to do about it. It only reads the code — it never runs, deploys or modifies anything.",
    result: 'Every scan exports as a PDF. Scanning its own repository, SentinelOps scores 93/100 — and reports its own failures rather than hiding them.',
    stats: [
      { label: 'CHECKS RUN', value: '29' },
      { label: 'CATEGORIES', value: '6' },
      { label: 'SELF-SCORE', value: '93/100' },
      { label: 'CODE EXECUTED', value: '0' },
    ],
    images: [
      { src: '/work/sentinelops-running.webp', alt: 'A scan in progress: two categories reported, four still scanning, with the score held as pending', position: 'top' },
      { src: '/work/sentinelops-history.webp', alt: 'Scan history for a project showing a score moving from 87 Grade B to 93 Grade A', position: 'top' },
    ],
  },
  {
    num: '03',
    slug: 'bingus',
    title: 'BINGUS',
    tags: ['Social', 'Mobile', 'Web'],
    year: '2025',
    cardDesc: 'A location-based social platform — posts and connections anchored to real places.',
    hero: { src: '/work/bingus-feed.png', alt: 'Bingus home feed showing posts from nearby users', position: 'top' },
    challenge: 'Most social feeds flatten every post into the same generic timeline, disconnected from where it actually happened.',
    solution: 'Bingus anchors posts and connections to real places, so what you see is shaped by where you are rather than only who you follow.',
    result: 'A feed shaped by place rather than a follow list.',
    // No real usage numbers exist yet — omitted rather than shown as
    // placeholder dashes. Add real stats here once there's data to source.
    stats: [],
    images: [
      { src: '/work/bingus-map.png', alt: 'Bingus map view showing nearby users and events', position: 'top' },
      { src: '/work/bingus-login.png', alt: 'Bingus login screen with brand mark', position: 'center' },
    ],
  },
  {
    num: '04',
    slug: 'phishing-url-detection',
    title: 'PHISHING URL DETECTION',
    tags: ['AI', 'ML', 'Security'],
    year: '2025',
    cardDesc: 'A hybrid LSTM + CNN model that classifies URLs as phishing or legitimate from 90 engineered features.',
    hero: { src: '/work/phish-arch.webp', alt: 'Model architecture: URL features feeding an LSTM and a 1D CNN in parallel, merged into dense layers', position: 'center' },
    challenge: 'Phishing URLs mutate constantly, so static blocklists and hand-written rules go stale almost as soon as they ship — and letting one through costs far more than a false alarm.',
    solution: 'A hybrid CNN + LSTM model reads 90 engineered features per URL — structure, domain data, page behaviour, WHOIS/DNS — and classifies it as phishing or legitimate.',
    result: '90% accuracy on 2,286 held-out URLs, deliberately tuned toward catching phishing over avoiding false alarms — the more expensive error.',
    stats: [
      { label: 'ACCURACY', value: '0.90' },
      { label: 'F1 — PHISHING', value: '0.91' },
      { label: 'RECALL — PHISHING', value: '0.93' },
      { label: 'FEATURES', value: '90' },
    ],
    images: [
      { src: '/work/phish-metrics.webp', alt: 'Classification report: precision, recall and F1 per class across 2,286 test URLs', position: 'center' },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Tags with at least one project, in first-seen order — drives Work's filter row so no chip can ever yield an empty grid. */
export const projectFilters: string[] = ['ALL', ...Array.from(new Set(projects.flatMap((p) => p.tags)))];
