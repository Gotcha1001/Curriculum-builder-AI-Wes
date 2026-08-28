// components/style-select.tsx
//
// MISSING FROM THE TRANSFORM DOC -- the heading for this file was present
// but the body was empty. Nothing to convert *from* here since course-
// version-edit-form.tsx and the create wizard both already import
// `StyleSelect` from "@/app/components/style-select" expecting it to
// exist, so this is a straight rebuild against the current
// lib/styles.ts API (PLAN_STYLES / PlanStyleTheme / getPlanStyle),
// which itself hasn't been renamed yet -- see the note below.
//
// Modeled on layout-select.tsx's shape (same value/onValueChange
// contract), but grouped by PlanStyleTheme.category (neutral/color/
// gradient) since -- unlike CourseLayoutMeta -- styles actually have
// categories worth separating in the dropdown.
//
// NOTE: lib/styles.ts still uses "Plan" naming (PlanStyleTheme,
// PLAN_STYLES, DEFAULT_PLAN_STYLE_ID, getPlanStyle) even though nothing
// here is business-plan-specific anymore -- it's just a color/typography
// theme now, used identically for courses. That's a pure rename
// (PlanStyleTheme -> CourseStyleTheme, etc.), not a logic change, so it's
// safe to leave for a later cleanup pass rather than block on it now.
// This file already isolates that naming behind its own import, so
// renaming lib/styles.ts later won't touch anything outside these two
// lines.

"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PLAN_STYLES,
  getPlanStyle,
  type PlanStyleCategory,
} from "@/lib/styles";

const CATEGORY_LABEL: Record<PlanStyleCategory, string> = {
  neutral: "Neutral",
  color: "Color",
  gradient: "Gradient",
};

const CATEGORY_ORDER: PlanStyleCategory[] = ["neutral", "color", "gradient"];

export function StyleSelect({
  value,
  onValueChange,
}: {
  value: string | undefined;
  onValueChange: (id: string) => void;
}) {
  return (
    <Select value={getPlanStyle(value).id} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choose a color style" />
      </SelectTrigger>
      <SelectContent>
        {CATEGORY_ORDER.map((category) => {
          const themes = PLAN_STYLES.filter((s) => s.category === category);
          if (themes.length === 0) return null;
          return (
            <SelectGroup key={category}>
              <SelectLabel>{CATEGORY_LABEL[category]}</SelectLabel>
              {themes.map((theme) => (
                <SelectItem key={theme.id} value={theme.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${theme.swatch}`}
                    />
                    {theme.name}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          );
        })}
      </SelectContent>
    </Select>
  );
}
