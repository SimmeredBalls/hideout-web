import { Suspense } from "react";
import AdminSecurityWrapper from "@/components/admin/admin-security-wrapper";
import AdminLoading from "./loading";
import { LogoutButton } from "@/components/logout-button";
import { SidebarNav } from "@/components/admin/sidebar-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-black text-zinc-200 selection:bg-blue-500/30">
      {/* SIDEBAR - Technical Dashboard Style */}
      <aside className="w-72 border-r border-zinc-800 bg-zinc-950 flex flex-col relative">
        {/* Subtle Scanline Effect Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-0 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>

        <div className="p-8 z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-3 w-3 bg-blue-600 rounded-sm animate-pulse"></div>
            <h2 className="text-2xl font-black tracking-tighter text-white italic uppercase">
              Hideout
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-black">
              System Operations
            </p>
            <span className="h-[1px] flex-1 bg-zinc-800"></span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 z-10">
          <SidebarNav />
        </div>

        {/* System Info & Logout */}
        <div className="mt-auto p-6 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-10">
          <div className="mb-6 px-2">
             <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-1">Node: Master_Gateway_Pi4</p>
             <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-zinc-900 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 w-1/3"></div>
                </div>
                <span className="text-[8px] font-mono text-zinc-500 italic">SECURE</span>
             </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03] pointer-events-none"></div>

        <Suspense fallback={<AdminLoading />}>
          <AdminSecurityWrapper>
            <div className="max-w-7xl mx-auto p-8 lg:p-12 relative z-10">
              {children}
            </div>
          </AdminSecurityWrapper>
        </Suspense>
      </main>
    </div>
  );
}