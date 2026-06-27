import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Use the Host header to redirect back to wherever the user came from,
  // avoiding 0.0.0.0 when the server is bound to all interfaces.
  const host = request.headers.get("host") || "localhost:3001";
  return NextResponse.redirect(`http://${host}/`);
}
