import { createClient } from "@/lib/supabase/server";
import AddRoomTypeForm from "@/components/admin/add-room-type-form";
import DeleteRoomType from "@/components/admin/delete-room-type";

export default async function RoomTypesPage() {
  const supabase = await createClient();
  
  // Fetch room types AND their associated images
  const { data: roomTypes } = await supabase
    .from("room_types")
    .select(`
      *,
      room_type_images (
        id,
        image_url,
        display_order
      )
    `)
    .order("name", { ascending: true });

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Room Categories</h1>
          <p className="text-sm text-zinc-500 font-medium italic">Define global pricing, capacity, and galleries.</p>
        </div>
        <AddRoomTypeForm />
      </div>

      <div className="grid gap-6">
        {roomTypes?.map((type) => {
          // Find the primary image (order 0) or fallback to first available
          const primaryImage = type.room_type_images?.sort((a: any, b: any) => a.display_order - b.display_order)[0]?.image_url;

          return (
            <div key={type.id} className="group p-6 border border-zinc-800 rounded-3xl bg-zinc-900/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-zinc-900/60 transition-all">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center flex-grow">
                {/* Visual Identity */}
                <div className="relative w-32 h-32 bg-zinc-800 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-700 shadow-xl">
                  {primaryImage ? (
                    <img src={primaryImage} alt={type.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 uppercase font-black text-center p-4">No Media</div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-bold text-white border border-white/10">
                    {type.room_type_images?.length || 0} PHOTOS
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <h3 className="font-black text-2xl tracking-tight text-white uppercase leading-none">{type.name}</h3>
                    {type.description && (
                      <p className="text-xs text-zinc-500 mt-1 max-w-md line-clamp-2 italic">
                        "{type.description}"
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 text-xs font-bold text-zinc-500">
                    <span className="flex items-center gap-1 uppercase">Max {type.capacity} Persons</span>
                    <span>•</span>
                    <span className="text-blue-500">₱{type.base_price.toLocaleString()} / night</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {type.amenities?.map((amenity: string) => (
                      <span key={amenity} className="text-[9px] bg-zinc-950 px-2.5 py-1 rounded-full uppercase tracking-widest text-zinc-300 border border-zinc-800">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-zinc-800">
                <AddRoomTypeForm initialData={type} />
                <DeleteRoomType id={type.id} name={type.name} images={type.room_type_images} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}