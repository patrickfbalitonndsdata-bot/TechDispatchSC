import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  FileText,
  UploadCloud,
  Check,
  Copy,
  Download,
  Trash2,
  Sparkles,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Edit3,
  Layers,
  Mail,
  Zap,
  MapPin,
  Paperclip,
  Calendar,
  Clock,
  Plus,
  FileSignature,
  Eye,
  X,
} from "lucide-react";
import {
  ScannedPdfData,
  parsePdfFile,
  SAMPLE_PDF_APPROVALS,
  generateCombinedApprovalEmail,
  CombinedApprovalEmail,
  UrgencyScheduleOption,
  formatUrgencyLine,
  formatAtrSubject,
  formatTmcSubject,
  formatCombinedSubject,
  KmzAttachment,
  createMultipartEml,
} from "../utils/pdfParser";
import {
  EMAIL_SIGNATURE_PRESETS,
  renderEmailSignatureHtml,
  renderEmailSignatureText,
} from "../utils/signaturePresets";
import {
  EmailSignaturePresetId,
  EmailSignatureDetails,
  TemplateBranding,
} from "../types";
import { useTheme } from "../context/ThemeContext";
import { EmailSignatureModal } from "./EmailSignatureModal";

interface AlgTmcApprovalPanelProps {
  onScannedDataChange?: (data: ScannedPdfData[]) => void;
  branding?: TemplateBranding;
  onUpdateBranding?: (partial: Partial<TemplateBranding>) => void;
}

export const AlgTmcApprovalPanel: React.FC<AlgTmcApprovalPanelProps> = ({
  onScannedDataChange,
  branding: brandingProp,
  onUpdateBranding,
}) => {
  const { isDarkMode, activeHolidaySeason, holidayConfig } = useTheme();
  const [pdfList, setPdfList] = useState<ScannedPdfData[]>([]);
  // activeTab: "combined" | 0 | 1
  const [activeTab, setActiveTab] = useState<"combined" | number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDraggingPdf, setIsDraggingPdf] = useState<boolean>(false);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isExportingEml, setIsExportingEml] = useState<boolean>(false);

  // 1. Urgency Schedule Option state ("today" | "next_week" | "today_next_week" | "none")
  const [scheduleOption, setScheduleOption] = useState<UrgencyScheduleOption>("today");

  // 2. KMZ Attachments State
  const [kmzList, setKmzList] = useState<KmzAttachment[]>([]);
  const [isDraggingKmz, setIsDraggingKmz] = useState<boolean>(false);

  // 3. Email Signature State & Presets (Patrick, James, Kyle, Katrin)
  const [emailSignatureEnabled, setEmailSignatureEnabled] = useState<boolean>(() => {
    if (brandingProp?.emailSignatureEnabled !== undefined) {
      return Boolean(brandingProp.emailSignatureEnabled);
    }
    const saved = localStorage.getItem("algtmc_email_signature_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [selectedSignaturePreset, setSelectedSignaturePreset] = useState<EmailSignaturePresetId>(() => {
    if (brandingProp?.emailSignaturePreset) {
      return brandingProp.emailSignaturePreset;
    }
    const saved = localStorage.getItem("algtmc_email_signature_preset");
    if (saved && (saved === "patrick" || saved === "james" || saved === "kyle" || saved === "katrin")) {
      return saved as EmailSignaturePresetId;
    }
    return "patrick";
  });

  const [customSignatureFields, setCustomSignatureFields] = useState<Partial<EmailSignatureDetails>>(
    brandingProp?.customEmailSignature || {}
  );
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);

  // Synchronize when brandingProp updates
  useEffect(() => {
    if (brandingProp?.emailSignatureEnabled !== undefined) {
      setEmailSignatureEnabled(Boolean(brandingProp.emailSignatureEnabled));
    }
    if (brandingProp?.emailSignaturePreset) {
      setSelectedSignaturePreset(brandingProp.emailSignaturePreset);
    }
    if (brandingProp?.customEmailSignature) {
      setCustomSignatureFields(brandingProp.customEmailSignature);
    }
  }, [brandingProp]);

  // Compute effective signature
  const effectiveSignature: EmailSignatureDetails = useMemo(() => {
    const base = EMAIL_SIGNATURE_PRESETS[selectedSignaturePreset] || EMAIL_SIGNATURE_PRESETS.patrick;
    if (customSignatureFields && Object.keys(customSignatureFields).length > 0) {
      return {
        ...base,
        ...customSignatureFields,
        id: selectedSignaturePreset,
      };
    }
    return base;
  }, [selectedSignaturePreset, customSignatureFields]);

  // Signature rendered snippets
  const signatureHtml = useMemo(() => {
    return emailSignatureEnabled ? renderEmailSignatureHtml(effectiveSignature) : "";
  }, [emailSignatureEnabled, effectiveSignature]);

  const signatureText = useMemo(() => {
    return emailSignatureEnabled ? "\n\n" + renderEmailSignatureText(effectiveSignature) : "";
  }, [emailSignatureEnabled, effectiveSignature]);

  // Handlers for signature toggle and preset selection
  const handleToggleSignature = (enabled: boolean) => {
    setEmailSignatureEnabled(enabled);
    localStorage.setItem("algtmc_email_signature_enabled", String(enabled));
    if (onUpdateBranding) {
      onUpdateBranding({ emailSignatureEnabled: enabled });
    }
  };

  const handleSelectSignaturePreset = (preset: EmailSignaturePresetId) => {
    setSelectedSignaturePreset(preset);
    localStorage.setItem("algtmc_email_signature_preset", preset);
    if (!emailSignatureEnabled) {
      setEmailSignatureEnabled(true);
      localStorage.setItem("algtmc_email_signature_enabled", "true");
      if (onUpdateBranding) {
        onUpdateBranding({
          emailSignaturePreset: preset,
          emailSignatureEnabled: true,
        });
        return;
      }
    }
    if (onUpdateBranding) {
      onUpdateBranding({ emailSignaturePreset: preset });
    }
  };

  // Construct effective branding object for EmailSignatureModal
  const effectiveBrandingForModal: TemplateBranding = useMemo(() => {
    return (
      brandingProp || {
        companyName: "NDS",
        dispatcherName: "Scheduling Team",
        dispatcherTitle: "Scheduling Specialist",
        companyPhone: "(800) 555-0199",
        accentColor: "#1F4E79",
        headerBgColor: "#3F4A33",
        emailSignatureEnabled,
        emailSignaturePreset: selectedSignaturePreset,
        customEmailSignature: customSignatureFields,
      }
    );
  }, [brandingProp, emailSignatureEnabled, selectedSignaturePreset, customSignatureFields]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const kmzInputRef = useRef<HTMLInputElement>(null);

  // Re-generate combined approval email whenever pdfList, scheduleOption, or signature changes
  const combinedEmail: CombinedApprovalEmail | null = useMemo(() => {
    const base = generateCombinedApprovalEmail(pdfList, scheduleOption);
    if (!base) return null;
    if (emailSignatureEnabled && signatureText && signatureHtml) {
      return {
        ...base,
        emailBodyText: base.emailBodyText + signatureText,
        emailBodyHtml: base.emailBodyHtml + signatureHtml,
      };
    }
    return base;
  }, [pdfList, scheduleOption, emailSignatureEnabled, signatureText, signatureHtml]);

  // Determine active single PDF if not in combined view
  const activeSinglePdf: ScannedPdfData | undefined =
    typeof activeTab === "number" ? pdfList[activeTab] || pdfList[0] : pdfList[0];

  // Helper to re-generate single PDF text & HTML with scheduleOption and optional signature
  const getSinglePdfRender = (pdf: ScannedPdfData) => {
    const isTmc = pdf.studyType.toUpperCase().includes("TMC");
    const urgencyLine = formatUrgencyLine(pdf.urgency, scheduleOption);

    if (isTmc) {
      let text = `Hi James,\n\nPlease see TMC camera placement approval.\n\n${urgencyLine}\n\nProject Number: ${pdf.projectNumber}\nLocation/s: ${pdf.locationsCount}`;
      let html = `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi James,</p>
  <p style="margin: 0 0 12px 0;">Please see TMC camera placement approval.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">${urgencyLine}</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>${pdf.projectNumber}</strong></p>
  <p style="margin: 0 0 0 0;"><strong>Location/s:</strong> ${pdf.locationsCount}</p>
</div>`.trim();

      if (emailSignatureEnabled) {
        text += signatureText;
        html += signatureHtml;
      }
      return { text, html, subject: formatTmcSubject(pdf.projectNumber) };
    } else {
      let text = `Hi Nina/Marisa,\n\nPlease see ALG conversion attached.\n\n${urgencyLine}\n\nRegion: ${pdf.region || "South Central"}\nProject Number: ${pdf.projectNumber}\nLocation/s: ${pdf.locationsCount}\nStudy: ${pdf.fullStudyFormatted}`;
      let html = `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi Nina/Marisa,</p>
  <p style="margin: 0 0 12px 0;">Please see ALG conversion attached.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">${urgencyLine}</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Region:</strong> ${pdf.region || "South Central"}</p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>${pdf.projectNumber}</strong></p>
  <p style="margin: 0 0 4px 0;"><strong>Location/s:</strong> ${pdf.locationsCount}</p>
  <p style="margin: 0 0 0 0;"><strong>Study:</strong> ${pdf.fullStudyFormatted}</p>
</div>`.trim();

      if (emailSignatureEnabled) {
        text += signatureText;
        html += signatureHtml;
      }
      return { text, html, subject: formatAtrSubject(pdf.projectNumber, pdf.addOns) };
    }
  };

  const handlePdfFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );

    // Also check if any KMZ/KML files were dropped in the main dropzone
    const kmzArray = Array.from(files).filter(
      (f) =>
        f.name.toLowerCase().endsWith(".kmz") ||
        f.name.toLowerCase().endsWith(".kml") ||
        f.type.includes("kml") ||
        f.type.includes("kmz")
    );
    if (kmzArray.length > 0) {
      handleKmzFiles(kmzArray);
    }

    if (fileArray.length === 0) return;

    setIsLoading(true);
    try {
      // If 2 or 3 files are dropped/uploaded, process all of them up to 3
      let filesToProcess: File[];
      let shouldReplace = false;

      if (fileArray.length >= 2 || pdfList.length >= 3) {
        filesToProcess = fileArray.slice(0, 3);
        shouldReplace = true;
      } else {
        const remainingSlots = Math.max(1, 3 - pdfList.length);
        filesToProcess = fileArray.slice(0, remainingSlots);
        shouldReplace = false;
      }

      const results: ScannedPdfData[] = [];
      for (const file of filesToProcess) {
        const scanned = await parsePdfFile(file, scheduleOption);
        results.push(scanned);
      }

      setPdfList((prev) => {
        const updated = shouldReplace ? results : [...prev, ...results].slice(0, 3);
        if (onScannedDataChange) onScannedDataChange(updated);
        if (updated.length >= 2) {
          setActiveTab("combined");
        } else {
          setActiveTab(0);
        }
        return updated;
      });
    } catch (err) {
      console.error("Error parsing PDF file:", err);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleKmzFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(
      (f) =>
        f.name.toLowerCase().endsWith(".kmz") ||
        f.name.toLowerCase().endsWith(".kml") ||
        f.type.includes("kml") ||
        f.type.includes("kmz") ||
        f.type.includes("zip") ||
        f.type.includes("octet-stream")
    );

    if (fileArray.length === 0) return;

    const newKmzItems: KmzAttachment[] = fileArray.map((f) => ({
      id: `kmz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fileName: f.name,
      fileSizeFormatted: f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
      file: f,
    }));

    setKmzList((prev) => [...prev, ...newKmzItems]);
  };

  const handleRemoveKmz = (id: string) => {
    setKmzList((prev) => prev.filter((k) => k.id !== id));
  };

  const handleLoadSampleKmz = () => {
    const sampleKmz: KmzAttachment = {
      id: `sample-kmz-${Date.now()}`,
      fileName: `${activeSinglePdf?.projectNumber || "26-770113"}_Camera_Locations.kmz`,
      fileSizeFormatted: "142 KB",
    };
    setKmzList((prev) => [...prev, sampleKmz]);
  };

  const handleRemovePdf = (indexToRemove: number) => {
    setPdfList((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (onScannedDataChange) onScannedDataChange(updated);
      return updated;
    });
    setActiveTab(0);
  };

  const handleClearAllPdfs = () => {
    setPdfList([]);
    setActiveTab(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onScannedDataChange) onScannedDataChange([]);
  };

  const handleLoadSample = (sampleIndex: number) => {
    const sample = SAMPLE_PDF_APPROVALS[sampleIndex];
    if (!sample) return;

    setPdfList((prev) => {
      if (prev.some((p) => p.projectNumber === sample.projectNumber)) {
        return prev;
      }
      const updated = [...prev, { ...sample }].slice(0, 3);
      if (onScannedDataChange) onScannedDataChange(updated);
      return updated;
    });
    setActiveTab(pdfList.length >= 1 ? "combined" : 0);
  };

  const handleLoadBothSamples = () => {
    const cloned = SAMPLE_PDF_APPROVALS.slice(0, 2).map((s) => ({ ...s }));
    setPdfList(cloned);
    setActiveTab("combined");
    if (onScannedDataChange) onScannedDataChange(cloned);
  };

  const handleLoadThreeSamples = () => {
    // 1 TMC (sample 1) and 2 ATRs (sample 0 and sample 2)
    const cloned = [
      { ...SAMPLE_PDF_APPROVALS[1] }, // TMC
      { ...SAMPLE_PDF_APPROVALS[0] }, // ATR 1
      { ...SAMPLE_PDF_APPROVALS[2] }, // ATR 2
    ];
    setPdfList(cloned);
    setActiveTab("combined");
    if (onScannedDataChange) onScannedDataChange(cloned);
  };

  const handleUpdatePdfField = (index: number, field: keyof ScannedPdfData, value: string) => {
    setPdfList((prev) => {
      const updated = [...prev];
      const current = { ...updated[index] };
      (current as any)[field] = value;

      const isTmc = current.studyType.toUpperCase().includes("TMC");
      const isAtr = current.studyType.toUpperCase().includes("ATR");

      if (field === "fullStudyFormatted") {
        current.fullStudyFormatted = value;
        const trimmed = value.trim();
        if (trimmed.toUpperCase().startsWith("ALG ")) {
          current.addOns = trimmed.slice(4).trim();
          current.emailSubject = formatAtrSubject(current.projectNumber, current.addOns);
        } else if (trimmed.toUpperCase().startsWith("TMC ")) {
          current.addOns = trimmed.slice(4).trim();
          current.emailSubject = formatTmcSubject(current.projectNumber);
        }
      } else if (field === "studyType" || field === "addOns" || field === "projectNumber") {
        if (isAtr) {
          current.fullStudyFormatted = current.addOns ? (current.addOns.toUpperCase().startsWith("ALG ") ? current.addOns : `ALG ${current.addOns}`) : "ALG Volume";
          current.emailSubject = formatAtrSubject(current.projectNumber, current.addOns);
        } else if (isTmc) {
          current.fullStudyFormatted = current.addOns ? (current.addOns.toUpperCase().startsWith("TMC ") ? current.addOns : `TMC ${current.addOns}`) : "TMC";
          current.emailSubject = formatTmcSubject(current.projectNumber);
        } else {
          current.fullStudyFormatted = current.addOns ? `ALG ${current.addOns}` : `ALG ${current.studyType}`;
          current.emailSubject = formatAtrSubject(current.projectNumber, current.addOns);
        }
      }

      const urgencyLine = formatUrgencyLine(current.urgency, isTmc && scheduleOption === "today_next_week" ? "none" : scheduleOption);
      if (isTmc) {
        current.emailSubject = formatTmcSubject(current.projectNumber);
        current.emailBodyText = `Hi James,\n\nPlease see TMC camera placement approval.\n\n${urgencyLine}\n\nProject Number: ${current.projectNumber}\nLocation/s: ${current.locationsCount}`;
        current.emailBodyHtml = `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi James,</p>
  <p style="margin: 0 0 12px 0;">Please see TMC camera placement approval.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">${urgencyLine}</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>${current.projectNumber}</strong></p>
  <p style="margin: 0 0 0 0;"><strong>Location/s:</strong> ${current.locationsCount}</p>
</div>`.trim();
      } else {
        current.emailSubject = formatAtrSubject(current.projectNumber, current.addOns);
        current.emailBodyText = `Hi Nina/Marisa,\n\nPlease see ALG conversion attached.\n\n${urgencyLine}\n\nRegion: ${current.region || "South Central"}\nProject Number: ${current.projectNumber}\nLocation/s: ${current.locationsCount}\nStudy: ${current.fullStudyFormatted}`;
        current.emailBodyHtml = `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi Nina/Marisa,</p>
  <p style="margin: 0 0 12px 0;">Please see ALG conversion attached.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">${urgencyLine}</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Region:</strong> ${current.region || "South Central"}</p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>${current.projectNumber}</strong></p>
  <p style="margin: 0 0 4px 0;"><strong>Location/s:</strong> ${current.locationsCount}</p>
  <p style="margin: 0 0 0 0;"><strong>Study:</strong> ${current.fullStudyFormatted}</p>
</div>`.trim();
      }

      updated[index] = current;
      if (onScannedDataChange) onScannedDataChange(updated);
      return updated;
    });
  };

  const handleToggleSectionCount = (pdfIndex: number, secIndex: number) => {
    setPdfList((prev) => {
      const updated = [...prev];
      if (!updated[pdfIndex]) return prev;
      const current = { ...updated[pdfIndex] };
      if (!current.detailSections || !current.detailSections[secIndex]) return prev;

      // Clone detailSections array and toggle the specific section's excludedFromCount
      const newSections = current.detailSections.map((sec, idx) => {
        if (idx === secIndex) {
          return {
            ...sec,
            excludedFromCount: !sec.excludedFromCount,
          };
        }
        return { ...sec };
      });
      current.detailSections = newSections;

      // Recalculate total locations from active (non-excluded) sections
      const active = newSections.filter((s) => !s.excludedFromCount);
      const newLocCount = active.length > 0
        ? String(active.reduce((sum, s) => sum + s.count, 0))
        : "0";
      current.locationsCount = newLocCount;

      const isTmc = current.studyType.toUpperCase().includes("TMC");
      const urgencyLine = formatUrgencyLine(current.urgency, isTmc && scheduleOption === "today_next_week" ? "none" : scheduleOption);
      if (isTmc) {
        current.emailSubject = formatTmcSubject(current.projectNumber);
        current.emailBodyText = `Hi James,\n\nPlease see TMC camera placement approval.\n\n${urgencyLine}\n\nProject Number: ${current.projectNumber}\nLocation/s: ${current.locationsCount}`;
        current.emailBodyHtml = `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi James,</p>
  <p style="margin: 0 0 12px 0;">Please see TMC camera placement approval.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">${urgencyLine}</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>${current.projectNumber}</strong></p>
  <p style="margin: 0 0 0 0;"><strong>Location/s:</strong> ${current.locationsCount}</p>
</div>`.trim();
      } else {
        current.emailSubject = formatAtrSubject(current.projectNumber, current.addOns);
        current.emailBodyText = `Hi Nina/Marisa,\n\nPlease see ALG conversion attached.\n\n${urgencyLine}\n\nRegion: ${current.region || "South Central"}\nProject Number: ${current.projectNumber}\nLocation/s: ${current.locationsCount}\nStudy: ${current.fullStudyFormatted}`;
        current.emailBodyHtml = `
<div style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
  <p style="margin: 0 0 12px 0;">Hi Nina/Marisa,</p>
  <p style="margin: 0 0 12px 0;">Please see ALG conversion attached.</p>
  <p style="margin: 0 0 12px 0;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">${urgencyLine}</span></p>
  <p style="margin: 0 0 4px 0;"><strong>Region:</strong> ${current.region || "South Central"}</p>
  <p style="margin: 0 0 4px 0;"><strong>Project Number:</strong> <strong>${current.projectNumber}</strong></p>
  <p style="margin: 0 0 4px 0;"><strong>Location/s:</strong> ${current.locationsCount}</p>
  <p style="margin: 0 0 0 0;"><strong>Study:</strong> ${current.fullStudyFormatted}</p>
</div>`.trim();
      }

      updated[pdfIndex] = current;
      if (onScannedDataChange) onScannedDataChange(updated);
      return updated;
    });
  };

  const handleCopySubject = async (subjectText: string, tag: string) => {
    try {
      await navigator.clipboard.writeText(subjectText);
      setCopiedStatus(tag);
      setTimeout(() => setCopiedStatus(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyRichEmail = async (text: string, html: string, tag: string) => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const textBlob = new Blob([text], { type: "text/plain" });
        const htmlBlob = new Blob([html], { type: "text/html" });
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": textBlob,
            "text/html": htmlBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopiedStatus(tag);
      setTimeout(() => setCopiedStatus(null), 2500);
    } catch {
      await navigator.clipboard.writeText(text);
      setCopiedStatus(tag);
      setTimeout(() => setCopiedStatus(null), 2500);
    }
  };

  /**
   * Export email bundled with all uploaded PDF files and KMZ files into Outlook .EML!
   */
  const handleDownloadEmlWithAttachments = async (
    subject: string,
    html: string,
    toName: string,
    targetPdfs: ScannedPdfData[]
  ) => {
    setIsExportingEml(true);
    try {
      const pdfAttachments = targetPdfs.map((p) => ({
        name: p.fileName || `${p.projectNumber || "approval"}.pdf`,
        file: p.originalFile,
        base64: p.originalFileBase64,
      }));

      const emlBlob = await createMultipartEml({
        subject,
        to: toName,
        htmlBody: html,
        pdfAttachments,
        kmzAttachments: kmzList,
      });

      const url = URL.createObjectURL(emlBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${subject.replace(/[^a-zA-Z0-9-_]/g, "_")}.eml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate multipart EML:", err);
    } finally {
      setIsExportingEml(false);
    }
  };

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 transition-all border ${
        isDarkMode
          ? "bg-[#08150D]/90 border-[#00FF41]/40 shadow-[0_0_25px_rgba(0,255,65,0.12)] backdrop-blur-md text-[#D2FAD7]"
          : activeHolidaySeason === "halloween"
          ? "bg-white/95 border-2 border-orange-200 shadow-md text-orange-950"
          : activeHolidaySeason === "christmas_eve"
          ? "bg-white/95 border-2 border-amber-200 shadow-md text-blue-950"
          : activeHolidaySeason === "christmas"
          ? "bg-white/95 border-2 border-emerald-200 shadow-md text-stone-900"
          : activeHolidaySeason === "new_year"
          ? "bg-white/95 border-2 border-amber-200 shadow-md text-indigo-950"
          : "bg-white border-2 border-[#CFE0B8] text-[#3F4A33]"
      }`}
    >
      {/* Header & Description */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 ${
          isDarkMode
            ? "border-[#00FF41]/30"
            : activeHolidaySeason === "halloween"
            ? "border-orange-200"
            : activeHolidaySeason === "christmas_eve"
            ? "border-amber-200"
            : activeHolidaySeason === "christmas"
            ? "border-emerald-200"
            : activeHolidaySeason === "new_year"
            ? "border-amber-200"
            : "border-[#CFE0B8]/60"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
              isDarkMode
                ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40 shadow-[0_0_12px_rgba(0,255,65,0.3)]"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-500 text-white shadow-xs"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-amber-500 text-white shadow-xs"
                : activeHolidaySeason === "christmas"
                ? "bg-red-500 text-white shadow-xs"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-[#8AA66B] text-white"
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`text-sm font-bold ${
                  isDarkMode
                    ? "text-[#E0FFE5]"
                    : activeHolidaySeason !== "standard"
                    ? "text-stone-900 font-extrabold"
                    : "text-[#3F4A33]"
                }`}
              >
                ALG / TMC Approval Scanner
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isDarkMode
                    ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30 font-mono"
                    : activeHolidaySeason === "halloween"
                    ? "bg-orange-100 text-orange-900 border-orange-300"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-blue-100 text-blue-900 border-blue-300"
                    : activeHolidaySeason === "christmas"
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                    : activeHolidaySeason === "new_year"
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                }`}
              >
                PDF Page 1 Scanner (Up to 3 Files: 1 TMC + 2 ATR)
              </span>
              <span className="text-[10px] font-bold bg-[#FFFF00] text-black border border-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-black inline-block animate-pulse"></span>
                Yellow Urgency Highlight
              </span>
            </div>
            <p
              className={`text-xs mt-0.5 ${
                isDarkMode
                  ? "text-[#D2FAD7]/80"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-600"
                  : "text-[#3F4A33]/70"
              }`}
            >
              Scans up to 3 PDFs (1 TMC + 2 ATRs), attaches KMZ maps, and packages emails with yellow-highlighted urgency for Outlook.
            </p>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <span
            className={`text-[11px] font-medium mr-1 ${
              isDarkMode
                ? "text-[#D2FAD7]/80"
                : activeHolidaySeason !== "standard"
                ? "text-stone-600"
                : "text-[#3F4A33]/60"
            }`}
          >
            Samples:
          </span>
          <button
            type="button"
            onClick={() => handleLoadSample(1)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer border ${
              isDarkMode
                ? "bg-[#040906] hover:bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono hover:shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : activeHolidaySeason === "halloween"
                ? "bg-white hover:bg-orange-50 text-orange-900 border-orange-200"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white hover:bg-blue-50 text-blue-900 border-blue-200"
                : activeHolidaySeason === "christmas"
                ? "bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200"
                : activeHolidaySeason === "new_year"
                ? "bg-white hover:bg-amber-50 text-amber-900 border-amber-200"
                : "bg-[#FBF7F0] hover:bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
            }`}
            title="Load Cheyenne WY 26-770113 (TMC to James)"
          >
            TMC (James)
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample(0)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer border ${
              isDarkMode
                ? "bg-[#040906] hover:bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono hover:shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : activeHolidaySeason === "halloween"
                ? "bg-white hover:bg-orange-50 text-orange-900 border-orange-200"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white hover:bg-blue-50 text-blue-900 border-blue-200"
                : activeHolidaySeason === "christmas"
                ? "bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200"
                : activeHolidaySeason === "new_year"
                ? "bg-white hover:bg-amber-50 text-amber-900 border-amber-200"
                : "bg-[#FBF7F0] hover:bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
            }`}
            title="Load Boulder CO 26-770109 (ATR/ALG to Nina/Marisa)"
          >
            ATR 1 (Boulder)
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample(2)}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer border ${
              isDarkMode
                ? "bg-[#040906] hover:bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono hover:shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                : activeHolidaySeason === "halloween"
                ? "bg-white hover:bg-orange-50 text-orange-900 border-orange-200"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white hover:bg-blue-50 text-blue-900 border-blue-200"
                : activeHolidaySeason === "christmas"
                ? "bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200"
                : activeHolidaySeason === "new_year"
                ? "bg-white hover:bg-amber-50 text-amber-900 border-amber-200"
                : "bg-[#FBF7F0] hover:bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
            }`}
            title="Load Fort Collins CO 26-770118 (ATR/ALG Speed & Class)"
          >
            ATR 2 (Ft Collins)
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample(3)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs border ${
              isDarkMode
                ? "bg-[#040906] hover:bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-300"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300"
                : activeHolidaySeason === "christmas"
                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300"
                : "bg-[#EDF3E3] hover:bg-[#CFE0B8] text-[#3F4A33] border-[#CFE0B8]"
            }`}
            title="Load Multi-Detail ATR (Part 2 excluded: 3 Locations counted, Part 2 add-ons joined)"
          >
            <Layers
              className={`w-3 h-3 ${
                isDarkMode
                  ? "text-[#00FF41]"
                  : activeHolidaySeason === "halloween"
                  ? "text-orange-600"
                  : activeHolidaySeason === "christmas_eve"
                  ? "text-blue-600"
                  : activeHolidaySeason === "christmas"
                  ? "text-emerald-600"
                  : activeHolidaySeason === "new_year"
                  ? "text-amber-600"
                  : "text-[#8AA66B]"
              }`}
            />
            <span>Multi-Detail ATR (3 Locs, Part 2 Excluded)</span>
          </button>
          <button
            type="button"
            onClick={handleLoadThreeSamples}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs ${
              isDarkMode
                ? "bg-[#00FF41] text-[#040906] hover:bg-[#39FF14] font-extrabold shadow-[0_0_12px_#00FF41]"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30"
                : activeHolidaySeason === "christmas"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30"
                : "bg-[#3F4A33] hover:bg-[#2e3725] text-white"
            }`}
            title="Load 3 PDFs: 1 TMC + 2 ATRs for triple approval template"
          >
            <Sparkles className={`w-3 h-3 ${isDarkMode ? "text-[#040906]" : "text-white"}`} />
            <span>Load 3 (1 TMC + 2 ATR)</span>
          </button>
          <button
            type="button"
            onClick={handleLoadBothSamples}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs border ${
              isDarkMode
                ? "bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41] hover:text-[#040906]"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-100 hover:bg-orange-200 text-orange-900 border-orange-300"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-blue-100 hover:bg-blue-200 text-blue-900 border-blue-300"
                : activeHolidaySeason === "christmas"
                ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                : "bg-[#8AA66B] hover:bg-[#7a965c] text-white border-transparent"
            }`}
            title="Load 2 PDFs: TMC + ATR"
          >
            <span>Load 2</span>
          </button>
        </div>
      </div>

      {/* 1. URGENCY SCHEDULE OPTION BUTTONS */}
      <div
        className={`rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
          isDarkMode
            ? "bg-[#040906]/90 border-[#00FF41]/30 shadow-[0_0_15px_rgba(0,255,65,0.06)]"
            : activeHolidaySeason === "halloween"
            ? "bg-white/95 border-2 border-orange-500/30 text-stone-900 shadow-md shadow-orange-950/5"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-white/95 border-2 border-blue-500/30 text-stone-900 shadow-md shadow-blue-950/5"
            : activeHolidaySeason === "christmas"
            ? "bg-white/95 border-2 border-emerald-500/30 text-stone-900 shadow-md shadow-emerald-950/5"
            : activeHolidaySeason === "new_year"
            ? "bg-white/95 border-2 border-amber-500/30 text-stone-900 shadow-md shadow-amber-950/5"
            : "bg-[#EDF3E3] border-[#CFE0B8]"
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
              isDarkMode
                ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-100 text-orange-600 border border-orange-300"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-blue-100 text-blue-600 border border-blue-300"
                : activeHolidaySeason === "christmas"
                ? "bg-emerald-100 text-emerald-600 border border-emerald-300"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-100 text-amber-600 border border-amber-300"
                : "bg-[#8AA66B] text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div
              className={`text-xs font-bold flex items-center gap-1.5 ${
                isDarkMode
                  ? "text-[#E0FFE5]"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-900"
                  : "text-[#3F4A33]"
              }`}
            >
              <span>Urgency Schedule Option</span>
              <span className="text-[10px] font-mono bg-yellow-300 text-yellow-950 px-1.5 py-0.2 rounded font-bold">
                Outlook Highlight
              </span>
            </div>
            <p
              className={`text-[11px] ${
                isDarkMode
                  ? "text-[#D2FAD7]/80"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-600"
                  : "text-[#3F4A33]/70"
              }`}
            >
              Select timing suffix to append to the highlighted URGENCY line:
            </p>
          </div>
        </div>

        {/* Interactive Option Pill Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setScheduleOption("today")}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              scheduleOption === "today"
                ? "bg-[#FFFF00] text-black border-yellow-400 shadow-xs"
                : isDarkMode
                ? "bg-[#08150D] text-[#D2FAD7] border-[#00FF41]/35 hover:border-[#00FF41] hover:text-[#00FF41]"
                : activeHolidaySeason === "halloween"
                ? "bg-white text-stone-800 border-orange-200 hover:bg-orange-50"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white text-stone-800 border-blue-200 hover:bg-blue-50"
                : activeHolidaySeason === "christmas"
                ? "bg-white text-stone-800 border-emerald-200 hover:bg-emerald-50"
                : activeHolidaySeason === "new_year"
                ? "bg-white text-stone-800 border-amber-200 hover:bg-amber-50"
                : "bg-white text-[#3F4A33] border-[#CFE0B8] hover:bg-[#FBF7F0]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Today</span>
          </button>

          <button
            type="button"
            onClick={() => setScheduleOption("next_week")}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              scheduleOption === "next_week"
                ? "bg-[#FFFF00] text-black border-yellow-400 shadow-xs"
                : isDarkMode
                ? "bg-[#08150D] text-[#D2FAD7] border-[#00FF41]/35 hover:border-[#00FF41] hover:text-[#00FF41]"
                : activeHolidaySeason === "halloween"
                ? "bg-white text-stone-800 border-orange-200 hover:bg-orange-50"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white text-stone-800 border-blue-200 hover:bg-blue-50"
                : activeHolidaySeason === "christmas"
                ? "bg-white text-stone-800 border-emerald-200 hover:bg-emerald-50"
                : activeHolidaySeason === "new_year"
                ? "bg-white text-stone-800 border-amber-200 hover:bg-amber-50"
                : "bg-white text-[#3F4A33] border-[#CFE0B8] hover:bg-[#FBF7F0]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Next Week</span>
          </button>

          <button
            type="button"
            onClick={() => setScheduleOption("today_next_week")}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              scheduleOption === "today_next_week"
                ? "bg-[#FFFF00] text-black border-yellow-400 shadow-xs"
                : isDarkMode
                ? "bg-[#08150D] text-[#D2FAD7] border-[#00FF41]/35 hover:border-[#00FF41] hover:text-[#00FF41]"
                : activeHolidaySeason === "halloween"
                ? "bg-white text-stone-800 border-orange-200 hover:bg-orange-50"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white text-stone-800 border-blue-200 hover:bg-blue-50"
                : activeHolidaySeason === "christmas"
                ? "bg-white text-stone-800 border-emerald-200 hover:bg-emerald-50"
                : activeHolidaySeason === "new_year"
                ? "bg-white text-stone-800 border-amber-200 hover:bg-amber-50"
                : "bg-white text-[#3F4A33] border-[#CFE0B8] hover:bg-[#FBF7F0]"
            }`}
          >
            <span>Today / Next Week</span>
          </button>

          <button
            type="button"
            onClick={() => setScheduleOption("none")}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
              scheduleOption === "none"
                ? "bg-[#FFFF00] text-black border-yellow-400 shadow-xs"
                : isDarkMode
                ? "bg-[#08150D] text-[#D2FAD7] border-[#00FF41]/35 hover:border-[#00FF41] hover:text-[#00FF41]"
                : activeHolidaySeason === "halloween"
                ? "bg-white text-stone-800 border-orange-200 hover:bg-orange-50"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white text-stone-800 border-blue-200 hover:bg-blue-50"
                : activeHolidaySeason === "christmas"
                ? "bg-white text-stone-800 border-emerald-200 hover:bg-emerald-50"
                : activeHolidaySeason === "new_year"
                ? "bg-white text-stone-800 border-amber-200 hover:bg-amber-50"
                : "bg-white text-[#3F4A33] border-[#CFE0B8] hover:bg-[#FBF7F0]"
            }`}
            title="Just show URGENCY: <Urgency> with no suffix"
          >
            <span>Urgency Only</span>
          </button>
        </div>
      </div>

      {/* 2. EMAIL SIGNATURE TOGGLE & 4 SIGNATURES (Patrick, James, Kyle, Katrin) */}
      <div
        className={`rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
          isDarkMode
            ? "bg-[#040906]/90 border-[#00FF41]/30 shadow-[0_0_15px_rgba(0,255,65,0.06)]"
            : activeHolidaySeason === "halloween"
            ? "bg-white/95 border-2 border-orange-500/30 text-stone-900 shadow-md shadow-orange-950/5"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-white/95 border-2 border-blue-500/30 text-stone-900 shadow-md shadow-blue-950/5"
            : activeHolidaySeason === "christmas"
            ? "bg-white/95 border-2 border-emerald-500/30 text-stone-900 shadow-md shadow-emerald-950/5"
            : activeHolidaySeason === "new_year"
            ? "bg-white/95 border-2 border-amber-500/30 text-stone-900 shadow-md shadow-amber-950/5"
            : "bg-[#EDF3E3] border-[#CFE0B8]"
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs transition-colors ${
              emailSignatureEnabled
                ? "bg-yellow-400 text-black font-bold"
                : isDarkMode
                ? "bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/40"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-100 text-orange-600 border border-orange-300"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-blue-100 text-blue-600 border border-blue-300"
                : activeHolidaySeason === "christmas"
                ? "bg-emerald-100 text-emerald-600 border border-emerald-300"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-100 text-amber-600 border border-amber-300"
                : "bg-[#8AA66B] text-white"
            }`}
          >
            <FileSignature className="w-4 h-4" />
          </div>
          <div>
            <div
              className={`text-xs font-bold flex items-center gap-1.5 ${
                isDarkMode
                  ? "text-[#E0FFE5]"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-900"
                  : "text-[#3F4A33]"
              }`}
            >
              <span>Email Signature Toggle</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold transition ${
                  emailSignatureEnabled
                    ? "bg-[#FFFF00] text-black border border-yellow-400 shadow-2xs"
                    : isDarkMode
                    ? "bg-[#08150D] text-[#D2FAD7]/80 border border-[#00FF41]/30"
                    : "bg-zinc-200 text-zinc-600"
                }`}
              >
                {emailSignatureEnabled ? `ON • ${effectiveSignature.label}` : "OFF"}
              </span>
            </div>
            <p
              className={`text-[11px] ${
                isDarkMode
                  ? "text-[#D2FAD7]/80"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-600"
                  : "text-[#3F4A33]/70"
              }`}
            >
              Appends official NDS signature to approval emails &amp; Outlook .EML exports.
            </p>
          </div>
        </div>

        {/* Email Signature Toggle & 4 Presets inside it */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Toggle Button */}
          <button
            type="button"
            onClick={() => handleToggleSignature(!emailSignatureEnabled)}
            className={`group flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer shadow-2xs ${
              emailSignatureEnabled
                ? "bg-[#FFFF00] text-black border-yellow-400 ring-2 ring-yellow-400/50 shadow-xs"
                : isDarkMode
                ? "bg-[#08150D] text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/15 hover:border-[#00FF41] hover:shadow-[0_0_10px_rgba(0,255,65,0.25)]"
                : activeHolidaySeason === "halloween"
                ? "bg-white text-orange-900 border-orange-300 hover:bg-orange-50"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white text-blue-900 border-blue-300 hover:bg-blue-50"
                : activeHolidaySeason === "christmas"
                ? "bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-50"
                : activeHolidaySeason === "new_year"
                ? "bg-white text-amber-900 border-amber-300 hover:bg-amber-50"
                : "bg-white text-[#3F4A33] border-[#CFE0B8] hover:bg-[#FBF7F0]"
            }`}
            title="When toggled ON: Appends signature to email body and .EML export"
          >
            <FileSignature className={`w-3.5 h-3.5 ${emailSignatureEnabled ? "text-black" : isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`} />
            <span>Email Signature</span>
            <span
              className={`w-2 h-2 rounded-full transition ${
                emailSignatureEnabled
                  ? "bg-black animate-pulse"
                  : isDarkMode
                  ? "bg-[#00FF41]/40"
                  : "bg-zinc-300"
              }`}
            />
          </button>

          {/* 4 Signatures inside it: Patrick, James, Kyle, Katrin */}
          <div
            className={`flex items-center p-0.5 rounded-lg border shadow-2xs ${
              isDarkMode
                ? "bg-[#08150D] border-[#00FF41]/40"
                : activeHolidaySeason === "halloween"
                ? "bg-white border-orange-200"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-white border-blue-200"
                : activeHolidaySeason === "christmas"
                ? "bg-white border-emerald-200"
                : activeHolidaySeason === "new_year"
                ? "bg-white border-amber-200"
                : "bg-white border-[#CFE0B8]"
            }`}
          >
            {(["patrick", "james", "kyle", "katrin"] as const).map((presetKey) => {
              const isSelected = selectedSignaturePreset === presetKey;
              const presetInfo = EMAIL_SIGNATURE_PRESETS[presetKey];
              return (
                <button
                  key={presetKey}
                  type="button"
                  onClick={() => handleSelectSignaturePreset(presetKey)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    isSelected && emailSignatureEnabled
                      ? "bg-[#FFFF00] text-black border border-yellow-400 shadow-2xs"
                      : isSelected
                      ? isDarkMode
                        ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/50"
                        : activeHolidaySeason === "halloween"
                        ? "bg-orange-100 text-orange-950 border border-orange-300"
                        : activeHolidaySeason === "christmas_eve"
                        ? "bg-blue-100 text-blue-950 border border-blue-300"
                        : activeHolidaySeason === "christmas"
                        ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                        : activeHolidaySeason === "new_year"
                        ? "bg-amber-100 text-amber-950 border border-amber-300"
                        : "bg-[#EDF3E3] text-[#3F4A33] border border-[#CFE0B8]"
                      : isDarkMode
                      ? "text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/10"
                      : activeHolidaySeason !== "standard"
                      ? "text-stone-700 hover:text-stone-900 hover:bg-stone-100/60"
                      : "text-[#3F4A33]/75 hover:text-[#3F4A33] hover:bg-[#FBF7F0]"
                  }`}
                  title={`Select ${presetInfo.label} (${presetInfo.name} – ${presetInfo.title})`}
                >
                  {presetInfo.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowSignatureModal(true)}
              className={`px-1.5 py-1 rounded-md transition cursor-pointer ${
                isDarkMode
                  ? "text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/15"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-700 hover:text-stone-900 hover:bg-stone-100"
                  : "text-[#3F4A33]/70 hover:text-[#3F4A33] hover:bg-[#EDF3E3]"
              }`}
              title="Open Email Signature Settings & Full Preview"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Upload Dropzone */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files) handlePdfFiles(e.target.files);
        }}
        accept=".pdf,application/pdf,.kmz,.kml,application/vnd.google-earth.kmz"
        multiple
        className="hidden"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingPdf(true);
        }}
        onDragLeave={() => setIsDraggingPdf(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingPdf(false);
          if (e.dataTransfer.files) handlePdfFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDraggingPdf
            ? isDarkMode
              ? "border-[#00FF41] bg-[#00FF41]/15 shadow-[0_0_20px_rgba(0,255,65,0.3)]"
              : activeHolidaySeason === "halloween"
              ? "border-orange-500 bg-orange-100/70 shadow-lg ring-4 ring-orange-500/30"
              : activeHolidaySeason === "christmas_eve"
              ? "border-blue-500 bg-blue-100/70 shadow-lg ring-4 ring-blue-500/30"
              : activeHolidaySeason === "christmas"
              ? "border-red-500 bg-emerald-100/70 shadow-lg ring-4 ring-red-500/30"
              : activeHolidaySeason === "new_year"
              ? "border-amber-500 bg-amber-100/70 shadow-lg ring-4 ring-amber-500/30"
              : "border-[#8AA66B] bg-[#EDF3E3]"
            : pdfList.length > 0
            ? isDarkMode
              ? "border-[#00FF41]/40 bg-[#040906]/80 hover:bg-[#00FF41]/10 shadow-[0_0_15px_rgba(0,255,65,0.06)]"
              : activeHolidaySeason === "halloween"
              ? "border-orange-300 bg-orange-50/60 hover:bg-orange-50/90"
              : activeHolidaySeason === "christmas_eve"
              ? "border-blue-300 bg-blue-50/60 hover:bg-blue-50/90"
              : activeHolidaySeason === "christmas"
              ? "border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50/90"
              : activeHolidaySeason === "new_year"
              ? "border-amber-300 bg-amber-50/60 hover:bg-amber-50/90"
              : "border-[#CFE0B8] bg-[#FBF7F0]/80 hover:bg-[#FBF7F0]"
            : isDarkMode
            ? "border-[#00FF41]/35 hover:border-[#00FF41] bg-[#040906]/60 hover:bg-[#00FF41]/10 shadow-[0_0_15px_rgba(0,255,65,0.06)]"
            : activeHolidaySeason === "halloween"
            ? "border-orange-300 hover:border-orange-500 bg-white hover:bg-orange-50/40"
            : activeHolidaySeason === "christmas_eve"
            ? "border-blue-300 hover:border-blue-500 bg-white hover:bg-blue-50/40"
            : activeHolidaySeason === "christmas"
            ? "border-emerald-300 hover:border-red-500 bg-white hover:bg-emerald-50/40"
            : activeHolidaySeason === "new_year"
            ? "border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50/40"
            : "border-[#CFE0B8] hover:border-[#8AA66B] bg-white hover:bg-[#FBF7F0]"
        }`}
      >
        <div className="flex items-center space-x-3.5 text-left">
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
              isDarkMode
                ? "bg-[#00FF41]/15 border-[#00FF41]/40 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-100 border-orange-300 text-orange-600"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-blue-100 border-blue-300 text-blue-600"
                : activeHolidaySeason === "christmas"
                ? "bg-emerald-100 border-emerald-300 text-emerald-600"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-100 border-amber-300 text-amber-600"
                : "bg-[#EDF3E3] border-[#CFE0B8]"
            }`}
          >
            {isLoading ? (
              <RefreshCw
                className={`w-4 h-4 animate-spin ${
                  isDarkMode
                    ? "text-[#00FF41]"
                    : activeHolidaySeason === "halloween"
                    ? "text-orange-600"
                    : activeHolidaySeason === "christmas_eve"
                    ? "text-blue-600"
                    : activeHolidaySeason === "christmas"
                    ? "text-emerald-600"
                    : activeHolidaySeason === "new_year"
                    ? "text-amber-600"
                    : "text-[#8AA66B]"
                }`}
              />
            ) : (
              <UploadCloud
                className={`w-4 h-4 ${
                  isDarkMode
                    ? "text-[#00FF41]"
                    : activeHolidaySeason === "halloween"
                    ? "text-orange-600"
                    : activeHolidaySeason === "christmas_eve"
                    ? "text-blue-600"
                    : activeHolidaySeason === "christmas"
                    ? "text-emerald-600"
                    : activeHolidaySeason === "new_year"
                    ? "text-amber-600"
                    : "text-[#8AA66B]"
                }`}
              />
            )}
          </div>
          <div>
            <div
              className={`text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                isDarkMode
                  ? "text-[#E0FFE5]"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-900 font-bold"
                  : "text-[#3F4A33]"
              }`}
            >
              <span>
                {pdfList.length > 0
                  ? `${pdfList.length} of 3 PDF(s) Loaded${kmzList.length > 0 ? ` + ${kmzList.length} KMZ Map(s)` : ""}`
                  : "Drop up to 3 files here (PDF, KMZ) or click to browse"}
              </span>
              {pdfList.length > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                    isDarkMode
                      ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono"
                      : activeHolidaySeason === "halloween"
                      ? "bg-orange-100 text-orange-900 border-orange-300"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-blue-100 text-blue-900 border-blue-300"
                      : activeHolidaySeason === "christmas"
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                      : activeHolidaySeason === "new_year"
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                  }`}
                >
                  <Check
                    className={`w-3 h-3 ${
                      isDarkMode
                        ? "text-[#00FF41]"
                        : activeHolidaySeason === "halloween"
                        ? "text-orange-600"
                        : activeHolidaySeason === "christmas_eve"
                        ? "text-blue-600"
                        : activeHolidaySeason === "christmas"
                        ? "text-emerald-600"
                        : activeHolidaySeason === "new_year"
                        ? "text-amber-600"
                        : "text-[#8AA66B]"
                    }`}
                  />{" "}
                  Page 1 Extracted
                </span>
              )}
            </div>
            <p
              className={`text-[11px] sm:text-xs mt-0.5 ${
                isDarkMode
                  ? "text-[#D2FAD7]/80"
                  : activeHolidaySeason !== "standard"
                  ? "text-stone-600"
                  : "text-[#3F4A33]/70"
              }`}
            >
              {pdfList.length > 0
                ? pdfList.map((p) => `${p.projectNumber || p.fileName} [${p.studyType}]`).join(" + ")
                : "PDF and KMZ file supported for added attachment support. Scans 1 TMC + 2 ATR PDFs."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {pdfList.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearAllPdfs();
              }}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer border ${
                isDarkMode
                  ? "bg-red-950/40 hover:bg-red-900/60 text-rose-300 border-red-800/60"
                  : "bg-white hover:bg-red-50 text-stone-700 hover:text-red-700 border-[#CFE0B8] hover:border-red-200"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 ${
              isDarkMode
                ? "bg-[#00FF41] text-[#040906] hover:bg-[#39FF14] font-extrabold shadow-[0_0_15px_#00FF41]"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30"
                : activeHolidaySeason === "christmas"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30"
                : "bg-[#8AA66B] hover:bg-[#7a965c] text-white"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>
              {pdfList.length >= 3
                ? "Replace Files"
                : pdfList.length === 2
                ? "+ Add 3rd PDF"
                : pdfList.length === 1
                ? "+ Add 2nd PDF"
                : "Select PDF/KMZ File(s)"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Scanned Content & Email Template Preview */}
      {pdfList.length > 0 && (
        <div className="space-y-4 pt-1">
          {/* Navigation Bar: Combined Tab + Individual PDF Tabs */}
          <div
            className={`flex items-center justify-between flex-wrap gap-2 border-b pb-2 ${
              isDarkMode
                ? "border-[#00FF41]/30"
                : activeHolidaySeason === "halloween"
                ? "border-orange-200"
                : activeHolidaySeason === "christmas_eve"
                ? "border-blue-200"
                : activeHolidaySeason === "christmas"
                ? "border-emerald-200"
                : activeHolidaySeason === "new_year"
                ? "border-amber-200"
                : "border-[#CFE0B8]"
            }`}
          >
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
              {pdfList.length >= 2 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("combined")}
                  className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer border ${
                    activeTab === "combined"
                      ? isDarkMode
                        ? "bg-[#00FF41] text-[#040906] border-[#00FF41] font-extrabold shadow-[0_0_15px_#00FF41]"
                        : activeHolidaySeason === "halloween"
                        ? "bg-orange-600 text-white border-transparent shadow-xs ring-2 ring-orange-500/40"
                        : activeHolidaySeason === "christmas_eve"
                        ? "bg-blue-600 text-white border-transparent shadow-xs ring-2 ring-blue-500/40"
                        : activeHolidaySeason === "christmas"
                        ? "bg-red-600 text-white border-transparent shadow-xs ring-2 ring-red-500/40"
                        : activeHolidaySeason === "new_year"
                        ? "bg-amber-600 text-white border-transparent shadow-xs ring-2 ring-amber-500/40"
                        : "bg-[#3F4A33] text-white border-transparent shadow-xs ring-2 ring-[#8AA66B]/30"
                      : isDarkMode
                      ? "bg-[#040906] hover:bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono"
                      : activeHolidaySeason === "halloween"
                      ? "bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-200"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200"
                      : activeHolidaySeason === "christmas"
                      ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200"
                      : activeHolidaySeason === "new_year"
                      ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                      : "bg-[#EDF3E3] hover:bg-[#CFE0B8] text-[#3F4A33] border-[#CFE0B8]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {pdfList.length === 3
                      ? "✨ Combined Approval (1 TMC + 2 ATR)"
                      : "✨ Combined Approval (TMC + ATR)"}
                  </span>
                </button>
              )}

              {pdfList.map((pdf, idx) => {
                const isTmc = pdf.studyType.includes("TMC");
                return (
                  <button
                    key={pdf.id}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      activeTab === idx
                        ? isDarkMode
                          ? "bg-[#00FF41] text-[#040906] border-[#00FF41] font-extrabold shadow-[0_0_15px_#00FF41]"
                          : activeHolidaySeason === "halloween"
                          ? "bg-orange-600 text-white border-transparent shadow-xs"
                          : activeHolidaySeason === "christmas_eve"
                          ? "bg-blue-600 text-white border-transparent shadow-xs"
                          : activeHolidaySeason === "christmas"
                          ? "bg-red-600 text-white border-transparent shadow-xs"
                          : activeHolidaySeason === "new_year"
                          ? "bg-amber-600 text-white border-transparent shadow-xs"
                          : "bg-[#8AA66B] text-white border-transparent shadow-xs"
                        : isDarkMode
                        ? "bg-[#040906] hover:bg-[#00FF41]/15 text-[#D2FAD7] border-[#00FF41]/35 hover:border-[#00FF41] hover:text-[#00FF41]"
                        : activeHolidaySeason === "halloween"
                        ? "bg-white hover:bg-orange-50 text-orange-900 border-orange-200"
                        : activeHolidaySeason === "christmas_eve"
                        ? "bg-white hover:bg-blue-50 text-blue-900 border-blue-200"
                        : activeHolidaySeason === "christmas"
                        ? "bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200"
                        : activeHolidaySeason === "new_year"
                        ? "bg-white hover:bg-amber-50 text-amber-900 border-amber-200"
                        : "bg-[#FBF7F0] hover:bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>
                      PDF {idx + 1} ({isTmc ? "TMC" : "ATR"}): {pdf.projectNumber || pdf.fileName}
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePdf(idx);
                      }}
                      className="hover:text-red-400 ml-1 cursor-pointer font-normal text-sm"
                      title="Remove this PDF"
                    >
                      ×
                    </span>
                  </button>
                );
              })}

              {pdfList.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`text-xs font-medium py-1.5 px-2.5 rounded-lg transition cursor-pointer flex items-center gap-1 border ${
                    isDarkMode
                      ? "bg-[#040906] hover:bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.15)]"
                      : activeHolidaySeason === "halloween"
                      ? "text-orange-900 hover:text-orange-950 bg-orange-100 hover:bg-orange-200 border-orange-300"
                      : activeHolidaySeason === "christmas_eve"
                      ? "text-blue-900 hover:text-blue-950 bg-blue-100 hover:bg-blue-200 border-blue-300"
                      : activeHolidaySeason === "christmas"
                      ? "text-emerald-900 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border-emerald-300"
                      : activeHolidaySeason === "new_year"
                      ? "text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 border-amber-300"
                      : "text-[#3F4A33] hover:text-[#3F4A33] bg-[#EDF3E3] border-[#CFE0B8] hover:bg-[#CFE0B8]"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add {pdfList.length === 1 ? "2nd" : "3rd"} PDF</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                  isEditing
                    ? isDarkMode
                      ? "bg-[#00FF41] text-[#040906] border-[#00FF41] font-extrabold shadow-[0_0_12px_#00FF41]"
                      : activeHolidaySeason === "halloween"
                      ? "bg-orange-100 text-orange-900 border-orange-400 shadow-xs font-bold"
                      : activeHolidaySeason === "christmas_eve"
                      ? "bg-blue-100 text-blue-900 border-blue-400 shadow-xs font-bold"
                      : activeHolidaySeason === "christmas"
                      ? "bg-emerald-100 text-emerald-900 border-emerald-400 shadow-xs font-bold"
                      : activeHolidaySeason === "new_year"
                      ? "bg-amber-100 text-amber-900 border-amber-400 shadow-xs font-bold"
                      : "bg-[#EDF3E3] text-[#3F4A33] border-[#8AA66B] shadow-xs font-bold"
                    : isDarkMode
                    ? "bg-[#040906] text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/15 font-mono"
                    : activeHolidaySeason === "halloween"
                    ? "bg-white text-orange-900 border-orange-200 hover:bg-orange-50"
                    : activeHolidaySeason === "christmas_eve"
                    ? "bg-white text-blue-900 border-blue-200 hover:bg-blue-50"
                    : activeHolidaySeason === "christmas"
                    ? "bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50"
                    : activeHolidaySeason === "new_year"
                    ? "bg-white text-amber-900 border-amber-200 hover:bg-amber-50"
                    : "bg-white text-[#3F4A33] border-[#CFE0B8] hover:bg-[#EDF3E3]"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? "Close Editor" : "Edit Scanned Values"}</span>
              </button>
            </div>
          </div>

          {/* Editable Field Inspector */}
          {isEditing && (
            <div
              className={`rounded-xl p-3.5 sm:p-4 text-xs space-y-4 border ${
                isDarkMode
                  ? "bg-[#040906]/95 border-[#00FF41]/35 shadow-[0_0_20px_rgba(0,255,65,0.08)]"
                  : "bg-[#EDF3E3] border-[#CFE0B8]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`font-bold flex items-center gap-1.5 ${isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"}`}>
                  <Edit3 className={`w-4 h-4 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                  <span>Edit Scanned Values (Live Updates Output)</span>
                </div>
                <span className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/80" : "text-[#3F4A33]/70"}`}>
                  Changes immediately apply to email templates
                </span>
              </div>

              {pdfList.map((pdf, idx) => (
                <div
                  key={pdf.id}
                  className={`rounded-lg p-3 space-y-2.5 border ${
                    isDarkMode
                      ? "bg-[#08150D] border-[#00FF41]/30"
                      : "bg-white border-[#CFE0B8]"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between border-b pb-1.5 ${
                      isDarkMode ? "border-[#00FF41]/20" : "border-[#CFE0B8]/60"
                    }`}
                  >
                    <span className={`font-bold text-xs ${isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"}`}>
                      PDF #{idx + 1}: {pdf.fileName} ({pdf.studyType})
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                        isDarkMode
                          ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/30"
                          : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                      }`}
                    >
                      {pdf.studyType.includes("TMC") ? "Target: James (TMC Approval)" : "Target: Nina/Marisa (ALG Conversion)"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div>
                      <label className={`block text-[10px] font-bold mb-0.5 ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                        Project Number
                      </label>
                      <input
                        type="text"
                        value={pdf.projectNumber}
                        onChange={(e) => handleUpdatePdfField(idx, "projectNumber", e.target.value)}
                        placeholder="e.g. 26-770113"
                        className={`w-full rounded px-2 py-1 text-xs font-mono font-bold border focus:outline-hidden ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/40 text-[#00FF41] focus:ring-1 focus:ring-[#00FF41]"
                            : "bg-white border-[#CFE0B8] focus:border-[#8AA66B] text-[#3F4A33]"
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold mb-0.5 ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                        Urgency
                      </label>
                      <input
                        type="text"
                        value={pdf.urgency}
                        onChange={(e) => handleUpdatePdfField(idx, "urgency", e.target.value)}
                        placeholder="e.g. Priority Client"
                        className={`w-full rounded px-2 py-1 text-xs font-semibold border focus:outline-hidden ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/40 text-[#00FF41] focus:ring-1 focus:ring-[#00FF41]"
                            : "bg-white border-[#CFE0B8] focus:border-[#8AA66B] text-[#3F4A33]"
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold mb-0.5 flex items-center justify-between ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                        <span>Location/s Count</span>
                        {pdf.detailSections && pdf.detailSections.length > 1 && (
                          <span className={`text-[9px] font-semibold ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`}>
                            Counted: {pdf.detailSections.filter((s) => !s.excludedFromCount).map((s) => s.count).join(" + ") || "0"} = {pdf.locationsCount}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={pdf.locationsCount}
                        onChange={(e) => handleUpdatePdfField(idx, "locationsCount", e.target.value)}
                        placeholder="e.g. 3"
                        className={`w-full rounded px-2 py-1 text-xs font-semibold border focus:outline-hidden ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/40 text-[#00FF41] focus:ring-1 focus:ring-[#00FF41]"
                            : "bg-white border-[#CFE0B8] focus:border-[#8AA66B] text-[#3F4A33]"
                        }`}
                      />
                      {pdf.detailSections && pdf.detailSections.length > 1 && (
                        <div className="mt-1.5 space-y-1">
                          <span className="text-[9px] font-semibold opacity-75 block">Include / Exclude Parts in Location Count:</span>
                          {pdf.detailSections.map((sec, sIdx) => (
                            <label
                              key={sIdx}
                              className={`flex items-center justify-between px-2 py-1 rounded border text-[10px] cursor-pointer transition-colors ${
                                sec.excludedFromCount
                                  ? isDarkMode
                                    ? "bg-red-950/20 border-red-500/40 text-red-300"
                                    : "bg-red-50 border-red-200 text-red-800"
                                  : isDarkMode
                                    ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
                                    : "bg-white border-[#CFE0B8] text-[#3F4A33]"
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={!sec.excludedFromCount}
                                  onChange={() => handleToggleSectionCount(idx, sIdx)}
                                  className="rounded text-emerald-600 focus:ring-0"
                                />
                                <span className="font-bold">Part {sIdx + 1}:</span>
                                <span className={sec.excludedFromCount ? "line-through opacity-60" : "font-mono"}>
                                  {sec.count} loc ({sec.rawLine})
                                </span>
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                sec.excludedFromCount
                                  ? "bg-red-500/20 text-red-600 dark:text-red-400"
                                  : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              }`}>
                                {sec.excludedFromCount ? "Not Counted" : "Counted"}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold mb-0.5 ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                        Study Type
                      </label>
                      <select
                        value={pdf.studyType}
                        onChange={(e) => handleUpdatePdfField(idx, "studyType", e.target.value)}
                        className={`w-full rounded px-2 py-1 text-xs font-semibold border focus:outline-hidden ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/40 text-[#00FF41] focus:ring-1 focus:ring-[#00FF41]"
                            : "bg-white border-[#CFE0B8] focus:border-[#8AA66B] text-[#3F4A33]"
                        }`}
                      >
                        <option value="TMC" className={isDarkMode ? "bg-[#040906] text-[#00FF41]" : ""}>TMC (Camera Placement)</option>
                        <option value="ATR" className={isDarkMode ? "bg-[#040906] text-[#00FF41]" : ""}>ATR (ALG Conversion)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className={`block text-[10px] font-bold mb-0.5 ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                        Region (for ATR/ALG)
                      </label>
                      <input
                        type="text"
                        value={pdf.region}
                        onChange={(e) => handleUpdatePdfField(idx, "region", e.target.value)}
                        placeholder="South Central"
                        className={`w-full rounded px-2 py-1 text-xs font-semibold border focus:outline-hidden ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/40 text-[#00FF41] focus:ring-1 focus:ring-[#00FF41]"
                            : "bg-white border-[#CFE0B8] focus:border-[#8AA66B] text-[#3F4A33]"
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={`block text-[10px] font-bold mb-0.5 ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                        Add-ons (after w/)
                      </label>
                      <input
                        type="text"
                        value={pdf.addOns}
                        onChange={(e) => handleUpdatePdfField(idx, "addOns", e.target.value)}
                        placeholder="e.g. Volume or Pedestrians, Bicycles..."
                        className={`w-full rounded px-2 py-1 text-xs font-semibold border focus:outline-hidden ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/40 text-[#00FF41] focus:ring-1 focus:ring-[#00FF41]"
                            : "bg-white border-[#CFE0B8] focus:border-[#8AA66B] text-[#3F4A33]"
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={`block text-[10px] font-bold mb-0.5 flex items-center justify-between ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                        <span>Study Input (Formatted)</span>
                        <span className={`text-[10px] font-normal ${isDarkMode ? "text-[#D2FAD7]/80" : "text-[#3F4A33]/60"}`}>
                          e.g. ALG Volume, Speed/Volume, Classification, Speed
                        </span>
                      </label>
                      <input
                        type="text"
                        value={pdf.fullStudyFormatted}
                        onChange={(e) => handleUpdatePdfField(idx, "fullStudyFormatted", e.target.value)}
                        placeholder="e.g. ALG Volume, Speed/Volume, Classification, Speed"
                        className={`w-full rounded px-2 py-1 text-xs font-semibold border focus:outline-hidden ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/40 text-[#00FF41] focus:ring-1 focus:ring-[#00FF41]"
                            : "bg-white border-[#CFE0B8] focus:border-[#8AA66B] text-[#3F4A33]"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW MODE 1: COMBINED APPROVAL EMAIL (when activeTab === "combined" and 2 or 3 PDFs loaded) */}
          {activeTab === "combined" && combinedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left 5 Cols: Multi PDF Summary & KMZ Attachment Box */}
                <div className="lg:col-span-5 space-y-3">
                  {/* Scanned Breakdown */}
                  <div
                    className={`rounded-xl p-3.5 sm:p-4 text-xs space-y-3 border transition-colors ${
                      isDarkMode
                        ? "bg-[#06120A] border-[#00FF41]/30 text-[#D2FAD7]"
                        : "bg-[#FBF7F0] border-[#CFE0B8] text-[#3F4A33]"
                    }`}
                  >
                    <div
                      className={`font-bold flex items-center justify-between border-b pb-2 ${
                        isDarkMode
                          ? "text-[#00FF41] border-[#00FF41]/20"
                          : "text-[#3F4A33] border-[#CFE0B8]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Layers className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                        {combinedEmail.isTriple ? "Triple PDF Approval Flow" : "Dual PDF Approval Flow"}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          isDarkMode
                            ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                            : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                        }`}
                      >
                        {pdfList.length} Files Active
                      </span>
                    </div>

                    {/* TMC Section Details */}
                    {combinedEmail.tmcPdf && (
                      <div
                        className={`rounded-lg p-2.5 space-y-1.5 shadow-2xs border ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
                            : "bg-white border-[#CFE0B8] text-[#3F4A33]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold uppercase ${
                              isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"
                            }`}
                          >
                            Part 1: TMC Approval (Top)
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              isDarkMode
                                ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                                : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                            }`}
                          >
                            TMC
                          </span>
                        </div>
                        <div className={`text-[11px] space-y-0.5 ${isDarkMode ? "text-[#D2FAD7]/90" : "text-[#3F4A33]/90"}`}>
                          <p>
                            <strong>Project:</strong>{" "}
                            <span className={`font-mono font-bold ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>
                              {combinedEmail.tmcPdf.projectNumber}
                            </span>
                          </p>
                          <p><strong>Location/s:</strong> {combinedEmail.tmcPdf.locationsCount}</p>
                          <p><strong>Urgency:</strong> {combinedEmail.tmcPdf.urgency}</p>
                        </div>
                      </div>
                    )}

                    {/* ATR Section Details (Prior ATR PDF) */}
                    {combinedEmail.atrPdf && (
                      <div
                        className={`rounded-lg p-2.5 space-y-1.5 shadow-2xs border ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
                            : "bg-white border-[#CFE0B8] text-[#3F4A33]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold uppercase ${
                              isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"
                            }`}
                          >
                            {combinedEmail.isTriple ? "Part 2: Prior ATR PDF (ALG Conversion)" : "Part 2: ALG Conversion (Bottom)"}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              isDarkMode
                                ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                                : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                            }`}
                          >
                            ATR 1
                          </span>
                        </div>
                        <div className={`text-[11px] space-y-0.5 ${isDarkMode ? "text-[#D2FAD7]/90" : "text-[#3F4A33]/90"}`}>
                          <p><strong>Region:</strong> {combinedEmail.atrPdf.region || "South Central"}</p>
                          <p>
                            <strong>Project:</strong>{" "}
                            <span className={`font-mono font-bold ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>
                              {combinedEmail.atrPdf.projectNumber}
                            </span>
                          </p>
                          <p><strong>Location/s:</strong> {combinedEmail.atrPdf.locationsCount}</p>
                          <p><strong>Add-ons:</strong> {combinedEmail.atrPdf.addOns || "Volume"}</p>
                        </div>
                      </div>
                    )}

                    {/* Second ATR Section Details (if 3 PDFs) */}
                    {combinedEmail.atrPdf2 && (
                      <div
                        className={`rounded-lg p-2.5 space-y-1.5 shadow-2xs border ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
                            : "bg-white border-[#CFE0B8] text-[#3F4A33]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold uppercase ${
                              isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"
                            }`}
                          >
                            Part 3: Second ATR PDF (ALG Conversion)
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              isDarkMode
                                ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                                : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                            }`}
                          >
                            ATR 2
                          </span>
                        </div>
                        <div className={`text-[11px] space-y-0.5 ${isDarkMode ? "text-[#D2FAD7]/90" : "text-[#3F4A33]/90"}`}>
                          <p>
                            <strong>Project:</strong>{" "}
                            <span className={`font-mono font-bold ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>
                              {combinedEmail.atrPdf2.projectNumber}
                            </span>
                          </p>
                          <p><strong>Location/s:</strong> {combinedEmail.atrPdf2.locationsCount}</p>
                          <p><strong>Add-ons:</strong> {combinedEmail.atrPdf2.addOns || "Volume"}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. ATTACHMENT PLACEHOLDER FOR KMZ & PDF FILES (Below Scanned Details) */}
                  <div
                    className={`rounded-xl p-3.5 sm:p-4 space-y-3 border-2 border-dashed transition-colors ${
                      isDarkMode
                        ? "bg-[#06120A] border-[#00FF41]/40 text-[#D2FAD7]"
                        : "bg-white border-[#8AA66B]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center ${
                            isDarkMode ? "bg-[#00FF41] text-black font-bold" : "bg-[#8AA66B] text-white"
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>
                            Attachment Placeholder
                          </span>
                          <span className={`text-[10px] ${isDarkMode ? "text-[#D2FAD7]/70" : "text-[#3F4A33]/70"}`}>
                            PDF &amp; KMZ files supported
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleLoadSampleKmz}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition border ${
                          isDarkMode
                            ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/25"
                            : "bg-[#EDF3E3] text-[#3F4A33] hover:bg-[#CFE0B8] border-[#CFE0B8]"
                        }`}
                      >
                        + Sample KMZ
                      </button>
                    </div>

                    <input
                      type="file"
                      ref={kmzInputRef}
                      onChange={(e) => {
                        if (e.target.files) handleKmzFiles(e.target.files);
                      }}
                      accept=".kmz,.kml,application/vnd.google-earth.kmz,application/vnd.google-earth.kml+xml,.pdf,application/pdf"
                      multiple
                      className="hidden"
                    />

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingKmz(true);
                      }}
                      onDragLeave={() => setIsDraggingKmz(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingKmz(false);
                        if (e.dataTransfer.files) handleKmzFiles(e.dataTransfer.files);
                      }}
                      onClick={() => kmzInputRef.current?.click()}
                      className={`border border-dashed rounded-lg p-2.5 text-center cursor-pointer transition flex items-center justify-center space-x-2 ${
                        isDraggingKmz
                          ? isDarkMode
                            ? "border-[#00FF41] bg-[#00FF41]/20 text-[#00FF41]"
                            : "border-[#8AA66B] bg-[#EDF3E3]"
                          : isDarkMode
                            ? "border-[#00FF41]/40 bg-[#040906] text-[#D2FAD7] hover:bg-[#00FF41]/10"
                            : "border-[#CFE0B8] bg-[#EDF3E3]/40 hover:bg-[#EDF3E3] text-[#3F4A33]"
                      }`}
                    >
                      <Paperclip className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                      <span className="text-xs font-medium">
                        Drop KMZ map or PDF file here or click to browse
                      </span>
                    </div>

                    {/* Attached KMZ File Badges */}
                    {kmzList.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider block ${
                            isDarkMode ? "text-[#00FF41]/80" : "text-[#3F4A33]/60"
                          }`}
                        >
                          Attached Map File(s):
                        </span>
                        {kmzList.map((kmz) => (
                          <div
                            key={kmz.id}
                            className={`border rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs ${
                              isDarkMode
                                ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
                                : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <MapPin className={`w-3.5 h-3.5 shrink-0 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                              <span className="font-semibold truncate">{kmz.fileName}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-mono border ${
                                  isDarkMode
                                    ? "bg-[#08150D] text-[#00FF41] border-[#00FF41]/40"
                                    : "bg-white text-[#3F4A33] border-[#CFE0B8]"
                                }`}
                              >
                                {kmz.fileSizeFormatted}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveKmz(kmz.id)}
                              className={`p-1 cursor-pointer transition ${
                                isDarkMode ? "text-zinc-500 hover:text-red-400" : "text-zinc-400 hover:text-red-600"
                              }`}
                              title="Remove KMZ"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right 7 Cols: Combined Outlook Email Card */}
                <div
                  className={`lg:col-span-7 rounded-xl shadow-xs overflow-hidden border-2 transition-colors ${
                    isDarkMode
                      ? "bg-[#08150D] border-[#00FF41]/40 shadow-[0_0_20px_rgba(0,255,65,0.08)]"
                      : "bg-white border-[#CFE0B8]"
                  }`}
                >
                  {/* Top Bar */}
                  <div
                    className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b ${
                      isDarkMode
                        ? "bg-[#040906] text-[#00FF41] border-[#00FF41]/30"
                        : "bg-[#3F4A33] text-white border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                          isDarkMode
                            ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                            : "bg-[#8AA66B] text-white"
                        }`}
                      >
                        <Mail className="w-3 h-3" /> Combined Outlook Approval
                      </span>
                      <span
                        className={`text-xs font-semibold hidden sm:inline ${
                          isDarkMode ? "text-[#D2FAD7]/80" : "text-white/80"
                        }`}
                      >
                        To: James
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyRichEmail(
                            combinedEmail.emailBodyText,
                            combinedEmail.emailBodyHtml,
                            "combined"
                          )
                        }
                        className={`text-xs font-bold px-3 py-1 rounded-md transition shadow-2xs flex items-center gap-1 cursor-pointer border ${
                          isDarkMode
                            ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/30"
                            : "bg-white text-[#3F4A33] hover:bg-[#EDF3E3] border-transparent"
                        }`}
                      >
                        {copiedStatus === "combined" ? (
                          <>
                            <Check className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-600"}`} />
                            <span>Copied to Outlook!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Combined Email</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isExportingEml}
                        onClick={() =>
                          handleDownloadEmlWithAttachments(
                            combinedEmail.emailSubject,
                            combinedEmail.emailBodyHtml,
                            "James <james@ndsdata.com>",
                            pdfList
                          )
                        }
                        className={`text-xs font-bold px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer border ${
                          isDarkMode
                            ? "bg-[#00FF41] text-black font-extrabold border-[#00FF41] hover:bg-[#00FF41]/90 shadow-[0_0_10px_rgba(0,255,65,0.4)]"
                            : "bg-[#8AA66B] hover:bg-[#7a965c] text-white border-[#8AA66B]"
                        }`}
                        title="Download .eml file with PDFs & KMZ attached ready to send in Outlook"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isExportingEml ? "Packaging..." : ".EML (with Attachments)"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Attached Files Banner */}
                  <div
                    className={`border-b px-4 py-2 flex items-center justify-between text-xs ${
                      isDarkMode
                        ? "bg-[#06120A] border-[#00FF41]/30 text-[#D2FAD7]"
                        : "bg-[#FBF7F0] border-[#CFE0B8] text-[#3F4A33]"
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <Paperclip className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} /> Attachments ({pdfList.length + kmzList.length}):
                      </span>
                      {pdfList.map((p) => (
                        <span
                          key={p.id}
                          className={`border px-2 py-0.5 rounded text-[11px] font-mono ${
                            isDarkMode
                              ? "bg-[#040906] text-[#00FF41] border-[#00FF41]/40"
                              : "bg-white text-[#3F4A33] border-[#CFE0B8]"
                          }`}
                        >
                          📄 {p.fileName || `${p.projectNumber}.pdf`}
                        </span>
                      ))}
                      {kmzList.map((k) => (
                        <span
                          key={k.id}
                          className={`border px-2 py-0.5 rounded text-[11px] font-mono ${
                            isDarkMode
                              ? "bg-[#040906] text-[#00FF41] border-[#00FF41]/40"
                              : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                          }`}
                        >
                          🌍 {k.fileName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Live Visual Email Preview */}
                  <div
                    className={`p-4 sm:p-5 font-sans text-sm select-text space-y-3.5 ${
                      isDarkMode ? "bg-[#050C07] text-[#D2FAD7]" : "bg-white text-zinc-900"
                    }`}
                  >
                    <div
                      className={`text-xs border-b pb-2 space-y-1 ${
                        isDarkMode ? "border-[#00FF41]/20 text-[#D2FAD7]/70" : "border-zinc-100 text-zinc-500"
                      }`}
                    >
                      <div>
                        <strong className={isDarkMode ? "text-[#00FF41]" : "text-zinc-700"}>To:</strong> James
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <strong className={isDarkMode ? "text-[#00FF41]" : "text-zinc-700"}>Subject:</strong>{" "}
                          <span className={`font-semibold ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-900"}`}>
                            {combinedEmail.emailSubject}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopySubject(combinedEmail.emailSubject, "subj-combined")}
                          className={`text-[11px] border px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer shrink-0 transition ${
                            isDarkMode
                              ? "text-[#00FF41] bg-[#00FF41]/10 border-[#00FF41]/40 hover:bg-[#00FF41]/25"
                              : "text-[#3F4A33] bg-[#EDF3E3] hover:bg-[#CFE0B8] border-[#CFE0B8]"
                          }`}
                          title="Copy Subject only"
                        >
                          {copiedStatus === "subj-combined" ? (
                            <>
                              <Check className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-600"}`} />
                              <span className={`font-bold ${isDarkMode ? "text-[#00FF41]" : "text-emerald-700"}`}>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Subject</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Email Body with Live Yellow Highlight for Urgency */}
                    <div
                      className={`rounded-lg p-4 font-sans text-sm leading-relaxed border space-y-3 ${
                        isDarkMode
                          ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7] shadow-[0_0_15px_rgba(0,255,65,0.06)]"
                          : "bg-white border-zinc-200 text-zinc-900 shadow-2xs"
                      }`}
                    >
                      <p>Hi James,</p>
                      <p>Please see TMC camera placement approval.</p>

                      {/* Urgency Line Highlighted in Yellow */}
                      <p>
                        <span className="bg-yellow-300 text-black font-bold px-1.5 py-0.5 rounded-xs inline-block shadow-2xs">
                          {formatUrgencyLine(
                            combinedEmail.tmcPdf?.urgency || "Priority Client",
                            scheduleOption
                          )}
                        </span>
                      </p>

                      {combinedEmail.isTriple ? (
                        /* 3-PDF Email Template */
                        <>
                          <div className="space-y-0.5">
                            <p><strong>Project Number:</strong> <strong className={`font-bold font-mono ${isDarkMode ? "text-[#00FF41]" : ""}`}>{combinedEmail.tmcPdf?.projectNumber}</strong></p>
                            <p><strong>Location/s:</strong> {combinedEmail.tmcPdf?.locationsCount}</p>
                          </div>

                          <p className="pt-2">Also, please see ALG conversion attached.</p>

                          <div className="space-y-0.5">
                            <p><strong>Region:</strong> {combinedEmail.atrPdf?.region || "South Central"}</p>
                            <p><strong>Project Number:</strong> <strong className={`font-bold font-mono ${isDarkMode ? "text-[#00FF41]" : ""}`}>{combinedEmail.atrPdf?.projectNumber} &amp; {combinedEmail.atrPdf2?.projectNumber}</strong></p>
                            <p><strong>Location/s:</strong> {combinedEmail.atrPdf?.locationsCount} &amp; {combinedEmail.atrPdf2?.locationsCount}</p>
                            <p><strong>Study:</strong> ALG {combinedEmail.atrPdf?.addOns || "Volume"} / {combinedEmail.atrPdf2?.addOns || "Volume"}</p>
                          </div>
                        </>
                      ) : (
                        /* 2-PDF Email Template */
                        <>
                          <div className="space-y-0.5">
                            <p><strong>Project Number:</strong> <strong className={`font-bold font-mono ${isDarkMode ? "text-[#00FF41]" : ""}`}>{combinedEmail.tmcPdf?.projectNumber}</strong></p>
                            <p><strong>Location/s:</strong> {combinedEmail.tmcPdf?.locationsCount}</p>
                          </div>

                          <p className="pt-2">Also, Please see ALG conversion attached.</p>

                          <div className="space-y-0.5">
                            <p><strong>Region:</strong> {combinedEmail.atrPdf?.region || "South Central"}</p>
                            <p><strong>Project Number:</strong> <strong className={`font-bold font-mono ${isDarkMode ? "text-[#00FF41]" : ""}`}>{combinedEmail.atrPdf?.projectNumber}</strong></p>
                            <p><strong>Location/s:</strong> {combinedEmail.atrPdf?.locationsCount}</p>
                            <p><strong>Study:</strong> {combinedEmail.atrPdf?.fullStudyFormatted || (combinedEmail.atrPdf?.addOns ? `ALG ${combinedEmail.atrPdf.addOns}` : "ALG Volume")}</p>
                          </div>
                        </>
                      )}

                      {/* Live Email Signature Preview */}
                      {emailSignatureEnabled && (
                        <div
                          className={`pt-3 border-t mt-4 text-xs font-sans space-y-1 text-left select-text ${
                            isDarkMode ? "border-[#00FF41]/20 text-[#D2FAD7]" : "border-zinc-200 text-zinc-600"
                          }`}
                        >
                          <p className={isDarkMode ? "text-[#D2FAD7] mb-2" : "text-zinc-800 mb-2"}>{effectiveSignature.greeting}</p>
                          <p className={`font-bold italic text-sm ${isDarkMode ? "text-[#00FF41]" : "text-zinc-900"}`}>{effectiveSignature.name}</p>
                          <p className={`font-bold italic ${isDarkMode ? "text-[#00FF41]/80" : "text-[#1F4E79]"}`}>{effectiveSignature.title}</p>
                          <p className={`font-bold ${isDarkMode ? "text-[#00FF41]" : "text-[#1F4E79]"}`}>{effectiveSignature.company}</p>
                          <p className={`font-bold text-[11px] ${isDarkMode ? "text-[#D2FAD7]/60" : "text-zinc-500"}`}>{effectiveSignature.officeLabel || "Corporate Office:"}</p>
                          <p className={isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-600"}>{effectiveSignature.address}</p>
                          {effectiveSignature.website && (
                            <p>
                              <a
                                href={`https://${effectiveSignature.website.replace(/^https?:\/\//, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className={`underline ${isDarkMode ? "text-[#00FF41] hover:text-[#00FF41]/80" : "text-zinc-600"}`}
                              >
                                {effectiveSignature.website}
                              </a>
                            </p>
                          )}
                          <p className={`font-bold text-sm pt-2 ${isDarkMode ? "text-[#00FF41]" : "text-[#1F4E79]"}`}>{effectiveSignature.tagline}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: INDIVIDUAL SINGLE PDF APPROVAL (when activeTab is a number e.g. 0 or 1) */}
          {typeof activeTab === "number" && activeSinglePdf && (
            (() => {
              const singleRender = getSinglePdfRender(activeSinglePdf);
              const isTmc = activeSinglePdf.studyType.includes("TMC");

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Left 5 Cols: Scanned Breakdown Card & KMZ Attachment Box */}
                  <div className="lg:col-span-5 space-y-3">
                    <div
                      className={`rounded-xl p-3.5 sm:p-4 text-xs space-y-3 border transition-colors ${
                        isDarkMode
                          ? "bg-[#06120A] border-[#00FF41]/30 text-[#D2FAD7]"
                          : "bg-[#FBF7F0] border-[#CFE0B8] text-[#3F4A33]"
                      }`}
                    >
                      <div
                        className={`font-bold flex items-center justify-between border-b pb-2 ${
                          isDarkMode ? "text-[#00FF41] border-[#00FF41]/20" : "text-[#3F4A33] border-[#CFE0B8]"
                        }`}
                      >
                        <span>Scanned Page 1 Details</span>
                        <span
                          className={`text-[10px] border px-1.5 py-0.5 rounded font-mono font-bold ${
                            isDarkMode
                              ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40"
                              : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                          }`}
                        >
                          {activeSinglePdf.studyType}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span
                            className={`text-[10px] uppercase font-bold block ${
                              isDarkMode ? "text-[#00FF41]/80" : "text-[#3F4A33]/60"
                            }`}
                          >
                            Project Number (Upper Left)
                          </span>
                          <span
                            className={`text-sm font-bold font-mono ${
                              isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"
                            }`}
                          >
                            {activeSinglePdf.projectNumber || "Not found"}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`text-[10px] uppercase font-bold block ${
                              isDarkMode ? "text-[#00FF41]/80" : "text-[#3F4A33]/60"
                            }`}
                          >
                            Urgency (Upper Right)
                          </span>
                          <span className="bg-yellow-300 text-black font-bold px-2 py-0.5 rounded-xs inline-block mt-0.5 shadow-2xs">
                            {formatUrgencyLine(activeSinglePdf.urgency, scheduleOption)}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`text-[10px] uppercase font-bold block ${
                              isDarkMode ? "text-[#00FF41]/80" : "text-[#3F4A33]/60"
                            }`}
                          >
                            Location/s (Project Details)
                          </span>
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            <span
                              className={`font-bold border px-2 py-0.5 rounded inline-block ${
                                isDarkMode
                                  ? "bg-[#040906] text-[#00FF41] border-[#00FF41]/40"
                                  : "bg-white text-[#3F4A33] border-[#CFE0B8]"
                              }`}
                            >
                              {activeSinglePdf.locationsCount} Location{activeSinglePdf.locationsCount === "1" ? "" : "s"}
                            </span>
                            {activeSinglePdf.detailSections && activeSinglePdf.detailSections.length > 1 && (
                              <span
                                className={`text-[10px] font-bold border px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  isDarkMode
                                    ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40"
                                    : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                                }`}
                              >
                                <Layers className={`w-2.5 h-2.5 ${isDarkMode ? "text-[#00FF41]" : ""}`} />
                                {(() => {
                                  const active = activeSinglePdf.detailSections.filter((s) => !s.excludedFromCount);
                                  const excluded = activeSinglePdf.detailSections.filter((s) => s.excludedFromCount);
                                  if (excluded.length > 0) {
                                    return `Counted: ${active.map((s) => s.count).join(" + ") || "0"} = ${activeSinglePdf.locationsCount} (${excluded.length} part excluded)`;
                                  }
                                  return `Sum of ${activeSinglePdf.detailSections.length} sections (${activeSinglePdf.detailSections.map((s) => s.count).join(" + ")} = ${activeSinglePdf.locationsCount})`;
                                })()}
                              </span>
                            )}
                          </div>
                        </div>

                        {activeSinglePdf.detailSections && activeSinglePdf.detailSections.length > 1 && (
                          <div
                            className={`border rounded-md p-2 text-[11px] space-y-1.5 ${
                              isDarkMode
                                ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
                                : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
                            }`}
                          >
                            <div
                              className={`flex items-center justify-between font-bold ${
                                isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"
                              }`}
                            >
                              <span className="flex items-center gap-1">
                                <Layers className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                                <span>{activeSinglePdf.detailSections.length} Project Detail Sections</span>
                              </span>
                              <div className="flex items-center gap-1.5">
                                {activeSinglePdf.detailSections.some((s) => s.excludedFromCount) && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                                    {activeSinglePdf.detailSections.filter((s) => s.excludedFromCount).length} Part Excluded
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] border px-1.5 py-0.5 rounded font-mono font-bold ${
                                    isDarkMode
                                      ? "bg-[#08150D] text-[#00FF41] border-[#00FF41]/40"
                                      : "bg-white text-[#3F4A33] border-[#CFE0B8]"
                                  }`}
                                >
                                  Total: {activeSinglePdf.locationsCount}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              {activeSinglePdf.detailSections.map((sec, secIdx) => {
                                const currentPdfIdx = typeof activeTab === "number" ? activeTab : 0;
                                return (
                                  <div
                                    key={secIdx}
                                    className={`border rounded px-2 py-1.5 flex items-center justify-between gap-2 text-[11px] transition-colors ${
                                      sec.excludedFromCount
                                        ? isDarkMode
                                          ? "bg-red-950/20 border-red-500/40 text-red-300"
                                          : "bg-red-50/80 border-red-200 text-red-900"
                                        : isDarkMode
                                          ? "bg-[#06120A] border-[#00FF41]/30 text-[#D2FAD7]"
                                          : "bg-white border-[#CFE0B8] text-[#3F4A33]"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`font-bold ${
                                        sec.excludedFromCount
                                          ? "text-red-600 dark:text-red-400"
                                          : isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"
                                      }`}>
                                        Part {secIdx + 1}:
                                      </span>
                                      <span className={`font-mono font-semibold ${sec.excludedFromCount ? "line-through opacity-60 text-red-400 dark:text-red-300" : ""}`}>
                                        {sec.count} loc ({sec.rawLine})
                                      </span>
                                      {sec.excludedFromCount ? (
                                        <span className="bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                          Not Counted (0 loc)
                                        </span>
                                      ) : (
                                        <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                          Counted ({sec.count} loc)
                                        </span>
                                      )}
                                      <span
                                        className={`text-[10px] font-semibold hidden md:inline ${
                                          sec.excludedFromCount
                                            ? "opacity-60"
                                            : isDarkMode ? "text-[#00FF41]/80" : "text-[#8AA66B]"
                                        }`}
                                      >
                                        w/ {sec.addOns || "Volume"}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSectionCount(currentPdfIdx, secIdx)}
                                      title={sec.excludedFromCount ? "Include this part in total location count" : "Do not count this part for location count"}
                                      className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer flex items-center gap-1 ${
                                        sec.excludedFromCount
                                          ? isDarkMode
                                            ? "bg-[#00FF41]/20 hover:bg-[#00FF41]/30 text-[#00FF41] border-[#00FF41]/50"
                                            : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300"
                                          : isDarkMode
                                            ? "bg-red-950/60 hover:bg-red-900/80 text-red-300 border-red-500/50"
                                            : "bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                                      }`}
                                    >
                                      {sec.excludedFromCount ? (
                                        <>
                                          <Check className="w-2.5 h-2.5" />
                                          <span>Count Part</span>
                                        </>
                                      ) : (
                                        <>
                                          <X className="w-2.5 h-2.5" />
                                          <span>Do Not Count</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div>
                          <span
                            className={`text-[10px] uppercase font-bold block ${
                              isDarkMode ? "text-[#00FF41]/80" : "text-[#3F4A33]/60"
                            }`}
                          >
                            Study Line
                          </span>
                          <p
                            className={`font-medium border p-1.5 rounded mt-0.5 text-[11px] ${
                              isDarkMode
                                ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
                                : "bg-white border-[#CFE0B8] text-[#3F4A33]"
                            }`}
                          >
                            {activeSinglePdf.studyLineRaw || `${activeSinglePdf.locationsCount} ${activeSinglePdf.studyType}`}
                          </p>
                        </div>

                        <div>
                          <span
                            className={`text-[10px] uppercase font-bold block ${
                              isDarkMode ? "text-[#00FF41]/80" : "text-[#3F4A33]/60"
                            }`}
                          >
                            Add-ons (Next to Study)
                          </span>
                          <p
                            className={`font-medium border p-1.5 rounded mt-0.5 text-[11px] ${
                              isDarkMode
                                ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
                                : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
                            }`}
                          >
                            {activeSinglePdf.addOns || "None detected"}
                          </p>
                        </div>

                        <div>
                          <span
                            className={`text-[10px] uppercase font-bold block ${
                              isDarkMode ? "text-[#00FF41]/80" : "text-[#3F4A33]/60"
                            }`}
                          >
                            Study (Formatted)
                          </span>
                          <p
                            className={`font-semibold border p-1.5 rounded mt-0.5 text-[11px] font-mono ${
                              isDarkMode
                                ? "bg-[#040906] border-[#00FF41]/40 text-[#00FF41]"
                                : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
                            }`}
                          >
                            {activeSinglePdf.fullStudyFormatted}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2. ATTACHMENT PLACEHOLDER FOR KMZ FILE (Below Scanned Details) */}
                    <div
                      className={`rounded-xl p-3.5 sm:p-4 space-y-3 border-2 border-dashed transition-colors ${
                        isDarkMode
                          ? "bg-[#06120A] border-[#00FF41]/40 text-[#D2FAD7]"
                          : "bg-white border-[#8AA66B]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              isDarkMode ? "bg-[#00FF41] text-black font-bold" : "bg-[#8AA66B] text-white"
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <span className={`text-xs font-bold ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>
                            KMZ Map Attachment Placeholder
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleLoadSampleKmz}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition border ${
                            isDarkMode
                              ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/25"
                              : "bg-[#EDF3E3] text-[#3F4A33] hover:bg-[#CFE0B8] border-[#CFE0B8]"
                          }`}
                        >
                          + Sample KMZ
                        </button>
                      </div>

                      <input
                        type="file"
                        ref={kmzInputRef}
                        onChange={(e) => {
                          if (e.target.files) handleKmzFiles(e.target.files);
                        }}
                        accept=".kmz,.kml,application/vnd.google-earth.kmz,application/vnd.google-earth.kml+xml"
                        multiple
                        className="hidden"
                      />

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingKmz(true);
                        }}
                        onDragLeave={() => setIsDraggingKmz(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingKmz(false);
                          if (e.dataTransfer.files) handleKmzFiles(e.dataTransfer.files);
                        }}
                        onClick={() => kmzInputRef.current?.click()}
                        className={`border border-dashed rounded-lg p-2.5 text-center cursor-pointer transition flex items-center justify-center space-x-2 ${
                          isDraggingKmz
                            ? isDarkMode
                              ? "border-[#00FF41] bg-[#00FF41]/20 text-[#00FF41]"
                              : "border-[#8AA66B] bg-[#EDF3E3]"
                            : isDarkMode
                              ? "border-[#00FF41]/40 bg-[#040906] text-[#D2FAD7] hover:bg-[#00FF41]/10"
                              : "border-[#CFE0B8] bg-[#EDF3E3]/40 hover:bg-[#EDF3E3] text-[#3F4A33]"
                        }`}
                      >
                        <Paperclip className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                        <span className="text-xs font-medium">
                          Drop KMZ map file here or click to browse
                        </span>
                      </div>

                      {/* Attached KMZ File Badges */}
                      {kmzList.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider block ${
                              isDarkMode ? "text-[#00FF41]/80" : "text-[#3F4A33]/60"
                            }`}
                          >
                            Attached Map File(s):
                          </span>
                          {kmzList.map((kmz) => (
                            <div
                              key={kmz.id}
                              className={`border rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs ${
                                isDarkMode
                                  ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
                                  : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                                <span className="font-semibold truncate">{kmz.fileName}</span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono border ${
                                    isDarkMode
                                      ? "bg-[#08150D] text-[#00FF41] border-[#00FF41]/40"
                                      : "bg-white text-[#3F4A33] border-[#CFE0B8]"
                                  }`}
                                >
                                  {kmz.fileSizeFormatted}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveKmz(kmz.id)}
                                className={`p-1 cursor-pointer transition ${
                                  isDarkMode ? "text-zinc-500 hover:text-red-400" : "text-zinc-400 hover:text-red-600"
                                }`}
                                title="Remove KMZ"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right 7 Cols: Single Outlook Email Card */}
                  <div
                    className={`lg:col-span-7 rounded-xl shadow-xs overflow-hidden border-2 transition-colors ${
                      isDarkMode
                        ? "bg-[#08150D] border-[#00FF41]/40 shadow-[0_0_20px_rgba(0,255,65,0.08)]"
                        : "bg-white border-[#CFE0B8]"
                    }`}
                  >
                    {/* Header */}
                    <div
                      className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b ${
                        isDarkMode
                          ? "bg-[#040906] text-[#00FF41] border-[#00FF41]/30"
                          : "bg-[#3F4A33] text-white border-transparent"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isDarkMode
                              ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                              : "bg-[#8AA66B] text-white"
                          }`}
                        >
                          {isTmc ? "TMC Approval (James)" : "ALG Conversion (Nina/Marisa)"}
                        </span>
                        <span className={`text-xs font-semibold ${isDarkMode ? "text-[#D2FAD7]/80" : "text-white/80"}`}>
                          {singleRender.subject}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyRichEmail(
                              singleRender.text,
                              singleRender.html,
                              `single-${activeTab}`
                            )
                          }
                          className={`text-xs font-bold px-3 py-1 rounded-md transition shadow-2xs flex items-center gap-1 cursor-pointer border ${
                            isDarkMode
                              ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/30"
                              : "bg-white text-[#3F4A33] hover:bg-[#EDF3E3] border-transparent"
                          }`}
                        >
                          {copiedStatus === `single-${activeTab}` ? (
                            <>
                              <Check className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-600"}`} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Email</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isExportingEml}
                          onClick={() =>
                            handleDownloadEmlWithAttachments(
                              singleRender.subject,
                              singleRender.html,
                              isTmc ? "James <james@ndsdata.com>" : "Nina, Marisa <scheduling@ndsdata.com>",
                              [activeSinglePdf]
                            )
                          }
                          className={`text-xs font-bold px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer border ${
                            isDarkMode
                              ? "bg-[#00FF41] text-black font-extrabold border-[#00FF41] hover:bg-[#00FF41]/90 shadow-[0_0_10px_rgba(0,255,65,0.4)]"
                            : "bg-[#8AA66B] hover:bg-[#7a965c] text-white border-[#8AA66B]"
                          }`}
                          title="Download .eml file with PDF & KMZ attached ready to send in Outlook"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isExportingEml ? "Packaging..." : ".EML (with Attachments)"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Attached Files Banner */}
                    <div
                      className={`border-b px-4 py-2 flex items-center justify-between text-xs ${
                        isDarkMode
                          ? "bg-[#06120A] border-[#00FF41]/30 text-[#D2FAD7]"
                          : "bg-[#FBF7F0] border-[#CFE0B8] text-[#3F4A33]"
                      }`}
                    >
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold flex items-center gap-1">
                          <Paperclip className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} /> Attachments ({1 + kmzList.length}):
                        </span>
                        <span
                          className={`border px-2 py-0.5 rounded text-[11px] font-mono ${
                            isDarkMode
                              ? "bg-[#040906] text-[#00FF41] border-[#00FF41]/40"
                              : "bg-white text-[#3F4A33] border-[#CFE0B8]"
                          }`}
                        >
                          📄 {activeSinglePdf.fileName || `${activeSinglePdf.projectNumber}.pdf`}
                        </span>
                        {kmzList.map((k) => (
                          <span
                            key={k.id}
                            className={`border px-2 py-0.5 rounded text-[11px] font-mono ${
                              isDarkMode
                                ? "bg-[#040906] text-[#00FF41] border-[#00FF41]/40"
                                : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                            }`}
                          >
                            🌍 {k.fileName}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Email Body */}
                    <div
                      className={`p-4 sm:p-5 font-sans text-sm select-text space-y-3 ${
                        isDarkMode ? "bg-[#050C07] text-[#D2FAD7]" : "bg-white text-zinc-900"
                      }`}
                    >
                      <div
                        className={`text-xs border-b pb-2 space-y-1 ${
                          isDarkMode ? "border-[#00FF41]/20 text-[#D2FAD7]/70" : "border-zinc-100 text-zinc-500"
                        }`}
                      >
                        <div>
                          <strong className={isDarkMode ? "text-[#00FF41]" : "text-zinc-700"}>To:</strong>{" "}
                          {isTmc ? "James" : "Nina, Marisa"}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <strong className={isDarkMode ? "text-[#00FF41]" : "text-zinc-700"}>Subject:</strong>{" "}
                            <span className={`font-semibold ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-900"}`}>
                              {singleRender.subject}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopySubject(singleRender.subject, `subj-${activeTab}`)}
                            className={`text-[11px] border px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer shrink-0 transition ${
                              isDarkMode
                                ? "text-[#00FF41] bg-[#00FF41]/10 border-[#00FF41]/40 hover:bg-[#00FF41]/25"
                                : "text-[#3F4A33] bg-[#EDF3E3] hover:bg-[#CFE0B8] border-[#CFE0B8]"
                            }`}
                            title="Copy Subject only"
                          >
                            {copiedStatus === `subj-${activeTab}` ? (
                              <>
                                <Check className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-600"}`} />
                                <span className={`font-bold ${isDarkMode ? "text-[#00FF41]" : "text-emerald-700"}`}>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Subject</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div
                        className={`rounded-lg p-4 font-sans text-sm leading-relaxed border space-y-3 ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7] shadow-[0_0_15px_rgba(0,255,65,0.06)]"
                            : "bg-white border-zinc-200 text-zinc-900 shadow-2xs"
                        }`}
                      >
                        {isTmc ? (
                          <>
                            <p>Hi James,</p>
                            <p>Please see TMC camera placement approval.</p>
                            <p>
                              <span className="bg-yellow-300 text-black font-bold px-1.5 py-0.5 rounded-xs inline-block shadow-2xs">
                                {formatUrgencyLine(activeSinglePdf.urgency, scheduleOption)}
                              </span>
                            </p>
                            <div className="space-y-0.5">
                              <p><strong>Project Number:</strong> <strong className={`font-bold font-mono ${isDarkMode ? "text-[#00FF41]" : ""}`}>{activeSinglePdf.projectNumber}</strong></p>
                              <p><strong>Location/s:</strong> {activeSinglePdf.locationsCount}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <p>Hi Nina/Marisa,</p>
                            <p>Please see ALG conversion attached.</p>
                            <p>
                              <span className="bg-yellow-300 text-black font-bold px-1.5 py-0.5 rounded-xs inline-block shadow-2xs">
                                {formatUrgencyLine(activeSinglePdf.urgency, scheduleOption)}
                              </span>
                            </p>
                            <div className="space-y-0.5">
                              <p><strong>Region:</strong> {activeSinglePdf.region || "South Central"}</p>
                              <p><strong>Project Number:</strong> <strong className={`font-bold font-mono ${isDarkMode ? "text-[#00FF41]" : ""}`}>{activeSinglePdf.projectNumber}</strong></p>
                              <p><strong>Location/s:</strong> {activeSinglePdf.locationsCount}</p>
                              <p><strong>Study:</strong> {activeSinglePdf.fullStudyFormatted}</p>
                            </div>
                          </>
                        )}

                        {/* Live Email Signature Preview */}
                        {emailSignatureEnabled && (
                          <div
                            className={`pt-3 border-t mt-4 text-xs font-sans space-y-1 text-left select-text ${
                              isDarkMode ? "border-[#00FF41]/20 text-[#D2FAD7]" : "border-zinc-200 text-zinc-600"
                            }`}
                          >
                            <p className={isDarkMode ? "text-[#D2FAD7] mb-2" : "text-zinc-800 mb-2"}>{effectiveSignature.greeting}</p>
                            <p className={`font-bold italic text-sm ${isDarkMode ? "text-[#00FF41]" : "text-zinc-900"}`}>{effectiveSignature.name}</p>
                            <p className={`font-bold italic ${isDarkMode ? "text-[#00FF41]/80" : "text-[#1F4E79]"}`}>{effectiveSignature.title}</p>
                            <p className={`font-bold ${isDarkMode ? "text-[#00FF41]" : "text-[#1F4E79]"}`}>{effectiveSignature.company}</p>
                            <p className={`font-bold text-[11px] ${isDarkMode ? "text-[#D2FAD7]/60" : "text-zinc-500"}`}>{effectiveSignature.officeLabel || "Corporate Office:"}</p>
                            <p className={isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-600"}>{effectiveSignature.address}</p>
                            {effectiveSignature.website && (
                              <p>
                                <a
                                  href={`https://${effectiveSignature.website.replace(/^https?:\/\//, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`underline ${isDarkMode ? "text-[#00FF41] hover:text-[#00FF41]/80" : "text-zinc-600"}`}
                                >
                                  {effectiveSignature.website}
                                </a>
                              </p>
                            )}
                            <p className={`font-bold text-sm pt-2 ${isDarkMode ? "text-[#00FF41]" : "text-[#1F4E79]"}`}>{effectiveSignature.tagline}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Email Signature Settings & Customization Modal */}
      <EmailSignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        branding={effectiveBrandingForModal}
        onUpdateBranding={(partial) => {
          if (partial.emailSignatureEnabled !== undefined) {
            setEmailSignatureEnabled(partial.emailSignatureEnabled);
            localStorage.setItem("algtmc_email_signature_enabled", String(partial.emailSignatureEnabled));
          }
          if (partial.emailSignaturePreset) {
            setSelectedSignaturePreset(partial.emailSignaturePreset);
            localStorage.setItem("algtmc_email_signature_preset", partial.emailSignaturePreset);
          }
          if (partial.customEmailSignature) {
            setCustomSignatureFields(partial.customEmailSignature);
          }
          if (onUpdateBranding) {
            onUpdateBranding(partial);
          }
        }}
        onToggleEmailSignature={handleToggleSignature}
        onSelectPreset={handleSelectSignaturePreset}
      />
    </div>
  );
};
