import React, { useState, useEffect } from "react";
import {
  X,
  Footprints,
  CheckSquare,
  Square,
  Sparkles,
  Building2,
  Check,
  AlertCircle,
  Eye,
  FileText,
  ExternalLink,
  RotateCcw,
  Link as LinkIcon,
} from "lucide-react";
import { TechnicianRoster, TemplateBranding } from "../types";
import {
  detectCodPedsProjectsInRoster,
  CodPedsProjectInfo,
  DEFAULT_COD_SCHOOL_ZONE_FORM_URL,
  DEFAULT_COD_SCHOOL_ZONE_FORM_TEXT,
  getWeekDateRange,
  cleanTechnicianName,
} from "../utils/outlookTemplateGenerator";
import { useTheme } from "../context/ThemeContext";

interface CodSightDistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: TechnicianRoster;
  branding: TemplateBranding;
  onSaveLocations: (
    locations: Record<string, string[]>,
    schoolZoneConfig?: {
      enabled: boolean;
      url: string;
      text: string;
    }
  ) => void;
}

export const CodSightDistanceModal: React.FC<CodSightDistanceModalProps> = ({
  isOpen,
  onClose,
  roster,
  branding,
  onSaveLocations,
}) => {
  const { isDarkMode } = useTheme();
  const [selectedMap, setSelectedMap] = useState<Record<string, string[]>>({});
  const [schoolZoneEnabled, setSchoolZoneEnabled] = useState<boolean>(true);
  const [schoolZoneUrl, setSchoolZoneUrl] = useState<string>(DEFAULT_COD_SCHOOL_ZONE_FORM_URL);
  const [schoolZoneText, setSchoolZoneText] = useState<string>(DEFAULT_COD_SCHOOL_ZONE_FORM_TEXT);
  const [showAdvancedUrl, setShowAdvancedUrl] = useState<boolean>(false);

  // Detect COD PEDS projects in the current roster
  const codProjects: CodPedsProjectInfo[] = React.useMemo(() => {
    return detectCodPedsProjectsInRoster(roster.orders || []);
  }, [roster.orders]);

  const weekInfo = React.useMemo(() => {
    return getWeekDateRange(roster.date, branding);
  }, [roster.date, branding]);

  // Sync state when modal opens or branding changes
  useEffect(() => {
    if (isOpen) {
      setSelectedMap({ ...(branding.codSightDistanceLocations || {}) });
      setSchoolZoneEnabled(
        branding.codSchoolZonePedFormEnabled === undefined
          ? true
          : Boolean(branding.codSchoolZonePedFormEnabled)
      );
      setSchoolZoneUrl(branding.codSchoolZonePedFormUrl || DEFAULT_COD_SCHOOL_ZONE_FORM_URL);
      setSchoolZoneText(branding.codSchoolZonePedFormText || DEFAULT_COD_SCHOOL_ZONE_FORM_TEXT);
    }
  }, [isOpen, branding]);

  if (!isOpen) return null;

  const handleToggleLocation = (projectNumber: string, suffix: string) => {
    setSelectedMap((prev) => {
      const current = prev[projectNumber] || [];
      const exists = current.includes(suffix);
      const nextList = exists
        ? current.filter((s) => s !== suffix)
        : [...current, suffix].sort((a, b) => {
            const numA = parseInt(a, 10);
            const numB = parseInt(b, 10);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.localeCompare(b);
          });

      return {
        ...prev,
        [projectNumber]: nextList,
      };
    });
  };

  const handleSelectAllForProject = (project: CodPedsProjectInfo) => {
    setSelectedMap((prev) => ({
      ...prev,
      [project.projectNumber]: [...project.uniqueSuffixes],
    }));
  };

  const handleClearForProject = (projectNumber: string) => {
    setSelectedMap((prev) => ({
      ...prev,
      [projectNumber]: [],
    }));
  };

  const handleClearAll = () => {
    setSelectedMap({});
  };

  const handleResetSchoolZoneForm = () => {
    setSchoolZoneUrl(DEFAULT_COD_SCHOOL_ZONE_FORM_URL);
    setSchoolZoneText(DEFAULT_COD_SCHOOL_ZONE_FORM_TEXT);
  };

  const handleSave = () => {
    onSaveLocations(selectedMap, {
      enabled: schoolZoneEnabled,
      url: schoolZoneUrl,
      text: schoolZoneText,
    });
    onClose();
  };

  const totalCheckedCount = Object.values(selectedMap).reduce<number>(
    (acc, list) => acc + (Array.isArray(list) ? list.length : 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          isDarkMode
            ? "bg-[#08150D] border-[#00FF41]/40 shadow-[0_0_30px_rgba(0,255,65,0.2)] text-[#D2FAD7]"
            : "bg-white border-[#CFE0B8] text-[#3F4A33]"
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isDarkMode
              ? "bg-[#040906] border-[#00FF41]/30 text-white"
              : "bg-[#3F4A33] border-[#CFE0B8]/30 text-white"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs ${
                isDarkMode
                  ? "bg-[#00FF41]/20 border-[#00FF41]/40 text-[#00FF41]"
                  : "bg-[#8AA66B]/30 border-[#CFE0B8]/30 text-[#EDF3E3]"
              }`}
            >
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold tracking-tight text-white">
                  City of Dallas (COD Exclusive) Options
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDarkMode
                      ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                      : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                  }`}
                >
                  COD Exclusive
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-[#D2FAD7]/80" : "text-[#EDF3E3]/80"}`}>
                Manage Sight Distance teardown locations and School Zone PED Count Form links.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition cursor-pointer ${
              isDarkMode
                ? "text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/15"
                : "text-[#CFE0B8] hover:text-white hover:bg-white/10"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div
          className={`p-6 overflow-y-auto space-y-5 flex-1 text-xs ${
            isDarkMode ? "bg-[#08150D]" : "bg-[#FBF7F0]/40"
          }`}
        >
          {/* SECTION 1: School Zone PED Count Site Data Form Link */}
          <div
            className={`border rounded-2xl p-4 shadow-2xs space-y-3 ${
              isDarkMode
                ? "bg-[#0C1E12] border-[#00FF41]/35 text-[#D2FAD7]"
                : "bg-white border-[#CFE0B8]"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-2.5 ${
                isDarkMode ? "border-[#00FF41]/20" : "border-[#CFE0B8]/40"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-base">📝</span>
                <div>
                  <h3
                    className={`font-bold text-xs flex items-center space-x-1.5 ${
                      isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"
                    }`}
                  >
                    <span>School Zone PED Count Site Data Form Link</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        isDarkMode
                          ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono"
                          : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                      }`}
                    >
                      Header Link
                    </span>
                  </h3>
                  <p className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
                    Appends the Google Form link under the Location Setup Photo Upload Link in the email header.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={schoolZoneEnabled}
                  onChange={(e) => setSchoolZoneEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                    isDarkMode
                      ? "bg-[#040906] border border-[#00FF41]/40 peer-checked:bg-[#00FF41]"
                      : "bg-zinc-200 peer-checked:bg-[#8AA66B]"
                  }`}
                />
                <span
                  className={`ml-2 text-xs font-semibold ${
                    isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"
                  }`}
                >
                  {schoolZoneEnabled ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>

            {schoolZoneEnabled && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className={`text-[11px] font-bold block mb-1 ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>
                      Link Display Text
                    </label>
                    <input
                      type="text"
                      value={schoolZoneText}
                      onChange={(e) => setSchoolZoneText(e.target.value)}
                      placeholder="School Zone PED Count Site Data Form"
                      className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 border ${
                        isDarkMode
                          ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                          : "bg-[#FBF7F0] border-[#CFE0B8] text-zinc-900 focus:ring-[#8AA66B]"
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={`text-[11px] font-bold block ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>
                        Google Form Destination URL
                      </label>
                      <button
                        type="button"
                        onClick={handleResetSchoolZoneForm}
                        className={`text-[10px] font-bold flex items-center space-x-0.5 cursor-pointer ${
                          isDarkMode ? "text-[#00FF41] hover:text-[#39FF14]" : "text-[#8AA66B] hover:text-[#3F4A33]"
                        }`}
                        title="Reset to default URL"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Reset Default</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="url"
                        value={schoolZoneUrl}
                        onChange={(e) => setSchoolZoneUrl(e.target.value)}
                        placeholder="https://docs.google.com/forms/..."
                        className={`w-full px-2.5 py-1.5 rounded-xl text-[11px] font-mono pr-8 focus:outline-hidden focus:ring-2 border ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                            : "bg-[#FBF7F0] border-[#CFE0B8] text-zinc-800 focus:ring-[#8AA66B]"
                        }`}
                      />
                      <a
                        href={schoolZoneUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`absolute right-2 top-2 ${isDarkMode ? "text-[#00FF41] hover:text-[#39FF14]" : "text-[#8AA66B] hover:text-[#3F4A33]"}`}
                        title="Open form in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Live Preview of Header Links Section */}
                <div
                  className={`border rounded-xl p-3 space-y-1.5 ${
                    isDarkMode
                      ? "bg-[#040906] border-[#00FF41]/30"
                      : "bg-[#EDF3E3]/60 border-[#CFE0B8]"
                  }`}
                >
                  <div
                    className={`text-[10px] font-bold uppercase flex items-center space-x-1 ${
                      isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"
                    }`}
                  >
                    <Eye className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                    <span>Header Links Preview:</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-zinc-200 font-sans text-[11px] leading-relaxed text-zinc-800 space-y-0.5 outlook-body-wrapper">
                    <div>
                      Airtable Schedule Link:{" "}
                      <span className="text-[#0078D4] underline">
                        {cleanTechnicianName(roster.technicianName)} Airtable View
                      </span>
                    </div>
                    <div>
                      🌍 Google Maps App:{" "}
                      <span className="text-[#0078D4] underline">
                        {cleanTechnicianName(roster.technicianName)} | {weekInfo.formattedRange} Maps
                      </span>
                    </div>
                    <div>
                      📷 Location Setup Photo Upload Link:{" "}
                      <span className="text-[#0078D4] underline">
                        {branding.photoUploadLinkText || "South Central Job Photos"}
                      </span>
                    </div>
                    <div className="pt-0.5">
                      <span className="text-base align-middle">📝</span>{" "}
                      <a
                        href={schoolZoneUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#800080" }}
                        className="underline font-normal hover:opacity-80"
                      >
                        {schoolZoneText || "School Zone PED Count Site Data Form"}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Conduct Sight Distance Location Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3
                className={`font-bold text-xs flex items-center space-x-1.5 ${
                  isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"
                }`}
              >
                <Footprints className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                <span>Conduct Sight Distance Teardown Requirement</span>
              </h3>
              {totalCheckedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className={`text-[11px] font-semibold cursor-pointer ${
                    isDarkMode ? "text-rose-400 hover:text-rose-300" : "text-[#3F4A33] hover:text-red-700"
                  }`}
                >
                  Clear all locations
                </button>
              )}
            </div>

            {/* Explanation Banner */}
            <div
              className={`border rounded-xl p-3 flex items-start space-x-2.5 ${
                isDarkMode
                  ? "bg-[#0C1E12] border-[#00FF41]/40 text-[#D2FAD7]"
                  : "bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
              }`}
            >
              <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
              <div className="space-y-1">
                <div className={`font-bold ${isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"}`}>
                  PEDS &amp; Sight Distance Requirement Placement:
                </div>
                <p className={`text-[11px] leading-relaxed ${isDarkMode ? "text-[#D2FAD7]/90" : "text-[#3F4A33]/90"}`}>
                  When a location is checked, the schedule automatically appends the{" "}
                  <strong className="text-black font-bold bg-[#FFFF00] px-1 py-0.2 rounded">
                    Conduct Sight Distance and additional PED requirement:
                  </strong>{" "}
                  line with the checked location numbers directly under the Teardown line for that project.
                </p>
              </div>
            </div>

            {codProjects.length === 0 ? (
              <div
                className={`border border-dashed rounded-2xl p-6 text-center space-y-2.5 ${
                  isDarkMode
                    ? "bg-[#040906] border-[#00FF41]/30"
                    : "bg-white border-[#CFE0B8]"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto border ${
                    isDarkMode
                      ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/30 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                      : "bg-[#EDF3E3] text-[#8AA66B] border-[#CFE0B8]"
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className={`font-bold text-xs ${isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"}`}>
                    No City of Dallas PEDS Projects in Current Schedule
                  </h4>
                  <p className={`text-[11px] max-w-md mx-auto ${isDarkMode ? "text-[#D2FAD7]/75" : "text-zinc-500"}`}>
                    No work orders in <strong>{roster.technicianName}</strong>&apos;s schedule match both a{" "}
                    <strong>PEDS / Ped</strong> study and a <strong>City of Dallas List</strong> scheduling note.
                  </p>
                </div>
                <div className={`pt-1 text-[10px] ${isDarkMode ? "text-[#D2FAD7]/50" : "text-zinc-400"}`}>
                  Example matching order:{" "}
                  <code
                    className={`px-1.5 py-0.5 rounded font-mono border ${
                      isDarkMode
                        ? "bg-[#0C1E12] text-[#00FF41] border-[#00FF41]/40"
                        : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                    }`}
                  >
                    26-470285 Peds (City of Dallas – List 105)
                  </code>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {codProjects.map((proj) => {
                  const checked = selectedMap[proj.projectNumber] || [];
                  const allSelected =
                    proj.uniqueSuffixes.length > 0 &&
                    proj.uniqueSuffixes.every((s) => checked.includes(s));

                  return (
                    <div
                      key={proj.projectNumber}
                      className={`border rounded-2xl p-4 shadow-2xs space-y-3 transition-all ${
                        isDarkMode
                          ? "bg-[#0C1E12] border-[#00FF41]/35 hover:border-[#00FF41]/70"
                          : "bg-white border-[#CFE0B8] hover:border-[#8AA66B]"
                      }`}
                    >
                      {/* Project Header */}
                      <div
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 ${
                          isDarkMode ? "border-[#00FF41]/20" : "border-[#CFE0B8]/40"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className={`p-1.5 rounded-lg border ${
                              isDarkMode
                                ? "bg-[#00FF41]/15 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                                : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                            }`}
                          >
                            <Building2 className={`w-4 h-4 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                          </span>
                          <div>
                            <div
                              className={`font-bold text-xs flex items-center space-x-1.5 ${
                                isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"
                              }`}
                            >
                              <span>{proj.projectNumber}</span>
                              <span className={`font-bold ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`}>
                                {proj.studyLabel}
                              </span>
                              <span className={isDarkMode ? "text-[#D2FAD7]/80 font-semibold" : "text-[#3F4A33]/80 font-semibold"}>
                                {proj.codKeyword}
                              </span>
                            </div>
                            <div className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
                              {proj.uniqueSuffixes.length} location{proj.uniqueSuffixes.length > 1 ? "s" : ""} detected •{" "}
                              {proj.totalCameras} camera{proj.totalCameras !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>

                        {/* Quick select buttons */}
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              allSelected
                                ? handleClearForProject(proj.projectNumber)
                                : handleSelectAllForProject(proj)
                            }
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                              isDarkMode
                                ? "bg-[#08150D] hover:bg-[#00FF41]/20 border-[#00FF41]/40 text-[#00FF41] font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                                : "bg-white hover:bg-[#EDF3E3] border-[#CFE0B8] text-[#3F4A33]"
                            }`}
                          >
                            {allSelected ? "Deselect All" : "Select All"}
                          </button>
                        </div>
                      </div>

                      {/* Location Checkbox Grid */}
                      <div className="space-y-1.5">
                        <label className={`text-[11px] font-bold uppercase tracking-wide ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>
                          Select Locations for Conduct Sight Distance:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {proj.uniqueSuffixes.map((suf) => {
                            const isChecked = checked.includes(suf);
                            const locItems = proj.locations.filter((l) => l.suffix === suf);
                            const subText = locItems
                              .map((l) => l.cameraCountText)
                              .filter(Boolean)
                              .join(", ");

                            return (
                              <button
                                key={suf}
                                type="button"
                                onClick={() => handleToggleLocation(proj.projectNumber, suf)}
                                className={`flex items-start space-x-2.5 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                                  isChecked
                                    ? isDarkMode
                                      ? "bg-[#00FF41]/20 border-[#00FF41] text-[#E0FFE5] ring-1 ring-[#00FF41]/50 shadow-[0_0_10px_rgba(0,255,65,0.2)]"
                                      : "bg-[#EDF3E3] border-[#8AA66B] text-[#3F4A33] ring-1 ring-[#8AA66B]/50"
                                    : isDarkMode
                                    ? "bg-[#040906] border-[#00FF41]/25 text-[#D2FAD7] hover:border-[#00FF41]/50"
                                    : "bg-white border-[#CFE0B8] text-zinc-700 hover:bg-[#FBF7F0]"
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {isChecked ? (
                                    <CheckSquare className={`w-4 h-4 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                                  ) : (
                                    <Square className={`w-4 h-4 ${isDarkMode ? "text-[#D2FAD7]/40" : "text-zinc-400"}`} />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-xs flex items-center justify-between">
                                    <span className={`font-mono ${isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"}`}>{suf}</span>
                                    {isChecked && (
                                      <span
                                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                          isDarkMode
                                            ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono"
                                            : "bg-[#CFE0B8] text-[#3F4A33]"
                                        }`}
                                      >
                                        Checked
                                      </span>
                                    )}
                                  </div>
                                  {subText && (
                                    <div className={`text-[10px] italic truncate mt-0.5 ${isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"}`}>
                                      {subText}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Live Output Preview for this Project */}
                      <div
                        className={`border rounded-xl p-2.5 space-y-1 ${
                          isDarkMode
                            ? "bg-[#040906] border-[#00FF41]/25"
                            : "bg-[#FBF7F0] border-[#CFE0B8]"
                        }`}
                      >
                        <div
                          className={`text-[10px] font-bold uppercase flex items-center space-x-1 ${
                            isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"
                          }`}
                        >
                          <Eye className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                          <span>Teardown Section Output Preview:</span>
                        </div>

                        {checked.length > 0 ? (
                          <div className="text-[11px] font-sans bg-white text-black p-2.5 rounded-lg border border-zinc-200 space-y-1 outlook-body-wrapper">
                            <div>
                              <span className="bg-[#FFFF00] text-black font-bold px-1 py-0.2">
                                Conduct Sight Distance and additional PED requirement:
                              </span>{" "}
                              <strong>
                                {proj.projectNumber} PEDS {proj.codKeyword}
                              </strong>
                            </div>
                            <div className="pl-4 space-y-0.5">
                              {checked.map((suf) => (
                                <div key={suf} className="flex items-center space-x-1.5 text-black font-medium">
                                  <span className="font-bold">•</span>
                                  <span className="font-bold font-mono">{suf}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className={`text-[11px] italic py-1 ${isDarkMode ? "text-[#D2FAD7]/50" : "text-zinc-400"}`}>
                            No Sight Distance line will be added under the teardown for this project (0 locations checked).
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-3.5 border-t flex items-center justify-between ${
            isDarkMode
              ? "bg-[#0C1E12] border-[#00FF41]/30"
              : "bg-[#FBF7F0] border-[#CFE0B8]"
          }`}
        >
          <div className="text-xs flex items-center space-x-2">
            {schoolZoneEnabled && (
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full border ${
                  isDarkMode
                    ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono"
                    : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                }`}
              >
                📝 Form Link ON
              </span>
            )}
            {totalCheckedCount > 0 ? (
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full border ${
                  isDarkMode
                    ? "bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40 font-mono shadow-[0_0_8px_rgba(0,255,65,0.2)]"
                    : "bg-[#EDF3E3] text-[#3F4A33] border-[#CFE0B8]"
                }`}
              >
                {totalCheckedCount} Sight Distance location{totalCheckedCount > 1 ? "s" : ""}
              </span>
            ) : (
              <span className={isDarkMode ? "text-[#D2FAD7]/60" : "text-zinc-500"}>
                0 Sight Distance locations
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                isDarkMode
                  ? "text-[#D2FAD7] hover:text-[#00FF41] bg-[#040906] hover:bg-[#00FF41]/10 border-[#00FF41]/30"
                  : "text-[#3F4A33] hover:text-black bg-white hover:bg-[#EDF3E3] border-[#CFE0B8]"
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer ${
                isDarkMode
                  ? "bg-[#00FF41] hover:bg-[#39FF14] text-[#040906] font-mono shadow-[0_0_12px_#00FF41]"
                  : "bg-[#8AA66B] hover:bg-[#7a965c] text-white"
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Apply &amp; Save COD Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
