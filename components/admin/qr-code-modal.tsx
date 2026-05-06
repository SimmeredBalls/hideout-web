"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function QRCodeModal({ bookingId, guestName }: { bookingId: string, guestName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // We pack the booking ID into a JSON string or a specific URL
  // The mobile app will parse this exact string
  const qrValue = JSON.stringify({
    type: "CHECK_IN",
    booking_id: bookingId
  });

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="text-[10px] bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full font-bold transition-colors border border-blue-500/30"
    >
      SHOW QR
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl flex flex-col items-center gap-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          <h2 className="text-zinc-900 text-xl font-black">Guest Check-In</h2>
          <p className="text-zinc-500 text-sm font-medium">{guestName}</p>
        </div>

        {/* The actual QR Code */}
        <div className="p-4 bg-white border-4 border-zinc-100 rounded-2xl">
          <QRCodeSVG value={qrValue} size={200} level="H" />
        </div>

        <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest text-center max-w-[200px]">
          Guest must scan this using the Hideout Mobile App
        </p>

        <button 
          onClick={() => setIsOpen(false)}
          className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}