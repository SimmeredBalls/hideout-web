"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { uploadRoomImage } from "@/lib/uploadImage";
import { X, Loader2, Plus, Trash2 } from "lucide-react";

interface RoomTypeImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface RoomType {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  base_price: number;
  amenities: string[];
  room_type_images?: RoomTypeImage[];
}

export default function RoomTypeForm({ initialData }: { initialData?: RoomType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!initialData;

  // Form States
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [capacity, setCapacity] = useState(initialData?.capacity || 2);
  const [price, setPrice] = useState(initialData?.base_price.toString() || "");
  const [amenities, setAmenities] = useState(initialData?.amenities.join(", ") || "");
  
  const [files, setFiles] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<RoomTypeImage[]>([]);

  // Sync state with initialData when it changes or modal opens
  useEffect(() => {
    if (initialData?.room_type_images) {
      setExistingImages(initialData.room_type_images);
    }
  }, [initialData]);

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    if (!confirm("CRITICAL: Permanent removal of this asset from storage?")) return;

    // 1. Instant UI update (Optimistic)
    const previousImages = [...existingImages];
    setExistingImages(prev => prev.filter(img => img.id !== imageId));

    try {
      // Extract filename for storage cleanup
      const filePath = imageUrl.split('/').pop(); 
      if (filePath) {
        // Note: bucket name is 'categories' as per your upload logic
        await supabase.storage.from('categories').remove([filePath]);
      }

      const { error } = await supabase
        .from("room_type_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;
      
      router.refresh();
    } catch (err: any) {
      // Rollback UI if database/storage fails
      setExistingImages(previousImages);
      alert("FAILSAFE_TRIGGERED: Error deleting image: " + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      const payload = {
        name,
        description,
        capacity,
        base_price: parseFloat(price),
        amenities: amenities.split(",").map((a: string) => a.trim()).filter(Boolean),
      };

      let categoryId = initialData?.id;

      if (isEditing) {
        const { error } = await supabase
          .from("room_types")
          .update(payload)
          .eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("room_types")
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        categoryId = data.id;
      }

      // Handle file uploads if any
      if (files && files.length > 0) {
        const uploadPromises = Array.from(files).map(async (file: File, index: number) => {
          const url = await uploadRoomImage(file, 'categories');
          return supabase.from("room_type_images").insert({
            room_type_id: categoryId,
            image_url: url,
            display_order: existingImages.length + index
          });
        });
        await Promise.all(uploadPromises);
      }

      setIsOpen(false);
      setFiles(null);
      router.refresh();
    } catch (err: any) {
      alert("TRANSACTION_FAILED: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={isEditing 
          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all" 
          : "bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"}
      >
        {isEditing ? "Edit Category" : <><Plus size={16}/> New Category</>}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-2xl text-white shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">
                  {isEditing ? "Modify Data Cluster" : "Initialize New Category"}
                </h2>
                <p className="text-sm text-zinc-500 italic">Core configuration for room types and media.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Existing Gallery Section */}
              {existingImages.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Assets</label>
                  <div className="grid grid-cols-4 gap-3">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                        <img 
                          src={img.image_url} 
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                          alt="Category visual"
                        />
                        <button 
                          type="button"
                          onClick={() => handleDeleteImage(img.id, img.image_url)}
                          className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Upload New Media</label>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={(e) => setFiles(e.target.files)}
                      className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-zinc-800 file:text-white cursor-pointer bg-zinc-950 p-2 rounded-2xl border border-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Identifier Name</label>
                    <input 
                      required 
                      className="w-full bg-zinc-950 p-3 rounded-xl border border-zinc-800 outline-none focus:border-blue-500 transition-colors"
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                   <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Description String</label>
                    <textarea 
                      className="w-full bg-zinc-950 p-3 rounded-xl border border-zinc-800 outline-none min-h-[110px] text-sm focus:border-blue-500 transition-colors"
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Capacity</label>
                  <input 
                    type="number" 
                    className="w-full bg-zinc-950 p-3 rounded-xl border border-zinc-800 outline-none focus:border-blue-500 transition-colors"
                    value={capacity} 
                    onChange={(e) => setCapacity(parseInt(e.target.value))} 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Base Price (PHP)</label>
                  <input 
                    type="number" 
                    className="w-full bg-zinc-950 p-3 rounded-xl border border-zinc-800 outline-none focus:border-blue-500 transition-colors"
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Amenities (CSV Format)</label>
                <input 
                  placeholder="e.g. WiFi, Aircon, Smart TV" 
                  className="w-full bg-zinc-950 p-3 rounded-xl border border-zinc-800 outline-none text-sm focus:border-blue-500 transition-colors"
                  value={amenities} 
                  onChange={(e) => setAmenities(e.target.value)} 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="flex-1 bg-white text-black p-4 rounded-2xl font-black uppercase text-xs tracking-widest flex justify-center items-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <><Loader2 className="animate-spin" size={16} /> Syncing...</>
                  ) : (
                    isEditing ? "Commit Changes" : "Deploy Cluster"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}