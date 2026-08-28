// convex/courses.ts
//
// TRANSFORMED FROM: convex/businessPlans.ts (itself transformed from convex/cvs.ts)
// Same shape: upsert the raw-input draft, an action (ai.ts) generates a
// version, versions are append-only and one is "active" (used for the
// public share link + PDF/syllabus export).
//
// A "course" here is the container (topic, level range, pacing). The actual
// generated module -> lesson -> exercise tree lives inside
// courseVersions.generatedContent as structured JSON, exactly the way
// businessPlanVersions stored the 10 plan sections. Regenerating the
// curriculum (e.g. "make it more hands-on" or "add a week") appends a new
// version instead of overwriting the old one, so a learner mid-course never
// has their in-progress version silently rewritten.

import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  QueryCtx,
  MutationCtx,
} from "./_generated/server";
import { customAlphabet } from "nanoid";
import { readinessAnalysisValidator } from "./schema";
import { Id } from "./_generated/dataModel";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
  if (!user) throw new Error("User record not found — call createOrGet first");
  return user;
}

// Shared so every place that inserts a courseVersions row numbers it the
// same way — max existing versionNumber + 1, not row count (row count
// breaks once any version has been deleted).
async function nextVersionNumber(ctx: MutationCtx, courseId: Id<"courses">) {
  const last = await ctx.db
    .query("courseVersions")
    .withIndex("by_course", (q) => q.eq("courseId", courseId))
    .order("desc")
    .first();
  return (last?.versionNumber ?? 0) + 1;
}

const SKILL_LEVELS = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced"),
);

// Input fields for the course itself — the setup wizard fields. NOTE:
// style/layout are NOT here — those are per-version (see courseVersions),
// chosen at generation/restyle time, same as the business-plan app.
const courseFields = {
  title: v.string(), // e.g. "Piano for Beginners"
  subject: v.string(), // e.g. "piano", "plumbing", "python"
  description: v.optional(v.string()),
  startLevel: SKILL_LEVELS,
  targetLevel: SKILL_LEVELS,
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
};

// Create new draft, or update an existing one if courseId is passed. Does
// NOT trigger AI generation — that's a separate action call (ai.ts).
//
// preserveStatus: pass true when this call is just saving wizard fields in
// place (e.g. autosave) and should NOT knock the course back to "draft".
// Same rationale as the business-plan app's upsertPlan.
export const upsertCourse = mutation({
  args: {
    courseId: v.optional(v.id("courses")),
    preserveStatus: v.optional(v.boolean()),
    ...courseFields,
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const { courseId, preserveStatus, ...fields } = args;
    if (courseId) {
      const existing = await ctx.db.get(courseId);
      if (!existing || existing.userId !== user._id)
        throw new Error("Not found");
      await ctx.db.patch(courseId, {
        ...fields,
        updatedAt: Date.now(),
        ...(preserveStatus ? {} : { status: "draft" }),
      });
      return courseId;
    }
    return await ctx.db.insert("courses", {
      ...fields,
      userId: user._id,
      shareId: nanoid(),
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const deleteCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== user._id) throw new Error("Not found");
    const versions = await ctx.db
      .query("courseVersions")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    for (const version of versions) {
      await ctx.db.delete(version._id);
    }
    // Progress rows are keyed by course + a stable lessonKey (not a Convex
    // id, since lesson ids change every regenerated version) — clean those
    // up too so deleting a course doesn't leave orphaned progress rows.
    const progressRows = await ctx.db
      .query("progress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId),
      )
      .collect();
    for (const row of progressRows) {
      await ctx.db.delete(row._id);
    }
    await ctx.db.delete(args.courseId);
  },
});

export const listMyCourses = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return [];
    return await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== user._id) return null;
    return course;
  },
});

// Convenience for the editor/preview UI: the course plus its currently
// active version's content, joined into one object.
export const getCourseWithActiveVersion = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== user._id) return null;
    const activeVersion = course.activeVersionId
      ? await ctx.db.get(course.activeVersionId)
      : null;
    return { course, activeVersion };
  },
});

// PUBLIC — no auth check. This is what the /course/[shareId] page reads,
// for a learner following along without an account.
export const getByShareId = query({
  args: { shareId: v.string() },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_share_id", (q) => q.eq("shareId", args.shareId))
      .first();
    if (!course || course.status !== "ready" || !course.activeVersionId)
      return null;
    const activeVersion = await ctx.db.get(course.activeVersionId);
    if (!activeVersion) return null;
    return { course, activeVersion };
  },
});

// --- internal helpers used only by convex/ai.ts ---

export const _getCourseInternal = internalQuery({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => await ctx.db.get(args.courseId),
});

export const _setGenerating = internalMutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.courseId, { status: "generating" });
  },
});

// Appends a new version (AI generation/regeneration OR a style/layout-only
// change use this same path). Never overwrites a prior version; the new
// one becomes active. generatedContent holds the full module -> lesson ->
// exercise tree as structured JSON (see ai.ts for the expected shape).
export const _saveGeneratedContent = internalMutation({
  args: {
    courseId: v.id("courses"),
    generatedContent: v.any(),
    style: v.optional(v.string()),
    layout: v.optional(v.string()),
    label: v.optional(v.string()),
    readinessAnalysis: v.optional(readinessAnalysisValidator),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");
    const versionNumber = await nextVersionNumber(ctx, args.courseId);
    const versionId = await ctx.db.insert("courseVersions", {
      courseId: args.courseId,
      userId: course.userId,
      versionNumber,
      label: args.label ?? args.style ?? `Version ${versionNumber}`,
      style: args.style,
      layout: args.layout,
      generatedContent: args.generatedContent,
      readinessAnalysis: args.readinessAnalysis,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.courseId, {
      activeVersionId: versionId,
      status: "ready",
      updatedAt: Date.now(),
    });
    return versionId;
  },
});

export const _saveGenerationError = internalMutation({
  args: { courseId: v.id("courses"), error: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.courseId, {
      status: "failed",
      generationError: args.error,
    });
  },
});

// Light payload for the version history gallery — no generatedContent, so
// the list stays fast even with many versions.
export const listCourseVersions = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== user._id) throw new Error("Not found");
    const versions = await ctx.db
      .query("courseVersions")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .order("desc")
      .collect();
    return versions.map((version) => ({
      _id: version._id,
      versionNumber: version.versionNumber,
      label: version.label,
      style: version.style,
      layout: version.layout,
      readinessScore: version.readinessAnalysis?.score,
      isActive: version._id === course.activeVersionId,
      createdAt: version.createdAt,
    }));
  },
});

export const getCourseVersionContent = query({
  args: { versionId: v.id("courseVersions") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const version = await ctx.db.get(args.versionId);
    if (!version || version.userId !== user._id) throw new Error("Not found");
    return version;
  },
});

// Point the share link at a different existing version.
export const setActiveVersion = mutation({
  args: {
    courseId: v.id("courses"),
    versionId: v.id("courseVersions"),
  },
  handler: async (ctx, { courseId, versionId }) => {
    const user = await requireUser(ctx);
    const course = await ctx.db.get(courseId);
    if (!course || course.userId !== user._id) throw new Error("Not found");
    const version = await ctx.db.get(versionId);
    if (!version || version.courseId !== courseId) throw new Error("Not found");
    await ctx.db.patch(courseId, {
      activeVersionId: versionId,
      updatedAt: Date.now(),
    });
  },
});

// Permanent delete. If the deleted version was the active one, fall back
// to the newest remaining version (or clear activeVersionId if none left).
export const deleteVersion = mutation({
  args: { versionId: v.id("courseVersions") },
  handler: async (ctx, { versionId }) => {
    const user = await requireUser(ctx);
    const version = await ctx.db.get(versionId);
    if (!version || version.userId !== user._id) throw new Error("Not found");
    const course = await ctx.db.get(version.courseId);
    if (!course || course.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(versionId);
    if (course.activeVersionId === versionId) {
      const fallback = await ctx.db
        .query("courseVersions")
        .withIndex("by_course", (q) => q.eq("courseId", version.courseId))
        .order("desc")
        .first();
      await ctx.db.patch(version.courseId, {
        activeVersionId: fallback?._id,
        updatedAt: Date.now(),
      });
    }
  },
});

export const updateVersionContent = mutation({
  args: {
    versionId: v.id("courseVersions"),
    generatedContent: v.any(),
    label: v.optional(v.string()),
    style: v.optional(v.string()),
    layout: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const version = await ctx.db.get(args.versionId);
    if (!version || version.userId !== user._id) throw new Error("Not found");
    await ctx.db.patch(args.versionId, {
      generatedContent: args.generatedContent,
      ...(args.label !== undefined ? { label: args.label } : {}),
      ...(args.style !== undefined ? { style: args.style } : {}),
      ...(args.layout !== undefined ? { layout: args.layout } : {}),
      editedAt: Date.now(),
    });
  },
});

// --- learner progress (independent of versioning) ---
//
// Progress is tracked by a stable "lessonKey" string (e.g. "m2-l3") that
// lives inside generatedContent, NOT by Convex id — because regenerating a
// course creates a brand-new version with brand-new lesson objects, and we
// don't want a learner's checked-off lessons to reset every time the course
// is regenerated. lessonKey stability is the AI prompt's job (ai.ts):
// each module/lesson gets a short deterministic key when generated.

export const markLessonComplete = mutation({
  args: {
    courseId: v.id("courses"),
    lessonKey: v.string(),
    completed: v.boolean(),
    score: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query("progress")
      .withIndex("by_user_course_lesson", (q) =>
        q
          .eq("userId", user._id)
          .eq("courseId", args.courseId)
          .eq("lessonKey", args.lessonKey),
      )
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        completed: args.completed,
        completedAt: args.completed ? Date.now() : undefined,
        score: args.score,
      });
      return existing._id;
    }
    return await ctx.db.insert("progress", {
      userId: user._id,
      courseId: args.courseId,
      lessonKey: args.lessonKey,
      completed: args.completed,
      completedAt: args.completed ? Date.now() : undefined,
      score: args.score,
    });
  },
});

export const getCourseProgress = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await ctx.db
      .query("progress")
      .withIndex("by_user_course", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId),
      )
      .collect();
  },
});
