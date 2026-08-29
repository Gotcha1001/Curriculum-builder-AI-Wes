// lib/scorm/build-package.ts
//
// Entry point: takes the same (course, version) pair that
// prepareCourseData() in lib/curriculum-data.ts already knows how to
// read, and returns a zip buffer ready to hand back as a file download.
//
// Deliberately does NOT reuse prepareCourseData() itself -- that
// function returns web-rendering-shaped data (flatLessons, budget,
// readiness, etc.) which this export doesn't need, and pulling it in
// would couple this file to every future field prepareCourseData grows
// for the web view. Duplicating the two lines that read `theme` and
// `content` is cheaper than that coupling.
//
// Needs `jszip` installed: npm install jszip

import JSZip from "jszip";
import ts from "typescript";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getCourseStyle } from "@/lib/styles";
import type { GeneratedCourseContent } from "@/lib/curriculum-types";
import { buildManifest } from "./manifest";
import { buildStylesheet, buildIndexHtml, flattenForScorm } from "./templates";

// scorm12-api.ts is authored as a normal, fully type-checked TS file (see
// its header comment) but has to ship as plain JS inside the zip -- the
// LMS iframe loads it directly via <script src="scorm12-api.js">, with no
// build step of its own. `ts.transpileModule` strips the types only (no
// bundling, no external deps beyond the `typescript` package every Next.js
// TS project already has) and targets ES5 for maximum LMS-iframe
// compatibility, since some LMS sandboxes still use dated webviews.
//
// NOTE: this requires the Node.js runtime (not the Edge runtime) for
// whichever route/action calls buildScormPackage(), since Edge has no
// filesystem access. If you're on Convex's default "v8" action runtime
// (no fs), pre-transpile this once at build time into a checked-in
// scorm12-api.js instead of doing it at request time.
const scorm12ApiTsSource = readFileSync(
  join(process.cwd(), "lib/scorm/scorm12-api.ts"),
  "utf-8",
);
const scorm12ApiRawOutput = ts.transpileModule(scorm12ApiTsSource, {
  compilerOptions: {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.None,
  },
}).outputText;

// transpileModule always treats a file containing `export {}` as an ES
// module and, even with module: None, emits a CommonJS interop line for
// it (`Object.defineProperty(exports, "__esModule", ...)`). That's fine
// inside a Node/webpack build, but this file runs as a plain browser
// <script> tag with no `exports` object -- and since the source has its
// own "use strict", referencing the undeclared `exports` there throws a
// ReferenceError the instant the LMS loads the page, before ScormAPI is
// ever defined. Confirmed by actually running the transpiled output
// through `node --check` and grepping for "exports" during testing.
// Stripping this one synthesized line is safe: `export {}` never adds
// any real exports, so this is the only trace of it in the JS output.
const scorm12ApiSource = scorm12ApiRawOutput
  .replace(/^Object\.defineProperty\(exports,\s*"__esModule".*\n?/m, "")
  .trim();

export interface ScormExportInput {
  courseId: string;
  title: string;
  subject: string;
  style: string | undefined;
  generatedContent: unknown;
}

export async function buildScormPackage(
  input: ScormExportInput,
): Promise<Uint8Array> {
  const content = normalizeContent(input.generatedContent);
  const theme = getCourseStyle(input.style);
  const lessons = flattenForScorm(content);

  if (lessons.length === 0) {
    throw new Error(
      "This course has no generated lessons yet -- generate a version before exporting to SCORM.",
    );
  }

  const zip = new JSZip();
  zip.file(
    "imsmanifest.xml",
    buildManifest({ id: input.courseId, title: input.title }),
  );
  zip.file("style.css", buildStylesheet(theme));
  zip.file(
    "index.html",
    buildIndexHtml(
      { title: input.title, subject: input.subject },
      lessons,
      content,
    ),
  );
  zip.file("scorm12-api.js", scorm12ApiSource);

  return zip.generateAsync({ type: "uint8array" });
}

// Local copy of the normalizeContent() logic in lib/curriculum-data.ts.
// Not imported from there because that file's normalizeContent() isn't
// exported (private helper) -- if you'd rather not duplicate this, export
// it from curriculum-data.ts and import it here instead.
function normalizeContent(raw: unknown): GeneratedCourseContent {
  const g = raw as Partial<GeneratedCourseContent> | null | undefined;
  const modules = Array.isArray(g?.modules) ? g!.modules : [];
  return { modules } as GeneratedCourseContent;
}
