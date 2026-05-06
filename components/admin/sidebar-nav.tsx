"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client"; // Use your client-side supabase helper

export function SidebarNav() {
  const [role, setRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setRole(data?.role || 'GUEST');
      }
    }
    getRole();
  }, []);

  return (
    <nav className="flex flex-col gap-6 overflow-y-auto pr-2">
      {/* General Group */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-500 font-bold uppercase ml-1">General</p>
        <Link href="/admin" className="text-sm px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors">
          Dashboard Overview
        </Link>
      </div>

      {/* Operations Group */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-500 font-bold uppercase ml-1">Operations</p>
        <Link href="/admin/rooms" className="text-sm px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors">
          Live Room Status
        </Link>
        <Link href="/admin/bookings" className="text-sm px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors">
          Current Bookings
        </Link>
      </div>

      {/* Financials - Only for ADMIN */}
      {role === 'ADMIN' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-zinc-500 font-bold uppercase ml-1 text-blue-400">Financials</p>
          <Link href="/admin/payments" className="text-sm px-3 py-2 rounded-md hover:bg-blue-600/10 hover:text-blue-400 transition-colors">
            Payment Records
          </Link>
        </div>
      )}

      {/* Infrastructure - Only for ADMIN */}
      {role === 'ADMIN' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-zinc-500 font-bold uppercase ml-1 text-emerald-400">Infrastructure</p>
          <Link href="/admin/room-types" className="text-sm px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors">
            Room Categories
          </Link>
          <Link href="/admin/inventory" className="text-sm px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors">
            Room Inventory
          </Link>
        </div>
      )}

      {/* Administration - Only for ADMIN */}
      {role === 'ADMIN' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-zinc-500 font-bold uppercase ml-1">Administration</p>
          <Link href="/admin/users" className="text-sm px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors">
            Manage Accounts
          </Link>
        </div>
      )}
    </nav>
  );
}