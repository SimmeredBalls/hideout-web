"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface RoomFormProps {
  initialData?: {
    id: string;
    room_number: string;
    floor_level: number;
    room_type_id: string;
  };
}

export default function RoomForm({ initialData }: RoomFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState(initialData?.room_number || "");
  const [floorLevel, setFloorLevel] = useState(initialData?.floor_level || 1);
  const [roomTypeId, setRoomTypeId] = useState(initialData?.room_type_id || "");
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!initialData;

  // Ensure state updates if initialData changes (Fixes broken Edit UI)
  useEffect(() => {
    if (initialData) {
      setRoomNumber(initialData.room_number);
      setFloorLevel(initialData.floor_level);
      setRoomTypeId(initialData.room_type_id);
    }
  }, [initialData]);

  useEffect(() => {
    async function fetchTypes() {
      const { data } = await supabase.from("room_types").select("id, name");
      if (data) setRoomTypes(data);
    }
    if (isOpen) fetchTypes();
  }, [isOpen, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        room_number: roomNumber,
        floor_level: floorLevel,
        room_type_id: roomTypeId,
      };

      let error;
      if (isEditing && initialData) {
        const { error: err } = await supabase
          .from("rooms")
          .update(payload)
          .eq("id", initialData.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from("rooms")
          .insert([{ ...payload, status: "AVAILABLE" }]);
        error = err;
      }

      if (error) throw error;

      setIsOpen(false);
      if (!isEditing) {
        setRoomNumber("");
        setRoomTypeId("");
        setFloorLevel(1);
      }
      router.refresh();
    } catch (err: any) {
      console.error("Audit Write Error:", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className={isEditing 
          ? "text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-blue-500 transition-colors py-1 border-b border-zinc-800 hover:border-blue-500" 
          : "bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20"}
      >
        {isEditing ? "Modify Config" : "+ Register Node"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl w-full max-w-md text-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
            
            {/* Design Element */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter">
                  {isEditing ? "System Reconfig" : "Node Registration"}
                </h2>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">
                  {isEditing ? `Target: ID-${initialData?.id.slice(0,8)}` : "Manual Entry Protocol"}
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="h-8 w-8 flex items-center justify-center rounded-full bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
              >
                <span className="text-xs">✕</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Room Identifier</label>
                <input 
                  required 
                  placeholder="E.G. 101"
                  className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm font-bold uppercase tracking-widest focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
                  value={roomNumber} 
                  onChange={(e) => setRoomNumber(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Sector Category</label>
                <select 
                  required 
                  className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm font-bold uppercase tracking-widest focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer appearance-none"
                  value={roomTypeId} 
                  onChange={(e) => setRoomTypeId(e.target.value)}
                >
                  <option value="" className="text-zinc-600">-- SELECT SECTOR --</option>
                  {roomTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Elevation Level</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                  value={floorLevel} 
                  onChange={(e) => setFloorLevel(parseInt(e.target.value))} 
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Abort
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
                >
                  {isSubmitting ? "Processing..." : isEditing ? "Push Changes" : "Commit Node"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}