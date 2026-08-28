// // lib/styles.ts
// //
// // Central registry of CV color themes. A CV stores the chosen theme's `id`
// // on `cv.style` (see convex/schema.ts). Both the live web preview
// // (components/cv-preview.tsx) and the PDF renderer
// // (app/api/cv/[shareId]/pdf/route.tsx) read from here, so every surface
// // stays in sync when a theme is added or tweaked.
// //
// // - `web` holds Tailwind classes for the animated/dashboard view.
// // - `pdf` holds hex colors for @react-pdf/renderer, which can't render
// //   Tailwind classes or CSS gradients — gradient themes fall back to a
// //   representative solid hex for print.

// export type CvStyleCategory = "neutral" | "color" | "gradient";

// export interface CvStyleTheme {
//   id: string;
//   name: string;
//   category: CvStyleCategory;
//   description: string;
//   /** Small Tailwind bg-* class used to render a swatch dot in the dropdown. */
//   swatch: string;
//   web: {
//     /** Name/H1 treatment. Gradient themes use bg-clip-text here. */
//     heading: string;
//     /** Headline, section accents, closing note. */
//     accentText: string;
//     /** Timeline border-l color, full strength. */
//     border: string;
//     /** Timeline border-l color, softened (education/achievements). */
//     borderSoft: string;
//     /** Download button. */
//     button: string;
//     /** Skill / interest pills. */
//     pill: string;
//     /** Link text (in Links section). */
//     link: string;
//   };
//   pdf: {
//     headline: string;
//     accentBorder: string;
//     pillBg: string;
//     pillText: string;
//     link: string;
//     closingNote: string;
//   };
// }

// export const CV_STYLES: CvStyleTheme[] = [
//   {
//     id: "neutral",
//     name: "Neutral",
//     category: "neutral",
//     description:
//       "Minimal grayscale — no color accents, safest for conservative industries.",
//     swatch: "bg-slate-400",
//     web: {
//       heading: "text-slate-900 dark:text-slate-100",
//       accentText: "text-slate-500 dark:text-slate-400",
//       border: "border-slate-400",
//       borderSoft: "border-slate-400/50",
//       button: "bg-slate-700 hover:bg-slate-600 text-white",
//       pill: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
//       link: "text-slate-600 dark:text-slate-300",
//     },
//     pdf: {
//       headline: "#475569",
//       accentBorder: "#475569",
//       pillBg: "#F1F5F9",
//       pillText: "#334155",
//       link: "#475569",
//       closingNote: "#475569",
//     },
//   },
//   {
//     id: "amber-classic",
//     name: "Classic Amber",
//     category: "color",
//     description: "The original warm amber look.",
//     swatch: "bg-amber-500",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-amber-600",
//       border: "border-amber-500",
//       borderSoft: "border-amber-500/60",
//       button: "bg-amber-600 hover:bg-amber-500 text-white",
//       pill: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
//       link: "text-amber-600 hover:underline",
//     },
//     pdf: {
//       headline: "#B45309",
//       accentBorder: "#B45309",
//       pillBg: "#FEF3C7",
//       pillText: "#92400E",
//       link: "#B45309",
//       closingNote: "#B45309",
//     },
//   },
//   {
//     id: "ocean-blue",
//     name: "Ocean Blue",
//     category: "color",
//     description: "Confident solid blue — clean and corporate.",
//     swatch: "bg-blue-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-blue-600",
//       border: "border-blue-500",
//       borderSoft: "border-blue-500/60",
//       button: "bg-blue-600 hover:bg-blue-500 text-white",
//       pill: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
//       link: "text-blue-600 hover:underline",
//     },
//     pdf: {
//       headline: "#1D4ED8",
//       accentBorder: "#1D4ED8",
//       pillBg: "#DBEAFE",
//       pillText: "#1E40AF",
//       link: "#1D4ED8",
//       closingNote: "#1D4ED8",
//     },
//   },
//   {
//     id: "blue-gradient",
//     name: "Blue Gradient",
//     category: "gradient",
//     description: "Sky-to-indigo gradient — modern, tech-forward.",
//     swatch: "bg-gradient-to-r from-sky-500 to-indigo-600",
//     web: {
//       heading:
//         "bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent",
//       accentText: "text-blue-600 dark:text-blue-400",
//       border: "border-blue-500",
//       borderSoft: "border-blue-500/60",
//       button:
//         "bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 text-white",
//       pill: "bg-gradient-to-r from-sky-100 to-indigo-100 text-indigo-800 dark:from-sky-900/40 dark:to-indigo-900/40 dark:text-indigo-300",
//       link: "text-indigo-600 hover:underline",
//     },
//     pdf: {
//       headline: "#3B57D6",
//       accentBorder: "#3B57D6",
//       pillBg: "#E0E7FF",
//       pillText: "#3730A3",
//       link: "#3B57D6",
//       closingNote: "#3B57D6",
//     },
//   },
//   {
//     id: "emerald",
//     name: "Emerald",
//     category: "color",
//     description: "Fresh green — growth, sustainability, health roles.",
//     swatch: "bg-emerald-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-emerald-600",
//       border: "border-emerald-500",
//       borderSoft: "border-emerald-500/60",
//       button: "bg-emerald-600 hover:bg-emerald-500 text-white",
//       pill: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
//       link: "text-emerald-600 hover:underline",
//     },
//     pdf: {
//       headline: "#047857",
//       accentBorder: "#047857",
//       pillBg: "#D1FAE5",
//       pillText: "#065F46",
//       link: "#047857",
//       closingNote: "#047857",
//     },
//   },
//   {
//     id: "royal-violet",
//     name: "Royal Violet",
//     category: "color",
//     description: "Rich purple — creative and design-oriented roles.",
//     swatch: "bg-violet-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-violet-600",
//       border: "border-violet-500",
//       borderSoft: "border-violet-500/60",
//       button: "bg-violet-600 hover:bg-violet-500 text-white",
//       pill: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
//       link: "text-violet-600 hover:underline",
//     },
//     pdf: {
//       headline: "#6D28D9",
//       accentBorder: "#6D28D9",
//       pillBg: "#EDE9FE",
//       pillText: "#5B21B6",
//       link: "#6D28D9",
//       closingNote: "#6D28D9",
//     },
//   },
//   {
//     id: "crimson",
//     name: "Crimson",
//     category: "color",
//     description: "Bold red — stands out, high energy.",
//     swatch: "bg-rose-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-rose-600",
//       border: "border-rose-500",
//       borderSoft: "border-rose-500/60",
//       button: "bg-rose-600 hover:bg-rose-500 text-white",
//       pill: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
//       link: "text-rose-600 hover:underline",
//     },
//     pdf: {
//       headline: "#BE123C",
//       accentBorder: "#BE123C",
//       pillBg: "#FFE4E6",
//       pillText: "#9F1239",
//       link: "#BE123C",
//       closingNote: "#BE123C",
//     },
//   },
//   {
//     id: "lava",
//     name: "Lava",
//     category: "gradient",
//     description: "Red-orange-yellow gradient — fiery and attention-grabbing.",
//     swatch: "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500",
//     web: {
//       heading:
//         "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent",
//       accentText: "text-orange-600 dark:text-orange-400",
//       border: "border-orange-600",
//       borderSoft: "border-orange-600/60",
//       button:
//         "bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-90 text-white",
//       pill: "bg-gradient-to-r from-red-100 to-orange-100 text-red-800 dark:from-red-900/40 dark:to-orange-900/40 dark:text-orange-300",
//       link: "text-orange-600 hover:underline",
//     },
//     pdf: {
//       headline: "#C2410C",
//       accentBorder: "#C2410C",
//       pillBg: "#FFEDD5",
//       pillText: "#9A3412",
//       link: "#C2410C",
//       closingNote: "#C2410C",
//     },
//   },
//   {
//     id: "midnight-gradient",
//     name: "Midnight Gradient",
//     category: "gradient",
//     description: "Indigo-to-fuchsia gradient — striking, dark-mode-friendly.",
//     swatch: "bg-gradient-to-r from-indigo-500 to-fuchsia-600",
//     web: {
//       heading:
//         "bg-gradient-to-r from-indigo-500 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent",
//       accentText: "text-indigo-500 dark:text-indigo-400",
//       border: "border-indigo-500",
//       borderSoft: "border-indigo-500/60",
//       button:
//         "bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:opacity-90 text-white",
//       pill: "bg-gradient-to-r from-indigo-100 to-fuchsia-100 text-indigo-800 dark:from-indigo-900/40 dark:to-fuchsia-900/40 dark:text-fuchsia-300",
//       link: "text-fuchsia-600 hover:underline",
//     },
//     pdf: {
//       headline: "#7C3AED",
//       accentBorder: "#7C3AED",
//       pillBg: "#EDE9FE",
//       pillText: "#6D28D9",
//       link: "#7C3AED",
//       closingNote: "#7C3AED",
//     },
//   },
//   {
//     id: "teal-breeze",
//     name: "Teal Breeze",
//     category: "color",
//     description: "Calm teal — approachable, wellness and service roles.",
//     swatch: "bg-teal-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-teal-600",
//       border: "border-teal-500",
//       borderSoft: "border-teal-500/60",
//       button: "bg-teal-600 hover:bg-teal-500 text-white",
//       pill: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
//       link: "text-teal-600 hover:underline",
//     },
//     pdf: {
//       headline: "#0F766E",
//       accentBorder: "#0F766E",
//       pillBg: "#CCFBF1",
//       pillText: "#115E59",
//       link: "#0F766E",
//       closingNote: "#0F766E",
//     },
//   },
// ];

// export const DEFAULT_CV_STYLE_ID = "neutral";

// /** Look up a theme by id, falling back to the default when missing/unset. */
// export function getCvStyle(id?: string | null): CvStyleTheme {
//   return (
//     CV_STYLES.find((s) => s.id === id) ??
//     CV_STYLES.find((s) => s.id === DEFAULT_CV_STYLE_ID)!
//   );
// }
// lib/styles.ts
//
// Central registry of CV color themes. A CV stores the chosen theme's `id`
// on `cv.style` (see convex/schema.ts). Both the live web preview
// (components/cv-preview.tsx) and the PDF renderer
// (app/api/cv/[shareId]/pdf/route.tsx) read from here, so every surface
// stays in sync when a theme is added or tweaked.
//
// - `web` holds Tailwind classes for the animated/dashboard view.
// - `pdf` holds hex colors for @react-pdf/renderer, which can't render
//   Tailwind classes or CSS gradients — gradient themes fall back to a
//   representative solid hex for print.

// export type CvStyleCategory = "neutral" | "color" | "gradient";

// export interface CvStyleTheme {
//   id: string;
//   name: string;
//   category: CvStyleCategory;
//   description: string;
//   /** Small Tailwind bg-* class used to render a swatch dot in the dropdown. */
//   swatch: string;
//   web: {
//     /** Name/H1 treatment. Gradient themes use bg-clip-text here. */
//     heading: string;
//     /** Headline, section accents, closing note. */
//     accentText: string;
//     /** Timeline border-l color, full strength. */
//     border: string;
//     /** Timeline border-l color, softened (education/achievements). */
//     borderSoft: string;
//     /** Download button. */
//     button: string;
//     /** Skill / interest pills. */
//     pill: string;
//     /** Link text (in Links section). */
//     link: string;
//   };
//   pdf: {
//     headline: string;
//     accentBorder: string;
//     pillBg: string;
//     pillText: string;
//     link: string;
//     closingNote: string;
//   };
// }

// export const CV_STYLES: CvStyleTheme[] = [
//   {
//     id: "neutral",
//     name: "Neutral",
//     category: "neutral",
//     description:
//       "Minimal grayscale — no color accents, safest for conservative industries.",
//     swatch: "bg-slate-400",
//     web: {
//       heading: "text-slate-900 dark:text-slate-100",
//       accentText: "text-slate-500 dark:text-slate-400",
//       border: "border-slate-400",
//       borderSoft: "border-slate-400/50",
//       button: "bg-slate-700 hover:bg-slate-600 text-white",
//       pill: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
//       link: "text-slate-600 dark:text-slate-300",
//     },
//     pdf: {
//       headline: "#475569",
//       accentBorder: "#475569",
//       pillBg: "#F1F5F9",
//       pillText: "#334155",
//       link: "#475569",
//       closingNote: "#475569",
//     },
//   },
//   {
//     id: "amber-classic",
//     name: "Classic Amber",
//     category: "color",
//     description: "The original warm amber look.",
//     swatch: "bg-amber-500",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-amber-600",
//       border: "border-amber-500",
//       borderSoft: "border-amber-500/60",
//       button: "bg-amber-600 hover:bg-amber-500 text-white",
//       pill: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
//       link: "text-amber-600 hover:underline",
//     },
//     pdf: {
//       headline: "#B45309",
//       accentBorder: "#B45309",
//       pillBg: "#FEF3C7",
//       pillText: "#92400E",
//       link: "#B45309",
//       closingNote: "#B45309",
//     },
//   },
//   {
//     id: "ocean-blue",
//     name: "Ocean Blue",
//     category: "color",
//     description: "Confident solid blue — clean and corporate.",
//     swatch: "bg-blue-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-blue-600",
//       border: "border-blue-500",
//       borderSoft: "border-blue-500/60",
//       button: "bg-blue-600 hover:bg-blue-500 text-white",
//       pill: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
//       link: "text-blue-600 hover:underline",
//     },
//     pdf: {
//       headline: "#1D4ED8",
//       accentBorder: "#1D4ED8",
//       pillBg: "#DBEAFE",
//       pillText: "#1E40AF",
//       link: "#1D4ED8",
//       closingNote: "#1D4ED8",
//     },
//   },
//   {
//     id: "blue-gradient",
//     name: "Blue Gradient",
//     category: "gradient",
//     description: "Sky-to-indigo gradient — modern, tech-forward.",
//     swatch: "bg-gradient-to-r from-sky-500 to-indigo-600",
//     web: {
//       heading:
//         "bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent",
//       accentText: "text-blue-600 dark:text-blue-400",
//       border: "border-blue-500",
//       borderSoft: "border-blue-500/60",
//       button:
//         "bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 text-white",
//       pill: "bg-gradient-to-r from-sky-100 to-indigo-100 text-indigo-800 dark:from-sky-900/40 dark:to-indigo-900/40 dark:text-indigo-300",
//       link: "text-indigo-600 hover:underline",
//     },
//     pdf: {
//       headline: "#3B57D6",
//       accentBorder: "#3B57D6",
//       pillBg: "#E0E7FF",
//       pillText: "#3730A3",
//       link: "#3B57D6",
//       closingNote: "#3B57D6",
//     },
//   },
//   {
//     id: "emerald",
//     name: "Emerald",
//     category: "color",
//     description: "Fresh green — growth, sustainability, health roles.",
//     swatch: "bg-emerald-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-emerald-600",
//       border: "border-emerald-500",
//       borderSoft: "border-emerald-500/60",
//       button: "bg-emerald-600 hover:bg-emerald-500 text-white",
//       pill: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
//       link: "text-emerald-600 hover:underline",
//     },
//     pdf: {
//       headline: "#047857",
//       accentBorder: "#047857",
//       pillBg: "#D1FAE5",
//       pillText: "#065F46",
//       link: "#047857",
//       closingNote: "#047857",
//     },
//   },
//   {
//     id: "royal-violet",
//     name: "Royal Violet",
//     category: "color",
//     description: "Rich purple — creative and design-oriented roles.",
//     swatch: "bg-violet-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-violet-600",
//       border: "border-violet-500",
//       borderSoft: "border-violet-500/60",
//       button: "bg-violet-600 hover:bg-violet-500 text-white",
//       pill: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
//       link: "text-violet-600 hover:underline",
//     },
//     pdf: {
//       headline: "#6D28D9",
//       accentBorder: "#6D28D9",
//       pillBg: "#EDE9FE",
//       pillText: "#5B21B6",
//       link: "#6D28D9",
//       closingNote: "#6D28D9",
//     },
//   },
//   {
//     id: "crimson",
//     name: "Crimson",
//     category: "color",
//     description: "Bold red — stands out, high energy.",
//     swatch: "bg-rose-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-rose-600",
//       border: "border-rose-500",
//       borderSoft: "border-rose-500/60",
//       button: "bg-rose-600 hover:bg-rose-500 text-white",
//       pill: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
//       link: "text-rose-600 hover:underline",
//     },
//     pdf: {
//       headline: "#BE123C",
//       accentBorder: "#BE123C",
//       pillBg: "#FFE4E6",
//       pillText: "#9F1239",
//       link: "#BE123C",
//       closingNote: "#BE123C",
//     },
//   },
//   {
//     id: "lava",
//     name: "Lava",
//     category: "gradient",
//     description: "Red-orange-yellow gradient — fiery and attention-grabbing.",
//     swatch: "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500",
//     web: {
//       heading:
//         "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent",
//       accentText: "text-orange-600 dark:text-orange-400",
//       border: "border-orange-600",
//       borderSoft: "border-orange-600/60",
//       button:
//         "bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-90 text-white",
//       pill: "bg-gradient-to-r from-red-100 to-orange-100 text-red-800 dark:from-red-900/40 dark:to-orange-900/40 dark:text-orange-300",
//       link: "text-orange-600 hover:underline",
//     },
//     pdf: {
//       headline: "#C2410C",
//       accentBorder: "#C2410C",
//       pillBg: "#FFEDD5",
//       pillText: "#9A3412",
//       link: "#C2410C",
//       closingNote: "#C2410C",
//     },
//   },
//   {
//     id: "midnight-gradient",
//     name: "Midnight Gradient",
//     category: "gradient",
//     description: "Indigo-to-fuchsia gradient — striking, dark-mode-friendly.",
//     swatch: "bg-gradient-to-r from-indigo-500 to-fuchsia-600",
//     web: {
//       heading:
//         "bg-gradient-to-r from-indigo-500 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent",
//       accentText: "text-indigo-500 dark:text-indigo-400",
//       border: "border-indigo-500",
//       borderSoft: "border-indigo-500/60",
//       button:
//         "bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:opacity-90 text-white",
//       pill: "bg-gradient-to-r from-indigo-100 to-fuchsia-100 text-indigo-800 dark:from-indigo-900/40 dark:to-fuchsia-900/40 dark:text-fuchsia-300",
//       link: "text-fuchsia-600 hover:underline",
//     },
//     pdf: {
//       headline: "#7C3AED",
//       accentBorder: "#7C3AED",
//       pillBg: "#EDE9FE",
//       pillText: "#6D28D9",
//       link: "#7C3AED",
//       closingNote: "#7C3AED",
//     },
//   },
//   {
//     id: "teal-breeze",
//     name: "Teal Breeze",
//     category: "color",
//     description: "Calm teal — approachable, wellness and service roles.",
//     swatch: "bg-teal-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-teal-600",
//       border: "border-teal-500",
//       borderSoft: "border-teal-500/60",
//       button: "bg-teal-600 hover:bg-teal-500 text-white",
//       pill: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
//       link: "text-teal-600 hover:underline",
//     },
//     pdf: {
//       headline: "#0F766E",
//       accentBorder: "#0F766E",
//       pillBg: "#CCFBF1",
//       pillText: "#115E59",
//       link: "#0F766E",
//       closingNote: "#0F766E",
//     },
//   },
//   {
//     id: "cyan-steel",
//     name: "Cyan Steel",
//     category: "color",
//     description: "Cool cyan — technical, precise, engineering-forward.",
//     swatch: "bg-cyan-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-cyan-600",
//       border: "border-cyan-500",
//       borderSoft: "border-cyan-500/60",
//       button: "bg-cyan-600 hover:bg-cyan-500 text-white",
//       pill: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
//       link: "text-cyan-600 hover:underline",
//     },
//     pdf: {
//       headline: "#0E7490",
//       accentBorder: "#0E7490",
//       pillBg: "#CFFAFE",
//       pillText: "#155E75",
//       link: "#0E7490",
//       closingNote: "#0E7490",
//     },
//   },
//   {
//     id: "blush-pink",
//     name: "Blush Pink",
//     category: "color",
//     description: "Soft pink — friendly and personable, stands out subtly.",
//     swatch: "bg-pink-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-pink-600",
//       border: "border-pink-500",
//       borderSoft: "border-pink-500/60",
//       button: "bg-pink-600 hover:bg-pink-500 text-white",
//       pill: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
//       link: "text-pink-600 hover:underline",
//     },
//     pdf: {
//       headline: "#BE185D",
//       accentBorder: "#BE185D",
//       pillBg: "#FCE7F3",
//       pillText: "#9D174D",
//       link: "#BE185D",
//       closingNote: "#BE185D",
//     },
//   },
//   {
//     id: "lime-punch",
//     name: "Lime Punch",
//     category: "color",
//     description: "Bright lime — energetic and unconventional.",
//     swatch: "bg-lime-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-lime-700 dark:text-lime-400",
//       border: "border-lime-600",
//       borderSoft: "border-lime-600/60",
//       button: "bg-lime-600 hover:bg-lime-500 text-white",
//       pill: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
//       link: "text-lime-700 hover:underline",
//     },
//     pdf: {
//       headline: "#4D7C0F",
//       accentBorder: "#4D7C0F",
//       pillBg: "#ECFCCB",
//       pillText: "#3F6212",
//       link: "#4D7C0F",
//       closingNote: "#4D7C0F",
//     },
//   },
//   {
//     id: "burnt-orange",
//     name: "Burnt Orange",
//     category: "color",
//     description: "Warm solid orange — confident and approachable.",
//     swatch: "bg-orange-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-orange-600",
//       border: "border-orange-500",
//       borderSoft: "border-orange-500/60",
//       button: "bg-orange-600 hover:bg-orange-500 text-white",
//       pill: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
//       link: "text-orange-600 hover:underline",
//     },
//     pdf: {
//       headline: "#C2410C",
//       accentBorder: "#C2410C",
//       pillBg: "#FFEDD5",
//       pillText: "#9A3412",
//       link: "#C2410C",
//       closingNote: "#C2410C",
//     },
//   },
//   {
//     id: "slate-indigo",
//     name: "Slate Indigo",
//     category: "color",
//     description: "Deep indigo — serious, trustworthy, finance and law roles.",
//     swatch: "bg-indigo-600",
//     web: {
//       heading: "text-foreground",
//       accentText: "text-indigo-600",
//       border: "border-indigo-500",
//       borderSoft: "border-indigo-500/60",
//       button: "bg-indigo-600 hover:bg-indigo-500 text-white",
//       pill: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
//       link: "text-indigo-600 hover:underline",
//     },
//     pdf: {
//       headline: "#4338CA",
//       accentBorder: "#4338CA",
//       pillBg: "#E0E7FF",
//       pillText: "#3730A3",
//       link: "#4338CA",
//       closingNote: "#4338CA",
//     },
//   },
//   {
//     id: "sunset-gradient",
//     name: "Sunset Gradient",
//     category: "gradient",
//     description: "Pink-to-amber gradient — warm, expressive, creative roles.",
//     swatch: "bg-gradient-to-r from-pink-500 to-amber-400",
//     web: {
//       heading:
//         "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 bg-clip-text text-transparent",
//       accentText: "text-rose-600 dark:text-rose-400",
//       border: "border-rose-500",
//       borderSoft: "border-rose-500/60",
//       button:
//         "bg-gradient-to-r from-pink-500 to-amber-400 hover:opacity-90 text-white",
//       pill: "bg-gradient-to-r from-pink-100 to-amber-100 text-rose-800 dark:from-pink-900/40 dark:to-amber-900/40 dark:text-rose-300",
//       link: "text-rose-600 hover:underline",
//     },
//     pdf: {
//       headline: "#DB2777",
//       accentBorder: "#DB2777",
//       pillBg: "#FCE7F3",
//       pillText: "#9D174D",
//       link: "#DB2777",
//       closingNote: "#DB2777",
//     },
//   },
//   {
//     id: "forest-gradient",
//     name: "Forest Gradient",
//     category: "gradient",
//     description:
//       "Green-to-teal gradient — natural, grounded, sustainability roles.",
//     swatch: "bg-gradient-to-r from-green-500 to-teal-600",
//     web: {
//       heading:
//         "bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 bg-clip-text text-transparent",
//       accentText: "text-emerald-600 dark:text-emerald-400",
//       border: "border-emerald-500",
//       borderSoft: "border-emerald-500/60",
//       button:
//         "bg-gradient-to-r from-green-500 to-teal-600 hover:opacity-90 text-white",
//       pill: "bg-gradient-to-r from-green-100 to-teal-100 text-emerald-800 dark:from-green-900/40 dark:to-teal-900/40 dark:text-teal-300",
//       link: "text-emerald-600 hover:underline",
//     },
//     pdf: {
//       headline: "#0D9488",
//       accentBorder: "#0D9488",
//       pillBg: "#D1FAE5",
//       pillText: "#065F46",
//       link: "#0D9488",
//       closingNote: "#0D9488",
//     },
//   },
//   {
//     id: "aurora-gradient",
//     name: "Aurora Gradient",
//     category: "gradient",
//     description: "Cyan-violet-fuchsia gradient — bold and distinctive.",
//     swatch: "bg-gradient-to-r from-cyan-400 to-fuchsia-500",
//     web: {
//       heading:
//         "bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent",
//       accentText: "text-violet-600 dark:text-violet-400",
//       border: "border-violet-500",
//       borderSoft: "border-violet-500/60",
//       button:
//         "bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:opacity-90 text-white",
//       pill: "bg-gradient-to-r from-cyan-100 to-fuchsia-100 text-violet-800 dark:from-cyan-900/40 dark:to-fuchsia-900/40 dark:text-fuchsia-300",
//       link: "text-violet-600 hover:underline",
//     },
//     pdf: {
//       headline: "#9333EA",
//       accentBorder: "#9333EA",
//       pillBg: "#F3E8FF",
//       pillText: "#6B21A8",
//       link: "#9333EA",
//       closingNote: "#9333EA",
//     },
//   },
//   {
//     id: "rose-gold-gradient",
//     name: "Rose Gold Gradient",
//     category: "gradient",
//     description: "Rose-to-gold gradient — soft, elegant, refined.",
//     swatch: "bg-gradient-to-r from-rose-400 to-amber-300",
//     web: {
//       heading:
//         "bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300 bg-clip-text text-transparent",
//       accentText: "text-rose-500 dark:text-rose-400",
//       border: "border-rose-400",
//       borderSoft: "border-rose-400/60",
//       button:
//         "bg-gradient-to-r from-rose-400 to-amber-300 hover:opacity-90 text-white",
//       pill: "bg-gradient-to-r from-rose-100 to-amber-100 text-rose-700 dark:from-rose-900/40 dark:to-amber-900/40 dark:text-rose-300",
//       link: "text-rose-500 hover:underline",
//     },
//     pdf: {
//       headline: "#E11D48",
//       accentBorder: "#E11D48",
//       pillBg: "#FFE4E6",
//       pillText: "#9F1239",
//       link: "#E11D48",
//       closingNote: "#E11D48",
//     },
//   },
//   {
//     id: "deep-ocean-gradient",
//     name: "Deep Ocean Gradient",
//     category: "gradient",
//     description: "Cyan-to-navy gradient — dramatic, dark-mode-friendly depth.",
//     swatch: "bg-gradient-to-r from-cyan-500 to-slate-900",
//     web: {
//       heading:
//         "bg-gradient-to-r from-cyan-400 via-blue-600 to-slate-900 bg-clip-text text-transparent",
//       accentText: "text-blue-600 dark:text-cyan-400",
//       border: "border-blue-600",
//       borderSoft: "border-blue-600/60",
//       button:
//         "bg-gradient-to-r from-cyan-500 to-slate-800 hover:opacity-90 text-white",
//       pill: "bg-gradient-to-r from-cyan-100 to-slate-200 text-slate-800 dark:from-cyan-900/40 dark:to-slate-800/60 dark:text-cyan-300",
//       link: "text-blue-600 hover:underline",
//     },
//     pdf: {
//       headline: "#1E3A8A",
//       accentBorder: "#1E3A8A",
//       pillBg: "#E0F2FE",
//       pillText: "#0C4A6E",
//       link: "#1E3A8A",
//       closingNote: "#1E3A8A",
//     },
//   },
// ];

// export const DEFAULT_CV_STYLE_ID = "neutral";

// /** Look up a theme by id, falling back to the default when missing/unset. */
// export function getCvStyle(id?: string | null): CvStyleTheme {
//   return (
//     CV_STYLES.find((s) => s.id === id) ??
//     CV_STYLES.find((s) => s.id === DEFAULT_CV_STYLE_ID)!
//   );
// }
export type PlanStyleCategory = "neutral" | "color" | "gradient";

export interface PlanStyleTheme {
  id: string;
  name: string;
  category: PlanStyleCategory;
  description: string;
  /** Small Tailwind bg-* class used to render a swatch dot in the dropdown. */
  swatch: string;
  web: {
    /** Business name/H1 treatment. Gradient themes use bg-clip-text here. */
    heading: string;
    /** Section headings, accents, closing note. */
    accentText: string;
    /** Section-divider border color, full strength. */
    border: string;
    /** Section-divider border color, softened (secondary sections). */
    borderSoft: string;
    /** Download / generate button. */
    button: string;
    /** Tag / KPI pills. */
    pill: string;
    /** Link text (attachments, sources). */
    link: string;
  };
  pdf: {
    headline: string;
    accentBorder: string;
    pillBg: string;
    pillText: string;
    link: string;
    closingNote: string;
  };
}

export const PLAN_STYLES: PlanStyleTheme[] = [
  {
    id: "neutral",
    name: "Neutral",
    category: "neutral",
    description:
      "Minimal grayscale — no color accents, safest for conservative industries and traditional lenders.",
    swatch: "bg-slate-400",
    web: {
      heading: "text-slate-900 dark:text-slate-100",
      accentText: "text-slate-500 dark:text-slate-400",
      border: "border-slate-400",
      borderSoft: "border-slate-400/50",
      button: "bg-slate-700 hover:bg-slate-600 text-white",
      pill: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      link: "text-slate-600 dark:text-slate-300",
    },
    pdf: {
      headline: "#475569",
      accentBorder: "#475569",
      pillBg: "#F1F5F9",
      pillText: "#334155",
      link: "#475569",
      closingNote: "#475569",
    },
  },
  {
    id: "amber-classic",
    name: "Classic Amber",
    category: "color",
    description: "The original warm amber look.",
    swatch: "bg-amber-500",
    web: {
      heading: "text-foreground",
      accentText: "text-amber-600",
      border: "border-amber-500",
      borderSoft: "border-amber-500/60",
      button: "bg-amber-600 hover:bg-amber-500 text-white",
      pill: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
      link: "text-amber-600 hover:underline",
    },
    pdf: {
      headline: "#B45309",
      accentBorder: "#B45309",
      pillBg: "#FEF3C7",
      pillText: "#92400E",
      link: "#B45309",
      closingNote: "#B45309",
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    category: "color",
    description: "Confident solid blue — clean and corporate.",
    swatch: "bg-blue-600",
    web: {
      heading: "text-foreground",
      accentText: "text-blue-600",
      border: "border-blue-500",
      borderSoft: "border-blue-500/60",
      button: "bg-blue-600 hover:bg-blue-500 text-white",
      pill: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
      link: "text-blue-600 hover:underline",
    },
    pdf: {
      headline: "#1D4ED8",
      accentBorder: "#1D4ED8",
      pillBg: "#DBEAFE",
      pillText: "#1E40AF",
      link: "#1D4ED8",
      closingNote: "#1D4ED8",
    },
  },
  {
    id: "blue-gradient",
    name: "Blue Gradient",
    category: "gradient",
    description: "Sky-to-indigo gradient — modern, tech-forward.",
    swatch: "bg-gradient-to-r from-sky-500 to-indigo-600",
    web: {
      heading:
        "bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent",
      accentText: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500",
      borderSoft: "border-blue-500/60",
      button:
        "bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 text-white",
      pill: "bg-gradient-to-r from-sky-100 to-indigo-100 text-indigo-800 dark:from-sky-900/40 dark:to-indigo-900/40 dark:text-indigo-300",
      link: "text-indigo-600 hover:underline",
    },
    pdf: {
      headline: "#3B57D6",
      accentBorder: "#3B57D6",
      pillBg: "#E0E7FF",
      pillText: "#3730A3",
      link: "#3B57D6",
      closingNote: "#3B57D6",
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    category: "color",
    description: "Fresh green — growth, sustainability, health-sector plans.",
    swatch: "bg-emerald-600",
    web: {
      heading: "text-foreground",
      accentText: "text-emerald-600",
      border: "border-emerald-500",
      borderSoft: "border-emerald-500/60",
      button: "bg-emerald-600 hover:bg-emerald-500 text-white",
      pill: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
      link: "text-emerald-600 hover:underline",
    },
    pdf: {
      headline: "#047857",
      accentBorder: "#047857",
      pillBg: "#D1FAE5",
      pillText: "#065F46",
      link: "#047857",
      closingNote: "#047857",
    },
  },
  {
    id: "royal-violet",
    name: "Royal Violet",
    category: "color",
    description: "Rich purple — creative and design-oriented ventures.",
    swatch: "bg-violet-600",
    web: {
      heading: "text-foreground",
      accentText: "text-violet-600",
      border: "border-violet-500",
      borderSoft: "border-violet-500/60",
      button: "bg-violet-600 hover:bg-violet-500 text-white",
      pill: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
      link: "text-violet-600 hover:underline",
    },
    pdf: {
      headline: "#6D28D9",
      accentBorder: "#6D28D9",
      pillBg: "#EDE9FE",
      pillText: "#5B21B6",
      link: "#6D28D9",
      closingNote: "#6D28D9",
    },
  },
  {
    id: "crimson",
    name: "Crimson",
    category: "color",
    description: "Bold red — stands out, high energy.",
    swatch: "bg-rose-600",
    web: {
      heading: "text-foreground",
      accentText: "text-rose-600",
      border: "border-rose-500",
      borderSoft: "border-rose-500/60",
      button: "bg-rose-600 hover:bg-rose-500 text-white",
      pill: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
      link: "text-rose-600 hover:underline",
    },
    pdf: {
      headline: "#BE123C",
      accentBorder: "#BE123C",
      pillBg: "#FFE4E6",
      pillText: "#9F1239",
      link: "#BE123C",
      closingNote: "#BE123C",
    },
  },
  {
    id: "lava",
    name: "Lava",
    category: "gradient",
    description: "Red-orange-yellow gradient — fiery and attention-grabbing.",
    swatch: "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500",
    web: {
      heading:
        "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent",
      accentText: "text-orange-600 dark:text-orange-400",
      border: "border-orange-600",
      borderSoft: "border-orange-600/60",
      button:
        "bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-90 text-white",
      pill: "bg-gradient-to-r from-red-100 to-orange-100 text-red-800 dark:from-red-900/40 dark:to-orange-900/40 dark:text-orange-300",
      link: "text-orange-600 hover:underline",
    },
    pdf: {
      headline: "#C2410C",
      accentBorder: "#C2410C",
      pillBg: "#FFEDD5",
      pillText: "#9A3412",
      link: "#C2410C",
      closingNote: "#C2410C",
    },
  },
  {
    id: "midnight-gradient",
    name: "Midnight Gradient",
    category: "gradient",
    description: "Indigo-to-fuchsia gradient — striking, dark-mode-friendly.",
    swatch: "bg-gradient-to-r from-indigo-500 to-fuchsia-600",
    web: {
      heading:
        "bg-gradient-to-r from-indigo-500 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent",
      accentText: "text-indigo-500 dark:text-indigo-400",
      border: "border-indigo-500",
      borderSoft: "border-indigo-500/60",
      button:
        "bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:opacity-90 text-white",
      pill: "bg-gradient-to-r from-indigo-100 to-fuchsia-100 text-indigo-800 dark:from-indigo-900/40 dark:to-fuchsia-900/40 dark:text-fuchsia-300",
      link: "text-fuchsia-600 hover:underline",
    },
    pdf: {
      headline: "#7C3AED",
      accentBorder: "#7C3AED",
      pillBg: "#EDE9FE",
      pillText: "#6D28D9",
      link: "#7C3AED",
      closingNote: "#7C3AED",
    },
  },
  {
    id: "teal-breeze",
    name: "Teal Breeze",
    category: "color",
    description: "Calm teal — approachable, wellness and service ventures.",
    swatch: "bg-teal-600",
    web: {
      heading: "text-foreground",
      accentText: "text-teal-600",
      border: "border-teal-500",
      borderSoft: "border-teal-500/60",
      button: "bg-teal-600 hover:bg-teal-500 text-white",
      pill: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
      link: "text-teal-600 hover:underline",
    },
    pdf: {
      headline: "#0F766E",
      accentBorder: "#0F766E",
      pillBg: "#CCFBF1",
      pillText: "#115E59",
      link: "#0F766E",
      closingNote: "#0F766E",
    },
  },
  {
    id: "cyan-steel",
    name: "Cyan Steel",
    category: "color",
    description:
      "Cool cyan — technical, precise, engineering-forward ventures.",
    swatch: "bg-cyan-600",
    web: {
      heading: "text-foreground",
      accentText: "text-cyan-600",
      border: "border-cyan-500",
      borderSoft: "border-cyan-500/60",
      button: "bg-cyan-600 hover:bg-cyan-500 text-white",
      pill: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
      link: "text-cyan-600 hover:underline",
    },
    pdf: {
      headline: "#0E7490",
      accentBorder: "#0E7490",
      pillBg: "#CFFAFE",
      pillText: "#155E75",
      link: "#0E7490",
      closingNote: "#0E7490",
    },
  },
  {
    id: "blush-pink",
    name: "Blush Pink",
    category: "color",
    description: "Soft pink — friendly and personable, stands out subtly.",
    swatch: "bg-pink-600",
    web: {
      heading: "text-foreground",
      accentText: "text-pink-600",
      border: "border-pink-500",
      borderSoft: "border-pink-500/60",
      button: "bg-pink-600 hover:bg-pink-500 text-white",
      pill: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
      link: "text-pink-600 hover:underline",
    },
    pdf: {
      headline: "#BE185D",
      accentBorder: "#BE185D",
      pillBg: "#FCE7F3",
      pillText: "#9D174D",
      link: "#BE185D",
      closingNote: "#BE185D",
    },
  },
  {
    id: "lime-punch",
    name: "Lime Punch",
    category: "color",
    description: "Bright lime — energetic and unconventional.",
    swatch: "bg-lime-600",
    web: {
      heading: "text-foreground",
      accentText: "text-lime-700 dark:text-lime-400",
      border: "border-lime-600",
      borderSoft: "border-lime-600/60",
      button: "bg-lime-600 hover:bg-lime-500 text-white",
      pill: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
      link: "text-lime-700 hover:underline",
    },
    pdf: {
      headline: "#4D7C0F",
      accentBorder: "#4D7C0F",
      pillBg: "#ECFCCB",
      pillText: "#3F6212",
      link: "#4D7C0F",
      closingNote: "#4D7C0F",
    },
  },
  {
    id: "burnt-orange",
    name: "Burnt Orange",
    category: "color",
    description: "Warm solid orange — confident and approachable.",
    swatch: "bg-orange-600",
    web: {
      heading: "text-foreground",
      accentText: "text-orange-600",
      border: "border-orange-500",
      borderSoft: "border-orange-500/60",
      button: "bg-orange-600 hover:bg-orange-500 text-white",
      pill: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
      link: "text-orange-600 hover:underline",
    },
    pdf: {
      headline: "#C2410C",
      accentBorder: "#C2410C",
      pillBg: "#FFEDD5",
      pillText: "#9A3412",
      link: "#C2410C",
      closingNote: "#C2410C",
    },
  },
  {
    id: "slate-indigo",
    name: "Slate Indigo",
    category: "color",
    description:
      "Deep indigo — serious, trustworthy, finance and law-adjacent ventures.",
    swatch: "bg-indigo-600",
    web: {
      heading: "text-foreground",
      accentText: "text-indigo-600",
      border: "border-indigo-500",
      borderSoft: "border-indigo-500/60",
      button: "bg-indigo-600 hover:bg-indigo-500 text-white",
      pill: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
      link: "text-indigo-600 hover:underline",
    },
    pdf: {
      headline: "#4338CA",
      accentBorder: "#4338CA",
      pillBg: "#E0E7FF",
      pillText: "#3730A3",
      link: "#4338CA",
      closingNote: "#4338CA",
    },
  },
  {
    id: "sunset-gradient",
    name: "Sunset Gradient",
    category: "gradient",
    description:
      "Pink-to-amber gradient — warm, expressive, creative ventures.",
    swatch: "bg-gradient-to-r from-pink-500 to-amber-400",
    web: {
      heading:
        "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 bg-clip-text text-transparent",
      accentText: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500",
      borderSoft: "border-rose-500/60",
      button:
        "bg-gradient-to-r from-pink-500 to-amber-400 hover:opacity-90 text-white",
      pill: "bg-gradient-to-r from-pink-100 to-amber-100 text-rose-800 dark:from-pink-900/40 dark:to-amber-900/40 dark:text-rose-300",
      link: "text-rose-600 hover:underline",
    },
    pdf: {
      headline: "#DB2777",
      accentBorder: "#DB2777",
      pillBg: "#FCE7F3",
      pillText: "#9D174D",
      link: "#DB2777",
      closingNote: "#DB2777",
    },
  },
  {
    id: "forest-gradient",
    name: "Forest Gradient",
    category: "gradient",
    description:
      "Green-to-teal gradient — natural, grounded, sustainability ventures.",
    swatch: "bg-gradient-to-r from-green-500 to-teal-600",
    web: {
      heading:
        "bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 bg-clip-text text-transparent",
      accentText: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500",
      borderSoft: "border-emerald-500/60",
      button:
        "bg-gradient-to-r from-green-500 to-teal-600 hover:opacity-90 text-white",
      pill: "bg-gradient-to-r from-green-100 to-teal-100 text-emerald-800 dark:from-green-900/40 dark:to-teal-900/40 dark:text-teal-300",
      link: "text-emerald-600 hover:underline",
    },
    pdf: {
      headline: "#0D9488",
      accentBorder: "#0D9488",
      pillBg: "#D1FAE5",
      pillText: "#065F46",
      link: "#0D9488",
      closingNote: "#0D9488",
    },
  },
  {
    id: "aurora-gradient",
    name: "Aurora Gradient",
    category: "gradient",
    description: "Cyan-violet-fuchsia gradient — bold and distinctive.",
    swatch: "bg-gradient-to-r from-cyan-400 to-fuchsia-500",
    web: {
      heading:
        "bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent",
      accentText: "text-violet-600 dark:text-violet-400",
      border: "border-violet-500",
      borderSoft: "border-violet-500/60",
      button:
        "bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:opacity-90 text-white",
      pill: "bg-gradient-to-r from-cyan-100 to-fuchsia-100 text-violet-800 dark:from-cyan-900/40 dark:to-fuchsia-900/40 dark:text-fuchsia-300",
      link: "text-violet-600 hover:underline",
    },
    pdf: {
      headline: "#9333EA",
      accentBorder: "#9333EA",
      pillBg: "#F3E8FF",
      pillText: "#6B21A8",
      link: "#9333EA",
      closingNote: "#9333EA",
    },
  },
  {
    id: "rose-gold-gradient",
    name: "Rose Gold Gradient",
    category: "gradient",
    description: "Rose-to-gold gradient — soft, elegant, refined.",
    swatch: "bg-gradient-to-r from-rose-400 to-amber-300",
    web: {
      heading:
        "bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300 bg-clip-text text-transparent",
      accentText: "text-rose-500 dark:text-rose-400",
      border: "border-rose-400",
      borderSoft: "border-rose-400/60",
      button:
        "bg-gradient-to-r from-rose-400 to-amber-300 hover:opacity-90 text-white",
      pill: "bg-gradient-to-r from-rose-100 to-amber-100 text-rose-700 dark:from-rose-900/40 dark:to-amber-900/40 dark:text-rose-300",
      link: "text-rose-500 hover:underline",
    },
    pdf: {
      headline: "#E11D48",
      accentBorder: "#E11D48",
      pillBg: "#FFE4E6",
      pillText: "#9F1239",
      link: "#E11D48",
      closingNote: "#E11D48",
    },
  },
  {
    id: "deep-ocean-gradient",
    name: "Deep Ocean Gradient",
    category: "gradient",
    description: "Cyan-to-navy gradient — dramatic, dark-mode-friendly depth.",
    swatch: "bg-gradient-to-r from-cyan-500 to-slate-900",
    web: {
      heading:
        "bg-gradient-to-r from-cyan-400 via-blue-600 to-slate-900 bg-clip-text text-transparent",
      accentText: "text-blue-600 dark:text-cyan-400",
      border: "border-blue-600",
      borderSoft: "border-blue-600/60",
      button:
        "bg-gradient-to-r from-cyan-500 to-slate-800 hover:opacity-90 text-white",
      pill: "bg-gradient-to-r from-cyan-100 to-slate-200 text-slate-800 dark:from-cyan-900/40 dark:to-slate-800/60 dark:text-cyan-300",
      link: "text-blue-600 hover:underline",
    },
    pdf: {
      headline: "#1E3A8A",
      accentBorder: "#1E3A8A",
      pillBg: "#E0F2FE",
      pillText: "#0C4A6E",
      link: "#1E3A8A",
      closingNote: "#1E3A8A",
    },
  },
];

export const DEFAULT_PLAN_STYLE_ID = "neutral";

/** Look up a theme by id, falling back to the default when missing/unset. */
export function getPlanStyle(id?: string | null): PlanStyleTheme {
  return (
    PLAN_STYLES.find((s) => s.id === id) ??
    PLAN_STYLES.find((s) => s.id === DEFAULT_PLAN_STYLE_ID)!
  );
}
