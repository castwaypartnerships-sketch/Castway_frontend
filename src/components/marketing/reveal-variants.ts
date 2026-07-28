import type { Variants } from "framer-motion";

// Shared stagger-reveal variants for section headers: the parent triggers
// once on scroll-into-view, each child (eyebrow/heading/paragraph/etc.)
// rises in on its own beat instead of the block moving as one unit.
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};
