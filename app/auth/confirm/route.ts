import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  
  // After confirmation, we send them to a 'pending' page 
  // instead of the dashboard to wait for admin approval.
  const next = "/auth/pending";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // The session is now verified. 
      // Redirect them to the page explaining they need approval.
      redirect(next);
    } else {
      // If verification fails (expired link, etc.), send to error page
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Fallback for missing parameters
  redirect(`/auth/error?error=Invalid confirmation link`);
}