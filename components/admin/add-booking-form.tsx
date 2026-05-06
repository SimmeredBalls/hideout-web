"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AddBookingForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const today = new Date().toISOString().split("T")[0];

  // Form State
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(""); 
  const [walkInName, setWalkInName] = useState(""); // NEW: For walk-in guests
  const [guests, setGuests] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [guestSearch, setGuestSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "GUEST");
      setGuests(data || []);
    }
    if (isOpen) loadData();
  }, [isOpen]);

  useEffect(() => {
    if (checkIn && checkOut) fetchAvailableRooms();
  }, [checkIn, checkOut]);

    async function fetchAvailableRooms() {
    setLoading(true);
    
    // 1. Find rooms that have overlapping bookings for those dates
    const { data: busy } = await supabase
        .from("bookings")
        .select("room_id")
        .filter("status", "in", '("CONFIRMED", "CHECKED_IN")')
        .lt("check_in_date", checkOut)
        .gt("check_out_date", checkIn);

    const busyIds = busy?.map(b => b.room_id) || [];

    // 2. Fetch rooms that are NOT busy AND are physically 'AVAILABLE'
    let query = supabase
        .from("rooms")
        .select(`*, room_types(name, base_price)`)
        .eq("status", "AVAILABLE"); // <--- ONLY SHOW PHYSICALLY CLEAN/READY ROOMS

    if (busyIds.length > 0) {
        query = query.not("id", "in", `(${busyIds.join(",")})`);
    }
    
    const { data: free } = await query;
    setAvailableRooms(free || []);
    setLoading(false);
    }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const room = availableRooms.find(r => r.id === selectedRoom);
    const nights = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24);
    const total = (room?.room_types?.base_price || 0) * nights;

    // Build the payload dynamically
    const bookingData: any = {
      room_id: selectedRoom,
      check_in_date: checkIn,
      check_out_date: checkOut,
      total_price: total,
      status: "CONFIRMED"
    };

    // Logical Switch: If guest is selected, use ID. Otherwise, use walk-in name.
    if (selectedGuest) {
      bookingData.guest_id = selectedGuest;
    } else {
      bookingData.walk_in_name = walkInName;
    }

    const { error } = await supabase.from("bookings").insert([bookingData]);

    if (error) alert(error.message);
    else {
      setIsOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
        + New Booking
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-lg text-white">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Create Reservation</h2>
            <form onSubmit={handleBooking} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-500 uppercase font-bold">Check In</label>
                  <input type="date" required min={today} className="w-full bg-zinc-800 p-2 rounded border border-zinc-700 text-sm" 
                    value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase font-bold">Check Out</label>
                  <input type="date" required min={checkIn || today} className="w-full bg-zinc-800 p-2 rounded border border-zinc-700 text-sm" 
                    value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
              </div>

                {/* GUEST SELECTION LOGIC */}
                <div className="space-y-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-800">
                <div>
                    <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">
                    Search Registered Guest
                    </label>
                    <div className="relative">
                    <input 
                        type="text"
                        placeholder="Type guest name..."
                        className="w-full bg-zinc-800 p-2 rounded border border-zinc-700 text-sm focus:border-blue-500 outline-none"
                        value={selectedGuest ? guests.find(g => g.id === selectedGuest)?.full_name : guestSearch}
                        onChange={(e) => {
                        setGuestSearch(e.target.value);
                        setSelectedGuest(""); // Clear selection while typing
                        }}
                        // Clear selection if they click the input again
                        onFocus={() => {
                        if (selectedGuest) {
                            setGuestSearch("");
                            setSelectedGuest("");
                        }
                        }}
                    />
                    
                    {/* Search Results Dropdown */}
                    {guestSearch.length > 0 && !selectedGuest && (
                        <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                        {guests
                            .filter(g => g.full_name.toLowerCase().includes(guestSearch.toLowerCase()))
                            .map(g => (
                            <button
                                key={g.id}
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm hover:bg-blue-600 transition-colors border-b border-zinc-700/50 last:border-none"
                                onClick={() => {
                                setSelectedGuest(g.id);
                                setGuestSearch(g.full_name);
                                setWalkInName(""); // Clear walk-in
                                }}
                            >
                                {g.full_name}
                            </button>
                            ))}
                        {guests.filter(g => g.full_name.toLowerCase().includes(guestSearch.toLowerCase())).length === 0 && (
                            <p className="p-3 text-xs text-zinc-500 italic">No guests found. Use Walk-in below.</p>
                        )}
                        </div>
                    )}
                    </div>
                </div>

                {!selectedGuest && !guestSearch && (
                    <div className="pt-2 border-t border-zinc-800">
                    <label className="text-xs text-zinc-500 uppercase font-bold text-blue-400">Walk-in Guest Name</label>
                    <input 
                        required 
                        placeholder="Enter Full Name"
                        className="w-full bg-zinc-800 p-2 rounded border border-blue-900/50 focus:border-blue-500 outline-none text-sm mt-1"
                        value={walkInName} 
                        onChange={(e) => setWalkInName(e.target.value)} 
                    />
                    </div>
                )}
                </div>

              {/* ROOM PICKER GRID */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs text-zinc-500 uppercase font-bold">Select Room (Ready & Available)</label>
                  {selectedRoom && (
                    <span className="text-[10px] text-green-400 font-bold animate-pulse">
                      ✓ Room {availableRooms.find(r => r.id === selectedRoom)?.room_number} Selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 bg-black/20 rounded-xl border border-zinc-800 scrollbar-thin scrollbar-thumb-zinc-700">
                  {!checkIn || !checkOut ? (
                    <p className="col-span-4 text-[10px] text-zinc-500 text-center py-6 italic">
                      Please select dates to view available rooms.
                    </p>
                  ) : loading ? (
                    <p className="col-span-4 text-[10px] text-blue-400 text-center py-6 animate-pulse">
                      Checking availability...
                    </p>
                  ) : availableRooms.length === 0 ? (
                    <p className="col-span-4 text-[10px] text-red-400 text-center py-6">
                      No ready rooms available for these dates.
                    </p>
                  ) : (
                    availableRooms.map(room => (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => setSelectedRoom(room.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                          selectedRoom === room.id 
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400 ring-1 ring-blue-500' 
                            : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'
                        }`}
                      >
                        <span className="text-sm font-black font-mono">{room.room_number}</span>
                        <span className="text-[7px] uppercase font-bold tracking-tighter truncate w-full text-center">
                          {room.room_types.name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  disabled={!selectedRoom || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-500 p-3 rounded-xl font-bold transition-colors"
                >
                  Confirm Booking
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 p-3 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}