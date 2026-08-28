// convex/schema.ts
//
// TRANSFORMED FROM: businessPlans.ts's `businessPlans` / `businessPlanVersions`
// tables (itself transformed from the CV maker's `cvs` / `cvVersions`).
// Same append-only-versions pattern: `courses` holds the raw wizard inputs
// (topic, level range, pacing), `courseVersions` holds every AI-generated
// module -> lesson -> exercise tree. Nothing is overwritten — regenerating
// or restyling a course just appends a new version and re-points
// activeVersionId at it.
//
// NOTE: this replaces an earlier draft of this file that had separate
// `modules` / `lessons` / `exercises` tables as their own rows. That's a
// reasonable design too, but it doesn't match what courses.ts actually
// does — courses.ts stores the whole generated tree as one JSON blob per
// version (generatedContent), the same way businessPlans.ts stored plan
// sections. Pick one pattern; this file goes with the versioned-blob
// pattern since that's what courses.ts already assumes.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Deterministic (code-computed, not AI) health check on a specific
// generated version — mirrors viabilityAnalysisValidator from the
// business-plan app, but scores curriculum readiness/pacing instead of
// financial viability.
export const readinessAnalysisValidator = v.object({
  score: v.number(), // 0-100, code-computed from pacing/prerequisite gaps/level jumps
  flags: v.array(v.string()), // e.g. "Module 3 jumps from beginner to advanced with no bridge lesson"
  suggestions: v.array(v.string()), // e.g. "Add a review lesson before introducing chord inversions"
});

const SKILL_LEVEL = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced"),
);

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  // One row per course "project" — the setup wizard fields. The generated
  // module/lesson/exercise tree lives in courseVersions, not here.
  courses: defineTable({
    userId: v.id("users"),
    title: v.string(), // e.g. "Piano for Beginners"
    subject: v.string(), // e.g. "piano", "plumbing", "python"
    description: v.optional(v.string()),

    startLevel: SKILL_LEVEL,
    targetLevel: SKILL_LEVEL,
    hoursPerWeek: v.optional(v.number()),
    learningStyle: v.optional(
      v.array(
        v.union(
          v.literal("visual"),
          v.literal("hands_on"),
          v.literal("reading"),
          v.literal("video"),
        ),
      ),
    ),

    shareId: v.string(), // public slug: /course/[shareId]
    activeVersionId: v.optional(v.id("courseVersions")),
    status: v.union(
      v.literal("draft"),
      v.literal("generating"),
      v.literal("ready"),
      v.literal("failed"),
    ),
    generationError: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_share_id", ["shareId"]),

  // Append-only. Every regeneration AND every style/layout change on the
  // same course creates a new row here — never overwritten.
  courseVersions: defineTable({
    courseId: v.id("courses"),
    userId: v.id("users"), // denormalized so ownership checks don't need a join back
    versionNumber: v.number(),
    label: v.string(), // e.g. "Faster-paced draft", or auto "Version 3"

    style: v.optional(v.string()),
    layout: v.optional(v.string()), // one of lib/layouts.ts CourseLayoutId

    // The full generated tree, shaped like:
    // { modules: [{ key, title, level, summary, lessons: [{ key, title,
    //   objectives, content, resources, estimatedMinutes, exercises: [...] }] }] }
    // `key` fields are short, stable, AI-assigned ids (e.g. "m2-l3") used
    // by progress.lessonKey so completion survives regeneration.
    generatedContent: v.any(),
    readinessAnalysis: v.optional(readinessAnalysisValidator),

    createdAt: v.number(),
    editedAt: v.optional(v.number()),
  })
    .index("by_course", ["courseId"])
    .index("by_course_and_version", ["courseId", "versionNumber"]),

  // Learner progress, tracked independently of versioning (see the note in
  // courses.ts on why lessonKey is a string, not a lesson document id).
  progress: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    lessonKey: v.string(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    score: v.optional(v.number()),
  })
    .index("by_user_course", ["userId", "courseId"])
    .index("by_user_course_lesson", ["userId", "courseId", "lessonKey"]),
});
