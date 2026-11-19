"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, ExternalLink, Info, Search, ShieldCheck } from "lucide-react";

export type OfficialServicePage =
  | "government-complaint"
  | "marriage-divorce"
  | "lost-document"
  | "document-mismatch"
  | "rejection-explainer";

type Language = "bn" | "en";

const links = {
  grs: "https://grs.gov.bd/",
  grsStatus: "https://grs.gov.bd/suggestion.do",
  grsManual: "https://grs.gov.bd/assets/grs_user_manual.pdf",
  marriage: "https://marriage.gov.bd/",
  marriageManual: "https://marriage.gov.bd/docs/CRVS_User_Manual.pdf",
  childMarriageLaw: "https://bdlaws.minlaw.gov.bd/act-print-1207.html",
  nid: "https://services.nidw.gov.bd/nid-pub/",
  nidFaq: "https://services.nidw.gov.bd/nid-pub/faq?tab=faq-correction",
  birth: "https://bdris.gov.bd/",
  birthCorrection: "https://bdris.gov.bd/br/correction",
  passport: "https://www.epassport.gov.bd/",
  passportForm: "https://www.epassport.gov.bd/api/v1/registrations/download-offline-form",
  brta: "https://bsp.brta.gov.bd/?lan=en",
  land: "https://land.gov.bd/",
};

const copy = (lang: Language, en: string, bn: string) => lang === "bn" ? bn : en;

function OfficialLink({ href, title, lang }: { href: string; title: string; lang: Language }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white transition hover:brightness-95" style={{ backgroundColor: "var(--primary-green)" }}>
      {title}<ExternalLink className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{copy(lang, "(opens in a new tab)", "(নতুন ট্যাবে খুলবে)")}</span>
    </a>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)" }}><h3 className="mb-3 text-base font-bold" style={{ color: "var(--text-main)" }}>{title}</h3><div className="space-y-2 text-sm leading-6" style={{ color: "var(--text-muted)" }}>{children}</div></section>;
}

function StepList({ items }: { items: string[] }) {
  return <ol className="list-decimal space-y-2 pl-5">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ol>;
}

function Notice({ children }: { children: ReactNode }) {
  return <div className="flex gap-3 rounded-xl border p-3 text-sm leading-6" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)", color: "var(--text-muted)" }}><Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--primary-green)" }} /><div>{children}</div></div>;
}

function GovernmentComplaint({ lang }: { lang: Language }) {
  const categories = [
    { id: "nid", label: copy(lang, "NID / Election Commission", "NID / নির্বাচন কমিশন"), office: copy(lang, "Start with the responsible Election Commission or NID office. The GRS portal lets you select the relevant office and service.", "দায়িত্বপ্রাপ্ত নির্বাচন কমিশন বা NID অফিস দিয়ে শুরু করুন। GRS পোর্টালে সংশ্লিষ্ট দপ্তর ও সেবা নির্বাচন করা যায়।") },
    { id: "birth", label: copy(lang, "Birth registration", "জন্মনিবন্ধন"), office: copy(lang, "Contact the local birth and death registrar that holds the record; use BDRIS for registration services. If unresolved, choose the responsible office in GRS.", "যে স্থানীয় জন্ম ও মৃত্যু নিবন্ধকের কাছে রেকর্ড আছে, সেখানে যোগাযোগ করুন; নিবন্ধন সেবার জন্য BDRIS ব্যবহার করুন। সমাধান না হলে GRS-এ দায়িত্বপ্রাপ্ত দপ্তর বেছে নিন।") },
    { id: "passport", label: copy(lang, "Passport / immigration", "পাসপোর্ট / ইমিগ্রেশন"), office: copy(lang, "Contact the Department of Immigration and Passports or the passport office handling the application.", "ইমিগ্রেশন ও পাসপোর্ট অধিদপ্তর অথবা আবেদনটি পরিচালনাকারী পাসপোর্ট অফিসে যোগাযোগ করুন।") },
    { id: "brta", label: copy(lang, "Driving licence / BRTA", "ড্রাইভিং লাইসেন্স / BRTA"), office: copy(lang, "Contact the relevant BRTA circle or select its office/service in GRS.", "সংশ্লিষ্ট BRTA সার্কেলে যোগাযোগ করুন অথবা GRS-এ তাদের দপ্তর/সেবা নির্বাচন করুন।") },
    { id: "land", label: copy(lang, "Land service", "ভূমি সেবা"), office: copy(lang, "Start with the office responsible for the land service (such as the relevant land office); use GRS to route a service complaint.", "ভূমি-সেবার দায়িত্বপ্রাপ্ত দপ্তরে (যেমন সংশ্লিষ্ট ভূমি অফিস) যোগাযোগ করুন; সেবা-সংক্রান্ত অভিযোগ পাঠাতে GRS ব্যবহার করুন।") },
    { id: "other", label: copy(lang, "Another government service", "অন্য সরকারি সেবা"), office: copy(lang, "Identify the office that delivered or is responsible for the service, then select that office in GRS.", "সেবা দিয়েছে বা সেবার দায়িত্বে আছে এমন দপ্তরটি শনাক্ত করে GRS-এ সেই দপ্তর নির্বাচন করুন।") },
  ];
  const [category, setCategory] = useState(categories[0].id);
  const selected = categories.find((item) => item.id === category) || categories[0];
  return <div className="space-y-4">
    <Card title={copy(lang, "Find the right authority", "সঠিক কর্তৃপক্ষ খুঁজুন")}>
      <label className="block space-y-2"><span className="font-semibold">{copy(lang, "What service is the complaint about?", "কোন সেবা নিয়ে অভিযোগ?")}</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border px-3 py-2.5" style={{ borderColor: "var(--border-color)", color: "var(--text-main)", backgroundColor: "var(--background)" }}>{categories.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
      <p className="rounded-xl p-3" style={{ backgroundColor: "var(--background)" }}>{selected.office}</p>
    </Card>
    <Card title={copy(lang, "Submit a complaint through GRS", "GRS-এ অভিযোগ জমা দিন")}>
      <StepList items={lang === "bn" ? [
        "GRS পোর্টালে আপনার সেবা/দপ্তর নির্বাচন করুন এবং অভিযোগের তারিখ, বিষয় ও বিস্তারিত লিখুন।",
        "প্রাসঙ্গিক আবেদন নম্বর, রসিদ বা সহায়ক নথি থাকলে সংযুক্ত করুন; সংবেদনশীল পরিচয়পত্র নম্বর অপ্রয়োজনীয়ভাবে দেবেন না।",
        "তথ্য যাচাই করে জমা দিন। প্রাপ্তি স্বীকার ও ট্র্যাকিং নম্বর সংরক্ষণ করুন।",
        "অগ্রগতি জানতে মোবাইল নম্বর ও ট্র্যাকিং নম্বর দিয়ে GRS-এর অভিযোগ-অবস্থা পাতা দেখুন।"
      ] : [
        "In GRS, choose the relevant service/office and enter the complaint date, subject, and details.",
        "Attach a relevant application reference, receipt, or supporting document if needed. Avoid adding sensitive ID numbers unless necessary.",
        "Review and submit. Save the acknowledgement and tracking number.",
        "Check progress on the GRS status page using the mobile number and tracking number."
      ]} />
      <div className="flex flex-wrap gap-2 pt-2"><OfficialLink href={links.grs} title={copy(lang, "Open GRS complaint portal", "GRS অভিযোগ পোর্টাল খুলুন")} lang={lang} /><OfficialLink href={links.grsStatus} title={copy(lang, "Track a complaint", "অভিযোগের অবস্থা দেখুন")} lang={lang} /><OfficialLink href={links.grsManual} title={copy(lang, "Read the GRS user manual", "GRS ব্যবহার নির্দেশিকা পড়ুন")} lang={lang} /></div>
    </Card>
    <Notice>{copy(lang, "GRS is for service-related grievances. It excludes matters pending in court, RTI requests, and issues with a separate statutory review or appeal route. The official portal gives the current handling and appeal process. Anonymous complaints may not support reliable status tracking. This site does not receive or submit your complaint.", "GRS সরকারি সেবা-সংক্রান্ত অভিযোগের জন্য। আদালতে বিচারাধীন বিষয়, তথ্য অধিকার আবেদন এবং আলাদা আইনগত পুনর্বিবেচনা/আপিল ব্যবস্থা থাকা বিষয় এর আওতার বাইরে। বর্তমান নিষ্পত্তি ও আপিল প্রক্রিয়া সরকারি পোর্টালে দেখুন। বেনামি অভিযোগ নির্ভরযোগ্যভাবে ট্র্যাক নাও করা যেতে পারে। এই ওয়েবসাইট আপনার অভিযোগ গ্রহণ বা জমা দেয় না।")}</Notice>
  </div>;
}

function MarriageDivorce({ lang }: { lang: Language }) {
  return <div className="space-y-4">
    <Card title={copy(lang, "Typical registration steps", "সাধারণ নিবন্ধন ধাপ")}>
      <StepList items={lang === "bn" ? [
        "নিজেদের ক্ষেত্রে প্রযোজ্য ব্যক্তিগত আইন এবং নিবন্ধকের এখতিয়ার নিশ্চিত করতে স্থানীয় অনুমোদিত বিবাহ/তালাক নিবন্ধকের সঙ্গে কথা বলুন।",
        "সরকারি CRVS পোর্টালে অ্যাকাউন্ট খুলে প্রয়োজনীয় পরিচয় ও যোগাযোগের তথ্য দিন; পোর্টালে আপনার সেবাটি চালু আছে কি না যাচাই করুন।",
        "নির্দেশনা অনুযায়ী পক্ষদের পরিচয়, ঠিকানা, ছবি, সাক্ষী এবং প্রযোজ্য আর্থিক/বিয়ের তথ্য প্রস্তুত রাখুন। নির্দিষ্ট তালিকা নিবন্ধকের কাছ থেকে নিশ্চিত করুন।",
        "আবেদন/নিবন্ধনের তথ্য নিবন্ধকের কাছে যাচাই করান, প্রযোজ্য ফি জেনে নিন এবং জমার রসিদ ও নিবন্ধনের কপি সংরক্ষণ করুন।",
        "তালাকের ক্ষেত্রে নোটিশ, সময়সীমা, কর্তৃপক্ষ ও প্রয়োজনীয় নথি প্রযোজ্য আইন অনুযায়ী ভিন্ন হতে পারে; নিবন্ধক বা আইনজীবীর কাছে আগে যাচাই করুন।"
      ] : [
        "Ask an authorised local marriage/divorce registrar which personal law applies and whether the registrar has jurisdiction for your case.",
        "Create an account on the official CRVS portal and provide the requested identity and contact details. Check that the relevant service is available there.",
        "Prepare the parties’ identity details, addresses, photographs, witnesses, and applicable financial or marriage details. Confirm the exact checklist with the registrar.",
        "Have the registrar verify the application/registration details, confirm any fee, and keep the receipt and registration copy.",
        "Divorce notices, deadlines, authorities, and documents vary by applicable law. Verify the process with the registrar or a lawyer first."
      ]} />
      <div className="flex flex-wrap gap-2 pt-2"><OfficialLink href={links.marriage} title={copy(lang, "Open Marriage & Divorce portal", "বিবাহ ও তালাক পোর্টাল খুলুন")} lang={lang} /><OfficialLink href={links.marriageManual} title={copy(lang, "Read citizen user manual", "নাগরিক নির্দেশিকা পড়ুন")} lang={lang} /><OfficialLink href={links.childMarriageLaw} title={copy(lang, "Read the 2017 law", "২০১৭ সালের আইন পড়ুন")} lang={lang} /></div>
    </Card>
    <Notice>{copy(lang, "The Child Marriage Restraint Act 2017 generally defines a male under 21 and a female under 18 as a minor for marriage. Its section 19 is a narrowly conditioned special provision involving court direction, guardian consent, and prescribed rules; it is not a general exception. Confirm current requirements with an authorised registrar. This guide is informational, not legal advice.", "বাল্যবিবাহ নিরোধ আইন, ২০১৭ অনুযায়ী সাধারণভাবে ২১ বছরের কম পুরুষ এবং ১৮ বছরের কম নারীকে বিয়ের ক্ষেত্রে অপ্রাপ্তবয়স্ক বলা হয়েছে। ১৯ ধারার বিশেষ বিধানটি আদালতের নির্দেশ, অভিভাবকের সম্মতি ও নির্ধারিত শর্তসাপেক্ষ; এটি সাধারণ ব্যতিক্রম নয়। অনুমোদিত নিবন্ধকের কাছে বর্তমান শর্ত যাচাই করুন। এই নির্দেশিকা আইনি পরামর্শ নয়।")}</Notice>
  </div>;
}

function LostDocument({ lang }: { lang: Language }) {
  const documents = [
    { title: "NID", steps: lang === "bn" ? ["NID পোর্টালে অ্যাকাউন্টে প্রবেশ করে হারানো/নষ্ট কার্ডের পুনঃইস্যুর নির্দেশনা দেখুন।", "প্রয়োজন হলে থানায় সাধারণ ডায়েরি (GD) করুন এবং পোর্টাল যে নথি চায় তা দিন।", "পুনঃইস্যুর আবেদন ও ফি-সংক্রান্ত সর্বশেষ নির্দেশনা NID পোর্টালে নিশ্চিত করুন; পরে তথ্য সংশোধন লাগলে আলাদা সংশোধন আবেদন করুন।"] : ["Sign in to the NID portal and open the reissue option for a lost or damaged card.", "If required, make a police General Diary (GD) and provide the evidence requested by the portal.", "Confirm current reissue and fee instructions on the NID portal. Apply separately for a correction if record details also need changing."], href: links.nid, extra: links.nidFaq },
    { title: copy(lang, "Birth certificate", "জন্মনিবন্ধন সনদ"), steps: lang === "bn" ? ["BDRIS-এ রেকর্ড খুঁজে পুনর্মুদ্রণ/সনদের আবেদন সুবিধা আছে কি না দেখুন।", "নাম, জন্মতারিখ বা অন্য তথ্য ভুল হলে পুনর্মুদ্রণের বদলে সংশোধন আবেদন করুন।", "আবেদন নম্বর দিয়ে অবস্থা দেখুন এবং স্থানীয় নিবন্ধকের নির্দেশনা অনুসরণ করুন।"] : ["Look up the record in BDRIS and check its certificate reprint/application service.", "If the name, date of birth, or another detail is wrong, use correction instead of reprinting.", "Track the application with its reference number and follow the local registrar’s instructions."], href: links.birth, extra: links.birthCorrection },
    { title: copy(lang, "Passport", "পাসপোর্ট"), steps: lang === "bn" ? ["হারানো বা চুরি হলে স্থানীয় থানায় GD করুন; GD নম্বর, তারিখ ও থানার তথ্য লিখে রাখুন।", "ই-পাসপোর্ট পোর্টাল বা পাসপোর্ট অফিসের নির্দেশনা অনুযায়ী পুনঃইস্যু আবেদন করুন এবং চাওয়া GD/সহায়ক নথি দিন।", "বর্তমান ফি, অ্যাপয়েন্টমেন্ট ও নথির তালিকা সরকারি পোর্টালে যাচাই করুন।"] : ["For a lost or stolen passport, file a police GD and keep its number, date, and station details.", "Apply for reissue using the e-passport portal or passport-office instructions and provide the requested GD/supporting documents.", "Check current fees, appointments, and document requirements on the official portal."], href: links.passport, extra: links.passportForm },
    { title: copy(lang, "Driving licence", "ড্রাইভিং লাইসেন্স"), steps: lang === "bn" ? ["BRTA Service Portal-এ প্রবেশ করে ডুপ্লিকেট/পুনঃইস্যু সেবাটি বেছে নিন।", "হারানো লাইসেন্সের ক্ষেত্রে BRTA-র নির্দেশনা অনুযায়ী GD ও ট্রাফিক ক্লিয়ারেন্সসহ প্রয়োজনীয় নথি দিন।", "ফি ও আবেদনের অবস্থা BSP-তে যাচাই করুন; পুরোনো ফি-তালিকার ওপর নির্ভর করবেন না।"] : ["Sign in to the BRTA Service Portal and select the duplicate/reissue service.", "For a lost licence, provide a GD and traffic clearance if required by BRTA, along with other requested documents.", "Check the current fee and application status in BSP rather than relying on an old fee list."], href: links.brta },
  ];
  return <div className="space-y-4">
    <Notice>{copy(lang, "Use only official portals. Do not post your NID, passport number, date of birth, passwords, or one-time codes in this guide or send them to unofficial agents.", "শুধু সরকারি পোর্টাল ব্যবহার করুন। এই নির্দেশিকায় NID/পাসপোর্ট নম্বর, জন্মতারিখ, পাসওয়ার্ড বা OTP দেবেন না এবং অননুমোদিত প্রতিনিধিকে পাঠাবেন না।")}</Notice>
    <div className="grid gap-3 lg:grid-cols-2">{documents.map((document) => <Card key={document.title} title={document.title}><StepList items={document.steps} /><div className="flex flex-wrap gap-2 pt-2"><OfficialLink href={document.href} title={copy(lang, "Open official service", "সরকারি সেবা খুলুন")} lang={lang} />{document.extra && <OfficialLink href={document.extra} title={copy(lang, "Related official instructions", "সংশ্লিষ্ট সরকারি নির্দেশনা")} lang={lang} />}</div></Card>)}</div>
  </div>;
}

function DocumentMismatch({ lang }: { lang: Language }) {
  const records = [
    { title: copy(lang, "Birth registration", "জন্মনিবন্ধন"), url: links.birthCorrection, text: copy(lang, "Start with the local registrar/BDRIS correction process. Parent-record corrections may need to be completed first; follow the portal’s current instructions.", "স্থানীয় নিবন্ধক/BDRIS সংশোধন প্রক্রিয়া দিয়ে শুরু করুন। বাবা-মায়ের রেকর্ডে সংশোধন আগে করা লাগতে পারে; পোর্টালের বর্তমান নির্দেশনা অনুসরণ করুন।") },
    { title: "NID", url: links.nidFaq, text: copy(lang, "Use the NID correction service and submit evidence that supports the correct information. If your NID was lost, complete reissue steps first where the portal requires it.", "NID সংশোধন সেবা ব্যবহার করে সঠিক তথ্যের প্রমাণ দিন। NID হারিয়ে গেলে পোর্টাল যেখানে বলে, আগে পুনঃইস্যুর ধাপ সম্পন্ন করুন।") },
    { title: copy(lang, "Passport", "পাসপোর্ট"), url: links.passport, text: copy(lang, "Ask the passport office which corrected source record and supporting evidence are needed before submitting a reissue or data-correction application.", "পুনঃইস্যু বা তথ্য-সংশোধনের আবেদন দেওয়ার আগে কোন সংশোধিত মূল নথি ও প্রমাণ লাগবে তা পাসপোর্ট অফিসে জেনে নিন।") },
  ];
  return <div className="space-y-4">
    <Card title={copy(lang, "Resolve a mismatch in a careful order", "ধাপে ধাপে নথির অমিল সমাধান করুন")}>
      <StepList items={lang === "bn" ? ["কোন নথিতে ভুল এবং কোন তথ্যটি প্রমাণসহ সঠিক তা নির্ধারণ করুন।", "জন্মনিবন্ধন, শিক্ষাগত/অন্যান্য প্রাথমিক প্রমাণের মতো নির্ভরযোগ্য উৎস নথির ভুল আগে সংশোধনের প্রয়োজন আছে কি না যাচাই করুন।", "প্রতিটি কর্তৃপক্ষের নিজস্ব সংশোধন আবেদন দিন; একটি নথি সংশোধন হলেই অন্য নথি স্বয়ংক্রিয়ভাবে বদলাবে ধরে নেবেন না।", "প্রাপ্তি রসিদ ও আবেদনের নম্বর রাখুন এবং অনুমোদনের পরই পরবর্তী নথিতে সংশোধনের আবেদন করুন।"] : ["Identify which record is wrong and what the correct value is, supported by evidence.", "Check whether the source record (for example, birth registration or another primary record) needs correction first.", "File a separate correction with each authority; do not assume one correction automatically updates other records.", "Keep receipts and application numbers. After an approved correction, use the updated record for the next application."]} />
    </Card>
    <div className="grid gap-3 lg:grid-cols-3">{records.map((record) => <Card key={record.title} title={record.title}><p>{record.text}</p><div className="pt-2"><OfficialLink href={record.url} title={copy(lang, "Correction information", "সংশোধন তথ্য")} lang={lang} /></div></Card>)}</div>
    <Notice>{copy(lang, "Do not enter or upload your personal identity documents here. This page only links to official correction procedures; it cannot edit or look up a government record.", "এখানে ব্যক্তিগত পরিচয়পত্র লিখবেন বা আপলোড করবেন না। এই পাতা শুধু সরকারি সংশোধন প্রক্রিয়ার লিংক দেয়; সরকারি রেকর্ড দেখা বা পরিবর্তন করতে পারে না।")}</Notice>
  </div>;
}

const rejectionRules = [
  { id: "missing", keys: ["missing", "incomplete", "attach", "document required", "অসম্পূর্ণ", "নথি জমা", "সংযুক্ত", "প্রয়োজনীয় কাগজ"], en: "A document may be missing or a required field may be incomplete.", bn: "কোনো নথি অনুপস্থিত বা আবশ্যক ঘর অসম্পূর্ণ থাকতে পারে।", nextEn: "Compare the notice with the official checklist, provide only the requested items, and submit a fresh/updated application as instructed.", nextBn: "নোটিশটি সরকারি তালিকার সঙ্গে মিলিয়ে শুধু চাওয়া নথি দিন এবং নির্দেশনা অনুযায়ী নতুন/হালনাগাদ আবেদন করুন।" },
  { id: "mismatch", keys: ["mismatch", "different", "does not match", "discrepancy", "ভিন্ন", "মিলছে না", "অমিল", "তথ্যের পার্থক্য"], en: "Details may not match across the application and supporting records.", bn: "আবেদন ও সহায়ক নথির তথ্যের মধ্যে অমিল থাকতে পারে।", nextEn: "Check spelling, dates, and ID details against the source records. Correct the underlying record first if needed, then apply again.", nextBn: "মূল নথির সঙ্গে বানান, তারিখ ও পরিচয়তথ্য মিলিয়ে দেখুন। প্রয়োজনে আগে মূল রেকর্ড সংশোধন করে তারপর আবেদন করুন।" },
  { id: "unclear", keys: ["unclear", "illegible", "blurry", "unreadable", "অস্পষ্ট", "পড়া যাচ্ছে না", "ঝাপসা"], en: "A scan or uploaded attachment may be difficult to read.", bn: "স্ক্যান বা আপলোড করা সংযুক্তি পড়তে অসুবিধা হতে পারে।", nextEn: "Use a clear, complete, unedited scan/photo in the format and size required by the portal.", nextBn: "পোর্টালের চাওয়া ফরম্যাট ও আকারে সম্পূর্ণ, স্পষ্ট এবং সম্পাদনাহীন স্ক্যান/ছবি দিন।" },
  { id: "payment", keys: ["payment", "fee", "transaction", "paid", "চালান", "ফি", "পেমেন্ট", "লেনদেন"], en: "Payment may be missing, pending, or not linked to the application.", bn: "ফি জমা হয়নি, প্রক্রিয়াধীন, বা আবেদনের সঙ্গে যুক্ত হয়নি হতে পারে।", nextEn: "Check the official payment receipt and application status. Avoid paying again until the portal confirms the first payment failed.", nextBn: "সরকারি পেমেন্ট রসিদ ও আবেদনের অবস্থা দেখুন। প্রথম পেমেন্ট ব্যর্থ হয়েছে নিশ্চিত না হওয়া পর্যন্ত আবার টাকা দেবেন না।" },
  { id: "eligibility", keys: ["eligible", "eligibility", "age", "qualification", "যোগ্য", "বয়স", "বয়স", "যোগ্যতা"], en: "An eligibility condition may not have been met or documented.", bn: "যোগ্যতার কোনো শর্ত পূরণ বা প্রমাণ করা হয়নি হতে পারে।", nextEn: "Read the current official eligibility criteria and ask the responsible office which evidence or review route applies.", nextBn: "বর্তমান সরকারি যোগ্যতার শর্ত পড়ুন এবং কোন প্রমাণ বা পুনর্বিবেচনা প্রক্রিয়া প্রযোজ্য তা দায়িত্বপ্রাপ্ত দপ্তরে জিজ্ঞেস করুন।" },
  { id: "verification", keys: ["verification", "pending", "under review", "verify", "যাচাই", "প্রক্রিয়াধীন", "প্রক্রিয়াধীন", "পর্যালোচনা"], en: "The application may still be under verification rather than finally rejected.", bn: "আবেদনটি চূড়ান্তভাবে বাতিল না হয়ে যাচাইাধীন থাকতে পারে।", nextEn: "Check the status page and wait for the stated service time. Contact the official office with your application reference if it exceeds that time.", nextBn: "অবস্থা পাতা দেখুন এবং উল্লেখিত সময় অপেক্ষা করুন। সময় পেরিয়ে গেলে আবেদন নম্বরসহ সরকারি দপ্তরে যোগাযোগ করুন।" },
  { id: "duplicate", keys: ["duplicate", "already exists", "previous application", "আগে আবেদন", "ডুপ্লিকেট", "পূর্বের আবেদন"], en: "A duplicate record or earlier application may have been detected.", bn: "একই রেকর্ড বা আগের আবেদন শনাক্ত হয়ে থাকতে পারে।", nextEn: "Check your existing application/record first and ask the authority whether you should update, continue, or request a correction instead.", nextBn: "আগের আবেদন/রেকর্ড আগে দেখুন; নতুন আবেদন, হালনাগাদ, নাকি সংশোধন করতে হবে তা কর্তৃপক্ষের কাছে জেনে নিন।" },
];

function RejectionExplainer({ lang }: { lang: Language }) {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<typeof rejectionRules>([]);
  const [error, setError] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const analyze = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const normalized = message.toLocaleLowerCase();
    const matches = rejectionRules.filter((rule) => rule.keys.some((key) => normalized.includes(key)));
    setResult(matches);
    setHasAnalyzed(true);
  };
  const loadFile = async (file?: File) => {
    setError("");
    if (!file) return;
    if (file.size > 200_000) {
      setError(copy(lang, "Choose a text file smaller than 200 KB.", "২০০ কিলোবাইটের ছোট টেক্সট ফাইল নির্বাচন করুন।"));
      return;
    }
    if (!/\.(txt|md|csv)$/i.test(file.name) && !file.type.startsWith("text/")) {
      setError(copy(lang, "For privacy, upload a text file (.txt, .md, or .csv) only.", "গোপনীয়তার জন্য শুধু টেক্সট ফাইল (.txt, .md বা .csv) আপলোড করুন।"));
      return;
    }
    setMessage(await file.text());
    setResult([]);
    setHasAnalyzed(false);
  };
  return <div className="space-y-4">
    <Card title={copy(lang, "Paste or load the rejection message", "বাতিলের বার্তা লিখুন বা ফাইল থেকে নিন")}>
      <form onSubmit={analyze} className="space-y-3">
        <label className="block space-y-2"><span className="font-semibold">{copy(lang, "Message text", "বার্তার লেখা")}</span><textarea required value={message} onChange={(event) => { setMessage(event.target.value); setResult([]); setHasAnalyzed(false); }} rows={7} maxLength={12000} placeholder={copy(lang, "Paste the non-sensitive wording of the notice…", "নোটিশের ব্যক্তিগত তথ্যবিহীন অংশ এখানে পেস্ট করুন…")} className="w-full rounded-xl border p-3" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--background)", color: "var(--text-main)" }} /></label>
        <label className="block space-y-2"><span className="font-semibold">{copy(lang, "Or choose a text file (up to 200 KB)", "অথবা টেক্সট ফাইল বেছে নিন (সর্বোচ্চ ২০০ KB)")}</span><input type="file" accept=".txt,.md,.csv,text/plain" onChange={(event) => void loadFile(event.target.files?.[0])} className="block w-full text-sm" /></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" className="inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: "var(--primary-green)" }}><Search className="h-4 w-4" />{copy(lang, "Explain possible reasons", "সম্ভাব্য কারণ দেখুন")}</button>
      </form>
    </Card>
    {result.length > 0 ? (
      <Card title={copy(lang, "Possible explanations and next steps", "সম্ভাব্য ব্যাখ্যা ও পরবর্তী ধাপ")}>
        <div className="space-y-3">
          {result.map((rule) => (
            <div key={rule.id} className="rounded-xl border p-3" style={{ borderColor: "var(--border-color)" }}>
              <p className="font-semibold" style={{ color: "var(--text-main)" }}>{copy(lang, rule.en, rule.bn)}</p>
              <p className="mt-1">{copy(lang, rule.nextEn, rule.nextBn)}</p>
            </div>
          ))}
        </div>
      </Card>
    ) : hasAnalyzed ? (
      <Card title={copy(lang, "No known phrase matched", "পরিচিত কোনো বাক্য মেলেনি")}>
        <p>{copy(lang, "The notice may use different wording. Read its instructions and contact the issuing authority through its official channel. This guide cannot determine the official reason.", "নোটিশে ভিন্ন ভাষা ব্যবহার হতে পারে। নির্দেশনা পড়ুন এবং সরকারি মাধ্যমে নোটিশ প্রদানকারী দপ্তরে যোগাযোগ করুন। এই নির্দেশিকা সরকারি কারণ নির্ধারণ করতে পারে না।")}</p>
      </Card>
    ) : null}
    <Notice>{copy(lang, "This is an offline keyword-based guide, not a hosted AI model or government decision. Text stays in this browser and is not uploaded or saved by this page. Remove names, ID numbers, addresses, application references, and other private details before using it. Verify every next step with the issuing authority.", "এটি অফলাইন কীওয়ার্ড-ভিত্তিক নির্দেশিকা; হোস্ট করা AI মডেল বা সরকারি সিদ্ধান্ত নয়। লেখাটি এই ব্রাউজারেই থাকে, পাতা থেকে আপলোড বা সংরক্ষণ করা হয় না। ব্যবহারের আগে নাম, ID নম্বর, ঠিকানা, আবেদন নম্বর ও ব্যক্তিগত তথ্য মুছে দিন। পরবর্তী পদক্ষেপ নোটিশ প্রদানকারী দপ্তরে যাচাই করুন।")}</Notice>
  </div>;
}

const pageInfo: Record<OfficialServicePage, { title: [string, string]; description: [string, string] }> = {
  "government-complaint": { title: ["Government Complaint & Grievance Assistant", "সরকারি অভিযোগ ও প্রতিকার সহায়িকা"], description: ["Find the responsible government office, learn the GRS submission steps, and track a complaint on the official portal.", "দায়িত্বপ্রাপ্ত সরকারি দপ্তর খুঁজুন, GRS-এ অভিযোগ দেওয়ার ধাপ জানুন এবং সরকারি পোর্টালে অবস্থা দেখুন।"] },
  "marriage-divorce": { title: ["Marriage & Divorce Registration", "বিবাহ ও তালাক নিবন্ধন"], description: ["Understand typical registration steps, document preparation, eligibility checks, and official sources.", "নিবন্ধনের সাধারণ ধাপ, নথি প্রস্তুতি, যোগ্যতা যাচাই ও সরকারি উৎস জানুন।"] },
  "lost-document": { title: ["Lost Document Recovery", "হারানো নথি পুনরুদ্ধার"], description: ["Follow official reissue and duplicate-document routes for NID, birth records, passports, and driving licences.", "NID, জন্মনিবন্ধন, পাসপোর্ট ও ড্রাইভিং লাইসেন্সের পুনঃইস্যু/ডুপ্লিকেটের সরকারি প্রক্রিয়া জানুন।"] },
  "document-mismatch": { title: ["Document Mismatch Resolver", "নথির তথ্যের অমিল সমাধান"], description: ["Plan a careful correction sequence across birth registration, NID, and passport records.", "জন্মনিবন্ধন, NID ও পাসপোর্টের তথ্য সংশোধনের ধাপ পরিকল্পনা করুন।"] },
  "rejection-explainer": { title: ["Rejection Reason Explainer", "আবেদন বাতিলের কারণ ব্যাখ্যা"], description: ["Review common rejection wording and see practical questions to check with the issuing authority.", "আবেদন বাতিলের সাধারণ বার্তা বুঝুন এবং সংশ্লিষ্ট দপ্তরে কী যাচাই করবেন জানুন।"] },
};

export default function OfficialServicePages({ page, lang }: { page: OfficialServicePage; lang: Language }) {
  const info = pageInfo[page];
  return <div className="mx-auto max-w-5xl space-y-5 pb-8" aria-labelledby="official-service-title">
    <header className="rounded-2xl border p-5 sm:p-7" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--surface)" }}>
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--primary-green)" }}><ShieldCheck className="h-4 w-4" />{copy(lang, "Bangladesh Citizen Service Guide", "বাংলাদেশ নাগরিক সেবা নির্দেশিকা")}</div>
      <h1 id="official-service-title" className="text-2xl font-extrabold sm:text-3xl" style={{ color: "var(--text-main)" }}>{copy(lang, info.title[0], info.title[1])}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: "var(--text-muted)" }}>{copy(lang, info.description[0], info.description[1])}</p>
    </header>
    {page === "government-complaint" && <GovernmentComplaint lang={lang} />}
    {page === "marriage-divorce" && <MarriageDivorce lang={lang} />}
    {page === "lost-document" && <LostDocument lang={lang} />}
    {page === "document-mismatch" && <DocumentMismatch lang={lang} />}
    {page === "rejection-explainer" && <RejectionExplainer lang={lang} />}
    <footer className="flex items-start gap-2 rounded-xl px-1 text-xs leading-5" style={{ color: "var(--text-muted)" }}><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{copy(lang, "Official services, eligibility, procedures, and fees can change. Confirm the latest instructions on the linked government portal or with the responsible office before applying.", "সরকারি সেবা, যোগ্যতা, প্রক্রিয়া ও ফি পরিবর্তিত হতে পারে। আবেদন করার আগে লিংক করা সরকারি পোর্টাল বা দায়িত্বপ্রাপ্ত দপ্তরে সর্বশেষ নির্দেশনা যাচাই করুন।")}</span></footer>
  </div>;
}
