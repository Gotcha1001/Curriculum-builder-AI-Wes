// components/course-layouts/syllabus-first.tsx
//
// TRANSFORMED FROM: components/plan-layouts/executive-first.tsx
//
// "Leads with the course overview and readiness score, then flows into
// modules in order. Good default for most learners." (lib/course-layouts.ts's
// blurb for this id.) Same visual language as executive-first.tsx --
// centered header band, KPI grid, detail card, then a scrolling list of
// content blocks -- except the content blocks are modules (each an
// accordion-style card of lessons) instead of narrative prose sections.
//
// Same data source as every other course layout: lib/curriculum-data.ts's
// prepareCourseData().

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prepareCourseData, formatMinutes } from "@/lib/curriculum-data";
import { ReadinessBadge } from "../readiness-badge";
import type { CourseLayoutProps } from "./types";
import type { GeneratedModule } from "@/lib/curriculum-types";

/** Soft theme-coloured hover fill -- pure Tailwind, no extra files needed */
const CARD_HOVER: Record<string, string> = {
  neutral: "hover:bg-slate-500/10 dark:hover:bg-slate-400/15",
  "amber-classic": "hover:bg-amber-500/10 dark:hover:bg-amber-500/15",
  "ocean-blue": "hover:bg-blue-500/10 dark:hover:bg-blue-500/15",
  "blue-gradient": "hover:bg-blue-500/10 dark:hover:bg-blue-500/15",
  emerald: "hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15",
  "royal-violet": "hover:bg-violet-500/10 dark:hover:bg-violet-500/15",
  crimson: "hover:bg-rose-500/10 dark:hover:bg-rose-500/15",
  lava: "hover:bg-orange-500/10 dark:hover:bg-orange-500/15",
  "midnight-gradient": "hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15",
  "teal-breeze": "hover:bg-teal-500/10 dark:hover:bg-teal-500/15",
};

const LEVEL_PILL: Record<GeneratedModule["level"], string> = {
  beginner: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  intermediate:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  advanced:
    "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
};

function ModuleCard({
  module,
  index,
  theme,
  defaultOpen,
}: {
  module: GeneratedModule;
  index: number;
  theme: ReturnType<typeof prepareCourseData>["theme"];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const cardHover = CARD_HOVER[theme.id] ?? CARD_HOVER.neutral;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      className={`rounded-xl border transition-colors duration-200 overflow-hidden ${theme.web.border} ${cardHover}`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${LEVEL_PILL[module.level]}`}
            >
              {module.level}
            </span>
          </div>
          <p className={`font-medium mt-1 truncate ${theme.web.heading}`}>
            {module.title}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {module.lessons.length} lesson
            {module.lessons.length === 1 ? "" : "s"}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-dashed border-muted pt-3">
              {module.summary && (
                <p className="text-sm text-muted-foreground">
                  {module.summary}
                </p>
              )}
              <ol className="space-y-2.5">
                {module.lessons.map((lesson, li) => (
                  <li
                    key={lesson.key}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="mt-0.5 text-xs font-mono text-muted-foreground shrink-0 w-5">
                      {li + 1}.
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{lesson.title}</p>
                      {lesson.objectives.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {lesson.objectives.map((obj, oi) => (
                            <li
                              key={oi}
                              className="text-xs text-muted-foreground"
                            >
                              &bull; {obj}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatMinutes(lesson.estimatedMinutes)}
                        </span>
                        {lesson.exercise && (
                          <span className="inline-flex items-center gap-1">
                            <ListChecks className="h-3 w-3" />
                            {lesson.exercise.type.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function SyllabusFirstLayout({
  course,
  version,
  pdfUrl,
}: CourseLayoutProps) {
  const data = prepareCourseData(course, version);
  const {
    g,
    budget,
    readiness,
    theme,
    title,
    subject,
    description,
    startLevel,
    targetLevel,
    hoursPerWeek,
    totalModuleCount,
    totalLessonCount,
    totalEstimatedMinutes,
  } = data;

  const kpis: { label: string; value: string }[] = [
    { label: "Modules", value: String(totalModuleCount) },
    { label: "Lessons", value: String(totalLessonCount) },
    { label: "Pace", value: `${budget.totalWeeks} weeks` },
    { label: "Total time", value: formatMinutes(totalEstimatedMinutes) },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* -------- Header band -------- */}
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {subject}
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={`text-3xl font-semibold mt-1 ${theme.web.heading}`}
        >
          {title}
        </motion.h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <span
            className={`text-xs px-3 py-1 rounded-full capitalize ${theme.web.pill}`}
          >
            {startLevel} &rarr; {targetLevel}
          </span>
          {hoursPerWeek !== undefined && (
            <span
              className={`text-xs px-3 py-1 rounded-full ${theme.web.pill}`}
            >
              ~{hoursPerWeek} hrs/week
            </span>
          )}
        </div>
        {readiness && (
          <div className="mt-5">
            <ReadinessBadge readiness={readiness} showDetails={false} />
          </div>
        )}
        <div className="flex justify-center my-6">
          <a href={pdfUrl}>
            <Button className={theme.web.button}>Download syllabus PDF</Button>
          </a>
        </div>
      </div>

      {/* -------- Pace / KPI grid -------- */}
      <section className={`rounded-xl border p-4 mt-4 ${theme.web.borderSoft}`}>
        <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
          Course at a glance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className={`text-lg font-semibold ${theme.web.heading}`}>
                {kpi.value}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* -------- Readiness detail -------- */}
      {readiness &&
        (readiness.flags.length > 0 || readiness.suggestions.length > 0) && (
          <section
            className={`rounded-xl border p-4 mt-4 ${theme.web.borderSoft}`}
          >
            <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
              Readiness notes
            </h2>
            <ReadinessBadge readiness={readiness} />
          </section>
        )}

      {/* -------- Modules -------- */}
      <div className="mt-6 space-y-3">
        {g.modules.map((module, i) => (
          <ModuleCard
            key={module.key}
            module={module}
            index={i}
            theme={theme}
            defaultOpen={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
