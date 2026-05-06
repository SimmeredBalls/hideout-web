import { createClient } from "@/lib/supabase/server";
import PaymentsClient from "@/app/admin/payments/payments-client";

export default async function PaymentsPage() {
  const supabase = await createClient();

  // Fetch payments with Guest and Room info
  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      bookings (
        walk_in_name,
        profiles ( full_name ),
        rooms ( room_number )
      )
    `)
    .order("created_at", { ascending: false });

  return <PaymentsClient initialPayments={payments || []} />;
}