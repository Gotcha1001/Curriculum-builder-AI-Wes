// app/(dashboard)/dashboard/courses/[courseId]/history/[versionId]/edit/page.tsx
//
// TRANSFORMED FROM:
// app/(dashboard)/dashboard/plans/[planId]/history/[versionId]/edit/page.tsx
// (itself transformed from .../cvs/[cvId]/history/[versionId]/edit/page.tsx)
//
// This is the file the punch list flagged as a path fossil -- the doc had
// it doing a SECOND transform in-place (cvs -> plans path, still calling
// api.businessPlans.*) rather than the full cvs -> courses jump. Moved to
// the courses route and rewired to courses.ts / course-version-edit-form.tsx.
//
// Like the old plans version, this form doesn't touch anything at the
// course level (see the long comment in course-version-edit-form.tsx for
// why) -- just the version itself, via getCourseVersionContent.

"use client";

import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CourseVersionEditForm } from "@/app/components/course-version-edit-form";
import type { GeneratedCourseContent } from "@/lib/curriculum-types";
import Image from "next/image";

export default function EditCourseVersionPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.courseId as Id<"courses"> | undefined;
  const versionId = params.versionId as Id<"courseVersions"> | undefined;

  const version = useQuery(
    api.courses.getCourseVersionContent,
    versionId ? { versionId } : "skip",
  );

  function backToHistory() {
    router.push(`/dashboard/courses/${courseId}/history`);
  }

  if (!courseId || !versionId) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center text-muted-foreground">
        Missing course or version id.
      </div>
    );
  }

  const stillLoading = version === undefined;
  const notFound = version === null;

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <Image
        src="/cvcolleague.jpg"
        alt=""
        fill
        priority
        className="object-cover opacity-20 dark:opacity-10 -z-10 pointer-events-none select-none"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-950/30 via-slate-900/20 to-purple-950/35 dark:from-indigo-950/40 dark:via-black/60 dark:to-purple-950/30 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-8 px-6 pt-16 pb-20">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium tracking-wide uppercase text-purple-600 dark:text-purple-400">
              Update this version
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight text-zinc-900 dark:text-white">
              Edit v{version?.versionNumber ?? "..."}
              {version?.label ? ` — ${version.label}` : ""}
            </h1>
            <p className="mt-2 text-sm text-zinc-900/70 dark:text-white/70">
              Changes save in place to this version — no new row is created.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={backToHistory}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to history
          </Button>
        </div>

        {stillLoading && !notFound && (
          <div className="text-sm text-zinc-900/60 dark:text-white/60 py-16 text-center">
            Loading version...
          </div>
        )}

        {notFound && (
          <div className="text-sm text-zinc-900/60 dark:text-white/60 py-16 text-center">
            Version not found, or you don&apos;t have access to it.
          </div>
        )}

        {version && (
          <CourseVersionEditForm
            versionId={version._id}
            content={version.generatedContent as GeneratedCourseContent}
            currentStyle={version.style}
            currentLayout={version.layout}
            onSaved={backToHistory}
            onCancel={backToHistory}
          />
        )}
      </div>
    </div>
  );
}
