'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import MumbaiBackdrop from './components/landing/MumbaiBackdrop';
import NavHeader from './components/landing/NavHeader';
import RailProgress from './components/landing/RailProgress';
import StageScrubber from './components/landing/StageScrubber';
import TiffinSVG from './components/landing/TiffinSVG';
import DeveloperColophon from './components/landing/DeveloperColophon';
import {
  Frame0Hero,
  Frame1ENS,
  Frame2Hedera,
  Frame3ZeroG,
  Frame4HumanGate,
  Frame5Storage,
  Frame6Closing,
} from './components/landing/FrameContent';

// Pinned tiffin scroll story: F0 Hero + 5 protocol checks + F6 Closing.
// Choreography and copy mirror ref/landing.html; theme and typography follow DESIGN.md.
const TOTAL_FRAMES = 7;
const LAST_FRAME = TOTAL_FRAMES - 1;

const FRAME_TITLE = [
  'Hero',
  'ENS Passport',
  'Hedera x402',
  '0G Compute',
  'Human Gate',
  '0G Storage',
  'Closing',
];

function frameContent(frame: number, onScrollCue: () => void) {
  switch (frame) {
    case 0:
      return <Frame0Hero visible onScroll={onScrollCue} />;
    case 1:
      return <Frame1ENS visible />;
    case 2:
      return <Frame2Hedera visible />;
    case 3:
      return <Frame3ZeroG visible />;
    case 4:
      return <Frame4HumanGate visible />;
    case 5:
      return <Frame5Storage visible />;
    default:
      return <Frame6Closing visible />;
  }
}

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const [activeFrame, setActiveFrame] = useState(0);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);

  // Frame theme drives body background (paper -> golden hour -> monsoon slate).
  useEffect(() => {
    document.body.className = `theme-f${activeFrame}`;
  }, [activeFrame]);

  // Pinned scene: one 700vh scroll track, 7 discrete frames mapped from progress.
  useEffect(() => {
    if (prefersReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const track = scrollTrackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) return;

      ScrollTrigger.create({
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        pin: stage,
        pinSpacing: false,
        onUpdate: (self) => {
          const frame = Math.min(LAST_FRAME, Math.round(self.progress * LAST_FRAME));
          setActiveFrame(frame);
          document.documentElement.style.setProperty('--horizon-pan', String(self.progress * 40));
        },
      });
    });

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const goToFrame = useCallback(
    (frame: number) => {
      const target = Math.max(0, Math.min(LAST_FRAME, frame));
      if (prefersReducedMotion) {
        document
          .getElementById(`frame-${target}`)
          ?.scrollIntoView({ behavior: 'auto', block: 'start' });
        setActiveFrame(target);
        return;
      }
      const track = document.getElementById('scroll-track');
      if (!track) return;
      const top =
        track.offsetTop + (target / LAST_FRAME) * (track.offsetHeight - window.innerHeight);
      window.scrollTo({ top, behavior: 'smooth' });
    },
    [prefersReducedMotion],
  );

  const scrollToCue = useCallback(() => goToFrame(1), [goToFrame]);

  // Reduced motion: stacked static sections, no pin, no scrub (DESIGN.md motion rule).
  if (prefersReducedMotion) {
    return (
      <>
        <MumbaiBackdrop />
        <NavHeader onGoToFrame={goToFrame} />
        <main className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-28 px-12 pt-28 pb-32">
          {Array.from({ length: TOTAL_FRAMES }, (_, i) => (
            <section
              key={i}
              id={`frame-${i}`}
              aria-label={FRAME_TITLE[i]}
              className="flex min-h-[70vh] max-w-[520px] flex-col justify-center"
            >
              {frameContent(i, scrollToCue)}
            </section>
          ))}
        </main>
        {/* Credits also appear at the end of the reduced-motion stack. */}
        <section
          aria-label="Built by"
          className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col justify-center px-12 pb-28"
        >
          <DeveloperColophon />
        </section>
        <StageScrubber activeFrame={activeFrame} onGoToFrame={goToFrame} />
      </>
    );
  }

  return (
    <>
      <MumbaiBackdrop />
      <NavHeader onGoToFrame={goToFrame} />
      <RailProgress activeFrame={activeFrame} onGoToFrame={goToFrame} />

      {/* 700vh scroll track; the stage inside is pinned for its duration. */}
      <div
        id="scroll-track"
        ref={scrollTrackRef}
        className="relative"
        style={{ height: `${TOTAL_FRAMES * 100}vh` }}
      >
        <section
          ref={stageRef}
          aria-label="Dabbawala Protocol scroll story"
          className="relative flex h-screen w-full items-center justify-between overflow-hidden px-12 pt-16 pb-20 sm:px-16 md:max-w-[1340px] md:px-20 md:mx-auto lg:px-24"
        >
          {/* LEFT: text block (max 520px) */}
          <div className="relative z-10 flex w-full max-w-[500px] flex-col justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeFrame}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {frameContent(activeFrame, scrollToCue)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: the 5-tier steel tiffin (F0-F5) → dev colophon (F6). */}
          <div className="relative z-10 flex w-full max-w-[440px] items-center justify-center pl-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeFrame === 6 ? 'colophon' : 'tiffin'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex w-full justify-center"
              >
                {activeFrame === 6 ? (
                  <DeveloperColophon />
                ) : (
                  <TiffinSVG activeFrame={activeFrame} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>

      <StageScrubber activeFrame={activeFrame} onGoToFrame={goToFrame} />
    </>
  );
}
