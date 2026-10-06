import React, { useState, useEffect } from "react";
import { X, Check, FileSignature, RotateCcw, Building, MapPin, Globe, Sparkles } from "lucide-react";
import {
  TemplateBranding,
  EmailSignaturePresetId,
  EmailSignatureDetails,
} from "../types";
import {
  EMAIL_SIGNATURE_PRESETS,
  SIGNATURE_PRESET_OPTIONS,
  getEffectiveSignature,
  renderEmailSignatureHtml,
} from "../utils/signaturePresets";
import { useTheme } from "../context/ThemeContext";

interface EmailSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: TemplateBranding;
  onUpdateBranding?: (partial: Partial<TemplateBranding>) => void;
  onToggleEmailSignature?: (enabled: boolean) => void;
  onSelectPreset?: (preset: EmailSignaturePresetId) => void;
}

export const EmailSignatureModal: React.FC<EmailSignatureModalProps> = ({
  isOpen,
  onClose,
  branding,
  onUpdateBranding,
  onToggleEmailSignature,
  onSelectPreset,
}) => {
  const { isDarkMode } = useTheme();
  const currentPresetKey = (branding.emailSignaturePreset || "patrick") as EmailSignaturePresetId;
  const isEnabled = Boolean(branding.emailSignatureEnabled);

  const [selectedPreset, setSelectedPreset] = useState<EmailSignaturePresetId>(currentPresetKey);
  const [enabled, setEnabled] = useState<boolean>(isEnabled);
  const [customFields, setCustomFields] = useState<Partial<EmailSignatureDetails>>(
    branding.customEmailSignature || {}
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    setSelectedPreset((branding.emailSignaturePreset || "patrick") as EmailSignaturePresetId);
    setEnabled(Boolean(branding.emailSignatureEnabled));
    setCustomFields(branding.customEmailSignature || {});
  }, [branding, isOpen]);

  if (!isOpen) return null;

  const currentPresetData =
    selectedPreset in EMAIL_SIGNATURE_PRESETS
      ? EMAIL_SIGNATURE_PRESETS[selectedPreset as keyof typeof EMAIL_SIGNATURE_PRESETS]
      : EMAIL_SIGNATURE_PRESETS.patrick;

  const effectiveSig: EmailSignatureDetails = {
    ...currentPresetData,
    ...customFields,
    id: selectedPreset,
  };

  const handleSelectPreset = (presetId: "james" | "kyle" | "patrick" | "katrin") => {
    setSelectedPreset(presetId);
    setCustomFields({}); // Reset any overrides to load pure preset
    if (onSelectPreset) {
      onSelectPreset(presetId);
    }
  };

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    if (onToggleEmailSignature) {
      onToggleEmailSignature(checked);
    }
  };

  const handleSave = () => {
    if (onUpdateBranding) {
      onUpdateBranding({
        emailSignatureEnabled: enabled,
        emailSignaturePreset: selectedPreset,
        customEmailSignature: Object.keys(customFields).length > 0 ? customFields : undefined,
      });
    }
    onClose();
  };

  const handleResetToDefault = () => {
    setCustomFields({});
    if (onUpdateBranding) {
      onUpdateBranding({
        customEmailSignature: undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border overflow-hidden ${
          isDarkMode
            ? "bg-[#08150D] border-[#00FF41]/40 shadow-[0_0_30px_rgba(0,255,65,0.2)] text-[#D2FAD7]"
            : "bg-white border-[#CFE0B8] text-[#3F4A33]"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isDarkMode
              ? "bg-[#040906] border-[#00FF41]/30 text-white"
              : "bg-[#3F4A33] border-[#CFE0B8]/30 text-white"
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs ${
                isDarkMode
                  ? "bg-[#00FF41]/20 border-[#00FF41]/40 text-[#00FF41]"
                  : "bg-[#8AA66B]/30 border-[#CFE0B8]/30 text-[#EDF3E3]"
              }`}
            >
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">Email Signature Settings</h2>
              <p className={`text-xs ${isDarkMode ? "text-[#D2FAD7]/80" : "text-[#EDF3E3]/80"}`}>
                Choose sender profile and append signature to schedule emails
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
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
          {/* Main Toggle Switch */}
          <div
            className={`flex items-center justify-between p-3.5 border rounded-2xl ${
              isDarkMode
                ? "bg-[#0C1E12] border-[#00FF41]/40 text-[#D2FAD7]"
                : "bg-[#EDF3E3] border-[#CFE0B8]"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  enabled
                    ? isDarkMode
                      ? "bg-[#00FF41] animate-pulse shadow-[0_0_8px_#00FF41]"
                      : "bg-[#8AA66B] animate-pulse"
                    : "bg-zinc-400"
                }`}
              />
              <div>
                <span className={`font-bold text-sm block ${isDarkMode ? "text-[#E0FFE5]" : "text-[#3F4A33]"}`}>
                  Email Signature Toggle
                </span>
                <span className={`text-[11px] ${isDarkMode ? "text-[#D2FAD7]/80" : "text-[#3F4A33]/80"}`}>
                  When enabled, automatically appends the signature to the bottom of the email.
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => handleToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-11 h-6 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  isDarkMode
                    ? "bg-[#040906] border border-[#00FF41]/40 peer-checked:bg-[#00FF41] peer-checked:shadow-[0_0_12px_#00FF41]"
                    : "bg-zinc-300 peer-checked:bg-[#8AA66B]"
                }`}
              />
            </label>
          </div>

          {/* Preset Selection Buttons */}
          <div>
            <label
              className={`font-bold text-xs block mb-2 uppercase tracking-wider ${
                isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"
              }`}
            >
              Select Signature Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SIGNATURE_PRESET_OPTIONS.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? isDarkMode
                          ? "border-[#00FF41] bg-[#00FF41]/15 text-[#E0FFE5] font-bold ring-2 ring-[#00FF41]/40 shadow-[0_0_12px_rgba(0,255,65,0.2)] font-mono"
                          : "border-[#8AA66B] bg-[#EDF3E3] text-[#3F4A33] font-bold ring-2 ring-[#8AA66B]/40 shadow-xs"
                        : isDarkMode
                        ? "border-[#00FF41]/30 bg-[#040906] text-[#D2FAD7] hover:border-[#00FF41]/60 hover:bg-[#0C1E12]"
                        : "border-[#CFE0B8] bg-white hover:bg-[#FBF7F0] text-[#3F4A33] hover:border-[#8AA66B]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold">{preset.label}</span>
                      {isSelected && (
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            isDarkMode ? "bg-[#00FF41] text-[#040906]" : "bg-[#8AA66B] text-white"
                          }`}
                        >
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] line-clamp-2 leading-tight ${
                        isDarkMode ? "text-[#D2FAD7]/70" : "text-zinc-500"
                      }`}
                    >
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exact Visual Signature Preview Box (Formatted as per photo) */}
          <div
            className={`border rounded-2xl p-4 ${
              isDarkMode
                ? "bg-[#040906] border-[#00FF41]/30 text-[#D2FAD7]"
                : "border-[#CFE0B8] bg-[#FBF7F0]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]/70"
                }`}
              >
                Signature Live Outlook Preview (Photo Match)
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`text-xs font-bold cursor-pointer underline ${
                  isDarkMode ? "text-[#00FF41] hover:text-[#39FF14]" : "text-[#8AA66B] hover:text-[#3F4A33]"
                }`}
              >
                {isEditing ? "Done Customizing" : "Edit / Customize Fields"}
              </button>
            </div>

            {/* Rendered Signature on authentic Outlook preview canvas */}
            <div className="bg-white text-black p-5 rounded-xl border border-zinc-200 shadow-xs outlook-body-wrapper">
              <div
                dangerouslySetInnerHTML={{
                  __html: renderEmailSignatureHtml(effectiveSig),
                }}
              />
            </div>
          </div>

          {/* Optional: Field Customizer */}
          {isEditing && (
            <div
              className={`p-4 border rounded-2xl space-y-3 animate-in fade-in duration-150 ${
                isDarkMode
                  ? "bg-[#0C1E12] border-[#00FF41]/40"
                  : "bg-[#EDF3E3]/50 border-[#CFE0B8]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-bold ${isDarkMode ? "text-[#00FF41]" : "text-[#3F4A33]"}`}>
                  Customize Signature Details
                </span>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className={`flex items-center space-x-1 text-xs font-semibold cursor-pointer ${
                    isDarkMode ? "text-[#D2FAD7] hover:text-[#00FF41]" : "text-[#3F4A33] hover:text-black"
                  }`}
                >
                  <RotateCcw className={`w-3 h-3 ${isDarkMode ? "text-[#00FF41]" : "text-[#8AA66B]"}`} />
                  <span>Reset to Preset Defaults</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`font-bold text-[11px] block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                    Greeting
                  </label>
                  <input
                    type="text"
                    value={effectiveSig.greeting}
                    onChange={(e) =>
                      setCustomFields((prev) => ({ ...prev, greeting: e.target.value }))
                    }
                    className={`w-full px-2.5 py-1.5 rounded-xl border focus:outline-hidden focus:ring-2 ${
                      isDarkMode
                        ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                        : "bg-white border-[#CFE0B8] text-zinc-900 focus:ring-[#8AA66B]"
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-bold text-[11px] block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={effectiveSig.name}
                    onChange={(e) =>
                      setCustomFields((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className={`w-full px-2.5 py-1.5 rounded-xl border focus:outline-hidden focus:ring-2 ${
                      isDarkMode
                        ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                        : "bg-white border-[#CFE0B8] text-zinc-900 focus:ring-[#8AA66B]"
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`font-bold text-[11px] block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                    Title / Role Line
                  </label>
                  <input
                    type="text"
                    value={effectiveSig.title}
                    onChange={(e) =>
                      setCustomFields((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className={`w-full px-2.5 py-1.5 rounded-xl border focus:outline-hidden focus:ring-2 ${
                      isDarkMode
                        ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                        : "bg-white border-[#CFE0B8] text-zinc-900 focus:ring-[#8AA66B]"
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-bold text-[11px] block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={effectiveSig.company}
                    onChange={(e) =>
                      setCustomFields((prev) => ({ ...prev, company: e.target.value }))
                    }
                    className={`w-full px-2.5 py-1.5 rounded-xl border focus:outline-hidden focus:ring-2 ${
                      isDarkMode
                        ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                        : "bg-white border-[#CFE0B8] text-zinc-900 focus:ring-[#8AA66B]"
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-bold text-[11px] block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                    Corporate Office Address
                  </label>
                  <input
                    type="text"
                    value={effectiveSig.address}
                    onChange={(e) =>
                      setCustomFields((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className={`w-full px-2.5 py-1.5 rounded-xl border focus:outline-hidden focus:ring-2 ${
                      isDarkMode
                        ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                        : "bg-white border-[#CFE0B8] text-zinc-900 focus:ring-[#8AA66B]"
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-bold text-[11px] block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                    Website URL
                  </label>
                  <input
                    type="text"
                    placeholder="www.ndsdata.com (optional)"
                    value={effectiveSig.website || ""}
                    onChange={(e) =>
                      setCustomFields((prev) => ({ ...prev, website: e.target.value }))
                    }
                    className={`w-full px-2.5 py-1.5 rounded-xl border focus:outline-hidden focus:ring-2 ${
                      isDarkMode
                        ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                        : "bg-white border-[#CFE0B8] text-zinc-900 focus:ring-[#8AA66B]"
                    }`}
                  />
                </div>

                <div>
                  <label className={`font-bold text-[11px] block mb-1 ${isDarkMode ? "text-[#D2FAD7]" : "text-[#3F4A33]"}`}>
                    Tagline / Slogan
                  </label>
                  <input
                    type="text"
                    value={effectiveSig.tagline}
                    onChange={(e) =>
                      setCustomFields((prev) => ({ ...prev, tagline: e.target.value }))
                    }
                    className={`w-full px-2.5 py-1.5 rounded-xl border focus:outline-hidden focus:ring-2 ${
                      isDarkMode
                        ? "bg-[#040906] border-[#00FF41]/40 text-[#E0FFE5] focus:ring-[#00FF41]"
                        : "bg-white border-[#CFE0B8] text-zinc-900 focus:ring-[#8AA66B]"
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-3.5 border-t flex items-center justify-between ${
            isDarkMode
              ? "bg-[#0C1E12] border-[#00FF41]/30"
              : "bg-[#FBF7F0] border-[#CFE0B8]"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer border ${
              isDarkMode
                ? "text-[#D2FAD7] hover:text-[#00FF41] hover:bg-[#00FF41]/10 border-[#00FF41]/30"
                : "text-[#3F4A33] hover:text-black hover:bg-[#EDF3E3] border-[#CFE0B8]"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer flex items-center space-x-1.5 ${
              isDarkMode
                ? "bg-[#00FF41] hover:bg-[#39FF14] text-[#040906] font-mono shadow-[0_0_12px_#00FF41]"
                : "bg-[#8AA66B] hover:bg-[#7a965c] text-white"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Signature</span>
          </button>
        </div>
      </div>
    </div>
  );
};

