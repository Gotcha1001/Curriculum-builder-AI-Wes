// app/api/course/[shareId]/export/scorm/route.ts
//
// Public counterpart to app/api/courses/[courseId]/export/scorm/route.ts.
// CourseAnimatedView (components/course-preview.tsx) is rendered both on
// the owner's private dashboard AND on the public /course/[shareId] page
// for anonymous visitors -- and its existing pdfUrl already resolves to
// `/api/course/${course.shareId}/pdf`, a shareId-keyed public route, not
// an auth-gated one. This SCORM route needs the same shape: it uses
// api.courses.getByShareId (already public, no requireUser call -- see
// convex/courses.ts) instead of getCourseWithActiveVersion, so a learner
// following a bare share link can download the SCORM package without
// ever signing in, exactly like they already can for the PDF.
//
// FIXED: Next.js 15 made route `params` a Promise -- it must be awaited
// before its properties are read. The original synchronous destructure
// (`const { shareId } = params`) silently resolved to an empty object at
// runtime, so `fetchQuery` was called with `{}` instead of `{ shareId }`,
// which Convex's validator correctly rejected.
//
// GET /api/course/:shareId/export/scorm -> downloads course.zip

import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { buildScormPackage } from "@/lib/scorm/build-package";

export const runtime = "nodejs"; // required: buildScormPackage() reads a file from disk

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> },
) {
  const { shareId } = await params;

  // No auth/token needed -- getByShareId is intentionally public and
  // already gates on course.status === "ready", same as the page itself.
  const result = await fetchQuery(api.courses.getByShareId, { shareId });

  if (!result || !result.course || !result.activeVersion) {
    return NextResponse.json(
      { error: "Course not found, or not yet ready to view" },
      { status: 404 },
    );
  }
  const { course, activeVersion } = result;

  try {
    const zipBytes = await buildScormPackage({
      courseId: course._id,
      title: course.title,
      subject: course.subject,
      style: activeVersion.style,
      generatedContent: activeVersion.generatedContent,
    });

    const filename = `${course.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-scorm.zip`;

    return new NextResponse(Buffer.from(zipBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to build SCORM package";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
