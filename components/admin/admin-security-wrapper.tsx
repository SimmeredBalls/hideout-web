import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminSecurityWrapper({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN" && profile?.role !== "STAFF") {
    return redirect("/rooms");
  }

  return <>{children}</>;
}