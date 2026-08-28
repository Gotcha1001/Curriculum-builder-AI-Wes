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
    // -------- Header --------
    title: { fontSize: 18, fontWeight: 700 },
    subject: { fontSize: 10, color: theme.pdf.headline, marginTop: 2 },
    description: {
      fontSize: 9.5,
      color: "#666",
      marginTop: 6,
      lineHeight: 1.5,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 6,
    },
    metaText: {
      fontSize: 9,
      color: "#666",
      marginRight: 10,
    },
    readinessLine: { fontSize: 9.5, color: "#666", marginTop: 10 },
    // -------- Section rule (thin underline, like web's border-b) --------
    sectionTitle: {
      fontSize: 9.5,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      borderBottomWidth: 1,
      borderBottomColor: "#DDDDDD",
      paddingBottom: 3,
      marginBottom: 8,
      marginTop: 18,
    },
    // -------- Course-at-a-glance grid (4 cells, left-aligned) --------
    kpiGrid: { flexDirection: "row", flexWrap: "wrap" },
    kpiCell: { width: "25%", marginBottom: 6 },
    kpiLabel: { fontSize: 8, color: "#888" },
    kpiValue: { fontSize: 11, marginTop: 2 },
    // -------- Readiness notes --------
    noteHeading: {
      fontSize: 8.5,
      fontWeight: 700,
      color: "#666",
      marginTop: 6,
      marginBottom: 4,
    },
    noteRow: { flexDirection: "row", marginBottom: 3 },
    noteBullet: { fontSize: 9, color: "#999", marginRight: 5 },
    noteText: { fontSize: 9, color: "#555", lineHeight: 1.4, flex: 1 },
    // -------- Modules --------
    moduleBlock: { marginBottom: 12 },
    moduleHeadRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    moduleTitle: { fontSize: 11, fontWeight: 700 },
    moduleLessonCount: { fontSize: 8, color: "#999" },
    moduleSummary: {
      fontSize: 9,
      color: "#555",
      marginTop: 3,
      lineHeight: 1.4,
    },
    // -------- Lessons --------
    lessonRow: {
      flexDirection: "row",
      marginTop: 6,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: "#f2f2f2",
      borderStyle: "dashed",
    },
    lessonNumber: { width: 18, fontSize: 8.5, color: "#999" },
    lessonBody: { flex: 1 },
    lessonTitle: { fontSize: 9.5, fontWeight: 700 },
    lessonFootRow: { flexDirection: "row", marginTop: 3 },
    lessonFootText: { fontSize: 7.5, color: "#888", marginRight: 10 },
  });
}

export function buildMinimalCleanPdfDocument(data: CourseLayoutData) {
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
        {/* -------- Header -------- */}
        <Text style={styles.subject}>{subject}</Text>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {startLevel} → {targetLevel}
          </Text>
          {hoursPerWeek !== undefined && (
            <Text style={styles.metaText}>~{hoursPerWeek} hrs/week</Text>
          )}
        </View>

        {readiness && (
          <Text style={styles.readinessLine}>
            Readiness score: {readiness.score}/100 ·{" "}
            {scoreLabel(readiness.score)}
          </Text>
        )}

        {/* -------- Course at a glance -------- */}
        <Text style={styles.sectionTitle}>Course at a glance</Text>
        <View style={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <View key={kpi.label} style={styles.kpiCell}>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
            </View>
          ))}
        </View>

        {/* -------- Readiness notes -------- */}
        {readiness &&
          (readiness.flags.length > 0 || readiness.suggestions.length > 0) && (
            <>
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
            </>
          )}

        {/* -------- Modules -------- */}
        <Text style={styles.sectionTitle}>Modules</Text>
        {g.modules.map((module, i) => (
          <View key={module.key} style={styles.moduleBlock} wrap={false}>
            <View style={styles.moduleHeadRow}>
              <Text style={styles.moduleTitle}>
                {String(i + 1).padStart(2, "0")}. {module.title}
              </Text>
              <Text style={styles.moduleLessonCount}>
                {module.lessons.length} lesson
                {module.lessons.length === 1 ? "" : "s"}
              </Text>
            </View>
            {module.summary && (
              <Text style={styles.moduleSummary}>{module.summary}</Text>
            )}

            {module.lessons.map((lesson, li) => (
              <View key={lesson.key} style={styles.lessonRow}>
                <Text style={styles.lessonNumber}>{li + 1}.</Text>
                <View style={styles.lessonBody}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
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
      </Page>
    </Document>
  );
}
