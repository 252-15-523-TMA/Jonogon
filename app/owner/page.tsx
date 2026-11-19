import { Suspense } from "react";
import { redirect } from "next/navigation";
import JonogonApp from "../components/JonogonApp";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

async function OwnerPageContent() {
  if (!isSupabaseConfigured()) return <JonogonApp initialPage="owner-setup" />;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims || typeof claims.sub !== "string") redirect("/login?next=/owner");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", claims.sub)
    .maybeSingle();
  if (error || profile?.role !== "owner") redirect("/");

  return <JonogonApp initialPage="owner" />;
}

export default function OwnerPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center" role="status" aria-label="Checking owner access">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-current border-r-transparent" />
        </main>
      }
    >
      <OwnerPageContent />
    </Suspense>
  );
}
