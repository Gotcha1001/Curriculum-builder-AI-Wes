// lib/scorm/templates.ts
//
// Builds the actual HTML/CSS shipped inside the zip. Deliberately plain
// server-rendered strings, not React -- this output is never touched by
// Next.js's runtime again once exported, it just needs to be valid
// static HTML/CSS/JS sitting in a zip.
//
// STYLING CHOICE: uses `theme.pdf.*` (plain hex strings) rather than
// `theme.web.*` (Tailwind classes). The web classes only resolve to real
// colors after Tailwind's build step processes them into the app's
// compiled stylesheet -- shipping raw class names like
// "text-blue-600 dark:text-blue-400" into a standalone zip would just be
// inert strings with a Tailwind CDN the LMS iframe likely blocks. The pdf
// palette was already built for "needs to render correctly with zero
// build step," which is exactly this constraint too.

import type { CourseStyleTheme } from "@/lib/styles";
import type {
  GeneratedCourseContent,
  GeneratedLesson,
  GeneratedModule,
} from "@/lib/curriculum-types";

export interface ScormLessonRef {
  key: string;
  moduleIndex: number;
  lessonIndex: number;
  moduleTitle: string;
  lesson: GeneratedLesson;
}

export function flattenForScorm(
  content: GeneratedCourseContent,
): ScormLessonRef[] {
  const flat: ScormLessonRef[] = [];
  content.modules.forEach((module: GeneratedModule, moduleIndex: number) => {
    module.lessons.forEach((lesson, lessonIndex) => {
      flat.push({
        key: lesson.key,
        moduleIndex,
        lessonIndex,
        moduleTitle: module.title,
        lesson,
      });
    });
  });
  return flat;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain multi-line text -> paragraphs. Lesson `content` is authored as
 * freeform text (see GeneratedLesson), same assumption the PDF export
 * makes -- no markdown parsing, just paragraph breaks on blank lines. */
function textToParagraphs(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

export function buildStylesheet(theme: CourseStyleTheme): string {
  return `
:root {
  --scorm-headline: ${theme.pdf.headline};
  --scorm-accent: ${theme.pdf.accentBorder};
  --scorm-pill-bg: ${theme.pdf.pillBg};
  --scorm-pill-text: ${theme.pdf.pillText};
  --scorm-link: ${theme.pdf.link};
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1a1a1a;
  background: #fafafa;
  display: flex;
  min-height: 100vh;
}
#sidebar {
  width: 280px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #e5e5e5;
  overflow-y: auto;
  padding: 20px 0;
}
#sidebar h1 {
  font-size: 15px;
  font-weight: 600;
  color: var(--scorm-headline);
  padding: 0 20px 16px;
  margin: 0;
  border-bottom: 1px solid #eee;
}
#progress-track {
  margin: 16px 20px;
  height: 6px;
  border-radius: 3px;
  background: #eee;
  overflow: hidden;
}
#progress-fill {
  height: 100%;
  width: 0%;
  background: var(--scorm-accent);
  transition: width 0.3s ease;
}
#progress-label {
  padding: 0 20px;
  font-size: 12px;
  color: #666;
}
.module-group {
  margin-top: 18px;
}
.module-group h2 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #999;
  padding: 0 20px;
  margin: 0 0 6px;
}
.lesson-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  font-size: 13.5px;
  color: #333;
  cursor: pointer;
  border-left: 3px solid transparent;
}
.lesson-link:hover { background: #f5f5f5; }
.lesson-link.active {
  border-left-color: var(--scorm-accent);
  background: var(--scorm-pill-bg);
  color: var(--scorm-pill-text);
  font-weight: 600;
}
.lesson-check {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid #ccc;
  flex-shrink: 0;
}
.lesson-check.done {
  background: var(--scorm-accent);
  border-color: var(--scorm-accent);
}
#content {
  flex: 1;
  overflow-y: auto;
  padding: 48px 56px;
  max-width: 780px;
}
.lesson-section { display: none; }
.lesson-section.active { display: block; }
.lesson-eyebrow {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--scorm-accent);
  margin-bottom: 8px;
}
.lesson-section h1 {
  font-size: 28px;
  color: var(--scorm-headline);
  margin: 0 0 20px;
}
.objectives {
  background: var(--scorm-pill-bg);
  color: var(--scorm-pill-text);
  border-radius: 10px;
  padding: 16px 20px;
  margin: 0 0 28px;
}
.objectives h3 {
  margin: 0 0 8px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.objectives ul { margin: 0; padding-left: 20px; }
.lesson-body p { line-height: 1.7; color: #2a2a2a; margin: 0 0 16px; }
.lesson-meta {
  font-size: 12.5px;
  color: #888;
  margin-bottom: 28px;
}
.lesson-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}
button {
  font-family: inherit;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid var(--scorm-accent);
  background: white;
  color: var(--scorm-accent);
  cursor: pointer;
}
button.primary {
  background: var(--scorm-accent);
  color: white;
}
button:disabled { opacity: 0.4; cursor: default; }
button.mark-complete.done {
  background: var(--scorm-accent);
  color: white;
}
@media (max-width: 720px) {
  body { flex-direction: column; }
  #sidebar { width: 100%; border-right: none; border-bottom: 1px solid #e5e5e5; }
  #content { padding: 28px 20px; }
}
`.trim();
}

export function buildIndexHtml(
  course: { title: string; subject: string },
  lessons: ScormLessonRef[],
  content: GeneratedCourseContent,
): string {
  const sidebarModules = content.modules
    .map((module, moduleIndex) => {
      const items = module.lessons
        .map((lesson, lessonIndex) => {
          const idx = lessons.findIndex((l) => l.key === lesson.key);
          return `
      <div class="lesson-link" data-index="${idx}" onclick="goTo(${idx})">
        <span class="lesson-check" id="check-${idx}"></span>
        <span>${escapeHtml(lesson.title)}</span>
      </div>`;
        })
        .join("");
      return `
    <div class="module-group">
      <h2>Module ${moduleIndex + 1}: ${escapeHtml(module.title)}</h2>
      ${items}
    </div>`;
    })
    .join("\n");

  const sections = lessons
    .map((ref, idx) => {
      const objectives = ref.lesson.objectives?.length
        ? `
      <div class="objectives">
        <h3>Learning objectives</h3>
        <ul>${ref.lesson.objectives.map((o) => `<li>${escapeHtml(o)}</li>`).join("")}</ul>
      </div>`
        : "";
      return `
  <section class="lesson-section" id="section-${idx}" data-key="${escapeHtml(ref.key)}">
    <div class="lesson-eyebrow">${escapeHtml(ref.moduleTitle)}</div>
    <h1>${escapeHtml(ref.lesson.title)}</h1>
    <div class="lesson-meta">${ref.lesson.estimatedMinutes ?? 0} min</div>
    ${objectives}
    <div class="lesson-body">
      ${textToParagraphs(ref.lesson.content ?? "")}
    </div>
    <div class="lesson-nav">
      <button onclick="goTo(${idx - 1})" ${idx === 0 ? "disabled" : ""}>&larr; Previous</button>
      <button class="mark-complete" id="markbtn-${idx}" onclick="toggleComplete(${idx})">Mark complete</button>
      <button class="primary" onclick="goTo(${idx + 1})" ${idx === lessons.length - 1 ? "disabled" : ""}>Next &rarr;</button>
    </div>
  </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(course.title)}</title>
<link rel="stylesheet" href="style.css">
<script src="scorm12-api.js"></script>
</head>
<body>
<nav id="sidebar">
  <h1>${escapeHtml(course.title)}</h1>
  <div id="progress-track"><div id="progress-fill"></div></div>
  <div id="progress-label"><span id="progress-count">0</span> / ${lessons.length} lessons complete</div>
  ${sidebarModules}
</nav>
<main id="content">
${sections}
</main>
<script>
var TOTAL = ${lessons.length};
var LESSON_KEYS = ${JSON.stringify(lessons.map((l) => l.key))};
var completed = {};
var current = 0;

function renderProgress() {
  var doneCount = Object.keys(completed).length;
  document.getElementById('progress-count').textContent = doneCount;
  document.getElementById('progress-fill').style.width = (TOTAL ? (doneCount / TOTAL) * 100 : 0) + '%';
  for (var i = 0; i < TOTAL; i++) {
    var check = document.getElementById('check-' + i);
    if (check) check.classList.toggle('done', !!completed[LESSON_KEYS[i]]);
  }
}

function goTo(index) {
  if (index < 0 || index >= TOTAL) return;
  document.querySelectorAll('.lesson-section').forEach(function (el) { el.classList.remove('active'); });
  document.querySelectorAll('.lesson-link').forEach(function (el) { el.classList.remove('active'); });
  document.getElementById('section-' + index).classList.add('active');
  var link = document.querySelector('.lesson-link[data-index="' + index + '"]');
  if (link) link.classList.add('active');
  document.getElementById('content').scrollTop = 0;
  current = index;
  var markBtn = document.getElementById('markbtn-' + index);
  markBtn.classList.toggle('done', !!completed[LESSON_KEYS[index]]);
  markBtn.textContent = completed[LESSON_KEYS[index]] ? 'Completed \\u2713' : 'Mark complete';
}

function toggleComplete(index) {
  var key = LESSON_KEYS[index];
  if (completed[key]) { delete completed[key]; } else { completed[key] = true; }
  renderProgress();
  goTo(index);
  if (window.ScormAPI) {
    window.ScormAPI.saveProgress(Object.keys(completed), TOTAL);
  }
}

// Restore prior progress (if relaunched from an LMS with saved suspend_data).
if (window.ScormAPI) {
  window.ScormAPI.loadProgress().forEach(function (key) { completed[key] = true; });
}
renderProgress();
goTo(0);
</script>
</body>
</html>`;
}
