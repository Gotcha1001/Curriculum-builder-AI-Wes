// lib/pdf-layouts/cover-banner.tsx
//
// TRANSFORMED FROM: lib/pdf-layouts/cover-banner.tsx (business-plan app --
// same filename, old identity-card content).
//
// Mirrors components/course-layouts/cover-banner.tsx for print: a solid
// full-bleed accent-colored banner (subject, title, description, level/pace
// pills, readiness pill) up top, then a flowing single column of modules
// with a left accent border -- no accordion, everything expanded, same as
// the web version's "always-expanded flowing module list" design note.
//
// No logo/contact row in the banner (courses have no identity fields), so
// the banner is shorter than the business-plan version's cover card was.

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
    page: { padding: 0, fontSize: 10.5 },

    // -------- Banner --------
    banner: {
      backgroundColor: theme.pdf.accentBorder,
      paddingVertical: 36,
      paddingHorizontal: 44,
      alignItems: "center",
    },
    bannerKicker: {
      fontSize: 9,
      color: "#FFFFFF",
      opacity: 0.8,
      textTransform: "uppercase",
      letterSpacing: 2,
      textAlign: "center",
    },
    bannerTitle: {
      fontSize: 24,
      fontWeight: 700,
      color: "#FFFFFF",
      textAlign: "center",
      marginTop: 6,
    },
    bannerDescription: {
      fontSize: 10,
      color: "#FFFFFF",
      opacity: 0.9,
      textAlign: "center",
      marginTop: 8,
      maxWidth: 380,
    },
    bannerPillRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: 14,
    },
    bannerPill: {
      fontSize: 8,
      color: "#FFFFFF",
      backgroundColor: "rgba(255,255,255,0.18)",
      borderRadius: 10,
      paddingVertical: 3,
      paddingHorizontal: 9,
      marginHorizontal: 3,
      marginTop: 4,
      textTransform: "capitalize",
    },

    // -------- Body --------
    body: { padding: 44, paddingTop: 24 },

    // -------- KPI strip --------
    kpiGrid: { flexDirection: "row", marginBottom: 8 },
    kpiCell: { flex: 1, alignItems: "center" },
    kpiLabel: { fontSize: 8, color: "#777" },
    kpiValue: { fontSize: 13, fontWeight: 700, marginTop: 2 },

    // -------- Readiness detail -------
    section: { marginTop: 18 },
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

    // -------- Modules: flowing, left accent border -------
    moduleBlock: {
      borderLeftWidth: 3,
      borderLeftColor: theme.pdf.accentBorder,
      paddingLeft: 12,
      marginBottom: 16,
    },
    moduleHeadRow: { flexDirection: "row", alignItems: "center" },
    moduleIndex: { fontSize: 8, color: "#999", marginRight: 6 },
    moduleTitle: { fontSize: 12, fontWeight: 700 },
    modulePill: {
      fontSize: 7.5,
      color: theme.pdf.pillText,
      backgroundColor: theme.pdf.pillBg,
      borderRadius: 8,
      paddingVertical: 2,
      paddingHorizontal: 6,
      marginLeft: 8,
      textTransform: "capitalize",
    },
    moduleSummary: {
      fontSize: 9,
      color: "#666",
      marginTop: 4,
      lineHeight: 1.4,
    },

    lessonRow: { flexDirection: "row", marginTop: 8 },
    lessonNumber: { width: 20, fontSize: 8.5, color: "#999" },
    lessonBody: { flex: 1 },
    lessonTitle: { fontSize: 9.5, fontWeight: 700 },
    lessonFootRow: { flexDirection: "row", marginTop: 3 },
    lessonFootText: { fontSize: 7.5, color: "#888", marginRight: 10 },
  });
}

export function buildCoverBannerPdfDocument(data: CourseLayoutData) {
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
        {/* -------- Banner -------- */}
        <View style={styles.banner}>
          <Text style={styles.bannerKicker}>{subject}</Text>
          <Text style={styles.bannerTitle}>{title}</Text>
          {description && (
            <Text style={styles.bannerDescription}>{description}</Text>
          )}
          <View style={styles.bannerPillRow}>
            <Text style={styles.bannerPill}>
              {startLevel} → {targetLevel}
            </Text>
            {hoursPerWeek !== undefined && (
              <Text style={styles.bannerPill}>~{hoursPerWeek} hrs/week</Text>
            )}
            {readiness && (
              <Text style={styles.bannerPill}>
                Readiness: {readiness.score}/100 · {scoreLabel(readiness.score)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.body}>
          {/* -------- KPI strip -------- */}
          <View style={styles.kpiGrid}>
            {kpis.map((kpi) => (
              <View key={kpi.label} style={styles.kpiCell}>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
                <Text style={styles.kpiValue}>{kpi.value}</Text>
              </View>
            ))}
          </View>

          {/* -------- Readiness detail -------- */}
          {readiness &&
            (readiness.flags.length > 0 ||
              readiness.suggestions.length > 0) && (
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

          {/* -------- Modules: flowing, left accent border -------- */}
          <View style={styles.section}>
            {g.modules.map((module, i) => (
              <View key={module.key} style={styles.moduleBlock} wrap={false}>
                <View style={styles.moduleHeadRow}>
                  <Text style={styles.moduleIndex}>
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.modulePill}>{module.level}</Text>
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
          </View>
        </View>
      </Page>
    </Document>
  );
}
