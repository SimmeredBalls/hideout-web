import { createClient } from "@/lib/supabase/server";
import UsersClient from "./users-client";

export default async function UsersPage() {
  const supabase = await createClient();

  // Fetching from the VIEW we created to get the email field
  const { data: users, error } = await supabase
    .from("user_management_view")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return <div className="p-10 text-red-500 font-mono">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">User Management</h1>
          <p className="text-zinc-500 font-medium">Verified Accounts & Staff Roles</p>
        </div>
      </div>
      
      <UsersClient initialUsers={users || []} />
    </div>
  );
}