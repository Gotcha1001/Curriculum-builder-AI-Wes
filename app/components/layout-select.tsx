// components/layout-select.tsx
//
// TRANSFORMED FROM: components/layout-select.tsx (business-plan version,
// which pointed at lib/layouts.ts's PLAN_LAYOUTS / getPlanLayoutMeta).
//
// This file looked done at a glance -- filename and component name were
// already right -- but it was still wired to the old business-plan layout
// list. Swapped to lib/course-layouts.ts's COURSE_LAYOUTS /
// getCourseLayoutMeta, which is the file schema.ts's courseVersions.layout
// comment already points to.
//
// value/onValueChange are kept as plain `string`, not CourseLayoutId --
// same reasoning as style-select.tsx: Convex's `layout: v.optional(v.string())`
// column is untyped at the schema level, and callers (course-version-edit-form.tsx)
// hold layout in a plain useState<string>. Narrowing here would just force
// casts at every call site for no real safety gain, since getCourseLayoutMeta()
// already falls back safely on an unrecognized value.

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COURSE_LAYOUTS, getCourseLayoutMeta } from "@/lib/course-layouts";

export function LayoutSelect({
  value,
  onValueChange,
}: {
  value: string | undefined;
  onValueChange: (id: string) => void;
}) {
  return (
    <Select value={getCourseLayoutMeta(value).id} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choose a layout" />
      </SelectTrigger>
      <SelectContent>
        {COURSE_LAYOUTS.map((layout) => (
          <SelectItem key={layout.id} value={layout.id}>
            {layout.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
