// // lib/curriculum-pacing.ts
// //
// // TRANSFORMED FROM: lib/financial-calculations.ts (business-plan app).
// //
// // Two deterministic (code, not AI) functions, used on opposite sides of
// // the OpenRouter call in convex/ai.ts:
// //
// //   calculatePacingBudget(course)  -- BEFORE generation. Turns the wizard's
// //     hoursPerWeek + startLevel/targetLevel gap into a fixed lesson/week
// //     budget the prompt hands to the model as a constraint ("fit your
// //     module/lesson count to these numbers"), the same way
// //     calculateFinancials() handed fixed dollar figures to the business-
// //     plan prompt.
// //
// //   computeReadiness(course, content, budget) -- AFTER generation. Walks
// //     the module/lesson tree the model actually produced and scores it
// //     deterministically: level jumps with no bridge module, dangling
// //     prerequisite references, and pacing drift from the budget. This is
// //     the curriculum equivalent of computeViability() -- same "trust but
// //     verify" role, just evaluated after the AI call instead of before,
// //     since readiness depends on structure only the AI can invent.

// import type { Doc } from "../convex/_generated/dataModel";
// import {
//   SKILL_LEVEL_ORDER,
//   type GeneratedCourseContent,
//   type SkillLevel,
// } from "./curriculum-types";

// type Course = Doc<"courses">;

// export interface PacingBudget {
//   totalWeeks: number;
//   totalModules: number;
//   totalLessons: number;
//   lessonsPerWeek: number;
//   minutesPerLesson: number;
// }

// export interface ReadinessAnalysis {
//   score: number; // 0-100
//   flags: string[];
//   suggestions: string[];
// }

// // ---------------------------------------------------------------------
// // Tuning constants. All the "how many weeks does a level step take"
// // assumptions live here so they're easy to adjust without touching the
// // math below.
// // ---------------------------------------------------------------------

// /** Weeks to go from absolute zero to comfortable at one skill level. */
// const BASE_WEEKS_PER_LEVEL_STEP = 4;
// /** Minimum viable course length, even for a same-level "polish" course. */
// const MIN_TOTAL_WEEKS = 2;
// /** Minimum and maximum lesson length the pacing math will ever propose. */
// const MIN_MINUTES_PER_LESSON = 15;
// const MAX_MINUTES_PER_LESSON = 90;
// /** Default assumption when the wizard leaves hoursPerWeek blank. */
// const DEFAULT_HOURS_PER_WEEK = 3;
// /** Roughly how many lessons a learner does per hour of study time. */
// const LESSONS_PER_HOUR = 1;
// /** Modules per level band (e.g. "beginner" might span 2 modules). */
// const MODULES_PER_LEVEL_STEP = 2;

// function levelIndex(level: SkillLevel): number {
//   return SKILL_LEVEL_ORDER.indexOf(level);
// }

// /**
//  * Deterministic pacing math -- computed from the wizard's inputs BEFORE
//  * the AI is called, so the model gets a fixed budget instead of inventing
//  * its own module/lesson count (same "here are the numbers, don't
//  * hallucinate" rule calculateFinancials() enforced for money).
//  */
// export function calculatePacingBudget(course: Course): PacingBudget {
//   const hoursPerWeek = course.hoursPerWeek ?? DEFAULT_HOURS_PER_WEEK;

//   const startIdx = levelIndex(course.startLevel);
//   const targetIdx = levelIndex(course.targetLevel);
//   // Levels are meant to be startLevel <= targetLevel, but never trust
//   // wizard input blindly -- clamp instead of letting a negative gap
//   // produce a negative-week course.
//   const levelSteps = Math.max(0, targetIdx - startIdx);

//   const totalWeeks = Math.max(
//     MIN_TOTAL_WEEKS,
//     (levelSteps + 1) * BASE_WEEKS_PER_LEVEL_STEP,
//   );

//   const totalModules = Math.max(1, (levelSteps + 1) * MODULES_PER_LEVEL_STEP);

//   const totalLessons = Math.max(
//     totalModules, // never fewer lessons than modules
//     Math.round(hoursPerWeek * LESSONS_PER_HOUR * totalWeeks),
//   );

//   const lessonsPerWeek = Math.max(1, Math.round(totalLessons / totalWeeks));

//   const rawMinutesPerLesson = Math.round(
//     (hoursPerWeek * 60) / Math.max(1, lessonsPerWeek),
//   );
//   const minutesPerLesson = Math.min(
//     MAX_MINUTES_PER_LESSON,
//     Math.max(MIN_MINUTES_PER_LESSON, rawMinutesPerLesson),
//   );

//   return {
//     totalWeeks,
//     totalModules,
//     totalLessons,
//     lessonsPerWeek,
//     minutesPerLesson,
//   };
// }

// // ---------------------------------------------------------------------
// // Post-generation readiness scoring. Everything here inspects `content`
// // (what the model actually produced), not just the wizard inputs.
// // ---------------------------------------------------------------------

// /** Allowable tolerance before pacing drift gets flagged. */
// const PACING_TOLERANCE = 0.25; // 25% over/under budget is fine

// export function computeReadiness(
//   course: Course,
//   content: GeneratedCourseContent,
//   budget: PacingBudget,
// ): ReadinessAnalysis {
//   const flags: string[] = [];
//   const suggestions: string[] = [];
//   let score = 100;

//   const { modules } = content;

//   // ---- Level progression: no module should jump more than one level
//   // past the previous module without a bridge in between. ----
//   for (let i = 1; i < modules.length; i++) {
//     const prev = modules[i - 1];
//     const curr = modules[i];
//     const gap = Math.abs(levelIndex(curr.level) - levelIndex(prev.level));
//     if (gap > 1) {
//       score -= 15;
//       flags.push(
//         `Module ${i + 1} ("${curr.title}") jumps from ${prev.level} to ${curr.level} with no bridge module in between.`,
//       );
//       suggestions.push(
//         `Insert an intermediate module between "${prev.title}" and "${curr.title}" to smooth the level jump.`,
//       );
//     }
//   }

//   // ---- Boundary check: the course should actually start at startLevel
//   // and finish at targetLevel. ----
//   if (modules.length > 0 && modules[0].level !== course.startLevel) {
//     score -= 10;
//     flags.push(
//       `First module is level "${modules[0].level}", but the course starts at "${course.startLevel}".`,
//     );
//     suggestions.push(
//       `Adjust the opening module (or add one) so it matches the learner's starting level.`,
//     );
//   }
//   const lastModule = modules[modules.length - 1];
//   if (lastModule && lastModule.level !== course.targetLevel) {
//     score -= 10;
//     flags.push(
//       `Final module is level "${lastModule.level}", but the target level is "${course.targetLevel}".`,
//     );
//     suggestions.push(
//       `Add or extend a closing module so the course actually reaches "${course.targetLevel}".`,
//     );
//   }

//   // ---- Dangling prerequisites: a lesson can only depend on lesson keys
//   // that exist somewhere earlier in the generated tree. ----
//   const seenKeys = new Set<string>();
//   for (const mod of modules) {
//     for (const lesson of mod.lessons) {
//       for (const prereq of lesson.prerequisiteKeys) {
//         if (!seenKeys.has(prereq)) {
//           score -= 5;
//           flags.push(
//             `Lesson "${lesson.title}" (${lesson.key}) lists prerequisite "${prereq}", which doesn't match any earlier lesson.`,
//           );
//           suggestions.push(
//             `Remove or fix the dangling prerequisite on "${lesson.title}", or regenerate this course.`,
//           );
//         }
//       }
//       seenKeys.add(lesson.key);
//     }
//   }

//   // ---- Pacing drift: does the generated tree roughly match the budget
//   // the model was given? ----
//   const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
//   const lessonDrift =
//     budget.totalLessons > 0
//       ? Math.abs(totalLessons - budget.totalLessons) / budget.totalLessons
//       : 0;
//   if (lessonDrift > PACING_TOLERANCE) {
//     score -= 10;
//     const direction = totalLessons > budget.totalLessons ? "more" : "fewer";
//     flags.push(
//       `Generated ${totalLessons} lessons, ${direction} than the ${budget.totalLessons}-lesson budget for ${budget.totalWeeks} weeks at this pace.`,
//     );
//     suggestions.push(
//       `Regenerate with tighter pacing instructions, or adjust hoursPerWeek so the budget matches the desired lesson count.`,
//     );
//   }

//   if (modules.length === 0) {
//     score = 0;
//     flags.push("No modules were generated.");
//     suggestions.push("Regenerate the course — the AI response was empty.");
//   }

//   return {
//     score: Math.max(0, Math.min(100, score)),
//     flags,
//     suggestions,
//   };
// }

// lib/curriculum-pacing.ts
//
// TRANSFORMED FROM: lib/financial-calculations.ts (business-plan app).
//
// Three deterministic (code, not AI) functions, used around the
// per-module OpenRouter calls in convex/ai.ts:
//
//   calculatePacingBudget(course)  -- BEFORE generation. Turns the wizard's
//     hoursPerWeek + startLevel/targetLevel gap into a fixed lesson/week
//     budget, the same way calculateFinancials() handed fixed dollar
//     figures to the business-plan prompt.
//
//   planModules(course, budget)  -- BEFORE generation. Turns that budget
//     into a concrete per-module plan: how many modules, what level each
//     one is, and how many lessons it must contain. The AI is called
//     once PER MODULE and only fills in that module's content — it never
//     decides module count, level assignment, or lesson counts. This is
//     what keeps each individual AI response small regardless of how big
//     the overall course is (see convex/ai.ts's generateCourse loop).
//
//   computeReadiness(course, content, budget) -- AFTER generation. Walks
//     the module/lesson tree the model actually produced and scores it
//     deterministically: level jumps with no bridge module, dangling
//     prerequisite references, and pacing drift from the budget. This is
//     the curriculum equivalent of computeViability() -- same "trust but
//     verify" role, just evaluated after the AI calls instead of before,
//     since readiness depends on structure only the AI can invent.

import type { Doc } from "../convex/_generated/dataModel";
import {
  SKILL_LEVEL_ORDER,
  type GeneratedCourseContent,
  type SkillLevel,
} from "./curriculum-types";

type Course = Doc<"courses">;

export interface PacingBudget {
  totalWeeks: number;
  totalModules: number;
  totalLessons: number;
  lessonsPerWeek: number;
  minutesPerLesson: number;
}

export interface ReadinessAnalysis {
  score: number; // 0-100
  flags: string[];
  suggestions: string[];
}

/** One module's deterministic assignment, decided before any AI call. */
export interface ModulePlan {
  key: string;
  level: SkillLevel;
  lessonCount: number;
}

// ---------------------------------------------------------------------
// Tuning constants. All the "how many weeks does a level step take"
// assumptions live here so they're easy to adjust without touching the
// math below.
// ---------------------------------------------------------------------

/** Weeks to go from absolute zero to comfortable at one skill level. */
const BASE_WEEKS_PER_LEVEL_STEP = 4;
/** Minimum viable course length, even for a same-level "polish" course. */
const MIN_TOTAL_WEEKS = 2;
/** Minimum and maximum lesson length the pacing math will ever propose. */
const MIN_MINUTES_PER_LESSON = 15;
const MAX_MINUTES_PER_LESSON = 90;
/** Default assumption when the wizard leaves hoursPerWeek blank. */
const DEFAULT_HOURS_PER_WEEK = 3;
/** Roughly how many lessons a learner does per hour of study time. */
const LESSONS_PER_HOUR = 1;
/** Modules per level band (e.g. "beginner" might span 2 modules). */
const MODULES_PER_LEVEL_STEP = 2;

function levelIndex(level: SkillLevel): number {
  return SKILL_LEVEL_ORDER.indexOf(level);
}

/**
 * Deterministic pacing math -- computed from the wizard's inputs BEFORE
 * the AI is called, so the model gets a fixed budget instead of inventing
 * its own module/lesson count (same "here are the numbers, don't
 * hallucinate" rule calculateFinancials() enforced for money).
 */
export function calculatePacingBudget(course: Course): PacingBudget {
  const hoursPerWeek = course.hoursPerWeek ?? DEFAULT_HOURS_PER_WEEK;

  const startIdx = levelIndex(course.startLevel);
  const targetIdx = levelIndex(course.targetLevel);
  // Levels are meant to be startLevel <= targetLevel, but never trust
  // wizard input blindly -- clamp instead of letting a negative gap
  // produce a negative-week course.
  const levelSteps = Math.max(0, targetIdx - startIdx);

  const totalWeeks = Math.max(
    MIN_TOTAL_WEEKS,
    (levelSteps + 1) * BASE_WEEKS_PER_LEVEL_STEP,
  );

  const totalModules = Math.max(1, (levelSteps + 1) * MODULES_PER_LEVEL_STEP);

  const totalLessons = Math.max(
    totalModules, // never fewer lessons than modules
    Math.round(hoursPerWeek * LESSONS_PER_HOUR * totalWeeks),
  );

  const lessonsPerWeek = Math.max(1, Math.round(totalLessons / totalWeeks));

  const rawMinutesPerLesson = Math.round(
    (hoursPerWeek * 60) / Math.max(1, lessonsPerWeek),
  );
  const minutesPerLesson = Math.min(
    MAX_MINUTES_PER_LESSON,
    Math.max(MIN_MINUTES_PER_LESSON, rawMinutesPerLesson),
  );

  return {
    totalWeeks,
    totalModules,
    totalLessons,
    lessonsPerWeek,
    minutesPerLesson,
  };
}

// ---------------------------------------------------------------------
// Per-module planning. Decides, in code, exactly what each module's
// level and lesson count will be -- so the AI is never asked to invent
// module count, level assignment, or how lessons are distributed. It
// only has to fill in ONE module's title/summary/lessons per call, which
// is what keeps each individual response small regardless of total
// course size (a 6-module course and a 20-module course both only ever
// need ~8-10 lessons per AI call).
// ---------------------------------------------------------------------

export function planModules(
  course: Course,
  budget: PacingBudget,
): ModulePlan[] {
  const startIdx = levelIndex(course.startLevel);
  const targetIdx = levelIndex(course.targetLevel);
  const levelSteps = Math.max(0, targetIdx - startIdx);

  const plans: ModulePlan[] = [];
  for (let i = 0; i < budget.totalModules; i++) {
    const stepIndex = Math.min(
      Math.floor(i / MODULES_PER_LEVEL_STEP),
      levelSteps,
    );
    const level =
      SKILL_LEVEL_ORDER[
        Math.min(startIdx + stepIndex, SKILL_LEVEL_ORDER.length - 1)
      ];
    plans.push({ key: `m${i + 1}`, level, lessonCount: 0 });
  }

  // Spread totalLessons as evenly as possible across modules; earlier
  // modules absorb the remainder so no two modules differ by more than
  // one lesson.
  const base = Math.floor(budget.totalLessons / budget.totalModules);
  let remainder = budget.totalLessons - base * budget.totalModules;
  for (const p of plans) {
    p.lessonCount = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
  }

  return plans;
}

// ---------------------------------------------------------------------
// Post-generation readiness scoring. Everything here inspects `content`
// (what the model actually produced across all its per-module calls),
// not just the wizard inputs.
// ---------------------------------------------------------------------

/** Allowable tolerance before pacing drift gets flagged. */
const PACING_TOLERANCE = 0.25; // 25% over/under budget is fine

export function computeReadiness(
  course: Course,
  content: GeneratedCourseContent,
  budget: PacingBudget,
): ReadinessAnalysis {
  const flags: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  const { modules } = content;

  // ---- Level progression: no module should jump more than one level
  // past the previous module without a bridge in between. ----
  for (let i = 1; i < modules.length; i++) {
    const prev = modules[i - 1];
    const curr = modules[i];
    const gap = Math.abs(levelIndex(curr.level) - levelIndex(prev.level));
    if (gap > 1) {
      score -= 15;
      flags.push(
        `Module ${i + 1} ("${curr.title}") jumps from ${prev.level} to ${curr.level} with no bridge module in between.`,
      );
      suggestions.push(
        `Insert an intermediate module between "${prev.title}" and "${curr.title}" to smooth the level jump.`,
      );
    }
  }

  // ---- Boundary check: the course should actually start at startLevel
  // and finish at targetLevel. ----
  if (modules.length > 0 && modules[0].level !== course.startLevel) {
    score -= 10;
    flags.push(
      `First module is level "${modules[0].level}", but the course starts at "${course.startLevel}".`,
    );
    suggestions.push(
      `Adjust the opening module (or add one) so it matches the learner's starting level.`,
    );
  }
  const lastModule = modules[modules.length - 1];
  if (lastModule && lastModule.level !== course.targetLevel) {
    score -= 10;
    flags.push(
      `Final module is level "${lastModule.level}", but the target level is "${course.targetLevel}".`,
    );
    suggestions.push(
      `Add or extend a closing module so the course actually reaches "${course.targetLevel}".`,
    );
  }

  // ---- Dangling prerequisites: a lesson can only depend on lesson keys
  // that exist somewhere earlier in the generated tree. ----
  const seenKeys = new Set<string>();
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      for (const prereq of lesson.prerequisiteKeys) {
        if (!seenKeys.has(prereq)) {
          score -= 5;
          flags.push(
            `Lesson "${lesson.title}" (${lesson.key}) lists prerequisite "${prereq}", which doesn't match any earlier lesson.`,
          );
          suggestions.push(
            `Remove or fix the dangling prerequisite on "${lesson.title}", or regenerate this course.`,
          );
        }
      }
      seenKeys.add(lesson.key);
    }
  }

  // ---- Pacing drift: does the generated tree roughly match the budget
  // the model was given? ----
  const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
  const lessonDrift =
    budget.totalLessons > 0
      ? Math.abs(totalLessons - budget.totalLessons) / budget.totalLessons
      : 0;
  if (lessonDrift > PACING_TOLERANCE) {
    score -= 10;
    const direction = totalLessons > budget.totalLessons ? "more" : "fewer";
    flags.push(
      `Generated ${totalLessons} lessons, ${direction} than the ${budget.totalLessons}-lesson budget for ${budget.totalWeeks} weeks at this pace.`,
    );
    suggestions.push(
      `Regenerate with tighter pacing instructions, or adjust hoursPerWeek so the budget matches the desired lesson count.`,
    );
  }

  if (modules.length === 0) {
    score = 0;
    flags.push("No modules were generated.");
    suggestions.push("Regenerate the course — the AI response was empty.");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    flags,
    suggestions,
  };
}
