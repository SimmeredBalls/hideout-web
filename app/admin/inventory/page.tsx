import { createClient } from "@/lib/supabase/server";
import InventoryClient from "@/app/admin/inventory/inventory-client";

export default async function InventoryPage() {
  const supabase = await createClient();
  
  // Fetch all physical rooms with their type names
  const { data: rooms } = await supabase
    .from("rooms")
    .select(`
      *, 
      room_types ( name )
    `)
    .order("room_number", { ascending: true });

  // Fetch all unique categories for the filter dropdown
  const { data: roomTypes } = await supabase
    .from("room_types")
    .select("name")
    .order("name", { ascending: true });

  const categories = roomTypes?.map(t => t.name) || [];

  return (
    <div className="p-6">
      <InventoryClient 
        initialRooms={rooms || []} 
        categories={categories} 
      />
    </div>
  );
}