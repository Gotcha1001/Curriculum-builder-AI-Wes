// lib/scorm/scorm12-api.ts
//
// Minimal SCORM 1.2 runtime wrapper, fully typed and type-checked as a
// normal part of the app -- but never shipped or executed as TypeScript.
// build-package.ts runs this through TypeScript's own transpileModule()
// (types-stripped only, no bundling) and embeds the resulting plain JS
// as scorm12-api.js inside the exported zip. The LMS iframe gets a
// dependency-free <script> tag; this source still gets full compiler
// checking like any other file in the project.
//
// SCORM 1.2 (not 2004) chosen deliberately: it's the version every major
// LMS (Canvas, Moodle, Blackboard, TalentLMS, etc.) supports, whereas
// 2004's sequencing rules are inconsistently implemented and cause more
// "package rejected" support tickets than they're worth for a course
// that's just linear lessons with a completion state.
//
// How the LMS connects: when this content loads inside the LMS's iframe,
// the LMS has already put a `window.API` object somewhere in the parent
// frame chain (per the SCORM 1.2 RTE spec) with LMSInitialize / GetValue /
// SetValue / Commit / Finish methods. We search up the frame/opener chain
// for it since we don't control how many frames the LMS wraps around us.
//
// `export {}` at the bottom makes this file an isolated ES module (rather
// than a global script) so the interfaces below don't leak into the rest
// of the app's global type namespace -- the only thing that actually runs
// is the IIFE, same as the plain-JS version this replaced.

interface Scorm12API {
  LMSInitialize(param: string): string | boolean;
  LMSSetValue(name: string, value: string): string;
  LMSGetValue(name: string): string;
  LMSCommit(param: string): string;
  LMSFinish(param: string): string;
}

interface ScormRuntime {
  hasLMS(): boolean;
  initialize(): boolean;
  saveProgress(completedKeys: string[], totalLessons: number): void;
  loadProgress(): string[];
  finish(): boolean;
}

interface ScormWindow extends Window {
  API?: Scorm12API;
  ScormAPI?: ScormRuntime;
}

(function (global: ScormWindow) {
  "use strict";

  let API: Scorm12API | null = null;
  let initialized = false;

  /** Walk up window.parent / window.opener looking for the LMS's API
   * object. Capped at 10 hops -- a real LMS frameset is never deeper than
   * a handful of levels, and this avoids an infinite loop if a browser
   * quirk makes window.parent === window forever. */
  function findAPI(win: Window | null | undefined): Scorm12API | null {
    let attempts = 0;
    let current: Window | null | undefined = win;
    while (current && !(current as ScormWindow).API && attempts < 10) {
      if (current.parent && current.parent !== current) {
        current = current.parent;
      } else if (current.opener) {
        current = current.opener;
      } else {
        return null;
      }
      attempts++;
    }
    return current ? ((current as ScormWindow).API ?? null) : null;
  }

  function getAPI(): Scorm12API | null {
    if (API) return API;
    API = findAPI(global) || findAPI(global.top);
    return API;
  }

  /** True when running inside a real LMS. False in a plain browser tab
   * (e.g. someone opens index.html directly to preview the export) --
   * every function below no-ops safely in that case instead of throwing,
   * so the course is still previewable without an LMS. */
  function hasLMS(): boolean {
    return !!getAPI();
  }

  function initialize(): boolean {
    if (initialized) return true;
    const api = getAPI();
    if (!api) return false;
    const result = api.LMSInitialize("");
    initialized = result === "true" || result === true;
    return initialized;
  }

  function setValue(key: string, value: string | number): boolean {
    const api = getAPI();
    if (!api) return false;
    if (!initialized) initialize();
    api.LMSSetValue(key, String(value));
    return true;
  }

  function getValue(key: string): string {
    const api = getAPI();
    if (!api) return "";
    if (!initialized) initialize();
    return api.LMSGetValue(key);
  }

  function commit(): boolean {
    const api = getAPI();
    if (!api || !initialized) return false;
    api.LMSCommit("");
    return true;
  }

  function finish(): boolean {
    const api = getAPI();
    if (!api || !initialized) return false;
    api.LMSSetValue("cmi.core.exit", "suspend");
    api.LMSCommit("");
    api.LMSFinish("");
    initialized = false;
    return true;
  }

  /** Persist which lessons are done (comma-separated lesson keys) and the
   * completion percentage, using cmi.suspend_data (a free-text bookmark
   * field every SCORM 1.2 LMS supports) since 1.2 has no native concept
   * of "sub-lesson" progress within a single SCO. Called on every lesson
   * completion toggle, not just on exit, so progress survives a crashed
   * tab or a learner who closes the LMS window without clicking "exit". */
  function saveProgress(completedKeys: string[], totalLessons: number): void {
    const pct =
      totalLessons > 0
        ? Math.round((completedKeys.length / totalLessons) * 100)
        : 0;
    setValue("cmi.suspend_data", completedKeys.join(","));
    setValue("cmi.core.score.raw", String(pct));
    setValue("cmi.core.lesson_status", pct >= 100 ? "completed" : "incomplete");
    commit();
  }

  /** Restore completed-lesson keys from a previous session. Returns []
   * if there's no LMS connection or no prior suspend_data -- callers
   * treat that as "nothing completed yet", which is the correct default
   * for both "no LMS" and "first launch ever" cases. */
  function loadProgress(): string[] {
    const raw = getValue("cmi.suspend_data");
    if (!raw) return [];
    return raw.split(",").filter(Boolean);
  }

  global.ScormAPI = {
    hasLMS,
    initialize,
    saveProgress,
    loadProgress,
    finish,
  };

  // Report "incomplete" the moment the course opens, and always flush +
  // finish on unload so browsers that skip beforeunload timing don't
  // strand the LMS on a stale "not attempted" status.
  global.addEventListener("load", function () {
    if (initialize()) {
      if (getValue("cmi.core.lesson_status") === "not attempted") {
        setValue("cmi.core.lesson_status", "incomplete");
        commit();
      }
    }
  });
  global.addEventListener("beforeunload", function () {
    finish();
  });
})(window as ScormWindow);

export {};
