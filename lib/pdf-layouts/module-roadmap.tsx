// lib/pdf-layouts/module-roadmap.tsx
//
// TRANSFORMED FROM: lib/pdf-layouts/investor-deck.tsx (business-plan app).
//
// Mirrors components/course-layouts/module-roadmap.tsx for print: that
// component pages through modules one at a time client-side (prev/next +
// dot nav); a PDF can't page interactively, so this renders the same
// "one module per spread" idea as one <Page> per module instead --
// literally the deck, already unrolled. Cover slide + one page per
// module, with a slide-number footer (n / total) via react-pdf's
// render-prop <Text>, same trick investor-deck.tsx used for its slide
// counter.
//
// No logoUrl / email / phone / socialLinks here on purpose -- courses
// don't have that identity data the way businessPlans did (see
// convex/schema.ts's `courses` table). The cover slide is subject +
// title + level/pacing/readiness pills instead of a business card.
//
// FIXED: `slide` (the per-module page style) had `minHeight: "100%"`
// applied directly to the <Page> itself. That's a leftover from the
// business-plan deck's full-bleed slide styling and doesn't belong on a
// content page -- forcing the Page's own style to 100% height short-
// circuits react-pdf's auto-pagination height measurement, so any module
// with enough content to need a second physical page (a longer summary +
// many lessons with objectives) fails to break to a new page and instead
// renders its overflow stacked back on top of the existing content.
// Modules that fit on a single page never triggered it, which is why it
// only showed up on the longer modules. Removing minHeight here lets
// react-pdf flow overflow onto a real page 2 the way it does everywhere
// else in this file.

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
    // -------- Shared page chrome --------
    slide: { padding: 44, fontSize: 10.5 },
    footer: {
      position: "absolute",
      bottom: 24,
      left: 44,
      right: 44,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    footerLabel: {
      fontSize: 7.5,
      color: "#999",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    footerCount: { fontSize: 7.5, color: "#999" },

    // -------- Cover slide (full-bleed, theme-colored) --------
    coverPage: {
      padding: 0,
      fontSize: 10.5,
      backgroundColor: theme.pdf.accentBorder,
    },
    coverInner: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 56,
    },
    coverKicker: {
      fontSize: 9,
      color: "#FFFFFF",
      opacity: 0.75,
      textTransform: "uppercase",
      letterSpacing: 2,
      marginBottom: 14,
    },
    coverTitle: {
      fontSize: 28,
      fontWeight: 700,
      color: "#FFFFFF",
      textAlign: "center",
    },
    coverDescription: {
      fontSize: 11.5,
      color: "#FFFFFF",
      opacity: 0.9,
      textAlign: "center",
      marginTop: 10,
      maxWidth: 380,
    },
    coverPillRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: 20,
    },
    coverPill: {
      fontSize: 8.5,
      color: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#FFFFFF",
      borderRadius: 10,
      paddingVertical: 3,
      paddingHorizontal: 9,
      marginHorizontal: 3,
      marginTop: 4,
      textTransform: "capitalize",
    },

    // -------- Module page header --------
    slideKicker: {
      fontSize: 8.5,
      color: theme.pdf.headline,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 6,
    },
    slideTitle: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
    moduleMeta: { fontSize: 9, color: "#777", marginBottom: 12 },
    moduleSummary: {
      fontSize: 10.5,
      color: "#444",
      lineHeight: 1.5,
      marginBottom: 16,
    },

    // -------- Lesson list --------
    lessonRow: {
      flexDirection: "row",
      marginBottom: 10,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    lessonNumber: { width: 22, fontSize: 9, color: "#999" },
    lessonBody: { flex: 1 },
    lessonTitle: { fontSize: 10.5, fontWeight: 700 },
    objectiveRow: { flexDirection: "row", marginTop: 3 },
    objectiveBullet: { fontSize: 8.5, color: "#999", marginRight: 4 },
    objectiveText: { fontSize: 8.5, color: "#666", flex: 1, lineHeight: 1.4 },
    lessonFootRow: { flexDirection: "row", marginTop: 5 },
    lessonFootText: { fontSize: 8, color: "#888", marginRight: 12 },
  });
}

export function buildModuleRoadmapPdfDocument(data: CourseLayoutData) {
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
  } = data;
  const styles = buildStyles(theme);
  const modules = g.modules;

  // Cover + one page per module.
  const totalSlides = 1 + modules.length;

  const Footer = ({ label }: { label: string }) => (
    <View style={styles.footer} fixed>
      <Text style={styles.footerLabel}>
        {title} · {label}
      </Text>
      <Text
        style={styles.footerCount}
        render={({ pageNumber }) => `${pageNumber} / ${totalSlides}`}
      />
    </View>
  );

  return (
    <Document>
      {/* -------- Cover -------- */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverInner}>
          <Text style={styles.coverKicker}>{subject}</Text>
          <Text style={styles.coverTitle}>{title}</Text>
          {description && (
            <Text style={styles.coverDescription}>{description}</Text>
          )}
          <View style={styles.coverPillRow}>
            <Text style={styles.coverPill}>
              {startLevel} → {targetLevel}
            </Text>
            {hoursPerWeek !== undefined && (
              <Text style={styles.coverPill}>
                ~{hoursPerWeek} hrs/week · {budget.totalWeeks} weeks
              </Text>
            )}
            <Text style={styles.coverPill}>
              {totalModuleCount} module{totalModuleCount === 1 ? "" : "s"}
            </Text>
            {readiness && (
              <Text style={styles.coverPill}>
                Readiness: {readiness.score}/100 · {scoreLabel(readiness.score)}
              </Text>
            )}
          </View>
        </View>
      </Page>

      {/* -------- One spread per module -------- */}
      {modules.map((module, i) => (
        <Page key={module.key} size="A4" style={styles.slide}>
          <Text style={styles.slideKicker}>
            Module {String(i + 1).padStart(2, "0")} of {modules.length} ·{" "}
            {module.level}
          </Text>
          <Text style={styles.slideTitle}>{module.title}</Text>
          <Text style={styles.moduleMeta}>
            {module.lessons.length} lesson
            {module.lessons.length === 1 ? "" : "s"}
          </Text>
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
          <Footer label={module.title} />
        </Page>
      ))}
    </Document>
  );
}
