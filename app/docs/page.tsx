import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  Bot,
  Check,
  CircleHelp,
  Cloud,
  Database,
  Fingerprint,
  Globe2,
  Layers3,
  LockKeyhole,
  Mic,
  Search,
  ShieldCheck,
  TriangleAlert,
  Workflow,
} from "lucide-react";
import { getCloudflareCredentials } from "@/lib/cloudflare-ai";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Product & Technical Brief | Jonogon",
  description:
    "A transparent overview of Jonogon's citizen-service experience, AI architecture, data handling, and current product scope.",
};

const sections = [
  { id: "overview", label: "Overview" },
  { id: "product", label: "Product" },
  { id: "architecture", label: "Architecture" },
  { id: "ai", label: "AI & voice" },
  { id: "data", label: "Data & privacy" },
  { id: "scope", label: "Current scope" },
] as const;

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--primary-green)]">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)] sm:text-3xl">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--text-muted)] sm:text-base">{children}</p>
    </div>
  );
}

function StatusDot({ ready }: { ready: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-2.5 w-2.5 shrink-0 rounded-full ${ready ? "bg-emerald-500" : "bg-amber-500"}`}
    />
  );
}

async function RuntimeConfiguration() {
  await connection();
  const aiConfigured = Boolean(getCloudflareCredentials());
  const supabaseConfigured = isSupabaseConfigured();

  const checks = [
    {
      label: "AI chat & speech",
      detail: "Cloudflare account ID and AI token",
      ready: aiConfigured,
    },
    {
      label: "Accounts & saved data",
      detail: "Supabase project URL and publishable key",
      ready: supabaseConfigured,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {checks.map((check) => (
        <div
          key={check.label}
          className="flex items-start gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-4"
        >
          <StatusDot ready={check.ready} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--text-main)]">{check.label}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{check.detail}</p>
            <p className={`mt-2 text-xs font-semibold ${check.ready ? "text-emerald-700" : "text-amber-700"}`}>
              {check.ready ? "Configuration present" : "Configuration missing"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RuntimeConfigurationFallback() {
  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-label="Checking server configuration">
      {[0, 1].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]" />
      ))}
    </div>
  );
}

function ArchitectureNode({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof Search;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-4 sm:p-5">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary-green-light)] text-[var(--primary-green)]">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">{eyebrow}</p>
      <h3 className="mt-1 text-sm font-bold text-[var(--text-main)]">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{description}</p>
    </div>
  );
}

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-main)]">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group inline-flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary-green)]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--primary-green)] text-white">
              <Globe2 aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-extrabold leading-5">Jonogon</span>
              <span className="block text-[11px] text-[var(--text-muted)]">Product & technical brief</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--border-color)] px-3.5 py-2 text-xs font-semibold text-[var(--text-main)] transition hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-green)] sm:text-sm"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            <span>Back to Jonogon</span>
          </Link>
        </div>
      </header>

      <section id="overview" className="relative isolate overflow-hidden bg-[#073c2e] text-white">
        <div aria-hidden="true" className="absolute -right-28 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -right-8 -top-12 -z-10 h-[18rem] w-[18rem] rounded-full border border-white/10" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Live project brief
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Public services, easier to find and understand.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-emerald-50/85 sm:text-lg sm:leading-8">
              Jonogon brings Bangladesh public-service guides, practical next steps, and a bilingual AI assistant together in one mobile-friendly place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#073c2e] transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Explore the app <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <a href="#architecture" className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Read the architecture <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl shadow-black/10 backdrop-blur sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-100/70">Project at a glance</p>
                <h2 className="mt-1 text-lg font-bold">Built for everyday access</h2>
              </div>
              <Layers3 aria-hidden="true" className="h-6 w-6 text-emerald-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Languages", "Bangla + English"],
                ["Audience", "People in Bangladesh"],
                ["Access", "Web + mobile layouts"],
                ["Approach", "Guidance, not agency actions"],
              ].map(([label, value]) => (
                <div key={label} className="min-h-24 rounded-2xl border border-white/10 bg-black/10 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100/60">{label}</p>
                  <p className="mt-2 text-sm font-semibold leading-5 text-white">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-emerald-50/70">
              This brief distinguishes connected services from curated references and prototype screens.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12 lg:px-8 lg:py-14">
        <nav aria-label="Documentation sections" className="h-fit lg:sticky lg:top-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">On this page</p>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--primary-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-green)]">
                {section.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="min-w-0 space-y-16 sm:space-y-20">
          <section id="product" className="scroll-mt-8">
            <SectionHeading eyebrow="The product" title="One starting point for common citizen needs">
              Jonogon is designed to reduce the effort of finding the right public-service information. Visitors can browse step-by-step guides, search services, or ask a question in Bangla or English.
            </SectionHeading>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: BookOpen, title: "Service guides", text: "Curated bilingual steps and links for birth registration, passports, NID, driving licences, land records, police clearance, and tax services." },
                { icon: Search, title: "Search and chat", text: "Search the service catalogue or move into a separate chat page for a longer AI-assisted conversation." },
                { icon: Mic, title: "Voice input", text: "Record a question on supported browsers, review the transcribed text, then send it in the chat." },
              ].map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5">
                  <Icon aria-hidden="true" className="h-5 w-5 text-[var(--primary-green)]" />
                  <h3 className="mt-4 text-base font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{text}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="architecture" className="scroll-mt-8">
            <SectionHeading eyebrow="System architecture" title="A small web application with managed services">
              The browser talks to Jonogon’s Next.js application. AI credentials stay on the server, while Supabase handles sign-in and account-linked records.
            </SectionHeading>
            <div className="grid gap-3 md:grid-cols-3">
              <ArchitectureNode icon={Search} eyebrow="Experience" title="Next.js web app" description="App Router pages and React components provide the citizen interface, guides, search, and chat screens." />
              <ArchitectureNode icon={Workflow} eyebrow="Server routes" title="Jonogon API" description="Chat and audio are validated and sent server-side to Cloudflare Workers AI. Provider secrets are not sent to the browser." />
              <ArchitectureNode icon={Cloud} eyebrow="Hosted AI" title="Cloudflare Workers AI" description="Gemma handles chat replies; Whisper transcribes uploaded speech. Availability depends on credentials, quota, and provider health." />
            </div>
            <div className="my-3 hidden items-center justify-center gap-2 text-[var(--text-subtle)] md:flex" aria-hidden="true">
              <span className="h-px flex-1 bg-[var(--border-color)]" /><ArrowUpRight className="h-4 w-4" /><span className="h-px flex-1 bg-[var(--border-color)]" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <ArchitectureNode icon={Fingerprint} eyebrow="Identity" title="Supabase Auth" description="Email-based account sessions support profile settings and signed-in features." />
              <ArchitectureNode icon={Database} eyebrow="Account data" title="Supabase Postgres & Storage" description="Profiles, feedback, notifications, optional chat history, and profile avatars use Supabase policies and storage rules." />
            </div>
            <p className="mt-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-3 text-xs leading-5 text-[var(--text-muted)]">
              The docs page checks whether the required environment variables are present. This is a configuration check only; it does not test provider uptime or database connectivity.
            </p>
          </section>

          <section id="ai" className="scroll-mt-8">
            <SectionHeading eyebrow="AI and voice" title="One chat model, with recent conversation context">
              Chat requests use a single hosted model and a server-side instruction prompt. Speech is transcribed separately, and the visitor can review the transcript before sending it.
            </SectionHeading>
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary-green-light)] text-[var(--primary-green)]"><Bot aria-hidden="true" className="h-5 w-5" /></span>
                  <div><p className="text-xs font-semibold text-[var(--text-muted)]">Chat model</p><h3 className="text-sm font-bold">Gemma 4 26B A4B IT</h3></div>
                </div>
                <dl className="mt-5 space-y-3 text-xs">
                  {[
                    ["Provider", "Cloudflare Workers AI"],
                    ["Context sent", "Up to 16 messages; 24,000 characters total"],
                    ["Input cap", "6,000 characters per message"],
                    ["Response cap", "800 tokens"],
                    ["App rate limit", "10 requests per minute per function instance"],
                  ].map(([term, value]) => <div key={term} className="flex flex-col gap-1 border-t border-[var(--border-subtle)] pt-3 sm:flex-row sm:justify-between sm:gap-4"><dt className="font-semibold text-[var(--text-muted)]">{term}</dt><dd className="sm:text-right">{value}</dd></div>)}
                </dl>
              </article>
              <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-700"><AudioLines aria-hidden="true" className="h-5 w-5" /></span>
                  <div><p className="text-xs font-semibold text-[var(--text-muted)]">Speech transcription</p><h3 className="text-sm font-bold">Whisper via Workers AI</h3></div>
                </div>
                <dl className="mt-5 space-y-3 text-xs">
                  {[
                    ["Input", "Recorded audio uploaded to the server route"],
                    ["Recording limit", "Up to 45 seconds in the browser"],
                    ["Upload limit", "4 MB"],
                    ["App rate limit", "12 requests per 10 minutes per function instance"],
                    ["User control", "Review and edit the transcript before sending"],
                  ].map(([term, value]) => <div key={term} className="flex flex-col gap-1 border-t border-[var(--border-subtle)] pt-3 sm:flex-row sm:justify-between sm:gap-4"><dt className="font-semibold text-[var(--text-muted)]">{term}</dt><dd className="sm:text-right">{value}</dd></div>)}
                </dl>
              </article>
            </div>
            <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <TriangleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-xs leading-5">These app-level rate limits are held in function memory, so they are not a shared, durable quota across all server instances. Cloudflare and hosting limits also apply. Free-tier availability can change or run out.</p>
            </div>
            <div className="mt-5 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 sm:p-6">
              <h3 className="text-sm font-bold">Retrieval and orchestration</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">There is no RAG pipeline, vector database, embedding index, MCP integration, or agent framework. Service guides are curated application data; the chat receives recent conversation messages, not retrieved guide chunks.</p>
            </div>
          </section>

          <section id="data" className="scroll-mt-8">
            <SectionHeading eyebrow="Data and privacy" title="Clear boundaries around what the app does">
              Jonogon helps people understand likely next steps. It does not act as a government portal and cannot look up a citizen’s official records.
            </SectionHeading>
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 sm:p-6">
                <div className="flex items-center gap-3"><ShieldCheck aria-hidden="true" className="h-5 w-5 text-[var(--primary-green)]" /><h3 className="text-sm font-bold">Safety rules</h3></div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-muted)]">
                  <li className="flex gap-2"><Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />The assistant is instructed not to invent current fees, deadlines, laws, or official links.</li>
                  <li className="flex gap-2"><Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />It must not claim to submit applications, access government databases, or verify identity.</li>
                  <li className="flex gap-2"><Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />Visitors are told not to share NID, passport, birth-registration numbers, OTPs, or passwords.</li>
                </ul>
                <p className="mt-4 border-t border-[var(--border-subtle)] pt-4 text-xs leading-5 text-[var(--text-muted)]">These are prompt-level safeguards. Automated PII redaction, moderation, and output-validation pipelines are not currently implemented.</p>
              </article>
              <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-5 sm:p-6">
                <div className="flex items-center gap-3"><LockKeyhole aria-hidden="true" className="h-5 w-5 text-[var(--primary-green)]" /><h3 className="text-sm font-bold">Account and chat data</h3></div>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-muted)]">
                  <li>Chat messages are sent to Cloudflare Workers AI to generate replies.</li>
                  <li>Chat history stays in the browser by default. Signed-in visitors can opt in to account-linked history.</li>
                  <li>Supabase row-level security limits account records to their owner, with owner access for support records where configured.</li>
                  <li>Never enter sensitive identity numbers or account credentials in chat.</li>
                </ul>
              </article>
            </div>
          </section>

          <section id="scope" className="scroll-mt-8">
            <SectionHeading eyebrow="Current scope" title="What’s connected, what’s reference, and what’s a prototype">
              This status view is intentionally candid: some product surfaces are helpful guides or demos, not integrations with government systems.
            </SectionHeading>
            <div className="mb-4">
              <Suspense fallback={<RuntimeConfigurationFallback />}>
                <RuntimeConfiguration />
              </Suspense>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface)]">
              <div className="grid grid-cols-[minmax(115px,0.55fr)_minmax(0,1.45fr)] gap-4 border-b border-[var(--border-color)] bg-[var(--surface-hover)] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] sm:px-5">
                <span>Area</span><span>Current behavior</span>
              </div>
              {[
                ["Service guides", "Curated Bangla and English guides with links to relevant official portals. Verify current requirements with the responsible authority."],
                ["Transport", "Route and fare references; no live vehicle location or traffic feed."],
                ["Accounts", "Supabase sign-in, profile, feedback, notifications, and optional chat history when configured."],
                ["Prototype tools", "Civic reports, market snapshots, calculators, document checks, and safety tools include sample or local demo behavior; they do not file cases with agencies or query live government systems."],
              ].map(([area, behavior]) => (
                <div key={area} className="grid grid-cols-[minmax(115px,0.55fr)_minmax(0,1.45fr)] gap-4 border-b border-[var(--border-subtle)] px-4 py-4 last:border-b-0 sm:px-5">
                  <p className="text-xs font-bold text-[var(--text-main)]">{area}</p>
                  <p className="text-xs leading-5 text-[var(--text-muted)]">{behavior}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-4">
              <CircleHelp aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary-green)]" />
              <p className="text-xs leading-5 text-[var(--text-muted)]">Government rules and service availability can change. Use Jonogon for orientation, then confirm details on the linked official portal or with the relevant office.</p>
            </div>
          </section>

          <footer className="flex flex-col gap-4 border-t border-[var(--border-color)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold">Jonogon</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">A simpler starting point for public-service information in Bangladesh.</p>
            </div>
            <Link href="/" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--primary-green)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-green-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-green)]">
              Open Jonogon <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </footer>
        </div>
      </div>
    </main>
  );
}
