"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PaymentModal from "@/app/admin/payment-modal"; 
import QRCodeModal from "./qr-code-modal";

export default function BookingActions({ 
  bookingId, 
  status, 
  roomNumber, 
  totalPrice,
  guestName,
  remainingBalance = 0 
}: { 
  bookingId: string, 
  status: string, 
  roomNumber: string, 
  totalPrice: number,
  guestName: string,
  remainingBalance?: number
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleStatusUpdate = async (newStatus: string) => {
    // SECURITY GUARD: Confirm cancellation for both Pending (Decline) and Confirmed (Cancel)
    if (newStatus === 'CANCELLED') {
      const confirmCancel = window.confirm(
        "Are you sure you want to cancel this booking? This will release the room back to the inventory."
      );
      if (!confirmCancel) return;
    }

    // GUARD: Prevent Check-Out if there is a remaining balance
    if (newStatus === 'COMPLETED' && remainingBalance > 0) {
      alert(`Cannot Check-Out: Guest still owes ₱${remainingBalance.toLocaleString()}. Please settle the bill first.`);
      return;
    }

    const { error: bookingError } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (bookingError) {
      alert(bookingError.message);
      return;
    }

    // NOTE: Room physical status (OCCUPIED/CLEANING/AVAILABLE) is handled 
    // by the database trigger 'sync_room_status' on the server side.
    
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-2">
      
      {/* 0. PENDING APPROVAL LOGIC */}
      {status === 'PENDING' && (
        <div className="flex gap-2">
          <button 
            onClick={() => handleStatusUpdate('CONFIRMED')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors"
          >
            Confirm
          </button>
          <button 
            onClick={() => handleStatusUpdate('CANCELLED')}
            className="border border-zinc-700 hover:bg-red-900/20 text-zinc-400 hover:text-red-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase transition-colors"
          >
            Decline
          </button>
        </div>
      )}

      {/* 1. PAYMENT STATUS LOGIC (Hidden if Cancelled or Pending) */}
      {status !== 'CANCELLED' && status !== 'PENDING' && (
        <>
          {remainingBalance <= 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Paid</span>
            </div>
          ) : (
            <PaymentModal 
              bookingId={bookingId} 
              roomNumber={roomNumber} 
              totalPrice={totalPrice} 
            />
          )}
        </>
      )}

      {/* 2. CHECK-IN CONTROLS (Only for Confirmed Bookings) */}
      {status === 'CONFIRMED' && (
        <div className="flex gap-2 items-center">
          <QRCodeModal bookingId={bookingId} guestName={guestName} />
          <button 
            onClick={() => handleStatusUpdate('CHECKED_IN')}
            className="bg-green-600 hover:bg-green-700 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase transition-colors"
          >
            Manual Check-In
          </button>
          <div className="w-[1px] h-4 bg-zinc-800 mx-1" />
          <button 
            onClick={() => handleStatusUpdate('CANCELLED')}
            className="text-zinc-500 hover:text-red-500 text-[10px] font-bold uppercase px-1 transition-colors"
          >
            Cancel
          </button>
        </div>//booking
      )}

      {/* 3. CHECK-OUT LOGIC (Only for In-House Guests) */}
      {status === 'CHECKED_IN' && (
        <button 
          onClick={() => handleStatusUpdate('COMPLETED')}
          className={`${
            remainingBalance > 0 ? 'bg-zinc-700 opacity-50 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
          } text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors whitespace-nowrap`}
        >
          {remainingBalance > 0 ? "Balance Pending" : "Check-Out"}
        </button>
      )}

      {/* 4. FINAL STATES (Completed or Cancelled) */}
      {(status === 'COMPLETED' || status === 'CANCELLED') && (
        <span className="text-zinc-500 text-[10px] uppercase font-bold px-2 italic tracking-widest">
          {status === 'COMPLETED' ? "Archived" : "Cancelled"}
        </span>
      )}
    </div>
  );
}