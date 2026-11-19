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
]);

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!publicPages.has(section as JonogonPage)) notFound();
  return <JonogonApp initialPage={section as JonogonPage} />;
}
