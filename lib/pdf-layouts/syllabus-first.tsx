// lib/pdf-layouts/syllabus-first.tsx
//
// TRANSFORMED FROM: lib/pdf-layouts/executive-first.tsx (business-plan
// app, itself transformed from centered.tsx).
//
// Mirrors components/course-layouts/syllabus-first.tsx for print: centered
// header band, a 4-stat "course at a glance" KPI grid, a readiness detail
// block (flags + suggestions), then every module in order. The one
// necessary departure from the web version is the module list itself --
// the web ModuleCard is a collapsible accordion (first module open by
// default, rest collapsed behind a click); a PDF has no click, so every
// module here renders fully expanded, one after another, same content
// each ModuleCard shows when open (summary + numbered lesson list with
// objectives/minutes/exercise type).
//
// FIXED: each module card was rendered with `wrap={false}`, which tells
// react-pdf the whole block -- title, summary, AND every lesson with every
// objective inside it -- must never be split across a page break. That's
// fine for short modules, but a module with a long summary and 8 lessons
// each with several objectives can be taller than a single page. Since
// `wrap={false}` forbids splitting something that can't fit on any one
// page, react-pdf can't paginate it and instead renders it stacked in
// place, which is what caused the overlapping text on the longer modules.
// Removing wrap={false} here lets a long module flow naturally onto the
// next page like everything else in this file already does.

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { CourseLayoutData } from "./types";
import { formatMinutes } from "@/lib/curriculum-data";

/** Same 80/55 thresholds as components/readiness-badge.tsx's scoreBand() -- keep in sync. */
function scoreLabel(score: number): string {
  if (score >= 80) return "Ready";
  if (score >= 55) return "Mostly ready";
  return "Needs work";
}

function buildStyles(theme: CourseLayoutData["theme"]) {
  return StyleSheet.create({
    page: { padding: 44, fontSize: 10.5 },

    // -------- Header band (centered) --------
    headWrap: { alignItems: "center", textAlign: "center" },
    kicker: {
      fontSize: 8.5,
      color: "#999",
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    title: { fontSize: 21, fontWeight: 700, marginTop: 4 },
    description: {
      fontSize: 9.5,
      color: "#666",
      marginTop: 6,
      maxWidth: 380,
      textAlign: "center",
      lineHeight: 1.5,
    },
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

    // -------- Sections --------
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

    // -------- KPI grid (4 cells) --------
    kpiGrid: { flexDirection: "row", flexWrap: "wrap" },
    kpiCell: { width: "25%", marginBottom: 10, paddingRight: 6 },
    kpiLabel: { fontSize: 8, color: "#777" },
    kpiValue: { fontSize: 13, fontWeight: 700, marginTop: 2 },

    // -------- Readiness detail --------
    noteRow: { flexDirection: "row", marginBottom: 4 },
    noteBullet: { fontSize: 9, color: "#999", marginRight: 5 },
    noteText: { fontSize: 9, color: "#444", lineHeight: 1.4, flex: 1 },
    noteHeading: {
      fontSize: 8.5,
      fontWeight: 700,
      color: "#666",
      marginTop: 6,
      marginBottom: 4,
    },

    // -------- Module cards --------
    moduleCard: {
      borderWidth: 1,
      borderColor: "#eee",
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
    },
    moduleHeadRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    moduleHeadLeft: { flexDirection: "row", alignItems: "center" },
    moduleIndex: { fontSize: 8, color: "#999", marginRight: 6 },
    modulePill: {
      fontSize: 7.5,
      color: theme.pdf.pillText,
      backgroundColor: theme.pdf.pillBg,
      borderRadius: 8,
      paddingVertical: 2,
      paddingHorizontal: 6,
      textTransform: "capitalize",
    },
    moduleLessonCount: { fontSize: 8, color: "#999" },
    moduleTitle: { fontSize: 11.5, fontWeight: 700, marginTop: 5 },
    moduleSummary: {
      fontSize: 9,
      color: "#666",
      marginTop: 3,
      lineHeight: 1.4,
    },

    lessonRow: {
      flexDirection: "row",
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: "#f2f2f2",
      borderStyle: "dashed",
    },
    lessonNumber: { width: 20, fontSize: 8.5, color: "#999" },
    lessonBody: { flex: 1 },
    lessonTitle: { fontSize: 9.5, fontWeight: 700 },
    objectiveRow: { flexDirection: "row", marginTop: 2 },
    objectiveBullet: { fontSize: 8, color: "#999", marginRight: 4 },
    objectiveText: { fontSize: 8, color: "#666", flex: 1, lineHeight: 1.35 },
    lessonFootRow: { flexDirection: "row", marginTop: 4 },
    lessonFootText: { fontSize: 7.5, color: "#888", marginRight: 10 },
  });
}

export function buildSyllabusFirstPdfDocument(data: CourseLayoutData) {
  const {
    g,
    budget,
    readiness,
    theme,
    title,
    subject,
    description,
    startLevel,
    targetLevel,
    hoursPerWeek,
    totalModuleCount,
    totalLessonCount,
    totalEstimatedMinutes,
  } = data;
  const styles = buildStyles(theme);

  const kpis: { label: string; value: string }[] = [
    { label: "Modules", value: String(totalModuleCount) },
    { label: "Lessons", value: String(totalLessonCount) },
    { label: "Pace", value: `${budget.totalWeeks} weeks` },
    { label: "Total time", value: formatMinutes(totalEstimatedMinutes) },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* -------- Header band -------- */}
        <View style={styles.headWrap}>
          <Text style={styles.kicker}>{subject}</Text>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
          <View style={styles.pillRow}>
            <Text style={styles.pill}>
              {startLevel} → {targetLevel}
            </Text>
            {hoursPerWeek !== undefined && (
              <Text style={styles.pill}>~{hoursPerWeek} hrs/week</Text>
            )}
          </View>
          {readiness && (
            <Text style={styles.readinessPill}>
              Readiness score: {readiness.score}/100 ·{" "}
              {scoreLabel(readiness.score)}
            </Text>
          )}
        </View>

        {/* -------- Course at a glance -------- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course at a glance</Text>
          <View style={styles.kpiGrid}>
            {kpis.map((kpi) => (
              <View key={kpi.label} style={styles.kpiCell}>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
                <Text style={styles.kpiValue}>{kpi.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* -------- Readiness detail (flags + suggestions) -------- */}
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
                      <Text style={styles.noteText}>{flag}</Text>
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
                      <Text style={styles.noteText}>{s}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}

        {/* -------- Modules (every card rendered "open") -------- */}
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>Modules</Text>
          {g.modules.map((module, i) => (
            <View key={module.key} style={styles.moduleCard}>
              <View style={styles.moduleHeadRow}>
                <View style={styles.moduleHeadLeft}>
                  <Text style={styles.moduleIndex}>
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                  <Text style={styles.modulePill}>{module.level}</Text>
                </View>
                <Text style={styles.moduleLessonCount}>
                  {module.lessons.length} lesson
                  {module.lessons.length === 1 ? "" : "s"}
                </Text>
              </View>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              {module.summary && (
                <Text style={styles.moduleSummary}>{module.summary}</Text>
              )}

              {module.lessons.map((lesson, li) => (
                <View key={lesson.key} style={styles.lessonRow} wrap={false}>
                  <Text style={styles.lessonNumber}>{li + 1}.</Text>
                  <View style={styles.lessonBody}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    {lesson.objectives.map((obj, oi) => (
                      <View key={oi} style={styles.objectiveRow}>
                        <Text style={styles.objectiveBullet}>•</Text>
                        <Text style={styles.objectiveText}>{obj}</Text>
                      </View>
                    ))}
                    <View style={styles.lessonFootRow}>
                      <Text style={styles.lessonFootText}>
                        {formatMinutes(lesson.estimatedMinutes)}
                      </Text>
                      {lesson.exercise && (
                        <Text style={styles.lessonFootText}>
                          {lesson.exercise.type.replace("_", " ")}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
