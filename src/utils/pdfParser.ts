import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.js?url";
import { inflate, inflateRaw } from "pako";

// Configure worker for pdfjs-dist reliably in Vite environment
try {
  if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  }
} catch (e) {
  console.warn("Could not set PDF worker URL directly:", e);
}

export type UrgencyScheduleOption = "today" | "next_week" | "today_next_week" | "none";

export interface KmzAttachment {
  id: string;
  fileName: string;
  fileSizeFormatted: string;
  file?: File;
  rawBase64?: string;
}

export interface ProjectDetailSection {
  count: number;
  studyType: string;
  rawLine: string;
  addOns: string;
  timeRange?: string;
  locations?: string;
}

export interface ScannedPdfData {
  id: string;
  fileName: string;
  rawText: string;
  projectNumber: string;
  urgency: string;
  cityState: string;
  region: string;
  locationsCount: string;
  studyType: string; // "ATR" | "TMC" | other
  studyLineRaw: string;
  addOns: string;
  fullStudyFormatted: string;
  firm?: string;
  contact?: string;
  dueDate?: string;
  hardDueDate?: string;
  emailBodyText: string;
  emailBodyHtml: string;
  emailSubject: string;
  originalFile?: File;
  originalFileBase64?: string;
  detailSections?: ProjectDetailSection[];
}

/**
 * Generates email subject line:
 * - ATR: <Project Number> ALG <Add ons>
 * - TMC: <Project Number> TMC Approval
 * - Combined (2 PDFs): <ATR Project Number> ALG <Add ons> and <TMC Project Number> TMC Approval
 */
export function formatAtrSubject(projectNumber: string, addOns?: string): string {
  const proj = (projectNumber || "Project").trim();
  const cleanAddOns = (addOns || "").trim();
  return cleanAddOns ? `${proj} ALG ${cleanAddOns}` : `${proj} ALG Volume`;
}

export function formatTmcSubject(projectNumber: string): string {
  const proj = (projectNumber || "Project").trim();
  return `${proj} TMC Approval`;
}

export function formatCombinedSubject(
  atrProjectNumber: string,
  atrAddOns: string | undefined,
  tmcProjectNumber: string
): string {
  const atrPart = formatAtrSubject(atrProjectNumber, atrAddOns);
  const tmcPart = formatTmcSubject(tmcProjectNumber);
  return `${atrPart} and ${tmcPart}`;
}

export function formatTripleCombinedSubject(
  priorAtrProjectNumber: string,
  priorAddOns: string | undefined,
  secondAtrProjectNumber: string,
  secondAddOns: string | undefined,
  tmcProjectNumber: string
): string {
  const atr1 = (priorAtrProjectNumber || "ATR 1").trim();
  const atr2 = (secondAtrProjectNumber || "ATR 2").trim();
  const add1 = (priorAddOns || "Volume").trim();
  const add2 = (secondAddOns || "Volume").trim();
  const addOnsCombined = add1 === add2 ? add1 : `${add1} / ${add2}`;
  const tmcPart = formatTmcSubject(tmcProjectNumber);
  return `${atr1} & ${atr2} ALG ${addOnsCombined} and ${tmcPart}`;
}

/**
 * Combines add-ons from multiple project detail sections.
 * If all sections have identical add-ons (e.g. both are "Volume, Speed"), returns "Volume, Speed".
 * If there is a discrepancy (e.g. "Volume, Speed" and "Volume, Classification, Speed"),
 * joins unique add-on strings in order of appearance with "/" separator:
 * "Volume, Speed/Volume, Classification, Speed"
 */
export function combineAddOnsWithDiscrepancy(addOnList: string[]): string {
  const filtered = addOnList.map((a) => (a || "").trim()).filter(Boolean);
  if (filtered.length === 0) return "";
  if (filtered.length === 1) return filtered[0];

  const firstLower = filtered[0].toLowerCase();
  const allIdentical = filtered.every((a) => a.toLowerCase() === firstLower);
  if (allIdentical) {
    return filtered[0];
  }

  // There is a discrepancy -> deduplicate unique in order of appearance and join with "/"
  const uniqueInOrder: string[] = [];
  const seen = new Set<string>();
  for (const item of filtered) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueInOrder.push(item);
    }
  }

  return uniqueInOrder.join("/");
}

/**
 * Formats the URGENCY line with selectable scheduling option:
 * - "today": URGENCY: <Urgency> - Need to schedule today
 * - "next_week": URGENCY: <Urgency> - Need to schedule next week
 * - "today_next_week": URGENCY: <Urgency> – Need to schedule today/next week.
 * - "none": URGENCY: <Urgency>
 */
export function formatUrgencyLine(
  urgency: string,
  scheduleOption: UrgencyScheduleOption = "today_next_week"
): string {
  let cleanUrgency = (urgency || "Priority Client").trim();
  // Strip any existing "- Need to schedule..." suffix so toggles switch cleanly
  cleanUrgency = cleanUrgency.replace(/\s*[-–—:]\s*Need\s+to\s+schedule.*$/i, "").trim();
  cleanUrgency = cleanUrgency.replace(/\s*Need\s+to\s+schedule.*$/i, "").trim();
  if (!cleanUrgency) cleanUrgency = "Priority Client";

  switch (scheduleOption) {
    case "today":
      return `URGENCY: ${cleanUrgency} - Need to schedule today`;
    case "next_week":
      return `URGENCY: ${cleanUrgency} - Need to schedule next week`;
    case "today_next_week":
      return `URGENCY: ${cleanUrgency} – Need to schedule today/next week.`;
    case "none":
    default:
      return `URGENCY: ${cleanUrgency}`;
  }
}

/**
 * Convert browser File or Blob to base64 string
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a standard RFC 2822 / MIME multipart .eml message with attachments
 * (compatible with Microsoft Outlook, Apple Mail, Thunderbird, etc.)
 */
export async function createMultipartEml({
  subject,
  to,
  htmlBody,
  pdfAttachments = [],
  kmzAttachments = [],
}: {
  subject: string;
  to: string;
  htmlBody: string;
  pdfAttachments?: { name: string; file?: File; base64?: string }[];
  kmzAttachments?: KmzAttachment[];
}): Promise<Blob> {
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  let eml = `From: Scheduling Team <scheduling@ndsdata.com>\r\n`;
  eml += `To: ${to}\r\n`;
  eml += `Subject: ${subject}\r\n`;
  eml += `MIME-Version: 1.0\r\n`;

  const totalAttachments = pdfAttachments.length + kmzAttachments.length;

  if (totalAttachments === 0) {
    eml += `Content-Type: text/html; charset=utf-8\r\n`;
    eml += `Content-Transfer-Encoding: 8bit\r\n\r\n`;
    eml += `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${htmlBody}</body></html>`;
  } else {
    eml += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

    // Part 1: HTML Body
    eml += `--${boundary}\r\n`;
    eml += `Content-Type: text/html; charset=utf-8\r\n`;
    eml += `Content-Transfer-Encoding: 8bit\r\n\r\n`;
    eml += `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${htmlBody}</body></html>\r\n\r\n`;

    // Part 2: PDF Attachments
    for (const pdf of pdfAttachments) {
      let b64 = pdf.base64 || "";
      if (!b64 && pdf.file) {
        b64 = await fileToBase64(pdf.file);
      }
      if (!b64) {
        // Create mock placeholder PDF binary if testing sample
        b64 = btoa(`%PDF-1.4\n1 0 obj\n<< /Title (${pdf.name}) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`);
      }

      eml += `--${boundary}\r\n`;
      eml += `Content-Type: application/pdf; name="${pdf.name}"\r\n`;
      eml += `Content-Transfer-Encoding: base64\r\n`;
      eml += `Content-Disposition: attachment; filename="${pdf.name}"\r\n\r\n`;

      const chunked = b64.match(/.{1,76}/g)?.join("\r\n") || b64;
      eml += `${chunked}\r\n\r\n`;
    }

    // Part 3: KMZ / KML Attachments
    for (const kmz of kmzAttachments) {
      let b64 = kmz.rawBase64 || "";
      if (!b64 && kmz.file) {
        b64 = await fileToBase64(kmz.file);
      }
      if (!b64) {
        // Create minimal KML XML representation
        const kmlMock = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${kmz.fileName}</name>
    <description>Study Map Locations</description>
  </Document>
</kml>`;
        b64 = btoa(kmlMock);
      }

      const mimeType = kmz.fileName.toLowerCase().endsWith(".kml")
        ? "application/vnd.google-earth.kml+xml"
        : "application/vnd.google-earth.kmz";

      eml += `--${boundary}\r\n`;
      eml += `Content-Type: ${mimeType}; name="${kmz.fileName}"\r\n`;
      eml += `Content-Transfer-Encoding: base64\r\n`;
      eml += `Content-Disposition: attachment; filename="${kmz.fileName}"\r\n\r\n`;

      const chunked = b64.match(/.{1,76}/g)?.join("\r\n") || b64;
      eml += `${chunked}\r\n\r\n`;
    }

    eml += `--${boundary}--\r\n`;
  }

  return new Blob([eml], { type: "message/rfc822" });
}

/**
 * Flate stream decompressor & binary parser to extract printable strings from PDF streams
 */
export function extractTextFromPdfStreamFallback(arrayBuffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    const streamsText: string[] = [];

    // Helper to decode hex strings like <48656c6c6f> or <00410042>
    const decodePdfHexString = (hex: string): string => {
      const clean = hex.replace(/[^0-9A-Fa-f]/g, "");
      if (!clean) return "";
      let str = "";
      if (clean.length >= 4 && clean.startsWith("00")) {
        // UTF-16BE encoding
        for (let k = 0; k < clean.length - 3; k += 4) {
          const code = parseInt(clean.substring(k, k + 4), 16);
          if (code >= 32 && code <= 126) str += String.fromCharCode(code);
          else if (code === 10 || code === 13) str += "\n";
          else if (code > 0) str += " ";
        }
      } else {
        // Standard ASCII/Latin1
        for (let k = 0; k < clean.length - 1; k += 2) {
          const code = parseInt(clean.substring(k, k + 2), 16);
          if (code >= 32 && code <= 126) str += String.fromCharCode(code);
          else if (code === 10 || code === 13) str += "\n";
          else if (code > 0) str += " ";
        }
      }
      return str.trim();
    };

    // Find all "stream" ... "endstream" blocks and decompress them using pako
    let i = 0;
    while (i < bytes.length - 10) {
      if (
        bytes[i] === 115 && // s
        bytes[i + 1] === 116 && // t
        bytes[i + 2] === 114 && // r
        bytes[i + 3] === 101 && // e
        bytes[i + 4] === 97 && // a
        bytes[i + 5] === 109 // m
      ) {
        let streamStart = i + 6;
        if (bytes[streamStart] === 13) streamStart++; // \r
        if (bytes[streamStart] === 10) streamStart++; // \n

        // Search for "endstream"
        let endIdx = -1;
        for (let j = streamStart; j < bytes.length - 8; j++) {
          if (
            bytes[j] === 101 && // e
            bytes[j + 1] === 110 && // n
            bytes[j + 2] === 100 && // d
            bytes[j + 3] === 115 && // s
            bytes[j + 4] === 116 && // t
            bytes[j + 5] === 114 && // r
            bytes[j + 6] === 101 && // e
            bytes[j + 7] === 97 && // a
            bytes[j + 8] === 109 // m
          ) {
            endIdx = j;
            break;
          }
        }

        if (endIdx > streamStart) {
          let streamEnd = endIdx;
          while (streamEnd > streamStart && (bytes[streamEnd - 1] === 10 || bytes[streamEnd - 1] === 13)) {
            streamEnd--;
          }

          const chunk = bytes.subarray(streamStart, streamEnd);
          try {
            const decompressed = inflate(chunk);
            const decoded = new TextDecoder("latin1").decode(decompressed);
            streamsText.push(decoded);
          } catch {
            try {
              const decompressedRaw = inflateRaw(chunk);
              const decoded = new TextDecoder("latin1").decode(decompressedRaw);
              streamsText.push(decoded);
            } catch {
              // Not flate or corrupted chunk
            }
          }
          i = endIdx + 9;
          continue;
        }
      }
      i++;
    }

    const rawLatin1 = new TextDecoder("latin1").decode(bytes);
    const combinedContent = streamsText.join("\n") + "\n" + rawLatin1;

    const extractedChunks: string[] = [];

    // 1. Extract text in parentheses (e.g., (26-470282), (Dallas, TX), (60 (24hr) ATR (1 day)), etc.)
    const tjMatches = combinedContent.match(/\((?:[^\\()]|\\.)*\)\s*T[jJ]/g);
    if (tjMatches) {
      for (const m of tjMatches) {
        const str = m.replace(/\s*T[jJ]$/, "").slice(1, -1)
          .replace(/\\([()\\])/g, "$1")
          .replace(/\\n/g, "\n");
        if (str.trim()) extractedChunks.push(str);
      }
    }

    // 2. Extract TJ array chunks: [ (60) 10 ((24hr) ATR (1 day)) ] TJ
    const arrayTjMatches = combinedContent.match(/\[([^\]]+)\]\s*TJ/gi);
    if (arrayTjMatches) {
      for (const arr of arrayTjMatches) {
        // Extract string tokens inside array
        const innerStrings = arr.match(/\((?:[^\\()]|\\.)*\)/g);
        if (innerStrings) {
          const joined = innerStrings
            .map((s) => s.slice(1, -1).replace(/\\([()\\])/g, "$1"))
            .join(" ");
          if (joined.trim()) extractedChunks.push(joined);
        }
        // Also extract hex tokens inside array [ <...> <...> ] TJ
        const hexTokens = arr.match(/<[0-9A-Fa-f\s]+>/g);
        if (hexTokens) {
          const joinedHex = hexTokens.map((h) => decodePdfHexString(h.slice(1, -1))).filter(Boolean).join(" ");
          if (joinedHex.trim()) extractedChunks.push(joinedHex);
        }
      }
    }

    // 3. Extract standalone hex strings: <48656c6c6f> Tj
    const hexTjMatches = combinedContent.match(/<[0-9A-Fa-f\s]{4,}>\s*T[jJ]/g);
    if (hexTjMatches) {
      for (const hm of hexTjMatches) {
        const hexBody = hm.replace(/\s*T[jJ]$/, "").slice(1, -1);
        const decoded = decodePdfHexString(hexBody);
        if (decoded.length >= 2) extractedChunks.push(decoded);
      }
    }

    // 4. Extract Object Stream (/ObjStm) text strings & readable tokens
    // Modern compressed PDFs store objects inside /ObjStm streams
    for (const streamStr of streamsText) {
      // Find strings in parentheses
      const parens = streamStr.match(/\((?:[^\\()]|\\.)*\)/g);
      if (parens) {
        for (const p of parens) {
          const clean = p.slice(1, -1).replace(/\\([()\\])/g, "$1").trim();
          if (clean.length >= 2 && !extractedChunks.includes(clean)) {
            extractedChunks.push(clean);
          }
        }
      }
      // Find project numbers directly inside stream
      const projInStream = streamStr.match(/(?:^|[^0-9])([0-9]{2}\s*[-–—]\s*[0-9]{4,8}(?:-[0-9]{1,4})?)(?:[^0-9]|$)/g);
      if (projInStream) {
        for (const p of projInStream) {
          const clean = p.trim().replace(/^[^0-9]+|[^0-9]+$/g, "");
          if (clean && !extractedChunks.includes(clean)) extractedChunks.push(clean);
        }
      }
    }

    if (extractedChunks.length > 2) {
      return extractedChunks.join("\n");
    }

    // Otherwise grab any project text patterns from the decompressed content or raw file
    const lines: string[] = [];
    const projMatch = combinedContent.match(/(?:^|[^0-9])([0-9]{2}\s*[-–—]\s*[0-9]{4,8}(?:-[0-9]{1,4})?)(?:[^0-9]|$)/);
    if (projMatch) lines.push(projMatch[1].trim());

    const studyMatch = combinedContent.match(/\(?\d+\)?\s*(?:\([^)]+\)\s*)*(?:ATR|TMC|ALG|VOLUME|SPEED|CLASSIFICATION)[^\n\r]+/i);
    if (studyMatch) lines.push(studyMatch[0]);

    const urgencyMatch = combinedContent.match(/URGENCY:[^\n\r]+/i);
    if (urgencyMatch) lines.push(urgencyMatch[0]);

    const locsMatch = combinedContent.match(/(?:TOTAL\s*LOCATIONS?|NO\.?\s*OF\s*LOCATIONS?|NUMBER\s*OF\s*LOCATIONS?|LOCATIONS?|SITES?)[:\s=]+(\d+)\b/i);
    if (locsMatch) lines.push(locsMatch[0]);

    return lines.join("\n");
  } catch (e) {
    console.warn("Fallback stream parser error:", e);
    return "";
  }
}

/**
 * Clean and normalize extracted text from PDF to ensure consistent parsing
 */
function normalizePdfText(rawText: string): string {
  let text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Normalize Unicode dashes and hyphens to ASCII hyphen '-'
  text = text.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");

  // Normalize project numbers with spaces around dash (e.g. "26 - 470282" or "26- 470282" -> "26-470282")
  text = text.replace(/\b(\d{2})\s*-\s*(\d{4,8}(?:-\d{1,4})?)\b/g, "$1-$2");

  // Normalize spaces inside parentheses (e.g. "( 24hr )" -> "(24hr)", "( 60 )" -> "(60)", "( 1 day )" -> "(1 day)")
  text = text.replace(/\(\s*([^)]*?)\s*\)/g, "($1)");

  // Normalize "w / " or "w/" to standard "w/ "
  text = text.replace(/\bw\s*\/\s*/gi, "w/ ");

  return text;
}

/**
 * Parse structured fields from the raw text of an ALG/TMC PDF.
 */
export function parseFieldsFromPdfText(
  rawText: string,
  fileName: string = "document.pdf",
  scheduleOption: UrgencyScheduleOption = "today_next_week",
  originalFile?: File
): ScannedPdfData {
  // Normalize text whitespace and linebreaks
  const normalizedText = normalizePdfText(rawText);

  // 1. Primary Project Number extraction
  let projectNumber = "";

  // Check if filename contains a project number (e.g., "26-470282.pdf" or "26-470282_Dallas.pdf" or "26-240037_Ascension Parish County...")
  const fileNameProjMatch = fileName.match(/(?:^|[^0-9])([0-9]{2}\s*[-–—]\s*[0-9]{4,8}(?:-[0-9]{1,4})?)(?:[^0-9]|$)/);
  const fileNameCityMatch = fileName.match(/(?:_|^)([A-Za-z\s.-]+(?:\s+Parish|\s+County)?,\s*[A-Z]{2})(?:_|\b|\.)/i);

  // Strip out RELATED PROJECTS and HISTORICAL PROJECTS blocks (including multi-line lists of numbers)
  // so they don't hijack the main project number
  const rawDocLines = normalizedText.split("\n");
  const filteredDocLines: string[] = [];
  let isSkippingRelated = false;

  for (let i = 0; i < rawDocLines.length; i++) {
    const line = rawDocLines[i];
    const trimmed = line.trim();
    if (/^(?:RELATED\s+PROJECTS|HISTORICAL\s+PROJECTS)/i.test(trimmed)) {
      isSkippingRelated = true;
      continue;
    }
    if (isSkippingRelated) {
      if (!trimmed) {
        isSkippingRelated = false;
        filteredDocLines.push(line);
        continue;
      }
      // If it's a project number line like 26-111111 or comma-separated numbers, skip it
      if (/^[0-9]{2}\s*[-–—]\s*[0-9]{4,8}/.test(trimmed) || /^[0-9]{6,10}/.test(trimmed)) {
        continue;
      }
      // Any other section header or label stops skipping
      isSkippingRelated = false;
    }
    filteredDocLines.push(line);
  }
  const textWithoutRelated = filteredDocLines.join("\n");

  // Priority 1: Labeled project number:
  // e.g. "PROJECT #: 26-470282", "PROJECT NO: 26-470282", "PROJECT: 26-470282", "NDS PROJECT: 26-470282", "WO #: 26-470282", "JOB #: 26-470282"
  const labeledMatch = textWithoutRelated.match(
    /(?:PROJECT\s*(?:NO\.?|NUMBER|#|ID)?|NDS\s*(?:PROJECT|JOB|WO)?(?:\s*(?:NO\.?|NUMBER|#|ID))?|JOB\s*(?:NO\.?|#|NUMBER)?|WORK\s*ORDER\s*#?|WO\s*#?|STATE\s*PROJECT(?:\s*(?:NO\.?|NUMBER|#))?)[:\s=]+([0-9]{2}\s*[-–—]\s*[0-9]{4,8}(?:-[0-9]{1,4})?|[0-9]{6,10})/i
  );
  if (labeledMatch && labeledMatch[1]) {
    projectNumber = labeledMatch[1].trim();
  }

  // Priority 2: Labeled on prior line:
  // e.g. "PROJECT NUMBER\n26-470282"
  if (!projectNumber) {
    const multiLineLabelMatch = textWithoutRelated.match(
      /(?:PROJECT\s*(?:NO\.?|NUMBER|#|ID)?|NDS\s*PROJECT|JOB\s*(?:NO\.?|NUMBER|#)?|WORK\s*ORDER)\s*[:]?\s*\n\s*([0-9]{2}\s*[-–—]\s*[0-9]{4,8}(?:-[0-9]{1,4})?|[0-9]{6,10})/i
    );
    if (multiLineLabelMatch && multiLineLabelMatch[1]) {
      projectNumber = multiLineLabelMatch[1].trim();
    }
  }

  // Priority 3: Sub-project IDs in tables / station schedules (e.g. 26-240037-001)
  if (!projectNumber) {
    const subProjMatch = textWithoutRelated.match(/(?<!\d)([0-9]{2}\s*[-–—]\s*[0-9]{4,8})-[0-9]{2,4}\b/);
    if (subProjMatch && subProjMatch[1]) {
      projectNumber = subProjMatch[1].trim();
    }
  }

  // Priority 4: Header pattern like "26-470282 | Dallas, TX" or "26-770109 | Boulder, CO" or "26-770113 - Cheyenne, WY"
  if (!projectNumber) {
    const headerProjMatch = textWithoutRelated.match(
      /(?:^|\n)\s*([0-9]{2}\s*[-–—]\s*[0-9]{4,8}(?:-[0-9]{1,4})?)\s*(?:\||-|,|\s{2,})\s*([A-Za-z\s.-]+,\s*[A-Z]{2})/
    );
    if (headerProjMatch && headerProjMatch[1]) {
      projectNumber = headerProjMatch[1].trim();
    }
  }

  // Priority 5: Look for standalone XX-XXXXXX in the first 30 lines (document header region)
  if (!projectNumber) {
    const topLines = textWithoutRelated.split("\n").slice(0, 30).join("\n");
    const topMatch = topLines.match(/(?:^|[^0-9])([0-9]{2}\s*[-–—]\s*[0-9]{4,8}(?:-[0-9]{1,4})?)(?:[^0-9]|$)/);
    if (topMatch && topMatch[1]) {
      projectNumber = topMatch[1].trim();
    }
  }

  // Priority 6: Fallback to filename match (e.g. 26-240037_Ascension...)
  if (!projectNumber && fileNameProjMatch && fileNameProjMatch[1]) {
    projectNumber = fileNameProjMatch[1].trim();
  }

  // Priority 7: Find any standalone XX-XXXXXX in primary text (excluding related projects)
  if (!projectNumber) {
    const standaloneMatch = textWithoutRelated.match(/(?:^|[^0-9])([0-9]{2}\s*[-–—]\s*[0-9]{4,8}(?:-[0-9]{1,4})?)(?:[^0-9]|$)/);
    if (standaloneMatch && standaloneMatch[1]) {
      projectNumber = standaloneMatch[1].trim();
    } else {
      const generalMatch = normalizedText.match(/(?:^|[^0-9])([0-9]{2}\s*[-–—]\s*[0-9]{4,8})(?:[^0-9]|$)/);
      if (generalMatch && generalMatch[1]) {
        projectNumber = generalMatch[1].trim();
      }
    }
  }

  // Clean up projectNumber formatting
  if (projectNumber) {
    projectNumber = projectNumber.replace(/^[:\s#]+|[:\s#]+$/g, "").trim();
  }

  // 2. Urgency
  let urgency = "Priority Client";
  const urgencyMatch = normalizedText.match(/URGENCY:\s*([^\n,;|]+)/i);
  if (urgencyMatch && urgencyMatch[1].trim()) {
    let rawUrg = urgencyMatch[1].trim();
    rawUrg = rawUrg.replace(/\s*[-–—:]\s*Need\s+to\s+schedule.*$/i, "").trim();
    rawUrg = rawUrg.replace(/\s*Need\s+to\s+schedule.*$/i, "").trim();
    urgency = rawUrg || "Priority Client";
  }

  // 3. City / State / Parish / Region
  let cityState = "";
  const headerCityMatch = normalizedText.match(
    /[0-9]{2}-[0-9]{4,8}(?:-[0-9]{1,4})?\s*(?:\||-|,|\s{2,})\s*([A-Za-z\s.-]+,\s*[A-Z]{2})/
  );
  if (headerCityMatch && headerCityMatch[1]) {
    cityState = headerCityMatch[1].trim();
  } else {
    // Check PARISH / COUNTY + STATE labels: e.g. "PARISH: Ascension Parish\nSTATE: LA"
    const parishMatch = normalizedText.match(/(?:PARISH|COUNTY):\s*([^\n\r,;|]+)/i);
    const stateMatch = normalizedText.match(/STATE:\s*([A-Z]{2})\b/i);
    if (parishMatch && parishMatch[1].trim()) {
      let pName = parishMatch[1].trim();
      pName = pName.replace(/\s+(?:STATE|CLIENT|DATE|URGENCY|PHONE|PROJECT).*$/i, "").trim();
      const sCode = stateMatch ? stateMatch[1].trim() : (fileNameCityMatch ? fileNameCityMatch[1].split(",")[1].trim() : "LA");
      cityState = `${pName}, ${sCode}`;
    } else {
      const cityMatch = normalizedText.match(/\b([A-Z][a-zA-Z\s.-]+,\s*[A-Z]{2})\b/);
      if (cityMatch) {
        cityState = cityMatch[1].trim();
      } else if (fileNameCityMatch && fileNameCityMatch[1]) {
        // Fallback to filename (e.g. "Ascension Parish County, LA" -> "Ascension Parish, LA")
        cityState = fileNameCityMatch[1].replace(/\s+County/i, "").trim();
      }
    }
  }

  let region = "South Central";
  const explicitRegionMatch = normalizedText.match(/Region:\s*([^\n,;|]+)/i);
  if (explicitRegionMatch && explicitRegionMatch[1].trim()) {
    region = explicitRegionMatch[1].trim();
  } else if (cityState) {
    const upperCity = cityState.toUpperCase();
    if (upperCity.includes(", LA") || upperCity.includes(", TX") || upperCity.includes(", OK") || upperCity.includes(", AR")) {
      region = "South Central";
    } else if (upperCity.includes(", CO") || upperCity.includes(", WY") || upperCity.includes(", UT") || upperCity.includes(", NM")) {
      region = "Mountain";
    } else if (upperCity.includes(", FL") || upperCity.includes(", GA") || upperCity.includes(", NC") || upperCity.includes(", SC")) {
      region = "Southeast";
    }
  }

  // 4. Firm and Contact
  let firm = "";
  const firmMatch = normalizedText.match(/FIRM:\s*([^\n\r,;|]+)/i);
  if (firmMatch && firmMatch[1].trim()) {
    firm = firmMatch[1].trim();
  }

  let contact = "";
  const contactMatch = normalizedText.match(/CONTACT:\s*([^\n\r,;|]+)/i);
  if (contactMatch && contactMatch[1].trim()) {
    contact = contactMatch[1].trim();
  }

  // 5. Project Details Section extraction (supporting multiple project detail sections & various table formats)
  let locationsCount = "1";
  let studyType = "";
  let studyLineRaw = "";
  let addOns = "";
  let detailSections: ProjectDetailSection[] = [];

  // Isolate "PROJECT DETAILS" (or STUDY DETAILS / SCOPE OF WORK / etc.) section if present
  const detailsIdx = normalizedText.search(
    /\b(?:PROJECT\s+DETAILS?|STUDY\s+DETAILS?|STUDY\s+INFORMATION|STUDY\s+TYPE|SCOPE\s+OF\s+WORK|PROJECT\s+SCOPE|COLLECTION\s+DETAILS|SURVEY\s+DETAILS|APPROVAL\s+DETAILS|DETAILS)\b/i
  );
  let detailsText = textWithoutRelated;
  if (detailsIdx !== -1) {
    const afterDetails = normalizedText.slice(detailsIdx + 7);
    const endMatch = afterDetails.search(
      /\b(?:PROJECT\s+ATTACHMENT(?:S)?|SPECIAL\s+INSTRUCTIONS|HISTORICAL\s+PROJECTS|RELATED\s+PROJECTS|ATTACHMENT(?:S)?|EQUIPMENT|BILLING|NOTES)\b/i
    );
    if (endMatch !== -1) {
      detailsText = afterDetails.slice(0, endMatch);
    } else {
      detailsText = afterDetails;
    }
  }

  // Regex to match each detail section's start line:
  // Supports:
  // - "3 (24hr) ATR (1 day)"
  // - "(60) (24hr) ATR (1 day)" or "60 (24hr) ATR (1 day)"
  // - "4 (4hr) TMC (1 day)" or "4 TMC (1 day)" or "4 TMC"
  // - "3 (24hr) ALG (1 day)" or "3 ALG (Volume)"
  // - "2 (48hr) ATR (2 days)"
  // - "3 (24hr) (1 day) ATR"
  // - "3x (24hr) ATR" or "3 Locations - ATR"
  // - "19 ATR"
  // - Study type keywords: ATR, TMC, ALG, VOLUME, SPEED, CLASSIFICATION, TURNING MOVEMENT, MIOVISION, MIOSPHERE, PEDS, PEDESTRIAN, BICYCLE
  const detailLineRegex = /(?:^|\n)\s*(?:\(?\s*(\d{1,4})\s*\)?)\s*(?:locations?|cams?|cameras?|units?)?\s*(?:-\s*)?(?:\([^)]*\)\s*|\d+\s*(?:hr|hour|day|days)\b\s*)*(ATR|TMC|ALG|VOLUME|SPEED|CLASS[A-Za-z]*|TURNING\s*MOVEMENT|MIOVISION|MIOSPHERE|PEDS?|PEDESTRIAN|BICYCLE)\b([^\n\r]*)/gi;

  interface DetailMatchInfo {
    count: number;
    studyType: string;
    rawLine: string;
    startIndex: number;
  }

  const findDetailMatches = (textToScan: string): DetailMatchInfo[] => {
    const list: DetailMatchInfo[] = [];
    let match: RegExpExecArray | null;
    const regex = new RegExp(detailLineRegex.source, "gi");
    while ((match = regex.exec(textToScan)) !== null) {
      const count = parseInt(match[1], 10);
      if (!isNaN(count) && count > 0) {
        const typeStr = match[2].toUpperCase().trim();
        const sType = (typeStr.includes("TMC") || typeStr.includes("TURNING"))
          ? "TMC"
          : "ATR";
        list.push({
          count,
          studyType: sType,
          rawLine: match[0].trim(),
          startIndex: match.index,
        });
      }
    }
    return list;
  };

  let matches = findDetailMatches(detailsText);

  // If no matches found in detailsText, try searching across textWithoutRelated
  if (matches.length === 0) {
    matches = findDetailMatches(textWithoutRelated);
  }

  // Also check inverted pattern where Study keyword comes first:
  // e.g. "ATR (24hr): 3 locations" or "TMC - 4 cameras" or "ALG: 3 locations"
  if (matches.length === 0) {
    const invertedRegex = /(?:^|\n)\s*\b(ATR|TMC|ALG|VOLUME|SPEED|CLASS[A-Za-z]*|TURNING\s*MOVEMENT|MIOVISION|MIOSPHERE)\b(?:\s*\([^)]*\))*\s*[:\-–—]?\s*(?:\(?\s*(\d{1,4})\s*(?:locations?|cams?|cameras?|units?)?\s*\)?)\b([^\n\r]*)/gi;
    let invMatch: RegExpExecArray | null;
    const scanArea = detailsText.length > 20 ? detailsText : textWithoutRelated;
    while ((invMatch = invertedRegex.exec(scanArea)) !== null) {
      const count = parseInt(invMatch[2], 10);
      if (!isNaN(count) && count > 0) {
        const typeStr = invMatch[1].toUpperCase().trim();
        const sType = (typeStr.includes("TMC") || typeStr.includes("TURNING")) ? "TMC" : "ATR";
        matches.push({
          count,
          studyType: sType,
          rawLine: invMatch[0].trim(),
          startIndex: invMatch.index,
        });
      }
    }
  }

  // Also check standalone study lines where the count is on the following line:
  // e.g. "STUDY DETAILS\nATR (24hr)\nLocation(s): 1, 2, 3, 4, 5, 6, 7"
  if (matches.length === 0) {
    const standaloneStudyRegex = /(?:^|\n)\s*(?:\([0-9a-zA-Z\s-]+\)\s*)*(ATR|TMC|ALG|TURNING\s*MOVEMENT|MIOVISION|MIOSPHERE)\b([^\n\r]*)/gi;
    const scanArea = detailsText.length > 20 ? detailsText : textWithoutRelated;
    let standMatch: RegExpExecArray | null;
    while ((standMatch = standaloneStudyRegex.exec(scanArea)) !== null) {
      const typeStr = standMatch[1].toUpperCase().trim();
      const sType = (typeStr.includes("TMC") || typeStr.includes("TURNING")) ? "TMC" : "ATR";

      // Look ahead in the sub-block to resolve the locations count
      const subBlock = scanArea.slice(standMatch.index, standMatch.index + 500);
      let count = 1;

      // Check "Location(s): 1, 2, 3, 4" or "Location(s): 1-5"
      const locListMatch = subBlock.match(/Location\(s\)?:\s*([0-9,\s-]+)/i);
      if (locListMatch && locListMatch[1]) {
        const rawList = locListMatch[1].trim();
        if (rawList.includes(",")) {
          const parts = rawList.split(",").map((p) => p.trim()).filter(Boolean);
          if (parts.length > 0) count = parts.length;
        } else if (/^\d+\s*-\s*\d+$/.test(rawList)) {
          const [start, end] = rawList.split("-").map((s) => parseInt(s.trim(), 10));
          if (!isNaN(start) && !isNaN(end) && end >= start) count = end - start + 1;
        } else {
          const single = parseInt(rawList, 10);
          if (!isNaN(single) && single > 0) count = single;
        }
      } else {
        // Check "Locations: 4" or "Camera Counts: 4"
        const countMatch = subBlock.match(/(?:Locations?|No\.?\s*of\s*Locations?|Total\s*Locations?|Camera\s*Counts?|Cameras?|#\s*of\s*Locations?|Qty|Quantity|Count)[:\s]+(\d+)\b/i);
        if (countMatch) {
          const parsed = parseInt(countMatch[1], 10);
          if (!isNaN(parsed) && parsed > 0) count = parsed;
        }
      }

      matches.push({
        count,
        studyType: sType,
        rawLine: standMatch[0].trim(),
        startIndex: standMatch.index,
      });
    }
  }

  if (matches.length > 0) {
    const sourceText = detailsIdx !== -1 && detailsText ? detailsText : textWithoutRelated;
    for (let i = 0; i < matches.length; i++) {
      const curr = matches[i];
      const nextStart = i + 1 < matches.length ? matches[i + 1].startIndex : sourceText.length;
      const blockText = sourceText.slice(curr.startIndex, nextStart);

      // Extract block Add-ons:
      // Priority 1: "w/ <Addons>" or "with <Addons>" or "Add-ons: <Addons>"
      let blockAddOn = "";
      const addOnMatch = blockText.match(/(?:w\s*\/\s*|with\s+|add-?ons?[:\s]+|options?[:\s]+|includes?[:\s]+|features?[:\s]+)([^\n\r|*]+)/i);
      if (addOnMatch && addOnMatch[1].trim()) {
        let cleanAddOn = addOnMatch[1].trim();
        if (cleanAddOn.includes("|")) {
          cleanAddOn = cleanAddOn.split("|")[0].trim();
        }
        cleanAddOn = cleanAddOn.replace(/\s*(?:TO\s+BE\s+COLLECTED|\*|PROJECT\s+NOTES|ALL\s+LOCATIONS|\d{1,2}:\d{2}-\d{1,2}:\d{2}).*$/i, "").trim();
        cleanAddOn = cleanAddOn.replace(/^[,;.\s]+|[,;.\s]+$/g, "").trim();
        blockAddOn = cleanAddOn;
      }

      // Priority 2: Check immediate next line in block if it contains known traffic add-on categories
      if (!blockAddOn) {
        const blockLines = blockText.split("\n").map((l) => l.trim()).filter(Boolean);
        // Look at the lines following the detail header line
        for (let lIdx = 1; lIdx < Math.min(blockLines.length, 4); lIdx++) {
          const lineCandidate = blockLines[lIdx];
          const lineLower = lineCandidate.toLowerCase();
          if (
            lineLower.includes("volume") ||
            lineLower.includes("speed") ||
            lineLower.includes("class") ||
            lineLower.includes("pedestrian") ||
            lineLower.includes("bicycle") ||
            lineLower.includes("truck") ||
            lineLower.includes("fhwa")
          ) {
            let cleanCandidate = lineCandidate.replace(/^w\/\s*/i, "").replace(/\|.*$/, "").trim();
            cleanCandidate = cleanCandidate.replace(/\s*(?:TO\s+BE\s+COLLECTED|\*|PROJECT\s+NOTES).*$/i, "").trim();
            blockAddOn = cleanCandidate;
            break;
          }
        }
      }

      // Priority 3: Keyword combination inference
      if (!blockAddOn) {
        const lower = blockText.toLowerCase();
        if (lower.includes("speed") && (lower.includes("class") || lower.includes("classification"))) {
          blockAddOn = "Speed & Classification";
        } else if (lower.includes("speed") && lower.includes("volume")) {
          blockAddOn = "Volume, Speed";
        } else if (lower.includes("speed")) {
          blockAddOn = "Speed";
        } else if (lower.includes("class") || lower.includes("classification")) {
          blockAddOn = "Classification";
        } else if (curr.studyType === "ATR" || lower.includes("volume")) {
          blockAddOn = "Volume";
        }
      }

      // Extract timeRange & location numbers if present
      const timeRangeMatch = blockText.match(/\d{1,2}:\d{2}-\d{1,2}:\d{2}[^\n\r]*/);
      const timeRange = timeRangeMatch ? timeRangeMatch[0].trim() : undefined;
      const locMatch = blockText.match(/Location\(s\)?:\s*([^\n\r]+)/i);
      const locations = locMatch ? locMatch[1].trim() : undefined;

      // If count was 1 or not specified, but blockText has Location(s): 1, 2, 3..., update count
      let effectiveCount = curr.count;
      const subLocListMatch = blockText.match(/Location\(s\)?:\s*([0-9,\s-]+)/i);
      if (subLocListMatch && subLocListMatch[1]) {
        const rawList = subLocListMatch[1].trim();
        if (rawList.includes(",")) {
          const parts = rawList.split(",").map((p) => p.trim()).filter(Boolean);
          if (parts.length > 1) {
            effectiveCount = parts.length;
          }
        } else if (/^\d+\s*-\s*\d+$/.test(rawList)) {
          const [start, end] = rawList.split("-").map((s) => parseInt(s.trim(), 10));
          if (!isNaN(start) && !isNaN(end) && end >= start) {
            effectiveCount = end - start + 1;
          }
        }
      }

      detailSections.push({
        count: effectiveCount,
        studyType: curr.studyType,
        rawLine: curr.rawLine,
        addOns: blockAddOn,
        timeRange,
        locations,
      });
    }

    // Sum all location counts: e.g. 3 + 2 = 5
    const totalCount = detailSections.reduce((sum, s) => sum + s.count, 0);
    locationsCount = String(totalCount);

    // If detail sections only resolved 1 location (common when only "STUDY: Volume" was matched),
    // check if the document has explicit location count labels, sub-project IDs, or site rows
    if (totalCount <= 1) {
      const explicitLocMatch = normalizedText.match(
        /(?:TOTAL\s*LOCATIONS?|NO\.?\s*OF\s*LOCATIONS?|NUMBER\s*OF\s*LOCATIONS?|LOCATIONS?\s*COUNT|TOTAL\s*SITES?|NO\.?\s*OF\s*SITES?|NUMBER\s*OF\s*SITES?|SITES?\s*COUNT|TOTAL\s*STATIONS?|NO\.?\s*OF\s*STATIONS?|NUMBER\s*OF\s*STATIONS?|CAMERA\s*COUNTS?|NUMBER\s*OF\s*CAMERAS?|TOTAL\s*UNITS?|LOCATIONS?|SITES?|STATIONS?)[:\s=]+(\d+)\b/i
      );
      if (explicitLocMatch) {
        locationsCount = explicitLocMatch[1].trim();
        if (detailSections.length === 1) {
          detailSections[0].count = parseInt(locationsCount, 10) || 1;
        }
      } else {
        const subProjMatches = Array.from(normalizedText.matchAll(/(?<!\d)([0-9]{2}\s*[-–—]\s*[0-9]{4,8})-([0-9]{2,4})\b/g));
        if (subProjMatches.length > 1) {
          const uniqueSubs = new Set(subProjMatches.map((m) => m[0]));
          if (uniqueSubs.size > 1) {
            locationsCount = String(uniqueSubs.size);
            if (detailSections.length === 1) {
              detailSections[0].count = uniqueSubs.size;
            }
          }
        } else {
          const siteRowMatches = Array.from(normalizedText.matchAll(/(?:^|\n)\s*(?:Site|Location|Loc\.?|Station|Stn\.?)\s*#?\s*(\d+)/gi));
          if (siteRowMatches.length > 1) {
            const siteNums = siteRowMatches.map((m) => parseInt(m[1], 10)).filter((n) => !isNaN(n));
            const maxNum = siteNums.length > 0 ? Math.max(...siteNums) : 0;
            const totalRows = Math.max(siteRowMatches.length, maxNum);
            if (totalRows > 1) {
              locationsCount = String(totalRows);
              if (detailSections.length === 1) {
                detailSections[0].count = totalRows;
              }
            }
          }
        }
      }
    }

    // Study type: TMC if all sections are TMC; otherwise ATR
    const hasTmc = detailSections.some((s) => s.studyType === "TMC");
    const hasAtr = detailSections.some((s) => s.studyType === "ATR");
    if (hasTmc && !hasAtr) {
      studyType = "TMC";
    } else {
      studyType = "ATR";
    }

    studyLineRaw = detailSections.map((s) => s.rawLine).join(" & ");

    // Combined add-ons with discrepancy handling:
    // e.g. "Volume, Speed/Volume, Classification, Speed"
    addOns = combineAddOnsWithDiscrepancy(detailSections.map((s) => s.addOns));
  } else {
    // Fallback: If detail line regex didn't find matches, check explicit locations count labels
    let detectedLocations = "";

    // 1. Explicit Location Count labels (e.g. "TOTAL LOCATIONS: 6", "No. of Locations: 6", "Locations: 6", "Total Sites: 6")
    const explicitLocMatch = normalizedText.match(
      /(?:TOTAL\s*LOCATIONS?|NO\.?\s*OF\s*LOCATIONS?|NUMBER\s*OF\s*LOCATIONS?|LOCATIONS?\s*COUNT|TOTAL\s*SITES?|NO\.?\s*OF\s*SITES?|NUMBER\s*OF\s*SITES?|SITES?\s*COUNT|TOTAL\s*STATIONS?|NO\.?\s*OF\s*STATIONS?|NUMBER\s*OF\s*STATIONS?|CAMERA\s*COUNTS?|NUMBER\s*OF\s*CAMERAS?|TOTAL\s*UNITS?|LOCATIONS?|SITES?|STATIONS?)[:\s=]+(\d+)\b/i
    );
    if (explicitLocMatch) {
      detectedLocations = explicitLocMatch[1].trim();
    }

    // 2. Comma-separated Location list: "Location(s): 1, 2, 3, 4" or range "Location(s): 1-5" / "Sites: 1-6"
    if (!detectedLocations) {
      const locListMatch = normalizedText.match(/(?:Location\(s\)?|Sites?|Stations?)[:\s]+([0-9,\s-]+)/i);
      if (locListMatch && locListMatch[1]) {
        const rawList = locListMatch[1].trim();
        if (rawList.includes(",")) {
          const parts = rawList.split(",").map((p) => p.trim()).filter(Boolean);
          if (parts.length > 0) {
            detectedLocations = String(parts.length);
          }
        } else if (/^\d+\s*-\s*\d+$/.test(rawList)) {
          const [start, end] = rawList.split("-").map((s) => parseInt(s.trim(), 10));
          if (!isNaN(start) && !isNaN(end) && end >= start) {
            detectedLocations = String(end - start + 1);
          }
        }
      }
    }

    // 3. Count unique sub-project numbers in tables (e.g. 26-240037-001, 26-240037-002...)
    if (!detectedLocations) {
      const subProjMatches = Array.from(normalizedText.matchAll(/(?<!\d)([0-9]{2}\s*[-–—]\s*[0-9]{4,8})-([0-9]{2,4})\b/g));
      if (subProjMatches.length > 0) {
        const uniqueSubs = new Set(subProjMatches.map((m) => m[0]));
        if (uniqueSubs.size > 0) {
          detectedLocations = String(uniqueSubs.size);
        }
      }
    }

    // 4. Count numbered location rows in station schedules (e.g. "Site 1", "Site 2" ... or "Location 1", "Location 2" ...)
    if (!detectedLocations) {
      const siteRowMatches = Array.from(normalizedText.matchAll(/(?:^|\n)\s*(?:Site|Location|Loc\.?|Station|Stn\.?)\s*#?\s*(\d+)/gi));
      if (siteRowMatches.length > 0) {
        const siteNums = siteRowMatches.map((m) => parseInt(m[1], 10)).filter((n) => !isNaN(n));
        const maxNum = siteNums.length > 0 ? Math.max(...siteNums) : 0;
        const totalRows = Math.max(siteRowMatches.length, maxNum);
        if (totalRows > 0) {
          detectedLocations = String(totalRows);
        }
      }
    }

    // 5. Loose pattern: "60 ATR", "19 ATR", "12 TMC", "4 (4hr) TMC"
    if (!detectedLocations) {
      const looseMatch = normalizedText.match(/(?:\(?\s*(\d{1,4})\s*\)?)\s*(?:locations?|cams?)?\s*(?:(?:\([^)]+\)\s*)*)(ATR|TMC|ALG|MIOSPHERE|MIOVISION)\b/i);
      if (looseMatch) {
        detectedLocations = looseMatch[1].trim();
        studyType = looseMatch[2].toUpperCase().includes("TMC") ? "TMC" : "ATR";
        studyLineRaw = looseMatch[0].trim();
      }
    }

    // 6. "3 locations" or "4 cameras" anywhere
    if (!detectedLocations) {
      const countPhraseMatch = normalizedText.match(/\b(\d{1,4})\s+(?:locations?|cameras?|cams?|units?|sites?|stations?)\b/i);
      if (countPhraseMatch) {
        detectedLocations = countPhraseMatch[1].trim();
      }
    }

    // 7. Check filename for locations tag (e.g. "26-240037_6_locations.pdf" or "_6loc_")
    if (!detectedLocations) {
      const fileLocMatch = fileName.match(/[_\s-](\d{1,3})\s*(?:locs?|locations?|sites?|cams?|stations?)[_\s.-]/i);
      if (fileLocMatch) {
        detectedLocations = fileLocMatch[1].trim();
      }
    }

    locationsCount = detectedLocations || "1";

    // Explicit Study Type / Service / Survey label check:
    const explicitStudyMatch = normalizedText.match(/(?:STUDY\s*(?:TYPE)?|SERVICE\s*(?:TYPE)?|SURVEY\s*(?:TYPE)?|TYPE\s*OF\s*STUDY|COUNT\s*TYPE|COLLECTION\s*TYPE)[:\s]+([^\n\r]+)/i);
    let explicitStudyStr = explicitStudyMatch ? explicitStudyMatch[1].trim() : "";

    // Determine studyType if still not resolved
    if (!studyType) {
      const textUpper = (normalizedText + " " + fileName + " " + explicitStudyStr).toUpperCase();
      if (
        textUpper.includes(" TMC") ||
        textUpper.includes("TURNING MOVEMENT") ||
        textUpper.includes("TMC APPROVAL") ||
        textUpper.includes("CAMERA PLACEMENT") ||
        textUpper.includes("MIOVISION") ||
        textUpper.includes("MIOSPHERE")
      ) {
        studyType = "TMC";
      } else {
        studyType = "ATR";
      }
    }

    // Add-ons fallback
    const addOnMatch = normalizedText.match(/(?:w\s*\/\s*|with\s+|add-?ons?[:\s]+|options?[:\s]+|includes?[:\s]+)([^\n\r|*]+)/i);
    if (addOnMatch && addOnMatch[1].trim()) {
      let cleanAddOn = addOnMatch[1].trim();
      if (cleanAddOn.includes("|")) {
        cleanAddOn = cleanAddOn.split("|")[0].trim();
      }
      cleanAddOn = cleanAddOn.replace(/\s*(?:TO\s+BE\s+COLLECTED|\*|PROJECT\s+NOTES|ALL\s+LOCATIONS).*$/i, "").trim();
      cleanAddOn = cleanAddOn.replace(/^[,;.\s]+|[,;.\s]+$/g, "").trim();
      addOns = cleanAddOn;
    } else {
      const lower = (normalizedText + " " + explicitStudyStr).toLowerCase();
      if (lower.includes("speed") && (lower.includes("class") || lower.includes("classification"))) {
        addOns = "Speed & Classification";
      } else if (lower.includes("speed") && lower.includes("volume")) {
        addOns = "Volume, Speed";
      } else if (lower.includes("speed")) {
        addOns = "Speed";
      } else if (lower.includes("class") || lower.includes("classification")) {
        addOns = "Classification";
      } else if (studyType === "ATR" || lower.includes("volume") || lower.includes("cover sheet")) {
        addOns = "Volume";
      }
    }

    detailSections = [
      {
        count: parseInt(locationsCount, 10) || 1,
        studyType,
        rawLine: studyLineRaw || `${locationsCount} ${studyType}`,
        addOns,
      },
    ];
  }

  let fullStudyFormatted = "";
  if (studyType.includes("ATR")) {
    if (addOns) {
      fullStudyFormatted = addOns.toUpperCase().startsWith("ALG ") ? addOns : `ALG ${addOns}`;
    } else {
      fullStudyFormatted = "ALG Volume";
    }
  } else if (studyType.includes("TMC")) {
    if (addOns) {
      fullStudyFormatted = addOns.toUpperCase().startsWith("TMC ") ? addOns : `TMC ${addOns}`;
    } else {
      fullStudyFormatted = "TMC";
    }
  } else {
    fullStudyFormatted = addOns ? `ALG ${addOns}` : `ALG ${studyType}`;
  }

  let dueDate = "";
  const dueMatch = normalizedText.match(/DUE DATE:\s*([^\n\r]+)/i);
  if (dueMatch) dueDate = dueMatch[1].trim();

  let hardDueDate = "";
  const hardDueMatch = normalizedText.match(/HARD DUE DATE:\s*([^\n\r]+)/i);
  if (hardDueMatch) hardDueDate = hardDueMatch[1].trim();

  // Construct Email Template based on study type and scheduleOption:
  const isTmc = studyType.includes("TMC");

  let emailSubject = "";
  let emailBodyText = "";
  let emailBodyHtml = "";

  if (isTmc) {
    emailSubject = formatTmcSubject(projectNumber);
    const urgencyLine = formatUrgencyLine(urgency, scheduleOption === "today_next_week" ? "none" : scheduleOption);

    emailBodyText = `Hi James,

Please see TMC camera placement approval.

${urgencyLine}

Project Number: ${projectNumber}
Location/s: ${locationsCount}`;

    emailBodyHtml = `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi James,</p>
  <p style="margin: 0 0 12px 0;">Please see TMC camera placement approval.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">${urgencyLine}</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>${projectNumber}</strong></p>
  <p style="margin: 0 0 0 0;"><strong>Location/s:</strong> ${locationsCount}</p>
</div>`.trim();
  } else {
    emailSubject = formatAtrSubject(projectNumber, addOns);
    const urgencyLine = formatUrgencyLine(urgency, scheduleOption);

    emailBodyText = `Hi Nina/Marisa,

Please see ALG conversion attached.

${urgencyLine}

Region: ${region}
Project Number: ${projectNumber}
Location/s: ${locationsCount}
Study: ${fullStudyFormatted}`;

    emailBodyHtml = `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi Nina/Marisa,</p>
  <p style="margin: 0 0 12px 0;">Please see ALG conversion attached.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">${urgencyLine}</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Region:</strong> ${region}</p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>${projectNumber}</strong></p>
  <p style="margin: 0 0 4px 0;"><strong>Location/s:</strong> ${locationsCount}</p>
  <p style="margin: 0 0 0 0;"><strong>Study:</strong> ${fullStudyFormatted}</p>
</div>`.trim();
  }

  return {
    id: `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fileName,
    rawText: normalizedText,
    projectNumber,
    urgency,
    cityState,
    region,
    locationsCount,
    studyType,
    studyLineRaw,
    addOns,
    fullStudyFormatted,
    firm,
    contact,
    dueDate,
    hardDueDate,
    emailBodyText,
    emailBodyHtml,
    emailSubject,
    originalFile,
    detailSections,
  };
}

/**
 * Parses the first page (or two) of a given PDF file in the browser with deterministic layout reconstruction.
 */
export async function parsePdfFile(
  file: File,
  scheduleOption: UrgencyScheduleOption = "today_next_week"
): Promise<ScannedPdfData> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      disableFontFace: true,
    });

    const pdf = await loadingTask.promise;
    const numPages = Math.min(pdf.numPages, 3);
    let fullExtractedText = "";

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });
      const pageWidth = viewport.width || 612;

      interface SpatialItem {
        str: string;
        x: number;
        y: number;
        width: number;
        height: number;
      }

      const items: SpatialItem[] = [];

      for (const item of textContent.items as any[]) {
        if (item.str && item.str.trim()) {
          const x = item.transform?.[4] || 0;
          const y = item.transform?.[5] || 0;
          const width = item.width || 0;
          const height = item.height || Math.abs(item.transform?.[0]) || Math.abs(item.transform?.[3]) || 10;
          items.push({ str: item.str, x, y, width, height });
        }
      }

      if (items.length === 0) continue;

      // 1. Sort all items strictly top-to-bottom (Y descending)
      items.sort((a, b) => b.y - a.y);

      // 2. Cluster into visual lines using baseline overlap
      interface LineCluster {
        y: number;
        height: number;
        items: SpatialItem[];
      }

      const lines: LineCluster[] = [];
      for (const item of items) {
        let matchedLine: LineCluster | null = null;
        for (const line of lines) {
          const tol = Math.max(3.5, Math.min(line.height, item.height) * 0.45);
          if (Math.abs(item.y - line.y) <= tol) {
            matchedLine = line;
            break;
          }
        }

        if (matchedLine) {
          matchedLine.items.push(item);
        } else {
          lines.push({ y: item.y, height: item.height, items: [item] });
        }
      }

      // 3. On each line, sort items strictly left-to-right (X ascending)
      for (const line of lines) {
        line.items.sort((a, b) => a.x - b.x);
      }

      // 4. Detect multi-column layout split:
      // Look for significant horizontal gaps (>= 35pt) across lines between x=220 and x=360
      const splitGaps: number[] = [];
      for (const line of lines) {
        for (let idx = 0; idx < line.items.length - 1; idx++) {
          const curr = line.items[idx];
          const next = line.items[idx + 1];
          const gapStart = curr.x + curr.width;
          const gapWidth = next.x - gapStart;
          if (gapWidth >= 35 && gapStart >= 180 && gapStart <= 380) {
            splitGaps.push(gapStart + gapWidth / 2);
          }
        }
      }

      // Build text string with intelligent spacing
      const renderLineItems = (itemsOnLine: SpatialItem[]): string => {
        let text = "";
        for (let i = 0; i < itemsOnLine.length; i++) {
          const curr = itemsOnLine[i];
          if (i === 0) {
            text += curr.str;
          } else {
            const prev = itemsOnLine[i - 1];
            const gap = curr.x - (prev.x + prev.width);
            const noSpace =
              gap < 1.5 ||
              prev.str.endsWith("-") ||
              curr.str.startsWith("-") ||
              prev.str.endsWith("(") ||
              curr.str.startsWith(")") ||
              (prev.str.toLowerCase() === "w" && curr.str.startsWith("/"));

            if (noSpace) {
              text += curr.str;
            } else if (gap >= 35) {
              text += "   |   " + curr.str;
            } else {
              text += (text.endsWith(" ") || curr.str.startsWith(" ") ? "" : " ") + curr.str;
            }
          }
        }
        return text;
      };

      // 5. If a clear column boundary is detected (>= 3 split gaps in the middle region),
      // assemble structured reading-order text:
      // [Header lines] -> [Left column lines] -> [Right column lines (PROJECT DETAILS!)] -> [Footer lines]
      let pageText = "";
      if (splitGaps.length >= 3) {
        splitGaps.sort((a, b) => a - b);
        const splitX = splitGaps[Math.floor(splitGaps.length / 2)];

        const headerLines: string[] = [];
        const leftColumnLines: string[] = [];
        const rightColumnLines: string[] = [];
        const footerLines: string[] = [];

        // Find the Y range where the two columns exist
        const splitLinesY: number[] = [];
        for (const line of lines) {
          const hasSplit = line.items.some((it) => it.x < splitX) && line.items.some((it) => it.x >= splitX);
          if (hasSplit) splitLinesY.push(line.y);
        }
        const maxYWithSplit = splitLinesY.length > 0 ? Math.max(...splitLinesY) + 15 : viewport.height * 0.85;
        const minYWithSplit = splitLinesY.length > 0 ? Math.min(...splitLinesY) - 15 : viewport.height * 0.15;

        for (const line of lines) {
          if (line.y > maxYWithSplit) {
            // Header line above columns
            headerLines.push(renderLineItems(line.items));
          } else if (line.y < minYWithSplit) {
            // Footer line below columns
            footerLines.push(renderLineItems(line.items));
          } else {
            // Split into left and right items
            const leftItems = line.items.filter((it) => it.x < splitX);
            const rightItems = line.items.filter((it) => it.x >= splitX);
            if (leftItems.length > 0) leftColumnLines.push(renderLineItems(leftItems));
            if (rightItems.length > 0) rightColumnLines.push(renderLineItems(rightItems));
          }
        }

        const readingOrderText = [
          ...headerLines,
          ...leftColumnLines,
          "",
          ...rightColumnLines,
          "",
          ...footerLines,
        ].join("\n");

        // Also build a clean linear line-by-line version
        const linearLines = lines.map((l) => renderLineItems(l.items)).join("\n");

        pageText = `${readingOrderText}\n\n${linearLines}`;
      } else {
        pageText = lines.map((l) => renderLineItems(l.items)).join("\n");
      }

      fullExtractedText += (fullExtractedText ? "\n\n" : "") + pageText;
    }

    if (fullExtractedText.trim()) {
      const parsed = parseFieldsFromPdfText(fullExtractedText, file.name, scheduleOption, file);
      // If pdfjs extracted text but projectNumber was missing or locations count defaulted to "1",
      // merge with decompressed stream fallback text to ensure no fields are missed
      if (!parsed.projectNumber || parsed.locationsCount === "1" || !parsed.cityState) {
        const streamFallback = extractTextFromPdfStreamFallback(arrayBuffer);
        if (streamFallback) {
          const mergedText = `${fullExtractedText}\n\n${streamFallback}`;
          return parseFieldsFromPdfText(mergedText, file.name, scheduleOption, file);
        }
      }
      return parsed;
    }
    throw new Error("Empty text extracted by pdfjs");
  } catch (error) {
    console.warn("pdfjs-dist extraction failed or threw, attempting fallback binary parser:", error);
    const fallbackText = extractTextFromPdfStreamFallback(arrayBuffer);
    return parseFieldsFromPdfText(
      fallbackText || "",
      file.name,
      scheduleOption,
      file
    );
  }
}

export interface CombinedApprovalEmail {
  emailSubject: string;
  emailBodyText: string;
  emailBodyHtml: string;
  tmcPdf?: ScannedPdfData;
  atrPdf?: ScannedPdfData;
  atrPdf2?: ScannedPdfData;
  allPdfs?: ScannedPdfData[];
  isTriple?: boolean;
}

/**
 * Generates the combined email when 2 or 3 PDFs are uploaded (TMC and ATRs).
 */
export function generateCombinedApprovalEmail(
  pdfList: ScannedPdfData[],
  scheduleOption: UrgencyScheduleOption = "today_next_week"
): CombinedApprovalEmail | null {
  if (pdfList.length === 0) return null;
  if (pdfList.length === 1) {
    const single = pdfList[0];
    return {
      emailSubject: single.emailSubject,
      emailBodyText: single.emailBodyText,
      emailBodyHtml: single.emailBodyHtml,
      tmcPdf: single.studyType.includes("TMC") ? single : undefined,
      atrPdf: single.studyType.includes("ATR") ? single : undefined,
      allPdfs: pdfList,
      isTriple: false,
    };
  }

  // Handle 3 PDFs (1 TMC + 2 ATRs, or general 3 files)
  if (pdfList.length === 3) {
    let tmcPdf = pdfList.find((p) => p.studyType.includes("TMC"));
    const atrPdfs = pdfList.filter((p) => p !== tmcPdf);

    if (!tmcPdf) {
      tmcPdf = pdfList[0];
    }
    const priorAtr = atrPdfs[0] || pdfList[1];
    const secondAtr = atrPdfs[1] || pdfList[2];

    const rawUrgency = tmcPdf?.urgency || priorAtr?.urgency || secondAtr?.urgency || "Priority Client";
    const urgencyLine = formatUrgencyLine(rawUrgency, scheduleOption);

    const tmcProj = (tmcPdf?.projectNumber || "").trim();
    const tmcLocs = (tmcPdf?.locationsCount || "1").trim();

    const priorAtrProj = (priorAtr?.projectNumber || "").trim();
    const secondAtrProj = (secondAtr?.projectNumber || "").trim();
    const priorAtrLocs = (priorAtr?.locationsCount || "1").trim();
    const secondAtrLocs = (secondAtr?.locationsCount || "1").trim();

    const region = priorAtr?.region || secondAtr?.region || "South Central";
    const addOns1 = (priorAtr?.addOns || "Volume").trim();
    const addOns2 = (secondAtr?.addOns || "Volume").trim();

    const emailSubject = formatTripleCombinedSubject(
      priorAtrProj,
      priorAtr?.addOns,
      secondAtrProj,
      secondAtr?.addOns,
      tmcProj
    );

    const emailBodyText = `Hi James,

Please see TMC camera placement approval.

${urgencyLine}

Project Number: ${tmcProj}
Location/s: ${tmcLocs}

Also, please see ALG conversion attached.

Region: ${region}
Project Number: ${priorAtrProj} & ${secondAtrProj}
Location/s: ${priorAtrLocs} & ${secondAtrLocs}
Study: ALG ${addOns1} / ${addOns2}`;

    const emailBodyHtml = `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi James,</p>
  <p style="margin: 0 0 12px 0;">Please see TMC camera placement approval.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">${urgencyLine}</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>${tmcProj}</strong></p>
  <p style="margin: 0 0 14px 0;"><strong>Location/s:</strong> ${tmcLocs}</p>
  <p style="margin: 0 0 12px 0;">Also, please see ALG conversion attached.</p>
  <p style="margin: 0 0 4px 0;"><strong>Region:</strong> ${region}</p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>${priorAtrProj} &amp; ${secondAtrProj}</strong></p>
  <p style="margin: 0 0 4px 0;"><strong>Location/s:</strong> ${priorAtrLocs} &amp; ${secondAtrLocs}</p>
  <p style="margin: 0 0 0 0;"><strong>Study:</strong> ALG ${addOns1} / ${addOns2}</p>
</div>`.trim();

    return {
      emailSubject,
      emailBodyText,
      emailBodyHtml,
      tmcPdf,
      atrPdf: priorAtr,
      atrPdf2: secondAtr,
      allPdfs: pdfList,
      isTriple: true,
    };
  }

  // Identify TMC PDF and ATR PDF (2 PDFs)
  let tmcPdf = pdfList.find((p) => p.studyType.includes("TMC"));
  let atrPdf = pdfList.find((p) => p.studyType.includes("ATR"));

  if (!tmcPdf && !atrPdf) {
    tmcPdf = pdfList[0];
    atrPdf = pdfList[1];
  } else if (!tmcPdf) {
    tmcPdf = pdfList.find((p) => p !== atrPdf) || pdfList[0];
  } else if (!atrPdf) {
    atrPdf = pdfList.find((p) => p !== tmcPdf) || pdfList[1];
  }

  const rawUrgency = tmcPdf?.urgency || atrPdf?.urgency || "Priority Client";
  // Format urgency line with the chosen schedule option (today, next week, today/next week, or none)
  const urgencyLine = formatUrgencyLine(rawUrgency, scheduleOption);

  const tmcProj = tmcPdf?.projectNumber || "";
  const tmcLocs = tmcPdf?.locationsCount || "1";

  const atrRegion = atrPdf?.region || "South Central";
  const atrProj = atrPdf?.projectNumber || "";
  const atrLocs = atrPdf?.locationsCount || "1";
  const atrStudy = atrPdf?.fullStudyFormatted || (atrPdf?.addOns ? `ALG ${atrPdf.addOns}` : "ALG Volume");

  // Subject format for 2 PDFs (ALG and TMC): <ATR Project Number> ALG <Add ons> and <TMC Project Number> TMC Approval
  const emailSubject = formatCombinedSubject(atrProj, atrPdf?.addOns, tmcProj);

  const emailBodyText = `Hi James,

Please see TMC camera placement approval.

${urgencyLine}

Project Number: ${tmcProj}
Location/s: ${tmcLocs}

Also, Please see ALG conversion attached.

Region: ${atrRegion}
Project Number: ${atrProj}
Location/s: ${atrLocs}
Study: ${atrStudy}`;

  const emailBodyHtml = `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi James,</p>
  <p style="margin: 0 0 12px 0;">Please see TMC camera placement approval.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">${urgencyLine}</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>${tmcProj}</strong></p>
  <p style="margin: 0 0 14px 0;"><strong>Location/s:</strong> ${tmcLocs}</p>
  <p style="margin: 0 0 12px 0;">Also, Please see ALG conversion attached.</p>
  <p style="margin: 0 0 4px 0;"><strong>Region:</strong> ${atrRegion}</p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>${atrProj}</strong></p>
  <p style="margin: 0 0 4px 0;"><strong>Location/s:</strong> ${atrLocs}</p>
  <p style="margin: 0 0 0 0;"><strong>Study:</strong> ${atrStudy}</p>
</div>`.trim();

  return {
    emailSubject,
    emailBodyText,
    emailBodyHtml,
    tmcPdf,
    atrPdf,
    allPdfs: pdfList,
    isTriple: false,
  };
}

/**
 * Pre-built sample PDF datasets matching the uploaded screenshots for testing
 */
export const SAMPLE_PDF_APPROVALS: ScannedPdfData[] = [
  {
    id: "sample-pdf-1",
    fileName: "26-770109_Boulder_CO.pdf",
    rawText: `Colorado
26-770109 | Boulder, CO
DUE DATE: 8/31/2026 03:32
HARD DUE DATE:
URGENCY: Priority Client
FIRM: LSC Transportation Consultants
PHONE: (303)333-1105
CONTACT: Christopher S. McGranahan
EMAIL(TO): csmcgranahan@lsctrans.com
EMAIL (CC): lscdenver@lsctrans.com
PROJECT DETAILS
3 (24hr) ATR (1 day)
w/ Volume
00:00-24:00 | Wed, Thu | 08/26/26 - 08/27/26
All Locations
PROJECT ATTACHMENT(S)
Yes`,
    projectNumber: "26-770109",
    urgency: "Priority Client",
    cityState: "Boulder, CO",
    region: "South Central",
    locationsCount: "3",
    studyType: "ATR",
    studyLineRaw: "3 (24hr) ATR (1 day)",
    addOns: "Volume",
    fullStudyFormatted: "ALG Volume",
    dueDate: "8/31/2026 03:32",
    hardDueDate: "",
    emailSubject: "26-770109 ALG Volume",
    emailBodyText: `Hi Nina/Marisa,

Please see ALG conversion attached.

URGENCY: Priority Client – Need to schedule today/next week.

Region: South Central
Project Number: 26-770109
Location/s: 3
Study: ALG Volume`,
    emailBodyHtml: `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi Nina/Marisa,</p>
  <p style="margin: 0 0 12px 0;">Please see ALG conversion attached.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">URGENCY: Priority Client – Need to schedule today/next week.</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Region:</strong> South Central</p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>26-770109</strong></p>
  <p style="margin: 0 0 4px 0;"><strong>Location/s:</strong> 3</p>
  <p style="margin: 0 0 0 0;"><strong>Study:</strong> ALG Volume</p>
</div>`.trim(),
  },
  {
    id: "sample-pdf-2",
    fileName: "26-770113_Cheyenne_WY.pdf",
    rawText: `26-770113 | Cheyenne, WY
DUE DATE: 9/4/2026 00:03
HARD DUE DATE:
URGENCY: Priority Client
FIRM: Kimley-Horn
PHONE: (970) 880-1176
CONTACT: Erick Berry
EMAIL(TO): Erick.Berry@kimley-horn.com
EMAIL (CC): Curtis.Rowe@kimley-horn.com, JoAnne.Harris@kimley-horn.com
PROJECT DETAILS
4 (4hr) TMC (1 day)
w/ Pedestrians, Bicycles, Motorcycles (FHWA 1), Passenger Vehicles (FHWA 2), Light Trucks (FHWA 3), Buses (FHWA 4), Single Unit Trucks (FHWA 5-7), TTSTs/Combo Unit Trucks (FHWA 8-13)
07:00-09:00, 16:00-18:00 | Tue/Wed/Thu | 09/01/26 - 09/03/26
All Locations`,
    projectNumber: "26-770113",
    urgency: "Priority Client",
    cityState: "Cheyenne, WY",
    region: "South Central",
    locationsCount: "4",
    studyType: "TMC",
    studyLineRaw: "4 (4hr) TMC (1 day)",
    addOns: "Pedestrians, Bicycles, Motorcycles (FHWA 1), Passenger Vehicles (FHWA 2), Light Trucks (FHWA 3), Buses (FHWA 4), Single Unit Trucks (FHWA 5-7), TTSTs/Combo Unit Trucks (FHWA 8-13)",
    fullStudyFormatted: "TMC Pedestrians, Bicycles, Motorcycles (FHWA 1), Passenger Vehicles (FHWA 2), Light Trucks (FHWA 3), Buses (FHWA 4), Single Unit Trucks (FHWA 5-7), TTSTs/Combo Unit Trucks (FHWA 8-13)",
    dueDate: "9/4/2026 00:03",
    hardDueDate: "",
    emailSubject: "26-770113 TMC Approval",
    emailBodyText: `Hi James,

Please see TMC camera placement approval.

URGENCY: Priority Client

Project Number: 26-770113
Location/s: 4`,
    emailBodyHtml: `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi James,</p>
  <p style="margin: 0 0 12px 0;">Please see TMC camera placement approval.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">URGENCY: Priority Client</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>26-770113</strong></p>
  <p style="margin: 0 0 0 0;"><strong>Location/s:</strong> 4</p>
</div>`.trim(),
  },
  {
    id: "sample-pdf-3",
    fileName: "26-770118_Fort_Collins_CO.pdf",
    rawText: `Colorado
26-770118 | Fort Collins, CO
DUE DATE: 9/02/2026 04:00
HARD DUE DATE:
URGENCY: Priority Client
FIRM: Apex Design
PHONE: (303)555-0199
CONTACT: Sarah Jenkins
EMAIL(TO): sjenkins@apexdesign.com
PROJECT DETAILS
2 (48hr) ATR (2 days)
w/ Speed & Classification
00:00-24:00 | Wed, Thu | 08/26/26 - 08/27/26
All Locations
PROJECT ATTACHMENT(S)
Yes`,
    projectNumber: "26-770118",
    urgency: "Priority Client",
    cityState: "Fort Collins, CO",
    region: "South Central",
    locationsCount: "2",
    studyType: "ATR",
    studyLineRaw: "2 (48hr) ATR (2 days)",
    addOns: "Speed & Classification",
    fullStudyFormatted: "ALG Speed & Classification",
    dueDate: "9/02/2026 04:00",
    hardDueDate: "",
    emailSubject: "26-770118 ALG Speed & Classification",
    emailBodyText: `Hi Nina/Marisa,

Please see ALG conversion attached.

URGENCY: Priority Client – Need to schedule today/next week.

Region: South Central
Project Number: 26-770118
Location/s: 2
Study: ALG Speed & Classification`,
    emailBodyHtml: `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi Nina/Marisa,</p>
  <p style="margin: 0 0 12px 0;">Please see ALG conversion attached.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">URGENCY: Priority Client – Need to schedule today/next week.</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Region:</strong> South Central</p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>26-770118</strong></p>
  <p style="margin: 0 0 4px 0;"><strong>Location/s:</strong> 2</p>
  <p style="margin: 0 0 0 0;"><strong>Study:</strong> ALG Speed & Classification</p>
</div>`.trim(),
  },
  {
    id: "sample-pdf-4",
    fileName: "26-770125_Multi_Detail_ATR.pdf",
    rawText: `Colorado
26-770125 | Fort Collins, CO
DUE DATE: 9/18/2026 05:00
HARD DUE DATE:
URGENCY: Priority Client
FIRM: Apex Design
PHONE: (303)555-0199
CONTACT: Sarah Jenkins
EMAIL(TO): sjenkins@apexdesign.com
PROJECT DETAILS
3 (48hr) ATR (2 day)
w/ Volume, Speed
00:00-24:00 | Tue, Wed | 09/15/26 - 09/16/26
Location(s): 1, 2, 3

2 (72hr) ATR (3 day)
w/ Volume, Classification, Speed
00:00-24:00 | Tue/Wed/Thu | 09/15/26 - 09/17/26
Location(s): 4, 5
PROJECT ATTACHMENT(S)
Yes`,
    projectNumber: "26-770125",
    urgency: "Priority Client",
    cityState: "Fort Collins, CO",
    region: "South Central",
    locationsCount: "5",
    studyType: "ATR",
    studyLineRaw: "3 (48hr) ATR (2 day) & 2 (72hr) ATR (3 day)",
    addOns: "Volume, Speed/Volume, Classification, Speed",
    fullStudyFormatted: "ALG Volume, Speed/Volume, Classification, Speed",
    dueDate: "9/18/2026 05:00",
    hardDueDate: "",
    emailSubject: "26-770125 ALG Volume, Speed/Volume, Classification, Speed",
    emailBodyText: `Hi Nina/Marisa,

Please see ALG conversion attached.

URGENCY: Priority Client – Need to schedule today/next week.

Region: South Central
Project Number: 26-770125
Location/s: 5
Study: ALG Volume, Speed/Volume, Classification, Speed`,
    emailBodyHtml: `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi Nina/Marisa,</p>
  <p style="margin: 0 0 12px 0;">Please see ALG conversion attached.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">URGENCY: Priority Client – Need to schedule today/next week.</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Region:</strong> South Central</p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>26-770125</strong></p>
  <p style="margin: 0 0 4px 0;"><strong>Location/s:</strong> 5</p>
  <p style="margin: 0 0 0 0;"><strong>Study:</strong> ALG Volume, Speed/Volume, Classification, Speed</p>
</div>`.trim(),
    detailSections: [
      {
        count: 3,
        studyType: "ATR",
        rawLine: "3 (48hr) ATR (2 day)",
        addOns: "Volume, Speed",
        timeRange: "00:00-24:00 | Tue, Wed | 09/15/26 - 09/16/26",
        locations: "1, 2, 3",
      },
      {
        count: 2,
        studyType: "ATR",
        rawLine: "2 (72hr) ATR (3 day)",
        addOns: "Volume, Classification, Speed",
        timeRange: "00:00-24:00 | Tue/Wed/Thu | 09/15/26 - 09/17/26",
        locations: "4, 5",
      },
    ],
  },
];
