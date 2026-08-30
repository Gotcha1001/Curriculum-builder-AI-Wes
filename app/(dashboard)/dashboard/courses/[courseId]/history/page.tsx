// app/(dashboard)/dashboard/courses/[courseId]/history/page.tsx
//
// Version history gallery for a single course. Lists every row in
// courseVersions (append-only — one per regeneration or restyle) via
// listCourseVersions, and lets the user switch which version is live
// (setActiveVersion), jump into the in-place editor for a version
// (history/[versionId]/edit — already exists), or permanently remove a
// version (deleteVersion). Mirrors the visual treatment of the course
// detail / edit pages (same background photo + gradient, same card
// style as the courses list).

// app/(dashboard)/dashboard/courses/[courseId]/history/page.tsx
//
// Version history gallery for a single course. Lists every row in
// courseVersions (append-only — one per regeneration or restyle) via
// listCourseVersions, and lets the user switch which version is live
// (setActiveVersion), jump into the in-place editor for a version
// (history/[versionId]/edit — already exists), or permanently remove a
// version (deleteVersion). Mirrors the visual treatment of the course
// detail / edit pages (same background photo + gradient, same card
// style as the courses list).

"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { scoreLabel } from "@/app/components/readiness-badge";

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type PendingAction = {
  id: Id<"courseVersions">;
  kind: "activate" | "delete";
};

export default function CourseHistoryPage() {
  const params = useParams();
  const courseId = params.courseId as Id<"courses"> | undefined;

  if (!courseId) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center text-muted-foreground">
        Missing course id.
      </div>
    );
  }

  // Hand off to a component that takes courseId as a required prop, so its
  // type is Id<"courses"> at every use site below — no closure narrowing
  // involved, so this can't regress if a new handler gets added later.
  return <CourseHistoryView courseId={courseId} />;
}

function CourseHistoryView({ courseId }: { courseId: Id<"courses"> }) {
  const router = useRouter();

  const course = useQuery(api.courses.getCourse, { courseId });
  const versions = useQuery(api.courses.listCourseVersions, { courseId });

  const setActiveVersion = useMutation(api.courses.setActiveVersion);
  const deleteVersion = useMutation(api.courses.deleteVersion);

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  async function handleSetActive(versionId: Id<"courseVersions">) {
    setPendingAction({ id: versionId, kind: "activate" });
    try {
      await setActiveVersion({ courseId, versionId });
      toast.success("Active version updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to set active version",
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDelete(versionId: Id<"courseVersions">) {
    if (!confirm("Delete this version permanently? This can't be undone."))
      return;
    setPendingAction({ id: versionId, kind: "delete" });
    try {
      await deleteVersion({ versionId });
      toast.success("Version deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete version",
      );
    } finally {
      setPendingAction(null);
    }
  }

  const stillLoading = versions === undefined || course === undefined;
  const notFound = course === null;

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

      <div className="relative z-10 max-w-3xl mx-auto space-y-6 px-4 sm:px-6 pt-8 sm:pt-16 pb-20">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium tracking-wide uppercase text-purple-600 dark:text-purple-400">
              Version history
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-medium tracking-tight text-zinc-900 dark:text-white">
              {course?.title ?? "…"}
            </h1>
            <p className="mt-2 text-sm text-zinc-900/70 dark:text-white/70">
              Every regeneration and restyle is kept here. Switch which version
              is live, edit one in place, or delete ones you no longer need.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/courses")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to courses
          </Button>
        </div>

        {stillLoading && !notFound && (
          <div className="text-sm text-zinc-900/60 dark:text-white/60 py-16 text-center">
            Loading history…
          </div>
        )}

        {notFound && (
          <div className="text-sm text-zinc-900/60 dark:text-white/60 py-16 text-center">
            Course not found, or you don&apos;t have access to it.
          </div>
        )}

        {versions?.length === 0 && (
          <div className="text-sm text-zinc-900/60 dark:text-white/60 py-16 text-center">
            No versions yet — generate this course to create the first one.
          </div>
        )}

        {versions?.map((version) => {
          const isBusy = pendingAction?.id === version._id;
          const isPendingActivate =
            isBusy && pendingAction?.kind === "activate";
          const isPendingDelete = isBusy && pendingAction?.kind === "delete";

          return (
            <motion.div
              key={version._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-4 sm:p-5 bg-white/60 dark:bg-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                version.isActive
                  ? "border-purple-600/40 dark:border-purple-400/40"
                  : "border-zinc-900/10 dark:border-white/10"
              }`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-zinc-900 dark:text-white">
                    Version {version.versionNumber}
                    {version.label ? ` — ${version.label}` : ""}
                  </p>
                  {version.isActive && (
                    <Badge className="bg-purple-600 hover:bg-purple-600 text-white">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                  {version.readinessScore !== undefined && (
                    <Badge variant="outline">
                      {scoreLabel(version.readinessScore)} ·{" "}
                      {version.readinessScore}/100
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-zinc-900/60 dark:text-white/60">
                  {formatDate(version.createdAt)}
                  {version.style ? ` · ${version.style}` : ""}
                  {version.layout ? ` · ${version.layout}` : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!version.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => handleSetActive(version._id)}
                  >
                    {isPendingActivate && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Set active
                  </Button>
                )}
                {version.isActive && course?.shareId && (
                  <a
                    href={`/course/${course.shareId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="contents"
                  >
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View live
                    </Button>
                  </a>
                )}
                <Link
                  href={`/dashboard/courses/${courseId}/history/${version._id}/edit`}
                  className="contents"
                >
                  <Button size="sm" variant="outline">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isBusy}
                  onClick={() => handleDelete(version._id)}
                >
                  {isPendingDelete && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
