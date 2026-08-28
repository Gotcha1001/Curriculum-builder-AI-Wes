// components/readiness-badge.tsx
//
// TRANSFORMED FROM: components/viability-badge.tsx
//
// Reads version.readinessAnalysis (score/flags/suggestions, computed
// deterministically by lib/curriculum-pacing.ts's computeReadiness() --
// never by the AI). Same role viability-badge.tsx played for financial
// viability, same 80/55 score thresholds as
// lib/pdf-layouts/*.tsx's scoreLabel() -- keep these in sync.

import { AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

type ReadinessAnalysis = Doc<"courseVersions">["readinessAnalysis"];

function scoreBand(score: number): { label: string; classes: string } {
  if (score >= 80) {
    return {
      label: "Ready",
      classes:
        "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    };
  }
  if (score >= 55) {
    return {
      label: "Mostly ready",
      classes:
        "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    };
  }
  return {
    label: "Needs work",
    classes:
      "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
  };
}

export function scoreLabel(score: number): string {
  return scoreBand(score).label;
}

export function ReadinessBadge({
  readiness,
  showDetails = true,
}: {
  readiness: ReadinessAnalysis;
  /** Compact mode (no flags/suggestions) for use in list rows or headers. */
  showDetails?: boolean;
}) {
  if (!readiness) return null;
  const { score, flags, suggestions } = readiness;
  const band = scoreBand(score);

  return (
    <div className="space-y-3">
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${band.classes}`}
      >
        {score >= 80 ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        Readiness score: {score}/100 &middot; {band.label}
      </div>

      {showDetails && flags.length > 0 && (
        <ul className="space-y-1.5">
          {flags.map((flag, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
              <span>{flag}</span>
            </li>
          ))}
        </ul>
      )}

      {showDetails && suggestions.length > 0 && (
        <ul className="space-y-1.5">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-sky-500" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
