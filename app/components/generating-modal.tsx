// components/generating-modal.tsx
//
// EXTRACTED from (dashboard)/dashboard/plans/page.tsx -- that file had a
// private `GeneratingModal` function with real framer-motion polish
// (aurora background, rotating halo, pulse rings, orbiting particles,
// cycling status line, sliding-sheen progress bar). It just wasn't
// reusable from anywhere else.
//
// This is that same component, moved here unchanged, and exported so
// dashboard/create/page.tsx can show it too -- right now the create
// flow calls generatePlan() and immediately router.push()es away with no
// modal at all, which is the "no nicely styled modal when generating" gap.
//
// After adding this file:
//   1. In (dashboard)/dashboard/plans/page.tsx, delete the local
//      GeneratingModal function, GENERATING_MESSAGES, and ORBITS consts,
//      and instead `import { GeneratingModal } from "@/components/generating-modal";`
//   2. Use it from (dashboard)/dashboard/create/page.tsx as described in
//      PATCHES.md.

"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

// Rotated while a plan is generating so the modal feels alive instead of frozen.
const GENERATING_MESSAGES = [
  "Reading through your numbers...",
  "Checking margins and break-even...",
  "Drafting the executive summary...",
  "Polishing tone and phrasing...",
  "Almost there -- finalizing your plan...",
];

// Three orbit rings, each with its own radius, duration, and direction, so
// the motion around the core reads as layered rather than a single spinner.
const ORBITS = [
  { radius: 34, duration: 5.5, direction: 1, size: 7, delay: 0 },
  { radius: 34, duration: 5.5, direction: 1, size: 5, delay: 1.83 },
  { radius: 34, duration: 5.5, direction: 1, size: 6, delay: 3.66 },
  { radius: 48, duration: 8, direction: -1, size: 4, delay: 0.9 },
  { radius: 48, duration: 8, direction: -1, size: 4, delay: 4.9 },
];

export function GeneratingModal({
  open,
  title,
}: {
  open: boolean;
  title: string;
}) {
  // Starts at 0 on every mount. The parent should remount this component
  // (via a `key` keyed on the plan id) whenever the modal opens for a new
  // plan, so there's no need to reset this from inside an effect.
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % GENERATING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [open]);

  return (
    <Dialog open={open}>
      {/* No onOpenChange -- this closes itself when the caller flips
          `open` to false once the plan is no longer "generating", not
          from a user click. */}
      <DialogContent
        className="sm:max-w-md text-center overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Slow-drifting aurora wash behind the whole card, indigo -> violet -> fuchsia. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-40"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 20%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(55% 55% at 80% 30%, rgba(139,92,246,0.30), transparent 60%), radial-gradient(65% 65% at 50% 90%, rgba(217,70,239,0.22), transparent 60%)",
            backgroundSize: "180% 180%",
          }}
          animate={{ backgroundPosition: ["0% 0%", "100% 60%", "0% 0%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <DialogHeader>
          <DialogTitle className="text-center">
            Generating &quot;{title}&quot;
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          {/* Core icon with layered rings, a rotating gradient halo, and
              particles orbiting at two radii. */}
          <div className="relative h-28 w-28 flex items-center justify-center">
            {/* Rotating conic halo, sitting behind the rings */}
            <motion.div
              className="absolute h-24 w-24 rounded-full opacity-70 blur-md"
              style={{
                background:
                  "conic-gradient(from 0deg, #6366f1, #8b5cf6, #d946ef, #6366f1)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />

            {/* Expanding pulse rings */}
            {[0, 1, 2].map((ring) => (
              <motion.span
                key={ring}
                className="absolute inset-0 m-auto h-16 w-16 rounded-full border-2 border-violet-400"
                initial={{ opacity: 0.6, scale: 0.5 }}
                animate={{ opacity: 0, scale: 1.8 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: ring * 0.66,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Orbiting particles: each wrapper spins, the dot inside is
                offset from center, so together they trace circular paths */}
            {ORBITS.map((orbit, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 m-auto h-0 w-0"
                animate={{ rotate: orbit.direction * 360 }}
                transition={{
                  duration: orbit.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: -orbit.delay,
                }}
              >
                <span
                  className="absolute rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-400 shadow-[0_0_6px_rgba(139,92,246,0.8)]"
                  style={{
                    width: orbit.size,
                    height: orbit.size,
                    top: -orbit.radius,
                    left: -orbit.size / 2,
                  }}
                />
              </motion.div>
            ))}

            {/* Core sparkle, gently breathing */}
            <motion.div
              className="relative h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-500 flex items-center justify-center text-white text-xl shadow-lg shadow-violet-500/40"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.span
                animate={{ rotate: [0, 15, -10, 0] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                &#10022;
              </motion.span>
            </motion.div>
          </div>

          {/* Cycling status line, gradient text with a soft blur-in/out */}
          <div className="h-5 relative w-full">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={{ duration: 0.35 }}
                className="text-sm font-medium absolute inset-x-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent"
              >
                {GENERATING_MESSAGES[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Indeterminate progress: a sliding gradient sheen rather than a
              single block, so it reads as continuous rather than a bouncing bar */}
          <div className="h-1.5 w-full rounded-full bg-indigo-950/10 dark:bg-white/10 overflow-hidden">
            <motion.div
              className="h-full w-full rounded-full"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent, #6366f1, #a855f7, #d946ef, transparent)",
                backgroundSize: "60% 100%",
                backgroundRepeat: "no-repeat",
              }}
              animate={{ backgroundPositionX: ["-60%", "160%"] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Please be patient -- this usually takes under a minute.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
