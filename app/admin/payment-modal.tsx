"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PaymentModal({ 
  bookingId, 
  roomNumber, 
  totalPrice 
}: { 
  bookingId: string, 
  roomNumber: string, 
  totalPrice: number 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // Default to true to prevent flickering
  const [method, setMethod] = useState("CASH");
  const [ref, setRef] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  
  const router = useRouter();
  const supabase = createClient();

  const balance = totalPrice - paidAmount;

  const getPaidAmount = useCallback(async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("payments")
      .select("amount")
      .eq("booking_id", bookingId)
      .eq("status", "COMPLETED");
    
    if (!error && data) {
      const total = data.reduce((sum, p) => sum + p.amount, 0);
      setPaidAmount(total);
    }
    setFetching(false);
  }, [bookingId, supabase]);

  useEffect(() => {
    if (isOpen) {
      getPaidAmount();
    }
  }, [isOpen, getPaidAmount]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (balance <= 0 || loading) return;
    
    setLoading(true);

    const { error } = await supabase.from("payments").insert({
      booking_id: bookingId,
      amount: balance, 
      payment_method: method,
      payment_reference: ref || null,
      status: "COMPLETED",
    });

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setRef(""); // Reset field
      setIsOpen(false);
      router.refresh(); // Refresh server components/data
    }
    setLoading(false);
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className={`text-[10px] px-3 py-1 rounded-full font-black tracking-tighter transition-all ${
        paidAmount >= totalPrice 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
      }`}
    >
      {paidAmount >= totalPrice ? "SETTLED" : "SETTLE BILL"}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic italic tracking-tighter">Settle Bill</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Transaction Terminal</p>
          </div>
          <span className="text-[10px] bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-black">
            ROOM {roomNumber}
          </span>
        </div>
        
        {/* Summary Card */}
        <div className="mb-8 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 space-y-3">
          <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
            <span className="text-zinc-500">Total Invoice</span>
            <span className="text-white">₱{totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
            <span className="text-zinc-500">Amount Settled</span>
            <span className="text-emerald-400">₱{paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xl border-t border-zinc-800 pt-3 mt-1">
            <span className="font-black text-white uppercase italic tracking-tighter">Balance Due</span>
            <span className={`font-black ${balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              ₱{balance.toLocaleString()}
            </span>
          </div>
        </div>

        {fetching ? (
          <div className="py-10 text-center text-zinc-600 font-bold animate-pulse text-xs uppercase tracking-widest">
            Syncing Ledger...
          </div>
        ) : balance <= 0 ? (
          <div className="text-center space-y-4">
            <div className="bg-emerald-500/10 text-emerald-400 p-6 rounded-2xl border border-emerald-500/20 text-xs font-bold uppercase leading-relaxed">
              Account Fully Cleared
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
            >
              Exit Terminal
            </button>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block tracking-widest">Method of Payment</label>
              <select 
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-blue-500 transition-colors appearance-none"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="CASH">CASH AT COUNTER</option>
                <option value="GCASH">GCASH / E-WALLET</option>
                <option value="BANK">BANK TRANSFER</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block tracking-widest">Ref / Transaction ID</label>
              <input 
                type="text"
                placeholder="Optional"
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-blue-500 transition-colors"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-blue-600/20"
              >
                {loading ? "Processing..." : `Confirm ₱${balance.toLocaleString()}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}