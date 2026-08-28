// lib/chart-theme.ts
//
// Derives chart-safe color values from a CourseStyleTheme. This exists
// because theme.web.* (see lib/styles.ts's PlanStyleTheme) are Tailwind
// CLASS STRINGS ("text-blue-600", "bg-amber-100 text-amber-800", ...),
// which recharts <Bar fill=.../>, <Cell fill=.../>, and react-pdf's
// StyleSheet can't consume -- those need real CSS color values.
//
// theme.pdf.* is the only place on CourseStyleTheme that already holds
// real hex colors (it has to, since react-pdf styles require literal
// CSS values), so this derives the whole chart palette from there
// instead of inventing a second color source that could drift from the
// theme's actual accent.
//
// Contract (confirmed from call sites in both renderers):
//   - primary / secondary -> bar and pie-slice fills
//     (components/course-layouts/progress-tracker.tsx,
//      lib/pdf-layouts/progress-tracker.tsx)
//   - text / grid -> axis tick color and axis line / "remaining" slice
//     (web progress-tracker.tsx only -- react-pdf draws its own static
//      bar tracks and doesn't need these)

import type { CourseStyleTheme } from "./curriculum-data";

export interface ChartPalette {
  /** Primary series -- "actual/generated" bars, completed pie slice. */
  primary: string;
  /** Secondary series -- "budgeted" bars. Derived from the theme's pill
   * background, which is already a lighter tint of the same accent hue
   * as `primary` in every style in PLAN_STYLES. */
  secondary: string;
  /** Axis tick label color. Neutral so it reads on every theme, including "neutral" itself. */
  text: string;
  /** Axis line / grid stroke, and the "remaining" (incomplete) pie slice. */
  grid: string;
}

export function getChartPalette(theme: CourseStyleTheme): ChartPalette {
  return {
    primary: theme.pdf.headline,
    secondary: theme.pdf.pillBg,
    text: "#6B7280", // tailwind gray-500 -- deliberately theme-independent, chart labels shouldn't compete with the accent color
    grid: "#E5E7EB", // tailwind gray-200
  };
}
