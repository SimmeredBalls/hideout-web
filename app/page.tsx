import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, send them straight to the admin dashboard
  if (user) {
    return redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="max-w-2xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">
            Hideout<span className="text-blue-600">.</span>Web
          </h1>
          <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">
            Internal Management System v1.0
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm">
          <p className="text-zinc-400 mb-8 leading-relaxed">
            Welcome to the Hideout management portal. Please sign in to manage 
            room categories, monitor bookings, and update resort availability.
          </p>
          
          <Link 
            href="/admin" 
            className="inline-block w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-200 transition-all shadow-xl shadow-white/5"
          >
            Access Dashboard
          </Link>
        </div>

        <footer className="pt-12">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
            Authorized Personnel Only
          </p>
        </footer>
      </div>
    </main>
  );
}