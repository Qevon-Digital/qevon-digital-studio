import { useState } from 'react';
import { motion } from 'framer-motion';
import ImagePlaceholder from './ImagePlaceholder';
import type { ProjectImage } from '../data/projects';

/**
 * Renders a project image, or the neutral placeholder when there isn't one
 * yet (`src: null`) **or** when the image fails to load at runtime. Both
 * cases collapse to the same fallback, so a dead URL shows the branded
 * placeholder rather than a broken-image icon.
 *
 * Exists as a component rather than a hook because Work.tsx renders its cards
 * from an inline `.map`, where a per-item hook call isn't allowed.
 */
export default function ProjectMedia({
  image,
  label,
  hovered = false,
  imgClassName = 'w-full h-full object-cover',
  loading = 'lazy',
}: {
  image: ProjectImage;
  /** Shown on the placeholder — usually the project title. */
  label: string;
  hovered?: boolean;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
}) {
  const [failed, setFailed] = useState(false);

  if (!image.src || failed) return <ImagePlaceholder label={label} />;

  return (
    <motion.img
      src={image.src}
      alt={image.alt}
      loading={loading}
      onError={() => setFailed(true)}
      className={imgClassName}
      // Screenshots are wider than the 16/9 slot, so a centre crop would cut
      // the header off. `position` lets each image choose.
      style={{ objectPosition: image.position === 'top' ? 'top center' : 'center' }}
      animate={{ scale: hovered ? 1.04 : 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
