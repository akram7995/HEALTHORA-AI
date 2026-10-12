import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { store, MedicalDocument, ExtractedLabResult, MedicationItem, TimelineEvent } from "./server/store.js";
import { analyzeMedicalDocument, answerDocumentQuestion } from "./server/analyzer.js";
import { testSupabaseConnection, isSupabaseConfigured } from "./server/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ---------------- API ROUTES ----------------

// System Health & Truthful Service Connectivity
app.get("/api/health", async (req, res) => {
  const supabaseStatus = await testSupabaseConnection();
  res.json({
    status: "healthy",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    supabase: supabaseStatus,
    timestamp: new Date().toISOString(),
    activeProfile: store.getActiveProfileKey(),
  });
});

app.get("/api/backend-status", async (req, res) => {
  const supabaseStatus = await testSupabaseConnection();
  res.json({
    supabase: supabaseStatus,
    gemini: {
      configured: !!process.env.GEMINI_API_KEY,
      model: "gemini-3.8-flash",
      multimodalFormats: ["application/pdf", "image/png", "image/jpeg", "image/webp"],
    },
    storage: {
      mode: isSupabaseConfigured() ? "Supabase Private S3-Compatible Bucket" : "Encrypted Local File Vault (.data)",
      bucket: "medical_records",
      isolation: "Row-Level Security (auth.uid() = user_id)",
    },
    activeProfile: store.getActiveProfileKey(),
  });
});

// Auth & Profiles
app.get("/api/auth/me", (req, res) => {
  const state = store.getCurrentState();
  res.json({
    user: state.profile,
    activeProfileKey: store.getActiveProfileKey(),
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;
  if (email && email.toLowerCase().includes("priya")) {
    store.setActiveProfileKey("priya");
  } else {
    store.setActiveProfileKey("rajesh");
  }
  const state = store.getCurrentState();
  res.json({ success: true, user: state.profile });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email } = req.body;
  const newProfile = store.createAccount(name || "New Patient", email || "patient@healthora.local");
  res.json({ success: true, user: newProfile });
});

app.post("/api/auth/demo-switch", (req, res) => {
  const { profileKey } = req.body;
  const switched = store.setActiveProfileKey(profileKey || "rajesh");
  const state = store.getCurrentState();
  res.json({ success: switched, user: state.profile, activeProfileKey: store.getActiveProfileKey() });
});

app.post("/api/auth/demo-reset", (req, res) => {
  store.resetDemo();
  const state = store.getCurrentState();
  res.json({ success: true, user: state.profile });
});

app.put("/api/auth/profile", (req, res) => {
  const updated = store.updateProfile(req.body);
  res.json({ success: true, user: updated });
});

// Medical Documents
app.get("/api/documents", (req, res) => {
  const state = store.getCurrentState();
  res.json({ documents: state.documents });
});

app.get("/api/documents/:id/file", (req, res) => {
  const { id } = req.params;
  const state = store.getCurrentState();
  const doc = state.documents.find((d: MedicalDocument) => d.id === id);
  if (!doc) {
    return res.status(404).json({ error: "Document not found" });
  }
  res.json({
    documentId: doc.id,
    title: doc.title,
    fileName: doc.fileName,
    fileSize: doc.fileSize,
    mimeType: doc.mimeType,
    documentType: doc.documentType,
    documentDate: doc.documentDate,
    facility: doc.facility,
    doctor: doc.doctor,
    fileBase64: doc.fileBase64 || doc.rawData || null,
    previewUrl: doc.previewUrl || null,
  });
});

app.post("/api/documents/upload", async (req, res) => {
  try {
    const { title, fileName, fileSize, mimeType, documentType, documentDate, facility, doctor, fileBase64, textSnippet, autoAnalyze } = req.body;
    const state = store.getCurrentState();
    const docId = `doc-${Date.now()}`;

    const newDoc: MedicalDocument = {
      id: docId,
      userId: state.profile.id,
      title: title || fileName || "Medical Record",
      fileName: fileName || "document.pdf",
      fileSize: fileSize || 1024000,
      mimeType: mimeType || "application/pdf",
      documentType: documentType || "Lab Report",
      documentDate: documentDate || new Date().toISOString().split("T")[0],
      facility: facility || "Clinical Diagnostic Facility",
      doctor: doctor || "Attending Clinician",
      uploadDate: new Date().toISOString(),
      status: autoAnalyze ? "processing" : "uploaded",
      fileBase64: fileBase64 || undefined,
      rawData: fileBase64 || undefined,
    };

    store.addDocument(newDoc);

    // If autoAnalyze requested, run the Gemini analysis
    if (autoAnalyze) {
      const analysis = await analyzeMedicalDocument({
        documentId: docId,
        documentTitle: newDoc.title,
        mimeType: newDoc.mimeType,
        fileBase64,
        textSnippet,
        language: state.profile.preferredLanguage,
      });

      newDoc.extractedData = analysis.extractedData;
      newDoc.status = "analyzed";
      store.updateDocument(docId, newDoc);

      // Save extracted labs
      analysis.labs.forEach((l) => {
        store.addLabResult({
          ...l,
          id: `lab-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        });
      });

      // Save extracted meds
      analysis.medications.forEach((m) => {
        store.addMedication({
          ...m,
          id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          userId: state.profile.id,
        });
      });

      // Add to timeline
      store.addTimelineEvent({
        id: `time-${Date.now()}`,
        userId: state.profile.id,
        date: newDoc.documentDate,
        type: newDoc.documentType === "Prescription" ? "medication" : "lab",
        title: `${newDoc.title} Uploaded & Analyzed`,
        summary: analysis.extractedData.plainSummaryEn,
        summaryHi: analysis.extractedData.plainSummaryHi,
        documentId: docId,
      });
    }

    res.json({ success: true, document: newDoc });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error?.message || "Failed to process document" });
  }
});

app.post("/api/documents/:id/analyze", async (req, res) => {
  try {
    const { id } = req.params;
    const state = store.getCurrentState();
    const doc = state.documents.find((d: MedicalDocument) => d.id === id);

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    store.updateDocument(id, { status: "processing" });

    const analysis = await analyzeMedicalDocument({
      documentId: id,
      documentTitle: doc.title,
      mimeType: doc.mimeType,
      textSnippet: req.body.textSnippet || `${doc.title} at ${doc.facility} dated ${doc.documentDate}`,
      language: state.profile.preferredLanguage,
    });

    const updatedDoc = store.updateDocument(id, {
      extractedData: analysis.extractedData,
      status: "analyzed",
    });

    // Save extracted labs
    analysis.labs.forEach((l) => {
      store.addLabResult({
        ...l,
        id: `lab-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      });
    });

    // Save extracted meds
    analysis.medications.forEach((m) => {
      store.addMedication({
        ...m,
        id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId: state.profile.id,
      });
    });

    res.json({ success: true, document: updatedDoc, analysis });
  } catch (err: any) {
    console.error("Analysis route error:", err);
    res.status(500).json({ error: err?.message || "Analysis failed" });
  }
});

app.put("/api/documents/:id/verify", (req, res) => {
  const { id } = req.params;
  const { correctedFields } = req.body;
  const state = store.getCurrentState();
  const doc = state.documents.find((d: MedicalDocument) => d.id === id);
  if (!doc) return res.status(404).json({ error: "Document not found" });

  const updatedDoc = store.updateDocument(id, {
    status: "verified",
    extractedData: doc.extractedData ? {
      ...doc.extractedData,
      ...(correctedFields || {}),
    } : undefined,
  });

  res.json({ success: true, document: updatedDoc });
});

app.delete("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  store.deleteDocument(id);
  res.json({ success: true });
});

// Document Q&A (Grounded)
app.post("/api/documents/:id/qa", async (req, res) => {
  try {
    const { id } = req.params;
    const { question, language } = req.body;
    const state = store.getCurrentState();
    const doc = state.documents.find((d: MedicalDocument) => d.id === id);

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    const docSummary = doc.extractedData 
      ? `${doc.extractedData.plainSummaryEn}\nObservations: ${doc.extractedData.keyObservations.join("; ")}`
      : `${doc.title} recorded on ${doc.documentDate} from ${doc.facility}`;

    const qaResult = await answerDocumentQuestion(
      doc.title,
      docSummary,
      question || "What are the main findings in this report?",
      language || state.profile.preferredLanguage || "en"
    );

    res.json({ success: true, ...qaResult });
  } catch (err: any) {
    console.error("QA error:", err);
    res.status(500).json({ error: err?.message || "Failed to answer question" });
  }
});

// Lab Results
app.get("/api/labs", (req, res) => {
  const state = store.getCurrentState();
  res.json({ labs: state.labs });
});

app.put("/api/labs/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = store.updateLabResult(id, updates);
  if (!updated) return res.status(404).json({ error: "Lab not found" });
  res.json({ success: true, lab: updated });
});

app.post("/api/labs", (req, res) => {
  const newLab: ExtractedLabResult = {
    ...req.body,
    id: `lab-${Date.now()}`,
    verified: true,
  };
  store.addLabResult(newLab);
  res.json({ success: true, lab: newLab });
});

app.get("/api/labs/trends", (req, res) => {
  const state = store.getCurrentState();
  // Group tests by testName
  const groupedTests: Record<string, ExtractedLabResult[]> = {};
  state.labs.forEach((lab: ExtractedLabResult) => {
    if (typeof lab.valueNumeric === "number") {
      if (!groupedTests[lab.testName]) {
        groupedTests[lab.testName] = [];
      }
      groupedTests[lab.testName].push(lab);
    }
  });

  // Sort each group chronologically
  Object.keys(groupedTests).forEach((testName) => {
    groupedTests[testName].sort((a, b) => a.observedDate.localeCompare(b.observedDate));
  });

  res.json({ trends: groupedTests });
});

// Medications
app.get("/api/medications", (req, res) => {
  const state = store.getCurrentState();
  res.json({ medications: state.medications });
});

app.post("/api/medications", (req, res) => {
  const state = store.getCurrentState();
  const newMed: MedicationItem = {
    ...req.body,
    id: `med-${Date.now()}`,
    userId: state.profile.id,
    userConfirmed: true,
  };
  store.addMedication(newMed);
  res.json({ success: true, medication: newMed });
});

app.put("/api/medications/:id", (req, res) => {
  const { id } = req.params;
  const updated = store.updateMedication(id, req.body);
  if (!updated) return res.status(404).json({ error: "Medication not found" });
  res.json({ success: true, medication: updated });
});

app.post("/api/medications/:id/reminder-action", (req, res) => {
  const { id } = req.params;
  const { reminderId, action } = req.body; // action: 'taken' | 'skipped' | 'snoozed'
  const state = store.getCurrentState();
  const med = state.medications.find((m: MedicationItem) => m.id === id);

  if (!med) return res.status(404).json({ error: "Medication not found" });

  if (med.reminders) {
    const rem = med.reminders.find((r: any) => r.id === reminderId);
    if (rem) {
      rem.lastAction = {
        action,
        timestamp: new Date().toISOString(),
      };
      store.updateMedication(id, { reminders: med.reminders });
    }
  }

  // Also log to timeline if taken
  if (action === "taken") {
    store.addTimelineEvent({
      id: `time-${Date.now()}`,
      userId: state.profile.id,
      date: new Date().toISOString().split("T")[0],
      type: "medication",
      title: `${med.name} Logged as Taken`,
      summary: `Confirmed intake of ${med.name} ${med.strength} (${med.dosage}).`,
      summaryHi: `${med.name} ${med.strength} लेने की पुष्टि की गई।`,
    });
  }

  res.json({ success: true, medication: med });
});

// Health Timeline
app.get("/api/timeline", (req, res) => {
  const state = store.getCurrentState();
  res.json({ timeline: state.timeline });
});

app.post("/api/timeline", (req, res) => {
  const state = store.getCurrentState();
  const newEvent: TimelineEvent = {
    ...req.body,
    id: `time-${Date.now()}`,
    userId: state.profile.id,
  };
  store.addTimelineEvent(newEvent);
  res.json({ success: true, event: newEvent });
});

// Wellness
app.get("/api/wellness", (req, res) => {
  const state = store.getCurrentState();
  res.json({ wellness: state.wellness });
});

app.post("/api/wellness", (req, res) => {
  const state = store.getCurrentState();
  const entry = store.addWellnessEntry({
    ...req.body,
    id: `wel-${Date.now()}`,
    userId: state.profile.id,
  });
  res.json({ success: true, entry });
});

// Clinician Discussion Dossier Export
app.get("/api/reports/summary-export", (req, res) => {
  const state = store.getCurrentState();
  const abnormalLabs = state.labs.filter((l: ExtractedLabResult) => l.sourceInterpretation !== "Within Normal Range");
  const activeMeds = state.medications.filter((m: MedicationItem) => m.status === "Active");

  res.json({
    generatedAt: new Date().toISOString(),
    patient: state.profile,
    keyClinicalHighlights: {
      totalDocuments: state.documents.length,
      abnormalLabObservations: abnormalLabs,
      activeMedications: activeMeds,
      chronicConditions: state.profile.chronicConditions || [],
      knownAllergies: state.profile.allergies || [],
    },
    suggestedDiscussionTopics: [
      "Review response to current active pharmacotherapy and assess any side effects.",
      "Evaluate trend in out-of-range laboratory values relative to target thresholds.",
      "Discuss lifestyle, dietary, and exercise adherence for ongoing wellness.",
    ],
    safetyNotice: "This summary dossier was prepared by HEALTHORA for discussion with your treating medical doctor. It is not an automated medical diagnosis or prescription.",
  });
});

// ABDM & FHIR-Aligned Demonstration Bundle
app.get("/api/abdm/fhir-bundle", (req, res) => {
  const state = store.getCurrentState();
  const fhirBundle = {
    resourceType: "Bundle",
    type: "document",
    meta: {
      profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/HealthDocumentRecord"],
      lastUpdated: new Date().toISOString(),
    },
    entry: [
      {
        resource: {
          resourceType: "Patient",
          id: state.profile.id,
          identifier: [
            {
              system: "https://healthid.ndhm.gov.in",
              value: state.profile.abhaNumber || "91-4821-9032-4112",
              type: { text: "ABHA Health ID (Mock Demonstration)" },
            },
          ],
          name: [{ text: state.profile.name }],
          gender: state.profile.gender?.toLowerCase() || "unknown",
          birthDate: state.profile.dob || "1978-04-14",
        },
      },
      ...state.labs.slice(0, 5).map((lab: ExtractedLabResult) => ({
        resource: {
          resourceType: "Observation",
          id: lab.id,
          status: "final",
          code: { text: lab.testName },
          valueQuantity: lab.valueNumeric ? {
            value: lab.valueNumeric,
            unit: lab.unit,
          } : undefined,
          referenceRange: [
            {
              text: lab.referenceRangeText,
              low: lab.referenceLow ? { value: lab.referenceLow } : undefined,
              high: lab.referenceHigh ? { value: lab.referenceHigh } : undefined,
            },
          ],
          interpretation: [{ text: lab.sourceInterpretation }],
        },
      })),
      ...state.medications.filter((m: MedicationItem) => m.status === "Active").map((med: MedicationItem) => ({
        resource: {
          resourceType: "MedicationStatement",
          id: med.id,
          status: "active",
          medicationCodeableConcept: { text: med.name },
          dosage: [{ text: `${med.dosage} - ${med.frequency}` }],
        },
      })),
    ],
  };

  res.json({
    abdmNote: "ABDM-inspired, FHIR R4-compliant mock data bundle. Healthora formats all clinical records with standard interoperability schemas.",
    bundle: fhirBundle,
  });
});

// ---------------- DEV / PRODUCTION STATIC HOSTING ----------------

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Healthora server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
