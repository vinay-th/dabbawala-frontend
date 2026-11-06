'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Shared primary button for every "Launch app" instance (NavHeader, F0 hero, F6 closing).
// Follows DESIGN.md: yellow fill, ink text, hard offset shadow, presses flat on click.
// Motion: draws up on mount, lifts + shadow grows on hover, flattens on tap. Disabled
// entirely under prefers-reduced-motion (DESIGN.md motion rule).
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  shadow?: string;
  border?: string;
  borderWidth?: string;
}

const SIZE_CLASSES = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg',
};

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function PrimaryButton({
  children,
  onClick,
  className = '',
  size = 'md',
  shadow = '#14110F',
  border = '#14110F',
  borderWidth = '1.5px',
}: PrimaryButtonProps) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduced ? false : { opacity: 0, y: 10, scale: 0.97 }}
      animate={reduced ? false : { opacity: 1, y: 0, scale: 1 }}
      transition={reduced ? undefined : { duration: 0.45, ease: EASE_OUT }}
      whileHover={
        reduced
          ? undefined
          : {
              y: -2,
              boxShadow: `3.5px 3.5px 0px ${shadow}`,
              transition: { duration: 0.15, ease: 'easeOut' },
            }
      }
      whileTap={
        reduced
          ? undefined
          : {
              y: 0,
              boxShadow: `1px 1px 0px ${shadow}`,
              transition: { duration: 0.1 },
            }
      }
      className={`bg-[#FFC20E] text-[#14110F] font-extrabold uppercase tracking-wider rounded-sm ${SIZE_CLASSES[size]} ${className}`}
      style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        border: `${borderWidth} solid ${border}`,
        boxShadow: `2.5px 2.5px 0px ${shadow}`,
      }}
    >
      {children}
    </motion.button>
  );
}