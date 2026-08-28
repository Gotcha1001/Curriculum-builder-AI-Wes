// lib/pdf-layouts/index.ts
import type { ReactElement } from "react";
import type { CourseLayoutId } from "@/lib/course-layouts";
import type { CourseLayoutData } from "./types";
import { buildSyllabusFirstPdfDocument } from "./syllabus-first";
import { buildModuleRoadmapPdfDocument } from "./module-roadmap";
import { buildProgressTrackerPdfDocument } from "./progress-tracker";
import { buildCoverBannerPdfDocument } from "./cover-banner";
import { buildMinimalCleanPdfDocument } from "./minimal-clean";

/**
 * One entry per CourseLayoutId — must stay in sync with
 * COURSE_LAYOUT_COMPONENTS in components/course-preview.tsx so the PDF
 * always matches the web preview for the same version.layout value.
 */
export const PDF_LAYOUT_BUILDERS: Record<
  CourseLayoutId,
  (data: CourseLayoutData) => ReactElement
> = {
  "syllabus-first": buildSyllabusFirstPdfDocument,
  "module-roadmap": buildModuleRoadmapPdfDocument,
  "cover-banner": buildCoverBannerPdfDocument,
  "minimal-clean": buildMinimalCleanPdfDocument,
  "progress-tracker": buildProgressTrackerPdfDocument,
};
