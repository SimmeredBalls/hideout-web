// app/auth/confirm/route.ts
import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  
  // Update: Change default redirect to your admin dashboard
  const next = searchParams.get("next") ?? "/admin";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Success: Redirect to dashboard with a success message in the URL
      redirect(`${next}?message=Email verified successfully!`);
    } else {
      // Error: Redirect to your custom error page
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  redirect(`/auth/error?error=Missing authentication token`);
}