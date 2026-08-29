// components/style-select.tsx
//
// UPDATED: now imports the renamed lib/styles.ts identifiers directly
// (COURSE_STYLES / getCourseStyle / CourseStyleCategory) instead of the
// old Plan* names. No behavior change -- this file's own logic (grouping
// by category in the dropdown) was already correct, it just tracked
// lib/styles.ts's naming debt. See MIGRATION.md for the full rename list.
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
  COURSE_STYLES,
  getCourseStyle,
  type CourseStyleCategory,
} from "@/lib/styles";
const CATEGORY_LABEL: Record<CourseStyleCategory, string> = {
  neutral: "Neutral",
  color: "Color",
  gradient: "Gradient",
};
const CATEGORY_ORDER: CourseStyleCategory[] = ["neutral", "color", "gradient"];
export function StyleSelect({
  value,
  onValueChange,
}: {
  value: string | undefined;
  onValueChange: (id: string) => void;
}) {
  return (
    <Select value={getCourseStyle(value).id} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choose a color style" />
      </SelectTrigger>
      <SelectContent>
        {CATEGORY_ORDER.map((category) => {
          const themes = COURSE_STYLES.filter((s) => s.category === category);
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
