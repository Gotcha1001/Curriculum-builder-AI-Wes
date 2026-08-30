// components/course-preview.tsx
//
// UPDATED: threads an optional `progress` prop through to whichever layout
// is active, so progress-tracker.tsx (and any future layout that wants
// completion data) can render it. Every other layout ignores the prop
// harmlessly since it's optional on CourseLayoutProps.
//
// UPDATED: also resolves `scormUrl` the same way `pdfUrl` already was --
// a shareId-keyed public route, `/api/course/${course.shareId}/export/scorm`
// -- and passes it down alongside pdfUrl so every layout can offer both
// downloads via CourseExportMenu.
//
// UPDATED: resolves `wordUrl` the same way -- third shareId-keyed public
// route, `/api/course/${course.shareId}/export/word` -- so CourseExportMenu
// can offer the editable .docx download alongside PDF and SCORM. Always
// resolved here rather than accepted as a prop (unlike pdfUrl), same as
// scormUrl already is -- no caller has ever needed to override it.
"use client";

import { motion } from "framer-motion";
import type { Doc } from "@/convex/_generated/dataModel";
import { getCourseLayoutMeta, type CourseLayoutId } from "@/lib/course-layouts";
import { SyllabusFirstLayout } from "./course-layouts/syllabus-first";
import { ModuleRoadmapLayout } from "./course-layouts/module-roadmap";
import { CoverBannerLayout } from "./course-layouts/cover-banner";
import { MinimalCleanLayout } from "./course-layouts/minimal-clean";
import { ProgressTrackerLayout } from "./course-layouts/progress-tracker";
import type { CourseLayoutProps } from "./course-layouts/types";

import { JSX } from "react";

const COURSE_LAYOUT_COMPONENTS: Partial<
  Record<CourseLayoutId, (props: CourseLayoutProps) => JSX.Element>
> = {
  "syllabus-first": SyllabusFirstLayout,
  "module-roadmap": ModuleRoadmapLayout,
  "cover-banner": CoverBannerLayout,
  "minimal-clean": MinimalCleanLayout,
  "progress-tracker": ProgressTrackerLayout,
};

export function CourseAnimatedView({
  course,
  version,
  pdfUrl,
  progress,
}: {
  course: Doc<"courses">;
  version?: Doc<"courseVersions"> | null;
  pdfUrl?: string;
  progress?: Doc<"progress">[];
}) {
  const resolvedPdfUrl = pdfUrl ?? `/api/course/${course.shareId}/pdf`;
  const resolvedScormUrl = `/api/course/${course.shareId}/export/scorm`;
  const resolvedWordUrl = `/api/course/${course.shareId}/export/word`;

  if (course.status === "generating" || course.status === "draft" || !version) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="text-muted-foreground"
        >
          Generating {course.title}&apos;s curriculum…
        </motion.div>
      </div>
    );
  }

  if (course.status === "failed") {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-2">
        <p className="text-lg font-medium">
          Something went wrong generating this course.
        </p>
        {course.generationError && (
          <p className="text-sm text-muted-foreground">
            {course.generationError}
          </p>
        )}
      </div>
    );
  }

  const layoutId = getCourseLayoutMeta(version.layout).id;
  const Layout = COURSE_LAYOUT_COMPONENTS[layoutId] ?? SyllabusFirstLayout;
  return (
    <Layout
      course={course}
      version={version}
      pdfUrl={resolvedPdfUrl}
      scormUrl={resolvedScormUrl}
      wordUrl={resolvedWordUrl}
      progress={progress}
    />
  );
}
