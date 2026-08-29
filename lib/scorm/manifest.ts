// lib/scorm/manifest.ts
//
// Generates a SCORM 1.2 imsmanifest.xml describing a single SCO (the
// whole course is one imsmanifest "item"/"resource" pointing at
// index.html -- see templates.ts's header comment for why single-SCO
// was chosen over one-SCO-per-lesson).
//
// Not bundling the ADL/IMS XSD schema files themselves (imscp_rootv1p1p2.xsd
// etc.) -- Canvas, Moodle, and SCORM Cloud all parse this structurally
// rather than strictly validating against the referenced schemaLocation
// URLs. If a stricter LMS ever rejects the package for that reason, the
// four schema files are freely downloadable from adlnet.org and can be
// dropped into the zip root alongside imsmanifest.xml.

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** SCORM identifiers must be safe for use as XML IDs -- no spaces, must
 * start with a letter. Course titles are free text, so this derives a
 * stable-enough id from the (Convex) course id rather than the title. */
function safeIdentifier(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, "_");
  return /^[a-zA-Z]/.test(cleaned) ? cleaned : `C_${cleaned}`;
}

export function buildManifest(course: { id: string; title: string }): string {
  const orgId = `ORG_${safeIdentifier(course.id)}`;
  const itemId = `ITEM_${safeIdentifier(course.id)}`;
  const resourceId = `RES_${safeIdentifier(course.id)}`;
  const title = escapeXml(course.title);

  return `<?xml version="1.0" standalone="no" ?>
<manifest identifier="MANIFEST_${safeIdentifier(course.id)}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="${orgId}">
    <organization identifier="${orgId}">
      <title>${title}</title>
      <item identifier="${itemId}" identifierref="${resourceId}">
        <title>${title}</title>
        <adlcp:masteryscore>100</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="${resourceId}" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="style.css"/>
      <file href="scorm12-api.js"/>
    </resource>
  </resources>
</manifest>
`;
}
