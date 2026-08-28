// lib/curriculum-data.ts
//
// TRANSFORMED FROM: lib/plan-data.ts (business-plan app).
//
// Every layout component (web course page, PDF export, progress views)
// gets its data prepped exactly once here -- mirrors the role
// preparePlanData() played for plan layouts, so no layout re-derives
// `budget`, re-normalizes `generatedContent`, or drifts from another
// layout's idea of what a lesson count is.
//
// One deliberate difference from plan-data.ts's recompute-everything
// approach: `readiness` is read directly from the stored version, NOT
// recomputed here. Financials in the business-plan app were cheap to
// recompute from `plan` alone (calculateFinancials is a pure function of
// raw inputs), but readiness depends on the module/lesson tree the AI
// actually generated -- computeReadiness() already ran once, right after
// generation, inside convex/ai.ts, and its result was persisted to
// courseVersions.readinessAnalysis. Recomputing it here would just be
// redoing that same call with the same inputs for no benefit, so this
// file trusts the stored value instead.
//
// `budget`, on the other hand, IS a pure function of `course` alone (no
// AI output involved), so -- like calculateFinancials() -- it's cheap and
// safe to recompute on every render rather than trust a stored snapshot.

import type { Doc } from "@/convex/_generated/dataModel";
import { calculatePacingBudget, type PacingBudget } from "./curriculum-pacing";
import type {
  GeneratedCourseContent,
  GeneratedLesson,
  GeneratedModule,
} from "./curriculum-types";
import {
  PLAN_STYLES,
  DEFAULT_PLAN_STYLE_ID,
  type PlanStyleTheme,
} from "./styles";

type Course = Doc<"courses">;
type CourseVersion = Doc<"courseVersions">;

// Reusing the plan app's theme system as-is (it's pure cosmetics -- see
// lib/styles.ts). Aliased here so course-facing files don't read "Plan"
// in their imports.
export type CourseStyleTheme = PlanStyleTheme;

function getCourseTheme(styleId: string | undefined | null): CourseStyleTheme {
  return (
    PLAN_STYLES.find((s) => s.id === styleId) ??
    PLAN_STYLES.find((s) => s.id === DEFAULT_PLAN_STYLE_ID) ??
    PLAN_STYLES[0]
  );
}

/**
 * Narrows the untyped `version.generatedContent` down to
 * GeneratedCourseContent. Falls back to an empty module list if missing
 * or malformed, so a course stuck in "generating"/"failed" status can
 * still render a shell instead of throwing.
 */
function normalizeContent(raw: unknown): GeneratedCourseContent {
  const g = raw as Partial<GeneratedCourseContent> | null | undefined;
  const modules = Array.isArray(g?.modules)
    ? (g!.modules as GeneratedModule[])
    : [];
  return { modules };
}

/** Flat, ordered (module, lesson) pairs -- handy for anything that walks
 * lessons sequentially (PDF table of contents, "next lesson" links,
 * mapping progress.lessonKey back to a title) without re-nesting loops
 * at every call site. */
export interface FlatLesson {
  moduleIndex: number;
  lessonIndex: number;
  module: GeneratedModule;
  lesson: GeneratedLesson;
}

function flattenLessons(content: GeneratedCourseContent): FlatLesson[] {
  const flat: FlatLesson[] = [];
  content.modules.forEach((module, moduleIndex) => {
    module.lessons.forEach((lesson, lessonIndex) => {
      flat.push({ moduleIndex, lessonIndex, module, lesson });
    });
  });
  return flat;
}

export interface PreparedCourseData {
  g: GeneratedCourseContent;
  flatLessons: FlatLesson[];
  budget: PacingBudget;
  readiness: CourseVersion["readinessAnalysis"];
  theme: CourseStyleTheme;
  title: string;
  subject: string;
  description: string | undefined;
  startLevel: Course["startLevel"];
  targetLevel: Course["targetLevel"];
  hoursPerWeek: number | undefined;
  learningStyle: Course["learningStyle"];
  totalModuleCount: number;
  totalLessonCount: number;
  totalEstimatedMinutes: number;
}

export function prepareCourseData(
  course: Course,
  version: CourseVersion,
): PreparedCourseData {
  const g = normalizeContent(version.generatedContent);
  const flatLessons = flattenLessons(g);
  const budget = calculatePacingBudget(course);
  const totalEstimatedMinutes = flatLessons.reduce(
    (sum, { lesson }) => sum + (lesson.estimatedMinutes ?? 0),
    0,
  );

  return {
    g,
    flatLessons,
    budget,
    readiness: version.readinessAnalysis,
    theme: getCourseTheme(version.style),
    title: course.title,
    subject: course.subject,
    description: course.description,
    startLevel: course.startLevel,
    targetLevel: course.targetLevel,
    hoursPerWeek: course.hoursPerWeek,
    learningStyle: course.learningStyle,
    totalModuleCount: g.modules.length,
    totalLessonCount: flatLessons.length,
    totalEstimatedMinutes,
  };
}

/** Re-exported so course layout files can import money-formatting-style
 * utilities from one place, matching the pattern lib/plan-data.ts used
 * for lib/currency.ts's formatMoney(). Course content has no currency,
 * but layouts do need to render minutes as "1h 20m" etc. consistently. */
export function formatMinutes(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
