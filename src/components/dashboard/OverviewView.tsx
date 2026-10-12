import React, { useState, useEffect } from "react";
import {
  FileText,
  FlaskConical,
  Pill,
  Clock,
  ArrowUpRight,
  PlusCircle,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Ambulance,
  Shield,
  ShieldAlert,
  PhoneCall,
  Sparkles,
  Brain,
  Layers,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import {
  MedicalDocument,
  ExtractedLabResult,
  MedicationItem,
  TimelineEvent,
  WellnessEntry,
  ViewTab,
} from "../../types/health.js";

interface OverviewViewProps {
  onNavigateTab: (tab: ViewTab) => void;
  onOpenUploadModal: () => void;
  onOpenEmergencyModal?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigateTab,
  onOpenUploadModal,
  onOpenEmergencyModal,
}) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [labs, setLabs] = useState<ExtractedLabResult[]>([]);
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [wellness, setWellness] = useState<WellnessEntry[]>([]);
  const [selectedLabTest, setSelectedLabTest] = useState<string>("HbA1c (Glycated Hemoglobin)");
  const [wellnessMetric, setWellnessMetric] = useState<"sleep" | "steps" | "water">("sleep");
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [docsRes, labsRes, medsRes, timeRes, wellRes, statusRes] = await Promise.all([
        fetch("/api/documents").then((r) => r.json()),
        fetch("/api/labs").then((r) => r.json()),
        fetch("/api/medications").then((r) => r.json()),
        fetch("/api/timeline").then((r) => r.json()),
        fetch("/api/wellness").then((r) => r.json()),
        fetch("/api/backend-status").then((r) => r.json()).catch(() => null),
      ]);

      setDocuments(docsRes.documents || []);
      setLabs(labsRes.labs || []);
      setMedications(medsRes.medications || []);
      setTimeline(timeRes.timeline || []);
      setWellness(wellRes.wellness || []);
      if (statusRes) setBackendStatus(statusRes);

      const testNames = Array.from(
        new Set((labsRes.labs || []).map((l: ExtractedLabResult) => l.testName))
      );
      if (testNames.length > 0 && !testNames.includes(selectedLabTest)) {
        setSelectedLabTest(testNames[0] as string);
      }
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Derived metrics from real saved records
  const activeMedsCount = medications.filter((m) => m.status === "Active").length;
  const remindersCount = medications
    .filter((m) => m.status === "Active")
    .reduce((acc, m) => acc + (m.reminders?.filter((r) => r.enabled).length || 0), 0);
  const outOfRangeLabs = labs.filter((l) => l.sourceInterpretation !== "Within Normal Range").length;

  // Lab trends chart data for the selected test
  const availableTests = Array.from(
    new Set(labs.filter((l) => typeof l.valueNumeric === "number").map((l) => l.testName))
  );
  const currentTestResults = labs
    .filter((l) => l.testName === selectedLabTest && typeof l.valueNumeric === "number")
    .sort((a, b) => a.observedDate.localeCompare(b.observedDate));

  const chartData = currentTestResults.map((r) => ({
    date: r.observedDate,
    value: r.valueNumeric,
    unit: r.unit,
    refLow: r.referenceLow,
    refHigh: r.referenceHigh,
    interpretation: r.sourceInterpretation,
    docId: r.documentId,
  }));

  // Document category distribution for donut chart
  const docTypeCounts: Record<string, number> = {};
  documents.forEach((d) => {
    docTypeCounts[d.documentType] = (docTypeCounts[d.documentType] || 0) + 1;
  });
  const donutData = Object.entries(docTypeCounts).map(([name, value]) => ({ name, value }));
  const DONUT_COLORS = ["#16B8A6", "#101C31", "#66E3D3", "#D9972B", "#64748B"];

  // Weekly wellness chart data
  const wellnessChartData = wellness.slice(-7).map((w) => ({
    date: w.date.slice(5),
    sleep: w.sleepHours,
    steps: w.steps,
    water: w.waterGlasses,
  }));

  // Action: Mark reminder taken
  const handleMarkTaken = async (medId: string, reminderId: string) => {
    await fetch(`/api/medications/${medId}/reminder-action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderId, action: "taken" }),
    });
    fetchData();
  };

  const formattedDate = new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. EDITORIAL HEADER & QUICK ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs">
        <div>
          <div className="text-xs font-mono font-bold tracking-widest text-[#16B8A6] uppercase">
            {language === "hi" ? "स्वास्थ्य अवलोकन" : "CLINICAL WORKSPACE"}
          </div>
          <h1 className="text-2xl font-extrabold text-[#142238] dark:text-white mt-0.5 tracking-tight">
            Your Health Overview
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Your health information, organized in one place.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#64748B] dark:text-slate-400">
            <span className="font-medium">{formattedDate}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
            <span className="font-semibold text-[#142238] dark:text-slate-300">
              {documents.length} recorded documents
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#16B8A6] dark:text-[#66E3D3] bg-[#E6F8F4] dark:bg-[#172944] px-2.5 py-0.5 rounded-lg border border-[#16B8A6]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16B8A6]" />
              <span>{backendStatus?.supabase?.connected ? "Supabase Cloud DB" : "Disk-Persisted Vault"}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab("export")}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-[#F5F7FB] dark:bg-[#172944] hover:bg-slate-200 dark:hover:bg-[#233a5d] border border-[#E4EAF1] dark:border-[#1B2D48] rounded-xl transition-colors whitespace-nowrap"
          >
            {t("navExport")}
          </button>
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#101C31] bg-[#16B8A6] hover:bg-[#66E3D3] rounded-xl shadow-sm transition-all hover:scale-[1.02] whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Medical Report</span>
          </button>
        </div>
      </div>

      {/* 2. IMMEDIATE EMERGENCY HOTLINE BANNER: Ambulance 108 & Police 100 */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-50/90 via-amber-50/30 to-blue-50/70 dark:from-rose-950/25 dark:via-[#101C31] dark:to-blue-950/25 border border-rose-200/80 dark:border-rose-900/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#142238] dark:text-white">
                {language === "hi" ? "त्वरित आपातकालीन हेल्पलाइन" : "Immediate Emergency Response Lines"}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-[10px] font-extrabold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                24x7 Toll-Free
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              {language === "hi"
                ? "आपातकालीन स्थिति में एम्बुलेंस (108/102) या पुलिस (100/112) सहायता के लिए तुरंत डायल करें।"
                : "One-tap direct dial for acute medical trauma, hospital transport, and emergency police protection."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Ambulance 108 */}
          <a
            href="tel:108"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all hover:scale-[1.02]"
            title="Call National Ambulance 108"
          >
            <Ambulance className="w-4 h-4" />
            <span>{language === "hi" ? "एम्बुलेंस 108" : "Ambulance 108"}</span>
          </a>

          {/* Secondary Ambulance 102 */}
          <a
            href="tel:102"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#172944] border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-50 transition-colors"
            title="Call Secondary Ambulance Line 102"
          >
            <span>102</span>
          </a>

          {/* Police 100 */}
          <a
            href="tel:100"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm transition-all hover:scale-[1.02]"
            title="Call Police Control Room 100"
          >
            <Shield className="w-4 h-4" />
            <span>{language === "hi" ? "पुलिस 100" : "Police 100"}</span>
          </a>

          {/* Unified 112 */}
          <a
            href="tel:112"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#172944] border border-blue-300 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-50 transition-colors"
            title="Call Unified National Helpline 112"
          >
            <span>112</span>
          </a>

          {/* Full SOS Modal */}
          {onOpenEmergencyModal && (
            <button
              onClick={onOpenEmergencyModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#172944] dark:hover:bg-[#233a5d] text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
              title="Open full emergency dossier, medical ID, and contacts"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
              <span>{language === "hi" ? "पूरा एसओएस" : "All Lines & ID"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. FOUR OVERVIEW METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Medical Documents */}
        <div
          onClick={() => onNavigateTab("records")}
          className="p-5 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs hover:border-[#16B8A6]/40 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#64748B] dark:text-slate-400">Medical Documents</span>
            <div className="w-8 h-8 rounded-xl bg-[#E6F8F4] dark:bg-[#172944] text-[#16B8A6] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-[#101C31] dark:text-white">
              {documents.length}
            </span>
            <span className="text-[11px] text-[#64748B] flex items-center gap-0.5 group-hover:text-[#16B8A6]">
              Vault <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
            {documents[0]?.title ? `Latest: ${documents[0].title}` : "Ready for intake"}
          </div>
        </div>

        {/* Card 2: Recorded Laboratory Results */}
        <div
          onClick={() => onNavigateTab("labs")}
          className="p-5 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs hover:border-[#16B8A6]/40 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#64748B] dark:text-slate-400">Lab Results</span>
            <div className="w-8 h-8 rounded-xl bg-[#E6F8F4] dark:bg-[#172944] text-[#16B8A6] flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-[#101C31] dark:text-white">
              {labs.length}
            </span>
            {outOfRangeLabs > 0 ? (
              <span className="text-[11px] font-bold text-[#D9972B]">
                {outOfRangeLabs} need review
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-600">
                All in range
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
            {outOfRangeLabs > 0 ? "Compared to report reference ranges" : "Within source reference ranges"}
          </div>
        </div>

        {/* Card 3: Confirmed Active Medications */}
        <div
          onClick={() => onNavigateTab("medications")}
          className="p-5 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs hover:border-[#16B8A6]/40 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#64748B] dark:text-slate-400">Active Prescriptions</span>
            <div className="w-8 h-8 rounded-xl bg-[#E6F8F4] dark:bg-[#172944] text-[#16B8A6] flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-[#101C31] dark:text-white">
              {activeMedsCount}
            </span>
            <span className="text-[11px] text-[#64748B] flex items-center gap-0.5 group-hover:text-[#16B8A6]">
              Organizer <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
            {medications.find((m) => m.status === "Active")?.name || "No prescriptions"}
          </div>
        </div>

        {/* Card 4: Upcoming Reminders */}
        <div
          onClick={() => onNavigateTab("medications")}
          className="p-5 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs hover:border-[#16B8A6]/40 hover:shadow-md transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#64748B] dark:text-slate-400">Scheduled Reminders</span>
            <div className="w-8 h-8 rounded-xl bg-[#E6F8F4] dark:bg-[#172944] text-[#16B8A6] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-[#101C31] dark:text-white">
              {remindersCount}
            </span>
            <span className="text-[11px] font-bold text-[#16B8A6]">Today</span>
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
            User-configured adherence logs
          </div>
        </div>
      </div>

      {/* 4. ADVANCED DATA VISUALIZATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Laboratory Trends (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#101C31] dark:text-white tracking-tight">
                {t("labTrendsTitle")}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Tracking historical measurements with source report reference intervals
              </p>
            </div>

            {/* Test Selector Dropdown */}
            {availableTests.length > 0 && (
              <select
                value={selectedLabTest}
                onChange={(e) => setSelectedLabTest(e.target.value)}
                className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-[#E4EAF1] dark:border-slate-700 bg-[#F5F7FB] dark:bg-slate-800 text-[#142238] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#16B8A6]"
              >
                {availableTests.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Chart Viewport */}
          {chartData.length > 0 ? (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF1" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickLine={false}
                    stroke="#CBD5E1"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    domain={["auto", "auto"]}
                    tickLine={false}
                    stroke="#CBD5E1"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] rounded-xl shadow-xl text-xs space-y-1">
                            <div className="font-bold text-[#101C31] dark:text-white">
                              {selectedLabTest}
                            </div>
                            <div className="text-[#16B8A6] font-bold font-mono">
                              {data.value} {data.unit}
                            </div>
                            <div className="text-[#64748B] text-[11px]">
                              Observed: {data.date}
                            </div>
                            {data.refLow !== undefined && data.refHigh !== undefined && (
                              <div className="text-[10px] text-slate-400">
                                Source Reference: {data.refLow} – {data.refHigh} {data.unit}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {chartData[0]?.refLow !== undefined && (
                    <ReferenceLine
                      y={chartData[0].refLow}
                      stroke="#0284c7"
                      strokeDasharray="4 4"
                      label={{
                        value: `Min: ${chartData[0].refLow}`,
                        position: "insideBottomLeft",
                        fontSize: 10,
                        fill: "#0284c7",
                      }}
                    />
                  )}
                  {chartData[0]?.refHigh !== undefined && (
                    <ReferenceLine
                      y={chartData[0].refHigh}
                      stroke="#d97706"
                      strokeDasharray="4 4"
                      label={{
                        value: `Max: ${chartData[0].refHigh}`,
                        position: "insideTopLeft",
                        fontSize: 10,
                        fill: "#d97706",
                      }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#16B8A6"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#16B8A6", stroke: "#ffffff", strokeWidth: 2 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-slate-400 px-2 pt-2 border-t border-[#E4EAF1] dark:border-slate-800">
                <span className="truncate max-w-sm">
                  Source Interval: {currentTestResults[currentTestResults.length - 1]?.referenceRangeText || "Standard clinical range"}
                </span>
                <span className="font-mono">
                  {chartData.length} observation{chartData.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
              <FlaskConical className="w-8 h-8 text-slate-300 mb-2" />
              <p>No historical lab measurements recorded for {selectedLabTest}.</p>
              <p className="mt-1 text-slate-500">Upload a pathology report to see trends.</p>
            </div>
          )}
        </div>

        {/* Chart 2: Document Categories Donut Chart (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#101C31] dark:text-white tracking-tight">
              {t("healthDistributionTitle")}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Categorized records in your personal health vault
            </p>
          </div>

          {donutData.length > 0 ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 text-xs w-full pt-2">
                {donutData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                    />
                    <span className="truncate text-[#64748B] dark:text-slate-300">
                      {d.name}: <strong>{d.value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-slate-400">
              <FileText className="w-8 h-8 text-slate-300 mb-2" />
              <p>No documents uploaded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. MEDICATION SCHEDULE & WELLNESS TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: Medication Schedule (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#101C31] dark:text-white tracking-tight">
                {t("medicationScheduleTitle")}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                User-confirmed active prescriptions and reminder logs
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("medications")}
              className="text-xs font-bold text-[#16B8A6] hover:underline"
            >
              Organizer
            </button>
          </div>

          <div className="space-y-3">
            {medications
              .filter((m) => m.status === "Active")
              .map((med) => {
                const primaryReminder = med.reminders?.[0];
                const isTakenToday = primaryReminder?.lastAction?.action === "taken";
                return (
                  <div
                    key={med.id}
                    className="p-3.5 rounded-2xl border border-[#E4EAF1] dark:border-slate-800 bg-[#F5F7FB] dark:bg-[#172944] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-[#101C31] dark:text-white truncate">
                        {med.name} {med.strength}
                      </div>
                      <div className="text-[#64748B] text-[11px] truncate">
                        {med.dosage} · {med.frequency}
                      </div>
                      {primaryReminder && (
                        <div className="text-[10px] text-[#16B8A6] font-semibold mt-0.5">
                          Scheduled: {primaryReminder.time}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isTakenToday ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Taken Today
                        </span>
                      ) : (
                        <button
                          onClick={() => primaryReminder && handleMarkTaken(med.id, primaryReminder.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#16B8A6] hover:bg-[#66E3D3] text-[#101C31] font-bold text-xs transition-colors shadow-xs"
                        >
                          {t("markTaken")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

            {medications.filter((m) => m.status === "Active").length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                {t("noActiveMeds")}
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: Weekly Wellness Trend (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#101C31] dark:text-white tracking-tight">
                {t("wellnessTrendsTitle")}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Logged daily lifestyle metrics
              </p>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1 p-1 bg-[#F5F7FB] dark:bg-slate-800 rounded-xl text-xs self-start sm:self-auto border border-[#E4EAF1] dark:border-slate-700">
              <button
                onClick={() => setWellnessMetric("sleep")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  wellnessMetric === "sleep"
                    ? "bg-white dark:bg-[#101C31] text-[#16B8A6] shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sleep
              </button>
              <button
                onClick={() => setWellnessMetric("steps")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  wellnessMetric === "steps"
                    ? "bg-white dark:bg-[#101C31] text-[#16B8A6] shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Steps
              </button>
              <button
                onClick={() => setWellnessMetric("water")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  wellnessMetric === "water"
                    ? "bg-white dark:bg-[#101C31] text-[#16B8A6] shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Water
              </button>
            </div>
          </div>

          {wellnessChartData.length > 0 ? (
            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wellnessChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF1" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748B" }} stroke="#CBD5E1" />
                  <YAxis tick={{ fontSize: 10, fill: "#64748B" }} stroke="#CBD5E1" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey={wellnessMetric}
                    stroke="#16B8A6"
                    fill="#16B8A6"
                    fillOpacity={0.15}
                    name={
                      wellnessMetric === "sleep"
                        ? "Sleep (hrs)"
                        : wellnessMetric === "steps"
                        ? "Daily Steps"
                        : "Hydration (glasses)"
                    }
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#E4EAF1] dark:border-slate-800">
                <span>
                  {wellnessMetric === "sleep"
                    ? "Avg Sleep: 7.3 hrs/night"
                    : wellnessMetric === "steps"
                    ? "Avg Steps: 7,920/day"
                    : "Avg Hydration: 8.6 glasses/day"}
                </span>
                <span className="font-mono">{wellnessChartData.length} days recorded</span>
              </div>
            </div>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-xs text-slate-400">
              <p>No wellness logs recorded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* 6. RECENT TIMELINE HIGHLIGHTS & AI INSIGHTS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#101C31] border border-[#E4EAF1] dark:border-[#1B2D48] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#101C31] dark:text-white tracking-tight">
              {t("recentTimelineTitle")}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Chronological provenance of records and clinical events
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("timeline")}
            className="text-xs font-bold text-[#16B8A6] hover:underline"
          >
            {t("viewAllTimeline")}
          </button>
        </div>

        <div className="space-y-3">
          {timeline.slice(0, 4).map((event) => (
            <div
              key={event.id}
              className="p-3.5 rounded-2xl border border-[#E4EAF1] dark:border-slate-800 hover:border-slate-300 transition-colors flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#142238] dark:text-white">
                    {event.title}
                  </span>
                  <span className="text-[11px] text-[#64748B] font-mono">
                    {event.date}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  {language === "hi" && event.summaryHi ? event.summaryHi : event.summary}
                </p>
              </div>

              {event.documentId && (
                <button
                  onClick={() => onNavigateTab("summary")}
                  className="shrink-0 px-3 py-1.5 text-[11px] font-bold text-[#16B8A6] rounded-xl bg-[#E6F8F4] dark:bg-[#172944] hover:bg-[#d5f3ec] transition-colors"
                >
                  Inspect AI Summary
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
