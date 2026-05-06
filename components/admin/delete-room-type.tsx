"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface DeleteRoomTypeProps {
  id: string;
  name: string;
  images?: { image_url: string }[]; 
}

export default function DeleteRoomType({ id, name, images }: DeleteRoomTypeProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    const confirmation = confirm(
      `PERMANENT ACTION: Purge "${name}" category?\n\nThis will remove all associated media from storage. Action cannot be undone.`
    );

    if (confirmation) {
      // 1. Storage Cleanup
      if (images && images.length > 0) {
        const paths = images
          .map(img => img.image_url.split('public/hideout-media/')[1])
          .filter(Boolean); // Cleaner way to filter out undefined/empty

        if (paths.length > 0) {
          try {
            // Bulk remove images from the bucket
            await supabase.storage.from('hideout-media').remove(paths);
          } catch (storageErr) {
            console.error("DESTRUCTIVE_ACTION_ERROR: Storage cleanup failed", storageErr);
          }
        }
      }

      // 2. Database Delete
      const { error } = await supabase.from("room_types").delete().eq("id", id);
      
      if (error) {
        alert("CONSTRAINT VIOLATION: Existing nodes are still mapped to this sector. Reassign or delete linked rooms first.");
      } else {
        router.refresh();
      }
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      className="text-[10px] text-red-500/40 hover:text-red-500 font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded border border-transparent hover:border-red-500/20 hover:bg-red-500/5 transition-all duration-300"
    >
      Purge Category
    </button>
  );
}