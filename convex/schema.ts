import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    title: v.string(),
    subject: v.string(),
    description: v.optional(v.string()),

    startLevel: SKILL_LEVEL,
    targetLevel: SKILL_LEVEL,
    hoursPerWeek: v.optional(v.number()),
    // Optional learner-chosen course length in weeks. When unset,
    // calculatePacingBudget() derives totalWeeks from
    // BASE_WEEKS_PER_LEVEL_STEP * level steps, same as before this
    // field existed — so this is purely additive, no migration needed
    // for existing rows.
    weeks: v.optional(v.number()),
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

    shareId: v.string(),
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
    userId: v.id("users"),
    versionNumber: v.number(),
    label: v.string(),
    style: v.optional(v.string()),
    layout: v.optional(v.string()),
    generatedContent: v.any(),
    readinessAnalysis: v.optional(readinessAnalysisValidator),
    createdAt: v.number(),
    editedAt: v.optional(v.number()),

    // --- new: Tavily-sourced lesson resources, keyed by lesson.key (e.g. "m2-l3") ---
    // Populated by the "Find links" button — never overwrites generatedContent itself,
    // so PDF/SCORM/web layouts render the same course either way, with or without links.
    lessonLinks: v.optional(
      v.record(
        v.string(),
        v.object({
          url: v.string(),
          title: v.string(),
          resourceType: v.union(
            v.literal("video"),
            v.literal("article"),
            v.literal("scripture"),
          ),
        }),
      ),
    ),
    linksStatus: v.optional(
      v.union(
        v.literal("idle"),
        v.literal("finding"),
        v.literal("ready"),
        v.literal("failed"),
      ),
    ),
    linksError: v.optional(v.string()),
    linksUpdatedAt: v.optional(v.number()),
  })
    .index("by_course", ["courseId"])
    .index("by_course_and_version", ["courseId", "versionNumber"]),

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
