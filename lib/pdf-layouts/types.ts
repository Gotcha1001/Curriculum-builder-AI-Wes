// lib/pdf-layouts/types.ts
import type { Doc } from "@/convex/_generated/dataModel";
import type { PreparedCourseData } from "@/lib/curriculum-data";

/**
 * Everything a PDF layout builder needs, already shaped by
 * lib/curriculum-data.ts's prepareCourseData() so it's byte-for-byte
 * the same data the matching web layout renders from.
 */
export interface CourseLayoutData extends PreparedCourseData {
  course: Doc<"courses">;
  version: Doc<"courseVersions">;
}
