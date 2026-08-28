"use client";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import Image from "next/image";

const SUBJECTS = ["Piano", "Plumbing", "Python", "Spanish"] as const;

// Same interactive idea as the old stage switcher — one product, different
// example course depending on what you're trying to learn.
const HIGHLIGHT_LIBRARY: Record<(typeof SUBJECTS)[number], string[]> = {
  Piano: [
    "Hand position, note reading, and your first scale",
    "Chords, rhythm, and simple two-hand coordination",
    "Sight-reading and your first full song, start to finish",
  ],
  Plumbing: [
    "Shut-off valves, pipe types, and basic tool safety",
    "Fixing leaks, unclogging drains, replacing washers",
    "Sweating copper joints and small fixture installs",
  ],
  Python: [
    "Variables, loops, and writing your first script",
    "Functions, files, and working with real data",
    "Building a small project end to end, tested and shipped",
  ],
  Spanish: [
    "Greetings, numbers, and everyday survival phrases",
    "Past and future tense, ordering food, asking directions",
    "Holding a real conversation and reading short articles",
  ],
};

const FEATURES = [
  {
    title: "One set of inputs, full curriculum",
    description:
      "Enter the subject, your starting point, your target level, and how much time you have. The AI writes every module and lesson, and pacing is computed in code — never invented.",
    icon: "📚",
  },
  {
    title: "A link, not a folder of PDFs",
    description:
      "Every course gets a share page at /course/your-slug. Send the link to a student, a friend, or yourself on your phone — they see the course, not your dashboard.",
    icon: "🔗",
  },
  {
    title: "PDF or live preview",
    description:
      "Download a polished syllabus (roadmap, progress tracker, and more) or share the animated web version with a readiness score and pacing up front.",
    icon: "📈",
  },
];

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const [activeSubject, setActiveSubject] =
    useState<(typeof SUBJECTS)[number]>("Piano");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image
        src="/cvcolleague.jpg"
        alt=""
        fill
        priority
        className="object-cover opacity-15 dark:opacity-10 -z-10 pointer-events-none select-none"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-950/30 via-slate-900/20 to-purple-950/35 dark:from-indigo-950/40 dark:via-black/60 dark:to-purple-950/30 pointer-events-none" />

      <main className="relative z-10 px-6">
        {/* Hero */}
        <section className="max-w-5xl mx-auto pt-20 pb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium tracking-wide uppercase text-purple-600 dark:text-purple-400"
          >
            AI courses with a real curriculum
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-4 font-[family-name:var(--font-display)] text-5xl md:text-7xl font-medium tracking-tight text-zinc-900 dark:text-white"
          >
            Any skill.{" "}
            <span className="italic bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              A path that actually works.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-5 text-lg max-w-xl mx-auto text-zinc-900/70 dark:text-white/70"
          >
            Tell us what you want to learn and where you&apos;re starting from.
            We compute the pacing — how many lessons fit your schedule — in
            code, then the AI builds a coherent curriculum around that budget,
            not the other way around.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-4 justify-center"
          >
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="text-base px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30"
                >
                  Go to your dashboard →
                </Button>
              </Link>
            ) : (
              <>
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <Button
                    size="lg"
                    className="text-base px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30"
                  >
                    Build your first course
                  </Button>
                </SignInButton>
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-8 py-6 border-zinc-900/20 dark:border-white/20 text-zinc-900 dark:text-white hover:border-purple-600 hover:text-purple-600 dark:hover:border-purple-400 dark:hover:text-purple-400"
                  >
                    Create account
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </section>

        {/* Interactive demo: subject switcher */}
        <section className="max-w-3xl mx-auto pb-24">
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  activeSubject === subject
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-transparent text-white"
                    : "border-zinc-900/20 dark:border-white/20 text-zinc-900 dark:text-white hover:border-purple-600 dark:hover:border-purple-400"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-zinc-900/10 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-xl shadow-purple-900/5 p-8">
            <div className="flex items-baseline justify-between border-b border-dashed border-zinc-900/20 dark:border-white/20 pb-4 mb-4">
              <div>
                <p className="font-[family-name:var(--font-display)] text-2xl text-zinc-900 dark:text-white">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeSubject}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      {activeSubject} for Beginners
                    </motion.span>
                  </AnimatePresence>
                </p>
                <p className="text-sm text-zinc-900/60 dark:text-white/60">
                  Beginner → Advanced
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-900/40 dark:text-white/40">
                /course/{activeSubject.toLowerCase()}-for-beginners
              </span>
            </div>
            <LayoutGroup>
              <ul className="space-y-3">
                {HIGHLIGHT_LIBRARY[activeSubject].map((line) => (
                  <motion.li
                    layout
                    key={line}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex gap-3 text-sm text-zinc-900/85 dark:text-white/85"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shrink-0" />
                    {line}
                  </motion.li>
                ))}
              </ul>
            </LayoutGroup>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto pb-24">
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-zinc-900/10 dark:border-white/10 bg-white/60 dark:bg-white/5 text-left hover:border-purple-600/40 dark:hover:border-purple-400/40 transition-colors"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-[family-name:var(--font-display)] text-lg mb-2 text-zinc-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-900/70 dark:text-white/70">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="max-w-3xl mx-auto text-center pb-24">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-zinc-900 dark:text-white mb-4">
            Stop guessing what lesson comes next.
          </h2>
          <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-10 py-6 text-base shadow-xl shadow-purple-900/30"
            >
              Start building →
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
