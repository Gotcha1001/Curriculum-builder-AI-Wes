// components/course-layouts/types.ts
//
// EXTENDED from the version in the source document: added optional
// `progress`. It's optional (not `Doc<"progress">[]` required) because
// this prop shape is shared by three call sites with different auth
// states:
//   - The dashboard course view (signed-in owner) -- always has it.
//   - The public /course/[shareId] page -- only has it if the visitor
//     happens to be signed in AND has progress rows on this course;
//     anonymous visitors get undefined.
//   - The PDF export route -- never has it; a downloaded PDF has no
//     concept of "your" progress.
// Every layout MUST treat `progress` as absent-safe (render pacing/budget
// only, skip completion stats) rather than assuming it's always there.
//
// TRANSFORMED FROM: components/plan-layouts/types.ts
import type { Doc } from "@/convex/_generated/dataModel";

export interface CourseLayoutProps {
  course: Doc<"courses">;
  version: Doc<"courseVersions">;
  pdfUrl: string;
  progress?: Doc<"progress">[];
}
