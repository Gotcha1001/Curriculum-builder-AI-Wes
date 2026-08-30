// app/api/course/[shareId]/export/word/route.ts
//
// GET /api/course/:shareId/export/word -> downloads course.docx
// Public counterpart to app/api/courses/[courseId]/export/word/route.ts,
// mirroring app/api/course/[shareId]/export/scorm/route.ts exactly: uses
// api.courses.getByShareId (already public, no requireUser call, already
// gates on course.status === "ready") instead of getCourseWithActiveVersion,
// so a learner following a bare share link can download the Word doc
// without signing in — same as the PDF and SCORM downloads already work.

import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { buildWordPackage } from "@/lib/word/build-package";

export const runtime = "nodejs"; // docx's Packer needs Node, not Edge

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> },
) {
  const { shareId } = await params;

  const result = await fetchQuery(api.courses.getByShareId, { shareId });

  if (!result || !result.course || !result.activeVersion) {
    return NextResponse.json(
      { error: "Course not found, or not yet ready to view" },
      { status: 404 },
    );
  }

  const { course, activeVersion } = result;

  try {
    const docxBytes = await buildWordPackage({
      courseId: course._id,
      title: course.title,
      subject: course.subject,
      style: activeVersion.style,
      generatedContent: activeVersion.generatedContent,
    });
    const filename = `${course.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.docx`;
    return new NextResponse(Buffer.from(docxBytes), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to build Word document";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
