// app/admin/bookings/page.tsx
import { createClient } from "@/lib/supabase/server";
import BookingsClient from "./bookings-client";

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      *,
      rooms (
        room_number,
        status
      ),
      profiles (
        full_name
      ),
      payments (
        amount
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return <div>Error loading bookings.</div>;
  }

  // We pass the bookings (which now include payment data) to the Client Component
  return <BookingsClient initialBookings={bookings || []} />;
}