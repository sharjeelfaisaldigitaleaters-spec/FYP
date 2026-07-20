import { getAdminStats, getAllMemories, getMockUsers } from "@/data/mockStore";
import { Users, HardDrive, MessageCircle, BookOpen, TrendingUp, Activity, Shield, Server } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const chartData = [
  { day: "Mon", users: 3, memories: 8, conversations: 42 },
  { day: "Tue", users: 5, memories: 12, conversations: 38 },
  { day: "Wed", users: 2, memories: 6, conversations: 55 },
  { day: "Thu", users: 8, memories: 19, conversations: 61 },
  { day: "Fri", users: 11, memories: 24, conversations: 72 },
  { day: "Sat", users: 7, memories: 15, conversations: 48 },
  { day: "Sun", users: 4, memories: 9, conversations: 33 },
];

const recentSignups = getMockUsers().slice(0, 4);

export default function AdminOverview() {
  const stats = getAdminStats();

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, change: "+12%", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { label: "Total Memories", value: stats.totalMemories, icon: HardDrive, change: "+8%", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Conversations", value: stats.totalConversations, icon: MessageCircle, change: "+24%", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Stories Generated", value: stats.totalStoriesGenerated, icon: BookOpen, change: "+5%", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Storage Used", value: `${stats.storageUsedGB} GB`, icon: Server, change: "+3%", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
    { label: "Active Today", value: stats.activeToday, icon: Activity, change: "Live", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-white mb-1">Admin Overview</h1>
        <p className="text-slate-400">Platform-wide statistics and monitoring.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`p-6 rounded-2xl bg-slate-900 border ${c.bg} hover:border-opacity-50 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center border`}>
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                {c.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{c.value}</p>
            <p className="text-sm text-slate-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity chart */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              Weekly Activity
            </h2>
            <span className="text-xs text-slate-500">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#475569" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc" }}
              />
              <Area type="monotone" dataKey="memories" stroke="#7c3aed" fill="url(#colorMem)" strokeWidth={2} name="Memories" />
              <Area type="monotone" dataKey="conversations" stroke="#10b981" fill="url(#colorConv)" strokeWidth={2} name="Conversations" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* New users chart */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              New Signups
            </h2>
            <span className="text-xs text-slate-500">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#475569" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc" }} />
              <Line type="monotone" dataKey="users" stroke="#60a5fa" strokeWidth={2.5} dot={{ fill: "#60a5fa", r: 4 }} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent signups */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-white font-semibold">Recent Signups</h2>
          <a href="/admin/users" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View all →</a>
        </div>
        <div className="divide-y divide-slate-800">
          {recentSignups.map((u) => (
            <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/40 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                <span className="text-violet-300 text-sm font-bold">{u.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{u.name}</p>
                <p className="text-xs text-slate-500 truncate">{u.email}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${u.role === "admin" ? "bg-violet-500/20 text-violet-300" : "bg-slate-700 text-slate-400"}`}>
                  {u.role}
                </span>
                <p className="text-xs text-slate-600 mt-1">{u.joinedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System status */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          System Status
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "API Server", status: "Operational" },
            { label: "AI Processing", status: "Operational" },
            { label: "Storage", status: "Operational" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
              <span className="text-sm text-slate-400">{s.label}</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
