import React, { useState } from "react";
import { Search, Globe, Sun, Moon, Bell, User, Sparkles, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { useTheme } from "../../context/ThemeContext.js";
import { ViewTab } from "../../types/health.js";

interface HeaderProps {
  currentTab: ViewTab;
  onNavigateTab: (tab: ViewTab) => void;
  onOpenUploadModal: () => void;
  onOpenEmergencyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigateTab,
  onOpenUploadModal,
  onOpenEmergencyModal,
}) => {
  const { user, activeProfileKey, switchProfile, resetDemo } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tabLabels: Record<ViewTab, string> = {
    overview: t("navOverview"),
    records: t("navRecords"),
    summary: t("navSummary"),
    labs: t("navLabs"),
    medications: t("navMedications"),
    timeline: t("navTimeline"),
    wellness: t("navWellness"),
    export: t("navExport"),
    privacy: t("navPrivacy"),
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3.5 bg-white/95 dark:bg-[#101C31]/95 backdrop-blur-md border-b border-[#E4EAF1] dark:border-[#1B2D48] transition-colors">
      {/* Zone 1: Contextual Breadcrumb & View Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-slate-400 whitespace-nowrap">
          <span className="font-extrabold text-[#142238] dark:text-white tracking-tight">HEALTHORA</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-[#16B8A6] font-bold">{tabLabels[currentTab]}</span>
        </div>
      </div>

      {/* Zone 2: Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={language === "hi" ? "दस्तावेज़, परीक्षण या दवा खोजें..." : "Search records, lab tests, medications..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-[#1B2D48] rounded-xl text-[#142238] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#16B8A6] transition-colors"
          />
        </div>
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Emergency SOS Button (Ambulance 108 & Police 100) */}
        {onOpenEmergencyModal && (
          <button
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-black rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 transition-colors whitespace-nowrap shadow-xs"
            title="Emergency SOS: Immediate Ambulance (108) & Police (100)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>SOS: 108 • 100</span>
          </button>
        )}

        {/* Demo Patient Switcher Button */}
        <button
          onClick={() => setIsDemoModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#E6F8F4] dark:bg-[#1B2D48] text-[#16B8A6] dark:text-[#66E3D3] border border-[#16B8A6]/30 dark:border-[#1B2D48] hover:bg-[#d5f3ec] transition-colors whitespace-nowrap"
          title="Switch fictional demo profile for hackathon evaluation"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#16B8A6]" />
          <span className="hidden sm:inline font-bold">{user?.name || "Demo Patient"}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
            {activeProfileKey === "rajesh" ? "Type 2 DM" : activeProfileKey === "priya" ? "Wellness" : "User"}
          </span>
        </button>

        {/* Language Selector (EN / HI) */}
        <button
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#F5F7FB] dark:bg-[#1B2D48] text-slate-700 dark:text-slate-200 border border-[#E4EAF1] dark:border-[#1B2D48] hover:bg-slate-200 dark:hover:bg-[#233a5d] transition-colors whitespace-nowrap"
          title="Switch language between English and Hindi"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === "en" ? "हिन्दी" : "EN"}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1B2D48] transition-colors"
          title="Toggle light/dark theme"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1B2D48] transition-colors relative"
            title="Adherence & Reminders"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#16B8A6]" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] rounded-2xl shadow-xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 font-bold text-[#142238] dark:text-white">
                <span>{language === "hi" ? "स्वास्थ्य सूचनाएं" : "Health Reminders"}</span>
                <span className="text-[11px] text-[#16B8A6] font-normal">2 Active</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2.5 rounded-xl bg-[#E6F8F4] dark:bg-[#1B2D48] border border-[#16B8A6]/20">
                  <div className="font-semibold text-[#142238] dark:text-slate-100">Metformin 500mg BD</div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400">Scheduled: 20:30 Tonight (After meal)</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F5F7FB] dark:bg-[#172944] border border-[#E4EAF1] dark:border-slate-700">
                  <div className="font-semibold text-[#142238] dark:text-slate-100">Lipid Profile Repeat</div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400">Recommended follow-up in April 2026</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action: Upload */}
        <button
          onClick={onOpenUploadModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] shadow-sm transition-all hover:scale-[1.02] whitespace-nowrap"
        >
          <span>{t("uploadReport")}</span>
        </button>
      </div>

      {/* Demo Switch Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === "hi" ? "डेमो मरीज प्रोफ़ाइल चयन" : "Select Fictional Demo Patient"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("demoSwitchNotice")}
                </p>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Rajesh Sharma */}
              <button
                onClick={() => {
                  switchProfile("rajesh");
                  setIsDemoModalOpen(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  activeProfileKey === "rajesh"
                    ? "border-teal-500 bg-teal-50/40 dark:bg-teal-950/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center font-bold text-teal-800 dark:text-teal-200 shrink-0">
                  RS
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Rajesh Sharma (48M)</span>
                    {activeProfileKey === "rajesh" && (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Longitudinal diabetes & dyslipidemia management. 3 lab reports, Metformin & Atorvastatin therapy, glycemic trend tracking.
                  </p>
                </div>
              </button>

              {/* Option 2: Priya Patel */}
              <button
                onClick={() => {
                  switchProfile("priya");
                  setIsDemoModalOpen(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  activeProfileKey === "priya"
                    ? "border-teal-500 bg-teal-50/40 dark:bg-teal-950/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center font-bold text-purple-800 dark:text-purple-200 shrink-0">
                  PP
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Priya Patel (34F)</span>
                    {activeProfileKey === "priya" && (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Annual preventive health assessment. Complete blood count, normal thyroid, Vitamin D deficiency monitoring.
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  resetDemo();
                  setIsDemoModalOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Records</span>
              </button>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
