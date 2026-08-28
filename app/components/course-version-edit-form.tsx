// components/course-version-edit-form.tsx
//
// TRANSFORMED FROM: components/plan-version-edit-form.tsx
//
// The old form was a flat set of ~10 fixed textareas (one per business-plan
// narrative section), which worked with react-hook-form's normal
// defaultValues/register because GeneratedPlanContent was a flat object.
//
// GeneratedCourseContent isn't flat -- it's modules[] -> lessons[], a
// variable-depth tree whose length depends on what the AI generated for
// THIS course. react-hook-form's register() wants known keys up front, so
// rather than fight useFieldArray for a two-level nested tree, this edits
// a local `content` state directly via small immutable update helpers and
// submits the whole tree in one updateVersionContent call -- same
// same-row-patch behavior as before, just shaped for a tree instead of
// fixed keys.
//
// Same scope decision as the plan version: this only edits what lives on
// courseVersions (style, layout, generatedContent). It does NOT edit
// course-level fields (subject, startLevel/targetLevel, hoursPerWeek) --
// those live on the parent `courses` row via upsertCourse and are shared
// across every version, same reasoning the old comment gave for leaving
// businessPlans.identity out of this form. If per-version editing of
// those wizard fields is wanted later, that's a separate "edit course
// details" form.
//
// Exercises (quiz/practice_task/checklist) are preserved but not
// editable here -- regenerate the version to change them. Flagging as a
// natural follow-up, not a gap introduced by this rewrite.

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type {
  GeneratedCourseContent,
  GeneratedModule,
  GeneratedLesson,
} from "@/lib/curriculum-types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StyleSelect } from "@/app/components/style-select";
import { LayoutSelect } from "@/app/components/layout-select";
import { DEFAULT_PLAN_STYLE_ID } from "@/lib/styles";
import { getCourseLayoutMeta } from "@/lib/course-layouts";
import { toast } from "sonner";

// Same section-card look as app/(dashboard)/dashboard/create/page.tsx so
// every form in the product feels consistent.
const SECTION_CLASS =
  "space-y-3 rounded-2xl border border-zinc-900/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5";

function updateModule(
  content: GeneratedCourseContent,
  moduleIdx: number,
  patch: Partial<GeneratedModule>,
): GeneratedCourseContent {
  return {
    ...content,
    modules: content.modules.map((m, i) =>
      i === moduleIdx ? { ...m, ...patch } : m,
    ),
  };
}

function updateLesson(
  content: GeneratedCourseContent,
  moduleIdx: number,
  lessonIdx: number,
  patch: Partial<GeneratedLesson>,
): GeneratedCourseContent {
  return {
    ...content,
    modules: content.modules.map((m, i) =>
      i !== moduleIdx
        ? m
        : {
            ...m,
            lessons: m.lessons.map((l, j) =>
              j === lessonIdx ? { ...l, ...patch } : l,
            ),
          },
    ),
  };
}

export function CourseVersionEditForm({
  versionId,
  content: initialContent,
  currentStyle,
  currentLayout,
  onSaved,
  onCancel,
}: {
  versionId: Id<"courseVersions">;
  content: GeneratedCourseContent;
  currentStyle?: string;
  currentLayout?: string;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const updateVersionContent = useMutation(api.courses.updateVersionContent);

  const [saving, setSaving] = useState(false);
  const [style, setStyle] = useState<string>(
    currentStyle ?? DEFAULT_PLAN_STYLE_ID,
  );
  const [layout, setLayout] = useState<string>(
    getCourseLayoutMeta(currentLayout).id,
  );
  const [content, setContent] =
    useState<GeneratedCourseContent>(initialContent);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Same-row update: same versionId, no new row created.
      await updateVersionContent({
        versionId,
        generatedContent: content,
        style,
        layout,
      });
      toast.success("Version updated in place");
      onSaved();
    } catch {
      toast.error("Couldn't save — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className={SECTION_CLASS}>
        <h2 className="font-[family-name:var(--font-display)] text-lg text-zinc-900 dark:text-white">
          Appearance
        </h2>
        <div>
          <Label className="text-zinc-900 dark:text-white">Color style</Label>
          <StyleSelect value={style} onValueChange={setStyle} />
        </div>
        <div>
          <Label className="text-zinc-900 dark:text-white">Layout</Label>
          <LayoutSelect value={layout} onValueChange={setLayout} />
        </div>
      </section>

      {content.modules.map((mod, moduleIdx) => (
        <section key={mod.key} className={SECTION_CLASS}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg text-zinc-900 dark:text-white">
              Module {moduleIdx + 1}
            </h2>
            <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {mod.level}
            </span>
          </div>

          <div>
            <Label className="text-zinc-900 dark:text-white">
              Module title
            </Label>
            <Input
              value={mod.title}
              onChange={(e) =>
                setContent((c) =>
                  updateModule(c, moduleIdx, { title: e.target.value }),
                )
              }
            />
          </div>

          <div>
            <Label className="text-zinc-900 dark:text-white">
              Module summary
            </Label>
            <Textarea
              rows={3}
              value={mod.summary}
              onChange={(e) =>
                setContent((c) =>
                  updateModule(c, moduleIdx, { summary: e.target.value }),
                )
              }
            />
          </div>

          <div className="space-y-4 pl-4 border-l border-zinc-900/10 dark:border-white/10">
            {mod.lessons.map((lesson, lessonIdx) => (
              <div key={lesson.key} className="space-y-2">
                <Label className="text-zinc-900 dark:text-white">
                  Lesson {lessonIdx + 1} title
                </Label>
                <Input
                  value={lesson.title}
                  onChange={(e) =>
                    setContent((c) =>
                      updateLesson(c, moduleIdx, lessonIdx, {
                        title: e.target.value,
                      }),
                    )
                  }
                />

                <Label className="text-zinc-900 dark:text-white">Outline</Label>
                <Textarea
                  rows={3}
                  value={lesson.content}
                  onChange={(e) =>
                    setContent((c) =>
                      updateLesson(c, moduleIdx, lessonIdx, {
                        content: e.target.value,
                      }),
                    )
                  }
                />

                <Label className="text-zinc-900 dark:text-white">
                  Objectives (one per line)
                </Label>
                <Textarea
                  rows={3}
                  value={lesson.objectives.join("\n")}
                  onChange={(e) =>
                    setContent((c) =>
                      updateLesson(c, moduleIdx, lessonIdx, {
                        objectives: e.target.value
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }),
                    )
                  }
                />

                <div className="flex items-center gap-2">
                  <Label className="text-zinc-900 dark:text-white shrink-0">
                    Estimated minutes
                  </Label>
                  <Input
                    type="number"
                    className="w-24"
                    value={lesson.estimatedMinutes}
                    onChange={(e) =>
                      setContent((c) =>
                        updateLesson(c, moduleIdx, lessonIdx, {
                          estimatedMinutes: Number(e.target.value) || 0,
                        }),
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={saving}
          className="flex-1 py-6 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30"
        >
          {saving ? "Saving..." : "Save changes to this version"}
        </Button>
      </div>
    </form>
  );
}
