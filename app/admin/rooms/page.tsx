import { createClient } from "@/lib/supabase/server";
import RoomsClient from "@/app/admin/rooms/rooms-client";

export default async function AdminRoomsPage() {
  const supabase = await createClient();
  
  const { data: rooms } = await supabase
    .from("rooms") // Query the base table directly
    .select(`
      *,
      room_types ( name ), 
      bookings!left (
        id,
        status,
        walk_in_name,
        profiles ( full_name )
      )
    `)
    .order("room_number", { ascending: true });

  return <RoomsClient initialRooms={rooms || []} />;
}