// app/course/[shareId]/page.tsx
//
// REPLACES: app/plan/[shareId]/page.tsx
//
// UPDATED again to fetch progress for progress-tracker.tsx. This page is
// public (proxy.ts's isPublicRoute whitelists "/course/(.*)"), so a
// visitor may or may not be signed in. getCourseProgress (convex/courses.ts)
// calls requireUser() internally and throws "Unauthorized" for anonymous
// callers -- so we only attempt the fetch when Clerk reports a session,
// and still wrap it in try/catch: the user could be signed in but simply
// have no `users` row yet (createOrGet hasn't run), which also throws.
// Either way, a failure here must never break the public page -- it just
// means layouts render without completion data, which every layout is
// required to handle (see the comment in course-layouts/types.ts).

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { CourseAnimatedView } from "@/app/components/course-preview";
import type { Doc } from "@/convex/_generated/dataModel";

export default async function PublicCoursePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  const result = await fetchQuery(api.courses.getByShareId, { shareId });

  if (!result) notFound();

  let progress: Doc<"progress">[] | undefined;

  const { userId, getToken } = await auth();
  if (userId) {
    try {
      const token = await getToken({ template: "convex" });
      if (token) {
        progress = await fetchQuery(
          api.courses.getCourseProgress,
          { courseId: result.course._id },
          { token },
        );
      }
    } catch {
      // No user row yet, no Convex JWT template configured, or any other
      // auth hiccup -- fall back to no progress rather than 500ing a
      // public share link.
      progress = undefined;
    }
  }

  return (
    <CourseAnimatedView
      course={result.course}
      version={result.activeVersion}
      progress={progress}
    />
  );
}
