import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Monitor,
  Smartphone,
  Check,
  Download,
  ExternalLink,
  Mail,
  Plus,
  Trash2,
  StickyNote,
  Calendar,
  X,
  BookmarkPlus,
  BookmarkCheck,
  Bookmark,
  Sparkles,
  Layers,
  CheckSquare,
  Square,
  History,
  RotateCcw,
  CheckCheck,
  Info,
  Clock,
  Send,
  Save,
  Paperclip,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  Globe,
  MapPin,
  Link as LinkIcon,
  ArrowUp,
  ArrowDown,
  Compass,
  Footprints,
  MoveUp,
  MoveDown,
  FileSignature,
  Eye,
  Copy,
} from "lucide-react";
import generatorMinimalBanner from "../assets/images/generator_minimal_banner_1790174300845.jpg";
import {
  TechnicianRoster,
  TemplateBranding,
  TemplateStyle,
  EmailAttachment,
  PedsConductLineItem,
  WorkOrder,
  EmailSignaturePresetId,
} from "../types";
import { EmailSignatureModal } from "./EmailSignatureModal";
import { useTheme } from "../context/ThemeContext";
import {
  EMAIL_SIGNATURE_PRESETS,
  SIGNATURE_PRESET_OPTIONS,
} from "../utils/signaturePresets";
import {
  generateOutlookHtml,
  generatePlainTextEmail,
  generateEmailSubject,
  getWeekDateRange,
  formatNoteTextWithPrefix,
  downloadEmlFile,
  cleanTechnicianName,
  resolveStackedPreviousUpdateNotes,
  autoDetectAdditionalNotesForRoster,
  buildDayScheduleItems,
  groupNDSOrdersByDay,
  SPEED_INSTALL_NOTE,
  SPEED_TEARDOWN_NOTE,
  TMC_INSTALL_NOTE,
  LADOTD_MON_NOTE,
  LADOTD_START_TUE_NOTE,
  LADOTD_TUE_NOTE,
  MACHINE_LOCS_TO_CAM_NOTE,
  PEDS_SIGHT_DISTANCE_NOTE,
  MAINLINE_STUDY_NOTE,
  RADAR_STUDY_NOTE,
  isRadarStudyNote,
  isAutomaticSpeedOrTmcNote,
} from "../utils/outlookTemplateGenerator";
import {
  GeneratedEmailRecord,
  getStoredGeneratedEmails,
  saveStoredGeneratedEmail,
  deleteStoredGeneratedEmail,
  clearStoredGeneratedEmailsForTech,
  getGeneratedEmailsForTechAndWeek,
  getRecommendedUpdateVersion,
  getStoredPreviousUpdateNotes,
  getStoredInitialEmailLinks,
  extractVersionNumber,
  extractRecordVersionNumber,
  getMostRecentSavedEmail,
  NDS_SAVED_EMAILS_EVENT,
} from "../utils/generatedEmailStorage";
import { GeneratedEmailsHistoryModal } from "./GeneratedEmailsHistoryModal";
import { CodSightDistanceModal } from "./CodSightDistanceModal";
import { getTechnicianGoogleMapsLink, getTechnicianAirtableLink } from "../utils/technicianRosterDirectory";

export interface NotePreset {
  id: string;
  title: string;
  text: string;
  isBuiltIn?: boolean;
}

const DEFAULT_NOTE_PRESETS: NotePreset[] = [
  {
    id: "preset-speed-install",
    title: "⚡ SPEED - Install (Extend Poles)",
    text: SPEED_INSTALL_NOTE,
    isBuiltIn: true,
  },
  {
    id: "preset-speed-teardown",
    title: "⚡ SPEED - Teardown (File Naming)",
    text: SPEED_TEARDOWN_NOTE,
    isBuiltIn: true,
  },
  {
    id: "preset-radar-study",
    title: "RADAR STUDY",
    text: RADAR_STUDY_NOTE,
    isBuiltIn: true,
  },
  {
    id: "preset-tmc-install",
    title: "📍 TMC - Install (Site Approval & Backup Diagonally)",
    text: TMC_INSTALL_NOTE,
    isBuiltIn: true,
  },
  {
    id: "preset-peds-sight-distance",
    title: "🚶 PEDS - Sight Distance Requirement",
    text: PEDS_SIGHT_DISTANCE_NOTE,
    isBuiltIn: true,
  },
  {
    id: "preset-ladotd-mon",
    title: "LADOTD Notes (Monday)",
    text: LADOTD_MON_NOTE,
    isBuiltIn: true,
  },
  {
    id: "preset-ladotd-start-tue",
    title: "LADOTD Start Tuesday",
    text: LADOTD_START_TUE_NOTE,
    isBuiltIn: true,
  },
  {
    id: "preset-ladotd-tue",
    title: "LADOTD notes (Tuesday)",
    text: LADOTD_TUE_NOTE,
    isBuiltIn: true,
  },
  {
    id: "preset-machine-locs-to-cam",
    title: "Machine Locs to Cam",
    text: MACHINE_LOCS_TO_CAM_NOTE,
    isBuiltIn: true,
  },
  {
    id: "preset-unfinished",
    title: "Continue Unfinished",
    text: "Note: Continue installing locations not finished yesterday until all inventories have been used up.",
    isBuiltIn: true,
  },
  {
    id: "preset-mainline-study",
    title: "Mainline Study Notes",
    text: MAINLINE_STUDY_NOTE,
    isBuiltIn: true,
  },
];

const STALE_LEGACY_PRESET_IDS = new Set([
  "preset-ladder",
  "preset-depot",
  "preset-weather",
  "preset-tamper",
]);

const LOCAL_STORAGE_KEY_PRESETS = "nds_additional_notes_custom_presets_v1";

interface OutlookEmailPreviewProps {
  roster: TechnicianRoster;
  branding: TemplateBranding;
  currentStyle?: TemplateStyle;
  onRecordDispatch: (method: any, status: any) => void;
  onToggleAnytime?: (val: boolean) => void;
  onToggleLadotd?: (val: boolean) => void;
  onToggleCodExclusive?: (val: boolean) => void;
  onToggleEmailUpdates?: (val: boolean) => void;
  onUpdateEmailUpdateDetails?: (version: number | string, notes: string) => void;
  onToggleManualPriorVersions?: (val: boolean) => void;
  onUpdateManualPriorVersions?: (notes: Array<{ version: number | string; notes: string; text?: string }>) => void;
  onToggleAdditionalNotes?: (val: boolean) => void;
  onUpdateAdditionalNotes?: (notes: Array<{ id: string; day: string; text: string }>) => void;
  onToggleSundaySunday?: (val: boolean) => void;
  onToggleOverlappingSchedules?: (val: boolean) => void;
  onToggleConductStudy?: (val: boolean) => void;
  onUpdatePedsConductLines?: (lines: PedsConductLineItem[]) => void;
  onUpdateDayItemOrderOverrides?: (overrides: Record<string, string[]>) => void;
  onToggleEmailSignature?: (val: boolean) => void;
  onSelectEmailSignaturePreset?: (preset: EmailSignaturePresetId) => void;
  onUpdateBranding?: (newBranding: Partial<TemplateBranding>) => void;
  onClearPreview?: () => void;
}

export const OutlookEmailPreview: React.FC<OutlookEmailPreviewProps> = ({
  roster,
  branding,
  currentStyle = "exact_nds_template",
  onRecordDispatch,
  onToggleAnytime,
  onToggleLadotd,
  onToggleCodExclusive,
  onToggleEmailUpdates,
  onUpdateEmailUpdateDetails,
  onToggleManualPriorVersions,
  onUpdateManualPriorVersions,
  onToggleAdditionalNotes,
  onUpdateAdditionalNotes,
  onToggleSundaySunday,
  onToggleOverlappingSchedules,
  onToggleConductStudy,
  onUpdatePedsConductLines,
  onUpdateDayItemOrderOverrides,
  onToggleEmailSignature,
  onSelectEmailSignaturePreset,
  onUpdateBranding,
  onClearPreview,
}) => {
  const { isDarkMode, activeHolidaySeason, holidayConfig } = useTheme();
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [selectedNoteDay, setSelectedNoteDay] = useState<string>("Monday");
  const [noteInputText, setNoteInputText] = useState<string>("");
  const [customPresets, setCustomPresets] = useState<NotePreset[]>([]);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [newPresetTitle, setNewPresetTitle] = useState("");
  const [presetFeedback, setPresetFeedback] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  // Conduct Study & PEDS Conduct Sight Distance State
  const [selectedPedsDay, setSelectedPedsDay] = useState<string>("Monday");
  const [pedsProjectNumber, setPedsProjectNumber] = useState<string>("");
  const [pedsCity, setPedsCity] = useState<string>("City of Dallas");
  const [pedsListNumber, setPedsListNumber] = useState<string>("");
  const [pedsCustomText, setPedsCustomText] = useState<string>("");
  const [pedsFeedback, setPedsFeedback] = useState<string | null>(null);

  // Multi-Selection Presets State
  const [showMultiSelectModal, setShowMultiSelectModal] = useState(false);
  const [multiSelectPresetIds, setMultiSelectPresetIds] = useState<string[]>([]);
  const [multiSelectDayMap, setMultiSelectDayMap] = useState<Record<string, string>>({});
  const [multiSelectBulkDay, setMultiSelectBulkDay] = useState<string>("Monday");
  const [multiSelectSearch, setMultiSelectSearch] = useState<string>("");

  // Generated Emails History & Auto-Versioning State
  const [storedEmails, setStoredEmails] = useState<GeneratedEmailRecord[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [autoVersionNotice, setAutoVersionNotice] = useState<{
    tech: string;
    count: number;
    suggestedVersion: number;
    recentVersion?: number;
    recentVersionLabel?: string;
  } | null>(null);
  const lastAutoSyncedKeyRef = useRef<string>("");
  const [manualSaveSuccess, setManualSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // COD Sight Distance Modal State
  const [showCodSightDistanceModal, setShowCodSightDistanceModal] = useState(false);

  // Email Attachments State
  const [attachments, setAttachments] = useState<EmailAttachment[]>(branding.attachments || []);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Helper for inactive toolbar buttons adhering to holiday theme palette
  const getToolbarButtonInactiveClass = () => {
    if (isDarkMode) {
      return "bg-[#08150D] text-[#00FF41] border-[#00FF41]/40 hover:text-white hover:border-[#00FF41] hover:bg-[#00FF41]/15 hover:shadow-[0_0_10px_rgba(0,255,65,0.3)]";
    }
    if (activeHolidaySeason === "halloween") {
      return "bg-[#251208] text-orange-100 border-orange-400/50 hover:text-white hover:border-orange-300 hover:bg-orange-900/60";
    }
    if (activeHolidaySeason === "christmas_eve") {
      return "bg-[#0c182b] text-blue-100 border-amber-300/50 hover:text-white hover:border-amber-200 hover:bg-blue-900/60";
    }
    if (activeHolidaySeason === "christmas") {
      return "bg-[#0e2c19] text-emerald-100 border-red-400/50 hover:text-white hover:border-red-300 hover:bg-emerald-900/60";
    }
    if (activeHolidaySeason === "new_year") {
      return "bg-[#18153b] text-amber-100 border-yellow-300/50 hover:text-white hover:border-yellow-200 hover:bg-amber-900/60";
    }
    return "bg-[#3F4A33] text-[#FAF4E6] border-[#CFE0B8]/60 hover:text-white hover:border-[#CFE0B8] hover:bg-white/10";
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync attachments if updated externally via branding
  useEffect(() => {
    if (branding.attachments) {
      setAttachments(branding.attachments);
    }
  }, [branding.attachments]);

  const updateAttachments = (newAttachments: EmailAttachment[]) => {
    setAttachments(newAttachments);
    if (onUpdateBranding) {
      onUpdateBranding({ attachments: newAttachments });
    }
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    const newItems: EmailAttachment[] = [];

    for (const file of fileList) {
      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            const base64 = res.includes(",") ? res.split(",")[1] : res;
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newItems.push({
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          base64Data,
          lastModified: file.lastModified,
        });
      } catch (err) {
        console.error("Failed to read file attachment", file.name, err);
      }
    }

    if (newItems.length > 0) {
      const updated = [...attachments, ...newItems];
      updateAttachments(updated);
      setPresetFeedback(`Attached ${newItems.length} file(s) for Outlook export!`);
      setTimeout(() => setPresetFeedback(null), 3500);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleToggleEmailUpdates = (nextVal: boolean) => {
    if (onToggleEmailUpdates) {
      onToggleEmailUpdates(nextVal);
    } else if (onUpdateBranding) {
      onUpdateBranding({
        emailUpdatesEnabled: nextVal,
        manualPriorVersionsEnabled: nextVal ? branding.manualPriorVersionsEnabled : false,
      });
    }

    if (nextVal) {
      // When Email Updates is toggled ON, follow the version from the recent saved history
      // e.g. If the recent saved email is tagged v1, the newly generated will automatically become v2
      const rec = getRecommendedUpdateVersion(roster.technicianName, weekInfo.formattedRange);
      const targetVersion = rec.count > 0 ? rec.recommendedVersion : (branding.updateVersion || 1);

      if (onUpdateEmailUpdateDetails) {
        onUpdateEmailUpdateDetails(targetVersion, branding.updateNotes || "");
      } else if (onUpdateBranding) {
        onUpdateBranding({ emailUpdatesEnabled: true, updateVersion: targetVersion });
      }
    }
  };

  const handleToggleManualPriorVersions = (nextVal: boolean) => {
    if (onToggleManualPriorVersions) {
      onToggleManualPriorVersions(nextVal);
    } else if (onUpdateBranding) {
      onUpdateBranding({ manualPriorVersionsEnabled: nextVal });
    }

    if (nextVal) {
      // If turning ON, ensure we have initial slots based on current version if none exist
      const currentVerNum =
        typeof branding.updateVersion === "number"
          ? branding.updateVersion
          : parseInt(String(branding.updateVersion || 1), 10) || 1;

      const existingNotes = branding.previousUpdateNotes || [];
      if (existingNotes.length === 0 && currentVerNum > 1) {
        const initialSlots: Array<{ version: number | string; notes: string; text?: string }> = [];
        for (let v = currentVerNum - 1; v >= 1; v--) {
          initialSlots.push({ version: v, notes: "" });
        }
        if (onUpdateManualPriorVersions) {
          onUpdateManualPriorVersions(initialSlots);
        } else if (onUpdateBranding) {
          onUpdateBranding({ manualPriorVersionsEnabled: true, previousUpdateNotes: initialSlots });
        }
      }
    }
  };

  const handleUpdatePriorNote = (index: number, newNoteText: string) => {
    const currentList = [...(branding.previousUpdateNotes || [])];
    if (currentList[index]) {
      currentList[index] = { ...currentList[index], notes: newNoteText };
      if (onUpdateManualPriorVersions) {
        onUpdateManualPriorVersions(currentList);
      } else if (onUpdateBranding) {
        onUpdateBranding({ previousUpdateNotes: currentList });
      }
    }
  };

  const handleUpdatePriorVersionNumber = (index: number, newVersion: string | number) => {
    const currentList = [...(branding.previousUpdateNotes || [])];
    if (currentList[index]) {
      currentList[index] = { ...currentList[index], version: newVersion };
      if (onUpdateManualPriorVersions) {
        onUpdateManualPriorVersions(currentList);
      } else if (onUpdateBranding) {
        onUpdateBranding({ previousUpdateNotes: currentList });
      }
    }
  };

  const handleSortPriorSlotsDescending = () => {
    const currentList = [...(branding.previousUpdateNotes || [])];
    currentList.sort((a, b) => extractVersionNumber(b.version) - extractVersionNumber(a.version));
    if (onUpdateManualPriorVersions) {
      onUpdateManualPriorVersions(currentList);
    } else if (onUpdateBranding) {
      onUpdateBranding({ previousUpdateNotes: currentList });
    }
    setPresetFeedback("Sorted prior versions descending (highest to lowest).");
    setTimeout(() => setPresetFeedback(null), 2500);
  };

  const handleAddPriorVersionSlot = (customVer?: number | string) => {
    const currentList = [...(branding.previousUpdateNotes || [])];
    let nextVer: number | string = customVer !== undefined ? customVer : 1;
    if (customVer === undefined) {
      if (currentList.length > 0) {
        const nums = currentList.map((item) => extractVersionNumber(item.version)).filter((n) => n > 0);
        const minVal = nums.length > 0 ? Math.min(...nums) : 2;
        nextVer = minVal > 1 ? minVal - 1 : (nums.length > 0 ? Math.max(...nums) + 1 : 1);
      } else {
        const currentVerNum =
          typeof branding.updateVersion === "number"
            ? branding.updateVersion
            : parseInt(String(branding.updateVersion || 1), 10) || 1;
        nextVer = currentVerNum > 1 ? currentVerNum - 1 : 1;
      }
    }
    const updated = [...currentList, { version: nextVer, notes: "" }];
    // Keep list ordered descending by version
    updated.sort((a, b) => extractVersionNumber(b.version) - extractVersionNumber(a.version));
    if (onUpdateManualPriorVersions) {
      onUpdateManualPriorVersions(updated);
    } else if (onUpdateBranding) {
      onUpdateBranding({ previousUpdateNotes: updated });
    }
  };

  const handleRemovePriorVersionSlot = (index: number) => {
    const currentList = [...(branding.previousUpdateNotes || [])];
    currentList.splice(index, 1);
    if (onUpdateManualPriorVersions) {
      onUpdateManualPriorVersions(currentList);
    } else if (onUpdateBranding) {
      onUpdateBranding({ previousUpdateNotes: currentList });
    }
  };

  const handleAutoFillPriorSlots = () => {
    const currentVerNum =
      typeof branding.updateVersion === "number"
        ? branding.updateVersion
        : parseInt(String(branding.updateVersion || 1), 10) || 1;

    if (currentVerNum <= 1) {
      setPresetFeedback("Current version is v1. Increase update version to v2+ to auto-generate prior slots.");
      setTimeout(() => setPresetFeedback(null), 3000);
      return;
    }

    const slots: Array<{ version: number | string; notes: string; text?: string }> = [];
    for (let v = currentVerNum - 1; v >= 1; v--) {
      const existing = (branding.previousUpdateNotes || []).find(
        (p) => String(p.version) === String(v)
      );
      slots.push({ version: v, notes: existing ? existing.notes : "" });
    }
    // Explicitly guarantee descending order
    slots.sort((a, b) => extractVersionNumber(b.version) - extractVersionNumber(a.version));

    if (onUpdateManualPriorVersions) {
      onUpdateManualPriorVersions(slots);
    } else if (onUpdateBranding) {
      onUpdateBranding({ previousUpdateNotes: slots });
    }
    setPresetFeedback(`Generated slots for v${currentVerNum - 1} down to v1 (descending).`);
    setTimeout(() => setPresetFeedback(null), 2500);
  };

  const handleLoadPriorVersionsFromHistory = () => {
    const currentVerNum =
      typeof branding.updateVersion === "number"
        ? branding.updateVersion
        : parseInt(String(branding.updateVersion || 1), 10) || 1;
    const historyNotes = getStoredPreviousUpdateNotes(
      roster.technicianName,
      weekInfo.formattedRange,
      currentVerNum
    );
    if (historyNotes && historyNotes.length > 0) {
      if (onUpdateManualPriorVersions) {
        onUpdateManualPriorVersions(historyNotes);
      } else if (onUpdateBranding) {
        onUpdateBranding({ previousUpdateNotes: historyNotes });
      }
      setPresetFeedback(`Loaded ${historyNotes.length} prior version note(s) from Saved Email History!`);
      setTimeout(() => setPresetFeedback(null), 3500);
    } else {
      setPresetFeedback("No prior version notes found in Saved History for this technician and week.");
      setTimeout(() => setPresetFeedback(null), 3500);
    }
  };

  const handleClearAllManualPriorVersions = () => {
    if (onUpdateManualPriorVersions) {
      onUpdateManualPriorVersions([]);
    } else if (onUpdateBranding) {
      onUpdateBranding({ previousUpdateNotes: [] });
    }
    setPresetFeedback("Cleared all manual prior version notes.");
    setTimeout(() => setPresetFeedback(null), 2500);
  };

  const handleRemoveAttachment = (id: string) => {
    const updated = attachments.filter((a) => a.id !== id);
    updateAttachments(updated);
  };

  const handleClearAllAttachments = () => {
    updateAttachments([]);
    setPresetFeedback("Cleared all attachments.");
    setTimeout(() => setPresetFeedback(null), 2500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Load custom presets from localStorage on mount (filtering legacy removed presets)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PRESETS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((p) => !STALE_LEGACY_PRESET_IDS.has(p.id));
          setCustomPresets(filtered);
        }
      }
    } catch (e) {
      console.warn("Failed to load custom note presets from localStorage", e);
    }
  }, []);

  // Save custom presets to localStorage
  const saveCustomPresetsToStorage = (updated: NotePreset[]) => {
    setCustomPresets(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PRESETS, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save custom note presets to localStorage", e);
    }
  };

  const allPresets = useMemo(() => {
    return [...customPresets, ...DEFAULT_NOTE_PRESETS];
  }, [customPresets]);

  const weekInfo = useMemo(() => getWeekDateRange(roster.date, branding), [roster.date, branding]);

  // Initial email stored links for this technician and work week
  const initialEmailStoredLinks = useMemo(() => {
    return getStoredInitialEmailLinks(roster.technicianName, weekInfo.formattedRange);
  }, [roster.technicianName, weekInfo.formattedRange, storedEmails]);

  // Google Maps App Link Placeholder State & Handlers
  const explicitCustomMapUrl =
    (branding.customTechGoogleMapsLinks && branding.customTechGoogleMapsLinks[roster.technicianName]) ||
    branding.googleMapsUrl ||
    "";

  // Check if link is auto-embedded from initial email history
  const isAutoEmbeddedFromInitial = !explicitCustomMapUrl && !!initialEmailStoredLinks.googleMapsUrl;
  const activeCustomMapUrl = explicitCustomMapUrl || initialEmailStoredLinks.googleMapsUrl || "";

  const resolvedGoogleMapsUrl = useMemo(() => {
    return getTechnicianGoogleMapsLink(
      roster.technicianName,
      activeCustomMapUrl,
      branding.customTechGoogleMapsLinks,
      branding.googleMapsBaseUrl,
      weekInfo.formattedRange
    );
  }, [roster.technicianName, activeCustomMapUrl, branding.customTechGoogleMapsLinks, branding.googleMapsBaseUrl, weekInfo.formattedRange]);

  const handleGoogleMapsUrlChange = (val: string) => {
    const updatedMap = {
      ...(branding.customTechGoogleMapsLinks || {}),
      [roster.technicianName]: val,
    };
    if (onUpdateBranding) {
      onUpdateBranding({
        googleMapsUrl: val,
        customTechGoogleMapsLinks: updatedMap,
      });
    }
  };

  const handleResetGoogleMapsUrl = () => {
    const updatedMap = { ...(branding.customTechGoogleMapsLinks || {}) };
    delete updatedMap[roster.technicianName];
    if (onUpdateBranding) {
      onUpdateBranding({
        googleMapsUrl: "",
        customTechGoogleMapsLinks: updatedMap,
      });
    }
    setPresetFeedback("Reset Google Maps link to default route query.");
    setTimeout(() => setPresetFeedback(null), 2500);
  };

  const subject = useMemo(() => generateEmailSubject(roster, branding), [roster, branding]);
  const htmlContent = useMemo(
    () => generateOutlookHtml(roster, branding, "exact_nds_template"),
    [roster, branding]
  );
  const previewHtml = useMemo(() => {
    if (!htmlContent) return "";
    const match = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return match ? match[1] : htmlContent;
  }, [htmlContent]);
  const plainTextContent = useMemo(
    () => generatePlainTextEmail(roster, branding),
    [roster, branding]
  );

  const autoDetectedNotes = useMemo(() => {
    return autoDetectAdditionalNotesForRoster(
      roster,
      weekInfo.sundayDate,
      branding.useAnytimeTeardowns,
      branding.sundaySundayEnabled
    );
  }, [roster, weekInfo.sundayDate, branding.useAnytimeTeardowns, branding.sundaySundayEnabled]);

  // Handler to sync auto-detected notes into active notes list
  const handleSyncAutoDetectedNotes = () => {
    if (autoDetectedNotes.length === 0) return;
    const existing = branding.additionalNotes || [];
    const newNotes = [...existing];

    autoDetectedNotes.forEach((an) => {
      const alreadyExists = newNotes.some(
        (n) =>
          n.day.toLowerCase() === an.day.toLowerCase() &&
          n.text.toLowerCase().includes(an.text.slice(0, 30).toLowerCase())
      );
      if (!alreadyExists) {
        newNotes.push({
          id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          day: an.day,
          text: formatNoteTextWithPrefix(an.text),
        });
      }
    });

    if (onUpdateAdditionalNotes) {
      onUpdateAdditionalNotes(newNotes);
    } else if (onUpdateBranding) {
      onUpdateBranding({ additionalNotes: newNotes, additionalNotesEnabled: true });
    }
    if (onToggleAdditionalNotes && !branding.additionalNotesEnabled) {
      onToggleAdditionalNotes(true);
    }
    setPresetFeedback(`Synced ${autoDetectedNotes.length} auto-detected note(s) into schedule!`);
    setTimeout(() => setPresetFeedback(null), 3500);
  };

  const daySelectOptions = useMemo(() => {
    return branding.sundaySundayEnabled
      ? [
          { value: "Sunday", label: `Sunday (${weekInfo.sundayFormatted})` },
          { value: "Monday", label: "Monday" },
          { value: "Tuesday", label: "Tuesday" },
          { value: "Wednesday", label: "Wednesday" },
          { value: "Thursday", label: "Thursday" },
          { value: "Friday", label: "Friday" },
          { value: "Saturday", label: "Saturday" },
          { value: "Sunday_Lower", label: `Sunday (${weekInfo.nextSundayFormatted})` },
        ]
      : [
          { value: "Sunday", label: "Sunday" },
          { value: "Monday", label: "Monday" },
          { value: "Tuesday", label: "Tuesday" },
          { value: "Wednesday", label: "Wednesday" },
          { value: "Thursday", label: "Thursday" },
          { value: "Friday", label: "Friday" },
          { value: "Saturday", label: "Saturday" },
        ];
  }, [branding.sundaySundayEnabled, weekInfo]);

  const daysDefinitions = useMemo(() => {
    return branding.sundaySundayEnabled
      ? [
          { key: "Sunday", displayName: `Sunday (${weekInfo.sundayFormatted})`, baseDayName: "Sunday" },
          { key: "Monday", displayName: "Monday", baseDayName: "Monday" },
          { key: "Tuesday", displayName: "Tuesday", baseDayName: "Tuesday" },
          { key: "Wednesday", displayName: "Wednesday", baseDayName: "Wednesday" },
          { key: "Thursday", displayName: "Thursday", baseDayName: "Thursday" },
          { key: "Friday", displayName: "Friday", baseDayName: "Friday" },
          { key: "Saturday", displayName: "Saturday", baseDayName: "Saturday" },
          { key: "Sunday_Lower", displayName: `Sunday (${weekInfo.nextSundayFormatted})`, baseDayName: "Sunday" },
        ]
      : [
          { key: "Sunday", displayName: "Sunday", baseDayName: "Sunday" },
          { key: "Monday", displayName: "Monday", baseDayName: "Monday" },
          { key: "Tuesday", displayName: "Tuesday", baseDayName: "Tuesday" },
          { key: "Wednesday", displayName: "Wednesday", baseDayName: "Wednesday" },
          { key: "Thursday", displayName: "Thursday", baseDayName: "Thursday" },
          { key: "Friday", displayName: "Friday", baseDayName: "Friday" },
          { key: "Saturday", displayName: "Saturday", baseDayName: "Saturday" },
        ];
  }, [branding.sundaySundayEnabled, weekInfo]);

  const groupedOrders = useMemo(() => {
    return groupNDSOrdersByDay(roster.orders, weekInfo.sundayDate, branding);
  }, [roster.orders, weekInfo.sundayDate, branding]);

  const getDayDisplayName = (dayKey: string) => {
    if (dayKey === "Sunday_Lower") {
      return `Sunday (${weekInfo.nextSundayFormatted})`;
    }
    if (dayKey === "Sunday" && branding.sundaySundayEnabled) {
      return `Sunday (${weekInfo.sundayFormatted})`;
    }
    return dayKey;
  };

  // Refresh stored generated emails from localStorage
  const refreshStoredEmails = useCallback(() => {
    const records = getStoredGeneratedEmails();
    setStoredEmails(records);
    return records;
  }, []);

  // Initial load of stored emails & listen for storage updates across the app
  useEffect(() => {
    refreshStoredEmails();

    const handleCustomUpdate = () => {
      refreshStoredEmails();
    };
    window.addEventListener(NDS_SAVED_EMAILS_EVENT, handleCustomUpdate);
    return () => {
      window.removeEventListener(NDS_SAVED_EMAILS_EVENT, handleCustomUpdate);
    };
  }, [refreshStoredEmails]);

  const [clearNotice, setClearNotice] = useState<string | null>(null);

  // Auto-detect and recommend email update version when technician, work week, or saved emails change
  useEffect(() => {
    const techName = roster.technicianName;
    const workWeek = weekInfo.formattedRange;
    if (!techName) return;

    const rec = getRecommendedUpdateVersion(techName, workWeek);
    const currentKey = `${cleanTechnicianName(techName).toLowerCase()}|${workWeek}|${rec.mostRecentVersion}`;

    if (rec.count > 0) {
      // Prior generated emails exist for this tech in this work week
      // Follow the version from the recent saved history (recent + 1):
      // e.g. If the recent saved email is tagged v1, nextVer = 2 (UPDATE v2)
      // e.g. If the recent saved email was manually set to v3, nextVer = 4 (UPDATE v4)
      const nextVer = rec.recommendedVersion;
      setAutoVersionNotice({
        tech: cleanTechnicianName(techName),
        count: rec.count,
        suggestedVersion: nextVer,
        recentVersion: rec.mostRecentVersion,
        recentVersionLabel: rec.mostRecentVersionLabel,
      });

      // Auto-toggle ON the Email Updates feature when stored history exists
      if (!branding.emailUpdatesEnabled) {
        if (onToggleEmailUpdates) {
          onToggleEmailUpdates(true);
        } else if (onUpdateBranding) {
          onUpdateBranding({ emailUpdatesEnabled: true, updateVersion: nextVer });
        }
      }

      // If switching to this technician/week, or if a new saved version was recorded, or if updateVersion is unset or 0:
      if (lastAutoSyncedKeyRef.current !== currentKey || branding.updateVersion === undefined || branding.updateVersion === 0) {
        lastAutoSyncedKeyRef.current = currentKey;
        if (onUpdateEmailUpdateDetails) {
          onUpdateEmailUpdateDetails(nextVer, branding.updateNotes || "");
        } else if (onUpdateBranding) {
          onUpdateBranding({ updateVersion: nextVer });
        }
      }
    } else {
      setAutoVersionNotice(null);
      lastAutoSyncedKeyRef.current = currentKey;
    }
  }, [roster.technicianName, weekInfo.formattedRange, storedEmails]);

  // Record a generated email into localStorage with full rendered content
  const recordGeneratedEmailToStorage = (
    method: "Clipboard" | "Outlook EML" | "Outlook Web" | "Batch ZIP" | "Manual Save"
  ) => {
    const currentVersion = branding.emailUpdatesEnabled
      ? branding.updateVersion !== undefined && branding.updateVersion !== ""
        ? `UPDATE v${branding.updateVersion}`
        : "UPDATE v1"
      : "Version 0";

    const resolvedAirtable = getTechnicianAirtableLink(
      roster.technicianName,
      branding.airtableBaseUrl,
      branding.customTechAirtableLinks,
      weekInfo.formattedRange
    );
    const resolvedPhoto = branding.photoUploadUrl || "https://airtable.com/appsVo4SWcGXTkarK/shrBgw2x5NJZwU3Xo";

    saveStoredGeneratedEmail({
      technicianName: roster.technicianName,
      workWeek: weekInfo.formattedRange,
      version: currentVersion,
      subject,
      exportMethod: method,
      notes: branding.updateNotes,
      jobCount: roster.orders.length,
      htmlContent,
      plainTextContent,
      additionalNotes: branding.additionalNotes,
      googleMapsUrl: activeCustomMapUrl || resolvedGoogleMapsUrl,
      airtableUrl: resolvedAirtable,
      photoUploadUrl: resolvedPhoto,
      attachments: attachments.length > 0 ? attachments : undefined,
      brandingConfig: {
        additionalNotesEnabled: branding.additionalNotesEnabled,
        emailUpdatesEnabled: branding.emailUpdatesEnabled,
        updateVersion: branding.updateVersion,
        updateNotes: branding.updateNotes,
        manualPriorVersionsEnabled: branding.manualPriorVersionsEnabled,
        previousUpdateNotes: resolveStackedPreviousUpdateNotes(branding, roster),
        sundaySundayEnabled: branding.sundaySundayEnabled,
        overlappingSchedulesEnabled: branding.overlappingSchedulesEnabled,
        useAnytimeTeardowns: branding.useAnytimeTeardowns,
        ladotdExclusive: branding.ladotdExclusive,
        codExclusive: branding.codExclusive,
        conductStudyEnabled: branding.conductStudyEnabled,
        pedsConductLines: branding.pedsConductLines,
        dayItemOrderOverrides: branding.dayItemOrderOverrides,
        googleMapsUrl: activeCustomMapUrl || resolvedGoogleMapsUrl,
        customTechGoogleMapsLinks: branding.customTechGoogleMapsLinks,
        customTechAirtableLinks: branding.customTechAirtableLinks,
        photoUploadUrl: branding.photoUploadUrl,
        photoUploadLinkText: branding.photoUploadLinkText,
        attachments: attachments.length > 0 ? attachments : undefined,
      },
    });

    refreshStoredEmails();
  };

  // Clear currently displayed email state, notes, and update configurations
  const handleClearPreview = () => {
    if (onUpdateAdditionalNotes) {
      onUpdateAdditionalNotes([]);
    }
    if (onUpdateEmailUpdateDetails) {
      onUpdateEmailUpdateDetails(1, "");
    }
    if (onUpdatePedsConductLines) {
      onUpdatePedsConductLines([]);
    }
    if (onUpdateDayItemOrderOverrides) {
      onUpdateDayItemOrderOverrides({});
    }
    if (onToggleAdditionalNotes) {
      onToggleAdditionalNotes(false);
    }
    if (onToggleEmailUpdates) {
      onToggleEmailUpdates(false);
    }
    if (onToggleConductStudy) {
      onToggleConductStudy(false);
    }
    if (onUpdateBranding) {
      onUpdateBranding({
        additionalNotes: [],
        additionalNotesEnabled: false,
        emailUpdatesEnabled: false,
        updateVersion: 1,
        updateNotes: "",
        attachments: [],
        conductStudyEnabled: false,
        pedsConductLines: [],
        dayItemOrderOverrides: {},
      });
    }

    setAttachments([]);
    setNoteInputText("");
    setSelectedNoteDay("Monday");
    setSelectedPedsDay("Monday");
    setPedsProjectNumber("");
    setPedsListNumber("");
    setPedsCustomText("");
    setMultiSelectBulkDay("Monday");
    setMultiSelectPresetIds([]);
    setMultiSelectDayMap({});

    if (onClearPreview) {
      onClearPreview();
    }

    setClearNotice("Preview cleared! Custom notes, schedule, attachments, and uploaded file have been reset.");
    setTimeout(() => setClearNotice(null), 4000);
  };

  // Conduct Study & PEDS Conduct Sight Distance Handlers
  const handleAddPedsConductLine = () => {
    if (!pedsProjectNumber.trim() && !pedsListNumber.trim() && !pedsCustomText.trim()) return;
    const newLine: PedsConductLineItem = {
      id: `peds-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      day: selectedPedsDay,
      projectNumber: pedsProjectNumber.trim() || "26-470285",
      listNumber: pedsListNumber.trim() || "105",
      cityText: pedsCity.trim() || "City of Dallas",
      customText: pedsCustomText.trim() || undefined,
    };
    const updated = [...(branding.pedsConductLines || []), newLine];
    if (onUpdatePedsConductLines) {
      onUpdatePedsConductLines(updated);
    } else if (onUpdateBranding) {
      onUpdateBranding({ pedsConductLines: updated });
    }
    setPedsProjectNumber("");
    setPedsListNumber("");
    setPedsCustomText("");
    setPedsFeedback(`Added PEDS Conduct line to ${getDayDisplayName(selectedPedsDay)}`);
    setTimeout(() => setPedsFeedback(null), 3000);
  };

  const handleRemovePedsConductLine = (id: string) => {
    const updated = (branding.pedsConductLines || []).filter((item) => item.id !== id);
    if (onUpdatePedsConductLines) {
      onUpdatePedsConductLines(updated);
    } else if (onUpdateBranding) {
      onUpdateBranding({ pedsConductLines: updated });
    }
  };

  const handleMoveScheduleItem = (
    dayKey: string,
    baseDayName: string,
    dayOrders: WorkOrder[],
    itemId: string,
    direction: "up" | "down"
  ) => {
    const currentItems = buildDayScheduleItems(dayKey, baseDayName, dayOrders, branding, roster);
    const itemIds = currentItems.map((it) => it.id);
    const currentIndex = itemIds.indexOf(itemId);
    if (currentIndex < 0) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= itemIds.length) return;

    const newOrderIds = [...itemIds];
    const temp = newOrderIds[currentIndex];
    newOrderIds[currentIndex] = newOrderIds[targetIndex];
    newOrderIds[targetIndex] = temp;

    const newOverrides = {
      ...(branding.dayItemOrderOverrides || {}),
      [dayKey]: newOrderIds,
    };

    if (onUpdateDayItemOrderOverrides) {
      onUpdateDayItemOrderOverrides(newOverrides);
    } else if (onUpdateBranding) {
      onUpdateBranding({ dayItemOrderOverrides: newOverrides });
    }
  };

  const getFileBadgeColor = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (ext === "pdf") return "bg-red-50 text-red-700 border-red-300";
    if (ext === "kmz" || ext === "kml") return "bg-amber-50 text-amber-800 border-amber-300";
    if (ext === "csv" || ext === "xlsx" || ext === "xls") return "bg-emerald-50 text-emerald-800 border-emerald-300";
    if (ext === "doc" || ext === "docx" || ext === "txt") return "bg-blue-50 text-blue-800 border-blue-300";
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "bg-purple-50 text-purple-800 border-purple-300";
    return "bg-zinc-50 text-zinc-700 border-zinc-300";
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (ext === "pdf") return <FileText className="w-3.5 h-3.5 text-red-600 shrink-0" />;
    if (ext === "kmz" || ext === "kml") return <FileCode className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
    if (ext === "csv" || ext === "xlsx" || ext === "xls") return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    return <File className="w-3.5 h-3.5 text-zinc-600 shrink-0" />;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Delete an individual generated email from local storage
  const handleDeleteGeneratedEmail = (id: string) => {
    deleteStoredGeneratedEmail(id);
    const updated = refreshStoredEmails();

    // Re-check auto-version recommendation
    const rec = getRecommendedUpdateVersion(roster.technicianName, weekInfo.formattedRange);
    if (rec.count > 0) {
      const nextVer = rec.recommendedVersion;
      setAutoVersionNotice({
        tech: cleanTechnicianName(roster.technicianName),
        count: rec.count,
        suggestedVersion: nextVer,
        recentVersion: rec.mostRecentVersion,
        recentVersionLabel: rec.mostRecentVersionLabel,
      });
      if (onUpdateEmailUpdateDetails) {
        onUpdateEmailUpdateDetails(nextVer, branding.updateNotes || "");
      } else if (onUpdateBranding) {
        onUpdateBranding({ updateVersion: nextVer });
      }
    } else {
      setAutoVersionNotice(null);
    }
  };

  // Clear all generated email history for active technician
  const handleClearTechHistory = (techName: string, workWeek?: string) => {
    clearStoredGeneratedEmailsForTech(techName, workWeek);
    refreshStoredEmails();
    setAutoVersionNotice(null);
  };

  // Filtered list of stored emails for active technician
  const activeTechEmails = useMemo(() => {
    return getGeneratedEmailsForTechAndWeek(roster.technicianName, weekInfo.formattedRange);
  }, [storedEmails, roster.technicianName, weekInfo.formattedRange]);

  const handleUpdateVersionChange = (val: string) => {
    const num = parseInt(val, 10);
    const newVersion = isNaN(num) || num < 1 ? 1 : num;
    if (onUpdateEmailUpdateDetails) {
      onUpdateEmailUpdateDetails(newVersion, branding.updateNotes || "");
    } else if (onUpdateBranding) {
      onUpdateBranding({ updateVersion: newVersion });
    }

    if (branding.emailUpdatesEnabled && branding.manualPriorVersionsEnabled) {
      const currentList = branding.previousUpdateNotes || [];
      // If user had no manual slots, or has version > 1 and list is empty, initialize slots
      if (currentList.length === 0 && newVersion > 1) {
        const slots: Array<{ version: number | string; notes: string; text?: string }> = [];
        for (let v = newVersion - 1; v >= 1; v--) {
          slots.push({ version: v, notes: "" });
        }
        if (onUpdateManualPriorVersions) {
          onUpdateManualPriorVersions(slots);
        } else if (onUpdateBranding) {
          onUpdateBranding({ previousUpdateNotes: slots });
        }
      }
    }
  };

  const handleUpdateNotesChange = (val: string) => {
    if (onUpdateEmailUpdateDetails) {
      onUpdateEmailUpdateDetails(branding.updateVersion || 1, val);
    } else if (onUpdateBranding) {
      onUpdateBranding({ updateNotes: val });
    }
  };

  const handleSetPresetNote = (preset: string) => {
    handleUpdateNotesChange(preset);
  };

  const handleAddAdditionalNote = () => {
    if (!noteInputText.trim()) return;
    const formatted = formatNoteTextWithPrefix(noteInputText);
    const newNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      day: selectedNoteDay,
      text: formatted,
    };
    const updated = [...(branding.additionalNotes || []), newNote];
    if (onUpdateAdditionalNotes) {
      onUpdateAdditionalNotes(updated);
    } else if (onUpdateBranding) {
      onUpdateBranding({ additionalNotes: updated });
    }
    setNoteInputText("");
    setPresetFeedback(`Added note to ${getDayDisplayName(selectedNoteDay)}`);
    setTimeout(() => setPresetFeedback(null), 3000);
  };

  const handleQuickAddPresetToDay = (presetText: string) => {
    const formatted = formatNoteTextWithPrefix(presetText);
    const newNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      day: selectedNoteDay,
      text: formatted,
    };
    const updated = [...(branding.additionalNotes || []), newNote];
    if (onUpdateAdditionalNotes) {
      onUpdateAdditionalNotes(updated);
    } else if (onUpdateBranding) {
      onUpdateBranding({ additionalNotes: updated });
    }
    setPresetFeedback(`Added "${formatted.slice(0, 35)}..." to ${getDayDisplayName(selectedNoteDay)}`);
    setTimeout(() => setPresetFeedback(null), 3000);
  };

  const handleOpenSavePresetModal = () => {
    if (!noteInputText.trim()) return;
    const clean = formatNoteTextWithPrefix(noteInputText).replace(/^Note:\s*/i, "").trim();
    const defaultTitle = clean.length > 28 ? clean.substring(0, 28) + "..." : clean;
    setNewPresetTitle(defaultTitle);
    setShowSavePresetModal(true);
  };

  const handleConfirmSavePreset = () => {
    if (!noteInputText.trim()) return;
    const title = newPresetTitle.trim() || "Custom Note Preset";
    const formatted = formatNoteTextWithPrefix(noteInputText);
    const newPreset: NotePreset = {
      id: `custom-preset-${Date.now()}`,
      title,
      text: formatted,
      isBuiltIn: false,
    };
    const updated = [newPreset, ...customPresets];
    saveCustomPresetsToStorage(updated);
    setShowSavePresetModal(false);
    setNewPresetTitle("");
    setPresetFeedback(`Saved preset "${title}" locally!`);
    setTimeout(() => setPresetFeedback(null), 3500);
  };

  const handleDeleteCustomPreset = (presetId: string, title: string) => {
    const updated = customPresets.filter((p) => p.id !== presetId);
    saveCustomPresetsToStorage(updated);
    // Also remove from multi-selection if present
    setMultiSelectPresetIds((prev) => prev.filter((id) => id !== presetId));
    setPresetFeedback(`Removed preset "${title}"`);
    setTimeout(() => setPresetFeedback(null), 2500);
  };

  const handleRemoveAdditionalNote = (id: string) => {
    const updated = (branding.additionalNotes || []).filter((n) => n.id !== id);
    if (onUpdateAdditionalNotes) {
      onUpdateAdditionalNotes(updated);
    } else if (onUpdateBranding) {
      onUpdateBranding({ additionalNotes: updated });
    }
  };

  const handleClearAllAdditionalNotes = () => {
    if (onUpdateAdditionalNotes) {
      onUpdateAdditionalNotes([]);
    } else if (onUpdateBranding) {
      onUpdateBranding({ additionalNotes: [] });
    }
    setPresetFeedback("Cleared all active notes for this email");
    setTimeout(() => setPresetFeedback(null), 2500);
  };

  // --- Multi-Select Presets Handlers ---
  const handleOpenMultiSelectModal = () => {
    // Initialize day map for all presets if empty
    const initialMap: Record<string, string> = { ...multiSelectDayMap };
    allPresets.forEach((p) => {
      if (!initialMap[p.id]) {
        initialMap[p.id] = selectedNoteDay || "Monday";
      }
    });
    setMultiSelectDayMap(initialMap);
    setShowMultiSelectModal(true);
  };

  const handleTogglePresetSelection = (presetId: string) => {
    setMultiSelectPresetIds((prev) =>
      prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId]
    );
  };

  const handleSelectAllPresets = () => {
    const allIds = allPresets.map((p) => p.id);
    setMultiSelectPresetIds(allIds);
  };

  const handleDeselectAllPresets = () => {
    setMultiSelectPresetIds([]);
  };

  const handleSetPresetDay = (presetId: string, day: string) => {
    setMultiSelectDayMap((prev) => ({
      ...prev,
      [presetId]: day,
    }));
  };

  const handleApplyBulkDayToSelected = () => {
    if (multiSelectPresetIds.length === 0) return;
    setMultiSelectDayMap((prev) => {
      const updated = { ...prev };
      multiSelectPresetIds.forEach((id) => {
        updated[id] = multiSelectBulkDay;
      });
      return updated;
    });
    setPresetFeedback(`Set ${multiSelectPresetIds.length} selected note(s) to ${getDayDisplayName(multiSelectBulkDay)}`);
    setTimeout(() => setPresetFeedback(null), 3000);
  };

  const handleAddMultiSelectedPresetsToSchedule = () => {
    if (multiSelectPresetIds.length === 0) return;

    const notesToAdd = multiSelectPresetIds
      .map((presetId) => {
        const preset = allPresets.find((p) => p.id === presetId);
        if (!preset) return null;
        const targetDay = multiSelectDayMap[presetId] || selectedNoteDay || "Sunday";
        return {
          id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          day: targetDay,
          text: formatNoteTextWithPrefix(preset.text),
        };
      })
      .filter(Boolean) as Array<{ id: string; day: string; text: string }>;

    const updated = [...(branding.additionalNotes || []), ...notesToAdd];
    if (onUpdateAdditionalNotes) {
      onUpdateAdditionalNotes(updated);
    } else if (onUpdateBranding) {
      onUpdateBranding({ additionalNotes: updated });
    }

    setShowMultiSelectModal(false);
    setPresetFeedback(
      `Added ${notesToAdd.length} preset notes across assigned days to schedule!`
    );
    setTimeout(() => setPresetFeedback(null), 4000);
  };

  // --- Export & Dispatch Actions with Local Storage Tracking ---
  const handleDownloadEml = () => {
    downloadEmlFile(roster, branding, "exact_nds_template", attachments);
    onRecordDispatch("Outlook EML", "Exported");
    recordGeneratedEmailToStorage("Outlook EML");
  };

  const handleManualMarkGenerated = () => {
    recordGeneratedEmailToStorage("Manual Save");
    setManualSaveSuccess(true);
    setTimeout(() => setManualSaveSuccess(false), 2500);
  };

  const handleCopyEmailBody = async () => {
    try {
      const blobHtml = new Blob([htmlContent], { type: "text/html" });
      const blobText = new Blob([htmlContent.replace(/<[^>]+>/g, " ").trim()], { type: "text/plain" });
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": blobHtml,
            "text/plain": blobText,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(htmlContent);
      }
      setCopySuccess(true);
      onRecordDispatch("Copy HTML", "Copied");
      recordGeneratedEmailToStorage("Clipboard");
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      await navigator.clipboard.writeText(htmlContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  return (
    <div
      className={`rounded-2xl shadow-xs overflow-hidden flex flex-col transition-colors duration-300 border ${
        isDarkMode
          ? "bg-[#08150D]/90 border-[#00FF41]/40 shadow-[0_0_25px_rgba(0,255,65,0.12)] backdrop-blur-md"
          : activeHolidaySeason === "halloween"
          ? "bg-white/95 border-2 border-orange-300 shadow-lg"
          : activeHolidaySeason === "christmas_eve"
          ? "bg-white/95 border-2 border-amber-300 shadow-lg"
          : activeHolidaySeason === "christmas"
          ? "bg-white/95 border-2 border-emerald-300 shadow-lg"
          : activeHolidaySeason === "new_year"
          ? "bg-white/95 border-2 border-amber-300 shadow-lg"
          : "bg-white border-2 border-[#CFE0B8]"
      }`}
    >
      {/* Minimalist Graphic Header Banner */}
      <div
        className={`relative w-full overflow-hidden border-b transition-colors duration-300 ${
          isDarkMode
            ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
            : activeHolidaySeason === "halloween"
            ? "bg-[#2A130A] border-orange-400/40 text-white"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-[#0F1E36] border-amber-300/40 text-white"
            : activeHolidaySeason === "christmas"
            ? "bg-[#143E23] border-red-400/40 text-white"
            : activeHolidaySeason === "new_year"
            ? "bg-[#1E1B4B] border-yellow-300/40 text-white"
            : "bg-[#3F4A33] border-[#CFE0B8]/30 text-white"
        }`}
      >
        {/* Subtle Background Banner Image with gentle ambient gradient overlays */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={generatorMinimalBanner}
            alt="Outlook Generator Banner"
            className={`w-full h-full object-cover object-center ${
              isDarkMode
                ? "opacity-20 mix-blend-screen filter saturate-200 hue-rotate-90"
                : "opacity-30 mix-blend-luminosity"
            }`}
          />
          <div
            className={`absolute inset-0 ${
              isDarkMode
                ? "bg-gradient-to-r from-[#040906] via-[#040906]/90 to-[#040906]/60"
                : "bg-gradient-to-r from-[#3F4A33] via-[#3F4A33]/90 to-[#3F4A33]/50"
            }`}
          />
          <div
            className={`absolute inset-0 ${
              isDarkMode
                ? "bg-gradient-to-t from-[#040906] via-transparent to-transparent"
                : "bg-gradient-to-t from-[#3F4A33] via-transparent to-transparent"
            }`}
          />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-10 h-10 rounded-xl backdrop-blur-md flex items-center justify-center shrink-0 shadow-xs border ${
                isDarkMode
                  ? "bg-[#00FF41]/10 border-[#00FF41]/40 shadow-[0_0_12px_rgba(0,255,65,0.3)]"
                  : "bg-white/10 border-[#CFE0B8]/40"
              }`}
            >
              <Mail className={`w-5 h-5 ${isDarkMode ? "text-[#00FF41]" : "text-[#CFE0B8]"}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border backdrop-blur-xs ${
                    isDarkMode
                      ? "text-[#00FF41] bg-[#00FF41]/15 border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.25)]"
                      : "text-[#CFE0B8] bg-black/25 border-white/15"
                  }`}
                >
                  Email Generator Engine
                </span>
                {activeTechEmails.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowHistoryModal(true)}
                    className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] inline-flex items-center space-x-1 transition cursor-pointer border shadow-2xs ${
                      isDarkMode
                        ? "bg-[#00FF41]/15 hover:bg-[#00FF41]/25 text-[#E0FFE5] hover:text-[#00FF41] border-[#00FF41]/40 font-mono"
                        : "bg-white/15 hover:bg-white/25 text-[#FAF4E6] hover:text-white border-[#CFE0B8]/50"
                    }`}
                    title="View locally stored email versions for this technician"
                  >
                    <History className={`w-2.5 h-2.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#CFE0B8]"}`} />
                    <span>{activeTechEmails.length} Email(s) Saved</span>
                  </button>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight mt-0.5">
                Outlook Email Template Generator — {cleanTechnicianName(roster.technicianName)}
              </h2>
              <p className={`text-xs ${isDarkMode ? "text-[#D2FAD7]" : "text-[#FAF4E6]/85"}`}>
                Recipient: <span className="text-white font-semibold">{roster.technicianEmail}</span> •{" "}
                <span className={`font-bold ${isDarkMode ? "text-[#00FF41] font-mono" : "text-[#CFE0B8]"}`}>
                  {roster.orders.length} work order stop{roster.orders.length === 1 ? "" : "s"}
                </span>{" "}
                mapped
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border backdrop-blur-xs text-[11px] font-semibold ${
                isDarkMode
                  ? "bg-[#08150D]/90 border-[#00FF41]/40 text-[#00FF41] font-mono shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                  : "bg-black/25 border-white/15 text-[#FAF4E6]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${isDarkMode ? "bg-[#00FF41] shadow-[0_0_6px_#00FF41]" : "bg-[#CFE0B8]"}`} />
              <span>Production HTML &amp; EML Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Preview Controls Bar */}
      <div
        className={`p-3 sm:p-4 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs backdrop-blur-xs transition-colors duration-300 ${
          isDarkMode
            ? "bg-[#040906]/95 border-[#00FF41]/30 text-[#D2FAD7] shadow-[0_4px_20px_rgba(0,255,65,0.12)]"
            : activeHolidaySeason === "halloween"
            ? "bg-[#381A0E]/95 border-orange-400/30 text-white shadow-xs"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-[#14233D]/95 border-amber-300/30 text-white shadow-xs"
            : activeHolidaySeason === "christmas"
            ? "bg-[#164728]/95 border-red-400/30 text-white shadow-xs"
            : activeHolidaySeason === "new_year"
            ? "bg-[#26225E]/95 border-yellow-300/30 text-white shadow-xs"
            : "bg-[#3F4A33]/95 border-[#CFE0B8]/30 text-white"
        }`}
      >
        {/* Top Controls: Additional Notes, Sunday-Sunday, Email Updates, Anytime, LADOTD & View Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Additional Notes Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextVal = !branding.additionalNotesEnabled;
              if (onToggleAdditionalNotes) {
                onToggleAdditionalNotes(nextVal);
              } else if (onUpdateBranding) {
                onUpdateBranding({ additionalNotesEnabled: nextVal });
              }
            }}
            className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 shadow-2xs ${
              branding.additionalNotesEnabled
                ? "bg-[#FFFF00] text-black border-yellow-400 font-extrabold shadow-xs ring-1 ring-yellow-400/50"
                : getToolbarButtonInactiveClass()
            }`}
            title="When toggled ON: Add custom notes under specific days styled in green, bold, and italic text."
          >
            <span>Additional Notes</span>
            <span
              className={`w-2 h-2 rounded-full transition ${
                branding.additionalNotesEnabled
                  ? "bg-black animate-pulse"
                  : isDarkMode
                  ? "bg-[#00FF41]/50"
                  : "bg-white/40"
              }`}
            />
          </button>

          {/* Sunday - Sunday Email Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextVal = !branding.sundaySundayEnabled;
              if (onToggleSundaySunday) {
                onToggleSundaySunday(nextVal);
              } else if (onUpdateBranding) {
                onUpdateBranding({ sundaySundayEnabled: nextVal });
              }
            }}
            className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 shadow-2xs ${
              branding.sundaySundayEnabled
                ? "bg-[#FFFF00] text-black border-yellow-400 font-extrabold shadow-xs ring-1 ring-yellow-400/50"
                : getToolbarButtonInactiveClass()
            }`}
            title="When toggled ON: Adds another Sunday after Saturday, displaying dates for both Upper and Lower Sunday."
          >
            <span>Sunday - Sunday</span>
            <span
              className={`w-2 h-2 rounded-full transition ${
                branding.sundaySundayEnabled
                  ? "bg-black animate-pulse"
                  : isDarkMode
                  ? "bg-[#00FF41]/50"
                  : "bg-white/40"
              }`}
            />
          </button>

          {/* Overlapping Schedule Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextVal = !branding.overlappingSchedulesEnabled;
              if (onToggleOverlappingSchedules) {
                onToggleOverlappingSchedules(nextVal);
              } else if (onUpdateBranding) {
                onUpdateBranding({ overlappingSchedulesEnabled: nextVal });
              }
            }}
            className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 shadow-2xs ${
              branding.overlappingSchedulesEnabled
                ? "bg-[#FFFF00] text-black border-yellow-400 font-extrabold shadow-xs ring-1 ring-yellow-400/50"
                : getToolbarButtonInactiveClass()
            }`}
            title="When toggled ON: Reads overlapping Battery Swaps, Teardowns, and carryover tasks from last week and combines them into the current week's schedule."
          >
            <span>Overlapping Schedule</span>
            <span
              className={`w-2 h-2 rounded-full transition ${
                branding.overlappingSchedulesEnabled
                  ? "bg-black animate-pulse"
                  : isDarkMode
                  ? "bg-[#00FF41]/50"
                  : "bg-white/40"
              }`}
            />
          </button>

          {/* Conduct Study Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextVal = !branding.conductStudyEnabled;
              if (onToggleConductStudy) {
                onToggleConductStudy(nextVal);
              } else if (onUpdateBranding) {
                onUpdateBranding({ conductStudyEnabled: nextVal });
              }
            }}
            className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 shadow-2xs ${
              branding.conductStudyEnabled
                ? "bg-[#FFFF00] text-black border-yellow-400 font-extrabold shadow-xs ring-1 ring-yellow-400/50"
                : getToolbarButtonInactiveClass()
            }`}
            title="When toggled ON: Formats Parking and Radar studies as 'Conduct <Study>: <Project Number> <City, State> (<Time Duration>)' and enables PEDS Conduct Sight Distance lines."
          >
            <span>Conduct Study</span>
            <span
              className={`w-2 h-2 rounded-full transition ${
                branding.conductStudyEnabled
                  ? "bg-black animate-pulse"
                  : isDarkMode
                  ? "bg-[#00FF41]/50"
                  : "bg-white/40"
              }`}
            />
          </button>

          {/* Email Updates Toggle */}
          <button
            type="button"
            onClick={() => handleToggleEmailUpdates(!branding.emailUpdatesEnabled)}
            className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 shadow-2xs ${
              branding.emailUpdatesEnabled
                ? "bg-[#FFFF00] text-black border-yellow-400 font-extrabold shadow-xs ring-1 ring-yellow-400/50"
                : getToolbarButtonInactiveClass()
            }`}
            title="When toggled ON: Adds 'UPDATE v<version>' to the email subject line and inserts a highlighted yellow banner in the greeting."
          >
            <span>Email Updates</span>
            <span
              className={`w-2 h-2 rounded-full transition ${
                branding.emailUpdatesEnabled
                  ? "bg-black animate-pulse"
                  : isDarkMode
                  ? "bg-[#00FF41]/50"
                  : "bg-white/40"
              }`}
            />
          </button>

          {/* Input Prior Versions Toggle (Available when Email Updates is toggled ON) */}
          {branding.emailUpdatesEnabled && (
            <button
              type="button"
              onClick={() => handleToggleManualPriorVersions(!branding.manualPriorVersionsEnabled)}
              className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 shadow-2xs ${
                branding.manualPriorVersionsEnabled
                  ? "bg-[#FFFF00] text-black border-yellow-400 font-extrabold shadow-xs ring-1 ring-yellow-400/50"
                  : getToolbarButtonInactiveClass()
              }`}
              title="When toggled ON: Allows you to manually input notes for prior email versions (e.g. for v3, input notes for v2 and v1) that stack underneath the active update banner."
            >
              <span>Input Prior Versions</span>
              <span
                className={`w-2 h-2 rounded-full transition ${
                  branding.manualPriorVersionsEnabled
                    ? "bg-black animate-pulse"
                    : isDarkMode
                    ? "bg-[#00FF41]/50"
                    : "bg-white/40"
                }`}
              />
            </button>
          )}

          {onToggleAnytime && (
            <button
              type="button"
              onClick={() => onToggleAnytime(!branding.useAnytimeTeardowns)}
              className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 shadow-2xs ${
                branding.useAnytimeTeardowns
                  ? "bg-[#FFFF00] text-black border-yellow-400 font-extrabold shadow-xs ring-1 ring-yellow-400/50"
                  : getToolbarButtonInactiveClass()
              }`}
              title="When toggled ON: Teardowns with 0:30 time appear on their exact Teardown After date with 'Anytime'."
            >
              <span>Anytime</span>
              <span
                className={`w-2 h-2 rounded-full transition ${
                  branding.useAnytimeTeardowns
                    ? "bg-black animate-pulse"
                    : isDarkMode
                    ? "bg-[#00FF41]/50"
                    : "bg-white/40"
                }`}
              />
            </button>
          )}

          {onToggleLadotd && (
            <button
              type="button"
              onClick={() => onToggleLadotd(!branding.ladotdExclusive)}
              className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 shadow-2xs ${
                branding.ladotdExclusive
                  ? "bg-[#FFFF00] text-black border-yellow-400 font-extrabold shadow-xs ring-1 ring-yellow-400/50"
                  : getToolbarButtonInactiveClass()
              }`}
              title="When toggled ON: Formats project 26-240026 with LADOTD specifications."
            >
              <span>LADOTD Exclusive</span>
              <span
                className={`w-2 h-2 rounded-full transition ${
                  branding.ladotdExclusive
                    ? "bg-black animate-pulse"
                    : isDarkMode
                    ? "bg-[#00FF41]/50"
                    : "bg-white/40"
                }`}
              />
            </button>
          )}

          {/* COD Exclusive Toggle */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => {
                const nextVal = !branding.codExclusive;
                if (onToggleCodExclusive) {
                  onToggleCodExclusive(nextVal);
                } else if (onUpdateBranding) {
                  onUpdateBranding({ codExclusive: nextVal });
                }
                if (nextVal) {
                  setShowCodSightDistanceModal(true);
                }
              }}
              className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 shadow-2xs ${
                branding.codExclusive
                  ? "bg-[#FFFF00] text-black border-yellow-400 font-extrabold shadow-xs ring-1 ring-yellow-400/50"
                  : getToolbarButtonInactiveClass()
              }`}
              title="When toggled ON: Scans Scheduling Team Notes for '(City of Dallas – List ...)' and places this into the main task line instead of <City, State>, sequences COD teardowns together, and prompts for picking locations for Conduct Sight Distance."
            >
              <span>COD Exclusive</span>
              <span
                className={`w-2 h-2 rounded-full transition ${
                  branding.codExclusive
                    ? "bg-black animate-pulse"
                    : isDarkMode
                    ? "bg-[#00FF41]/50"
                    : "bg-white/40"
                }`}
              />
            </button>

            {branding.codExclusive && (
              <button
                type="button"
                onClick={() => setShowCodSightDistanceModal(true)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 ${
                  isDarkMode
                    ? "bg-[#0C1E12] text-amber-300 border-amber-400/60 hover:bg-amber-400/15"
                    : "bg-transparent hover:bg-amber-400/15 text-amber-300 border border-amber-400/60"
                }`}
                title="Open Location Picker for Conduct Sight Distance line"
              >
                <Footprints className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  Sight Distance
                  {Object.values(branding.codSightDistanceLocations || {}).reduce<number>(
                    (acc: number, arr: string[] | undefined) => acc + (arr ? arr.length : 0),
                    0
                  ) > 0 && (
                    <span className="ml-1 bg-amber-400 text-zinc-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                      {Object.values(branding.codSightDistanceLocations || {}).reduce<number>(
                        (acc: number, arr: string[] | undefined) => acc + (arr ? arr.length : 0),
                        0
                      )}
                    </span>
                  )}
                </span>
              </button>
            )}
          </div>

          {/* Email Signature Toggle Feature & Presets (James, Kyle, Patrick, Katrin) */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => {
                const nextVal = !branding.emailSignatureEnabled;
                if (onToggleEmailSignature) {
                  onToggleEmailSignature(nextVal);
                } else if (onUpdateBranding) {
                  onUpdateBranding({ emailSignatureEnabled: nextVal });
                }
              }}
              className={`group flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 shadow-2xs ${
                branding.emailSignatureEnabled
                  ? "bg-[#FFFF00] text-black border-yellow-400 font-extrabold shadow-xs ring-1 ring-yellow-400/50"
                  : getToolbarButtonInactiveClass()
              }`}
              title="When toggled ON: Appends the selected email signature (James, Kyle, Patrick, Katrin) to the bottom of the email."
            >
              <FileSignature
                className={`w-3.5 h-3.5 ${
                  branding.emailSignatureEnabled
                    ? "text-black"
                    : isDarkMode
                    ? "text-[#00FF41]"
                    : "text-[#FAF4E6]"
                }`}
              />
              <span>Email Signature</span>
              <span
                className={`w-2 h-2 rounded-full transition ${
                  branding.emailSignatureEnabled
                    ? "bg-black animate-pulse"
                    : isDarkMode
                    ? "bg-[#00FF41]/50"
                    : "bg-white/40"
                }`}
              />
            </button>

            {/* Signature Presets Picker Pills */}
            <div
              className={`flex items-center p-0.5 rounded-xl border backdrop-blur-xs ${
                isDarkMode ? "bg-[#08150D] border-[#00FF41]/30" : "bg-black/20 border-[#CFE0B8]/40"
              }`}
            >
              {(["patrick", "james", "kyle", "katrin"] as const).map((presetKey) => {
                const isSelected = (branding.emailSignaturePreset || "patrick") === presetKey;
                const presetInfo = EMAIL_SIGNATURE_PRESETS[presetKey];
                return (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => {
                      if (onSelectEmailSignaturePreset) {
                        onSelectEmailSignaturePreset(presetKey);
                      } else if (onUpdateBranding) {
                        onUpdateBranding({
                          emailSignaturePreset: presetKey,
                          emailSignatureEnabled: true,
                        });
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 ${
                      isSelected && branding.emailSignatureEnabled
                        ? "bg-amber-400/25 border border-amber-400 text-amber-300 font-bold shadow-xs"
                        : isSelected
                        ? isDarkMode
                          ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 font-bold"
                          : "bg-white/20 text-[#FAF4E6] font-bold"
                        : isDarkMode
                        ? "text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/15"
                        : "text-[#FAF4E6] hover:text-white hover:bg-white/15"
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
                className={`px-1.5 py-1 rounded-lg transition-all duration-200 cursor-pointer transform hover:scale-110 ${
                  isDarkMode
                    ? "text-[#00FF41] hover:text-white hover:bg-[#00FF41]/20"
                    : "text-[#CFE0B8] hover:text-white hover:bg-white/10"
                }`}
                title="Open Email Signature Settings & Live Preview"
              >
                <Eye className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div
            className={`flex items-center space-x-1 p-1 rounded-xl border shadow-inner backdrop-blur-xs ${
              isDarkMode ? "bg-[#08150D] border-[#00FF41]/30" : "bg-black/20 border-[#CFE0B8]/40"
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode("desktop")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 ${
                viewMode === "desktop"
                  ? isDarkMode
                    ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/50 font-bold shadow-[0_0_8px_rgba(0,255,65,0.25)]"
                    : "bg-white/25 text-[#FAF4E6] border border-[#CFE0B8]/80 font-bold shadow-xs"
                  : isDarkMode
                  ? "text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/15"
                  : "text-[#FAF4E6] hover:text-white hover:bg-white/15"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop Outlook</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("mobile")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 ${
                viewMode === "mobile"
                  ? isDarkMode
                    ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/50 font-bold shadow-[0_0_8px_rgba(0,255,65,0.25)]"
                    : "bg-white/25 text-[#FAF4E6] border border-[#CFE0B8]/80 font-bold shadow-xs"
                  : isDarkMode
                  ? "text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/15"
                  : "text-[#FAF4E6] hover:text-white hover:bg-white/15"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Version Detection Banner (If emails were previously generated for this tech and work week) */}
      {autoVersionNotice && (
        <div
          className={`border-b px-4 py-2.5 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs transition-colors duration-200 animate-in fade-in ${
            isDarkMode
              ? "bg-[#0C1E12] border-[#00FF41]/40 text-[#E0FFE5]"
              : "bg-yellow-100/90 border-yellow-300 text-yellow-950"
          }`}
        >
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center justify-center p-1 rounded-md font-black ${
                isDarkMode ? "bg-[#00FF41] text-[#040906] shadow-[0_0_8px_#00FF41]" : "bg-yellow-400 text-zinc-950"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="font-bold">Auto-Version Active:</span> Found{" "}
              <strong>{autoVersionNotice.count}</strong> previous saved email(s) for{" "}
              <strong>{autoVersionNotice.tech}</strong> ({weekInfo.formattedRange}). Following recent saved history (tagged{" "}
              <strong>{autoVersionNotice.recentVersionLabel || `v${autoVersionNotice.recentVersion ?? 0}`}</strong>), automatically set to{" "}
              <span
                className={`px-1.5 py-0.5 rounded font-black border ${
                  isDarkMode
                    ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41] font-mono shadow-[0_0_8px_rgba(0,255,65,0.3)]"
                    : "bg-yellow-300 text-yellow-950 border-yellow-400"
                }`}
              >
                UPDATE v{branding.updateVersion || autoVersionNotice.suggestedVersion}
              </span>
              . <span className={`italic ${isDarkMode ? "text-[#D2FAD7]/80" : "text-yellow-800"}`}>(You can modify or override this anytime)</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className={`font-bold border px-2.5 py-1 rounded-md transition cursor-pointer flex items-center space-x-1 text-[11px] shadow-2xs ${
                isDarkMode
                  ? "bg-[#08150D] text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/20 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                  : "bg-white text-zinc-900 border-yellow-400 hover:bg-yellow-50"
              }`}
            >
              <History className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-yellow-700"}`} />
              <span>View History ({autoVersionNotice.count})</span>
            </button>
            <button
              type="button"
              onClick={() => setAutoVersionNotice(null)}
              className={`p-1 cursor-pointer transition ${
                isDarkMode ? "text-[#D2FAD7] hover:text-[#00FF41]" : "text-yellow-700 hover:text-yellow-950"
              }`}
              title="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Expanded Additional Notes Control Panel (Active when Additional Notes toggle is ON) */}
      {branding.additionalNotesEnabled && (
        <div
          className={`border-b px-4 py-3 sm:px-6 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150 transition-colors ${
            isDarkMode
              ? "bg-[#0C1E12] border-[#00FF41]/40 text-[#D2FAD7]"
              : "bg-emerald-50/90 border-emerald-200 text-emerald-950"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center justify-center p-1 rounded-md shadow-xs ${
                  isDarkMode
                    ? "bg-[#00FF41] text-[#040906] shadow-[0_0_8px_#00FF41]"
                    : "bg-emerald-500 text-white"
                }`}
              >
                <StickyNote className="w-3.5 h-3.5" />
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wide ${
                  isDarkMode ? "text-[#00FF41]" : "text-emerald-950"
                }`}
              >
                Additional Notes Configuration
              </span>
              <span
                className={`text-[11px] hidden md:inline font-medium ${
                  isDarkMode ? "text-[#D2FAD7]" : "text-emerald-800"
                }`}
              >
                (Notes render between Day heading &amp; task lines with <span className="bg-[#FFFF00] text-black font-bold italic px-1.5 py-0.5 rounded shadow-2xs">yellow (TMC, SPEED)</span> or <span className="bg-[#00FF00] text-black font-bold italic px-1.5 py-0.5 rounded shadow-2xs">green</span> highlight)
              </span>
            </div>

            {/* Multi-Select & Presets Action Bar */}
            <div className="flex items-center space-x-2 text-[11px]">
              <button
                type="button"
                onClick={handleOpenMultiSelectModal}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold shadow-xs transition cursor-pointer ${
                  isDarkMode
                    ? "bg-[#00FF41] hover:bg-[#39FF14] text-[#040906] font-mono shadow-[0_0_10px_#00FF41]"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
                title="Select multiple saved presets and choose a specific day for each"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Multi-Select Presets</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isDarkMode ? "bg-[#040906] text-[#00FF41]" : "bg-emerald-800 text-white"
                  }`}
                >
                  {allPresets.length}
                </span>
              </button>

              <span
                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg font-semibold border ${
                  isDarkMode
                    ? "bg-[#08150D] text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "bg-emerald-100 text-emerald-900 border-emerald-300"
                }`}
              >
                <Bookmark className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-700"}`} />
                <span>{customPresets.length} Custom ({allPresets.length} Total)</span>
              </span>
            </div>
          </div>

          {/* Auto-Detected Rules Banner */}
          {autoDetectedNotes.length > 0 && (
            <div
              className={`rounded-lg p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-2xs border ${
                isDarkMode
                  ? "bg-[#08150D] border-[#00FF41]/40 text-[#E0FFE5]"
                  : "bg-emerald-100/90 border-emerald-300 text-emerald-950"
              }`}
            >
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <Sparkles className={`w-4 h-4 shrink-0 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-700"}`} />
                <span className={`font-bold ${isDarkMode ? "text-[#00FF41]" : "text-emerald-950"}`}>
                  Auto-Detected Rules for this Technician ({autoDetectedNotes.length}):
                </span>
                {autoDetectedNotes.map((an) => (
                  <span
                    key={an.id}
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] shadow-2xs ${
                      an.rule === "speed_teardown"
                        ? isDarkMode
                          ? "bg-[#0C1E12] text-[#00FF41] border border-[#00FF41]/40"
                          : "bg-white text-emerald-900 border border-emerald-300"
                        : "bg-[#FFFF00] text-black border border-yellow-400 font-bold italic"
                    }`}
                  >
                    {an.rule === "speed_install" && `⚡ SPEED Install (${getDayDisplayName(an.day)})`}
                    {an.rule === "speed_teardown" && `⚡ SPEED Teardown (${getDayDisplayName(an.day)})`}
                    {an.rule === "tmc_install" && `📍 TMC Install (${getDayDisplayName(an.day)})`}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSyncAutoDetectedNotes}
                className={`font-bold px-2.5 py-1 rounded-md text-xs transition cursor-pointer shrink-0 shadow-2xs flex items-center space-x-1 ${
                  isDarkMode
                    ? "bg-[#00FF41] hover:bg-[#39FF14] text-[#040906] font-mono shadow-[0_0_10px_#00FF41]"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white"
                }`}
                title="Populate auto-detected notes into active saved list"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Sync Auto Notes</span>
              </button>
            </div>
          )}

          {/* Feedback banner */}
          {presetFeedback && (
            <div
              className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg shadow-xs animate-in fade-in duration-150 ${
                isDarkMode
                  ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/50 font-mono shadow-[0_0_10px_rgba(0,255,65,0.25)]"
                  : "bg-emerald-600 text-white"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Check className="w-3.5 h-3.5" />
                <span className="font-semibold">{presetFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setPresetFeedback(null)}
                className={`cursor-pointer ${isDarkMode ? "text-[#00FF41] hover:text-white" : "text-emerald-100 hover:text-white"}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Saved Presets Ribbon / Selector */}
          <div
            className={`rounded-lg p-2.5 space-y-2 border ${
              isDarkMode
                ? "bg-[#040906] border-[#00FF41]/30 text-[#E0FFE5]"
                : "bg-white/80 border-emerald-200 text-emerald-950"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center space-x-1.5 text-xs font-bold ${
                  isDarkMode ? "text-[#00FF41]" : "text-emerald-950"
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-600"}`} />
                <span>Quick Presets:</span>
                <span
                  className={`text-[11px] font-normal hidden sm:inline ${
                    isDarkMode ? "text-[#D2FAD7]/80" : "text-emerald-700"
                  }`}
                >
                  Click title to load into input, or click <strong>+ Add to {getDayDisplayName(selectedNoteDay).slice(0, 3)}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleOpenMultiSelectModal}
                className={`text-xs font-bold underline flex items-center space-x-1 cursor-pointer ${
                  isDarkMode ? "text-[#00FF41] hover:text-white font-mono" : "text-emerald-700 hover:text-emerald-900"
                }`}
              >
                <CheckSquare className="w-3 h-3" />
                <span>Multi-Select Mode</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {allPresets.map((preset) => (
                <div
                  key={preset.id}
                  className={`inline-flex items-center rounded-lg border text-xs shadow-2xs transition group ${
                    preset.isBuiltIn
                      ? isDarkMode
                        ? "bg-[#0C1E12] border-[#00FF41]/40 text-[#E0FFE5]"
                        : "bg-emerald-50/70 border-emerald-300 text-zinc-800"
                      : isDarkMode
                      ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                      : "bg-amber-50/90 border-amber-300 text-amber-950"
                  }`}
                  title={preset.text}
                >
                  <button
                    type="button"
                    onClick={() => setNoteInputText(preset.text)}
                    className="px-2 py-1 font-medium hover:underline text-left cursor-pointer flex items-center space-x-1"
                  >
                    {!preset.isBuiltIn && (
                      <span
                        className={`text-[9px] font-bold px-1 rounded ${
                          isDarkMode ? "bg-amber-500/30 text-amber-300" : "bg-amber-200 text-amber-900"
                        }`}
                      >
                        Saved
                      </span>
                    )}
                    <span>{preset.title}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAddPresetToDay(preset.text)}
                    className={`px-1.5 py-1 text-[10px] font-bold border-l rounded-r-lg transition cursor-pointer ${
                      isDarkMode
                        ? "text-[#00FF41] hover:text-white hover:bg-[#00FF41]/20 border-[#00FF41]/40 font-mono"
                        : "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-200/50 border-emerald-300/60"
                    }`}
                    title={`Add directly to ${getDayDisplayName(selectedNoteDay)}`}
                  >
                    + {getDayDisplayName(selectedNoteDay).slice(0, 3)}
                  </button>

                  {!preset.isBuiltIn && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomPreset(preset.id, preset.title)}
                      className={`px-1 py-1 rounded-r-lg transition cursor-pointer border-l ${
                        isDarkMode
                          ? "text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border-amber-500/40"
                          : "text-zinc-400 hover:text-red-600 hover:bg-red-50 border-amber-300/60"
                      }`}
                      title="Delete this saved preset"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form: Select Day + Input Field + Save/Add Button + Save as Preset Button */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Day Dropdown */}
            <div className="sm:col-span-3 lg:col-span-2">
              <label
                className={`block text-[11px] font-bold mb-1 ${
                  isDarkMode ? "text-[#00FF41]" : "text-emerald-950"
                }`}
              >
                Select Day:
              </label>
              <select
                value={selectedNoteDay}
                onChange={(e) => setSelectedNoteDay(e.target.value)}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden focus:ring-2 shadow-2xs cursor-pointer border ${
                  isDarkMode
                    ? "bg-[#08150D] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                    : "bg-white border-emerald-400 text-zinc-900 focus:ring-emerald-500"
                }`}
              >
                {daySelectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Note Text Input */}
            <div className="sm:col-span-6 lg:col-span-6">
              <label
                className={`block text-[11px] font-bold mb-1 ${
                  isDarkMode ? "text-[#00FF41]" : "text-emerald-950"
                }`}
              >
                Note Text:
              </label>
              <textarea
                rows={noteInputText.includes("\n") ? 3 : 1}
                value={noteInputText}
                onChange={(e) => setNoteInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !noteInputText.includes("\n")) {
                    e.preventDefault();
                    handleAddAdditionalNote();
                  }
                }}
                placeholder="e.g. Note: Continue installing locations not finished yesterday until all inventories have been used up."
                className={`w-full rounded-lg px-3 py-1.5 text-xs shadow-2xs resize-y border focus:outline-hidden focus:ring-2 ${
                  isDarkMode
                    ? "bg-[#08150D] border-[#00FF41]/40 text-[#E0FFE5] placeholder:text-[#D2FAD7]/40 focus:ring-[#00FF41]"
                    : "bg-white border-emerald-400 text-zinc-900 placeholder:text-zinc-400 focus:ring-emerald-500"
                }`}
              />
            </div>

            {/* Action Buttons: Add Note & Save As Reusable Preset */}
            <div className="sm:col-span-3 lg:col-span-4 flex items-center space-x-2 sm:self-end">
              <button
                type="button"
                onClick={handleAddAdditionalNote}
                disabled={!noteInputText.trim()}
                className={`flex-1 flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs ${
                  noteInputText.trim()
                    ? isDarkMode
                      ? "bg-[#00FF41] hover:bg-[#39FF14] text-[#040906] font-mono shadow-[0_0_10px_#00FF41]"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : isDarkMode
                    ? "bg-[#08150D] text-[#D2FAD7]/30 border border-[#00FF41]/20 cursor-not-allowed"
                    : "bg-emerald-200 text-emerald-700 cursor-not-allowed"
                }`}
                title="Add note to selected day"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add to {getDayDisplayName(selectedNoteDay).slice(0, 3)}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenSavePresetModal}
                disabled={!noteInputText.trim()}
                className={`flex items-center justify-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border shadow-xs ${
                  noteInputText.trim()
                    ? isDarkMode
                      ? "bg-[#0C1E12] hover:bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                      : "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                    : isDarkMode
                    ? "bg-[#040906] text-[#D2FAD7]/30 border-[#00FF41]/20 cursor-not-allowed"
                    : "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                }`}
                title="Save this note as a reusable preset stored locally"
              >
                <BookmarkPlus className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-amber-700"}`} />
                <span className="hidden sm:inline">Save Preset</span>
              </button>
            </div>
          </div>

          {/* Modal / Popover: Save Preset Name */}
          {showSavePresetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150 backdrop-blur-xs">
              <div
                className={`rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border ${
                  isDarkMode
                    ? "bg-[#08150D] border-[#00FF41]/40 text-[#D2FAD7] shadow-[0_0_30px_rgba(0,255,65,0.25)]"
                    : "bg-white border-zinc-200 text-zinc-900"
                }`}
              >
                <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? "border-[#00FF41]/25" : ""}`}>
                  <div className="flex items-center space-x-2">
                    <BookmarkPlus className={`w-5 h-5 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-600"}`} />
                    <h3 className={`text-sm font-bold ${isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"}`}>
                      Save Note as Reusable Preset
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSavePresetModal(false)}
                    className={`cursor-pointer p-1 transition ${
                      isDarkMode ? "text-[#00FF41] hover:text-white" : "text-zinc-400 hover:text-zinc-700"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className={`block font-bold mb-1 ${isDarkMode ? "text-[#00FF41]" : "text-zinc-800"}`}>
                      Preset Name / Title:
                    </label>
                    <input
                      type="text"
                      value={newPresetTitle}
                      onChange={(e) => setNewPresetTitle(e.target.value)}
                      placeholder="e.g., Unfinished Installs Rollover"
                      className={`w-full rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:outline-hidden border ${
                        isDarkMode
                          ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] placeholder:text-[#D2FAD7]/40 focus:ring-[#00FF41]"
                          : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:ring-emerald-500"
                      }`}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${isDarkMode ? "text-[#00FF41]" : "text-zinc-800"}`}>
                      Note Content:
                    </label>
                    <div
                      className={`p-2.5 rounded-lg font-medium border ${
                        isDarkMode
                          ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
                          : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                      }`}
                    >
                      {noteInputText.includes("See correct Format:") ? (
                        <span>
                          <span className="bg-[#00FF00] text-black font-bold italic px-1.5 py-0.5 rounded-l shadow-2xs">
                            {noteInputText.substring(0, noteInputText.indexOf("See correct Format:")).trim()}
                          </span>{" "}
                          <span className="bg-[#FFFF00] text-black font-bold italic px-1.5 py-0.5 rounded-r shadow-2xs">
                            {noteInputText.substring(noteInputText.indexOf("See correct Format:")).trim()}
                          </span>
                        </span>
                      ) : (
                        <span className={`${isAutomaticSpeedOrTmcNote(noteInputText) ? "bg-[#FFFF00]" : "bg-[#00FF00]"} text-black font-bold italic px-1.5 py-0.5 rounded shadow-2xs`}>
                          {formatNoteTextWithPrefix(noteInputText)}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>
                    This preset will be saved locally in your browser so you can reuse it across all technician emails anytime.
                  </p>
                </div>

                <div className={`flex items-center justify-end space-x-2 pt-2 border-t ${isDarkMode ? "border-[#00FF41]/25" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setShowSavePresetModal(false)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                      isDarkMode
                        ? "border-[#00FF41]/30 text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/10"
                        : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSavePreset}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center space-x-1.5 ${
                      isDarkMode
                        ? "bg-[#00FF41] hover:bg-[#39FF14] text-[#040906] font-mono shadow-[0_0_10px_#00FF41]"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Save Preset</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Saved Notes List */}
          {branding.additionalNotes && branding.additionalNotes.length > 0 && (
            <div className={`pt-1 border-t space-y-1.5 ${isDarkMode ? "border-[#00FF41]/25" : "border-emerald-200/80"}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold ${isDarkMode ? "text-[#00FF41]" : "text-emerald-900"}`}>
                  Active Saved Notes for this Email ({branding.additionalNotes.length}):
                </span>
                <button
                  type="button"
                  onClick={handleClearAllAdditionalNotes}
                  className={`text-[11px] underline font-medium cursor-pointer ${
                    isDarkMode ? "text-rose-400 hover:text-rose-300" : "text-red-600 hover:text-red-800"
                  }`}
                >
                  Clear All Notes
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {branding.additionalNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 shadow-2xs text-xs group border ${
                      isDarkMode
                        ? "bg-[#040906] border-[#00FF41]/35 text-[#E0FFE5]"
                        : "bg-white border-emerald-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0 border ${
                          isDarkMode
                            ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_6px_rgba(0,255,65,0.2)]"
                            : "bg-emerald-100 text-emerald-800 border-transparent"
                        }`}
                      >
                        {getDayDisplayName(note.day)}
                      </span>
                      {isRadarStudyNote(note.text) ? (
                        <span className="text-xs truncate">
                          <span className="bg-[#00FF00] text-black font-bold italic px-1.5 py-0.5 rounded shadow-2xs">
                            NOTE: 100 samples total, or 2hr max per interval (whichever comes first)...
                          </span>
                        </span>
                      ) : note.text.includes("See correct Format:") ? (
                        <span className="text-xs truncate">
                          <span className="bg-[#00FF00] text-black font-bold italic px-1.5 py-0.5 rounded-l shadow-2xs">
                            {note.text.substring(0, note.text.indexOf("See correct Format:")).trim()}
                          </span>{" "}
                          <span className="bg-[#FFFF00] text-black font-bold italic px-1.5 py-0.5 rounded-r shadow-2xs">
                            {note.text.substring(note.text.indexOf("See correct Format:")).trim()}
                          </span>
                        </span>
                      ) : isAutomaticSpeedOrTmcNote(note.text) ? (
                        <span className="text-xs truncate">
                          <span className="bg-[#FFFF00] text-black font-bold italic px-1.5 py-0.5 rounded shadow-2xs">
                            {formatNoteTextWithPrefix(note.text)}
                          </span>
                        </span>
                      ) : (
                        <span className="bg-[#00FF00] text-black font-bold italic px-1.5 py-0.5 rounded text-xs truncate shadow-2xs">
                          {formatNoteTextWithPrefix(note.text)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditionalNote(note.id)}
                      className={`p-1 rounded transition shrink-0 cursor-pointer ${
                        isDarkMode
                          ? "text-[#D2FAD7]/50 hover:text-rose-400 hover:bg-rose-950/40"
                          : "text-zinc-400 hover:text-red-600"
                      }`}
                      title="Remove this note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expanded Email Updates Control Panel (Active when Email Updates toggle is ON) */}
      {branding.emailUpdatesEnabled && (
        <div
          className={`border-b px-4 py-3 sm:px-6 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150 transition-colors ${
            isDarkMode
              ? "bg-[#0C1E12] border-[#00FF41]/40 text-[#D2FAD7]"
              : "bg-yellow-50/90 border-yellow-200 text-yellow-950"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2 flex-wrap">
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-black shadow-xs ${
                  isDarkMode
                    ? "bg-[#00FF41] text-[#040906] font-mono shadow-[0_0_8px_#00FF41]"
                    : "bg-yellow-400 text-zinc-950"
                }`}
              >
                v{branding.updateVersion || 1}
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wide ${
                  isDarkMode ? "text-[#E0FFE5]" : "text-yellow-950"
                }`}
              >
                Email Schedule Update Configuration
              </span>
              <span className={`text-[11px] hidden md:inline ${isDarkMode ? "text-[#D2FAD7]/80" : "text-yellow-800"}`}>
                (Subject gets{" "}
                <code
                  className={`px-1 py-0.5 rounded font-bold ${
                    isDarkMode
                      ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 font-mono"
                      : "bg-yellow-200/80 text-yellow-950"
                  }`}
                >
                  UPDATE v{branding.updateVersion || 1}
                </code>{" "}
                and greeting gets yellow highlighted banner)
              </span>
            </div>

            {/* Quick Presets & History Shortcut */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className={`px-2 py-0.5 rounded border font-bold transition cursor-pointer text-[11px] flex items-center space-x-1 ${
                  isDarkMode
                    ? "bg-[#08150D] border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/20 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "bg-yellow-200/90 hover:bg-yellow-300 text-yellow-950 border-yellow-400"
                }`}
              >
                <History className="w-3 h-3" />
                <span>History ({activeTechEmails.length})</span>
              </button>
              <span className={`font-medium ml-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-yellow-800"}`}>
                Quick Presets:
              </span>
              <button
                type="button"
                onClick={() =>
                  handleSetPresetNote("I added installs in COD List-104 (470268 & 470269) to your Wednesday schedule.")
                }
                className={`px-2 py-0.5 rounded border font-medium transition cursor-pointer text-[11px] ${
                  isDarkMode
                    ? "bg-[#08150D] text-[#D2FAD7] border-[#00FF41]/30 hover:border-[#00FF41] hover:text-[#00FF41]"
                    : "bg-white/80 hover:bg-white text-zinc-800 border-yellow-300"
                }`}
              >
                + Added COD List-104
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSetPresetNote("I added additional locations to your Friday route.")
                }
                className={`px-2 py-0.5 rounded border font-medium transition cursor-pointer text-[11px] ${
                  isDarkMode
                    ? "bg-[#08150D] text-[#D2FAD7] border-[#00FF41]/30 hover:border-[#00FF41] hover:text-[#00FF41]"
                    : "bg-white/80 hover:bg-white text-zinc-800 border-yellow-300"
                }`}
              >
                + Added Friday route
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSetPresetNote("I removed cancelled sites from your Tuesday teardown list.")
                }
                className={`px-2 py-0.5 rounded border font-medium transition cursor-pointer text-[11px] ${
                  isDarkMode
                    ? "bg-[#08150D] text-[#D2FAD7] border-[#00FF41]/30 hover:border-[#00FF41] hover:text-[#00FF41]"
                    : "bg-white/80 hover:bg-white text-zinc-800 border-yellow-300"
                }`}
              >
                + Removed cancelled sites
              </button>
              {branding.updateNotes && (
                <button
                  type="button"
                  onClick={() => handleSetPresetNote("")}
                  className={`underline text-[11px] ml-1 cursor-pointer transition ${
                    isDarkMode ? "text-[#D2FAD7]/60 hover:text-rose-400" : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Version Number Input */}
            <div className="sm:col-span-3 lg:col-span-2">
              <label
                className={`block text-[11px] font-bold mb-1 ${
                  isDarkMode ? "text-[#00FF41]" : "text-zinc-800"
                }`}
              >
                Update Version:
              </label>
              <div className="flex items-center">
                <span
                  className={`border border-r-0 font-bold px-2.5 py-1.5 rounded-l-lg text-xs select-none ${
                    isDarkMode
                      ? "bg-[#08150D] border-[#00FF41]/40 text-[#00FF41] font-mono"
                      : "bg-yellow-200 border-yellow-400 text-yellow-950"
                  }`}
                >
                  v
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={branding.updateVersion || 1}
                  onChange={(e) => handleUpdateVersionChange(e.target.value)}
                  className={`w-full rounded-r-lg px-2.5 py-1.5 text-xs font-bold focus:outline-hidden focus:ring-2 border ${
                    isDarkMode
                      ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41] font-mono"
                      : "bg-white border-yellow-400 text-zinc-900 focus:ring-yellow-500"
                  }`}
                  placeholder="1"
                />
              </div>
            </div>

            {/* Notes Input */}
            <div className="sm:col-span-9 lg:col-span-10">
              <label
                className={`block text-[11px] font-bold mb-1 ${
                  isDarkMode ? "text-[#00FF41]" : "text-zinc-800"
                }`}
              >
                Update Notes{" "}
                <span className={isDarkMode ? "text-[#D2FAD7]/70 font-normal" : "text-zinc-500 font-normal"}>
                  (Prefix "UPDATE v{branding.updateVersion || 1}: Schedule is updated." is automatically added)
                </span>
                :
              </label>
              <input
                type="text"
                value={branding.updateNotes || ""}
                onChange={(e) => handleUpdateNotesChange(e.target.value)}
                placeholder="e.g. I added installs in COD List-104 (470268 & 470269) to your Wednesday schedule."
                className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-hidden focus:ring-2 border ${
                  isDarkMode
                    ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] placeholder:text-[#D2FAD7]/40 focus:ring-[#00FF41]"
                    : "bg-white border-yellow-400 text-zinc-900 focus:ring-yellow-500"
                }`}
              />
            </div>
          </div>

          {/* Live Formatted Note Preview Pill */}
          <div className="pt-1 space-y-1.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
              <span
                className={`text-[11px] font-semibold shrink-0 ${
                  isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"
                }`}
              >
                Active Update Line (Yellow Highlight & Bold):
              </span>
              <div className="bg-[#FFFF00] text-black font-bold px-2 py-0.5 text-xs rounded border border-yellow-400 overflow-x-auto select-all inline-block shadow-2xs">
                UPDATE v{branding.updateVersion || 1}: Schedule is updated.
                {branding.updateNotes?.trim() && (
                  <span>
                    {" "}
                    {branding.updateNotes
                      .split(/\b(added|removed)\b/gi)
                      .map((chunk, i) =>
                        /^(added|removed)$/i.test(chunk) ? (
                          <span key={i} className="text-[#FF0000] font-black">
                            {chunk}
                          </span>
                        ) : (
                          chunk
                        )
                      )}
                  </span>
                )}
              </div>
            </div>

            {/* Prior Versions Configuration Bar */}
            <div
              className={`pt-2 border-t flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs ${
                isDarkMode ? "border-[#00FF41]/25" : "border-yellow-300/80"
              }`}
            >
              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleToggleManualPriorVersions(!branding.manualPriorVersionsEnabled)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-2 border cursor-pointer shadow-2xs ${
                    branding.manualPriorVersionsEnabled
                      ? isDarkMode
                        ? "bg-[#00FF41] text-[#040906] border-[#00FF41] font-mono shadow-[0_0_10px_#00FF41]"
                        : "bg-amber-400 hover:bg-amber-300 text-amber-950 border-amber-500 ring-2 ring-amber-400/30"
                      : isDarkMode
                      ? "bg-[#08150D] hover:bg-[#00FF41]/10 text-[#D2FAD7] border-[#00FF41]/40"
                      : "bg-white hover:bg-amber-50 text-zinc-700 border-yellow-400"
                  }`}
                  title="Toggle manual input of prior email version notes (e.g. for v3, manually specify v2 and v1 notes)."
                >
                  <span>Input Prior Versions</span>
                  <span
                    className={`w-2 h-2 rounded-full transition ${
                      branding.manualPriorVersionsEnabled
                        ? isDarkMode
                          ? "bg-[#040906] animate-pulse"
                          : "bg-amber-950 animate-pulse"
                        : "bg-zinc-400"
                    }`}
                  />
                </button>
                <span className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/80" : "text-yellow-900"}`}>
                  {branding.manualPriorVersionsEnabled ? (
                    <span className={`font-semibold ${isDarkMode ? "text-[#00FF41]" : "text-amber-950"}`}>
                      Manual mode active: input custom notes for prior versions stacked underneath this update.
                    </span>
                  ) : (
                    <span>
                      Stacked notes are automatically read from Saved Email History (if available).
                    </span>
                  )}
                </span>
              </div>

              {branding.manualPriorVersionsEnabled && (
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAddPriorVersionSlot()}
                    className={`border font-bold px-2 py-1 rounded text-[11px] transition cursor-pointer shadow-2xs flex items-center space-x-1 ${
                      isDarkMode
                        ? "bg-[#08150D] text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/20 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                        : "bg-white hover:bg-amber-100 text-amber-950 border-amber-400"
                    }`}
                    title="Add another prior version note slot"
                  >
                    <Plus className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-amber-700"}`} />
                    <span>Add Prior Version</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoFillPriorSlots}
                    className={`border font-bold px-2 py-1 rounded text-[11px] transition cursor-pointer shadow-2xs ${
                      isDarkMode
                        ? "bg-[#08150D] text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/20 font-mono"
                        : "bg-white hover:bg-amber-100 text-amber-950 border-amber-400"
                    }`}
                    title="Auto-fill slots for all prior versions (from current version - 1 down to v1)"
                  >
                    Auto-Fill Prior Slots
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadPriorVersionsFromHistory}
                    className={`border font-medium px-2 py-1 rounded text-[11px] transition cursor-pointer shadow-2xs ${
                      isDarkMode
                        ? "bg-[#08150D] text-[#D2FAD7] border-[#00FF41]/30 hover:border-[#00FF41]"
                        : "bg-white hover:bg-amber-100 text-amber-950 border-amber-400"
                    }`}
                    title="Copy any existing prior notes from Saved Email History into manual fields"
                  >
                    Copy from History
                  </button>
                  {(branding.previousUpdateNotes || []).length > 1 && (
                    <button
                      type="button"
                      onClick={handleSortPriorSlotsDescending}
                      className={`border font-bold px-2 py-1 rounded text-[11px] transition cursor-pointer shadow-2xs flex items-center space-x-1 ${
                        isDarkMode
                          ? "bg-[#08150D] text-[#00FF41] border-[#00FF41]/40 hover:bg-[#00FF41]/20 font-mono"
                          : "bg-white hover:bg-amber-100 text-amber-950 border-amber-400"
                      }`}
                      title="Sort prior version slots descending (highest version down to lowest)"
                    >
                      <ArrowDown className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-amber-700"}`} />
                      <span>Sort Descending</span>
                    </button>
                  )}
                  {(branding.previousUpdateNotes || []).length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllManualPriorVersions}
                      className={`text-[11px] px-1.5 py-0.5 rounded transition cursor-pointer underline ${
                        isDarkMode ? "text-[#D2FAD7]/50 hover:text-rose-400" : "text-zinc-500 hover:text-red-700"
                      }`}
                      title="Clear all manual prior version slots"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* MANUAL PRIOR VERSIONS INPUT SECTION (When Input Prior Versions is ON) */}
            {branding.manualPriorVersionsEnabled && (
              <div
                className={`rounded-lg p-3 space-y-2.5 animate-in fade-in duration-150 border ${
                  isDarkMode
                    ? "bg-[#08150D] border-[#00FF41]/35 text-[#D2FAD7]"
                    : "bg-amber-50/70 border-amber-300/90"
                }`}
              >
                <div
                  className={`flex items-center justify-between text-[11px] font-bold border-b pb-1.5 ${
                    isDarkMode
                      ? "text-[#00FF41] border-[#00FF41]/25"
                      : "text-amber-950 border-amber-200/80"
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${isDarkMode ? "bg-[#00FF41]" : "bg-amber-500"}`} />
                    <span>Manual Prior Version Notes (Arranged Descending: highest to lowest):</span>
                  </span>
                  <span className={`text-[10px] font-medium ${isDarkMode ? "text-[#D2FAD7]/80" : "text-amber-800"}`}>
                    {(branding.previousUpdateNotes || []).length} prior version slot(s)
                  </span>
                </div>

                {(branding.previousUpdateNotes || []).length === 0 ? (
                  <div
                    className={`rounded-lg p-3 text-center space-y-2 border border-dashed ${
                      isDarkMode
                        ? "bg-[#040906] border-[#00FF41]/30"
                        : "bg-white border-amber-300"
                    }`}
                  >
                    <p className={`text-xs font-semibold ${isDarkMode ? "text-[#E0FFE5]" : "text-amber-950"}`}>
                      No prior version notes added yet for v{branding.updateVersion || 1}.
                    </p>
                    <p className={`text-[11px] max-w-md mx-auto ${isDarkMode ? "text-[#D2FAD7]/75" : "text-zinc-600"}`}>
                      Since this email is <strong className={isDarkMode ? "text-[#00FF41]" : ""}>v{branding.updateVersion || 1}</strong>, you can add notes for prior versions (e.g. v{typeof branding.updateVersion === "number" && branding.updateVersion > 1 ? branding.updateVersion - 1 : 1} and older) so they appear stacked underneath the active update banner.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleAutoFillPriorSlots}
                        className={`font-bold px-3 py-1.5 rounded text-xs transition cursor-pointer shadow-xs ${
                          isDarkMode
                            ? "bg-[#00FF41] text-[#040906] hover:bg-[#39FF14] font-mono shadow-[0_0_10px_#00FF41]"
                            : "bg-amber-400 hover:bg-amber-300 text-amber-950"
                        }`}
                      >
                        Auto-fill Prior Slots
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPriorVersionSlot()}
                        className={`font-bold border px-3 py-1.5 rounded text-xs transition cursor-pointer ${
                          isDarkMode
                            ? "bg-[#08150D] hover:bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/40"
                            : "bg-white hover:bg-amber-100 text-amber-950 border-amber-400"
                        }`}
                      >
                        + Add Custom Slot
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(branding.previousUpdateNotes || []).map((prev, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg p-2.5 shadow-2xs space-y-2 border ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/30"
                            : "bg-white border-amber-300"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[11px] font-bold ${isDarkMode ? "text-[#00FF41]" : "text-amber-950"}`}>
                              Prior Version:
                            </span>
                            <div className="flex items-center">
                              <span
                                className={`border border-r-0 font-bold px-2 py-1 rounded-l text-xs select-none ${
                                  isDarkMode
                                    ? "bg-[#08150D] border-[#00FF41]/40 text-[#00FF41] font-mono"
                                    : "bg-amber-200 border-amber-400 text-amber-950"
                                }`}
                              >
                                v
                              </span>
                              <input
                                type="text"
                                value={prev.version}
                                onChange={(e) => handleUpdatePriorVersionNumber(idx, e.target.value)}
                                className={`w-16 rounded-r px-2 py-1 text-xs font-bold border focus:outline-hidden ${
                                  isDarkMode
                                    ? "bg-[#08150D] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-1 focus:ring-[#00FF41] font-mono"
                                    : "bg-white border-amber-400 text-zinc-900 focus:ring-1 focus:ring-amber-500"
                                }`}
                                placeholder="2"
                              />
                            </div>
                            <span className={`text-xs font-mono hidden sm:inline ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
                              UPDATE v{prev.version}: Schedule is updated.
                            </span>
                          </div>

                          <div className="flex items-center space-x-1 text-[10px] flex-wrap">
                            <span className={`text-[10px] mr-0.5 ${isDarkMode ? "text-[#D2FAD7]/60" : "text-zinc-400"}`}>
                              Presets:
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdatePriorNote(
                                  idx,
                                  "I added installs in COD List-104 (470268 & 470269) to your Wednesday schedule."
                                )
                              }
                              className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                                isDarkMode
                                  ? "bg-[#08150D] text-[#D2FAD7] border-[#00FF41]/30 hover:border-[#00FF41] hover:text-[#00FF41]"
                                  : "bg-zinc-100 hover:bg-amber-100 text-zinc-700 hover:text-amber-950 border-zinc-200"
                              }`}
                              title="Insert COD List-104 preset"
                            >
                              + COD 104
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdatePriorNote(idx, "I added Friday route.")
                              }
                              className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                                isDarkMode
                                  ? "bg-[#08150D] text-[#D2FAD7] border-[#00FF41]/30 hover:border-[#00FF41] hover:text-[#00FF41]"
                                  : "bg-zinc-100 hover:bg-amber-100 text-zinc-700 hover:text-amber-950 border-zinc-200"
                              }`}
                              title="Insert Friday route preset"
                            >
                              + Friday
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdatePriorNote(
                                  idx,
                                  "I removed cancelled sites from your Tuesday teardown list."
                                )
                              }
                              className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                                isDarkMode
                                  ? "bg-[#08150D] text-[#D2FAD7] border-[#00FF41]/30 hover:border-[#00FF41] hover:text-[#00FF41]"
                                  : "bg-zinc-100 hover:bg-amber-100 text-zinc-700 hover:text-amber-950 border-zinc-200"
                              }`}
                              title="Insert removed sites preset"
                            >
                              + Removed
                            </button>
                            {prev.notes && (
                              <button
                                type="button"
                                onClick={() => handleUpdatePriorNote(idx, "")}
                                className={`underline text-[10px] ml-1 cursor-pointer transition ${
                                  isDarkMode ? "text-[#D2FAD7]/50 hover:text-rose-400" : "text-zinc-400 hover:text-zinc-700"
                                }`}
                              >
                                Clear
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemovePriorVersionSlot(idx)}
                              className={`p-1 rounded transition ml-1 cursor-pointer ${
                                isDarkMode ? "text-[#D2FAD7]/50 hover:text-rose-400" : "text-zinc-400 hover:text-red-600"
                              }`}
                              title="Remove this prior version"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className={`block text-[10px] font-medium mb-0.5 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-600"}`}>
                            Prior Version Note <span className={isDarkMode ? "text-[#D2FAD7]/60" : "text-zinc-400"}>(Unhighlighted &amp; unbold in email; words "added" and "removed" are colored red)</span>:
                          </label>
                          <input
                            type="text"
                            value={prev.notes || ""}
                            onChange={(e) => handleUpdatePriorNote(idx, e.target.value)}
                            placeholder="e.g. I added installs in COD List-104 (470268 & 470269) to your Wednesday schedule."
                            className={`w-full rounded px-2.5 py-1.5 text-xs focus:outline-hidden transition border ${
                              isDarkMode
                                ? "bg-[#08150D] border-[#00FF41]/40 text-[#E0FFE5] focus:border-[#00FF41] placeholder:text-[#D2FAD7]/40"
                                : "bg-zinc-50 focus:bg-white border-zinc-300 focus:border-amber-500 text-zinc-900"
                            }`}
                          />
                        </div>

                        {/* Live Email Preview of this Prior Version Line */}
                        <div className={`flex items-center gap-1.5 text-[11px] pt-0.5 ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-600"}`}>
                          <span className={`font-semibold text-[10px] shrink-0 ${isDarkMode ? "text-[#00FF41]" : "text-zinc-500"}`}>Email Preview:</span>
                          <div
                            className={`px-2 py-0.5 rounded text-xs truncate flex-1 border font-normal ${
                              isDarkMode
                                ? "bg-[#08150D] text-[#E0FFE5] border-[#00FF41]/35 font-mono"
                                : "bg-zinc-100 text-zinc-900 border-zinc-200"
                            }`}
                          >
                            <span className={`font-bold mr-1 ${isDarkMode ? "text-[#00FF41]" : "text-zinc-800"}`}>
                              UPDATE v{prev.version}:
                            </span>
                            Schedule is updated.{" "}
                            {prev.notes?.trim() && (
                              <span>
                                {prev.notes.split(/\b(added|removed)\b/gi).map((chunk, i) =>
                                  /^(added|removed)$/i.test(chunk) ? (
                                    <span key={i} className="text-[#FF0000] font-bold">
                                      {chunk}
                                    </span>
                                  ) : (
                                    chunk
                                  )
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AUTOMATIC STACKED NOTES (When Input Prior Versions is OFF) */}
            {!branding.manualPriorVersionsEnabled && (
              <div>
                {resolveStackedPreviousUpdateNotes(branding, roster).length > 0 ? (
                  <div
                    className={`pt-1.5 border-t space-y-1 ${
                      isDarkMode ? "border-[#00FF41]/25" : "border-yellow-300/80"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between text-[11px] font-bold ${
                        isDarkMode ? "text-[#00FF41]" : "text-yellow-950"
                      }`}
                    >
                      <span className="flex items-center space-x-1">
                        <span>Stacked Prior Version Notes (Auto-stacked from history, Unhighlighted &amp; Unbold in email):</span>
                      </span>
                      <span className={`text-[10px] font-medium ${isDarkMode ? "text-[#D2FAD7]/80" : "text-yellow-800"}`}>
                        {resolveStackedPreviousUpdateNotes(branding, roster).length} prior note(s) preserved
                      </span>
                    </div>
                    <div className="space-y-1">
                      {resolveStackedPreviousUpdateNotes(branding, roster).map((prev, idx) => (
                        <div
                          key={idx}
                          className={`rounded px-2.5 py-1 text-xs flex items-center justify-between gap-2 shadow-2xs font-normal border ${
                            isDarkMode
                              ? "bg-[#040906] border-[#00FF41]/35 text-[#E0FFE5]"
                              : "bg-white/90 border-yellow-200 text-zinc-900"
                          }`}
                        >
                          <div className="min-w-0 flex-1 truncate">
                            <span className={`font-bold mr-1.5 text-[11px] ${isDarkMode ? "text-[#00FF41]" : "text-zinc-700"}`}>
                              UPDATE v{prev.version}:
                            </span>
                            <span>
                              Schedule is updated.{" "}
                              {prev.notes?.trim() && (
                                <span>
                                  {prev.notes
                                    .split(/\b(added|removed)\b/gi)
                                    .map((chunk, i) =>
                                      /^(added|removed)$/i.test(chunk) ? (
                                        <span key={i} className="text-[#FF0000] font-bold">
                                          {chunk}
                                        </span>
                                      ) : (
                                        chunk
                                      )
                                    )}
                                </span>
                              )}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                              isDarkMode
                                ? "bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            v{prev.version}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-[11px] italic pt-1 flex items-center justify-between ${
                      isDarkMode ? "text-[#D2FAD7]/70" : "text-yellow-900/80"
                    }`}
                  >
                    <span>
                      No prior versions found in Saved Email History for this technician and week.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleManualPriorVersions(true)}
                      className={`font-bold underline cursor-pointer ml-2 ${
                        isDarkMode ? "text-[#00FF41] hover:text-[#39FF14]" : "text-yellow-950 hover:text-amber-800"
                      }`}
                    >
                      Turn on "Input Prior Versions" to enter notes manually &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conduct Study & PEDS Requirement Configuration Panel */}
      {branding.conductStudyEnabled && (
        <div
          className={`border-b px-4 py-3 sm:px-6 space-y-3 transition-colors duration-300 ${
            isDarkMode
              ? "bg-[#08150D] border-[#00FF41]/30 text-[#D2FAD7]"
              : "bg-purple-50/70 border-purple-200 text-purple-950"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center justify-center p-1 rounded-md shadow-xs ${
                  isDarkMode ? "bg-[#00FF41] text-[#040906]" : "bg-purple-700 text-white"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wide ${
                  isDarkMode ? "text-[#E0FFE5]" : "text-purple-950"
                }`}
              >
                Conduct Study &amp; PEDS Requirement Configuration
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isDarkMode
                    ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "bg-purple-100 text-purple-800 border-purple-300"
                }`}
              >
                Active in Schedule
              </span>
            </div>

            {pedsFeedback && (
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border animate-in fade-in ${
                  isDarkMode
                    ? "bg-[#0C1E12] text-[#00FF41] border-[#00FF41]/40"
                    : "bg-purple-100 text-purple-900 border-purple-300"
                }`}
              >
                {pedsFeedback}
              </span>
            )}
          </div>

          <div
            className={`text-xs border rounded-lg p-2.5 space-y-1 ${
              isDarkMode
                ? "bg-[#0C1E12] border-[#00FF41]/25 text-[#D2FAD7]"
                : "bg-white/80 border-purple-200 text-purple-900"
            }`}
          >
            <div
              className={`flex items-center space-x-1.5 font-semibold ${
                isDarkMode ? "text-[#00FF41]" : "text-purple-950"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-purple-600"} shrink-0`} />
              <span>Study &amp; PEDS Formatting Rules:</span>
            </div>
            <p className={`pl-5 ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-700"}`}>
              • <strong>Radar &amp; Parking Studies:</strong> Automatically rendered as{" "}
              <code
                className={`font-mono px-1 py-0.5 rounded text-[11px] ${
                  isDarkMode
                    ? "text-[#00FF41] bg-[#040906] border border-[#00FF41]/30"
                    : "text-purple-900 bg-purple-50"
                }`}
              >
                Conduct &lt;Study&gt;: &lt;Project Number&gt; &lt;City, State&gt; (&lt;Time Duration&gt;)
              </code>
            </p>
            <p className={`pl-5 ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-700"}`}>
              • <strong>PEDS Conduct Sight Distance Line:</strong> Add below and position freely between Install, Teardown, and Battery Swap lines using the{" "}
              <strong className={isDarkMode ? "text-[#00FF41]" : "text-purple-950"}>↑ / ↓ Move Arrow Buttons</strong>.
            </p>
          </div>

          {/* Add PEDS Line Form */}
          <div
            className={`border rounded-lg p-3 shadow-2xs space-y-2.5 ${
              isDarkMode
                ? "bg-[#0C1E12] border-[#00FF41]/30 text-[#E0FFE5]"
                : "bg-white border-purple-200 text-zinc-900"
            }`}
          >
            <div
              className={`text-xs font-bold flex items-center space-x-1.5 ${
                isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"
              }`}
            >
              <Footprints className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-purple-600"}`} />
              <span>Add PEDS Conduct Sight Distance Line</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-3">
                <label
                  className={`block text-[11px] font-semibold mb-0.5 ${
                    isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"
                  }`}
                >
                  Day
                </label>
                <select
                  value={selectedPedsDay}
                  onChange={(e) => setSelectedPedsDay(e.target.value)}
                  className={`w-full text-xs font-semibold px-2.5 py-1.5 rounded-md border focus:outline-none ${
                    isDarkMode
                      ? "border-[#00FF41]/40 bg-[#040906] text-[#00FF41] focus:ring-2 focus:ring-[#00FF41]"
                      : "border-purple-300 bg-purple-50/40 text-purple-950 focus:ring-2 focus:ring-purple-500"
                  }`}
                >
                  {daySelectOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label
                  className={`block text-[11px] font-semibold mb-0.5 ${
                    isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"
                  }`}
                >
                  Project Number
                </label>
                <input
                  type="text"
                  value={pedsProjectNumber}
                  onChange={(e) => setPedsProjectNumber(e.target.value)}
                  placeholder="e.g. 26-470285"
                  className={`w-full text-xs px-2.5 py-1.5 rounded-md border font-mono focus:outline-none ${
                    isDarkMode
                      ? "border-[#00FF41]/40 bg-[#040906] text-[#E0FFE5] placeholder:text-[#D2FAD7]/40 focus:ring-2 focus:ring-[#00FF41]"
                      : "border-zinc-300 bg-white text-zinc-900 focus:ring-2 focus:ring-purple-500"
                  }`}
                />
              </div>

              <div className="sm:col-span-3">
                <label
                  className={`block text-[11px] font-semibold mb-0.5 ${
                    isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"
                  }`}
                >
                  City / Agency
                </label>
                <input
                  type="text"
                  value={pedsCity}
                  onChange={(e) => setPedsCity(e.target.value)}
                  placeholder="e.g. City of Dallas"
                  className={`w-full text-xs px-2.5 py-1.5 rounded-md border focus:outline-none ${
                    isDarkMode
                      ? "border-[#00FF41]/40 bg-[#040906] text-[#E0FFE5] placeholder:text-[#D2FAD7]/40 focus:ring-2 focus:ring-[#00FF41]"
                      : "border-zinc-300 bg-white text-zinc-900 focus:ring-2 focus:ring-purple-500"
                  }`}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  className={`block text-[11px] font-semibold mb-0.5 ${
                    isDarkMode ? "text-[#D2FAD7]" : "text-zinc-700"
                  }`}
                >
                  List Number
                </label>
                <input
                  type="text"
                  value={pedsListNumber}
                  onChange={(e) => setPedsListNumber(e.target.value)}
                  placeholder="e.g. 105"
                  className={`w-full text-xs px-2.5 py-1.5 rounded-md border font-mono focus:outline-none ${
                    isDarkMode
                      ? "border-[#00FF41]/40 bg-[#040906] text-[#E0FFE5] placeholder:text-[#D2FAD7]/40 focus:ring-2 focus:ring-[#00FF41]"
                      : "border-zinc-300 bg-white text-zinc-900 focus:ring-2 focus:ring-purple-500"
                  }`}
                />
              </div>

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={handleAddPedsConductLine}
                  disabled={!pedsProjectNumber.trim() && !pedsListNumber.trim() && !pedsCustomText.trim()}
                  className={`w-full font-bold py-1.5 px-2 rounded-md text-xs transition cursor-pointer flex items-center justify-center space-x-1 shadow-xs disabled:opacity-50 ${
                    isDarkMode
                      ? "bg-[#00FF41] hover:bg-[#00FF41]/80 text-[#040906] font-mono shadow-[0_0_10px_#00FF41]"
                      : "bg-purple-700 hover:bg-purple-800 text-white"
                  }`}
                  title="Add PEDS Conduct Sight Distance line to selected day"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Live Line Preview */}
            <div
              className={`text-[11px] rounded px-2.5 py-1 flex items-center space-x-2 border ${
                isDarkMode
                  ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
                  : "bg-purple-50/50 border-purple-200/80 text-zinc-600"
              }`}
            >
              <span
                className={`font-semibold shrink-0 ${
                  isDarkMode ? "text-[#00FF41]" : "text-purple-900"
                }`}
              >
                Line Preview:
              </span>
              <span className={`font-mono truncate ${isDarkMode ? "text-[#E0FFE5]" : "text-zinc-800"}`}>
                Conduct Sight Distance and additional PED requirement:{" "}
                <span className={`font-bold ${isDarkMode ? "text-[#00FF41]" : "text-purple-900"}`}>
                  {pedsProjectNumber.trim() || "<Project Number>"}
                </span>{" "}
                PEDS ({pedsCity.trim() || "City of Dallas"} – List{" "}
                <span className={`font-bold ${isDarkMode ? "text-[#00FF41]" : "text-purple-900"}`}>
                  {pedsListNumber.trim() || "<Number>"}
                </span>
                )
              </span>
            </div>
          </div>

          {/* Interactive Day Schedule Task Sequence & Ordering Controls */}
          <div className="space-y-2">
            <div
              className={`flex items-center justify-between text-xs font-bold ${
                isDarkMode ? "text-[#E0FFE5]" : "text-zinc-800"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Layers className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-purple-600"}`} />
                <span>Day Schedule Task Sequence &amp; Movable Lines</span>
              </div>
              <span
                className={`text-[11px] font-normal ${
                  isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"
                }`}
              >
                Use{" "}
                <strong className={isDarkMode ? "text-[#00FF41]" : "text-zinc-700"}>
                  ↑ / ↓ buttons
                </strong>{" "}
                to reposition PEDS lines and task groups
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {daysDefinitions.map((def) => {
                const dayOrders = groupedOrders[def.key] || [];
                const dayScheduleItems = buildDayScheduleItems(
                  def.key,
                  def.baseDayName,
                  dayOrders,
                  branding,
                  roster
                );

                if (dayScheduleItems.length === 0) return null;

                return (
                  <div
                    key={def.key}
                    className={`border rounded-lg p-2.5 shadow-2xs space-y-1.5 ${
                      isDarkMode
                        ? "bg-[#0C1E12] border-[#00FF41]/30 text-[#E0FFE5]"
                        : "bg-white border-purple-200 text-zinc-900"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between border-b pb-1 ${
                        isDarkMode ? "border-[#00FF41]/20" : "border-purple-100"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold flex items-center space-x-1 ${
                          isDarkMode ? "text-[#00FF41]" : "text-purple-950"
                        }`}
                      >
                        <span>{def.displayName}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold border ${
                            isDarkMode
                              ? "text-[#00FF41] bg-[#00FF41]/15 border-[#00FF41]/40 font-mono"
                              : "text-purple-700 bg-purple-100 border-purple-200"
                          }`}
                        >
                          {dayScheduleItems.length} item{dayScheduleItems.length > 1 ? "s" : ""}
                        </span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      {dayScheduleItems.map((item, idx) => {
                        const isFirst = idx === 0;
                        const isLast = idx === dayScheduleItems.length - 1;
                        const isPeds = item.type === "peds_conduct";

                        const getBadge = () => {
                          if (isPeds) {
                            return (
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] shrink-0 border ${
                                  isDarkMode
                                    ? "bg-purple-950/60 text-purple-300 border-purple-700 font-mono"
                                    : "bg-purple-100 text-purple-900 border-purple-300"
                                }`}
                              >
                                PEDS Conduct
                              </span>
                            );
                          }
                          if (item.category === "ConductStudy") {
                            return (
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] shrink-0 border ${
                                  isDarkMode
                                    ? "bg-violet-950/60 text-violet-300 border-violet-700 font-mono"
                                    : "bg-violet-100 text-violet-900 border-violet-300"
                                }`}
                              >
                                Conduct Study
                              </span>
                            );
                          }
                          if (item.category === "BatterySwap") {
                            return (
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] shrink-0 border ${
                                  isDarkMode
                                    ? "bg-amber-950/60 text-amber-300 border-amber-700 font-mono"
                                    : "bg-amber-100 text-amber-900 border-amber-300"
                                }`}
                              >
                                Battery Swap
                              </span>
                            );
                          }
                          if (item.category === "Teardown") {
                            return (
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded text-[10px] shrink-0 border ${
                                  isDarkMode
                                    ? "bg-blue-950/60 text-blue-300 border-blue-700 font-mono"
                                    : "bg-blue-100 text-blue-900 border-blue-300"
                                }`}
                              >
                                Teardown
                              </span>
                            );
                          }
                          return (
                            <span
                              className={`font-bold px-1.5 py-0.2 rounded text-[10px] shrink-0 border ${
                                isDarkMode
                                  ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono"
                                  : "bg-emerald-100 text-emerald-900 border-emerald-300"
                              }`}
                            >
                              Install
                            </span>
                          );
                        };

                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between gap-1.5 px-2 py-1 rounded text-xs border ${
                              isPeds
                                ? isDarkMode
                                  ? "bg-[#040906] border-purple-800/60 text-[#E0FFE5]"
                                  : "bg-purple-50/80 border-purple-300 text-purple-950 font-medium"
                                : isDarkMode
                                ? "bg-[#040906] border-[#00FF41]/25 text-[#D2FAD7]"
                                : "bg-zinc-50 border-zinc-200 text-zinc-800"
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                              {getBadge()}
                              <span className="truncate text-[11px]" title={item.title}>
                                {item.title}
                              </span>
                            </div>

                            <div className="flex items-center space-x-0.5 shrink-0">
                              <button
                                type="button"
                                disabled={isFirst}
                                onClick={() =>
                                  handleMoveScheduleItem(
                                    def.key,
                                    def.baseDayName,
                                    dayOrders,
                                    item.id,
                                    "up"
                                  )
                                }
                                className={`p-1 rounded disabled:opacity-25 transition cursor-pointer ${
                                  isDarkMode
                                    ? "hover:bg-[#00FF41]/20 text-[#00FF41]"
                                    : "hover:bg-zinc-200 text-zinc-700"
                                }`}
                                title="Move line Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>

                              <button
                                type="button"
                                disabled={isLast}
                                onClick={() =>
                                  handleMoveScheduleItem(
                                    def.key,
                                    def.baseDayName,
                                    dayOrders,
                                    item.id,
                                    "down"
                                  )
                                }
                                className={`p-1 rounded disabled:opacity-25 transition cursor-pointer ${
                                  isDarkMode
                                    ? "hover:bg-[#00FF41]/20 text-[#00FF41]"
                                    : "hover:bg-zinc-200 text-zinc-700"
                                }`}
                                title="Move line Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>

                              {isPeds && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePedsConductLine(item.id)}
                                  className="p-1 rounded hover:bg-red-950/40 text-rose-400 transition cursor-pointer ml-0.5"
                                  title="Delete PEDS line"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Google Maps App Link Placeholder & Embedding */}
      <div
        className={`border-b px-4 py-3 sm:px-6 space-y-2.5 transition-colors duration-300 ${
          isDarkMode
            ? "bg-[#08150D] border-[#00FF41]/30 text-[#D2FAD7]"
            : "bg-emerald-50/40 border-emerald-200/80 text-zinc-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 flex-wrap">
            <span
              className={`inline-flex items-center justify-center p-1 rounded-md shadow-xs ${
                isDarkMode ? "bg-[#00FF41] text-[#040906]" : "bg-emerald-700 text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-wide ${
                isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"
              }`}
            >
              Google Maps App Link Placeholder
            </span>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border font-semibold ${
                isDarkMode
                  ? "text-[#00FF41] bg-[#00FF41]/15 border-[#00FF41]/40 shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                  : "text-emerald-900 bg-emerald-100/90 border-emerald-300"
              }`}
            >
              🌍 Google Maps App: {cleanTechnicianName(roster.technicianName)} | {weekInfo.formattedRange} Maps
            </span>
            {isAutoEmbeddedFromInitial ? (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                  isDarkMode
                    ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/50 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "bg-blue-100 text-blue-900 border-blue-300"
                }`}
              >
                <Sparkles className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-blue-700"}`} />
                <span>Auto-Embedded from Initial Email ({initialEmailStoredLinks.sourceVersion || "v0"})</span>
              </span>
            ) : activeCustomMapUrl ? (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                  isDarkMode
                    ? "bg-[#00FF41]/25 text-[#00FF41] border-[#00FF41]/60 font-mono"
                    : "bg-emerald-200/90 text-emerald-900 border-emerald-400"
                }`}
              >
                <Check className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-700"}`} />
                <span>Custom Link Embedded</span>
              </span>
            ) : (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  isDarkMode
                    ? "bg-[#0C1E12] text-[#D2FAD7]/80 border-[#00FF41]/30 font-mono"
                    : "bg-zinc-200/70 text-zinc-700 border-zinc-300"
                }`}
              >
                Default Route Search
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={resolvedGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-2xs ${
                isDarkMode
                  ? "bg-[#0C1E12] hover:bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/40 hover:border-[#00FF41] font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                  : "bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 hover:border-emerald-400"
              }`}
              title="Open current Google Maps URL in new tab"
            >
              <ExternalLink className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-700"}`} />
              <span>Test / Open Link</span>
            </a>
            {activeCustomMapUrl && (
              <button
                type="button"
                onClick={handleResetGoogleMapsUrl}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition cursor-pointer border ${
                  isDarkMode
                    ? "text-rose-400 hover:text-rose-300 bg-[#0C1E12] hover:bg-rose-950/30 border-[#00FF41]/30 hover:border-rose-800"
                    : "text-zinc-600 hover:text-red-700 bg-white hover:bg-red-50 border-zinc-300"
                }`}
                title="Reset to default route query"
              >
                Reset Default
              </button>
            )}
          </div>
        </div>

        {/* Input box for pasting or typing custom Google Maps URL */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <div
              className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none ${
                isDarkMode ? "text-[#00FF41]" : "text-emerald-700"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={activeCustomMapUrl}
              onChange={(e) => handleGoogleMapsUrlChange(e.target.value)}
              placeholder={
                isAutoEmbeddedFromInitial
                  ? `Auto-embedded from initial email: ${initialEmailStoredLinks.googleMapsUrl}`
                  : `Paste link to embed for Google Maps App: e.g. https://www.google.com/maps/d/u/0/viewer?mid=... or https://maps.app.goo.gl/... (Default: https://maps.google.com/?q=${encodeURIComponent(cleanTechnicianName(roster.technicianName))})`
              }
              className={`w-full text-xs font-mono pl-8 pr-3 py-2 rounded-lg border transition shadow-2xs focus:outline-none ${
                isDarkMode
                  ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] placeholder:text-[#D2FAD7]/40 focus:ring-2 focus:ring-[#00FF41] focus:border-[#00FF41]"
                  : "bg-white border-emerald-300/90 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              }`}
            />
          </div>
        </div>
        {isAutoEmbeddedFromInitial && (
          <div
            className={`text-[11px] rounded-md px-2.5 py-1 flex items-center space-x-1.5 font-medium border ${
              isDarkMode
                ? "bg-[#0C1E12] border-[#00FF41]/30 text-[#D2FAD7]"
                : "bg-blue-50/80 border-blue-200/80 text-blue-900"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-blue-600"} shrink-0`} />
            <span>
              <strong>Auto-Embedded Link:</strong> Reused Google Maps link from the initial email ({initialEmailStoredLinks.sourceVersion || "v0"}) for {cleanTechnicianName(roster.technicianName)} in work week {weekInfo.formattedRange}.
            </span>
          </div>
        )}
      </div>

      {/* Email Attachments Placeholder & Dropzone */}
      <div
        className={`border-b px-4 py-3 sm:px-6 space-y-2.5 transition-colors duration-300 ${
          isDarkMode ? "bg-[#08150D] border-[#00FF41]/30 text-[#D2FAD7]" : "bg-zinc-50/95 border-zinc-200 text-zinc-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 flex-wrap">
            <span
              className={`inline-flex items-center justify-center p-1 rounded-md shadow-xs ${
                isDarkMode ? "bg-[#00FF41] text-[#040906] shadow-[0_0_8px_#00FF41]" : "bg-blue-600 text-white"
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-wide ${
                isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"
              }`}
            >
              Email Attachments Placeholder
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                isDarkMode
                  ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                  : "bg-blue-100 text-blue-800 border-blue-300"
              }`}
            >
              {attachments.length} {attachments.length === 1 ? "file" : "files"}
            </span>
            {attachments.length > 0 && (
              <span className={`text-[11px] font-mono ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-500"}`}>
                ({formatFileSize(attachments.reduce((acc, a) => acc + (a.size || 0), 0))} total)
              </span>
            )}
            <span className={`text-[11px] hidden md:inline ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>
              (Accepts any file formats: .pdf, .kmz, .kml, .csv, .xlsx, .docx, images, etc. Attached automatically upon exporting to Outlook .EML)
            </span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer shadow-xs flex items-center space-x-1.5 transform hover:-translate-y-0.5 ${
                isDarkMode
                  ? "bg-[#00FF41]/20 hover:bg-[#00FF41]/30 text-[#00FF41] border border-[#00FF41]/60 shadow-[0_0_12px_rgba(0,255,65,0.3)] font-mono"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Attach Files</span>
            </button>
            {attachments.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllAttachments}
                className={`text-xs px-2 py-1 rounded transition cursor-pointer border ${
                  isDarkMode
                    ? "text-[#D2FAD7] hover:text-rose-400 border-[#00FF41]/30 bg-[#040906]"
                    : "text-zinc-500 hover:text-red-600 border-zinc-300 bg-white"
                }`}
                title="Remove all attachments"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Drag & Drop Box or Attached Files Chips */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-lg border-2 border-dashed transition-all p-3 ${
            isDraggingFile
              ? isDarkMode
                ? "border-[#00FF41] bg-[#00FF41]/10 scale-[1.005]"
                : "border-blue-500 bg-blue-50/80 scale-[1.005]"
              : attachments.length > 0
              ? isDarkMode
                ? "border-[#00FF41]/40 bg-[#040906]"
                : "border-zinc-300 bg-white"
              : isDarkMode
              ? "border-[#00FF41]/30 bg-[#040906]/60 hover:bg-[#040906] matrix-dropzone"
              : "border-zinc-300 bg-zinc-100/50 hover:bg-zinc-100"
          }`}
        >
          {attachments.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 text-center py-2 cursor-pointer select-none ${
                isDarkMode ? "text-[#D2FAD7] hover:text-[#00FF41]" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              <Paperclip className={`w-4 h-4 shrink-0 ${isDarkMode ? "text-[#00FF41]" : "text-blue-500"}`} />
              <span className="text-xs">
                <strong>Drop attachments here</strong> or <span className={`underline font-semibold ${isDarkMode ? "text-[#00FF41]" : "text-blue-600"}`}>browse files</span> (.pdf, .kmz, .kml, .csv, .xlsx, .docx, images, etc.)
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-xs shadow-2xs ${
                    isDarkMode
                      ? "bg-[#0C1E12] border-[#00FF41]/40 text-[#E0FFE5]"
                      : getFileBadgeColor(att.name)
                  }`}
                >
                  {getFileIcon(att.name)}
                  <span
                    className={`font-semibold max-w-[180px] sm:max-w-[240px] truncate ${
                      isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"
                    }`}
                    title={att.name}
                  >
                    {att.name}
                  </span>
                  <span className={`text-[10px] font-mono ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-500"}`}>
                    ({formatFileSize(att.size)})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-zinc-400 hover:text-rose-400 p-0.5 rounded transition cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded border border-dashed transition cursor-pointer ${
                  isDarkMode
                    ? "text-[#00FF41] hover:text-[#E0FFE5] bg-[#00FF41]/10 border-[#00FF41]/40 hover:bg-[#00FF41]/20 hover:border-[#00FF41]"
                    : "text-blue-600 hover:text-blue-800 border-blue-300 hover:border-blue-500 bg-blue-50/50"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add More</span>
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Outlook Desktop Simulator Container */}
      <div
        className={`p-4 sm:p-6 flex-1 flex flex-col items-center justify-center overflow-x-auto min-h-[500px] transition-colors duration-300 ${
          isDarkMode ? "bg-[#040906]/95 border-b border-[#00FF41]/20" : "bg-zinc-100/60"
        }`}
      >
        {viewMode === "desktop" && (
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-md border border-zinc-300 overflow-hidden flex flex-col">
            {/* Outlook Window Titlebar */}
            <div className="bg-[#0078D4] text-white px-4 py-2 flex items-center justify-between text-xs select-none">
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-white" />
                <span className="font-medium">Microsoft Outlook — Message Viewer</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80">
                <span className="w-2.5 h-2.5 rounded-full bg-white/40 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-white/40 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-white/40 inline-block"></span>
              </div>
            </div>

            {/* Outlook Simplified Ribbon */}
            <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-1.5 flex items-center space-x-4 text-xs text-zinc-600 select-none">
              <span className="font-semibold text-blue-700 border-b-2 border-blue-600 pb-0.5">Message</span>
              <span className="hover:text-zinc-900 cursor-pointer">Insert</span>
              <span className="hover:text-zinc-900 cursor-pointer">Options</span>
              <span className="hover:text-zinc-900 cursor-pointer">Format Text</span>
              <span className="hover:text-zinc-900 cursor-pointer">Review</span>
            </div>

            {/* Outlook Headers (From / To / Subject / Attachments) */}
            <div className="p-4 bg-white border-b border-zinc-200 space-y-2 text-xs font-sans">
              <div className="flex items-center">
                <span className="w-16 font-semibold text-zinc-400 uppercase text-[10px]">From:</span>
                <span className="font-medium text-zinc-800">
                  {branding.dispatcherName} &lt;{branding.replyToEmail}&gt;
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-16 font-semibold text-zinc-400 uppercase text-[10px]">To:</span>
                <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {cleanTechnicianName(roster.technicianName)} &lt;{roster.technicianEmail}&gt;
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-16 font-semibold text-zinc-400 uppercase text-[10px]">Date:</span>
                <span className="text-zinc-600">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex items-start">
                <span className="w-16 font-semibold text-zinc-400 uppercase text-[10px] mt-0.5">Subject:</span>
                <span className="font-bold text-zinc-900 text-sm">{subject}</span>
              </div>

              {/* Native Outlook Attachments Header Bar */}
              {attachments.length > 0 && (
                <div className="pt-2 border-t border-zinc-100 flex items-start">
                  <span className="w-16 font-semibold text-zinc-400 uppercase text-[10px] mt-1 flex items-center space-x-1">
                    <Paperclip className="w-3 h-3 text-zinc-400" />
                    <span>Attach:</span>
                  </span>
                  <div className="flex-1 flex flex-wrap items-center gap-1.5">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="bg-zinc-50 border border-zinc-300 rounded px-2 py-1 text-[11px] flex items-center space-x-1.5 shadow-2xs hover:bg-zinc-100 transition"
                      >
                        {getFileIcon(att.name)}
                        <span className="font-medium text-zinc-800 max-w-[160px] truncate" title={att.name}>
                          {att.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          ({formatFileSize(att.size)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Email Body Preview (Rendered HTML) */}
            <div className="p-4 bg-[#F8FAFC] overflow-y-auto max-h-[600px]">
              <div
                className="outlook-body-wrapper"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        )}

        {viewMode === "mobile" && (
          <div className="w-[380px] bg-zinc-900 rounded-[38px] p-3 shadow-xl border-4 border-zinc-700">
            {/* Phone Screen Notch */}
            <div className="w-32 h-4 bg-zinc-800 rounded-full mx-auto mb-2"></div>
            {/* Mobile App Screen */}
            <div className="bg-white rounded-[28px] overflow-hidden flex flex-col h-[580px]">
              {/* Mobile Outlook App Bar */}
              <div className="bg-[#0078D4] text-white p-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-bold">Outlook Mobile</span>
                </div>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Inbox</span>
              </div>

              {/* Mobile Message Headers */}
              <div className="p-3 bg-zinc-50 border-b border-zinc-200 text-xs">
                <div className="font-bold text-zinc-900 text-[13px]">{subject}</div>
                <div className="text-[11px] text-zinc-500 mt-1">From: {branding.dispatcherName}</div>
                <div className="text-[11px] text-blue-600">To: {cleanTechnicianName(roster.technicianName)}</div>
                {attachments.length > 0 && (
                  <div className="mt-1 text-[11px] text-zinc-600 flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-zinc-200">
                    <Paperclip className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="font-semibold">{attachments.length} Attachment(s):</span>
                    <span className="truncate text-zinc-500 text-[10px]">
                      {attachments.map((a) => a.name).join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Mobile Body */}
              <div className="p-2 bg-[#F8FAFC] overflow-y-auto flex-1">
                <div
                  className="outlook-body-wrapper scale-95 origin-top"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Export Actions Toolbar */}
      <div
        className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 transition-colors duration-300 ${
          isDarkMode
            ? "bg-[#08150D] border-[#00FF41]/30 text-[#D2FAD7]"
            : activeHolidaySeason === "halloween"
            ? "bg-[#251208] border-orange-400/40 text-orange-100"
            : activeHolidaySeason === "christmas_eve"
            ? "bg-[#0c182b] border-amber-300/40 text-blue-100"
            : activeHolidaySeason === "christmas"
            ? "bg-[#0e2c19] border-red-400/40 text-emerald-100"
            : activeHolidaySeason === "new_year"
            ? "bg-[#18153b] border-yellow-300/40 text-amber-100"
            : "bg-[#FBF7F0] border-[#CFE0B8] text-[#3F4A33]"
        }`}
      >
        <div className={`text-xs flex items-center space-x-2 flex-wrap gap-y-1 ${
          isDarkMode
            ? "text-[#D2FAD7]"
            : activeHolidaySeason !== "standard"
            ? "text-white"
            : "text-[#3F4A33]"
        }`}>
          <span>
            Ready to distribute to{" "}
            <span className={`font-bold ${
              isDarkMode
                ? "text-[#00FF41] font-mono"
                : activeHolidaySeason !== "standard"
                ? "text-white underline"
                : "text-[#3F4A33]"
            }`}>
              {roster.technicianEmail}
            </span>
          </span>
          {manualSaveSuccess && (
            <span
              className={`font-bold px-2 py-0.5 rounded-lg border text-[11px] inline-flex items-center space-x-1 animate-in fade-in duration-150 ${
                isDarkMode
                  ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-900/60 text-orange-200 border-orange-400"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-blue-900/60 text-blue-200 border-amber-300"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-900/60 text-emerald-200 border-emerald-400"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-900/60 text-amber-200 border-yellow-300"
                  : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
              }`}
            >
              <Check className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-400"}`} />
              <span>Saved to History!</span>
            </span>
          )}
          {clearNotice && (
            <span
              className={`font-bold px-2 py-0.5 rounded-lg border text-[11px] inline-flex items-center space-x-1 animate-in fade-in duration-150 ${
                isDarkMode
                  ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono"
                  : activeHolidaySeason === "halloween"
                  ? "bg-orange-900/60 text-orange-200 border-orange-400"
                  : activeHolidaySeason === "christmas_eve"
                  ? "bg-blue-900/60 text-blue-200 border-amber-300"
                  : activeHolidaySeason === "christmas"
                  ? "bg-emerald-900/60 text-emerald-200 border-emerald-400"
                  : activeHolidaySeason === "new_year"
                  ? "bg-amber-900/60 text-amber-200 border-yellow-300"
                  : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
              }`}
            >
              <RotateCcw className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-emerald-400"}`} />
              <span>Preview Cleared &amp; Reset!</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Clear Preview Button */}
          <button
            type="button"
            onClick={handleClearPreview}
            className={`group flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border shadow-2xs transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 ${
              isDarkMode
                ? "bg-transparent text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border-transparent hover:border-rose-900"
                : activeHolidaySeason !== "standard"
                ? "bg-white/10 hover:bg-white/20 text-red-200 hover:text-red-100 border-white/20"
                : "bg-transparent hover:bg-red-50 text-red-600 hover:text-red-700 border-transparent hover:border-red-300"
            }`}
            title="Clear the current preview configurations, notes, and update details to generate a fresh email from scratch"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400 group-hover:-rotate-180 transition-transform duration-500" />
            <span>Clear Preview</span>
          </button>

          {/* Manual Save / Mark as Generated */}
          <button
            type="button"
            onClick={handleManualMarkGenerated}
            className={`group flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border shadow-2xs transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 ${
              isDarkMode
                ? "bg-transparent hover:bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.15)] font-mono"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-900/40 hover:bg-orange-900/70 text-orange-200 border-orange-400/60"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-blue-900/40 hover:bg-blue-900/70 text-blue-200 border-amber-300/60"
                : activeHolidaySeason === "christmas"
                ? "bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-200 border-emerald-400/60"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-900/40 hover:bg-amber-900/70 text-amber-200 border-yellow-300/60"
                : "bg-transparent hover:bg-[#EDF3E3] text-[#3F4A33] border-[#8AA66B]"
            }`}
            title="Saves this generated email version to browser local storage history"
          >
            <Save className={`w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-300 ${
              isDarkMode ? "text-[#00FF41]" : activeHolidaySeason !== "standard" ? "text-white" : "text-[#8AA66B]"
            }`} />
            <span>Save to History</span>
          </button>

          {/* Copy Email HTML Button */}
          <button
            type="button"
            onClick={handleCopyEmailBody}
            className={`group flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl border-2 shadow-xs transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 ${
              isDarkMode
                ? "bg-[#00FF41]/20 hover:bg-[#00FF41]/30 text-[#E0FFE5] border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                : activeHolidaySeason === "halloween"
                ? "bg-orange-600 hover:bg-orange-500 text-white border-orange-400 shadow-orange-600/30"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-amber-600 hover:bg-amber-500 text-white border-amber-400 shadow-amber-600/30"
                : activeHolidaySeason === "christmas"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-600/30"
                : activeHolidaySeason === "new_year"
                ? "bg-amber-600 hover:bg-amber-500 text-white border-yellow-400 shadow-amber-600/30"
                : "bg-[#3F4A33] hover:bg-[#2F3826] text-[#FAF4E6] border-[#8AA66B]"
            }`}
            title="Copies formatted email body with HTML directly to clipboard to paste into Outlook"
          >
            {copySuccess ? (
              <Check className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-white"}`} />
            ) : (
              <Copy className={`w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-300 ${isDarkMode ? "text-[#00FF41]" : "text-white"}`} />
            )}
            <span>{copySuccess ? "Copied to Clipboard!" : "Copy Email Body"}</span>
          </button>

          {/* Download .EML file / Export Button */}
          <button
            type="button"
            onClick={handleDownloadEml}
            className={`group flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl border-2 shadow-xs transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 ${
              isDarkMode
                ? "bg-[#0C1E12] hover:bg-[#122F1B] text-[#00FF41] border-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.25)] font-mono"
                : activeHolidaySeason === "halloween"
                ? "bg-stone-900 hover:bg-black text-orange-200 border-orange-500"
                : activeHolidaySeason === "christmas_eve"
                ? "bg-slate-900 hover:bg-black text-amber-200 border-amber-400"
                : activeHolidaySeason === "christmas"
                ? "bg-stone-900 hover:bg-black text-emerald-200 border-emerald-400"
                : activeHolidaySeason === "new_year"
                ? "bg-stone-900 hover:bg-black text-amber-200 border-yellow-400"
                : "bg-[#3F4A33] hover:bg-[#2F3826] text-[#FAF4E6] border-[#CFE0B8]"
            }`}
            title="Downloads an .EML message file pre-filled with subject, body, and attachments"
          >
            <Download className={`w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-300 ${isDarkMode ? "text-[#00FF41]" : "text-white"}`} />
            <span>Download Outlook (.EML)</span>
          </button>
        </div>
      </div>

      {/* --- Multi-Select Presets Modal --- */}
      {showMultiSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border ${
              isDarkMode
                ? "bg-[#08150D] border-[#00FF41]/40 shadow-[0_0_30px_rgba(0,255,65,0.25)] text-[#D2FAD7]"
                : "bg-white border-[#CFE0B8] text-zinc-900"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-5 py-4 flex items-center justify-between border-b ${
                isDarkMode
                  ? "bg-[#040906] border-[#00FF41]/30 text-white"
                  : "bg-[#3F4A33] border-[#CFE0B8]/30 text-white"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold border ${
                    isDarkMode
                      ? "bg-[#00FF41]/10 text-[#00FF41] border-[#00FF41]/40"
                      : "bg-[#8AA66B]/30 text-[#EDF3E3] border-[#CFE0B8]/30"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Multi-Select Presets &amp; Assign Days</h3>
                  <p className={`text-xs ${isDarkMode ? "text-[#D2FAD7]/80" : "text-[#EDF3E3]/80"}`}>
                    Select multiple saved presets and choose a specific target day for each
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMultiSelectModal(false)}
                className={`p-1 rounded-lg transition cursor-pointer ${
                  isDarkMode
                    ? "text-[#00FF41] hover:text-white hover:bg-[#00FF41]/20"
                    : "text-[#CFE0B8] hover:text-white hover:bg-white/10"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Toolbar: Batch Day Selector & Select All / Deselect All */}
            <div
              className={`p-3.5 border-b flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs ${
                isDarkMode ? "bg-[#040906]/80 border-[#00FF41]/20" : "bg-[#FBF7F0] border-[#CFE0B8]"
              }`}
            >
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSelectAllPresets}
                  className={`font-semibold px-2.5 py-1.5 rounded-lg shadow-2xs transition cursor-pointer ${
                    isDarkMode
                      ? "text-[#00FF41] hover:text-white bg-[#08150D] border border-[#00FF41]/40 hover:bg-[#00FF41]/20"
                      : "text-[#3F4A33] hover:text-black bg-white border border-[#CFE0B8] hover:bg-[#EDF3E3]"
                  }`}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllPresets}
                  className={`font-semibold px-2.5 py-1.5 rounded-lg shadow-2xs transition cursor-pointer ${
                    isDarkMode
                      ? "text-[#D2FAD7]/80 hover:text-white bg-[#08150D] border border-[#00FF41]/30 hover:bg-[#00FF41]/15"
                      : "text-[#3F4A33] hover:text-black bg-white border border-[#CFE0B8] hover:bg-[#EDF3E3]"
                  }`}
                >
                  Deselect All
                </button>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    isDarkMode
                      ? "text-[#00FF41] bg-[#00FF41]/10 border-[#00FF41]/30 font-mono"
                      : "text-[#3F4A33] bg-[#EDF3E3] border border-[#CFE0B8]"
                  }`}
                >
                  {multiSelectPresetIds.length} of {allPresets.length} selected
                </span>
              </div>

              {/* Bulk Day Assignment */}
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <span className={`font-medium text-[11px] ${isDarkMode ? "text-[#D2FAD7]/80" : "text-zinc-600"}`}>
                  Set all selected to:
                </span>
                <select
                  value={multiSelectBulkDay}
                  onChange={(e) => setMultiSelectBulkDay(e.target.value)}
                  className={`border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-hidden cursor-pointer ${
                    isDarkMode
                      ? "bg-[#08150D] border-[#00FF41]/40 text-[#00FF41] focus:ring-2 focus:ring-[#00FF41]"
                      : "bg-white border-[#CFE0B8] text-[#3F4A33] focus:ring-2 focus:ring-[#8AA66B]"
                  }`}
                >
                  {daySelectOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleApplyBulkDayToSelected}
                  disabled={multiSelectPresetIds.length === 0}
                  className={`disabled:opacity-50 font-bold px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
                    isDarkMode
                      ? "bg-[#00FF41] text-[#040906] hover:bg-[#39FF14] shadow-[0_0_10px_#00FF41]"
                      : "bg-[#8AA66B] hover:bg-[#7a965c] text-white"
                  }`}
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Presets List with Individual Day Selector */}
            <div
              className={`flex-1 overflow-y-auto p-4 space-y-2 divide-y ${
                isDarkMode ? "divide-[#00FF41]/20 bg-[#08150D]" : "divide-[#CFE0B8]/40 bg-white"
              }`}
            >
              {allPresets.map((preset) => {
                const isSelected = multiSelectPresetIds.includes(preset.id);
                const assignedDay = multiSelectDayMap[preset.id] || selectedNoteDay || "Sunday";

                return (
                  <div
                    key={preset.id}
                    className={`pt-2 first:pt-0 p-2.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? isDarkMode
                          ? "bg-[#00FF41]/10 border-[#00FF41]/60 shadow-[0_0_12px_rgba(0,255,65,0.15)]"
                          : "bg-[#EDF3E3]/70 border-[#8AA66B] shadow-2xs"
                        : isDarkMode
                        ? "bg-[#040906]/60 border-[#00FF41]/20 hover:border-[#00FF41]/40"
                        : "bg-white border-[#CFE0B8] hover:border-[#8AA66B]"
                    }`}
                  >
                    {/* Checkbox & Text */}
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePresetSelection(preset.id)}
                        className={`mt-0.5 cursor-pointer shrink-0 ${
                          isDarkMode ? "text-[#00FF41] hover:text-white" : "text-zinc-700 hover:text-[#3F4A33]"
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className={`w-5 h-5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                        ) : (
                          <Square className={`w-5 h-5 ${isDarkMode ? "text-[#00FF41]/40" : "text-zinc-400"}`} />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span
                            onClick={() => handleTogglePresetSelection(preset.id)}
                            className={`font-bold text-xs cursor-pointer hover:underline ${
                              isDarkMode ? "text-[#E0FFE5]" : "text-zinc-900"
                            }`}
                          >
                            {preset.title}
                          </span>
                          {!preset.isBuiltIn ? (
                            <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
                              Custom Saved
                            </span>
                          ) : (
                            <span
                              className={`text-[9px] font-medium px-1.5 py-0.2 rounded ${
                                isDarkMode ? "bg-[#00FF41]/15 text-[#00FF41]" : "bg-zinc-100 text-zinc-600"
                              }`}
                            >
                              Built-in Template
                            </span>
                          )}
                        </div>

                        <div className="mt-1 text-xs">
                          {preset.text.includes("See correct Format:") ? (
                            <span className="text-xs">
                              <span className="bg-[#00FF00] text-black font-bold italic px-1.5 py-0.5 rounded-l text-[11px] shadow-2xs">
                                {preset.text.substring(0, preset.text.indexOf("See correct Format:")).trim()}
                              </span>{" "}
                              <span className="bg-[#FFFF00] text-black font-bold italic px-1.5 py-0.5 rounded-r text-[11px] shadow-2xs">
                                {preset.text.substring(preset.text.indexOf("See correct Format:")).trim()}
                              </span>
                            </span>
                          ) : (
                            <span
                              className={`${
                                isAutomaticSpeedOrTmcNote(preset.text)
                                  ? "bg-[#FFFF00]"
                                  : "bg-[#00FF00]"
                              } text-black font-bold italic px-1.5 py-0.5 rounded text-[11px] inline-block shadow-2xs`}
                            >
                              {formatNoteTextWithPrefix(preset.text)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Individual Day Dropdown for this note */}
                    <div className="flex items-center space-x-2 shrink-0 sm:self-center pl-8 sm:pl-0">
                      <span className={`text-[11px] font-bold ${isDarkMode ? "text-[#D2FAD7]" : "text-zinc-600"}`}>
                        Assign Day:
                      </span>
                      <select
                        value={assignedDay}
                        onChange={(e) => {
                          handleSetPresetDay(preset.id, e.target.value);
                          // Auto-select if changed
                          if (!isSelected) {
                            handleTogglePresetSelection(preset.id);
                          }
                        }}
                        className={`border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-hidden cursor-pointer ${
                          isSelected
                            ? isDarkMode
                              ? "border-[#00FF41] text-[#00FF41] font-bold bg-[#00FF41]/15"
                              : "border-[#8AA66B] text-[#3F4A33] font-bold bg-[#EDF3E3]"
                            : isDarkMode
                            ? "border-[#00FF41]/30 text-[#D2FAD7] bg-[#040906]"
                            : "border-zinc-300 text-zinc-700 bg-white"
                        }`}
                      >
                        {daySelectOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div
              className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
                isDarkMode ? "bg-[#040906] border-[#00FF41]/20 text-[#D2FAD7]" : "bg-[#FBF7F0] border-[#CFE0B8] text-[#3F4A33]"
              }`}
            >
              <div className="font-medium">
                {multiSelectPresetIds.length > 0 ? (
                  <span>
                    Ready to add <strong className={`font-bold ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>{multiSelectPresetIds.length}</strong> note(s) to schedule
                  </span>
                ) : (
                  <span>No presets selected</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowMultiSelectModal(false)}
                  className={`px-3.5 py-1.5 rounded-xl border font-semibold transition cursor-pointer ${
                    isDarkMode
                      ? "border-[#00FF41]/30 text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/10"
                      : "border-[#CFE0B8] text-[#3F4A33] hover:bg-[#EDF3E3]"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddMultiSelectedPresetsToSchedule}
                  disabled={multiSelectPresetIds.length === 0}
                  className={`px-4 py-1.5 rounded-xl font-bold transition cursor-pointer shadow-xs flex items-center space-x-1.5 disabled:opacity-50 ${
                    isDarkMode
                      ? "bg-[#00FF41] hover:bg-[#39FF14] text-[#040906] shadow-[0_0_12px_#00FF41]"
                      : "bg-[#8AA66B] hover:bg-[#7a965c] text-white"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add {multiSelectPresetIds.length} Selected Notes to Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Generated Emails Local Storage History Modal --- */}
      <GeneratedEmailsHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={storedEmails}
        activeTechName={roster.technicianName}
        activeWorkWeek={weekInfo.formattedRange}
        onDeleteRecord={handleDeleteGeneratedEmail}
        onClearTechHistory={handleClearTechHistory}
      />

      {/* --- City of Dallas (COD Exclusive) Options & Sight Distance Modal --- */}
      <CodSightDistanceModal
        isOpen={showCodSightDistanceModal}
        onClose={() => setShowCodSightDistanceModal(false)}
        roster={roster}
        branding={branding}
        onSaveLocations={(locs, schoolZoneConfig) => {
          if (onUpdateBranding) {
            onUpdateBranding({
              codSightDistanceLocations: locs,
              ...(schoolZoneConfig
                ? {
                    codSchoolZonePedFormEnabled: schoolZoneConfig.enabled,
                    codSchoolZonePedFormUrl: schoolZoneConfig.url,
                    codSchoolZonePedFormText: schoolZoneConfig.text,
                  }
                : {}),
            });
          }
          setPresetFeedback("Updated City of Dallas (COD) settings & schedule!");
          setTimeout(() => setPresetFeedback(null), 3000);
        }}
      />

      {/* --- Email Signature Configuration & Live Preview Modal --- */}
      <EmailSignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        branding={branding}
        onUpdateBranding={onUpdateBranding}
        onToggleEmailSignature={onToggleEmailSignature}
        onSelectPreset={onSelectEmailSignaturePreset}
      />
    </div>
  );
};
