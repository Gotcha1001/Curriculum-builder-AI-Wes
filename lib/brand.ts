// lib/brand.ts
//
// NEW FILE. Every migration this app has been through (CV Make AI -> Plan
// Make AI -> now this) left at least one file with the old name still
// hardcoded somewhere, because there was no single place that owned the
// string. Navbar.tsx was still "CV Make AI" two migrations later; the
// sidebar had drifted to "Plan Make AI" independently. Fixing that pattern
// here rather than just fixing today's instance of it.
//
// Anything that renders the product name imports APP_NAME from here.
// A future rename is a one-line change instead of a grep-and-hope.

export const APP_NAME = "Course Make";
export const APP_NAME_SUFFIX = "AI"; // rendered in the accent color, separately, in most places
export const APP_TAGLINE = "A curriculum, paced to actually fit your schedule";
