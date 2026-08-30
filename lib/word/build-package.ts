// lib/word/build-package.ts
//
// Third export option alongside lib/pdf-layouts and lib/scorm/build-package.ts:
// a real, editable .docx built straight from the same generatedContent those
// two already read. Deliberately does NOT reuse prepareCourseData() (web-shaped
// data this export doesn't need) — same reasoning as build-package.ts's header
// comment for SCORM. normalizeContent() is duplicated from there for the same
// reason: it's a private helper in lib/curriculum-data.ts, not exported.
//
// Needs `docx` installed: npm install docx

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  LevelFormat,
  convertInchesToTwip,
} from "docx";
import type {
  GeneratedCourseContent,
  GeneratedLesson,
} from "@/lib/curriculum-types";

export interface WordExportInput {
  courseId: string;
  title: string;
  subject: string;
  style: string | undefined;
  generatedContent: unknown;
}

// Local copy of the normalizeContent() logic in lib/curriculum-data.ts — see
// the same note in lib/scorm/build-package.ts. Keep these three in sync if
// the generatedContent shape ever changes.
function normalizeContent(raw: unknown): GeneratedCourseContent {
  const g = raw as Partial<GeneratedCourseContent> | null | undefined;
  const modules = Array.isArray(g?.modules) ? g!.modules : [];
  return { modules } as GeneratedCourseContent;
}

const BULLET_NUMBERING_REFERENCE = "lesson-bullets";

function lessonParagraphs(lesson: GeneratedLesson): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: lesson.title,
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `~${lesson.estimatedMinutes} min`, italics: true }),
      ],
      spacing: { after: 120 },
    }),
  ];

  if (lesson.objectives.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "Objectives", bold: true })],
        spacing: { before: 120, after: 60 },
      }),
    );
    for (const objective of lesson.objectives) {
      paragraphs.push(
        new Paragraph({
          text: objective,
          numbering: { reference: BULLET_NUMBERING_REFERENCE, level: 0 },
        }),
      );
    }
  }

  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: "Lesson outline", bold: true })],
      spacing: { before: 120, after: 60 },
    }),
    // content is a concise outline (not full script — see GeneratedLesson's
    // definition in lib/curriculum-types.ts), so one paragraph is enough;
    // it may contain the AI's own line breaks, which \n can't represent in
    // docx-js, so split on them into separate Paragraph elements.
    ...lesson.content
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => new Paragraph({ text: line.trim() })),
  );

  if (lesson.exercise) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Exercise — ${lesson.exercise.type.replace("_", " ")}`,
            bold: true,
          }),
        ],
        spacing: { before: 120, after: 60 },
      }),
      new Paragraph({ text: lesson.exercise.prompt, spacing: { after: 60 } }),
    );
    for (const item of lesson.exercise.items) {
      paragraphs.push(
        new Paragraph({
          text: item,
          numbering: { reference: BULLET_NUMBERING_REFERENCE, level: 0 },
        }),
      );
    }
  }

  return paragraphs;
}

export async function buildWordPackage(
  input: WordExportInput,
): Promise<Uint8Array> {
  const content = normalizeContent(input.generatedContent);

  if (content.modules.length === 0) {
    throw new Error(
      "This course has no generated lessons yet — generate a version before exporting to Word.",
    );
  }

  const children: Paragraph[] = [
    new Paragraph({
      text: input.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: input.subject, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  content.modules.forEach((module, moduleIndex) => {
    if (moduleIndex > 0) {
      // PageBreak must live inside a Paragraph, not stand alone.
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
    children.push(
      new Paragraph({
        text: `Module ${moduleIndex + 1}: ${module.title}`,
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        children: [new TextRun({ text: module.summary, italics: true })],
        spacing: { after: 200 },
      }),
    );
    for (const lesson of module.lessons) {
      children.push(...lessonParagraphs(lesson));
    }
  });

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: BULLET_NUMBERING_REFERENCE,
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.5),
                    hanging: convertInchesToTwip(0.25),
                  },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
