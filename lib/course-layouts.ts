// lib/course-layouts.ts
//
// TRANSFORMED FROM: lib/layouts.ts (business-plan app).
// Mirrors PLAN_LAYOUTS / getPlanLayoutMeta() 1:1 — this is the
// CourseLayoutId union that schema.ts's courseVersions.layout comment
// already points to.

export type CourseLayoutId =
  | "syllabus-first"
  | "module-roadmap"
  | "cover-banner"
  | "minimal-clean"
  | "progress-tracker";

export interface CourseLayoutMeta {
  id: CourseLayoutId;
  name: string;
  description: string;
}

export const COURSE_LAYOUTS: CourseLayoutMeta[] = [
  {
    id: "syllabus-first",
    name: "Syllabus First",
    description:
      "Leads with the course overview and readiness score, then flows into modules in order. Good default for most learners.",
  },
  {
    id: "module-roadmap",
    name: "Module Roadmap",
    description:
      "Deck-style walkthrough, one module per spread — good for skimming the whole path before committing.",
  },
  {
    id: "cover-banner",
    name: "Cover Banner",
    description: "Cover-banner style layout.",
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Minimal, clean layout.",
  },
  {
    id: "progress-tracker",
    name: "Progress Tracker",
    description:
      "Pacing- and readiness-charts-forward layout — shows time budget and completion at a glance.",
  },
];

export function getCourseLayoutMeta(id?: string | null): CourseLayoutMeta {
  return COURSE_LAYOUTS.find((l) => l.id === id) ?? COURSE_LAYOUTS[0];
}
