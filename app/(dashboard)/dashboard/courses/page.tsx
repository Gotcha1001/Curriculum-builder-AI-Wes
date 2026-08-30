// app/(dashboard)/dashboard/courses/page.tsx
// (or keep the path as plans/page.tsx for now and just swap the content)
"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Doc } from "@/convex/_generated/dataModel";

// Rotated while a course is generating so the modal feels alive.
const GENERATING_MESSAGES = [
  "Mapping the skill ladder…",
  "Balancing modules to your weekly hours…",
  "Writing lesson objectives and outlines…",
  "Checking prerequisites and level jumps…",
  "Almost there — finalizing your curriculum…",
];

const ORBITS = [
  { radius: 34, duration: 5.5, direction: 1, size: 7, delay: 0 },
  { radius: 34, duration: 5.5, direction: 1, size: 5, delay: 1.83 },
  { radius: 34, duration: 5.5, direction: 1, size: 6, delay: 3.66 },
  { radius: 48, duration: 8, direction: -1, size: 4, delay: 0.9 },
  { radius: 48, duration: 8, direction: -1, size: 4, delay: 4.9 },
];

function GeneratingModal({ open, title }: { open: boolean; title: string }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % GENERATING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [open]);

  return (
    <Dialog open={open}>
      {/* w-[92vw] keeps the dialog off the screen edges on small phones;
          sm:max-w-md caps it once we're past the mobile breakpoint. */}
      <DialogContent
        className="w-[92vw] rounded-xl sm:w-full sm:max-w-md text-center overflow-hidden p-5 sm:p-6"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-40"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 20%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(55% 55% at 80% 30%, rgba(139,92,246,0.30), transparent 60%), radial-gradient(65% 65% at 50% 90%, rgba(217,70,239,0.22), transparent 60%)",
            backgroundSize: "180% 180%",
          }}
          animate={{ backgroundPosition: ["0% 0%", "100% 60%", "0% 0%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <DialogHeader>
          <DialogTitle className="text-center text-base sm:text-lg break-words">
            Generating &quot;{title}&quot;
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-5 sm:gap-6 py-4 sm:py-6">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex items-center justify-center">
            <motion.div
              className="absolute h-20 w-20 sm:h-24 sm:w-24 rounded-full opacity-70 blur-md"
              style={{
                background:
                  "conic-gradient(from 0deg, #6366f1, #8b5cf6, #d946ef, #6366f1)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            {[0, 1, 2].map((ring) => (
              <motion.span
                key={ring}
                className="absolute inset-0 m-auto h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 border-violet-400"
                initial={{ opacity: 0.6, scale: 0.5 }}
                animate={{ opacity: 0, scale: 1.8 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: ring * 0.66,
                  ease: "easeOut",
                }}
              />
            ))}
            {ORBITS.map((orbit, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 m-auto h-0 w-0"
                animate={{ rotate: orbit.direction * 360 }}
                transition={{
                  duration: orbit.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: -orbit.delay,
                }}
              >
                <span
                  className="absolute rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-400 shadow-[0_0_6px_rgba(139,92,246,0.8)]"
                  style={{
                    width: orbit.size,
                    height: orbit.size,
                    top: -orbit.radius,
                    left: -orbit.size / 2,
                  }}
                />
              </motion.div>
            ))}
            <motion.div
              className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-500 flex items-center justify-center text-white text-xl shadow-lg shadow-violet-500/40"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.span
                animate={{ rotate: [0, 15, -10, 0] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ✦
              </motion.span>
            </motion.div>
          </div>

          <div className="h-10 sm:h-5 relative w-full">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={{ duration: 0.35 }}
                className="text-sm font-medium absolute inset-x-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent px-2"
              >
                {GENERATING_MESSAGES[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="h-1.5 w-full rounded-full bg-indigo-950/10 dark:bg-white/10 overflow-hidden">
            <motion.div
              className="h-full w-full rounded-full"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent, #6366f1, #a855f7, #d946ef, transparent)",
                backgroundSize: "60% 100%",
                backgroundRepeat: "no-repeat",
              }}
              animate={{ backgroundPositionX: ["-60%", "160%"] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground px-2">
            Please be patient — this usually takes under a minute.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MyCoursesPage() {
  const courses = useQuery(api.courses.listMyCourses);
  const deleteCourse = useMutation(api.courses.deleteCourse);

  const [watchingId, setWatchingId] = useState<string | null>(null);

  const generatingCourses = useMemo(
    () => (courses ?? []).filter((c) => c.status === "generating"),
    [courses],
  );

  const activeWatchedId =
    watchingId && generatingCourses.some((c) => c._id === watchingId)
      ? watchingId
      : (generatingCourses[0]?._id ?? null);

  const watchedCourse = generatingCourses.find(
    (c) => c._id === activeWatchedId,
  );

  function copyLink(shareId: string) {
    const url = `${window.location.origin}/course/${shareId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }

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

      {/* Padding and top offset scale down on mobile so the page doesn't
          waste ~24px of horizontal space on a 375px-wide screen. */}
      <div className="relative z-10 max-w-3xl mx-auto space-y-3 sm:space-y-4 px-4 sm:px-6 pt-8 sm:pt-16 pb-20">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#12213A] dark:text-[#F6F1E7]">
            My Courses
          </h1>
          <Link href="/dashboard/create">
            <Button size="sm">New course</Button>
          </Link>
        </div>

        {courses?.length === 0 && (
          <p className="text-muted-foreground">
            No courses yet — create your first curriculum.
          </p>
        )}

        {courses?.map((course: Doc<"courses">) => {
          const isGenerating = course.status === "generating";
          return (
            <motion.div
              key={course._id}
              animate={isGenerating ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
              transition={
                isGenerating
                  ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                  : undefined
              }
              // flex-col on mobile: title/badges stack above the action row
              // instead of squeezing into a single horizontal line.
              className={`border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/60 dark:bg-white/5 ${
                isGenerating ? "border-violet-500/60 bg-violet-500/5" : ""
              }`}
            >
              <div className="min-w-0 sm:pr-3">
                <p className="font-medium break-words sm:truncate">
                  {course.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      course.status === "ready"
                        ? "default"
                        : course.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                    className={isGenerating ? "animate-pulse" : ""}
                  >
                    {course.status}
                  </Badge>
                  {course.subject && (
                    <span className="text-xs text-muted-foreground">
                      {course.subject}
                    </span>
                  )}
                  {course.startLevel && course.targetLevel && (
                    <span className="text-xs text-muted-foreground">
                      {course.startLevel} → {course.targetLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* flex-wrap replaces the old rigid single-line row: buttons
                  wrap to a 2nd/3rd line on narrow screens instead of
                  overflowing off the right edge of the card. */}
              <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
                {course.status === "ready" && (
                  <>
                    <a
                      href={`/course/${course.shareId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="contents"
                    >
                      <Button size="sm" variant="outline">
                        Open
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyLink(course.shareId)}
                    >
                      Copy link
                    </Button>
                  </>
                )}

                {isGenerating && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="animate-pulse"
                    onClick={() => setWatchingId(course._id)}
                  >
                    Generating…
                  </Button>
                )}

                <Link
                  href={`/dashboard/create?courseId=${course._id}`}
                  className="contents"
                >
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </Link>

                <Link
                  href={`/dashboard/courses/${course._id}/history`}
                  className="contents"
                >
                  <Button size="sm" variant="outline">
                    History
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Delete this course permanently?")) {
                      deleteCourse({ courseId: course._id });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          );
        })}

        <GeneratingModal
          key={watchedCourse?._id ?? "none"}
          open={!!watchedCourse}
          title={watchedCourse?.title ?? ""}
        />
      </div>
    </div>
  );
}
