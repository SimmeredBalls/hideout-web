"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AddBookingForm from "@/components/admin/add-booking-form";
import BookingActions from "@/components/admin/booking-actions";

const ITEMS_PER_PAGE = 10;

export default function BookingsClient({ initialBookings }: { initialBookings: any[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("admin-bookings-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const filteredBookings = useMemo(() => {
    return initialBookings.filter((booking) => {
      const guestName = (booking.profiles?.full_name || booking.walk_in_name || "").toLowerCase();
      const roomNum = (booking.rooms?.room_number || "").toLowerCase();
      const searchTerm = search.toLowerCase();

      const matchesSearch = guestName.includes(searchTerm) || roomNum.includes(searchTerm);
      const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialBookings, search, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Reservations</h1>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Guest Traffic & Manifest</p>
        </div>
        <AddBookingForm />
      </div>

      {/* Control Panel / Filters */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl backdrop-blur-md">
        <div className="flex-1 relative">
          <input 
            type="text"
            placeholder="FILTER BY GUEST OR ROOM..."
            className="w-full bg-zinc-900/50 border border-zinc-800 p-3 pl-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700">
            <SearchIcon />
          </div>
        </div>
        <select 
          className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 outline-none cursor-pointer focus:ring-1 focus:ring-blue-500 transition-all hover:bg-zinc-900"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/40 backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900/50 text-zinc-500 uppercase text-[9px] font-black tracking-[0.2em] border-b border-zinc-800">
            <tr>
              <th className="px-6 py-5">Guest Information</th>
              <th className="px-6 py-5">Sector</th>
              <th className="px-6 py-5">Arrival</th>
              <th className="px-6 py-5">Departure</th>
              <th className="px-6 py-5">Protocols</th>
              <th className="px-6 py-5 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {paginatedBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">No matching records found in database</p>
                </td>
              </tr>
            ) : (
              paginatedBookings.map((booking) => {
                const totalPaid = booking.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
                const remainingBalance = booking.total_price - totalPaid;

                return (
                  <tr key={booking.id} className="group hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-zinc-200 tracking-tight text-base group-hover:text-white transition-colors uppercase">
                          {booking.profiles?.full_name || booking.walk_in_name || "Unknown Guest"}
                        </span>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">
                          {booking.profiles ? "Registered User" : "External Walk-in"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono font-black text-blue-500 bg-blue-500/5 px-3 py-1 rounded-lg border border-blue-500/20">
                        {booking.rooms?.room_number}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[11px] font-bold text-zinc-400 font-mono tracking-tighter">
                        {new Date(booking.check_in_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[11px] font-bold text-zinc-400 font-mono tracking-tighter">
                        {new Date(booking.check_out_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <BookingActions 
                        bookingId={booking.id}
                        status={booking.status}
                        roomNumber={booking.rooms?.room_number}
                        totalPrice={booking.total_price}
                        guestName={booking.profiles?.full_name || booking.walk_in_name}
                        remainingBalance={remainingBalance} 
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Footer Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-6 bg-zinc-900/20 border-t border-zinc-900">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
              Index <span className="text-zinc-400">{startIndex + 1}</span> -{" "}
              <span className="text-zinc-400">
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredBookings.length)}
              </span>{" "}
              of <span className="text-zinc-400">{filteredBookings.length}</span> entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 disabled:opacity-30 hover:bg-zinc-800 transition-all hover:text-white"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 disabled:opacity-30 hover:bg-zinc-800 transition-all hover:text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    CHECKED_IN: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    COMPLETED: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${styles[status] || styles.COMPLETED}`}>
      {status}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  );
}