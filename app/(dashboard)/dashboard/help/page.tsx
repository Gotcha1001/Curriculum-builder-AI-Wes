// app/(dashboard)/dashboard/help/page.tsx
//
// TRANSFORMED FROM: app/(dashboard)/dashboard/help/page.tsx (business-plan
// version).
//
// This was flagged on the punch list as "one leftover CTA string," but
// reading the whole file showed that undersold it: every SECTIONS entry
// (Identity, Company overview, Market analysis, Operations, Financials)
// and every SETTINGS entry (Currency, Layout, Style, Logo) described the
// business-plan wizard's fields, not this app's. The page's structure
// (tagged field-by-field guide, ledger-style sections, settings grid, CTA)
// carries over untouched -- only the content data needed replacing, mapped
// against the actual course wizard fields in
// app/(dashboard)/dashboard/create/page.tsx (title, subject, description,
// startLevel/targetLevel, hoursPerWeek, learningStyle) and the actual
// per-version settings (layout, style -- no currency, no logo; courses
// have neither).

"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Stamp,
  Clock,
  LayoutTemplate,
  Palette,
  ArrowRight,
} from "lucide-react";

// -------- Motion --------
const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// -------- Tag system: every field gets exactly one --------
const LEVEL_META = {
  essential: {
    label: "Essential",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-l-emerald-500",
  },
  helpful: {
    label: "Helpful",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-l-amber-500",
  },
  skip: {
    label: "Skip it",
    dot: "bg-zinc-400",
    text: "text-zinc-500 dark:text-zinc-400",
    border: "border-l-zinc-300 dark:border-l-zinc-700",
  },
} as const;

type Level = keyof typeof LEVEL_META;

function LevelTag({ level }: { level: Level }) {
  const m = LEVEL_META[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${m.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

// -------- Content: one row per field, tagged --------
const SECTIONS: {
  name: string;
  blurb: string;
  fields: { label: string; level: Level; note: string }[];
}[] = [
  {
    name: "What you're teaching",
    blurb: "The subject, the title, and what the course actually covers.",
    fields: [
      {
        label: "Subject",
        level: "essential",
        note: 'One or two words — "piano", "plumbing", "python". This is what the AI builds the whole curriculum around.',
      },
      {
        label: "Title",
        level: "essential",
        note: 'What learners see on the share page, e.g. "Piano for Complete Beginners."',
      },
      {
        label: "Description",
        level: "helpful",
        note: 'A sentence or two on what makes this version specific — "for someone who already reads sheet music" changes the generated lessons more than you\'d expect.',
      },
    ],
  },
  {
    name: "Where you're starting, where you're headed",
    blurb: "The two levels that decide how many bridge lessons get built in.",
    fields: [
      {
        label: "Starting level",
        level: "essential",
        note: "Beginner, Intermediate, or Advanced. Be honest here — this is what keeps lesson 1 from assuming things you don't know yet.",
      },
      {
        label: "Target level",
        level: "essential",
        note: "Where you want to end up. A big jump (Beginner → Advanced) means more modules, not shakier ones — the readiness check flags any gap that's too big to bridge.",
      },
    ],
  },
  {
    name: "Pacing",
    blurb: "How much time you actually have, so the plan fits real life.",
    fields: [
      {
        label: "Hours per week",
        level: "essential",
        note: "Whatever's realistic, not aspirational. This is computed into a lesson budget before the AI writes anything — it never invents its own pacing.",
      },
      {
        label: "Learning style",
        level: "helpful",
        note: "Visual, hands-on, reading, or video. Influences how each lesson's content and exercises are framed — skip it and you get a sensible default mix.",
      },
    ],
  },
];

const SETTINGS = [
  {
    icon: LayoutTemplate,
    color: "text-sky-500",
    title: "Layout",
    body: "How the course is structured on the page — syllabus first, a module-by-module roadmap, a cover banner, minimal clean, or progress-tracker-forward. Switch it later without regenerating anything.",
  },
  {
    icon: Palette,
    color: "text-fuchsia-500",
    title: "Style",
    body: "A colour theme for the layout you picked — neutral, colour, or gradient. Purely visual, no effect on the wording.",
  },
  {
    icon: Clock,
    color: "text-amber-500",
    title: "Pacing budget",
    body: "Computed automatically from your hours-per-week and level gap — not something you set directly. Regenerate with a different hours-per-week if a course feels too packed or too sparse.",
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      {/* -------- Hero: the stamp -------- */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="text-center mb-14"
      >
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-[#12213A]/15 dark:border-[#F6F1E7]/15 px-3.5 py-1.5 mb-5"
        >
          <Stamp className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-medium tracking-wide text-[#12213A] dark:text-[#F6F1E7]">
            Field-by-field guide
          </span>
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="text-3xl md:text-4xl font-semibold text-[#12213A] dark:text-[#F6F1E7]"
        >
          Fill in what matters. Skip what doesn&apos;t.
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="text-muted-foreground mt-3 max-w-xl mx-auto"
        >
          Every field below is tagged so you know at a glance what&apos;s worth
          your time — subject, levels, and pacing are the fields that actually
          shape the curriculum, the rest is your call.
        </motion.p>
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-center gap-5 mt-6 text-xs"
        >
          {(Object.keys(LEVEL_META) as Level[]).map((l) => (
            <span key={l} className="inline-flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${LEVEL_META[l].dot}`}
              />
              <span className="text-muted-foreground">
                {LEVEL_META[l].label}
              </span>
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* -------- Sections, ledger-style -------- */}
      <div className="space-y-6">
        {SECTIONS.map((section, si) => (
          <motion.section
            key={section.name}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={container}
            className="rounded-2xl border border-[#12213A]/10 dark:border-[#F6F1E7]/10 bg-white/70 dark:bg-white/[0.03] overflow-hidden"
          >
            <motion.div
              variants={fadeUp}
              className="px-5 pt-5 pb-4 border-b border-[#12213A]/8 dark:border-[#F6F1E7]/8"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                  {String(si + 1).padStart(2, "0")}
                </span>
                <h2 className="font-medium text-[#12213A] dark:text-[#F6F1E7]">
                  {section.name}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {section.blurb}
              </p>
            </motion.div>
            <div>
              {section.fields.map((f) => (
                <motion.div
                  key={f.label}
                  variants={fadeUp}
                  whileHover={{ x: 2 }}
                  className={`flex items-start justify-between gap-4 px-5 py-3.5 border-l-2 ${LEVEL_META[f.level].border} border-b last:border-b-0 border-[#12213A]/6 dark:border-[#F6F1E7]/6`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#12213A] dark:text-[#F6F1E7]">
                      {f.label}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {f.note}
                    </p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    <LevelTag level={f.level} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      {/* -------- Layout / style / pacing -------- */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={container}
        className="mt-10"
      >
        <motion.h2
          variants={fadeUp}
          className="text-xl font-medium text-[#12213A] dark:text-[#F6F1E7] mb-4"
        >
          Layout, style & pacing
        </motion.h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SETTINGS.map(({ icon: Icon, color, title, body }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-[#12213A]/10 dark:border-[#F6F1E7]/10 bg-white/60 dark:bg-white/[0.03] p-4 flex gap-3"
            >
              <Icon className={`h-5 w-5 shrink-0 ${color}`} />
              <div>
                <p className="font-medium text-sm text-[#12213A] dark:text-[#F6F1E7]">
                  {title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">{body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* -------- CTA -------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center pt-14"
      >
        <Button asChild size="lg" className="group">
          <Link href="/dashboard/create" className="flex items-center gap-1.5">
            Start your course
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
