import { Suspense } from "react";
import { notFound } from "next/navigation";
import JonogonApp, { type JonogonPage } from "../components/JonogonApp";

const publicPages = new Set<JonogonPage>([
  "transport-info",
  "civic-signal",
  "bazaar-watch",
  "safe-report",
  "rumor-buster",
  "nrb-gateway",
  "fee-calculator",
  "doc-checker",
  "scam-detector",
  "volunteer-grid",
  "govcopilot",
  "login",
  "signup",
  "profile",
  "feedback",
  "notifications",
  "government-complaint",
  "marriage-divorce",
  "lost-document",
  "document-mismatch",
  "rejection-explainer",
]);

async function SectionPageContent({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!publicPages.has(section as JonogonPage)) notFound();
  return <JonogonApp initialPage={section as JonogonPage} />;
}

export default function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center" role="status" aria-label="Loading service">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-current border-r-transparent" />
        </main>
      }
    >
      <SectionPageContent params={params} />
    </Suspense>
  );
}
