import { useState } from "react";
import { getMockUsers } from "@/data/mockStore";
import { Search, Shield, Edit, Eye, Trash2, UserPlus, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminUsers() {
  const [users, setUsers] = useState(getMockUsers());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "user" | "admin">("all");

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.role === filter;
    return matchSearch && matchFilter;
  });

  const handleSuspend = (id: string, name: string) => {
    toast.success(`${name} has been suspended.`);
  };

  const handleDelete = (id: string, name: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success(`${name}'s account deleted.`);
  };

  const handlePromote = (id: string, name: string) => {
    toast.success(`${name} promoted to Admin.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-1">Users</h1>
          <p className="text-slate-400">{users.length} registered accounts</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 h-11 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "user", "admin"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all",
                filter === f
                  ? "bg-violet-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-violet-300 font-bold text-sm">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
                      user.role === "admin"
                        ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                        : "bg-slate-700/60 text-slate-400"
                    )}>
                      {user.role === "admin" && <Shield className="w-3 h-3" />}
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">{user.joinedAt}</td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-xs text-slate-400">Active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="View user"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {user.role !== "admin" && (
                        <button
                          title="Promote to admin"
                          onClick={() => handlePromote(user.id, user.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        title="Suspend user"
                        onClick={() => handleSuspend(user.id, user.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.role !== "admin" && (
                        <button
                          title="Delete user"
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-500">No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
