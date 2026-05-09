// components/admin/admin-sidebar-identity.tsx
import { createClient } from "@/lib/supabase/server";
import { User, ShieldCheck } from "lucide-react";

export default async function AdminSidebarIdentity() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user?.id)
    .single();

  return (
    <>
      <div className="mb-6 flex items-start gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
        <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-md">
          <User className="h-4 w-4 text-blue-500" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-[10px] font-black text-white uppercase truncate">
            {profile?.full_name || "Operator_Unknown"}
          </span>
          <span className="text-[8px] font-mono text-emerald-500 flex items-center gap-1 uppercase">
            <ShieldCheck className="h-2.5 w-2.5" /> {profile?.role || "GUEST"}
          </span>
        </div>
      </div>
      <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-1">
        Node: {user?.id.slice(0, 8) || "00000000"}
      </p>
    </>
  );
}