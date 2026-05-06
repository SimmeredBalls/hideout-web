"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteRoom({ id, roomNumber }: { id: string; roomNumber: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (confirm(`CRITICAL: Remove Node ${roomNumber} from physical inventory?`)) {
      
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", id);
      
      if (error) {
        alert("ACCESS_DENIED: This node has active links (bookings/logs). Suggestion: Switch status to 'MAINTENANCE' instead.");
      } else {
        router.refresh();
      }
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      className="text-red-500/40 hover:text-red-500 text-[9px] font-black uppercase tracking-widest px-2 py-1 hover:bg-red-500/10 rounded transition-all duration-200"
    >
      Delete Room
    </button>
  );
}