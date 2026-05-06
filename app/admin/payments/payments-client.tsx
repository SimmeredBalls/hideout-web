"use client";

import { useState, useEffect, useMemo } from "react";

const ITEMS_PER_PAGE = 10;

export default function PaymentsClient({ initialPayments }: { initialPayments: any[] }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filter Logic (Memoized for performance)
  const filteredPayments = useMemo(() => {
    return initialPayments.filter((p) => {
      const guestName = (p.bookings?.profiles?.full_name || p.bookings?.walk_in_name || "").toLowerCase();
      const ref = (p.payment_reference || "").toLowerCase();
      return guestName.includes(search.toLowerCase()) || ref.includes(search.toLowerCase());
    });
  }, [initialPayments, search]);

  // 2. Pagination Calculations
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // 3. Reset to page 1 on search
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Total Revenue from all results matching the search (not just the page)
  const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Records</h1>
          <p className="text-sm text-zinc-500 italic">Track all transactions and revenue flow.</p>
        </div>
        
        <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl flex flex-col items-end min-w-[200px]">
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Total Revenue</span>
          <span className="text-2xl font-black text-white">₱{totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl">
        <input 
          type="text"
          placeholder="Search by Guest or Ref #..."
          className="w-full md:w-80 bg-zinc-900 border border-zinc-700 p-2 rounded-lg text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-800/50 text-zinc-400 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4">Date/Time</th>
              <th className="px-6 py-4">Guest</th>
              <th className="px-6 py-4">Room</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Ref #</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 text-white">
            {paginatedPayments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-zinc-500 italic">
                  No transaction records found.
                </td>
              </tr>
            ) : (
              paginatedPayments.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4 text-zinc-400 text-xs">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {p.bookings?.profiles?.full_name || p.bookings?.walk_in_name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-400">
                    {p.bookings?.rooms?.room_number}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-300">
                      {p.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-xs truncate max-w-[120px]">
                    {p.payment_reference || "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-green-400">
                    ₱{p.amount.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-800/20 border-t border-zinc-800">
            <p className="text-xs text-zinc-500">
              Showing <span className="text-zinc-300 font-bold">{startIndex + 1}</span> to{" "}
              <span className="text-zinc-300 font-bold">
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredPayments.length)}
              </span>{" "}
              of <span className="text-zinc-300 font-bold">{filteredPayments.length}</span> records
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-md text-xs font-bold text-zinc-300 disabled:opacity-50 hover:bg-zinc-700 transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center px-2 text-xs font-bold text-zinc-500">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-md text-xs font-bold text-zinc-300 disabled:opacity-50 hover:bg-zinc-700 transition-colors"
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