import { Suspense } from "react";
import JonogonApp from "../../components/JonogonApp";

async function CitizenServicePageContent({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  return <JonogonApp key={serviceId} initialPage="citizen-service" initialServiceId={serviceId} />;
}

export default function CitizenServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center" role="status" aria-label="Loading service">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-current border-r-transparent" />
        </main>
      }
    >
      <CitizenServicePageContent params={params} />
    </Suspense>
  );
}
