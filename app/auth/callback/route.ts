import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code || !isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login?auth=confirmation-failed", request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    return NextResponse.redirect(new URL("/login?auth=confirmation-failed", request.url));
  }

  return NextResponse.redirect(new URL("/profile?auth=confirmed", request.url));
}
