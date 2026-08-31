// convex/tavily.ts
//
// Optional, non-destructive enrichment step. Runs AFTER a course is ready:
// finds one real resource link per lesson (video/article/scripture,
// depending on subject matter) and stores them on the active version's
// lessonLinks field. Never touches generatedContent — PDF/SCORM/web
// layouts keep working identically whether this has run or not.
"use node";
import { v } from "convex/values";
import { tavily } from "@tavily/core";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import type {
  GeneratedCourseContent,
  GeneratedLesson,
} from "../lib/curriculum-types";

type ResourceType = "video" | "article" | "scripture";

const REFERENCE_SUBJECT_KEYWORDS = [
  "bible",
  "scripture",
  "theology",
  "faith",
  "gospel",
  "sermon",
  "religion",
  "spiritual",
  "homegroup",
];

// Rough book-name + chapter:verse detector — good enough to bias the query,
// doesn't need to be a real reference parser.
const SCRIPTURE_REF_REGEX =
  /\b(genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|samuel|kings|chronicles|psalms?|proverbs|isaiah|jeremiah|ezekiel|daniel|matthew|mark|luke|john|acts|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|hebrews|james|peter|revelation)\b.{0,10}\d+(:\d+(-\d+)?)?/i;

function detectResourceType(
  course: Pick<Doc<"courses">, "subject" | "title">,
  lesson: GeneratedLesson,
): ResourceType {
  const haystack =
    `${course.subject} ${lesson.title} ${lesson.content}`.toLowerCase();
  if (SCRIPTURE_REF_REGEX.test(haystack)) return "scripture";
  if (REFERENCE_SUBJECT_KEYWORDS.some((k) => haystack.includes(k)))
    return "article";
  return "video";
}

function buildLessonQuery(
  course: Pick<Doc<"courses">, "subject" | "title">,
  lesson: GeneratedLesson,
): { query: string; includeDomains?: string[]; resourceType: ResourceType } {
  const resourceType = detectResourceType(course, lesson);
  const base = `${course.subject} — ${lesson.title}`.trim();
  if (resourceType === "scripture") {
    return {
      query: `${base} bible passage text`,
      includeDomains: ["biblegateway.com", "biblehub.com"],
      resourceType,
    };
  }
  if (resourceType === "article") {
    return { query: `${base} guide article`, resourceType };
  }
  return {
    query: `${base} tutorial`,
    includeDomains: ["youtube.com"],
    resourceType,
  };
}

const CONCURRENCY = 6;

export const findLessonLinks = action({
  args: { courseId: v.id("courses") },
  returns: v.null(),
  handler: async (ctx, { courseId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { course, version } = await ctx.runQuery(
      internal.courses._getCourseForLinksAction,
      { courseId, clerkId: identity.subject },
    );

    await ctx.runMutation(internal.courses._setLinksStatus, {
      versionId: version._id,
      status: "finding",
    });

    try {
      const apiKey = process.env.TAVILY_API_KEY;
      if (!apiKey) throw new Error("TAVILY_API_KEY is not set");
      const client = tavily({ apiKey });

      const content = version.generatedContent as GeneratedCourseContent;
      const jobs = content.modules.flatMap((mod) =>
        mod.lessons.map((lesson) => ({
          lessonKey: lesson.key,
          ...buildLessonQuery(course, lesson),
        })),
      );

      const lessonLinks: Record<
        string,
        { url: string; title: string; resourceType: ResourceType }
      > = {};

      for (let i = 0; i < jobs.length; i += CONCURRENCY) {
        const batch = jobs.slice(i, i + CONCURRENCY);
        const results = await Promise.allSettled(
          batch.map((job) =>
            client.search(job.query, {
              maxResults: 3,
              includeDomains: job.includeDomains,
              searchDepth: "basic",
            }),
          ),
        );
        results.forEach((res, idx) => {
          const job = batch[idx];
          if (res.status === "fulfilled" && res.value.results.length > 0) {
            const top = res.value.results[0];
            lessonLinks[job.lessonKey] = {
              url: top.url,
              title: top.title,
              resourceType: job.resourceType,
            };
          }
          // A miss just leaves that lessonKey out of the map — course-preview
          // and exports already need to handle "no link for this lesson".
        });
      }

      await ctx.runMutation(internal.courses._saveLessonLinks, {
        versionId: version._id,
        lessonLinks,
      });
    } catch (err) {
      await ctx.runMutation(internal.courses._setLinksStatus, {
        versionId: version._id,
        status: "failed",
        error:
          err instanceof Error ? err.message : "Unknown error finding links",
      });
      throw err;
    }
    return null;
  },
});
