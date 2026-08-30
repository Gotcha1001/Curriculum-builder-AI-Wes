// "use client";

// import { Suspense, useEffect, useState } from "react";
// import { useForm, Controller, type Control } from "react-hook-form";
// import { useMutation, useAction, useQuery, useConvex } from "convex/react";
// import { useRouter, useSearchParams } from "next/navigation";
// import type { FunctionArgs, FunctionReturnType } from "convex/server";
// import { api } from "@/convex/_generated/api";
// import type { Id } from "@/convex/_generated/dataModel";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { toast } from "sonner";
// import { Loader2 } from "lucide-react";

// import { LayoutSelect } from "@/app/components/layout-select";
// import { StyleSelect } from "@/app/components/style-select";
// import { GeneratingModal } from "@/app/components/generating-modal";

// // ---------------------------------------------------------------------------
// // Shared visual classes (same look as the rest of the dashboard)
// // ---------------------------------------------------------------------------
// const SECTION_CLASS =
//   "space-y-3 rounded-2xl border border-zinc-900/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5";

// // ---------------------------------------------------------------------------
// // Literal unions — must match convex/schema.ts exactly
// // ---------------------------------------------------------------------------
// type SkillLevel = "beginner" | "intermediate" | "advanced";
// type LearningStyle = "visual" | "hands_on" | "reading" | "video";

// const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
//   { value: "beginner", label: "Beginner" },
//   { value: "intermediate", label: "Intermediate" },
//   { value: "advanced", label: "Advanced" },
// ];

// const LEARNING_STYLES: { value: LearningStyle; label: string }[] = [
//   { value: "visual", label: "Visual" },
//   { value: "hands_on", label: "Hands-on" },
//   { value: "reading", label: "Reading" },
//   { value: "video", label: "Video" },
// ];

// // ---------------------------------------------------------------------------
// // Form shape
// // ---------------------------------------------------------------------------
// type FormValues = {
//   title: string;
//   subject: string;
//   description: string;
//   startLevel: SkillLevel;
//   targetLevel: SkillLevel;
//   hoursPerWeek: string; // string in the form, parsed on submit
//   learningStyle: LearningStyle[];
//   layout: string;
//   style: string;
// };

// const EMPTY_DEFAULTS: FormValues = {
//   title: "",
//   subject: "",
//   description: "",
//   startLevel: "beginner",
//   targetLevel: "intermediate",
//   hoursPerWeek: "3",
//   learningStyle: ["mixed" as any].filter(Boolean) as LearningStyle[], // will be empty by default
//   layout: "syllabus-first",
//   style: "",
// };

// // Better empty default without the fake "mixed"
// EMPTY_DEFAULTS.learningStyle = [];

// // ---------------------------------------------------------------------------
// // Helpers
// // ---------------------------------------------------------------------------
// function toNum(v: string): number | undefined {
//   if (v === undefined || v === null || v.trim() === "") return undefined;
//   const parsed = Number(v);
//   return Number.isNaN(parsed) ? undefined : parsed;
// }

// function opt(v: string): string | undefined {
//   return v.trim() === "" ? undefined : v;
// }

// // ---------------------------------------------------------------------------
// // Load existing course → form values
// // ---------------------------------------------------------------------------
// type CourseDoc = NonNullable<FunctionReturnType<typeof api.courses.getCourse>>;

// function courseToFormValues(course: CourseDoc): FormValues {
//   return {
//     title: course.title ?? "",
//     subject: course.subject ?? "",
//     description: course.description ?? "",
//     startLevel: course.startLevel ?? "beginner",
//     targetLevel: course.targetLevel ?? "intermediate",
//     hoursPerWeek:
//       course.hoursPerWeek !== undefined && course.hoursPerWeek !== null
//         ? String(course.hoursPerWeek)
//         : "3",
//     learningStyle: (course.learningStyle as LearningStyle[]) ?? [],
//     layout: "syllabus-first", // layout lives on the version; default for new gens
//     style: "",
//   };
// }

// // ---------------------------------------------------------------------------
// // Form values → upsertCourse args
// // ---------------------------------------------------------------------------
// type UpsertCourseArgs = FunctionArgs<typeof api.courses.upsertCourse>;
// type CourseFields = Omit<UpsertCourseArgs, "courseId" | "preserveStatus">;

// function formValuesToCourseFields(values: FormValues): CourseFields {
//   return {
//     title: values.title.trim() || values.subject.trim() || "Untitled Course",
//     subject: values.subject.trim(),
//     description: opt(values.description),
//     startLevel: values.startLevel,
//     targetLevel: values.targetLevel,
//     hoursPerWeek: toNum(values.hoursPerWeek),
//     learningStyle:
//       values.learningStyle.length > 0 ? values.learningStyle : undefined,
//   };
// }

// // ---------------------------------------------------------------------------
// // Multi-select learning style
// // ---------------------------------------------------------------------------
// function LearningStyleField({ control }: { control: Control<FormValues> }) {
//   return (
//     <Controller
//       name="learningStyle"
//       control={control}
//       render={({ field }) => (
//         <div className="flex flex-wrap gap-3">
//           {LEARNING_STYLES.map((s) => {
//             const checked = field.value.includes(s.value);
//             return (
//               <label
//                 key={s.value}
//                 className="flex items-center gap-2 text-sm cursor-pointer select-none"
//               >
//                 <Checkbox
//                   checked={checked}
//                   onCheckedChange={(on) => {
//                     if (on) {
//                       field.onChange([...field.value, s.value]);
//                     } else {
//                       field.onChange(field.value.filter((v) => v !== s.value));
//                     }
//                   }}
//                 />
//                 {s.label}
//               </label>
//             );
//           })}
//         </div>
//       )}
//     />
//   );
// }

// // ---------------------------------------------------------------------------
// // Main form
// // ---------------------------------------------------------------------------
// function CreateCourseForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const rawCourseId = searchParams.get("courseId");
//   const courseId =
//     rawCourseId && rawCourseId.length > 0
//       ? (rawCourseId as Id<"courses">)
//       : null;
//   const isEditing = !!courseId;

//   const existingCourse = useQuery(
//     api.courses.getCourse,
//     courseId ? { courseId } : "skip",
//   );
//   const upsertCourse = useMutation(api.courses.upsertCourse);
//   const generateCourse = useAction(api.ai.generateCourse);
//   const convex = useConvex();

//   const [submitting, setSubmitting] = useState<"draft" | "generate" | null>(
//     null,
//   );
//   const [generatingCourseId, setGeneratingCourseId] =
//     useState<Id<"courses"> | null>(null);

//   const { control, register, handleSubmit, reset, watch } = useForm<FormValues>(
//     {
//       defaultValues: EMPTY_DEFAULTS,
//     },
//   );

//   // Keep targetLevel >= startLevel for UX
//   const startLevel = watch("startLevel");
//   const targetLevel = watch("targetLevel");

//   useEffect(() => {
//     if (!existingCourse) return;
//     reset(courseToFormValues(existingCourse));
//   }, [existingCourse, reset]);

//   const watchedCourse = useQuery(
//     api.courses.getCourse,
//     generatingCourseId ? { courseId: generatingCourseId } : "skip",
//   );

//   async function persist(values: FormValues, preserveStatus: boolean) {
//     const fields = formValuesToCourseFields(values);
//     const savedId = await upsertCourse({
//       courseId: courseId ?? undefined,
//       preserveStatus,
//       ...fields,
//     });
//     return savedId;
//   }

//   async function onSaveDraft(values: FormValues) {
//     setSubmitting("draft");
//     try {
//       const savedId = await persist(values, true);
//       toast.success("Draft saved");
//       if (!isEditing) {
//         router.replace(`/dashboard/create?courseId=${savedId}`);
//       }
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : "Failed to save draft");
//     } finally {
//       setSubmitting(null);
//     }
//   }

//   async function onGenerate(values: FormValues) {
//     // Soft client-side guard
//     const startIdx = SKILL_LEVELS.findIndex(
//       (l) => l.value === values.startLevel,
//     );
//     const targetIdx = SKILL_LEVELS.findIndex(
//       (l) => l.value === values.targetLevel,
//     );
//     if (targetIdx < startIdx) {
//       toast.error(
//         "Target level must be the same as or higher than start level",
//       );
//       return;
//     }

//     setSubmitting("generate");
//     try {
//       const savedId = await persist(values, false);

//       // Open modal before the long-running action
//       setGeneratingCourseId(savedId);

//       await generateCourse({
//         courseId: savedId,
//         style: values.style || undefined,
//         layout: values.layout,
//       });

//       // One-off query so we never race the reactive watchedCourse
//       const finalCourse = await convex.query(api.courses.getCourse, {
//         courseId: savedId,
//       });

//       setGeneratingCourseId(null);
//       setSubmitting(null);

//       if (finalCourse?.status === "failed") {
//         toast.error(finalCourse.generationError ?? "Failed to generate course");
//       } else {
//         // History page will be /dashboard/courses/[id]/history later;
//         // for now land on the courses list or the public course.
//         router.push(`/dashboard/courses`);
//       }
//     } catch (err) {
//       toast.error(
//         err instanceof Error ? err.message : "Failed to generate course",
//       );
//       setSubmitting(null);
//       setGeneratingCourseId(null);
//     }
//   }

//   return (
//     <form className="mx-auto max-w-2xl space-y-6 pb-24">
//       {/* Title + subject */}
//       <div className={SECTION_CLASS}>
//         <div className="space-y-1">
//           <Label className="text-xs text-zinc-500">
//             Course title (internal label)
//           </Label>
//           <Input
//             {...register("title")}
//             placeholder="e.g. Piano for Absolute Beginners"
//           />
//         </div>
//         <div className="space-y-1">
//           <Label className="text-xs text-zinc-500">Subject / topic *</Label>
//           <Input
//             {...register("subject", { required: true })}
//             placeholder="e.g. piano, plumbing, python, cooking"
//             required
//           />
//         </div>
//         <div className="space-y-1">
//           <Label className="text-xs text-zinc-500">
//             Short description (optional)
//           </Label>
//           <Textarea
//             {...register("description")}
//             rows={2}
//             placeholder="What will the learner be able to do by the end?"
//           />
//         </div>
//       </div>

//       {/* Levels + pacing */}
//       <div className={SECTION_CLASS}>
//         <div className="grid gap-4 sm:grid-cols-2">
//           <div className="space-y-1">
//             <Label className="text-xs text-zinc-500">Starting level *</Label>
//             <select
//               {...register("startLevel")}
//               className="w-full rounded-md border border-zinc-900/10 bg-transparent p-2 text-sm dark:border-white/10"
//             >
//               {SKILL_LEVELS.map((l) => (
//                 <option key={l.value} value={l.value}>
//                   {l.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="space-y-1">
//             <Label className="text-xs text-zinc-500">Target level *</Label>
//             <select
//               {...register("targetLevel")}
//               className="w-full rounded-md border border-zinc-900/10 bg-transparent p-2 text-sm dark:border-white/10"
//             >
//               {SKILL_LEVELS.map((l) => (
//                 <option key={l.value} value={l.value}>
//                   {l.label}
//                 </option>
//               ))}
//             </select>
//             {targetLevel &&
//               startLevel &&
//               SKILL_LEVELS.findIndex((l) => l.value === targetLevel) <
//                 SKILL_LEVELS.findIndex((l) => l.value === startLevel) && (
//                 <p className="text-xs text-amber-600 mt-1">
//                   Target should be the same as or higher than start level.
//                 </p>
//               )}
//           </div>
//         </div>

//         <div className="space-y-1">
//           <Label className="text-xs text-zinc-500">
//             Hours per week (optional — used for pacing)
//           </Label>
//           <Input
//             type="number"
//             min={0.5}
//             step={0.5}
//             {...register("hoursPerWeek")}
//             placeholder="3"
//           />
//           <p className="text-xs text-zinc-500">
//             Leave blank or set to 3 for a typical part-time pace. This feeds the
//             deterministic pacing budget before the AI runs.
//           </p>
//         </div>
//       </div>

//       {/* Learning style */}
//       <div className={SECTION_CLASS}>
//         <Label className="text-xs text-zinc-500">
//           Preferred learning styles (optional)
//         </Label>
//         <LearningStyleField control={control} />
//         <p className="text-xs text-zinc-500">
//           The AI will bias lesson formats toward the styles you pick.
//         </p>
//       </div>

//       {/* Layout + style (per version) */}
//       <div className={SECTION_CLASS}>
//         <div className="grid gap-4 sm:grid-cols-2">
//           <div className="space-y-1">
//             <Label className="text-xs text-zinc-500">Layout</Label>
//             <Controller
//               name="layout"
//               control={control}
//               render={({ field }) => (
//                 <LayoutSelect
//                   value={field.value}
//                   onValueChange={field.onChange}
//                 />
//               )}
//             />
//           </div>
//           <div className="space-y-1">
//             <Label className="text-xs text-zinc-500">Style / theme</Label>
//             <Controller
//               name="style"
//               control={control}
//               render={({ field }) => (
//                 <StyleSelect
//                   value={field.value}
//                   onValueChange={field.onChange}
//                 />
//               )}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="sticky bottom-4 flex justify-end gap-2 rounded-2xl border border-zinc-900/10 bg-white/90 p-3 backdrop-blur dark:border-white/10 dark:bg-zinc-950/90">
//         <Button
//           type="button"
//           variant="outline"
//           disabled={submitting !== null}
//           onClick={handleSubmit(onSaveDraft)}
//         >
//           {submitting === "draft" && (
//             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           )}
//           Save draft
//         </Button>
//         <Button
//           type="button"
//           disabled={submitting !== null}
//           onClick={handleSubmit(onGenerate)}
//         >
//           {submitting === "generate" && (
//             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           )}
//           Generate curriculum
//         </Button>
//       </div>

//       <GeneratingModal
//         key={generatingCourseId ?? "idle"}
//         open={!!generatingCourseId}
//         title={watchedCourse?.title ?? "your curriculum"}
//       />
//     </form>
//   );
// }

// export default function CreateCoursePage() {
//   return (
//     <Suspense
//       fallback={<div className="p-8 text-sm text-zinc-500">Loading…</div>}
//     >
//       <CreateCourseForm />
//     </Suspense>
//   );
// }

"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm, Controller, type Control } from "react-hook-form";
import { useMutation, useAction, useQuery, useConvex } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FunctionArgs, FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { LayoutSelect } from "@/app/components/layout-select";
import { StyleSelect } from "@/app/components/style-select";
import { GeneratingModal } from "@/app/components/generating-modal";

// ---------------------------------------------------------------------------
// Shared visual classes (same look as the rest of the dashboard)
// ---------------------------------------------------------------------------
const SECTION_CLASS =
  "space-y-3 rounded-2xl border border-zinc-900/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5";

// ---------------------------------------------------------------------------
// Literal unions — must match convex/schema.ts exactly
// ---------------------------------------------------------------------------
type SkillLevel = "beginner" | "intermediate" | "advanced";
type LearningStyle = "visual" | "hands_on" | "reading" | "video";

const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LEARNING_STYLES: { value: LearningStyle; label: string }[] = [
  { value: "visual", label: "Visual" },
  { value: "hands_on", label: "Hands-on" },
  { value: "reading", label: "Reading" },
  { value: "video", label: "Video" },
];

// Mirrors MIN_TOTAL_WEEKS / MAX_TOTAL_WEEKS in lib/curriculum-pacing.ts —
// keep in sync. Only used here for the input's min/max and the soft
// warning below; the real clamp still happens server-side in
// calculatePacingBudget, so this is a UX nicety, not the source of truth.
const MIN_TOTAL_WEEKS = 2;
const MAX_TOTAL_WEEKS = 52;

// ---------------------------------------------------------------------------
// Form shape
// ---------------------------------------------------------------------------
type FormValues = {
  title: string;
  subject: string;
  description: string;
  startLevel: SkillLevel;
  targetLevel: SkillLevel;
  hoursPerWeek: string; // string in the form, parsed on submit
  weeks: string; // string in the form, parsed on submit — "" means auto
  learningStyle: LearningStyle[];
  layout: string;
  style: string;
};

const EMPTY_DEFAULTS: FormValues = {
  title: "",
  subject: "",
  description: "",
  startLevel: "beginner",
  targetLevel: "intermediate",
  hoursPerWeek: "3",
  weeks: "",
  learningStyle: [],
  layout: "syllabus-first",
  style: "",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function toNum(v: string): number | undefined {
  if (v === undefined || v === null || v.trim() === "") return undefined;
  const parsed = Number(v);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function opt(v: string): string | undefined {
  return v.trim() === "" ? undefined : v;
}

// ---------------------------------------------------------------------------
// Load existing course → form values
// ---------------------------------------------------------------------------
type CourseDoc = NonNullable<FunctionReturnType<typeof api.courses.getCourse>>;

function courseToFormValues(course: CourseDoc): FormValues {
  return {
    title: course.title ?? "",
    subject: course.subject ?? "",
    description: course.description ?? "",
    startLevel: course.startLevel ?? "beginner",
    targetLevel: course.targetLevel ?? "intermediate",
    hoursPerWeek:
      course.hoursPerWeek !== undefined && course.hoursPerWeek !== null
        ? String(course.hoursPerWeek)
        : "3",
    // Unset stays "" (auto pacing), same convention as hoursPerWeek's
    // blank-means-default -- but weeks has no numeric default to fall
    // back to display, since "auto" isn't a fixed number until
    // calculatePacingBudget runs.
    weeks:
      course.weeks !== undefined && course.weeks !== null
        ? String(course.weeks)
        : "",
    learningStyle: (course.learningStyle as LearningStyle[]) ?? [],
    layout: "syllabus-first", // layout lives on the version; default for new gens
    style: "",
  };
}

// ---------------------------------------------------------------------------
// Form values → upsertCourse args
// ---------------------------------------------------------------------------
type UpsertCourseArgs = FunctionArgs<typeof api.courses.upsertCourse>;
type CourseFields = Omit<UpsertCourseArgs, "courseId" | "preserveStatus">;

function formValuesToCourseFields(values: FormValues): CourseFields {
  return {
    title: values.title.trim() || values.subject.trim() || "Untitled Course",
    subject: values.subject.trim(),
    description: opt(values.description),
    startLevel: values.startLevel,
    targetLevel: values.targetLevel,
    hoursPerWeek: toNum(values.hoursPerWeek),
    weeks: toNum(values.weeks),
    learningStyle:
      values.learningStyle.length > 0 ? values.learningStyle : undefined,
  };
}

// ---------------------------------------------------------------------------
// Multi-select learning style
// ---------------------------------------------------------------------------
function LearningStyleField({ control }: { control: Control<FormValues> }) {
  return (
    <Controller
      name="learningStyle"
      control={control}
      render={({ field }) => (
        <div className="flex flex-wrap gap-3">
          {LEARNING_STYLES.map((s) => {
            const checked = field.value.includes(s.value);
            return (
              <label
                key={s.value}
                className="flex items-center gap-2 text-sm cursor-pointer select-none"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(on) => {
                    if (on) {
                      field.onChange([...field.value, s.value]);
                    } else {
                      field.onChange(field.value.filter((v) => v !== s.value));
                    }
                  }}
                />
                {s.label}
              </label>
            );
          })}
        </div>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------
function CreateCourseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCourseId = searchParams.get("courseId");
  const courseId =
    rawCourseId && rawCourseId.length > 0
      ? (rawCourseId as Id<"courses">)
      : null;
  const isEditing = !!courseId;

  const existingCourse = useQuery(
    api.courses.getCourse,
    courseId ? { courseId } : "skip",
  );
  const upsertCourse = useMutation(api.courses.upsertCourse);
  const generateCourse = useAction(api.ai.generateCourse);
  const convex = useConvex();

  const [submitting, setSubmitting] = useState<"draft" | "generate" | null>(
    null,
  );
  const [generatingCourseId, setGeneratingCourseId] =
    useState<Id<"courses"> | null>(null);

  const { control, register, handleSubmit, reset, watch } = useForm<FormValues>(
    {
      defaultValues: EMPTY_DEFAULTS,
    },
  );

  // Keep targetLevel >= startLevel for UX
  const startLevel = watch("startLevel");
  const targetLevel = watch("targetLevel");
  const weeks = watch("weeks");
  const weeksNum = toNum(weeks);
  const weeksOutOfRange =
    weeksNum !== undefined &&
    (weeksNum < MIN_TOTAL_WEEKS || weeksNum > MAX_TOTAL_WEEKS);

  useEffect(() => {
    if (!existingCourse) return;
    reset(courseToFormValues(existingCourse));
  }, [existingCourse, reset]);

  const watchedCourse = useQuery(
    api.courses.getCourse,
    generatingCourseId ? { courseId: generatingCourseId } : "skip",
  );

  async function persist(values: FormValues, preserveStatus: boolean) {
    const fields = formValuesToCourseFields(values);
    const savedId = await upsertCourse({
      courseId: courseId ?? undefined,
      preserveStatus,
      ...fields,
    });
    return savedId;
  }

  async function onSaveDraft(values: FormValues) {
    setSubmitting("draft");
    try {
      const savedId = await persist(values, true);
      toast.success("Draft saved");
      if (!isEditing) {
        router.replace(`/dashboard/create?courseId=${savedId}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSubmitting(null);
    }
  }

  async function onGenerate(values: FormValues) {
    // Soft client-side guard
    const startIdx = SKILL_LEVELS.findIndex(
      (l) => l.value === values.startLevel,
    );
    const targetIdx = SKILL_LEVELS.findIndex(
      (l) => l.value === values.targetLevel,
    );
    if (targetIdx < startIdx) {
      toast.error(
        "Target level must be the same as or higher than start level",
      );
      return;
    }

    setSubmitting("generate");
    try {
      const savedId = await persist(values, false);

      // Open modal before the long-running action
      setGeneratingCourseId(savedId);

      await generateCourse({
        courseId: savedId,
        style: values.style || undefined,
        layout: values.layout,
      });

      // One-off query so we never race the reactive watchedCourse
      const finalCourse = await convex.query(api.courses.getCourse, {
        courseId: savedId,
      });

      setGeneratingCourseId(null);
      setSubmitting(null);

      if (finalCourse?.status === "failed") {
        toast.error(finalCourse.generationError ?? "Failed to generate course");
      } else {
        // History page will be /dashboard/courses/[id]/history later;
        // for now land on the courses list or the public course.
        router.push(`/dashboard/courses`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate course",
      );
      setSubmitting(null);
      setGeneratingCourseId(null);
    }
  }

  return (
    <form className="mx-auto max-w-2xl space-y-6 pb-24">
      {/* Title + subject */}
      <div className={SECTION_CLASS}>
        <div className="space-y-1">
          <Label className="text-xs text-zinc-500">
            Course title (internal label)
          </Label>
          <Input
            {...register("title")}
            placeholder="e.g. Piano for Absolute Beginners"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-zinc-500">Subject / topic *</Label>
          <Input
            {...register("subject", { required: true })}
            placeholder="e.g. piano, plumbing, python, cooking"
            required
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-zinc-500">
            Short description (optional)
          </Label>
          <Textarea
            {...register("description")}
            rows={2}
            placeholder="What will the learner be able to do by the end?"
          />
        </div>
      </div>

      {/* Levels + pacing */}
      <div className={SECTION_CLASS}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-zinc-500">Starting level *</Label>
            <select
              {...register("startLevel")}
              className="w-full rounded-md border border-zinc-900/10 bg-transparent p-2 text-sm dark:border-white/10"
            >
              {SKILL_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-zinc-500">Target level *</Label>
            <select
              {...register("targetLevel")}
              className="w-full rounded-md border border-zinc-900/10 bg-transparent p-2 text-sm dark:border-white/10"
            >
              {SKILL_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            {targetLevel &&
              startLevel &&
              SKILL_LEVELS.findIndex((l) => l.value === targetLevel) <
                SKILL_LEVELS.findIndex((l) => l.value === startLevel) && (
                <p className="text-xs text-amber-600 mt-1">
                  Target should be the same as or higher than start level.
                </p>
              )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-zinc-500">
              Hours per week (optional — used for pacing)
            </Label>
            <Input
              type="number"
              min={0.5}
              step={0.5}
              {...register("hoursPerWeek")}
              placeholder="3"
            />
            <p className="text-xs text-zinc-500">
              Leave blank or set to 3 for a typical part-time pace. This feeds
              the deterministic pacing budget before the AI runs.
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-zinc-500">
              Course length in weeks (optional)
            </Label>
            <Input
              type="number"
              min={MIN_TOTAL_WEEKS}
              max={MAX_TOTAL_WEEKS}
              step={1}
              {...register("weeks")}
              placeholder="Auto — based on your level range"
            />
            {weeksOutOfRange ? (
              <p className="text-xs text-amber-600 mt-1">
                Will be clamped to {MIN_TOTAL_WEEKS}–{MAX_TOTAL_WEEKS} weeks.
              </p>
            ) : (
              <p className="text-xs text-zinc-500">
                Leave blank to let pacing be calculated automatically from your
                starting and target level.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Learning style */}
      <div className={SECTION_CLASS}>
        <Label className="text-xs text-zinc-500">
          Preferred learning styles (optional)
        </Label>
        <LearningStyleField control={control} />
        <p className="text-xs text-zinc-500">
          The AI will bias lesson formats toward the styles you pick.
        </p>
      </div>

      {/* Layout + style (per version) */}
      <div className={SECTION_CLASS}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-zinc-500">Layout</Label>
            <Controller
              name="layout"
              control={control}
              render={({ field }) => (
                <LayoutSelect
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-zinc-500">Style / theme</Label>
            <Controller
              name="style"
              control={control}
              render={({ field }) => (
                <StyleSelect
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="sticky bottom-4 flex justify-end gap-2 rounded-2xl border border-zinc-900/10 bg-white/90 p-3 backdrop-blur dark:border-white/10 dark:bg-zinc-950/90">
        <Button
          type="button"
          variant="outline"
          disabled={submitting !== null}
          onClick={handleSubmit(onSaveDraft)}
        >
          {submitting === "draft" && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save draft
        </Button>
        <Button
          type="button"
          disabled={submitting !== null}
          onClick={handleSubmit(onGenerate)}
        >
          {submitting === "generate" && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Generate curriculum
        </Button>
      </div>

      <GeneratingModal
        key={generatingCourseId ?? "idle"}
        open={!!generatingCourseId}
        title={watchedCourse?.title ?? "your curriculum"}
      />
    </form>
  );
}

export default function CreateCoursePage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-sm text-zinc-500">Loading…</div>}
    >
      <CreateCourseForm />
    </Suspense>
  );
}
