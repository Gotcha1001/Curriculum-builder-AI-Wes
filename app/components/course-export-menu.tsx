// // components/course-export-menu.tsx
// //
// // Two download options for a course: the existing PDF handout, and the
// // new SCORM package (lib/scorm/build-package.ts) for LMS upload. Both are
// // plain GET links to API routes rather than fetch+blob+download JS -- the
// // browser handles the download natively via each route's
// // Content-Disposition header, so there's no loading state to manage here
// // beyond disabling the trigger while the menu is open.
// //
// // PDF_ROUTE is a guess at your existing endpoint's path -- update it to
// // match whatever app/api/courses/[courseId]/pdf/route.ts (or wherever
// // your current "Download PDF" button points) actually is.

// "use client";

// import { useState, useRef, useEffect } from "react";
// import { Download, FileText, Package } from "lucide-react";
// import { Button } from "@/components/ui/button";

// const PDF_ROUTE = (courseId: string) => `/api/courses/${courseId}/pdf`;
// const SCORM_ROUTE = (courseId: string) =>
//   `/api/courses/${courseId}/export/scorm`;

// export function CourseExportMenu({ courseId }: { courseId: string }) {
//   const [open, setOpen] = useState(false);
//   const menuRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     function onClickOutside(e: MouseEvent) {
//       if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", onClickOutside);
//     return () => document.removeEventListener("mousedown", onClickOutside);
//   }, []);

//   return (
//     <div className="relative inline-block" ref={menuRef}>
//       <Button
//         variant="outline"
//         onClick={() => setOpen((v) => !v)}
//         className="gap-2"
//       >
//         <Download className="h-4 w-4" />
//         Export
//       </Button>

//       {open && (
//         <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-white dark:bg-zinc-900 shadow-lg z-50 overflow-hidden">
//           <a
//             href={PDF_ROUTE(courseId)}
//             className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
//             onClick={() => setOpen(false)}
//           >
//             <FileText className="h-5 w-5 mt-0.5 text-zinc-500 shrink-0" />
//             <span>
//               <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
//                 Download PDF
//               </span>
//               <span className="block text-xs text-zinc-500 mt-0.5">
//                 A printable handout of the full course
//               </span>
//             </span>
//           </a>
//           <div className="border-t" />
//           <a
//             href={SCORM_ROUTE(courseId)}
//             className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
//             onClick={() => setOpen(false)}
//           >
//             <Package className="h-5 w-5 mt-0.5 text-zinc-500 shrink-0" />
//             <span>
//               <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
//                 Download SCORM package
//               </span>
//               <span className="block text-xs text-zinc-500 mt-0.5">
//                 Upload the .zip to Canvas, Moodle, or any SCORM 1.2 LMS
//               </span>
//             </span>
//           </a>
//         </div>
//       )}
//     </div>
//   );
// }

// components/course-export-menu.tsx
//
// Two download options for a course: the existing PDF handout, and the
// SCORM package (lib/scorm/build-package.ts) for LMS upload. Both are
// plain GET links to API routes rather than fetch+blob+download JS -- the
// browser handles the download natively via each route's
// Content-Disposition header, so there's no loading state to manage here
// beyond disabling the trigger while the menu is open.
//
// pdfUrl/scormUrl are passed in by the caller (course-preview.tsx resolves
// them per-context) rather than derived here from courseId, since this
// menu is shared by both the authed dashboard view (courseId-based routes)
// and the public share page (shareId-based routes).

"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CourseExportMenu({
  pdfUrl,
  scormUrl,
}: {
  pdfUrl: string;
  scormUrl: string;
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
        </div>
      )}
    </div>
  );
}
