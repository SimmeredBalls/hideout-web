"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const supabase = createClient();
  const [data, setData] = useState<any>({
    rooms: [],
    totalRegistered: 0,
    todayRevenue: 0,
    arrivals: [],
    inHouseCount: 0,
    pendingBookings: [],
    // Removed the internal loading boolean to let loading.tsx handle it
  });

  const fetchDashboardData = useCallback(async () => {
    // Correct local date calculation for Philippine Time (UTC+8)
    const now = new Date();
    const offset = 8 * 60; 
    const phTime = new Date(now.getTime() + (offset + now.getTimezoneOffset()) * 60000);
    const today = phTime.toISOString().split('T')[0];

    try {
      const [roomsRes, profilesRes, paymentsRes, arrivalsRes, inHouseRes, pendingRes] = await Promise.all([
        supabase.from("rooms").select("*"),
        supabase.from("profiles").select("*", { count: "exact" }).eq("role", "GUEST"),
        supabase.from("payments").select("amount").gte("created_at", today),
        supabase.from("bookings").select(`*, rooms(status)`).eq("check_in_date", today).eq("status", "CONFIRMED"),
        supabase.from("bookings").select("*", { count: "exact" }).eq("status", "CHECKED_IN"),
        supabase.from("bookings").select(`
          *,
          profiles:guest_id (full_name),
          room_types:rooms(room_types(name))
        `).eq("status", "PENDING").order('created_at', { ascending: false })
      ]);

      setData({
        rooms: roomsRes.data || [],
        totalRegistered: profilesRes.count || 0,
        todayRevenue: paymentsRes.data?.reduce((sum, p) => sum + p.amount, 0) || 0,
        arrivals: arrivalsRes.data || [],
        inHouseCount: inHouseRes.count || 0,
        pendingBookings: pendingRes.data || [],
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDashboardData();

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchDashboardData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchDashboardData]);

  // Derived Statistics
  const totalRooms = data.rooms.length;
  const availableRooms = data.rooms.filter((r: any) => r.status === 'AVAILABLE').length;
  const cleaningCount = data.rooms.filter((r: any) => r.status === 'CLEANING').length;
  const pendingCount = data.pendingBookings.length;
  const turnoverPressure = data.arrivals.filter((a: any) => a.rooms?.status === 'CLEANING').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Command Center</h1>
          <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em]">Live Operations Control</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Today's Revenue</p>
          <p className="text-2xl font-black text-emerald-400">₱{data.todayRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Pending Requests" 
          value={pendingCount} 
          color={pendingCount > 0 ? "text-orange-500" : "text-zinc-600"} 
          subtitle={pendingCount > 0 ? "Action Required" : "System Clear"} 
          isAlert={pendingCount > 0}
        />
        <StatCard title="In-House" value={data.inHouseCount} color="text-purple-400" subtitle="Active Occupancy" />
        <StatCard title="Arrivals" value={data.arrivals.length} color="text-blue-400" subtitle="Today's Schedule" />
        <StatCard title="Available" value={availableRooms} total={totalRooms} color="text-emerald-400" subtitle="Ready for Check-in" />
        <StatCard 
          title="To Clean" 
          value={cleaningCount} 
          color={turnoverPressure > 0 ? "text-red-500" : "text-yellow-500"} 
          subtitle={turnoverPressure > 0 ? "Priority Turnover" : "Routine Ops"}
          isAlert={turnoverPressure > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Approval Queue */}
        <div className="lg:col-span-1 p-6 border border-zinc-800 rounded-2xl bg-zinc-900/40 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-white">Approval Queue</h2>
            <div className="flex items-center gap-1.5">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
            </div>
          </div>

          {pendingCount === 0 ? (
            <div className="py-10 text-center border border-dashed border-zinc-800 rounded-xl">
               <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">No Pending Data</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.pendingBookings.map((booking: any) => (
                <div key={booking.id} className="p-4 border border-zinc-800 bg-zinc-950/50 rounded-xl hover:border-zinc-600 transition-colors cursor-default">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-black text-white truncate max-w-[120px]">
                      {booking.profiles?.full_name || "GUEST"}
                    </p>
                    <span className="text-[10px] font-black text-emerald-500">₱{booking.total_price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                      {new Date(booking.check_in_date).toLocaleDateString()} Arrival
                    </p>
                    <span className="text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-black uppercase">Pending</span>
                  </div>
                </div>
              ))}
              <a href="/admin/bookings" className="block text-center py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-all mt-4 border border-zinc-700">
                Open Full Registry
              </a>
            </div>
          )}
        </div>

        {/* Housekeeping & Operations */}
        <div className="lg:col-span-1 p-6 border border-zinc-800 rounded-2xl bg-zinc-900/40 backdrop-blur-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-white mb-6">Operations Status</h2>
          {cleaningCount === 0 ? (
            <p className="text-sm text-zinc-500 italic py-4">All sectors maintained.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 text-xl font-black">
                   {cleaningCount}
                </div>
                <div>
                   <p className="text-xs font-black text-white uppercase tracking-tight">Units Awaiting Service</p>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase">Maintenance Queue</p>
                </div>
              </div>
              
              {turnoverPressure > 0 && (
                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">High Priority Alert</p>
                  <p className="text-[11px] text-red-200/70 leading-tight">
                    {turnoverPressure} arrivals scheduled for units currently in 'CLEANING' status. Redirect housekeeping to these units immediately.
                  </p>
                </div>
              )}
              <a href="/admin/rooms" className="inline-block text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest mt-2">
                Launch Room Manager →
              </a>
            </div>
          )}
        </div>

        {/* System Shortcuts */}
        <div className="flex flex-col gap-4">
            <div className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/40 backdrop-blur-sm">
                <h2 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4">Network Reach</h2>
                <div className="flex items-end justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Database Profiles</span>
                    <span className="text-2xl font-black text-white tracking-tighter">{data.totalRegistered}</span>
                </div>
            </div>

            <div className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/40 backdrop-blur-sm flex flex-col gap-3">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Internal Links</h2>
                <ShortcutLink href="/admin/payments" title="Financial Ledger" />
                <ShortcutLink href="/admin/bookings" title="Booking Manifest" />
                <ShortcutLink href="/admin/inventory" title="Hardware Audit" />
            </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, total, color, subtitle, isAlert }: { title: string, value: any, total?: number, color: string, subtitle?: string, isAlert?: boolean }) {
  return (
    <div className={`p-6 border rounded-3xl bg-zinc-900/40 relative overflow-hidden group transition-all duration-500 ${isAlert ? 'border-zinc-700 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'border-zinc-800'}`}>
      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.2em]">{title}</p>
      <div className="flex items-baseline gap-1.5 mt-2">
        <span className={`text-4xl font-black tracking-tighter ${color} ${isAlert ? 'animate-pulse' : ''}`}>{value}</span>
        {total !== undefined && <span className="text-zinc-700 font-black text-lg">/ {total}</span>}
      </div>
      {subtitle && <p className="text-[9px] font-bold text-zinc-600 uppercase mt-1.5 tracking-tight">{subtitle}</p>}
      
      {/* Subtle Background Glow for Alerts */}
      {isAlert && <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-red-500/5 blur-3xl rounded-full"></div>}
    </div>
  );
}

function ShortcutLink({ href, title }: { href: string, title: string }) {
  return (
    <a href={href} className="flex items-center justify-center p-3 bg-zinc-950/50 hover:bg-emerald-500/5 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all text-zinc-400">
      {title}
    </a>
  );
}