import React, { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext.js";
import { LanguageProvider } from "./context/LanguageContext.js";
import { AuthProvider } from "./context/AuthContext.js";
import { LandingPage } from "./components/landing/LandingPage.js";
import { Header } from "./components/layout/Header.js";
import { Sidebar } from "./components/layout/Sidebar.js";
import { OverviewView } from "./components/dashboard/OverviewView.js";
import { RecordsView } from "./components/records/RecordsView.js";
import { SummaryView } from "./components/summary/SummaryView.js";
import { LabsView } from "./components/labs/LabsView.js";
import { MedicationsView } from "./components/medications/MedicationsView.js";
import { TimelineView } from "./components/timeline/TimelineView.js";
import { WellnessView } from "./components/wellness/WellnessView.js";
import { ExportView } from "./components/export/ExportView.js";
import { PrivacyView } from "./components/privacy/PrivacyView.js";
import { EmergencyModal } from "./components/emergency/EmergencyModal.js";
import { ViewTab } from "./types/health.js";

function HealthoraApp() {
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<ViewTab>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [uploadModalKey, setUploadModalKey] = useState<number>(0);
  const [openUploadInRecords, setOpenUploadInRecords] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);

  const handleOpenUploadModal = () => {
    setCurrentTab("records");
    setOpenUploadInRecords(true);
    setUploadModalKey((prev) => prev + 1);
  };

  const handleEnterApp = (tab: ViewTab = "overview") => {
    setCurrentTab(tab);
    setShowLanding(false);
  };

  const handleOpenEmergency = () => {
    setIsEmergencyModalOpen(true);
  };

  if (showLanding) {
    return (
      <>
        <LandingPage onEnterApp={handleEnterApp} onOpenEmergencyModal={handleOpenEmergency} />
        <EmergencyModal isOpen={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F7FB] dark:bg-[#0B132B] text-[#142238] dark:text-slate-100 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onNavigateTab={(tab) => {
          setOpenUploadInRecords(false);
          setCurrentTab(tab);
        }}
        onOpenUploadModal={handleOpenUploadModal}
        onOpenEmergencyModal={handleOpenEmergency}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onShowLanding={() => setShowLanding(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header
          currentTab={currentTab}
          onNavigateTab={setCurrentTab}
          onOpenUploadModal={handleOpenUploadModal}
          onOpenEmergencyModal={handleOpenEmergency}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentTab === "overview" && (
            <OverviewView
              onNavigateTab={setCurrentTab}
              onOpenUploadModal={handleOpenUploadModal}
              onOpenEmergencyModal={handleOpenEmergency}
            />
          )}

          {currentTab === "records" && (
            <RecordsView
              key={uploadModalKey}
              onNavigateTab={setCurrentTab}
              openUploadOnMount={openUploadInRecords}
            />
          )}

          {currentTab === "summary" && <SummaryView onNavigateTab={setCurrentTab} />}

          {currentTab === "labs" && <LabsView onNavigateTab={setCurrentTab} />}

          {currentTab === "medications" && <MedicationsView onNavigateTab={setCurrentTab} />}

          {currentTab === "timeline" && <TimelineView onNavigateTab={setCurrentTab} />}

          {currentTab === "wellness" && <WellnessView onNavigateTab={setCurrentTab} />}

          {currentTab === "export" && <ExportView onNavigateTab={setCurrentTab} />}

          {currentTab === "privacy" && <PrivacyView onNavigateTab={setCurrentTab} />}
        </main>
      </div>

      {/* Persistent Emergency SOS Modal */}
      <EmergencyModal isOpen={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <HealthoraApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
