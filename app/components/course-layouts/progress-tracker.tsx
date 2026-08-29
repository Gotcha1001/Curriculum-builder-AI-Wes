// components/course-layouts/progress-tracker.tsx
//
// REBUILT -- the source document's "progress-tracker.tsx" section under
// lib/pdf-layouts/ was empty/mislabeled (it actually held an unrelated
// financial-charts.tsx), and this web component never existed at all.
// Built from lib/course-layouts.ts's real spec: "Pacing- and
// readiness-charts-forward layout -- shows time budget and completion at
// a glance."
//
// Two charts:
//   1. Budget vs. actual -- calculatePacingBudget()'s planned totalWeeks/
//      totalModules/totalLessons against what the AI actually generated
//      (totalModuleCount/totalLessonCount from prepareCourseData(), and
//      totalWeeks itself IS the budget number since nothing else produces
//      an "actual" week count -- flagged inline below).
//   2. Completion donut -- ONLY rendered when `progress` is supplied (see
//      the contract in course-layouts/types.ts). Anonymous/PDF contexts
//      fall back to a simple CTA instead of a fake 0% ring, so we're never
//      showing a number that isn't real.
//
// UPDATED: swapped the lone "Download syllabus PDF" link for
// CourseExportMenu, which offers PDF + SCORM from the same trigger.
"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CourseExportMenu } from "../course-export-menu";
import { prepareCourseData, formatMinutes } from "@/lib/curriculum-data";
import { getChartPalette } from "@/lib/chart-theme";
import { ReadinessBadge } from "../readiness-badge";
import type { CourseLayoutProps } from "./types";

export function ProgressTrackerLayout({
  course,
  version,
  pdfUrl,
  scormUrl,
  progress,
}: CourseLayoutProps) {
  const data = prepareCourseData(course, version);
  const {
    g,
    flatLessons,
    budget,
    readiness,
    theme,
    title,
    subject,
    startLevel,
    targetLevel,
    hoursPerWeek,
    totalModuleCount,
    totalLessonCount,
    totalEstimatedMinutes,
  } = data;

  const palette = getChartPalette(theme);

  // --- Budget vs. actual ---
  // NOTE: budget.totalWeeks is the plan, not an observed value -- there's
  // no "actual weeks elapsed" field anywhere in the schema yet (that would
  // need a course start date, which courses.ts doesn't track). So the
  // "weeks" bar below intentionally only shows the budgeted number; only
  // modules/lessons get a real budget-vs-actual comparison.
  const budgetChartData = [
    {
      name: "Modules",
      budgeted: budget.totalModules,
      actual: totalModuleCount,
    },
    {
      name: "Lessons",
      budgeted: budget.totalLessons,
      actual: totalLessonCount,
    },
  ];

  // --- Completion ---
  const completedKeys = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lessonKey),
  );
  const completedCount = flatLessons.filter((fl) =>
    completedKeys.has(fl.lesson.key),
  ).length;
  const hasProgress = progress !== undefined;
  const completionPct =
    totalLessonCount > 0
      ? Math.round((completedCount / totalLessonCount) * 100)
      : 0;
  const donutData = [
    { name: "Completed", value: completedCount },
    {
      name: "Remaining",
      value: Math.max(0, totalLessonCount - completedCount),
    },
  ];

  // --- Per-module completion, for the breakdown list ---
  const moduleCompletion = g.modules.map((module) => {
    const total = module.lessons.length;
    const done = module.lessons.filter((l) => completedKeys.has(l.key)).length;
    return {
      module,
      total,
      done,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* -------- Header -------- */}
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {subject}
        </p>
        <h1 className={`text-3xl font-semibold mt-1 ${theme.web.heading}`}>
          {title}
        </h1>
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
          <CourseExportMenu pdfUrl={pdfUrl} scormUrl={scormUrl} />
        </div>
      </div>

      {/* -------- Charts row -------- */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        {/* Budget vs actual */}
        <section className={`rounded-xl border p-4 ${theme.web.borderSoft}`}>
          <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
            Planned vs. generated
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetChartData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: palette.text }}
                  axisLine={{ stroke: palette.grid }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: palette.text }}
                  axisLine={{ stroke: palette.grid }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar
                  dataKey="budgeted"
                  fill={palette.secondary}
                  radius={[4, 4, 0, 0]}
                  name="Budgeted"
                />
                <Bar
                  dataKey="actual"
                  fill={palette.primary}
                  radius={[4, 4, 0, 0]}
                  name="Generated"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Budgeted at {budget.lessonsPerWeek} lessons/week &middot;{" "}
            {budget.minutesPerLesson} min/lesson over {budget.totalWeeks} weeks.
            Generated course runs {formatMinutes(totalEstimatedMinutes)} total.
          </p>
        </section>

        {/* Completion donut */}
        <section className={`rounded-xl border p-4 ${theme.web.borderSoft}`}>
          <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
            Your completion
          </h2>
          {hasProgress ? (
            <>
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      innerRadius="65%"
                      outerRadius="90%"
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      <Cell fill={palette.primary} />
                      <Cell fill={palette.grid} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={`text-2xl font-semibold ${theme.web.heading}`}
                  >
                    {completionPct}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {completedCount}/{totalLessonCount} lessons
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center gap-2">
              <p className="text-sm text-muted-foreground">
                Sign in and complete a lesson to start tracking progress here.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* -------- Per-module breakdown -------- */}
      <div className="mt-6 space-y-2">
        {moduleCompletion.map(({ module, total, done, pct }) => (
          <motion.div
            key={module.key}
            initial={{ opacity: 0, y: 4 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className={`rounded-lg border px-4 py-3 ${theme.web.borderSoft}`}
          >
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className={`text-sm font-medium ${theme.web.heading}`}>
                {module.title}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {hasProgress ? `${done}/${total} lessons` : `${total} lessons`}
              </span>
            </div>
            {hasProgress && (
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: palette.primary }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
