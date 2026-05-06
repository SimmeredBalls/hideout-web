"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { uploadRoomImage } from "@/lib/uploadImage";

export default function CategoryForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: 2,
    base_price: 0,
    amenities: ""
  });

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const { data: category, error: catError } = await supabase
        .from("room_types")
        .insert([{
          name: formData.name,
          capacity: formData.capacity,
          base_price: formData.base_price,
          amenities: formData.amenities.split(",").map(a => a.trim())
        }])
        .select()
        .single();

      if (catError) throw catError;

      if (files && files.length > 0) {
        const uploadPromises = Array.from(files).map(async (file, index) => {
          const url = await uploadRoomImage(file, 'categories');
          
          return supabase.from("room_type_images").insert({
            room_type_id: category.id,
            image_url: url,
            display_order: index
          });
        });

        await Promise.all(uploadPromises);
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("System Fault:", err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20"
      >
        + Define New Sector
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[100] backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2rem] w-full max-w-xl text-white shadow-2xl relative overflow-hidden">
            
            {/* Header / Meta */}
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Sector Definition</h2>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-1">Classification & Asset Registration</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 text-zinc-500 hover:text-white transition-colors border border-zinc-800"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Class Designation</label>
                <input 
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl text-sm font-bold uppercase tracking-widest focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-800"
                  placeholder="E.G. EXECUTIVE_TERMINAL"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Occupancy Limit</label>
                  <input 
                    type="number"
                    className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Daily Rate (PHP)</label>
                  <input 
                    type="number"
                    className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                    onChange={(e) => setFormData({...formData, base_price: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Protocol / Amenities (CSV)</label>
                <input 
                  placeholder="WIFI, UPS_BACKUP, TERMINAL_ACCESS"
                  className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl text-sm font-bold uppercase tracking-widest focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-zinc-800"
                  onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                />
              </div>

              <div className="bg-zinc-900/30 p-6 rounded-3xl border border-dashed border-zinc-800 transition-all hover:bg-zinc-900/50">
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 text-center">Visual Documentation Upload</label>
                <div className="flex flex-col items-center">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={(e) => setFiles(e.target.files)}
                    className="text-[10px] text-zinc-500 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:text-[9px] file:font-black file:uppercase file:tracking-widest file:bg-blue-600/10 file:text-blue-500 hover:file:bg-blue-600/20 cursor-pointer"
                  />
                  {files && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-1 w-12 bg-blue-500 animate-pulse rounded-full"></div>
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic">{files.length} Modules Prepared</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Abort
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
                >
                  {isUploading ? "Transferring Data..." : "Finalize Protocol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}