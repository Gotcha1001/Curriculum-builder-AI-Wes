// // lib/pdf-layouts/progress-tracker.tsx
// //
// // TRANSFORMED FROM: lib/pdf-layouts/financial-charts.tsx (business-plan
// // app, itself transformed from graph-stats.tsx).
// //
// // Mirrors components/course-layouts/progress-tracker.tsx for print, with
// // one structural difference: CourseLayoutData (see ./types.ts) never
// // carries `progress` -- a downloaded PDF has no sign-in, so there's no
// // concept of "your" completion. The web version's completion donut is
// // conditional on `progress` being supplied and falls back to a CTA when
// // it isn't; the PDF always takes that fallback branch. What print CAN
// // show for free is the budget-vs-actual comparison (calculatePacingBudget()
// // vs what the AI actually generated) and a per-module lesson-count
// // breakdown, so those two sections carry this layout instead of the donut.
// //
// // @react-pdf/renderer can't run recharts, so budget vs. actual is a
// // static two-bar-per-row comparison instead of the web version's grouped
// // <BarChart> -- same "flatten to bar rows" approach financial-charts.tsx
// // used for its revenue/profit trajectory.

// import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
// import type { CourseLayoutData } from "./types";
// import { formatMinutes } from "@/lib/curriculum-data";
// import { getChartPalette } from "@/lib/chart-theme";

// /** Same 80/55 thresholds as components/readiness-badge.tsx's scoreBand() -- keep in sync. */
// function scoreLabel(score: number): string {
//   if (score >= 80) return "Ready";
//   if (score >= 55) return "Mostly ready";
//   return "Needs work";
// }

// function buildStyles(theme: CourseLayoutData["theme"]) {
//   return StyleSheet.create({
//     page: { padding: 44, fontSize: 10.5 },
//     headWrap: { alignItems: "center", textAlign: "center" },
//     kicker: {
//       fontSize: 8.5,
//       color: "#999",
//       textTransform: "uppercase",
//       letterSpacing: 1.5,
//     },
//     title: { fontSize: 20, fontWeight: 700, marginTop: 4 },
//     pillRow: {
//       flexDirection: "row",
//       flexWrap: "wrap",
//       justifyContent: "center",
//       marginTop: 10,
//     },
//     pill: {
//       fontSize: 8,
//       color: theme.pdf.pillText,
//       backgroundColor: theme.pdf.pillBg,
//       borderRadius: 10,
//       paddingVertical: 3,
//       paddingHorizontal: 9,
//       marginHorizontal: 3,
//       marginTop: 4,
//       textTransform: "capitalize",
//     },
//     readinessPill: {
//       fontSize: 9.5,
//       color: theme.pdf.pillText,
//       backgroundColor: theme.pdf.pillBg,
//       borderRadius: 10,
//       paddingVertical: 4,
//       paddingHorizontal: 10,
//       marginTop: 12,
//     },

//     section: { marginTop: 20 },
//     sectionTitle: {
//       fontSize: 9.5,
//       fontWeight: 700,
//       textTransform: "uppercase",
//       letterSpacing: 0.5,
//       borderBottomWidth: 1,
//       borderBottomColor: theme.pdf.accentBorder,
//       paddingBottom: 4,
//       marginBottom: 8,
//     },
//     sectionSubtitle: { fontSize: 8.5, color: "#777", marginBottom: 8 },

//     legendRow: { flexDirection: "row", marginBottom: 8 },
//     legendItem: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginRight: 14,
//     },
//     legendDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 4 },
//     legendText: { fontSize: 8, color: "#555" },

//     chartRow: { marginBottom: 10 },
//     chartRowLabel: { fontSize: 8.5, color: "#555", marginBottom: 3 },
//     barTrack: {
//       height: 6,
//       borderRadius: 3,
//       backgroundColor: "#eee",
//       overflow: "hidden",
//       marginBottom: 3,
//     },
//     barFill: { height: 6, borderRadius: 3 },

//     noteText: { fontSize: 9, color: "#555", lineHeight: 1.5 },

//     moduleRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       paddingVertical: 6,
//       borderBottomWidth: 1,
//       borderBottomColor: "#eee",
//     },
//     moduleTitle: { fontSize: 9.5, fontWeight: 700 },
//     moduleCount: { fontSize: 8.5, color: "#888" },

//     noteRow: { flexDirection: "row", marginBottom: 4 },
//     noteBullet: { fontSize: 9, color: "#999", marginRight: 5 },
//     flagText: { fontSize: 9, color: "#444", lineHeight: 1.4, flex: 1 },
//     noteHeading: {
//       fontSize: 8.5,
//       fontWeight: 700,
//       color: "#666",
//       marginTop: 6,
//       marginBottom: 4,
//     },
//   });
// }

// export function buildProgressTrackerPdfDocument(data: CourseLayoutData) {
//   const {
//     g,
//     budget,
//     readiness,
//     theme,
//     title,
//     subject,
//     startLevel,
//     targetLevel,
//     hoursPerWeek,
//     totalModuleCount,
//     totalLessonCount,
//     totalEstimatedMinutes,
//   } = data;
//   const styles = buildStyles(theme);
//   const palette = getChartPalette(theme);

//   const budgetRows = [
//     {
//       label: "Modules",
//       budgeted: budget.totalModules,
//       actual: totalModuleCount,
//     },
//     {
//       label: "Lessons",
//       budgeted: budget.totalLessons,
//       actual: totalLessonCount,
//     },
//   ];
//   const maxBudgetValue = Math.max(
//     ...budgetRows.flatMap((r) => [r.budgeted, r.actual]),
//     1,
//   );

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         {/* -------- Header -------- */}
//         <View style={styles.headWrap}>
//           <Text style={styles.kicker}>{subject}</Text>
//           <Text style={styles.title}>{title}</Text>
//           <View style={styles.pillRow}>
//             <Text style={styles.pill}>
//               {startLevel} → {targetLevel}
//             </Text>
//             {hoursPerWeek !== undefined && (
//               <Text style={styles.pill}>~{hoursPerWeek} hrs/week</Text>
//             )}
//           </View>
//           {readiness && (
//             <Text style={styles.readinessPill}>
//               Readiness score: {readiness.score}/100 ·{" "}
//               {scoreLabel(readiness.score)}
//             </Text>
//           )}
//         </View>

//         {/* -------- Planned vs. generated -------- */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Planned vs. generated</Text>
//           <Text style={styles.sectionSubtitle}>
//             Budgeted at {budget.lessonsPerWeek} lessons/week ·{" "}
//             {budget.minutesPerLesson} min/lesson over {budget.totalWeeks} weeks.
//             Generated course runs {formatMinutes(totalEstimatedMinutes)} total.
//           </Text>
//           <View style={styles.legendRow}>
//             <View style={styles.legendItem}>
//               <View
//                 style={[
//                   styles.legendDot,
//                   { backgroundColor: palette.secondary },
//                 ]}
//               />
//               <Text style={styles.legendText}>Budgeted</Text>
//             </View>
//             <View style={styles.legendItem}>
//               <View
//                 style={[styles.legendDot, { backgroundColor: palette.primary }]}
//               />
//               <Text style={styles.legendText}>Generated</Text>
//             </View>
//           </View>
//           {budgetRows.map((row) => (
//             <View key={row.label} style={styles.chartRow}>
//               <Text style={styles.chartRowLabel}>
//                 {row.label} · {row.budgeted} budgeted / {row.actual} generated
//               </Text>
//               <View style={styles.barTrack}>
//                 <View
//                   style={[
//                     styles.barFill,
//                     {
//                       backgroundColor: palette.secondary,
//                       width: `${(row.budgeted / maxBudgetValue) * 100}%`,
//                     },
//                   ]}
//                 />
//               </View>
//               <View style={styles.barTrack}>
//                 <View
//                   style={[
//                     styles.barFill,
//                     {
//                       backgroundColor: palette.primary,
//                       width: `${(row.actual / maxBudgetValue) * 100}%`,
//                     },
//                   ]}
//                 />
//               </View>
//             </View>
//           ))}
//         </View>

//         {/* -------- Your completion -------- */}
//         <View style={styles.section} wrap={false}>
//           <Text style={styles.sectionTitle}>Your completion</Text>
//           <Text style={styles.noteText}>
//             A downloaded PDF has no sign-in, so completion can&apos;t be shown
//             here. View this course online and complete a lesson to start
//             tracking progress.
//           </Text>
//         </View>

//         {/* -------- Module breakdown -------- */}
//         <View style={styles.section} break>
//           <Text style={styles.sectionTitle}>Module breakdown</Text>
//           {g.modules.map((module) => (
//             <View key={module.key} style={styles.moduleRow}>
//               <Text style={styles.moduleTitle}>{module.title}</Text>
//               <Text style={styles.moduleCount}>
//                 {module.lessons.length} lesson
//                 {module.lessons.length === 1 ? "" : "s"}
//               </Text>
//             </View>
//           ))}
//         </View>

//         {/* -------- Readiness notes -------- */}
//         {readiness &&
//           (readiness.flags.length > 0 || readiness.suggestions.length > 0) && (
//             <View style={styles.section} wrap={false}>
//               <Text style={styles.sectionTitle}>Readiness notes</Text>
//               {readiness.flags.length > 0 && (
//                 <>
//                   <Text style={styles.noteHeading}>Flags</Text>
//                   {readiness.flags.map((flag, i) => (
//                     <View key={i} style={styles.noteRow}>
//                       <Text style={styles.noteBullet}>•</Text>
//                       <Text style={styles.flagText}>{flag}</Text>
//                     </View>
//                   ))}
//                 </>
//               )}
//               {readiness.suggestions.length > 0 && (
//                 <>
//                   <Text style={styles.noteHeading}>Suggestions</Text>
//                   {readiness.suggestions.map((s, i) => (
//                     <View key={i} style={styles.noteRow}>
//                       <Text style={styles.noteBullet}>•</Text>
//                       <Text style={styles.flagText}>{s}</Text>
//                     </View>
//                   ))}
//                 </>
//               )}
//             </View>
//           )}
//       </Page>
//     </Document>
//   );
// }
// lib/pdf-layouts/progress-tracker.tsx
//
// TRANSFORMED FROM: lib/pdf-layouts/financial-charts.tsx (business-plan
// app, itself transformed from graph-stats.tsx).
//
// Mirrors components/course-layouts/progress-tracker.tsx for print, with
// one structural difference: CourseLayoutData (see ./types.ts) never
// carries `progress` -- a downloaded PDF has no sign-in, so there's no
// concept of "your" completion. The web version's completion donut is
// conditional on `progress` being supplied and falls back to a CTA when
// it isn't; the PDF always takes that fallback branch. What print CAN
// show for free is the budget-vs-actual comparison (calculatePacingBudget()
// vs what the AI actually generated) and a per-module lesson breakdown, so
// those two sections carry this layout instead of the donut.
//
// UPDATED: "Module breakdown" used to print only a title + lesson count
// per module -- the same module-only gap the web layout had before it
// grew a lesson list. Fixed the same way here: each module now prints its
// lessons underneath (title + estimated time). No checkboxes -- a PDF has
// no sign-in and can't write back to Convex, so completion stays web-only
// (see the "Your completion" section below, unchanged) -- but a learner
// reading a downloaded syllabus should still see what's actually in each
// lesson, not just a count.
//
// @react-pdf/renderer can't run recharts, so budget vs. actual is a
// static two-bar-per-row comparison instead of the web version's grouped
// <BarChart> -- same "flatten to bar rows" approach financial-charts.tsx
// used for its revenue/profit trajectory.

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CourseLayoutData } from "./types";
import { formatMinutes } from "@/lib/curriculum-data";
import { getChartPalette } from "@/lib/chart-theme";

/** Same 80/55 thresholds as components/readiness-badge.tsx's scoreBand() -- keep in sync. */
function scoreLabel(score: number): string {
  if (score >= 80) return "Ready";
  if (score >= 55) return "Mostly ready";
  return "Needs work";
}

function buildStyles(theme: CourseLayoutData["theme"]) {
  return StyleSheet.create({
    page: { padding: 44, fontSize: 10.5 },
    headWrap: { alignItems: "center", textAlign: "center" },
    kicker: {
      fontSize: 8.5,
      color: "#999",
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    title: { fontSize: 20, fontWeight: 700, marginTop: 4 },
    pillRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: 10,
    },
    pill: {
      fontSize: 8,
      color: theme.pdf.pillText,
      backgroundColor: theme.pdf.pillBg,
      borderRadius: 10,
      paddingVertical: 3,
      paddingHorizontal: 9,
      marginHorizontal: 3,
      marginTop: 4,
      textTransform: "capitalize",
    },
    readinessPill: {
      fontSize: 9.5,
      color: theme.pdf.pillText,
      backgroundColor: theme.pdf.pillBg,
      borderRadius: 10,
      paddingVertical: 4,
      paddingHorizontal: 10,
      marginTop: 12,
    },

    section: { marginTop: 20 },
    sectionTitle: {
      fontSize: 9.5,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      borderBottomWidth: 1,
      borderBottomColor: theme.pdf.accentBorder,
      paddingBottom: 4,
      marginBottom: 8,
    },
    sectionSubtitle: { fontSize: 8.5, color: "#777", marginBottom: 8 },

    legendRow: { flexDirection: "row", marginBottom: 8 },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 14,
    },
    legendDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 4 },
    legendText: { fontSize: 8, color: "#555" },

    chartRow: { marginBottom: 10 },
    chartRowLabel: { fontSize: 8.5, color: "#555", marginBottom: 3 },
    barTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: "#eee",
      overflow: "hidden",
      marginBottom: 3,
    },
    barFill: { height: 6, borderRadius: 3 },

    noteText: { fontSize: 9, color: "#555", lineHeight: 1.5 },

    // Module header row -- now just the module's own line; its lessons
    // print underneath via lessonRow instead of the row itself carrying
    // the only count in the whole section.
    moduleBlock: { marginBottom: 4 },
    moduleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.pdf.accentBorder,
    },
    moduleTitle: { fontSize: 9.5, fontWeight: 700 },
    moduleCount: { fontSize: 8.5, color: "#888" },

    lessonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingVertical: 4,
      paddingLeft: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#f2f2f2",
    },
    lessonTitle: { fontSize: 9, color: "#333", flex: 1, paddingRight: 8 },
    lessonMinutes: { fontSize: 8, color: "#999" },

    noteRow: { flexDirection: "row", marginBottom: 4 },
    noteBullet: { fontSize: 9, color: "#999", marginRight: 5 },
    flagText: { fontSize: 9, color: "#444", lineHeight: 1.4, flex: 1 },
    noteHeading: {
      fontSize: 8.5,
      fontWeight: 700,
      color: "#666",
      marginTop: 6,
      marginBottom: 4,
    },
  });
}

export function buildProgressTrackerPdfDocument(data: CourseLayoutData) {
  const {
    g,
    budget,
    readiness,
    theme,
    title,
    subject,
    startLevel,
    targetLevel,
    hoursPerWeek,
    totalModuleCount,
    totalLessonCount,
    totalEstimatedMinutes,
  } = data;
  const styles = buildStyles(theme);
  const palette = getChartPalette(theme);

  const budgetRows = [
    {
      label: "Modules",
      budgeted: budget.totalModules,
      actual: totalModuleCount,
    },
    {
      label: "Lessons",
      budgeted: budget.totalLessons,
      actual: totalLessonCount,
    },
  ];
  const maxBudgetValue = Math.max(
    ...budgetRows.flatMap((r) => [r.budgeted, r.actual]),
    1,
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* -------- Header -------- */}
        <View style={styles.headWrap}>
          <Text style={styles.kicker}>{subject}</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.pillRow}>
            <Text style={styles.pill}>
              {startLevel} → {targetLevel}
            </Text>
            {hoursPerWeek !== undefined && (
              <Text style={styles.pill}>~{hoursPerWeek} hrs/week</Text>
            )}
            {/* Mirrors the web layout's weeks pill -- budget.totalWeeks
                already reflects a wizard-set weeks override when present
                (calculatePacingBudget reads course.weeks), so no extra
                data plumbing was needed for this line. */}
            <Text style={styles.pill}>{budget.totalWeeks} weeks</Text>
          </View>
          {readiness && (
            <Text style={styles.readinessPill}>
              Readiness score: {readiness.score}/100 ·{" "}
              {scoreLabel(readiness.score)}
            </Text>
          )}
        </View>

        {/* -------- Planned vs. generated -------- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planned vs. generated</Text>
          <Text style={styles.sectionSubtitle}>
            Budgeted at {budget.lessonsPerWeek} lessons/week ·{" "}
            {budget.minutesPerLesson} min/lesson over {budget.totalWeeks} weeks.
            Generated course runs {formatMinutes(totalEstimatedMinutes)} total.
          </Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: palette.secondary },
                ]}
              />
              <Text style={styles.legendText}>Budgeted</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: palette.primary }]}
              />
              <Text style={styles.legendText}>Generated</Text>
            </View>
          </View>
          {budgetRows.map((row) => (
            <View key={row.label} style={styles.chartRow}>
              <Text style={styles.chartRowLabel}>
                {row.label} · {row.budgeted} budgeted / {row.actual} generated
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: palette.secondary,
                      width: `${(row.budgeted / maxBudgetValue) * 100}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: palette.primary,
                      width: `${(row.actual / maxBudgetValue) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* -------- Your completion -------- */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Your completion</Text>
          <Text style={styles.noteText}>
            A downloaded PDF has no sign-in, so completion can&apos;t be shown
            here. View this course online and complete a lesson to start
            tracking progress.
          </Text>
        </View>

        {/* -------- Module breakdown -------- */}
        {/* Each module now prints its lessons underneath (title + estimated
            time) instead of just a bare lesson count -- lets this section
            flow across pages normally (no wrap={false} here, same as
            before) since it can run long for bigger courses. */}
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>Module breakdown</Text>
          {g.modules.map((module) => (
            <View key={module.key} style={styles.moduleBlock} wrap={false}>
              <View style={styles.moduleRow}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleCount}>
                  {module.lessons.length} lesson
                  {module.lessons.length === 1 ? "" : "s"}
                </Text>
              </View>
              {module.lessons.map((lesson) => (
                <View key={lesson.key} style={styles.lessonRow}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonMinutes}>
                    {formatMinutes(lesson.estimatedMinutes)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* -------- Readiness notes -------- */}
        {readiness &&
          (readiness.flags.length > 0 || readiness.suggestions.length > 0) && (
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>Readiness notes</Text>
              {readiness.flags.length > 0 && (
                <>
                  <Text style={styles.noteHeading}>Flags</Text>
                  {readiness.flags.map((flag, i) => (
                    <View key={i} style={styles.noteRow}>
                      <Text style={styles.noteBullet}>•</Text>
                      <Text style={styles.flagText}>{flag}</Text>
                    </View>
                  ))}
                </>
              )}
              {readiness.suggestions.length > 0 && (
                <>
                  <Text style={styles.noteHeading}>Suggestions</Text>
                  {readiness.suggestions.map((s, i) => (
                    <View key={i} style={styles.noteRow}>
                      <Text style={styles.noteBullet}>•</Text>
                      <Text style={styles.flagText}>{s}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
      </Page>
    </Document>
  );
}
