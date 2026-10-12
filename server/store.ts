export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  preferredLanguage: "en" | "hi";
  abhaNumber?: string;
  allergies?: string[];
  chronicConditions?: string[];
  avatarUrl?: string;
}

export interface MedicalDocument {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  documentType: "Lab Report" | "Prescription" | "Discharge Summary" | "Imaging Report" | "Other";
  documentDate: string;
  facility?: string;
  doctor?: string;
  uploadDate: string;
  status: "uploaded" | "processing" | "analyzed" | "verified";
  previewUrl?: string;
  thumbnailUrl?: string;
  fileBase64?: string;
  rawData?: string; // base64 or document marker
  extractedData?: ExtractedClinicalData;
}

export interface ExtractedLabResult {
  id: string;
  documentId: string;
  testName: string;
  category: "Lipid Panel" | "Metabolic / Glucose" | "Hematology" | "Renal / Kidney" | "Thyroid" | "Liver" | "Vitamins" | "Other";
  valueNumeric?: number;
  valueText: string;
  unit: string;
  referenceLow?: number;
  referenceHigh?: number;
  referenceRangeText: string;
  sourceInterpretation: "Within Normal Range" | "Above Reference Range" | "Below Reference Range" | "Requires Review";
  observedDate: string;
  verified: boolean;
  userCorrection?: {
    correctedValue: string;
    correctedBy: string;
    correctedAt: string;
    correctionReason?: string;
  };
  clinicalExplanationEn: string;
  clinicalExplanationHi: string;
  confidenceScore: number;
}

export interface MedicationItem {
  id: string;
  userId: string;
  documentId?: string;
  name: string;
  genericName?: string;
  strength: string;
  dosage: string;
  route: string;
  frequency: string;
  instructions: string;
  instructionsHi?: string;
  startDate: string;
  endDate?: string;
  status: "Active" | "Extracted" | "Discontinued" | "Completed";
  userConfirmed: boolean;
  prescribingDoctor?: string;
  reminders?: {
    id: string;
    time: string;
    days: string[];
    enabled: boolean;
    lastAction?: {
      action: "taken" | "skipped" | "snoozed";
      timestamp: string;
    };
  }[];
}

export interface ExtractedClinicalData {
  documentId: string;
  patientName?: string;
  documentType: string;
  documentDate: string;
  facility?: string;
  doctorName?: string;
  diagnoses: string[];
  plainSummaryEn: string;
  plainSummaryHi: string;
  keyObservations: string[];
  verificationNeeded: string[];
  questionsForClinician: string[];
  uncertaintyDisclaimers: string[];
  labsCount: number;
  medsCount: number;
}

export interface TimelineEvent {
  id: string;
  userId: string;
  date: string;
  type: "document" | "lab" | "medication" | "wellness" | "clinical_note";
  title: string;
  summary: string;
  summaryHi?: string;
  documentId?: string;
  meta?: Record<string, any>;
}

export interface WellnessEntry {
  id: string;
  userId: string;
  date: string;
  sleepHours: number;
  steps: number;
  waterGlasses: number;
  restingHeartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  notes?: string;
}

// Initial demo profiles
export const DEMO_PROFILES: Record<string, {
  profile: UserProfile;
  documents: MedicalDocument[];
  labs: ExtractedLabResult[];
  medications: MedicationItem[];
  timeline: TimelineEvent[];
  wellness: WellnessEntry[];
}> = {
  "rajesh": {
    profile: {
      id: "demo-rajesh",
      name: "Rajesh Sharma",
      email: "rajesh.sharma@example.com",
      dob: "1978-04-14",
      gender: "Male",
      bloodGroup: "B+",
      preferredLanguage: "en",
      abhaNumber: "91-4821-9032-4112",
      allergies: ["Penicillin", "Sulfa drugs"],
      chronicConditions: ["Type 2 Diabetes Mellitus", "Dyslipidemia", "Essential Hypertension"],
      avatarUrl: "/src/assets/images/avatar_patient_demo_1791789273596.jpg",
    },
    documents: [
      {
        id: "doc-1",
        userId: "demo-rajesh",
        title: "Comprehensive Metabolic & Lipid Profile",
        fileName: "Apex_Pathology_Lipid_Metabolic_Jan2026.pdf",
        fileSize: 1420000,
        mimeType: "application/pdf",
        documentType: "Lab Report",
        documentDate: "2026-01-18",
        facility: "Apex Central Diagnostic Laboratory",
        doctor: "Dr. Arvind Mehta, MD",
        uploadDate: "2026-01-18T10:30:00Z",
        status: "verified",
        thumbnailUrl: "/src/assets/images/doc_lab_report_sample_1791789285403.jpg",
        extractedData: {
          documentId: "doc-1",
          patientName: "Rajesh Sharma",
          documentType: "Clinical Biochemistry & Glycemic Panel",
          documentDate: "2026-01-18",
          facility: "Apex Central Diagnostic Laboratory",
          doctorName: "Dr. Arvind Mehta, MD (Pathologist)",
          diagnoses: ["Type 2 Diabetes (Suboptimally controlled HbA1c)", "Mixed Dyslipidemia (Elevated LDL & Triglycerides)"],
          plainSummaryEn: "This report measures key markers for your blood sugar and cholesterol regulation. Your Glycated Hemoglobin (HbA1c) was 7.4%, which is above the laboratory target range (<5.7% for non-diabetic; typically <7.0% clinical target). Fasting blood glucose was 138 mg/dL. Your Total Cholesterol (218 mg/dL) and Triglycerides (182 mg/dL) are modestly elevated compared to standard reference intervals. Kidney function markers (Serum Creatinine and eGFR) remain within healthy reference ranges.",
          plainSummaryHi: "यह रिपोर्ट आपके रक्त शर्करा (ब्लड शुगर) और कोलेस्ट्रॉल के प्रमुख स्तरों को दर्शाती है। आपका HbA1c स्तर 7.4% है, जो सामान्य सीमा से अधिक है। उपवास का ग्लूकोज (Fasting Glucose) 138 mg/dL पाया गया। कुल कोलेस्ट्रॉल (218 mg/dL) और ट्राइग्लिसराइड्स (182 mg/dL) भी संदर्भ सीमा से थोड़े ऊपर हैं। हालांकि, किडनी के कार्य (सीरम क्रिएटिनिन) पूरी तरह सामान्य सीमा के भीतर हैं।",
          keyObservations: [
            "HbA1c of 7.4% indicates average blood sugar has been above target over the past 3 months.",
            "Fasting Blood Sugar at 138 mg/dL is above laboratory reference interval (70-99 mg/dL).",
            "LDL Cholesterol at 132 mg/dL is moderately elevated above target threshold.",
            "Kidney filtration (Creatinine 0.92 mg/dL) is within normal reference limits.",
          ],
          verificationNeeded: [
            "Confirm if you were fasting for a full 10-12 hours prior to venous blood draw.",
            "Confirm whether morning dose of Metformin was taken before or after this blood sample.",
          ],
          questionsForClinician: [
            "Given that HbA1c remains at 7.4% on current Metformin 500mg BD, should we evaluate dose adjustment or lifestyle modifications?",
            "Would you recommend a follow-up lipid profile in 3 months to review response to statin therapy?",
            "Are there any specific dietary carbohydrate targets you advise for managing postprandial glucose?",
          ],
          uncertaintyDisclaimers: [
            "This AI-generated analysis is for informational organization only and does not diagnose disease or prescribe treatment.",
            "Always consult your attending physician before altering medication dosages.",
          ],
          labsCount: 7,
          medsCount: 0,
        },
      },
      {
        id: "doc-2",
        userId: "demo-rajesh",
        title: "Cardiometabolic Consultation & Prescription",
        fileName: "Apollo_Clinic_Rx_DrMehta_Oct2025.pdf",
        fileSize: 840000,
        mimeType: "application/pdf",
        documentType: "Prescription",
        documentDate: "2025-10-12",
        facility: "Apollo Clinic, Indiranagar",
        doctor: "Dr. K. Srinivas, Consultant Cardiologist",
        uploadDate: "2025-10-12T16:00:00Z",
        status: "verified",
        extractedData: {
          documentId: "doc-2",
          patientName: "Rajesh Sharma",
          documentType: "Outpatient Prescription & Follow-up Note",
          documentDate: "2025-10-12",
          facility: "Apollo Clinic, Indiranagar",
          doctorName: "Dr. K. Srinivas, MBBS, MD, DM (Cardiology)",
          diagnoses: ["Type 2 Diabetes Mellitus", "Stage 1 Essential Hypertension", "Hypertriglyceridemia"],
          plainSummaryEn: "Outpatient clinical consultation prescribing ongoing oral antihyperglycemic (Metformin 500mg twice daily with meals) and antihypertensive medication (Telmisartan 40mg once daily in the morning), plus Atorvastatin 10mg once daily at bedtime for cardiovascular risk reduction. Advised 30 minutes brisk walking daily and low glycemic index diet.",
          plainSummaryHi: "डॉ. श्रीनिवास द्वारा दी गई ओपीडी पर्ची जिसमें मेटफॉर्मिन (500mg दिन में दो बार खाने के साथ), टेल्मिसार्टन (40mg सुबह) और एटोरवास्टेटिन (10mg रात को सोने से पहले) लेने की सलाह दी गई है। साथ ही प्रतिदिन 30 मिनट तेज चलने और कम मीठे आहार की सलाह दी गई है।",
          keyObservations: [
            "Prescribed Metformin 500mg PO BD after meals.",
            "Prescribed Telmisartan 40mg PO OD morning for blood pressure control.",
            "Prescribed Atorvastatin 10mg PO OD at bedtime for cholesterol management.",
          ],
          verificationNeeded: [
            "Confirm if you experience any muscle stiffness or gastrointestinal discomfort after starting Atorvastatin.",
          ],
          questionsForClinician: [
            "What is our target home blood pressure reading in the morning?",
            "When should the next liver enzyme test (ALT/AST) be scheduled while on statins?",
          ],
          uncertaintyDisclaimers: [
            "Extracted medication instructions must match your physical prescription bottle label.",
          ],
          labsCount: 0,
          medsCount: 3,
        },
      },
      {
        id: "doc-3",
        userId: "demo-rajesh",
        title: "Quarterly Glycemic & Lipid Panel",
        fileName: "Apex_Diagnostic_FollowUp_May2025.pdf",
        fileSize: 1100000,
        mimeType: "application/pdf",
        documentType: "Lab Report",
        documentDate: "2025-05-10",
        facility: "Apex Central Diagnostic Laboratory",
        doctor: "Dr. Arvind Mehta, MD",
        uploadDate: "2025-05-10T09:15:00Z",
        status: "verified",
        extractedData: {
          documentId: "doc-3",
          patientName: "Rajesh Sharma",
          documentType: "Follow-up Biochemistry",
          documentDate: "2025-05-10",
          facility: "Apex Central Diagnostic Laboratory",
          doctorName: "Dr. Arvind Mehta, MD",
          diagnoses: ["Type 2 Diabetes Mellitus"],
          plainSummaryEn: "Historical lab panel from May 2025 showing HbA1c at 7.8% (down to 7.4% by Jan 2026), Fasting Glucose at 152 mg/dL, and Total Cholesterol at 234 mg/dL.",
          plainSummaryHi: "मई 2025 की ऐतिहासिक लैब रिपोर्ट जिसमें HbA1c 7.8% था (जो जनवरी 2026 तक घटकर 7.4% हुआ), फास्टिंग ग्लूकोज 152 mg/dL था।",
          keyObservations: ["HbA1c was 7.8% in May 2025; progressive reduction observed over the 8-month interval."],
          verificationNeeded: [],
          questionsForClinician: ["How does the trend compare with our overall target?"],
          uncertaintyDisclaimers: ["Standard observational comparison."],
          labsCount: 5,
          medsCount: 0,
        },
      },
    ],
    labs: [
      {
        id: "lab-1",
        documentId: "doc-1",
        testName: "HbA1c (Glycated Hemoglobin)",
        category: "Metabolic / Glucose",
        valueNumeric: 7.4,
        valueText: "7.4",
        unit: "%",
        referenceLow: 4.0,
        referenceHigh: 5.6,
        referenceRangeText: "< 5.7% (Normal), 5.7 - 6.4% (Prediabetes), >= 6.5% (Diabetes)",
        sourceInterpretation: "Above Reference Range",
        observedDate: "2026-01-18",
        verified: true,
        clinicalExplanationEn: "Reflects average blood glucose over the previous 90-120 days. At 7.4%, it is above the normal non-diabetic range and slightly above typical therapeutic targets (<7.0%), though improved from 7.8% in May 2025.",
        clinicalExplanationHi: "यह पिछले 3 महीनों के औसत ब्लड शुगर को दर्शाता है। 7.4% का स्तर मधुमेह के लक्ष्य से थोड़ा अधिक है, लेकिन पिछले टेस्ट (7.8%) से बेहतर हुआ है।",
        confidenceScore: 0.98,
      },
      {
        id: "lab-2",
        documentId: "doc-3",
        testName: "HbA1c (Glycated Hemoglobin)",
        category: "Metabolic / Glucose",
        valueNumeric: 7.8,
        valueText: "7.8",
        unit: "%",
        referenceLow: 4.0,
        referenceHigh: 5.6,
        referenceRangeText: "< 5.7%",
        sourceInterpretation: "Above Reference Range",
        observedDate: "2025-05-10",
        verified: true,
        clinicalExplanationEn: "Historical measurement showing baseline prior to medication adherence reinforcement.",
        clinicalExplanationHi: "मई 2025 का ऐतिहासिक परीक्षण जो दवा सुधार से पहले का स्तर दर्शाता है।",
        confidenceScore: 0.97,
      },
      {
        id: "lab-3",
        documentId: "doc-1",
        testName: "Fasting Blood Glucose",
        category: "Metabolic / Glucose",
        valueNumeric: 138,
        valueText: "138",
        unit: "mg/dL",
        referenceLow: 70,
        referenceHigh: 99,
        referenceRangeText: "70 - 99 mg/dL",
        sourceInterpretation: "Above Reference Range",
        observedDate: "2026-01-18",
        verified: true,
        clinicalExplanationEn: "Blood sugar level after overnight 10-hour fasting. 138 mg/dL is elevated above normal fasting benchmark (99 mg/dL).",
        clinicalExplanationHi: "रात भर के उपवास के बाद का रक्त शर्करा स्तर। 138 mg/dL सामान्य स्तर (99 mg/dL) से अधिक है।",
        confidenceScore: 0.99,
      },
      {
        id: "lab-4",
        documentId: "doc-3",
        testName: "Fasting Blood Glucose",
        category: "Metabolic / Glucose",
        valueNumeric: 152,
        valueText: "152",
        unit: "mg/dL",
        referenceLow: 70,
        referenceHigh: 99,
        referenceRangeText: "70 - 99 mg/dL",
        sourceInterpretation: "Above Reference Range",
        observedDate: "2025-05-10",
        verified: true,
        clinicalExplanationEn: "Baseline fasting blood sugar showing historical elevation before lifestyle intervention.",
        clinicalExplanationHi: "मई 2025 का ऐतिहासिक फास्टिंग ग्लूकोज स्तर।",
        confidenceScore: 0.98,
      },
      {
        id: "lab-5",
        documentId: "doc-1",
        testName: "Total Cholesterol",
        category: "Lipid Panel",
        valueNumeric: 218,
        valueText: "218",
        unit: "mg/dL",
        referenceLow: 125,
        referenceHigh: 200,
        referenceRangeText: "< 200 mg/dL",
        sourceInterpretation: "Above Reference Range",
        observedDate: "2026-01-18",
        verified: true,
        clinicalExplanationEn: "Total circulating cholesterol in blood. 218 mg/dL is mildly above standard desirable cutoff (<200 mg/dL).",
        clinicalExplanationHi: "कुल कोलेस्ट्रॉल का स्तर 218 mg/dL है, जो वांछनीय सीमा (200 से कम) से थोड़ा अधिक है।",
        confidenceScore: 0.99,
      },
      {
        id: "lab-6",
        documentId: "doc-3",
        testName: "Total Cholesterol",
        category: "Lipid Panel",
        valueNumeric: 234,
        valueText: "234",
        unit: "mg/dL",
        referenceLow: 125,
        referenceHigh: 200,
        referenceRangeText: "< 200 mg/dL",
        sourceInterpretation: "Above Reference Range",
        observedDate: "2025-05-10",
        verified: true,
        clinicalExplanationEn: "Historical measurement: down from 234 mg/dL to 218 mg/dL after starting statin therapy.",
        clinicalExplanationHi: "ऐतिहासिक माप: स्टेटिन शुरू करने के बाद 234 से घटकर 218 mg/dL हुआ।",
        confidenceScore: 0.96,
      },
      {
        id: "lab-7",
        documentId: "doc-1",
        testName: "LDL Cholesterol",
        category: "Lipid Panel",
        valueNumeric: 132,
        valueText: "132",
        unit: "mg/dL",
        referenceLow: 50,
        referenceHigh: 100,
        referenceRangeText: "< 100 mg/dL (Optimal for diabetic patient: < 70)",
        sourceInterpretation: "Above Reference Range",
        observedDate: "2026-01-18",
        verified: true,
        clinicalExplanationEn: "Low-Density Lipoprotein ('bad' cholesterol). In diabetes, clinical guidelines often recommend stricter LDL targets.",
        clinicalExplanationHi: "एलडीएल कोलेस्ट्रॉल ('खराब' कोलेस्ट्रॉल)। मधुमेह के रोगियों में इसे 100 या 70 से नीचे रखने की सलाह दी जाती है।",
        confidenceScore: 0.97,
      },
      {
        id: "lab-8",
        documentId: "doc-1",
        testName: "Triglycerides",
        category: "Lipid Panel",
        valueNumeric: 182,
        valueText: "182",
        unit: "mg/dL",
        referenceLow: 40,
        referenceHigh: 150,
        referenceRangeText: "< 150 mg/dL",
        sourceInterpretation: "Above Reference Range",
        observedDate: "2026-01-18",
        verified: true,
        clinicalExplanationEn: "Blood fat particles related to carbohydrate intake and insulin sensitivity. 182 mg/dL is mildly elevated.",
        clinicalExplanationHi: "ट्राइग्लिसराइड्स 182 mg/dL हैं, जो सामान्य सीमा (150 से कम) से कुछ अधिक हैं।",
        confidenceScore: 0.98,
      },
      {
        id: "lab-9",
        documentId: "doc-1",
        testName: "Serum Creatinine",
        category: "Renal / Kidney",
        valueNumeric: 0.92,
        valueText: "0.92",
        unit: "mg/dL",
        referenceLow: 0.6,
        referenceHigh: 1.2,
        referenceRangeText: "0.60 - 1.20 mg/dL",
        sourceInterpretation: "Within Normal Range",
        observedDate: "2026-01-18",
        verified: true,
        clinicalExplanationEn: "Waste product filtered by kidneys. 0.92 mg/dL confirms preserved renal filtration capacity.",
        clinicalExplanationHi: "सीरम क्रिएटिनिन 0.92 mg/dL सामान्य सीमा में है, जो स्वस्थ किडनी कार्य को दर्शाता है।",
        confidenceScore: 0.99,
      },
      {
        id: "lab-10",
        documentId: "doc-1",
        testName: "eGFR (Estimated Glomerular Filtration)",
        category: "Renal / Kidney",
        valueNumeric: 94,
        valueText: "94",
        unit: "mL/min/1.73m²",
        referenceLow: 60,
        referenceHigh: 120,
        referenceRangeText: "> 90 mL/min/1.73m² (Normal)",
        sourceInterpretation: "Within Normal Range",
        observedDate: "2026-01-18",
        verified: true,
        clinicalExplanationEn: "Estimated filtration rate calculated from creatinine. >90 indicates normal kidney clearance.",
        clinicalExplanationHi: "ईजीएफआर 94 है, जो सामान्य और स्वस्थ किडनी निस्पंदन दर को दर्शाता है।",
        confidenceScore: 0.99,
      },
    ],
    medications: [
      {
        id: "med-1",
        userId: "demo-rajesh",
        documentId: "doc-2",
        name: "Metformin Hydrochloride",
        genericName: "Metformin Extended Release",
        strength: "500 mg",
        dosage: "1 tablet (500mg)",
        route: "Oral",
        frequency: "Twice daily (BD)",
        instructions: "Take with or immediately after morning and evening meals to reduce stomach upset.",
        instructionsHi: "पेट की समस्या से बचने के लिए सुबह और शाम के भोजन के साथ या तुरंत बाद लें।",
        startDate: "2025-05-15",
        status: "Active",
        userConfirmed: true,
        prescribingDoctor: "Dr. K. Srinivas",
        reminders: [
          { id: "rem-1a", time: "08:30", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], enabled: true, lastAction: { action: "taken", timestamp: "2026-10-12T08:35:00Z" } },
          { id: "rem-1b", time: "20:30", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], enabled: true },
        ],
      },
      {
        id: "med-2",
        userId: "demo-rajesh",
        documentId: "doc-2",
        name: "Atorvastatin",
        genericName: "Atorvastatin Calcium",
        strength: "10 mg",
        dosage: "1 tablet (10mg)",
        route: "Oral",
        frequency: "Once daily at bedtime (HS)",
        instructions: "Take once daily at night. Report any unexplained muscle pain or severe fatigue.",
        instructionsHi: "रोज रात को सोने से पहले लें। यदि मांसपेशियों में दर्द हो तो डॉक्टर को सूचित करें।",
        startDate: "2025-10-12",
        status: "Active",
        userConfirmed: true,
        prescribingDoctor: "Dr. K. Srinivas",
        reminders: [
          { id: "rem-2a", time: "21:45", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], enabled: true },
        ],
      },
      {
        id: "med-3",
        userId: "demo-rajesh",
        documentId: "doc-2",
        name: "Telmisartan",
        genericName: "Telmisartan",
        strength: "40 mg",
        dosage: "1 tablet (40mg)",
        route: "Oral",
        frequency: "Once daily in the morning (OD)",
        instructions: "Take in the morning with a glass of water. Maintain regular blood pressure monitoring.",
        instructionsHi: "सुबह एक गिलास पानी के साथ लें। नियमित रूप से रक्तचाप की जांच करते रहें।",
        startDate: "2025-10-12",
        status: "Active",
        userConfirmed: true,
        prescribingDoctor: "Dr. K. Srinivas",
        reminders: [
          { id: "rem-3a", time: "08:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], enabled: true, lastAction: { action: "taken", timestamp: "2026-10-12T08:05:00Z" } },
        ],
      },
      {
        id: "med-4",
        userId: "demo-rajesh",
        name: "Vitamin D3 (Cholecalciferol)",
        genericName: "Cholecalciferol 60,000 IU",
        strength: "60,000 IU",
        dosage: "1 capsule weekly",
        route: "Oral",
        frequency: "Once weekly on Sundays",
        instructions: "Take after lunch with milk or a meal containing healthy fats.",
        instructionsHi: "रविवार को दोपहर के भोजन के बाद दूध के साथ लें।",
        startDate: "2025-06-01",
        endDate: "2025-08-30",
        status: "Completed",
        userConfirmed: true,
        prescribingDoctor: "Dr. Arvind Mehta",
      },
    ],
    timeline: [
      {
        id: "time-1",
        userId: "demo-rajesh",
        date: "2026-01-18",
        type: "lab",
        title: "Metabolic & Lipid Panel Recorded",
        summary: "Apex Central Diagnostic report uploaded. HbA1c at 7.4%, Fasting Glucose at 138 mg/dL, LDL at 132 mg/dL. Creatinine normal (0.92 mg/dL).",
        summaryHi: "लैब रिपोर्ट दर्ज: HbA1c 7.4%, फास्टिंग ग्लूकोज 138 mg/dL, एलडीएल 132 mg/dL। क्रिएटिनिन सामान्य (0.92 mg/dL)।",
        documentId: "doc-1",
      },
      {
        id: "time-2",
        userId: "demo-rajesh",
        date: "2025-10-12",
        type: "medication",
        title: "Cardiology Consultation & Regimen Adjustment",
        summary: "Dr. K. Srinivas started Atorvastatin 10mg HS and Telmisartan 40mg OD alongside existing Metformin 500mg BD.",
        summaryHi: "डॉ. श्रीनिवास ने मेटफॉर्मिन के साथ एटोरवास्टेटिन 10mg और टेल्मिसार्टन 40mg शुरू किया।",
        documentId: "doc-2",
      },
      {
        id: "time-3",
        userId: "demo-rajesh",
        date: "2025-05-10",
        type: "document",
        title: "Baseline Diabetes Monitoring Report",
        summary: "Recorded baseline HbA1c at 7.8% and Fasting Blood Sugar at 152 mg/dL prior to comprehensive cardiology review.",
        summaryHi: "शुरुआती मधुमेह रिपोर्ट दर्ज: HbA1c 7.8% और फास्टिंग ब्लड शुगर 152 mg/dL।",
        documentId: "doc-3",
      },
      {
        id: "time-4",
        userId: "demo-rajesh",
        date: "2026-10-10",
        type: "wellness",
        title: "Weekly Wellness Average Logged",
        summary: "Completed 7,850 daily steps average with 7.2 hours sleep. Morning resting blood pressure 126/82 mmHg.",
        summaryHi: "साप्ताहिक औसत: 7,850 कदम और 7.2 घंटे नींद। सुबह का रक्तचाप 126/82 mmHg।",
      },
      {
        id: "time-5",
        userId: "demo-rajesh",
        date: "2026-10-11",
        type: "clinical_note",
        title: "Patient Self-Check Note",
        summary: "Fasting capillary fingerstick blood sugar tested at home: 128 mg/dL. No episodes of dizziness or hypoglycemia.",
        summaryHi: "घर पर ग्लूकोमीटर से फास्टिंग शुगर मापी: 128 mg/dL। कोई चक्कर या कमजोरी नहीं।",
      },
    ],
    wellness: [
      { id: "wel-1", userId: "demo-rajesh", date: "2026-10-06", sleepHours: 6.8, steps: 6420, waterGlasses: 8, restingHeartRate: 72, bloodPressureSystolic: 128, bloodPressureDiastolic: 84 },
      { id: "wel-2", userId: "demo-rajesh", date: "2026-10-07", sleepHours: 7.2, steps: 7850, waterGlasses: 9, restingHeartRate: 70, bloodPressureSystolic: 126, bloodPressureDiastolic: 82 },
      { id: "wel-3", userId: "demo-rajesh", date: "2026-10-08", sleepHours: 7.5, steps: 8320, waterGlasses: 10, restingHeartRate: 68, bloodPressureSystolic: 124, bloodPressureDiastolic: 80 },
      { id: "wel-4", userId: "demo-rajesh", date: "2026-10-09", sleepHours: 6.5, steps: 5900, waterGlasses: 7, restingHeartRate: 74, bloodPressureSystolic: 130, bloodPressureDiastolic: 86 },
      { id: "wel-5", userId: "demo-rajesh", date: "2026-10-10", sleepHours: 7.8, steps: 9100, waterGlasses: 9, restingHeartRate: 69, bloodPressureSystolic: 122, bloodPressureDiastolic: 78 },
      { id: "wel-6", userId: "demo-rajesh", date: "2026-10-11", sleepHours: 7.1, steps: 7450, waterGlasses: 8, restingHeartRate: 71, bloodPressureSystolic: 125, bloodPressureDiastolic: 81 },
      { id: "wel-7", userId: "demo-rajesh", date: "2026-10-12", sleepHours: 7.4, steps: 8200, waterGlasses: 9, restingHeartRate: 70, bloodPressureSystolic: 124, bloodPressureDiastolic: 80, notes: "Morning brisk walk in park; feeling energetic." },
    ],
  },
  "priya": {
    profile: {
      id: "demo-priya",
      name: "Priya Patel",
      email: "priya.patel@example.com",
      dob: "1991-08-22",
      gender: "Female",
      bloodGroup: "O+",
      preferredLanguage: "en",
      abhaNumber: "91-3329-8812-7041",
      allergies: ["None known"],
      chronicConditions: ["Mild Vitamin D Deficiency"],
      avatarUrl: "/src/assets/images/avatar_patient_demo_1791789273596.jpg",
    },
    documents: [
      {
        id: "doc-p1",
        userId: "demo-priya",
        title: "Annual Preventive Health Checkup",
        fileName: "Max_Healthcare_Annual_Preventive_Nov2025.pdf",
        fileSize: 1840000,
        mimeType: "application/pdf",
        documentType: "Lab Report",
        documentDate: "2025-11-20",
        facility: "Max Healthcare Institute",
        doctor: "Dr. Ananya Roy, Consultant Physician",
        uploadDate: "2025-11-20T11:00:00Z",
        status: "verified",
        extractedData: {
          documentId: "doc-p1",
          patientName: "Priya Patel",
          documentType: "Annual Health Assessment",
          documentDate: "2025-11-20",
          facility: "Max Healthcare Institute",
          doctorName: "Dr. Ananya Roy, MD",
          diagnoses: ["Vitamin D Insufficiency (18.4 ng/mL)", "Normal Hematology & Thyroid function"],
          plainSummaryEn: "Annual executive health screen showing normal complete blood count (Hemoglobin 13.2 g/dL) and normal thyroid stimulating hormone (TSH 2.1 mIU/L). Vitamin D was low at 18.4 ng/mL (optimal >30 ng/mL).",
          plainSummaryHi: "वार्षिक स्वास्थ्य जांच जिसमें हीमोग्लोबिन (13.2 g/dL) और थायराइड (TSH 2.1 mIU/L) सामान्य हैं। विटामिन डी 18.4 ng/mL पर कम पाया गया (सामान्य 30 से अधिक होना चाहिए)।",
          keyObservations: ["Hemoglobin 13.2 g/dL is well within normal female reference range (12.0 - 15.5 g/dL).", "Vitamin D is 18.4 ng/mL, indicating mild deficiency."],
          verificationNeeded: [],
          questionsForClinician: ["What oral Vitamin D supplementation protocol do you recommend?"],
          uncertaintyDisclaimers: ["Informational summary."],
          labsCount: 4,
          medsCount: 1,
        },
      },
    ],
    labs: [
      {
        id: "lab-p1",
        documentId: "doc-p1",
        testName: "Hemoglobin",
        category: "Hematology",
        valueNumeric: 13.2,
        valueText: "13.2",
        unit: "g/dL",
        referenceLow: 12.0,
        referenceHigh: 15.5,
        referenceRangeText: "12.0 - 15.5 g/dL",
        sourceInterpretation: "Within Normal Range",
        observedDate: "2025-11-20",
        verified: true,
        clinicalExplanationEn: "Oxygen-carrying protein in red blood cells. 13.2 g/dL indicates healthy red cell volume without anemia.",
        clinicalExplanationHi: "लाल रक्त कोशिकाओं में ऑक्सीजन ले जाने वाला प्रोटीन। 13.2 g/dL स्वस्थ स्तर दर्शाता है।",
        confidenceScore: 0.99,
      },
      {
        id: "lab-p2",
        documentId: "doc-p1",
        testName: "25-Hydroxy Vitamin D",
        category: "Vitamins",
        valueNumeric: 18.4,
        valueText: "18.4",
        unit: "ng/mL",
        referenceLow: 30.0,
        referenceHigh: 100.0,
        referenceRangeText: "30.0 - 100.0 ng/mL (Deficient: <20, Insufficient: 20-29)",
        sourceInterpretation: "Below Reference Range",
        observedDate: "2025-11-20",
        verified: true,
        clinicalExplanationEn: "Important for bone health, calcium absorption, and immune function. 18.4 ng/mL is below standard sufficiency benchmark (>30 ng/mL).",
        clinicalExplanationHi: "हड्डियों और रोग प्रतिरोधक क्षमता के लिए आवश्यक। 18.4 ng/mL सामान्य स्तर (30 से अधिक) से कम है।",
        confidenceScore: 0.98,
      },
      {
        id: "lab-p3",
        documentId: "doc-p1",
        testName: "TSH (Thyroid Stimulating Hormone)",
        category: "Thyroid",
        valueNumeric: 2.1,
        valueText: "2.1",
        unit: "mIU/L",
        referenceLow: 0.4,
        referenceHigh: 4.5,
        referenceRangeText: "0.40 - 4.50 mIU/L",
        sourceInterpretation: "Within Normal Range",
        observedDate: "2025-11-20",
        verified: true,
        clinicalExplanationEn: "Pituitary hormone regulating thyroid activity. 2.1 mIU/L confirms euthyroid state.",
        clinicalExplanationHi: "थायराइड को नियंत्रित करने वाला हार्मोन। 2.1 mIU/L सामान्य और संतुलित स्तर है।",
        confidenceScore: 0.99,
      },
      {
        id: "lab-p4",
        documentId: "doc-p1",
        testName: "Fasting Blood Glucose",
        category: "Metabolic / Glucose",
        valueNumeric: 88,
        valueText: "88",
        unit: "mg/dL",
        referenceLow: 70,
        referenceHigh: 99,
        referenceRangeText: "70 - 99 mg/dL",
        sourceInterpretation: "Within Normal Range",
        observedDate: "2025-11-20",
        verified: true,
        clinicalExplanationEn: "Normal fasting glycemic level.",
        clinicalExplanationHi: "सामान्य उपवास शर्करा स्तर।",
        confidenceScore: 0.99,
      },
    ],
    medications: [
      {
        id: "med-p1",
        userId: "demo-priya",
        documentId: "doc-p1",
        name: "Cholecalciferol (Vitamin D3)",
        genericName: "Vitamin D3",
        strength: "60,000 IU",
        dosage: "1 sachet/capsule weekly",
        route: "Oral",
        frequency: "Once weekly for 8 weeks",
        instructions: "Take once weekly with milk or fatty meal.",
        instructionsHi: "सप्ताह में एक बार दूध के साथ लें।",
        startDate: "2025-11-22",
        status: "Active",
        userConfirmed: true,
        prescribingDoctor: "Dr. Ananya Roy",
        reminders: [
          { id: "rem-p1", time: "11:00", days: ["Sun"], enabled: true },
        ],
      },
    ],
    timeline: [
      {
        id: "time-p1",
        userId: "demo-priya",
        date: "2025-11-20",
        type: "document",
        title: "Annual Preventive Screen Documented",
        summary: "Max Healthcare comprehensive wellness panel completed. Vitamin D insufficiency identified.",
        summaryHi: "मैक्स हेल्थकेयर में वार्षिक जांच पूरी। विटामिन डी की कमी पाई गई।",
        documentId: "doc-p1",
      },
    ],
    wellness: [
      { id: "wel-p1", userId: "demo-priya", date: "2026-10-10", sleepHours: 8.0, steps: 10400, waterGlasses: 10, restingHeartRate: 64 },
      { id: "wel-p2", userId: "demo-priya", date: "2026-10-11", sleepHours: 7.6, steps: 9800, waterGlasses: 9, restingHeartRate: 65 },
      { id: "wel-p3", userId: "demo-priya", date: "2026-10-12", sleepHours: 7.8, steps: 11200, waterGlasses: 11, restingHeartRate: 63, notes: "Morning yoga session." },
    ],
  },
};

import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), ".data");
const DB_FILE = path.resolve(DATA_DIR, "healthora_db.json");

// Mutable persistent state with atomic disk persistence and optional Supabase sync
class HealthoraStore {
  private activeProfileKey = "rajesh";
  private profiles = JSON.parse(JSON.stringify(DEMO_PROFILES));
  private userCreatedAccounts: Record<string, {
    profile: UserProfile;
    documents: MedicalDocument[];
    labs: ExtractedLabResult[];
    medications: MedicationItem[];
    timeline: TimelineEvent[];
    wellness: WellnessEntry[];
  }> = {};

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.profiles) this.profiles = parsed.profiles;
        if (parsed.userCreatedAccounts) this.userCreatedAccounts = parsed.userCreatedAccounts;
        if (parsed.activeProfileKey) this.activeProfileKey = parsed.activeProfileKey;
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.warn("Failed to load persistent store from disk, starting fresh:", err);
    }
  }

  private saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = {
        activeProfileKey: this.activeProfileKey,
        profiles: this.profiles,
        userCreatedAccounts: this.userCreatedAccounts,
        lastSavedAt: new Date().toISOString(),
      };
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error("Failed to persist Healthora store to disk:", err);
    }
  }

  getActiveProfileKey() {
    return this.activeProfileKey;
  }

  setActiveProfileKey(key: string) {
    if (this.profiles[key] || this.userCreatedAccounts[key]) {
      this.activeProfileKey = key;
      this.saveToDisk();
      return true;
    }
    return false;
  }

  getCurrentState() {
    if (this.userCreatedAccounts[this.activeProfileKey]) {
      return this.userCreatedAccounts[this.activeProfileKey];
    }
    if (this.profiles[this.activeProfileKey]) {
      return this.profiles[this.activeProfileKey];
    }
    return this.profiles["rajesh"];
  }

  resetDemo() {
    this.profiles = JSON.parse(JSON.stringify(DEMO_PROFILES));
    this.activeProfileKey = "rajesh";
    this.saveToDisk();
  }

  createAccount(name: string, email: string, password?: string) {
    const id = `user-${Date.now()}`;
    const newAccount = {
      profile: {
        id,
        name,
        email,
        preferredLanguage: "en" as const,
        allergies: [],
        chronicConditions: [],
      },
      documents: [] as MedicalDocument[],
      labs: [] as ExtractedLabResult[],
      medications: [] as MedicationItem[],
      timeline: [] as TimelineEvent[],
      wellness: [] as WellnessEntry[],
    };
    this.userCreatedAccounts[id] = newAccount;
    this.activeProfileKey = id;
    this.saveToDisk();
    return newAccount.profile;
  }

  addDocument(doc: MedicalDocument) {
    const state = this.getCurrentState();
    state.documents.unshift(doc);
    this.saveToDisk();
    return doc;
  }

  updateDocument(docId: string, updates: Partial<MedicalDocument>) {
    const state = this.getCurrentState();
    const idx = state.documents.findIndex((d: MedicalDocument) => d.id === docId);
    if (idx !== -1) {
      state.documents[idx] = { ...state.documents[idx], ...updates };
      this.saveToDisk();
      return state.documents[idx];
    }
    return null;
  }

  deleteDocument(docId: string) {
    const state = this.getCurrentState();
    state.documents = state.documents.filter((d: MedicalDocument) => d.id !== docId);
    state.labs = state.labs.filter((l: ExtractedLabResult) => l.documentId !== docId);
    state.medications = state.medications.filter((m: MedicationItem) => m.documentId !== docId);
    state.timeline = state.timeline.filter((t: TimelineEvent) => t.documentId !== docId);
    this.saveToDisk();
  }

  addLabResult(lab: ExtractedLabResult) {
    const state = this.getCurrentState();
    state.labs.push(lab);
    this.saveToDisk();
    return lab;
  }

  updateLabResult(labId: string, updates: Partial<ExtractedLabResult>) {
    const state = this.getCurrentState();
    const idx = state.labs.findIndex((l: ExtractedLabResult) => l.id === labId);
    if (idx !== -1) {
      state.labs[idx] = { ...state.labs[idx], ...updates };
      this.saveToDisk();
      return state.labs[idx];
    }
    return null;
  }

  addMedication(med: MedicationItem) {
    const state = this.getCurrentState();
    state.medications.push(med);
    this.saveToDisk();
    return med;
  }

  updateMedication(medId: string, updates: Partial<MedicationItem>) {
    const state = this.getCurrentState();
    const idx = state.medications.findIndex((m: MedicationItem) => m.id === medId);
    if (idx !== -1) {
      state.medications[idx] = { ...state.medications[idx], ...updates };
      this.saveToDisk();
      return state.medications[idx];
    }
    return null;
  }

  addTimelineEvent(event: TimelineEvent) {
    const state = this.getCurrentState();
    state.timeline.unshift(event);
    this.saveToDisk();
    return event;
  }

  addWellnessEntry(entry: WellnessEntry) {
    const state = this.getCurrentState();
    state.wellness = state.wellness.filter((w: WellnessEntry) => w.date !== entry.date);
    state.wellness.push(entry);
    state.wellness.sort((a: WellnessEntry, b: WellnessEntry) => a.date.localeCompare(b.date));
    this.saveToDisk();
    return entry;
  }

  updateProfile(updates: Partial<UserProfile>) {
    const state = this.getCurrentState();
    state.profile = { ...state.profile, ...updates };
    this.saveToDisk();
    return state.profile;
  }
}

export const store = new HealthoraStore();

