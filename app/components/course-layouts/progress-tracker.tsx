// // components/course-layouts/progress-tracker.tsx
// //
// // REBUILT -- the source document's "progress-tracker.tsx" section under
// // lib/pdf-layouts/ was empty/mislabeled (it actually held an unrelated
// // financial-charts.tsx), and this web component never existed at all.
// // Built from lib/course-layouts.ts's real spec: "Pacing- and
// // readiness-charts-forward layout -- shows time budget and completion at
// // a glance."
// //
// // Two charts:
// //   1. Budget vs. actual -- calculatePacingBudget()'s planned totalWeeks/
// //      totalModules/totalLessons against what the AI actually generated
// //      (totalModuleCount/totalLessonCount from prepareCourseData(), and
// //      totalWeeks itself IS the budget number since nothing else produces
// //      an "actual" week count -- flagged inline below).
// //   2. Completion donut -- ONLY rendered when `progress` is supplied (see
// //      the contract in course-layouts/types.ts). Anonymous/PDF contexts
// //      fall back to a simple CTA instead of a fake 0% ring, so we're never
// //      showing a number that isn't real.
// //
// // UPDATED: swapped the lone "Download syllabus PDF" link for
// // CourseExportMenu, which offers PDF + SCORM from the same trigger.
// "use client";

// import { motion } from "framer-motion";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { CourseExportMenu } from "../course-export-menu";
// import { prepareCourseData, formatMinutes } from "@/lib/curriculum-data";
// import { getChartPalette } from "@/lib/chart-theme";
// import { ReadinessBadge } from "../readiness-badge";
// import type { CourseLayoutProps } from "./types";

// export function ProgressTrackerLayout({
//   course,
//   version,
//   pdfUrl,
//   scormUrl,
//   progress,
// }: CourseLayoutProps) {
//   const data = prepareCourseData(course, version);
//   const {
//     g,
//     flatLessons,
//     budget,
//     readiness,
//     theme,
//     title,
//     subject,
//     startLevel,
//     targetLevel,
//     hoursPerWeek,
//     totalModuleCount,
//     totalLessonCount,
//     totalEstimatedMinutes,
//   } = data;

//   const palette = getChartPalette(theme);

//   // --- Budget vs. actual ---
//   // NOTE: budget.totalWeeks is the plan, not an observed value -- there's
//   // no "actual weeks elapsed" field anywhere in the schema yet (that would
//   // need a course start date, which courses.ts doesn't track). So the
//   // "weeks" bar below intentionally only shows the budgeted number; only
//   // modules/lessons get a real budget-vs-actual comparison.
//   const budgetChartData = [
//     {
//       name: "Modules",
//       budgeted: budget.totalModules,
//       actual: totalModuleCount,
//     },
//     {
//       name: "Lessons",
//       budgeted: budget.totalLessons,
//       actual: totalLessonCount,
//     },
//   ];

//   // --- Completion ---
//   const completedKeys = new Set(
//     (progress ?? []).filter((p) => p.completed).map((p) => p.lessonKey),
//   );
//   const completedCount = flatLessons.filter((fl) =>
//     completedKeys.has(fl.lesson.key),
//   ).length;
//   const hasProgress = progress !== undefined;
//   const completionPct =
//     totalLessonCount > 0
//       ? Math.round((completedCount / totalLessonCount) * 100)
//       : 0;
//   const donutData = [
//     { name: "Completed", value: completedCount },
//     {
//       name: "Remaining",
//       value: Math.max(0, totalLessonCount - completedCount),
//     },
//   ];

//   // --- Per-module completion, for the breakdown list ---
//   const moduleCompletion = g.modules.map((module) => {
//     const total = module.lessons.length;
//     const done = module.lessons.filter((l) => completedKeys.has(l.key)).length;
//     return {
//       module,
//       total,
//       done,
//       pct: total > 0 ? Math.round((done / total) * 100) : 0,
//     };
//   });

//   return (
//     <div className="max-w-4xl mx-auto py-10 px-4">
//       {/* -------- Header -------- */}
//       <div className="max-w-2xl mx-auto text-center">
//         <p className="text-xs uppercase tracking-widest text-muted-foreground">
//           {subject}
//         </p>
//         <h1 className={`text-3xl font-semibold mt-1 ${theme.web.heading}`}>
//           {title}
//         </h1>
//         <div className="flex flex-wrap justify-center gap-2 mt-4">
//           <span
//             className={`text-xs px-3 py-1 rounded-full capitalize ${theme.web.pill}`}
//           >
//             {startLevel} &rarr; {targetLevel}
//           </span>
//           {hoursPerWeek !== undefined && (
//             <span
//               className={`text-xs px-3 py-1 rounded-full ${theme.web.pill}`}
//             >
//               ~{hoursPerWeek} hrs/week
//             </span>
//           )}
//         </div>
//         {readiness && (
//           <div className="mt-5">
//             <ReadinessBadge readiness={readiness} showDetails={false} />
//           </div>
//         )}
//         <div className="flex justify-center my-6">
//           <CourseExportMenu pdfUrl={pdfUrl} scormUrl={scormUrl} />
//         </div>
//       </div>

//       {/* -------- Charts row -------- */}
//       <div className="grid sm:grid-cols-2 gap-4 mt-4">
//         {/* Budget vs actual */}
//         <section className={`rounded-xl border p-4 ${theme.web.borderSoft}`}>
//           <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
//             Planned vs. generated
//           </h2>
//           <div className="h-48">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={budgetChartData}>
//                 <XAxis
//                   dataKey="name"
//                   tick={{ fontSize: 11, fill: palette.text }}
//                   axisLine={{ stroke: palette.grid }}
//                   tickLine={false}
//                 />
//                 <YAxis
//                   tick={{ fontSize: 11, fill: palette.text }}
//                   axisLine={{ stroke: palette.grid }}
//                   tickLine={false}
//                   allowDecimals={false}
//                 />
//                 <Tooltip />
//                 <Bar
//                   dataKey="budgeted"
//                   fill={palette.secondary}
//                   radius={[4, 4, 0, 0]}
//                   name="Budgeted"
//                 />
//                 <Bar
//                   dataKey="actual"
//                   fill={palette.primary}
//                   radius={[4, 4, 0, 0]}
//                   name="Generated"
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//           <p className="text-xs text-muted-foreground mt-2">
//             Budgeted at {budget.lessonsPerWeek} lessons/week &middot;{" "}
//             {budget.minutesPerLesson} min/lesson over {budget.totalWeeks} weeks.
//             Generated course runs {formatMinutes(totalEstimatedMinutes)} total.
//           </p>
//         </section>

//         {/* Completion donut */}
//         <section className={`rounded-xl border p-4 ${theme.web.borderSoft}`}>
//           <h2 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
//             Your completion
//           </h2>
//           {hasProgress ? (
//             <>
//               <div className="h-48 relative">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={donutData}
//                       dataKey="value"
//                       innerRadius="65%"
//                       outerRadius="90%"
//                       startAngle={90}
//                       endAngle={-270}
//                       stroke="none"
//                     >
//                       <Cell fill={palette.primary} />
//                       <Cell fill={palette.grid} />
//                     </Pie>
//                   </PieChart>
//                 </ResponsiveContainer>
//                 <div className="absolute inset-0 flex flex-col items-center justify-center">
//                   <span
//                     className={`text-2xl font-semibold ${theme.web.heading}`}
//                   >
//                     {completionPct}%
//                   </span>
//                   <span className="text-xs text-muted-foreground">
//                     {completedCount}/{totalLessonCount} lessons
//                   </span>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className="h-48 flex flex-col items-center justify-center text-center gap-2">
//               <p className="text-sm text-muted-foreground">
//                 Sign in and complete a lesson to start tracking progress here.
//               </p>
//             </div>
//           )}
//         </section>
//       </div>

//       {/* -------- Per-module breakdown -------- */}
//       <div className="mt-6 space-y-2">
//         {moduleCompletion.map(({ module, total, done, pct }) => (
//           <motion.div
//             key={module.key}
//             initial={{ opacity: 0, y: 4 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.3 }}
//             className={`rounded-lg border px-4 py-3 ${theme.web.borderSoft}`}
//           >
//             <div className="flex items-center justify-between gap-3 mb-1.5">
//               <span className={`text-sm font-medium ${theme.web.heading}`}>
//                 {module.title}
//               </span>
//               <span className="text-xs text-muted-foreground shrink-0">
//                 {hasProgress ? `${done}/${total} lessons` : `${total} lessons`}
//               </span>
//             </div>
//             {hasProgress && (
//               <div className="h-1.5 rounded-full bg-muted overflow-hidden">
//                 <div
//                   className="h-full rounded-full"
//                   style={{ width: `${pct}%`, backgroundColor: palette.primary }}
//                 />
//               </div>
//             )}
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }

// components/course-layouts/progress-tracker.tsx
//
// UPDATED: the module breakdown used to be module-level only — a title,
// a "3/8 lessons" count, and a bar, with no way to see or mark individual
// lessons. This rebuild adds:
//   1. An expandable lesson list under each module (title, estimated
//      minutes, objective count, and a completion checkbox).
//   2. Wiring to convex/courses.ts's markLessonComplete mutation, which
//      existed already but nothing in the UI ever called it.
//   3. Local optimistic state for completion, since `progress` arrives as
//      a one-time prop from a server-side fetchQuery (see
//      app/course/[shareId]/page.tsx) rather than a live useQuery — so a
//      checkbox click needs to update local state immediately rather than
//      waiting on a prop that will never itself refresh.
//
// Checkboxes only render when `hasProgress` is true (progress !== undefined
// — i.e. the visitor is signed in and the fetch succeeded), same gate the
// donut already used. Anonymous visitors still see full lesson lists (title,
// minutes, objectives) — everyone gets the content, only completion tracking
// requires an account, matching the CTA copy below the donut.
// components/course-layouts/progress-tracker.tsx
//
// UPDATED: the module breakdown used to be module-level only — a title,
// a "3/8 lessons" count, and a bar, with no way to see or mark individual
// lessons. This rebuild adds:
//   1. An expandable lesson list under each module (title, estimated
//      minutes, objective count, and a completion checkbox).
//   2. Wiring to convex/courses.ts's markLessonComplete mutation, which
//      existed already but nothing in the UI ever called it.
//   3. Local optimistic state for completion, since `progress` arrives as
//      a one-time prop from a server-side fetchQuery (see
//      app/course/[shareId]/page.tsx) rather than a live useQuery — so a
//      checkbox click needs to update local state immediately rather than
//      waiting on a prop that will never itself refresh.
//
// Checkboxes only render when `hasProgress` is true (progress !== undefined
// — i.e. the visitor is signed in and the fetch succeeded), same gate the
// donut already used. Anonymous visitors still see full lesson lists (title,
// minutes, objectives) — everyone gets the content, only completion tracking
// requires an account, matching the CTA copy below the donut.
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
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
import { api } from "@/convex/_generated/api";
import { CourseExportMenu } from "../course-export-menu";
import { prepareCourseData, formatMinutes } from "@/lib/curriculum-data";
import { getChartPalette } from "@/lib/chart-theme";
import { ReadinessBadge } from "../readiness-badge";
import type { CourseLayoutProps } from "./types";
import { LessonResourceLink } from "./lesson-resource-link";

// UPDATED: threaded `wordUrl` through to CourseExportMenu alongside pdfUrl
// and scormUrl -- same two-line change as every other layout, now that
// CourseLayoutProps requires it.
export function ProgressTrackerLayout({
  course,
  version,
  pdfUrl,
  scormUrl,
  wordUrl,
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
  const markComplete = useMutation(api.courses.markLessonComplete);

  const hasProgress = progress !== undefined;

  // Local, optimistic completion set — see file header for why this can't
  // just read `progress` reactively. Re-seeded whenever the course or the
  // server-fetched progress snapshot changes (e.g. navigating between
  // courses without a full page reload).
  //
  // This re-seeds during render rather than in a useEffect — the "adjusting
  // state when a prop changes" pattern React's own docs recommend
  // (https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  // An effect-based setState here would commit the stale set, paint it, then
  // immediately re-render with the correct one — a visible flicker on every
  // course navigation. Comparing + setState during render short-circuits
  // that: React discards the in-progress render and re-runs immediately,
  // before anything is painted.
  function seedFromProgress() {
    return new Set(
      (progress ?? []).filter((p) => p.completed).map((p) => p.lessonKey),
    );
  }
  const [seed, setSeed] = useState({ courseId: course._id, progress });
  const [completedKeys, setCompletedKeys] =
    useState<Set<string>>(seedFromProgress);
  if (seed.courseId !== course._id || seed.progress !== progress) {
    setSeed({ courseId: course._id, progress });
    setCompletedKeys(seedFromProgress());
  }

  // Which modules currently show their lesson list. Default: first module
  // open, rest collapsed — keeps a long course scannable on load.
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(g.modules.length > 0 ? [g.modules[0].key] : []),
  );
  function toggleModule(key: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function toggleLesson(lessonKey: string, next: boolean) {
    // Optimistic update first — the checkbox should feel instant.
    setCompletedKeys((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(lessonKey);
      else copy.delete(lessonKey);
      return copy;
    });
    try {
      await markComplete({ courseId: course._id, lessonKey, completed: next });
    } catch {
      // Revert on failure (e.g. session expired mid-session) and let the
      // visitor know, rather than silently leaving a wrong checkbox state.
      setCompletedKeys((prev) => {
        const copy = new Set(prev);
        if (next) copy.delete(lessonKey);
        else copy.add(lessonKey);
        return copy;
      });
      toast.error("Couldn't save progress — try again.");
    }
  }

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
  const completedCount = flatLessons.filter((fl) =>
    completedKeys.has(fl.lesson.key),
  ).length;
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
          <span className={`text-xs px-3 py-1 rounded-full ${theme.web.pill}`}>
            {budget.totalWeeks} weeks
          </span>
        </div>
        {readiness && (
          <div className="mt-5">
            <ReadinessBadge readiness={readiness} showDetails={false} />
          </div>
        )}
        <div className="flex justify-center my-6">
          <CourseExportMenu
            pdfUrl={pdfUrl}
            scormUrl={scormUrl}
            wordUrl={wordUrl}
          />
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
                <span className={`text-2xl font-semibold ${theme.web.heading}`}>
                  {completionPct}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {completedCount}/{totalLessonCount} lessons
                </span>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center gap-2">
              <p className="text-sm text-muted-foreground">
                Sign in and complete a lesson to start tracking progress here.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* -------- Per-module breakdown, now with lessons -------- */}
      <div className="mt-6 space-y-2">
        {moduleCompletion.map(({ module, total, done, pct }) => {
          const isOpen = expandedModules.has(module.key);
          return (
            <motion.div
              key={module.key}
              initial={{ opacity: 0, y: 4 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className={`rounded-lg border ${theme.web.borderSoft} overflow-hidden`}
            >
              <button
                type="button"
                onClick={() => toggleModule(module.key)}
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
                aria-expanded={isOpen}
              >
                <div className="min-w-0">
                  <span className={`text-sm font-medium ${theme.web.heading}`}>
                    {module.title}
                  </span>
                  {module.summary && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {module.summary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {hasProgress
                      ? `${done}/${total} lessons`
                      : `${total} lessons`}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {hasProgress && (
                <div className="h-1.5 bg-muted overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: palette.primary,
                    }}
                  />
                </div>
              )}

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className={`divide-y ${theme.web.borderSoft} border-t`}>
                      {module.lessons.map((lesson) => {
                        const isDone = completedKeys.has(lesson.key);
                        return (
                          <li
                            key={lesson.key}
                            className="px-4 py-2.5 flex items-start gap-3"
                          >
                            {hasProgress ? (
                              <button
                                type="button"
                                onClick={() =>
                                  toggleLesson(lesson.key, !isDone)
                                }
                                aria-pressed={isDone}
                                aria-label={
                                  isDone
                                    ? `Mark "${lesson.title}" as not done`
                                    : `Mark "${lesson.title}" as done`
                                }
                                className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                                  isDone
                                    ? "border-transparent"
                                    : "border-muted-foreground/40 hover:border-muted-foreground"
                                }`}
                                style={
                                  isDone
                                    ? { backgroundColor: palette.primary }
                                    : undefined
                                }
                              >
                                {isDone && (
                                  <Check
                                    className="h-3 w-3 text-white"
                                    strokeWidth={3}
                                  />
                                )}
                              </button>
                            ) : (
                              <span className="mt-0.5 h-4 w-4 shrink-0" />
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <span
                                  className={`text-sm ${
                                    isDone
                                      ? "text-muted-foreground line-through"
                                      : theme.web.heading
                                  }`}
                                >
                                  {lesson.title}
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {formatMinutes(lesson.estimatedMinutes)}
                                </span>
                              </div>
                              {lesson.objectives.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {lesson.objectives.join(" · ")}
                                </p>
                              )}
                              <LessonResourceLink
                                link={version.lessonLinks?.[lesson.key]}
                                color={palette.primary}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
