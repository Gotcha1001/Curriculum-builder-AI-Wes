// components/course-layouts/lesson-resource-link.tsx
//
// Renders a Tavily-sourced lesson resource link, or nothing if the lesson
// has no entry in version.lessonLinks yet (link-finding not run, or this
// lesson didn't get a match). Every layout calls this the same way:
//   <LessonResourceLink link={version.lessonLinks?.[lesson.key]} accent={palette.primary} />

import { PlayCircle, FileText, ExternalLink } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

type LessonLink = NonNullable<Doc<"courseVersions">["lessonLinks"]>[string];

const RESOURCE_ICON: Record<LessonLink["resourceType"], typeof ExternalLink> = {
  video: PlayCircle,
  article: FileText,
  scripture: ExternalLink, // TODO: swap resourceType enum for this app's domain
};

export function LessonResourceLink({
  link,
  color,
  className,
}: {
  link?: LessonLink;
  color?: string; // hex, e.g. palette.primary (progress-tracker, cover-banner)
  className?: string; // Tailwind text-color class (syllabus-first, others without a palette)
}) {
  if (!link) return null;
  const Icon = RESOURCE_ICON[link.resourceType] ?? ExternalLink;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium hover:underline ${
        color ? "" : (className ?? "text-blue-600 dark:text-blue-400")
      }`}
      style={color ? { color } : undefined}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate max-w-[280px]">{link.title}</span>
    </a>
  );
}
