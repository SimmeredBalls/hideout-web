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
    // GUARD: If trying to Check-Out but there is a balance
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

    // // Room Sync Logic
    // let roomStatusUpdate = "";
    // if (newStatus === 'CHECKED_IN') roomStatusUpdate = "OCCUPIED";
    // if (newStatus === 'COMPLETED') roomStatusUpdate = "CLEANING";

    // if (roomStatusUpdate) {
    //   await supabase
    //     .from("rooms")
    //     .update({ status: roomStatusUpdate })
    //     .eq("room_number", roomNumber);
    // }

    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-2">
      
      {/* 0. NEW: PENDING APPROVAL LOGIC */}
      {status === 'PENDING' && (
        <div className="flex gap-2">
          <button 
            onClick={() => handleStatusUpdate('CONFIRMED')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider"
          >
            Confirm
          </button>
          <button 
            onClick={() => handleStatusUpdate('CANCELLED')}
            className="border border-zinc-700 hover:bg-red-900/20 text-zinc-400 hover:text-red-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase"
          >
            Decline
          </button>
        </div>
      )}

      {/* 1. PAYMENT STATUS LOGIC */}
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

      {/* 2. Check-In Controls */}
      {status === 'CONFIRMED' && (
        <div className="flex gap-2">
          <QRCodeModal bookingId={bookingId} guestName={guestName} />
          <button 
            onClick={() => handleStatusUpdate('CHECKED_IN')}
            className="bg-green-600 hover:bg-green-700 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase"
          >
            Manual Check-In
          </button>
        </div>
      )}

      {/* 3. Check-Out Button */}
      {status === 'CHECKED_IN' && (
        <button 
          onClick={() => handleStatusUpdate('COMPLETED')}
          className={`${
            remainingBalance > 0 ? 'bg-zinc-700 opacity-50' : 'bg-orange-600 hover:bg-orange-700'
          } text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors whitespace-nowrap`}
        >
          {remainingBalance > 0 ? "Balance Pending" : "Check-Out"}
        </button>
      )}

      {/* 4. Closed Label */}
      {(status === 'COMPLETED' || status === 'CANCELLED') && (
        <span className="text-zinc-500 text-[10px] uppercase font-bold px-2 italic">
          {status === 'COMPLETED' ? "Archived" : "Cancelled"}
        </span>
      )}
    </div>
  );
}