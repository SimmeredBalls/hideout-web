"use client";

import { useState, useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation"; // Added useRouter
import { createClient } from "@/lib/supabase/client"; 
import UpdateRoomStatus from "@/components/admin/update-room-status";

export default function RoomsClient({ initialRooms }: { initialRooms: any[] }) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // REAL-TIME SUBSCRIPTION
  useEffect(() => {
    const channel = supabase
      .channel("live-room-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" }, // Listen for room status changes
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" }, // Listen for check-in status changes
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const filteredRooms = initialRooms.filter((room) =>
    room.room_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">Live Room Status</h1>
          <p className="text-sm text-zinc-500 italic font-medium">
            Real-time occupancy monitoring for front-desk and housekeeping.
          </p>
        </div>
        
        <input 
          type="text"
          placeholder="Filter by room number..."
          className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-green-500/40 outline-none transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredRooms.map((room) => {
          // Look specifically for a booking that is currently CHECKED_IN
          const activeBooking = room.bookings?.find((b: any) => b.status === "CHECKED_IN") || null;
          const hasActiveBooking = !!activeBooking;
          const guestName = activeBooking?.profiles?.full_name || activeBooking?.walk_in_name;

          return (
            <div 
              key={room.id} 
              className={`group relative min-h-[190px] rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col p-5 shadow-lg ${
                room.status === 'AVAILABLE' ? 'border-green-500/20 bg-zinc-900/50' : 
                room.status === 'OCCUPIED' ? 'border-red-500/30 bg-zinc-900/50' : 
                'border-yellow-500/20 bg-zinc-900/50'
              }`}
            >
              {/* Background Image Layer */}
              <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                {room.display_image ? (
                  <img 
                    src={room.display_image} 
                    alt="" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-950" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
              </div>

              <div className="relative z-10 flex justify-between items-center mb-3">
                <span className="text-4xl font-black font-mono tracking-tighter text-white drop-shadow-md">
                  {room.room_number}
                </span>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                    room.status === 'AVAILABLE' ? 'bg-green-500' : 
                    room.status === 'OCCUPIED' ? 'bg-red-500' : 
                    'bg-yellow-500'
                }`} />
              </div>

              <div className="relative z-10 flex-grow mb-4">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-1.5">
                  {room.type_name}
                </p>

                <div className="min-h-[42px] flex flex-col justify-center">
                  {room.status === 'OCCUPIED' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-1 duration-500">
                      <p className="text-[9px] text-red-500/80 uppercase font-black tracking-tight mb-0.5">Guest In-House:</p>
                      <p className="text-[13px] text-white font-bold truncate leading-none tracking-tight">
                        {guestName || "Manual Entry Guest"}
                      </p>
                    </div>
                  ) : room.status === 'CLEANING' ? (
                    <p className="text-[11px] text-yellow-500 font-bold uppercase tracking-tight italic">Housekeeping Required</p>
                  ) : room.status === 'MAINTENANCE' ? (
                    <p className="text-[11px] text-orange-600 font-bold uppercase tracking-tight italic">Out of Service</p>
                  ) : (
                    <p className="text-[11px] text-green-500/80 font-black uppercase tracking-tight">Ready for Guest</p>
                  )}
                </div>
              </div>
              
              <div className="relative z-10 pt-4 mt-auto border-t border-white/5">
                <UpdateRoomStatus 
                  roomId={room.id} 
                  currentStatus={room.status} 
                  hasActiveBooking={hasActiveBooking} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}