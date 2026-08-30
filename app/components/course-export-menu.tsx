// components/course-export-menu.tsx
//
// UPDATED: added `wordUrl` as a third download option, mirroring pdfUrl and
// scormUrl exactly — same trigger button, same dropdown, same click-outside
// handling. No new state or behavior, just one more <a> in the menu.

"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, Package, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CourseExportMenu({
  pdfUrl,
  scormUrl,
  wordUrl,
}: {
  pdfUrl: string;
  scormUrl: string;
  wordUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <Button
        variant="outline"
        onClick={() => setOpen((v) => !v)}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-white dark:bg-zinc-900 shadow-lg z-50 overflow-hidden">
          <a
            href={pdfUrl}
            className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => setOpen(false)}
          >
            <FileText className="h-5 w-5 mt-0.5 text-zinc-500 shrink-0" />
            <span>
              <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Download PDF
              </span>
              <span className="block text-xs text-zinc-500 mt-0.5">
                A printable handout of the full course
              </span>
            </span>
          </a>
          <div className="border-t" />
          <a
            href={scormUrl}
            className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => setOpen(false)}
          >
            <Package className="h-5 w-5 mt-0.5 text-zinc-500 shrink-0" />
            <span>
              <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Download SCORM package
              </span>
              <span className="block text-xs text-zinc-500 mt-0.5">
                Upload the .zip to Canvas, Moodle, or any SCORM 1.2 LMS
              </span>
            </span>
          </a>
          <div className="border-t" />
          <a
            href={wordUrl}
            className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => setOpen(false)}
          >
            <FileEdit className="h-5 w-5 mt-0.5 text-zinc-500 shrink-0" />
            <span>
              <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Download Word document
              </span>
              <span className="block text-xs text-zinc-500 mt-0.5">
                An editable .docx you can rewrite, rebrand, or hand off
              </span>
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
