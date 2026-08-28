// components/course-layouts/cover-banner.tsx
//
// BUILT FROM SCRATCH -- this file never existed in the source document
// (components/course-preview.tsx already imports it, but no content was
// ever provided for it). Modeled on its PDF twin, lib/pdf-layouts/cover-banner.tsx
// ("a solid full-bleed accent-colored banner -- logo, name, tagline, contact
// row, viability pill -- up top... followed by a flowing single column"),
// translated to a web/Tailwind hero instead of a print page, and to course
// fields (subject/levels/readiness) instead of business identity fields.
//
// Deliberately visually distinct from syllabus-first.tsx: that layout is a
// centered header + collapsible accordion modules. This one is a bold,
// full-width colored hero + an always-expanded flowing module list with a
// left accent border, so the two options in the layout picker actually feel
// different rather than being the same layout with a different name.
"use client";

import { motion } from "framer-motion";
import { Clock, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prepareCourseData, formatMinutes } from "@/lib/curriculum-data";
import { ReadinessBadge } from "../readiness-badge";
import type { CourseLayoutProps } from "./types";

const LEVEL_PILL_ON_BANNER =
  "text-xs px-3 py-1 rounded-full capitalize bg-white/15 text-white backdrop-blur-sm";

export function CoverBannerLayout({
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
    <div className="max-w-4xl mx-auto">
      {/* -------- Full-bleed hero banner -------- */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`w-full rounded-b-2xl px-6 py-12 text-center ${theme.web.button}`}
      >
        <p className="text-xs uppercase tracking-widest text-white/80">
          {subject}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold mt-1 text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-white/85 mt-2 max-w-xl mx-auto">
            {description}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <span className={LEVEL_PILL_ON_BANNER}>
            {startLevel} &rarr; {targetLevel}
          </span>
          {hoursPerWeek !== undefined && (
            <span className={LEVEL_PILL_ON_BANNER}>
              ~{hoursPerWeek} hrs/week
            </span>
          )}
        </div>
        {readiness && (
          <div className="mt-5 flex justify-center [&_*]:!text-white">
            <ReadinessBadge readiness={readiness} showDetails={false} />
          </div>
        )}
        <div className="flex justify-center mt-6">
          <a href={pdfUrl}>
            <Button variant="secondary">Download syllabus PDF</Button>
          </a>
        </div>
      </motion.div>

      <div className="px-4">
        {/* -------- KPI strip -------- */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 -mt-6 mb-2 relative">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              className={`rounded-xl border bg-background p-3 text-center shadow-sm ${theme.web.borderSoft}`}
            >
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className={`text-lg font-semibold ${theme.web.heading}`}>
                {kpi.value}
              </p>
            </motion.div>
          ))}
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

        {/* -------- Modules: flowing, always-expanded, left accent border -------- */}
        <div className="mt-6 space-y-6 pb-12">
          {g.modules.map((module, index) => (
            <motion.div
              key={module.key}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
              className={`border-l-4 pl-4 ${theme.web.border}`}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={`font-semibold ${theme.web.heading}`}>
                  {module.title}
                </h3>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${theme.web.pill}`}
                >
                  {module.level}
                </span>
              </div>
              {module.summary && (
                <p className="text-sm text-muted-foreground mt-1">
                  {module.summary}
                </p>
              )}
              <ol className="mt-3 space-y-2">
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
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
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
          ))}
        </div>
      </div>
    </div>
  );
}
