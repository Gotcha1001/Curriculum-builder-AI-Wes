// app/api/course/[shareId]/pdf/route.ts
//
// MOVED FROM: Api/couse/[shareId]/pdf/route.ts
//
// Only the location was wrong -- the folder was misspelled ("couse",
// missing the "r") and cased as "Api" instead of Next.js's expected
// lowercase "app/api". The code itself was already fully transformed
// (uses api.courses.getByShareId, prepareCourseData, PDF_LAYOUT_BUILDERS)
// and needed no logic changes.

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { NextResponse } from "next/server";
import { prepareCourseData } from "@/lib/curriculum-data";
import { PDF_LAYOUT_BUILDERS } from "@/lib/pdf-layouts";
import { getCourseLayoutMeta } from "@/lib/course-layouts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ shareId: string }> },
) {
  const { shareId } = await params;
  const result = await fetchQuery(api.courses.getByShareId, { shareId });

  if (!result?.course || !result?.activeVersion) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { course, activeVersion } = result;
  const data = prepareCourseData(course, activeVersion);
  const layoutId = getCourseLayoutMeta(activeVersion.layout).id;
  const buildDocument =
    PDF_LAYOUT_BUILDERS[layoutId] ?? PDF_LAYOUT_BUILDERS["syllabus-first"];

  const document = buildDocument({
    course,
    version: activeVersion,
    ...data,
  }) as ReactElement<DocumentProps>;

  const buffer = await renderToBuffer(document);
  const safeName =
    data.title.replace(/[^\w\-]+/g, "-").replace(/^-|-$/g, "") || "Course";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}-Curriculum.pdf"`,
    },
  });
}
