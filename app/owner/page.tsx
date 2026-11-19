import { redirect } from "next/navigation";
import JonogonApp from "../components/JonogonApp";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function OwnerPage() {
  if (!isSupabaseConfigured()) return <JonogonApp initialPage="owner-setup" />;

  const supabase = await createClient();
  const { data: { claims } } = await supabase.auth.getClaims();
  if (!claims || typeof claims.sub !== "string") redirect("/login?next=/owner");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", claims.sub)
    .maybeSingle();
  if (error || profile?.role !== "owner") redirect("/");

  return <JonogonApp initialPage="owner" />;
}
