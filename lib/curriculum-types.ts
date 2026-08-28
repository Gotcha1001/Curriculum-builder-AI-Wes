// lib/curriculum-types.ts
//
// TRANSFORMED FROM: lib/plan-types.ts (business-plan app).
//
// Shapes the AI's parsed response into. Nothing here is a Convex schema
// type — convex/schema.ts's `generatedContent: v.any()` field just stores
// whatever this shape serializes to. Keep this in sync with the JSON
// contract described in convex/ai.ts's buildPrompt() and enforced by its
// parseGeneratedContent().

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export const SKILL_LEVEL_ORDER: SkillLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export type ExerciseType = "quiz" | "practice_task" | "checklist";

export interface GeneratedExercise {
  type: ExerciseType;
  prompt: string;
  items: string[];
}

export interface GeneratedLesson {
  key: string; // stable, e.g. "m1-l2" — see convex/ai.ts on why these are re-derived, not trusted from the model
  title: string;
  objectives: string[];
  content: string; // concise outline, NOT full lesson script — see buildPrompt()
  estimatedMinutes: number;
  prerequisiteKeys: string[]; // lesson keys within this same generation this lesson depends on
  exercise?: GeneratedExercise;
}

export interface GeneratedModule {
  key: string; // stable, e.g. "m1"
  title: string;
  level: SkillLevel;
  summary: string;
  lessons: GeneratedLesson[];
}

export interface GeneratedCourseContent {
  modules: GeneratedModule[];
}
