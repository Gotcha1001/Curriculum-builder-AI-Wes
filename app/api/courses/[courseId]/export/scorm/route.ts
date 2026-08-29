// app/api/courses/[courseId]/export/scorm/route.ts
//
// GET /api/courses/:courseId/export/scorm -> downloads course.zip
//
// Uses api.courses.getCourseWithActiveVersion, the same joined
// (course, activeVersion) shape the editor/preview UI reads — so this
// exports whatever version is currently "active" (pointed at by
// course.activeVersionId), matching what a learner following the
// /course/[shareId] link would see.
//
// FIXED: Next.js 15 made route `params` a Promise -- it must be awaited
// before its properties are read. The old synchronous `{ params: { courseId: string } }`
// typing fails the build against Next 15's generated route types (same
// error as the [shareId] SCORM route hit).

import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { buildScormPackage } from "@/lib/scorm/build-package";

export const runtime = "nodejs"; // required: buildScormPackage() reads a file from disk

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId: rawCourseId } = await params;
  const courseId = rawCourseId as Id<"courses">;

  // getCourseWithActiveVersion calls requireUser() on the Convex side,
  // which needs ctx.auth.getUserIdentity() to resolve. Unlike the
  // browser's Convex client (wired to Clerk via ConvexProviderWithClerk),
  // a server Route Handler's fetchQuery() has no ambient auth — the
  // Clerk session token has to be fetched and passed explicitly, or every
  // call here throws "Unauthorized" even for the course's own owner.
  const { getToken } = await auth();
  const token = (await getToken({ template: "convex" })) ?? undefined;

  const result = await fetchQuery(
    api.courses.getCourseWithActiveVersion,
    { courseId },
    { token },
  );

  if (!result || !result.course || !result.activeVersion) {
    return NextResponse.json(
      { error: "Course not found, or has no generated version yet" },
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
