// lib/DataModel.tsx
//
// STUB for type-checking only -- mirrors the real convex/schema.ts shapes.
//
// TRANSFORMED FROM: lib/DataModel.tsx (business-plan version, which had
// BusinessPlanDoc / BusinessPlanVersionDoc / ViabilityAnalysis).
//
// Keep this in sync with convex/schema.ts. It's a plain stub (not generated
// by `npx convex dev`) so anything imported here needs a matching field in
// the real schema -- if you add a column there, mirror it here too.

import type { GeneratedCourseContent, SkillLevel } from "./curriculum-types";

// Deterministic (code-computed, not AI) health check on a specific
// generated version -- mirrors convex/schema.ts's readinessAnalysisValidator.
export interface ReadinessAnalysis {
  score: number; // 0-100, code-computed from pacing/prerequisite gaps/level jumps
  flags: string[]; // e.g. "Module 3 jumps from beginner to advanced with no bridge lesson"
  suggestions: string[]; // e.g. "Add a review lesson before introducing chord inversions"
}

export type LearningStyle = "visual" | "hands_on" | "reading" | "video";

export type CourseStatus = "draft" | "generating" | "ready" | "failed";

// One row per course "project" -- the setup wizard fields. The generated
// module/lesson/exercise tree lives in CourseVersionDoc, not here.
export interface CourseDoc {
  _id: string;
  _creationTime: number;
  userId: string;
  title: string; // e.g. "Piano for Beginners"
  subject: string; // e.g. "piano", "plumbing", "python"
  description?: string;
  startLevel: SkillLevel;
  targetLevel: SkillLevel;
  hoursPerWeek?: number;
  learningStyle?: LearningStyle[];
  shareId: string; // public slug: /course/[shareId]
  activeVersionId?: string;
  status: CourseStatus;
  generationError?: string;
  createdAt: number;
  updatedAt: number;
}

// Append-only. Every regeneration AND every style/layout change on the
// same course creates a new row here -- never overwritten.
export interface CourseVersionDoc {
  _id: string;
  _creationTime: number;
  courseId: string;
  userId: string; // denormalized so ownership checks don't need a join back
  versionNumber: number;
  label: string; // e.g. "Faster-paced draft", or auto "Version 3"
  style?: string;
  layout?: string; // one of lib/course-layouts.ts CourseLayoutId
  generatedContent: GeneratedCourseContent;
  readinessAnalysis?: ReadinessAnalysis;
  createdAt: number;
  editedAt?: number;
}

// Learner progress, tracked independently of versioning -- lessonKey is a
// string (not a lesson document id) so completion survives regeneration.
export interface ProgressDoc {
  _id: string;
  _creationTime: number;
  userId: string;
  courseId: string;
  lessonKey: string;
  completed: boolean;
  completedAt?: number;
  score?: number;
}

export interface UserDoc {
  _id: string;
  _creationTime: number;
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string;
  role: "admin" | "user";
  createdAt: number;
}

export interface DataModel {
  users: UserDoc;
  courses: CourseDoc;
  courseVersions: CourseVersionDoc;
  progress: ProgressDoc;
}

export type Doc<T extends keyof DataModel> = DataModel[T];

export type Id<T extends keyof DataModel> = string & { __tableName: T };
