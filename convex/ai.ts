// convex/ai.ts
//
// PER-MODULE GENERATION. Previously this file asked the model to produce
// the ENTIRE course (all modules + all lessons) as one JSON blob in a
// single completion. That's what was causing:
//   "AI response was truncated (hit the 8192-token limit) before
//    completing the JSON. Budget was 48 lessons across 6 modules ..."
// A 48-lesson course is easily 10,000+ tokens of JSON -- no reasonable
// MODEL_MAX_OUTPUT_TOKENS bump fixes that in general, it just moves the
// ceiling. The fix is structural, not a bigger number.
//
// curriculum-pacing.ts already computes each module's level and lesson
// count deterministically via planModules() -- that plan was sitting
// unused. This file now calls the model ONCE PER MODULE, so a single
// completion only ever has to produce ~8-10 lessons' worth of JSON
// regardless of how large the whole course is. Readiness is still
// computed once, after all modules are assembled.
//
// Depends on:
//   lib/curriculum-pacing.ts  -> calculatePacingBudget(course),
//                                 planModules(course, budget),
//                                 computeReadiness(course, content, budget)
//   lib/curriculum-types.ts   -> GeneratedCourseContent, GeneratedModule, GeneratedLesson,
//                                 GeneratedExercise, ExerciseType, SkillLevel

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
  calculatePacingBudget,
  computeReadiness,
  planModules,
  type PacingBudget,
  type ModulePlan,
} from "../lib/curriculum-pacing";
import type {
  GeneratedCourseContent,
  GeneratedModule,
  GeneratedLesson,
  GeneratedExercise,
  ExerciseType,
  SkillLevel,
} from "../lib/curriculum-types";

type Course = Doc<"courses">;

// ---------------------------------------------------------------------
// Prompt construction. ONE MODULE per prompt. The module's key, level,
// and lesson count are all decided in code by planModules() and handed
// to the model as fixed spec -- it only fills in title/summary/lesson
// content for that one module, it doesn't decide structure.
// ---------------------------------------------------------------------

const list = (items: string[] | undefined) =>
  items && items.length > 0
    ? items.map((i) => `- ${i}`).join("\n")
    : "(none specified)";

function buildModulePrompt(
  course: Course,
  budget: PacingBudget,
  plan: ModulePlan,
  moduleIndex: number,
  totalModules: number,
  previousModule?: { title: string; summary: string },
): string {
  const {
    title,
    subject,
    description,
    startLevel,
    targetLevel,
    hoursPerWeek,
    learningStyle,
  } = course;

  return `You are designing ONE module of a larger self-paced curriculum. Output ONLY
that module as JSON, not the whole course. Do not write full lesson scripts
or long-form content; each lesson's "content" field should be a concise
outline (3-6 bullet-style sentences of what it covers), not a finished
write-up.

THIS MODULE'S SPEC IS FIXED -- do not exceed it:
Position: module ${moduleIndex + 1} of ${totalModules}
Module level: ${plan.level}
Number of lessons in this module: exactly ${plan.lessonCount}
Target minutes per lesson: around ${budget.minutesPerLesson}

(The lesson count and level were computed deterministically from the
learner's ${hoursPerWeek ?? 3} hours/week budget and the ${startLevel} ->
${targetLevel} level gap across all ${totalModules} modules of this course.
Produce exactly ${plan.lessonCount} lessons for this module -- not more,
not fewer.)

${
  previousModule
    ? `The previous module was "${previousModule.title}" (${previousModule.summary}). Build on it and avoid repeating its content.`
    : "This is the first module of the course."
}

STABLE KEYS: give every lesson in this module a "key" like "l1", "l2", ...
in order, starting at 1. (The module's own key is assigned outside this
call, don't include it.) Each lesson after the first may list
prerequisiteKeys referencing earlier lesson keys WITHIN THIS MODULE ONLY
(e.g. "l1") -- never reference a lesson from another module, since those
keys aren't visible to you here.

Respond with ONLY a JSON object matching this shape:
{
  "title": string,
  "level": "beginner" | "intermediate" | "advanced",
  "summary": string,
  "lessons": [
    {
      "key": string,
      "title": string,
      "objectives": string[],
      "content": string,
      "estimatedMinutes": number,
      "prerequisiteKeys": string[],
      "exercise": {
        "type": "quiz" | "practice_task" | "checklist",
        "prompt": string,
        "items": string[]
      }
    }
  ]
}

=== COURSE CONTEXT ===
Title: ${title}
Subject: ${subject}
Description: ${description ?? "n/a"}
Starting level: ${startLevel}
Target level: ${targetLevel}
Hours available per week: ${hoursPerWeek ?? "n/a"}
Preferred learning styles:
${list(learningStyle)}
`;
}

// ---------------------------------------------------------------------
// Token budgeting -- per module now, not per course. A single module
// tops out around 8-10 lessons, so even at the old
// ESTIMATED_TOKENS_PER_LESSON this stays comfortably under the model's
// 8192-token ceiling regardless of how many modules the course has.
// ---------------------------------------------------------------------

const MODEL_MAX_OUTPUT_TOKENS = 8192; // bump this if your OpenRouter route supports more

// A per-module call is already capped at ~8-10 lessons by planModules(),
// so there's no real cost benefit to estimating a tighter max_tokens per
// call -- and a too-tight estimate is exactly what caused truncation at
// 2320 tokens (vs. the real 8192 ceiling): lesson JSON with objectives[],
// prose content, and a nested exercise object routinely runs 350-500+
// tokens, well above the old 220/lesson estimate. Just request the full
// ceiling every time.
function estimateModuleMaxTokens(_plan: ModulePlan): number {
  return MODEL_MAX_OUTPUT_TOKENS;
}

// ---------------------------------------------------------------------
// Parsing. Same philosophy as before: JSON.parse's result is only
// `unknown`, every field is narrowed with an explicit runtime check
// before use, and stable keys are re-derived in code rather than
// trusted from the model. The one change: parseModule() now parses a
// SINGLE module object (what each per-module call returns) instead of
// walking a top-level {modules: [...]} array.
// ---------------------------------------------------------------------

const SKILL_LEVELS: SkillLevel[] = ["beginner", "intermediate", "advanced"];
const EXERCISE_TYPES: ExerciseType[] = ["quiz", "practice_task", "checklist"];

function isSkillLevel(value: unknown): value is SkillLevel {
  return (
    typeof value === "string" && SKILL_LEVELS.includes(value as SkillLevel)
  );
}

function isExerciseType(value: unknown): value is ExerciseType {
  return (
    typeof value === "string" && EXERCISE_TYPES.includes(value as ExerciseType)
  );
}

/** Narrows an `unknown[]` down to `string[]`, dropping any non-string entries
 * rather than throwing -- the model occasionally emits a stray number or
 * null in an otherwise-fine array, and that's not worth failing the whole
 * generation over. */
function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

interface RawExercise {
  type?: unknown;
  prompt?: unknown;
  items?: unknown;
}

interface RawLesson {
  title?: unknown;
  objectives?: unknown;
  content?: unknown;
  estimatedMinutes?: unknown;
  prerequisiteKeys?: unknown;
  exercise?: unknown;
}

interface RawModule {
  title?: unknown;
  level?: unknown;
  summary?: unknown;
  lessons?: unknown;
}

function parseExercise(raw: unknown): GeneratedExercise | undefined {
  if (raw === null || typeof raw !== "object") return undefined;

  const { type, prompt, items } = raw as RawExercise;

  if (typeof prompt !== "string") return undefined;

  return {
    type: isExerciseType(type) ? type : "practice_task",
    prompt,
    items: toStringArray(items),
  };
}

function parseLesson(
  raw: unknown,
  lessonKey: string,
  moduleKey: string,
): GeneratedLesson {
  if (raw === null || typeof raw !== "object") {
    throw new Error(`Lesson ${lessonKey} is not an object`);
  }

  const {
    title,
    objectives,
    content,
    estimatedMinutes,
    prerequisiteKeys,
    exercise,
  } = raw as RawLesson;

  if (typeof title !== "string") {
    throw new Error(`Lesson ${lessonKey} missing title`);
  }

  if (typeof content !== "string") {
    throw new Error(`Lesson ${lessonKey} missing content`);
  }

  // The model only ever sees its own module and, per the prompt, emits
  // bare prerequisite keys scoped to that module (e.g. "l1"). Every
  // lesson key we actually persist is module-prefixed (e.g. "m1-l1"),
  // so prerequisites have to be re-keyed with that same prefix here --
  // otherwise computeReadiness() compares "m1-l1" against "l1" and
  // every prerequisite in every module comes back as dangling. Guard
  // against double-prefixing in case a model ever echoes back an
  // already-qualified key.
  const modulePrefix = `${moduleKey}-`;
  const scopedPrerequisiteKeys = toStringArray(prerequisiteKeys).map((key) =>
    key.startsWith(modulePrefix) ? key : `${modulePrefix}${key}`,
  );

  return {
    key: lessonKey,
    title,
    objectives: toStringArray(objectives),
    content,
    estimatedMinutes:
      typeof estimatedMinutes === "number" ? estimatedMinutes : 30,
    prerequisiteKeys: scopedPrerequisiteKeys,
    exercise: parseExercise(exercise),
  };
}

function parseModule(
  raw: unknown,
  moduleKey: string,
  forcedLevel: SkillLevel,
): GeneratedModule {
  if (raw === null || typeof raw !== "object") {
    throw new Error(`Module ${moduleKey} is not an object`);
  }

  const { title, level, summary, lessons } = raw as RawModule;

  if (typeof title !== "string") {
    throw new Error(`Module ${moduleKey} missing title`);
  }

  if (!Array.isArray(lessons) || lessons.length === 0) {
    throw new Error(`Module ${moduleKey} has no lessons`);
  }

  // The module's level is decided deterministically by planModules()
  // BEFORE generation, same as its key -- it isn't something the model
  // gets to invent. We still sanity-check what came back (helps catch a
  // prompt that's confusing the model) but the persisted value is
  // always forcedLevel, never the model's opinion.
  if (level !== undefined && !isSkillLevel(level)) {
    throw new Error(
      `Module ${moduleKey} returned an invalid level: ${String(level)}`,
    );
  }

  return {
    key: moduleKey,
    title,
    level: forcedLevel,
    summary: typeof summary === "string" ? summary : "",
    lessons: lessons.map((rawLesson, lIndex) =>
      parseLesson(rawLesson, `${moduleKey}-l${lIndex + 1}`, moduleKey),
    ),
  };
}

function parseRawModuleJson(raw: string, moduleKey: string): unknown {
  // Models sometimes wrap JSON in ```json fences despite instructions --
  // strip those before parsing rather than failing the whole generation.
  const cleaned = raw.replace(/```json\s*|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // A bare JSON.parse failure gives you nothing to debug with. Surface
    // the parse error plus enough of the raw text to tell truncation
    // (cuts off mid-object/mid-string) apart from a genuinely malformed
    // response (extra prose, wrong shape, etc).
    const message = e instanceof Error ? e.message : "unknown parse error";
    const preview =
      cleaned.length > 300
        ? `${cleaned.slice(0, 150)} ... ${cleaned.slice(-150)}`
        : cleaned;

    throw new Error(
      `Failed to parse AI response for module ${moduleKey} as JSON (${message}). ` +
        `Response length: ${cleaned.length} chars. Content preview: ${preview || "(empty)"}`,
    );
  }
}

// ---------------------------------------------------------------------
// Model call. Extracted so it's shared by every per-module call instead
// of duplicated inline. Truncation and empty-response checks now report
// WHICH module failed, since a course generation is many calls now, not
// one.
// ---------------------------------------------------------------------

async function callModelForModule(
  apiKey: string,
  prompt: string,
  maxTokens: number,
  moduleKey: string,
): Promise<string> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "https://localhost",
        "X-Title": "Curriculum Builder AI",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `AI provider error (${response.status}) generating module ${moduleKey}: ${errText}`,
    );
  }

  const data = (await response.json()) as {
    choices: { message: { content: string }; finish_reason?: string }[];
  };

  const choice = data.choices?.[0];

  if (choice?.finish_reason === "length") {
    throw new Error(
      `AI response for module ${moduleKey} was truncated (hit the ${maxTokens}-token limit) before ` +
        `completing the JSON. If a single module is still hitting this, increase ` +
        `ESTIMATED_TOKENS_PER_LESSON or MODEL_MAX_OUTPUT_TOKENS in ai.ts -- the per-module lesson ` +
        `count itself is fixed by planModules() and won't shrink on retry.`,
    );
  }

  const text = choice?.message?.content?.trim() ?? "";

  if (!text) {
    throw new Error(
      `AI provider returned an empty response for module ${moduleKey} (no content in choices[0].message)`,
    );
  }

  return text;
}

// ---------------------------------------------------------------------
// Action entrypoint.
// ---------------------------------------------------------------------

export const generateCourse = action({
  args: {
    courseId: v.id("courses"),
    style: v.optional(v.string()),
    layout: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { courseId, style, layout }) => {
    const course = await ctx.runQuery(internal.courses._getCourseInternal, {
      courseId,
    });

    if (!course) {
      throw new Error("Course not found");
    }

    await ctx.runMutation(internal.courses._setGenerating, { courseId });

    try {
      // Deterministic pacing + module planning first -- the model never
      // decides module count, lesson count, or level assignment; it only
      // fills in ONE module's title/summary/lesson content per call.
      const budget = calculatePacingBudget(course);
      const modulePlans = planModules(course, budget);

      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

      const modules: GeneratedModule[] = [];
      let previous: { title: string; summary: string } | undefined;

      for (let i = 0; i < modulePlans.length; i++) {
        const plan = modulePlans[i];
        const prompt = buildModulePrompt(
          course,
          budget,
          plan,
          i,
          modulePlans.length,
          previous,
        );
        const maxTokens = estimateModuleMaxTokens(plan);
        const text = await callModelForModule(
          apiKey,
          prompt,
          maxTokens,
          plan.key,
        );
        const rawModule = parseRawModuleJson(text, plan.key);
        const parsedModule = parseModule(rawModule, plan.key, plan.level);

        modules.push(parsedModule);
        previous = { title: parsedModule.title, summary: parsedModule.summary };
      }

      const generatedContent: GeneratedCourseContent = { modules };

      // Readiness is computed AFTER generation -- it inspects the actual
      // module/lesson tree that came back (level jumps, pacing vs.
      // budget, dangling prerequisites), not just the wizard inputs.
      const readiness = computeReadiness(course, generatedContent, budget);

      await ctx.runMutation(internal.courses._saveGeneratedContent, {
        courseId,
        generatedContent,
        readinessAnalysis: readiness,
        style,
        layout,
      });
    } catch (err) {
      await ctx.runMutation(internal.courses._saveGenerationError, {
        courseId,
        error: err instanceof Error ? err.message : "Unknown generation error",
      });
      throw err;
    }

    return null;
  },
});
