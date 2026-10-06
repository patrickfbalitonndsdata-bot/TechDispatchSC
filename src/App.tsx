import React, { useState, useMemo, useEffect } from "react";
import {
  Mail,
  Users,
  History,
  Sparkles,
  Calendar,
  FileText,
  LayoutDashboard,
} from "lucide-react";
import {
  WorkOrder,
  ColumnMapping,
  ParseResult,
  TechnicianRoster,
  TemplateBranding,
  TemplateStyle,
  DispatchLogRecord,
  EmailSignaturePresetId,
} from "./types";
import { parseCsvData } from "./utils/csvParser";
import { DEFAULT_BRANDING, cleanTechnicianName } from "./utils/outlookTemplateGenerator";
import { SAMPLE_DATASETS, SampleDataset } from "./utils/sampleData";
import { getStoredGeneratedEmails, GeneratedEmailRecord, LOCAL_STORAGE_KEY_EMAILS, NDS_SAVED_EMAILS_EVENT } from "./utils/generatedEmailStorage";

import { Navbar } from "./components/Navbar";
import { DashboardLanding } from "./components/DashboardLanding";
import { CsvUploadZone } from "./components/CsvUploadZone";
import { OutlookEmailPreview } from "./components/OutlookEmailPreview";
import { ColumnMappingModal } from "./components/ColumnMappingModal";
import { SettingsBrandingModal } from "./components/SettingsBrandingModal";
import { DispatchHistoryModal } from "./components/DispatchHistoryModal";
import { SavedEmailsHistoryTab } from "./components/SavedEmailsHistoryTab";
import { AlgTmcApprovalPanel } from "./components/AlgTmcApprovalPanel";
import { Footer } from "./components/Footer";
import { MatrixRainBackground } from "./components/MatrixRainBackground";
import { HolidayBackground } from "./components/HolidayBackground";
import { HolidayAmbientDecorations } from "./components/HolidayAmbientDecorations";
import { FuturisticTabTransition } from "./components/FuturisticTabTransition";
import { useTheme } from "./context/ThemeContext";
import generatorMinimalBanner from "./assets/images/generator_minimal_banner_1790174300845.jpg";

export default function App() {
  // 1. Data & Parsing State
  const [currentCsvText, setCurrentCsvText] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [customMapping, setCustomMapping] = useState<ColumnMapping | null>(null);

  // 2. Selection & View Tab State (default to landing dashboard)
  const [activeTab, setActiveTab] = useState<"dashboard" | "generator" | "history" | "algtmc">("dashboard");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTechName, setSelectedTechName] = useState<string>("");
  const [savedEmailsCount, setSavedEmailsCount] = useState<number>(0);

  // 3. Settings & Styling State
  const [branding, setBranding] = useState<TemplateBranding>(DEFAULT_BRANDING);
  const [currentStyle, setCurrentStyle] = useState<TemplateStyle>("exact_nds_template");

  // 4. Modals State
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // 5. Audit & Dispatch Logs
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLogRecord[]>([]);

  // 6. Theme Integration
  const { isDarkMode, activeHolidaySeason, holidayConfig } = useTheme();

  // Update saved emails count on mount and storage change
  const refreshSavedCount = () => {
    try {
      const records = getStoredGeneratedEmails();
      setSavedEmailsCount(records.length);
    } catch {
      setSavedEmailsCount(0);
    }
  };

  useEffect(() => {
    refreshSavedCount();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY_EMAILS) {
        refreshSavedCount();
      }
    };
    const handleCustomUpdate = () => {
      refreshSavedCount();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener(NDS_SAVED_EMAILS_EVENT, handleCustomUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(NDS_SAVED_EMAILS_EVENT, handleCustomUpdate);
    };
  }, []);

  const loadSampleDataset = (sample: SampleDataset) => {
    setCurrentCsvText(sample.csvContent);
    setCurrentFileName(sample.name);
    const parsed = parseCsvData(sample.csvContent, customMapping || undefined);
    setParseResult(parsed);

    if (parsed.incomingWorkWeek) {
      setSelectedDate(parsed.incomingWorkWeek.sundayDateStr);
    } else if (parsed.detectedDates.length > 0) {
      setSelectedDate(parsed.detectedDates[0]);
    }
    if (parsed.technicians.length > 0) {
      setSelectedTechName(parsed.technicians[0]);
    }
    setActiveTab("generator");
  };

  const handleFileUpload = (text: string, fileName: string) => {
    setCurrentCsvText(text);
    setCurrentFileName(fileName);
    const parsed = parseCsvData(text, customMapping || undefined);
    setParseResult(parsed);

    if (parsed.incomingWorkWeek) {
      setSelectedDate(parsed.incomingWorkWeek.sundayDateStr);
    } else if (parsed.detectedDates.length > 0) {
      setSelectedDate(parsed.detectedDates[0]);
    }
    if (parsed.technicians.length > 0) {
      setSelectedTechName(parsed.technicians[0]);
    }
    setActiveTab("generator");
  };

  const handleSaveMapping = (newMapping: ColumnMapping) => {
    setCustomMapping(newMapping);
    if (currentCsvText) {
      const parsed = parseCsvData(currentCsvText, newMapping);
      setParseResult(parsed);
      if (parsed.incomingWorkWeek) {
        setSelectedDate(parsed.incomingWorkWeek.sundayDateStr);
      } else if (parsed.detectedDates.length > 0 && !parsed.detectedDates.includes(selectedDate)) {
        setSelectedDate(parsed.detectedDates[0]);
      }
      if (parsed.technicians.length > 0 && !parsed.technicians.includes(selectedTechName)) {
        setSelectedTechName(parsed.technicians[0]);
      }
    }
  };

  // Build rosters grouped by technician across all orders for the current file
  const rosters: TechnicianRoster[] = useMemo(() => {
    if (!parseResult || parseResult.orders.length === 0) return [];

    const techMap = new Map<string, WorkOrder[]>();

    parseResult.orders.forEach((ord) => {
      const tech = ord.technicianName || "Unassigned Tech";
      if (!techMap.has(tech)) {
        techMap.set(tech, []);
      }
      techMap.get(tech)!.push(ord);
    });

    const result: TechnicianRoster[] = [];

    techMap.forEach((orders, techName) => {
      const email = orders[0]?.technicianEmail || `${techName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@ndsdata.com`;
      const urgentCount = orders.filter((o) => o.priority === "Urgent").length;
      const highCount = orders.filter((o) => o.priority === "High").length;
      const normalCount = orders.filter((o) => o.priority === "Normal" || o.priority === "Low").length;
      const totalMinutes = orders.reduce((acc, o) => acc + (o.estimatedDurationMin || 60), 0);

      result.push({
        technicianName: techName,
        technicianEmail: email,
        date: selectedDate || new Date().toISOString().split("T")[0],
        orders,
        totalEstimatedMinutes: totalMinutes,
        urgentCount,
        highCount,
        normalCount,
      });
    });

    return result;
  }, [parseResult, selectedDate]);

  const activeRoster = useMemo(() => {
    return rosters.find((r) => r.technicianName === selectedTechName) || rosters[0] || null;
  }, [rosters, selectedTechName]);

  const handleRecordDispatch = (method: any, status: any) => {
    if (!activeRoster) return;
    const newLog: DispatchLogRecord = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      technicianName: activeRoster.technicianName,
      technicianEmail: activeRoster.technicianEmail,
      date: activeRoster.date,
      jobCount: activeRoster.orders.length,
      status: status || "Delivered",
      method: method || "Outlook EML",
      previewSubject: `${activeRoster.technicianName} | Install Schedule`,
      notes: `Manual dispatch via ${method}`,
    };
    setDispatchLogs((prev) => [newLog, ...prev]);
  };

  const toggleAnytime = (val: boolean) => {
    setBranding((prev) => ({ ...prev, useAnytimeTeardowns: val }));
  };

  const toggleLadotd = (val: boolean) => {
    setBranding((prev) => ({ ...prev, ladotdExclusive: val }));
  };

  const toggleCodExclusive = (val: boolean) => {
    setBranding((prev) => ({ ...prev, codExclusive: val }));
  };

  const toggleEmailUpdates = (val: boolean) => {
    setBranding((prev) => ({
      ...prev,
      emailUpdatesEnabled: val,
      // If Email Updates is toggled off, also turn off manual prior versions
      manualPriorVersionsEnabled: val ? prev.manualPriorVersionsEnabled : false,
    }));
  };

  const updateEmailUpdateDetails = (version: number | string, notes: string) => {
    setBranding((prev) => ({ ...prev, updateVersion: version, updateNotes: notes }));
  };

  const toggleManualPriorVersions = (val: boolean) => {
    setBranding((prev) => ({ ...prev, manualPriorVersionsEnabled: val }));
  };

  const updateManualPriorVersions = (
    notes: Array<{ version: number | string; notes: string; text?: string }>
  ) => {
    setBranding((prev) => ({ ...prev, previousUpdateNotes: notes }));
  };

  const toggleAdditionalNotes = (val: boolean) => {
    setBranding((prev) => ({ ...prev, additionalNotesEnabled: val }));
  };

  const updateAdditionalNotes = (notes: Array<{ id: string; day: string; text: string }>) => {
    setBranding((prev) => ({ ...prev, additionalNotes: notes }));
  };

  const toggleSundaySunday = (val: boolean) => {
    setBranding((prev) => ({ ...prev, sundaySundayEnabled: val }));
  };

  const toggleOverlappingSchedules = (val: boolean) => {
    setBranding((prev) => ({ ...prev, overlappingSchedulesEnabled: val }));
  };

  const toggleConductStudy = (val: boolean) => {
    setBranding((prev) => ({ ...prev, conductStudyEnabled: val }));
  };

  const updatePedsConductLines = (lines: any[]) => {
    setBranding((prev) => ({ ...prev, pedsConductLines: lines }));
  };

  const updateDayItemOrderOverrides = (overrides: Record<string, string[]>) => {
    setBranding((prev) => ({ ...prev, dayItemOrderOverrides: overrides }));
  };

  const toggleEmailSignature = (val: boolean) => {
    setBranding((prev) => ({ ...prev, emailSignatureEnabled: val }));
  };

  const selectEmailSignaturePreset = (preset: EmailSignaturePresetId) => {
    setBranding((prev) => ({
      ...prev,
      emailSignaturePreset: preset,
      emailSignatureEnabled: true,
    }));
  };

  const updateBranding = (partial: Partial<TemplateBranding>) => {
    setBranding((prev) => ({ ...prev, ...partial }));
  };

  const handleClearAll = () => {
    setCurrentCsvText("");
    setCurrentFileName("");
    setParseResult(null);
    setSelectedDate("");
    setSelectedTechName("");
    setBranding(DEFAULT_BRANDING);
  };

  const handleSelectTechFromHistory = (techName: string) => {
    // Find matching technician in loaded rosters if possible
    const match = rosters.find(
      (r) => cleanTechnicianName(r.technicianName).toLowerCase() === cleanTechnicianName(techName).toLowerCase()
    );
    if (match) {
      setSelectedTechName(match.technicianName);
    }
    setActiveTab("generator");
  };

  const handleLoadSavedEmailIntoGenerator = (record: GeneratedEmailRecord) => {
    // If the technician exists in the current roster, select them
    const match = rosters.find(
      (r) => cleanTechnicianName(r.technicianName).toLowerCase() === cleanTechnicianName(record.cleanTechName).toLowerCase()
    );
    if (match) {
      setSelectedTechName(match.technicianName);
    }

    // Apply saved branding configurations and notes
    if (record.brandingConfig) {
      setBranding((prev) => ({
        ...prev,
        ...record.brandingConfig,
        additionalNotes: record.additionalNotes || prev.additionalNotes,
        updateNotes: record.notes || record.brandingConfig?.updateNotes || "",
      }));
    } else if (record.additionalNotes) {
      setBranding((prev) => ({
        ...prev,
        additionalNotes: record.additionalNotes || [],
        additionalNotesEnabled: (record.additionalNotes && record.additionalNotes.length > 0) || false,
        updateNotes: record.notes || "",
      }));
    }

    setActiveTab("generator");
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-500 relative ${
        isDarkMode
          ? "bg-[#040906] text-[#D2FAD7] selection:bg-[#00FF41]/30 selection:text-white"
          : activeHolidaySeason === "halloween"
          ? "bg-[#FDF8F3] text-[#431407] selection:bg-[#FDBA74] selection:text-[#431407]"
          : activeHolidaySeason === "christmas_eve"
          ? "bg-[#F6F9FD] text-[#1E293B] selection:bg-[#BFDBFE] selection:text-[#1E293B]"
          : activeHolidaySeason === "christmas"
          ? "bg-[#FCF9F6] text-[#1C1917] selection:bg-[#FECACA] selection:text-[#1C1917]"
          : activeHolidaySeason === "new_year"
          ? "bg-[#FCFAF6] text-[#1E1B4B] selection:bg-[#FDE68A] selection:text-[#1E1B4B]"
          : "bg-[#FBF7F0] text-[#3F4A33] selection:bg-[#CFE0B8] selection:text-[#3F4A33]"
      }`}
    >
      {/* Animated Matrix Digital Code Stream & Backdrop Wallpaper (Active in Dark Mode) */}
      <MatrixRainBackground />

      {/* Animated Holiday Background Wallpaper & Particles (Active in Light Mode) */}
      <HolidayBackground />

      {/* Holiday Ambient Corner & Floating Theme Visuals (Ghosts, Spiderwebs, Snowman, Trees, Fireworks) */}
      <HolidayAmbientDecorations />

      {/* Top Main Navigation */}
      <Navbar
        onLoadSample={loadSampleDataset}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        activeDatasetName={currentFileName}
        totalOrdersCount={parseResult?.orders.length || 0}
        techniciansCount={rosters.length}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        savedEmailsCount={savedEmailsCount}
      />

      {/* Main App Canvas with Futuristic Tab Transitions */}
      <FuturisticTabTransition activeTab={activeTab}>
        {activeTab === "dashboard" ? (
          <main className="flex-1 w-full relative z-10">
            <DashboardLanding
              onGoToGenerator={() => setActiveTab("generator")}
              onGoToHistory={() => setActiveTab("history")}
              onLoadSample={loadSampleDataset}
              totalOrdersCount={parseResult?.orders.length || 0}
              techniciansCount={rosters.length}
              savedEmailsCount={savedEmailsCount}
              currentFileName={currentFileName}
            />
          </main>
        ) : (
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
            {/* View Mode Navigation Tabs: Generator vs Saved History vs ALG/TMC Approval */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-1 gap-3 transition-colors ${
                isDarkMode
                  ? "border-[#00FF41]/30"
                  : activeHolidaySeason === "halloween"
                  ? "border-[#FED7AA]"
                  : activeHolidaySeason === "christmas_eve"
                  ? "border-[#BFDBFE]"
                  : activeHolidaySeason === "christmas"
                  ? "border-[#BBF7D0]"
                  : activeHolidaySeason === "new_year"
                  ? "border-[#FDE68A]"
                  : "border-[#CFE0B8]"
              }`}
            >
              <div className="flex items-center space-x-2 -mb-px flex-wrap gap-y-2">
                {/* Tab 1: Email Generator */}
                <button
                  type="button"
                  onClick={() => setActiveTab("generator")}
                  className={`flex items-center space-x-2 py-2.5 px-3.5 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === "generator"
                      ? isDarkMode
                        ? "border-[#00FF41] text-[#00FF41] bg-[#08150D]/90 rounded-t-xl shadow-[0_0_15px_rgba(0,255,65,0.25)]"
                        : activeHolidaySeason === "halloween"
                        ? "border-[#EA580C] text-[#EA580C] bg-white rounded-t-xl shadow-xs ring-1 ring-[#FED7AA]"
                        : activeHolidaySeason === "christmas_eve"
                        ? "border-[#D97706] text-[#D97706] bg-white rounded-t-xl shadow-xs ring-1 ring-[#BFDBFE]"
                        : activeHolidaySeason === "christmas"
                        ? "border-[#DC2626] text-[#DC2626] bg-white rounded-t-xl shadow-xs ring-1 ring-[#FECACA]"
                        : activeHolidaySeason === "new_year"
                        ? "border-[#D97706] text-[#D97706] bg-white rounded-t-xl shadow-xs ring-1 ring-[#FDE68A]"
                        : "border-[#8AA66B] text-[#3F4A33] bg-white rounded-t-xl shadow-2xs"
                      : isDarkMode
                      ? "border-transparent text-[#D2FAD7]/80 hover:text-[#00FF41] hover:border-[#00FF41]/40"
                      : "border-transparent text-[#3F4A33]/70 hover:text-[#3F4A33] hover:border-[#CFE0B8]"
                  }`}
                >
                  <Mail
                    className={`w-4 h-4 shrink-0 ${
                      isDarkMode
                        ? "text-[#00FF41]"
                        : activeHolidaySeason === "halloween"
                        ? "text-[#EA580C]"
                        : activeHolidaySeason === "christmas_eve"
                        ? "text-[#D97706]"
                        : activeHolidaySeason === "christmas"
                        ? "text-[#DC2626]"
                        : activeHolidaySeason === "new_year"
                        ? "text-[#D97706]"
                        : "text-[#8AA66B]"
                    }`}
                  />
                  <span className="whitespace-nowrap">Email Generator &amp; Preview</span>
                  {rosters.length > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        isDarkMode
                          ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono"
                          : activeHolidaySeason === "halloween"
                          ? "bg-[#FFEDD5] text-[#9A3412] border-[#FDBA74]"
                          : activeHolidaySeason === "christmas_eve"
                          ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
                          : activeHolidaySeason === "christmas"
                          ? "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]"
                          : activeHolidaySeason === "new_year"
                          ? "bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]"
                          : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                      }`}
                    >
                      {rosters.length} Techs
                    </span>
                  )}
                </button>

                {/* Tab 2: Saved History Directory */}
                <button
                  type="button"
                  onClick={() => {
                    refreshSavedCount();
                    setActiveTab("history");
                  }}
                  className={`flex items-center space-x-2 py-2.5 px-3.5 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === "history"
                      ? isDarkMode
                        ? "border-[#00FF41] text-[#00FF41] bg-[#08150D]/90 rounded-t-xl shadow-[0_0_15px_rgba(0,255,65,0.25)]"
                        : activeHolidaySeason === "halloween"
                        ? "border-[#EA580C] text-[#EA580C] bg-white rounded-t-xl shadow-xs ring-1 ring-[#FED7AA]"
                        : activeHolidaySeason === "christmas_eve"
                        ? "border-[#D97706] text-[#D97706] bg-white rounded-t-xl shadow-xs ring-1 ring-[#BFDBFE]"
                        : activeHolidaySeason === "christmas"
                        ? "border-[#DC2626] text-[#DC2626] bg-white rounded-t-xl shadow-xs ring-1 ring-[#FECACA]"
                        : activeHolidaySeason === "new_year"
                        ? "border-[#D97706] text-[#D97706] bg-white rounded-t-xl shadow-xs ring-1 ring-[#FDE68A]"
                        : "border-[#3F4A33] text-[#3F4A33] bg-white rounded-t-xl shadow-2xs"
                      : isDarkMode
                      ? "border-transparent text-[#D2FAD7]/80 hover:text-[#00FF41] hover:border-[#00FF41]/40"
                      : "border-transparent text-[#3F4A33]/70 hover:text-[#3F4A33] hover:border-[#CFE0B8]"
                  }`}
                >
                  <History
                    className={`w-4 h-4 shrink-0 ${
                      isDarkMode
                        ? "text-[#00FF41]"
                        : activeHolidaySeason === "halloween"
                        ? "text-[#EA580C]"
                        : activeHolidaySeason === "christmas_eve"
                        ? "text-[#D97706]"
                        : activeHolidaySeason === "christmas"
                        ? "text-[#DC2626]"
                        : activeHolidaySeason === "new_year"
                        ? "text-[#D97706]"
                        : "text-[#3F4A33]"
                    }`}
                  />
                  <span className="whitespace-nowrap">Saved Emails History</span>
                  {savedEmailsCount > 0 && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs shrink-0 ${
                        isDarkMode
                          ? "bg-[#00FF41] text-[#040906] font-extrabold shadow-[0_0_8px_#00FF41]"
                          : activeHolidaySeason === "halloween"
                          ? "bg-[#EA580C] text-white shadow-xs"
                          : activeHolidaySeason === "christmas_eve"
                          ? "bg-[#D97706] text-white shadow-xs"
                          : activeHolidaySeason === "christmas"
                          ? "bg-[#DC2626] text-white shadow-xs"
                          : activeHolidaySeason === "new_year"
                          ? "bg-[#D97706] text-white shadow-xs"
                          : "bg-[#8AA66B] text-white"
                      }`}
                    >
                      {savedEmailsCount}
                    </span>
                  )}
                </button>

                {/* Tab 3: ALG/TMC Approval */}
                <button
                  type="button"
                  onClick={() => setActiveTab("algtmc")}
                  className={`flex items-center space-x-2 py-2.5 px-3.5 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap shrink-0 ${
                    activeTab === "algtmc"
                      ? isDarkMode
                        ? "border-[#00FF41] text-[#00FF41] bg-[#08150D]/90 rounded-t-xl shadow-[0_0_15px_rgba(0,255,65,0.25)]"
                        : activeHolidaySeason === "halloween"
                        ? "border-[#EA580C] text-[#EA580C] bg-white rounded-t-xl shadow-xs ring-1 ring-[#FED7AA]"
                        : activeHolidaySeason === "christmas_eve"
                        ? "border-[#D97706] text-[#D97706] bg-white rounded-t-xl shadow-xs ring-1 ring-[#BFDBFE]"
                        : activeHolidaySeason === "christmas"
                        ? "border-[#DC2626] text-[#DC2626] bg-white rounded-t-xl shadow-xs ring-1 ring-[#FECACA]"
                        : activeHolidaySeason === "new_year"
                        ? "border-[#D97706] text-[#D97706] bg-white rounded-t-xl shadow-xs ring-1 ring-[#FDE68A]"
                        : "border-[#8AA66B] text-[#3F4A33] bg-white rounded-t-xl shadow-2xs"
                      : isDarkMode
                      ? "border-transparent text-[#D2FAD7]/80 hover:text-[#00FF41] hover:border-[#00FF41]/40"
                      : "border-transparent text-[#3F4A33]/70 hover:text-[#3F4A33] hover:border-[#CFE0B8]"
                  }`}
                >
                  <FileText
                    className={`w-4 h-4 shrink-0 ${
                      isDarkMode
                        ? "text-[#00FF41]"
                        : activeHolidaySeason === "halloween"
                        ? "text-[#EA580C]"
                        : activeHolidaySeason === "christmas_eve"
                        ? "text-[#D97706]"
                        : activeHolidaySeason === "christmas"
                        ? "text-[#DC2626]"
                        : activeHolidaySeason === "new_year"
                        ? "text-[#D97706]"
                        : "text-[#8AA66B]"
                    }`}
                  />
                  <span className="whitespace-nowrap">ALG/TMC Approval</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isDarkMode
                        ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono"
                        : activeHolidaySeason === "halloween"
                        ? "bg-[#FFEDD5] text-[#9A3412] border-[#FDBA74]"
                        : activeHolidaySeason === "christmas_eve"
                        ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
                        : activeHolidaySeason === "christmas"
                        ? "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]"
                        : activeHolidaySeason === "new_year"
                        ? "bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]"
                        : "bg-[#8AA66B]/20 text-[#3F4A33] border-[#8AA66B]/40"
                    }`}
                  >
                    PDF Scanner
                  </span>
                </button>
              </div>

              {/* Quick Selectors (Technician & Work Week when multiple scanned) - Generator only */}
              {activeTab === "generator" && (
                <div className="hidden sm:flex items-center space-x-3 text-xs pb-1">
                  {parseResult?.detectedWorkWeeks && parseResult.detectedWorkWeeks.length > 1 && (
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isDarkMode
                            ? "text-[#D2FAD7]"
                            : activeHolidaySeason === "halloween"
                            ? "text-orange-950 font-bold"
                            : activeHolidaySeason === "christmas_eve"
                            ? "text-amber-950 font-bold"
                            : activeHolidaySeason === "christmas"
                            ? "text-emerald-950 font-bold"
                            : activeHolidaySeason === "new_year"
                            ? "text-amber-950 font-bold"
                            : "text-[#3F4A33]/80"
                        }`}
                      >
                        <Calendar
                          className={`w-3.5 h-3.5 ${
                            isDarkMode
                              ? "text-[#00FF41]"
                              : activeHolidaySeason === "halloween"
                              ? "text-orange-600"
                              : activeHolidaySeason === "christmas_eve"
                              ? "text-amber-600"
                              : activeHolidaySeason === "christmas"
                              ? "text-emerald-600"
                              : activeHolidaySeason === "new_year"
                              ? "text-amber-600"
                              : "text-[#8AA66B]"
                          }`}
                        />
                        <span>Work Week:</span>
                      </span>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={`font-bold rounded-xl px-3 py-1.5 text-xs focus:outline-hidden focus:ring-2 shadow-2xs cursor-pointer ${
                          isDarkMode
                            ? "bg-[#08150D] border border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                            : activeHolidaySeason === "halloween"
                            ? "bg-orange-100/80 border border-orange-300 text-orange-950 focus:ring-orange-500"
                            : activeHolidaySeason === "christmas_eve"
                            ? "bg-amber-100/80 border border-amber-300 text-amber-950 focus:ring-amber-500"
                            : activeHolidaySeason === "christmas"
                            ? "bg-emerald-100/80 border border-emerald-300 text-emerald-950 focus:ring-emerald-500"
                            : activeHolidaySeason === "new_year"
                            ? "bg-amber-100/80 border border-amber-300 text-amber-950 focus:ring-amber-500"
                            : "bg-[#EDF3E3] border border-[#CFE0B8] text-[#3F4A33] focus:ring-[#8AA66B]"
                        }`}
                      >
                        {parseResult.detectedWorkWeeks.map((ww) => (
                          <option key={ww.sundayDateStr} value={ww.sundayDateStr} className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>
                            {ww.isIncoming ? "👉 [Incoming] " : "[Past/Current] "}
                            {ww.workWeekLabel}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {rosters.length > 0 && (
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isDarkMode
                            ? "text-[#D2FAD7]"
                            : activeHolidaySeason === "halloween"
                            ? "text-orange-950 font-bold"
                            : activeHolidaySeason === "christmas_eve"
                            ? "text-amber-950 font-bold"
                            : activeHolidaySeason === "christmas"
                            ? "text-emerald-950 font-bold"
                            : activeHolidaySeason === "new_year"
                            ? "text-amber-950 font-bold"
                            : "text-[#3F4A33]/80"
                        }`}
                      >
                        <Users
                          className={`w-3.5 h-3.5 ${
                            isDarkMode
                              ? "text-[#00FF41]"
                              : activeHolidaySeason === "halloween"
                              ? "text-orange-600"
                              : activeHolidaySeason === "christmas_eve"
                              ? "text-amber-600"
                              : activeHolidaySeason === "christmas"
                              ? "text-emerald-600"
                              : activeHolidaySeason === "new_year"
                              ? "text-amber-600"
                              : "text-[#8AA66B]"
                          }`}
                        />
                        <span>Technician:</span>
                      </span>
                      <select
                        value={selectedTechName}
                        onChange={(e) => setSelectedTechName(e.target.value)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-hidden focus:ring-2 shadow-2xs cursor-pointer ${
                          isDarkMode
                            ? "bg-[#08150D] border border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                            : activeHolidaySeason === "halloween"
                            ? "bg-white border border-orange-300 text-stone-900 focus:ring-orange-500"
                            : activeHolidaySeason === "christmas_eve"
                            ? "bg-white border border-blue-300 text-slate-900 focus:ring-blue-500"
                            : activeHolidaySeason === "christmas"
                            ? "bg-white border border-emerald-300 text-stone-900 focus:ring-emerald-500"
                            : activeHolidaySeason === "new_year"
                            ? "bg-white border border-amber-300 text-stone-900 focus:ring-amber-500"
                            : "bg-white border border-[#CFE0B8] text-[#3F4A33] focus:ring-[#8AA66B]"
                        }`}
                      >
                        {rosters.map((r) => (
                          <option key={r.technicianName} value={r.technicianName} className={isDarkMode ? "bg-[#08150D] text-[#E0FFE5]" : ""}>
                            {r.technicianName} ({r.orders.length} stops)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tab Content Display */}
            {activeTab === "generator" && (
              <>
                {/* CSV Ingestion Dropzone - exclusively visible on Generator tab */}
                <CsvUploadZone
                  onFileUpload={handleFileUpload}
                  onLoadSample={loadSampleDataset}
                  parseResult={parseResult}
                  currentFileName={currentFileName}
                  onOpenMappingModal={() => setIsMappingModalOpen(true)}
                  onClearFile={handleClearAll}
                />

                {/* Mobile Selectors */}
                {((parseResult?.detectedWorkWeeks && parseResult.detectedWorkWeeks.length > 1) || rosters.length > 0) && (
                  <div
                    className={`flex sm:hidden flex-col gap-2 rounded-xl p-3 text-xs border ${
                      isDarkMode
                        ? "bg-[#08150D] border-[#00FF41]/35 text-[#E0FFE5]"
                        : activeHolidaySeason === "halloween"
                        ? "bg-orange-50 border-orange-200 text-orange-950"
                        : activeHolidaySeason === "christmas_eve"
                        ? "bg-blue-50 border-blue-200 text-blue-950"
                        : activeHolidaySeason === "christmas"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                        : activeHolidaySeason === "new_year"
                        ? "bg-amber-50 border-amber-200 text-amber-950"
                        : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
                    }`}
                  >
                    {parseResult?.detectedWorkWeeks && parseResult.detectedWorkWeeks.length > 1 && (
                      <div className="flex items-center justify-between">
                        <span className={`font-bold flex items-center gap-1 ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>
                          <Calendar className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                          <span>Work Week:</span>
                        </span>
                        <select
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className={`rounded-xl px-2.5 py-1 text-xs font-bold border ${
                            isDarkMode
                              ? "bg-[#0C1E12] border-[#00FF41]/40 text-[#E0FFE5]"
                              : activeHolidaySeason === "halloween"
                              ? "bg-white border-orange-300 text-stone-900"
                              : activeHolidaySeason === "christmas_eve"
                              ? "bg-white border-blue-300 text-slate-900"
                              : activeHolidaySeason === "christmas"
                              ? "bg-white border-emerald-300 text-stone-900"
                              : activeHolidaySeason === "new_year"
                              ? "bg-white border-amber-300 text-stone-900"
                              : "bg-white border-[#CFE0B8] text-[#3F4A33]"
                          }`}
                        >
                          {parseResult.detectedWorkWeeks.map((ww) => (
                            <option key={ww.sundayDateStr} value={ww.sundayDateStr}>
                              {ww.isIncoming ? "👉 Incoming: " : ""}
                              {ww.workWeekLabel}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {rosters.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>Active Technician:</span>
                        <select
                          value={selectedTechName}
                          onChange={(e) => setSelectedTechName(e.target.value)}
                          className={`rounded-xl px-2.5 py-1 text-xs font-bold border ${
                            isDarkMode
                              ? "bg-[#0C1E12] border-[#00FF41]/40 text-[#E0FFE5]"
                              : activeHolidaySeason === "halloween"
                              ? "bg-white border-orange-300 text-stone-900"
                              : activeHolidaySeason === "christmas_eve"
                              ? "bg-white border-blue-300 text-slate-900"
                              : activeHolidaySeason === "christmas"
                              ? "bg-white border-emerald-300 text-stone-900"
                              : activeHolidaySeason === "new_year"
                              ? "bg-white border-amber-300 text-stone-900"
                              : "bg-white border-[#CFE0B8] text-[#3F4A33]"
                          }`}
                        >
                          {rosters.map((r) => (
                            <option key={r.technicianName} value={r.technicianName}>
                              {r.technicianName} ({r.orders.length} stops)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Outlook Email Preview & Generator */}
                {activeRoster ? (
                  <OutlookEmailPreview
                    roster={activeRoster}
                    branding={branding}
                    currentStyle={currentStyle}
                    onRecordDispatch={handleRecordDispatch}
                    onToggleAnytime={toggleAnytime}
                    onToggleLadotd={toggleLadotd}
                    onToggleCodExclusive={toggleCodExclusive}
                    onToggleEmailUpdates={toggleEmailUpdates}
                    onUpdateEmailUpdateDetails={updateEmailUpdateDetails}
                    onToggleManualPriorVersions={toggleManualPriorVersions}
                    onUpdateManualPriorVersions={updateManualPriorVersions}
                    onToggleAdditionalNotes={toggleAdditionalNotes}
                    onUpdateAdditionalNotes={updateAdditionalNotes}
                    onToggleSundaySunday={toggleSundaySunday}
                    onToggleOverlappingSchedules={toggleOverlappingSchedules}
                    onToggleConductStudy={toggleConductStudy}
                    onUpdatePedsConductLines={updatePedsConductLines}
                    onUpdateDayItemOrderOverrides={updateDayItemOrderOverrides}
                    onToggleEmailSignature={toggleEmailSignature}
                    onSelectEmailSignaturePreset={selectEmailSignaturePreset}
                    onUpdateBranding={updateBranding}
                    onClearPreview={handleClearAll}
                  />
                ) : (
                  <div
                    className={`rounded-2xl shadow-xs overflow-hidden transition-all duration-300 border ${
                      isDarkMode
                        ? "bg-[#08150D]/90 border-[#00FF41]/40 shadow-[0_0_25px_rgba(0,255,65,0.15)] backdrop-blur-md"
                        : activeHolidaySeason === "halloween"
                        ? "bg-white/95 border-2 border-orange-500/40 shadow-md shadow-orange-950/10 backdrop-blur-md"
                        : activeHolidaySeason === "christmas_eve"
                        ? "bg-white/95 border-2 border-blue-500/40 shadow-md shadow-blue-950/10 backdrop-blur-md"
                        : activeHolidaySeason === "christmas"
                        ? "bg-white/95 border-2 border-emerald-500/40 shadow-md shadow-emerald-950/10 backdrop-blur-md"
                        : activeHolidaySeason === "new_year"
                        ? "bg-white/95 border-2 border-amber-500/40 shadow-md shadow-amber-950/10 backdrop-blur-md"
                        : "bg-white border-2 border-[#CFE0B8]"
                    }`}
                  >
                    {/* Minimalist Graphic Header Banner for empty state */}
                    <div
                      className={`relative w-full h-24 sm:h-28 overflow-hidden text-white ${
                        isDarkMode
                          ? "bg-[#040906] border-b border-[#00FF41]/30"
                          : activeHolidaySeason === "halloween"
                          ? "bg-gradient-to-r from-stone-950 via-orange-950 to-stone-900 border-b border-orange-500/40"
                          : activeHolidaySeason === "christmas_eve"
                          ? "bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 border-b border-blue-500/40"
                          : activeHolidaySeason === "christmas"
                          ? "bg-gradient-to-r from-emerald-950 via-stone-900 to-red-950 border-b border-emerald-500/40"
                          : activeHolidaySeason === "new_year"
                          ? "bg-gradient-to-r from-stone-950 via-amber-950 to-stone-900 border-b border-amber-500/40"
                          : "bg-[#3F4A33]"
                      }`}
                    >
                      <div className="absolute inset-0 z-0 pointer-events-none">
                        <img
                          src={generatorMinimalBanner}
                          alt="Outlook Generator Banner"
                          className={`w-full h-full object-cover object-center ${
                            isDarkMode
                              ? "opacity-20 mix-blend-screen filter saturate-200 hue-rotate-90"
                              : activeHolidaySeason !== "standard"
                              ? "opacity-15 mix-blend-luminosity"
                              : "opacity-30 mix-blend-luminosity"
                          }`}
                        />
                        <div
                          className={`absolute inset-0 ${
                            isDarkMode
                              ? "bg-gradient-to-r from-[#040906] via-[#040906]/85 to-transparent"
                              : activeHolidaySeason === "halloween"
                              ? "bg-gradient-to-r from-orange-950/90 via-stone-900/85 to-orange-950/60"
                              : activeHolidaySeason === "christmas_eve"
                              ? "bg-gradient-to-r from-blue-950/90 via-slate-900/85 to-blue-950/60"
                              : activeHolidaySeason === "christmas"
                              ? "bg-gradient-to-r from-emerald-950/90 via-stone-900/85 to-red-950/60"
                              : activeHolidaySeason === "new_year"
                              ? "bg-gradient-to-r from-amber-950/90 via-stone-900/85 to-amber-950/60"
                              : "bg-gradient-to-r from-[#3F4A33] via-[#3F4A33]/85 to-[#3F4A33]/45"
                          }`}
                        />
                      </div>
                      <div className="relative z-10 px-6 h-full flex flex-col justify-center">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-widest ${
                            isDarkMode
                              ? "text-[#00FF41] font-mono flex items-center gap-1.5"
                              : activeHolidaySeason === "halloween"
                              ? "text-orange-400 font-bold"
                              : activeHolidaySeason === "christmas_eve"
                              ? "text-amber-300 font-bold"
                              : activeHolidaySeason === "christmas"
                              ? "text-emerald-300 font-bold"
                              : activeHolidaySeason === "new_year"
                              ? "text-amber-300 font-bold"
                              : "text-[#CFE0B8]"
                          }`}
                        >
                          {isDarkMode && <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-ping" />}
                          Outlook Email Generator Workstation
                        </span>
                        <h2
                          className={`text-base sm:text-lg font-black tracking-tight ${
                            isDarkMode ? "text-[#E0FFE5]" : "text-white"
                          }`}
                        >
                          Technician Weekly Dispatch Engine
                        </h2>
                      </div>
                    </div>

                    <div className="p-8 sm:p-12 text-center">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs transition-transform hover:scale-105 ${
                          isDarkMode
                            ? "bg-[#00FF41]/10 border border-[#00FF41]/40 shadow-[0_0_15px_rgba(0,255,65,0.3)] text-[#00FF41]"
                            : activeHolidaySeason === "halloween"
                            ? "bg-orange-100 border border-orange-300 text-orange-600 shadow-orange-600/10"
                            : activeHolidaySeason === "christmas_eve"
                            ? "bg-blue-100 border border-blue-300 text-blue-600 shadow-blue-600/10"
                            : activeHolidaySeason === "christmas"
                            ? "bg-emerald-100 border border-emerald-300 text-emerald-600 shadow-emerald-600/10"
                            : activeHolidaySeason === "new_year"
                            ? "bg-amber-100 border border-amber-300 text-amber-600 shadow-amber-600/10"
                            : "bg-[#EDF3E3] border border-[#CFE0B8] text-[#3F4A33]"
                        }`}
                      >
                        <Mail className="w-6 h-6" />
                      </div>
                      <h3
                        className={`text-base font-extrabold mb-1 ${
                          isDarkMode
                            ? "text-[#E0FFE5]"
                            : activeHolidaySeason !== "standard"
                            ? "text-stone-900"
                            : "text-[#3F4A33]"
                        }`}
                      >
                        No technician schedule currently loaded
                      </h3>
                      <p
                        className={`text-xs max-w-md mx-auto mb-5 leading-relaxed ${
                          isDarkMode
                            ? "text-[#D2FAD7]/80"
                            : activeHolidaySeason !== "standard"
                            ? "text-stone-600"
                            : "text-[#3F4A33]/70"
                        }`}
                      >
                        Upload your dispatch CSV in the upload section above, or load one of the built-in sample rosters below to preview the formatted Outlook email schedule.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = SAMPLE_DATASETS[0];
                          if (sample) loadSampleDataset(sample);
                        }}
                        className={`group inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs bg-transparent border-2 shadow-xs transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                          isDarkMode
                            ? "border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41]/20 hover:shadow-[0_0_18px_rgba(0,255,65,0.45)]"
                            : activeHolidaySeason === "halloween"
                            ? "border-orange-600 hover:border-orange-700 text-orange-700 hover:bg-orange-500/15"
                            : activeHolidaySeason === "christmas_eve"
                            ? "border-blue-600 hover:border-blue-700 text-blue-700 hover:bg-blue-500/15"
                            : activeHolidaySeason === "christmas"
                            ? "border-red-600 hover:border-red-700 text-red-700 hover:bg-red-500/15"
                            : activeHolidaySeason === "new_year"
                            ? "border-amber-600 hover:border-amber-700 text-amber-700 hover:bg-amber-500/15"
                            : "border-[#8AA66B] hover:border-[#3F4A33] text-[#3F4A33] hover:bg-[#8AA66B]/15"
                        }`}
                      >
                        <Sparkles
                          className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                            isDarkMode
                              ? "text-[#00FF41]"
                              : activeHolidaySeason === "halloween"
                              ? "text-orange-600"
                              : activeHolidaySeason === "christmas_eve"
                              ? "text-blue-600"
                              : activeHolidaySeason === "christmas"
                              ? "text-red-600"
                              : activeHolidaySeason === "new_year"
                              ? "text-amber-600"
                              : "text-[#8AA66B]"
                          }`}
                        />
                        <span>Load Sample Technician Schedule</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Saved History Tab View - direct and distraction-free */}
            {activeTab === "history" && (
              <SavedEmailsHistoryTab
                activeTechName={activeRoster?.technicianName}
                onSelectTechInGenerator={handleSelectTechFromHistory}
                onLoadSavedEmailIntoGenerator={handleLoadSavedEmailIntoGenerator}
              />
            )}

            {/* ALG/TMC Approval Tab View - direct and distraction-free */}
            {activeTab === "algtmc" && (
              <div className="space-y-4">
                <AlgTmcApprovalPanel
                  branding={branding}
                  onUpdateBranding={updateBranding}
                />
              </div>
            )}
        </main>
      )}
      </FuturisticTabTransition>

      {/* Global Application Footer */}
      <Footer
        onGoToDashboard={() => setActiveTab("dashboard")}
        onGoToGenerator={() => setActiveTab("generator")}
        onGoToHistory={() => {
          refreshSavedCount();
          setActiveTab("history");
        }}
        onGoToAlgTmc={() => setActiveTab("algtmc")}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAuditLogs={() => setIsHistoryModalOpen(true)}
        savedEmailsCount={savedEmailsCount}
        totalOrdersCount={parseResult?.orders.length || 0}
        techniciansCount={rosters.length}
      />

      {/* Column Mapping Modal */}
      {parseResult && (
        <ColumnMappingModal
          isOpen={isMappingModalOpen}
          onClose={() => setIsMappingModalOpen(false)}
          headers={parseResult.headers}
          currentMapping={parseResult.mapping}
          sampleRows={parseResult.rawRows}
          onSaveMapping={handleSaveMapping}
        />
      )}

      {/* Settings & Branding Modal */}
      <SettingsBrandingModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        branding={branding}
        onSaveBranding={(newB) => setBranding(newB)}
      />

      {/* Dispatch History Audit Modal */}
      <DispatchHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        logs={dispatchLogs}
        onClearLogs={() => setDispatchLogs([])}
      />
    </div>
  );
}
