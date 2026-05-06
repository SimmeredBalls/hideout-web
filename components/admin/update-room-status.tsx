"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UpdateRoomStatus({ 
  roomId, 
  currentStatus, 
  hasActiveBooking = false 
}: { 
  roomId: string, 
  currentStatus: string,
  hasActiveBooking?: boolean 
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isLocked = currentStatus === 'OCCUPIED' && hasActiveBooking;

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("rooms")
      .update({ status: newStatus })
      .eq("id", roomId);

    if (error) {
      alert(error.message);
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 min-w-0">
      <div className="relative group">
        <select 
          key={currentStatus} // Forces re-render on status sync
          value={currentStatus}
          disabled={loading || isLocked}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={`text-[10px] font-bold py-1.5 px-3 rounded-lg border bg-zinc-950 uppercase outline-none transition-all flex-shrink-0 ${
            isLocked ? 'opacity-60 cursor-not-allowed border-zinc-800' : 'cursor-pointer hover:border-zinc-600'
          } ${
            currentStatus === 'AVAILABLE' ? 'text-green-400 border-green-900/50' : 
            currentStatus === 'OCCUPIED' ? 'text-red-400 border-red-900/50' : 
            'text-yellow-500 border-yellow-900/50'
          }`}
        >
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="CLEANING">Cleaning</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
        
        {isLocked && (
          <div className="absolute bottom-full mb-2 hidden group-hover:block w-44 p-2 bg-black text-[9px] text-zinc-400 rounded border border-zinc-800 z-50 shadow-2xl">
            Active booking found. Proceed to Checkout in the Reservations tab to unlock this room.
          </div>
        )}

        {currentStatus === 'OCCUPIED' && !hasActiveBooking && (
          <div className="absolute top-full mt-1 text-[8px] text-orange-500 font-bold uppercase tracking-tighter">
            Manual Override Enabled
          </div>
        )}
      </div>

      {currentStatus === 'CLEANING' && (
        <button
          onClick={() => handleStatusChange('AVAILABLE')}
          disabled={loading}
          className="text-[9px] bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-black uppercase tracking-tighter transition-all flex-shrink-0"
        >
          Mark as Ready
        </button>
      )}
    </div>
  );
}