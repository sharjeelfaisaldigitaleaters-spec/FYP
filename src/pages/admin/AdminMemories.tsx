import { useState } from "react";
import { getAllMemories, deleteMemory as deleteFromStore } from "@/data/mockStore";
import { Search, Mic, Image, FileText, Trash2, Eye, Flag, Filter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const typeIcons = { audio: Mic, image: Image, text: FileText };
const typeColors = {
  audio: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  image: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  text: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

export default function AdminMemories() {
  const [memories, setMemories] = useState(getAllMemories());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "audio" | "image" | "text">("all");

  const filtered = memories.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleDelete = (id: string, title: string) => {
    deleteFromStore(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
    toast.success(`"${title}" deleted.`);
  };

  const handleFlag = (title: string) => {
    toast.success(`"${title}" flagged for review.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-1">Memories</h1>
          <p className="text-slate-400">{memories.length} total uploads across all users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            placeholder="Search memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 h-11 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "audio", "image", "text"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all",
                typeFilter === f
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
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Memory</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Size</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Date</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((mem) => {
                const Icon = typeIcons[mem.type];
                return (
                  <tr key={mem.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0", typeColors[mem.type])}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{mem.title}</p>
                          <p className="text-xs text-slate-500">User ID: {mem.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={cn("px-2.5 py-1 rounded-lg text-xs font-medium border capitalize", typeColors[mem.type])}>
                        {mem.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">{mem.size}</td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium",
                        mem.status === "processed" ? "bg-green-500/10 text-green-400" :
                        mem.status === "processing" ? "bg-amber-500/10 text-amber-400" :
                        "bg-slate-700 text-slate-400"
                      )}>
                        {mem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">{mem.createdAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="View"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Flag"
                          onClick={() => handleFlag(mem.title)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(mem.id, mem.title)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-500">No memories found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
