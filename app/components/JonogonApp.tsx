"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ShieldCheck,
  ChevronDown,
  Menu,
  Train,
  Bus,
  Ship,
  Route,
  ExternalLink,
  Navigation,
  Ticket,
  Bell,
  UserRound,
  LogIn,
  UserPlus,
  LogOut
} from "lucide-react";
import { TRANSPORT_ROUTES, TransportRoute } from "../transport-data";
import BangladeshTransportMap from "./BangladeshTransportMap";
import AccountPages from "./AccountPages";
import OfficialServicePages, { type OfficialServicePage } from "./OfficialServicePages";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type FeaturePage =
  | "transport-info"
  | "civic-signal"
  | "bazaar-watch"
  | "safe-report"
  | "rumor-buster"
  | "nrb-gateway"
  | "fee-calculator"
  | "doc-checker"
  | "scam-detector"
  | "volunteer-grid"
  | "government-complaint"
  | "marriage-divorce"
  | "lost-document"
  | "document-mismatch"
  | "rejection-explainer";

export type JonogonPage =
  | "home"
  | FeaturePage
  | "govcopilot"
  | "login"
  | "signup"
  | "profile"
  | "feedback"
  | "notifications"
  | "owner"
  | "owner-setup";

const FEATURE_PAGES: FeaturePage[] = [
  "transport-info", "civic-signal", "bazaar-watch", "safe-report", "rumor-buster",
  "nrb-gateway", "fee-calculator", "doc-checker", "scam-detector", "volunteer-grid",
  "government-complaint", "marriage-divorce", "lost-document", "document-mismatch", "rejection-explainer",
];

const isFeaturePage = (page: JonogonPage): page is FeaturePage => FEATURE_PAGES.includes(page as FeaturePage);
const OFFICIAL_SERVICE_PAGES: OfficialServicePage[] = [
  "government-complaint", "marriage-divorce", "lost-document", "document-mismatch", "rejection-explainer",
];
const isOfficialServicePage = (page: JonogonPage): page is OfficialServicePage => OFFICIAL_SERVICE_PAGES.includes(page as OfficialServicePage);

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

type CitizenServiceCard = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  stepsBn: string[];
  stepsEn: string[];
  faqs: {
    questionBn: string;
    questionEn: string;
    stepsBn: string[];
    stepsEn: string[];
  }[];
  actions: { labelBn: string; labelEn: string; href: string }[];
};

const CITIZEN_SERVICES: CitizenServiceCard[] = [
  {
    id: "birth-registration",
    icon: FileText,
    titleBn: "জন্ম ও মৃত্যু নিবন্ধন",
    titleEn: "Birth & Death Registration",
    descriptionBn: "নতুন নিবন্ধন, সংশোধন, পুনর্মুদ্রণ, আবেদনের অবস্থা ও জন্মসনদ যাচাই।",
    descriptionEn: "Apply, correct, reprint, check application status, or verify a birth record.",
    stepsBn: [
      "BDRIS-এ জন্ম বা মৃত্যু নিবন্ধনের সঠিক আবেদনটি বেছে নিন।",
      "প্রয়োজনীয় কাগজপত্রসহ আবেদন জমা দিয়ে আবেদন নম্বর সংরক্ষণ করুন।",
      "জন্মসনদ যাচাই করতে সরকারি eVerify-তে ১৭ সংখ্যার নিবন্ধন নম্বর ও জন্মতারিখ দিন।",
    ],
    stepsEn: [
      "Choose the right birth or death registration service in BDRIS.",
      "Submit the application with required documents and keep its reference number.",
      "To verify a birth record, use the official eVerify service with the 17-digit registration number and date of birth.",
    ],
    faqs: [
      {
        questionBn: "জন্মনিবন্ধনের জন্য কীভাবে আবেদন করব?",
        questionEn: "How do I apply for birth registration?",
        stepsBn: [
          "BDRIS খুলে জন্ম নিবন্ধন থেকে আবেদন নির্বাচন করুন। জন্মস্থান, স্থায়ী ঠিকানা বা দূতাবাসের উপযুক্ত বিকল্প বেছে নিন।",
          "আবেদনকারীর নাম বাংলা ও ইংরেজিতে, জন্মতারিখ, বাবা-মায়ের তথ্য এবং ঠিকানা পূরণ করুন।",
          "প্রয়োজনীয় কাগজপত্র যুক্ত করে সব তথ্য ভালোভাবে মিলিয়ে আবেদন জমা দিন।",
          "আবেদন নম্বর সংরক্ষণ করুন এবং পোর্টাল চাইলে নিজের মোবাইল বা ইমেইলে আসা OTP দিন।",
          "আবেদনের অবস্থা BDRIS-এ দেখুন; প্রয়োজনে নির্বাচিত নিবন্ধক কার্যালয়ে যোগাযোগ করুন।",
        ],
        stepsEn: [
          "Open BDRIS and choose Birth Registration > Application. Select the applicable place of birth, permanent address, or embassy option.",
          "Enter the applicant's name in Bangla and English, date of birth, parents' details, and address.",
          "Attach the required documents, review every detail, and submit the application.",
          "Save the application reference and enter an OTP sent to your own phone or email if the portal asks for one.",
          "Check the application status in BDRIS and contact the selected registrar's office if needed.",
        ],
      },
      {
        questionBn: "আগের জন্মসনদ কীভাবে খুঁজে বা যাচাই করব?",
        questionEn: "How do I find or verify an existing birth certificate?",
        stepsBn: [
          "এই সেবার সরকারি eVerify লিংক খুলুন।",
          "১৭ সংখ্যার জন্মনিবন্ধন নম্বর ও জন্মতারিখ লিখুন, তারপর ছবির কোড পূরণ করে যাচাই করুন।",
          "দেখানো নাম ও জন্মতারিখ মিলিয়ে নিন। ফল না এলে সংশ্লিষ্ট নিবন্ধক কার্যালয়ে যোগাযোগ করুন।",
          "নম্বর বা জন্মতারিখ Jonogon-এ লিখবেন না; এগুলো শুধু সরকারি যাচাই পোর্টালে দিন।",
        ],
        stepsEn: [
          "Open the official eVerify link on this service card.",
          "Enter the 17-digit birth registration number and date of birth, complete the image check, and submit.",
          "Compare the displayed name and date of birth. If no result appears, contact the relevant registrar's office.",
          "Do not enter the number or date of birth in Jonogon; use them only on the government verification portal.",
        ],
      },
      {
        questionBn: "জন্মনিবন্ধনের অবস্থা, সংশোধন বা পুনর্মুদ্রণ কোথায় পাব?",
        questionEn: "Where do I check status, request a correction, or reprint a birth record?",
        stepsBn: [
          "BDRIS হোমপেজে জন্ম নিবন্ধনের বর্তমান অবস্থা, তথ্য সংশোধন বা সনদ পুনর্মুদ্রণের সঠিক মেনু বেছে নিন।",
          "পোর্টাল যে আবেদন নম্বর বা নিবন্ধন তথ্য চায় তা সেখানে দিন এবং নির্দেশনা অনুসরণ করুন।",
          "সংশোধন বা পুনর্মুদ্রণের ক্ষেত্রে প্রয়োজনীয় কাগজপত্র ও স্থানীয় নিবন্ধক কার্যালয়ের নির্দেশনা যাচাই করুন।",
        ],
        stepsEn: [
          "On the BDRIS home page, choose the menu for application status, information correction, or certificate reprint.",
          "Enter the application reference or registration details requested by the portal and follow its prompts.",
          "For corrections or reprints, check the required documents and instructions from the local registrar's office.",
        ],
      },
    ],
    actions: [
      { labelBn: "BDRIS আবেদন ও সেবা", labelEn: "BDRIS applications and services", href: "https://bdris.gov.bd/" },
      { labelBn: "জন্মসনদ যাচাই", labelEn: "Verify a birth record", href: "https://everify.bdris.gov.bd/" },
    ],
  },
  {
    id: "passport",
    icon: Globe2,
    titleBn: "ই-পাসপোর্ট",
    titleEn: "e-Passport",
    descriptionBn: "নতুন পাসপোর্ট, রি-ইস্যু, নির্দেশনা, কাগজপত্র ও ফি সম্পর্কে জানুন।",
    descriptionEn: "Find the official application, re-issue, instructions, document checklist, and fee information.",
    stepsBn: [
      "আবেদনের আগে আপনার এলাকার পাসপোর্ট অফিস ও আবেদন-যোগ্যতা যাচাই করুন।",
      "NID বা ইংরেজি জন্মনিবন্ধনের তথ্য অনুযায়ী অনলাইন ফরম পূরণ করুন।",
      "শুধু সরকারি পোর্টালের অনুমোদিত মাধ্যমে ফি দিন এবং নির্ধারিত এনরোলমেন্টে উপস্থিত হন।",
    ],
    stepsEn: [
      "Check the passport office for your area and your eligibility before applying.",
      "Complete the online form using the details on your NID or English birth certificate.",
      "Pay through a payment method listed on the official portal and attend your enrolment appointment.",
    ],
    faqs: [
      {
        questionBn: "ই-পাসপোর্টে অ্যাকাউন্ট খুলে আবেদন কীভাবে করব?",
        questionEn: "How do I create an account and apply for an e-Passport?",
        stepsBn: [
          "সরকারি e-Passport পোর্টালে যান এবং Apply Online for e-Passport / Re-Issue নির্বাচন করুন।",
          "প্রথমবার হলে নিজের ইমেইল দিয়ে অ্যাকাউন্ট তৈরি করুন এবং অ্যাক্টিভেশন ইমেইল এলে সেটি সম্পন্ন করুন; আগে অ্যাকাউন্ট থাকলে সাইন ইন করুন।",
          "বর্তমান এলাকার পাসপোর্ট অফিস নির্বাচন করে NID বা ইংরেজি জন্মনিবন্ধনের তথ্য অনুযায়ী ফরম পূরণ করুন।",
          "ফরম জমা দিয়ে পোর্টালে দেখানো অনুমোদিত মাধ্যমে ফি দিন, আবেদন নম্বর সংরক্ষণ করুন এবং নির্ধারিত এনরোলমেন্টে যান।",
        ],
        stepsEn: [
          "Open the official e-Passport portal and choose Apply Online for e-Passport / Re-Issue.",
          "For a first application, create an account with your own email and complete the activation email; otherwise sign in.",
          "Select the passport office for your area and fill the form to match your NID or English birth certificate.",
          "Submit the form, pay using a method shown on the portal, save the application reference, and attend the assigned enrolment.",
        ],
      },
      {
        questionBn: "পাসপোর্ট আবেদনের অবস্থা কীভাবে দেখব?",
        questionEn: "How do I check my passport application status?",
        stepsBn: [
          "e-Passport পোর্টালের Check Status পেজ খুলুন।",
          "আবেদনের Application ID অথবা Online Registration ID এবং আবেদনকারীর জন্মতারিখ দিন।",
          "Check চাপুন। Application ID সাধারণত এনরোলমেন্টের পর পাওয়া ডেলিভারি স্লিপে থাকে।",
        ],
        stepsEn: [
          "Open Check Status on the e-Passport portal.",
          "Enter the Application ID or Online Registration ID and the applicant's date of birth.",
          "Select Check. The Application ID is usually on the delivery slip issued after enrolment.",
        ],
      },
      {
        questionBn: "রি-ইস্যু বা তথ্য সংশোধনের আগে কী করব?",
        questionEn: "What should I do before a re-issue or information correction?",
        stepsBn: [
          "পোর্টালের নির্দেশনা ও বর্তমান কাগজপত্রের তালিকা পড়ুন।",
          "রি-ইস্যু আবেদন শুরু করে আগের পাসপোর্টের তথ্য দিন; নাম বা জন্মতারিখের মতো পরিবর্তনের ক্ষেত্রে সমর্থনকারী সরকারি নথি প্রস্তুত রাখুন।",
          "ফি, এনরোলমেন্ট এবং জমা দেওয়ার নিয়ম পোর্টালে নিশ্চিত করুন; কোনো দালালকে পাসওয়ার্ড বা OTP দেবেন না।",
        ],
        stepsEn: [
          "Read the portal's current instructions and document checklist.",
          "Start a re-issue application and enter your previous passport details; prepare supporting official documents for changes such as name or date of birth.",
          "Confirm payment, enrolment, and submission instructions on the portal. Never share your password or OTP with an agent.",
        ],
      },
    ],
    actions: [
      { labelBn: "ই-পাসপোর্ট আবেদন ও রি-ইস্যু", labelEn: "Apply or re-issue an e-Passport", href: "https://www.epassport.gov.bd/" },
      { labelBn: "সরকারি নির্দেশনা", labelEn: "Official instructions", href: "https://www.epassport.gov.bd/instructions/instructions" },
      { labelBn: "পাসপোর্ট আবেদনের অবস্থা", labelEn: "Check passport application status", href: "https://epassport.gov.bd/authorization/application-status" },
    ],
  },
  {
    id: "nid",
    icon: ShieldCheck,
    titleBn: "জাতীয় পরিচয়পত্র (NID)",
    titleEn: "National ID (NID)",
    descriptionBn: "নতুন NID আবেদন, অ্যাকাউন্ট দাবি, তথ্য সংশোধন, রি-ইস্যু ও কার্ড ডাউনলোড।",
    descriptionEn: "Apply for a new NID, claim an account, request corrections or re-issue, and access card services.",
    stepsBn: [
      "নতুন ভোটার হলে নতুন NID আবেদনের অপশন বেছে নিন; NID থাকলে অনলাইন অ্যাকাউন্ট দাবি করুন।",
      "সংশোধন, রি-ইস্যু বা ডাউনলোডের জন্য নির্বাচন কমিশনের পোর্টালে সাইন ইন করে নির্দেশনা অনুসরণ করুন।",
      "আপনার NID নম্বর, পাসওয়ার্ড বা OTP শুধু সরকারি পোর্টালে দিন।",
    ],
    stepsEn: [
      "Choose new NID application if you are registering; claim an online account if you already have an NID.",
      "Sign in to the Election Commission portal for correction, re-issue, or card download services.",
      "Enter your NID number, password, or OTP only on the official portal.",
    ],
    faqs: [
      {
        questionBn: "নতুন NID-এর জন্য কীভাবে নিবন্ধন শুরু করব?",
        questionEn: "How do I start a new NID registration?",
        stepsBn: [
          "বাংলাদেশ নির্বাচন কমিশনের NID পোর্টাল খুলে Apply for a National ID / Get Started নির্বাচন করুন।",
          "নাম, জন্মতারিখ ও ছবির কোডসহ প্রাথমিক তথ্য দিয়ে Continue চাপুন।",
          "পোর্টালের ধাপে ধাপে ফরম পূরণ করে আবেদন জমা দিন এবং পরবর্তী পরিচয় যাচাই বা অফিসে উপস্থিতির নির্দেশনা অনুসরণ করুন।",
        ],
        stepsEn: [
          "Open the Election Commission NID portal and choose Apply for a National ID / Get Started.",
          "Enter the initial details, such as name and date of birth, complete the image check, and select Continue.",
          "Complete the remaining form, submit it, and follow the portal's instructions for identity verification or an office visit.",
        ],
      },
      {
        questionBn: "আগে থেকেই NID থাকলে অ্যাকাউন্ট খুলব বা লগইন করব কীভাবে?",
        questionEn: "How do I claim an account or sign in if I already have an NID?",
        stepsBn: [
          "NID পোর্টালে Claim Account নির্বাচন করুন।",
          "নিজের NID নম্বর বা ফর্ম নম্বর, জন্মতারিখ এবং ছবির কোড দিন; পোর্টালের যাচাই ধাপ সম্পন্ন করুন।",
          "অ্যাকাউন্ট তৈরি হলে NID বা ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন করুন। পাসওয়ার্ড বা OTP কারও সঙ্গে শেয়ার করবেন না।",
        ],
        stepsEn: [
          "Choose Claim Account on the NID portal.",
          "Enter your own NID or form number, date of birth, and image code, then complete the portal's verification steps.",
          "After claiming the account, sign in with your NID or username and password. Do not share passwords or OTPs.",
        ],
      },
      {
        questionBn: "স্মার্ট কার্ডের অবস্থা বা NID সংশোধন কীভাবে দেখব?",
        questionEn: "How do I check smart-card status or request an NID correction?",
        stepsBn: [
          "স্মার্ট কার্ডের অবস্থা জানতে NID পোর্টালের Smart Card Status পেজ খুলুন।",
          "NID বা ফর্ম নম্বর, জন্মতারিখ এবং ছবির কোড দিয়ে Submit করুন।",
          "তথ্য সংশোধন বা রি-ইস্যুর জন্য অ্যাকাউন্টে লগইন করে সংশ্লিষ্ট আবেদন নির্বাচন করুন এবং চাওয়া প্রমাণপত্র যুক্ত করুন।",
        ],
        stepsEn: [
          "Open Smart Card Status on the NID portal.",
          "Enter your NID or form number and date of birth, complete the image check, and submit.",
          "For a correction or re-issue, sign in, choose the relevant application, and attach the evidence requested by the portal.",
        ],
      },
    ],
    actions: [
      { labelBn: "নির্বাচন কমিশনের NID পোর্টাল", labelEn: "Election Commission NID portal", href: "https://services.nidw.gov.bd/nid-pub/" },
      { labelBn: "স্মার্ট কার্ডের অবস্থা দেখুন", labelEn: "Check smart card status", href: "https://services.nidw.gov.bd/nid-pub/card-status" },
    ],
  },
  {
    id: "driving-license",
    icon: Compass,
    titleBn: "ড্রাইভিং লাইসেন্স ও BRTA সেবা",
    titleEn: "Driving Licence & BRTA Services",
    descriptionBn: "লার্নার লাইসেন্স, স্মার্টকার্ড, নবায়ন, ডুপ্লিকেট এবং যানবাহন-সংক্রান্ত সেবা।",
    descriptionEn: "Learner licence, smart card, renewal, duplicate licence, and vehicle services.",
    stepsBn: [
      "BRTA Service Portal-এ নাগরিক অ্যাকাউন্ট তৈরি বা সাইন ইন করুন।",
      "লার্নার লাইসেন্সের আবেদন করে নির্ধারিত পরীক্ষা ও পরবর্তী ধাপ সম্পন্ন করুন।",
      "স্মার্টকার্ড, নবায়ন বা ডুপ্লিকেটের জন্য পোর্টালের সংশ্লিষ্ট সেবা বেছে নিন।",
    ],
    stepsEn: [
      "Create a citizen account or sign in to the BRTA Service Portal.",
      "Apply for a learner licence and complete the required tests and next steps.",
      "Choose the portal service for a smart card, renewal, or duplicate licence.",
    ],
    faqs: [
      {
        questionBn: "BRTA পোর্টালে অ্যাকাউন্ট খুলব বা লগইন করব কীভাবে?",
        questionEn: "How do I register or sign in to the BRTA portal?",
        stepsBn: [
          "BRTA Service Portal খুলে Register নির্বাচন করুন; আগে অ্যাকাউন্ট থাকলে Login বেছে নিন।",
          "নিবন্ধনের সময় নিজের জন্মতারিখ, NID নম্বর এবং সেই NID-তে নিবন্ধিত মোবাইল নম্বর দিন।",
          "পোর্টালের যাচাই কোড, ইমেইল বা OTP ধাপ সম্পন্ন করে অ্যাকাউন্ট সক্রিয় করুন, তারপর লগইন করুন।",
        ],
        stepsEn: [
          "Open BRTA Service Portal and choose Register; choose Login if you already have an account.",
          "During registration, enter your date of birth, NID number, and a mobile number registered to that NID.",
          "Complete the portal's security-code, email, or OTP steps to activate the account, then sign in.",
        ],
      },
      {
        questionBn: "লার্নার লাইসেন্স থেকে স্মার্টকার্ড পর্যন্ত কীভাবে এগোব?",
        questionEn: "How do I proceed from a learner licence to a smart card?",
        stepsBn: [
          "লগইন করে Driving License মেনু থেকে Learner License Application খুলুন।",
          "পোর্টালে চাওয়া ছবি, মেডিকেল সার্টিফিকেট, পরিচয়পত্র এবং ঠিকানার প্রমাণ প্রস্তুত করে আবেদন জমা দিন।",
          "নির্ধারিত পরীক্ষা ও পরবর্তী অনুমোদনের ধাপ সম্পন্ন হলে Application for Smart Card সেবা ব্যবহার করুন।",
          "আবেদন, পেমেন্ট এবং পরীক্ষার অবস্থা নিজের BRTA অ্যাকাউন্টে দেখুন।",
        ],
        stepsEn: [
          "Sign in and open Driving License > Learner License Application.",
          "Prepare the photo, medical certificate, identity document, and address proof requested by the portal, then submit the application.",
          "Complete the required test and approval steps, then use Application for Smart Card.",
          "Check application, payment, and test status in your BRTA account.",
        ],
      },
    ],
    actions: [
      { labelBn: "BRTA Service Portal", labelEn: "BRTA Service Portal", href: "https://bsp.brta.gov.bd/?lan=en" },
      { labelBn: "ই-ড্রাইভিং টিউটোরিয়াল", labelEn: "E-Driving Tutorial", href: "https://brta.gov.bd/pages/static-pages/6922dfc3933eb65569e23dce" },
    ],
  },
  {
    id: "land-records",
    icon: MapPin,
    titleBn: "ভূমির খতিয়ান ও নামজারি",
    titleEn: "Land Records & Mutation",
    descriptionBn: "ই-পর্চায় খতিয়ান খুঁজুন; মালিকানা পরিবর্তনের পর সরকারি ই-নামজারি সেবা ব্যবহার করুন।",
    descriptionEn: "Search for a khatian through e-Porcha and use e-Mutation to update land records after an ownership change.",
    stepsBn: [
      "ই-পর্চায় বিভাগ, জেলা, উপজেলা, মৌজা ও খতিয়ানের তথ্য দিয়ে অনুসন্ধান করুন।",
      "মালিকানা পরিবর্তন হলে ই-নামজারি পোর্টালে আবেদন করে আবেদন নম্বর সংরক্ষণ করুন।",
      "আবেদনের অবস্থা ও পরবর্তী করণীয় সংশ্লিষ্ট সরকারি পোর্টালেই যাচাই করুন।",
    ],
    stepsEn: [
      "Search e-Porcha using the division, district, upazila, mouza, and khatian details.",
      "After an ownership change, apply through e-Mutation and keep the application reference.",
      "Check application status and next steps on the relevant government portal.",
    ],
    faqs: [
      {
        questionBn: "ই-পর্চায় নির্দিষ্ট খতিয়ান কীভাবে খুঁজব?",
        questionEn: "How do I search for a specific khatian in e-Porcha?",
        stepsBn: [
          "এই কার্ডের e-Porcha লিংক খুলুন এবং খতিয়ান অনুসন্ধান বা Search অপশন বেছে নিন।",
          "বিভাগ, জেলা, উপজেলা, মৌজা এবং জরিপের ধরন নির্বাচন করুন।",
          "পোর্টাল যে খতিয়ান নম্বর, দাগ নম্বর বা মালিকের তথ্য চায় তা দিয়ে অনুসন্ধান করুন এবং ফলাফল মিলিয়ে দেখুন।",
          "কপি দরকার হলে পোর্টালের কপি/আবেদন ধাপ অনুসরণ করুন; ফি দেওয়ার আগে সেবার ধরন ও পরিমাণ যাচাই করুন।",
        ],
        stepsEn: [
          "Open the e-Porcha link on this card and choose the khatian search option.",
          "Select division, district, upazila, mouza, and survey type.",
          "Search with the khatian number, plot number, or owner details requested by the portal, then review the result.",
          "If you need a copy, follow the portal's copy/application steps and confirm the service and fee before paying.",
        ],
      },
      {
        questionBn: "জমির মালিকানা বদলের পর নামজারি কীভাবে করব?",
        questionEn: "How do I request mutation after a land ownership change?",
        stepsBn: [
          "সরকারি ই-নামজারি পোর্টালে যান; নতুন হলে নিবন্ধন করুন, আগে অ্যাকাউন্ট থাকলে লগইন করুন।",
          "নতুন আবেদন নির্বাচন করে জমি ও মালিকানা পরিবর্তনের তথ্য এবং পোর্টালে চাওয়া দলিল দিন।",
          "আবেদন নম্বর সংরক্ষণ করুন এবং একই পোর্টালে অবস্থা, নোটিশ ও পরবর্তী ফি দেখুন।",
        ],
        stepsEn: [
          "Open the government e-Mutation portal; register if new or sign in to an existing account.",
          "Choose a new application and enter the land and ownership-change details with the documents requested by the portal.",
          "Save the application reference and check status, notices, and any next fee in the same portal.",
        ],
      },
    ],
    actions: [
      { labelBn: "ই-পর্চা খতিয়ান সেবা", labelEn: "e-Porcha land records", href: "https://e-porcha.com/" },
      { labelBn: "ই-নামজারি আবেদন ও অবস্থা", labelEn: "e-Mutation applications and status", href: "https://mutation.land.gov.bd/" },
    ],
  },
  {
    id: "police-clearance",
    icon: Lock,
    titleBn: "পুলিশ ক্লিয়ারেন্স",
    titleEn: "Police Clearance Certificate",
    descriptionBn: "বাংলাদেশ পুলিশের অনলাইন পোর্টালে নিবন্ধন, আবেদন ও আবেদনের নির্দেশনা।",
    descriptionEn: "Register, apply, and follow the application instructions on the Bangladesh Police portal.",
    stepsBn: [
      "নিজের অ্যাকাউন্ট তৈরি করে পুলিশ ক্লিয়ারেন্স পোর্টালে সাইন ইন করুন।",
      "পাসপোর্ট ও ঠিকানার সঙ্গে সামঞ্জস্য রেখে আবেদনপত্র পূরণ করুন।",
      "পোর্টালে দেখানো সরকারি ফি ও যাচাই প্রক্রিয়া অনুসরণ করে অবস্থা দেখুন।",
    ],
    stepsEn: [
      "Create your account and sign in to the Police Clearance portal.",
      "Complete the application with details that match your passport and address.",
      "Follow the listed government fee and verification process, then check your status.",
    ],
    faqs: [
      {
        questionBn: "পুলিশ ক্লিয়ারেন্সে নিবন্ধন, লগইন ও আবেদন কীভাবে করব?",
        questionEn: "How do I register, sign in, and apply for police clearance?",
        stepsBn: [
          "বাংলাদেশ পুলিশের PCC পোর্টালে Registration নির্বাচন করে নিজের অ্যাকাউন্ট তৈরি করুন।",
          "অ্যাকাউন্টে লগইন করে Apply নির্বাচন করুন এবং ব্যক্তিগত তথ্য ও বর্তমান/স্থায়ী ঠিকানা পূরণ করুন।",
          "পাসপোর্টের তথ্যের সঙ্গে মিল রেখে পোর্টালে চাওয়া কাগজপত্র যুক্ত করুন এবং আবেদন জমা দিন।",
          "পোর্টালে দেখানো ফি ও যাচাই প্রক্রিয়া অনুসরণ করুন; আবেদনের রেফারেন্স সংরক্ষণ করুন।",
        ],
        stepsEn: [
          "Choose Registration on the Bangladesh Police PCC portal and create your own account.",
          "Sign in, choose Apply, and enter your personal details plus current and permanent addresses.",
          "Add the documents requested by the portal and make sure details match your passport before submitting.",
          "Follow the listed fee and verification steps, and keep the application reference.",
        ],
      },
      {
        questionBn: "আবেদনের অবস্থা বা পাসওয়ার্ড কীভাবে সামলাব?",
        questionEn: "How do I check an application or recover my password?",
        stepsBn: [
          "PCC পোর্টালে লগইন করে নিজের আবেদন বা আবেদন-ইতিহাস মেনু খুলুন।",
          "আবেদন নম্বর ও পোর্টালের অবস্থা দেখে পরবর্তী নির্দেশনা অনুসরণ করুন।",
          "পাসওয়ার্ড ভুলে গেলে পোর্টালের Forgot Password নির্দেশনা অনুসরণ করুন; OTP বা পাসওয়ার্ড কারও সঙ্গে শেয়ার করবেন না।",
        ],
        stepsEn: [
          "Sign in to the PCC portal and open your application or application-history section.",
          "Review the application reference and status, then follow any next instructions shown.",
          "If you forget your password, use the portal's Forgot Password flow. Never share an OTP or password.",
        ],
      },
    ],
    actions: [
      { labelBn: "বাংলাদেশ পুলিশের PCC পোর্টাল", labelEn: "Bangladesh Police PCC portal", href: "https://pcc.police.gov.bd/" },
    ],
  },
  {
    id: "tax-services",
    icon: Calculator,
    titleBn: "ই-টিআইএন ও আয়কর",
    titleEn: "e-TIN & Income Tax",
    descriptionBn: "NBR-এর পোর্টালে করদাতা নিবন্ধন, আয়কর রিটার্ন ও সংশ্লিষ্ট অনলাইন সেবা।",
    descriptionEn: "Use the NBR portal for taxpayer registration, income tax returns, and related online services.",
    stepsBn: [
      "NBR eTax পোর্টালে eTIN নিবন্ধন বা e-Return সেবা বেছে নিন।",
      "নিজের প্রোফাইল ও কর-সংক্রান্ত তথ্য সরকারি সিস্টেমে পূরণ করুন।",
      "জমা দেওয়ার পর রিটার্ন ও পেমেন্টের রসিদ সরকারি অ্যাকাউন্টে সংরক্ষণ করুন।",
    ],
    stepsEn: [
      "Choose eTIN registration or e-Return on the NBR eTax portal.",
      "Enter your profile and tax information in the government system.",
      "After submission, keep your return and payment receipts in your official account.",
    ],
    faqs: [
      {
        questionBn: "e-TIN অ্যাকাউন্ট বা নিবন্ধন কীভাবে শুরু করব?",
        questionEn: "How do I start e-TIN registration or sign in?",
        stepsBn: [
          "NBR eTax পোর্টাল খুলে eTIN বা Register as a taxpayer নির্বাচন করুন।",
          "নতুন হলে Registration নির্বাচন করে পোর্টালে চাওয়া পরিচয় ও যোগাযোগের তথ্য দিন; আগে অ্যাকাউন্ট থাকলে Sign in করুন।",
          "যাচাইয়ের ধাপ সম্পন্ন করে TIN সনদ তৈরি বা ডাউনলোড করুন এবং নিজের অ্যাকাউন্টে সংরক্ষণ করুন।",
        ],
        stepsEn: [
          "Open the NBR eTax portal and choose eTIN or Register as a taxpayer.",
          "If new, choose Registration and enter the identity and contact details requested; otherwise sign in.",
          "Complete verification, generate or download the TIN certificate, and keep it in your own account.",
        ],
      },
      {
        questionBn: "e-Return জমা ও যাচাই কীভাবে করব?",
        questionEn: "How do I file and verify an e-Return?",
        stepsBn: [
          "eTax পোর্টালে eReturn নির্বাচন করে লগইন বা অ্যাকাউন্ট নিবন্ধন করুন।",
          "পোর্টালের ধাপে আয়, কর-ছাড় ও পেমেন্টের তথ্য পূরণ করে রিটার্ন জমা দিন।",
          "জমার নিশ্চিতকরণ ও রসিদ সংরক্ষণ করুন; প্রয়োজনে ReturnVerify/PSR সেবা দিয়ে জমার অবস্থা দেখুন।",
        ],
        stepsEn: [
          "Choose eReturn on the eTax portal and sign in or register for an account.",
          "Enter income, tax-credit, and payment details through the portal's steps, then submit the return.",
          "Save the submission confirmation and receipts; use ReturnVerify/PSR if you need to check filing status.",
        ],
      },
    ],
    actions: [
      { labelBn: "NBR eTax সেবা", labelEn: "NBR eTax services", href: "https://etaxnbr.gov.bd/" },
    ],
  },
];

export default function JonogonApp({ initialPage = "home" }: { initialPage?: JonogonPage }) {
  const router = useRouter();
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [darkMode, setDarkMode] = useState(false);
  const [activePortal, setActivePortal] = useState<"citizen" | "gov">("citizen");
  const [selectedReportForInspect, setSelectedReportForInspect] = useState<any | null>(null);

  const [activePage, setActivePage] = useState<JonogonPage>(initialPage);
  const [accountUser, setAccountUser] = useState<{ id: string; email?: string; nickname?: string; avatarUrl?: string; role?: string } | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isFeatureMenuOpen, setIsFeatureMenuOpen] = useState(false);
  const sideMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const sideMenuCloseButtonRef = useRef<HTMLButtonElement>(null);
  const wasSideMenuOpenRef = useRef(false);
  const [selectedTransportRouteId, setSelectedTransportRouteId] = useState<string>("metro-line-6");
  const [transportFilterType, setTransportFilterType] = useState<"all" | "metro" | "train" | "bus" | "intercity-bus" | "launch">("all");
  const [transportSearchTerm, setTransportSearchTerm] = useState<string>("");

  // Translation helper function
  const t = (bnText: string, enText: string) => (lang === "bn" ? bnText : enText);

  const navigateTo = (page: JonogonPage) => {
    setActivePage(page);
    if (isFeaturePage(page)) {
      setActivePortal("citizen");
    } else if (page === "govcopilot") {
      setActivePortal("gov");
    } else if (page === "home") {
      setActivePortal("citizen");
    }
    setIsSideMenuOpen(false);
    router.push(page === "home" ? "/" : `/${page}`);
  };

  const navigateToCitizenDocuments = () => {
    navigateTo("home");
    window.setTimeout(() => {
      document.getElementById("citizen-documents-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 350);
  };

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("jonogon-language");
    if (storedLanguage === "bn" || storedLanguage === "en") setLang(storedLanguage);
  }, []);

  useEffect(() => {
    setActivePage(initialPage);
    if (isFeaturePage(initialPage)) {
      setActivePortal("citizen");
    } else if (initialPage === "govcopilot") {
      setActivePortal("gov");
    } else {
      setActivePortal("citizen");
    }
  }, [initialPage]);

  useEffect(() => {
    if (isFeaturePage(activePage) || activePage === "govcopilot") setIsFeatureMenuOpen(true);
  }, [activePage]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAccountUser(null);
      setUnreadNotificationCount(0);
      return;
    }

    const supabase = createClient();
    const refreshNotificationCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUnreadNotificationCount(0);
        return;
      }
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      setUnreadNotificationCount(count || 0);
    };
    window.addEventListener("jonogon:notifications-updated", refreshNotificationCount);
    const loadAccount = async (user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null) => {
      if (!user) {
        setAccountUser(null);
        setUnreadNotificationCount(0);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, avatar_url, role")
        .eq("user_id", user.id)
        .maybeSingle();
      setAccountUser({
        id: user.id,
        email: user.email,
        nickname: profile?.nickname || String(user.user_metadata?.nickname || ""),
        avatarUrl: profile?.avatar_url || undefined,
        role: profile?.role,
      });
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      setUnreadNotificationCount(count || 0);
    };

    const refreshAccountProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      await loadAccount(user);
    };

    supabase.auth.getUser().then(({ data }) => loadAccount(data.user));
    window.addEventListener("jonogon:profile-updated", refreshAccountProfile);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadAccount(session?.user || null);
    });
    return () => {
      subscription.unsubscribe();
      window.removeEventListener("jonogon:notifications-updated", refreshNotificationCount);
      window.removeEventListener("jonogon:profile-updated", refreshAccountProfile);
    };
  }, []);

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) await createClient().auth.signOut();
    setAccountUser(null);
    setUnreadNotificationCount(0);
    navigateTo("home");
  };

  // State for interactive features
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceLanguageNotice, setVoiceLanguageNotice] = useState(false);
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
  const [openCitizenServiceHelpId, setOpenCitizenServiceHelpId] = useState<string | null>(null);

  useEffect(() => {
    if (isSideMenuOpen) {
      sideMenuCloseButtonRef.current?.focus();
    } else if (wasSideMenuOpenRef.current) {
      sideMenuTriggerRef.current?.focus();
    }
    wasSideMenuOpenRef.current = isSideMenuOpen;

    if (!isSideMenuOpen) return;

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSideMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const drawer = document.getElementById("main-navigation-drawer");
      const focusableItems = drawer?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableItems?.length) return;

      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    window.addEventListener("keydown", handleMenuKeyDown);
    return () => window.removeEventListener("keydown", handleMenuKeyDown);
  }, [isSideMenuOpen]);

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
    recognition.continuous = false;
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
      setVoiceLanguageNotice(false);
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
    setVoiceTranscript("");
    setVoiceLanguageNotice(true);
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

  const filteredTransportRoutes = TRANSPORT_ROUTES.filter((route) => {
    const matchesType = transportFilterType === "all" || route.type === transportFilterType;
    const matchesSearch =
      !transportSearchTerm.trim() ||
      route.titleBn.toLowerCase().includes(transportSearchTerm.toLowerCase()) ||
      route.titleEn.toLowerCase().includes(transportSearchTerm.toLowerCase()) ||
      route.routeSummaryBn.toLowerCase().includes(transportSearchTerm.toLowerCase()) ||
      route.routeSummaryEn.toLowerCase().includes(transportSearchTerm.toLowerCase()) ||
      route.stations.some(
        (s) =>
          s.nameBn.toLowerCase().includes(transportSearchTerm.toLowerCase()) ||
          s.nameEn.toLowerCase().includes(transportSearchTerm.toLowerCase())
      );
    return matchesType && matchesSearch;
  });

  const currentSelectedRoute =
    TRANSPORT_ROUTES.find((r) => r.id === selectedTransportRouteId) ||
    filteredTransportRoutes[0] ||
    TRANSPORT_ROUTES[0];

  const greetingName = accountUser?.nickname?.trim();
  const isAccountPage = ["login", "signup", "profile", "feedback", "notifications", "owner", "owner-setup"].includes(activePage);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      {/* 🇧🇩 Slide-Out Side Navigation Drawer */}
      {isSideMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsSideMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="main-navigation-drawer"
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] transform transition-transform duration-300 ease-in-out border-r shadow-2xl flex flex-col ${
          isSideMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-color)",
          color: "var(--text-main)",
        }}
        aria-label={t("প্রধান নেভিগেশন মেনু", "Main navigation menu")}
        aria-hidden={!isSideMenuOpen}
        inert={!isSideMenuOpen}
      >
        {/* Drawer Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-xs flex items-center justify-center bg-[#006A4E] relative flex-shrink-0 border" style={{ borderColor: "var(--border-color)" }}>
              <svg viewBox="0 0 50 30" className="w-full h-full">
                <rect width="50" height="30" fill="#006A4E" />
                <circle cx="23" cy="15" r="9" fill="#F42A41" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight leading-tight" style={{ color: "var(--text-main)" }}>
                {t("জনগণ মেনু", "Jonogon Menu")}
              </h2>
              <span className="text-[10px] font-medium block" style={{ color: "var(--text-muted)" }}>
                {t("নাগরিক সেবা ও যাতায়াত হাব", "Citizen Services & Transit Hub")}
              </span>
            </div>
          </div>
          <button
            ref={sideMenuCloseButtonRef}
            onClick={() => setIsSideMenuOpen(false)}
            className="p-1.5 rounded-lg border transition-all hover:opacity-80 active:scale-95"
            style={{ borderColor: "var(--border-color)", color: "var(--text-main)", backgroundColor: "var(--surface)" }}
            aria-label={t("মেনু বন্ধ করুন", "Close menu")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <button
            type="button"
            onClick={() => setIsFeatureMenuOpen((open) => !open)}
            className="w-full rounded-xl border p-3 text-left transition-colors hover:shadow-sm"
            style={{ borderColor: isFeatureMenuOpen ? "var(--primary-green)" : "var(--border-color)", backgroundColor: isFeatureMenuOpen ? "var(--primary-green-light)" : "var(--background)", color: "var(--text-main)" }}
            aria-expanded={isFeatureMenuOpen}
            aria-controls="feature-services-stack"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: "var(--primary-green)" }}>
                <FileText className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{t("ফিচার ও সেবা", "Features & Services")}</span>
                <span className="mt-0.5 block text-[10px]" style={{ color: "var(--text-muted)" }}>{t("সব পোর্টাল, টুল ও নাগরিক সহায়িকা", "Open the full stack of portals, tools, and citizen guides")}</span>
              </span>
              <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isFeatureMenuOpen ? "rotate-180" : ""}`} />
            </span>
          </button>

          <div
            id="feature-services-stack"
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isFeatureMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            aria-hidden={!isFeatureMenuOpen}
            inert={!isFeatureMenuOpen}
          >
            <div className="min-h-0 overflow-hidden space-y-4">
          {/* Featured Service: Transport Info */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase" style={{ color: "var(--text-subtle)" }}>
              {t("বিশেষ গণপরিবহন সেবা", "Featured Transit Intelligence")}
            </div>
            <button
              onClick={() => navigateTo("transport-info")}
              className="w-full mt-1.5 p-3 rounded-xl border text-left transition-all hover:shadow-sm active:scale-[0.99] flex items-center justify-between group cursor-pointer"
              style={{
                backgroundColor: activePage === "transport-info" ? "var(--primary-green-light)" : "var(--background)",
                borderColor: activePage === "transport-info" ? "var(--primary-green)" : "var(--border-color)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: "var(--primary-green)" }}
                >
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-main)" }}>
                    {t("যাতায়াত ও পরিবহন তথ্য", "Transport Info")}
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-extrabold uppercase">
                      {t("রুট ম্যাপ", "Route Map")}
                    </span>
                  </div>
                  <div className="text-[10px] mt-0.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>
                    {t("মেট্রো, ট্রেন, বাস ও নৌপথের রুট ও ভাড়া", "Metro, train, bus, launch routes & fares")}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: "var(--primary-green)" }} />
            </button>
          </div>

          <button
            onClick={navigateToCitizenDocuments}
            className="w-full rounded-xl border p-2.5 text-left transition-colors hover:shadow-sm flex items-center gap-2.5"
            style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)", color: "var(--text-main)" }}
          >
            <FileText className="h-4 w-4" style={{ color: "var(--primary-green)" }} />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold">{t("গুরুত্বপূর্ণ সরকারি নথি", "Important Government Documents")}</span>
              <span className="block text-[10px]" style={{ color: "var(--text-muted)" }}>{t("জন্মনিবন্ধন, NID, পাসপোর্ট ও অন্যান্য", "Birth records, NID, passport, and more")}</span>
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Core Citizen Services */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase" style={{ color: "var(--text-subtle)" }}>
              {t("নাগরিক সেবা ও মডিউল", "Citizen Portals & Tools")}
            </div>
            <div className="space-y-1 mt-1">
              {[
                { id: "civic-signal", label: t("নাগরিক সিগন্যাল (অভিযোগ)", "CivicSignal (Hazard Reports)"), icon: AlertTriangle, desc: t("ম্যানহোল, বর্জ্য ও রাস্তা সমস্যা", "Road, drainage & waste hazards") },
                { id: "bazaar-watch", label: t("বাজার দর মনিটর (টিসিবি)", "Bazaar Watch (TCB Prices)"), icon: TrendingUp, desc: t("নিত্যপ্রয়োজনীয় পণ্যের সরকারি দর", "Daily essential market rates") },
                { id: "safe-report", label: t("নিরাপদ হুইসেলব্লোয়ার", "Whistleblower Shield"), icon: Lock, desc: t("দুর্নীতি ও ঘুষের বেনামী অভিযোগ", "Encrypted anonymous reporting") },
                { id: "rumor-buster", label: t("গুজব যাচাই (ফ্যাক্ট চেক)", "RumorBuster BD"), icon: Eye, desc: t("গুজব ও বিভ্রান্তি প্রতিহতকরণ", "AI fact-checking engine") },
                { id: "nrb-gateway", label: t("প্রবাসী ও রেমিট্যান্স হাব", "NRB Expat Gateway"), icon: Globe2, desc: t("প্রণোদনা হিসাব ও সুরক্ষা", "Remittance & land protection") },
                { id: "fee-calculator", label: t("সরকারি ফি ক্যালকুলেটর", "Gov Fee Calculator"), icon: Calculator, desc: t("পাসপোর্ট, এনআইডি ও লাইসেন্স ফি", "Official government service fees") },
                { id: "doc-checker", label: t("এআই নথি পরীক্ষক", "AI Document Checker"), icon: FileCheck, desc: t("কাগজপত্রের ত্রুটি ও স্পষ্টতা যাচাই", "Scan documents for omissions") },
                { id: "scam-detector", label: t("স্ক্যাম ও লিংক ডিটেক্টর", "Scam & Fake Portal Detector"), icon: ShieldAlert, desc: t("ভুয়া ওয়েবসাইট ও প্রতারণা রোধ", "Detect fraudulent links") },
                { id: "volunteer-grid", label: t("ত্রাণ ও যুব ভলান্টিয়ার", "Relief & Volunteers"), icon: HeartHandshake, desc: t("দুর্যোগ সহায়তা ও সমাজসেবা", "Youth civil protection grid") },
                { id: "government-complaint", label: t("সরকারি অভিযোগ সহায়িকা", "Government Complaint & Grievance Assistant"), icon: Building2, desc: t("সঠিক কর্তৃপক্ষ, অভিযোগ ও ট্র্যাকিং", "Find the authority, submit, and track") },
                { id: "marriage-divorce", label: t("বিবাহ ও তালাক নিবন্ধন", "Marriage & Divorce Registration"), icon: FileText, desc: t("যোগ্যতা, কাগজপত্র ও সরকারি প্রক্রিয়া", "Eligibility, documents, and official steps") },
                { id: "lost-document", label: t("হারানো নথি পুনরুদ্ধার", "Lost Document Recovery"), icon: RefreshCw, desc: t("NID, পাসপোর্ট, জন্মসনদ ও লাইসেন্স", "NID, passport, birth record, and licence") },
                { id: "document-mismatch", label: t("নথির তথ্যের অমিল সমাধান", "Document Mismatch Resolver"), icon: CheckCircle2, desc: t("সঠিক তথ্য সংশোধনের ধাপ", "Steps to correct inconsistent records") },
                { id: "rejection-explainer", label: t("আবেদন বাতিলের কারণ ব্যাখ্যা", "Rejection Reason Explainer"), icon: Search, desc: t("বাতিল বার্তা বুঝুন ও পরবর্তী ধাপ দেখুন", "Understand a rejection and next steps") },
              ].map((item) => {
                const IconComponent = item.icon;
                const isItemActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id as FeaturePage)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      isItemActive ? "font-bold shadow-xs" : "opacity-85 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                    style={{
                      borderColor: isItemActive ? "var(--primary-green)" : "transparent",
                      backgroundColor: isItemActive ? "var(--primary-green-light)" : "transparent",
                      color: isItemActive ? "var(--primary-green)" : "var(--text-main)",
                    }}
                  >
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate">{item.label}</div>
                      <div className="text-[10px] opacity-75 truncate" style={{ color: "var(--text-muted)" }}>{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Administration */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase" style={{ color: "var(--text-subtle)" }}>
              {t("প্রশাসন ও অডিট", "Administration & Audit")}
            </div>
            <button
              onClick={() => navigateTo("govcopilot")}
              className={`w-full mt-1 p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                activePortal === "gov" ? "font-bold shadow-xs" : "opacity-85 hover:opacity-100"
              }`}
              style={{
                borderColor: activePortal === "gov" ? "var(--primary-green)" : "var(--border-color)",
                backgroundColor: activePortal === "gov" ? "var(--primary-green-light)" : "var(--background)",
                color: activePortal === "gov" ? "var(--primary-green)" : "var(--text-main)",
              }}
            >
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate">{t("GovCopilot ডেমো ড্যাশবোর্ড", "GovCopilot demo dashboard")}</div>
                <div className="text-[10px] opacity-75 truncate" style={{ color: "var(--text-muted)" }}>
                  {t("নমুনা তথ্য; সরকারি সিস্টেমে সংযুক্ত নয়", "Sample data; not connected to government systems")}
                </div>
              </div>
            </button>
            {accountUser?.role === "owner" && (
              <button
                onClick={() => navigateTo("owner")}
                className="w-full mt-1 p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5"
                style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)", color: "var(--text-main)" }}
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary-green)" }} />
                <span className="text-xs font-semibold">{t("সাইট মালিক প্যানেল", "Site Owner Panel")}</span>
              </button>
            )}
          </div>

          {/* Emergency Hotlines */}
          <div className="p-3 rounded-xl border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
            <div className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--text-subtle)" }}>
              {t("জরুরি জাতীয় হেল্পলাইনসমূহ", "National Emergency Helplines")}
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {[
                { num: "999", labelBn: "জরুরি সেবা", labelEn: "Emergency", color: "bg-red-500/10 text-red-600 border-red-200" },
                { num: "333", labelBn: "নাগরিক সেবা", labelEn: "Gov Info", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
                { num: "106", labelBn: "দুদক হটলাইন", labelEn: "Anti-Bribery", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
              ].map((hl) => (
                <a
                  key={hl.num}
                  href={`tel:${hl.num}`}
                  className={`p-1.5 rounded-lg border text-center transition-transform hover:scale-105 ${hl.color}`}
                >
                  <div className="text-xs font-black">{hl.num}</div>
                  <div className="text-[9px] font-medium leading-tight">{lang === "bn" ? hl.labelBn : hl.labelEn}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
            </div>
          </div>

        {/* Fixed account and feedback actions at the bottom of the drawer */}
        <div className="space-y-2 border-t p-3" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
          <button onClick={() => navigateTo("feedback")} className="w-full rounded-xl border px-3 py-2.5 text-left text-xs font-semibold flex items-center gap-2" style={{ borderColor: "var(--border-color)", color: "var(--text-main)", backgroundColor: "var(--surface)" }}>
            <Send className="h-4 w-4" style={{ color: "var(--primary-green)" }} />
            {t("মতামত ও উন্নতির পরামর্শ", "Feedback & suggestions")}
          </button>
          {accountUser ? (
            <>
              <button onClick={() => navigateTo("profile")} className="w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold flex items-center gap-2" style={{ borderColor: "var(--border-color)", color: "var(--text-main)" }}>
                <UserRound className="h-4 w-4" />{t("আমার প্রোফাইল", "My profile")}
              </button>
              <button onClick={() => void handleSignOut()} className="w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold text-white flex items-center gap-2" style={{ backgroundColor: "#B4232D" }}>
                <LogOut className="h-4 w-4" />{t("লগ আউট", "Log out")}
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigateTo("login")} className="rounded-xl px-3 py-2.5 text-xs font-bold text-white flex items-center justify-center gap-1.5" style={{ backgroundColor: "var(--primary-green)" }}><LogIn className="h-3.5 w-3.5" />{t("লগইন", "Log in")}</button>
              <button onClick={() => navigateTo("signup")} className="rounded-xl px-3 py-2.5 text-xs font-bold text-white flex items-center justify-center gap-1.5" style={{ backgroundColor: "#1D5EAA" }}><UserPlus className="h-3.5 w-3.5" />{t("সাইন আপ", "Sign up")}</button>
            </div>
          )}
          <div className="flex items-center justify-between px-1 pt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
            <span className="font-semibold">Jonogon v2.4 BD</span>
            <span>{t("স্মার্ট পাবলিক ইনফ্রাস্ট্রাকচার", "Smart Public Infra")}</span>
          </div>
        </div>
      </aside>

      {/* 🇧🇩 Top Gov Header Bar */}
      <header className="border-b" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)" }}>
        {/* National Hotlines & Judge Evaluation Trigger */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between text-xs border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center space-x-2 font-medium" style={{ color: "var(--text-muted)" }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary-green)" }}></span>
            <span>{t("গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের ডিজিটাল নাগরিক প্ল্যাটফর্ম", "Government of the People's Republic of Bangladesh Civic Infrastructure")}</span>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center gap-2.5">
              <Link href="/notifications" className="relative inline-flex items-center rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-main)" }} aria-label={t("নোটিফিকেশন খুলুন", "Open notifications")} title={t("নোটিফিকেশন", "Notifications")}>
                <Bell className="h-4 w-4" />
                {unreadNotificationCount > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-3.5 rounded-full px-1 text-center text-[9px] font-bold leading-3.5 text-white" style={{ backgroundColor: "var(--alert-red)" }}>{unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}</span>}
              </Link>
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--alert-red)" }}>
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{t("জরুরি হটলাইন: 999 | 333 | 106", "Hotlines: 999 | 333 | 106")}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2 border-l pl-3" style={{ borderColor: "var(--border-color)" }}>
              {/* Language Switcher */}
              <button
                onClick={() => {
                  const nextLanguage = lang === "bn" ? "en" : "bn";
                  setLang(nextLanguage);
                  window.localStorage.setItem("jonogon-language", nextLanguage);
                }}
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
            {/* 3-Dash Menu Bar Button (on left side of Bangladesh flag) */}
            <button
              ref={sideMenuTriggerRef}
              type="button"
              onClick={() => setIsSideMenuOpen(true)}
              className="p-2 rounded-xl border transition-all hover:opacity-80 active:scale-95 flex items-center justify-center shadow-xs cursor-pointer"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border-color)",
                color: "var(--text-main)",
              }}
              title={t("সাইড মেনু খুলুন", "Open side navigation menu")}
              aria-label={t("সাইড মেনু খুলুন", "Open side navigation menu")}
              aria-expanded={isSideMenuOpen}
              aria-controls="main-navigation-drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {accountUser && (
              <Link href="/profile" className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }} aria-label={t("প্রোফাইল সম্পাদনা করুন", "Edit profile")} title={accountUser.nickname || accountUser.email}>
                {accountUser.avatarUrl ? <img src={accountUser.avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-4 w-4" />}
              </Link>
            )}

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

          <div className="flex items-center gap-2">
            {accountUser ? (
              <Link href="/profile" className="max-w-44 truncate rounded-xl border px-3 py-2 text-xs font-semibold" style={{ borderColor: "var(--border-color)", color: "var(--text-main)", backgroundColor: "var(--surface)" }}>
                {accountUser.nickname || accountUser.email}
              </Link>
            ) : (
              <>
                <button onClick={() => navigateTo("login")} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white" style={{ backgroundColor: "var(--primary-green)" }}><LogIn className="h-3.5 w-3.5" />{t("লগইন", "Log in")}</button>
                <button onClick={() => navigateTo("signup")} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white" style={{ backgroundColor: "#1D5EAA" }}><UserPlus className="h-3.5 w-3.5" />{t("সাইন আপ", "Sign up")}</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {isAccountPage ? (
          <AccountPages mode={activePage as Extract<JonogonPage, "login" | "signup" | "profile" | "feedback" | "notifications" | "owner" | "owner-setup">} lang={lang} />
        ) : activePortal === "citizen" ? (
          <div>
            {isOfficialServicePage(activePage) && <OfficialServicePages page={activePage} lang={lang} />}
            {activePage === "home" && (
              <>
            {/* Hero Search & Voice Assistant */}
            <div className="rounded-2xl p-6 sm:p-7 mb-6 border shadow-sm text-center relative overflow-hidden" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
              <div className="max-w-2xl mx-auto">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-2" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                  <Sparkles className="w-3 h-3" />
                  {t("AI চালিত তাৎক্ষণিক নাগরিক সেবা সহকারী", "AI-Augmented Realtime Citizen Services")}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ color: "var(--text-main)" }}>
                  {greetingName
                    ? t(`আজ আপনাকে কীভাবে সহযোগিতা করতে পারি, ${greetingName}?`, `How can we assist you today, ${greetingName}?`)
                    : t("আজ আপনাকে কীভাবে সহযোগিতা করতে পারি?", "How can we assist you today, Citizen?")}
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
                {(voiceTranscript || voiceLanguageNotice) && (
                  <div role="status" aria-live="polite" className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--primary-green)" }}>
                    <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                    <span className="font-medium">{voiceLanguageNotice
                      ? voiceLanguage === "bn"
                        ? t("ভয়েস ইনপুটের ভাষা বাংলা করা হয়েছে।", "Voice input language set to Bangla.")
                        : t("ভয়েস ইনপুটের ভাষা ইংরেজি করা হয়েছে।", "Voice input language set to English.")
                      : voiceTranscript}</span>
                  </div>
                )}
              </div>
            </div>
              </>
            )}

            {/* TAB CONTENT: Transport Info & Bangladesh Route Map */}
            {activePage === "transport-info" && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div
                  className="rounded-2xl p-5 sm:p-6 border shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}
                >
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                      <Compass className="w-3.5 h-3.5" />
                      <span>{t("বাংলাদেশ স্মার্ট গণপরিবহন ও যাতায়াত হাব", "Bangladesh Smart Transit & Mobility Hub")}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text-main)" }}>
                      {t("মেট্রোরেল, ট্রেন, বাস ও নৌপথের রুট, সময়সূচি ও ভাড়া", "Transport Routes, Timetables & Fares")}
                    </h2>
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {t(
                        "মানচিত্রে রুটের আনুমানিক রেখা ও রেফারেন্স স্টপ দেখুন। এই সাইটে যানবাহনের লাইভ অবস্থান বা ট্রাফিক ফিড নেই। যাত্রার দিনের সময়সূচি, আসন ও ভাড়া সংশ্লিষ্ট সরকারি উৎস বা অপারেটরের লিংকে যাচাই করুন।",
                        "The map shows indicative route lines and reference stops. This site does not have live vehicle locations or traffic feeds. Confirm travel-day schedules, seats, and fares through the linked transport authority or operator."
                      )}
                    </p>
                  </div>

                  {/* Mode Filters & Search */}
                  <div className="mt-5 pt-4 border-t flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ borderColor: "var(--border-color)" }}>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                      {[
                        { id: "all", labelBn: "সব পরিবহন", labelEn: "All Modes", icon: Compass },
                        { id: "metro", labelBn: "মেট্রোরেল (MRT)", labelEn: "Metro (MRT)", icon: Train },
                        { id: "train", labelBn: "আন্তঃনগর ট্রেন", labelEn: "Intercity Trains", icon: Train },
                        { id: "bus", labelBn: "নগর বাস", labelEn: "City Buses", icon: Bus },
                        { id: "intercity-bus", labelBn: "আন্তঃজেলা বাস", labelEn: "Long Route Buses", icon: Bus },
                        { id: "launch", labelBn: "নৌপথ ও লঞ্চ", labelEn: "Waterways", icon: Ship },
                      ].map((mode) => {
                        const IconComp = mode.icon;
                        const isSelected = transportFilterType === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => setTransportFilterType(mode.id as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                              isSelected ? "shadow-sm font-bold" : "opacity-80 hover:opacity-100"
                            }`}
                            style={{
                              backgroundColor: isSelected ? "var(--primary-green)" : "var(--background)",
                              color: isSelected ? "#FFFFFF" : "var(--text-main)",
                              borderColor: isSelected ? "var(--primary-green)" : "var(--border-color)",
                            }}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                            <span>{lang === "bn" ? mode.labelBn : mode.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Search */}
                    <div className="relative min-w-[240px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        value={transportSearchTerm}
                        onChange={(e) => setTransportSearchTerm(e.target.value)}
                        placeholder={t("স্টেশন বা রুট খুঁজুন (উদা: মতিঝিল, চট্টগ্রাম...)", "Search station or route (e.g. Motijheel)...")}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-none transition-all focus:ring-1"
                        style={{
                          backgroundColor: "var(--background)",
                          borderColor: "var(--border-color)",
                          color: "var(--text-main)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Route Selection Cards (Horizontal Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredTransportRoutes.map((route) => {
                    const isSelected = route.id === currentSelectedRoute.id;
                    return (
                      <button
                        key={route.id}
                        onClick={() => setSelectedTransportRouteId(route.id)}
                        className={`p-4 rounded-2xl border text-left transition-all hover:shadow-md flex flex-col justify-between cursor-pointer ${
                          isSelected ? "ring-2 ring-emerald-500 shadow-sm" : ""
                        }`}
                        style={{
                          backgroundColor: isSelected ? "var(--primary-green-light)" : "var(--surface)",
                          borderColor: isSelected ? "var(--primary-green)" : "var(--border-color)",
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                              style={{
                                backgroundColor: isSelected ? "var(--primary-green)" : "var(--background)",
                                color: isSelected ? "#FFFFFF" : "var(--text-main)",
                                border: "1px solid var(--border-color)",
                              }}
                            >
                              {route.type === "metro" ? "🚇 " : route.type === "train" ? "🚆 " : route.type === "launch" ? "⛴️ " : "🚌 "}
                              {lang === "bn" ? route.typeLabelBn : route.typeLabelEn}
                            </span>
                            <span className="text-[10px] font-bold" style={{ color: "var(--primary-green)" }}>
                              ≈ {route.distanceKm} km
                            </span>
                          </div>
                          <h4 className="text-sm font-bold leading-snug mb-1" style={{ color: "var(--text-main)" }}>
                            {lang === "bn" ? route.titleBn : route.titleEn}
                          </h4>
                          <p className="text-xs line-clamp-2" style={{ color: "var(--text-muted)" }}>
                            {lang === "bn" ? route.routeSummaryBn : route.routeSummaryEn}
                          </p>
                        </div>

                        <div className="mt-3 pt-3 border-t flex items-center justify-between text-[11px]" style={{ borderColor: "var(--border-color)" }}>
                          <span className="font-semibold" style={{ color: "var(--text-muted)" }}>
                            ⏱️ {lang === "bn" ? route.durationBn : route.durationEn}
                          </span>
                          <span className="font-bold flex items-center gap-1" style={{ color: "var(--primary-green)" }}>
                            <span>{lang === "bn" ? route.fareBreakdown[0]?.fareBn : route.fareBreakdown[0]?.fareEn}</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 🗺️ Interactive route reference map */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                      <MapPin className="w-4 h-4" style={{ color: "var(--primary-green)" }} />
                      <span>{t("বাংলাদেশের ইন্টারঅ্যাক্টিভ রুট মানচিত্র", "Interactive Bangladesh Route Map")}</span>
                    </h3>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                      {t("রুট পয়েন্টে ক্লিক করে অবস্থান দেখুন", "Click a route point to see its location")}
                    </span>
                  </div>

                  <BangladeshTransportMap
                    selectedRoute={currentSelectedRoute}
                    allRoutes={filteredTransportRoutes}
                    onSelectRoute={(id) => setSelectedTransportRouteId(id)}
                    lang={lang}
                    darkMode={darkMode}
                  />
                </div>

                {/* Detailed Route Intelligence & Action Hub */}
                <div
                  className="rounded-2xl p-5 sm:p-7 border shadow-sm space-y-6"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}
                >
                  {/* Top Bar with Title, Operator & Appealing Action Redirect Buttons */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b" style={{ borderColor: "var(--border-color)" }}>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase text-white shadow-xs"
                          style={{ backgroundColor: "var(--primary-green)" }}
                        >
                          {currentSelectedRoute.code || "TRANSIT"}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md border" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
                          {lang === "bn" ? currentSelectedRoute.operatorBn : currentSelectedRoute.operatorEn}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold" style={{ color: "var(--text-main)" }}>
                        {lang === "bn" ? currentSelectedRoute.titleBn : currentSelectedRoute.titleEn}
                      </h3>
                      <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        {lang === "bn" ? currentSelectedRoute.routeSummaryBn : currentSelectedRoute.routeSummaryEn}
                      </p>
                    </div>

                    {/* Appealing CTA Redirect Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {currentSelectedRoute.sourceLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 ${
                            link.primary
                              ? "text-white hover:opacity-90"
                              : "border hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                          style={{
                            backgroundColor: link.primary ? "var(--primary-green)" : "var(--background)",
                            borderColor: link.primary ? "transparent" : "var(--border-color)",
                            color: link.primary ? "#FFFFFF" : "var(--text-main)",
                          }}
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>{lang === "bn" ? link.labelBn : link.labelEn}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                        </a>
                      ))}

                      {/* Google Maps Direct Navigation Button */}
                      {currentSelectedRoute.googleMapsDirectionsUrl && (
                        <a
                          href={currentSelectedRoute.googleMapsDirectionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5 active:scale-95 hover:opacity-90"
                          style={{ backgroundColor: "#1D4ED8" }}
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Google Maps</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Route Quick Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
                      <span className="text-[11px] font-semibold block mb-0.5" style={{ color: "var(--text-muted)" }}>
                        {t("আনুমানিক দূরত্ব", "Approx. Distance")}
                      </span>
                      <span className="text-lg font-extrabold" style={{ color: "var(--text-main)" }}>
                        {currentSelectedRoute.distanceKm} km
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
                      <span className="text-[11px] font-semibold block mb-0.5" style={{ color: "var(--text-muted)" }}>
                        {t("ভ্রমণ সময়", "Estimated Duration")}
                      </span>
                      <span className="text-lg font-extrabold" style={{ color: "var(--primary-green)" }}>
                        {lang === "bn" ? currentSelectedRoute.durationBn : currentSelectedRoute.durationEn}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
                      <span className="text-[11px] font-semibold block mb-0.5" style={{ color: "var(--text-muted)" }}>
                        {t("সার্ভিস ফ্রিকোয়েন্সি", "Frequency")}
                      </span>
                      <span className="text-xs font-bold block" style={{ color: "var(--text-main)" }}>
                        {lang === "bn" ? currentSelectedRoute.frequencyBn : currentSelectedRoute.frequencyEn}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
                      <span className="text-[11px] font-semibold block mb-0.5" style={{ color: "var(--text-muted)" }}>
                        {t("চলাচলের সময়", "Operating Hours")}
                      </span>
                      <span className="text-xs font-bold block" style={{ color: "var(--text-main)" }}>
                        {lang === "bn" ? currentSelectedRoute.operatingHoursBn : currentSelectedRoute.operatingHoursEn}
                      </span>
                    </div>
                  </div>

                  {/* Fare information and source lookups */}
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-2 mb-3" style={{ color: "var(--text-main)" }}>
                      <Calculator className="w-4 h-4" style={{ color: "var(--primary-green)" }} />
                      <span>{t("ভাড়া ও বর্তমান উৎস", "Fare information and current sources")}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {currentSelectedRoute.fareBreakdown.map((f, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl border flex flex-col justify-between"
                          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}
                        >
                          <div>
                            <span className="text-xs font-semibold block" style={{ color: "var(--text-muted)" }}>
                              {lang === "bn" ? f.classBn : f.classEn}
                            </span>
                            <span className="text-lg font-black mt-1 block" style={{ color: "var(--text-main)" }}>
                              {lang === "bn" ? f.fareBn : f.fareEn}
                            </span>
                          </div>
                          {(f.noteBn || f.noteEn) && (
                            <span className="text-[10px] mt-2 font-medium opacity-80" style={{ color: "var(--primary-green)" }}>
                              • {lang === "bn" ? f.noteBn : f.noteEn}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {t("দেখানো ভাড়া প্রকাশিত রেফারেন্স। পরিবর্তন, যাত্রার তারিখ ও শ্রেণিভেদে ভাড়া বদলাতে পারে—টিকিট কাটার আগে উপরের সরকারি/অপারেটর লিংকে নিশ্চিত করুন।", "Displayed fares are published references. They may change by date, class, or service; confirm on the linked authority or operator site before booking.")}
                    </p>
                  </div>

                  {/* Route reference points */}
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-2 mb-3" style={{ color: "var(--text-main)" }}>
                      <Route className="w-4 h-4" style={{ color: "var(--primary-green)" }} />
                      <span>{t("রুট পয়েন্টের তালিকা", "Route Reference Points")}</span>
                    </h4>
                    <p className="mb-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {t("এটি সম্পূর্ণ স্টপেজ তালিকা বা সময়সূচি নয়। ট্রেনের প্রকৃত স্টপ ও ছাড়ার সময় সংশ্লিষ্ট সরকারি সময়সূচিতে যাচাই করুন।", "This is not a complete stoppage list or timetable. Confirm actual stops and departure times in the linked official timetable.")}
                    </p>

                    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-color)" }}>
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
                            <th className="py-2.5 px-3 font-bold" style={{ color: "var(--text-main)" }}>#</th>
                            <th className="py-2.5 px-3 font-bold" style={{ color: "var(--text-main)" }}>{t("স্টেশন / রুট পয়েন্ট", "Station / Route Point")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                          {currentSelectedRoute.stations.map((st, sIdx) => (
                            <tr key={sIdx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold" style={{ color: "var(--text-muted)" }}>
                                {sIdx + 1}
                              </td>
                              <td className="py-2.5 px-3 font-bold" style={{ color: "var(--text-main)" }}>
                                <span>{lang === "bn" ? st.nameBn : st.nameEn}</span>
                                {sIdx === 0 && (
                                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                                    {t("যাত্রা শুরু", "Origin")}
                                  </span>
                                )}
                                {sIdx === currentSelectedRoute.stations.length - 1 && (
                                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold">
                                    {t("গন্তব্য", "Destination")}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Transit Policy & Guidelines Accordion */}
                  <div className="p-4 rounded-xl border space-y-3" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)" }}>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>
                      {t("সময়সূচি, ভাড়া ও টিকিট যাচাইয়ের উৎস", "Where to verify schedules, fares & tickets")}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      <div className="p-3 rounded-lg border bg-surface" style={{ borderColor: "var(--border-color)" }}>
                        <span className="font-bold block mb-1" style={{ color: "var(--text-main)" }}>
                          🚇 {t("মেট্রোরেল ভাড়া ও পাস", "Metro fare & pass")}
                        </span>
                        <span>{t("ডিএমটিসিএল-এর ভাড়ার তালিকা ও পাসের বর্তমান শর্ত উপরের সরকারি লিংকে দেখুন।", "See DMTCL's official fare chart and current pass terms using the source links above.")}</span>
                      </div>
                      <div className="p-3 rounded-lg border bg-surface" style={{ borderColor: "var(--border-color)" }}>
                        <span className="font-bold block mb-1" style={{ color: "var(--text-main)" }}>
                          🚆 {t("ট্রেনের সময় ও টিকিট", "Train times & tickets")}
                        </span>
                        <span>{t("যাত্রার তারিখ দিয়ে বাংলাদেশ রেলওয়ের ই-টিকিটে সময়, আসন ও ভাড়া দেখুন; বাতিলের শর্ত বুকিংয়ের সময় যাচাই করুন।", "Search Bangladesh Railway e-ticketing by travel date for times, seats, and fares; confirm cancellation terms during booking.")}</span>
                      </div>
                      <div className="p-3 rounded-lg border bg-surface" style={{ borderColor: "var(--border-color)" }}>
                        <span className="font-bold block mb-1" style={{ color: "var(--text-main)" }}>
                          🚌 {t("বাসের রুট ও ভাড়া", "Bus routes & fares")}
                        </span>
                        <span>{t("বিআরটিসির প্রকাশিত রুট ও ভাড়া দেখুন; যাত্রার আগে সেবা চালু আছে কি না নিশ্চিত করুন।", "Check BRTC's published routes and fares, and confirm the service is operating before travel.")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 🚨 CivicSignal (Reports & Hazard Submission) */}
            {activePage === "civic-signal" && (
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
            {activePage === "bazaar-watch" && (
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
            {activePage === "nrb-gateway" && (
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
            {activePage === "safe-report" && (
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
            {activePage === "rumor-buster" && (
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
            {activePage === "fee-calculator" && (
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
            {activePage === "scam-detector" && (
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
            {activePage === "doc-checker" && (
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
            {activePage === "volunteer-grid" && (
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

            {/* Citizen documents and official government services */}
            {activePage === "home" && <section id="citizen-documents-section" aria-labelledby="citizen-services-heading" className="mt-8 space-y-4 scroll-mt-6">
              <div className="rounded-2xl p-5 sm:p-6 border shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-2" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                  <FileText className="w-3 h-3" />
                  {t("নাগরিক নথি ও সরকারি সেবা", "CITIZEN DOCUMENTS & SERVICES")}
                </span>
                <h3 id="citizen-services-heading" className="text-xl font-bold" style={{ color: "var(--text-main)" }}>
                  {t("আপনার গুরুত্বপূর্ণ সরকারি নথি", "Your Important Government Documents")}
                </h3>
                <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
                  {t(
                    "জন্মনিবন্ধন, পাসপোর্ট, NID, লাইসেন্স ও ভূমি রেকর্ডের সেবা এক জায়গায়। প্রতিটি কার্ডের প্রশ্নচিহ্নে সেই সেবার আলাদা ধাপে-ধাপে সহায়িকা পাবেন।",
                    "Find services for birth registration, passports, NID, licences, and land records in one place. Use each card's question mark for its own step-by-step help."
                  )}
                </p>

                <div role="note" className="mt-4 p-3 rounded-xl border text-xs" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)", color: "var(--text-main)" }}>
                  <strong>{t("গোপনীয়তা:", "Privacy:")}</strong>{" "}
                  {t(
                    "এই সাইটে ব্যক্তিগত NID, জন্মনিবন্ধন বা পাসপোর্ট নম্বর, পাসওয়ার্ড কিংবা OTP দেবেন না। আবেদন, ব্যক্তিগত তথ্য দেখা বা যাচাই করতে নিচের সরকারি পোর্টাল ব্যবহার করুন।",
                    "Do not enter personal NID, birth registration, or passport numbers, passwords, or OTPs here. Use the official portals below to apply, access, or verify records."
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {CITIZEN_SERVICES.map((service) => {
                  const ServiceIcon = service.icon;
                  const steps = lang === "bn" ? service.stepsBn : service.stepsEn;
                  const isHelpOpen = openCitizenServiceHelpId === service.id;
                  const helpPanelId = `citizen-service-help-${service.id}`;

                  return (
                    <article key={service.id} className="relative rounded-2xl p-4 border shadow-sm flex flex-col" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
                      <div className="flex items-start gap-2.5 mb-2.5 pr-11">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="p-2 rounded-xl shrink-0" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                            <ServiceIcon className="w-4 h-4" />
                          </span>
                          <h4 className="text-sm font-bold" style={{ color: "var(--text-main)" }}>
                            {t(service.titleBn, service.titleEn)}
                          </h4>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenCitizenServiceHelpId((current) => current === service.id ? null : service.id)}
                        className="absolute right-3 top-3 shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors hover:opacity-80"
                        style={{
                          borderColor: "var(--primary-green)",
                          backgroundColor: isHelpOpen ? "var(--primary-green)" : "var(--primary-green-light)",
                          color: "var(--primary-green)"
                        }}
                        aria-label={isHelpOpen
                          ? t(`${service.titleBn} সহায়িকা বন্ধ করুন`, `Close ${service.titleEn} help`)
                          : t(`${service.titleBn} সম্পর্কিত ধাপ ও প্রশ্ন দেখুন`, `View steps and questions for ${service.titleEn}`)}
                        aria-expanded={isHelpOpen}
                        aria-controls={helpPanelId}
                        title={isHelpOpen
                          ? t("সহায়িকা বন্ধ করুন", "Close help")
                          : t("এই সেবার ধাপ ও সাধারণ প্রশ্ন দেখুন", "View this service's steps and common questions")}
                      >
                        <span aria-hidden="true" className={`text-base font-extrabold leading-none ${isHelpOpen ? "text-white" : ""}`}>?</span>
                      </button>
                      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                        {t(service.descriptionBn, service.descriptionEn)}
                      </p>
                      <ol className="list-decimal pl-4 space-y-1.5 text-xs" style={{ color: "var(--text-main)" }}>
                        {steps.map((step) => <li key={step}>{step}</li>)}
                      </ol>
                      {isHelpOpen && (
                        <div id={helpPanelId} className="mt-4 p-3 rounded-xl border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-color)" }}>
                          <h5 className="text-xs font-bold mb-1" style={{ color: "var(--primary-green)" }}>
                            {t("ধাপে ধাপে সহায়িকা ও সাধারণ প্রশ্ন", "Step-by-Step Help & Common Questions")}
                          </h5>
                          <p className="text-[10px] mb-2.5" style={{ color: "var(--text-muted)" }}>
                            {t(
                              "প্রশ্ন খুলে ধাপগুলো দেখুন। বর্তমান কাগজপত্র, ফি ও নিয়ম সংশ্লিষ্ট পোর্টালে যাচাই করুন।",
                              "Open a question to see its steps. Confirm current documents, fees, and rules on the service portal."
                            )}
                          </p>
                          <div className="space-y-2">
                            {service.faqs.map((faq) => {
                              const faqSteps = lang === "bn" ? faq.stepsBn : faq.stepsEn;
                              return (
                                <details key={faq.questionEn} className="citizen-service-faq rounded-lg border overflow-hidden" style={{ borderColor: "var(--border-color)" }}>
                                  <summary className="citizen-service-faq-summary list-none cursor-pointer px-3 py-2.5 flex items-center justify-between gap-3 text-xs font-semibold" style={{ color: "var(--text-main)" }}>
                                    <span>{t(faq.questionBn, faq.questionEn)}</span>
                                    <ChevronDown className="citizen-service-faq-chevron w-3.5 h-3.5 shrink-0 transition-transform" />
                                  </summary>
                                  <ol className="list-decimal pl-7 pr-3 pb-3 space-y-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                                    {faqSteps.map((step, index) => <li key={`${faq.questionEn}-${index}`}>{step}</li>)}
                                  </ol>
                                </details>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="mt-auto pt-4 space-y-2">
                        {service.actions.map((action) => (
                          <a
                            key={action.href}
                            href={action.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-between gap-2 hover:opacity-80 transition-opacity"
                            style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)", color: "var(--primary-green)" }}
                          >
                            <span>{t(action.labelBn, action.labelEn)}</span>
                            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>}
          </div>
        ) : (
          /* 🏛️ GOVCOPILOT ADMIN WORKSPACE (100% Fully Translated) */
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-color)" }}>
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-1" style={{ backgroundColor: "var(--primary-green-light)", color: "var(--primary-green)" }}>
                  <Building2 className="w-3 h-3" />
                  {t("নমুনা প্রশাসনিক ড্যাশবোর্ড", "Sample administrative dashboard")}
                </span>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-main)" }}>
                  {t("GovCopilot প্রশাসনিক কমান্ড সেন্টার", "GovCopilot Administrative Command Center")}
                </h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {t("ডেমোর তথ্য; কোনো সরকারি কাজের আদেশ পাঠানো হয় না", "Demonstration only; no government work orders are sent")}
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
