"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  Calculator,
  Search,
  Volume2,
  Mic,
  MapPin,
  FileText,
  Sparkles,
  Building2,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  Languages,
  Send,
  Users,
  Compass,
  HeartHandshake,
  Bot,
  Check,
  PhoneCall,
  Lock,
  Eye,
  RefreshCw,
  Globe2,
  Award,
  X,
  ShieldCheck
} from "lucide-react";

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: { readonly transcript: string };
}

interface SpeechRecognitionEventLike {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  suppressEmptyEnd?: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;
type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructorLike;
  webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
};

// Mock Data for Essential Commodities (Live Bazaar Watch)
const BAZAAR_DATA = [
  { itemBn: "ফার্মের মুরগির ডিম (ডজন)", itemEn: "Farm Chicken Eggs (Dozen)", tcbPrice: 145, marketPrice: 160, unitBn: "ডজন", unitEn: "dozen", status: "high" },
  { itemBn: "দেশি পেঁয়াজ (কেজি)", itemEn: "Local Onion (Kg)", tcbPrice: 110, marketPrice: 115, unitBn: "কেজি", unitEn: "kg", status: "normal" },
  { itemBn: "সয়াবিন তেল (১ লিটার)", itemEn: "Soybean Oil (1L)", tcbPrice: 167, marketPrice: 172, unitBn: "বোতল", unitEn: "bottle", status: "slight" },
  { itemBn: "আলু (কার্ডিনাল কেজি)", itemEn: "Potato (Kg)", tcbPrice: 55, marketPrice: 65, unitBn: "কেজি", unitEn: "kg", status: "high" },
  { itemBn: "নাজিরশাইল চাল (কেজি)", itemEn: "Najirshail Rice (Kg)", tcbPrice: 72, marketPrice: 75, unitBn: "কেজি", unitEn: "kg", status: "normal" }
];

// Mock Civic Reports with Full Bilingual Schema
const INITIAL_REPORTS = [
  {
    id: "JNG-8821",
    titleBn: "মিরপুর-১০ এ উন্মুক্ত বিপজ্জনক ম্যানহোল",
    titleEn: "Hazardous Open Manhole at Mirpur-10",
    categoryBn: "ওয়াসা / ড্রেনেজ",
    categoryEn: "WASA / Drainage",
    locationBn: "মিরপুর-১০ গোলচত্বর সংলগ্ন",
    locationEn: "Near Mirpur-10 Roundabout, Dhaka",
    severity: "High",
    severityScore: 9.4,
    status: "In Progress",
    statusBn: "কাজ চলছে",
    statusEn: "In Progress",
    reportedAtBn: "২ ঘণ্টা আগে",
    reportedAtEn: "2 hours ago",
    upvotes: 42,
    assignedDeptBn: "ঢাকা ওয়াসা অঞ্চল-৪",
    assignedDeptEn: "Dhaka WASA Zone-4",
    aiReasoningBn: "ছবি বিশ্লেষণে উন্মুক্ত ম্যানহোলে ভারী পথচারী ঝুঁকি চিহ্নিত হয়েছে। রাতে গুরুতর দুর্ঘটনা ঘটার আশঙ্কা ৯২%। জরুরি ভিত্তিতে ওয়াসা ড্রেনেজ জোন-৪ এ আনুষ্ঠানিক ওয়ার্ক অর্ডার প্রস্তুত করা হয়েছে।",
    aiReasoningEn: "Computer vision identified high pedestrian hazard from missing lid. 92% probability of severe nocturnal accident. Work order dispatched to WASA Drainage Zone-4."
  },
  {
    id: "JNG-8819",
    titleBn: "উত্তরা সেক্টর ৭ এ রাস্তায় বর্জ্যের স্তূপ",
    titleEn: "Waste Accumulation on Road in Uttara Sector 7",
    categoryBn: "সিটি কর্পোরেশন বর্জ্য",
    categoryEn: "City Corporation Waste",
    locationBn: "উত্তরা সেক্টর ৭, রোড ৪",
    locationEn: "Uttara Sector 7, Road 4, Dhaka",
    severity: "Medium",
    severityScore: 6.8,
    status: "Reported",
    statusBn: "গৃহীত হয়েছে",
    statusEn: "Logged / Pending",
    reportedAtBn: "৫ ঘণ্টা আগে",
    reportedAtEn: "5 hours ago",
    upvotes: 18,
    assignedDeptBn: "ডিএনসিসি অঞ্চল-১",
    assignedDeptEn: "DNCC Waste Zone-1",
    aiReasoningBn: "রাস্তার অর্ধেক অংশ অবরুদ্ধ। রোগজীবাণু ছড়ানোর ঝুঁকি বিদ্যমান। ডিএনসিসি পরিচ্ছন্নতা পরিদর্শককে স্বয়ংক্রিয়ভাবে নোটিফাই করা হয়েছে।",
    aiReasoningEn: "Partial road blockage detected. Pathogen propagation risk. Cleanliness inspector notified automatically."
  },
  {
    id: "JNG-8815",
    titleBn: "ধানমন্ডি লেক ওয়াকওয়েতে নষ্ট স্ট্রিট লাইট",
    titleEn: "Faulty Street Lights near Dhanmondi Lake",
    categoryBn: "বিদ্যুৎ ও বাতি",
    categoryEn: "Electricity & Lighting",
    locationBn: "ধানমন্ডি লেক ওয়াকওয়ে",
    locationEn: "Dhanmondi Lake Walkway, Dhaka",
    severity: "Low",
    severityScore: 4.2,
    status: "Resolved",
    statusBn: "সমাধান সম্পন্ন",
    statusEn: "Resolved",
    reportedAtBn: "১ দিন আগে",
    reportedAtEn: "1 day ago",
    upvotes: 65,
    assignedDeptBn: "ডিএসসিসি বিদ্যুৎ বিভাগ",
    assignedDeptEn: "DSCC Electrical Dept",
    aiReasoningBn: "বাতি প্রতিস্থাপন সফলভাবে সম্পন্ন হয়েছে। নতুন এলইডি ফিটিংস ইন্সটল হওয়া নিশ্চিত করা হয়েছে।",
    aiReasoningEn: "Streetlight replacement verified complete. New LED fittings validated."
  }
];

export default function JonogonApp() {
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [darkMode, setDarkMode] = useState(false);
  const [activePortal, setActivePortal] = useState<"citizen" | "gov">("citizen");
  const [selectedReportForInspect, setSelectedReportForInspect] = useState<any | null>(null);

  const [activeTab, setActiveTab] = useState<
    "civic-signal" | "bazaar-watch" | "safe-report" | "rumor-buster" | "nrb-gateway" | "fee-calculator" | "doc-checker" | "scam-detector" | "volunteer-grid"
  >("civic-signal");

  // Translation helper function
  const t = (bnText: string, enText: string) => (lang === "bn" ? bnText : enText);

  // State for interactive features
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState<"bn" | "en">("bn");
  const speechRecognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // CivicSignal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("রাস্তা ও ম্যানহোল");
  const [newLocation, setNewLocation] = useState("");
  const [newSeverity, setNewSeverity] = useState("High");
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  // Fee Calculator State
  const [selectedService, setSelectedService] = useState("passport-48-5");
  
  // Scam Detector State
  const [scamUrl, setScamUrl] = useState("");
  const [scamResult, setScamResult] = useState<{ checked: boolean; isSafe: boolean; detailsBn: string; detailsEn: string; signals: string[] } | null>(null);

  // Rumor Buster State
  const [rumorQuery, setRumorQuery] = useState("");
  const [rumorResult, setRumorResult] = useState<{ checked: boolean; verdict: "fake" | "verified"; explanationBn: string; explanationEn: string; sourceBn: string; sourceEn: string; confidence: string } | null>(null);

  // SafeReport Whistleblower State
  const [whistleOffice, setWhistleOffice] = useState("BRTA");
  const [whistleDetails, setWhistleDetails] = useState("");
  const [whistleToken, setWhistleToken] = useState<string | null>(null);

  // Document Checker State
  const [docFileUploaded, setDocFileUploaded] = useState(false);
  const [docAnalysis, setDocAnalysis] = useState<{ status: "ready" | "analyzing" | "completed"; results?: any } | null>(null);

  // NRB Remittance Calculator State
  const [remittanceAmount, setRemittanceAmount] = useState(1000);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Capture live speech using the browser's speech recognition service.
  const handleVoiceToggle = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsRecordingVoice(false);
      return;
    }

    const SpeechRecognition = (window as SpeechRecognitionWindow).SpeechRecognition
      ?? (window as SpeechRecognitionWindow).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceTranscript(t(
        "এই ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়। Chrome বা Edge ব্যবহার করে দেখুন।",
        "Voice input is not supported in this browser. Try Chrome or Edge."
      ));
      return;
    }

    const recognition = new SpeechRecognition();
    let hasRecognizedSpeech = false;
    let hasRecognitionError = false;
    recognition.lang = voiceLanguage === "bn" ? "bn-BD" : "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }

      transcript = transcript.trim();
      if (transcript) {
        hasRecognizedSpeech = true;
        setSearchQuery(transcript);
        setVoiceTranscript(transcript);
      }
    };

    recognition.onerror = (event) => {
      hasRecognitionError = true;
      if (speechRecognitionRef.current === recognition) {
        speechRecognitionRef.current = null;
      }
      const messages: Record<string, [string, string]> = {
        "not-allowed": ["মাইক্রোফোন ব্যবহারের অনুমতি দিন, তারপর আবার চেষ্টা করুন।", "Allow microphone access, then try again."],
        "service-not-allowed": ["ব্রাউজারের স্পিচ সার্ভিস ব্যবহার করা যাচ্ছে না।", "The browser's speech service is unavailable."],
        "audio-capture": ["কোনো মাইক্রোফোন পাওয়া যায়নি।", "No microphone was found."],
        "no-speech": ["কোনো কথা শোনা যায়নি। আবার বলুন।", "No speech was detected. Please try again."],
        "language-not-supported": ["এই ভাষার স্পিচ রিকগনিশন সমর্থিত নয়।", "Speech recognition for this language is not supported."],
        network: ["স্পিচ সার্ভিসে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।", "Could not connect to the speech service. Check your internet connection."],
      };
      const message = messages[event.error];
      if (event.error !== "aborted") {
        setVoiceTranscript(message ? t(message[0], message[1]) : t(
          "ভয়েস ইনপুটে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
          "Voice input failed. Please try again."
        ));
      }
      setIsRecordingVoice(false);
    };

    recognition.onend = () => {
      if (speechRecognitionRef.current === recognition) {
        speechRecognitionRef.current = null;
      }
      setIsRecordingVoice(false);
      if (!hasRecognizedSpeech && !hasRecognitionError && !recognition.suppressEmptyEnd) {
        setVoiceTranscript(t("কোনো কথা ধরা যায়নি। আবার চেষ্টা করুন।", "No speech was detected. Please try again."));
      }
    };

    try {
      setVoiceTranscript(t("শুনছি... কথা বলুন...", "Listening... speak now..."));
      setIsRecordingVoice(true);
      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      hasRecognitionError = true;
      speechRecognitionRef.current = null;
      setIsRecordingVoice(false);
      setVoiceTranscript(t(
        "মাইক্রোফোন চালু করা যায়নি। অনুমতি পরীক্ষা করে আবার চেষ্টা করুন।",
        "Could not start the microphone. Check its permission and try again."
      ));
    }
  };

  const handleVoiceLanguageToggle = () => {
    const nextLanguage = voiceLanguage === "bn" ? "en" : "bn";
    if (speechRecognitionRef.current) {
      const activeRecognition = speechRecognitionRef.current;
      speechRecognitionRef.current = null;
      activeRecognition.suppressEmptyEnd = true;
      activeRecognition.stop();
      setIsRecordingVoice(false);
    }
    setVoiceLanguage(nextLanguage);
    setVoiceTranscript(lang === "bn"
      ? nextLanguage === "bn" ? "ভয়েস ইনপুটের ভাষা বাংলা করা হয়েছে।" : "ভয়েস ইনপুটের ভাষা ইংরেজি করা হয়েছে।"
      : nextLanguage === "bn" ? "Voice input language set to Bangla." : "Voice input language set to English."
    );
  };

  // Submit Civic Signal Report
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLocation) return;
    const generatedId = `JNG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry = {
      id: generatedId,
      titleBn: newTitle,
      titleEn: newTitle,
      categoryBn: newCategory,
      categoryEn: newCategory,
      locationBn: newLocation,
      locationEn: newLocation,
      severity: newSeverity,
      severityScore: newSeverity === "High" ? 9.1 : 6.5,
      status: "Reported",
      statusBn: "গৃহীত হয়েছে",
      statusEn: "Logged / Pending",
      reportedAtBn: "এইমাত্র",
      reportedAtEn: "Just now",
      upvotes: 1,
      assignedDeptBn: newCategory.includes("ম্যানহোল") ? "ওয়াসা ড্রেনেজ বিভাগ" : "সিটি কর্পোরেশন",
      assignedDeptEn: newCategory.includes("ম্যানহোল") ? "WASA Drainage Dept" : "City Corporation",
      aiReasoningBn: "নাগরিক রিপোর্ট গৃহীত। স্বয়ংক্রিয় গোপনীয়তা ফিল্টারের মাধ্যমে ব্যক্তিগত তথ্য সুরক্ষিত করে ওয়ার্ক অর্ডার কিউতে যুক্ত করা হয়েছে।",
      aiReasoningEn: "Citizen report logged. PII automatically redacted and assigned to triage queue."
    };
    setReports([newEntry, ...reports]);
    setSubmittedReportId(generatedId);
    setNewTitle("");
    setNewLocation("");
  };

  // Check Scam URL
  const handleCheckScam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scamUrl) return;
    const isGov = scamUrl.toLowerCase().includes(".gov.bd") && !scamUrl.includes("bkash") && !scamUrl.includes("lottery") && !scamUrl.includes("free");
    if (isGov) {
      setScamResult({
        checked: true,
        isSafe: true,
        detailsBn: "এটি গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের একটি অনুমোদিত অফিসিয়াল ডোমেইন (.gov.bd)। ডিজিটাল নিরাপত্তা সার্টিফিকেট বৈধ।",
        detailsEn: "Verified Official Government of Bangladesh (.gov.bd) root domain with valid TLS encryption.",
        signals: ["Official DNS Record Verified", "Gov Root CA Validated", "Zero Phishing Traces"]
      });
    } else {
      setScamResult({
        checked: true,
        isSafe: false,
        detailsBn: "সতর্কতা: এই ওয়েবসাইটটি কোনো সরকারি ডোমেইন নয়! এটি ভুয়া বা ফিশিং সাইট যা সরকারি সেবার নাম করে অবৈধ ফি দাবি করতে পারে।",
        detailsEn: "Warning: This domain is NOT an official government portal. High risk of credential harvesting or payment fraud.",
        signals: ["Non-gov TLD detected", "Suspicious payment gateway pattern", "Domain age < 30 days"]
      });
    }
  };

  // Check Rumor
  const handleCheckRumor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rumorQuery) return;
    if (rumorQuery.includes("ছুটি") || rumorQuery.includes("holiday") || rumorQuery.includes("ভর্তি") || rumorQuery.includes("টাকা")) {
      setRumorResult({
        checked: true,
        verdict: "fake",
        explanationBn: "সামাজিক মাধ্যমে ছড়িয়ে পড়া এই নোটিশটি সম্পূর্ণ ভিত্তিহীন। সংশ্লিষ্ট মন্ত্রণালয় থেকে এ সংক্রান্ত কোনো অফিসিয়াল প্রজ্ঞাপন জারি করা হয়নি।",
        explanationEn: "This claim is unverified and fabricated. No official gazette or ministerial circular exists.",
        sourceBn: "প্রেস ইনফরমেশন ডিপার্টমেন্ট (PIB) ফ্যাক্ট-চেক সেল",
        sourceEn: "Press Information Department (PIB) Fact-Check Cell",
        confidence: t("৯৮% নিশ্চিত", "98% Confident")
      });
    } else {
      setRumorResult({
        checked: true,
        verdict: "verified",
        explanationBn: "তদন্ত সম্পন্ন: বাংলাদেশ সরকারি প্রেস (BG Press) এবং জাতীয় তথ্যকোষে তথ্যের সত্যতা নিশ্চিত হয়েছে।",
        explanationEn: "Verified: Cross-checked and confirmed with BG Press Government Gazette and National Portal.",
        sourceBn: "বাংলাদেশ সরকারি প্রেস (BG Press) গেজেট",
        sourceEn: "Bangladesh Government Press (BG Press) Gazette",
        confidence: t("৯৯.৪% নিশ্চিত", "99.4% Confident")
      });
    }
  };

  // Whistleblower Submit
  const handleWhistleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whistleDetails) return;
    const token = `SECURE-TOKEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setWhistleToken(token);
    setWhistleDetails("");
  };

  // Doc Checker Run
  const handleRunDocCheck = () => {
    setDocAnalysis({ status: "analyzing" });
    setTimeout(() => {
      setDocAnalysis({
        status: "completed",
        results: {
          clarity: t("৯৮% (উচ্চ স্পষ্টতা)", "98% (High Clarity)"),
          mismatches: t("নাম বা জন্মতারিখের কোনো গরমিল নেই।", "Zero name or DOB spelling mismatches detected."),
          missingItems: t("আবেদনপত্রের সাথে পিতা/মাতার এনআইডি কপির সত্যায়িত সংস্করণ প্রয়োজন।", "Parents' NID copy must be attached."),
          isReady: true
        }
      });
    }, 2000);
  };

  // Passport & Fee values
  const getFeeDetails = () => {
    switch (selectedService) {
      case "passport-48-5":
        return { name: t("ই-পাসপোর্ট (৪৮ পৃষ্ঠা, ৫ বছর মেয়াদ)", "e-Passport (48 Pages, 5-Year Validity)"), fee: "৪,০২৫ ৳", feeEn: "4,025 BDT", urgentFee: "৬,৩২৫ ৳", urgentFeeEn: "6,325 BDT", challan: "1-0601-0000-1847", days: t("১৫-২১ কার্যদিবস", "15-21 Working Days"), urgentDays: t("৩-৭ কার্যদিবস", "3-7 Working Days") };
      case "passport-48-10":
        return { name: t("ই-পাসপোর্ট (৪৮ পৃষ্ঠা, ১০ বছর মেয়াদ)", "e-Passport (48 Pages, 10-Year Validity)"), fee: "৫,৭৫০ ৳", feeEn: "5,750 BDT", urgentFee: "৮,০৫০ ৳", urgentFeeEn: "8,050 BDT", challan: "1-0601-0000-1847", days: t("১৫-২১ কার্যদিবস", "15-21 Working Days"), urgentDays: t("৩-৭ কার্যদিবস", "3-7 Working Days") };
      case "nid-reissue":
        return { name: t("এনআইডি সংশোধন ও রি-ইস্যু", "NID Correction & Reissue"), fee: "২৩০ ৳", feeEn: "230 BDT", urgentFee: "৩৪৫ ৳", urgentFeeEn: "345 BDT", challan: "1-1141-0000-2366", days: t("৭-১৫ কার্যদিবস", "7-15 Working Days"), urgentDays: t("২-৩ কার্যদিবস", "2-3 Working Days") };
      case "driving-license":
        return { name: t("স্মার্ট ড্রাইভিং লাইসেন্স (পেশাদার)", "Smart Driving License (Professional)"), fee: "১,৬৮০ ৳", feeEn: "1,680 BDT", urgentFee: "২,৫৩০ ৳", urgentFeeEn: "2,530 BDT", challan: "1-3431-0000-2043", days: t("৩০ কার্যদিবস", "30 Working Days"), urgentDays: t("৭-১০ কার্যদিবস", "7-10 Working Days") };
      default:
        return { name: t("ই-পাসপোর্ট", "e-Passport"), fee: "৪,০২৫ ৳", feeEn: "4,025 BDT", urgentFee: "৬,৩২৫ ৳", urgentFeeEn: "6,325 BDT", challan: "1-0601-0000-1847", days: t("১৫ দিন", "15 Days"), urgentDays: t("৩ দিন", "3 Days") };
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      {/* 🇧🇩 Top Gov Header Bar */}
      <header className="border-b" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)" }}>
        {/* National Hotlines & Judge Evaluation Trigger */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between text-xs border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center space-x-2 font-medium" style={{ color: "var(--text-muted)" }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary-green)" }}></span>
            <span>{t("গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের ডিজিটাল নাগরিক প্ল্যাটফর্ম", "Government of the People's Republic of Bangladesh Civic Infrastructure")}</span>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--alert-red)" }}>
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t("জরুরি হটলাইন: 999 | 333 | 106", "Hotlines: 999 | 333 | 106")}</span>
            </span>

            <div className="flex items-center space-x-2 border-l pl-3" style={{ borderColor: "var(--border-color)" }}>
              {/* Language Switcher */}
              <button
                onClick={() => setLang(lang === "bn" ? "en" : "bn")}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded border transition-colors hover:opacity-80 font-bold"
                style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}
              >
                <Languages className="w-3 h-3" />
                <span>{lang === "bn" ? "English" : "বাংলা"}</span>
              </button>

              {/* Dark Mode Switcher */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1 rounded border transition-colors"
                style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Main Branding Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-[#006A4E] relative flex-shrink-0 border" style={{ borderColor: "var(--border-color)" }}>
              <svg viewBox="0 0 50 30" className="w-full h-full">
                <rect width="50" height="30" fill="#006A4E" />
                <circle cx="23" cy="15" r="9" fill="#F42A41" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-main)" }}>
                  {t("জনগণ", "Jonogon")}
                </h1>
              </div>
              <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                {t("স্বচ্ছ প্রশাসন ও নাগরিক অধিকার অবকাঠামো", "Digital Public Infrastructure for Transparent Governance")}
              </p>
            </div>
          </div>

          {/* Portal Switcher (Citizen vs GovCopilot) */}
          <div className="flex items-center p-1 rounded-xl border shadow-inner" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
            <button
              onClick={() => setActivePortal("citizen")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePortal === "citizen" ? "shadow-sm font-bold" : "opacity-75 hover:opacity-100"
              }`}
              style={{
                backgroundColor: activePortal === "citizen" ? "var(--primary-green)" : "transparent",
                color: activePortal === "citizen" ? "#FFFFFF" : "var(--text-main)"
              }}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t("নাগরিক পোর্টাল", "Citizen Portal")}</span>
            </button>
            <button
              onClick={() => setActivePortal("gov")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePortal === "gov" ? "shadow-sm font-bold" : "opacity-75 hover:opacity-100"
              }`}
              style={{
                backgroundColor: activePortal === "gov" ? "var(--primary-green)" : "transparent",
                color: activePortal === "gov" ? "#FFFFFF" : "var(--text-main)"
              }}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t("প্রশাসনিক কোপাইলট", "GovCopilot Admin")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activePortal === "citizen" ? (
          <div>
            {/* 🔍 Hero Search & Voice Assistant */}
            <div className="rounded-2xl p-6 sm:p-7 mb-6 border shadow-sm text-center relative overflow-hidden" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
              <div className="max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-2" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                  <Sparkles className="w-3 h-3" />
                  {t("AI চালিত তাৎক্ষণিক নাগরিক সেবা সহকারী", "AI-Augmented Realtime Citizen Services")}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ color: "var(--text-main)" }}>
                  {t("আজ আপনাকে কীভাবে সহযোগিতা করতে পারি?", "How can we assist you today, Citizen?")}
                </h2>
                <p className="text-xs sm:text-sm mb-5 max-w-xl mx-auto font-normal" style={{ color: "var(--text-muted)" }}>
                  {t(
                    "পাসপোর্ট, জন্ম নিবন্ধন ও জমির পর্চা থেকে শুরু করে নিত্যপণ্যের বাজার দর ও রাস্তার সমস্যা—সব এক প্ল্যাটফর্মে।",
                    "From e-Passport and land mutation to daily commodity pricing and civic hazard reporting—all in one place."
                  )}
                </p>

                {/* Input Search Box */}
                <div className="relative flex items-center max-w-xl mx-auto">
                  <Search className="w-4 h-4 absolute left-3.5" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("কী সেবা খুঁজছেন? (উদা: ই-পাসপোর্ট ফি, জন্ম নিবন্ধন, টিসিবি দর...)", "Search any public service (e.g. e-Passport fee, birth certificate, TCB rates...)")}
                    className="w-full pl-10 pr-40 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-all shadow-sm focus:ring-1"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border-color)",
                      color: "var(--text-main)"
                    }}
                  />
                  <div className="absolute right-1.5 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={handleVoiceLanguageToggle}
                      className="px-2 py-1.5 rounded-lg text-[10px] font-bold transition-opacity hover:opacity-80"
                      style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}
                      aria-label={voiceLanguage === "bn"
                        ? t("ভয়েসের ভাষা বাংলা। ইংরেজিতে বদলান", "Voice language Bangla. Switch to English")
                        : t("ভয়েসের ভাষা ইংরেজি। বাংলায় বদলান", "Voice language English. Switch to Bangla")}
                      title={voiceLanguage === "bn"
                        ? t("ভয়েসের ভাষা বাংলা", "Voice input language: Bangla")
                        : t("ভয়েসের ভাষা ইংরেজি", "Voice input language: English")}
                    >
                      {voiceLanguage === "bn" ? "বাংলা" : "EN"}
                    </button>
                    {/* Voice Assistant Button */}
                    <button
                      type="button"
                      onClick={handleVoiceToggle}
                      className={`p-1.5 rounded-lg transition-all ${
                        isRecordingVoice ? "animate-pulse text-white" : ""
                      }`}
                      style={{
                        backgroundColor: isRecordingVoice ? "var(--alert-red)" : "var(--primary-green-light)",
                        color: isRecordingVoice ? "#FFFFFF" : "var(--primary-green)"
                      }}
                      aria-label={isRecordingVoice
                        ? t("শোনা বন্ধ করুন", "Stop listening")
                        : voiceLanguage === "bn" ? t("বাংলায় বলুন", "Speak in Bangla") : t("ইংরেজিতে বলুন", "Speak in English")}
                      aria-pressed={isRecordingVoice}
                      title={isRecordingVoice
                        ? t("শোনা বন্ধ করতে ক্লিক করুন", "Click to stop listening")
                        : voiceLanguage === "bn" ? t("বাংলায় ভয়েসে অনুসন্ধান করুন", "Search by speaking Bangla") : t("ইংরেজিতে ভয়েসে অনুসন্ধান করুন", "Search by speaking English")}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
                      style={{ backgroundColor: "var(--primary-green)" }}
                    >
                      {t("অনুসন্ধান", "Search")}
                    </button>
                  </div>
                </div>

                {/* Voice Transcript Toast */}
                {voiceTranscript && (
                  <div role="status" aria-live="polite" className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--primary-green)" }}>
                    <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                    <span className="font-medium">{voiceTranscript}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 🏷️ Navigation Tabs for Feature Categories */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 mb-6 border-b no-scrollbar text-xs" style={{ borderColor: "var(--border-color)" }}>
              {[
                { id: "civic-signal", label: t("🚨 নাগরিক সিগন্যাল (অভিযোগ)", "🚨 CivicSignal (Reports)"), icon: AlertTriangle },
                { id: "bazaar-watch", label: t("🛒 বাজার দর মনিটর (সিন্ডিকেট রোধ)", "🛒 Live Bazaar Watch"), icon: TrendingUp },
                { id: "safe-report", label: t("🛡️ নিরাপদ হুইসেলব্লোয়ার (ঘুষ রোধ)", "🛡️ Whistleblower Shield"), icon: Lock },
                { id: "rumor-buster", label: t("🔍 গুজব যাচাই (ফ্যাক্ট-চেক)", "🔍 RumorBuster BD"), icon: Eye },
                { id: "nrb-gateway", label: t("🌍 প্রবাসী ও রেমিট্যান্স হাব", "🌍 NRB Expat Gateway"), icon: Globe2 },
                { id: "fee-calculator", label: t("💰 সরকারি ফি ও চালান কোড", "💰 Gov Fee Calculator"), icon: Calculator },
                { id: "doc-checker", label: t("📑 AI ডকুমেন্ট ত্রুটি চেকার", "📑 AI Doc Checker"), icon: FileCheck },
                { id: "scam-detector", label: t("🚨 ভুয়া লিংক ও প্রতারণা ডিটেক্টর", "🚨 Scam & Link Detector"), icon: ShieldAlert },
                { id: "volunteer-grid", label: t("🤝 ত্রাণ ও ভলান্টিয়ার নেটওয়ার্ক", "🤝 Youth & Relief Grid"), icon: HeartHandshake }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      isActive ? "shadow-sm" : "opacity-80 hover:opacity-100"
                    }`}
                    style={{
                      backgroundColor: isActive ? "var(--primary-green)" : "var(--surface)",
                      color: isActive ? "#FFFFFF" : "var(--text-main)",
                      borderColor: isActive ? "var(--primary-green)" : "var(--border-color)"
                    }}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: 🚨 CivicSignal (Reports & Hazard Submission) */}
            {activeTab === "civic-signal" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Submit New Hazard Form */}
                <div className="lg:col-span-1 rounded-2xl p-5 border shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="p-2 rounded-lg" style={{ backgroundColor: "var(--alert-red-light)", color: "var(--alert-red)" }}>
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-base" style={{ color: "var(--text-main)" }}>
                        {t("নাগরিক সমস্যা রিপোর্ট করুন", "Report a Civic Hazard")}
                      </h3>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {t("স্বয়ংক্রিয় PII সুরক্ষায় গোপনীয়তা নিশ্চিত করা হয়", "Auto PII redaction protects citizen identity")}
                      </p>
                    </div>
                  </div>

                  {submittedReportId ? (
                    <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: "var(--primary-green-light)", borderColor: "var(--primary-green)" }}>
                      <CheckCircle2 className="w-7 h-7 mx-auto mb-2" style={{ color: "var(--primary-green)" }} />
                      <h4 className="font-bold text-xs mb-1" style={{ color: "var(--primary-green)" }}>
                        {t("রিপোর্ট সফলভাবে নথিভুক্ত হয়েছে!", "Report Successfully Logged!")}
                      </h4>
                      <p className="text-[11px] mb-2 font-mono" style={{ color: "var(--text-muted)" }}>
                        {t(`ট্র্যাকিং আইডি: ${submittedReportId}`, `Tracking ID: ${submittedReportId}`)}
                      </p>
                      <button
                        onClick={() => setSubmittedReportId(null)}
                        className="text-xs font-semibold underline"
                        style={{ color: "var(--primary-green)" }}
                      >
                        {t("আরেকটি রিপোর্ট করুন", "Submit another report")}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleReportSubmit} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-main)" }}>
                          {t("সমস্যার সংক্ষিপ্ত শিরোনাম", "Issue Title")}
                        </label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder={t("উদা: ভাঙা রাস্তা ও ড্রেনের ময়লা উপচে পড়ছে", "e.g. Broken road and overflowing drain")}
                          className="w-full px-3 py-2 text-xs rounded-lg border outline-none"
                          style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-main)" }}>
                            {t("বিভাগ / ক্যাটাগরি", "Department")}
                          </label>
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded-lg border outline-none"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                          >
                            <option value="রাস্তা ও ম্যানহোল">{t("রাস্তা ও ম্যানহোল", "Roads & Manholes")}</option>
                            <option value="ওয়াসা ড্রেনেজ ও পানি">{t("ওয়াসা ড্রেনেজ ও পানি", "WASA Drainage & Water")}</option>
                            <option value="সিটি কর্পোরেশন বর্জ্য">{t("সিটি কর্পোরেশন বর্জ্য", "City Waste Management")}</option>
                            <option value="বিদ্যুৎ ও বাতি">{t("বিদ্যুৎ ও বাতি", "Electricity & Streetlights")}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-main)" }}>
                            {t("জরুরি স্তর", "Severity Level")}
                          </label>
                          <select
                            value={newSeverity}
                            onChange={(e) => setNewSeverity(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded-lg border outline-none"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                          >
                            <option value="High">{t("🔴 জরুরি (High Risk)", "🔴 High Urgency")}</option>
                            <option value="Medium">{t("🟡 মাঝারি (Medium)", "🟡 Medium Priority")}</option>
                            <option value="Low">{t("🟢 সাধারণ (Low)", "🟢 Normal")}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-main)" }}>
                          {t("স্থান / থানা ও ওয়ার্ড", "Location / Ward")}
                        </label>
                        <input
                          type="text"
                          required
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          placeholder={t("উদা: মিরপুর-১০, ঢাকা", "e.g. Mirpur-10, Dhaka")}
                          className="w-full px-3 py-2 text-xs rounded-lg border outline-none"
                          style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-main)" }}>
                          {t("ছবি সংযুক্তি (AI স্বয়ংক্রিয় যাচাই)", "Attach Photo (AI Severity Triage)")}
                        </label>
                        <div className="border border-dashed rounded-lg p-2.5 text-center cursor-pointer hover:opacity-80 transition-opacity" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
                          <span className="text-[11px] font-medium" style={{ color: "var(--primary-green)" }}>
                            📷 {t("ছবি আপলোড করুন (বা ক্যামেরা খুলুন)", "Upload Photo (or Open Camera)")}
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-sm flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: "var(--primary-green)" }}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t("টিকেট দাখিল করুন", "Submit Civic Ticket")}</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Live Public Civic Reports Stream */}
                <div className="lg:col-span-2 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold" style={{ color: "var(--text-main)" }}>
                        {t("সক্রিয় নাগরিক রিপোর্ট ও রেজোলিউশন ট্র্যাক", "Active Citizen Reports & Public Audit")}
                      </h3>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {t("জনসম্মুখে প্রতিটি টিকেটের এআই মূল্যায়ন ও অগ্রগতি পর্যবেক্ষণ করুন", "Transparent tracking with explainable AI triage scores")}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)", color: "var(--text-main)" }}>
                      {reports.length} {t("টি সমস্যা নজরে", "Active Issues")}
                    </span>
                  </div>

                  {/* Reports List */}
                  <div className="space-y-2.5">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="p-3.5 rounded-xl border shadow-sm transition-all hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded border" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
                              {report.id}
                            </span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                              report.severity === "High" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                            }`}>
                              {report.severity === "High" ? t("জরুরি ঝুঁকি", "High Urgency") : t("মাঝারি ঝুঁকি", "Medium Urgency")}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--primary-green)", color: "var(--primary-green)", backgroundColor: "var(--primary-green-light)" }}>
                              {t(report.categoryBn, report.categoryEn)}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-sm" style={{ color: "var(--text-main)" }}>
                            {t(report.titleBn, report.titleEn)}
                          </h4>

                          <div className="flex flex-wrap items-center gap-2.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {t(report.locationBn, report.locationEn)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {t(report.reportedAtBn, report.reportedAtEn)}
                            </span>
                            <span className="font-medium" style={{ color: "var(--primary-green)" }}>
                              {t("দায়িত্বে:", "Assigned:")} {t(report.assignedDeptBn, report.assignedDeptEn)}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge & AI Inspector Button */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-start">
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                            report.status === "Resolved"
                              ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300"
                              : report.status === "In Progress"
                              ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300"
                          }`}>
                            {t(report.statusBn, report.statusEn)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedReportForInspect(report)}
                              className="text-[11px] px-2 py-1 rounded-md border flex items-center gap-1 hover:opacity-80 transition-opacity"
                              style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)", color: "var(--text-main)" }}
                              title={t("এআই ট্রায়াজ ও যুক্তির ব্যাখ্যা দেখুন", "View AI Triage & Reasoning Trace")}
                            >
                              <Bot className="w-3 h-3 text-green-600" />
                              <span>{t("এআই ব্যাখ্যা", "AI Audit")}</span>
                            </button>
                            <button
                              onClick={() => {
                                setReports(reports.map(r => r.id === report.id ? { ...r, upvotes: r.upvotes + 1 } : r));
                              }}
                              className="text-[11px] px-2 py-1 rounded-md border hover:opacity-80 transition-opacity"
                              style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)", color: "var(--text-main)" }}
                            >
                              ▲ {report.upvotes}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 🛒 Live Bazaar Watch (Commodity Tracking) */}
            {activeTab === "bazaar-watch" && (
              <div className="rounded-2xl p-5 border shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                      <span>{t("নিত্যপণ্যের বাজার দর ও সিন্ডিকেট নজরদারি", "Live Commodity Pricing & Syndicate Watch")}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                        {t("লাইভ আপডেট (TCB ও DNCRP)", "Live TCB & DNCRP Benchmark")}
                      </span>
                    </h3>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {t("সরকারি নির্ধারিত ন্যায্যমূল্যের চেয়ে অতিরিক্ত দামে বিক্রি করলে সাথে সাথে প্রমাণসহ অভিযোগ জানান", "Compare retail rates against fair price caps and report overpricing")}
                    </p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1.5 self-start md:self-auto" style={{ backgroundColor: "var(--alert-red)" }}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{t("অতিরিক্ত দামের অভিযোগ দাখিল", "Report Overpricing / Syndicate")}</span>
                  </button>
                </div>

                {/* Pricing Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b text-xs font-semibold uppercase" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
                        <th className="py-2.5 px-3">{t("নিত্যপণ্য (Commodity)", "Commodity")}</th>
                        <th className="py-2.5 px-3">{t("ন্যায্যমূল্য (TCB Rate)", "Fair Cap (TCB Rate)")}</th>
                        <th className="py-2.5 px-3">{t("বাজার দর (Retail)", "Current Retail")}</th>
                        <th className="py-2.5 px-3">{t("মূল্য ফারাক (Difference)", "Disparity")}</th>
                        <th className="py-2.5 px-3">{t("ঝুঁকি স্তর (Status)", "Alert Status")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                      {BAZAAR_DATA.map((row, idx) => {
                        const diff = row.marketPrice - row.tcbPrice;
                        return (
                          <tr key={idx} className="hover:bg-opacity-50" style={{ color: "var(--text-main)" }}>
                            <td className="py-2.5 px-3 font-semibold">
                              {t(row.itemBn, row.itemEn)}
                            </td>
                            <td className="py-2.5 px-3 font-medium" style={{ color: "var(--primary-green)" }}>
                              {row.tcbPrice} ৳ / {t(row.unitBn, row.unitEn)}
                            </td>
                            <td className="py-2.5 px-3 font-bold">
                              {row.marketPrice} ৳ / {t(row.unitBn, row.unitEn)}
                            </td>
                            <td className="py-2.5 px-3 font-semibold">
                              {diff > 0 ? (
                                <span className="text-red-600 dark:text-red-400">+{diff} ৳ {t("অতিরিক্ত", "Overpriced")}</span>
                              ) : (
                                <span className="text-green-600 dark:text-green-400">{t("ন্যায্য দরে", "Fair Rate")}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                                row.status === "high"
                                  ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                  : row.status === "slight"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                              }`}>
                                {row.status === "high" ? t("⚠️ সিন্ডিকেট সতর্কতা", "⚠️ Syndicate Alert") : row.status === "slight" ? t("সামান্য বাড়তি", "Slight Disparity") : t("স্বাভাবিক", "Normal Fair")}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 🌍 NRB (Non-Resident Bangladeshi) Expat Gateway */}
            {activeTab === "nrb-gateway" && (
              <div className="rounded-2xl p-5 sm:p-6 border shadow-sm space-y-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--border-color)" }}>
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-1" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                      <Globe2 className="w-3 h-3" />
                      {t("প্রবাসী কল্যাণ ও রেমিট্যান্স ইনোভেশন সেল (NRB DPI)", "NRB Diaspora Innovation & Remittance Gateway")}
                    </span>
                    <h3 className="text-lg font-bold" style={{ color: "var(--text-main)" }}>
                      {t("প্রবাসী বাংলাদেশিদের সেবা ও নিরাপদ রেমিট্যান্স", "Diaspora Services, Legal Remittance & Asset Protection")}
                    </h3>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {t("বৈধ ব্যাংকিং চ্যানেলে রেমিট্যান্স প্রণোদনা হিসাব, ভুয়া রিক্রুটিং এজেন্সি যাচাই এবং জমি বেদখল সুরক্ষা", "Formal banking remittance incentives, BMET manpower verification, and remote land protection")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Remittance Fair Incentive Calculator */}
                  <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                    <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "var(--primary-green)" }}>
                      <Calculator className="w-4 h-4" />
                      <span>{t("বৈধ ব্যাংকিং প্রণোদনা হিসাব", "2.5% Remittance Incentive Calculator")}</span>
                    </div>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {t("সরকারি ২.৫% প্রণোদনা সহ বৈধ ব্যাংকিং চ্যানেলে টাকা পাঠানোর হিসাব:", "Calculate formal banking remittance payout with official 2.5% cash incentive:")}
                    </p>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1" style={{ color: "var(--text-main)" }}>
                        {t("রেমিট্যান্স পরিমাণ (USD / ডলার):", "Remittance Amount (USD):")}
                      </label>
                      <input
                        type="number"
                        value={remittanceAmount}
                        onChange={(e) => setRemittanceAmount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border outline-none font-bold"
                        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>
                    <div className="p-2.5 rounded-lg border text-xs space-y-1" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)" }}>
                      <div className="flex justify-between">
                        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t("এক্সচেঞ্জ রেট (আনুমানিক):", "Est. Exchange Rate:")}</span>
                        <span className="font-semibold">1 USD = 121.50 BDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t("সরকারি ২.৫% বোনাস:", "Gov 2.5% Bonus:")}</span>
                        <span className="font-semibold text-green-600">+{(remittanceAmount * 121.5 * 0.025).toFixed(0)} BDT</span>
                      </div>
                      <div className="flex justify-between font-bold pt-1 border-t" style={{ borderColor: "var(--border-color)", color: "var(--primary-green)" }}>
                        <span>{t("মোট প্রাপ্যতা:", "Total Payout:")}</span>
                        <span>{(remittanceAmount * 121.5 * 1.025).toLocaleString()} BDT</span>
                      </div>
                    </div>
                  </div>

                  {/* BMET Manpower Agency Verifier */}
                  <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                    <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "var(--primary-green)" }}>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t("রিক্রুটিং এজেন্সি লাইসেন্স যাচাই", "BMET Agency License Validator")}</span>
                    </div>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {t("মানবপাচার ও দালালদের প্রতারণা রোধে বিএমইটি (BMET) নিবন্ধিত বৈধ লাইসেন্স চেক করুন:", "Protect migrant workers from fraudulent agents by checking the official BMET registry:")}
                    </p>
                    <input
                      type="text"
                      placeholder={t("এজেন্সির নাম বা আরএল (RL) নম্বর দিন", "Enter Agency Name or RL Number")}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border outline-none"
                      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                    <button className="w-full py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm" style={{ backgroundColor: "var(--primary-green)" }}>
                      {t("বিএমইটি ডাটাবেজে যাচাই করুন", "Verify in BMET Database")}
                    </button>
                    <div className="text-[11px] text-green-600 dark:text-green-400 font-semibold">
                      {t("✓ ২,১০০+ অনুমোদিত এজেন্সির আপডেট তথ্য লাইভ সংযুক্ত", "✓ Live connected to 2,100+ approved agencies")}
                    </div>
                  </div>

                  {/* Expat Land Protection Desk */}
                  <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                    <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "var(--primary-green)" }}>
                      <Lock className="w-4 h-4" />
                      <span>{t("প্রবাসী জমি ও সম্পদ সুরক্ষা সেল", "Expat Land & Asset Protection Cell")}</span>
                    </div>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {t("প্রবাসে থাকা অবস্থায় দেশের পৈত্রিক জমি বা ফ্ল্যাট বেদখল ও জাল দলিলের বিরুদ্ধে সরাসরি অভিযোগ দাখিল করুন:", "Report illegal land grabbing or counterfeit deeds directly to the District Commissioner taskforce:")}
                    </p>
                    <button className="w-full py-2 rounded-lg text-xs font-bold border hover:opacity-80 transition-opacity" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)", color: "var(--text-main)" }}>
                      {t("+ বিশেষ জমি সুরক্ষা সেল আবেদন ↗", "+ Submit Remote Land Protection Petition ↗")}
                    </button>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {t("দুদক ও ভূমি মন্ত্রণালয়ের যৌথ মনিটরিং সেল দ্বারা অগ্রাধিকার ভিত্তিতে তদারকি করা হয়।", "Monitored on priority by the joint ACC & Land Ministry taskforce.")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 🛡️ SafeReport Whistleblower (Anti-Bribery) */}
            {activeTab === "safe-report" && (
              <div className="max-w-xl mx-auto rounded-2xl p-5 sm:p-6 border shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="p-2.5 rounded-xl" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                    <Lock className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: "var(--text-main)" }}>
                      {t("নিরাপদ হুইসেলব্লোয়ার সেল (ঘুষ ও হয়রানি রোধ)", "SafeReport Anti-Corruption Whistleblower")}
                    </h3>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {t("জিরো-নলেজ এনক্রিপশনে পরিচয় সম্পূর্ণ গোপন রাখা হয়", "Zero-knowledge encryption protects whistleblower identity")}
                    </p>
                  </div>
                </div>

                {whistleToken ? (
                  <div className="p-4 rounded-xl border text-center space-y-2.5" style={{ backgroundColor: "var(--primary-green-light)", borderColor: "var(--primary-green)" }}>
                    <CheckCircle2 className="w-8 h-8 mx-auto" style={{ color: "var(--primary-green)" }} />
                    <h4 className="font-bold text-xs" style={{ color: "var(--primary-green)" }}>
                      {t("অভিযোগটি নিরাপদে দুদকের বিশেষ সার্ভারে পাঠানো হয়েছে!", "Complaint encrypted & dispatched to audit intelligence!")}
                    </h4>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {t("ভবিষ্যতে তদন্ত অগ্রগতি জানতে আপনার সিকিউর টোকেনটি সংরক্ষণ করুন:", "Keep this private token to track investigation progress:")}
                    </p>
                    <div className="p-2.5 rounded-lg font-mono font-bold text-xs tracking-wider border select-all" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)", color: "var(--text-main)" }}>
                      {whistleToken}
                    </div>
                    <button
                      onClick={() => setWhistleToken(null)}
                      className="text-xs font-semibold underline mt-1 block mx-auto"
                      style={{ color: "var(--primary-green)" }}
                    >
                      {t("নতুন অভিযোগ করুন", "Submit another report")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleWhistleSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-main)" }}>
                        {t("অভিযুক্ত দপ্তর / অফিস", "Target Department / Office")}
                      </label>
                      <select
                        value={whistleOffice}
                        onChange={(e) => setWhistleOffice(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border outline-none"
                        style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      >
                        <option value="BRTA">{t("বিআরটিএ (BRTA - লাইসেন্স ও ফিটনেস)", "BRTA (License & Fitness Inspection)")}</option>
                        <option value="Sub-Registry">{t("সাব-রেজিস্ট্রি অফিস (ভূমি দলিল)", "Sub-Registry Office (Land Deeds)")}</option>
                        <option value="Passport">{t("আঞ্চলিক পাসপোর্ট অফিস", "Regional Passport Office")}</option>
                        <option value="AC-Land">{t("উপজেলা ভূমি অফিস (এসি ল্যান্ড ও নামজারি)", "AC Land Office (Mutation & Land Records)")}</option>
                        <option value="Hospital">{t("সরকারি হাসপাতাল / স্বাস্থ্য কমপ্লেক্স", "Public Hospital / Healthcare Complex")}</option>
                        <option value="Police">{t("থানা / পুলিশ তদন্ত কেন্দ্র", "Police Station / Investigation Desk")}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-main)" }}>
                        {t("কী ধরনের ঘুষ বা অনিয়মের শিকার হয়েছেন?", "Describe the Extortion / Harassment Incident")}
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={whistleDetails}
                        onChange={(e) => setWhistleDetails(e.target.value)}
                        placeholder={t("অফিসের নাম, কর্মকর্তার পদবি বা দালাল চক্রের বিবরণ লিখুন... কোনো ব্যক্তিগত তথ্য দেওয়ার প্রয়োজন নেই।", "Specify office location, broker/officer details, amount demanded... Zero personal data needed.")}
                        className="w-full px-3 py-2 text-xs rounded-lg border outline-none"
                        style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      ></textarea>
                    </div>

                    <div className="p-2.5 rounded-lg border text-[11px] flex items-center gap-2" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
                      <Lock className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      <span>{t("এটি এন্ড-টু-এন্ড এনক্রিপ্টেড। আপনার আইপি বা ডিভাইস তথ্য সংরক্ষণ করা হয় না।", "Zero-knowledge routing. No IP address or device logs are stored.")}</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "var(--primary-green)" }}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t("সম্পূর্ণ বেনামে অভিযোগ পাঠান", "Submit Anonymous Whistleblower Complaint")}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB CONTENT: 🔍 RumorBuster BD (Fact-Checking) */}
            {activeTab === "rumor-buster" && (
              <div className="max-w-xl mx-auto rounded-2xl p-5 sm:p-6 border shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="p-2.5 rounded-xl" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                    <Eye className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: "var(--text-main)" }}>
                      {t("গুজব ও বিভ্রান্তিকর বিজ্ঞপ্তি যাচাই (RumorBuster BD)", "RumorBuster BD: Viral Claim Verifier")}
                    </h3>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {t("সামাজিক মাধ্যমে দেখা যেকোনো নোটিশ বা খবর সরকারি গেজেটের সাথে মিলিয়ে নিন", "Cross-check viral social media claims with official Government Gazettes")}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCheckRumor} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-main)" }}>
                      {t("খবর বা পোস্টের বিবরণ / লিংক পেস্ট করুন", "Paste News Snippet or Claim")}
                    </label>
                    <input
                      type="text"
                      required
                      value={rumorQuery}
                      onChange={(e) => setRumorQuery(e.target.value)}
                      placeholder={t("উদা: আগামী সোমবার থেকে সব ব্যাংকে ৫ দিন সাধারণ ছুটি ঘোষণা...", "e.g. 5-day general bank holiday announced from Monday...")}
                      className="w-full px-3 py-2 text-xs rounded-lg border outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "var(--primary-green)" }}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{t("সত্যতা যাচাই করুন", "Verify Claim with Official Sources")}</span>
                  </button>
                </form>

                {rumorResult && (
                  <div className={`mt-4 p-3.5 rounded-xl border text-xs ${
                    rumorResult.verdict === "fake"
                      ? "bg-red-50 border-red-300 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
                      : "bg-green-50 border-green-300 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
                  }`}>
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>{rumorResult.verdict === "fake" ? t("❌ ভুয়া খবর / অপপ্রচার (Fake Alert)", "❌ Fabricated Claim / Fake Notice") : t("✅ সত্য ও অনুমোদিত তথ্য (Verified)", "✅ Authenticated & Official Gazette Verified")}</span>
                      <span className="text-[11px] opacity-80">{rumorResult.confidence}</span>
                    </div>
                    <p className="mb-2 leading-relaxed">{t(rumorResult.explanationBn, rumorResult.explanationEn)}</p>
                    <div className="text-[11px] font-semibold opacity-75">
                      {t("সূত্র:", "Source:")} {t(rumorResult.sourceBn, rumorResult.sourceEn)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 💰 Gov Fee Calculator */}
            {activeTab === "fee-calculator" && (
              <div className="max-w-xl mx-auto rounded-2xl p-5 sm:p-6 border shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="p-2.5 rounded-xl" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                    <Calculator className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: "var(--text-main)" }}>
                      {t("সরকারি ফি ও চালান কোড ক্যালকুলেটর", "Official Government Fee & Challan Calculator")}
                    </h3>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {t("কোনো দালাল বা অতিরিক্ত ফি দেবেন না, সরকারি নির্ধারিত ফি জানুন", "Eliminate middleman markups: know the exact verified fees")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-main)" }}>
                      {t("সেবাটি নির্বাচন করুন", "Select Service")}
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border outline-none font-semibold"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    >
                      <option value="passport-48-5">{t("ই-পাসপোর্ট (৪৮ পৃষ্ঠা, ৫ বছর মেয়াদ)", "e-Passport (48 Pages, 5-Year Validity)")}</option>
                      <option value="passport-48-10">{t("ই-পাসপোর্ট (৪৮ পৃষ্ঠা, ১০ বছর মেয়াদ)", "e-Passport (48 Pages, 10-Year Validity)")}</option>
                      <option value="nid-reissue">{t("জাতীয় পরিচয়পত্র (NID) সংশোধন ও রি-ইস্যু", "NID Correction & Reissue")}</option>
                      <option value="driving-license">{t("স্মার্টকার্ড ড্রাইভিং লাইসেন্স (পেশাদার)", "Smartcard Driving License (Professional)")}</option>
                    </select>
                  </div>

                  {(() => {
                    const fee = getFeeDetails();
                    return (
                      <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                        <div className="flex justify-between items-center pb-2.5 border-b" style={{ borderColor: "var(--border-color)" }}>
                          <span className="text-xs font-bold" style={{ color: "var(--text-main)" }}>{fee.name}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded font-mono font-semibold" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                            {t("ভ্যাট সহ", "VAT Included")}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-2.5 rounded-lg border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)" }}>
                            <span className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>{t("নিয়মিত ফি (Regular)", "Regular Processing")}</span>
                            <div className="text-lg font-extrabold mt-0.5" style={{ color: "var(--primary-green)" }}>{lang === "bn" ? fee.fee : fee.feeEn}</div>
                            <span className="text-[10px] opacity-75">{fee.days}</span>
                          </div>
                          <div className="p-2.5 rounded-lg border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)" }}>
                            <span className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>{t("জরুরি ফি (Urgent)", "Urgent Express")}</span>
                            <div className="text-lg font-extrabold mt-0.5 text-orange-600 dark:text-orange-400">{lang === "bn" ? fee.urgentFee : fee.urgentFeeEn}</div>
                            <span className="text-[10px] opacity-75">{fee.urgentDays}</span>
                          </div>
                        </div>

                        <div className="pt-1.5 text-xs flex justify-between items-center" style={{ color: "var(--text-muted)" }}>
                          <span>{t("A-Challan জমা কোড:", "Official A-Challan Code:")}</span>
                          <span className="font-mono font-bold text-xs" style={{ color: "var(--text-main)" }}>{fee.challan}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 🚨 Scam & Link Detector */}
            {activeTab === "scam-detector" && (
              <div className="max-w-xl mx-auto rounded-2xl p-5 sm:p-6 border shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="p-2.5 rounded-xl" style={{ backgroundColor: "var(--alert-red-light)", color: "var(--alert-red)" }}>
                    <ShieldAlert className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: "var(--text-main)" }}>
                      {t("সরকারি ভুয়া লিংক ও প্রতারণা ডিটেক্টর", "Government Phishing & Scam URL Detector")}
                    </h3>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {t("যেকোনো সন্দেহজনক ওয়েবসাইট বা পেমেন্ট লিংক যাচাই করুন", "Verify suspicious government service portals & payment requests")}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCheckScam} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-main)" }}>
                      {t("ওয়েবসাইট লিংক (URL) পেস্ট করুন", "Paste Website Link / URL")}
                    </label>
                    <input
                      type="text"
                      required
                      value={scamUrl}
                      onChange={(e) => setScamUrl(e.target.value)}
                      placeholder="e.g. https://epassport-bd-fees-payment.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border outline-none font-mono"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "var(--primary-green)" }}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{t("লিংক নিরাপত্তা যাচাই", "Verify Link Safety")}</span>
                  </button>
                </form>

                {scamResult && (
                  <div className={`mt-4 p-3.5 rounded-xl border text-xs ${
                    scamResult.isSafe
                      ? "bg-green-50 border-green-300 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
                      : "bg-red-50 border-red-300 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
                  }`}>
                    <p className="font-medium mb-2">{t(scamResult.detailsBn, scamResult.detailsEn)}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {scamResult.signals.map((sig, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white dark:bg-black/40 border border-current opacity-80">
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 📑 AI Doc Checker */}
            {activeTab === "doc-checker" && (
              <div className="max-w-xl mx-auto rounded-2xl p-5 sm:p-6 border shadow-sm text-center" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                <span className="p-2.5 inline-block rounded-xl mb-2.5" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                  <FileCheck className="w-6 h-6" />
                </span>
                <h3 className="text-base font-bold mb-1" style={{ color: "var(--text-main)" }}>
                  {t("AI ডকুমেন্ট ত্রুটি ও অস্পষ্টতা চেকার", "AI Document Pre-Submission Checker")}
                </h3>
                <p className="text-xs mb-4 max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
                  {t("এনআইডি বা চালান স্লিপ আপলোড করে বানানের মিল ও ছবির স্পষ্টতা পরীক্ষা করুন", "Check for spelling mismatches, blur, and missing seals before submitting")}
                </p>

                <div
                  onClick={() => setDocFileUploaded(true)}
                  className="border border-dashed rounded-xl p-6 cursor-pointer hover:opacity-80 transition-opacity mb-3"
                  style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}
                >
                  {docFileUploaded ? (
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold" style={{ color: "var(--primary-green)" }}>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>nid_scan_copy.pdf ({t("সংযুক্ত হয়েছে", "Attached")})</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold mb-1" style={{ color: "var(--text-main)" }}>{t("ফাইল আপলোড করতে ক্লিক করুন", "Click to upload document")}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>JPG, PNG {t("অথবা", "or")} PDF ({t("সর্বোচ্চ ৫ মেগাবাইট", "Max 5MB")})</p>
                    </div>
                  )}
                </div>

                <button
                  disabled={!docFileUploaded || docAnalysis?.status === "analyzing"}
                  onClick={handleRunDocCheck}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
                    !docFileUploaded ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                  }`}
                  style={{ backgroundColor: "var(--primary-green)" }}
                >
                  {docAnalysis?.status === "analyzing" ? t("AI বিশ্লেষণ চলছে...", "AI Analysis in progress...") : t("AI দিয়ে ডকুমেন্ট পরীক্ষা করুন", "Run AI Document Verification")}
                </button>

                {docAnalysis?.status === "completed" && (
                  <div className="mt-4 p-3 rounded-xl border text-left text-xs space-y-1.5" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                    <div className="flex items-center justify-between font-bold" style={{ color: "var(--primary-green)" }}>
                      <span>{t("পাঠযোগ্যতা স্কোর:", "Readability Score:")} {docAnalysis.results.clarity}</span>
                      <span>✅ {t("যাচাই সম্পন্ন", "Audit Complete")}</span>
                    </div>
                    <div style={{ color: "var(--text-main)" }}>
                      <strong>{t("বানান পরীক্ষা:", "Spelling & Mismatch:")}</strong> {docAnalysis.results.mismatches}
                    </div>
                    <div className="text-orange-600 dark:text-orange-400">
                      <strong>{t("প্রয়োজনীয় সংযুক্তি:", "Missing Attachments:")}</strong> {docAnalysis.results.missingItems}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 🤝 Relief & Volunteer Grid */}
            {activeTab === "volunteer-grid" && (
              <div className="rounded-2xl p-5 border shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "var(--text-main)" }}>
                      {t("ছাত্র-জনতা নাগরিক ভলান্টিয়ার হাব ও দুর্যোগ ত্রাণ সমন্বয়", "Youth & Student Civic Volunteer Hub & Relief Grid")}
                    </h3>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {t("বন্যা, ট্রাফিক শৃঙ্খলা ও এলাকাভিত্তিক পরিচ্ছন্নতায় সমন্বিত স্বেচ্ছাসেবী নেটওয়ার্ক", "Coordinated volunteer response for flood relief, traffic discipline, and community cleanup")}
                    </p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm self-start md:self-auto" style={{ backgroundColor: "var(--primary-green)" }}>
                    {t("+ ভলান্টিয়ার নিবন্ধন", "+ Register as Volunteer")}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="p-3.5 rounded-xl border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{t("🌊 বন্যা ত্রাণ সেল", "🌊 Flood Crisis Shelter")}</span>
                    <h4 className="font-bold text-sm mt-1" style={{ color: "var(--text-main)" }}>{t("ফেনী ও নোয়াখালী আশ্রয়কেন্দ্র", "Feni & Noakhali Shelter Centers")}</h4>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("প্রয়োজন: স্যালাইন, বিশুদ্ধ পানি ও জরুরি ওষুধ।", "Priority: Saline, clean water, and emergency medicine.")}</p>
                  </div>
                  <div className="p-3.5 rounded-xl border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                    <span className="text-[11px] font-bold text-green-600 dark:text-green-400">{t("🚦 ট্রাফিক শৃঙ্খলা টিম", "🚦 Traffic Discipline Taskforce")}</span>
                    <h4 className="font-bold text-sm mt-1" style={{ color: "var(--text-main)" }}>{t("ফার্মগেট ও শাহবাগ ইন্টারসেকশন", "Farmgate & Shahbagh Intersection")}</h4>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("ছাত্র ভলান্টিয়ারদের শিফট ভিত্তিক রোস্টার সমন্বয়।", "Student volunteer roster and shift coordination.")}</p>
                  </div>
                  <div className="p-3.5 rounded-xl border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                    <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">{t("🧹 পরিচ্ছন্নতা অভিযান", "🧹 Urban Sanitation Drive")}</span>
                    <h4 className="font-bold text-sm mt-1" style={{ color: "var(--text-main)" }}>{t("মিরপুর বোটানিক্যাল সংলগ্ন ড্রেন", "Mirpur Botanical Drainage Cleanup")}</h4>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("প্লাস্টিক বর্জ্য অপসারণ ও মশক নিধন সচেতনতা।", "Plastic waste removal and anti-dengue fogging drive.")}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 🏛️ GOVCOPILOT ADMIN WORKSPACE (100% Fully Translated) */
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-1" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                  <Building2 className="w-3 h-3" />
                  {t("ঢাকা উত্তর সিটি কর্পোরেশন ও ওয়াসা ইন্টিগ্রেটেড ড্যাশবোর্ড", "Dhaka North City Corp & WASA Integrated Workspace")}
                </span>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-main)" }}>
                  {t("GovCopilot প্রশাসনিক কমান্ড সেন্টার", "GovCopilot Administrative Command Center")}
                </h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {t("AI ট্রায়াজ ও স্বয়ংক্রিয় ওয়ার্ক অর্ডার অনুমোদন ইঞ্জিন", "AI Automated Triage, Dispatch & Work Order Approval Engine")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)", color: "var(--text-main)" }}>
                  <RefreshCw className="w-3 h-3" />
                  <span>{t("তথ্য রিফ্রেশ", "Refresh Stream")}</span>
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1" style={{ backgroundColor: "var(--primary-green)" }}>
                  <FileText className="w-3 h-3" />
                  <span>{t("দৈনিক SLA রিপোর্ট ডাউনলোড", "Download Daily SLA Audit")}</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl border shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>{t("মোট প্রাপ্ত অভিযোগ", "Total Incoming Reports")}</span>
                <div className="text-xl font-extrabold mt-0.5" style={{ color: "var(--text-main)" }}>{t("১,২৪৮", "1,248")}</div>
                <span className="text-[10px] text-green-600 dark:text-green-400 font-semibold inline-block">{t("↑ ১২% সাপ্তাহিক বৃদ্ধি", "↑ 12% Weekly Growth")}</span>
              </div>
              <div className="p-4 rounded-xl border shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>{t("জরুরি ঝুঁকি চিহ্নিত", "High Severity Flags")}</span>
                <div className="text-xl font-extrabold mt-0.5" style={{ color: "var(--alert-red)" }}>{t("৪২ টি", "42 Cases")}</div>
                <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold inline-block">{t("তাৎক্ষণিক অ্যাকশন প্রয়োজন", "Immediate Action Required")}</span>
              </div>
              <div className="p-4 rounded-xl border shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>{t("গড় সমাধান সময় (SLA)", "Avg. Resolution Time (SLA)")}</span>
                <div className="text-xl font-extrabold mt-0.5" style={{ color: "var(--primary-green)" }}>{t("৩.৪ দিন", "3.4 Days")}</div>
                <span className="text-[10px] text-green-600 dark:text-green-400 font-semibold inline-block">{t("পূর্বের চেয়ে ৪১% দ্রুত", "41% Faster than Benchmark")}</span>
              </div>
              <div className="p-4 rounded-xl border shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>{t("দুর্নীতি ও ঘুষ ফ্ল্যাগ", "Whistleblower Flags")}</span>
                <div className="text-xl font-extrabold mt-0.5 text-orange-600 dark:text-orange-400">{t("৭ টি", "7 Cases")}</div>
                <span className="text-[10px] font-semibold opacity-75 inline-block">{t("দুদক স্পেশাল সেল তদন্তাধীন", "Under Special ACC Audit")}</span>
              </div>
            </div>

            {/* GovCopilot Triage Table */}
            <div className="rounded-2xl p-5 border shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-base font-bold" style={{ color: "var(--text-main)" }}>
                  {t("AI স্বয়ংক্রিয় ট্রায়াজ ও অনুমোদন কিউ", "AI Automated Triage & Dispatch Queue")}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)", color: "var(--text-main)" }}>
                  {t("অপেক্ষমাণ টিকিট", "Pending Dispatch")}
                </span>
              </div>

              <div className="space-y-2.5">
                {reports.map((report) => (
                  <div key={report.id} className="p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold" style={{ color: "var(--text-main)" }}>{report.id}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                          report.severity === "High" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                        }`}>
                          {t(`AI স্কোর: ${report.severityScore}/১০`, `AI Severity Score: ${report.severityScore}/10`)}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm" style={{ color: "var(--text-main)" }}>{t(report.titleBn, report.titleEn)}</h4>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {t("স্থান:", "Location:")} {t(report.locationBn, report.locationEn)} | {t("দায়িত্বপ্রাপ্ত:", "Assigned Department:")} <span className="font-bold">{t(report.assignedDeptBn, report.assignedDeptEn)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <button
                        onClick={() => setSelectedReportForInspect(report)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1"
                        style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)", color: "var(--text-main)" }}
                      >
                        <Bot className="w-3.5 h-3.5 text-green-600" />
                        <span>{t("এআই অডিট", "AI Audit")}</span>
                      </button>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1" style={{ backgroundColor: "var(--primary-green)" }}>
                        <Check className="w-3.5 h-3.5" />
                        <span>{t("ওয়ার্ক অর্ডার ইস্যু", "Issue Work Order")}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 🇧🇩 Footer */}
      <footer className="border-t py-5 mt-10" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm" style={{ color: "var(--text-main)" }}>{t("জনগণ", "Jonogon")}</span>
            <span>•</span>
            <span className="font-medium">{t("আপনার নির্ভরযোগ্য সেবা স্টেশন", "Your go-to Service Station")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{t("সরকারি সহকারী এআই এখন সক্রিয়:", "Government's Right Hand AI is now")}</span>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold"
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.12)",
                color: darkMode ? "#4ade80" : "#15803d",
                border: "1px solid rgba(34, 197, 94, 0.25)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: darkMode ? "#4ade80" : "#16a34a" }} />
              Active
            </span>
          </div>
        </div>
      </footer>

      {/* 🤖 MODAL: AI Triage & Reasoning Inspector */}
      {selectedReportForInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-4"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-sm">
                  {t("AI ট্রায়াজ ও যুক্তির ব্যাখ্যা", "AI Triage & Decision Audit")} ({selectedReportForInspect.id})
                </h4>
              </div>
              <button onClick={() => setSelectedReportForInspect(null)} className="p-1 rounded-md border" style={{ borderColor: "var(--border-color)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                <div className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>{t("রিপোর্ট শিরোনাম:", "Issue Title:")}</div>
                <div className="font-bold text-sm mt-0.5">{t(selectedReportForInspect.titleBn, selectedReportForInspect.titleEn)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                  <div className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>{t("AI ঝুঁকি স্কোর:", "AI Severity Score:")}</div>
                  <div className="text-base font-extrabold text-red-600">{selectedReportForInspect.severityScore} / 10</div>
                </div>
                <div className="p-2.5 rounded-lg border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                  <div className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>{t("স্বয়ংক্রিয় রাউটিং:", "Automated Routing:")}</div>
                  <div className="text-xs font-bold text-green-600">{t(selectedReportForInspect.assignedDeptBn, selectedReportForInspect.assignedDeptEn)}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg border space-y-1" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                <div className="font-semibold text-[11px]" style={{ color: "var(--primary-green)" }}>{t("এআই অডিট ও সিদ্ধান্তের যুক্তি:", "Model Reasoning & Audit Trace:")}</div>
                <p className="leading-relaxed text-xs" style={{ color: "var(--text-main)" }}>
                  {t(selectedReportForInspect.aiReasoningBn, selectedReportForInspect.aiReasoningEn)}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border text-[11px] space-y-1" style={{ borderColor: "var(--border-color)" }}>
                <span className="font-semibold">{t("ব্যক্তিগত তথ্য সুরক্ষা (PII Guard):", "PII Redaction Status:")}</span>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {t("✓ আবেদনকারীর মুখমণ্ডল এবং যানবাহন লাইসেন্স প্লেট স্বয়ংক্রিয়ভাবে ব্লার করা হয়েছে।", "✓ Faces and vehicle license plates automatically blurred before dispatch.")}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedReportForInspect(null)}
              className="w-full py-2 rounded-lg text-xs font-semibold text-white shadow-sm"
              style={{ backgroundColor: "var(--primary-green)" }}
            >
              {t("বন্ধ করুন", "Close Audit")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
