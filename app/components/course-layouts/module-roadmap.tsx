// components/course-layouts/module-roadmap.tsx
//
// REBUILT -- the source document's "module-roadmap.tsx" section had the
// wrong content pasted in (it was actually a copy of an unrelated
// investor-deck-style file). Built here from the real spec in
// lib/course-layouts.ts: "Deck-style walkthrough, one module per spread --
// good for skimming the whole path before committing."
//
// So unlike syllabus-first.tsx (accordion, all modules visible, browse-in-
// place) and cover-banner.tsx (flowing list, all expanded), this layout
// shows exactly one module at a time, paged with prev/next + dot nav --
// a "deck" you step through module by module.
//
// FIXED: the currently-displayed module was named `module`, which shadows
// Node's global `module` object -- Next.js's ESLint config flags this
// directly (no-assign-module-variable). Renamed to `currentModule`
// everywhere it's read below; `module.lessons.map((module) => ...)` never
// existed here since the map callback already used `module` from the
// outer scope for the same array, so this rename also removes an
// accidental implicit shadow-of-a-shadow that would have shown up the
// moment someone added a nested lessons map using the same name.
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prepareCourseData, formatMinutes } from "@/lib/curriculum-data";
import { ReadinessBadge } from "../readiness-badge";
import type { CourseLayoutProps } from "./types";

export function ModuleRoadmapLayout({
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
    startLevel,
    targetLevel,
    hoursPerWeek,
    totalModuleCount,
  } = data;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const modules = g.modules;
  const currentModule = modules[index];
  const atStart = index === 0;
  const atEnd = index === modules.length - 1;

  function goTo(next: number) {
    setDirection(next > index ? 1 : -1);
    setIndex(Math.max(0, Math.min(modules.length - 1, next)));
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* -------- Header -------- */}
      <div className="max-w-xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {subject}
        </p>
        <h1 className={`text-2xl font-semibold mt-1 ${theme.web.heading}`}>
          {title}
        </h1>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          <span
            className={`text-xs px-3 py-1 rounded-full capitalize ${theme.web.pill}`}
          >
            {startLevel} &rarr; {targetLevel}
          </span>
          {hoursPerWeek !== undefined && (
            <span
              className={`text-xs px-3 py-1 rounded-full ${theme.web.pill}`}
            >
              ~{hoursPerWeek} hrs/week &middot; {budget.totalWeeks} weeks
            </span>
          )}
        </div>
        {readiness && (
          <div className="mt-4">
            <ReadinessBadge readiness={readiness} showDetails={false} />
          </div>
        )}
        <div className="flex justify-center my-5">
          <a href={pdfUrl}>
            <Button className={theme.web.button}>Download syllabus PDF</Button>
          </a>
        </div>
      </div>

      {/* -------- Paging controls -------- */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={atStart}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <span className="text-xs font-mono text-muted-foreground">
          Module {index + 1} of {totalModuleCount}
        </span>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={atEnd}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* -------- Dot nav -------- */}
      <div className="flex justify-center gap-1.5 mb-6">
        {modules.map((m, i) => (
          <button
            key={m.key}
            type="button"
            aria-label={`Go to module ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index
                ? `w-6 ${theme.web.button.split(" ")[0]}`
                : "w-1.5 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* -------- Spread: one module -------- */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentModule.key}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -40 : 40 }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl border p-6 ${theme.web.borderSoft}`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${theme.web.pill}`}
              >
                {currentModule.level}
              </span>
              <span className="text-xs text-muted-foreground">
                {currentModule.lessons.length} lesson
                {currentModule.lessons.length === 1 ? "" : "s"}
              </span>
            </div>
            <h2 className={`text-xl font-semibold mt-2 ${theme.web.heading}`}>
              {currentModule.title}
            </h2>
            {currentModule.summary && (
              <p className="text-sm text-muted-foreground mt-2">
                {currentModule.summary}
              </p>
            )}
            <ol className="mt-5 space-y-3">
              {currentModule.lessons.map((lesson, li) => (
                <li key={lesson.key} className="flex items-start gap-3 text-sm">
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
