"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { createStaffAccount, deleteUserAction } from "./actions"; // Updated import
import { Mail, CheckCircle2, XCircle, Shield, User, UserCog } from "lucide-react";

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "GUEST" 
  });

  const filteredUsers = useMemo(() => {
    return initialUsers.filter(u => 
      u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
      u.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [initialUsers, search]);

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email || "", 
      password: "", 
      fullName: user.full_name || "",
      phone: user.phone_number || "",
      role: user.role || "GUEST"
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    if (editingUser) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone_number: formData.phone,
          role: formData.role 
        })
        .eq('id', editingUser.id);

      if (error) alert(error.message);
      else window.location.reload();
    } else {
      const result = await createStaffAccount(formData);
      if (result.error) alert(result.error);
      else window.location.reload();
    }
  };

  // UPDATED: Now uses the Server Action for full deletion
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will PERMANENTLY delete the account and email access.")) return;
    
    const result = await deleteUserAction(id);

    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 items-center">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search name or email..." 
            className="bg-zinc-950 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm w-80 outline-none focus:border-blue-500 transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600 group-focus-within:text-blue-500" />
        </div>
        <button 
          onClick={() => { 
            setEditingUser(null); 
            setFormData({ email: "", password: "", fullName: "", phone: "", role: "STAFF" });
            setIsModalOpen(true); 
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-900/20"
        >
          + Register Staff
        </button>
      </div>

      <div className="border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-800/50 text-zinc-500 text-[10px] uppercase font-black tracking-widest border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4">Account Information</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">System Role</th>
              <th className="px-6 py-4 text-right">Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-800/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-white leading-tight">{user.full_name}</span>
                    <span className="text-[11px] text-zinc-500 font-mono mt-1 flex items-center gap-1.5">
                      <Mail className="h-3 w-3 opacity-50" /> {user.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.email_confirmed_at ? (
                    <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-tight">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-black uppercase tracking-tight italic opacity-60">
                      <XCircle className="h-3.5 w-3.5" /> Unconfirmed
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase inline-flex items-center gap-1.5 border ${
                    user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                    user.role === 'STAFF' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                    'bg-zinc-800/50 text-zinc-400 border-zinc-700'
                  }`}>
                    {user.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                    {user.role === 'STAFF' && <UserCog className="h-3 w-3" />}
                    {user.role === 'GUEST' && <User className="h-3 w-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-5">
                  <button onClick={() => openEditModal(user)} className="text-zinc-500 hover:text-white font-bold text-[11px] uppercase tracking-tighter transition-colors">Edit</button>
                  <button onClick={() => handleDelete(user.id)} className="text-zinc-800 hover:text-red-500 font-bold text-[11px] uppercase tracking-tighter transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black mb-6 text-white uppercase italic tracking-tight">
              {editingUser ? 'Update Profile' : 'Register New Staff'}
            </h2>
            
            <form onSubmit={handleSaveUser} className="space-y-5">
              {/* ALWAYS VISIBLE: Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-zinc-500 ml-1 tracking-widest">Full Name</label>
                <input 
                  required placeholder="e.g. Stephen John" value={formData.fullName}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-blue-600 transition-all"
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              {/* ONLY VISIBLE WHEN CREATING NEW: Email & Password */}
              {!editingUser && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-zinc-500 ml-1 tracking-widest">Email Address</label>
                    <input 
                      required type="email" placeholder="staff@hideout.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-blue-600 transition-all font-mono"
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-zinc-500 ml-1 tracking-widest">Initial Password</label>
                    <input 
                      required type="password" placeholder="••••••••"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-blue-600 transition-all"
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </>
              )}

              {/* ALWAYS VISIBLE: Contact Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-zinc-500 ml-1 tracking-widest">Contact Number</label>
                <input 
                  placeholder="09XXXXXXXXX" value={formData.phone}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-blue-600 transition-all"
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              {/* ALWAYS VISIBLE: Permission Level */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-zinc-500 ml-1 tracking-widest">Permission Level</label>
                <select 
                  value={formData.role}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer font-bold"
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="GUEST" className="bg-zinc-900">GUEST (App Access Only)</option>
                  <option value="STAFF" className="bg-zinc-900">STAFF (Management)</option>
                  <option value="ADMIN" className="bg-zinc-900">ADMIN (Full Control)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/30"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}