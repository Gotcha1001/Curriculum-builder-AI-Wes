// components/course-layouts/minimal-clean.tsx
//
// TRANSFORMED FROM: components/plan-layouts/minimal-clean.tsx (itself
// transformed from components/cv-layouts/minimal-ats.tsx).
//
// "Clean single-column, no decorative cards -- optimized for readability,
// printing, and getting through a skeptical reader's first pass quickly."
// (lib/course-layouts.ts's blurb for this id.) Deliberately the plainest
// option in the picker: no framer-motion, no pill-heavy header, no
// accordion -- just rule-underlined headers and flowing text/lists, same
// restraint the business-plan version had.
//
// No logoUrl / email / phone / website / address here -- courses don't
// carry that identity data (see convex/schema.ts's `courses` table), so
// the header is just subject + title + description + level/pace pills,
// no contact row and no img tag.
//
// Readiness detail intentionally stays as thin as the old viability
// section did: a one-line score, then flags only (no suggestions) --
// syllabus-first.tsx is already the "full readiness detail" option, this
// one stays minimal on purpose so the two layouts don't converge.
//
// UPDATED: swapped the lone "Download PDF" link for CourseExportMenu,
// which offers PDF + SCORM from the same trigger.
//
// UPDATED: threaded `wordUrl` through to CourseExportMenu alongside
// pdfUrl and scormUrl -- same two-line change as every other layout, now
// that CourseLayoutProps requires it.
//
// UPDATED: added LessonResourceLink under each lesson row. No color or
// className passed -- this layout doesn't use theme.web.heading for text
// anywhere (only theme.web.borderSoft, for the rule underlines), so
// threading a theme color into the link would be inventing a dependency
// this file otherwise doesn't have. Falls through to the component's own
// default (text-blue-600 / dark:text-blue-400), same as module-roadmap.tsx
// -- fits the "plainest option in the picker" brief better than a themed
// accent would.
"use client";

import { CourseExportMenu } from "../course-export-menu";
import { prepareCourseData, formatMinutes } from "@/lib/curriculum-data";

import type { CourseLayoutProps } from "./types";
import { LessonResourceLink } from "./lesson-resource-link";

export function MinimalCleanLayout({
  course,
  version,
  pdfUrl,
  scormUrl,
  wordUrl,
}: CourseLayoutProps) {
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
  } = prepareCourseData(course, version);

  const ruleClass = `border-b pb-1 mb-3 ${theme.web.borderSoft}`;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {subject}
          </p>
          <h1 className="text-2xl font-semibold mt-1">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">
              {description}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="capitalize">
              {startLevel} → {targetLevel}
            </span>
            {hoursPerWeek !== undefined && (
              <span>~{hoursPerWeek} hrs/week</span>
            )}
          </p>
        </div>
        <CourseExportMenu
          pdfUrl={pdfUrl}
          scormUrl={scormUrl}
          wordUrl={wordUrl}
        />
      </div>

      {readiness && (
        <p className="text-sm text-muted-foreground mt-5">
          Readiness score:{" "}
          <span className="font-medium text-foreground">
            {readiness.score}/100
          </span>
        </p>
      )}

      <div className="mt-6">
        <h2
          className={`text-sm font-semibold uppercase tracking-wide ${ruleClass}`}
        >
          Course details
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Modules</p>
            <p>{totalModuleCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Lessons</p>
            <p>{totalLessonCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Pace</p>
            <p>{budget.totalWeeks} weeks</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Total time</p>
            <p>{formatMinutes(totalEstimatedMinutes)}</p>
          </div>
        </div>
      </div>

      {readiness && readiness.flags.length > 0 && (
        <div className="mt-6">
          <h2
            className={`text-sm font-semibold uppercase tracking-wide ${ruleClass}`}
          >
            Flags
          </h2>
          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
            {readiness.flags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {g.modules.map((module, i) => (
        <div className="mt-6" key={module.key}>
          <h2
            className={`text-sm font-semibold uppercase tracking-wide ${ruleClass}`}
          >
            {String(i + 1).padStart(2, "0")}. {module.title}{" "}
            <span className="font-normal normal-case text-muted-foreground">
              · {module.level}
            </span>
          </h2>
          {module.summary && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              {module.summary}
            </p>
          )}
          <ol className="text-sm space-y-2">
            {module.lessons.map((lesson, li) => (
              <li key={lesson.key} className="flex items-start gap-2">
                <span className="text-xs font-mono text-muted-foreground shrink-0 w-5">
                  {li + 1}.
                </span>
                <div>
                  <p>{lesson.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMinutes(lesson.estimatedMinutes)}
                    {lesson.exercise &&
                      ` · ${lesson.exercise.type.replace("_", " ")}`}
                  </p>
                  <LessonResourceLink
                    link={version.lessonLinks?.[lesson.key]}
                  />
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
