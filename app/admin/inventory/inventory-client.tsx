"use client";

import { useState } from "react";
import RoomForm from "@/components/admin/add-room-form"; 
import DeleteRoom from "@/components/admin/delete-room";

export default function InventoryClient({ initialRooms, categories }: { initialRooms: any[], categories: string[] }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredRooms = initialRooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || room.room_types?.name === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Physical Inventory</h1>
          <p className="text-sm text-zinc-500">Manage hardware room numbers and category assignments.</p>
        </div>
        <RoomForm />
      </div>

      <div className="flex flex-col md:flex-row gap-3 p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
        <input 
          type="text"
          placeholder="Filter by room number..."
          className="flex-1 bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all pl-4 text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select 
          className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-sm outline-none cursor-pointer text-white"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredRooms.map((room) => (
          <div key={room.id} className="group p-5 border border-zinc-800 rounded-2xl bg-zinc-900/30 hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-4xl font-mono font-black text-white tracking-tighter">
                {room.room_number}
              </span>
              <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <RoomForm initialData={room} />
                <DeleteRoom id={room.id} roomNumber={room.room_number} />
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{room.room_types?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-bold uppercase">
                  Floor {room.floor_level}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase">{room.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}